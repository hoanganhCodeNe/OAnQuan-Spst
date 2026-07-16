/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        history: {
          red: {
            light: '#EF4444',
            DEFAULT: '#B91C1C',
            dark: '#991B1B',
            deep: '#7F1D1D',
          },
          gold: {
            light: '#FBBF24',
            DEFAULT: '#F59E0B',
            dark: '#D97706',
            bright: '#FACC15',
          },
          bronze: {
            light: '#B48A63',
            DEFAULT: '#9C7249',
            dark: '#6E4E2F',
          },
          charcoal: {
            light: '#2D2F3B',
            DEFAULT: '#1C1D24',
            dark: '#14151B',
            pure: '#0C0D12',
          }
        }
      },
      fontFamily: {
        cinzel: ['Playfair Display', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.4)',
        'red-glow': '0 0 15px rgba(139, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
