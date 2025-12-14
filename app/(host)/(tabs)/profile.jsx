// app/(host)/(tabs)/profile.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// ============================================
// 🎨 INLINE THEME COLORS
// ============================================
const COLORS = {
  navy: {
    900: '#0A1628',
    800: '#0F2137',
    700: '#152A46',
    600: '#1E3A5F',
  },
  gold: {
    500: '#F59E0B',
    400: '#FBBF24',
  },
  emerald: {
    500: '#10B981',
  },
  blue: {
    500: '#3B82F6',
  },
  purple: {
    500: '#8B5CF6',
  },
  orange: {
    500: '#F97316',
  },
  red: {
    500: '#EF4444',
  },
  gray: {
    500: '#6B7280',
    400: '#9CA3AF',
  },
  white: '#FFFFFF',
};

export default function HostProfile() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const { user, logout, kycStatus } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout }
    ]);
  };
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  const getKycStatusColor = () => {
    switch (kycStatus) {
      case 'approved': return COLORS.emerald[500];
      case 'pending': return COLORS.orange[500];
      default: return COLORS.gray[500];
    }
  };

  const getKycStatusText = () => {
    switch (kycStatus) {
      case 'approved': return 'Verified';
      case 'pending': return 'Pending';
      default: return 'Unverified';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.navy[900], COLORS.navy[800]]}
          style={styles.gradientHeader}
        >
          <SafeAreaView edges={["top", "left", "right"]}>
            <View style={styles.headerContent}>
              {/* Avatar */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={[COLORS.gold[400], COLORS.gold[500]]}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>
                      {user?.fullName?.[0]?.toUpperCase() || 'H'}
                    </Text>
                  </LinearGradient>
                  {kycStatus === 'approved' && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={28} color={COLORS.emerald[500]} />
                    </View>
                  )}
                </View>

                <Text style={styles.name}>{user?.fullName || 'Host User'}</Text>
                <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>

                {/* Role Badge */}
                <View style={styles.roleBadgeContainer}>
                  <LinearGradient
                    colors={[COLORS.gold[500], COLORS.gold[400]]}
                    style={styles.roleBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <MaterialCommunityIcons name="crown" size={14} color={COLORS.navy[900]} />
                    <Text style={styles.roleBadgeText}>SUPERHOST</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Menu Sections */}
        <View style={styles.menuWrapper}>
          {/* Business Tools */}
          <Text style={styles.menuHeader}>Business Tools</Text>
          <MenuItem
            icon="wallet-outline"
            label="Payout Settings"
            gradient={[COLORS.blue[500], '#2563EB']}
            onPress={() => {}}
          />
          <MenuItem
            icon="bar-chart-outline"
            label="Performance Analytics"
            gradient={[COLORS.emerald[500], '#059669']}
            onPress={() => {}}
          />
          <MenuItem
            icon="receipt-outline"
            label="Earnings Report"
            gradient={[COLORS.purple[500], '#7C3AED']}
            onPress={() => {}}
          />

          {/* Security */}
          <Text style={styles.menuHeader}>Security & Verification</Text>
          <MenuItem
            icon="shield-checkmark-outline"
            label="Identity Verification"
            status={getKycStatusText()}
            statusColor={getKycStatusColor()}
            gradient={[COLORS.purple[500], '#7C3AED']}
            onPress={() => router.push('/kyc')}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Change Password"
            gradient={[COLORS.orange[500], '#EA580C']}
            onPress={() => {}}
          />
          <MenuItem
            icon="finger-print-outline"
            label="Privacy Settings"
            gradient={[COLORS.blue[500], '#2563EB']}
            onPress={() => {}}
          />

          {/* Support */}
          <Text style={styles.menuHeader}>Support & Legal</Text>
          <MenuItem
            icon="chatbubbles-outline"
            label="Help Center"
            gradient={[COLORS.emerald[500], '#059669']}
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms & Conditions"
            gradient={[COLORS.gray[500], '#4B5563']}
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About App"
            gradient={[COLORS.blue[500], '#2563EB']}
            onPress={() => {}}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <View style={styles.logoutBtnInner}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.red[500]} />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ============================================
// 📦 MENU ITEM COMPONENT
// ============================================
function MenuItem({ icon, label, status, statusColor, gradient, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={styles.iconBoxContainer}>
          <LinearGradient
            colors={gradient}
            style={styles.iconBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={icon} size={22} color={COLORS.white} />
          </LinearGradient>
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>

      <View style={styles.menuRight}>
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[500]} />
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// 💅 STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },

  // Header
  gradientHeader: {
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingTop: 20,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 110,
    height: 110,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.navy[900],
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.navy[900],
    borderRadius: 20,
    padding: 2,
    borderWidth: 3,
    borderColor: COLORS.navy[800],
  },

  name: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginBottom: 14,
  },

  roleBadgeContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  roleBadgeText: {
    color: COLORS.navy[900],
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Menu
  menuWrapper: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
  menuHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[500],
    marginBottom: 12,
    marginTop: 28,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.navy[800],
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBoxContainer: {
    marginRight: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  iconBox: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
    flex: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Logout Button
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.navy[800],
    borderWidth: 1,
    borderColor: COLORS.red[500] + '40',
  },
  logoutBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  logoutText: {
    color: COLORS.red[500],
    fontSize: 16,
    fontWeight: '700',
  },

  // Version
  versionText: {
    textAlign: 'center',
    color: COLORS.gray[500],
    fontSize: 12,
    marginTop: 24,
    fontWeight: '500',
  },
});