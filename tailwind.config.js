/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resort: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        sand: {
          50: '#fdfbf7',
          100: '#f8f4ec',
          200: '#f0e6d6',
          300: '#e2d2b9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Prompt', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
