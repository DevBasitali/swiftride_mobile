import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function CustomerTabs() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: '#007AFF',
      tabBarStyle: { height: 65, paddingBottom: Platform.OS==='ios'?0:10, paddingTop:10 } 
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Explore',
        tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />
      }} />
      <Tabs.Screen name="bookings" options={{
        title: 'Trips',
        tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={22} color={color} />
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />
      }} />
    </Tabs>
  );
}