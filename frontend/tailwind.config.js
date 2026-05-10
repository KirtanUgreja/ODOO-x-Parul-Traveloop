/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#ec4899',
          light: '#f472b6',
          dark: '#db2777',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
        },
        dark: {
          DEFAULT: '#0f172a',
          lighter: '#1e293b',
          lightest: '#334155',
        },
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'premium-gradient': 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      boxShadow: {
        'premium': '0 10px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)',
        'premium-lg': '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
        'glow': '0 0 40px rgba(99,102,241,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'blob-delay': 'blob 8s ease-in-out 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
      },
    },
  },
  plugins: [],
}
