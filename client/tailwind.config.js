/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        louvre: {
          bg: '#0A0A0B',
          card: '#121214',
          backdrop: '#060607',
          primary: '#F5F5F0',
          secondary: '#9B9B9B',
          blue: '#3B6EF5',
          glow: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Open Sans', 'Poppins', 'Roboto', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      animation: {
        'halo-pulse': 'haloPulse 12s ease-in-out infinite alternate',
        'halo-spin': 'haloSpin 25s linear infinite',
      },
      keyframes: {
        haloPulse: {
          '0%': { transform: 'scale(0.96) rotate(0deg)', opacity: '0.6' },
          '50%': { transform: 'scale(1.08) rotate(180deg)', opacity: '0.9' },
          '100%': { transform: 'scale(0.96) rotate(360deg)', opacity: '0.6' },
        },
        haloSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
