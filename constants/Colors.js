/**
 * P2P Car Rental - Premium Automotive Theme
 * Professional, Elegant, Industry-Grade Color System
 */

// ============================================
// 🎨 BASE COLOR PALETTE
// ============================================

export const palette = {
  // Primary Navy Shades
  navy: {
    900: '#0A1628',
    800: '#0F2137',
    700: '#152A46',
    600: '#1E3A5F',
    500: '#2A4A73',
    400: '#3D5F87',
    300: '#5A7A9A',
    200: '#8BA3BC',
    100: '#C5D3E0',
    50:  '#E8EEF4',
  },

  // Accent Gold
  gold: {
    900: '#92570A',
    800: '#A66B0D',
    700: '#C47F10',
    600: '#D99413',
    500: '#F59E0B',
    400: '#FBBF24',
    300: '#FCD34D',
    200: '#FDE68A',
    100: '#FEF3C7',
    50:  '#FFFBEB',
  },

  // Success Green
  emerald: {
    900: '#064E3B',
    800: '#065F46',
    700: '#047857',
    600: '#059669',
    500: '#10B981',
    400: '#34D399',
    300: '#6EE7B7',
    200: '#A7F3D0',
    100: '#D1FAE5',
    50:  '#ECFDF5',
  },

  // Error Red
  red: {
    900: '#7F1D1D',
    800: '#991B1B',
    700: '#B91C1C',
    600: '#DC2626',
    500: '#EF4444',
    400: '#F87171',
    300: '#FCA5A5',
    200: '#FECACA',
    100: '#FEE2E2',
    50:  '#FEF2F2',
  },

  // Warning Orange
  orange: {
    900: '#7C2D12',
    800: '#9A3412',
    700: '#C2410C',
    600: '#EA580C',
    500: '#F97316',
    400: '#FB923C',
    300: '#FDBA74',
    200: '#FED7AA',
    100: '#FFEDD5',
    50:  '#FFF7ED',
  },

  // Info Blue
  blue: {
    900: '#1E3A8A',
    800: '#1E40AF',
    700: '#1D4ED8',
    600: '#2563EB',
    500: '#3B82F6',
    400: '#60A5FA',
    300: '#93C5FD',
    200: '#BFDBFE',
    100: '#DBEAFE',
    50:  '#EFF6FF',
  },

  // Neutral Grays
  gray: {
    900: '#111827',
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50:  '#F9FAFB',
  },

  // Pure Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};


// ============================================
// 🌙 DARK THEME
// ============================================

export const dark = {
  // Backgrounds
  background: {
    primary: palette.navy[900],
    secondary: palette.navy[800],
    tertiary: palette.navy[700],
    elevated: palette.navy[600],
    inverse: palette.white,
  },

  // Text Colors
  text: {
    primary: palette.white,
    secondary: palette.gray[400],
    tertiary: palette.gray[500],
    inverse: palette.navy[900],
    accent: palette.gold[500],
    link: palette.blue[400],
  },

  // Border Colors
  border: {
    primary: palette.navy[600],
    secondary: palette.navy[500],
    focus: palette.gold[500],
    error: palette.red[500],
    success: palette.emerald[500],
  },

  // Button Colors
  button: {
    primary: {
      background: palette.gold[500],
      text: palette.navy[900],
      pressed: palette.gold[600],
      disabled: palette.gray[600],
      disabledText: palette.gray[400],
    },
    secondary: {
      background: palette.navy[600],
      text: palette.white,
      pressed: palette.navy[500],
      disabled: palette.navy[700],
      disabledText: palette.gray[500],
    },
    outline: {
      background: palette.transparent,
      text: palette.gold[500],
      border: palette.gold[500],
      pressed: palette.gold[500] + '20',
      disabled: palette.gray[600],
      disabledText: palette.gray[500],
    },
    ghost: {
      background: palette.transparent,
      text: palette.gold[500],
      pressed: palette.gold[500] + '15',
    },
    danger: {
      background: palette.red[500],
      text: palette.white,
      pressed: palette.red[600],
    },
  },

  // Input Colors
  input: {
    background: palette.navy[800],
    backgroundFocus: palette.navy[700],
    text: palette.white,
    placeholder: palette.gray[500],
    border: palette.navy[600],
    borderFocus: palette.gold[500],
    borderError: palette.red[500],
    borderSuccess: palette.emerald[500],
    label: palette.gray[300],
    hint: palette.gray[500],
    error: palette.red[400],
  },

  // Card Colors
  card: {
    background: palette.navy[700],
    backgroundElevated: palette.navy[600],
    border: palette.navy[600],
  },

  // Status Colors
  status: {
    success: palette.emerald[500],
    successLight: palette.emerald[500] + '20',
    error: palette.red[500],
    errorLight: palette.red[500] + '20',
    warning: palette.orange[500],
    warningLight: palette.orange[500] + '20',
    info: palette.blue[500],
    infoLight: palette.blue[500] + '20',
    pending: palette.gold[500],
    pendingLight: palette.gold[500] + '20',
  },

  // Semantic Colors
  semantic: {
    available: palette.emerald[500],
    booked: palette.blue[500],
    unavailable: palette.gray[500],
    maintenance: palette.orange[500],
    verified: palette.emerald[500],
    unverified: palette.orange[500],
    rejected: palette.red[500],
    premium: palette.gold[500],
  },

  // Tab Bar
  tabBar: {
    background: palette.navy[800],
    border: palette.navy[700],
    active: palette.gold[500],
    inactive: palette.gray[500],
  },

  // Header
  header: {
    background: palette.navy[900],
    text: palette.white,
    border: palette.navy[700],
    icon: palette.white,
  },

  // Overlay
  overlay: {
    background: palette.black + 'CC',
    modal: palette.navy[700],
    modalBorder: palette.navy[600],
  },

  // Skeleton
  skeleton: {
    background: palette.navy[700],
    shimmer: palette.navy[600],
  },

  // Divider
  divider: palette.navy[600],

  // Icon Colors
  icon: {
    primary: palette.white,
    secondary: palette.gray[400],
    accent: palette.gold[500],
    success: palette.emerald[500],
    error: palette.red[500],
    warning: palette.orange[500],
    info: palette.blue[500],
  },

  // Map
  map: {
    markerPrimary: palette.gold[500],
    markerSecondary: palette.emerald[500],
    route: palette.gold[500],
  },

  // Rating
  rating: {
    filled: palette.gold[500],
    empty: palette.gray[600],
  },

  // Switch
  switch: {
    trackOn: palette.gold[500],
    trackOff: palette.gray[600],
    thumbOn: palette.white,
    thumbOff: palette.gray[300],
  },

  // Progress
  progress: {
    background: palette.navy[600],
    fill: palette.gold[500],
    success: palette.emerald[500],
  },

  // Gradients
  gradients: {
    primary: [palette.gold[600], palette.gold[400]],
    premium: [palette.gold[500], palette.orange[500]],
    dark: [palette.navy[900], palette.navy[700]],
    success: [palette.emerald[600], palette.emerald[400]],
  },
};


// ============================================
// ☀️ LIGHT THEME
// ============================================

export const light = {
  background: {
    primary: palette.gray[50],
    secondary: palette.white,
    tertiary: palette.white,
    elevated: palette.white,
    inverse: palette.navy[900],
  },

  text: {
    primary: palette.navy[900],
    secondary: palette.gray[600],
    tertiary: palette.gray[400],
    inverse: palette.white,
    accent: palette.gold[600],
    link: palette.blue[600],
  },

  border: {
    primary: palette.gray[200],
    secondary: palette.gray[100],
    focus: palette.gold[500],
    error: palette.red[500],
    success: palette.emerald[500],
  },

  button: {
    primary: {
      background: palette.navy[900],
      text: palette.white,
      pressed: palette.navy[800],
      disabled: palette.gray[300],
      disabledText: palette.gray[500],
    },
  },

  input: {
    background: palette.white,
    backgroundFocus: palette.white,
    text: palette.navy[900],
    placeholder: palette.gray[400],
    border: palette.gray[300],
    borderFocus: palette.navy[900],
    borderError: palette.red[500],
    borderSuccess: palette.emerald[500],
    label: palette.gray[700],
  },

  card: {
    background: palette.white,
    backgroundElevated: palette.white,
    border: palette.gray[200],
  },

  tabBar: {
    background: palette.white,
    border: palette.gray[200],
    active: palette.navy[900],
    inactive: palette.gray[400],
  },

  divider: palette.gray[200],
};


// ============================================
// 📤 DEFAULT EXPORT
// ============================================

const Colors = {
  palette,
  dark,
  light,
};

export default Colors;