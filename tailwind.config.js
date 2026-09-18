/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#7C3AED",
        success: "#10B981",
        warning: "#F59E0B",
        alert: "#F97316",
        light: "#F8F9FA",
        dark: "#121212",
      }
    }
  },
  plugins: [],
}