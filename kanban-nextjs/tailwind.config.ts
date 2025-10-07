import type { Config } from 'tailwindcss';
// @ts-ignore - daisyui has no types
import daisyui from 'daisyui';

const config: Config = {
  darkMode: 'media',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
