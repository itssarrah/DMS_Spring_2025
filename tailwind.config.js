// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}", // this ensures Tailwind looks for classes in your JSX files
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003092",
        secondary: "#00879E",
        accent: "#FFAB5B",
        light: "#FFF2DB",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
