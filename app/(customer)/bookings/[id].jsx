import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy"; // ✅ FIXED: Use legacy import
import * as Sharing from "expo-sharing";
import bookingService from "../../../services/bookingService";
import carService from "../../../services/carService";
import api from "../../../services/api";
import { useLocationTracking } from "../../../hooks/useLocationTracking";

// Premium Theme
const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46", 600: "#1E3A5F" },
  gold: { 500: "#F59E0B" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF", 500: "#6B7280" },
  green: { 500: "#10B981" },
  blue: { 500: "#3B82F6" },
  orange: { 500: "#F97316" },
  red: { 500: "#EF4444" },
};

export default function CustomerBookingDetail() {
  const params = useLocalSearchParams();
  const { id } = params;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Location tracking - only active when booking is ongoing
  const isOngoing = booking?.status === "ongoing";
  const { location, isTracking, error: trackingError } = useLocationTracking(
    booking?._id || booking?.id,
    isOngoing
  );

  useEffect(() => {
    if (id) {
      fetchBookingDetail();
    } else {
      Alert.alert("Error", "Invalid booking");
      router.back();
    }
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      const response = await bookingService.getBookingDetails(id);
      // console.log("Booking Detail:", JSON.stringify(response, null, 2));

      const bookingData = response.data?.booking || response.booking;
      setBooking(bookingData);
    } catch (error) {
      console.error("Error fetching booking:", error);
      Alert.alert("Error", "Could not load booking details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: COLORS.orange[500],
        icon: "time-outline",
        label: "Pending Confirmation",
      },
      confirmed: {
        color: COLORS.blue[500],
        icon: "checkmark-circle",
        label: "Confirmed",
      },
      ongoing: {
        color: COLORS.green[500],
        icon: "car-sport",
        label: "Trip Ongoing",
      },
      completed: {
        color: COLORS.green[500],
        icon: "checkmark-done-circle",
        label: "Completed",
      },
      cancelled: {
        color: COLORS.red[500],
        icon: "close-circle",
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadInvoice = async () => {
    if (booking.status === "pending") {
      Alert.alert(
        "Invoice Not Available",
        "Invoice will be generated once the host confirms your booking.",
        [{ text: "OK" }]
      );
      return;
    }

    // Use the direct PDF URL from booking data
    const pdfUrl = booking.invoicePdfPath;

    if (!pdfUrl) {
      Alert.alert("Invoice Not Available", "Invoice PDF has not been generated yet.");
      return;
    }

    Alert.alert(
      "Download Invoice",
      "Open invoice PDF in browser?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: async () => {
            try {
              // Open PDF directly in browser - most reliable way
              const canOpen = await Linking.canOpenURL(pdfUrl);
              if (canOpen) {
                await Linking.openURL(pdfUrl);
              } else {
                Alert.alert("Error", "Cannot open PDF URL");
              }
            } catch (error) {
              console.error("Open PDF error:", error);
              Alert.alert("Error", "Could not open invoice");
            }
          },
        },
      ]
    );
  };

  const handleContactHost = () => {
    Alert.alert("Contact Host", "How would you like to contact the host?", [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL("tel:+923111553572") },
      {
        text: "WhatsApp",
        onPress: () => Linking.openURL("https://api.whatsapp.com/send?phone=923111553572"),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
      </View>
    );
  }

  if (!booking) return null;

  const statusConfig = getStatusConfig(booking.status);

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
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>Booking Details</Text>
            <Text style={styles.headerSub}>#{booking.invoiceNumber}</Text>
          </View>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: statusConfig.color + "20" },
          ]}
        >
          <View
            style={[
              styles.statusIconBox,
              { backgroundColor: statusConfig.color },
            ]}
          >
            <Ionicons name={statusConfig.icon} size={24} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusLabel}>Booking Status</Text>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Car Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Details</Text>
          <View style={styles.carInfoRow}>
            <Image
              source={{
                uri: carService.getImageUrl(booking.car?.primaryPhoto),
              }}
              style={styles.carThumb}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.carName}>
                {booking.car?.make} {booking.car?.model}
              </Text>
              <Text style={styles.carYear}>{booking.car?.year}</Text>
              {booking.car?.location && (
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location"
                    size={14}
                    color={COLORS.gray[400]}
                  />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {booking.car.location.address}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Information</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="calendar" size={20} color={COLORS.gold[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Start Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(booking.startDateTime)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="flag" size={20} color={COLORS.green[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>End Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(booking.endDateTime)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="time" size={20} color={COLORS.blue[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {booking.durationHours} Hours
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              {booking.currency} {booking.totalPrice}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {booking.currency} {booking.totalPrice}
            </Text>
          </View>

          <View
            style={[
              styles.paymentStatusBox,
              {
                backgroundColor: booking.isPaid
                  ? COLORS.green[500] + "20"
                  : COLORS.orange[500] + "20",
              },
            ]}
          >
            <Ionicons
              name={booking.isPaid ? "checkmark-circle" : "time"}
              size={18}
              color={booking.isPaid ? COLORS.green[500] : COLORS.orange[500]}
            />
            <Text
              style={[
                styles.paymentStatusText,
                {
                  color: booking.isPaid
                    ? COLORS.green[500]
                    : COLORS.orange[500],
                },
              ]}
            >
              {booking.isPaid ? "Payment Completed" : "Payment Pending"}
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
        {booking.statusTimeline && booking.statusTimeline.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Status History</Text>
            {booking.statusTimeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index < booking.statusTimeline.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{item.status}</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(item.changedAt).toLocaleString()}
                  </Text>
                  {item.note && (
                    <Text style={styles.timelineNote}>{item.note}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, downloading && styles.actionBtnDisabled]}
            onPress={handleDownloadInvoice}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={COLORS.gold[500]} />
            ) : (
              <Ionicons
                name="document-text"
                size={20}
                color={COLORS.gold[500]}
              />
            )}
            <Text style={styles.actionText}>
              {downloading ? "Downloading..." : "Download Invoice"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleContactHost}
          >
            <Ionicons name="chatbubble" size={20} color={COLORS.blue[500]} />
            <Text style={styles.actionText}>Contact Host</Text>
          </TouchableOpacity>
        </View>

        {/* Info Note for Pending */}
        {booking.status === "pending" && (
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color={COLORS.gold[500]}
            />
            <Text style={styles.infoText}>
              Your booking is awaiting confirmation from the host. You'll
              receive a notification once confirmed.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[900],
  },

  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.white },
  headerSub: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: { padding: 20, paddingBottom: 40 },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusLabel: { fontSize: 12, color: COLORS.gray[400], marginBottom: 4 },
  statusText: { fontSize: 18, fontWeight: "700" },

  card: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  carInfoRow: { flexDirection: "row", alignItems: "center" },
  carThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: COLORS.navy[700],
  },
  carName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  carYear: { fontSize: 14, color: COLORS.gray[400], marginBottom: 8 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 12, color: COLORS.gray[400], flex: 1 },

  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  detailIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailLabel: { fontSize: 12, color: COLORS.gray[400], marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: "600", color: COLORS.white },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceLabel: { fontSize: 14, color: COLORS.gray[400] },
  priceValue: { fontSize: 14, fontWeight: "600", color: COLORS.white },

  divider: { height: 1, backgroundColor: COLORS.navy[700], marginVertical: 12 },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: COLORS.white },
  totalValue: { fontSize: 20, fontWeight: "700", color: COLORS.gold[500] },

  paymentStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  paymentStatusText: { fontSize: 13, fontWeight: "700" },

  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold[500],
    marginRight: 16,
    marginTop: 4,
  },
  timelineLine: {
    position: "absolute",
    left: 5.5,
    top: 16,
    width: 1,
    height: "100%",
    backgroundColor: COLORS.navy[600],
  },
  timelineContent: { flex: 1 },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
    textTransform: "capitalize",
  },
  timelineDate: { fontSize: 12, color: COLORS.gray[400], marginBottom: 4 },
  timelineNote: { fontSize: 12, color: COLORS.gray[500], fontStyle: "italic" },

  actionsContainer: { flexDirection: "row", gap: 12, marginTop: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  actionBtnDisabled: { opacity: 0.6 },
  actionText: { fontSize: 13, fontWeight: "600", color: COLORS.white },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.gray[400], lineHeight: 20 },

  // Extend Trip Button
  extendTripBtn: {
    marginTop: 16,
    borderRadius: 14,
    overflow: "hidden",
  },
  extendGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  extendText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // Location Tracking Banner
  trackingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.green[500] + "15",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.green[500] + "30",
    gap: 8,
    flexWrap: "wrap",
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green[500],
  },
  trackingText: {
    color: COLORS.green[500],
    fontSize: 13,
    fontWeight: "600",
  },
  trackingCoords: {
    color: COLORS.gray[400],
    fontSize: 11,
    marginLeft: "auto",
  },
});
