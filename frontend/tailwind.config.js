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
        mocca: {
          50: '#FAF5F0',
          100: '#F5ECE2',
          200: '#E8D5C1',
          300: '#D4B99A',
          400: '#C29B73',
          500: '#A67E5A',
          600: '#8B6B47',
          700: '#6B5439',
        },
        dark: {
          text: '#3D2F1F',
          heading: '#2A2018',
          subheading: '#4A3F2F',
          secondary: '#6B5439',
        },
        champagne: '#F7E7CE',
        accent: '#B8956A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

