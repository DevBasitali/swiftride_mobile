import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext'; // Note: Adjust ../ path
import carService from '../../../services/carService'; // Note: Adjust ../ path
import CarCard from '../../../components/car/CarCard'; // Note: Adjust ../ path
import { Stack } from 'expo-router';

export default function CustomerHome() {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchCars(); }, []);

  const fetchCars = async (query = '') => {
    try {
      const filters = query ? { brand: query } : {}; 
      const response = await carService.getAllCars(filters);
      setCars(response.data?.cars || response.data || []);
    } catch (error) {
      console.log('Error fetching cars:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCars(searchQuery);
  }, [searchQuery]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0] || 'Driver'} 👋</Text>
          <Text style={styles.subGreeting}>Find your perfect ride.</Text>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by brand..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => { setLoading(true); fetchCars(searchQuery); }}
        />
      </View>
      <Text style={styles.sectionTitle}>Available Cars</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {loading && !refreshing && <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#007AFF" /></View>}
      <FlatList
        data={cars}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <CarCard car={item} />} // Ensure CarCard links to /car/[id]
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 40 },
  loaderContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  headerContainer: { marginBottom: 20 },
  welcomeRow: { marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subGreeting: { fontSize: 14, color: '#666' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10 },
});