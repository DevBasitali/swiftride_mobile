import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  background: '#0A1628',
  gold: '#F59E0B',
  white: '#FFFFFF',
  textDim: '#64748B'
};

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(onboarding)');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.logoContainer}>
        {/* Updated Name */}
        <Text style={styles.logoText}>
          SWIFT<Text style={styles.logoAccent}>RIDE</Text>
        </Text>
        <Text style={styles.tagline}>Premium P2P Car Rental</Text>
      </View>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
  },
  logoAccent: {
    color: COLORS.gold,
  },
  tagline: {
    color: COLORS.textDim,
    marginTop: 8,
    fontSize: 14,
    letterSpacing: 1,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
  }
});