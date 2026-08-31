import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── New design system ──────────────────────────────
        cream:    { DEFAULT: '#faf7f2', dark: '#f5efe6' },
        beige:    { DEFAULT: '#ede8df', light: '#f5f1ea' },
        gold:     { DEFAULT: '#b8974a', light: '#d4b06a', dark: '#96783a' },
        wine:     { DEFAULT: '#7b1f35', dark: '#621929', light: '#9b2d47' },
        charcoal: { DEFAULT: '#1a1a1a', soft: '#2c2c2c' },
        mid:      { DEFAULT: '#6b6b6b' },
        border:   { DEFAULT: '#e2d9cc', light: '#ede8df' },

        // ── Legacy aliases (kept for backward compatibility) ──
        'tots-cream':       '#faf7f2',
        'tots-beige':       '#ede8df',
        'tots-dark':        '#1a1a1a',
        'tots-gray':        '#6b6b6b',
        'tots-border':      '#e2d9cc',
        'tots-gold':        '#b8974a',
        'tots-gold-dark':   '#96783a',
        'tots-gold-light':  '#d4b06a',
        'tots-wine':        '#7b1f35',
        'tots-wine-light':  '#9b2d47',
        'tots-wine-hover':  '#621929',
      },
      fontFamily: {
        sans:    ['var(--font-lato)', 'Lato', 'sans-serif'],
        body:    ['var(--font-lato)', 'Lato', 'sans-serif'],
        lato:    ['var(--font-lato)', 'Lato', 'sans-serif'],
        heading: ['var(--font-oswald)', 'Oswald', 'sans-serif'],
        oswald:  ['var(--font-oswald)', 'Oswald', 'sans-serif'],
        serif:   ['var(--font-oswald)', 'Oswald', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem', { lineHeight: '1.1rem' }],
        sm:    ['0.825rem', { lineHeight: '1.25rem' }],
        base:  ['0.9375rem', { lineHeight: '1.6' }],
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },
      boxShadow: {
        card:     '0 2px 12px rgba(0,0,0,0.06)',
        cardHov:  '0 6px 24px rgba(0,0,0,0.1)',
        panel:    '0 8px 40px rgba(0,0,0,0.12)',
        sm:       '0 1px 4px rgba(0,0,0,0.06)',
        xs:       '0 1px 2px rgba(0,0,0,0.04)',
        elevated: '0 4px 20px rgba(0,0,0,0.1)',
        '2xs':    '0 1px 2px rgba(0,0,0,0.04)',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
export default config
