// app/(host)/bookings/scan.jsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { scanQR } from "../../../services/handoverService";
import { useAlert } from "../../../context/AlertContext";

const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46" },
  gold: { 500: "#F59E0B" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF" },
  success: "#10B981",
  danger: "#EF4444",
};

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { showAlert } = useAlert();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    Vibration.vibrate(100);

    try {
      console.log("📱 Scanned QR:", data.substring(0, 20) + "...");

      const response = await scanQR(data);
      const result = response.data || response;

      console.log("✅ QR Verified:", result);

      // Navigate to photo capture with result
      router.push({
        pathname: "/(host)/bookings/handover-photos",
        params: {
          bookingId: result.bookingId,
          step: result.step, // 'pickup' or 'return'
          customerName: result.customerName,
          carName: result.carName,
        },
      });
    } catch (error) {
      console.log("❌ Scan error:", error.response?.data || error.message);
      showAlert({
        title: "Invalid QR Code",
        message:
          error.response?.data?.message ||
          "This QR code is not valid or the booking is not in the correct state.",
        type: "error",
        buttons: [{ text: "Try Again", onPress: () => setScanned(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="camera-off" size={64} color={COLORS.danger} />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera access to scan QR codes.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Camera View with Barcode Scanning */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Handover QR</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        {/* Scanner Frame */}
        <View style={styles.scannerFrame}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <LinearGradient
            colors={[COLORS.navy[900] + "CC", COLORS.navy[900]]}
            style={styles.instructions}
          >
            <Ionicons
              name="qr-code-outline"
              size={24}
              color={COLORS.gold[500]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.instructionTitle}>
                {loading ? "Verifying..." : "Point camera at customer's QR"}
              </Text>
              <Text style={styles.instructionSubtext}>
                The customer will show you their booking QR code
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  permissionSubtext: {
    color: COLORS.gray[400],
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  permissionBtn: {
    marginTop: 20,
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: COLORS.navy[900],
    fontWeight: "700",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: COLORS.navy[900] + "CC",
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
  scannerFrame: {
    width: 280,
    height: 280,
    alignSelf: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: COLORS.gold[500],
    borderTopWidth: 4,
    borderLeftWidth: 4,
    top: 0,
    left: 0,
  },
  topRight: {
    right: 0,
    left: undefined,
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    top: undefined,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: undefined,
    left: undefined,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionsContainer: {
    padding: 20,
  },
  instructions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  instructionSubtext: {
    fontSize: 13,
    color: COLORS.gray[400],
    marginTop: 2,
  },
});
