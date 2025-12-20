// app/(customer)/(tabs)/index.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
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
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import * as Location from "expo-location";
import carService from "../../../services/carService";

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
  },
  white: "#FFFFFF",
  red: {
    500: "#EF4444",
  },
};

const CATEGORIES = ["All", "Sedan", "SUV", "Luxury", "Hatchback"];

// Custom Dark Map Style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1E3A5F" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A1628" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#F59E0B" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9CA3AF" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#152A46" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#0F2137" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1E3A5F" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0A1628" }],
  },
];

export default function CustomerHome() {
  // ============================================
  // 🔒 STATE
  // ============================================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cars, setCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // View mode: 'list' or 'map'
  const [viewMode, setViewMode] = useState("list");

  // Map state
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const mapRef = useRef(null);

  // Animation for selected car card
  const cardAnimation = useRef(new Animated.Value(0)).current;

  // ============================================
  // 📍 LOCATION & DATA FETCH
  // ============================================
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (e) {
        console.log("Location error:", e);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCars();
    }, [selectedCategory, searchQuery])
  );

  const fetchCars = async () => {
    try {
      const filters = {};
      if (selectedCategory !== "All") filters.type = selectedCategory;
      if (searchQuery) filters.search = searchQuery;

      const response = await carService.getAllCars(filters);

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

      // Filter cars that have valid location data for map view
      const carsWithLocation = allCars.filter(
        (car) => car.location && car.location.lat && car.location.lng
      );

      // Use the cars returned from backend (already filtered)
      setCars(allCars);

      // If we have cars with locations, fit map to show all of them
      if (carsWithLocation.length > 0 && mapRef.current && viewMode === "map") {
        const coords = carsWithLocation.map((car) => ({
          latitude: car.location.lat,
          longitude: car.location.lng,
        }));

        // Add user location if available
        if (userLocation) {
          coords.push(userLocation);
        }

        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
            animated: true,
          });
        }, 500);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-search with debounce
  const searchDebounceRef = useRef(null);

  const handleSearchChange = (text) => {
    setSearchQuery(text);

    // Debounce search to avoid excessive API calls
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setLoading(true);
      fetchCars();
    }, 500);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  // ============================================
  // 🗺️ MAP HANDLERS
  // ============================================
  const handleMarkerPress = (car) => {
    setSelectedCar(car);
    Animated.spring(cardAnimation, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();

    // Center map on selected car
    if (mapRef.current && car.location) {
      mapRef.current.animateToRegion(
        {
          latitude: car.location.lat,
          longitude: car.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const closeCarCard = () => {
    Animated.timing(cardAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedCar(null));
  };

  const handleViewCarDetails = (car) => {
    router.push(`/(customer)/car/${car._id}`);
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  };

  const fitAllCars = () => {
    const carsWithLocation = cars.filter(
      (car) => car.location && car.location.lat && car.location.lng
    );

    if (carsWithLocation.length > 0 && mapRef.current) {
      const coords = carsWithLocation.map((car) => ({
        latitude: car.location.lat,
        longitude: car.location.lng,
      }));

      if (userLocation) {
        coords.push(userLocation);
      }

      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 150, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
  };

  // ============================================
  // 🎨 RENDER COMPONENTS
  // ============================================
  const renderCarItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/(customer)/car/${item._id}`)}
      style={styles.card}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: carService.getImageUrl(item.photos?.[0]) }}
          style={styles.carImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(10, 22, 40, 0.9)"]}
          style={styles.imageGradient}
        />

        <View style={styles.priceBadgeContainer}>
          <LinearGradient
            colors={[COLORS.gold[500], COLORS.gold[600]]}
            style={styles.priceBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.priceText}>${item.pricePerDay}</Text>
            <Text style={styles.dayText}>/day</Text>
          </LinearGradient>
        </View>

        {item.isActive && (
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />
            <Text style={styles.availableText}>Available</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.carTitle} numberOfLines={1}>
            {item.make} {item.model}
          </Text>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color={COLORS.gold[500]} />
            <Text style={styles.ratingText}>5.0</Text>
          </View>
        </View>

        <Text style={styles.yearText}>
          {item.year} • {item.color}
        </Text>

        <View style={styles.detailsRow}>
          <DetailIcon
            icon="car-shift-pattern"
            text={item.transmission || "Auto"}
          />
          <DetailIcon icon="car-seat" text={`${item.seats || 4}`} />
          <DetailIcon icon="gas-station" text={item.fuelType || "Petrol"} />
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={COLORS.gold[500]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location?.address || "City Center"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMapMarker = (car) => {
    if (!car.location || !car.location.lat || !car.location.lng) return null;

    const isSelected = selectedCar?._id === car._id;

    return (
      <Marker
        key={car._id}
        coordinate={{
          latitude: car.location.lat,
          longitude: car.location.lng,
        }}
        onPress={() => handleMarkerPress(car)}
      >
        <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
          <LinearGradient
            colors={isSelected ? [COLORS.gold[400], COLORS.gold[500]] : [COLORS.gold[500], COLORS.gold[600]]}
            style={styles.markerGradient}
          >
            <Ionicons name="car" size={20} color={COLORS.navy[900]} />
          </LinearGradient>
        </View>
      </Marker>
    );
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
              color={COLORS.gray[500]}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by make, model, or location..."
              placeholderTextColor={COLORS.gray[400]}
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setLoading(true);
                  setTimeout(() => fetchCars(), 100);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.gray[400]}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* View Toggle */}
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === "list" && styles.viewToggleBtnActive]}
              onPress={() => setViewMode("list")}
            >
              {viewMode === "list" ? (
                <LinearGradient
                  colors={[COLORS.gold[500], COLORS.gold[600]]}
                  style={styles.viewToggleGradient}
                >
                  <Ionicons name="list" size={18} color={COLORS.navy[900]} />
                  <Text style={styles.viewToggleTextActive}>List</Text>
                </LinearGradient>
              ) : (
                <>
                  <Ionicons name="list" size={18} color={COLORS.gray[400]} />
                  <Text style={styles.viewToggleText}>List</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === "map" && styles.viewToggleBtnActive]}
              onPress={() => {
                setViewMode("map");
                setTimeout(() => fitAllCars(), 300);
              }}
            >
              {viewMode === "map" ? (
                <LinearGradient
                  colors={[COLORS.gold[500], COLORS.gold[600]]}
                  style={styles.viewToggleGradient}
                >
                  <Ionicons name="map" size={18} color={COLORS.navy[900]} />
                  <Text style={styles.viewToggleTextActive}>Map</Text>
                </LinearGradient>
              ) : (
                <>
                  <Ionicons name="map" size={18} color={COLORS.gray[400]} />
                  <Text style={styles.viewToggleText}>Map</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>
        {/* Categories - only show in list view */}
        {viewMode === "list" && (
          <View style={styles.categoryContainer}>
            <FlatList
              horizontal
              data={CATEGORIES}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 15,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.catChip,
                    selectedCategory === item && styles.catChipActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                  activeOpacity={0.7}
                >
                  {selectedCategory === item ? (
                    <LinearGradient
                      colors={[COLORS.gold[500], COLORS.gold[600]]}
                      style={styles.catChipGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.catTextActive}>{item}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.catText}>{item}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Content based on view mode */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.gold[500]}
            style={{ marginTop: 50 }}
          />
        ) : viewMode === "list" ? (
          // List View
          <FlatList
            data={cars}
            keyExtractor={(item) => item._id}
            renderItem={renderCarItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchCars();
                }}
                tintColor={COLORS.gold[500]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={[COLORS.navy[700], COLORS.navy[600]]}
                    style={styles.emptyIconGradient}
                  >
                    <Ionicons
                      name="car-sport-outline"
                      size={60}
                      color={COLORS.gray[500]}
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyText}>No cars found</Text>
                <Text style={styles.emptySub}>Try adjusting your filters</Text>
              </View>
            }
          />
        ) : (
          // Map View
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={false}
              customMapStyle={darkMapStyle}
              onPress={closeCarCard}
            >
              {cars.map(renderMapMarker)}
            </MapView>

            {/* Map Controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity
                style={styles.mapControlBtn}
                onPress={centerOnUser}
              >
                <Ionicons name="locate" size={22} color={COLORS.gold[500]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapControlBtn}
                onPress={fitAllCars}
              >
                <Ionicons name="expand" size={22} color={COLORS.gold[500]} />
              </TouchableOpacity>
            </View>

            {/* Car count badge */}
            <View style={styles.carCountBadge}>
              <Text style={styles.carCountText}>
                {cars.filter((c) => c.location?.lat).length} cars nearby
              </Text>
            </View>

            {/* Selected Car Card */}
            {selectedCar && (
              <Animated.View
                style={[
                  styles.selectedCarCard,
                  {
                    transform: [
                      {
                        translateY: cardAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-300, 0],
                        }),
                      },
                    ],
                    opacity: cardAnimation,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeCardBtn}
                  onPress={closeCarCard}
                >
                  <Ionicons name="close" size={20} color={COLORS.white} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.selectedCarContent}
                  onPress={() => handleViewCarDetails(selectedCar)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: carService.getImageUrl(selectedCar.photos?.[0]) }}
                    style={styles.selectedCarImage}
                    resizeMode="cover"
                  />
                  <View style={styles.selectedCarInfo}>
                    <Text style={styles.selectedCarTitle}>
                      {selectedCar.make || 'Unknown'} {selectedCar.model || ''}
                    </Text>
                    <Text style={styles.selectedCarYear}>
                      {selectedCar.year} • {selectedCar.color}
                    </Text>
                    <View style={styles.selectedCarDetails}>
                      <View style={styles.selectedCarDetail}>
                        <MaterialCommunityIcons
                          name="car-shift-pattern"
                          size={14}
                          color={COLORS.gray[400]}
                        />
                        <Text style={styles.selectedCarDetailText}>
                          {selectedCar.transmission || 'Auto'}
                        </Text>
                      </View>
                      <View style={styles.selectedCarDetail}>
                        <MaterialCommunityIcons
                          name="car-seat"
                          size={14}
                          color={COLORS.gray[400]}
                        />
                        <Text style={styles.selectedCarDetailText}>
                          {selectedCar.seats || 4}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.selectedCarPriceRow}>
                      <View>
                        <Text style={styles.selectedCarLocation} numberOfLines={1}>
                          <Ionicons name="location" size={12} color={COLORS.gold[500]} />{" "}
                          {selectedCar.location?.address}
                        </Text>
                      </View>
                      <View style={styles.selectedCarPriceBox}>
                        <Text style={styles.selectedCarPrice}>
                          ${selectedCar.pricePerDay || '0'}
                        </Text>
                        <Text style={styles.selectedCarPriceLabel}>/day</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={() => handleViewCarDetails(selectedCar)}
                >
                  <LinearGradient
                    colors={[COLORS.gold[500], COLORS.gold[600]]}
                    style={styles.viewDetailsBtnGradient}
                  >
                    <Text style={styles.viewDetailsBtnText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.navy[900]} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ============================================
// 📦 HELPER COMPONENTS
// ============================================

function DetailIcon({ icon, text }) {
  return (
    <View style={styles.detailItem}>
      <MaterialCommunityIcons name={icon} size={14} color={COLORS.gray[400]} />
      <Text style={styles.detailText}>{text}</Text>
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
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    color: COLORS.gray[400],
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  profileBtn: {},
  profileBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "500",
  },

  // View Toggle
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  viewToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  viewToggleBtnActive: {
    backgroundColor: "transparent",
  },
  viewToggleGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  viewToggleText: {
    color: COLORS.gray[400],
    fontSize: 14,
    fontWeight: "600",
  },
  viewToggleTextActive: {
    color: COLORS.navy[900],
    fontSize: 14,
    fontWeight: "700",
  },

  // Body
  body: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  categoryContainer: {
    height: 70,
  },
  catChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    minWidth: 80,
    alignItems: "center",
  },
  catChipActive: {
    borderColor: COLORS.gold[500],
    backgroundColor: "transparent",
  },
  catChipGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    justifyContent: "center",
    alignItems: "center",
  },
  catText: {
    color: COLORS.gray[400],
    fontWeight: "600",
    fontSize: 14,
  },
  catTextActive: {
    color: COLORS.navy[900],
    fontWeight: "700",
    fontSize: 14,
  },

  // Car Card (List View)
  card: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageWrapper: {
    height: 200,
    position: "relative",
    backgroundColor: COLORS.navy[700],
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  priceBadgeContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  priceBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy[900],
  },
  dayText: {
    fontSize: 11,
    color: COLORS.navy[900],
    marginLeft: 2,
    fontWeight: "600",
    opacity: 0.8,
  },
  availableBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.emerald[500],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  availableText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.white,
    flex: 1,
    marginRight: 10,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.gold[500] + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gold[500],
  },
  yearText: {
    fontSize: 13,
    color: COLORS.gray[400],
    marginBottom: 12,
    fontWeight: "500",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.navy[700],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.gray[400],
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationText: {
    color: COLORS.gray[400],
    fontSize: 13,
    flex: 1,
    fontWeight: "500",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 8,
  },
  emptySub: {
    color: COLORS.gray[400],
    fontSize: 14,
    textAlign: "center",
  },

  // Map View
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },

  // Map Controls
  mapControls: {
    position: "absolute",
    right: 16,
    top: 16,
    gap: 10,
  },
  mapControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navy[800],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Car count badge
  carCountBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: COLORS.navy[800],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  carCountText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },

  // Map Markers
  markerContainer: {
    alignItems: "center",
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  markerPriceContainer: {
    marginTop: 4,
    backgroundColor: COLORS.navy[800],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  markerPriceContainerSelected: {
    backgroundColor: COLORS.gold[500],
    borderColor: COLORS.gold[400],
  },
  markerPrice: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
  },
  markerPriceSelected: {
    color: COLORS.navy[900],
  },

  // Selected Car Card
  selectedCarCard: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  closeCardBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  selectedCarContent: {
    flexDirection: "row",
    gap: 14,
  },
  selectedCarImage: {
    width: 100,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
  },
  selectedCarInfo: {
    flex: 1,
  },
  selectedCarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 2,
  },
  selectedCarYear: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginBottom: 6,
  },
  selectedCarDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
  },
  selectedCarDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  selectedCarDetailText: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  selectedCarPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCarLocation: {
    fontSize: 11,
    color: COLORS.gray[400],
    flex: 1,
  },
  selectedCarPriceBox: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  selectedCarPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.gold[500],
  },
  selectedCarPriceLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  viewDetailsBtn: {
    marginTop: 14,
    borderRadius: 12,
    overflow: "hidden",
  },
  viewDetailsBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  viewDetailsBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.navy[900],
  },
});
