export const T = {
  // Brand Colors (Based on Mōnolith Design System)
  primary: "#181818",       // Deep Jet Black / Charcoal
  primaryDark: "#000000",   // Pure Black
  secondary: "#787878",     // Refined Slate Gray (#787878 from brand board)
  accent: "#181818",

  // Functional State Colors
  green: "#16A34A",         // Verified / Trust Green
  amber: "#D97706",         // Attention / Warning Amber
  red: "#DC2626",           // Alert / Discount Red
  blue: "#2563EB",

  // Luxury Booth / Exhibition Atelier Palette
  booth: {
    plinth: "#FAF9F7",        // Sculpted museum plinth surface
    plinthBorder: "#EAE8E4",  // Delicate stone hairline border
    gold: "#C5A880",          // Champagne / Architectural Metallic Accent
    goldMuted: "rgba(197, 168, 128, 0.15)",
    stone: "#F6F5F3",         // Soft stone neutral
    stamp: "#787878",         // Technical stamp text
    surfaceDark: "#1F1F1F",
  },

  // Backgrounds & Surfaces (Clean warm gallery palette)
  bg: {
    primary: "#FFFFFF",     // Crisp White Canvas
    secondary: "#F6F5F3",   // Warm Sand / Soft Grey (#F6F5F3 from brand board)
    card: "#FFFFFF",        // Card Background
    surface: "#F6F5F3",     // Warm Neutral Surface for image backdrops
    input: "#F6F5F3",       // Input field background
    dark: "#181818"         // Solid Black surface
  },

  // Typography Colors
  text: {
    primary: "#181818",     // Primary Header / Body (#181818)
    secondary: "#787878",   // Subtitle & Metadata (#787878)
    muted: "#9CA3AF",       // Placeholder / Inactive
    inverse: "#FFFFFF"      // White text on dark buttons
  },

  // Borders & Dividers
  border: {
    color: "#E9E7E5",       // Warm stone border (#E9E7E5 from brand board)
    active: "#181818",      // Active state border
    light: "#F0EFEB"
  },

  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },

  // Border Radius Scale (Modern organic & pill shapes)
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    full: 9999
  },

  // Typography Scale
  fonts: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36
  },

  // Subtle High-End Shadows
  shadow: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3
    },
    card: {
      shadowColor: "#181818",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2
    },
    booth: {
      shadowColor: "#181818",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4
    }
  }
};

export default T;
