/**
 * P2P Car Rental - Master Theme Export
 */

// Import all theme modules
import Colors, { palette, dark, light } from './Colors';
import Typography, { 
  fontFamily, 
  fontSize, 
  lineHeight, 
  fontWeight, 
  letterSpacing, 
  textStyles 
} from './Typography';
import Spacing, { 
  spacing, 
  layout, 
  borderRadius, 
  borderWidth, 
  hitSlop 
} from './Spacing';
import Shadows, { 
  shadows, 
  coloredShadows, 
  componentShadows 
} from './Shadows';


// ============================================
// 📤 NAMED EXPORTS
// ============================================

export {
  // Colors
  Colors,
  palette,
  dark,
  light,
  
  // Typography
  Typography,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  textStyles,
  
  // Spacing
  Spacing,
  spacing,
  layout,
  borderRadius,
  borderWidth,
  hitSlop,
  
  // Shadows
  Shadows,
  shadows,
  coloredShadows,
  componentShadows,
};


// ============================================
// 🎨 THEME OBJECT
// ============================================

const Theme = {
  colors: { palette, dark, light },
  typography: { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing, textStyles },
  spacing,
  layout,
  borderRadius,
  borderWidth,
  hitSlop,
  shadows,
  coloredShadows,
  componentShadows,
};

export default Theme;