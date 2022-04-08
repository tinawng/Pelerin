const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Fira Mono"', ...defaultTheme.fontFamily.sans],
      },
    },
    screens: {
      'sm': '1024px',
      'md': '1081px',
      'lg': '1920px',
      'xl': '2560px',
    },
  },
  plugins: [],
}
