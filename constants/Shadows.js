/**
 * P2P Car Rental - Shadow/Elevation System
 */

import { Platform } from 'react-native';

// ============================================
// 🎨 SHADOW COLOR (Defined locally to avoid circular deps)
// ============================================

const SHADOW_COLOR = '#000000';
const GOLD_COLOR = '#F59E0B';
const EMERALD_COLOR = '#10B981';
const RED_COLOR = '#EF4444';


// ============================================
// 🌑 CREATE SHADOW HELPER
// ============================================

const createShadow = (elevation, color = SHADOW_COLOR) => {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  
  const shadowConfig = {
    0: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
    1: { shadowOpacity: 0.05, shadowRadius: 1, shadowOffset: { width: 0, height: 1 } },
    2: { shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
    3: { shadowOpacity: 0.10, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
    4: { shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    6: { shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
    8: { shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    12: { shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
    16: { shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
    24: { shadowOpacity: 0.30, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  };
  
  return {
    shadowColor: color,
    ...(shadowConfig[elevation] || shadowConfig[4]),
  };
};


// ============================================
// 🌑 SHADOW PRESETS
// ============================================

export const shadows = {
  none: createShadow(0),
  xs: createShadow(1),
  sm: createShadow(2),
  md: createShadow(4),
  lg: createShadow(6),
  xl: createShadow(8),
  '2xl': createShadow(12),
  '3xl': createShadow(16),
  '4xl': createShadow(24),
};


// ============================================
// 🎨 COLORED SHADOWS
// ============================================

export const coloredShadows = {
  gold: Platform.select({
    ios: {
      shadowColor: GOLD_COLOR,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 8,
    },
  }),
  success: Platform.select({
    ios: {
      shadowColor: EMERALD_COLOR,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 8,
    },
  }),
  error: Platform.select({
    ios: {
      shadowColor: RED_COLOR,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 8,
    },
  }),
};


// ============================================
// 📦 COMPONENT SHADOWS
// ============================================

export const componentShadows = {
  card: shadows.md,
  cardElevated: shadows.lg,
  button: shadows.sm,
  buttonPressed: shadows.xs,
  modal: shadows['3xl'],
  bottomSheet: shadows['4xl'],
  dropdown: shadows.xl,
  header: shadows.sm,
  tabBar: shadows.lg,
  fab: shadows.xl,
  toast: shadows['2xl'],
};


// ============================================
// 📤 DEFAULT EXPORT
// ============================================

const Shadows = {
  shadows,
  coloredShadows,
  componentShadows,
  createShadow,
};

export default Shadows;