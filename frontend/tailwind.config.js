/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F5F8F6',
          100: '#E7EFE9',
          200: '#D2E0D6',
          300: '#B2C7B8',
          400: '#7F9F88',
          500: '#53755C',
          600: '#405D48',
          700: '#324A3A',
          800: '#273B2E',
          900: '#1D2D23',
        },
        surface: {
          bg: 'var(--color-surface-bg)',
          card: 'var(--color-surface-card)',
          border: 'var(--color-surface-border)',
          subtle: 'var(--color-surface-subtle)',
        },
        content: {
          primary: 'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          muted: 'var(--color-content-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
