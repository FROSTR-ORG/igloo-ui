/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--igloo-font-inter)'],
        sharetech: ['var(--igloo-font-share-tech-mono)'],
      },
      colors: {
        igloo: {
          page: '#030712',
          panel: 'rgb(15 23 42 / 0.6)',
          'panel-strong': 'rgb(15 23 42 / 0.8)',
          text: 'rgb(var(--igloo-rgb-slate-200) / <alpha-value>)',
          muted: 'rgb(var(--igloo-rgb-slate-400) / <alpha-value>)',
          subtle: 'rgb(var(--igloo-rgb-slate-500) / <alpha-value>)',
          border: 'rgb(var(--igloo-rgb-blue-900) / 0.3)',
          'border-muted': 'rgb(var(--igloo-rgb-blue-900) / 0.2)',
          primary: 'rgb(var(--igloo-rgb-blue-400) / <alpha-value>)',
          action: 'rgb(var(--igloo-rgb-blue-600) / <alpha-value>)',
          'action-hover': 'rgb(var(--igloo-rgb-blue-700) / <alpha-value>)',
          success: 'rgb(var(--igloo-rgb-status-success) / <alpha-value>)',
          warning: 'rgb(var(--igloo-rgb-status-warning) / <alpha-value>)',
          error: 'rgb(var(--igloo-rgb-status-error) / <alpha-value>)',
          info: 'rgb(var(--igloo-rgb-status-info) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
