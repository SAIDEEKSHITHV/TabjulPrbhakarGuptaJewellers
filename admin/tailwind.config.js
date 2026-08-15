/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0C',
        sidebar: '#131315',
        gold: '#C9A24A',
        ivory: '#F5EFE7',
        mutedText: '#B8B0A8',
        borderWine: 'rgba(201, 162, 74, 0.15)',
      },
    },
  },
  plugins: [],
}
