import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
// Note the triple dot (../../..) to go back up to root
import carService from '../../../services/carService';
import Colors from '../../../constants/Colors';

const { width } = Dimensions.get('window');

export default function CarDetails() {
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
      console.log('Error fetching car details:', error);
      alert('Could not load car details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = () => {
    // Navigate to checkout (We will build this next)
    // Notice the path keeps them inside the (customer) group
    router.push(`/(customer)/car/checkout?carId=${id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!car) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* IMAGE CAROUSEL */}
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
              <Image
                source={{ uri: 'https://via.placeholder.com/800x600.png?text=No+Image' }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            )}
          </ScrollView>

          {/* Pagination Dots */}
          {car.photos && car.photos.length > 1 && (
            <View style={styles.pagination}>
              {car.photos.map((_, index) => (
                <View key={index} style={[styles.dot, index === activeSlide && styles.activeDot]} />
              ))}
            </View>
          )}

          {/* Back Button Overlay */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* DETAILS BODY */}
        <View style={styles.contentContainer}>
          
          {/* Title & Rating */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{car.make}</Text>
              <Text style={styles.model}>{car.model} {car.year}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <FontAwesome name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>4.8 (24 trips)</Text>
            </View>
          </View>

          {/* Specs Grid */}
          <View style={styles.specsGrid}>
            <SpecBox icon="speedometer" label="Fast" value="0-60 in 3s" />
            <SpecBox icon="car-shift-pattern" label="Gearbox" value={car.transmission} />
            <SpecBox icon="seat" label="Seats" value={`${car.seats} Seats`} />
            <SpecBox icon="gas-station" label="Fuel" value={car.fuelType} />
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {car.description || `Experience the thrill of driving this ${car.year} ${car.make} ${car.model}. Perfect for weekend getaways or business trips. Well maintained and ready to go.`}
          </Text>

          {/* Features */}
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresRow}>
            {car.features && car.features.length > 0 ? (
              car.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))
            ) : (
               <Text style={{color:'#888'}}>No specific features listed.</Text>
            )}
          </View>

          {/* Location */}
          <Text style={styles.sectionTitle}>Car Location</Text>
          <View style={styles.locationBox}>
            <View style={styles.locIcon}>
              <FontAwesome name="map-marker" size={24} color="#007AFF" />
            </View>
            <View>
              <Text style={styles.locTitle}>Pick-up & Return</Text>
              <Text style={styles.locAddress}>{car.location?.address || 'Address Hidden'}</Text>
            </View>
          </View>

          {/* Host Info */}
          <Text style={styles.sectionTitle}>Hosted By</Text>
          <View style={styles.hostContainer}>
            <View style={styles.hostAvatar}>
               <Text style={styles.hostInitials}>H</Text>
            </View>
            <View>
              <Text style={styles.hostName}>Host/Showroom</Text>
              <Text style={styles.hostSub}>Joined in 2024</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* STICKY BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.pricePerDay}>${car.pricePerDay}</Text>
          <Text style={styles.priceLabel}>/ day</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookPress}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Helper Component for Specs
function SpecBox({ icon, label, value }) {
  return (
    <View style={styles.specBox}>
      <MaterialCommunityIcons name={icon} size={24} color="#666" />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  carouselContainer: { height: 300, position: 'relative' },
  carouselImage: { width: width, height: 300 },
  pagination: { flexDirection: 'row', position: 'absolute', bottom: 20, width: '100%', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#fff', width: 10, height: 10 },
  backBtn: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },

  contentContainer: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -25, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  brand: { fontSize: 16, color: '#666', fontWeight: '600' },
  model: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 8, borderRadius: 10 },
  ratingText: { marginLeft: 5, fontSize: 12, fontWeight: '600' },

  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  specBox: { width: '23%', backgroundColor: '#f8f9fa', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  specLabel: { fontSize: 10, color: '#999', marginTop: 5 },
  specValue: { fontSize: 12, fontWeight: 'bold', color: '#333', textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10, marginTop: 10 },
  description: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 20 },

  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  featureTag: { backgroundColor: '#eef2f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  featureText: { fontSize: 12, color: '#444' },

  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 20 },
  locIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  locTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  locAddress: { fontSize: 13, color: '#666' },

  hostContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  hostAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  hostInitials: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  hostName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  hostSub: { fontSize: 12, color: '#888' },
  chatBtn: { marginLeft: 'auto', padding: 10, backgroundColor: '#f0f9ff', borderRadius: 50 },

  bottomBar: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10
  },
  pricePerDay: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  priceLabel: { fontSize: 14, color: '#888' },
  bookBtn: { backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 14 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});