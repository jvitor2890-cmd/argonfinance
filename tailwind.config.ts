import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        argon: {
          navy: '#0D1B2A',
          'navy-800': '#112236',
          'navy-700': '#1A3250',
          blue: '#1D6FA4',
          'blue-light': '#2E86C1',
          'blue-50': '#EBF5FB',
          green: '#10B981',
          'green-dark': '#059669',
          'green-50': '#ECFDF5',
          red: '#EF4444',
          'red-50': '#FEF2F2',
          amber: '#F59E0B',
          'amber-50': '#FFFBEB',
          surface: '#F1F5F9',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
export default config;
