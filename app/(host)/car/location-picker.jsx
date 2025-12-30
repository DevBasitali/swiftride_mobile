// app/(host)/car/location-picker.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  Keyboard,
  Animated,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

// Recent locations storage key
const RECENT_LOCATIONS_KEY = "recentLocations";
const MAX_RECENT_LOCATIONS = 5;

// Popular/suggested locations (can be customized based on region)
const SUGGESTED_LOCATIONS = [
  { name: "Current Location", icon: "navigate", type: "current" },
  { name: "Airport", icon: "airplane", type: "search", query: "airport" },
  {
    name: "Train Station",
    icon: "train",
    type: "search",
    query: "train station",
  },
  { name: "Bus Terminal", icon: "bus", type: "search", query: "bus terminal" },
  {
    name: "Shopping Mall",
    icon: "cart",
    type: "search",
    query: "shopping mall",
  },
  { name: "Hotel", icon: "bed", type: "search", query: "hotel" },
];

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

export default function LocationPicker() {
  // Get params passed from create screen
  const params = useLocalSearchParams();
  const { showAlert } = useAlert();

  // ============================================
  // 🔒 STATE
  // ============================================
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("Locating...");
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [userLocation, setUserLocation] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Recent locations
  const [recentLocations, setRecentLocations] = useState([]);

  const mapRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const searchInputRef = useRef(null);

  // Animation values
  const pinScale = useRef(new Animated.Value(1)).current;
  const pinTranslateY = useRef(new Animated.Value(0)).current;
  const panelHeight = useRef(new Animated.Value(0)).current;

  // ============================================
  // 📍 INITIAL LOAD
  // ============================================
  useEffect(() => {
    (async () => {
      // Load recent locations
      await loadRecentLocations();

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert({
          title: "Permission Denied",
          message: "Allow location access to pin your car.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });
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

  // ============================================
  // 💾 RECENT LOCATIONS FUNCTIONS
  // ============================================
  const loadRecentLocations = async () => {
    try {
      const stored = await SecureStore.getItemAsync(RECENT_LOCATIONS_KEY);
      if (stored) {
        setRecentLocations(JSON.parse(stored));
      }
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

      // Filter out duplicates and add new location at the beginning
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
  // 🔍 SEARCH FUNCTIONS
  // ============================================
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (response.length > 0) {
        const item = response[0];
        // Build complete address like web version
        const parts = [
          item.streetNumber,
          item.street,
          item.name, // POI name if available
          item.district,
          item.subregion,
          item.city,
          item.region,
          item.country,
        ].filter(Boolean);

        // Remove duplicates (sometimes city and region are same)
        const uniqueParts = [...new Set(parts)];
        const fullAddress =
          uniqueParts.join(", ") || item.city || "Unknown Location";
        setAddress(fullAddress);
      }
    } catch (e) {
      setAddress("Pinned Location");
    }
  };

  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      // Use Google Places Autocomplete API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${apiKey}&types=geocode`
      );
      const data = await response.json();

      if (data.status === "OK" && data.predictions.length > 0) {
        // Get details for each prediction
        const detailedResults = await Promise.all(
          data.predictions.slice(0, 6).map(async (prediction) => {
            try {
              // Get place details for coordinates
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
        // Fallback to expo-location if Google fails
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

  // Calculate distance between two points in km
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

  const handleSearchChange = (text) => {
    setSearchQuery(text);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      searchLocations(text);
    }, 400);
  };

  const handleSelectLocation = (result) => {
    Keyboard.dismiss();
    setShowSearchPanel(false);
    setSearchQuery("");
    setSearchResults([]);

    const newRegion = {
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    setRegion(newRegion);
    setCoords({ lat: result.latitude, lng: result.longitude });
    setAddress(result.address || "Selected Location");

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500);
    }
  };

  const handleSuggestionPress = async (suggestion) => {
    if (suggestion.type === "current") {
      goToCurrentLocation();
    } else if (suggestion.type === "search") {
      setSearchQuery(suggestion.query);
      searchLocations(suggestion.query);
    }
  };

  const goToCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      setCoords({ lat: latitude, lng: longitude });
      fetchAddress(latitude, longitude);
      setShowSearchPanel(false);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
    } catch (e) {
      showAlert({
        title: "Error",
        message: "Could not get current location",
        type: "error",
      });
    }
  };

  // ============================================
  // 🗺️ MAP HANDLERS
  // ============================================
  const onRegionChange = () => {
    if (!isDragging) {
      setIsDragging(true);
      Animated.parallel([
        Animated.spring(pinScale, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 5,
        }),
        Animated.spring(pinTranslateY, {
          toValue: -20,
          useNativeDriver: true,
          friction: 5,
        }),
      ]).start();
    }
  };

  const debounceRef = useRef(null);

  const onRegionChangeComplete = (newRegion) => {
    setIsDragging(false);
    Animated.parallel([
      Animated.spring(pinScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.spring(pinTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
      }),
    ]).start();

    setCoords({ lat: newRegion.latitude, lng: newRegion.longitude });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setAddress("Finding address...");

    debounceRef.current = setTimeout(() => {
      fetchAddress(newRegion.latitude, newRegion.longitude);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current && region) {
      const newRegion = {
        ...region,
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && region) {
      const newRegion = {
        ...region,
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: Math.min(region.latitudeDelta * 2, 90),
        longitudeDelta: Math.min(region.longitudeDelta * 2, 90),
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  // ============================================
  // ✅ CONFIRM HANDLER
  // ============================================
  const handleConfirm = () => {
    // Save to recent locations
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

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChangeComplete}
        customMapStyle={darkMapStyle}
        onPress={() => {
          Keyboard.dismiss();
          setShowSearchPanel(false);
        }}
      />

      {/* Center Pin with Animation */}
      <Animated.View
        style={[
          styles.markerFixed,
          {
            transform: [{ scale: pinScale }, { translateY: pinTranslateY }],
          },
        ]}
      >
        <View
          style={[
            styles.pinContainer,
            isDragging && styles.pinContainerDragging,
          ]}
        >
          <LinearGradient
            colors={
              isDragging
                ? [COLORS.gold[300], COLORS.gold[400]]
                : [COLORS.gold[500], COLORS.gold[600]]
            }
            style={styles.pinGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="car" size={28} color={COLORS.navy[900]} />
          </LinearGradient>
        </View>
        <View
          style={[styles.pinShadow, isDragging && styles.pinShadowDragging]}
        />
      </Animated.View>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomIn}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.zoomDivider} />
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomOut}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.floatingMyLocationBtn}
        onPress={goToCurrentLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="locate" size={22} color={COLORS.gold[500]} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Select Location</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setShowSearchPanel(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={20} color={COLORS.gray[400]} />
          <Text style={styles.searchPlaceholder}>
            {searchQuery || "Search for a location..."}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Panel Overlay */}
      {showSearchPanel && (
        <View style={styles.searchPanelOverlay}>
          <View style={styles.searchPanel}>
            {/* Search Input */}
            <View style={styles.searchPanelHeader}>
              <TouchableOpacity
                style={styles.searchPanelBack}
                onPress={() => {
                  setShowSearchPanel(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={18} color={COLORS.gray[400]} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search address, city, or landmark..."
                  placeholderTextColor={COLORS.gray[400]}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  autoFocus
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
            </View>

            <ScrollView
              style={styles.searchPanelContent}
              keyboardShouldPersistTaps="handled"
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
                      <View style={styles.locationIconContainer}>
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
                        <Text style={styles.locationAddress} numberOfLines={1}>
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
                searchResults.length === 0 &&
                !isSearching && (
                  <View style={styles.noResults}>
                    <Ionicons
                      name="search-outline"
                      size={48}
                      color={COLORS.gray[500]}
                    />
                    <Text style={styles.noResultsText}>No locations found</Text>
                    <Text style={styles.noResultsSubtext}>
                      Try a different search term
                    </Text>
                  </View>
                )}

              {/* Quick Suggestions - Show when no search query */}
              {searchQuery.length === 0 && (
                <>
                  {/* Recent Locations */}
                  {recentLocations.length > 0 && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>RECENT</Text>
                        <TouchableOpacity onPress={clearRecentLocations}>
                          <Text style={styles.clearButton}>Clear</Text>
                        </TouchableOpacity>
                      </View>
                      {recentLocations.map((loc, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.locationItem}
                          onPress={() => handleSelectLocation(loc)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.locationIconContainer,
                              styles.recentIcon,
                            ]}
                          >
                            <Ionicons
                              name="time"
                              size={20}
                              color={COLORS.emerald[500]}
                            />
                          </View>
                          <View style={styles.locationInfo}>
                            <Text style={styles.locationCity} numberOfLines={1}>
                              {loc.address.split(",")[0]}
                            </Text>
                            <Text
                              style={styles.locationAddress}
                              numberOfLines={1}
                            >
                              {loc.address}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

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
                            color={
                              suggestion.type === "current"
                                ? COLORS.emerald[500]
                                : COLORS.gold[500]
                            }
                          />
                          <Text style={styles.suggestionText}>
                            {suggestion.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <LinearGradient
          colors={[COLORS.navy[900], COLORS.navy[800]]}
          style={styles.bottomCardGradient}
        >
          {/* Address Display */}
          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <View style={styles.addressIconContainer}>
                <Ionicons name="location" size={18} color={COLORS.gold[500]} />
              </View>
              <Text style={styles.addressLabel}>PICKUP LOCATION</Text>
            </View>
            <Text style={styles.address} numberOfLines={2}>
              {address}
            </Text>
            <Text style={styles.coords}>
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.confirmBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.navy[900]}
              />
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[900],
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingSubtext: {
    marginTop: 4,
    color: COLORS.gray[400],
    fontSize: 14,
  },
  map: {
    flex: 1,
  },

  // Pin
  markerFixed: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -28,
    marginTop: -56,
    alignItems: "center",
    zIndex: 10,
  },
  pinContainer: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  pinContainerDragging: {
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  pinGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  pinShadow: {
    width: 16,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    marginTop: 4,
  },
  pinShadowDragging: {
    width: 24,
    height: 8,
    opacity: 0.5,
  },

  // Zoom Controls
  zoomControls: {
    position: "absolute",
    right: 16,
    top: "45%",
    backgroundColor: COLORS.navy[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: COLORS.navy[600],
  },

  // Floating My Location
  floatingMyLocationBtn: {
    position: "absolute",
    right: 16,
    bottom: 220,
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

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(10, 22, 40, 0.95)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 100,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
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
    flex: 1,
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },

  // Search Bar (in header)
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: COLORS.gray[400],
  },

  // Search Panel Overlay
  searchPanelOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.navy[900],
    zIndex: 200,
  },
  searchPanel: {
    flex: 1,
  },
  searchPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.navy[800],
    gap: 12,
  },
  searchPanelBack: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white,
    paddingVertical: 0,
  },
  searchPanelContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Sections
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray[400],
    letterSpacing: 1,
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 13,
    color: COLORS.gold[500],
    fontWeight: "600",
  },

  // Location Items
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navy[700],
    gap: 14,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
  },
  recentIcon: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  locationInfo: {
    flex: 1,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.gray[400],
  },
  locationDistance: {
    fontSize: 13,
    color: COLORS.emerald[500],
    fontWeight: "600",
  },

  // Suggestions Grid
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "500",
  },

  // No Results
  noResults: {
    alignItems: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginTop: 4,
  },

  // Bottom Card
  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomCardGradient: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
  },
  addressSection: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  addressIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gray[400],
    letterSpacing: 1,
  },
  address: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
    lineHeight: 24,
  },
  coords: {
    fontSize: 12,
    color: COLORS.emerald[500],
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "600",
  },
  confirmBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmBtnGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  confirmBtnText: {
    color: COLORS.navy[900],
    fontSize: 16,
    fontWeight: "700",
  },
});
