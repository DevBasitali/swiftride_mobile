import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { AlertProvider } from "../context/AlertContext";
import { SocketProvider } from "../context/SocketContext";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Location from "expo-location";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Request Global Permissions on App Start
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
        }
      } catch (e) {
        console.log("Error requesting permissions:", e);
      }
    })();
  }, []);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AlertProvider>
        <SocketProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Entry Flow */}
            <Stack.Screen name="index" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="role-select" />

            {/* Auth Modules */}
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(customer)" />
            <Stack.Screen name="(host)" />

            {/* Specific Screens */}
            <Stack.Screen name="kyc/index" />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </SocketProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
