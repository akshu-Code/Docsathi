import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // DESIGN.md brand colors
        brand: {
          primary: "#cc785c",        // signature coral
          "primary-active": "#a9583e",
          "primary-disabled": "#e6dfd8",
          ink: "#141413",            // dark warm ink
          body: "#3d3d3a",           // regular body text
          "body-strong": "#252523",
          muted: "#6c6a64",
          "muted-soft": "#8e8b82",
          hairline: "#e6dfd8",
          "hairline-soft": "#ebe6df",
          canvas: "#faf9f5",         // warm cream canvas
          "surface-soft": "#f5f0e8",
          "surface-card": "#efe9de",
          "surface-cream-strong": "#e8e0d2",
          "surface-dark": "#181715",
          "surface-dark-elevated": "#252320",
          "surface-dark-soft": "#1f1e1b",
          "on-primary": "#ffffff",
          "on-dark": "#faf9f5",
          "on-dark-soft": "#a09d96",
          teal: "#5db8a6",
          amber: "#e8a55a",
        },
        // Risk & WhatsApp familiar colors
        whatsapp: "#16a34a",
        risk: {
          green: "#16a34a",
          yellow: "#d97706",
          red: "#dc2626",
        }
      },
      fontFamily: {
        display: ["var(--font-serif)", "Cormorant Garamond", "EB Garamond", "Garamond", "serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(20,20,19,0.08)",
      }
    },
  },
  plugins: [],
};
export default config;
