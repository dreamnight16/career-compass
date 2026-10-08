'use client';

import { Suspense, useEffect, useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ContentRouter } from '@/components/layout/ContentRouter';
import { HistoryDrawer } from '@/components/history/HistoryDrawer';
import { WelcomeGuide } from '@/components/onboarding/WelcomeGuide';
import { getActivities, addActivity } from '@/lib/activity-store';
import { recordVisit, getStreak } from '@/lib/streak-store';
import { checkAndUnlock, collectContext } from '@/lib/achievement-store';

function MainContent() {
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    recordVisit();
    const activities = getActivities();
    if (activities.length === 0) {
      addActivity({ type: 'first_visit', title: '首次使用歧点', detail: '开启职业探索之旅' });
    }

    // Track night visits (22:00-04:59)
    const hour = new Date().getHours();
    const isNight = hour >= 22 || hour < 5;
    if (isNight) {
      try {
        const nightCount = parseInt(localStorage.getItem('career-compass-night-visits') || '0', 10) + 1;
        localStorage.setItem('career-compass-night-visits', String(nightCount));
      } catch { /* ignore */ }
    }

    // Collect night visits for achievement context
    const nightVisits = (() => {
      try { return parseInt(localStorage.getItem('career-compass-night-visits') || '0', 10); }
      catch { return 0; }
    })();

    // Check achievements on every page load
    const streak = getStreak();
    const ctx = collectContext(streak, {}, 0, [], false, 0, false, false, nightVisits);
    const newBadges = checkAndUnlock(ctx);
    if (newBadges.length > 0) {
      window.dispatchEvent(new CustomEvent('badges-unlocked', { detail: newBadges }));
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar onOpenHistory={() => setHistoryOpen(true)} />
      <ContentRouter />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <WelcomeGuide />
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <p className="cc-body text-muted-foreground">加载中…</p>
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
