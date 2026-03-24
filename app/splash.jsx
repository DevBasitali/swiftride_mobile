import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn, useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#040B16', // deeper navy/black
  cardDark: '#0A1628',
  gold: '#F59E0B',
  white: '#FFFFFF',
  gray: '#94A3B8',
  silver: '#E2E8F0'
};

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function SplashScreen() {
  const router = useRouter();
  
  // Custom loader animation
  const loaderWidth = useSharedValue(0);

  useEffect(() => {
    // Start loader animation
    loaderWidth.value = withTiming(width * 0.6, { duration: 2500 });
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await SecureStore.getItemAsync(ONBOARDING_KEY);
      
      // Wait for branding impact
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (hasSeenOnboarding === 'true') {
        router.replace('/welcome');
      } else {
        router.replace('/(onboarding)');
      }
    } catch (error) {
      console.log('Error:', error);
      router.replace('/(onboarding)');
    }
  };

  const animatedLoaderStyle = useAnimatedStyle(() => {
    return {
      width: loaderWidth.value,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Metallic Gradient Background */}
      <LinearGradient
        colors={[COLORS.background, COLORS.cardDark, '#020617']}
        style={StyleSheet.absoluteFill}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Circular Logo Container */}
        <Animated.View entering={ZoomIn.delay(300).springify().damping(14)} style={styles.logoRing}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../assets/images/splash-logo.png')} 
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        {/* Brand Name */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(800).springify()}
          style={styles.brandContainer}
        >
          <Text style={styles.brandText}>
            SWIFT<Text style={styles.brandAccent}>RIDE</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text 
          entering={FadeIn.delay(1000).duration(800)}
          style={styles.tagline}
        >
          PREMIUM LUXURY RENTALS
        </Animated.Text>
      </View>

      {/* Sleek Loader Line */}
      <Animated.View 
        entering={FadeInDown.delay(1200).duration(600)}
        style={styles.loaderContainer}
      >
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderFill, animatedLoaderStyle]}>
             <LinearGradient
                colors={['#F59E0B', '#FBBF24', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
             />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    padding: 3,
    backgroundColor: COLORS.gold,
    marginBottom: 28,
    // Soft gold glow shadow
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoCircle: {
    flex: 1,
    borderRadius: 77,
    overflow: 'hidden',
    backgroundColor: COLORS.cardDark,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandContainer: {
    marginBottom: 12,
  },
  brandText: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 6,
  },
  brandAccent: {
    color: COLORS.gold,
  },
  tagline: {
    color: COLORS.gray,
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '600',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.6,
  },
  loaderTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    borderRadius: 2,
  },
});