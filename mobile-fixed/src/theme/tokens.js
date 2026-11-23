// ZYPHOR Design System – Luxury Recommerce Tokens (Section 6 & 7 of Audit)

export const tokens = {
  // Brand Color Palette (90% Neutral, 7% Ink, 3% Champagne Gold)
  colors: {
    // Primary Ink
    ink: "#181818",
    inkLight: "#262421",
    black: "#000000",
    
    // Champagne Gold Accents
    accent: "#C5A880",            // Hero Champagne Gold
    accentStrong: "#8A6B35",      // Deep Antique Gold
    accentSoft: "#F3EBDD",        // Delicate Gold Tint
    accentMuted: "rgba(197, 168, 128, 0.18)",
    accentDark: "#D2B988",        // Gold for dark mode

    // Luxury Canvas & Surfaces
    canvas: "#FAF8F5",            // Warm Ivory Background
    canvasDark: "#121110",        // Jet Black Background
    surface: "#FFFFFF",           // Crisp Card Surface
    surfaceDark: "#1C1B19",       // Dark Mode Card Surface
    surfaceAlt: "#F2EEE8",        // Museum Plinth Neutral
    surfaceAltDark: "#262421",    // Dark Mode Plinth Surface

    // Borders & Hairlines
    border: "#E7E1D8",            // Delicate stone hairline
    borderLight: "#F0EFEB",       // Muted divider
    borderDark: "#34312D",        // Dark mode hairline
    borderActive: "#181818",

    // Typography
    textPrimary: "#181818",       // High contrast headline / body
    textSecondary: "#6B645C",     // Warm subtitle & metadata
    textMuted: "#9A9288",         // Inactive / placeholder
    textInverse: "#FFFFFF",       // White on ink
    textInverseMuted: "#B3AAA0",

    // Functional State Colors (Strict recommerce compliance)
    success: "#15803D",           // Verified Badge / Escrow Secure
    successBg: "#DCFCE7",
    warning: "#B45309",           // Caution / Pending Inspection
    warningBg: "#FEF3C7",
    error: "#B42318",             // Return / Price Cut / Alert
    errorBg: "#FEE2E2",
    info: "#1D4ED8",
    infoBg: "#DBEAFE",

    // Device Grade Colors
    gradePristine: "#8A6B35",
    gradeExcellent: "#15803D",
    gradeGood: "#2563EB",
    gradeFair: "#787878",
  },

  // Typography - Sora for Headings, Manrope for Body / Numbers
  fonts: {
    // Headings / Display
    display: "Sora_600SemiBold",
    displayBold: "Sora_700Bold",
    // Body & Numerical / Prices
    body: "Manrope_400Regular",
    medium: "Manrope_500Medium",
    semiBold: "Manrope_600SemiBold",
    bold: "Manrope_700Bold",
  },

  // Font Sizes
  fontSize: {
    xxs: 10,
    xs: 12,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    display: 32,
    hero: 40,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },

  // Spacing Scale
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    huge: 64,
  },

  // Border Radius Scale
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    full: 9999,
  },

  // Shadows (Soft luxury boutique elevation)
  shadow: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    subtle: {
      shadowColor: "#181818",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    plinth: {
      shadowColor: "#181818",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    floating: {
      shadowColor: "#181818",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};

// Backward-compatible T object for smooth transition
export const T = {
  primary: tokens.colors.ink,
  primaryDark: tokens.colors.black,
  secondary: tokens.colors.textSecondary,
  accent: tokens.colors.accent,
  green: tokens.colors.success,
  amber: tokens.colors.warning,
  red: tokens.colors.error,
  blue: tokens.colors.info,

  booth: {
    plinth: tokens.colors.canvas,
    plinthBorder: tokens.colors.border,
    gold: tokens.colors.accent,
    goldMuted: tokens.colors.accentMuted,
    stone: tokens.colors.surfaceAlt,
    stamp: tokens.colors.textSecondary,
    surfaceDark: tokens.colors.surfaceDark,
  },

  bg: {
    primary: tokens.colors.canvas,
    secondary: tokens.colors.surfaceAlt,
    card: tokens.colors.surface,
    surface: tokens.colors.surfaceAlt,
    input: tokens.colors.surface,
    dark: tokens.colors.canvasDark,
  },

  text: {
    primary: tokens.colors.textPrimary,
    secondary: tokens.colors.textSecondary,
    muted: tokens.colors.textMuted,
    inverse: tokens.colors.textInverse,
  },

  border: {
    color: tokens.colors.border,
    active: tokens.colors.ink,
    light: tokens.colors.borderLight,
  },

  spacing: tokens.spacing,
  radius: tokens.radius,
  fonts: tokens.fontSize,
  shadow: tokens.shadow,
};

export default T;
