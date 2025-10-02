/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          background: '#FFFFFF',
          text_primary: '#000000',
          text_secondary: '#4B4B4B',
          accent: '#6200EE',
          button_primary: '#6200EE',
          button_secondary: '#03DAC6',
        },
        dark: {
          background: '#121212',
          text_primary: '#E0E0E0',
          text_secondary: '#B0B0B0',
          accent: '#BB86FC',
          button_primary: '#6200EE',
          button_secondary: '#03DAC6',
        },
      },
      keyframes: {
        'fade-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-slide-in': 'fade-slide-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}