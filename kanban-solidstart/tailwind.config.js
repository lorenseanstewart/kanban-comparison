import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media', // Use system preference for dark mode
  content: [
    "./src/**/*.{ts,tsx,js,jsx,html,css}",
    "./app.tsx",
    "./index.html"
  ],
  theme: {
    extend: {}
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["pastel"],
    logs: false
  }
};

