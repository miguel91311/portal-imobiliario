import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Quiet Luxury Palette - 60/30/10 Rule */
        cream: {
          50: '#FDFCFA',
          100: '#FAFAF8',
          200: '#F5F5F0',
          300: '#E8E8E0',
        },
        olive: {
          50: '#E9EBE9',
          100: '#C5CBC4',
          200: '#9DA89C',
          300: '#758574',
          400: '#576B56',
          500: '#3D4A3A', // Primary structural
          600: '#353F33',
          700: '#2A3228',
          800: '#1F251E',
          900: '#141914',
        },
        charcoal: {
          50: '#E6E8E9',
          100: '#BFC4C7',
          200: '#95A0A5',
          300: '#6B7B83',
          400: '#4C6069',
          500: '#36454F',
          600: '#2F3C45',
          700: '#252F36',
          800: '#1B2328',
          900: '#11171A',
        },
        accent: {
          DEFAULT: '#CC7722', // Burnt orange
          light: '#D9914A',
          dark: '#A6601C',
          gold: '#D4AF37',
        },
        /* Functional tokens */
        surface: '#FAFAF8',
        'surface-elevated': '#FFFFFF',
        foreground: '#1F251E',
        'foreground-muted': '#6B7B83',
        border: '#E8E8E0',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'heading-1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '400' }],
        'heading-2': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '400' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body-large': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
        'overline': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(29, 37, 28, 0.06)',
        'elevated': '0 8px 32px rgba(29, 37, 28, 0.08)',
        'card': '0 4px 24px rgba(29, 37, 28, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
