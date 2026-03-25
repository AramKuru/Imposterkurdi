/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        kurdish: ['Vazirmatn', 'Noto Sans Arabic', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#d971fa',
          500: '#c044f0',
          600: '#a521d4',
          700: '#8b1ab0',
          800: '#731890',
          900: '#5e1675',
        },
      },
    },
  },
  plugins: [],
}
