import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import bookingService from "../../../services/bookingService";
import carService from "../../../services/carService";
import { useAlert } from "../../../context/AlertContext";

// Premium Theme
const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46" },
  gold: { 500: "#F59E0B" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF", 500: "#6B7280" },
  emerald: { 500: "#10B981" },
  red: { 500: "#EF4444" },
};

export default function BookingDetails() {
  const { id } = useLocalSearchParams(); // This is the booking ID
  const { showAlert } = useAlert();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await bookingService.getBookingDetails(id);
      setBooking(response.data?.booking || response.booking);
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Could not load booking details",
        type: "error",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setActionLoading(true);
    try {
      // ✅ Status must be 'confirmed' or 'cancelled'
      console.log(`Updating booking ${id} to ${status}`);

      await bookingService.updateBookingStatus(id, status);

      showAlert({
        title: "Success",
        message: `Booking ${status} successfully!`,
        type: "success",
        buttons: [{ text: "OK", onPress: () => fetchDetails() }],
      });
    } catch (error) {
      console.log("Update Error:", error.response?.data || error.message);
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Failed to update status",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
      </View>
    );
  }

  if (!booking) return null;

  const startDate = new Date(booking.startDateTime).toLocaleDateString();
  const startTime = new Date(booking.startDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endDate = new Date(booking.endDateTime).toLocaleDateString();
  const endTime = new Date(booking.endDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status Card */}
        {/* Status Card */}
        <LinearGradient
          colors={getStatusGradient(booking.status)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <View style={styles.statusContent}>
            <View>
              <Text style={styles.statusLabel}>BOOKING STATUS</Text>
              <Text style={styles.statusValue}>
                {booking.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.statusIconContainer}>
              <Ionicons
                name={getStatusIcon(booking.status)}
                size={24}
                color={COLORS.white}
              />
            </View>
          </View>
          {booking.status === "pending" && (
            <View style={styles.statusMessage}>
              <Ionicons
                name="alert-circle"
                size={16}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.statusSub}>
                Action required: Accept or Decline
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Handover Details (New) */}
        {/* Handover Details */}
        {(booking.pickupImages?.length > 0 ||
          booking.returnImages?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HANDOVER INSPECTION</Text>
            <View style={styles.card}>
              {/* Pickup Section */}
              <View style={styles.handoverSection}>
                <View style={styles.handoverHeader}>
                  <View style={styles.handoverInfo}>
                    <Ionicons name="key" size={16} color={COLORS.gold[500]} />
                    <Text style={styles.handoverTitle}>Pickup Handover</Text>
                  </View>
                  {booking.pickupImages?.length > 0 ? (
                    <View style={styles.statusBadgeSuccess}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={COLORS.emerald[500]}
                      />
                      <Text style={styles.badgeText}>Completed</Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgePending}>
                      <Text style={styles.badgeTextPending}>Pending</Text>
                    </View>
                  )}
                </View>

                {booking.pickupImages?.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.miniGallery}
                  >
                    {booking.pickupImages.map((img, i) => (
                      <Image
                        key={i}
                        source={{ uri: img }}
                        style={styles.miniThumb}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.cardDivider} />

              {/* Return Section */}
              <View style={styles.handoverSection}>
                <View style={styles.handoverHeader}>
                  <View style={styles.handoverInfo}>
                    <Ionicons name="flag" size={16} color={COLORS.gold[500]} />
                    <Text style={styles.handoverTitle}>Return Handover</Text>
                  </View>
                  {booking.returnImages?.length > 0 ? (
                    <View style={styles.statusBadgeSuccess}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={COLORS.emerald[500]}
                      />
                      <Text style={styles.badgeText}>Completed</Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgePending}>
                      <Text style={styles.badgeTextPending}>Pending</Text>
                    </View>
                  )}
                </View>

                {booking.returnImages?.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.miniGallery}
                  >
                    {booking.returnImages.map((img, i) => (
                      <Image
                        key={i}
                        source={{ uri: img }}
                        style={styles.miniThumb}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Car Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VEHICLE DETAILS</Text>
          <View style={styles.carCard}>
            <Image
              source={{ uri: carService.getImageUrl(booking.car?.photos?.[0]) }}
              style={styles.carImageLarge}
            />
            <LinearGradient
              colors={[
                "transparent",
                "rgba(15, 33, 55, 0.95)",
                COLORS.navy[800],
              ]}
              style={styles.carOverlay}
            >
              <View>
                <Text style={styles.carName}>
                  {booking.car?.make} {booking.car?.model}
                </Text>
                <View style={styles.carMetaRow}>
                  <Text style={styles.carYear}>{booking.car?.year}</Text>
                  <View style={styles.plateTag}>
                    <Text style={styles.plate}>{booking.car?.plateNumber}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Renter Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RENTER INFO</Text>
          <View style={styles.card}>
            <View style={styles.renterHeader}>
              <View style={styles.avatarContainer}>
                {booking.customer?.fullName ? (
                  <Text style={styles.avatarText}>
                    {booking.customer.fullName[0]}
                  </Text>
                ) : (
                  <Ionicons name="person" size={20} color={COLORS.navy[900]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.renterName}>
                  {booking.customer?.fullName || "Guest User"}
                </Text>
                <Text style={styles.renterEmail}>
                  {booking.customer?.email}
                </Text>
                <View style={styles.verifiedTag}>
                  <Ionicons
                    name="shield-checkmark"
                    size={12}
                    color={COLORS.emerald[500]}
                  />
                  <Text style={styles.verifiedText}>Identity Verified</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionIconBtn}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.gold[500]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRIP SCHEDULE</Text>
          <View style={styles.card}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={styles.timelineTime}>{startTime}</Text>
                <Text style={styles.timelineDate}>{startDate}</Text>
              </View>
              <View style={styles.timelineCenter}>
                <View
                  style={[styles.dot, { backgroundColor: COLORS.emerald[500] }]}
                />
                <View style={styles.line} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={styles.timelineLabel}>Pickup</Text>
                <Text style={styles.timelineLocation}>Car Location</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={styles.timelineTime}>{endTime}</Text>
                <Text style={styles.timelineDate}>{endDate}</Text>
              </View>
              <View style={styles.timelineCenter}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: COLORS.red[500], marginTop: -2 },
                  ]}
                />
              </View>
              <View style={styles.timelineRight}>
                <Text style={styles.timelineLabel}>Return</Text>
                <Text style={styles.timelineLocation}>Car Location</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT BREAKDOWN</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Total Trip Price</Text>
              <Text style={styles.rowValue}>
                PKR {Number(booking.totalPrice).toLocaleString()}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                Service Fee ({booking.platformCommissionPercent || 10}%)
              </Text>
              <Text style={[styles.rowValue, { color: COLORS.red[500] }]}>
                - PKR{" "}
                {Number(booking.platformCommissionAmount || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.netLabel}>Net Earnings</Text>
              <Text style={styles.netValue}>
                PKR {Number(booking.ownerEarningAmount).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer - Pending */}
      {booking.status === "pending" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleStatusUpdate("cancelled")}
            disabled={actionLoading}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleStatusUpdate("confirmed")}
            disabled={actionLoading}
          >
            <LinearGradient
              colors={[COLORS.gold[500], "#FBBF24"]}
              style={styles.gradientBtn}
            >
              {actionLoading ? (
                <ActivityIndicator color={COLORS.navy[900]} />
              ) : (
                <Text style={styles.acceptText}>Accept Request</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Footer - Confirmed (Scan QR to Start Trip) */}
      {booking.status === "confirmed" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleStatusUpdate("cancelled")}
            disabled={actionLoading}
          >
            <Text style={styles.declineText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => router.push("/(host)/bookings/scan")}
          >
            <LinearGradient
              colors={[COLORS.emerald[500], "#34D399"]}
              style={styles.gradientBtn}
            >
              <Ionicons name="qr-code" size={20} color={COLORS.white} />
              <Text
                style={[
                  styles.acceptText,
                  { color: COLORS.white, marginLeft: 8 },
                ]}
              >
                Scan QR to Start
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Footer - Ongoing (Track + Scan QR to Complete) */}
      {booking.status === "ongoing" && (
        <View style={styles.footer}>
          {/* Track Car Button */}
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() =>
              router.push({
                pathname: "/(host)/bookings/track",
                params: {
                  bookingId: booking._id || booking.id,
                  carName: `${booking.car?.make} ${booking.car?.model}`,
                  customerName: booking.customer?.fullName,
                },
              })
            }
          >
            <Ionicons name="location" size={20} color={COLORS.gold[500]} />
            <Text style={styles.trackText}>Track</Text>
          </TouchableOpacity>

          {/* Scan QR to Complete Trip Button */}
          <TouchableOpacity
            style={[styles.acceptBtn, { flex: 1 }]}
            onPress={() => router.push("/(host)/bookings/scan")}
          >
            <LinearGradient
              colors={[COLORS.gold[500], "#FBBF24"]}
              style={styles.gradientBtn}
            >
              <Ionicons name="qr-code" size={20} color={COLORS.navy[900]} />
              <Text style={[styles.acceptText, { marginLeft: 8 }]}>
                Scan QR to Complete
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStatusGradient = (status) => {
  switch (status) {
    case "confirmed":
      return [COLORS.emerald[500], COLORS.emerald[400]];
    case "pending":
      return [COLORS.gold[500], COLORS.gold[500]]; // Flat gold or slight gradient
    case "ongoing":
      return [COLORS.navy[700], COLORS.navy[600]];
    case "completed":
      return [COLORS.gray[500], COLORS.gray[400]];
    case "cancelled":
      return [COLORS.red[500], COLORS.red[500]];
    default:
      return [COLORS.navy[800], COLORS.navy[700]];
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed":
      return "checkmark-circle";
    case "pending":
      return "time";
    case "ongoing":
      return "play-circle";
    case "completed":
      return "flag";
    case "cancelled":
      return "close-circle";
    default:
      return "ellipse";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return COLORS.emerald[500];
    case "pending":
      return COLORS.gold[500];
    case "completed":
      return COLORS.gray[400];
    case "cancelled":
      return COLORS.red[500];
    default:
      return COLORS.white;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[900],
  },

  header: { paddingBottom: 15 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.navy[800],
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },

  scroll: { padding: 20, paddingBottom: 120 },

  // Sections
  section: { marginBottom: 28 },
  sectionTitle: {
    color: COLORS.gray[400],
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  // Generic Card
  card: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },

  // Status Card
  statusCard: { borderRadius: 20, padding: 20, marginBottom: 28, elevation: 4 },
  statusContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  statusSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "500",
  },

  // Handover Card
  handoverSection: { marginBottom: 4 },
  handoverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  handoverInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  handoverTitle: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  statusBadgeSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgePending: {
    backgroundColor: "rgba(156, 163, 175, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: COLORS.emerald[500], fontSize: 11, fontWeight: "700" },
  badgeTextPending: {
    color: COLORS.gray[400],
    fontSize: 11,
    fontWeight: "600",
  },
  miniGallery: { flexDirection: "row", marginTop: 4, marginBottom: 8 },
  miniThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.navy[700],
    marginVertical: 16,
  },

  // Car Card
  carCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.navy[800],
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  carImageLarge: { width: "100%", height: 180 },
  carOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  carName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  carMetaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  carYear: { color: COLORS.gray[400], fontSize: 14, fontWeight: "500" },
  plateTag: {
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plate: { color: COLORS.navy[900], fontSize: 11, fontWeight: "700" },

  // Renter Card
  renterHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.navy[600],
  },
  avatarText: { color: COLORS.white, fontSize: 24, fontWeight: "600" },
  renterName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  renterEmail: { color: COLORS.gray[400], fontSize: 13, marginBottom: 6 },
  verifiedTag: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { color: COLORS.emerald[500], fontSize: 12, fontWeight: "600" },
  actionIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },

  // Timeline
  timelineItem: { flexDirection: "row", height: 70 },
  timelineLeft: { width: 70, alignItems: "flex-end", paddingRight: 10 },
  timelineTime: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  timelineDate: { color: COLORS.gray[500], fontSize: 11 },
  timelineCenter: { width: 20, alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  line: { width: 2, flex: 1, backgroundColor: COLORS.navy[600], marginTop: -2 },
  timelineRight: { flex: 1, paddingLeft: 10 },
  timelineLabel: { color: COLORS.gray[400], fontSize: 12, fontWeight: "600" },
  timelineLocation: { color: COLORS.white, fontSize: 14, marginTop: 2 },

  // Payment
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rowLabel: { color: COLORS.gray[400], fontSize: 14 },
  rowValue: { color: COLORS.white, fontSize: 14, fontWeight: "500" },
  divider: { height: 1, backgroundColor: COLORS.navy[700], marginVertical: 12 },
  netLabel: { color: COLORS.gold[500], fontSize: 16, fontWeight: "700" },
  netValue: { color: COLORS.gold[500], fontSize: 20, fontWeight: "800" },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy[900],
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
    flexDirection: "row",
    gap: 15,
  },
  declineBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.red[500],
    justifyContent: "center",
    alignItems: "center",
  },
  declineText: { color: COLORS.red[500], fontWeight: "700", fontSize: 16 },
  acceptBtn: { flex: 2, borderRadius: 14, overflow: "hidden", height: 50 },
  gradientBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  acceptText: { color: COLORS.navy[900], fontWeight: "700", fontSize: 16 },

  // Track button
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gold[500],
    backgroundColor: COLORS.navy[800],
  },
  trackText: { color: COLORS.gold[500], fontWeight: "700", fontSize: 16 },
});
