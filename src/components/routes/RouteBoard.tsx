'use client';

import { useState, useEffect } from 'react';
import { Trophy, Map, Calendar, BarChart3, Share2 } from 'lucide-react';
import type { AchievementDef, AppContext } from '@/lib/achievement-store';
import { collectContext, checkAndUnlock } from '@/lib/achievement-store';
import { recordVisit, getStreak } from '@/lib/streak-store';
import { getActivities } from '@/lib/activity-store';
import { AchievementWall } from './AchievementWall';
import { ShareCard } from './ShareCard';
import { RouteDashboard } from './RouteDashboard';
import { StreakCalendar } from './StreakCalendar';
import { StatsPanel } from './StatsPanel';
import { BadgeUnlockOverlay } from '@/components/ui/badge-unlock';
import { cn } from '@/lib/utils';

type SubView = 'badges' | 'routes' | 'calendar' | 'stats' | 'share';

interface SubTab {
  key: SubView;
  icon: typeof Trophy;
  label: string;
}

const SUB_TABS: SubTab[] = [
  { key: 'badges', icon: Trophy, label: '徽章墙' },
  { key: 'routes', icon: Map, label: '路线看板' },
  { key: 'calendar', icon: Calendar, label: '打卡日历' },
  { key: 'stats', icon: BarChart3, label: '统计数据' },
  { key: 'share', icon: Share2, label: '分享卡片' },
];

export function RouteBoard() {
  const [activeView, setActiveView] = useState<SubView>('badges');
  const [appContext, setAppContext] = useState<AppContext | null>(null);

  // Build app context on mount
  useEffect(() => {
    recordVisit();
    const streak = getStreak();

    // Collect night visits count
    let nightVisits = 0;
    try {
      const raw = localStorage.getItem('career-compass-streak');
      if (raw) {
        const dates: string[] = JSON.parse(raw);
        nightVisits = dates.length;
      }
    } catch { /* ignore */ }

    // Count resource views from activity log
    const activities = getActivities();
    const resourceViews = activities.filter(a => a.type === 'resource_save').length;

    const ctx = collectContext(
      streak,
      getProfile(),
      resourceViews,
      getCompareViews(),
      isPersonalityDone(),
      getCompetencyCount(),
      isExplorerUsed(),
      isSimDone(),
      nightVisits,
    );
    setAppContext(ctx);

    // Check and unlock achievements
    const newBadges = checkAndUnlock(ctx);
    if (newBadges.length > 0) {
      window.dispatchEvent(new CustomEvent('badges-unlocked', { detail: newBadges }));
    }
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const refresh = () => {
      const streak = getStreak();
      let nightVisits = 0;
      try { nightVisits = parseInt(localStorage.getItem('career-compass-night-visits') || '0', 10); } catch { /* ignore */ }
      const ctx = collectContext(
        streak, getProfile(), getActivities().filter(a => a.type === 'resource_save').length,
        getCompareViews(), isPersonalityDone(), getCompetencyCount(),
        isExplorerUsed(), isSimDone(), nightVisits,
      );
      setAppContext(ctx);

      const newBadges = checkAndUnlock(ctx);
      if (newBadges.length > 0) {
        window.dispatchEvent(new CustomEvent('badges-unlocked', { detail: newBadges }));
      }
    };
    window.addEventListener('routes-updated', refresh);
    window.addEventListener('profile-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('routes-updated', refresh);
      window.removeEventListener('profile-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab navigation */}
      <nav className="flex shrink-0 gap-1 border-b border-border/30 px-4 py-2 overflow-x-auto">
        {SUB_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
              activeView === tab.key
                ? 'bg-secondary text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Sub-view content */}
      <div className="flex-1 overflow-auto">
        {activeView === 'badges' && appContext && (
          <AchievementWall context={appContext} />
        )}
        {activeView === 'routes' && (
          <RouteDashboard />
        )}
        {activeView === 'calendar' && (
          <StreakCalendar />
        )}
        {activeView === 'stats' && (
          <StatsPanel />
        )}
        {activeView === 'share' && (
          <ShareCard />
        )}
      </div>

      <BadgeUnlockHost />
    </div>
  );
}

/** Temporary placeholder for pending views */
function PlaceholderView({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

// Helper functions to query localStorage state
function getProfile(): Record<string, unknown> {
  try { return JSON.parse(localStorage.getItem('career-compass-profile') || '{}'); }
  catch { return {}; }
}

function getCompareViews(): string[] {
  try { return JSON.parse(localStorage.getItem('career-compass-compare-views') || '[]'); }
  catch { return []; }
}

function isPersonalityDone(): boolean {
  try { return localStorage.getItem('career-compass-bigfive') !== null || localStorage.getItem('career-compass-personality-result') !== null; }
  catch { return false; }
}

function getCompetencyCount(): number {
  try { return JSON.parse(localStorage.getItem('career-compass-competency-count') || '0'); }
  catch { return 0; }
}

function isExplorerUsed(): boolean {
  try { return localStorage.getItem('career-compass-explorer-used') === 'true'; }
  catch { return false; }
}

function isSimDone(): boolean {
  try { return localStorage.getItem('career-compass-sim-done') === 'true'; }
  catch { return false; }
}

/** 监听成就解锁事件，弹出庆祝弹窗（队列逐个展示） */
function BadgeUnlockHost() {
  const [queue, setQueue] = useState<AchievementDef[]>([]);
  useEffect(() => {
    const onUnlock = (e: Event) => {
      const detail = (e as CustomEvent<AchievementDef[]>).detail;
      if (Array.isArray(detail) && detail.length > 0) {
        setQueue(prev => [...prev, ...detail]);
      }
    };
    window.addEventListener('badges-unlocked', onUnlock);
    return () => window.removeEventListener('badges-unlocked', onUnlock);
  }, []);
  const current = queue[0];
  if (!current) return null;
  return <BadgeUnlockOverlay key={current.id} badge={current} onClose={() => setQueue(prev => prev.slice(1))} />;
}
