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
  Dimensions,
  Linking,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import bookingService from "../../../services/bookingService";
import carService from "../../../services/carService";
import { useAlert } from "../../../context/AlertContext";

const { width } = Dimensions.get('window');

// Premium Theme
const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46", 600: "#1E3A5F" },
  gold: { 500: "#F59E0B", 400: "#FBBF24" },
  white: "#FFFFFF",
  gray: { 300: "#D1D5DB", 400: "#9CA3AF", 500: "#6B7280", 600: "#4B5563" },
  emerald: { 500: "#10B981", 400: "#34D399" },
  red: { 500: "#EF4444", 400: "#F87171" },
  blue: { 500: "#3B82F6" },
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 1. DYNAMIC HERO HEADER */}
        <LinearGradient
          colors={getStatusGradient(booking.status)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroStatusLabel}>STATUS</Text>
              <Text style={styles.heroStatusValue}>
                {booking.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.heroIconBox}>
              <Ionicons name={getStatusIcon(booking.status)} size={28} color={COLORS.white} />
            </View>
          </View>

          {booking.status === "pending" && (
            <View style={styles.heroWarning}>
              <Ionicons name="time" size={16} color={COLORS.navy[900]} />
              <Text style={styles.heroWarningText}>Action required: Respond to request</Text>
            </View>
          )}
          {booking.status === "ongoing" && (
            <View style={[styles.heroWarning, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <View style={styles.pulseDot} />
              <Text style={[styles.heroWarningText, { color: COLORS.white }]}>Trip is currently active</Text>
            </View>
          )}
        </LinearGradient>

        {/* 2. RENTER INTELLIGENCE CARD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RENTER PROFILE</Text>
          <View style={styles.renterCard}>
            <View style={styles.renterTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {booking.customer?.fullName?.[0] || "G"}
                </Text>
              </View>
              <View style={styles.renterInfo}>
                <Text style={styles.renterName}>{booking.customer?.fullName || "Guest User"}</Text>
                <View style={styles.trustBadgeRow}>
                  <View style={styles.trustBadge}>
                    <Ionicons name="shield-checkmark" size={12} color={COLORS.emerald[500]} />
                    <Text style={styles.trustBadgeText}>ID Verified</Text>
                  </View>
                  <View style={styles.trustBadge}>
                    <Ionicons name="star" size={12} color={COLORS.gold[500]} />
                    <Text style={[styles.trustBadgeText, { color: COLORS.gold[500] }]}>5.0</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.renterActions}>
              <TouchableOpacity style={styles.renterActionBtn} onPress={() => {
                if (booking.customer?.phoneNumber) {
                  Linking.openURL(`tel:${booking.customer.phoneNumber}`);
                }
              }}>
                <Ionicons name="call" size={20} color={COLORS.white} />
                <Text style={styles.renterActionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.renterActionBtn, { backgroundColor: '#25D366' }]} onPress={() => {
                if (booking.customer?.phoneNumber) {
                  Linking.openURL(`whatsapp://send?phone=${booking.customer.phoneNumber}`);
                }
              }}>
                <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
                <Text style={styles.renterActionText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. VISUAL TRIP ITINERARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRIP ITINERARY</Text>
          <View style={styles.itineraryCard}>
            <View style={styles.itineraryRow}>
              <View style={styles.itineraryTimeLeft}>
                <Text style={styles.itTime}>{startTime}</Text>
                <Text style={styles.itDate}>{startDate}</Text>
              </View>
              <View style={styles.itineraryDivider}>
                <View style={[styles.itDot, { borderColor: COLORS.emerald[500] }]} />
                <View style={styles.itLine} />
              </View>
              <View style={styles.itineraryDetail}>
                <Text style={styles.itLabel}>PICKUP</Text>
                <Text style={styles.itLocation} numberOfLines={2}>
                  {booking.car?.location?.address || 'Vehicle Location'}
                </Text>
              </View>
            </View>

            <View style={[styles.itineraryRow, { marginTop: -5 }]}>
              <View style={styles.itineraryTimeLeft}>
                <Text style={styles.itTime}>{endTime}</Text>
                <Text style={styles.itDate}>{endDate}</Text>
              </View>
              <View style={styles.itineraryDivider}>
                <View style={[styles.itDot, { borderColor: COLORS.red[500] }]} />
              </View>
              <View style={styles.itineraryDetail}>
                <Text style={styles.itLabel}>RETURN</Text>
                <Text style={styles.itLocation} numberOfLines={2}>
                  {booking.car?.location?.address || 'Vehicle Location'}
                </Text>
              </View>
            </View>

            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color={COLORS.gold[500]} />
              <Text style={styles.durationText}>{booking.durationHours} Hours Total</Text>
            </View>
          </View>
        </View>

        {/* 4. VEHICLE & HANDOVER STATUS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VEHICLE STATUS</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <Image source={{ uri: carService.getImageUrl(booking.car?.photos?.[0]) }} style={styles.vehicleThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.vName}>{booking.car?.make} {booking.car?.model}</Text>
                <Text style={styles.vPlate}>{booking.car?.plateNumber} • {booking.car?.year}</Text>
              </View>
            </View>

            <View style={styles.handoverGrid}>
              <TouchableOpacity style={styles.handoverBox}>
                <View style={styles.hBoxHeader}>
                  <Text style={styles.hBoxLabel}>Pickup Handover</Text>
                  {booking.pickupImages?.length > 0 ? (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald[500]} />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>
                {booking.pickupImages?.length > 0 ? (
                  <Text style={styles.hBoxSubSuccess}>{booking.pickupImages.length} Photos Captured</Text>
                ) : (
                  <Text style={styles.hBoxSubPending}>Pending scan</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.handoverBox}>
                <View style={styles.hBoxHeader}>
                  <Text style={styles.hBoxLabel}>Return Handover</Text>
                  {booking.returnImages?.length > 0 ? (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald[500]} />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>
                {booking.returnImages?.length > 0 ? (
                  <Text style={styles.hBoxSubSuccess}>{booking.returnImages.length} Photos Captured</Text>
                ) : (
                  <Text style={styles.hBoxSubPending}>Pending scan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. TRANSPARENT EARNINGS RECEIPT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EARNINGS RECEIPT</Text>
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Gross Booking Value</Text>
              <Text style={styles.receiptValue}>PKR {Number(booking.totalPrice).toLocaleString()}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Platform Fee ({booking.platformCommissionPercent || 10}%)</Text>
              <Text style={[styles.receiptValue, { color: COLORS.red[400] }]}>- PKR {Number(booking.platformCommissionAmount || 0).toLocaleString()}</Text>
            </View>

            <View style={styles.receiptDivider} />

            <View style={styles.receiptRowNet}>
              <Text style={styles.netLabel}>Your Net Earnings</Text>
              <Text style={styles.netValue}>PKR {Number(booking.ownerEarningAmount).toLocaleString()}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* 6. CLEAR, TIERED ACTION FOOTER */}
      <View style={styles.footerWrap}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.footerContent}>

          {/* Action Footer - Pending */}
          {booking.status === "pending" && (
            <>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => handleStatusUpdate("confirmed")}
                disabled={actionLoading}
              >
                <LinearGradient colors={[COLORS.emerald[500], COLORS.emerald[400]]} style={styles.gradientFill}>
                  {actionLoading ? (
                    <ActivityIndicator color={COLORS.navy[900]} />
                  ) : (
                    <Text style={styles.primaryActionText}>Accept Request</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => handleStatusUpdate("cancelled")}
                disabled={actionLoading}
              >
                <Text style={[styles.secondaryActionText, { color: COLORS.red[400] }]}>Decline</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Action Footer - Confirmed (Scan QR to Start Trip) */}
          {booking.status === "confirmed" && (
            <>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => router.push("/(host)/bookings/scan")}
              >
                <LinearGradient colors={[COLORS.gold[500], COLORS.gold[400]]} style={styles.gradientFill}>
                  <Ionicons name="qr-code-outline" size={20} color={COLORS.navy[900]} />
                  <Text style={[styles.primaryActionText, { color: COLORS.navy[900] }]}>
                    Scan QR to Start Trip
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => handleStatusUpdate("cancelled")}
                disabled={actionLoading}
              >
                <Text style={[styles.secondaryActionText, { color: COLORS.red[400] }]}>Cancel Booking</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Action Footer - Ongoing (Track + Scan QR to Complete) */}
          {booking.status === "ongoing" && (
            <>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => router.push("/(host)/bookings/scan")}
              >
                <LinearGradient colors={[COLORS.gold[500], COLORS.gold[400]]} style={styles.gradientFill}>
                  <Ionicons name="qr-code-outline" size={20} color={COLORS.navy[900]} />
                  <Text style={[styles.primaryActionText, { color: COLORS.navy[900] }]}>
                    Scan QR to Complete Trip
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryActionBtn, { borderColor: COLORS.blue[500] }]}
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
                <Ionicons name="location-outline" size={20} color={COLORS.blue[500]} />
                <Text style={[styles.secondaryActionText, { color: COLORS.blue[500] }]}>Track Vehicle Location</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------
const getStatusGradient = (status) => {
  switch (status) {
    case "confirmed": return [COLORS.emerald[500], "#059669"];
    case "pending": return [COLORS.gold[500], "#D97706"];
    case "ongoing": return [COLORS.navy[700], COLORS.navy[800]];
    case "completed": return [COLORS.gray[500], COLORS.gray[600]];
    case "cancelled": return [COLORS.red[500], "#DC2626"];
    default: return [COLORS.navy[800], COLORS.navy[900]];
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed": return "checkmark-circle-outline";
    case "pending": return "time-outline";
    case "ongoing": return "car-sport-outline";
    case "completed": return "flag-outline";
    case "cancelled": return "close-circle-outline";
    default: return "ellipse-outline";
  }
};

// -----------------------------------------------------
// STYLES
// -----------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[900],
  },

  // HEADER
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

  scroll: { padding: 20, paddingBottom: 160 },

  section: { marginTop: 28 },
  sectionTitle: {
    color: COLORS.gray[400],
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 1,
  },

  // 1. HERO CARD
  heroCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroStatusLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4
  },
  heroStatusValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 12,
    gap: 8
  },
  heroWarningText: {
    color: COLORS.navy[900],
    fontSize: 14,
    fontWeight: '600'
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emerald[400],
  },

  // 2. RENTER INFO
  renterCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  renterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.navy[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.navy[600]
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700'
  },
  renterInfo: { flex: 1 },
  renterName: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  trustBadgeRow: { flexDirection: 'row', gap: 8 },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navy[900],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  trustBadgeText: { color: COLORS.emerald[500], fontSize: 11, fontWeight: '700' },
  renterActions: { flexDirection: 'row', gap: 12 },
  renterActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy[700],
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8
  },
  renterActionText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },

  // 3. ITINERARY
  itineraryCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  itineraryRow: { flexDirection: 'row', height: 80 },
  itineraryTimeLeft: { width: 70, alignItems: 'flex-end', paddingTop: 2 },
  itTime: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  itDate: { color: COLORS.gray[400], fontSize: 12, marginTop: 2 },
  itineraryDivider: { width: 30, alignItems: 'center' },
  itDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: COLORS.navy[900], zIndex: 2 },
  itLine: { width: 2, flex: 1, backgroundColor: COLORS.navy[600], marginTop: -4 },
  itineraryDetail: { flex: 1, paddingTop: 2, paddingLeft: 10 },
  itLabel: { color: COLORS.gray[500], fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  itLocation: { color: COLORS.white, fontSize: 14, marginTop: 4, lineHeight: 20 },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navy[900],
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 110,
    marginTop: -10,
    gap: 6
  },
  durationText: { color: COLORS.gold[500], fontSize: 12, fontWeight: '700' },

  // 4. VEHICLE STATUS
  vehicleCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  vehicleHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  vehicleThumb: { width: 80, height: 60, borderRadius: 12, backgroundColor: COLORS.navy[900] },
  vName: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  vPlate: { color: COLORS.gray[400], fontSize: 13 },
  handoverGrid: { flexDirection: 'row', gap: 12 },
  handoverBox: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700]
  },
  hBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hBoxLabel: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  pendingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.gray[600] },
  hBoxSubSuccess: { color: COLORS.emerald[400], fontSize: 12 },
  hBoxSubPending: { color: COLORS.gray[500], fontSize: 12 },

  // 5. RECEIPT
  receiptCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  receiptLabel: { color: COLORS.gray[400], fontSize: 14 },
  receiptValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  receiptDivider: { height: 1, backgroundColor: COLORS.navy[700], marginVertical: 12 },
  receiptRowNet: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netLabel: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  netValue: { color: COLORS.emerald[400], fontSize: 22, fontWeight: '800' },

  // 6. ACTION FOOTER
  footerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden'
  },
  footerContent: {
    padding: 20,
    paddingBottom: 30, // account for safe area
    gap: 12,
  },
  primaryActionBtn: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden'
  },
  gradientFill: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryActionBtn: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    backgroundColor: COLORS.navy[800]
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '600'
  }
});
