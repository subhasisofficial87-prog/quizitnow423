import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        odia: ['Noto Sans Oriya', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#2563EB',
          green: '#16A34A',
          yellow: '#EAB308',
          orange: '#EA580C',
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
