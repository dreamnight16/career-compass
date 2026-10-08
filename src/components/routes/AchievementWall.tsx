'use client';

import { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import type { AppContext } from '@/lib/achievement-store';
import { ACHIEVEMENTS, getAchievements } from '@/lib/achievement-store';
import { cn } from '@/lib/utils';

type Category = 'all' | 'route' | 'streak' | 'explore' | 'growth' | 'special';

const FILTER_ITEMS: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '🏆' },
  { key: 'route', label: '路线', icon: '🥇' },
  { key: 'streak', label: '打卡', icon: '🔥' },
  { key: 'explore', label: '探索', icon: '🔍' },
  { key: 'growth', label: '成长', icon: '🧬' },
  { key: 'special', label: '特殊', icon: '💎' },
];

interface AchievementWallProps {
  context: AppContext;
}

export function AchievementWall({ context }: AchievementWallProps) {
  const [category, setCategory] = useState<Category>('all');
  const unlockedIds = useMemo(() => new Set(getAchievements().map(a => a.id)), [context]);
  const unlockedCount = unlockedIds.size;

  const filtered = useMemo(() => {
    let list = ACHIEVEMENTS;
    if (category !== 'all') list = list.filter(a => a.category === category);
    return list;
  }, [category]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="cc-h2 text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-dn-amber" aria-hidden="true" />
            成就大厅
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            已解锁 <span className="cc-num text-foreground">{unlockedCount}</span> / {ACHIEVEMENTS.length} 枚徽章
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => setCategory(item.key)}
            className={cn(
              'inline-flex min-h-11 items-center gap-1.5 px-3 text-sm transition-colors duration-200',
              category === item.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-dn-divider text-foreground'
            )}
            aria-pressed={category === item.key}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((badge, idx) => {
          const isUnlocked = unlockedIds.has(badge.id);
          const progress = badge.progress?.(context);
          const hasProgress = progress && !isUnlocked && progress.current > 0;
          const progressPct = progress ? Math.round((progress.current / progress.target) * 100) : 0;

          return (
            <button
              key={badge.id}
              disabled={!isUnlocked}
              className={cn(
                'relative flex flex-col items-center border p-4 text-center transition-colors duration-300',
                isUnlocked
                  ? 'badge-hover cc-tint-emerald border-dn-emerald cursor-pointer'
                  : 'border-border bg-secondary cursor-default',
                `badge-enter badge-enter-${(idx % 20) + 1}`
              )}
              aria-label={`${badge.title}${isUnlocked ? ' — 已解锁' : ' — 未解锁'}`}
            >
              {/* Icon：圆形图标容器是 rounded-full 的合理用法 */}
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full text-3xl',
                  isUnlocked
                    ? 'border-2 border-dn-emerald bg-dn-emerald text-dn-on-color'
                    : 'border border-border bg-dn-canvas grayscale opacity-60'
                )}
              >
                <span aria-hidden="true">{badge.icon}</span>
              </div>

              {/* Title */}
              <span className={cn(
                'mt-2 text-sm font-medium',
                isUnlocked ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {badge.title}
              </span>

              {/* Description or unlock condition */}
              <span className="mt-1 text-[11px] text-muted-foreground leading-tight">
                {isUnlocked ? badge.description : badge.condition}
              </span>

              {/* Progress bar (only for in-progress badges) */}
              {hasProgress && (
                <div className="mt-2 w-full">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span className="cc-num">{progress!.current}/{progress!.target}</span>
                    <span className="cc-num">{progressPct}%</span>
                  </div>
                  <div className="h-1 w-full bg-dn-canvas overflow-hidden">
                    <div
                      className="h-full bg-dn-teal transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 状态：形状 + 文字，不只用颜色或 emoji 表达 */}
              <span className={cn(
                'mt-2 cc-status text-[11px]',
                isUnlocked ? 'cc-status-done text-foreground' : 'cc-status-blocked text-muted-foreground'
              )}>
                {isUnlocked ? '已解锁' : '未解锁'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state for filtered empty */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <p>该分类暂无徽章</p>
        </div>
      )}
    </div>
  );
}
