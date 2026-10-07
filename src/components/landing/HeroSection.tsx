'use client';

import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onEnter: () => void;
}

export function HeroSection({ onEnter }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden noise-bg">
      {/* 柔和光晕 */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(70,89,184,0.22) 0%, rgba(240,179,90,0.12) 40%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* 标题 */}
        <h1 className="font-serif-hero text-[clamp(3.5rem,8vw,7rem)] font-bold leading-none tracking-tight text-foreground hero-reveal">
          歧点
        </h1>

        {/* 签名装饰线 — SVG手绘风 */}
        <svg
          className="hero-reveal hero-reveal-delay-1 h-3 w-28"
          viewBox="0 0 112 12" fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 10 Q14 2 28 6 T56 6 T84 4 T110 8"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </svg>

        {/* 副标题 */}
        <p className="hero-reveal hero-reveal-delay-1 text-lg font-medium tracking-wide text-muted-foreground">
          为你探明前路
        </p>

        {/* 三行文案 */}
        <div className="hero-reveal-delay-2 hero-reveal mt-2 space-y-1">
          <p className="text-sm text-muted-foreground/70">不是告诉你该选哪条路</p>
          <p className="text-sm text-muted-foreground/70">而是让你看清每条路的样子</p>
          <p className="text-sm text-muted-foreground/70">然后自己决定</p>
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="hero-reveal-delay-2 hero-reveal mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(70,89,184,.24)] active:translate-y-0 active:scale-[0.98]"
        >
          开始探索
        </button>
      </div>

      {/* 向下滚动提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/30">
        <ArrowDown className="h-5 w-5" />
      </div>
    </section>
  );
}
