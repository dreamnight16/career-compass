'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, UserCircle, Library, ChevronLeft, ChevronRight, History, User,
  Map, BarChart3, GitBranch, Compass, BookOpen, MoreHorizontal, Contrast,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from '@/components/ui/progress-ring';
import { getAchievementCount, TOTAL_ACHIEVEMENTS } from '@/lib/achievement-store';

/**
 * 导航信息架构：四个推进阶段 + 一段可选的辅助。
 *
 * 模块本身与 `?tab=` 取值保持不变（coach / profile / careers / explore /
 * resources / sim / journal / routes），只是把它们按产品的四段循环重新分组，
 * 让用户始终知道自己站在哪一段、下一步往哪走。
 */
interface NavItem {
  id: string;
  icon: typeof Sparkles;
  label: string;
  hint: string;
}

interface NavStage {
  key: string;
  index: string;
  title: string;
  /** 阶段标识色：只作为实色标记与选中底色，文字始终用可读的 Ink/Surface 语义色 */
  marker: string;
  activeField: string;
  items: NavItem[];
}

const COACH: NavItem = {
  id: 'coach',
  icon: Sparkles,
  label: '决策教练',
  hint: '可选 · 摊开取舍',
};

const STAGES: NavStage[] = [
  {
    key: 'self',
    index: '一',
    title: '看清自己',
    marker: 'bg-dn-cyan',
    activeField: 'bg-dn-cyan text-dn-on-color',
    items: [{ id: 'profile', icon: UserCircle, label: '个人画像', hint: '角色卡 · 能力诊断' }],
  },
  {
    key: 'paths',
    index: '二',
    title: '看清路',
    marker: 'bg-dn-emerald',
    activeField: 'bg-dn-emerald text-dn-on-color',
    items: [
      { id: 'careers', icon: Compass, label: '路径探索', hint: '职业条目' },
      { id: 'explore', icon: BarChart3, label: '数据对比', hint: '薪资 · 城市 · 行业' },
      { id: 'resources', icon: Library, label: '资源库', hint: '策展链接索引' },
    ],
  },
  {
    key: 'decide',
    index: '三',
    title: '做决定',
    marker: 'bg-dn-violet',
    activeField: 'bg-dn-violet text-dn-on-color',
    items: [
      { id: 'sim', icon: GitBranch, label: '路径模拟', hint: '三步路线框架' },
      { id: 'journal', icon: BookOpen, label: '决策日志', hint: '权衡与放弃理由' },
    ],
  },
  {
    key: 'keep',
    index: '四',
    title: '走下去',
    marker: 'bg-dn-amber',
    activeField: 'bg-dn-amber text-dn-on-color',
    items: [{ id: 'routes', icon: Map, label: '成就图鉴', hint: '徽章 · 连续打卡' }],
  },
];

const ALL_ITEMS: NavItem[] = [COACH, ...STAGES.flatMap((s) => s.items)];

/** 移动端底部只保留最常用的入口，其余按阶段收进「更多」 */
const MOBILE_PRIMARY = ['coach', 'profile', 'careers'];

export function AppSidebar({ onOpenHistory }: { onOpenHistory: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const activeTab = params.get('tab') || 'coach';
  const [collapsed, setCollapsed] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [transparencyOff, setTransparencyOff] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('career-compass-sidebar-collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      } else if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setBadgeCount(getAchievementCount());
    const refresh = () => setBadgeCount(getAchievementCount());
    window.addEventListener('badges-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('badges-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // 覆盖层：Escape 关闭，关闭后焦点回到触发元素
  useEffect(() => {
    if (!mobileMoreOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMoreOpen]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('career-compass-sidebar-collapsed', String(next)); }
    catch { /* ignore */ }
  };

  /** DNDL 透明度开关：写入 [data-dn-transparency="off"]，materials.css 会切到不透明回退 */
  const toggleTransparency = () => {
    const next = !transparencyOff;
    setTransparencyOff(next);
    if (next) document.documentElement.setAttribute('data-dn-transparency', 'off');
    else document.documentElement.removeAttribute('data-dn-transparency');
  };

  const closeMoreAndGo = (tabId: string) => {
    setMobileMoreOpen(false);
    navigate(tabId, router);
  };

  return (
    <aside
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex h-16 w-full flex-row border-t border-sidebar-border bg-dn-ink cc-on-ink',
        'lg:static lg:inset-auto lg:h-screen lg:flex-col lg:border-r lg:border-t-0',
        collapsed ? 'lg:w-[76px]' : 'lg:w-[268px]',
      )}
    >
      {/* 品牌标记 */}
      <div className="hidden h-20 shrink-0 items-center gap-3 px-4 lg:flex">
        <button
          onClick={toggleCollapse}
          className="dn-focus flex h-11 w-11 shrink-0 items-center justify-center text-dn-on-ink transition-colors duration-hover hover:bg-[rgba(255,255,255,0.10)]"
          aria-label={collapsed ? '展开导航' : '收起导航'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
        </button>
        {!collapsed && (
          <span className="cc-h2 text-dn-on-ink">歧点</span>
        )}
      </div>

      {/* 桌面导航：四段 + 可选辅助 */}
      <nav aria-label="主导航" className="hidden min-w-0 flex-1 flex-col overflow-y-auto px-2 pb-4 lg:flex">
        <NavRow
          item={COACH}
          active={activeTab === COACH.id}
          collapsed={collapsed}
          activeField="bg-dn-teal text-dn-on-color"
          marker="bg-dn-teal"
          onSelect={() => navigate(COACH.id, router)}
          showBadge
          badgeCount={badgeCount}
        />

        {STAGES.map((stage) => (
          <div key={stage.key} className="mt-5">
            <p
              className={cn(
                'flex items-center gap-2 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[2.2px]',
                collapsed && 'lg:justify-center lg:px-0',
              )}
              style={{ color: 'var(--cc-on-ink-dim)' }}
            >
              <span className={cn('h-2 w-2 shrink-0', stage.marker)} aria-hidden="true" />
              {!collapsed && `${stage.index} · ${stage.title}`}
              {collapsed && <span className="sr-only">{`${stage.index} · ${stage.title}`}</span>}
            </p>
            <div className="flex flex-col">
              {stage.items.map((item) => (
                <NavRow
                  key={item.id}
                  item={item}
                  active={activeTab === item.id}
                  collapsed={collapsed}
                  activeField={stage.activeField}
                  marker={stage.marker}
                  onSelect={() => navigate(item.id, router)}
                  showBadge={item.id === 'routes'}
                  badgeCount={badgeCount}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 移动端：底部主入口 + 阶段化「更多」 */}
      <nav aria-label="主要导航" className="flex min-w-0 flex-1 items-stretch lg:hidden">
        {ALL_ITEMS.filter((i) => MOBILE_PRIMARY.includes(i.id)).map((item) => {
          const isActive = activeTab === item.id;
          const stage = STAGES.find((s) => s.items.some((i) => i.id === item.id));
          const activeField = item.id === COACH.id ? 'bg-dn-teal text-dn-on-color' : stage?.activeField;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => closeMoreAndGo(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'dn-focus flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors duration-hover',
                isActive ? activeField : 'text-dn-on-ink hover:bg-[rgba(255,255,255,0.10)]',
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        <button
          ref={moreButtonRef}
          type="button"
          onClick={() => setMobileMoreOpen((open) => !open)}
          aria-label="更多入口"
          aria-expanded={mobileMoreOpen}
          aria-controls="mobile-more-navigation"
          className={cn(
            'dn-focus flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors duration-hover',
            mobileMoreOpen ? 'bg-dn-steel text-dn-on-color' : 'text-dn-on-ink hover:bg-[rgba(255,255,255,0.10)]',
          )}
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          <span className="truncate">更多</span>
        </button>
      </nav>

      {mobileMoreOpen && (
        <div
          id="mobile-more-navigation"
          role="dialog"
          aria-label="更多模块"
          className="dn-acrylic cc-focus-on-surface absolute bottom-[calc(100%+0.5rem)] right-2 z-50 w-80 max-w-[calc(100vw-1rem)] p-4 lg:hidden"
        >
          {STAGES.map((stage) => (
            <div key={stage.key} className="mb-4 last:mb-2">
              <p className="flex items-center gap-2 pb-2 text-[11px] font-semibold uppercase tracking-[2.2px] text-foreground">
                <span className={cn('h-2 w-2 shrink-0', stage.marker)} aria-hidden="true" />
                {stage.index} · {stage.title}
              </p>
              <div className="flex flex-col gap-px">
                {stage.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => closeMoreAndGo(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'dn-focus flex min-h-11 min-w-0 items-center gap-3 px-3 py-2 text-left text-sm transition-colors duration-hover',
                        isActive ? stage.activeField : 'text-foreground hover:bg-secondary',
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-px border-t border-border pt-2">
            <button
              type="button"
              onClick={() => { setMobileMoreOpen(false); onOpenHistory(); }}
              className="dn-focus flex min-h-11 min-w-0 items-center gap-3 px-3 py-2 text-left text-sm text-foreground transition-colors duration-hover hover:bg-secondary"
            >
              <History className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">历史记录</span>
            </button>
          </div>
        </div>
      )}

      {/* 底部：记录 + 透明度开关 */}
      <div className="hidden shrink-0 flex-col gap-px border-t border-sidebar-border px-2 py-3 lg:flex">
        <button
          onClick={onOpenHistory}
          className="dn-focus flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm text-dn-on-ink transition-colors duration-hover hover:bg-[rgba(255,255,255,0.10)]"
        >
          <User className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span className="truncate">探索者 · 历史记录</span>}
          {collapsed && <span className="sr-only">历史记录</span>}
        </button>
        <button
          onClick={toggleTransparency}
          aria-pressed={transparencyOff}
          className="dn-focus flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm text-dn-on-ink transition-colors duration-hover hover:bg-[rgba(255,255,255,0.10)]"
        >
          <Contrast className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span className="truncate">覆盖层不透明{transparencyOff ? '：已开启' : '：跟随系统'}</span>}
          {collapsed && <span className="sr-only">切换覆盖层不透明模式</span>}
        </button>
      </div>
    </aside>
  );
}

function NavRow({
  item, active, collapsed, activeField, marker, onSelect, showBadge, badgeCount,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  activeField: string;
  marker: string;
  onSelect: () => void;
  showBadge?: boolean;
  badgeCount: number;
}) {
  return (
    <button
      onClick={onSelect}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        'dn-focus flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-hover',
        active ? activeField : 'text-dn-on-ink hover:bg-[rgba(255,255,255,0.10)]',
      )}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <item.icon className="h-5 w-5" aria-hidden="true" />
        {!active && <span className={cn('absolute -left-3 h-4 w-[3px]', marker)} aria-hidden="true" />}
      </span>
      {!collapsed && (
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{item.label}</span>
          <span className={cn('truncate text-[11px]', active ? 'text-dn-on-color' : '')} style={active ? undefined : { color: 'var(--cc-on-ink-dim)' }}>
            {item.hint}
          </span>
        </span>
      )}
      {showBadge && <ProgressRing value={badgeCount} total={TOTAL_ACHIEVEMENTS} size={22} strokeWidth={2} />}
    </button>
  );
}

function navigate(tabId: string, router: ReturnType<typeof useRouter>) {
  router.push(`/main?tab=${tabId}`);
}
