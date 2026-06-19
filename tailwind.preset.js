/** @type {import('tailwindcss').Config} */
// Single source of igloo design tokens. Consumed by every client's
// tailwind.config via `presets: [iglooPreset]`. Do NOT add `content` here —
// each consumer scans its own src + ../igloo-ui/src.
export default {
  darkMode: ['class'],
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
        // Explicit values preserved from chrome's (soon-to-be-deleted) config so
        // its inline blue/gray/purple utilities render identically. Tailwind
        // defaults still apply for cyan etc. via theme.extend.
        gray: { 800: '#1f2937', 900: '#111827', 950: '#030712' },
        blue: {
          100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
          500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a',
          950: '#172554',
        },
        purple: { 900: '#581c87' },
      },
    },
  },
  plugins: [],
};
