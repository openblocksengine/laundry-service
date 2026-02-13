/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slate-900': '#0F172A',
        'slate-800': '#1E293B',
        'orange-600': '#EA580C',
        'orange-700': '#C2410C',
        'orange-50': '#FFF7ED',
        'orange-100': '#FFEDD5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}