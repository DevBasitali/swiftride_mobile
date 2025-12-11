import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
// Imports go up 3 levels to reach root
import carService from '../../../services/carService';
import { useAuth } from '../../../context/AuthContext';

export default function HostFleet() {
  const { kycStatus } = useAuth();
  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reloads data every time you look at this screen
  useFocusEffect(
    useCallback(() => {
      fetchMyCars();
    }, [])
  );

  const fetchMyCars = async () => {
    try {
      const response = await carService.getMyCars();
      setMyCars(response.data.cars || []);
    } catch (error) {
      console.log('Error fetching fleet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddNew = () => {
    // 1. KYC Gatekeeper
    if (kycStatus !== 'approved') {
      Alert.alert(
        'Verification Required', 
        'You must complete identity verification before listing a car.', 
        [
          { text: 'Verify Now', onPress: () => router.push('/kyc') }, 
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    
    // 2. Navigate to Create Screen
    router.push('/(host)/car/create');
  };

  const renderCarItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.carCard} 
      activeOpacity={0.7}
      onPress={() => router.push(`/(host)/car/${item._id}`)} // Navigate to Details
    >
      <Image 
        source={{ uri: carService.getImageUrl(item.photos?.[0]) }} 
        style={styles.carImage} 
      />
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>{item.make} {item.model} {item.year}</Text>
        <Text style={styles.carStatus}>
            {item.isActive ? '🟢 Active' : '🔴 Hidden'}
        </Text>
        <Text style={styles.carPrice}>${item.pricePerDay}/day</Text>
      </View>
      <FontAwesome name="angle-right" size={24} color="#ccc" style={{ marginRight: 5 }} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>My Fleet</Text>
            <Text style={styles.subtitle}>Manage your vehicles</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddNew}>
          <FontAwesome name="plus" size={14} color="#fff" />
          <Text style={styles.addBtnText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={myCars}
          keyExtractor={(item) => item._id}
          renderItem={renderCarItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyCars(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome name="car" size={50} color="#ddd" />
              <Text style={styles.emptyText}>You haven't listed any cars yet.</Text>
              <TouchableOpacity onPress={handleAddNew}>
                <Text style={styles.link}>List your first car</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 12, color: '#888' },
  
  addBtn: { 
    backgroundColor: '#1a1a1a', 
    flexDirection: 'row', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 30, 
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, elevation: 2
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 12 },
  
  listContent: { padding: 20, paddingBottom: 100 },
  
  carCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 15, 
    alignItems: 'center', 
    shadowColor:'#000', 
    shadowOpacity:0.05, 
    shadowRadius: 5,
    elevation:2 
  },
  carImage: { width: 90, height: 70, borderRadius: 10, backgroundColor: '#eee' },
  carInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  carTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  carStatus: { fontSize: 12, color: '#666', marginTop: 4, marginBottom: 4 },
  carPrice: { color: '#007AFF', fontWeight: '700', fontSize: 15 },
  
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#888', marginTop: 15, marginBottom: 10, fontSize: 16 },
  link: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
});