/** @type {import('tailwindcss/postcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // THIS LINE IS CRUCIAL. It tells Tailwind to scan all JS/TS/JSX/TSX files in your src folder.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
