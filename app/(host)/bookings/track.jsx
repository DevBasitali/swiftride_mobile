// app/(host)/bookings/track.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  connectSocket,
  joinTracking,
  onLocationUpdate,
  offLocationUpdate,
  disconnectSocket,
} from "../../../services/socketService";
import { useAlert } from "../../../context/AlertContext";

const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46" },
  gold: { 500: "#F59E0B" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF", 500: "#6B7280" },
  green: { 500: "#10B981" },
};

export default function TrackCarScreen() {
  const { bookingId, carName, customerName } = useLocalSearchParams();
  const { showAlert } = useAlert();
  const [carLocation, setCarLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();

    socket.on("connect", () => {
      setIsConnected(true);
      joinTracking(bookingId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    onLocationUpdate((data) => {
      console.log("📍 Received location:", data);
      if (data.bookingId === bookingId) {
        const newLocation = {
          latitude: data.lat,
          longitude: data.lng,
          heading: data.heading || 0,
        };
        setCarLocation(newLocation);
        setLastUpdate(new Date());

        mapRef.current?.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    });

    return () => {
      offLocationUpdate();
      disconnectSocket();
    };
  }, [bookingId]);

  const formatTime = (date) => {
    if (!date) return "Waiting for update...";
    return date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Track Car</Text>
            <Text style={styles.headerSub}>{carName}</Text>
          </View>
          <View
            style={[styles.statusDot, isConnected && styles.statusConnected]}
          />
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: carLocation?.latitude || 31.5204,
            longitude: carLocation?.longitude || 74.3587,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {carLocation && (
            <Marker
              coordinate={carLocation}
              title={carName}
              description={`Driven by ${customerName}`}
            >
              <View style={styles.carMarker}>
                <Ionicons name="car-sport" size={24} color={COLORS.gold[500]} />
              </View>
            </Marker>
          )}
        </MapView>

        <View style={styles.statusOverlay}>
          <View style={styles.statusRow}>
            <Ionicons
              name={isConnected ? "wifi" : "wifi-outline"}
              size={16}
              color={isConnected ? COLORS.green[500] : COLORS.gray[500]}
            />
            <Text style={styles.statusText}>
              {isConnected ? "Connected" : "Connecting..."}
            </Text>
          </View>
          <Text style={styles.lastUpdate}>
            Last update: {formatTime(lastUpdate)}
          </Text>
        </View>

        {!carLocation && (
          <View style={styles.waitingOverlay}>
            <ActivityIndicator size="large" color={COLORS.gold[500]} />
            <Text style={styles.waitingText}>Waiting for car location...</Text>
            <Text style={styles.waitingSubtext}>
              Location will appear when the driver starts their trip
            </Text>
          </View>
        )}
      </View>

      <View style={styles.driverInfo}>
        <View style={styles.driverAvatar}>
          <Ionicons name="person" size={24} color={COLORS.navy[900]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.driverName}>{customerName || "Driver"}</Text>
          <Text style={styles.driverStatus}>Currently driving</Text>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() =>
            showAlert({
              title: "Contact",
              message: "Call feature coming soon",
              type: "info",
            })
          }
        >
          <Ionicons name="call" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  header: { paddingBottom: 16, paddingHorizontal: 20 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  headerSub: { color: COLORS.gray[400], fontSize: 12 },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray[500],
  },
  statusConnected: { backgroundColor: COLORS.green[500] },
  mapContainer: { flex: 1, position: "relative" },
  map: { flex: 1 },
  carMarker: {
    backgroundColor: COLORS.navy[800],
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.gold[500],
  },
  statusOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: COLORS.navy[800] + "E6",
    padding: 12,
    borderRadius: 12,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },
  lastUpdate: { color: COLORS.gray[400], fontSize: 10, marginTop: 4 },
  waitingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.navy[900] + "CC",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  waitingText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },
  waitingSubtext: {
    color: COLORS.gray[400],
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[800],
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gold[500],
    justifyContent: "center",
    alignItems: "center",
  },
  driverName: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  driverStatus: { color: COLORS.green[500], fontSize: 12 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.green[500],
    justifyContent: "center",
    alignItems: "center",
  },
});
