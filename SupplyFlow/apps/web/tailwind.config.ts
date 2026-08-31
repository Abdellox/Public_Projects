import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f4",
          100: "#d6ede6",
          200: "#aedbcd",
          300: "#7ec2ae",
          400: "#4ea389",
          500: "#2f8a70",
          600: "#1f6d58",
          700: "#1a5748",
          800: "#17463b",
          900: "#143a31",
          950: "#0a221c"
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dde1e8",
          300: "#c3cad5",
          400: "#9aa4b4",
          500: "#75809380",
          600: "#5c6678",
          700: "#495262",
          800: "#363e4c",
          900: "#232935",
          950: "#14181f"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(20 24 31 / 0.05), 0 1px 3px 0 rgb(20 24 31 / 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
