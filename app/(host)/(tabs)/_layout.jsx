import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function HostTabs() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: '#1a1a1a', 
      tabBarStyle: { height: 65, paddingBottom: Platform.OS==='ios'?0:10, paddingTop:10 } 
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Dashboard',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
      }} />
      <Tabs.Screen name="fleet" options={{
        title: 'My Fleet',
        tabBarIcon: ({ color }) => <FontAwesome name="car" size={22} color={color} />
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />
      }} />
    </Tabs>
  );
}