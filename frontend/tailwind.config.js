/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        foreground: '#0F172A',
        card: '#FFFFFF',
        accent: {
          DEFAULT: '#2563EB', // Electric Royal Blue
          hover: '#1D4ED8',
          light: '#EFF6FF',
          emerald: '#10B981',
          purple: '#7C3AED',
          amber: '#F59E0B',
        },
        muted: '#F1F5F9',
        border: '#E2E8F0',
        surface: '#FFFFFF',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
