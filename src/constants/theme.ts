/**
 * Personal Growth OS — Design System Tokens
 * "Radiant Clarity" — A bright, joyful, and professional light theme that makes you feel excited to open the app.
 */

import { Platform, ViewStyle } from 'react-native';

export const Colors = {
  // Core bright backgrounds — unified blending theme
  bgPrimary: '#FFFFFF',     // Pure white background matching components
  bgSecondary: '#FFFFFF',   // Pure white for cards & elevated surfaces
  bgTertiary: '#F8FAFC',    // Soft slate tint for inputs & subtle containers
  bgElevated: '#FFFFFF',

  // Text hierarchy
  textPrimary: '#0F172A',   // Deep slate black — ultra crisp readability
  textSecondary: '#475569', // Medium slate grey
  textMuted: '#94A3B8',     // Muted caption grey
  textInverse: '#FFFFFF',

  // Borders & dividers — subtle seamless borders
  border: '#F1F5F9',        // Soft divider grey for seamless blending
  borderLight: '#F8FAFC',   // Extra soft border

  // Semantic colors
  success: '#10B981',       // Fresh Emerald
  warning: '#F59E0B',       // Radiant Amber
  error: '#EF4444',         // Bright Crimson
  info: '#4F46E5',          // Royal Indigo

  // Life Category Vibrant Accents
  work: '#4F46E5',          // Electric Royal Indigo
  health: '#059669',        // Fresh Vibrant Emerald
  relationships: '#E11D48', // Bright Radiant Rose/Coral
  finance: '#D97706',       // Rich Warm Amber/Gold

  // Category background tints (light, fresh pastel chips)
  workBg: '#EEF2FF',
  healthBg: '#ECFDF5',
  relationshipsBg: '#FFF1F2',
  financeBg: '#FEF3C7',

  // Heatmap intensity levels (Light theme grid)
  heatmapEmpty: '#E2E8F0',
  heatmapLevel1: '#C7D2FE',
  heatmapLevel2: '#818CF8',
  heatmapLevel3: '#6366F1',
  heatmapLevel4: '#4F46E5',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.4)',
  cardShadow: 'rgba(15, 23, 42, 0.06)',
} as const;

export const Typography = {
  display: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    letterSpacing: 0,
  },
  small: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const BorderRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export const Shadows = {
  card: Platform.select<ViewStyle>({
    web: { boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05), 0px 1px 3px rgba(15, 23, 42, 0.03)' } as any,
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
  })!,
  elevated: Platform.select<ViewStyle>({
    web: { boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.08), 0px 2px 6px rgba(15, 23, 42, 0.04)' } as any,
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
  })!,
  glow: (color: string): ViewStyle => Platform.select<ViewStyle>({
    web: { boxShadow: `0px 6px 20px ${color}26` } as any,
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
  })!,
};
