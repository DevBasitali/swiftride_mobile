import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import carService from '../../../services/carService';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function CustomerCarDetails() {
  const { id } = useLocalSearchParams();
  const { user, kycStatus } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const response = await carService.getCarById(id);
      // Handle both response structures just in case
      setCar(response.data?.car || response.car);
    } catch (error) {
      Alert.alert('Error', 'Could not load car details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    // 1. Check Login
    if (!user) {
      Alert.alert('Login Required', 'Please log in to book a car.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    // 2. Check KYC
    if (kycStatus !== 'approved') {
      Alert.alert('Verification Required', 'You need a verified ID to rent cars.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify Now', onPress: () => router.push('/kyc') }
      ]);
      return;
    }

    // 3. Go to Booking Checkout Screen (We will build this next)
    router.push({
     pathname: '/(customer)/bookings/create',
      params: { carId: car._id }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#141E30" />
      </View>
    );
  }

  if (!car) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* --- CAROUSEL --- */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const slide = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
              if (slide !== activeSlide) setActiveSlide(slide);
            }}
            scrollEventThrottle={16}
          >
            {car.photos && car.photos.length > 0 ? (
              car.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: carService.getImageUrl(photo) }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image source={{ uri: 'https://via.placeholder.com/800x600.png?text=No+Image' }} style={styles.carouselImage} />
            )}
          </ScrollView>
          
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent']} style={styles.topGradient} />
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Dots Pagination */}
          <View style={styles.pagination}>
            {car.photos?.map((_, index) => (
              <View key={index} style={[styles.dot, index === activeSlide && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* --- CONTENT --- */}
        <View style={styles.contentContainer}>
          
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{flex: 1}}>
              <Text style={styles.brand}>{car.make}</Text>
              <Text style={styles.model}>{car.model} {car.year}</Text>
            </View>
            <View style={styles.ratingBox}>
              <FontAwesome name="star" size={16} color="#F5A623" />
              <Text style={styles.ratingText}>5.0 (New)</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.locationText}>{car.location?.address || "Location available after booking"}</Text>
          </View>

          <View style={styles.divider} />

          {/* Specs */}
          <Text style={styles.sectionTitle}>Vehicle Specs</Text>
          <View style={styles.specsGrid}>
            <SpecItem icon="car-shift-pattern" label="Gearbox" value={car.transmission} />
            <SpecItem icon="car-seat" label="Seats" value={`${car.seats} Seats`} />
            <SpecItem icon="gas-station" label="Fuel" value={car.fuelType} />
            <SpecItem icon="speedometer" label="Mileage" value="Unlimited" />
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {car.description || "This car is well maintained and perfect for city drives or long weekend trips. Instant booking available."}
          </Text>
          
          {/* Host Info */}
          <Text style={styles.sectionTitle}>Hosted By</Text>
          <View style={styles.hostCard}>
             <View style={styles.hostAvatar}>
                 <Text style={styles.hostInitials}>{car.owner?.fullName?.[0] || 'H'}</Text>
             </View>
             <View>
                 <Text style={styles.hostName}>{car.owner?.fullName || 'Host'}</Text>
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
                <Text style={styles.footerCurrency}>$</Text>
                <Text style={styles.footerPrice}>{car.pricePerDay}</Text>
                <Text style={styles.footerPeriod}>/ day</Text>
            </View>
        </View>
        
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookNow}>
            <LinearGradient colors={['#141E30', '#243B55']} style={styles.gradientBtn}>
                <Text style={styles.bookBtnText}>Book Now</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
        </TouchableOpacity>
      </View>

    </View>
  );
}

function SpecItem({ icon, label, value }) {
  return (
    <View style={styles.specBox}>
      <MaterialCommunityIcons name={icon} size={24} color="#141E30" />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Carousel
  carouselContainer: { height: 300, position: 'relative' },
  carouselImage: { width: width, height: 300 },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  pagination: { flexDirection: 'row', position: 'absolute', bottom: 30, width: '100%', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#fff', width: 20 },

  // Content
  contentContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    marginTop: -20, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { fontSize: 16, color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  model: { fontSize: 28, fontWeight: '800', color: '#141E30', marginTop: 2 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#333' },

  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 },
  locationText: { color: '#666', fontSize: 14 },

  divider: { height: 1, backgroundColor: '#F0F2F5', marginVertical: 25 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#141E30', marginBottom: 15 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  specBox: { width: '23%', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  specLabel: { fontSize: 10, color: '#94A3B8', marginTop: 8, fontWeight: '600' },
  specValue: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginTop: 2 },

  description: { fontSize: 15, color: '#64748B', lineHeight: 24, marginBottom: 30 },

  hostCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16 },
  hostAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#141E30', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  hostInitials: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  hostName: { fontSize: 16, fontWeight: 'bold', color: '#141E30' },
  hostSub: { fontSize: 12, color: '#888' },

  // Footer
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fff', 
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 10
  },
  footerPriceLabel: { fontSize: 12, color: '#888' },
  footerPriceRow: { flexDirection: 'row', alignItems: 'baseline' },
  footerCurrency: { fontSize: 16, fontWeight: '600', color: '#141E30' },
  footerPrice: { fontSize: 28, fontWeight: '800', color: '#141E30' },
  footerPeriod: { fontSize: 14, color: '#888', marginLeft: 2 },
  
  bookBtn: { width: 180, borderRadius: 14, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});