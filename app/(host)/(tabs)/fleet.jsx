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
  Dimensions,
  StatusBar,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import carService from "../../../services/carService";
import { useAuth } from "../../../context/AuthContext";
import { useAlert } from "../../../context/AlertContext";

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
    500: "#2A4A73",
  },
  gold: {
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
  },
  emerald: {
    500: "#10B981",
    400: "#34D399",
  },
  red: {
    500: "#EF4444",
  },
  gray: {
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
  },
  white: "#FFFFFF",
};

export default function HostFleet() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const { kycStatus } = useAuth();
  const { showAlert } = useAlert();
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
      showAlert({
        title: "Verification Required",
        message: "Complete KYC first.",
        type: "warning",
        buttons: [
          { text: "Verify", onPress: () => router.push("/kyc") },
          { text: "Cancel", style: "cancel" },
        ],
      });
      return;
    }
    router.push("/(host)/car/create");
  };
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  const renderCarItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/(host)/car/${item._id}`)}
      style={styles.compactCard}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailWrapper}>
        <Image
          source={{ uri: carService.getImageUrl(item.photos?.[0]) }}
          style={styles.compactImage}
          resizeMode="cover"
        />
      </View>

      {/* Info Container */}
      <View style={styles.compactInfo}>
        <View style={styles.infoTop}>
          <View style={styles.titleWrapper}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {item.make} {item.model}
            </Text>
          </View>
          <View style={styles.priceWrapper}>
            <Text style={styles.compactPrice}>Rs. {item.pricePerDay}</Text>
            <Text style={styles.compactPriceUnit}>/d</Text>
          </View>
        </View>

        <View style={styles.infoMiddle}>
          <View style={styles.plateWrapper}>
            <Ionicons name="car" size={12} color={COLORS.gray[400]} />
            <Text style={styles.compactPlate}>{item.plateNumber}</Text>
          </View>

          <View style={styles.statusPillWrapper}>
            {item.approvalStatus === 'pending' ? (
              <View style={[styles.compactPill, styles.pillPending]}><Text style={[styles.pillText, { color: COLORS.gold[500] }]}>Pending</Text></View>
            ) : item.approvalStatus === 'rejected' ? (
              <View style={[styles.compactPill, styles.pillRejected]}><Text style={[styles.pillText, { color: '#EF4444' }]}>Rejected</Text></View>
            ) : item.approvalStatus === 'suspended' ? (
              <View style={[styles.compactPill, styles.pillSuspended]}><Text style={[styles.pillText, { color: '#F97316' }]}>Suspended</Text></View>
            ) : item.isActive ? (
              <View style={[styles.compactPill, styles.pillLive]}><Text style={[styles.pillText, { color: COLORS.emerald[400] }]}>Live</Text></View>
            ) : (
              <View style={[styles.compactPill, styles.pillHidden]}><Text style={[styles.pillText, { color: COLORS.gray[400] }]}>Hidden</Text></View>
            )}
          </View>
        </View>

        {item.approvalStatus === 'rejected' && item.rejectionReason && (
          <Text style={styles.compactRejectionText} numberOfLines={1}>
            Failed: {item.rejectionReason}
          </Text>
        )}
      </View>

      {/* Right chevron */}
      <View style={styles.chevronWrapper}>
        <Ionicons name="chevron-forward" size={18} color={COLORS.gray[500]} />
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
          <View>
            <Text style={styles.headerTitle}>My Fleet</Text>
            <View style={styles.headerSubtitleContainer}>
              <Ionicons name="car-sport" size={16} color={COLORS.gold[500]} />
              <Text style={styles.headerSubtitle}>
                {myCars.length} {myCars.length === 1 ? "vehicle" : "vehicles"}{" "}
                listed
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
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color={COLORS.navy[900]}
                    />
                    <Text style={styles.emptyButtonText}>
                      Add Your First Car
                    </Text>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: "500",
  },

  // Add Button
  addBtn: {
    borderRadius: 14,
    overflow: "hidden",
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

  // Card Design - COMPACT List
  compactCard: {
    flexDirection: "row",
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  compactInfo: {
    flex: 1,
    justifyContent: "center",
  },
  infoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginRight: 6,
  },
  compactYear: {
    fontSize: 12,
    color: COLORS.gray[400],
    fontWeight: "500",
  },
  priceWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  compactPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.gold[500],
  },
  compactPriceUnit: {
    fontSize: 11,
    color: COLORS.gray[400],
    marginLeft: 2,
    fontWeight: "500",
  },
  infoMiddle: {
    flexDirection: "row",
    alignItems: "center",
  },
  plateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  compactPlate: {
    fontSize: 10,
    color: COLORS.gray[400],
    fontWeight: "700",
    textTransform: "uppercase",
    marginLeft: 4,
  },
  statusPillWrapper: {
  },
  compactPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pillLive: {
    backgroundColor: COLORS.emerald[500] + '15',
    borderColor: COLORS.emerald[400] + '30',
  },
  pillPending: {
    backgroundColor: COLORS.gold[500] + '15',
    borderColor: COLORS.gold[500] + '30',
  },
  pillRejected: {
    backgroundColor: '#EF444415',
    borderColor: '#EF444430',
  },
  pillSuspended: {
    backgroundColor: '#F9731615',
    borderColor: '#F9731630',
  },
  pillHidden: {
    backgroundColor: COLORS.navy[700],
    borderColor: COLORS.navy[600],
  },
  compactRejectionText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: "500",
  },
  chevronWrapper: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
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
    overflow: "hidden",
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: COLORS.navy[900],
    fontSize: 15,
    fontWeight: "700",
  },
});
