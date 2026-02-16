// app/(host)/car/location-picker.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlert } from "../../../context/AlertContext";

// ============================================
// 🎨 INLINE THEME COLORS
// ============================================
const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
    500: "#2A4A6F",
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
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
    300: "#D1D5DB",
  },
  white: "#FFFFFF",
  red: {
    500: "#EF4444",
  },
};

// Recent locations storage
const RECENT_LOCATIONS_KEY = "recentLocations";
const MAX_RECENT_LOCATIONS = 5;

// Suggested quick-search locations
const SUGGESTED_LOCATIONS = [
  { name: "Airport", icon: "airplane", query: "airport" },
  { name: "Train Station", icon: "train", query: "train station" },
  { name: "Bus Terminal", icon: "bus", query: "bus terminal" },
  { name: "Shopping Mall", icon: "cart", query: "shopping mall" },
  { name: "Hotel", icon: "bed", query: "hotel" },
  { name: "University", icon: "school", query: "university" },
];

// ============================================
// 🏠 MAIN COMPONENT
// ============================================
export default function LocationPicker() {
  const params = useLocalSearchParams();
  const { showAlert } = useAlert();

  // ============================================
  // 🔒 STATE
  // ============================================
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [userLocation, setUserLocation] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Recent locations
  const [recentLocations, setRecentLocations] = useState([]);

  // Selected state (to show the confirm button)
  const [hasSelection, setHasSelection] = useState(false);

  const searchDebounceRef = useRef(null);
  const searchInputRef = useRef(null);

  // ============================================
  // 📍 INITIAL LOAD
  // ============================================
  useEffect(() => {
    (async () => {
      await loadRecentLocations();

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert({
          title: "Permission Denied",
          message: "Allow location access to find nearby places.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        setCoords({ lat: latitude, lng: longitude });

        // Auto-detect current address
        const addr = await fetchAddress(latitude, longitude);
        if (addr) {
          setAddress(addr);
          setHasSelection(true);
        }
      } catch (e) {
        console.log("Location error:", e);
      }

      setLoading(false);
    })();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // ============================================
  // 💾 RECENT LOCATIONS
  // ============================================
  const loadRecentLocations = async () => {
    try {
      const stored = await SecureStore.getItemAsync(RECENT_LOCATIONS_KEY);
      if (stored) setRecentLocations(JSON.parse(stored));
    } catch (e) {
      console.log("Error loading recent locations:", e);
    }
  };

  const saveRecentLocation = async (location) => {
    try {
      const newLocation = {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city || "",
        timestamp: Date.now(),
      };

      const filtered = recentLocations.filter(
        (loc) =>
          !(
            Math.abs(loc.latitude - newLocation.latitude) < 0.0001 &&
            Math.abs(loc.longitude - newLocation.longitude) < 0.0001
          )
      );

      const updated = [newLocation, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
      setRecentLocations(updated);
      await SecureStore.setItemAsync(
        RECENT_LOCATIONS_KEY,
        JSON.stringify(updated)
      );
    } catch (e) {
      console.log("Error saving recent location:", e);
    }
  };

  const clearRecentLocations = async () => {
    try {
      await SecureStore.deleteItemAsync(RECENT_LOCATIONS_KEY);
      setRecentLocations([]);
    } catch (e) {
      console.log("Error clearing recent locations:", e);
    }
  };

  // ============================================
  // 🔍 SEARCH & GEOCODING
  // ============================================
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (response.length > 0) {
        const item = response[0];
        const parts = [
          item.streetNumber,
          item.street,
          item.name,
          item.district,
          item.subregion,
          item.city,
          item.region,
          item.country,
        ].filter(Boolean);
        const uniqueParts = [...new Set(parts)];
        return uniqueParts.join(", ") || item.city || "Unknown Location";
      }
    } catch (e) {
      return "Current Location";
    }
    return null;
  };

  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      // Google Places Autocomplete
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${apiKey}&types=geocode`
      );
      const data = await response.json();

      if (data.status === "OK" && data.predictions.length > 0) {
        const detailedResults = await Promise.all(
          data.predictions.slice(0, 6).map(async (prediction) => {
            try {
              const detailsResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry,formatted_address&key=${apiKey}`
              );
              const details = await detailsResponse.json();

              if (details.status === "OK" && details.result.geometry) {
                const { lat, lng } = details.result.geometry.location;
                const distance = userLocation
                  ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    lat,
                    lng
                  )
                  : null;

                return {
                  latitude: lat,
                  longitude: lng,
                  address:
                    details.result.formatted_address || prediction.description,
                  city:
                    prediction.structured_formatting?.main_text || "Location",
                  country:
                    prediction.structured_formatting?.secondary_text || "",
                  distance,
                };
              }
              return null;
            } catch {
              return null;
            }
          })
        );
        setSearchResults(detailedResults.filter(Boolean));
      } else {
        // Fallback to expo-location
        const results = await Location.geocodeAsync(query);
        if (results.length > 0) {
          const detailedResults = await Promise.all(
            results.slice(0, 6).map(async (result) => {
              try {
                const addressDetails = await Location.reverseGeocodeAsync({
                  latitude: result.latitude,
                  longitude: result.longitude,
                });
                const addr = addressDetails[0] || {};
                const distance = userLocation
                  ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    result.latitude,
                    result.longitude
                  )
                  : null;

                return {
                  latitude: result.latitude,
                  longitude: result.longitude,
                  address:
                    [addr.city, addr.region, addr.country]
                      .filter(Boolean)
                      .join(", ") || query,
                  city: addr.city || addr.region || "Unknown",
                  country: addr.country || "",
                  distance,
                };
              } catch {
                return {
                  latitude: result.latitude,
                  longitude: result.longitude,
                  address: query,
                  city: "Location",
                  distance: null,
                };
              }
            })
          );
          setSearchResults(detailedResults);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.log("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (km) => {
    if (!km) return "";
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  // ============================================
  // 🎯 HANDLERS
  // ============================================
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      searchLocations(text);
    }, 400);
  };

  const handleSelectLocation = (result) => {
    Keyboard.dismiss();
    setCoords({ lat: result.latitude, lng: result.longitude });
    setAddress(result.address || "Selected Location");
    setSearchQuery("");
    setSearchResults([]);
    setHasSelection(true);
  };

  const handleUseCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoords({ lat: latitude, lng: longitude });

      const addr = await fetchAddress(latitude, longitude);
      setAddress(addr || "Current Location");
      setHasSelection(true);
      setSearchQuery("");
      setSearchResults([]);
    } catch (e) {
      showAlert({
        title: "Error",
        message: "Could not get current location",
        type: "error",
      });
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion.query);
    searchLocations(suggestion.query);
    searchInputRef.current?.focus();
  };

  const handleConfirm = () => {
    saveRecentLocation({
      address,
      latitude: coords.lat,
      longitude: coords.lng,
      city: address.split(",")[1]?.trim() || "",
    });

    router.replace({
      pathname: "/(host)/car/create",
      params: {
        formState: params.formState || "",
        imageUris: params.imageUris || "",
        address: address,
        lat: coords.lat.toString(),
        lng: coords.lng.toString(),
      },
    });
  };

  // ============================================
  // 🎨 RENDER
  // ============================================
  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold[500]} />
          <Text style={styles.loadingText}>Finding your location...</Text>
          <Text style={styles.loadingSubtext}>Please wait a moment</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Location</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray[400]} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search address, city, or landmark..."
              placeholderTextColor={COLORS.gray[400]}
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
            />
            {isSearching && (
              <ActivityIndicator size="small" color={COLORS.gold[500]} />
            )}
            {searchQuery.length > 0 && !isSearching && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchResults([]);
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
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => handleSelectLocation(result)}
                activeOpacity={0.7}
              >
                <View style={styles.locationIcon}>
                  <Ionicons
                    name="location"
                    size={20}
                    color={COLORS.gold[500]}
                  />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationCity} numberOfLines={1}>
                    {result.city}
                  </Text>
                  <Text style={styles.locationAddress} numberOfLines={2}>
                    {result.address}
                  </Text>
                </View>
                {result.distance && (
                  <Text style={styles.locationDistance}>
                    {formatDistance(result.distance)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No Results */}
        {searchQuery.length >= 2 &&
          !isSearching &&
          searchResults.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons
                name="search-outline"
                size={40}
                color={COLORS.gray[500]}
              />
              <Text style={styles.noResultsText}>No locations found</Text>
              <Text style={styles.noResultsSub}>
                Try a different search term
              </Text>
            </View>
          )}

        {/* Current Location Button */}
        {searchQuery.length === 0 && (
          <>
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.currentLocationBtn}
                onPress={handleUseCurrentLocation}
                activeOpacity={0.7}
              >
                <View style={styles.currentLocationIcon}>
                  <Ionicons
                    name="navigate"
                    size={22}
                    color={COLORS.gold[500]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.currentLocationTitle}>
                    Use Current Location
                  </Text>
                  <Text style={styles.currentLocationSub}>
                    Detect your location automatically
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.gray[400]}
                />
              </TouchableOpacity>
            </View>

            {/* Quick Suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QUICK SEARCH</Text>
              <View style={styles.suggestionsGrid}>
                {SUGGESTED_LOCATIONS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionPress(suggestion)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={suggestion.icon}
                      size={18}
                      color={COLORS.gold[500]}
                    />
                    <Text style={styles.suggestionText}>
                      {suggestion.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>RECENT</Text>
                  <TouchableOpacity onPress={clearRecentLocations}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                {recentLocations.map((loc, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.locationItem}
                    onPress={() =>
                      handleSelectLocation({
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                        address: loc.address,
                        city: loc.city,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={[styles.locationIcon, styles.recentIcon]}>
                      <Ionicons
                        name="time"
                        size={20}
                        color={COLORS.emerald[500]}
                      />
                    </View>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationCity} numberOfLines={1}>
                        {loc.city || loc.address?.split(",")[0]}
                      </Text>
                      <Text style={styles.locationAddress} numberOfLines={1}>
                        {loc.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom: Selected Location & Confirm */}
      {hasSelection && (
        <View style={styles.bottomBar}>
          <View style={styles.selectedLocation}>
            <View style={styles.selectedIcon}>
              <Ionicons name="location" size={20} color={COLORS.gold[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedLabel}>Selected Location</Text>
              <Text style={styles.selectedAddress} numberOfLines={2}>
                {address}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.confirmGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.navy[900]}
              />
              <Text style={styles.confirmText}>Confirm Location</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[900],
  },
  loadingContainer: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.gray[400],
  },

  // Header
  header: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerInner: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "500",
  },

  // Content
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray[400],
    letterSpacing: 1,
    marginBottom: 12,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gold[500],
    marginBottom: 12,
  },

  // Location Item
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.navy[800],
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    gap: 14,
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
  },
  recentIcon: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  locationInfo: {
    flex: 1,
  },
  locationCity: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 3,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.gray[400],
    lineHeight: 18,
  },
  locationDistance: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gold[500],
  },

  // Current Location
  currentLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gold[500] + "30",
    gap: 14,
  },
  currentLocationIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.gold[500] + "18",
    justifyContent: "center",
    alignItems: "center",
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 2,
  },
  currentLocationSub: {
    fontSize: 13,
    color: COLORS.gray[400],
  },

  // Suggestions
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.navy[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[300],
  },

  // No Results
  noResults: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 8,
  },
  noResultsSub: {
    fontSize: 14,
    color: COLORS.gray[400],
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy[800],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: COLORS.navy[600],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  selectedLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  selectedIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.gold[500] + "18",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray[400],
    marginBottom: 2,
  },
  selectedAddress: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
    lineHeight: 20,
  },
  confirmBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  confirmGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
    borderRadius: 14,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy[900],
  },
});
