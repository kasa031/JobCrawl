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
        // Primary colors - inspired by images (orange/blue theme)
        primary: {
          50: '#FFF5F0',   // Very light orange
          100: '#FFE8D6',  // Light orange
          200: '#FFD4B3',  // Soft orange
          300: '#FFB380',  // Medium orange
          400: '#FF8C42',  // Vibrant orange (main)
          500: '#FF6B1A',  // Deep orange
          600: '#E55A00',  // Dark orange
          700: '#CC4D00',  // Very dark orange
        },
        // Secondary colors - blue tones from images
        secondary: {
          50: '#F0F7FF',   // Very light blue
          100: '#D6EBFF',  // Light blue
          200: '#B3D9FF',  // Soft blue
          300: '#80C0FF',  // Medium blue
          400: '#4DA6FF',  // Vibrant blue (main)
          500: '#1A8CFF',  // Deep blue
          600: '#0073E5',  // Dark blue
          700: '#005ACC',  // Very dark blue
        },
        // Keep mocca for compatibility, but updated to complement images - more vibrant
        mocca: {
          50: '#FFF8F0',   // Warmer light
          100: '#FFE8D6',  // Light warm orange (more vibrant)
          200: '#FFD4B3',  // Soft warm orange
          300: '#FFB380',  // Medium warm orange
          400: '#FF8C42',  // Vibrant orange (matches primary)
          500: '#FF6B1A',  // Deep orange
          600: '#E55A00',  // Dark orange
          700: '#CC4D00',  // Very dark orange
        },
        dark: {
          text: '#2C2C2C',      // Softer dark (less brown)
          heading: '#1A1A1A',   // Pure dark
          subheading: '#404040', // Medium gray
          secondary: '#666666',  // Light gray
        },
        champagne: '#FFF5E6',   // Warmer champagne
        accent: '#FF8C42',       // Orange accent from images
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

