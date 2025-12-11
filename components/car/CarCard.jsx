import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import carService from '../../services/carService';
import Colors from '../../constants/Colors';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function CarCard({ car }) {
  const handlePress = () => {
    // Navigate to details page (we will build this next)
    router.push(`/car/${car._id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      {/* IMAGE SECTION */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: carService.getImageUrl(car.photos?.[0]) }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>${car.pricePerDay}</Text>
          <Text style={styles.perDay}>/day</Text>
        </View>
      </View>

      {/* DETAILS SECTION */}
      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {car.make} {car.model}
          </Text>
          <View style={styles.ratingBox}>
            <FontAwesome name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>{car.year} • {car.color}</Text>

        {/* SPECS ROW */}
        <View style={styles.specsRow}>
          <SpecItem icon="car-shift-pattern" text={car.transmission} />
          <SpecItem icon="gas-station" text={car.fuelType} />
          <SpecItem icon="seat" text={`${car.seats} Seats`} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Helper for specs (Transmission, Fuel, etc.)
function SpecItem({ icon, text }) {
  return (
    <View style={styles.specItem}>
      <MaterialCommunityIcons name={icon} size={16} color="#666" />
      <Text style={styles.specText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  perDay: {
    color: '#ddd',
    fontSize: 12,
    marginLeft: 2,
  },
  details: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FBC02D',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 5,
  },
});