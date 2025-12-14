// app/(host)/car/edit/[id].jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import carService, { DAYS_OF_WEEK } from '../../../../services/carService';

// ============================================
// 🎨 INLINE THEME COLORS
// ============================================
const COLORS = {
  navy: {
    900: '#0A1628',
    800: '#0F2137',
    700: '#152A46',
    600: '#1E3A5F',
  },
  gold: {
    600: '#D99413',
    500: '#F59E0B',
    400: '#FBBF24',
  },
  emerald: {
    500: '#10B981',
  },
  gray: {
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
  },
  white: '#FFFFFF',
};

export default function EditCar() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    plateNumber: '',
    pricePerDay: '',
    pricePerHour: '',
    seats: '',
    transmission: '',
    fuelType: '',
    address: '',
    description: '',
    availability: {
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startTime: '00:00',
      endTime: '23:59',
      isAvailable: true,
    },
  });

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
        address: car.location?.address || '',
        description: car.description || '',
        availability: {
          daysOfWeek: car.availability?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
          startTime: car.availability?.startTime || '00:00',
          endTime: car.availability?.endTime || '23:59',
          isAvailable: car.availability?.isAvailable !== undefined ? car.availability.isAvailable : true,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Could not load car details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

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
          lat: 0,
          lng: 0,
        },
        availability: {
          daysOfWeek: form.availability.daysOfWeek,
          startTime: form.availability.startTime,
          endTime: form.availability.endTime,
          isAvailable: form.availability.isAvailable,
        },
      };

      await carService.updateCar(id, payload);

      Alert.alert('Success', 'Car updated successfully!', [
        { text: 'OK', onPress: () => router.push('/(host)/(tabs)/fleet') },
      ]);
    } catch (error) {
      console.log('Update Error:', error);
      Alert.alert('Error', 'Failed to update car.');
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
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  colors={['#3B82F6', '#2563EB']}
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
                onChangeText={(t) => handleInputChange('make', t)}
                icon="car-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Model"
                value={form.model}
                onChangeText={(t) => handleInputChange('model', t)}
                icon="car-sport-outline"
              />
            </View>

            <View style={styles.row}>
              <Input
                flex
                label="Year"
                value={form.year}
                keyboardType="numeric"
                onChangeText={(t) => handleInputChange('year', t)}
                icon="calendar-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Color"
                value={form.color}
                onChangeText={(t) => handleInputChange('color', t)}
                icon="color-palette-outline"
              />
            </View>

            <Input
              label="Plate Number"
              value={form.plateNumber}
              onChangeText={(t) => handleInputChange('plateNumber', t)}
              icon="card-outline"
            />
          </View>

          {/* Pricing */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={[COLORS.emerald[500], '#059669']}
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
                onChangeText={(t) => handleInputChange('pricePerDay', t)}
                prefix="$"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Price Per Hour"
                value={form.pricePerHour}
                keyboardType="numeric"
                onChangeText={(t) => handleInputChange('pricePerHour', t)}
                prefix="$"
              />
            </View>
          </View>

          {/* Specifications */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.sectionIconGradient}
                >
                  <MaterialCommunityIcons name="car-info" size={20} color={COLORS.white} />
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
                onChangeText={(t) => handleInputChange('transmission', t)}
                icon="car-shift-pattern"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Fuel Type"
                value={form.fuelType}
                onChangeText={(t) => handleInputChange('fuelType', t)}
                icon="water-outline"
              />
            </View>

            <Input
              label="Seats"
              value={form.seats}
              keyboardType="numeric"
              onChangeText={(t) => handleInputChange('seats', t)}
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
                  colors={[COLORS.emerald[500], '#059669']}
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
                <Text style={styles.availabilityToggleLabel}>Accept Bookings</Text>
                <Text style={styles.availabilityToggleSubtext}>
                  {form.availability.isAvailable ? 'Car is available for rent' : 'Car is not available'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  form.availability.isAvailable && styles.toggleSwitchActive,
                ]}
                onPress={() =>
                  handleInputChange('availability', {
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
                  handleInputChange('availability', {
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
                  handleInputChange('availability', {
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
                    form.availability.daysOfWeek.includes(day.value) && styles.dayButtonActive,
                  ]}
                  onPress={() => {
                    const currentDays = form.availability.daysOfWeek || [];
                    const newDays = currentDays.includes(day.value)
                      ? currentDays.filter((d) => d !== day.value)
                      : [...currentDays, day.value];
                    
                    handleInputChange('availability', {
                      ...form.availability,
                      daysOfWeek: newDays,
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      form.availability.daysOfWeek.includes(day.value) && styles.dayButtonTextActive,
                    ]}
                  >
                    {day.label.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Details */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={['#F97316', '#EA580C']}
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

            <Input
              label="Location Address"
              value={form.address}
              onChangeText={(t) => handleInputChange('address', t)}
              icon="location-outline"
            />
            <Input
              label="Description"
              value={form.description}
              onChangeText={(t) => handleInputChange('description', t)}
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
                <Ionicons name="checkmark-circle" size={22} color={COLORS.navy[900]} />
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
          multiline && { height: 100, alignItems: 'flex-start' },
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
            multiline && { height: 90, textAlignVertical: 'top', paddingTop: 10 },
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
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    marginRight: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionIconGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 2,
  },

  // Inputs
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[400],
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '500',
  },

  // Availability Toggle
  availabilityToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.navy[700],
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  availabilityToggleLabel: {
    fontSize: 15,
    fontWeight: '700',
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
    justifyContent: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  // Days of Week
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: COLORS.gold[500] + '20',
    borderColor: COLORS.gold[500],
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[400],
  },
  dayButtonTextActive: {
    color: COLORS.gold[500],
    fontWeight: '700',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy[900],
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
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
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitText: {
    color: COLORS.navy[900],
    fontSize: 16,
    fontWeight: '700',
  },
});