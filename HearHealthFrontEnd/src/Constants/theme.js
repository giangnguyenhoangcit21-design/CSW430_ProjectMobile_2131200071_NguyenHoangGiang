// src/constants/theme.js
import COLORS from './colors';

export const SIZES = {
  // Padding & Margin
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  
  // Font Sizes
  h1: 28,
  h2: 24,
  h3: 20,
  bodyText: 16,
  smallText: 14,
  
  // Radius 
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  
  // Standard touch target for elderly
  touchTarget: 56, 
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2, 
  },
};

export const THEME = { COLORS, SIZES, SHADOWS };
export { COLORS };
export default THEME;


