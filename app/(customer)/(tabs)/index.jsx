import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import carService from '../../../services/carService';

const { width } = Dimensions.get('window');

const CATEGORIES = ["All", "Sedan", "SUV", "Luxury", "Hatchback"];

export default function CustomerHome() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cars, setCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");

  useFocusEffect(
    useCallback(() => {
      fetchCars();
    }, [selectedCategory]) // Re-fetch when category changes
  );

  const fetchCars = async () => {
    try {
      console.log("1. Starting Fetch...");
      
      const filters = {};
      if (selectedCategory !== "All") filters.type = selectedCategory;
      if (searchQuery) filters.search = searchQuery;

      const response = await carService.getAllCars(filters);
      
      // 🚨 LOG THE EXACT RESPONSE FROM BACKEND 🚨
      console.log("2. API Response Body:", JSON.stringify(response, null, 2));

      // Attempt to find the array
      let allCars = [];
      if (Array.isArray(response)) {
        allCars = response;
      } else if (response.data && Array.isArray(response.data)) {
        allCars = response.data;
      } else if (response.data && response.data.cars) {
        allCars = response.data.cars;
      } else if (response.cars) {
        allCars = response.cars;
      }

      console.log("3. Cars extracted:", allCars.length);

      // Filter
      const filtered = selectedCategory === "All" 
        ? allCars 
        : allCars.filter(c => c.bodyType === selectedCategory || c.model.includes(selectedCategory));

      setCars(filtered);
    } catch (error) {
      console.error("4. Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchCars();
  };

  const renderCarItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push(`/(customer)/car/${item._id}`)}
      style={styles.card}
    >
      {/* IMAGE */}
      <View style={styles.imageWrapper}>
        <Image 
            source={{ uri: carService.getImageUrl(item.photos?.[0]) }} 
            style={styles.carImage} 
            resizeMode="cover" 
        />
        <View style={styles.priceBadge}>
            <Text style={styles.priceText}>${item.pricePerDay}</Text>
            <Text style={styles.dayText}>/day</Text>
        </View>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.imageGradient} />
      </View>

      {/* INFO */}
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
            <Text style={styles.carTitle}>{item.make} {item.model}</Text>
            <View style={styles.ratingBox}>
                <FontAwesome name="star" size={12} color="#F5A623" />
                <Text style={styles.ratingText}>5.0</Text>
            </View>
        </View>
        
        <View style={styles.detailsRow}>
            <DetailIcon icon="speedometer-outline" text={item.transmission || 'Auto'} />
            <DetailIcon icon="people-outline" text={`${item.seats || 4} Seats`} />
            <DetailIcon icon="leaf-outline" text={item.fuelType || 'Petrol'} />
        </View>

        <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color="#888" />
            <Text style={styles.locationText} numberOfLines={1}>{item.location?.address || 'City Center'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HERO HEADER */}
      <LinearGradient colors={['#141E30', '#243B55']} style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.greeting}>Good Morning,</Text>
                    <Text style={styles.title}>Find your perfect drive</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(customer)/profile')}>
                     <FontAwesome name="user-circle" size={32} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* SEARCH BAR */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={{marginRight: 10}} />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search make, model, or city..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
            </View>
        </SafeAreaView>
      </LinearGradient>

      {/* BODY */}
      <View style={styles.body}>
        {/* CATEGORIES */}
        <View style={styles.categoryContainer}>
            <FlatList 
                horizontal
                data={CATEGORIES}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 15 }}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={[styles.catChip, selectedCategory === item && styles.catChipActive]}
                        onPress={() => setSelectedCategory(item)}
                    >
                        <Text style={[styles.catText, selectedCategory === item && styles.catTextActive]}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>

        {/* CAR LIST */}
        {loading ? (
             <ActivityIndicator size="large" color="#141E30" style={{marginTop: 50}} />
        ) : (
            <FlatList
                data={cars}
                keyExtractor={item => item._id}
                renderItem={renderCarItem}
                contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCars(); }} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="car-sport-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No cars found.</Text>
                        <Text style={styles.emptySub}>Try adjusting your filters.</Text>
                    </View>
                }
            />
        )}
      </View>
    </View>
  );
}

function DetailIcon({ icon, text }) {
    return (
        <View style={styles.detailItem}>
            <Ionicons name={icon} size={14} color="#666" />
            <Text style={styles.detailText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  header: { paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { paddingHorizontal: 20, paddingTop: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: '#ffffff80', fontSize: 14, fontWeight: '600' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  body: { flex: 1 },
  categoryContainer: { height: 70 },
  catChip: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  catChipActive: { backgroundColor: '#141E30', borderColor: '#141E30' },
  catText: { color: '#666', fontWeight: '600' },
  catTextActive: { color: '#fff' },

  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  imageWrapper: { height: 180, position: 'relative' },
  carImage: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  priceBadge: { position: 'absolute', top: 15, right: 15, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'baseline', shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#141E30' },
  dayText: { fontSize: 10, color: '#888', marginLeft: 2 },

  cardContent: { padding: 15 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  carTitle: { fontSize: 18, fontWeight: 'bold', color: '#141E30' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#333' },

  detailsRow: { flexDirection: 'row', gap: 15, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  detailText: { fontSize: 12, color: '#666' },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { color: '#888', fontSize: 13 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10 },
  emptySub: { color: '#888', marginTop: 5 }
});