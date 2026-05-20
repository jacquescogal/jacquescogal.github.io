/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Ubuntu Mono"', ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
        24: 'repeat(24, minmax(0, 1fr))',
        36: 'repeat(36, minmax(0, 1fr))',
      },
      colors: {
        'background': 'rgba(2, 6, 23, 1)',
        'background-alt': 'rgba(17, 26, 68, 1)',
        'primary-text': 'rgba(134, 239, 172, 1)',
        'alt-text': '#f7f7f8', // or replace with your hex, e.g. '#f7f7f8'
      },
      keyframes: {
        'modal-appear': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '0.7' }, // matches bg-black/70
        },
      },
      animation: {
        'modal-appear': 'modal-appear 1s cubic-bezier(0.075,0.82,0.165,1) both',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
