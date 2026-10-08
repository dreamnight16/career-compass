'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, TrendingUp, FileText, Map as MapIcon, Target, Flame } from 'lucide-react';
import { getRoutes } from '@/lib/route-store';
import { getDecisions } from '@/lib/decision-store';
import { getActivities } from '@/lib/activity-store';
import { getStreak } from '@/lib/streak-store';
import { getAchievements, ACHIEVEMENTS } from '@/lib/achievement-store';
import type { UnlockedAchievement } from '@/lib/achievement-store';
import { cn } from '@/lib/utils';

interface StatsPanelProps {}

export function StatsPanel(_props: StatsPanelProps) {
  const [stats, setStats] = useState({ decisions: 0, activeRoutes: 0, completionPct: 0, streak: 0, chats: 0 });
  const [recentBadges, setRecentBadges] = useState<UnlockedAchievement[]>([]);

  const refresh = () => {
    const routes = getRoutes();
    const decisions = getDecisions();
    const activities = getActivities();
    const totalNodes = routes.flatMap(r => r.nodes).length;
    const doneNodes = routes.flatMap(r => r.nodes).filter(n => n.status === 'done').length;

    setStats({
      decisions: decisions.length,
      activeRoutes: routes.filter(r => r.status === 'active').length,
      completionPct: totalNodes > 0 ? Math.round((doneNodes / totalNodes) * 100) : 0,
      streak: getStreak(),
      chats: activities.filter(a => a.type === 'chat').length,
    });

    const allUnlocked = getAchievements();
    setRecentBadges(allUnlocked.slice(-3).reverse());
  };

  useEffect(() => {
    refresh();
    window.addEventListener('routes-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('routes-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const metricCards = [
    { label: '总决策数', value: stats.decisions, icon: FileText, trend: null },
    { label: '活跃路线', value: stats.activeRoutes, icon: MapIcon, trend: null },
    { label: '完成率', value: `${stats.completionPct}%`, icon: Target, trend: null },
    { label: '连续天数', value: stats.streak, icon: Flame, trend: `天` },
  ];

  // Mini trend data (last 7 days of chats)
  const weekDays = useMemo(() => {
    const activities = getActivities();
    const dayMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    activities.forEach(a => {
      const day = a.timestamp.slice(0, 10);
      if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    return [...dayMap.entries()].map(([date, count]) => ({ date: date.slice(5), count }));
  }, []);

  const maxCount = Math.max(...weekDays.map(d => d.count), 1);
  const trendPoints = weekDays.map((d, i) => `${i * (200 / (weekDays.length - 1))},${60 - (d.count / maxCount) * 50}`).join(' ');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="cc-h2 text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-dn-teal" aria-hidden="true" />
          我的数据
        </h2>
        <button
          onClick={exportData}
          className="inline-flex min-h-11 items-center gap-1.5 border border-input px-3 text-xs text-muted-foreground hover:bg-dn-divider hover:text-foreground transition-colors"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          导出数据
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((card, i) => (
          <button
            key={card.label}
            className="group flex flex-col items-start border border-border bg-card p-4 text-left"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <card.icon className="h-4 w-4 text-muted-foreground mb-2" aria-hidden="true" />
            <span className="cc-num text-3xl text-foreground count-flip">{card.value}</span>
            <span className="cc-kicker text-muted-foreground mt-2">{card.label}{card.trend ? ` · ${card.trend}` : ''}</span>
          </button>
        ))}
      </div>

      {/* Mini trend chart */}
      <div className="border border-border bg-card p-4">
        <h3 className="cc-kicker text-foreground mb-3">本周活跃（互动次数）</h3>
        <svg viewBox="0 0 200 60" className="w-full h-16" role="img" aria-label="最近 7 天每日互动次数的折线图">
          <polyline
            points={trendPoints}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ stroke: 'var(--dn-teal, #59AAA5)' }}
          />
          {weekDays.map((d, i) => {
            const x = i * (200 / (weekDays.length - 1));
            const y = 60 - (d.count / maxCount) * 50;
            return (
              <g key={d.date}>
                <circle cx={x} cy={y} r="3" style={{ fill: 'var(--dn-teal, #59AAA5)' }} />
                <title>{d.date}: {d.count} 次</title>
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          {weekDays.map(d => <span key={d.date}>{d.date}</span>)}
        </div>
      </div>

      {/* Recent badges */}
      {recentBadges.length > 0 && (
        <div className="border border-border bg-card p-4">
          <h3 className="cc-kicker text-foreground mb-3">最近解锁</h3>
          <div className="flex flex-wrap gap-2">
            {recentBadges.map(ba => {
              const def = ACHIEVEMENTS.find(a => a.id === ba.id);
              if (!def) return null;
              return (
                <span key={ba.id} className="inline-flex items-center gap-1 border border-dn-emerald cc-tint-emerald px-3 py-1 text-xs text-foreground">
                  <span aria-hidden="true">{def.icon}</span> {def.title}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat stats */}
      <div className="border border-border bg-card p-4">
        <h3 className="cc-kicker text-foreground mb-3">对话统计</h3>
        <div className="flex items-center gap-6">
          <div><span className="cc-num text-3xl text-foreground">{stats.chats}</span><span className="text-xs text-muted-foreground ml-2">累计对话</span></div>
          <div><span className="cc-num text-3xl text-foreground">{getActivities().filter(a => a.type === 'competency').length}</span><span className="text-xs text-muted-foreground ml-2">能力评估</span></div>
        </div>
      </div>
    </div>
  );
}

function exportData() {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('career-compass-')) {
      try { data[key] = JSON.parse(localStorage.getItem(key) || 'null'); }
      catch { data[key] = localStorage.getItem(key); }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `career-compass-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
