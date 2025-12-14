// app/(host)/car/location-picker.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    500: '#6B7280',
    400: '#9CA3AF',
  },
  white: '#FFFFFF',
};

// Custom Dark Map Style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1E3A5F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A1628' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9CA3AF' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#F59E0B' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9CA3AF' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#152A46' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#0F2137' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E3A5F' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0A1628' }],
  },
];

export default function LocationPicker() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('Locating...');
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to pin your car.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setCoords({ lat: latitude, lng: longitude });
      setLoading(false);

      fetchAddress(latitude, longitude);
    })();
  }, []);

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (response.length > 0) {
        const item = response[0];
        const formatted = `${item.streetNumber || ''} ${item.street || ''}, ${item.city || ''}`;
        setAddress(formatted.trim() || item.city || 'Unknown Location');
      }
    } catch (e) {
      setAddress('Pinned Location');
    }
  };

  const onRegionChangeComplete = (newRegion) => {
    setCoords({ lat: newRegion.latitude, lng: newRegion.longitude });
  };

  const handleConfirm = () => {
    if (router.canGoBack()) {
      router.back();
      router.replace({
        pathname: '/(host)/car/create',
        params: {
          address: address,
          lat: coords.lat,
          lng: coords.lng,
        },
      });
    } else {
      router.replace('/(host)/car/create');
    }
  };
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
        <Text style={styles.loadingText}>Finding GPS signal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={onRegionChangeComplete}
        customMapStyle={darkMapStyle}
      />

      {/* Center Pin */}
      <View style={styles.markerFixed}>
        <View style={styles.pinContainer}>
          <LinearGradient
            colors={[COLORS.gold[500], COLORS.gold[600]]}
            style={styles.pinGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="location" size={32} color={COLORS.navy[900]} />
          </LinearGradient>
        </View>
        <View style={styles.pinShadow} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backBtnInner}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Select Location</Text>
          <Text style={styles.headerSubtitle}>Pin your car's pickup spot</Text>
        </View>

        <TouchableOpacity style={styles.myLocationBtn} onPress={async () => {
          let location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          setRegion({ latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 });
          setCoords({ lat: latitude, lng: longitude });
          fetchAddress(latitude, longitude);
        }}>
          <Ionicons name="navigate-circle" size={28} color={COLORS.gold[500]} />
        </TouchableOpacity>
      </View>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <LinearGradient
          colors={[COLORS.navy[900], COLORS.navy[800]]}
          style={styles.bottomCardGradient}
        >
          {/* Address Display */}
          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={20} color={COLORS.gold[500]} />
              <Text style={styles.label}>SELECTED LOCATION</Text>
            </View>
            <Text style={styles.address} numberOfLines={2}>
              {address}
            </Text>
            <Text style={styles.coords}>
              📍 {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>Confirm Location</Text>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.navy[900]} />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.navy[900],
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray[400],
    fontSize: 14,
  },
  map: {
    flex: 1,
  },

  // Fixed Pin
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -28,
    marginTop: -56,
    alignItems: 'center',
    zIndex: 10,
  },
  pinContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  pinGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinShadow: {
    width: 16,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    marginTop: 4,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {},
  backBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  myLocationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },

  // Bottom Card
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomCardGradient: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },

  // Address Section
  addressSection: {
    marginBottom: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[400],
    letterSpacing: 1,
  },
  address: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
    lineHeight: 24,
  },
  coords: {
    fontSize: 13,
    color: COLORS.emerald[500],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },

  // Button
  btn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: {
    color: COLORS.navy[900],
    fontSize: 16,
    fontWeight: '700',
  },
});