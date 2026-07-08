import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#07070a",
        card: "#15151b",
        soft: "#1d1e27",
        line: "#2a2b36",
        ink: "#fafafa",
        muted: "#a1a1aa",
        accent: {
          blue: "#38bdf8",
          violet: "#8b5cf6",
          green: "#34d399",
          red: "#fb7185",
          amber: "#fbbf24",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        panel: "0 18px 55px rgba(0,0,0,0.35)",
        glow: "0 18px 50px rgba(37,99,235,0.25)",
      },
      backgroundImage: {
        "app-radial":
          "radial-gradient(circle at top left, #172554 0%, #09090b 36%, #050507 100%)",
        "brand-gradient": "linear-gradient(135deg, #2563eb, #7c3aed)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
