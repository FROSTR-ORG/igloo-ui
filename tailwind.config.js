/** @type {import('tailwindcss').Config} */
import iglooPreset from './tailwind.preset.js';

export default {
  presets: [iglooPreset],
  content: ['./src/**/*.{ts,tsx}'],
};
