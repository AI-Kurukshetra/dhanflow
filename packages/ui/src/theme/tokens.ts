export const motionTokens = {
  duration: {
    instant: 0.12,
    fast: 0.2,
    smooth: 0.35,
    slow: 0.6,
  },
  easing: {
    standard: [0.22, 1, 0.36, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
    spring: {
      type: 'spring' as const,
      stiffness: 220,
      damping: 24,
      mass: 0.7,
    },
  },
  hover: {
    raiseY: -4,
    glowOpacity: 0.45,
  },
};

export const themeTokens = {
  colors: {
    bg: '#070B12',
    surface: 'rgba(16, 28, 48, 0.58)',
    border: 'rgba(148, 186, 255, 0.24)',
    textPrimary: '#E9F2FF',
    textMuted: '#8EA7CC',
    positive: '#3BE8B0',
    negative: '#FF6D8F',
    liquidStart: '#02C0FF',
    liquidEnd: '#3BE8B0',
    liquidAccent: '#87A8FF',
  },
  typography: {
    display: '"Sora", "Avenir Next", sans-serif',
    data: '"IBM Plex Mono", "SF Mono", monospace',
    body: '"Manrope", "Avenir Next", sans-serif',
  },
  radius: {
    card: '1.25rem',
    pill: '999px',
  },
};
