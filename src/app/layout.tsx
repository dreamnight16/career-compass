import type { Metadata, Viewport } from 'next';
// DNDL（DreamNight Design Language）以确定版本引入，保留同级关系。
// 版本与来源见 public/vendor/dndl/VERSION；文件请勿就地改动数值。
import './globals.css';
import { Toaster } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: '歧点 — 看清每条岔路',
  description: '不是告诉你该选哪条路，而是让你看清每条路的样子，然后自己决定。',
};

export const viewport: Viewport = {
  themeColor: '#F9FBFA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* DNDL · Implementation 1.1.0 · 品牌基准 DNDL v1.0 */}
        <link rel="stylesheet" href="/vendor/dndl/tokens.css" />
        <link rel="stylesheet" href="/vendor/dndl/materials.css" />
        <link rel="stylesheet" href="/vendor/dndl/motion.css" />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#cc-main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:min-h-11 focus:items-center focus:bg-dn-ink focus:px-4 focus:py-2 focus:text-dn-on-ink"
        >
          跳到主要内容
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
