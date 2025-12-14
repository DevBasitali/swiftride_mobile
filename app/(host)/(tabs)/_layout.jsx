import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// 🎨 Premium Theme Colors
const COLORS = {
  background: '#0A1628', // Deep Navy
  active: '#F59E0B',     // Gold
  inactive: '#94A3B8',   // Gray
  border: '#1E3A5F'      // Lighter Navy
};

// ✅ Helper Component for Icons
function TabBarIcon(props) {
  // We use FontAwesome for standard icons
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function HostTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* 🏠 Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
        }}
      />

      {/* 🚗 Fleet */}
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'My Fleet',
          tabBarIcon: ({ color }) => <TabBarIcon name="car" color={color} />,
        }}
      />

      {/* 💰 Wallet (NEW) */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          // Using Ionicons for the wallet specifically as it looks better
          tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={24} color={color} />,
        }}
      />

      {/* 👤 Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}