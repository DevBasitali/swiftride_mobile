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
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
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
      
      const { accessToken } = await GoogleSignin.getTokens();

      if (idToken) {
        console.log(`Authenticating with role: ${role || "none"}...`);

        try {
          const response = await googleLoginRequest(idToken, role, accessToken);
          const data = response.data || response;

          // Check all possible "no account" scenarios
          if (
            data.success === false ||
            data.code === 400 ||
            data.requiresSignup ||
            (!data.token && !data.accessToken && !data.user)
          ) {
            showAlert({
              title: "No Account Found",
              message: "You don't have an account yet. Please register first to continue.",
              type: "info",
              buttons: [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Register",
                  onPress: () => router.replace("/(auth)/register")
                }
              ]
            });
            return;
          }

          const token = data.token || data.accessToken || response.token;
          const user = data.user || response.user;

          if (token && user) {
            await handleGoogleLogin(token, user);
          }

        } catch (apiError) {
          showAlert({
            title: "No Account Found",
            message: "You don't have an account yet. Please register first to continue.",
            type: "info",
            buttons: [
              { text: "Cancel", style: "cancel" },
              {
                text: "Register",
                onPress: () => router.replace("/(auth)/register")
              }
            ]
          });
        }
      }
    } catch (error) {
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.message?.includes("getTokens requires") ||
        error.message?.includes("Sign in action cancelled")
      ) {
        // User backed out of the Google account picker — not an error
        console.log("User cancelled login");
      } else {
        console.error("FULL_ERROR:", JSON.stringify(error), 
"CODE:", error.code, 
"MSG:", error.message);
        showAlert({
          title: "Login Failed",
          message: "Something went wrong while signing in with Google. Please try again.",
          type: "error",
        });
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