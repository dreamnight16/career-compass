'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { X, Search } from 'lucide-react';
import { getActivities, getStats, type ActivityEntry } from '@/lib/activity-store';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ totalConversations: 0, competencyAssessments: 0, resourceSaves: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      setActivities(getActivities());
      setStats(getStats());
    }
  }, [open]);

  // Esc 关闭 + focus trap
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // 打开时焦点进抽屉（底层内容保持挂载）；关闭后焦点回到触发元素
  useEffect(() => {
    if (!open) return;
    restoreRef.current = (document.activeElement as HTMLElement | null) ?? null;
    panelRef.current?.focus();
    return () => {
      const back = restoreRef.current;
      if (back && document.contains(back)) back.focus();
    };
  }, [open]);

  // 键盘可达：Tab 焦点保持在抽屉内循环
  const trapFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  };

  const filtered = search.trim()
    ? activities.filter((a) => a.title.includes(search) || (a.detail || '').includes(search))
    : activities;

  if (!open) return null;

  return (
    <>
      {/* backdrop：点击仍可关闭，装饰性元素对读屏隐藏 */}
      <div className="fixed inset-0 z-40 bg-[color:var(--dn-overlay)]" onClick={onClose} aria-hidden="true" />

      {/* drawer：真正的覆盖层，允许用 acrylic */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-drawer-title"
        tabIndex={-1}
        onKeyDown={trapFocus}
        className="dn-acrylic dn-elevation-3 fixed right-0 top-0 z-50 flex h-screen w-80 flex-col"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 id="history-drawer-title" className="text-base font-medium text-foreground">历史记录</h3>
          <button onClick={onClose} aria-label="关闭历史记录"
            className="dn-interactive dn-focus -mr-2 inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* 搜索 */}
        <div className="border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 border border-input bg-background px-3">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索历史..."
              aria-label="搜索历史记录"
              className="min-h-11 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* 活动列表：平面 + 分隔线，不再是白色圆角卡片堆叠 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground">
              {search ? '无匹配记录' : '暂无活动记录'}
            </p>
          ) : (
            <ul>
              {filtered.map((a) => (
                <li key={a.id} className="border-b border-border py-2.5 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-foreground">{a.title}</span>
                    <span className="cc-num shrink-0 text-[10px] text-foreground">
                      {new Date(a.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                  {a.detail && <p className="mt-1 text-[11px] text-foreground">{a.detail}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 统计：Ink 实色场上的数字，来源为本机本地记录 */}
        <div className="border-t border-border px-4 py-3">
          <div className="grid grid-cols-2 gap-4 bg-dn-ink px-4 py-3">
            <div>
              <p className="cc-num text-2xl text-dn-on-ink">{stats.totalConversations}</p>
              <p className="mt-1 cc-kicker text-dn-on-ink opacity-70">总对话</p>
            </div>
            <div>
              <p className="cc-num text-2xl text-dn-on-ink">{stats.competencyAssessments}</p>
              <p className="mt-1 cc-kicker text-dn-on-ink opacity-70">能力评估</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-foreground">统计口径：本机本地记录</p>
        </div>
      </div>
    </>
  );
}
