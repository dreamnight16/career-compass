import type { Metadata } from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: '歧点 — 看清每条岔路',
  description: '不是告诉你该选哪条路，而是让你看清每条路的样子，然后自己决定。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={cn(inter.variable, 'font-sans')}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
