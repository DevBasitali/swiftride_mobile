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
import { Ionicons } from "@expo/vector-icons";
import { googleLoginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { useAlert } from "../../context/AlertContext";

GoogleSignin.configure({
  webClientId:
    "400619671340-ndjjdcr3fs8bsalutjb9ldqs1egma49v.apps.googleusercontent.com",
  offlineAccess: true,
  scopes: ["profile", "email"],
});

const GoogleLoginBtn = ({ role }) => { // Removed default
  const { handleGoogleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  const signIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();

      try {
        await GoogleSignin.signOut();
      } catch (error) {
        // Ignore
      }

      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        console.log(`Authenticating with role: ${role || "none"}...`);

        try {
          const response = await googleLoginRequest(idToken, role);
          const data = response.data || response;

          if (data.requiresSignup) {
            showAlert({
              title: "Account Not Found",
              message: "Please select an account type to register.",
              type: "info",
              buttons: [
                { text: "Cancel", style: "cancel" },
                { text: "Select Role", onPress: () => router.push("/role-select") }
              ]
            });
            return;
          }

          const token = data.token || data.accessToken || response.token;
          const user = data.user || response.user;

          if (token && user) {
            await handleGoogleLogin(token, user);
          } else {
            showAlert({ title: "Login Error", message: "Invalid response.", type: "error" });
          }

        } catch (apiError) {
          if (apiError.response?.status === 404 && apiError.response.data?.requiresSignup) {
             showAlert({
              title: "Account Not Found",
              message: "Please select an account type to register.",
              type: "info",
              buttons: [
                { text: "Cancel", style: "cancel" },
                { text: "Select Role", onPress: () => router.push("/role-select") }
              ]
            });
            return;
          }
          throw apiError;
        }
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled login");
      } else {
        showAlert({ title: "Google Login Error", message: error.message, type: "error" });
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