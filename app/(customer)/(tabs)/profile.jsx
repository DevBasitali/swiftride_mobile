// app/(customer)/(tabs)/profile.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  navy: { 900: '#0A1628', 800: '#0F2137', 700: '#152A46' },
  gold: { 500: '#F59E0B' },
  white: '#FFFFFF',
  gray: { 400: '#9CA3AF' },
  red: { 500: '#EF4444' }
};

export default function CustomerProfile() {
  const { user, logout, kycStatus } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        {/* Header */}
        <LinearGradient colors={[COLORS.navy[900], COLORS.navy[800]]} style={styles.header}>
          <SafeAreaView edges={['top']} style={styles.headerContent}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{user?.fullName?.[0] || 'C'}</Text>
              {kycStatus === 'approved' && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color={COLORS.white} />
                </View>
              )}
            </View>
            <Text style={styles.name}>{user?.fullName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>RENTER</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem icon="person-outline" label="Personal Info" onPress={() => {}} />
          <MenuItem 
            icon="shield-checkmark-outline" 
            label="KYC Verification" 
            status={kycStatus} 
            onPress={() => router.push('/kyc')} 
          />
          <MenuItem icon="card-outline" label="Payment Methods" onPress={() => {}} />

          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem icon="help-circle-outline" label="Help Center" onPress={() => {}} />
          <MenuItem icon="document-text-outline" label="Terms of Service" onPress={() => {}} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.red[500]} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label, status, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color={COLORS.white} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {status && (
          <Text style={[styles.statusText, status==='approved' ? {color:'#10B981'} : {color:'#F59E0B'}]}>
            {status}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={18} color={COLORS.gray[400]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  header: { paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { alignItems: 'center', paddingTop: 20 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.gold[500], justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.navy[900] },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10B981', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.navy[900] },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  email: { fontSize: 14, color: COLORS.gray[400], marginTop: 2 },
  roleBadge: { backgroundColor: COLORS.navy[700], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  roleText: { color: COLORS.gold[500], fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  menuContainer: { padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gray[400], marginBottom: 12, marginTop: 10, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.navy[800], padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.navy[700] },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, backgroundColor: COLORS.navy[700], borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: COLORS.navy[800], padding: 16, borderRadius: 14, marginHorizontal: 20, marginTop: 10, borderWidth: 1, borderColor: COLORS.red[500] + '40' },
  logoutText: { color: COLORS.red[500], fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: COLORS.gray[400], fontSize: 12, marginTop: 20 },
});