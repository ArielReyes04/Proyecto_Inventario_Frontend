/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // Blue 800
        secondary: '#0f172a', // Slate 900
        accent: '#38bdf8', // Light blue
      }
    },
  },
  plugins: [],
}
