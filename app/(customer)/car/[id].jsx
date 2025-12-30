import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import carService from "../../../services/carService";
import bookingService from "../../../services/bookingService";
import { useAuth } from "../../../context/AuthContext";
import { useAlert } from "../../../context/AlertContext";

const { width } = Dimensions.get("window");

// Premium Theme
const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46", 600: "#1E3A5F" },
  gold: { 500: "#F59E0B" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF", 500: "#6B7280" },
  emerald: { 500: "#10B981" },
  blue: { 500: "#3B82F6" },
};

export default function CustomerCarDetails() {
  const { id } = useLocalSearchParams();
  const { user, kycStatus } = useAuth();
  const { showAlert } = useAlert();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [existingBooking, setExistingBooking] = useState(null); // Track if user has active booking

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const response = await carService.getCarById(id);
      const carData = response.data?.car || response.car;
      setCar(carData);

      // Check if user has an active booking for this car
      if (user) {
        try {
          const bookingsResponse = await bookingService.getMyBookings();
          const myBookings =
            bookingsResponse.data?.items || bookingsResponse.items || [];

          // Find any active booking for this car (pending, confirmed, or ongoing)
          const activeBooking = myBookings.find(
            (b) =>
              (b.car?.id === carData._id || b.car?._id === carData._id) &&
              ["pending", "confirmed", "ongoing"].includes(b.status)
          );

          if (activeBooking) {
            setExistingBooking(activeBooking);
          }
        } catch (bookingError) {
          console.log("Could not check existing bookings:", bookingError);
        }
      }
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Could not load car details.",
        type: "error",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      showAlert({
        title: "Login Required",
        message: "Please log in to book a car.",
        type: "warning",
        buttons: [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/(auth)/login") },
        ],
      });
      return;
    }

    if (kycStatus !== "approved") {
      showAlert({
        title: "Verification Required",
        message: "You need a verified ID to rent cars.",
        type: "warning",
        buttons: [
          { text: "Cancel", style: "cancel" },
          { text: "Verify Now", onPress: () => router.push("/kyc") },
        ],
      });
      return;
    }

    router.push({
      pathname: "/(customer)/bookings/create",
      params: { carId: car._id },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
      </View>
    );
  }

  if (!car) return null;

  const photos =
    car.photos && car.photos.length > 0
      ? car.photos
      : ["https://via.placeholder.com/800x600.png?text=No+Image"];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* --- CAROUSEL --- */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const slide = Math.ceil(
                nativeEvent.contentOffset.x /
                  nativeEvent.layoutMeasurement.width
              );
              if (slide !== activeSlide) setActiveSlide(slide);
            }}
            scrollEventThrottle={16}
          >
            {photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: carService.getImageUrl(photo) }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent", "transparent"]}
            style={styles.topGradient}
          />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Dots Pagination */}
          <View style={styles.pagination}>
            {photos.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === activeSlide && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* --- CONTENT --- */}
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{car.make}</Text>
              <Text style={styles.model}>
                {car.model} {car.year}
              </Text>
            </View>
            <View style={styles.ratingBox}>
              <FontAwesome name="star" size={14} color={COLORS.gold[500]} />
              <Text style={styles.ratingText}>5.0</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={COLORS.gray[400]}
            />
            <Text style={styles.locationText}>
              {car.location?.address || "Location available after booking"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Specs */}
          <Text style={styles.sectionTitle}>Vehicle Specifications</Text>
          <View style={styles.specsGrid}>
            <SpecItem
              icon="car-shift-pattern"
              label="Gearbox"
              value={car.transmission}
            />
            <SpecItem
              icon="car-seat"
              label="Seats"
              value={`${car.seats} Seats`}
            />
            <SpecItem icon="gas-station" label="Fuel" value={car.fuelType} />
            <SpecItem icon="speedometer" label="Mileage" value="Unlimited" />
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {car.description ||
              "This car is well maintained and perfect for city drives or long weekend trips. Instant booking available."}
          </Text>

          {/* Availability */}
          {car.availability && (
            <>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.availabilityCard}>
                {/* Days */}
                <View style={styles.availabilityRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={COLORS.gold[500]}
                  />
                  <Text style={styles.availabilityLabel}>Available Days:</Text>
                </View>
                <View style={styles.daysContainer}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => {
                      const isAvailable = (
                        car.availability.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]
                      ).includes(index);
                      return (
                        <View
                          key={day}
                          style={[
                            styles.dayBadge,
                            isAvailable
                              ? styles.dayAvailable
                              : styles.dayUnavailable,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isAvailable
                                ? styles.dayTextAvailable
                                : styles.dayTextUnavailable,
                            ]}
                          >
                            {day}
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>

                {/* Time Range */}
                <View style={[styles.availabilityRow, { marginTop: 12 }]}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={COLORS.gold[500]}
                  />
                  <Text style={styles.availabilityLabel}>Available Time:</Text>
                  <Text style={styles.availabilityValue}>
                    {car.availability.startTime || "00:00"} -{" "}
                    {car.availability.endTime || "23:59"}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Host Info */}
          <Text style={styles.sectionTitle}>Hosted By</Text>
          <View style={styles.hostCard}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostInitials}>
                {car.owner?.fullName?.[0] || "H"}
              </Text>
            </View>
            <View>
              <Text style={styles.hostName}>
                {car.owner?.fullName || "Host"}
              </Text>
              <Text style={styles.hostSub}>Verified Host • Fast Responder</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- BOTTOM BAR --- */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPriceLabel}>Daily Rate</Text>
          <View style={styles.footerPriceRow}>
            <Text style={styles.footerCurrency}>PKR </Text>
            <Text style={styles.footerPrice}>{car.pricePerDay}</Text>
            <Text style={styles.footerPeriod}>/ day</Text>
          </View>
        </View>

        {existingBooking ? (
          // User already has an active booking for this car
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() =>
              router.push(`/(customer)/bookings/${existingBooking.id}`)
            }
          >
            <LinearGradient
              colors={[COLORS.blue[500], "#60A5FA"]}
              style={styles.gradientBtn}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.white}
              />
              <Text style={[styles.bookBtnText, { color: COLORS.white }]}>
                View Trip
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          // Normal Book Now button
          <TouchableOpacity style={styles.bookBtn} onPress={handleBookNow}>
            <LinearGradient
              colors={[COLORS.gold[500], "#FBBF24"]}
              style={styles.gradientBtn}
            >
              <Text style={styles.bookBtnText}>Book Now</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={COLORS.navy[900]}
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SpecItem({ icon, label, value }) {
  return (
    <View style={styles.specBox}>
      <MaterialCommunityIcons name={icon} size={24} color={COLORS.white} />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
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

  // Carousel
  carouselContainer: { height: 320, position: "relative" },
  carouselImage: { width: width, height: 320 },
  topGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 100 },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(10, 22, 40, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    width: "100%",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: COLORS.gold[500], width: 18 },

  // Content
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  model: { fontSize: 28, fontWeight: "700", color: COLORS.white, marginTop: 4 },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navy[800],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: { fontSize: 13, fontWeight: "700", color: COLORS.white },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  locationText: { color: COLORS.gray[400], fontSize: 14 },

  divider: { height: 1, backgroundColor: COLORS.navy[700], marginVertical: 24 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 16,
  },

  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  specBox: {
    width: "23%",
    backgroundColor: COLORS.navy[800],
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  specLabel: {
    fontSize: 10,
    color: COLORS.gray[400],
    marginTop: 8,
    fontWeight: "600",
  },
  specValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 2,
  },

  description: {
    fontSize: 14,
    color: COLORS.gray[400],
    lineHeight: 22,
    marginBottom: 32,
  },

  // Availability
  availabilityCard: {
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    marginBottom: 32,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  availabilityLabel: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: "600",
  },
  availabilityValue: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "700",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayAvailable: {
    backgroundColor: COLORS.gold[500] + "20",
    borderColor: COLORS.gold[500],
  },
  dayUnavailable: {
    backgroundColor: COLORS.navy[700],
    borderColor: COLORS.navy[600],
  },
  dayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dayTextAvailable: {
    color: COLORS.gold[500],
  },
  dayTextUnavailable: {
    color: COLORS.gray[500],
  },

  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gold[500],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  hostInitials: { color: COLORS.navy[900], fontSize: 18, fontWeight: "700" },
  hostName: { fontSize: 16, fontWeight: "700", color: COLORS.white },
  hostSub: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy[900],
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerPriceLabel: { fontSize: 12, color: COLORS.gray[400] },
  footerPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 2,
  },
  footerCurrency: { fontSize: 16, fontWeight: "600", color: COLORS.gold[500] },
  footerPrice: { fontSize: 24, fontWeight: "700", color: COLORS.white },
  footerPeriod: { fontSize: 14, color: COLORS.gray[400], marginLeft: 4 },

  bookBtn: { width: 160, borderRadius: 14, overflow: "hidden" },
  gradientBtn: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  bookBtnText: { color: COLORS.navy[900], fontSize: 16, fontWeight: "700" },
});
