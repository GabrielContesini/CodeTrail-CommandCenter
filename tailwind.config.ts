import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ─────────────────────────────────────────────────────────────
           BACKGROUND LAYERS (Dark Mode)
        ───────────────────────────────────────────────────────────────── */
        background: '#131313',
        'surface': '#201f1f',
        'surface-dim': '#131313',
        'surface-bright': '#393939',
        'surface-container': '#201f1f',
        'surface-container-low': '#1c1b1b',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',

        /* ─────────────────────────────────────────────────────────────
           BRAND COLOR (Cyan Primary)
        ───────────────────────────────────────────────────────────────── */
        'primary': '#c3f5ff',
        'primary-fixed': '#9cf0ff',
        'primary-fixed-dim': '#00daf3',
        'primary-container': '#00e5ff',
        'on-primary': '#00363d',
        'on-primary-container': '#00626e',
        'on-primary-fixed': '#001f24',
        'on-primary-fixed-variant': '#004f58',

        /* ─────────────────────────────────────────────────────────────
           SECONDARY COLOR (Gray - Neutral)
        ───────────────────────────────────────────────────────────────── */
        'secondary': '#c8c6c5',
        'secondary-container': '#4a4949',
        'secondary-fixed': '#e5e2e1',
        'secondary-fixed-dim': '#c8c6c5',
        'on-secondary': '#313030',
        'on-secondary-container': '#bab8b7',
        'on-secondary-fixed': '#1c1b1b',
        'on-secondary-fixed-variant': '#474646',

        /* ─────────────────────────────────────────────────────────────
           TERTIARY COLOR (Cyan Variant - Accent)
        ───────────────────────────────────────────────────────────────── */
        'tertiary': '#c9f3ff',
        'tertiary-container': '#56e1fe',
        'tertiary-fixed': '#a8edff',
        'tertiary-fixed-dim': '#49d7f4',
        'on-tertiary': '#00363f',
        'on-tertiary-container': '#006271',
        'on-tertiary-fixed': '#001f26',
        'on-tertiary-fixed-variant': '#004e5b',

        /* ─────────────────────────────────────────────────────────────
           TEXT & TYPOGRAPHY
        ───────────────────────────────────────────────────────────────── */
        'on-background': '#e5e2e1',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#bac9cc',
        'inverse-surface': '#e5e2e1',
        'inverse-on-surface': '#313030',
        'inverse-primary': '#006875',
        'surface-tint': '#00daf3',

        /* ─────────────────────────────────────────────────────────────
           SEMANTIC COLORS (Status)
        ───────────────────────────────────────────────────────────────── */
        'error': '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',

        /* ─────────────────────────────────────────────────────────────
           OUTLINE / BORDERS
        ───────────────────────────────────────────────────────────────── */
        'outline': '#849396',
        'outline-variant': '#3b494c',
      },

      fontFamily: {
        'inter': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        'DEFAULT': '0.5rem',
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        'full': '9999px',
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
        'panel': '0 0 0 1px rgba(132, 147, 150, 0.1), 0 1px 3px rgba(0,0,0,0.3)',
        'raised': '0 4px 16px rgba(0,0,0,0.4)',
        'overlay': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(132, 147, 150, 0.1)',
        'glow': '0 0 15px rgba(0, 229, 255, 0.3)',
        'glow-sm': '0 0 8px rgba(0, 229, 255, 0.3)',
        'glow-lg': '0 0 24px rgba(0, 229, 255, 0.4)',
      },

      animation: {
        'pulse-slow': 'pulse-slow 2.4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'enter-up': 'enter-up 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 229, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.5)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'slide-in': {
          'from': {
            opacity: '0',
            transform: 'translateX(-8px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'enter-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(12px) scale(0.98)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },

      backdropBlur: {
        'md': '12px',
        'lg': '16px',
      },

      spacing: {
        'sidebar': '16rem', // 256px
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};

export default config;
