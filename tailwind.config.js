/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin': 'spin 1s linear infinite',
      },
      colors: {
        blue: {
          200: "#8094ad",
          500: "#19406a",
          700: "#002b5b",
        },
        green: {
          400: "#36c6c0",
        },
        'custom-light': '#FFEAE3',
        'custom-red': '#FF0004',
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        'html, body': { height: '100%' },
      });
    },
  ],
};
