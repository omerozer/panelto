/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.html",
    "./public/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'hidden',
    'border-blue-500',
    'text-blue-600',
    'border-transparent',
    'text-gray-500'
  ]
}
