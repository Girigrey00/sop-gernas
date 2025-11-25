/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fab: {
          navy: '#0A2472',    // Darkest Navy
          royal: '#003DA5',   // Primary Brand Color
          blue: '#034AC5',    // Secondary Blue
          light: '#0647B8',   // Lighter Blue
          sky: '#A6E1FA',     // Accent Sky Blue
        }
      }
    },
  },
  plugins: [],
}