import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import carService from "../../../services/carService";
import { useAuth } from "../../../context/AuthContext";

const { width } = Dimensions.get("window");

export default function HostFleet() {
  const { kycStatus } = useAuth();
  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddNew = () => {
    if (kycStatus !== "approved") {
      Alert.alert("Verification Required", "Complete KYC first.", [
        { text: "Verify", onPress: () => router.push('/kyc') },
        { text: "Cancel" },
      ]);
      return;
    }
    router.push("/(host)/car/create");
  };

  const renderCarItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push(`/(host)/car/${item._id}`)}
      style={styles.cardContainer}
    >
      <View style={styles.card}>
        {/* --- MAGIC IMAGE SECTION --- */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: carService.getImageUrl(item.photos?.[0]) }}
            style={styles.carImage}
            resizeMode="cover"
          />

          {/* Gradient Overlay for Text Readability */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradientOverlay}
          />

          {/* Floating Price Tag (Glass Effect) */}
          <View style={styles.priceGlass}>
            <Text style={styles.priceSymbol}>$</Text>
            <Text style={styles.priceValue}>{item.pricePerDay}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>

          {/* Floating Status Badge */}
          <View
            style={[
              styles.statusBadge,
              item.isActive ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {item.isActive ? "LIVE" : "HIDDEN"}
            </Text>
          </View>
        </View>

        {/* --- DETAILS SECTION --- */}
        <View style={styles.cardBottom}>
          <View style={styles.titleRow}>
            <Text style={styles.carTitle} numberOfLines={1}>
              {item.make} {item.model}
            </Text>
            <Text style={styles.carYear}>{item.year}</Text>
          </View>

          {/* Specs Row */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="car-shift-pattern"
                size={14}
                color="#666"
              />
              <Text style={styles.specText}>{item.transmission || "Auto"}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="gas-station"
                size={14}
                color="#666"
              />
              <Text style={styles.specText}>{item.fuelType || "Petrol"}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="car-seat" size={14} color="#666" />
              <Text style={styles.specText}>{item.seats || 4} Seats</Text>
            </View>
          </View>

          <View style={styles.plateRow}>
            <View style={styles.plateBox}>
              <Text style={styles.plateText}>{item.plateNumber}</Text>
            </View>
            <View style={styles.actionArrow}>
              <Text style={styles.manageText}>Manage</Text>
              <Ionicons name="arrow-forward-circle" size={24} color="#141E30" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* PROFESSIONAL HEADER */}
      <LinearGradient colors={["#141E30", "#243B55"]} style={styles.header}>
        <SafeAreaView
          edges={["top", "left", "right"]}
          style={styles.headerContent}
        >
          <View>
            <Text style={styles.headerTitle}>My Fleet</Text>
            <Text style={styles.headerSubtitle}>
              {myCars.length} vehicles listed
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddNew}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#fff", "#f0f0f0"]}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={20} color="#141E30" />
              <Text style={styles.addBtnText}>Add Car</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {/* BODY */}
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator
            color="#141E30"
            size="large"
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={myCars}
            keyExtractor={(item) => item._id}
            renderItem={renderCarItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchMyCars();
                }}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/7486/7486747.png",
                  }}
                  style={{ width: 100, height: 100, opacity: 0.5 }}
                />
                <Text style={styles.emptyText}>Your showroom is empty.</Text>
                <Text style={styles.emptySub}>
                  Add your first car to start earning.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F8" }, // Light gray-blue background

  // Header
  header: {
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: { fontSize: 13, color: "#ffffff80", marginTop: 2 },

  addBtn: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  addBtnGradient: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  addBtnText: {
    color: "#141E30",
    fontWeight: "700",
    marginLeft: 5,
    fontSize: 13,
  },

  body: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 100 },

  // Card Design
  cardContainer: { marginBottom: 25 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#141E30",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8, // Deep shadow for "floating" effect
  },

  // Image Section
  imageWrapper: { height: 200, position: "relative", backgroundColor: "#eee" },
  carImage: { width: "100%", height: "100%" },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },

  // Glass Price Tag
  priceGlass: {
    position: "absolute",
    bottom: 15,
    left: 15,
    flexDirection: "row",
    alignItems: "baseline",
    // No blur on Android, relying on text shadow
  },
  priceSymbol: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },
  priceValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginLeft: 2,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },
  priceUnit: {
    color: "#ffffff90",
    fontSize: 13,
    marginLeft: 3,
    fontWeight: "500",
  },

  // Status Badge
  statusBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statusActive: { backgroundColor: "rgba(46, 204, 113, 0.9)" },
  statusInactive: { backgroundColor: "rgba(52, 73, 94, 0.9)" },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginRight: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Bottom Content
  cardBottom: { padding: 18 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#141E30",
    flex: 1,
    marginRight: 10,
  },
  carYear: {
    fontSize: 14,
    color: "#888",
    fontWeight: "600",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  specsRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  specItem: { flexDirection: "row", alignItems: "center" },
  specText: { fontSize: 12, color: "#555", marginLeft: 5, fontWeight: "500" },
  specDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#ddd",
    marginHorizontal: 10,
  },

  plateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  plateBox: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  plateText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  actionArrow: { flexDirection: "row", alignItems: "center" },
  manageText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#141E30",
    marginRight: 5,
  },

  emptyState: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 20 },
  emptySub: { fontSize: 14, color: "#888", marginTop: 5 },
});
