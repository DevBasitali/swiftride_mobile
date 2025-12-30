// app/(host)/bookings/handover-photos.jsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { submitPickup, submitReturn } from "../../../services/handoverService";
import { useAlert } from "../../../context/AlertContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46" },
  gold: { 500: "#F59E0B" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF" },
  success: "#10B981",
  danger: "#EF4444",
};

const PHOTO_LABELS = [
  { key: "front", label: "Front View" },
  { key: "back", label: "Back View" },
  { key: "left", label: "Left Side" },
  { key: "right", label: "Right Side" },
];

export default function HandoverPhotosScreen() {
  const { bookingId, step, customerName, carName } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const { showAlert } = useAlert();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
  const cameraRef = useRef(null);

  const isPickup = step === "pickup";
  const minPhotos = 4;

  const takePhoto = async () => {
    if (!cameraRef.current) {
      showAlert({ title: "Error", message: "Camera not ready", type: "error" });
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      const newPhoto = {
        uri: photo.uri,
        label:
          PHOTO_LABELS[photos.length]?.label || `Photo ${photos.length + 1}`,
      };
      setPhotos([...photos, newPhoto]);
    } catch (error) {
      console.log("Camera error:", error);
      showAlert({
        title: "Error",
        message: "Failed to take photo. Please try again.",
        type: "error",
      });
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (photos.length < minPhotos) {
      showAlert({
        title: "More Photos Required",
        message: `Please take at least ${minPhotos} photos of the car.`,
        type: "warning",
      });
      return;
    }

    // Direct submission confirmation
    showAlert({
      title: isPickup ? "Start Trip?" : "Complete Trip?",
      message: isPickup
        ? "This will start the rental period. Make sure all photos are clear."
        : "This will complete the rental and release payment to your wallet.",
      type: "info",
      buttons: [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: submitPhotos },
      ],
    });
  };

  const submitPhotos = async () => {
    setUploadStatus("uploading");

    try {
      const formData = new FormData();
      photos.forEach((photo, index) => {
        formData.append("images", {
          uri: photo.uri,
          type: "image/jpeg",
          name: `${step}_photo_${index + 1}.jpg`,
        });
      });

      if (isPickup) {
        await submitPickup(bookingId, formData);
      } else {
        await submitReturn(bookingId, formData);
      }

      setUploadStatus("success");

      // Auto redirect after short delay
      setTimeout(() => {
        router.replace(`/(host)/bookings/${bookingId}`);
      }, 1500);
    } catch (error) {
      console.log("Submit error:", error.response?.data || error.message);
      setUploadStatus("error");

      // Keep error state for a moment then show alert
      setTimeout(() => {
        setUploadStatus("idle");
        showAlert({
          title: "Upload Failed",
          message:
            error.response?.data?.message ||
            "Please check your connection and try again.",
          type: "error",
        });
      }, 1500);
    }
  };

  // Permission loading
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="camera-outline" size={64} color={COLORS.danger} />
        <Text style={styles.permissionText}>Camera access required</Text>
        <Text style={styles.permissionSubtext}>
          We need camera access to take photos of the car condition.
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

      {/* Header */}
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
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {isPickup ? "Pickup Photos" : "Return Photos"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {carName} • {customerName}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {photos.length}/{minPhotos}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Camera Section */}
      <View style={styles.cameraSection}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />

        {/* Overlay on top of camera */}
        <View style={styles.cameraOverlay}>
          {/* Guide text */}
          {photos.length < PHOTO_LABELS.length && (
            <View style={styles.guideBox}>
              <Text style={styles.guideText}>
                📸 Take {PHOTO_LABELS[photos.length]?.label || "Photo"}
              </Text>
            </View>
          )}

          {/* Capture button */}
          <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
            <View style={styles.captureBtnOuter}>
              <View style={styles.captureBtnInner} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Photo Preview Strip */}
      <View style={styles.previewSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.previewScroll}
        >
          {photos.map((photo, index) => (
            <View key={index} style={styles.previewItem}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close" size={14} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.previewLabel}>{photo.label}</Text>
            </View>
          ))}

          {photos.length < 8 && (
            <TouchableOpacity
              style={styles.addMorePlaceholder}
              onPress={takePhoto}
            >
              <Ionicons name="add" size={24} color={COLORS.gray[400]} />
              <Text style={styles.addMoreText}>Add</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            photos.length < minPhotos && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || photos.length < minPhotos}
        >
          <Ionicons
            name={isPickup ? "car-sport" : "checkmark-circle"}
            size={20}
            color={COLORS.navy[900]}
          />
          <Text style={styles.submitBtnText}>
            {isPickup ? "Start Trip" : "Complete Trip"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Upload Overlay */}
      <Modal
        visible={uploadStatus !== "idle"}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.overlayContainer}>
          <View style={styles.overlayContent}>
            {uploadStatus === "uploading" && (
              <>
                <ActivityIndicator size="large" color={COLORS.gold[500]} />
                <Text style={styles.overlayTitle}>Uploading Photos...</Text>
                <Text style={styles.overlaySubtitle}>
                  Please do not close the app
                </Text>
              </>
            )}

            {uploadStatus === "success" && (
              <>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="checkmark"
                    size={40}
                    color={COLORS.navy[900]}
                  />
                </View>
                <Text style={styles.overlayTitle}>Success!</Text>
                <Text style={styles.overlaySubtitle}>
                  Redirecting to dashboard...
                </Text>
              </>
            )}

            {uploadStatus === "error" && (
              <>
                <View
                  style={[
                    styles.successIcon,
                    { backgroundColor: COLORS.danger },
                  ]}
                >
                  <Ionicons name="close" size={40} color={COLORS.white} />
                </View>
                <Text style={styles.overlayTitle}>Upload Failed</Text>
                <Text style={styles.overlaySubtitle}>Something went wrong</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  },
  permissionBtn: {
    marginTop: 24,
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: COLORS.navy[900],
    fontWeight: "700",
    fontSize: 16,
  },

  // Header
  header: {
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: COLORS.navy[900],
    fontWeight: "700",
    fontSize: 14,
  },

  // Camera
  cameraSection: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  guideBox: {
    backgroundColor: COLORS.navy[900] + "DD",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  guideText: {
    color: COLORS.gold[500],
    fontSize: 16,
    fontWeight: "600",
  },
  captureBtn: {
    marginBottom: 10,
  },
  captureBtnOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
  },

  // Preview
  previewSection: {
    backgroundColor: COLORS.navy[800],
    paddingVertical: 12,
  },
  previewScroll: {
    paddingHorizontal: 16,
  },
  previewItem: {
    marginRight: 12,
    alignItems: "center",
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gold[500],
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  previewLabel: {
    color: COLORS.gray[400],
    fontSize: 10,
    marginTop: 4,
  },
  addMorePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.navy[700],
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreText: {
    color: COLORS.gray[400],
    fontSize: 10,
    marginTop: 2,
  },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: COLORS.navy[800],
    paddingBottom: 24,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.gold[500],
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: COLORS.navy[900],
    fontSize: 16,
    fontWeight: "700",
  },

  // Overlay
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(10, 22, 40, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: {
    backgroundColor: COLORS.navy[800],
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    width: "80%",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 20,
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gold[500],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
});
