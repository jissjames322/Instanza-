/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // tells Tailwind to scan your React source files
  ],
  theme: {
    extend: {
      fontFamily: {
        logo: ['"Billabong"', "cursive"], // Instagram-like font
        instagram: ['"Instagram Sans"', "sans-serif"],
        instagramHeadline: ['"Instagram Sans Headline"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

