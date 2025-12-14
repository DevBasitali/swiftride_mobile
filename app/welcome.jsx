import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  background: '#0A1628',
  gold: '#F59E0B',
  white: '#FFFFFF',
  gray: '#94A3B8'
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        {/* Updated Name */}
        <Text style={styles.brandName}>
          SWIFT<Text style={styles.brandAccent}>RIDE</Text>
        </Text>
        <Text style={styles.subtitle}>
          Experience the future of peer-to-peer car rental.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => router.push('/role-select')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Create Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Sign In</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms & Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    padding: 24,
    paddingVertical: 60,
  },
  header: {
    marginTop: 60,
  },
  welcomeText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
  brandName: {
    fontSize: 50, // Slightly smaller to fit "SWIFTRIDE"
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 64,
  },
  brandAccent: {
    color: COLORS.gold,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    maxWidth: '80%',
    lineHeight: 24,
  },
  actions: {
    gap: 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#0A1628',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 10,
  }
});