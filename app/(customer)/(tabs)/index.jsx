// app/(customer)/(tabs)/index.jsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StatusBar,
  ScrollView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import MapView, { Marker, Callout } from 'react-native-maps'; // Import Map

import carService from "../../../services/carService";
import bookingService from "../../../services/bookingService"; // Import booking service
import favoritesService from "../../../services/favoritesService"; // Import favorites
import * as Haptics from 'expo-haptics'; // Import Haptics
import FloatingChatButton from "../../../components/FloatingChatButton";
import ActiveTripCard from "../../../components/ActiveTripCard"; // Import new component
import SectionHeader from "../../../components/SectionHeader"; // Import new component
import HorizontalCarCard from "../../../components/HorizontalCarCard.jsx"; // New Component with explicit extension
import MapToggle from "../../../components/MapToggle"; // Import Toggle

const { width, height } = Dimensions.get("window");

// ============================================
// 🎨 INLINE THEME COLORS
// ============================================
const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  gold: {
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
    300: "#FCD34D",
  },
  emerald: {
    500: "#10B981",
    400: "#34D399",
  },
  gray: {
    500: "#6B7280",
    400: "#9CA3AF",
    300: "#D1D5DB",
    200: "#E5E7EB",
  },
  white: "#FFFFFF",
  red: {
    500: "#EF4444",
  },
};

const CATEGORIES = ["All", "Sedan", "SUV", "Luxury", "Hatchback"];
export default function CustomerHome() {
  // ============================================
  // 🔒 STATE
  // ============================================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allCars, setAllCars] = useState([]); // Store ALL cars here
  const [activeBooking, setActiveBooking] = useState(null); // Add active booking state
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapMode, setIsMapMode] = useState(false); // Map Mode State
  const mapRef = useRef(null);


  // ============================================
  // 📍 DATA FETCH
  // ============================================

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      // 1. Fetch ALL Cars (No filters) & Bookings
      const [carsRes, bookingsRes] = await Promise.allSettled([
        carService.getAllCars({}),
        bookingService.getMyBookings()
      ]);

      // Process Cars
      let carsData = [];
      if (carsRes.status === "fulfilled") {
        const response = carsRes.value;
        if (Array.isArray(response)) {
          carsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          carsData = response.data;
        } else if (response.data && response.data.cars) {
          carsData = response.data.cars;
        } else if (response.cars) {
          carsData = response.cars;
        }
        setAllCars(carsData);
      }

      // Process Bookings (Find active one)
      if (bookingsRes.status === "fulfilled") {
        const responseData = bookingsRes.value.data || {};
        // Handle various potential structures: 
        // 1. { data: { items: [...] } } (Standard)
        // 2. { data: [...] } (Direct array)
        // 3. [...] (Raw array)
        const bookings = Array.isArray(responseData)
          ? responseData
          : (responseData.items || responseData.bookings || []);

        const active = Array.isArray(bookings) ? bookings.find(b =>
          b.status === 'confirmed' ||
          b.status === 'ongoing' ||
          b.status === 'active'
        ) : null;
        setActiveBooking(active || null);
      }

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================
  // 🧠 DATA SEGMENTATION (MEMOIZED)
  // ============================================

  const { featuredCars, newArrivals, economyCars, filteredList } = useMemo(() => {
    // 1. Search Active? -> Return filtered list only
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = allCars.filter(car => {
        const matchMake = car.make?.toLowerCase().includes(lowerQuery);
        const matchModel = car.model?.toLowerCase().includes(lowerQuery);
        const matchYear = car.year?.toString().includes(lowerQuery);
        return matchMake || matchModel || matchYear;
      });
      return {
        featuredCars: [],
        newArrivals: [],
        economyCars: [],
        filteredList: filtered
      };
    }

    // 2. No Search -> Segment Data
    // Clone to avoid mutating original state in sort
    const sortedByPrice = [...allCars].sort((a, b) => b.pricePerDay - a.pricePerDay);
    const sortedByDate = [...allCars].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      featuredCars: sortedByPrice.slice(0, 5), // Top 5 most expensive
      newArrivals: sortedByDate.slice(0, 5),   // Top 5 newest
      economyCars: allCars.filter(c => c.pricePerDay < 5000).slice(0, 5), // Cheap cars
      filteredList: allCars // Full list at bottom
    };
  }, [searchQuery, allCars]);


  // ============================================
  // 🗺️ MAP INTERACTION
  // ============================================
  const [selectedCar, setSelectedCar] = useState(null);

  const handleMarkerPress = (car) => {
    setSelectedCar(car);
    Haptics.selectionAsync();
  };

  const handleMapPress = () => {
    if (selectedCar) {
      setSelectedCar(null);
    }
  };

  const fitToMarkers = () => {
    if (!mapRef.current || filteredList.length === 0) return;

    const coordinates = filteredList
      .filter(c => c.location && c.location.lat && c.location.lng)
      .map(c => ({
        latitude: parseFloat(c.location.lat),
        longitude: parseFloat(c.location.lng),
      }));

    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };


  // ============================================
  // ❤️ FAVORITES LOGIC
  // ============================================

  const [favorites, setFavorites] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const favs = await favoritesService.getFavorites();
    setFavorites(favs);
  };

  const toggleFavorite = async (carId) => {
    // Optimistic Update
    const isFav = favorites.includes(carId);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter(id => id !== carId);
    } else {
      newFavs = [...favorites, carId];
    }
    setFavorites(newFavs);

    // Haptics
    await Haptics.selectionAsync();

    // Persist
    await favoritesService.toggleFavorite(carId);
  };


  // ============================================
  // 🎨 RENDER COMPONENTS
  // ============================================

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Active Trip Widget */}
      {activeBooking && (
        <View style={styles.activeTripContainer}>
          <ActiveTripCard booking={activeBooking} />
        </View>
      )}

      {/* CURATED SHELVES (Only when NOT searching) */}
      {!searchQuery && (
        <>
          {/* Featured Section */}
          {featuredCars.length > 0 && (
            <View style={styles.sectionContainer}>
              <SectionHeader title="Featured Fleet" subtitle="Top of the line luxury" />
              <FlatList
                data={featuredCars}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <HorizontalCarCard item={item} />}
                contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 10 }}
                keyExtractor={item => `featured-${item._id}`}
              />
            </View>
          )}

          {/* New Arrivals Section */}
          {newArrivals.length > 0 && (
            <View style={styles.sectionContainer}>
              <SectionHeader title="Fresh Arrivals" subtitle="Just added to our garage" />
              <FlatList
                data={newArrivals}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <HorizontalCarCard item={item} />}
                contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 10 }}
                keyExtractor={item => `new-${item._id}`}
              />
            </View>
          )}

          {/* Economy Section */}
          {economyCars.length > 0 && (
            <View style={styles.sectionContainer}>
              <SectionHeader title="Economy Savers" subtitle="Budget friendly options" />
              <FlatList
                data={economyCars}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <HorizontalCarCard item={item} />}
                contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 10 }}
                keyExtractor={item => `eco-${item._id}`}
              />
            </View>
          )}
        </>
      )}

      {/* Main List Header */}
      <View style={{ marginTop: 10 }}>
        <SectionHeader
          title={searchQuery ? `Results for "${searchQuery}"` : "All Cars"}
          subtitle={searchQuery ? `${filteredList.length} cars found` : "Explore our complete collection"}
        />
      </View>
    </View>
  );

  const renderCarItem = ({ item }) => {
    const isFavorite = favorites.includes(item._id);

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => {
          if (item?._id) {
            router.push(`/(customer)/car/${item._id}`);
          }
        }}
        style={styles.card}
      >
        {/* Full Background Image */}
        <Image
          source={{ uri: carService.getImageUrl(item.photos?.[0]) }}
          style={styles.cardBg}
          resizeMode="cover"
        />

        {/* Dark Overlay for Text Readability */}
        <LinearGradient
          colors={["transparent", "rgba(10, 22, 40, 0.4)", "rgba(10, 22, 40, 0.95)"]}
          locations={[0, 0.5, 1]}
          style={styles.cardOverlay}
        />

        {/* Top Badges */}
        <View style={styles.topBadges}>
          {item.isActive ? (
            <View style={styles.statusBadge}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>AVAILABLE</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.red[500] }]}>
              <Text style={styles.statusText}>UNAVAILABLE</Text>
            </View>
          )}

          {/* ACTION BUTTONS ROW */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item._id);
              }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? COLORS.red[500] : COLORS.white}
              />
            </TouchableOpacity>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={COLORS.gold[500]} />
              <Text style={styles.ratingText}>5.0</Text>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.carName}>{item.make} {item.model}</Text>
            <Text style={styles.carSub}>{item.year} • {item.transmission || "Auto"}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currency}>PKR</Text>
            <Text style={styles.price}>{item.pricePerDay}</Text>
            <Text style={styles.perDay}>/day</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.header}
      >
        <SafeAreaView
          edges={["top", "left", "right"]}
          style={styles.headerContent}
        >
          <View style={styles.topRow}>
            <View>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.title}>Find your perfect drive</Text>
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push("/(customer)/(tabs)/profile")}
            >
              <View style={styles.profileBtnInner}>
                <Ionicons name="person" size={24} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.gray[400]}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by make, model..."
              placeholderTextColor={COLORS.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery} // Direct state update for instant search
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.gray[400]}
                />
              </TouchableOpacity>
            )}
          </View>

        </SafeAreaView>
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.gold[500]}
            style={{ marginTop: 50 }}
          />
        ) : (
          <>
            {isMapMode ? (
              <View style={{ flex: 1 }}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: 33.6844,
                    longitude: 73.0479,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                  }}
                  onPress={handleMapPress}
                >
                  {filteredList.map((car, index) => (
                    car.location && car.location.lat && (
                      <Marker
                        key={car._id}
                        coordinate={{
                          latitude: parseFloat(car.location.lat),
                          longitude: parseFloat(car.location.lng),
                        }}
                        onPress={() => handleMarkerPress(car)}
                      />
                    )
                  ))}
                </MapView>

                {/* Floating Car Card */}
                {selectedCar && (
                  <View style={styles.floatingCardContainer}>
                    <HorizontalCarCard item={selectedCar} />
                    <TouchableOpacity
                      style={styles.closeCardBtn}
                      onPress={() => setSelectedCar(null)}
                    >
                      <Ionicons name="close" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Fit To Map Button */}
                <TouchableOpacity
                  style={styles.fitMapBtn}
                  onPress={fitToMarkers}
                  activeOpacity={0.8}
                >
                  <Ionicons name="scan" size={24} color={COLORS.navy[900]} />
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredList}
                keyExtractor={(item) => item._id}
                renderItem={renderCarItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      fetchData();
                    }}
                    tintColor={COLORS.gold[500]}
                  />
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="car-sport-outline" size={64} color={COLORS.navy[700]} />
                    <Text style={styles.emptyText}>No cars found</Text>
                    <Text style={styles.emptySub}>Try a different search term</Text>
                  </View>
                }
              />
            )}
          </>
        )}
      </View>

      {/* Map Toggle Button (Top layer) */}
      {!loading && (
        <View style={styles.floatingContainer}>
          <MapToggle
            isMapMode={isMapMode}
            onToggle={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsMapMode(!isMapMode);
            }}
          />
        </View>
      )}

      {/* Floating AI Chat Button */}
      <FloatingChatButton />
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

  // Header
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.gray[400],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "700",
  },
  profileBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "500",
  },

  // Body
  body: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  listHeader: {
    marginBottom: 10,
  },
  activeTripContainer: {
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 24,
  },

  // New Car Card
  card: {
    height: 240,
    borderRadius: 24,
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: COLORS.navy[800],
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  cardBg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBadges: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.9)", // Emerald
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backdropFilter: "blur(10px)",
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15, 33, 55, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(4px)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
    shadowColor: "white",
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ratingBadge: {
    backgroundColor: "rgba(15, 33, 55, 0.8)", // Navy 800
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  ratingText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 12,
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  carName: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  carSub: {
    color: COLORS.gray[300],
    fontSize: 14,
    fontWeight: "500",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  currency: {
    color: COLORS.gold[500],
    fontSize: 12,
    fontWeight: "700",
    marginBottom: -2,
  },
  price: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
  },
  perDay: {
    color: COLORS.gray[400],
    fontSize: 12,
    fontWeight: "500",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    opacity: 0.7,
  },
  emptyText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySub: {
    color: COLORS.gray[400],
    fontSize: 14,
    marginTop: 8,
  },
  // Map Styles
  map: {
    width: '100%',
    height: '100%',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  priceMarker: {
    backgroundColor: COLORS.navy[800],
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.gold[500],
    elevation: 5,
  },
  markerText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  calloutContainer: {
    width: 280,
    height: 240,
    marginBottom: 10,
  },
  floatingCardContainer: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 60,
  },
  closeCardBtn: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: COLORS.navy[700],
    borderRadius: 15,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    elevation: 5,
  },
  fitMapBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: COLORS.gold[500],
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 50,
  }
});
