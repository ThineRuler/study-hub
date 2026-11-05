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
          bg: '#F9FAF9',
          card: '#FFFFFF',
          border: '#E3E9E5',
          subtle: '#F0F4F1',
        },
        content: {
          primary: '#1D2821',
          secondary: '#55685C',
          muted: '#84968B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        dyslexic: ['OpenDyslexic', 'Comic Sans MS', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
