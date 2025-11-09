/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jeopardy-blue': '#060CE9',
        'jeopardy-gold': '#FFD700',
        'jeopardy-dark-blue': '#0A0A8F',
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'reveal': 'reveal 0.5s ease-out',
        'buzz': 'buzz 0.3s ease-in-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        buzz: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}

