/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sharetech: ['"Share Tech Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
