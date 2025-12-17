import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Ionicons } from "@expo/vector-icons"; // Added for the icon
import { googleLoginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

GoogleSignin.configure({
  webClientId:
    "400619671340-ndjjdcr3fs8bsalutjb9ldqs1egma49v.apps.googleusercontent.com",
  offlineAccess: true,
  scopes: ["profile", "email"],
});

const GoogleLoginBtn = ({ role = "customer" }) => {
  // ✅ 1. Import the helper we created in AuthContext
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

        console.log("Backend Response:", response);

        // 2. ✅ HAND OFF TO CONTEXT (Crucial Step)
        // This ensures Headers are set and Token is saved BEFORE navigation
        if (response.token && response.user) {
          await handleGoogleLogin(response.token, response.user);
          // No need to navigate here; AuthContext handles it!
        } else {
          alert("Login failed: No token received");
        }
      }
    } catch (error) {
      console.log("Google Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled login");
      } else {
        alert("Google Login Error");
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
