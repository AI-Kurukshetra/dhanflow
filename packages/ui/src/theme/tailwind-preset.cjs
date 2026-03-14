/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'Avenir Next', 'sans-serif'],
        data: ['IBM Plex Mono', 'SF Mono', 'monospace'],
        body: ['Manrope', 'Avenir Next', 'sans-serif'],
      },
      colors: {
        df: {
          bg: '#070B12',
          surface: '#101C30',
          border: '#4A6A9A',
          primary: '#E9F2FF',
          muted: '#8EA7CC',
          gain: '#3BE8B0',
          loss: '#FF6D8F',
          liquidA: '#02C0FF',
          liquidB: '#3BE8B0',
          liquidC: '#87A8FF',
        },
      },
      boxShadow: {
        glass: '0 22px 40px rgba(3, 10, 22, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      backgroundImage: {
        liquid: 'linear-gradient(120deg, #02C0FF 0%, #87A8FF 45%, #3BE8B0 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        float: 'float 4.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
