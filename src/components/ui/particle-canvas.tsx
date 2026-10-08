'use client';

import { useEffect, useRef, useCallback } from 'react';

type ParticleMode = 'confetti' | 'gold-spark' | 'smoke';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

interface ParticleCanvasProps {
  mode: ParticleMode;
  duration?: number; // ms, default 2000
  onComplete?: () => void;
}

/** DNDL Token 兜底值：仅在 getComputedStyle 读不到 Token 时使用（SSR / Token 文件未加载）。 */
const TOKEN_FALLBACK: Record<string, string> = {
  '--dn-teal': '#59AAA5',
  '--dn-cyan': '#70B2D1',
  '--dn-emerald': '#72AD8C',
  '--dn-violet': '#A18BC8',
  '--dn-amber': '#D4AC65',
  '--dn-orange': '#D78E74',
  '--dn-steel': '#829BA9',
  '--dn-ink-secondary': '#657B77',
  '--dn-ink-muted': '#82938F',
};

function readToken(name: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return TOKEN_FALLBACK[name] ?? TOKEN_FALLBACK['--dn-teal'];
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || TOKEN_FALLBACK[name] || TOKEN_FALLBACK['--dn-teal'];
}

/** 粒子配色全部来自 DNDL Token，不使用品牌外颜色或金色渐变。
 *  gold-spark 改为 Amber / Orange / Cyan / Teal 的品牌组合。 */
const TOKENS_BY_MODE: Record<ParticleMode, string[]> = {
  'confetti': ['--dn-teal', '--dn-cyan', '--dn-emerald', '--dn-violet', '--dn-amber', '--dn-orange', '--dn-steel'],
  'gold-spark': ['--dn-amber', '--dn-orange', '--dn-cyan', '--dn-teal'],
  'smoke': ['--dn-ink-secondary', '--dn-ink-muted', '--dn-ink-secondary'],
};

function colorsByMode(mode: ParticleMode): string[] {
  return TOKENS_BY_MODE[mode].map(readToken);
}

function createParticles(mode: ParticleMode, w: number, h: number, count: number): Particle[] {
  const colors = colorsByMode(mode);
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = mode === 'smoke' ? 0.3 + Math.random() * 0.5 : 2 + Math.random() * 6;
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 60,
      y: h / 2 + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (mode === 'confetti' ? 3 : 0),
      life: 0,
      maxLife: mode === 'smoke' ? 60 + Math.random() * 40 : 30 + Math.random() * 40,
      size: mode === 'smoke' ? 6 + Math.random() * 10 : 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    });
  }
  return particles;
}

export function ParticleCanvas({ mode, duration = 2000, onComplete }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const count = mode === 'smoke' ? 12 : mode === 'gold-spark' ? 25 : 50;

  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === 0) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    if (elapsed > duration) {
      cancelAnimationFrame(animRef.current);
      onCompleteRef.current?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const gravity = mode === 'smoke' ? -0.02 : 0.12;
    const friction = mode === 'smoke' ? 0.99 : 0.985;

    for (const p of particlesRef.current) {
      p.life++;
      if (p.life >= p.maxLife) continue;

      p.vy += gravity;
      p.vx *= friction;
      p.vy *= friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      const lifeRatio = 1 - p.life / p.maxLife;
      const alpha = mode === 'smoke' ? lifeRatio * 0.4 : lifeRatio;
      const scale = mode === 'smoke' ? 1 + (1 - lifeRatio) : lifeRatio;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = alpha;

      if (mode === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * scale / 2, -p.size * scale / 4, p.size * scale, p.size * scale / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * scale / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    }

    animRef.current = requestAnimationFrame(animate);
  }, [duration, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = createParticles(mode, canvas.width, canvas.height, count);
    startTimeRef.current = 0;
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [mode, count, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-50"
      aria-hidden="true"
    />
  );
}
