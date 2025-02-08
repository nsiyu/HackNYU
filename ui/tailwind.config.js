/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,tsx,jsx}"],  
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052FF',
          dark: '#0039B3',
          light: '#3378FF'
        },
        secondary: {
          DEFAULT: '#1E2026',
          dark: '#0B0E11',
          light: '#2B3139'
        },
        accent: {
          DEFAULT: '#0ECB81',
          red: '#F6465D',
          blue: '#0052FF'
        }
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        float: 'float 20s ease-in-out infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { 
            transform: 'translateY(0) translateX(0) scale(1)',
            opacity: 0.3
          },
          '50%': { 
            transform: 'translateY(-400px) translateX(200px) scale(1.1)',
            opacity: 0.5
          },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(1.5)' },
        }
      },
      variants: {
        extend: {
          backgroundImage: ['selection'],
          backgroundClip: ['selection'],
          textColor: ['selection'],
          backgroundColor: ['selection']
        }
      }
    },
  },
  plugins: [],
}