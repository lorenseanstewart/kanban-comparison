import type { Config } from 'tailwindcss';
// @ts-ignore - daisyui has no types
import daisyui from 'daisyui';

const config: Config = {
  darkMode: 'media',
  content: [
    './src/**/*.{marko,ts,js}',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  // @ts-ignore - daisyui config
  daisyui: {
    themes: ['pastel'],
    logs: false,
  },
};

export default config;
