// app/(host)/(tabs)/index.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import bookingService from "../../../services/bookingService";
import Animated, { FadeInDown } from "react-native-reanimated";
import FloatingChatButton from "../../../components/FloatingChatButton";

const { width } = Dimensions.get("window");

// ============================================
// 🎨 PREMIUM THEME
// ============================================
const COLORS = {
  navy: {
    950: "#020617",
    900: "#0A1628",
    800: "#0F2137",
    700: "#1E293B",
    600: "#334155",
  },
  gold: {
    600: "#D97706",
    500: "#F59E0B",
    400: "#FBBF24",
    300: "#FCD34D",
  },
  emerald: {
    600: "#059669",
    500: "#10B981",
    400: "#34D399",
  },
  rose: {
    500: "#F43F5E",
    400: "#FB7185",
  },
  blue: {
    600: "#2563EB",
    500: "#3B82F6",
    400: "#60A5FA",
  },
  violet: {
    500: "#8B5CF6",
  },
  orange: {
    500: "#F97316",
  },
  white: "#FFFFFF",
  gray: {
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
  },
};

// ============================================
// 🔧 HELPERS
// ============================================
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const formatMoney = (val) => {
  if (!val && val !== 0) return "0";
  if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
  if (val >= 1000) return (val / 1000).toFixed(1) + "k";
  return val.toLocaleString("en-US", { minimumFractionDigits: 0 });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getStatusIcon = (type) => {
  switch (type) {
    case "booking_request": return { name: "time-outline", color: COLORS.orange[500] };
    case "booking_confirmed": return { name: "checkmark-circle", color: COLORS.emerald[500] };
    case "booking_update": return { name: "refresh-circle", color: COLORS.blue[500] };
    default: return { name: "ellipse", color: COLORS.gray[400] };
  }
};

// ============================================
// 🏠 MAIN COMPONENT
// ============================================
export default function HostDashboard() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    availableBalance: 0,
    pendingRequests: 0,
    thisMonthEarnings: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [bookingStatus, setBookingStatus] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      // Fetch from both endpoints in parallel
      const [analyticsRes, dashboardRes] = await Promise.allSettled([
        api.get("/analytics/dashboard"),
        api.get("/host/dashboard-stats"),
      ]);

      // Process analytics data
      if (analyticsRes.status === "fulfilled") {
        const aData = analyticsRes.value.data.data;
        const s = aData.stats;
        setStats((prev) => ({
          ...prev,
          totalCars: s.totalCars || 0,
          activeBookings: s.activeBookings || 0,
          totalBookings: s.totalBookings || 0,
          completedBookings: s.completedBookings || 0,
          cancelledBookings: s.cancelledBookings || 0,
          totalEarnings: s.totalEarnings || 0,
          pendingEarnings: s.pendingEarnings || 0,
          availableBalance: s.availableBalance || 0,
        }));
        if (aData.chartData) setChartData(aData.chartData);
      }

      // Process host dashboard data
      if (dashboardRes.status === "fulfilled") {
        const dData = dashboardRes.value.data.data;
        if (dData.quickStats) {
          setStats((prev) => ({
            ...prev,
            pendingRequests: dData.quickStats.pendingRequests || 0,
            thisMonthEarnings: dData.quickStats.thisMonthEarnings || 0,
          }));
        }
        if (dData.trends) {
          setStats((prev) => ({
            ...prev,
            activeBookingsTrend: dData.trends.activeBookingsTrend,
            pendingRequestsTrend: dData.trends.pendingRequestsTrend,
            totalCarsTrend: dData.trends.totalCarsTrend,
            totalBookingsTrend: dData.trends.totalBookingsTrend,
          }));
        }
        if (dData.charts?.bookingStatus) setBookingStatus(dData.charts.bookingStatus);
        if (dData.recentActivity) setRecentActivity(dData.recentActivity);
      }

      // Fallback for pending requests count
      if (dashboardRes.status === "rejected") {
        try {
          const bookingsRes = await bookingService.getHostBookings();
          const bookings = bookingsRes.data || [];
          const list = Array.isArray(bookings) ? bookings : bookings.bookings || [];
          setStats((prev) => ({
            ...prev,
            pendingRequests: list.filter((b) => b.status === "pending").length,
          }));
        } catch (e) {
          console.log("Fallback pending count error:", e);
        }
      }
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================
  // 📊 SPARK CHART (Simple SVG-free line using Views)
  // ============================================
  const SparkLine = useMemo(() => {
    if (!chartData.length) return null;
    const maxVal = Math.max(...chartData.map((d) => d.value), 1);
    return (
      <View style={sparkStyles.container}>
        <View style={sparkStyles.barsRow}>
          {chartData.map((d, i) => (
            <View key={i} style={sparkStyles.barCol}>
              <View style={sparkStyles.barTrack}>
                <LinearGradient
                  colors={[COLORS.gold[400], COLORS.gold[600]]}
                  style={[
                    sparkStyles.barFill,
                    { height: `${Math.max((d.value / maxVal) * 100, 4)}%` },
                  ]}
                />
              </View>
              <Text style={sparkStyles.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }, [chartData]);

  // ============================================
  // 📊 BOOKING STATUS BAR
  // ============================================
  const totalStatusCount = bookingStatus.reduce((sum, s) => sum + s.value, 0) || 1;

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[950]} />

      {/* Ambient Glow */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* ━━━━ HEADER ━━━━ */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(host)/(tabs)/profile")}
            style={styles.userInfo}
          >
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.avatarRing}
            >
              <Image
                source={{
                  uri:
                    user?.profilePicture ||
                    "https://ui-avatars.com/api/?name=" +
                    (user?.fullName || "Host") +
                    "&background=1E293B&color=F59E0B&bold=true",
                }}
                style={styles.avatar}
              />
            </LinearGradient>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {user?.fullName?.split(" ")[0] || "Host"} 👋
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push("/(host)/bookings")}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.white}
            />
            {stats.pendingRequests > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {stats.pendingRequests > 9 ? "9+" : stats.pendingRequests}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold[500]}
            />
          }
        >
          {loading ? (
            <View style={{ marginTop: 80 }}>
              <ActivityIndicator size="large" color={COLORS.gold[500]} />
            </View>
          ) : (
            <View style={styles.body}>
              {/* ━━━━ ACTION ALERT ━━━━ */}
              {stats.pendingRequests > 0 && (
                <Animated.View entering={FadeInDown.delay(50).springify()}>
                  <TouchableOpacity
                    style={styles.alertCard}
                    activeOpacity={0.85}
                    onPress={() => router.push("/(host)/bookings")}
                  >
                    <LinearGradient
                      colors={[COLORS.rose[500], "#BE123C"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.alertGradient}
                    >
                      <View style={styles.alertIconBox}>
                        <Ionicons
                          name="alert-circle"
                          size={22}
                          color={COLORS.white}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertTitle}>Action Required</Text>
                        <Text style={styles.alertDesc}>
                          {stats.pendingRequests} booking
                          {stats.pendingRequests > 1 ? "s" : ""} awaiting
                          your approval
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="rgba(255,255,255,0.7)"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* ━━━━ HERO EARNINGS CARD ━━━━ */}
              <Animated.View entering={FadeInDown.delay(100).springify()}>
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => router.push("/(host)/(tabs)/wallet")}
                >
                  <LinearGradient
                    colors={[COLORS.navy[800], COLORS.navy[900]]}
                    style={styles.heroCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Decorative glow */}
                    <View style={styles.heroGlow} />

                    <View style={styles.heroTop}>
                      <View>
                        <Text style={styles.heroLabel}>Available Balance</Text>
                        <Text style={styles.heroAmount}>
                          <Text style={styles.heroCurrency}>PKR </Text>
                          {formatMoney(stats.availableBalance)}
                        </Text>
                      </View>
                      <View style={styles.heroBadge}>
                        <MaterialCommunityIcons
                          name="crown"
                          size={14}
                          color={COLORS.navy[950]}
                        />
                        <Text style={styles.heroBadgeText}>HOST</Text>
                      </View>
                    </View>

                    <View style={styles.heroDivider} />

                    <View style={styles.heroBottom}>
                      <View style={styles.heroStat}>
                        <Text style={styles.heroStatLabel}>Pending</Text>
                        <Text style={styles.heroStatValue}>
                          PKR {formatMoney(stats.pendingEarnings)}
                        </Text>
                      </View>
                      <View style={styles.heroStatDivider} />
                      <View style={styles.heroStat}>
                        <Text style={styles.heroStatLabel}>This Month</Text>
                        <Text style={[styles.heroStatValue, { color: COLORS.emerald[400] }]}>
                          PKR {formatMoney(stats.thisMonthEarnings)}
                        </Text>
                      </View>
                      <View style={styles.heroStatDivider} />
                      <View style={styles.heroStat}>
                        <Text style={styles.heroStatLabel}>Lifetime</Text>
                        <Text style={styles.heroStatValue}>
                          PKR {formatMoney(stats.totalEarnings)}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* ━━━━ QUICK ACTIONS ━━━━ */}
              <Animated.View entering={FadeInDown.delay(150).springify()}>
                <View style={styles.quickActionsRow}>
                  <QuickAction
                    icon="car-sport"
                    label="My Fleet"
                    color={COLORS.blue[500]}
                    onPress={() => router.push("/(host)/(tabs)/fleet")}
                  />
                  <QuickAction
                    icon="calendar"
                    label="Bookings"
                    onPress={() => router.push("/(host)/bookings")}
                    color={COLORS.emerald[500]}
                    badge={stats.pendingRequests}
                  />
                  <QuickAction
                    icon="wallet"
                    label="Wallet"
                    color={COLORS.violet[500]}
                    onPress={() => router.push("/(host)/(tabs)/wallet")}
                  />
                  <QuickAction
                    icon="add-circle"
                    label="Add Car"
                    color={COLORS.orange[500]}
                    onPress={() => router.push("/(host)/car/create")}
                  />
                </View>
              </Animated.View>

              {/* ━━━━ LIVE STATS ━━━━ */}
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Text style={styles.sectionTitle}>Performance Hub</Text>
                <View style={styles.statsGrid}>
                  <StatTile
                    label="Active Trips"
                    value={stats.activeBookings}
                    icon="flash"
                    iconColor={COLORS.emerald[500]}
                    trendText={stats.activeBookingsTrend || ""}
                    trendColor={COLORS.emerald[500]}
                  />
                  <StatTile
                    label="Pending"
                    value={stats.pendingRequests < 10 && stats.pendingRequests > 0 ? `0${stats.pendingRequests}` : stats.pendingRequests}
                    icon="time"
                    iconColor={COLORS.orange[500]}
                    trendText={stats.pendingRequestsTrend || ""}
                    trendColor={COLORS.orange[500]}
                  />
                  <StatTile
                    label="Total Fleet"
                    value={stats.totalCars}
                    icon="car-sport"
                    iconColor={COLORS.blue[500]}
                    trendText={stats.totalCarsTrend || ""}
                    trendColor={COLORS.blue[500]}
                  />
                  <StatTile
                    label="All Trips"
                    value={stats.totalBookings}
                    icon="globe"
                    iconColor={COLORS.violet[500]}
                    trendText={stats.totalBookingsTrend || ""}
                    trendColor={COLORS.violet[500]}
                  />
                </View>
              </Animated.View>

              {/* ━━━━ REVENUE CHART ━━━━ */}
              {chartData.length > 0 && (
                <Animated.View entering={FadeInDown.delay(250).springify()}>
                  <Text style={styles.sectionTitle}>Revenue (6 Months)</Text>
                  <View style={styles.chartCard}>{SparkLine}</View>
                </Animated.View>
              )}

              {/* ━━━━ BOOKING STATUS BAR ━━━━ */}
              {bookingStatus.length > 0 && (
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                  <Text style={styles.sectionTitle}>Booking Breakdown</Text>
                  <View style={styles.statusCard}>
                    <View style={styles.statusBar}>
                      {bookingStatus.map((s, i) => {
                        const pct = (s.value / totalStatusCount) * 100;
                        const colors = [
                          [COLORS.emerald[500], COLORS.emerald[400]],
                          [COLORS.rose[500], COLORS.rose[400]],
                          [COLORS.blue[500], COLORS.blue[400]],
                        ];
                        if (pct <= 0) return null;
                        return (
                          <LinearGradient
                            key={i}
                            colors={colors[i] || [COLORS.gray[500], COLORS.gray[400]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.statusSegment,
                              { width: `${pct}%` },
                              i === 0 && { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
                              i === bookingStatus.length - 1 && {
                                borderTopRightRadius: 6,
                                borderBottomRightRadius: 6,
                              },
                            ]}
                          />
                        );
                      })}
                    </View>
                    <View style={styles.statusLegend}>
                      {bookingStatus.map((s, i) => {
                        const dotColors = [
                          COLORS.emerald[500],
                          COLORS.rose[500],
                          COLORS.blue[500],
                        ];
                        return (
                          <View key={i} style={styles.legendItem}>
                            <View
                              style={[
                                styles.legendDot,
                                { backgroundColor: dotColors[i] || COLORS.gray[500] },
                              ]}
                            />
                            <Text style={styles.legendLabel}>
                              {s.name}{" "}
                              <Text style={styles.legendCount}>{s.value}</Text>
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* ━━━━ RECENT ACTIVITY ━━━━ */}
              {recentActivity.length > 0 && (
                <Animated.View entering={FadeInDown.delay(350).springify()}>
                  <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <TouchableOpacity
                      onPress={() => router.push("/(host)/bookings")}
                    >
                      <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.activityCard}>
                    {recentActivity.map((item, index) => {
                      const icon = getStatusIcon(item.type);
                      return (
                        <View key={item.id || index}>
                          <View style={styles.activityRow}>
                            <View
                              style={[
                                styles.activityDot,
                                { backgroundColor: icon.color + "20" },
                              ]}
                            >
                              <Ionicons
                                name={icon.name}
                                size={18}
                                color={icon.color}
                              />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={styles.activityMsg} numberOfLines={2}>
                                {item.message}
                              </Text>
                              <Text style={styles.activityTime}>
                                {timeAgo(item.date)}
                              </Text>
                            </View>
                          </View>
                          {index < recentActivity.length - 1 && (
                            <View style={styles.activityDivider} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </Animated.View>
              )}

              {/* ━━━━ PRO TIPS ━━━━ */}
              <Animated.View entering={FadeInDown.delay(400).springify()}>
                <Text style={styles.sectionTitle}>Pro Tips</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20, gap: 12 }}
                >
                  <TipCard
                    icon="flash"
                    color={COLORS.gold[500]}
                    title="Boost Bookings"
                    desc="Enable instant booking to get up to 30% more reservations."
                  />
                  <TipCard
                    icon="trophy"
                    color={COLORS.blue[500]}
                    title="Superhost Status"
                    desc="Maintain a 4.8+ rating to unlock premium host badge."
                  />
                  <TipCard
                    icon="images-outline"
                    color={COLORS.emerald[500]}
                    title="Better Photos"
                    desc="Clean car photos increase bookings by 2x. Keep them fresh."
                  />
                </ScrollView>
              </Animated.View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <FloatingChatButton />
    </View>
  );
}

// ============================================
// 🧩 SUB-COMPONENTS
// ============================================

const QuickAction = ({ icon, label, color, onPress, badge }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.quickActionCircle, { backgroundColor: color + "18" }]}>
      <Ionicons name={icon} size={24} color={color} />
      {badge > 0 && (
        <View style={styles.quickBadge}>
          <Text style={styles.quickBadgeText}>{badge > 9 ? "9+" : badge}</Text>
        </View>
      )}
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const StatTile = ({ label, value, icon, iconColor, trendText, trendColor }) => (
  <View style={styles.statTile}>
    <Ionicons
      name={icon}
      size={90}
      color={iconColor}
      style={styles.statTileWatermark}
    />
    <View style={styles.statTileContent}>
      <Text style={[styles.statTileLabel, { color: iconColor }]}>{label.toUpperCase()}</Text>
      <Text style={styles.statTileValue}>{value}</Text>
      <Text style={[styles.statTileTrend, { color: trendColor }]}>{trendText}</Text>
    </View>
  </View>
);

const TipCard = ({ icon, color, title, desc }) => (
  <LinearGradient
    colors={[COLORS.navy[800], COLORS.navy[800]]}
    style={styles.tipCard}
  >
    <View style={[styles.tipIconBox, { backgroundColor: color + "18" }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.tipTitle}>{title}</Text>
    <Text style={styles.tipDesc}>{desc}</Text>
  </LinearGradient>
);

// ============================================
// 📊 SPARK CHART STYLES
// ============================================
const sparkStyles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 100,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  barTrack: {
    width: "100%",
    height: 80,
    backgroundColor: COLORS.navy[700] + "50",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    color: COLORS.gray[500],
    fontSize: 10,
    fontWeight: "600",
    marginTop: 6,
    textTransform: "uppercase",
  },
});

// ============================================
// 💅 MAIN STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[950],
  },
  glowTopLeft: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 300,
    height: 300,
    backgroundColor: COLORS.navy[700],
    borderRadius: 150,
    opacity: 0.35,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 280,
    height: 280,
    backgroundColor: COLORS.gold[600],
    borderRadius: 140,
    opacity: 0.06,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarRing: {
    padding: 2.5,
    borderRadius: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.navy[800],
  },
  greeting: {
    color: COLORS.gray[400],
    fontSize: 13,
    fontWeight: "500",
  },
  userName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  bellBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.navy[800],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  bellBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.rose[500],
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.navy[800],
  },
  bellBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
  },

  body: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  // Alert
  alertCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.rose[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  alertGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  alertIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  alertDesc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 1,
  },

  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    marginBottom: 24,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    backgroundColor: COLORS.gold[500],
    opacity: 0.1,
    borderRadius: 60,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLabel: {
    color: COLORS.gray[400],
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -1,
  },
  heroCurrency: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gold[500],
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: COLORS.navy[950],
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroDivider: {
    height: 1,
    backgroundColor: COLORS.navy[700],
    marginVertical: 16,
  },
  heroBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: COLORS.navy[700],
  },
  heroStatLabel: {
    color: COLORS.gray[500],
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 4,
  },
  heroStatValue: {
    color: COLORS.gray[300],
    fontSize: 14,
    fontWeight: "700",
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  quickAction: {
    alignItems: "center",
    width: (width - 80) / 4,
  },
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionLabel: {
    color: COLORS.gray[400],
    fontSize: 11,
    fontWeight: "600",
  },
  quickBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.rose[500],
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  quickBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
  },

  // Section Headers
  sectionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  seeAll: {
    color: COLORS.gold[500],
    fontSize: 13,
    fontWeight: "600",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statTile: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    height: 125,
    backgroundColor: COLORS.navy[900],
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    overflow: "hidden",
  },
  statTileWatermark: {
    position: "absolute",
    right: -20,
    bottom: -20,
    opacity: 0.15,
  },
  statTileContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  statTileLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statTileValue: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -1,
    marginTop: 4,
  },
  statTileTrend: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: "auto",
  },

  // Chart
  chartCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    marginBottom: 24,
  },

  // Booking Status
  statusCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    marginBottom: 24,
  },
  statusBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: COLORS.navy[700],
    marginBottom: 14,
  },
  statusSegment: {
    height: "100%",
  },
  statusLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: COLORS.gray[400],
    fontSize: 12,
    fontWeight: "500",
  },
  legendCount: {
    color: COLORS.white,
    fontWeight: "700",
  },

  // Activity
  activityCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    marginBottom: 24,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  activityDot: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activityMsg: {
    color: COLORS.gray[300],
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  activityTime: {
    color: COLORS.gray[500],
    fontSize: 11,
    marginTop: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: COLORS.navy[700],
    marginLeft: 50,
  },

  // Tips
  tipCard: {
    width: 180,
    height: 130,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    justifyContent: "space-between",
  },
  tipIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tipTitle: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  tipDesc: {
    color: COLORS.gray[500],
    fontSize: 11,
    lineHeight: 15,
  },
});
