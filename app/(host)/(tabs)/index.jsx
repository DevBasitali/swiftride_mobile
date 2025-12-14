// app/(host)/(tabs)/index.jsx
import React, { useState, useCallback } from "react";
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
} from "react-native";
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import carService from "../../../services/carService";
import { useAuth } from "../../../context/AuthContext";
import bookingService from "../../../services/bookingService";

const { width } = Dimensions.get("window");

// ============================================
// 🎨 INLINE THEME COLORS
// ============================================
const COLORS = {
  navy: {
    900: '#0A1628',
    800: '#0F2137',
    700: '#152A46',
    600: '#1E3A5F',
    500: '#2A4A73',
  },
  gold: {
    600: '#D99413',
    500: '#F59E0B',
    400: '#FBBF24',
  },
  emerald: {
    500: '#10B981',
    400: '#34D399',
  },
  blue: {
    500: '#3B82F6',
  },
  orange: {
    500: '#F97316',
  },
  gray: {
    500: '#6B7280',
    400: '#9CA3AF',
  },
  white: '#FFFFFF',
};

export default function HostDashboard() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalCars: 0,
    activeCars: 0,
    totalBookings: 0,
    totalEarnings: 0,
    pendingRequests: 0,
    rating: 5.0,
  });

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      const carResponse = await carService.getMyCars();
      const cars = carResponse.data.cars || [];
      const activeCount = cars.filter((c) => c.isActive).length;

      let bookingCount = 0;
      let pendingCount = 0;
      let earnings = 0;

      try {
        const bookingResponse = await bookingService.getHostBookings();
        const allBookings = bookingResponse.items || [];
        bookingCount = allBookings.length;
        pendingCount = allBookings.filter((b) => b.status === 'pending').length;

        earnings = allBookings
          .filter((b) => b.status === 'completed')
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      } catch (err) {
        console.log("Booking fetch failed", err);
      }

      setStats({
        totalCars: cars.length,
        activeCars: activeCount,
        totalBookings: bookingCount,
        totalEarnings: earnings,
        pendingRequests: pendingCount,
        rating: 5.0,
      });
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const goToBookings = () => {
    router.push('/(host)/bookings');
  };
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Header Section */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={["top", "left", "right"]}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.fullName || "Host"}</Text>
            </View>

            <TouchableOpacity style={styles.bellBtn} onPress={goToBookings}>
              <View style={styles.bellIconContainer}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                {stats.pendingRequests > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{stats.pendingRequests}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Earnings Card */}
          <View style={styles.earningsCardContainer}>
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.earningsCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.earningsLeft}>
                <View style={styles.earningsIconContainer}>
                  <MaterialCommunityIcons name="cash-multiple" size={28} color={COLORS.navy[900]} />
                </View>
                <View>
                  <Text style={styles.earningsLabel}>Total Earnings</Text>
                  <Text style={styles.earningsValue}>
                    ${stats.totalEarnings.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.profitBadge}>
                <Ionicons name="trending-up" size={14} color={COLORS.emerald[500]} />
                <Text style={styles.profitText}>0%</Text>
              </View>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content Section */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold[500]}
          />
        }
      >
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionSubtitle}>Your business at a glance</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.gold[500]} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.statsGrid}>
            <StatBox
              icon="car-sport"
              label="Total Cars"
              value={stats.totalCars.toString()}
              gradient={[COLORS.blue[500], '#2563EB']}
            />
            <StatBox
              icon="checkmark-circle"
              label="Active Listings"
              value={stats.activeCars.toString()}
              gradient={[COLORS.emerald[500], COLORS.emerald[400]]}
            />
            <TouchableOpacity
              style={{ width: (width - 55) / 2 }}
              onPress={goToBookings}
              activeOpacity={0.8}
            >
              <StatBox
                icon="calendar"
                label="Bookings"
                value={stats.totalBookings.toString()}
                gradient={[COLORS.orange[500], '#FB923C']}
                isClickable={true}
              />
            </TouchableOpacity>
            <StatBox
              icon="star"
              label="Rating"
              value={stats.rating.toFixed(1)}
              gradient={[COLORS.gold[500], COLORS.gold[400]]}
            />
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {stats.totalCars === 0 ? (
          <View style={styles.emptyActivity}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="garage" size={50} color={COLORS.gray[400]} />
            </View>
            <Text style={styles.emptyText}>No activity yet</Text>
            <Text style={styles.emptySub}>List your first car to get started</Text>
            <TouchableOpacity
              style={styles.addCarButton}
              onPress={() => router.push('/(host)/car/create')}
            >
              <LinearGradient
                colors={[COLORS.gold[500], COLORS.gold[600]]}
                style={styles.addCarButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.navy[900]} />
                <Text style={styles.addCarButtonText}>Add Your First Car</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activityList}>
            <ActivityItem
              title="System Ready"
              sub="Your fleet is live and visible to customers"
              time="Now"
              icon="shield-checkmark"
              gradient={[COLORS.emerald[500], COLORS.emerald[400]]}
            />
            {stats.pendingRequests > 0 && (
              <ActivityItem
                title="New Booking Request"
                sub={`You have ${stats.pendingRequests} pending booking(s)`}
                time="Action Required"
                icon="alert-circle"
                gradient={[COLORS.orange[500], '#FB923C']}
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================
// 📦 HELPER COMPONENTS
// ============================================
function StatBox({ icon, label, value, gradient, isClickable }) {
  const containerStyle = isClickable ? styles.statBoxInner : styles.statBox;

  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={gradient}
        style={styles.statBoxGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={28} color={COLORS.white} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

function ActivityItem({ title, sub, time, icon, gradient }) {
  return (
    <View style={styles.activityItem}>
      <LinearGradient
        colors={gradient}
        style={styles.activityIconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={20} color={COLORS.white} />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={styles.actTitle}>{title}</Text>
        <Text style={styles.actSub}>{sub}</Text>
      </View>
      <Text style={styles.actTime}>{time}</Text>
    </View>
  );
}

// ============================================
// 💅 STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  headerGradient: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  welcomeText: {
    color: COLORS.gray[400],
    fontSize: 14,
    fontWeight: "600",
  },
  userName: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
  },
  bellBtn: {
    position: 'relative',
  },
  bellIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.navy[700],
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.orange[500],
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.navy[800],
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // Earnings Card
  earningsCardContainer: {
    marginTop: 8,
  },
  earningsCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  earningsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  earningsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 22, 40, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsLabel: {
    color: COLORS.navy[900],
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
    opacity: 0.8,
  },
  earningsValue: {
    color: COLORS.navy[900],
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profitBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  profitText: {
    color: COLORS.emerald[500],
    fontWeight: "700",
    fontSize: 13,
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
    marginTop: -20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.gray[400],
    marginTop: 4,
  },
  viewAllText: {
    color: COLORS.gold[500],
    fontSize: 14,
    fontWeight: '600',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: (width - 55) / 2,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statBoxInner: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statBoxGradient: {
    padding: 18,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
    opacity: 0.9,
  },

  // Activity List
  activityList: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navy[700],
  },
  activityIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  actSub: {
    fontSize: 13,
    color: COLORS.gray[400],
  },
  actTime: {
    fontSize: 11,
    color: COLORS.gray[500],
    fontWeight: '500',
  },

  // Empty State
  emptyActivity: {
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.navy[700],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 6,
  },
  emptySub: {
    color: COLORS.gray[400],
    fontSize: 14,
    marginBottom: 20,
  },
  addCarButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addCarButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addCarButtonText: {
    color: COLORS.navy[900],
    fontSize: 14,
    fontWeight: '700',
  },
});