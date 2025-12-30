// app/(customer)/bookings/create.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import carService from "../../../services/carService";
import bookingService from "../../../services/bookingService";
import { useAlert } from "../../../context/AlertContext";

// Premium Theme Colors
const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46" },
  gold: { 500: "#F59E0B" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF" },
  green: { 500: "#10B981" },
};

export default function CreateBooking() {
  const { carId } = useLocalSearchParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showAlert } = useAlert();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const initialEnd = new Date(tomorrow);
  initialEnd.setHours(18, 0, 0, 0);

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(initialEnd);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");

  useEffect(() => {
    loadCar();
  }, [carId]);

  const loadCar = async () => {
    try {
      const response = await carService.getCarById(carId);
      setCar(response.data?.car || response.car);
    } catch (error) {
      showAlert({ title: "Error", message: "Car not found", type: "error" });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onChangeStart = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) setEndDate(selectedDate);
  };

  const openPicker = (type, mode) => {
    setPickerMode(mode);
    if (type === "start") setShowStartPicker(true);
    else setShowEndPicker(true);
  };

  const calculateTotal = () => {
    if (!car) return 0;
    const diffMs = endDate - startDate;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHours <= 0) return 0;
    const hourlyRate = car.pricePerHour || car.pricePerDay / 24;
    return (diffHours * hourlyRate).toFixed(2);
  };

  const durationHours = () => {
    const diffMs = endDate - startDate;
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  };

  // const handleConfirm = async () => {
  //   if (endDate <= startDate) {
  //     Alert.alert("Invalid Dates", "End time must be after start time.");
  //     return;
  //   }

  //   setSubmitting(true);
  //   try {
  //     // ✅ FIXED: Keys now match backend service expectations
  //     const payload = {
  //       carId: car._id,
  //       startDateTime: startDate.toISOString(), // ✅ Changed from startDate
  //       endDateTime: endDate.toISOString(), // ✅ Changed from endDate
  //     };

  //     console.log("Sending Booking Payload:", payload);

  //     await bookingService.createBooking(payload);

  //     Alert.alert("Success!", "Booking request sent successfully.", [
  //       {
  //         text: "View Bookings",
  //         onPress: () => router.replace("/(customer)/(tabs)/bookings"),
  //       },
  //       { text: "Home", onPress: () => router.push("/(customer)/(tabs)") },
  //     ]);
  //   } catch (error) {
  //     console.log("Booking Error:", error);
  //     const errMsg =
  //       error.response?.data?.message ||
  //       error.message ||
  //       "Something went wrong.";
  //     Alert.alert("Booking Failed", errMsg);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleConfirm = async () => {
    if (endDate <= startDate) {
      showAlert({
        title: "Invalid Dates",
        message: "End time must be after start time.",
        type: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        carId: car._id,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
      };

      console.log("Sending Booking Payload:", payload);

      const response = await bookingService.createBooking(payload);

      // ✅ Extract booking data
      const bookingData = response.data?.booking || response.booking;
      const totalPrice = calculateTotal();

      // ✅ Navigate to payment screen
      router.push({
        pathname: "/(customer)/bookings/payment",
        params: {
          bookingId: bookingData._id || bookingData.id,
          amount: totalPrice,
          carName: `${car.make} ${car.model}`,
        },
      });
    } catch (error) {
      console.log("Booking Error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong.";
      showAlert({ title: "Booking Failed", message: errMsg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
      </View>
    );

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
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review & Book</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Car Summary */}
        <View style={styles.card}>
          <Image
            source={{ uri: carService.getImageUrl(car.photos?.[0]) }}
            style={styles.thumb}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.carName}>
              {car.make} {car.model}
            </Text>
            <Text style={styles.price}>
              PKR {car.pricePerDay}
              <Text style={styles.per}>/day</Text>
            </Text>
            <View style={styles.locRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.gray[400]}
              />
              <Text style={styles.locText} numberOfLines={1}>
                {car.location?.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRIP DATES</Text>

          <View style={styles.dateCard}>
            <View style={styles.dateRow}>
              <View style={styles.dateIconBox}>
                <Ionicons name="calendar" size={20} color={COLORS.gold[500]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <View style={styles.pickerRow}>
                  <TouchableOpacity onPress={() => openPicker("start", "date")}>
                    <Text style={styles.pickerText}>
                      {startDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openPicker("start", "time")}>
                    <Text style={styles.pickerText}>
                      {startDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.dateDivider} />

            <View style={styles.dateRow}>
              <View
                style={[
                  styles.dateIconBox,
                  { backgroundColor: COLORS.navy[700] },
                ]}
              >
                <Ionicons name="flag" size={20} color={COLORS.green[500]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateLabel}>End Date</Text>
                <View style={styles.pickerRow}>
                  <TouchableOpacity onPress={() => openPicker("end", "date")}>
                    <Text style={styles.pickerText}>
                      {endDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openPicker("end", "time")}>
                    <Text style={styles.pickerText}>
                      {endDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRICE BREAKDOWN</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Duration</Text>
              <Text style={styles.rowVal}>{durationHours()} Hours</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Rate</Text>
              <Text style={styles.rowVal}>
                PKR{" "}
                {car.pricePerHour
                  ? `${car.pricePerHour}/hr`
                  : `${car.pricePerDay}/day`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Estimated</Text>
              <Text style={styles.totalVal}>PKR {calculateTotal()}</Text>
            </View>
          </View>
        </View>

        {/* Hidden Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode={pickerMode}
            is24Hour={false}
            onChange={onChangeStart}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode={pickerMode}
            is24Hour={false}
            onChange={onChangeEnd}
          />
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btn}
          onPress={handleConfirm}
          disabled={submitting}
        >
          <LinearGradient
            colors={[COLORS.gold[500], "#FBBF24"]}
            style={styles.gradientBtn}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.navy[900]} />
            ) : (
              <Text style={styles.btnText}>Confirm & Pay Later</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[900],
  },

  header: {
    padding: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: { padding: 20, paddingBottom: 100 },

  card: {
    flexDirection: "row",
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 15,
    backgroundColor: COLORS.navy[700],
  },
  carName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  price: { fontSize: 18, fontWeight: "700", color: COLORS.gold[500] },
  per: { fontSize: 12, color: COLORS.gray[400], fontWeight: "400" },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  locText: { color: COLORS.gray[400], fontSize: 12, flex: 1 },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray[400],
    marginBottom: 12,
    letterSpacing: 1,
  },

  dateCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  dateLabel: { fontSize: 12, color: COLORS.gray[400], marginBottom: 4 },
  pickerRow: { flexDirection: "row", gap: 15 },
  pickerText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
    textDecorationLine: "underline",
  },
  dateDivider: {
    height: 1,
    backgroundColor: COLORS.navy[700],
    marginVertical: 16,
    marginLeft: 55,
  },

  breakdownCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rowLabel: { color: COLORS.gray[400], fontSize: 14 },
  rowVal: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.navy[700], marginVertical: 12 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: COLORS.white },
  totalVal: { fontSize: 24, fontWeight: "700", color: COLORS.gold[500] },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy[900],
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
  },
  btn: { borderRadius: 14, overflow: "hidden" },
  gradientBtn: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: COLORS.navy[900], fontSize: 16, fontWeight: "700" },
});
