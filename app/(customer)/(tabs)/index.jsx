// app/(customer)/(tabs)/index.jsx
import React, { useState, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import carService from "../../../services/carService";

const { width } = Dimensions.get("window");

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
  },
  emerald: {
    500: "#10B981",
  },
  gray: {
    500: "#6B7280",
    400: "#9CA3AF",
  },
  white: "#FFFFFF",
};

const CATEGORIES = ["All", "Sedan", "SUV", "Luxury", "Hatchback"];

export default function CustomerHome() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cars, setCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useFocusEffect(
    useCallback(() => {
      fetchCars();
    }, [selectedCategory])
  );

  const fetchCars = async () => {
    try {
      console.log("1. Starting Fetch...");

      const filters = {};
      if (selectedCategory !== "All") filters.type = selectedCategory;
      if (searchQuery) filters.search = searchQuery;

      const response = await carService.getAllCars(filters);

      console.log("2. API Response Body:", JSON.stringify(response, null, 2));

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

      const filtered =
        selectedCategory === "All"
          ? allCars
          : allCars.filter(
              (c) =>
                c.bodyType === selectedCategory ||
                c.model.includes(selectedCategory)
            );

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
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  const renderCarItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/(customer)/car/${item._id}`)}
      style={styles.card}
    >
      {/* Image */}
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

        {/* Price Badge */}
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

        {/* Available Badge */}
        {item.isActive && (
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />
            <Text style={styles.availableText}>Available</Text>
          </View>
        )}
      </View>

      {/* Content */}
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
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  fetchCars();
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

      {/* Body */}
      <View style={styles.body}>
        {/* Categories */}
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

        {/* Car List */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.gold[500]}
            style={{ marginTop: 50 }}
          />
        ) : (
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
    paddingBottom: 25,
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
    marginBottom: 20,
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
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "500",
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

  // Car Card
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

  // Price Badge
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

  // Available Badge
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

  // Card Content
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
});
