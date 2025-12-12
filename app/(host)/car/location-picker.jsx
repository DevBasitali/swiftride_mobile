import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StatusBar, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LocationPicker() {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("Locating...");
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    (async () => {
      // 1. Request GPS Permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to pin your car.');
        setLoading(false);
        return;
      }

      // 2. Get Live Location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005, // Zoom level (smaller = closer)
        longitudeDelta: 0.005,
      });
      setCoords({ lat: latitude, lng: longitude });
      setLoading(false);
      
      // 3. Get Address Text
      fetchAddress(latitude, longitude);
    })();
  }, []);

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (response.length > 0) {
        const item = response[0];
        // Construct a readable address
        const formatted = `${item.streetNumber || ''} ${item.street || ''}, ${item.city || ''}`;
        setAddress(formatted.trim() || item.city || "Unknown Location");
      }
    } catch (e) {
      setAddress("Pinned Location");
    }
  };

  const onRegionChangeComplete = (newRegion) => {
    setCoords({ lat: newRegion.latitude, lng: newRegion.longitude });
    // In a real app, debounce this to save API costs
    // fetchAddress(newRegion.latitude, newRegion.longitude); 
  };

  const handleConfirm = () => {
    // Return Data to Previous Screen
    if (router.canGoBack()) {
      router.back();
      router.replace({
          pathname: '/(host)/car/create',
          params: { 
              address: address, 
              lat: coords.lat, 
              lng: coords.lng 
          }
      });
    } else {
        // Fallback if accessed directly
        router.replace('/(host)/car/create');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#141E30" />
        <Text style={styles.loadingText}>Finding GPS signal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* REAL MAP */}
      <MapView 
        style={styles.map}
        initialRegion={region}
        provider={PROVIDER_GOOGLE} // Forces Google Maps
        showsUserLocation={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={onRegionChangeComplete}
      />
      
      {/* CENTER PIN (Target) */}
      <View style={styles.markerFixed}>
        <Ionicons name="location" size={48} color="#FF4757" style={styles.pinIcon} />
        <View style={styles.pinShadow} />
      </View>

      {/* HEADER (Back Button) */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#141E30" />
      </TouchableOpacity>

      {/* BOTTOM CARD */}
      <View style={styles.bottomCard}>
        <Text style={styles.label}>SET CAR LOCATION</Text>
        <Text style={styles.address} numberOfLines={2}>{address}</Text>
        <Text style={styles.coords}>{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</Text>
        
        <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
            <LinearGradient colors={['#141E30', '#243B55']} style={styles.gradientBtn}>
                <Text style={styles.btnText}>Confirm Location</Text>
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, color: '#888' },
  map: { flex: 1 },
  
  markerFixed: { position: 'absolute', top: '50%', left: '50%', marginLeft: -24, marginTop: -48, alignItems: 'center', zIndex: 10 },
  pinIcon: { marginBottom: -5, zIndex: 10 },
  pinShadow: { width: 10, height: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5 },

  backBtn: { position: 'absolute', top: 50, left: 20, width: 45, height: 45, backgroundColor: '#fff', borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, elevation: 5 },

  bottomCard: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 25, paddingBottom: 40, borderTopLeftRadius: 25, borderTopRightRadius: 25, shadowColor: '#000', shadowOpacity: 0.1, elevation: 10 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 5 },
  address: { fontSize: 18, fontWeight: 'bold', color: '#141E30', marginBottom: 2 },
  coords: { fontSize: 12, color: '#aaa', marginBottom: 20, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  btn: { borderRadius: 12, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});