import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  background: '#0F2137',
  active: '#F59E0B',
  inactive: '#64748B',
  bubble: 'rgba(245, 158, 11, 0.15)',
  border: 'rgba(255,255,255,0.08)',
};

const TABS = [
  { name: 'index',     title: 'Explore',   icon: 'compass',        iconOutline: 'compass-outline' },
  { name: 'favorites', title: 'Favorites', icon: 'heart',          iconOutline: 'heart-outline' },
  { name: 'bookings',  title: 'My Trips',  icon: 'car-clock',      iconOutline: 'car-clock' },
  { name: 'profile',   title: 'Profile',   icon: 'account-circle', iconOutline: 'account-circle-outline' },
];

function FloatingTabBar({ state, navigation }) {
  const scales = useRef(
    TABS.map((_, i) => new Animated.Value(i === state.index ? 1 : 0))
  ).current;

  useEffect(() => {
    TABS.forEach((_, i) => {
      Animated.spring(scales[i], {
        toValue: i === state.index ? 1 : 0,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, i) => {
        const tab = TABS[i];
        const focused = state.index === i;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        const scale = scales[i].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.8}>
            <Animated.View style={[styles.pill, focused && styles.pillActive, { transform: [{ scale }] }]}>
              <MaterialCommunityIcons
                name={focused ? tab.icon : tab.iconOutline}
                size={22}
                color={focused ? COLORS.active : COLORS.inactive}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function CustomerTabs() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"     options={{ title: 'Explore'   }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
      <Tabs.Screen name="bookings"  options={{ title: 'My Trips'  }} />
      <Tabs.Screen name="profile"   options={{ title: 'Profile'   }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 65,
    backgroundColor: COLORS.background,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: COLORS.bubble,
  },
  label: {
    color: COLORS.active,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
