/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        ink: {
          DEFAULT: "#0B1220",
          800: "#101A2E",
          700: "#16233D",
          600: "#1E2E4D"
        },
        paper: "#F6F7F9",
        slate: {
          850: "#1B2330"
        },
        signal: {
          green: "#1FAE6B",
          amber: "#E8A23D",
          red: "#E5484D",
          grey: "#8A93A6"
        },
        coral: {
          DEFAULT: "#FF5A3C",
          dark: "#E64526"
        }
      },
      fontFamily: {
        display: ["var(--font-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(31,174,107,0.35)" },
          "100%": { boxShadow: "0 0 0 14px rgba(31,174,107,0)" }
        }
      },
      animation: {
        scan: "scan 2.4s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite"
      }
    }
  },
  plugins: []
};
