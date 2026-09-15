const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        ...colors,
        // Tailwind v2's default palette stops at 900; add the 950 shades
        // this project uses for dark-mode backgrounds.
        gray: { ...colors.gray, 950: '#030712' },
        indigo: { ...colors.indigo, 950: '#1e1b4b' },
        amber: { ...colors.amber, 950: '#451a03' },
        red: { ...colors.red, 950: '#450a0a' },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {
      backgroundOpacity: ['dark'],
      backdropBlur: ['responsive'],
      backdropFilter: ['responsive'],
    },
  },
  plugins: [],
};
