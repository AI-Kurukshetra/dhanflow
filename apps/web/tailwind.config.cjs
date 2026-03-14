module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './styles/**/*.css'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      backgroundImage: {
        'liquid-radial':
          'radial-gradient(circle at 10% 0%, rgba(0,184,255,0.35), transparent 45%), radial-gradient(circle at 90% 10%, rgba(57,232,182,0.28), transparent 46%)',
      },
      boxShadow: {
        glass: '0 24px 48px -24px rgba(0, 8, 20, 0.8)',
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin')(function ({ addUtilities }) {
      addUtilities({
        '.glass-panel': {
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.22)',
          backdropFilter: 'blur(16px)',
        },
        '.gradient-border': {
          border: '1px solid transparent',
          background:
            'linear-gradient(rgba(8,15,28,0.9), rgba(8,15,28,0.9)) padding-box, linear-gradient(120deg, rgba(0,184,255,0.6), rgba(57,232,182,0.6)) border-box',
        },
        '.financial-card': {
          borderRadius: '1.25rem',
          boxShadow: '0 20px 45px -20px rgba(4, 11, 24, 0.85)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(4,14,30,0.55))',
        },
      });
    }),
  ],
};
