/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e2',
          100: '#fde5c6',
          200: '#fbcb8d',
          300: '#f9b154',
          400: '#f7971b',
          500: '#f58220',
          600: '#c4681a',
          700: '#934e13',
          800: '#62340d',
          900: '#311a06',
        },
      },
    },
  },
  plugins: [],
}
