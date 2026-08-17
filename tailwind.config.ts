import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      // Keep ink/accent palette so any existing admin class references don't break at the CSS level
      colors: {
        ink: {
          50: '#f6f7f8',
          100: '#e9ecef',
          200: '#cfd4da',
          300: '#a8b1bb',
          400: '#7a8694',
          500: '#586474',
          600: '#3f4855',
          700: '#2e3540',
          800: '#1d222a',
          900: '#0f1318',
        },
        accent: {
          DEFAULT: '#3b82f6',
          fg: '#ffffff',
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mocha: {
          // ── backgrounds ──────────────────────────────────────────
          'base-100': '#f5efe6', // warm cream page background
          'base-200': '#ede3d4', // slightly darker cream (cards, panels)
          'base-300': '#e0d4c0', // borders, dividers
          'base-content': '#3a2a1f', // dark-brown body text

          // ── brand colours ─────────────────────────────────────────
          'primary': '#6b4226', // deep espresso brown
          'primary-content': '#f5efe6',
          'secondary': '#9c6644', // medium caramel
          'secondary-content': '#f5efe6',
          'accent': '#c48a3c', // warm amber-gold
          'accent-content': '#f5efe6',
          'neutral': '#3a2a1f',
          'neutral-content': '#f5efe6',

          // ── semantic ──────────────────────────────────────────────
          'info': '#3b82f6',
          'info-content': '#ffffff',
          'success': '#22c55e',
          'success-content': '#ffffff',
          'warning': '#f59e0b',
          'warning-content': '#ffffff',
          'error': '#ef4444',
          'error-content': '#ffffff',
        },
      },
      {
        midnight: {
          // ── backgrounds ──────────────────────────────────────────
          'base-100': '#0a1024', // deep navy-near-black
          'base-200': '#0c1428', // slightly lighter for panels
          'base-300': '#111d38', // borders, dividers
          'base-content': '#e6d5b8', // warm parchment text

          // ── brand colours ─────────────────────────────────────────
          'primary': '#c9956a', // warm sienna-brown
          'primary-content': '#0a1024',
          'secondary': '#a07850', // muted tan
          'secondary-content': '#0a1024',
          'accent': '#d4a96a', // gold
          'accent-content': '#0a1024',
          'neutral': '#1a2540',
          'neutral-content': '#e6d5b8',

          // ── semantic ──────────────────────────────────────────────
          'info': '#60a5fa',
          'info-content': '#0a1024',
          'success': '#4ade80',
          'success-content': '#0a1024',
          'warning': '#fbbf24',
          'warning-content': '#0a1024',
          'error': '#f87171',
          'error-content': '#0a1024',
        },
      },
    ],
    darkTheme: 'midnight',
    logs: false,
  },
} as Config
