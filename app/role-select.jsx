import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// 🎨 Standalone Theme
const COLORS = {
  background: '#0A1628',
  card: '#1E3A5F',
  gold: '#F59E0B',
  emerald: '#10B981',
  white: '#FFFFFF',
  gray: '#94A3B8',
  border: '#2A4A73'
};

export default function RoleSelectionScreen() {
  const router = useRouter();

  const handleRoleSelect = (role) => {
    router.push({
      pathname: '/(auth)/register',
      params: { role: role } 
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Account Type</Text>
      </View>

      <Text style={styles.subtitle}>How do you want to use CarRent?</Text>

      <View style={styles.cards}>
        {/* Renter */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => handleRoleSelect('renter')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="car-sport" size={32} color={COLORS.gold} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I want to Rent</Text>
            <Text style={styles.cardDesc}>Find the perfect car for your trip and book instantly.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        {/* Host */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => handleRoleSelect('host')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="key" size={32} color={COLORS.emerald} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I want to Host</Text>
            <Text style={styles.cardDesc}>List your car, set your price, and start earning money.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 32,
  },
  cards: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
});