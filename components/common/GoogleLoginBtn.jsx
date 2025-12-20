import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
} from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Ionicons } from "@expo/vector-icons";
import { googleLoginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

GoogleSignin.configure({
  webClientId:
    "400619671340-ndjjdcr3fs8bsalutjb9ldqs1egma49v.apps.googleusercontent.com",
  offlineAccess: true,
  scopes: ["profile", "email"],
});

const GoogleLoginBtn = ({ role = "customer" }) => {
  const { handleGoogleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();

      // Force sign out to ensure account picker appears
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        // Ignore if already signed out
      }

      // Open Google Picker
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        console.log(`Authenticating as ${role}...`);

        // 1. Send token to backend
        const response = await googleLoginRequest(idToken, role);
        // console.log("Backend Response:", JSON.stringify(response, null, 2));

        // ✅ 2. ROBUST EXTRACTION (The Fix)
        // Check both 'response.data.token' (your current backend) AND 'response.token'
        const data = response.data || response;
        const token = data.token || data.accessToken || response.token;
        const user = data.user || response.user;

        console.log("🔹 EXTRACTED:", {
          token: token ? "Found" : "Missing",
          user: user ? "Found" : "Missing",
        });

        // 3. Hand off to context
        if (token && user) {
          await handleGoogleLogin(token, user);
        } else {
          Alert.alert("Login Error", "Server returned an invalid response structure.");
        }
      }
    } catch (error) {
      console.log("Google Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled login");
      } else {
        Alert.alert("Google Login Error", error.message || "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.socialButton}
      activeOpacity={0.7}
      onPress={signIn}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons name="logo-google" size={22} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
};

// Updated styles to match your Login/Register "Square" look
const styles = StyleSheet.create({
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#152A46", // COLORS.navy[700]
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E3A5F", // COLORS.navy[600]
  },
});

export default GoogleLoginBtn;