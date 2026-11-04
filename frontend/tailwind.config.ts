import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: { 50: "#fdfbf7", 100: "#f9f4ec", 200: "#f1e8d9" },
        rose: {
          50: "#fdf4f5", 100: "#fbe8ea", 200: "#f6d0d5", 300: "#eeaab4", 400: "#e2778a",
          500: "#cf4d66", 600: "#b53352", 700: "#962744", 800: "#7d233d", 900: "#6a2138",
        },
        sage: {
          50: "#f3f7f3", 100: "#e2ebe2", 200: "#c6d7c7", 300: "#9dbaa0", 400: "#729876",
          500: "#527a58", 600: "#3f6145", 700: "#344e3a", 800: "#2c3f31", 900: "#25342a",
        },
        ink: { 900: "#1f1a1c", 700: "#3d3538", 500: "#6e6368", 300: "#a69ca0" },
        gold: { 400: "#d9b36a", 500: "#c99a3f" },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31,26,28,.04), 0 8px 24px -12px rgba(31,26,28,.18)",
        lift: "0 2px 4px rgba(31,26,28,.05), 0 20px 40px -16px rgba(31,26,28,.25)",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideIn: { "0%": { transform: "translateX(100%)" }, "100%": { transform: "translateX(0)" } },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
      },
      animation: {
        fadeUp: "fadeUp .45s ease-out both",
        slideIn: "slideIn .3s cubic-bezier(.2,.8,.2,1) both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
