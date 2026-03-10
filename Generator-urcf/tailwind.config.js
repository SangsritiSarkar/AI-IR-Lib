/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        dark: {
          bg: '#07090f',
          surface: '#0e1119',
          surface2: '#141820',
          surface3: '#1b2030',
          border: '#1f2535',
          border2: '#2a3347',
        },
        violet: {
          DEFAULT: '#7c3aed',
          2: '#9d5cf5',
          3: '#c4b5fd',
        },
      },
    },
  },
  plugins: [],
}
