/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EF4401',
          50: '#FFF5F0',
          100: '#FFEBE1',
          200: '#FFD4C2',
          300: '#FFB294',
          400: '#FF8257',
          500: '#EF4401',
          600: '#D63900',
          700: '#B02C00',
          800: '#8C2300',
          900: '#731E00',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      // Backfill Tailwind v4-style shadow scale used throughout the app
      // (shadow-xs / shadow-2xs) so it renders on this v3 setup, plus
      // softer, more layered shadows for a modern feel.
      boxShadow: {
        '2xs': '0 1px 1px 0 rgba(15, 23, 42, 0.04)',
        'xs': '0 1px 2px 0 rgba(15, 23, 42, 0.06)',
        'soft': '0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 4px 16px -4px rgba(15, 23, 42, 0.06)',
        'soft-lg': '0 8px 24px -6px rgba(15, 23, 42, 0.12), 0 16px 48px -12px rgba(15, 23, 42, 0.10)',
        'Edu': '0 4px 20px -2px rgba(239, 68, 1, 0.15)',
        'Edu-lg': '0 10px 30px -4px rgba(239, 68, 1, 0.25)',
      },
      // Backfill fractional scales used across the app (scale-101/102)
      scale: {
        '101': '1.01',
        '102': '1.02',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
