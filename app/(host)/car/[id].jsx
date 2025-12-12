import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import carService from '../../../services/carService';

const { width, height } = Dimensions.get('window');

export default function HostCarDetails() {
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
    Alert.alert("Delete Car", "Are you sure? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            setLoading(true);
            await carService.deleteCar(id);
            Alert.alert("Deleted", "Car removed from fleet.", [{ text: "OK", onPress: () => router.back() }]);
          } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Failed to delete.");
          }
        } 
      }
    ]);
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
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- IMMERSIVE HEADER --- */}
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
          
          {/* Gradient Overlay for Text Visibility */}
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']} style={styles.imageOverlay} />

          {/* Floating Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.counterText}>{activeSlide + 1} / {car.photos?.length || 1}</Text>
          </View>
        </View>

        {/* --- PREMIUM CONTENT BODY --- */}
        <View style={styles.contentContainer}>
          
          {/* Title Header */}
          <View style={styles.headerRow}>
            <View style={{flex: 1}}>
              <Text style={styles.brand}>{car.make}</Text>
              <Text style={styles.model}>{car.model} {car.year}</Text>
            </View>
            <View style={styles.ratingBox}>
              <FontAwesome name="star" size={14} color="#F5A623" />
              <Text style={styles.ratingText}>4.9 (12)</Text>
            </View>
          </View>

          {/* Price & Status */}
          <View style={styles.priceRow}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{car.pricePerDay}</Text>
                <Text style={styles.perDay}>/ day</Text>
            </View>
            <View style={[styles.statusBadge, car.isActive ? styles.stActive : styles.stHidden]}>
                <View style={[styles.dot, car.isActive ? styles.dotActive : styles.dotHidden]} />
                <Text style={[styles.statusText, car.isActive ? styles.textActive : styles.textHidden]}>
                    {car.isActive ? 'LIVE' : 'HIDDEN'}
                </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Specs Grid */}
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
            {car.description || "No description provided. This vehicle is maintained to high standards and ready for your next trip."}
          </Text>

          {/* Location */}
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <View style={styles.locIconBox}>
                <Ionicons name="location" size={24} color="#141E30" />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.locLabel}>Pick-up & Return</Text>
                <Text style={styles.locText}>{car.location?.address || "Address Hidden"}</Text>
            </View>
          </View>
          
        </View>
      </ScrollView>

      {/* --- FLOATING ACTION FOOTER --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="#FF4757" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/(host)/car/edit/${id}`)}>
            <LinearGradient colors={['#141E30', '#243B55']} style={styles.editGradient}>
                <Text style={styles.editBtnText}>Edit Vehicle</Text>
                <Ionicons name="create-outline" size={20} color="#fff" />
            </LinearGradient>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// Helper Component
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
  
  // Header / Carousel
  carouselContainer: { height: 320, position: 'relative' },
  carouselImage: { width: width, height: 320 },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' },
  imageCounter: { position: 'absolute', bottom: 30, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  counterText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Content Body
  contentContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    marginTop: -20, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25,
    paddingBottom: 40
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { fontSize: 16, color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  model: { fontSize: 28, fontWeight: '800', color: '#141E30', marginTop: 2 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#F57F17', marginLeft: 5 },

  // Price & Status
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  currency: { fontSize: 20, fontWeight: '600', color: '#141E30', marginTop: 6 },
  price: { fontSize: 32, fontWeight: '800', color: '#141E30' },
  perDay: { fontSize: 14, color: '#888', marginLeft: 4, fontWeight: '500' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  stActive: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  stHidden: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  dotActive: { backgroundColor: '#2E7D32' },
  dotHidden: { backgroundColor: '#9E9E9E' },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  textActive: { color: '#2E7D32' },
  textHidden: { color: '#757575' },

  divider: { height: 1, backgroundColor: '#F0F2F5', marginVertical: 25 },

  // Specs
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#141E30', marginBottom: 15 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  specBox: { width: '23%', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  specLabel: { fontSize: 10, color: '#94A3B8', marginTop: 8, fontWeight: '600' },
  specValue: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginTop: 2 },

  description: { fontSize: 15, color: '#64748B', lineHeight: 24, marginBottom: 30 },

  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7', marginBottom: 20 },
  locIconBox: { width: 40, height: 40, backgroundColor: '#E2E8F0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  locLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  locText: { fontSize: 15, color: '#141E30', fontWeight: '600' },

  // Footer Actions
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fff', 
    paddingHorizontal: 25, paddingVertical: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    flexDirection: 'row', alignItems: 'center', gap: 15
  },
  deleteBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFEBEE' },
  editBtn: { flex: 1, height: 56, borderRadius: 16, overflow: 'hidden' },
  editGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  editBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});