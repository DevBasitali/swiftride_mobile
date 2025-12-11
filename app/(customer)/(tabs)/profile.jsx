import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CustomerProfile() {
  const { user, logout, kycStatus } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.fullName?.[0] || 'U'}</Text>
          {kycStatus === 'approved' && (
            <View style={styles.verifiedBadge}>
              <FontAwesome name="check" size={10} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleTag}><Text style={styles.roleText}>Customer</Text></View>
      </View>

      {/* MENU */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <MenuItem 
          icon="person-outline" 
          label="Personal Information" 
          onPress={() => {}} 
        />
        
        <MenuItem 
          icon="document-text-outline" 
          label="KYC Verification" 
          status={kycStatus}
          onPress={() => router.push('/kyc')} 
        />

        <MenuItem 
          icon="card-outline" 
          label="Payment Methods" 
          onPress={() => {}} 
        />

        <Text style={styles.sectionTitle}>Support</Text>
        
        <MenuItem 
          icon="help-circle-outline" 
          label="Help Center" 
          onPress={() => {}} 
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.version}>v1.0.0 • Customer App</Text>
    </ScrollView>
  );
}

// Reusable Menu Item
function MenuItem({ icon, label, status, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color="#333" />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {status && (
          <Text style={[styles.statusText, status === 'approved' ? {color:'green'} : {color:'orange'}]}>
            {status}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#fff', paddingVertical: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4CAF50', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666', marginBottom: 8 },
  roleTag: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { color: '#007AFF', fontSize: 12, fontWeight: 'bold' },
  
  menuContainer: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 10, marginTop: 10, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 12, marginBottom: 10 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { marginRight: 15 },
  menuLabel: { fontSize: 16, color: '#333' },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 12, marginRight: 10, textTransform: 'capitalize' },
  
  logoutBtn: { marginHorizontal: 20, marginTop: 20, padding: 15, alignItems: 'center', backgroundColor: '#FFEBEE', borderRadius: 12 },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold' },
  version: { textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: 30, marginBottom: 50 },
});