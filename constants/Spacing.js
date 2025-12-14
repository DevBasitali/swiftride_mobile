/**
 * P2P Car Rental - Spacing System
 */

// ============================================
// 📏 SPACING SCALE
// ============================================

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
};


// ============================================
// 📐 LAYOUT CONSTANTS
// ============================================

export const layout = {
  screenPaddingHorizontal: 16,
  screenPaddingVertical: 16,
  
  cardPadding: 16,
  cardPaddingSmall: 12,
  cardPaddingLarge: 24,
  
  sectionGap: 32,
  itemGap: 12,
  
  inputHeight: 52,
  inputHeightSmall: 44,
  inputHeightLarge: 60,
  inputPaddingHorizontal: 16,
  
  buttonHeight: 52,
  buttonHeightSmall: 40,
  buttonHeightLarge: 60,
  buttonPaddingHorizontal: 24,
  
  tabBarHeight: 65,
  headerHeight: 56,
  
  avatarXS: 24,
  avatarSM: 32,
  avatarMD: 40,
  avatarLG: 56,
  avatarXL: 80,
  
  iconXS: 12,
  iconSM: 16,
  iconMD: 20,
  iconLG: 24,
  iconXL: 32,
};


// ============================================
// 🔘 BORDER RADIUS
// ============================================

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};


// ============================================
// 📏 BORDER WIDTH
// ============================================

export const borderWidth = {
  none: 0,
  hairline: 0.5,
  thin: 1,
  base: 1.5,
  thick: 2,
};


// ============================================
// 📐 HIT SLOP
// ============================================

export const hitSlop = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
};


// ============================================
// 📤 DEFAULT EXPORT
// ============================================

const Spacing = {
  spacing,
  layout,
  borderRadius,
  borderWidth,
  hitSlop,
};

export default Spacing;