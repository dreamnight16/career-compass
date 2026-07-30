'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sparkles, UserCircle, Database, Library, ChevronLeft, ChevronRight, History, User, Map, BarChart3, GitBranch, Compass, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from '@/components/ui/progress-ring';
import { getAchievementCount, TOTAL_ACHIEVEMENTS } from '@/lib/achievement-store';

const NAV_ITEMS = [
  { id: 'coach',     icon: Sparkles,    label: 'AI规划师', en: 'Coach' },
  { id: 'profile',   icon: UserCircle,  label: '个人画像', en: 'Profile' },
  { id: 'routes',    icon: Map,         label: '成就图鉴', en: 'Routes' },
  { id: 'journal',   icon: BookOpen,    label: '决策日志', en: 'Journal' },
  { id: 'explore',   icon: BarChart3,   label: '数据对比', en: 'Compare' },
  { id: 'sim',       icon: GitBranch,   label: '路径模拟', en: 'Simulate' },
  { id: 'careers',   icon: Compass,     label: '职业探索', en: 'Careers' },
  { id: 'knowledge', icon: Database,    label: '数据库',   en: 'Knowledge' },
  { id: 'resources', icon: Library,     label: '资源库',   en: 'Resources' },
] as const;

const SIDEBAR_WIDTH = 232;
const SIDEBAR_COLLAPSED = 64;

export function AppSidebar({ onOpenHistory }: { onOpenHistory: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const activeTab = params.get('tab') || 'coach';
  const [collapsed, setCollapsed] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

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

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('career-compass-sidebar-collapsed', String(next)); }
    catch { /* ignore */ }
  };

  return (
    <aside
      className="flex h-screen flex-col border-r border-border/30 bg-background/80 backdrop-blur-sm transition-[width] duration-200 ease-out"
      style={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <button onClick={toggleCollapse}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50 transition-all hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? '展开' : '收起'}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {!collapsed && <span className="text-base font-bold tracking-tight text-foreground">歧点</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
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
              {!collapsed && (
                <span className="flex flex-col leading-tight">
                  <span className="text-[13px]">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground/40 font-normal">{item.en}</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border/20 px-3 py-3">
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
