import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mandiri-inspired palette (navy + gold). Not affiliated with Bank Mandiri.
        navy: {
          DEFAULT: "#003B79",
          50: "#eef4fb",
          100: "#d6e4f3",
          600: "#0a4f96",
          700: "#003B79",
          800: "#012e5e",
          900: "#011f40",
          950: "#01152c",
        },
        gold: {
          DEFAULT: "#F5B301",
          400: "#FBC538",
          500: "#F5B301",
          600: "#D99A00",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(1, 31, 64, 0.18)",
        "card-sm": "0 6px 18px -10px rgba(1, 31, 64, 0.20)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
