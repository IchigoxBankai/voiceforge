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
        darkblue: {
          DEFAULT: '#274245',
          deep: '#1b3033',
          darker: '#142426',
          light: '#325256',
          border: '#3b6064'
        },
        sapling: {
          DEFAULT: '#DFD6AE',
          light: '#ebe4c5',
          muted: '#b5ad8c',
          dark: '#a69d79'
        },
        lattice: {
          dark: '#1b3033',
          card: '#274245',
          border: '#3b6064',
          hover: '#2f4e52',
          accent: '#DFD6AE',
          glow: '#DFD6AE',
          purple: '#cbbd8b'
        }
      },
      backgroundImage: {
        'lattice-grid': 'linear-gradient(to right, rgba(223, 214, 174, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(223, 214, 174, 0.07) 1px, transparent 1px)',
        'lattice-dots': 'radial-gradient(circle, rgba(223, 214, 174, 0.14) 1px, transparent 1px)'
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
        'grid-md': '40px 40px',
        'grid-lg': '60px 60px'
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
