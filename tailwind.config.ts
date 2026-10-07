import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn CSS variable mapping
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        sidebar: {
          background: 'var(--sidebar-background)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        // Keep custom palette for backward compat
        espresso: { DEFAULT: '#2C1A0E', muted: '#4A3728', light: '#6B5A4E' },
        cream: { DEFAULT: '#FAF4EC', bg: '#FDF9F4', line: '#D9C9B0' },
        terracotta: { light: '#F5E1D8', DEFAULT: '#C96442', deep: '#A0452A' },
        sage: { light: '#EDF2EC', DEFAULT: '#4A6741', deep: '#3A5233' },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        display: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(44, 26, 14, 0.04)',
        'card-hover': '0 0 0 1px rgba(201, 100, 66, 0.15), 0 2px 8px rgba(44, 26, 14, 0.06)',
        panel: '-1px 0 0 rgba(44, 26, 14, 0.06)',
        popover: '0 4px 16px rgba(44, 26, 14, 0.08), 0 0 0 1px rgba(44, 26, 14, 0.04)',
      },
      borderRadius: {
        card: '4px',
        control: '6px',
        panel: '12px',
        dialog: '16px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
};
export default config;
