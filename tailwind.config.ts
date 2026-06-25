import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
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
  plugins: [],
} satisfies Config
