/** @type {import('tailwindcss').Config} */
export default {
  // This content array is the most critical part.
  // It tells Tailwind to scan all your HTML and JavaScript/JSX files for class names.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
