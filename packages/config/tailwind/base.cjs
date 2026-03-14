/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/*.{ts,tsx}',
    './packages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          500: '#0f7fd9',
          700: '#0c5f9f',
          900: '#07395e',
        },
      },
    },
  },
  plugins: [],
};
