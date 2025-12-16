import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, View } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { googleLoginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext"; // Import your Auth Context

GoogleSignin.configure({
  webClientId:
    "400619671340-ndjjdcr3fs8bsalutjb9ldqs1egma49v.apps.googleusercontent.com",
  offlineAccess: true,
  scopes: ["profile", "email"],
});

const GoogleLoginBtn = ({ role = "customer" }) => {
  const router = useRouter();
  const { setAuth } = useAuth(); // Helper to save user to state

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      // 👇 THIS IS THE MAGIC LINE 👇
      // Force sign out first so the "Choose Account" popup always appears
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        // Ignore error if user wasn't signed in
      }

      // Now open the picker
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        console.log(`Authenticating as ${role}...`);

        // 1. Send token to backend
        const response = await googleLoginRequest(idToken, role);
        console.log("Login Success:", response);

        // 2. Save user data using your context (IMPORTANT!)
        // This ensures the app "knows" you are logged in
        if (setAuth) {
          setAuth(response); // Adjust structure based on your Context
        }

        // 3. Navigate based on the returned user role
        // (Use the role from BACKEND response, not just the prop, to be safe)
        const userRole = response.data?.user?.role || role;

        if (userRole === "host") {
          router.replace("/(host)/(tabs)");
        } else {
          router.replace("/(customer)/(tabs)");
        }
      }
    } catch (error) {
      console.log("Google Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled
      } else {
        // Handle other errors
      }
    }
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={signIn}>
      {/* You can add a Google Icon image here if you have one */}
      <Text style={styles.text}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    borderRadius: 12, // Match your UI theme
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Ensure it fits the container
    marginTop: 0,
    flexDirection: "row",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default GoogleLoginBtn;
