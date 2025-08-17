/** @type {import('tailwindcss/postcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is the crucial fix.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
