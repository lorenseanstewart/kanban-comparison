import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: [
    './src/app/**/*.{ts,html}',
    './src/components/**/*.{ts,html}',
    './index.html',
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['pastel'],
    logs: false,
  },
};

export default config;
