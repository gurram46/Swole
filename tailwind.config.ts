import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#f5f5f5',
        primary: {
          DEFAULT: '#a855f7',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        border: '#27272a',
        input: '#27272a',
        ring: '#a855f7',
        muted: {
          DEFAULT: '#18181b',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#27272a',
          foreground: '#f5f5f5',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#18181b',
          foreground: '#f5f5f5',
        },
        popover: {
          DEFAULT: '#18181b',
          foreground: '#f5f5f5',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
