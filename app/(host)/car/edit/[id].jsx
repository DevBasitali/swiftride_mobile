// app/(host)/car/edit/[id].jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import carService, { DAYS_OF_WEEK } from "../../../../services/carService";
import { useAlert } from "../../../../context/AlertContext";

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
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
  },
  emerald: {
    500: "#10B981",
  },
  gray: {
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
  },
  white: "#FFFFFF",
};

export default function EditCar() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const params = useLocalSearchParams();
  const id = params.id;
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    plateNumber: "",
    pricePerDay: "",
    pricePerHour: "",
    seats: "",
    transmission: "",
    fuelType: "",
    address: "",
    lat: 0,
    lng: 0,
    description: "",
    availability: {
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
      isAvailable: true,
    },
    // Insurance fields
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceType: "",
    insuranceStartDate: "",
    insuranceExpiryDate: "",
    // Features
    features: [],
  });

  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    loadCarData();
  }, [id]);

  const loadCarData = async () => {
    try {
      const response = await carService.getCarById(id);
      const car = response.data.car;

      setForm({
        make: car.make,
        model: car.model,
        year: String(car.year),
        color: car.color,
        plateNumber: car.plateNumber,
        pricePerDay: String(car.pricePerDay),
        pricePerHour: String(car.pricePerHour),
        seats: String(car.seats),
        transmission: car.transmission,
        fuelType: car.fuelType,
        address: car.location?.address || "",
        lat: car.location?.lat || 0,
        lng: car.location?.lng || 0,
        description: car.description || "",
        availability: {
          daysOfWeek: car.availability?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
          startTime: car.availability?.startTime || "00:00",
          endTime: car.availability?.endTime || "23:59",
          isAvailable:
            car.availability?.isAvailable !== undefined
              ? car.availability.isAvailable
              : true,
        },
        insuranceProvider: car.insuranceDetails?.provider || "",
        insurancePolicyNumber: car.insuranceDetails?.policyNumber || "",
        insuranceType: car.insuranceDetails?.type || "",
        insuranceStartDate: car.insuranceDetails?.startDate?.split('T')[0] || "",
        insuranceExpiryDate: car.insuranceDetails?.expiryDate?.split('T')[0] || "",
        features: car.features || [],
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Could not load car details",
        type: "error",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // If returning from location picker, update form with new location
  useEffect(() => {
    if (params.address) {
      setForm((prev) => ({
        ...prev,
        address: params.address,
        lat: parseFloat(params.lat) || 0,
        lng: parseFloat(params.lng) || 0,
      }));
    }
  }, [params.address]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setSubmitting(true);

    try {
      const payload = {
        make: form.make,
        model: form.model,
        year: Number(form.year),
        color: form.color,
        plateNumber: form.plateNumber,
        pricePerDay: Number(form.pricePerDay),
        pricePerHour: Number(form.pricePerHour),
        seats: Number(form.seats),
        transmission: form.transmission,
        fuelType: form.fuelType,
        description: form.description,
        location: {
          address: form.address,
          lat: form.lat,
          lng: form.lng,
        },
        availability: {
          daysOfWeek: form.availability.daysOfWeek,
          startTime: form.availability.startTime,
          endTime: form.availability.endTime,
          isAvailable: form.availability.isAvailable,
        },
        insuranceDetails: {
          provider: form.insuranceProvider,
          policyNumber: form.insurancePolicyNumber,
          type: form.insuranceType,
          startDate: form.insuranceStartDate,
          expiryDate: form.insuranceExpiryDate,
        },
        features: form.features,
      };

      await carService.updateCar(id, payload);

      showAlert({
        title: "Success",
        message: "Car updated successfully!",
        type: "success",
        buttons: [
          { text: "OK", onPress: () => router.push("/(host)/(tabs)/fleet") },
        ],
      });
    } catch (error) {
      console.log("Update Error:", error);
      showAlert({
        title: "Error",
        message: "Failed to update car.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
        <Text style={styles.loadingText}>Loading vehicle data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Edit Vehicle</Text>
            <Text style={styles.headerSubtitle}>Update car details</Text>
          </View>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Info */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="car-sport" size={20} color={COLORS.white} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <Text style={styles.sectionSubtitle}>Vehicle details</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Input
                flex
                label="Make"
                value={form.make}
                onChangeText={(t) => handleInputChange("make", t)}
                icon="car-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Model"
                value={form.model}
                onChangeText={(t) => handleInputChange("model", t)}
                icon="car-sport-outline"
              />
            </View>

            <View style={styles.row}>
              <Input
                flex
                label="Year"
                value={form.year}
                keyboardType="numeric"
                onChangeText={(t) => handleInputChange("year", t)}
                icon="calendar-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Color"
                value={form.color}
                onChangeText={(t) => handleInputChange("color", t)}
                icon="color-palette-outline"
              />
            </View>

            <Input
              label="Plate Number"
              value={form.plateNumber}
              onChangeText={(t) => handleInputChange("plateNumber", t)}
              icon="card-outline"
            />
          </View>

          {/* Pricing */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={[COLORS.emerald[500], "#059669"]}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="cash" size={20} color={COLORS.white} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <Text style={styles.sectionSubtitle}>Update rates</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Input
                flex
                label="Price Per Day"
                value={form.pricePerDay}
                keyboardType="numeric"
                onChangeText={(t) => handleInputChange("pricePerDay", t)}
                prefix="Rs"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Price Per Hour"
                value={form.pricePerHour}
                keyboardType="numeric"
                onChangeText={(t) => handleInputChange("pricePerHour", t)}
                prefix="Rs"
              />
            </View>
          </View>

          {/* Specifications */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={["#8B5CF6", "#7C3AED"]}
                  style={styles.sectionIconGradient}
                >
                  <MaterialCommunityIcons
                    name="car-info"
                    size={20}
                    color={COLORS.white}
                  />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Specifications</Text>
                <Text style={styles.sectionSubtitle}>Technical details</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Input
                flex
                label="Transmission"
                value={form.transmission}
                onChangeText={(t) => handleInputChange("transmission", t)}
                icon="settings-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Fuel Type"
                value={form.fuelType}
                onChangeText={(t) => handleInputChange("fuelType", t)}
                icon="water-outline"
              />
            </View>

            <Input
              label="Seats"
              value={form.seats}
              keyboardType="numeric"
              onChangeText={(t) => handleInputChange("seats", t)}
              icon="people-outline"
            />
          </View>

          {/* ============================================ */}
          {/* 🆕 AVAILABILITY SECTION - ADDED */}
          {/* ============================================ */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={[COLORS.emerald[500], "#059669"]}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="time" size={20} color={COLORS.white} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Availability</Text>
                <Text style={styles.sectionSubtitle}>Update booking hours</Text>
              </View>
            </View>

            {/* Available Toggle */}
            <View style={styles.availabilityToggleContainer}>
              <View>
                <Text style={styles.availabilityToggleLabel}>
                  Accept Bookings
                </Text>
                <Text style={styles.availabilityToggleSubtext}>
                  {form.availability.isAvailable
                    ? "Car is available for rent"
                    : "Car is not available"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  form.availability.isAvailable && styles.toggleSwitchActive,
                ]}
                onPress={() =>
                  handleInputChange("availability", {
                    ...form.availability,
                    isAvailable: !form.availability.isAvailable,
                  })
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    form.availability.isAvailable && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Time Slots */}
            <View style={styles.row}>
              <Input
                flex
                label="Start Time"
                placeholder="09:00"
                value={form.availability.startTime}
                onChangeText={(t) =>
                  handleInputChange("availability", {
                    ...form.availability,
                    startTime: t,
                  })
                }
                icon="time-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="End Time"
                placeholder="17:00"
                value={form.availability.endTime}
                onChangeText={(t) =>
                  handleInputChange("availability", {
                    ...form.availability,
                    endTime: t,
                  })
                }
                icon="time-outline"
              />
            </View>

            {/* Days of Week */}
            <Text style={styles.label}>Available Days</Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayButton,
                    form.availability.daysOfWeek.includes(day.value) &&
                    styles.dayButtonActive,
                  ]}
                  onPress={() => {
                    const currentDays = form.availability.daysOfWeek || [];
                    const newDays = currentDays.includes(day.value)
                      ? currentDays.filter((d) => d !== day.value)
                      : [...currentDays, day.value];

                    handleInputChange("availability", {
                      ...form.availability,
                      daysOfWeek: newDays,
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      form.availability.daysOfWeek.includes(day.value) &&
                      styles.dayButtonTextActive,
                    ]}
                  >
                    {day.label.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Insurance Details */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={["#EC4899", "#DB2777"]}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Insurance Details</Text>
                <Text style={styles.sectionSubtitle}>Coverage information</Text>
              </View>
            </View>

            <Input
              label="Insurance Provider"
              value={form.insuranceProvider}
              onChangeText={(t) => handleInputChange("insuranceProvider", t)}
              icon="business-outline"
            />
            <Input
              label="Policy Number"
              value={form.insurancePolicyNumber}
              onChangeText={(t) => handleInputChange("insurancePolicyNumber", t)}
              icon="document-outline"
            />

            {/* Insurance Type Selector */}
            <Text style={styles.label}>Insurance Type</Text>
            <View style={[styles.row, { marginBottom: 15 }]}>
              {['Third-Party', 'Comprehensive'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dayButton,
                    form.insuranceType === type && styles.dayButtonActive,
                  ]}
                  onPress={() => handleInputChange('insuranceType', type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      form.insuranceType === type && styles.dayButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <Input
                flex
                label="Start Date"
                placeholder="YYYY-MM-DD"
                value={form.insuranceStartDate}
                onChangeText={(t) => handleInputChange("insuranceStartDate", t)}
                icon="calendar-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Expiry Date"
                placeholder="YYYY-MM-DD"
                value={form.insuranceExpiryDate}
                onChangeText={(t) => handleInputChange("insuranceExpiryDate", t)}
                icon="calendar-outline"
              />
            </View>
          </View>

          {/* Features */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={["#14B8A6", "#0D9488"]}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="list" size={20} color={COLORS.white} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Features</Text>
                <Text style={styles.sectionSubtitle}>AC, Bluetooth, GPS, etc.</Text>
              </View>
            </View>

            <View style={[styles.row, { marginBottom: 15 }]}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Add Feature"
                  value={featureInput}
                  onChangeText={setFeatureInput}
                  placeholder="e.g. Bluetooth"
                  icon="add-circle-outline"
                />
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.gold[500],
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  marginLeft: 10,
                  alignSelf: 'flex-end',
                  marginBottom: 15,
                  height: 48,
                }}
                onPress={() => {
                  const trimmed = featureInput.trim();
                  if (trimmed && !form.features.includes(trimmed)) {
                    handleInputChange('features', [...form.features, trimmed]);
                    setFeatureInput('');
                  }
                }}
              >
                <Text style={{ color: COLORS.navy[900], fontWeight: '700', fontSize: 14 }}>Add</Text>
              </TouchableOpacity>
            </View>

            {form.features.length > 0 && (
              <View style={styles.daysContainer}>
                {form.features.map((feat, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dayButton, styles.dayButtonActive, { flexDirection: 'row', gap: 6 }]}
                    onPress={() => handleInputChange('features', form.features.filter((_, i) => i !== idx))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayButtonText, styles.dayButtonTextActive]}>{feat}</Text>
                    <Ionicons name="close-circle" size={16} color={COLORS.gold[500]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={["#F97316", "#EA580C"]}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="location" size={20} color={COLORS.white} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Location & Details</Text>
                <Text style={styles.sectionSubtitle}>Additional info</Text>
              </View>
            </View>

            <Text style={styles.label}>Location</Text>

            <TouchableOpacity
              style={styles.locationInputBtn}
              onPress={() => {
                router.push({
                  pathname: '/(host)/car/location-picker',
                  params: {
                    formState: JSON.stringify(form),
                    // Not passing images since edit doesn't handle them the same way as create right now
                  },
                });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.locationInputContent}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.gray[400]}
                />
                <Text
                  style={[
                    styles.locationInputText,
                    !form.address && styles.locationPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {form.address || 'Select Vehicle Location'}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.gray[400]}
                style={styles.locationActionIcon}
              />
            </TouchableOpacity>
            <Input
              label="Description"
              value={form.description}
              onChangeText={(t) => handleInputChange("description", t)}
              multiline
              icon="document-text-outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              submitting
                ? [COLORS.gray[600], COLORS.gray[600]]
                : [COLORS.gold[500], COLORS.gold[600]]
            }
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.navy[900]} />
            ) : (
              <>
                <Text style={styles.submitText}>Save Changes</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.navy[900]}
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// 📦 INPUT COMPONENT
// ============================================
function Input({
  label,
  value,
  onChangeText,
  keyboardType,
  flex,
  multiline,
  icon,
  prefix,
  placeholder,
}) {
  return (
    <View style={[styles.inputContainer, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          multiline && { height: 100, alignItems: "flex-start" },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={COLORS.gray[500]}
            style={styles.inputIconLeft}
          />
        )}
        {prefix && <Text style={styles.inputPrefix}>{prefix}</Text>}
        <TextInput
          style={[
            styles.input,
            multiline && {
              height: 90,
              textAlignVertical: "top",
              paddingTop: 10,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          placeholderTextColor={COLORS.gray[500]}
          placeholder={placeholder}
        />
      </View>
    </View>
  );
}

// ============================================
// 💅 STYLES
// ============================================
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[900],
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.gray[400],
    fontSize: 14,
  },

  // Header
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },

  // Content
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
    padding: 20,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionIconContainer: {
    marginRight: 14,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionIconGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 2,
  },

  // Inputs
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray[400],
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIconLeft: {
    marginRight: 10,
  },
  inputPrefix: {
    fontSize: 16,
    color: COLORS.gray[400],
    marginRight: 6,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "500",
  },

  // Availability Toggle
  availabilityToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  availabilityToggleLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  availabilityToggleSubtext: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  toggleSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.navy[600],
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.emerald[500],
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  // Days of Week
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    flex: 1,
    minWidth: 45,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.navy[700],
    borderWidth: 1.5,
    borderColor: COLORS.navy[600],
    alignItems: "center",
  },
  dayButtonActive: {
    backgroundColor: COLORS.gold[500] + "20",
    borderColor: COLORS.gold[500],
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray[400],
  },
  dayButtonTextActive: {
    color: COLORS.gold[500],
    fontWeight: "700",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy[900],
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
  },
  submitBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitText: {
    color: COLORS.navy[900],
    fontSize: 16,
    fontWeight: "700",
  },

  // Location Button
  locationInputBtn: {
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  locationInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  locationInputText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '500',
    flex: 1,
  },
  locationPlaceholder: {
    color: COLORS.gray[400],
  },
  locationActionIcon: {
    marginLeft: 8,
  },
});
