/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      colors: {
        'deep-space': '#0a0a0f',
        'dark-purple': '#1a1a2e',
        'cosmic-pink': '#ff6b6b',
        'cyber-teal': '#4ecdc4',
        'warm-yellow': '#ffe66d',
        'nebula-purple': '#9b59b6',
        'aurora-blue': '#3498db',
      },
      
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Noto Sans SC', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(155, 89, 182, 0.5), 0 0 40px rgba(155, 89, 182, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(155, 89, 182, 0.8), 0 0 80px rgba(155, 89, 182, 0.5)' 
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #2d1f4e 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-neon': 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #ffe66d)',
      },
      
      boxShadow: {
        'neon': '0 0 20px rgba(78, 205, 196, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 107, 107, 0.5)',
        'glow': '0 0 30px rgba(155, 89, 182, 0.4)',
      },
    },
  },
  
  plugins: [],
};
