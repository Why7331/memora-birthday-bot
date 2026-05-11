import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        glass: '28px'
      },
      boxShadow: {
        glass: '0 24px 70px rgba(15, 23, 42, 0.16)'
      }
    }
  },
  plugins: []
} satisfies Config;
