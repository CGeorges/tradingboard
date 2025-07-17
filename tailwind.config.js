/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'trading': {
          'bg': '#0b1426',
          'surface': '#1a2332',
          'border': '#2a3441',
          'text': '#e2e8f0',
          'text-muted': '#94a3b8',
          'accent': '#3b82f6',
          'success': '#10b981',
          'danger': '#ef4444',
          'warning': '#f59e0b',
        },
        'chart': {
          'green': '#16a34a',
          'red': '#dc2626',
          'volume': '#6366f1',
          'grid': '#374151',
        }
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse 1s ease-in-out infinite',
        'pulse-red': 'pulse 1s ease-in-out infinite',
        'blink': 'blink 1s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0.3' },
        }
      }
    },
  },
  plugins: [],
} 