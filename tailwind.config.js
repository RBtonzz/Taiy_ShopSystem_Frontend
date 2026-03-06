/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        honeydew: '#F0FFF0',
        'green-soft': '#DCFFE4',
        'green-mid': '#A8E6CF',
        'green-dark': '#3D9970',
        'green-accent': '#27AE60',
      }
    },
  },
  plugins: [],
}
