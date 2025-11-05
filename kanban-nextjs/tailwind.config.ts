import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  // @ts-ignore - daisyui config
  daisyui: {
    themes: ['pastel'], // Only include the theme we use
    logs: false,
    styled: true,
    base: true,
    utils: true,
    prefix: '',
    darkTheme: 'dark',
  },
};

export default config;
