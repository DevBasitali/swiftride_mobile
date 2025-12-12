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
} from "react-native";
import { router, useFocusEffect } from 'expo-router'; // ✅ Ensure router is imported
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

// Import Services
import carService from "../../../services/carService";
import { useAuth } from "../../../context/AuthContext";
// Import booking service to get real count
import bookingService from "../../../services/bookingService"; 

const { width } = Dimensions.get("window");

export default function HostDashboard() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  

  // Real-Time Stats State
  const [stats, setStats] = useState({
    totalCars: 0,
    activeCars: 0,
    totalBookings: 0, 
    totalEarnings: 0,
    pendingRequests: 0, // ✅ We will fetch this now
    rating: 5.0,
  });

  // Fetch Data every time screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshUser(); 
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Real Car Data
      const carResponse = await carService.getMyCars();
      const cars = carResponse.data.cars || [];
      const activeCount = cars.filter((c) => c.isActive).length;

      // 2. Fetch Real Bookings for Counts
      let bookingCount = 0;
      let pendingCount = 0;
      let earnings = 0;

      try {
        const bookingResponse = await bookingService.getHostBookings();
        const allBookings = bookingResponse.items || [];
        bookingCount = allBookings.length;
        pendingCount = allBookings.filter(b => b.status === 'pending').length;
        
        // Calculate earnings (completed bookings)
        earnings = allBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
          
      } catch (err) {
        console.log("Booking fetch failed (API might not be ready)", err);
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

  // ✅ Navigate to Booking Manager
  const goToBookings = () => {
    router.push('/(host)/bookings');
  };

  return (
    <View style={styles.container}>
      {/* 1. HEADER WITH REAL USER DATA */}
      <LinearGradient
        colors={["#141E30", "#243B55"]}
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
            
            {/* ✅ NOTIFICATION BELL LINKED */}
            <TouchableOpacity style={styles.bellBtn} onPress={goToBookings}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {stats.pendingRequests > 0 && <View style={styles.dot} />}
            </TouchableOpacity>
          </View>

          {/* REAL EARNINGS CARD */}
          <View style={styles.earningsCard}>
            <View>
              <Text style={styles.earningsLabel}>Total Earnings</Text>
              <Text style={styles.earningsValue}>
                $
                {stats.totalEarnings.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.profitBadge}>
              <FontAwesome name="arrow-up" size={12} color="#4CAF50" />
              <Text style={styles.profitText}>0%</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* 2. REAL STATS GRID */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#141E30"
          />
        }
      >
        <Text style={styles.sectionTitle}>Overview</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#141E30"
            style={{ marginTop: 20 }}
          />
        ) : (
          <View style={styles.statsGrid}>
            <StatBox
              icon="car-sport"
              label="Total Cars"
              value={stats.totalCars.toString()}
              color="#4A90E2"
            />
            <StatBox
              icon="checkmark-circle"
              label="Active Listings"
              value={stats.activeCars.toString()}
              color="#50E3C2"
            />
            
            {/* ✅ CLICKABLE BOOKING STAT */}
            <TouchableOpacity 
                style={{width: (width - 55) / 2}} 
                onPress={goToBookings}
            >
                <StatBox
                icon="calendar"
                label="Bookings"
                value={stats.totalBookings.toString()}
                color="#F5A623"
                isClickable={true} 
                />
            </TouchableOpacity>

            <StatBox
              icon="star"
              label="Rating"
              value={stats.rating.toFixed(1)}
              color="#F8E71C"
            />
          </View>
        )}

        {/* RECENT ACTIVITY */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {stats.totalCars === 0 ? (
          <View style={styles.emptyActivity}>
            <Text style={styles.emptyText}>No activity yet.</Text>
            <Text style={styles.emptySub}>
              List your first car to get started.
            </Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            <ActivityItem
              title="System Ready"
              sub="Your fleet is live and visible to customers."
              time="Now"
              icon="server-outline"
              color="#4A90E2"
            />
            {stats.pendingRequests > 0 && (
                 <ActivityItem
                 title="New Request"
                 sub={`You have ${stats.pendingRequests} pending booking(s)`}
                 time="Action Required"
                 icon="alert-circle-outline"
                 color="#F5A623"
               />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Helper Components
function StatBox({ icon, label, value, color, isClickable }) {
  // If inside TouchableOpacity, we remove the fixed width style from here
  const containerStyle = isClickable 
    ? styles.statBoxInner 
    : styles.statBox;

  return (
    <View style={containerStyle}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityItem({ title, sub, time, icon, color }) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actTitle}>{title}</Text>
        <Text style={styles.actSub}>{sub}</Text>
      </View>
      <Text style={styles.actTime}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
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
  welcomeText: { color: "#ffffff80", fontSize: 14, fontWeight: "600" },
  userName: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  bellBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: "#FF4757",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#141E30",
  },

  earningsCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  earningsLabel: { color: "#ffffff90", fontSize: 14, marginBottom: 5 },
  earningsValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  profitBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  profitText: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 12,
  },

  content: { marginTop: -20, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#141E30",
    marginBottom: 15,
    marginTop: 25,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: (width - 55) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statBoxInner: {
    width: '100%', // Fills the TouchableOpacity
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#141E30" },
  statLabel: { fontSize: 12, color: "#888", fontWeight: "600" },

  activityList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 10,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  actTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
  actSub: { fontSize: 12, color: "#999", marginTop: 2 },
  actTime: { fontSize: 11, color: "#bbb" },

  emptyActivity: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyText: { color: "#333", fontWeight: "bold" },
  emptySub: { color: "#888", fontSize: 12, marginTop: 5 },
});