/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { cream: '#fffaf4', cocoa: '#4b2416', caramel: '#8c421e', peach: '#f4e2d1' }, fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Playfair Display', 'serif'] } } },
  plugins: [],
}
