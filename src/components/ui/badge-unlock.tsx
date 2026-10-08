'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Share2 } from 'lucide-react';
import type { AchievementDef } from '@/lib/achievement-store';
import { ParticleCanvas } from './particle-canvas';

interface BadgeUnlockOverlayProps {
  badge: AchievementDef;
  onClose: () => void;
}

export function BadgeUnlockOverlay({ badge, onClose }: BadgeUnlockOverlayProps) {
  const [phase, setPhase] = useState<'animating' | 'visible' | 'exiting'>('animating');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setPhase('exiting');
    setTimeout(onClose, 200);
  }, [onClose]);

  // 自动关闭用 ref 取最新的关闭回调：若把 handleClose 放进依赖数组，
  // 父组件每次渲染产生的新闭包会不断重置定时器，导致永远不触发。
  const handleCloseRef = useRef(handleClose);
  useEffect(() => { handleCloseRef.current = handleClose; }, [handleClose]);

  useEffect(() => {
    // Phase 1: particle burst (DNDL 品牌色粒子)
    const t1 = setTimeout(() => setPhase('visible'), 400);
    // 自动关闭：必须走完整的关闭流程（onClose），否则会留下一层不可见
    // 但覆盖全屏、拦截点击的遮罩，解锁队列也不再前进。
    const t2 = setTimeout(() => handleCloseRef.current(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // 焦点管理：打开时把焦点移入模态（关闭按钮），关闭后还给触发元素
  useEffect(() => {
    previousFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const t = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(t);
      previousFocusRef.current?.focus?.();
    };
  }, []);

  // Escape 关闭：绑定在 document 上，焦点即便移到模态外也能关闭
  useEffect(() => {
    const onDocKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onDocKeyDown);
    return () => document.removeEventListener('keydown', onDocKeyDown);
  }, [handleClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  }, [handleClose]);

  if (phase === 'exiting') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 opacity-0">
        <div className="absolute inset-0" style={{ background: 'var(--dn-overlay)' }} onClick={handleClose} />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop：DNDL 覆盖层实色，不再用 bg-black 与 backdrop-blur */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--dn-overlay)' }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Particle layer */}
      <ParticleCanvas mode="gold-spark" duration={2500} />

      {/* Badge card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`成就解锁: ${badge.title}`}
        className={`relative z-10 mx-4 max-w-xs w-full bg-card border border-border p-6 text-center shadow-dialog ${
          phase === 'animating' ? 'badge-unlocking' : 'spring-in'
        }`}
      >
        {/* 关闭按钮：可键盘到达，点击区域 ≥44px */}
        <button
          ref={closeButtonRef}
          onClick={handleClose}
          className="absolute top-2 right-2 flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:bg-dn-divider hover:text-foreground transition-colors"
          aria-label="关闭成就弹窗"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* 徽章图标：Emerald 实色圆场，无循环光晕 */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dn-emerald bg-dn-emerald text-dn-on-color">
          <span className="text-4xl" aria-hidden="true">{badge.icon}</span>
        </div>

        {/* Title + description */}
        <h3 className="cc-h2 text-foreground mb-2">
          {badge.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {badge.description}
        </p>

        {/* Category label */}
        <span className="inline-block cc-tint-teal px-3 py-1 text-xs font-medium text-foreground">
          {categoryLabel(badge.category)}
        </span>

        {/* Share hint */}
        <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Share2 className="h-3 w-3" aria-hidden="true" />
          去成就图鉴查看全部徽章
        </p>
      </div>
    </div>
  );
}

function categoryLabel(cat: string): string {
  switch (cat) {
    case 'route': return '路线里程碑';
    case 'streak': return '连续打卡';
    case 'explore': return '探索发现';
    case 'growth': return '成长印记';
    case 'special': return '特殊成就';
    default: return cat;
  }
}
