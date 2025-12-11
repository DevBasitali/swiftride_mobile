import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HostProfile() {
  const { user, logout, kycStatus } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.fullName?.[0] || 'H'}</Text>
          </View>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.role}>Host Account</Text>
        </View>

        <TouchableOpacity style={styles.item} onPress={() => {}}>
          <Text style={styles.itemText}>Bank Details & Payouts</Text>
          <FontAwesome name="angle-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => router.push('/kyc')}>
          <Text style={styles.itemText}>Identity Verification ({kycStatus})</Text>
          <FontAwesome name="angle-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold' },
  role: { color: '#666', marginTop: 5 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10 },
  itemText: { fontSize: 16 },
  logoutBtn: { marginTop: 40, padding: 15, alignItems: 'center' },
  logoutText: { color: 'red', fontSize: 16, fontWeight: 'bold' },
});