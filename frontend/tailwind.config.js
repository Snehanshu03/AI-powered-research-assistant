/** @type {import('tailwindcss').Config} */
import lineClamp from "@tailwindcss/line-clamp";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#08b5d0",
        "background-light": "#f5f8f8",
        "background-dark": "#102022",
        "surface-dark": "#1a212e",
        "border-dark": "#282e39",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
    },
  },
  plugins: [lineClamp],
};

export default config;