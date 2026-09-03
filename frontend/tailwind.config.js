/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-bg': '#F4F4F6',        // Off-white/silver background
        'dark-text': '#1C1C1E',       // Rich charcoal for text
        'teal-accent': '#0E4D52',     // Deep teal accent
        'teal-accent-light': '#2A6D72', // Slightly lighter teal for hover states
      }
    },
  },
  plugins: [],
}