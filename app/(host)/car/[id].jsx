// app/(host)/car/[id].jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import carService from '../../../services/carService';

const { width, height } = Dimensions.get('window');

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
  orange: {
    500: '#F97316',
  },
  red: {
    500: '#EF4444',
  },
  gray: {
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
  },
  white: '#FFFFFF',
};

export default function HostCarDetails() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const { id } = useLocalSearchParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const response = await carService.getCarById(id);
      setCar(response.data.car);
    } catch (error) {
      Alert.alert('Error', 'Could not load car details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Car', 'Are you sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await carService.deleteCar(id);
            Alert.alert('Deleted', 'Car removed from fleet.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Failed to delete.');
          }
        },
      },
    ]);
  };
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </View>
    );
  }

  if (!car) return null;

  const photos = car.photos && car.photos.length > 0
    ? car.photos
    : ['https://via.placeholder.com/800x600.png?text=No+Image'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const slide = Math.ceil(
                nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
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

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(10, 22, 40, 0.6)', 'transparent', 'transparent', 'rgba(10, 22, 40, 0.9)']}
            style={styles.imageOverlay}
          />

          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <View style={styles.backBtnInner}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.imageCounterGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="images" size={14} color={COLORS.navy[900]} />
              <Text style={styles.counterText}>
                {activeSlide + 1} / {photos.length}
              </Text>
            </LinearGradient>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadgeContainer}>
            {car.isActive ? (
              <LinearGradient
                colors={[COLORS.emerald[500], COLORS.emerald[400]]}
                style={styles.statusBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>LIVE</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.statusBadge, styles.statusInactive]}>
                <View style={[styles.statusDot, styles.statusDotInactive]} />
                <Text style={styles.statusText}>HIDDEN</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentContainer}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{car.make}</Text>
              <Text style={styles.model}>
                {car.model} {car.year}
              </Text>
            </View>
            <View style={styles.ratingBox}>
              <LinearGradient
                colors={[COLORS.gold[500], COLORS.gold[600]]}
                style={styles.ratingGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="star" size={14} color={COLORS.navy[900]} />
                <Text style={styles.ratingText}>4.9</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Plate Number */}
          <View style={styles.plateContainer}>
            <View style={styles.plateBox}>
              <Ionicons name="car" size={14} color={COLORS.gray[400]} />
              <Text style={styles.plateText}>{car.plateNumber}</Text>
            </View>
            <View style={styles.colorIndicator}>
              <View style={[styles.colorDot, { backgroundColor: car.color || COLORS.gray[500] }]} />
              <Text style={styles.colorText}>{car.color}</Text>
            </View>
          </View>

          {/* Price Row */}
          <View style={styles.priceCard}>
            <LinearGradient
              colors={[COLORS.navy[800], COLORS.navy[700]]}
              style={styles.priceCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Per Day</Text>
                <View style={styles.priceValueContainer}>
                  <Text style={styles.currency}>$</Text>
                  <Text style={styles.price}>{car.pricePerDay}</Text>
                </View>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Per Hour</Text>
                <View style={styles.priceValueContainer}>
                  <Text style={styles.currency}>$</Text>
                  <Text style={styles.price}>{car.pricePerHour}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Specs Grid */}
          <Text style={styles.sectionTitle}>Vehicle Specifications</Text>
          <View style={styles.specsGrid}>
            <SpecItem
              icon="car-shift-pattern"
              label="Transmission"
              value={car.transmission}
              gradient={['#3B82F6', '#2563EB']}
            />
            <SpecItem
              icon="car-seat"
              label="Seats"
              value={`${car.seats}`}
              gradient={[COLORS.emerald[500], '#059669']}
            />
            <SpecItem
              icon="gas-station"
              label="Fuel"
              value={car.fuelType}
              gradient={[COLORS.orange[500], '#EA580C']}
            />
            <SpecItem
              icon="speedometer"
              label="Mileage"
              value="Unlimited"
              gradient={['#8B5CF6', '#7C3AED']}
            />
          </View>

          {/* Description */}
          {car.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descriptionCard}>
                <Text style={styles.description}>{car.description}</Text>
              </View>
            </>
          )}

          {/* Location */}
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <View style={styles.locationCard}>
            <View style={styles.locIconBox}>
              <LinearGradient
                colors={[COLORS.gold[500], COLORS.gold[600]]}
                style={styles.locIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="location" size={24} color={COLORS.navy[900]} />
              </LinearGradient>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locLabel}>Pick-up & Return</Text>
              <Text style={styles.locText}>{car.location?.address || 'Address Hidden'}</Text>
            </View>
          </View>

          {/* Availability */}
          {car.availability && (
            <>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.availabilityCard}>
                <View style={styles.availabilityRow}>
                  <Ionicons name="time-outline" size={20} color={COLORS.gold[500]} />
                  <Text style={styles.availabilityText}>
                    {car.availability.startTime} - {car.availability.endTime}
                  </Text>
                </View>
                <View style={styles.availabilityRow}>
                  <Ionicons
                    name={car.availability.isAvailable ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={car.availability.isAvailable ? COLORS.emerald[500] : COLORS.red[500]}
                  />
                  <Text style={styles.availabilityText}>
                    {car.availability.isAvailable ? 'Available for booking' : 'Currently unavailable'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
          <View style={styles.deleteBtnInner}>
            <Ionicons name="trash-outline" size={22} color={COLORS.red[500]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/(host)/car/edit/${id}`)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.gold[500], COLORS.gold[600]]}
            style={styles.editGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.editBtnText}>Edit Vehicle</Text>
            <Ionicons name="create-outline" size={20} color={COLORS.navy[900]} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// 📦 SPEC ITEM COMPONENT
// ============================================
function SpecItem({ icon, label, value, gradient }) {
  return (
    <View style={styles.specBox}>
      <LinearGradient
        colors={gradient}
        style={styles.specIconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialCommunityIcons name={icon} size={24} color={COLORS.white} />
      </LinearGradient>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

// ============================================
// 💅 STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  loadingContainer: {
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

  // Carousel
  carouselContainer: {
    height: 360,
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: 360,
    backgroundColor: COLORS.navy[800],
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
  },
  backBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 22, 40, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  imageCounterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: {
    color: COLORS.navy[900],
    fontSize: 12,
    fontWeight: '800',
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusInactive: {
    backgroundColor: COLORS.navy[700],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  statusDotInactive: {
    backgroundColor: COLORS.gray[500],
  },
  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brand: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  model: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
  },
  ratingBox: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ratingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy[900],
  },

  // Plate & Color
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  plateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.navy[800],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  plateText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  colorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.navy[700],
  },
  colorText: {
    fontSize: 13,
    color: COLORS.gray[400],
    fontWeight: '600',
  },

  // Price Card
  priceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  priceCardGradient: {
    flexDirection: 'row',
    padding: 20,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gold[500],
    marginRight: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },
  priceDivider: {
    width: 1,
    backgroundColor: COLORS.navy[600],
    marginHorizontal: 20,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
    marginTop: 8,
  },

  // Specs Grid
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  specBox: {
    width: (width - 72) / 2,
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  specIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 11,
    color: COLORS.gray[400],
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Description
  descriptionCard: {
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  description: {
    fontSize: 14,
    color: COLORS.gray[400],
    lineHeight: 22,
  },

  // Location
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    marginBottom: 28,
  },
  locIconBox: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 14,
  },
  locIconGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locLabel: {
    fontSize: 11,
    color: COLORS.gray[500],
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Availability
  availabilityCard: {
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    gap: 12,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  availabilityText: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: '600',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy[900],
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {},
  deleteBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.navy[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.red[500] + '40',
  },
  editBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  editGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  editBtnText: {
    color: COLORS.navy[900],
    fontSize: 16,
    fontWeight: '700',
  },
});