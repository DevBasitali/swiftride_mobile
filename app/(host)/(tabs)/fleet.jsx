// app/(host)/(tabs)/fleet.jsx
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
  StatusBar,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import carService from "../../../services/carService";
import { useAuth } from "../../../context/AuthContext";

const { width } = Dimensions.get("window");

// ============================================
// 🎨 INLINE THEME COLORS
// ============================================
const COLORS = {
  navy: {
    900: '#0A1628',
    800: '#0F2137',
    700: '#152A46',
    600: '#1E3A5F',
    500: '#2A4A73',
  },
  gold: {
    600: '#D99413',
    500: '#F59E0B',
    400: '#FBBF24',
  },
  emerald: {
    500: '#10B981',
    400: '#34D399',
  },
  red: {
    500: '#EF4444',
  },
  gray: {
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
  },
  white: '#FFFFFF',
};

export default function HostFleet() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
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
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  const renderCarItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/(host)/car/${item._id}`)}
      style={styles.cardContainer}
    >
      <View style={styles.card}>
        {/* Image Section */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: carService.getImageUrl(item.photos?.[0]) }}
            style={styles.carImage}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(10, 22, 40, 0.95)"]}
            style={styles.gradientOverlay}
          />

          {/* Price Tag */}
          <View style={styles.priceContainer}>
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.priceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.priceSymbol}>Rs.</Text>
              <Text style={styles.priceValue}>{item.pricePerDay}</Text>
              <Text style={styles.priceUnit}>/day</Text>
            </LinearGradient>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadgeContainer}>
            {item.isActive ? (
              <LinearGradient
                colors={[COLORS.emerald[400], COLORS.emerald[500]]}
                style={styles.statusBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>LIVE</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.statusBadge, styles.statusInactive]}>
                <View style={[styles.statusDot, styles.statusDotInactive]} />
                <Text style={styles.statusText}>HIDDEN</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.cardBottom}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.carTitle} numberOfLines={1}>
                {item.make} {item.model}
              </Text>
              <Text style={styles.carYear}>{item.year}</Text>
            </View>
          </View>

          {/* Specs Row */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="car-shift-pattern"
                size={16}
                color={COLORS.gray[400]}
              />
              <Text style={styles.specText}>{item.transmission || "Auto"}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="gas-station"
                size={16}
                color={COLORS.gray[400]}
              />
              <Text style={styles.specText}>{item.fuelType || "Petrol"}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="car-seat"
                size={16}
                color={COLORS.gray[400]}
              />
              <Text style={styles.specText}>{item.seats || 4}</Text>
            </View>
          </View>

          {/* Footer Row */}
          <View style={styles.footerRow}>
            <View style={styles.plateBox}>
              <Ionicons name="car" size={12} color={COLORS.gray[400]} />
              <Text style={styles.plateText}>{item.plateNumber}</Text>
            </View>

            <View style={styles.actionContainer}>
              <Text style={styles.manageText}>Manage</Text>
              <Ionicons name="arrow-forward-circle" size={24} color={COLORS.gold[500]} />
            </View>
          </View>
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
        <SafeAreaView edges={["top", "left", "right"]} style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Fleet</Text>
            <View style={styles.headerSubtitleContainer}>
              <Ionicons name="car-sport" size={16} color={COLORS.gold[500]} />
              <Text style={styles.headerSubtitle}>
                {myCars.length} {myCars.length === 1 ? 'vehicle' : 'vehicles'} listed
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddNew}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.addBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add" size={20} color={COLORS.navy[900]} />
              <Text style={styles.addBtnText}>Add Car</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator
            color={COLORS.gold[500]}
            size="large"
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={myCars}
            keyExtractor={(item) => item._id}
            renderItem={renderCarItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchMyCars();
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
                    <MaterialCommunityIcons
                      name="garage-variant"
                      size={60}
                      color={COLORS.gray[500]}
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyText}>Your Garage is Empty</Text>
                <Text style={styles.emptySub}>
                  Add your first car to start earning money
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleAddNew}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.gold[500], COLORS.gold[600]]}
                    style={styles.emptyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="add-circle-outline" size={22} color={COLORS.navy[900]} />
                    <Text style={styles.emptyButtonText}>Add Your First Car</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            }
          />
        )}
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

  // Header
  header: {
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    color: COLORS.white,
    marginBottom: 6,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: '500',
  },

  // Add Button
  addBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addBtnGradient: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 6,
  },
  addBtnText: {
    color: COLORS.navy[900],
    fontWeight: "700",
    fontSize: 14,
  },

  // Body
  body: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Card Design
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  // Image Section
  imageWrapper: {
    height: 200,
    position: "relative",
    backgroundColor: COLORS.navy[700],
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },

  // Price Tag
  priceContainer: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  priceGradient: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  priceSymbol: {
    color: COLORS.navy[900],
    fontSize: 14,
    fontWeight: "700",
  },
  priceValue: {
    color: COLORS.navy[900],
    fontSize: 24,
    fontWeight: "800",
    marginLeft: 2,
  },
  priceUnit: {
    color: COLORS.navy[900],
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
    opacity: 0.8,
  },

  // Status Badge
  statusBadgeContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusInactive: {
    backgroundColor: COLORS.navy[600],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  statusDotInactive: {
    backgroundColor: COLORS.gray[400],
  },
  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Bottom Content
  cardBottom: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 4,
  },
  carYear: {
    fontSize: 13,
    color: COLORS.gray[400],
    fontWeight: "600",
  },

  // Specs Row
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  specText: {
    fontSize: 13,
    color: COLORS.gray[400],
    fontWeight: "600",
  },
  specDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.navy[600],
    marginHorizontal: 12,
  },

  // Footer Row
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
  },
  plateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.navy[700],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  plateText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray[400],
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manageText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gold[500],
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: COLORS.gray[400],
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: COLORS.navy[900],
    fontSize: 15,
    fontWeight: '700',
  },
});