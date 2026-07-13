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
            light: '#DC2626',
            DEFAULT: '#8B0000',
            dark: '#660000',
            deep: '#4A0000',
          },
          gold: {
            light: '#FBBF24',
            DEFAULT: '#D4AF37',
            dark: '#B78727',
            bright: '#FFD700',
          },
          bronze: {
            light: '#A37E58',
            DEFAULT: '#8C6239',
            dark: '#5C3E21',
          },
          charcoal: {
            light: '#2E2E30',
            DEFAULT: '#1C1C1E',
            dark: '#121214',
            pure: '#0B0B0C',
          }
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
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
