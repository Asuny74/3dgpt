/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff5a5f', // placeholder, replace with Fersch colors
        },
        secondary: {
          DEFAULT: '#00a699', // placeholder
        }
      }
    }
  },
  plugins: []
};