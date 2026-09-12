/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0B1220',
          soft: '#132238',
        },
        ink: '#161B26',
        mist: '#7C8798',
        paper: '#F3F5F8',
        sky: {
          DEFAULT: '#2F6690',
          light: '#E7EEF3',
        },
        amber: {
          DEFAULT: '#E8A33D',
          dark: '#C77F1B',
          light: '#FCEED8',
        },
        good: '#2E7D5B',
        bad: '#C4462E',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.06), 0 8px 24px -12px rgba(11,18,32,0.18)',
      },
      backgroundImage: {
        'flight-path':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='120' viewBox='0 0 400 120'%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
