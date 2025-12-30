// app/kyc/index.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import kycService from "../../services/kycService";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SuccessModal from "../../components/common/SuccessModal";

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
  gray: {
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
  },
  white: "#FFFFFF",
  black: "#000000",
};

export default function KycScreen() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const { kycStatus, refreshKycStatus, user, redirectByRole } = useAuth();
  const { role: urlRole } = useLocalSearchParams(); // Get role from URL query params
  const { showAlert } = useAlert();
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allowReupload, setAllowReupload] = useState(false); // For pending state re-upload

  const [images, setImages] = useState({
    id_front: null,
    id_back: null,
    live_selfie: null,
    driving_license: null,
  });

  const pickFromGallery = async (field) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // Updated from deprecated MediaTypeOptions.Images
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        // Validation: 5MB Limit to match backend/Cloudinary
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (asset.fileSize && asset.fileSize > MAX_SIZE) {
          showAlert({
            title: "File Too Large",
            message: "Please choose an image smaller than 5MB.",
            type: "warning",
          });
          return;
        }

        setImages((prev) => ({ ...prev, [field]: asset }));
      }
    } catch (error) {
      console.log("Gallery Error:", error);
      showAlert({
        title: "Error",
        message: "Could not open gallery.",
        type: "error",
      });
    }
  };

  const captureFromCamera = async (field) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (permission.granted === false) {
        showAlert({
          title: "Permission Required",
          message: "You need to allow camera access to take a selfie.",
          type: "warning",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        // Validation: 5MB Limit
        const MAX_SIZE = 5 * 1024 * 1024;
        if (asset.fileSize && asset.fileSize > MAX_SIZE) {
          showAlert({
            title: "File Too Large",
            message: "Please take another photo.",
            type: "warning",
          });
          return;
        }

        setImages((prev) => ({ ...prev, [field]: asset }));
      }
    } catch (error) {
      console.log("Camera Error:", error);
      showAlert({
        title: "Error",
        message: "Could not open camera.",
        type: "error",
      });
    }
  };

  const handleSubmit = async () => {
    if (
      !images.id_front ||
      !images.id_back ||
      !images.live_selfie ||
      !images.driving_license
    ) {
      showAlert({
        title: "Missing Documents",
        message: "Please upload all 4 required documents.",
        type: "warning",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      const appendFile = (key, asset) => {
        const uriParts = asset.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append(key, {
          uri: asset.uri,
          name: `${key}.${fileType}`,
          type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        });
      };

      appendFile("id_front", images.id_front);
      appendFile("id_back", images.id_back);
      appendFile("live_selfie", images.live_selfie);
      appendFile("driving_license", images.driving_license);

      await kycService.submitUserKyc(formData);

      // Show success modal instead of alert
      await refreshKycStatus();
      setShowSuccess(true);
    } catch (error) {
      console.log("KYC Upload Error:", error);
      showAlert({
        title: "Upload Failed",
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    // Use role from URL params as fallback if user.role is undefined
    const roleToUse = user?.role || urlRole;
    console.log(
      "KYC handleSkip - user?.role:",
      user?.role,
      "urlRole:",
      urlRole,
      "using:",
      roleToUse
    );
    redirectByRole(roleToUse);
  };
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate progress
  const uploadedCount = Object.values(images).filter(Boolean).length;
  const progress = (uploadedCount / 4) * 100;

  // ============================================
  // 📊 PENDING STATE
  // ============================================
  if (kycStatus === "pending" && !allowReupload) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.navy[900]}
        />
        <Stack.Screen options={{ headerShown: false }} />

        <LinearGradient
          colors={[COLORS.navy[900], COLORS.navy[800]]}
          style={styles.gradient}
        />

        <Animated.View
          style={[
            styles.statusContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.statusIconContainer}>
            <LinearGradient
              colors={[COLORS.gold[400], COLORS.gold[600]]}
              style={styles.statusIconGradient}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={60}
                color={COLORS.navy[900]}
              />
            </LinearGradient>
          </View>

          <Text style={styles.statusTitle}>Verification Pending</Text>
          <Text style={styles.statusSubtitle}>
            Your documents are under review.{"\n"}We'll notify you once
            verified.
          </Text>

          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={COLORS.gold[500]}
            />
            <Text style={styles.infoText}>Usually takes 24-48 hours</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={COLORS.navy[900]}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Button - Update Documents */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setAllowReupload(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={COLORS.gold[500]}
            />
            <Text style={styles.secondaryButtonText}>Update Documents</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ============================================
  // ✅ APPROVED STATE
  // ============================================
  if (kycStatus === "approved") {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.navy[900]}
        />
        <Stack.Screen options={{ headerShown: false }} />

        <LinearGradient
          colors={[COLORS.navy[900], COLORS.navy[800]]}
          style={styles.gradient}
        />

        <Animated.View
          style={[
            styles.statusContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.statusIconContainer}>
            <LinearGradient
              colors={[COLORS.emerald[400], COLORS.emerald[500]]}
              style={styles.statusIconGradient}
            >
              <Ionicons
                name="checkmark-circle"
                size={60}
                color={COLORS.white}
              />
            </LinearGradient>
          </View>

          <Text style={styles.statusTitle}>You're Verified! 🎉</Text>
          <Text style={styles.statusSubtitle}>
            Your identity has been confirmed.{"\n"}You can now access all
            features.
          </Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: COLORS.emerald[500] + "15" },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={COLORS.emerald[500]}
            />
            <Text style={[styles.infoText, { color: COLORS.emerald[500] }]}>
              Trusted & Secure Account
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.emerald[400], COLORS.emerald[500]]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.primaryButtonText, { color: COLORS.white }]}>
                Continue to App
              </Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ============================================
  // 📄 SUBMISSION FORM (Default State)
  // ============================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        title="Documents Submitted! 🎉"
        message="Your verification will be completed within 24-48 hours. You'll receive a notification once approved.\n\nYou can continue using the app in the meantime."
        buttonText="Go to Dashboard"
        onNext={() => {
          setShowSuccess(false);
          redirectByRole(user?.role || urlRole);
        }}
      />

      <Stack.Screen
        options={{
          headerShown: true,
          title:
            kycStatus === "pending" && allowReupload
              ? "Update Documents"
              : "Identity Verification",
          headerStyle: { backgroundColor: COLORS.navy[900] },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "600" },
          headerLeft:
            kycStatus === "pending" && allowReupload
              ? () => (
                  <TouchableOpacity
                    onPress={() => setAllowReupload(false)}
                    style={{
                      paddingLeft: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                )
              : undefined,
          headerRight: () => (
            <TouchableOpacity onPress={handleSkip} style={{ paddingRight: 8 }}>
              <Text
                style={{
                  color: COLORS.gold[500],
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Skip
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.gradient}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={[COLORS.gold[400], COLORS.gold[600]]}
              style={styles.headerIconGradient}
            >
              <MaterialCommunityIcons
                name="shield-account"
                size={28}
                color={COLORS.navy[900]}
              />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>
            Upload your documents to unlock all features and start{" "}
            {user?.role === "host" ? "listing cars" : "booking rides"}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {uploadedCount} of 4 documents uploaded
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                },
              ]}
            >
              <LinearGradient
                colors={[COLORS.gold[400], COLORS.gold[600]]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        </View>

        {/* Upload Blocks */}
        <UploadBlock
          label="ID Card (Front)"
          description="Clear photo of front side"
          image={images.id_front}
          onPress={() => pickFromGallery("id_front")}
          onRemove={() => setImages((prev) => ({ ...prev, id_front: null }))}
          icon="card-account-details"
          iconType="gallery"
        />

        <UploadBlock
          label="ID Card (Back)"
          description="Clear photo of back side"
          image={images.id_back}
          onPress={() => pickFromGallery("id_back")}
          onRemove={() => setImages((prev) => ({ ...prev, id_back: null }))}
          icon="card-account-details-outline"
          iconType="gallery"
        />

        <UploadBlock
          label="Live Selfie"
          description="Take a selfie for face verification"
          image={images.live_selfie}
          onPress={() => captureFromCamera("live_selfie")}
          onRemove={() => setImages((prev) => ({ ...prev, live_selfie: null }))}
          icon="face-recognition"
          iconType="camera"
        />

        <UploadBlock
          label="Driving License"
          description="Valid driving license"
          image={images.driving_license}
          onPress={() => pickFromGallery("driving_license")}
          onRemove={() =>
            setImages((prev) => ({ ...prev, driving_license: null }))
          }
          icon="card-account-details-star"
          iconType="gallery"
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.primaryButton, uploading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              uploading
                ? [COLORS.gray[600], COLORS.gray[600]]
                : [COLORS.gold[500], COLORS.gold[600]]
            }
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {uploading ? (
              <ActivityIndicator color={COLORS.navy[900]} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Submit Documents</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.navy[900]}
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>I'll do this later</Text>
        </TouchableOpacity>

        {/* Info Footer */}
        <View style={styles.footerInfo}>
          <Ionicons name="lock-closed" size={16} color={COLORS.gray[500]} />
          <Text style={styles.footerInfoText}>
            Your documents are encrypted and stored securely
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// 📦 UPLOAD BLOCK COMPONENT
// ============================================
function UploadBlock({
  label,
  description,
  image,
  onPress,
  onRemove,
  icon,
  iconType,
}) {
  return (
    <View style={styles.uploadBlock}>
      <View style={styles.uploadHeader}>
        <View>
          <Text style={styles.uploadLabel}>{label}</Text>
          <Text style={styles.uploadDescription}>{description}</Text>
        </View>
        {image && (
          <View style={styles.uploadedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.emerald[500]}
            />
            <Text style={styles.uploadedText}>Uploaded</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.uploadBox}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {image ? (
          <>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onRemove}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.removeButtonGradient}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.changeOverlay}>
              <Ionicons
                name={iconType === "camera" ? "camera" : "images"}
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.changeText}>Change</Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIconContainer}>
              <MaterialCommunityIcons
                name={icon}
                size={40}
                color={COLORS.gold[500]}
              />
            </View>
            <Text style={styles.uploadText}>
              {iconType === "camera" ? "Open Camera" : "Choose from Gallery"}
            </Text>
            <View style={styles.uploadTypeIndicator}>
              <Ionicons
                name={
                  iconType === "camera" ? "camera-outline" : "image-outline"
                }
                size={16}
                color={COLORS.gray[500]}
              />
              <Text style={styles.uploadTypeText}>
                {iconType === "camera" ? "Camera" : "Gallery"}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
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
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  headerIconContainer: {
    marginBottom: 16,
  },
  headerIconGradient: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Progress
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.gray[400],
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 13,
    color: COLORS.gold[500],
    fontWeight: "700",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.navy[700],
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 8,
  },

  // Upload Block
  uploadBlock: {
    marginBottom: 20,
  },
  uploadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  uploadLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 3,
  },
  uploadDescription: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  uploadedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.emerald[500] + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  uploadedText: {
    fontSize: 11,
    color: COLORS.emerald[500],
    fontWeight: "600",
  },
  uploadBox: {
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.navy[600],
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.navy[800],
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    alignItems: "center",
  },
  placeholderIconContainer: {
    marginBottom: 12,
  },
  uploadText: {
    color: COLORS.gray[400],
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  uploadTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
  },
  uploadTypeText: {
    fontSize: 11,
    color: COLORS.gray[500],
    fontWeight: "500",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  removeButtonGradient: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  changeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  changeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },

  // Buttons
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy[900],
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 15,
    color: COLORS.gray[400],
    fontWeight: "500",
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "transparent",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.gold[500],
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.gold[500],
  },

  // Footer Info
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  footerInfoText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },

  // Status Screens
  statusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  statusIconContainer: {
    marginBottom: 24,
  },
  statusIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 12,
    textAlign: "center",
  },
  statusSubtitle: {
    fontSize: 15,
    color: COLORS.gray[400],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gold[500] + "15",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 12,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gold[500],
    fontWeight: "600",
  },
});
