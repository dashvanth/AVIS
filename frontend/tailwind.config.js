/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        avis: {
          primary: '#0B0F14',       // Deep Charcoal
          secondary: '#111827',     // Soft Graphite
          glass: 'rgba(255, 255, 255, 0.06)', // Frosted Black
          border: 'rgba(255, 255, 255, 0.08)', // Subtle Gray
          text: {
            primary: '#E5E7EB',     // Off-White
            secondary: '#9CA3AF',   // Muted Gray
          },
          accent: {
            indigo: '#6366F1',      // Electric Indigo
            cyan: '#22D3EE',        // Neon Cyan
            success: '#A3E635',     // Soft Lime
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
