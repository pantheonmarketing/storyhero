/** Ported from the user's own storysparkfinal project (pantheonmarketing) */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        // Friendly rounded display type (Fredoka for Latin, Mitr covers Thai)
        playfair: ['Fredoka', 'Mitr', 'sans-serif'],
        crimson: ['Mitr', 'Noto Sans Thai', 'sans-serif'],
        sf: ['SF Pro Display', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        comic: ['Comic Neue', 'Mali', 'cursive', 'sans-serif'],
      },
      keyframes: {
        'pulse-slow': { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
        tilt: { '0%, 100%': { transform: 'rotate(-1deg)' }, '50%': { transform: 'rotate(1.5deg)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        'pulse-soft': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.8' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        tilt: 'tilt 10s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
      },
    },
  },
  plugins: [],
};
