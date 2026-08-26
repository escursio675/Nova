import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: "#faf7f0",
          100: "#f5f0e6",
          200: "#ece4d4",
          300: "#ddd0b3",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        ui: ["var(--font-ui)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        },
    },
  },
  plugins: [],
};

export default config;