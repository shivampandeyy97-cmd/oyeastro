import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        espresso:     'var(--espresso)',
        bgWarm:       'var(--bg-color)',
        cardBg:       'var(--card-bg)',
        textPrimary:  'var(--text-primary)',
        textSecondary:'var(--text-secondary)',
        textMuted:    'var(--text-muted)',
        pastelPink:   'var(--pastel-pink)',
        pastelPurple: 'var(--pastel-purple)',
        pastelGreen:  'var(--pastel-green)',
        pastelBlue:   'var(--pastel-blue)',
        pastelOrange: 'var(--pastel-orange)',
        brightPink:   '#ff3b69',
        brightPurple: '#7c3aed',
        brightCyan:   '#00b4d8',
        brightGreen:  '#06d6a0',
        brightOrange: '#ff6b35',
        brightGold:   '#ffd166',
        darkCard:     '#12132d',
      },
      fontFamily: {
        body:    ['var(--font-space-grotesk)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
      },
      boxShadow: {
        neo:    '4px 4px 0px #2c1905',
        neoLg:  '6px 6px 0px #2c1905',
        neoSm:  '3px 3px 0px #2c1905',
        neoXl:  '8px 8px 0px #2c1905',
        dark:   '5px 5px 0px #000000',
      },
      borderRadius: {
        neo:   '20px',
        neoSm: '12px',
        neoLg: '24px',
      },
      animation: {
        'spin-slow':    'spin 12s linear infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'slide-up':     'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':      'fadeIn 0.4s ease forwards',
        'orbit-1':      'orbit 4s linear infinite',
        'orbit-2':      'orbit 7s linear infinite',
        'orbit-3':      'orbit 11s linear infinite',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(var(--orbit-r)) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
