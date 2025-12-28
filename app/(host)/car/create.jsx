// app/(host)/car/create.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import carService, { DAYS_OF_WEEK } from '../../../services/carService';
import { useAlert } from '../../../context/AlertContext';
import TimePicker from '../../../components/TimePicker';

const { width } = Dimensions.get('window');

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
    400: '#34D399',
  },
  gray: {
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
  },
  white: '#FFFFFF',
  red: {
    500: '#EF4444',
  },
};

export default function CreateCar() {
  // ============================================
  // 🔒 STATE
  // ============================================
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const { showAlert } = useAlert();
  const placesRef = useRef(null);
  const [showPlacesList, setShowPlacesList] = useState(false);

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    plateNumber: '',
    pricePerDay: '',
    pricePerHour: '',
    seats: '',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    address: '',
    description: '',
    lat: 0,
    lng: 0,
    availability: {
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    },
  });

  useEffect(() => {
    // Restore form state if coming back from location picker
    if (params.formState) {
      try {
        const restoredForm = JSON.parse(params.formState);
        setForm({
          ...restoredForm,
          address: params.address || restoredForm.address,
          lat: params.lat ? parseFloat(params.lat) : restoredForm.lat,
          lng: params.lng ? parseFloat(params.lng) : restoredForm.lng,
        });
      } catch (e) {
        console.log('Error restoring form state:', e);
      }
    } else if (params.address && params.address !== form.address) {
      // Fallback for direct address params
      setForm((prev) => ({
        ...prev,
        address: params.address,
        lat: parseFloat(params.lat),
        lng: parseFloat(params.lng),
      }));
    }

    // Restore images if coming back from location picker
    if (params.imageUris) {
      try {
        const uris = JSON.parse(params.imageUris);
        setImages(uris.map(uri => ({ uri })));
      } catch (e) {
        console.log('Error restoring images:', e);
      }
    }
  }, [params.formState, params.address, params.lat, params.lng, params.imageUris]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.7,
      });

      if (!result.canceled) {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
        const validImages = result.assets.filter((asset) => {
          const size = asset.fileSize || 0;
          return size <= MAX_SIZE;
        });

        if (validImages.length < result.assets.length) {
          showAlert({
            title: "File Too Large",
            message: "Some images were skipped because they exceed the 5MB limit.",
            type: "warning"
          });
        }

        setImages([...images, ...validImages]);
      }
    } catch (error) {
      showAlert({ title: "Error", message: "Could not open gallery.", type: "error" });
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (
      !form.make ||
      !form.model ||
      !form.pricePerDay ||
      !form.address ||
      images.length === 0
    ) {
      showAlert({
        title: "Missing Fields",
        message: "Please fill in all required fields and add at least one photo.",
        type: "warning"
      });
      return;
    }

    // Validate location has proper coordinates
    if (!form.lat || !form.lng || (form.lat === 0 && form.lng === 0)) {
      showAlert({
        title: "Invalid Location",
        message: "Please select a location from the search suggestions or use the map picker to set proper coordinates.",
        type: "warning"
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('make', form.make.trim());
      formData.append('model', form.model.trim());
      formData.append('year', form.year.trim());
      formData.append('color', form.color.trim());
      formData.append('plateNumber', form.plateNumber.trim());
      formData.append('pricePerDay', form.pricePerDay.trim());
      formData.append('pricePerHour', form.pricePerHour.trim());
      formData.append('seats', form.seats.toString().trim());
      formData.append('transmission', form.transmission);
      formData.append('fuelType', form.fuelType);

      formData.append('locationAddress', form.address.trim());
      formData.append('locationLat', form.lat.toString());
      formData.append('locationLng', form.lng.toString());

      formData.append('availabilityStartTime', form.availability.startTime);
      formData.append('availabilityEndTime', form.availability.endTime);
      formData.append('availabilityIsAvailable', form.availability.isAvailable.toString());
      formData.append('availabilityDaysOfWeek', JSON.stringify(form.availability.daysOfWeek));

      if (form.description && form.description.trim()) {
        formData.append('description', form.description.trim());
      }

      images.forEach((img, index) => {
        const uriParts = img.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('photos', {
          uri: img.uri,
          name: `photo_${index}.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      });

      await carService.createCar(formData);

      showAlert({
        title: "Success",
        message: "Car Listed Successfully!",
        type: "success",
        buttons: [{ text: "OK", onPress: () => router.replace('/(host)/(tabs)/fleet') }]
      });
    } catch (error) {
      console.log('Create Error:', error);
      showAlert({
        title: "Error",
        message: error?.response?.data?.message || "Failed to create listing.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const requiredFields = [
    form.make,
    form.model,
    form.year,
    form.color,
    form.plateNumber,
    form.pricePerDay,
    form.pricePerHour,
    form.seats,
    form.address,
    images.length > 0,
  ];
  const completedFields = requiredFields.filter(Boolean).length;
  const progress = (completedFields / requiredFields.length) * 100;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.header}
      >
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>List Your Car</Text>
            <Text style={styles.headerSubtitle}>Fill in the details below</Text>
          </View>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[400]]}
              style={[styles.progressBarFill, { width: `${progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Photos Section */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={[COLORS.gold[500], COLORS.gold[600]]}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="images" size={20} color={COLORS.navy[900]} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Car Photos</Text>
                <Text style={styles.sectionSubtitle}>
                  {images.length}/5 photos added
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoRow}
            >
              <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
                <LinearGradient
                  colors={[COLORS.navy[700], COLORS.navy[600]]}
                  style={styles.addPhotoGradient}
                >
                  <Ionicons name="camera" size={32} color={COLORS.gold[500]} />
                  <Text style={styles.addPhotoText}>Add Photos</Text>
                  <Text style={styles.addPhotoSubtext}>Up to 5 images</Text>
                </LinearGradient>
              </TouchableOpacity>

              {images.map((img, index) => (
                <View key={index} style={styles.thumbContainer}>
                  <Image source={{ uri: img.uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.red[500]} />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

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
                placeholder="Toyota"
                value={form.make}
                onChangeText={(t) => handleInputChange('make', t)}
                icon="car-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Model"
                placeholder="Camry"
                value={form.model}
                onChangeText={(t) => handleInputChange('model', t)}
                icon="car-sport-outline"
              />
            </View>

            <View style={styles.row}>
              <Input
                flex
                label="Year"
                placeholder="2024"
                keyboardType="numeric"
                value={form.year}
                onChangeText={(t) => handleInputChange('year', t)}
                icon="calendar-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Color"
                placeholder="Silver"
                value={form.color}
                onChangeText={(t) => handleInputChange('color', t)}
                icon="color-palette-outline"
              />
            </View>

            <Input
              label="Plate Number"
              placeholder="ABC-123"
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
                <Text style={styles.sectionSubtitle}>Set your rates</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Input
                flex
                label="Price Per Day"
                placeholder="15000"
                keyboardType="numeric"
                value={form.pricePerDay}
                onChangeText={(t) => handleInputChange('pricePerDay', t)}
                prefix="Rs"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Price Per Hour"
                placeholder="2000"
                keyboardType="numeric"
                value={form.pricePerHour}
                onChangeText={(t) => handleInputChange('pricePerHour', t)}
                prefix="Rs"
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

            <Text style={styles.label}>Transmission</Text>
            <View style={styles.row}>
              <SelectButton
                label="Automatic"
                icon="car-shift-pattern"
                selected={form.transmission === 'Automatic'}
                onPress={() => handleInputChange('transmission', 'Automatic')}
              />
              <View style={{ width: 10 }} />
              <SelectButton
                label="Manual"
                icon="car-clutch"
                selected={form.transmission === 'Manual'}
                onPress={() => handleInputChange('transmission', 'Manual')}
              />
            </View>

            <View style={{ height: 15 }} />

            <View style={styles.row}>
              <Input
                flex
                label="Fuel Type"
                placeholder="Petrol"
                value={form.fuelType}
                onChangeText={(t) => handleInputChange('fuelType', t)}
                icon="water-outline"
              />
              <View style={{ width: 15 }} />
              <Input
                flex
                label="Seats"
                placeholder="4"
                keyboardType="numeric"
                value={form.seats}
                onChangeText={(t) => handleInputChange('seats', t)}
                icon="people-outline"
              />
            </View>
          </View>

          {/* Availability */}
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
                <Text style={styles.sectionSubtitle}>Set booking hours</Text>
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
              <TimePicker
                label="Start Time"
                value={form.availability.startTime}
                onChange={(t) =>
                  handleInputChange('availability', {
                    ...form.availability,
                    startTime: t,
                  })
                }
                icon="sunny-outline"
              />
              <View style={{ width: 15 }} />
              <TimePicker
                label="End Time"
                value={form.availability.endTime}
                onChange={(t) =>
                  handleInputChange('availability', {
                    ...form.availability,
                    endTime: t,
                  })
                }
                icon="moon-outline"
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

          {/* Location & Description */}
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
                <Text style={styles.sectionSubtitle}>Pickup location</Text>
              </View>
            </View>

            <Text style={styles.label}>Location</Text>

            <View style={{ marginBottom: 15, zIndex: 100 }}>
              <GooglePlacesAutocomplete
                ref={placesRef}
                placeholder={"Search location..."}
                fetchDetails={true}
                enablePoweredByContainer={false}
                disableScroll={true}
                listViewDisplayed={showPlacesList}
                textInputProps={{
                  value: form.address,
                  onChangeText: (text) => {
                    handleInputChange('address', text);
                    setShowPlacesList(text.length >= 2);
                  },
                  onFocus: () => setShowPlacesList(form.address.length >= 2),
                  onBlur: () => setTimeout(() => setShowPlacesList(false), 200),
                  placeholderTextColor: COLORS.gray[400],
                  style: {
                    color: COLORS.white,
                    fontSize: 15,
                    flex: 1,
                  }
                }}
                onPress={(data, details = null) => {
                  if (details) {
                    const addr = data.description;
                    const lat = details.geometry.location.lat;
                    const lng = details.geometry.location.lng;

                    handleInputChange('address', addr);
                    handleInputChange('lat', lat);
                    handleInputChange('lng', lng);

                    // Close the list
                    setShowPlacesList(false);
                    placesRef.current?.setAddressText(addr);
                  }
                  // Dismiss keyboard
                  Keyboard.dismiss();
                }}
                query={{
                  key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                  language: 'en',
                }}
                onFail={(error) => console.error("Google Places Error:", error)}
                onNotFound={() => console.log("Google Places: No results found")}
                debounce={300}
                minLength={2}
                renderRightButton={() => (
                  <TouchableOpacity
                    style={styles.mapIconButton}
                    onPress={() => {
                      router.push({
                        pathname: '/(host)/car/location-picker',
                        params: {
                          formState: JSON.stringify(form),
                          imageUris: JSON.stringify(images.map(img => img.uri)),
                        },
                      });
                    }}
                  >
                    <Ionicons name="map" size={20} color={COLORS.navy[900]} />
                  </TouchableOpacity>
                )}
                styles={{
                  container: {
                    flex: 0,
                  },
                  textInputContainer: {
                    backgroundColor: COLORS.navy[700],
                    borderWidth: 1,
                    borderColor: COLORS.navy[600],
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    height: 54,
                  },
                  textInput: {
                    backgroundColor: 'transparent',
                    color: COLORS.white,
                    fontSize: 15,
                    height: 54,
                  },
                  listView: {
                    position: 'absolute',
                    top: 60,
                    left: 0,
                    right: 0,
                    backgroundColor: COLORS.navy[800],
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: COLORS.navy[600],
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    zIndex: 9999, // Ensure it sits on top
                  },
                  row: {
                    backgroundColor: 'transparent',
                    padding: 13,
                    height: 44,
                    flexDirection: 'row',
                  },
                  description: {
                    color: COLORS.white,
                    fontSize: 14,
                  },
                  separator: {
                    height: 0.5,
                    backgroundColor: COLORS.navy[600],
                  },
                }}
              />
            </View>

            <View style={{ height: 15 }} />
            <Input
              label="Description (Optional)"
              placeholder="Describe your car..."
              value={form.description}
              onChangeText={(t) => handleInputChange('description', t)}
              multiline
            // icon="document-text-outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              loading
                ? [COLORS.gray[600], COLORS.gray[600]]
                : [COLORS.gold[500], COLORS.gold[600]]
            }
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.navy[900]} />
            ) : (
              <>
                <Text style={styles.submitText}>List Car Now</Text>
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
// 📦 HELPER COMPONENTS
// ============================================

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  flex,
  multiline,
  icon,
  prefix,
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
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

function SelectButton({ label, icon, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.selectBtn, selected && styles.selectBtnActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selected ? (
        <LinearGradient
          colors={[COLORS.gold[500], COLORS.gold[600]]}
          style={styles.selectBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <MaterialCommunityIcons name={icon} size={20} color={COLORS.navy[900]} />
          <Text style={styles.selectTextActive}>{label}</Text>
        </LinearGradient>
      ) : (
        <>
          <MaterialCommunityIcons name={icon} size={20} color={COLORS.gray[500]} />
          <Text style={styles.selectText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
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

  // Progress Bar
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.navy[700],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.gold[500],
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 6,
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

  // Photos
  photoRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  addPhotoBtn: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
  },
  addPhotoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.navy[600],
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  addPhotoText: {
    fontSize: 13,
    color: COLORS.gold[500],
    marginTop: 8,
    fontWeight: '700',
  },
  addPhotoSubtext: {
    fontSize: 10,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  thumbContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: COLORS.navy[700],
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: COLORS.navy[900],
    fontWeight: '700',
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

  // Select Button
  selectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.navy[600],
    alignItems: 'center',
    backgroundColor: COLORS.navy[700],
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  selectBtnActive: {
    borderColor: COLORS.gold[500],
    backgroundColor: 'transparent',
  },
  selectBtnGradient: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
  },
  selectText: {
    color: COLORS.gray[400],
    fontWeight: '600',
    fontSize: 14,
  },
  selectTextActive: {
    color: COLORS.navy[900],
    fontWeight: '700',
    fontSize: 14,
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

  // Location Button
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navy[700],
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    borderRadius: 12,
    padding: 14,
  },
  locText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  locPlaceholder: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  coordText: {
    fontSize: 11,
    color: COLORS.emerald[500],
    marginTop: 4,
    fontWeight: '600',
  },
  mapIconBox: {
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 12,
  },
  mapIconGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.gold[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
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