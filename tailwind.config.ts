import type { Config } from 'tailwindcss';

/**
 * Tailwind 主题层。
 *
 * 数值不在本文件硬编码：全部指向 DNDL（public/vendor/dndl/tokens.css）的
 * `--dn-*` 变量。组件请优先使用 `bg-dn-*` / `text-dn-*` 或语义类
 * （`bg-background`、`text-foreground`、`border-border`），不要写死颜色。
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 语义层 → shadcn 变量 → globals.css 中映射到 DNDL 语义 Token
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
        // DNDL 原始色与语义色。八个品牌色与六个基础色即为品牌基准，
        // 不得为调对比度而改动取值。
        dn: {
          teal: 'var(--dn-teal)',
          cyan: 'var(--dn-cyan)',
          emerald: 'var(--dn-emerald)',
          violet: 'var(--dn-violet)',
          amber: 'var(--dn-amber)',
          orange: 'var(--dn-orange)',
          steel: 'var(--dn-steel)',
          crimson: 'var(--dn-crimson)',
          canvas: 'var(--dn-canvas)',
          surface: 'var(--dn-surface)',
          ink: 'var(--dn-ink-primary)',
          'ink-secondary': 'var(--dn-ink-secondary)',
          'ink-muted': 'var(--dn-ink-muted)',
          divider: 'var(--dn-divider)',
          'text-primary': 'var(--dn-text-primary)',
          'text-secondary': 'var(--dn-text-secondary)',
          'on-color': 'var(--dn-text-on-color)',
          'on-ink': 'var(--dn-text-on-ink)',
          focus: 'var(--dn-focus)',
        },
      },
      fontFamily: {
        sans: ['var(--dn-font)'],
        display: ['var(--dn-font-display)'],
      },
      // 默认直角。圆形只允许用于确有功能需要的元素（头像、状态点、图标）。
      borderRadius: {
        sm: 'var(--dn-radius)',
        DEFAULT: 'var(--dn-radius)',
        md: 'var(--dn-radius)',
        lg: 'var(--dn-radius)',
        xl: 'var(--dn-radius)',
        '2xl': 'var(--dn-radius)',
        '3xl': 'var(--dn-radius)',
        card: 'var(--dn-radius)',
        control: 'var(--dn-radius)',
        panel: 'var(--dn-radius)',
        dialog: 'var(--dn-radius)',
      },
      boxShadow: {
        // 与 DNDL 层级一致：Level 0/1 无阴影，阴影只解释层级。
        panel: 'var(--dn-shadow-0)',
        card: 'var(--dn-shadow-1)',
        'card-hover': 'var(--dn-shadow-2)',
        popover: 'var(--dn-shadow-3)',
        dialog: 'var(--dn-shadow-4)',
      },
      transitionDuration: {
        hover: 'var(--dn-duration-hover)',
        press: 'var(--dn-duration-press)',
        expand: 'var(--dn-duration-expand)',
        page: 'var(--dn-duration-page)',
      },
      transitionTimingFunction: {
        'dn-in': 'var(--dn-ease-in)',
        'dn-out': 'var(--dn-ease-out)',
        'dn-snap': 'var(--dn-ease-snap)',
      },
    },
  },
  plugins: [],
};
export default config;
