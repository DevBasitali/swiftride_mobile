import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // ✅ Import router

export default function HostProfile() {
  const { user, logout, kycStatus } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
            <LinearGradient colors={['#141E30', '#243B55']} style={styles.gradientHeader} />
            <View style={styles.profileContent}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{user?.fullName?.[0] || 'H'}</Text>
                    {kycStatus === 'approved' && (
                        <View style={styles.verifiedBadge}><Ionicons name="checkmark" size={12} color="#fff" /></View>
                    )}
                </View>
                <Text style={styles.name}>{user?.fullName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.tag}><Text style={styles.tagText}>SUPERHOST</Text></View>
            </View>
        </View>

        {/* MENU */}
        <View style={styles.menuWrapper}>
            <Text style={styles.menuHeader}>Business Tools</Text>
            <MenuItem icon="wallet-outline" label="Payout Settings" color="#4A90E2" onPress={() => {}} />
            <MenuItem icon="bar-chart-outline" label="Performance" color="#50E3C2" onPress={() => {}} />
            
            <Text style={styles.menuHeader}>Security</Text>
            {/* ✅ KYC NAVIGATION ADDED HERE */}
            <MenuItem 
              icon="shield-checkmark-outline" 
              label="Identity Verification" 
              status={kycStatus} 
              color="#9013FE" 
              onPress={() => router.push('/kyc')} 
            />
            <MenuItem icon="lock-closed-outline" label="Change Password" color="#F5A623" onPress={() => {}} />
            
            <Text style={styles.menuHeader}>Support</Text>
            <MenuItem icon="chatbubbles-outline" label="Help Center" color="#FF5A5F" onPress={() => {}} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ✅ Updated to accept onPress
function MenuItem({ icon, label, status, color, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {status && <Text style={[styles.status, status === 'approved' ? styles.stGreen : styles.stOrange]}>{status}</Text>}
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  gradientHeader: { width: '100%', height: 150, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  profileContent: { marginTop: -60, alignItems: 'center' },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, elevation: 5, marginBottom: 10 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#141E30' },
  verifiedBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#4CAF50', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  
  name: { fontSize: 24, fontWeight: 'bold', color: '#141E30' },
  email: { fontSize: 14, color: '#888', marginBottom: 8 },
  tag: { backgroundColor: '#141E30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  menuWrapper: { paddingHorizontal: 20 },
  menuHeader: { fontSize: 14, fontWeight: '700', color: '#aaa', marginBottom: 10, marginTop: 10, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  
  status: { fontSize: 12, marginRight: 8, textTransform: 'capitalize' },
  stGreen: { color: 'green' },
  stOrange: { color: 'orange' },

  logoutBtn: { marginHorizontal: 20, marginTop: 20, padding: 16, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#ffebee' },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold' }
});