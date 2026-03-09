/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        action: 'var(--color-action)',
      },
      screens: {
        '2k': '2560px',
        '4k': '3840px',
        '8k': '7680px',
      },
    },
  },
  plugins: [],
};
