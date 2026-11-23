/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        line: token('line'),
        ink: token('ink'),
        'ink-2': token('ink-2'),
        'ink-3': token('ink-3'),
        gold: token('gold'),
        pos: token('pos'),
        neg: token('neg'),
        warn: token('warn'),
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.12)',
        lift: '0 24px 60px -24px rgb(0 0 0 / 0.45)',
      },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        'sheet-in': { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'none' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'coin-drop': {
          '0%': { transform: 'translateY(-14px)', opacity: 0 },
          '20%': { opacity: 1 },
          '70%': { transform: 'translateY(36px)', opacity: 1 },
          '85%, 100%': { transform: 'translateY(44px)', opacity: 0 },
        },
        twinkle: { '0%, 100%': { opacity: 0.25, transform: 'scale(.8)' }, '50%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .45s cubic-bezier(.2,.7,.2,1) both',
        'sheet-in': 'sheet-in .3s cubic-bezier(.2,.7,.2,1) both',
        'fade-in': 'fade-in .2s ease-out both',
        float: 'float 5s ease-in-out infinite',
        'coin-drop': 'coin-drop 3.2s cubic-bezier(.5,0,.6,1) infinite',
        twinkle: 'twinkle 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('@tailwindcss/container-queries')
  ],
}
