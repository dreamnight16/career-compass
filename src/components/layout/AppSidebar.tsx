'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sparkles, UserCircle, Library, ChevronLeft, ChevronRight, History, User, Map, BarChart3, GitBranch, Compass, BookOpen, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from '@/components/ui/progress-ring';
import { getAchievementCount, TOTAL_ACHIEVEMENTS } from '@/lib/achievement-store';

const NAV_ITEMS = [
  { id: 'coach',     icon: Sparkles,    label: '决策教练', en: 'Coach · 可选' },
  { id: 'profile',   icon: UserCircle,  label: '个人画像', en: 'Profile' },
  { id: 'routes',    icon: Map,         label: '成就图鉴', en: 'Routes' },
  { id: 'journal',   icon: BookOpen,    label: '决策日志', en: 'Journal' },
  { id: 'explore',   icon: BarChart3,   label: '数据对比', en: 'Compare' },
  { id: 'sim',       icon: GitBranch,   label: '路径模拟', en: 'Simulate' },
  { id: 'careers',   icon: Compass,     label: '路径探索', en: 'Careers' },
  { id: 'resources', icon: Library,     label: '资源库',   en: 'Resources' },
] as const;

const MOBILE_PRIMARY_ITEMS = NAV_ITEMS.slice(0, 4);
const MOBILE_MORE_ITEMS = NAV_ITEMS.slice(4);

export function AppSidebar({ onOpenHistory }: { onOpenHistory: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const activeTab = params.get('tab') || 'coach';
  const [collapsed, setCollapsed] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const mobileMoreActive = MOBILE_MORE_ITEMS.some((item) => item.id === activeTab);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('career-compass-sidebar-collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      } else if (window.innerWidth < 768) {
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

  useEffect(() => {
    if (!mobileMoreOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMoreOpen(false);
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

  return (
    <aside
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex h-16 w-full flex-row border-t border-border/30 bg-background/95 backdrop-blur-sm transition-[width] duration-200 ease-out',
        'md:static md:inset-auto md:h-screen md:flex-col md:border-r md:border-t-0',
        collapsed ? 'md:w-16' : 'md:w-[232px]',
      )}
    >
      {/* Logo */}
      <div className="hidden h-14 items-center gap-2.5 px-4 md:flex">
        <button onClick={toggleCollapse}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50 transition-all hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? '展开' : '收起'}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {!collapsed && <span className="text-base font-bold tracking-tight text-foreground">歧点</span>}
      </div>

      {/* Desktop nav */}
      <nav className="hidden min-w-0 flex-1 flex-col space-y-0.5 overflow-y-auto px-3 py-3 md:flex">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => navigate(item.id, router)}
              aria-label={item.label}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-secondary text-foreground shadow-sm'
                  : 'text-muted-foreground/70 hover:bg-secondary/50 hover:text-foreground'
              )}>
              {isActive && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />}
              <span className="flex items-center gap-1.5">
                <item.icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground/70')} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.id === 'routes' && <ProgressRing value={badgeCount} total={TOTAL_ACHIEVEMENTS} size={20} strokeWidth={2} />}
              </span>
              <span className={cn('flex flex-col leading-tight', collapsed && 'md:hidden')}>
                <span className="text-[10px] md:text-[13px]">{item.label}</span>
                <span className="hidden text-[10px] font-normal text-muted-foreground/40 md:inline">{item.en}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile nav keeps the primary actions visible without forcing all modules into a scroll strip. */}
      <nav aria-label="主要导航" className="flex min-w-0 flex-1 items-stretch gap-0.5 overflow-hidden px-1 py-1.5 md:hidden">
        {MOBILE_PRIMARY_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMobileMoreOpen(false);
                navigate(item.id, router);
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-secondary text-foreground shadow-sm'
                  : 'text-muted-foreground/70 hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              {isActive && <span className="absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-t-full bg-primary" />}
              <span className="flex items-center gap-1.5">
                <item.icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground/70')} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.id === 'routes' && <ProgressRing value={badgeCount} total={TOTAL_ACHIEVEMENTS} size={20} strokeWidth={2} />}
              </span>
              <span className="truncate leading-tight">{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileMoreOpen((open) => !open)}
          aria-label="更多入口，包括历史记录"
          aria-expanded={mobileMoreOpen}
          aria-controls="mobile-more-navigation"
          aria-current={mobileMoreActive ? 'page' : undefined}
          className={cn(
            'group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-medium transition-all duration-150',
            mobileMoreActive || mobileMoreOpen
              ? 'bg-secondary text-foreground shadow-sm'
              : 'text-muted-foreground/70 hover:bg-secondary/50 hover:text-foreground'
          )}
        >
          <MoreHorizontal className="h-[18px] w-[18px] text-muted-foreground/60 group-hover:text-muted-foreground/80" strokeWidth={1.8} />
          <span className="truncate leading-tight">更多</span>
        </button>
      </nav>

      {mobileMoreOpen && (
        <div
          id="mobile-more-navigation"
          className="absolute bottom-[calc(100%+0.5rem)] right-2 z-50 w-72 max-w-[calc(100vw-1rem)] rounded-2xl border border-border/60 bg-card/95 p-2 shadow-xl backdrop-blur-sm md:hidden"
        >
          <div className="grid grid-cols-2 gap-1">
            {MOBILE_MORE_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMobileMoreOpen(false);
                    navigate(item.id, router);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors',
                    isActive
                      ? 'bg-secondary font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/60')} strokeWidth={1.8} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setMobileMoreOpen(false);
                onOpenHistory();
              }}
              className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <History className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={1.8} />
              <span className="truncate">历史记录</span>
            </button>
          </div>
        </div>
      )}

      {/* User */}
      <div className="hidden border-t border-border/20 px-3 py-3 md:block">
        <button onClick={onOpenHistory}
          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-muted-foreground/60 transition-all hover:bg-secondary/50 hover:text-foreground">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-3.5 w-3.5 text-primary/70" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[12px] font-medium text-foreground/80">探索者</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40"><History className="h-3 w-3" />记录</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

function navigate(tabId: string, router: ReturnType<typeof useRouter>) {
  router.push(`/main?tab=${tabId}`);
}
