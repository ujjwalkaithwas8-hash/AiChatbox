/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0D12',
        panel: '#151821',
        primary: { DEFAULT: '#8B5CF6', soft: '#A78BFA', deep: '#6D3FE0' },
        accent: { DEFAULT: '#06B6D4', soft: '#22D3EE' },
        mute: '#9CA3AF',
        line: '#252a38',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        blink: { '0%,80%,100%': { opacity: 0.25, transform: 'translateY(0)' }, '40%': { opacity: 1, transform: 'translateY(-3px)' } },
        caret: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
      },
      animation: { blink: 'blink 1.2s infinite ease-in-out' },
    },
  },
  plugins: [],
};
