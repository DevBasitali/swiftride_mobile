import { View, Text, StyleSheet, Image } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  background: '#040B16',
  cardDark: '#0A1628',
  gold: '#F59E0B',
  white: '#FFFFFF',
  gray: '#94A3B8',
};

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Exact same static final state as the splash screen
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.background, COLORS.cardDark, '#020617']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
           <Image 
             source={require('../assets/images/splash-logo.png')} 
             style={styles.logo}
             resizeMode="contain"
           />
          <Text style={styles.brandText}>
            SWIFT<Text style={styles.brandAccent}>RIDE</Text>
          </Text>
          <Text style={styles.tagline}>PREMIUM LUXURY RENTALS</Text>
        </View>
      </View>
    );
  }

  // ✅ 1. If Logged In: Go to Dashboard
  if (user) {
    return user.role === 'host' || user.role === 'showroom' 
      ? <Redirect href="/(host)/(tabs)" /> 
      : <Redirect href="/(customer)/(tabs)" />;
  }

  // ✅ 2. If Not Logged In: Start the App Flow (Splash -> Onboarding)
  return <Redirect href="/splash" />;
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
  logo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  brandText: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 6,
    marginBottom: 12,
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
});