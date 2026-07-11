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
        ivory:            'var(--ivory)',
        cream:            'var(--cream)',
        gold:             'var(--gold)',
        'gold-soft':      'var(--gold-soft)',
        coral:            'var(--coral)',
        'coral-light':    'var(--coral-light)',
        periwinkle:       'var(--periwinkle)',
        'periwinkle-light':'var(--periwinkle-light)',
        sage:             'var(--sage)',
        'sage-light':     'var(--sage-light)',
        lavender:         'var(--lavender)',
        'lavender-light': 'var(--lavender-light)',
        ink:              'var(--ink)',
        'ink-mid':        'var(--ink-mid)',
        'ink-faint':      'var(--ink-faint)',
        border:           'var(--border)',
        
        // Retro compat fields
        espresso:         'var(--espresso)',
        bgWarm:           'var(--bg-color)',
        cardBg:           'var(--card-bg)',
        textPrimary:      'var(--text-primary)',
        textSecondary:    'var(--text-secondary)',
        textMuted:        'var(--text-muted)',
      },
      fontFamily: {
        display:          ['Fraunces', 'serif'],
        body:             ['DM Sans', 'sans-serif'],
      },
      animation: {
        'float-orb':      'floatOrb 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
