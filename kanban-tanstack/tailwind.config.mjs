/** @type {import('tailwindcss').Config} */
// @ts-ignore - daisyui has no types
import daisyui from 'daisyui';

export default {
  darkMode: 'media',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  // @ts-ignore - daisyui config
  daisyui: {
    themes: ['pastel'],
    logs: false,
  },
}
