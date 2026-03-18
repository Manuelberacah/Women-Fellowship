/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f3efff",
          100: "#e4dbff",
          200: "#c8b5ff",
          300: "#ad8eff",
          400: "#9167ff",
          500: "#7440ff",
          600: "#5c2fd6",
          700: "#4421a6",
          800: "#2e1475",
          900: "#1b0b45"
        },
        gold: {
          50: "#fff8e6",
          100: "#ffefc0",
          200: "#ffe08a",
          300: "#ffd154",
          400: "#ffc12f",
          500: "#e3a400",
          600: "#b88200",
          700: "#8c6200",
          800: "#5f4200",
          900: "#322200"
        },
        soft: {
          white: "#fbfaf8"
        }
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 10px 30px rgba(91, 47, 214, 0.25)",
        card: "0 20px 40px rgba(20, 14, 46, 0.12)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
