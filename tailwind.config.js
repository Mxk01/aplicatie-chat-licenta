/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        'electro-magnetic': '#2f3640',
        'gray-light':'#7f8fa6'
      }
    },
  },
  plugins: [
    require('tw-elements/dist/plugin')
  ]
}