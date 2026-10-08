'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  /** Current count (e.g., unlocked badges) */
  value: number;
  /** Total count (e.g., 20 total badges) */
  total: number;
  /** Diameter in px */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  className?: string;
}

/** 进度档位 → DNDL 品牌 Token + 文字语义。
 *  档位不只靠颜色表达：同一档位的文字同时写进 aria-label。 */
function ringTier(pct: number): { token: string; label: string } {
  if (pct >= 0.75) return { token: '--dn-emerald', label: '接近达标' };
  if (pct >= 0.5)  return { token: '--dn-cyan', label: '过半' };
  if (pct >= 0.25) return { token: '--dn-teal', label: '推进中' };
  return { token: '--dn-steel', label: '起步' };
}

export function ProgressRing({ value, total, size = 36, strokeWidth = 3, className }: ProgressRingProps) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const tier = ringTier(pct);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${value}/${total} 成就 · ${tier.label}`}
    >
      {/* 轨道：Divider 实色，不再用透明度修饰符 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-dn-divider"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ stroke: `var(${tier.token})`, transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.3s ease' }}
      />
    </svg>
  );
}
