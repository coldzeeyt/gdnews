/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0b0d",
          900: "#111317",
          800: "#191c22",
          700: "#23262e",
          600: "#31353f",
          500: "#4a4f5c",
        },
        signal: {
          amber: "#e8a33d",
          red: "#d64545",
          blue: "#3d8be8",
          green: "#4caf6e",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
