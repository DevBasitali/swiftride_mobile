import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../context/AlertContext';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AlertProvider>
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
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </AlertProvider>
    </AuthProvider>
  );
}