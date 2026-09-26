/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#06070d",
          900: "#0b0e17",
          800: "#121728",
          700: "#1b2138",
          600: "#262e4a",
        },
        accent: {
          cyan: "#34e0ff",
          purple: "#9b5cff",
          pink: "#ff4fd8",
          orange: "#ff8a3d",
        },
      },
      fontFamily: {
        display: ["'Rubik'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gd-glow":
          "radial-gradient(circle at 20% -10%, rgba(155,92,255,0.35), transparent 45%), radial-gradient(circle at 90% 0%, rgba(52,224,255,0.25), transparent 40%)",
        "gd-gradient": "linear-gradient(90deg, #34e0ff, #9b5cff 50%, #ff4fd8)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(155,92,255,0.25), 0 8px 30px -8px rgba(155,92,255,0.35)",
      },
    },
  },
  plugins: [],
};
