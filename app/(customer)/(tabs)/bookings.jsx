// app/(customer)/(tabs)/bookings.jsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router"; // ✅ Added router
import bookingService from "../../../services/bookingService";
import { useAlert } from "../../../context/AlertContext";

// ============================================
// 🎨 INLINE THEME COLORS
// ============================================
const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  gold: {
    500: "#F59E0B",
  },
  emerald: {
    500: "#10B981",
  },
  orange: {
    500: "#F97316",
  },
  blue: {
    500: "#3B82F6",
  },
  red: {
    500: "#EF4444",
  },
  gray: {
    500: "#6B7280",
    400: "#9CA3AF",
  },
  white: "#FFFFFF",
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lateFeeLoading, setLateFeeLoading] = useState(null); // bookingId of in-flight request
  const { showAlert } = useAlert();

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getMyBookings();

      // console.log("DEBUG MY TRIPS:", JSON.stringify(response, null, 2));

      // ✅ ROBUST DATA EXTRACTION
      let items = [];
      if (response.data && response.data.items) {
        items = response.data.items;
      } else if (response.items) {
        items = response.items;
      } else if (Array.isArray(response)) {
        items = response;
      }

      setBookings(items || []);
    } catch (error) {
      console.log("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return COLORS.emerald[500];
      case "pending":
        return COLORS.orange[500];
      case "ongoing":
        return COLORS.blue[500];
      case "completed":
        return COLORS.emerald[500];
      case "cancelled":
        return COLORS.red[500];
      default:
        return COLORS.gray[500];
    }
  };

  // ✅ Navigate to booking detail
  const handleViewBooking = (bookingId) => {
    router.push(`/(customer)/bookings/${bookingId}`);
  };

  const handlePayLateFee = async (bookingId, lateFeeAmount, carName) => {
    setLateFeeLoading(bookingId);
    try {
      const response = await bookingService.initLateFeePayment(bookingId);
      const checkoutUrl = response?.data?.url;
      if (!checkoutUrl) throw new Error("Failed to get checkout URL");

      router.push({
        pathname: "/(customer)/bookings/safepay-checkout",
        params: { checkoutUrl, bookingId, amount: lateFeeAmount, carName },
      });
    } catch (error) {
      showAlert({
        title: "Payment Error",
        message: error?.message || "Could not initiate late fee payment.",
        type: "error",
      });
    } finally {
      setLateFeeLoading(null);
    }
  };

  const renderBookingItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const startDate = new Date(item.startDateTime).toLocaleDateString();
    const endDate = new Date(item.endDateTime).toLocaleDateString();
    const bookingId = item.id || item._id;
    const carName = `${item.car?.make} ${item.car?.model}`;

    const isActive = item.status === "ongoing" || item.status === "confirmed";
    const isOverdue = isActive && new Date() > new Date(item.endDateTime);
    const hasUnpaidLateFee = item.lateFeeAmount > 0 && !item.isLateFeePaid;
    const isPaying = lateFeeLoading === bookingId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleViewBooking(bookingId)}
        activeOpacity={0.7}
      >
        {/* Status Line */}
        <View style={[styles.statusLine, { backgroundColor: isOverdue ? COLORS.red[500] : statusColor }]} />

        <View style={styles.cardContent}>
          {/* Overdue Banner */}
          {isOverdue && (
            <View style={styles.overdueBanner}>
              <Ionicons name="warning" size={15} color={COLORS.white} />
              <Text style={styles.overdueText}>
                WARNING: Your trip is overdue! Late fees are accumulating.
              </Text>
            </View>
          )}

          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.carName}>{carName}</Text>
              <Text style={styles.carYear}>{item.car?.year}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.gray[400]} />
              <Text style={styles.detailText}>
                {startDate} - {endDate}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="pricetag-outline" size={16} color={COLORS.gray[400]} />
              <Text style={styles.detailText}>Total: PKR {item.totalPrice}</Text>
            </View>
          </View>

          {/* Pay Late Fee Button */}
          {hasUnpaidLateFee && (
            <TouchableOpacity
              style={styles.lateFeeBtn}
              onPress={() => handlePayLateFee(bookingId, item.lateFeeAmount, carName)}
              disabled={isPaying}
              activeOpacity={0.8}
            >
              {isPaying ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="alert-circle" size={16} color={COLORS.white} />
              )}
              <Text style={styles.lateFeeBtnText}>
                {isPaying ? "Processing..." : `Pay Late Fee — PKR ${item.lateFeeAmount}`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Action Arrow */}
          <View style={styles.actionBtn}>
            <Text style={styles.actionText}>View Details</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gold[500]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.header}
      >
        <SafeAreaView
          edges={["top", "left", "right"]}
          style={styles.headerContent}
        >
          <Text style={styles.title}>My Trips</Text>
          <Text style={styles.subtitle}>Your booking history</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.gold[500]} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              tintColor={COLORS.gold[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={60}
                color={COLORS.gray[500]}
              />
              <Text style={styles.emptyText}>No trips yet</Text>
              <Text style={styles.emptySub}>Book your first car today!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },

  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.gray[400], marginTop: 4 },

  listContent: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  statusLine: { width: 6, height: "100%" },
  cardContent: { flex: 1, padding: 16 },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  carName: { fontSize: 16, fontWeight: "700", color: COLORS.white },
  carYear: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },

  detailsContainer: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 13, color: COLORS.gray[400] },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  actionText: { fontSize: 13, fontWeight: "600", color: COLORS.gold[500] },

  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 16,
  },
  emptySub: { fontSize: 14, color: COLORS.gray[400], marginTop: 4 },

  overdueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.red[500],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 12,
  },
  overdueText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
    lineHeight: 16,
  },

  lateFeeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.red[500],
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  lateFeeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
  },
});
