/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F98C53',
          accent: '#FCCEB4',
          bg: '#F9F2EF',
          text: '#4A4A4A',
          subtle: '#9B9B9B',
        }
      },
    },
  },
  plugins: [],
}
