/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcff',
          100: '#d6f6ff',
          200: '#b3edff',
          300: '#7ee2ff',
          400: '#3fd0ff',
          500: '#12b6f0',
          600: '#0693cc',
          700: '#0876a6',
          800: '#0c6386',
          900: '#0f5271',
          950: '#0a3547',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(15, 82, 113, 0.18)',
        card: '0 4px 16px -4px rgba(15, 82, 113, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
