// postcss.config.js (or .cjs)
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')(), // Explicitly use the new package and call it as a function
    require('autoprefixer')(),           // Explicitly use autoprefixer and call it as a function
  ],
};
