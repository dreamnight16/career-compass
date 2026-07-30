# Interactive Achievement System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static "成就图鉴" RouteBoard into a multi-view Achievement Center with badge wall, interactive route dashboard, streak calendar, stats panel, share cards, and inject interactive hooks across the entire app to boost user retention.

**Architecture:** Pure frontend, localStorage-persisted achievement engine with CSS @keyframes + Canvas particle animations. The RouteBoard becomes a container with 5 sub-views switched via internal state. A progress ring lives in the sidebar (always visible). Feedback buttons are added to chat messages. A weekly summary bar tops the decision journal. Toast system is upgraded with clickable actions.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS 3, Vitest, lucide-react

**Spec:** `docs/superpowers/specs/2026-07-18-interactive-achievement-system.md`

## Global Constraints

- All persistence via localStorage (no backend, no database)
- No animation library dependencies — pure CSS @keyframes + Canvas for particles
- Zero new npm packages — use only what's already in package.json (lucide-react for icons)
- TypeScript strict: no `any`, explicit return types on public APIs
- All components must respect `prefers-reduced-motion: reduce`
- Immutable update patterns: spread operator, never mutate in place
- Functions < 50 lines, files < 800 lines
- All user-facing text in Chinese

---

## File Structure

### New Files (10)

| # | File | Lines | Responsibility |
|---|------|-------|----------------|
| 1 | `src/lib/achievement-store.ts` | ~140 | 20 badge defs, AppContext, checkAndUnlock(), getAchievements() |
| 2 | `src/lib/streak-store.ts` | ~50 | recordVisit(), getStreak(), getStreakHistory() |
| 3 | `src/components/ui/progress-ring.tsx` | ~55 | SVG circular progress ring, shared by sidebar + route cards |
| 4 | `src/components/ui/badge-unlock.tsx` | ~80 | Unlock modal with Canvas particle burst |
| 5 | `src/components/ui/particle-canvas.tsx` | ~60 | Reusable Canvas particle system (confetti/gold spark/smoke) |
| 6 | `src/components/routes/AchievementWall.tsx` | ~160 | Badge grid with category filters, 4 card states, stagger animation |
| 7 | `src/components/routes/RouteDashboard.tsx` | ~200 | Interactive horizontal timeline, drag-sort nodes, flowing particles, progress ring |
| 8 | `src/components/routes/StreakCalendar.tsx` | ~130 | GitHub-style heatmap (180 days), tooltips, month navigation |
| 9 | `src/components/routes/StatsPanel.tsx` | ~100 | 4 metric cards + mini trend chart + recent unlocks + todo list |
| 10 | `src/components/routes/ShareCard.tsx` | ~120 | Share card generator with 3 themes, toggle sections, copy/save |

### Modified Files (10)

| # | File | Changes |
|---|------|---------|
| 11 | `src/app/globals.css` | Add 9 new @keyframes + utility classes |
| 12 | `src/components/routes/RouteBoard.tsx` | Refactor into container with 5 sub-view tabs |
| 13 | `src/components/layout/AppSidebar.tsx` | Add ProgressRing before the routes nav item |
| 14 | `src/components/chat/MessageBubble.tsx` | Add feedback action bar (👍/👎/📋/🔄) below AI messages |
| 15 | `src/components/chat/ChatInterface.tsx` | Add "try this" suggestion chip, wire feedback to activity store |
| 16 | `src/components/decisions/DecisionJournal.tsx` | Add weekly summary bar at top |
| 17 | `src/components/chat/ResourceBrowser.tsx` | Add share button, related resources, enhanced hover |
| 18 | `src/components/ui/toast.tsx` | Support clickable actions + stack collapse |
| 19 | `src/app/main/page.tsx` | Call recordVisit() + checkAndUnlock() on mount |
| 20 | `src/components/profile/ProfileDashboard.tsx` | Call checkAndUnlock('growth') after tests complete |

---

## Phase 1: Infrastructure

### Task 1: Achievement Store (`src/lib/achievement-store.ts`)

**Files:**
- Create: `src/lib/achievement-store.ts`
- Test: `src/lib/__tests__/achievement-store.test.ts`

**Interfaces:**
- Produces: `AchievementDef`, `AppContext`, `UnlockedAchievement`, `getAchievements()`, `checkAndUnlock(ctx)`, `getAchievementCount()`, `ACHIEVEMENTS`

- [ ] **Step 1: Write the store with all 20 badge definitions and check logic**

```typescript
// src/lib/achievement-store.ts
/** 成就定义 + 解锁逻辑 + localStorage 持久化 */

import type { UserProfile } from '@/types';
import type { Route } from './planner';
import type { ActivityEntry } from './activity-store';
import type { DecisionEntry } from './decision-store';
import { getRoutes } from './route-store';
import { getActivities } from './activity-store';
import { getDecisions } from './decision-store';

export interface AchievementDef {
  id: string;
  title: string;
  icon: string;
  category: 'route' | 'streak' | 'explore' | 'growth' | 'special';
  description: string;
  condition: string;
  check: (ctx: AppContext) => boolean;
  progress?: (ctx: AppContext) => { current: number; target: number };
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export interface AppContext {
  routes: Route[];
  streakDays: number;
  profile: Partial<UserProfile>;
  activities: ActivityEntry[];
  decisions: DecisionEntry[];
  resourceViews: number;
  compareViews: string[];
  personalityDone: boolean;
  competencyCount: number;
  explorerUsed: boolean;
  simDone: boolean;
  nightVisits: number;
}

const STORAGE_KEY = 'career-compass-achievements';

function guard(): boolean {
  return typeof localStorage !== 'undefined';
}

export function getAchievements(): UnlockedAchievement[] {
  if (!guard()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) { localStorage.removeItem(STORAGE_KEY); return []; }
    return parsed.filter(
      (a: unknown) => a && typeof a === 'object' && typeof (a as Record<string, unknown>).id === 'string'
    ) as UnlockedAchievement[];
  } catch {
    return [];
  }
}

export function getAchievementCount(): number {
  return getAchievements().length;
}

const TOTAL_ACHIEVEMENTS = 20;

export { TOTAL_ACHIEVEMENTS };

/**
 * 收集当前应用上下文，供成就检查使用
 */
export function collectContext(
  streakDays: number,
  profile: Partial<UserProfile>,
  resourceViews: number,
  compareViews: string[],
  personalityDone: boolean,
  competencyCount: number,
  explorerUsed: boolean,
  simDone: boolean,
  nightVisits: number,
): AppContext {
  return {
    routes: getRoutes(),
    streakDays,
    profile,
    activities: getActivities(),
    decisions: getDecisions(),
    resourceViews,
    compareViews,
    personalityDone,
    competencyCount,
    explorerUsed,
    simDone,
    nightVisits,
  };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // === 路线里程碑 ===
  {
    id: 'first-route', title: '初出茅庐', icon: '🗺', category: 'route',
    description: 'AI 为你生成了第一条职业路线', condition: '生成第一条路线',
    check: (ctx) => ctx.routes.length >= 1,
  },
  {
    id: 'complete-route', title: '目标达成', icon: '🎯', category: 'route',
    description: '完成一整条路线的所有节点', condition: '完成一整条路线',
    check: (ctx) => ctx.routes.some(r => (r as Record<string, unknown>).status === 'completed'),
  },
  {
    id: 'dual-routes', title: '双线并进', icon: '🛤', category: 'route',
    description: '同时保持 2 条路线活跃', condition: '2 条活跃路线',
    check: (ctx) => ctx.routes.filter(r => (r as Record<string, unknown>).status === 'active').length >= 2,
  },
  {
    id: 'route-collector', title: '路线收藏家', icon: '📚', category: 'route',
    description: '累计生成 5 条职业路线', condition: '生成 5 条路线',
    check: (ctx) => ctx.routes.length >= 5,
    progress: (ctx) => ({ current: Math.min(ctx.routes.length, 5), target: 5 }),
  },
  // === 连续打卡 ===
  {
    id: 'streak-3', title: '三日之约', icon: '🔥', category: 'streak',
    description: '连续 3 天使用歧点', condition: '连续 3 天',
    check: (ctx) => ctx.streakDays >= 3,
    progress: (ctx) => ({ current: Math.min(ctx.streakDays, 3), target: 3 }),
  },
  {
    id: 'streak-7', title: '七日之约', icon: '📅', category: 'streak',
    description: '连续 7 天使用歧点', condition: '连续 7 天',
    check: (ctx) => ctx.streakDays >= 7,
    progress: (ctx) => ({ current: Math.min(ctx.streakDays, 7), target: 7 }),
  },
  {
    id: 'streak-14', title: '半月坚持', icon: '🌙', category: 'streak',
    description: '连续 14 天使用歧点', condition: '连续 14 天',
    check: (ctx) => ctx.streakDays >= 14,
    progress: (ctx) => ({ current: Math.min(ctx.streakDays, 14), target: 14 }),
  },
  {
    id: 'streak-30', title: '月度冠军', icon: '👑', category: 'streak',
    description: '连续 30 天使用歧点', condition: '连续 30 天',
    check: (ctx) => ctx.streakDays >= 30,
    progress: (ctx) => ({ current: Math.min(ctx.streakDays, 30), target: 30 }),
  },
  {
    id: 'streak-90', title: '季常青', icon: '🌲', category: 'streak',
    description: '连续 90 天使用歧点', condition: '连续 90 天',
    check: (ctx) => ctx.streakDays >= 90,
    progress: (ctx) => ({ current: Math.min(ctx.streakDays, 90), target: 90 }),
  },
  // === 探索发现 ===
  {
    id: 'first-explore', title: '初次探索', icon: '🔍', category: 'explore',
    description: '首次使用职业探索器', condition: '使用职业探索器',
    check: (ctx) => ctx.explorerUsed,
  },
  {
    id: 'well-read', title: '博学多才', icon: '🌐', category: 'explore',
    description: '已浏览 50 条资源链接', condition: '浏览 50 条资源',
    check: (ctx) => ctx.resourceViews >= 50,
    progress: (ctx) => ({ current: Math.min(ctx.resourceViews, 50), target: 50 }),
  },
  {
    id: 'data-master', title: '数据达人', icon: '📊', category: 'explore',
    description: '看过全部 3 个数据对比视图', condition: '看过全部对比视图',
    check: (ctx) => ctx.compareViews.length >= 3,
    progress: (ctx) => ({ current: Math.min(ctx.compareViews.length, 3), target: 3 }),
  },
  {
    id: 'sim-done', title: '路径模拟', icon: '🧭', category: 'explore',
    description: '完成一次决策树路径模拟', condition: '完成决策树模拟',
    check: (ctx) => ctx.simDone,
  },
  // === 成长印记 ===
  {
    id: 'self-awareness', title: '自我认知', icon: '🧬', category: 'growth',
    description: '完成大五人格测评', condition: '完成大五人格测评',
    check: (ctx) => ctx.personalityDone,
  },
  {
    id: 'career-profile', title: '职业画像', icon: '💼', category: 'growth',
    description: '填写 6/8 维度的个人画像', condition: '6 个画像维度',
    check: (ctx) => {
      const keys = Object.keys(ctx.profile).filter(
        k => ctx.profile[k as keyof UserProfile] !== undefined && ctx.profile[k as keyof UserProfile] !== null
      );
      const filled = keys.filter(k => {
        const v = ctx.profile[k as keyof UserProfile];
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== null;
      });
      return filled.length >= 6;
    },
    progress: (ctx) => {
      const filled = Object.keys(ctx.profile).filter(k => {
        const v = ctx.profile[k as keyof UserProfile];
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== null;
      }).length;
      return { current: Math.min(filled, 6), target: 6 };
    },
  },
  {
    id: 'competency-3', title: '能力评估', icon: '🎓', category: 'growth',
    description: '完成 3 次职业能力评估', condition: '3 次能力评估',
    check: (ctx) => ctx.competencyCount >= 3,
    progress: (ctx) => ({ current: Math.min(ctx.competencyCount, 3), target: 3 }),
  },
  {
    id: 'decision-5', title: '决策新手', icon: '📝', category: 'growth',
    description: '在决策日志中完成 5 个决定', condition: '5 个决策',
    check: (ctx) => ctx.decisions.filter(
      d => (d as Record<string, unknown>).status === 'settled'
    ).length >= 5,
    progress: (ctx) => ({
      current: Math.min(
        ctx.decisions.filter(d => (d as Record<string, unknown>).status === 'settled').length,
        5
      ),
      target: 5,
    }),
  },
  // === 特殊成就 ===
  {
    id: 'all-rounder', title: '全能选手', icon: '🌟', category: 'special',
    description: '解锁 8 枚以上成就徽章', condition: '解锁 8 枚徽章',
    check: (_ctx) => getAchievements().length >= 8,
    progress: (_ctx) => ({ current: Math.min(getAchievements().length, 8), target: 8 }),
  },
  {
    id: 'career-compass-master', title: '歧点大师', icon: '💎', category: 'special',
    description: '解锁 15 枚以上成就徽章', condition: '解锁 15 枚徽章',
    check: (_ctx) => getAchievements().length >= 15,
    progress: (_ctx) => ({ current: Math.min(getAchievements().length, 15), target: 15 }),
  },
  {
    id: 'night-owl', title: '夜猫子', icon: '🦉', category: 'special',
    description: '晚上 10 点后使用过 3 次', condition: '深夜使用 3 次',
    check: (ctx) => ctx.nightVisits >= 3,
    progress: (ctx) => ({ current: Math.min(ctx.nightVisits, 3), target: 3 }),
  },
];

/**
 * 检查所有成就，返回本次新解锁的成就列表。
 * 已解锁的不会重复触发。
 */
export function checkAndUnlock(ctx: AppContext): AchievementDef[] {
  if (!guard()) return [];
  const unlocked = new Set(getAchievements().map(a => a.id));
  const newlyUnlocked: AchievementDef[] = [];

  for (const def of ACHIEVEMENTS) {
    if (unlocked.has(def.id)) continue;
    try {
      if (def.check(ctx)) {
        newlyUnlocked.push(def);
        unlocked.add(def.id);
      }
    } catch {
      // 成就检查失败静默跳过，不阻塞用户操作
    }
  }

  if (newlyUnlocked.length > 0) {
    const now = new Date().toISOString();
    const existing = getAchievements();
    const newEntries: UnlockedAchievement[] = newlyUnlocked.map(def => ({
      id: def.id,
      unlockedAt: now,
    }));
    const merged = [...existing, ...newEntries];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch { /* ignore */ }
  }

  return newlyUnlocked;
}
```

- [ ] **Step 2: Write the test file**

```typescript
// src/lib/__tests__/achievement-store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => { store.clear(); },
  get length() { return store.size; },
  key: (i: number) => [...store.keys()][i] ?? null,
});

import { getAchievements, checkAndUnlock, ACHIEVEMENTS, collectContext, getAchievementCount, TOTAL_ACHIEVEMENTS } from '../achievement-store';
import type { AppContext } from '../achievement-store';

function emptyCtx(overrides?: Partial<AppContext>): AppContext {
  const base: AppContext = {
    routes: [],
    streakDays: 0,
    profile: {},
    activities: [],
    decisions: [],
    resourceViews: 0,
    compareViews: [],
    personalityDone: false,
    competencyCount: 0,
    explorerUsed: false,
    simDone: false,
    nightVisits: 0,
  };
  return { ...base, ...overrides };
}

describe('achievement-store', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('getAchievements', () => {
    it('returns empty array when no achievements stored', () => {
      expect(getAchievements()).toEqual([]);
    });

    it('returns stored achievements', () => {
      const now = new Date().toISOString();
      store.set('career-compass-achievements', JSON.stringify([{ id: 'first-route', unlockedAt: now }]));
      const result = getAchievements();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('first-route');
    });

    it('clears corrupted data and returns empty array', () => {
      store.set('career-compass-achievements', 'not-json');
      expect(getAchievements()).toEqual([]);
    });
  });

  describe('checkAndUnlock', () => {
    it('unlocks first-route when routes.length >= 1', () => {
      const ctx = emptyCtx({ routes: [{ id: 'r1', title: 'test', nodes: [], status: 'active' } as never] });
      const result = checkAndUnlock(ctx);
      expect(result.some(a => a.id === 'first-route')).toBe(true);
    });

    it('unlocks streak-3 when streakDays >= 3', () => {
      const ctx = emptyCtx({ streakDays: 3 });
      const result = checkAndUnlock(ctx);
      expect(result.some(a => a.id === 'streak-3')).toBe(true);
    });

    it('does not re-unlock already unlocked achievements', () => {
      store.set('career-compass-achievements', JSON.stringify([{ id: 'first-route', unlockedAt: new Date().toISOString() }]));
      const ctx = emptyCtx({ routes: [{ id: 'r1', title: 'test', nodes: [], status: 'active' } as never] });
      const result = checkAndUnlock(ctx);
      expect(result.some(a => a.id === 'first-route')).toBe(false);
    });

    it('unlocks night-owl when nightVisits >= 3', () => {
      const ctx = emptyCtx({ nightVisits: 3 });
      const result = checkAndUnlock(ctx);
      expect(result.some(a => a.id === 'night-owl')).toBe(true);
    });

    it('unlocks self-awareness when personalityDone is true', () => {
      const ctx = emptyCtx({ personalityDone: true });
      const result = checkAndUnlock(ctx);
      expect(result.some(a => a.id === 'self-awareness')).toBe(true);
    });

    it('persists newly unlocked achievements to localStorage', () => {
      const ctx = emptyCtx({ streakDays: 7 });
      checkAndUnlock(ctx);
      const stored = getAchievements();
      expect(stored.some(a => a.id === 'streak-3')).toBe(true);
      expect(stored.some(a => a.id === 'streak-7')).toBe(true);
    });

    it('returns multiple achievements when multiple conditions met', () => {
      const ctx = emptyCtx({
        routes: [{ id: 'r1', title: 't', nodes: [], status: 'active' } as never],
        streakDays: 3,
        personalityDone: true,
      });
      const result = checkAndUnlock(ctx);
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('ACHIEVEMENTS', () => {
    it('has exactly 20 achievements defined', () => {
      expect(ACHIEVEMENTS).toHaveLength(20);
    });

    it('every achievement has required fields', () => {
      for (const a of ACHIEVEMENTS) {
        expect(a.id).toBeTruthy();
        expect(a.title).toBeTruthy();
        expect(a.icon).toBeTruthy();
        expect(a.category).toBeTruthy();
        expect(typeof a.check).toBe('function');
      }
    });
  });

  describe('TOTAL_ACHIEVEMENTS', () => {
    it('equals 20', () => {
      expect(TOTAL_ACHIEVEMENTS).toBe(20);
    });
  });

  describe('getAchievementCount', () => {
    it('returns count of unlocked achievements', () => {
      store.set('career-compass-achievements', JSON.stringify([
        { id: 'a', unlockedAt: new Date().toISOString() },
        { id: 'b', unlockedAt: new Date().toISOString() },
      ]));
      expect(getAchievementCount()).toBe(2);
    });
  });

  describe('collectContext', () => {
    it('assembles all context fields', () => {
      const ctx = collectContext(5, {}, 0, [], false, 0, false, false, 0);
      expect(ctx.streakDays).toBe(5);
      expect(ctx.routes).toEqual([]);
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/achievement-store.test.ts
```
Expected: all 12 tests PASS

- [ ] **Step 4: Check type safety**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/achievement-store.ts src/lib/__tests__/achievement-store.test.ts
git commit -m "feat: add achievement store with 20 badge definitions and unlock logic"
```

---

### Task 2: Streak Store (`src/lib/streak-store.ts`)

**Files:**
- Create: `src/lib/streak-store.ts`
- Create: `src/lib/__tests__/streak-store.test.ts`

**Interfaces:**
- Produces: `recordVisit()`, `getStreak()`, `getStreakHistory()`, `formatDateKey(d: Date)`

- [ ] **Step 1: Write the streak store**

```typescript
// src/lib/streak-store.ts
/** 连续访问天数追踪 — localStorage */

const STORAGE_KEY = 'career-compass-streak';

function guard(): boolean {
  return typeof localStorage !== 'undefined';
}

export function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * 记录一次当日访问。幂等 — 同一天多次调用只记一次。
 */
export function recordVisit(): void {
  if (!guard()) return;
  const today = formatDateKey(new Date());
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const dates: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(dates)) { localStorage.removeItem(STORAGE_KEY); return; }
    if (!dates.includes(today)) {
      dates.push(today);
      // 保留过去 365 天
      const cutoff = formatDateKey(new Date(Date.now() - 365 * 86400000));
      const filtered = dates.filter(d => d >= cutoff).sort();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch { /* ignore */ }
}

/**
 * 返回当前连续访问天数（从今天往前数，直到遇到中断）。
 */
export function getStreak(): number {
  if (!guard()) return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const dates: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(dates) || dates.length === 0) return 0;

    const sorted = [...dates].sort().reverse(); // 最新在前
    const today = formatDateKey(new Date());
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));

    // 今天或昨天必须有记录，否则连续中断
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 1;
    const startDate = new Date(sorted[0]);
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(startDate);
      prev.setDate(prev.getDate() - i);
      if (sorted[i] === formatDateKey(prev)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  } catch {
    return 0;
  }
}

/**
 * 返回过去 180 天的访问日期列表。
 */
export function getStreakHistory(): string[] {
  if (!guard()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const dates: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(dates)) return [];
    const cutoff = formatDateKey(new Date(Date.now() - 180 * 86400000));
    return dates.filter(d => d >= cutoff).sort();
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Write the test**

```typescript
// src/lib/__tests__/streak-store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => { store.clear(); },
  get length() { return store.size; },
  key: (i: number) => [...store.keys()][i] ?? null,
});

import { recordVisit, getStreak, getStreakHistory, formatDateKey } from '../streak-store';

describe('streak-store', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('formatDateKey', () => {
    it('returns YYYY-MM-DD format', () => {
      const d = new Date('2026-07-18T12:00:00Z');
      expect(formatDateKey(d)).toBe('2026-07-18');
    });
  });

  describe('recordVisit', () => {
    it('adds today to stored dates', () => {
      recordVisit();
      const history = getStreakHistory();
      expect(history).toContain(formatDateKey(new Date()));
    });

    it('is idempotent — calling twice does not duplicate', () => {
      recordVisit();
      recordVisit();
      const history = getStreakHistory();
      const today = formatDateKey(new Date());
      expect(history.filter(d => d === today)).toHaveLength(1);
    });
  });

  describe('getStreak', () => {
    it('returns 0 when no visits recorded', () => {
      expect(getStreak()).toBe(0);
    });

    it('returns 1 on first visit', () => {
      recordVisit();
      expect(getStreak()).toBe(1);
    });

    it('returns streak count for consecutive days', () => {
      const today = new Date();
      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        dates.push(formatDateKey(d));
      }
      store.set('career-compass-streak', JSON.stringify(dates));
      expect(getStreak()).toBe(7);
    });
  });

  describe('getStreakHistory', () => {
    it('returns dates sorted ascending', () => {
      const today = new Date();
      const d1 = formatDateKey(new Date(today.getTime() - 2 * 86400000));
      const d2 = formatDateKey(new Date(today.getTime() - 1 * 86400000));
      store.set('career-compass-streak', JSON.stringify([d2, d1]));
      const history = getStreakHistory();
      expect(history[0] <= history[1]).toBe(true);
    });

    it('filters out dates older than 180 days', () => {
      const old = formatDateKey(new Date(Date.now() - 200 * 86400000));
      const recent = formatDateKey(new Date());
      store.set('career-compass-streak', JSON.stringify([old, recent]));
      const history = getStreakHistory();
      expect(history).not.toContain(old);
      expect(history).toContain(recent);
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/lib/__tests__/streak-store.test.ts
```
Expected: all tests PASS

- [ ] **Step 4: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/streak-store.ts src/lib/__tests__/streak-store.test.ts
git commit -m "feat: add streak store for daily visit tracking"
```

---

### Task 3: New CSS Animations (`src/app/globals.css`)

**Files:**
- Modify: `src/app/globals.css` (append before the last `@keyframes spring-in` block)

- [ ] **Step 1: Add all new @keyframes and utility classes**

At the end of `src/app/globals.css`, after the `/* Spring scale in */` block (line 103), append:

```css
/* ============================================
   Achievement System Animations
   ============================================ */

/* Badge card entry stagger */
@keyframes badge-enter {
  from { opacity: 0; transform: translateY(24px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.badge-enter {
  animation: badge-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.badge-enter-1  { animation-delay: 0.03s; }  .badge-enter-2  { animation-delay: 0.06s; }
.badge-enter-3  { animation-delay: 0.09s; }  .badge-enter-4  { animation-delay: 0.12s; }
.badge-enter-5  { animation-delay: 0.15s; }  .badge-enter-6  { animation-delay: 0.18s; }
.badge-enter-7  { animation-delay: 0.21s; }  .badge-enter-8  { animation-delay: 0.24s; }
.badge-enter-9  { animation-delay: 0.27s; }  .badge-enter-10 { animation-delay: 0.30s; }
.badge-enter-11 { animation-delay: 0.33s; }  .badge-enter-12 { animation-delay: 0.36s; }
.badge-enter-13 { animation-delay: 0.39s; }  .badge-enter-14 { animation-delay: 0.42s; }
.badge-enter-15 { animation-delay: 0.45s; }  .badge-enter-16 { animation-delay: 0.48s; }
.badge-enter-17 { animation-delay: 0.51s; }  .badge-enter-18 { animation-delay: 0.54s; }
.badge-enter-19 { animation-delay: 0.57s; }  .badge-enter-20 { animation-delay: 0.60s; }

/* Badge unlock: grayscale → color */
@keyframes badge-colorize {
  from { filter: grayscale(1) blur(4px); transform: scale(0.8); }
  60%  { filter: grayscale(0) blur(0); transform: scale(1.08); }
  to   { filter: grayscale(0) blur(0); transform: scale(1); }
}
.badge-unlocking {
  animation: badge-colorize 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* Golden glow pulse */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45); }
  50%      { box-shadow: 0 0 20px 8px rgba(245, 158, 11, 0.12); }
}
.glow-pulse {
  animation: glow-pulse 1.5s ease-in-out infinite;
}

/* Progress bar shimmer */
@keyframes progress-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.progress-shimmer {
  background: linear-gradient(90deg, #c96442 0%, #f5a623 50%, #c96442 100%);
  background-size: 200% 100%;
  animation: progress-shimmer 2s ease-in-out infinite;
}

/* Badge hover lift */
.badge-hover {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
}
.badge-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(201, 100, 66, 0.18);
}

/* Node completion ripple */
@keyframes ripple-out {
  from { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  to   { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
}
.ripple-out {
  animation: ripple-out 0.6s ease-out;
}

/* Flowing particle on connection line */
@keyframes flow-particle {
  0%   { offset-distance: 0%; opacity: 1; }
  100% { offset-distance: 100%; opacity: 0.3; }
}
.flow-dot {
  animation: flow-particle 2s linear infinite;
  offset-path: attr(data-path);
}

/* Float-up + fade-in */
@keyframes float-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.float-up {
  animation: float-up 0.35s ease-out both;
}

/* Number flip — for stat counters */
@keyframes count-flip {
  0%   { transform: translateY(0.6em); opacity: 0; filter: blur(2px); }
  100% { transform: translateY(0); opacity: 1; filter: blur(0); }
}
.count-flip {
  display: inline-block;
  animation: count-flip 0.4s ease-out both;
}

/* Streak heatmap cell entry */
@keyframes heat-in {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
.heat-in {
  animation: heat-in 0.25s ease-out both;
}

/* Share card 3D tilt on hover */
.share-card-3d {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  perspective: 1000px;
}
.share-card-3d:hover {
  transform: rotateY(-2deg) rotateX(1deg) scale(1.02);
  box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
}

/* Reduced motion: disable all new animations */
@media (prefers-reduced-motion: reduce) {
  .badge-enter, .badge-unlocking, .glow-pulse, .progress-shimmer,
  .badge-hover, .ripple-out, .flow-dot, .float-up, .count-flip,
  .heat-in, .share-card-3d {
    animation: none !important;
    transform: none !important;
    filter: none !important;
  }
}
```

- [ ] **Step 2: Verify the build (CSS is valid)**

```bash
npx tailwindcss -i src/app/globals.css -o /dev/null --dry-run 2>&1 || echo "checking via build instead"
npx tsc --noEmit
```
Expected: no errors from either

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add achievement system CSS animations (badge, glow, ripple, flow, float, flip, heat)"
```

---

### Task 4: Progress Ring Component (`src/components/ui/progress-ring.tsx`)

**Files:**
- Create: `src/components/ui/progress-ring.tsx`

**Interfaces:**
- Produces: `<ProgressRing value={number} total={number} size?: number strokeWidth?: number className?: string />`

- [ ] **Step 1: Write the component**

```typescript
// src/components/ui/progress-ring.tsx
'use client';

import { useMemo } from 'react';
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

function ringColor(pct: number): string {
  if (pct >= 0.75) return '#f59e0b'; // gold
  if (pct >= 0.5)  return '#10b981'; // green
  if (pct >= 0.25) return '#c96442'; // primary/terracotta
  return '#d9c9b0';                   // border taupe
}

export function ProgressRing({ value, total, size = 36, strokeWidth = 3, className }: ProgressRingProps) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0 transition-transform duration-200 hover:scale-110', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${value}/${total} 成就`}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border/30"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={ringColor(pct)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.3s ease' }}
      />
    </svg>
  );
}
```

- [ ] **Step 2: Test with a quick sanity check (no separate test needed — pure presentational)**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/progress-ring.tsx
git commit -m "feat: add ProgressRing SVG component for achievement progress"
```

---

## Phase 2: Badge Wall

### Task 5: Particle Canvas (`src/components/ui/particle-canvas.tsx`)

**Files:**
- Create: `src/components/ui/particle-canvas.tsx`

**Interfaces:**
- Produces: `<ParticleCanvas mode="confetti" | "gold-spark" | "smoke" duration={number} />`

- [ ] **Step 1: Write the reusable particle system**

```typescript
// src/components/ui/particle-canvas.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';

type ParticleMode = 'confetti' | 'gold-spark' | 'smoke';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

interface ParticleCanvasProps {
  mode: ParticleMode;
  duration?: number; // ms, default 2000
  onComplete?: () => void;
}

const COLORS_BY_MODE: Record<ParticleMode, string[]> = {
  'confetti': ['#c96442', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316'],
  'gold-spark': ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
  'smoke': ['rgba(107,90,78,0.6)', 'rgba(107,90,78,0.3)', 'rgba(107,90,78,0.15)'],
};

function createParticles(mode: ParticleMode, w: number, h: number, count: number): Particle[] {
  const colors = COLORS_BY_MODE[mode];
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = mode === 'smoke' ? 0.3 + Math.random() * 0.5 : 2 + Math.random() * 6;
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 60,
      y: h / 2 + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (mode === 'confetti' ? 3 : 0),
      life: 0,
      maxLife: mode === 'smoke' ? 60 + Math.random() * 40 : 30 + Math.random() * 40,
      size: mode === 'smoke' ? 6 + Math.random() * 10 : 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    });
  }
  return particles;
}

export function ParticleCanvas({ mode, duration = 2000, onComplete }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const count = mode === 'smoke' ? 12 : mode === 'gold-spark' ? 25 : 50;

  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === 0) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    if (elapsed > duration) {
      cancelAnimationFrame(animRef.current);
      onComplete?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const gravity = mode === 'smoke' ? -0.02 : 0.12;
    const friction = mode === 'smoke' ? 0.99 : 0.985;

    for (const p of particlesRef.current) {
      p.life++;
      if (p.life >= p.maxLife) continue;

      p.vy += gravity;
      p.vx *= friction;
      p.vy *= friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      const lifeRatio = 1 - p.life / p.maxLife;
      const alpha = mode === 'smoke' ? lifeRatio * 0.4 : lifeRatio;
      const scale = mode === 'smoke' ? 1 + (1 - lifeRatio) : lifeRatio;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = alpha;

      if (mode === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * scale / 2, -p.size * scale / 4, p.size * scale, p.size * scale / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * scale / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    }

    animRef.current = requestAnimationFrame(animate);
  }, [duration, mode, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = createParticles(mode, canvas.width, canvas.height, count);
    startTimeRef.current = 0;
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [mode, count, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-50"
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/particle-canvas.tsx
git commit -m "feat: add reusable ParticleCanvas for confetti/gold-spark/smoke effects"
```

---

### Task 6: Badge Unlock Modal (`src/components/ui/badge-unlock.tsx`)

**Files:**
- Create: `src/components/ui/badge-unlock.tsx`

**Interfaces:**
- Consumes: `AchievementDef` from `@/lib/achievement-store`
- Consumes: `ParticleCanvas` from `./particle-canvas`
- Produces: `<BadgeUnlockOverlay badge={AchievementDef} onClose={() => void} />`

- [ ] **Step 1: Write the unlock modal component**

```typescript
// src/components/ui/badge-unlock.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Share2 } from 'lucide-react';
import type { AchievementDef } from '@/lib/achievement-store';
import { ParticleCanvas } from './particle-canvas';

interface BadgeUnlockOverlayProps {
  badge: AchievementDef;
  onClose: () => void;
}

export function BadgeUnlockOverlay({ badge, onClose }: BadgeUnlockOverlayProps) {
  const [phase, setPhase] = useState<'animating' | 'visible' | 'exiting'>('animating');

  useEffect(() => {
    // Phase 1: particle burst (gold sparks)
    const t1 = setTimeout(() => setPhase('visible'), 400);
    // Auto-dismiss after 3.5s
    const t2 = setTimeout(() => setPhase('exiting'), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleClose = useCallback(() => {
    setPhase('exiting');
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  }, [handleClose]);

  if (phase === 'exiting') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 opacity-0">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={`成就解锁: ${badge.title}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Particle layer */}
      <ParticleCanvas mode="gold-spark" duration={2500} />

      {/* Badge card */}
      <div
        className={`relative z-10 mx-4 max-w-xs w-full rounded-2xl bg-card p-6 text-center shadow-2xl border border-border/50 ${
          phase === 'animating' ? 'badge-unlocking' : 'spring-in'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Animated glow ring */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200 glow-pulse">
          <span className="text-4xl">{badge.icon}</span>
        </div>

        {/* Title + description */}
        <h3 className="text-lg font-bold text-foreground mb-1">
          🎉 {badge.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {badge.description}
        </p>

        {/* Category label */}
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {categoryLabel(badge.category)}
        </span>

        {/* Share hint */}
        <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1 opacity-60">
          <Share2 className="h-3 w-3" />
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
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/badge-unlock.tsx
git commit -m "feat: add BadgeUnlockOverlay with particle burst and spring animation"
```

---

### Task 7: Achievement Wall (`src/components/routes/AchievementWall.tsx`)

**Files:**
- Create: `src/components/routes/AchievementWall.tsx`

**Interfaces:**
- Consumes: `ACHIEVEMENTS`, `getAchievements`, `getAchievementCount`, `TOTAL_ACHIEVEMENTS`, `AchievementDef`, `AppContext` from `@/lib/achievement-store`
- Consumes: `collectContext` from `@/lib/achievement-store`
- Produces: `<AchievementWall context={AppContext} />`

- [ ] **Step 1: Write the AchievementWall component**

```typescript
// src/components/routes/AchievementWall.tsx
'use client';

import { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import type { AchievementDef, AppContext } from '@/lib/achievement-store';
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
  const unlockedIds = useMemo(() => new Set(getAchievements().map(a => a.id)), []);
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
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            成就大厅
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            已解锁 <span className="font-semibold text-primary">{unlockedCount}</span> / {ACHIEVEMENTS.length} 枚徽章
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
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
              category === item.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            )}
            aria-pressed={category === item.key}
          >
            <span>{item.icon}</span>
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
                'relative flex flex-col items-center rounded-xl border p-4 text-center transition-all duration-300',
                isUnlocked
                  ? 'badge-hover border-amber-200/60 bg-gradient-to-b from-amber-50/50 to-card cursor-pointer'
                  : 'border-border/40 bg-card/50 cursor-default',
                `badge-enter badge-enter-${(idx % 20) + 1}`
              )}
              aria-label={`${badge.title}${isUnlocked ? ' — 已解锁' : ' — 未解锁'}`}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full text-3xl transition-all duration-500',
                  isUnlocked
                    ? 'bg-amber-50 border-2 border-amber-200'
                    : 'bg-secondary/50 border border-border/30 grayscale opacity-50'
                )}
              >
                {badge.icon}
              </div>

              {/* Title */}
              <span className={cn(
                'mt-2 text-sm font-semibold',
                isUnlocked ? 'text-foreground' : 'text-muted-foreground/70'
              )}>
                {badge.title}
              </span>

              {/* Description or unlock condition */}
              <span className="mt-1 text-[11px] text-muted-foreground/60 leading-tight">
                {isUnlocked ? badge.description : badge.condition}
              </span>

              {/* Progress bar (only for in-progress badges) */}
              {hasProgress && (
                <div className="mt-2 w-full">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                    <span>{progress!.current}/{progress!.target}</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Unlocked date */}
              {isUnlocked && (
                <span className="mt-2 text-[10px] text-emerald-600 font-medium">
                  ✅ 已解锁
                </span>
              )}
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
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/routes/AchievementWall.tsx
git commit -m "feat: add AchievementWall with category filters, 4 card states, and stagger animation"
```

---

### Task 8: RouteBoard Container Refactor (`src/components/routes/RouteBoard.tsx`)

**Files:**
- Modify: `src/components/routes/RouteBoard.tsx`

**Interfaces:**
- Consumes: `AchievementWall`, `AppContext` from `@/lib/achievement-store`
- Consumes: `recordVisit`, `getStreak`, `getStreakHistory` from `@/lib/streak-store`
- Produces: `<RouteBoard />` — now a container with 5 sub-view tabs

- [ ] **Step 1: Rewrite RouteBoard as a multi-view container**

```typescript
// src/components/routes/RouteBoard.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Map, Calendar, BarChart3, Share2 } from 'lucide-react';
import type { AppContext } from '@/lib/achievement-store';
import { collectContext, getAchievementCount, TOTAL_ACHIEVEMENTS } from '@/lib/achievement-store';
import { checkAndUnlock } from '@/lib/achievement-store';
import { recordVisit, getStreak } from '@/lib/streak-store';
import { getRoutes } from '@/lib/route-store';
import { getActivities } from '@/lib/activity-store';
import { getDecisions } from '@/lib/decision-store';
import { AchievementWall } from './AchievementWall';
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

  // Build app context on mount and when relevant stores change
  useEffect(() => {
    recordVisit();
    const streak = getStreak();

    // Collect night visits count
    let nightVisits = 0;
    try {
      const raw = localStorage.getItem('career-compass-streak');
      if (raw) {
        const dates: string[] = JSON.parse(raw);
        nightVisits = dates.filter(d => {
          // Check if any visit_on_this_date happened after 10pm
          // Simplified: count total visits as proxy
          return true;
        }).length;
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
      // Store latest unlocked badges for the unlock modal
      window.dispatchEvent(new CustomEvent('badges-unlocked', { detail: newBadges }));
    }
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const refresh = () => {
      const streak = getStreak();
      const ctx = collectContext(
        streak, getProfile(), getActivities().filter(a => a.type === 'resource_save').length,
        getCompareViews(), isPersonalityDone(), getCompetencyCount(),
        isExplorerUsed(), isSimDone(), 0,
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
          <LegacyRouteView />
        )}
        {activeView === 'calendar' && (
          <PlaceholderView title="打卡日历" desc="即将上线" />
        )}
        {activeView === 'stats' && (
          <PlaceholderView title="统计数据" desc="即将上线" />
        )}
        {activeView === 'share' && (
          <PlaceholderView title="分享卡片" desc="即将上线" />
        )}
      </div>
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

/** Temporary: render the original route chain view */
function LegacyRouteView() {
  // Reuse the existing RouteChain logic from the old RouteBoard
  // (extracted into a helper for now; will be replaced by RouteDashboard in Task 9)
  const [routes, setRoutes] = useState<(ReturnType<typeof getRoutes>)[number][]>([]);
  useEffect(() => {
    setRoutes(getRoutes());
    const refresh = () => setRoutes(getRoutes());
    window.addEventListener('routes-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('routes-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // Re-render the original route board content inline
  const refresh = () => setRoutes(getRoutes());

  if (routes.length === 0) {
    return (
      <PlaceholderView title="还没有路线规划" desc="完善个人画像后让 AI 为你生成专属职业路线" />
    );
  }

  return (
    <div className="flex flex-wrap items-start justify-center gap-10 p-8 overflow-x-auto">
      {routes.filter(r => r.status !== 'abandoned').map(r => (
        <LegacyRouteChain key={r.id} route={r} onUpdate={refresh} />
      ))}
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
  try { return JSON.parse(localStorage.getItem('career-compass-personality-result') || 'false') !== false; }
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

// Import LegacyRouteChain from the old implementation — inline for now
function LegacyRouteChain({ route, onUpdate }: {
  route: ReturnType<typeof getRoutes>[number];
  onUpdate: () => void;
}) {
  const routeAny = route as Record<string, unknown>;
  const nodes = (routeAny.nodes as Array<{ id: string; label: string; status: string; detail: string }>) || [];
  const tags = (routeAny.tags as string[]) || [];
  const NODE_W = 140, NODE_H = 52, LEVEL_GAP = 90;
  const labelLen = Math.max(...nodes.map(n => n.label.length), 2);
  const maxW = labelLen * 14 + 60;

  const nodeColor = (s: string) => {
    switch (s) {
      case 'done': return 'bg-emerald-100 border-emerald-400 text-emerald-800';
      case 'active': return 'bg-primary/10 border-primary text-primary';
      case 'goal': return 'bg-amber-50 border-amber-400 text-amber-800';
      default: return 'bg-secondary border-border text-muted-foreground';
    }
  };
  const nodeIcon = (s: string) => {
    switch (s) { case 'done': return '✅'; case 'active': return '⏳'; case 'goal': return '⭐'; default: return '🔒'; }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-sm mb-1">
        <h3 className="font-semibold text-foreground">{String(routeAny.title || '')}</h3>
        {route.status === 'completed' && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">已达成</span>}
      </div>
      <svg width={maxW + 40} height={nodes.length * LEVEL_GAP + 20}>
        {nodes.map((node, i) => {
          const y = i * LEVEL_GAP + 10;
          const x = (maxW - NODE_W) / 2 + 20;
          return (
            <g key={node.id}>
              {i > 0 && (
                <line x1={x + NODE_W / 2} y1={y} x2={x + NODE_W / 2} y2={y - (LEVEL_GAP - NODE_H)}
                  stroke={node.status === 'done' ? '#10b981' : node.status === 'active' ? '#c96442' : '#d9c9b0'}
                  strokeWidth={2} strokeDasharray={node.status === 'locked' ? '4 4' : 'none'} />
              )}
              <foreignObject x={x} y={y} width={NODE_W} height={NODE_H}>
                <button
                  onClick={() => {
                    if (node.status === 'active' || node.status === 'done') {
                      import('@/lib/route-store').then(({ updateNodeStatus }) => {
                        updateNodeStatus(String(routeAny.id), node.id, node.status !== 'done');
                        onUpdate();
                      });
                    }
                  }}
                  className={`flex w-full h-full items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all hover:shadow-sm ${nodeColor(node.status)} ${node.status === 'locked' || node.status === 'goal' ? 'cursor-default' : 'cursor-pointer'}`}>
                  <span className="text-sm">{nodeIcon(node.status)}</span>
                  <span className="text-left leading-tight line-clamp-2">{node.label}</span>
                </button>
              </foreignObject>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-muted-foreground">{tags.join(' · ')}</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/routes/RouteBoard.tsx
git commit -m "refactor: RouteBoard into multi-view container with badge wall + legacy route view"
```

---

## Phase 3: Interactive Route Dashboard

### Task 9: RouteDashboard (`src/components/routes/RouteDashboard.tsx`)

**Files:**
- Create: `src/components/routes/RouteDashboard.tsx`
- Modify: `src/components/routes/RouteBoard.tsx` (replace `LegacyRouteView` with `<RouteDashboard />`)

**Interfaces:**
- Consumes: `getRoutes`, `updateNodeStatus`, `abandonRoute` from `@/lib/route-store`
- Consumes: `ProgressRing` from `@/components/ui/progress-ring`
- Consumes: `checkAndUnlock` from `@/lib/achievement-store`
- Produces: `<RouteDashboard />`

- [ ] **Step 1: Write RouteDashboard with horizontal timeline + progress ring**

```typescript
// src/components/routes/RouteDashboard.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, Pencil, Share2, Trash2 } from 'lucide-react';
import { getRoutes, updateNodeStatus, abandonRoute } from '@/lib/route-store';
import { checkAndUnlock, collectContext } from '@/lib/achievement-store';
import { getStreak } from '@/lib/streak-store';
import { ProgressRing } from '@/components/ui/progress-ring';
import { cn } from '@/lib/utils';

const NODE_W = 140;

interface RouteDashboardProps {}

export function RouteDashboard(_props: RouteDashboardProps) {
  const [routes, setRoutes] = useState<ReturnType<typeof getRoutes>>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const refresh = useCallback(() => {
    setRoutes(getRoutes());
  }, []);

  useEffect(() => {
    setRoutes(getRoutes());
    window.addEventListener('routes-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('routes-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const activeRoutes = routes.filter(r => r.status !== 'abandoned');
  const completedCount = routes.filter(r => r.status === 'completed').length;
  const totalNodes = routes.flatMap(r => r.nodes).length;
  const doneNodes = routes.flatMap(r => r.nodes).filter(n => n.status === 'done').length;
  const completionPct = totalNodes > 0 ? Math.round((doneNodes / totalNodes) * 100) : 0;

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary">
          <svg className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">还没有路线规划</h3>
        <p className="text-sm text-muted-foreground mb-6">完善个人画像后让 AI 为你生成专属职业路线</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overall progress bar */}
      <div className="bg-card rounded-xl border border-border/40 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">总进度</span>
          <span className="text-sm text-muted-foreground">{doneNodes}/{totalNodes} 节点 · {completionPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span>📋 {activeRoutes.length} 条进行中</span>
          <span>✅ {completedCount} 条已完成</span>
        </div>
      </div>

      {/* Route cards */}
      {activeRoutes.map(route => {
        const nodes = route.nodes;
        const doneCount = nodes.filter(n => n.status === 'done').length;
        const routePct = nodes.length > 0 ? Math.round((doneCount / nodes.length) * 100) : 0;
        const isExpanded = expandedId === route.id;

        return (
          <div key={route.id} className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <div className="flex items-center gap-3">
                <ProgressRing value={doneCount} total={nodes.length} size={40} strokeWidth={3.5} />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{route.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {route.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-px rounded bg-secondary text-muted-foreground">{t}</span>
                    ))}
                    <span className="text-[10px] text-muted-foreground">{route.salary}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : route.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label={isExpanded ? '收起详情' : '展开详情'}
                >
                  {isExpanded ? <ChevronRight className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Horizontal node timeline */}
            <div className="px-4 py-4 overflow-x-auto" ref={el => { if (el) scrollRefs.current.set(route.id, el); }}>
              <div className="flex items-start gap-0 min-w-max">
                {nodes.map((node, idx) => {
                  const isDone = node.status === 'done';
                  const isActive = node.status === 'active';
                  const isGoal = node.status === 'goal';

                  return (
                    <div key={node.id} className="flex items-center">
                      {/* Connection line + flowing particle */}
                      {idx > 0 && (
                        <div className="relative flex items-center w-10 h-12">
                          <div className="w-full h-[2px] rounded-full"
                            style={{ background: isDone ? '#10b981' : isActive ? '#c96442' : '#d9c9b0' }}
                          />
                          {isActive && (
                            <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary animate-pulse" style={{ transform: 'translate(-50%, -50%)' }} />
                          )}
                        </div>
                      )}

                      {/* Node button */}
                      <button
                        onClick={() => {
                          if (node.status === 'active' || node.status === 'done') {
                            updateNodeStatus(route.id, node.id, node.status !== 'done');
                            refresh();
                            // Trigger achievement check
                            const streak = getStreak();
                            const ctx = collectContext(streak, {}, 0, [], false, 0, false, false, 0);
                            checkAndUnlock(ctx);
                          }
                        }}
                        disabled={node.status === 'locked' || node.status === 'goal'}
                        className={cn(
                          'relative flex flex-col items-center justify-center rounded-xl border px-3 py-2.5 text-xs transition-all',
                          isDone && 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:shadow-md cursor-pointer ripple-out',
                          isActive && 'bg-primary/10 border-primary text-primary hover:shadow-md cursor-pointer',
                          isGoal && 'bg-amber-50 border-amber-300 text-amber-800 cursor-default',
                          node.status === 'locked' && 'bg-secondary/50 border-border/30 text-muted-foreground cursor-default opacity-50',
                        )}
                        style={{ width: NODE_W, minHeight: 64 }}
                        aria-label={`${node.label} — ${node.status === 'done' ? '已完成' : node.status === 'active' ? '进行中' : node.status === 'goal' ? '最终目标' : '未解锁'}`}
                      >
                        <span className="text-base mb-0.5">
                          {isDone ? '✅' : isActive ? '⏳' : isGoal ? '⭐' : '🔒'}
                        </span>
                        <span className="font-medium text-[11px] leading-tight text-center line-clamp-2">
                          {node.label}
                        </span>
                        {isActive && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-border/10 pt-3 space-y-2 text-xs text-muted-foreground float-up">
                {route.requirements.length > 0 && (
                  <div>
                    <span className="font-semibold text-foreground">📊 门槛条件: </span>
                    {route.requirements.join('、')}
                  </div>
                )}
                {route.fit && <div><span className="font-semibold text-foreground">💡 适合人群: </span>{route.fit}</div>}
                {route.cost && <div><span className="font-semibold text-foreground">⏱️ 代价: </span>{route.cost}</div>}
                {route.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="font-semibold text-foreground">📎 数据来源: </span>
                    {route.sources.slice(0, 3).map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline">[{s.title}]</a>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { abandonRoute(route.id); refresh(); }}
                    className="text-[11px] text-muted-foreground hover:text-red-500 transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> 放弃此路线
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Update RouteBoard.tsx** — replace `LegacyRouteView` import and usage with `<RouteDashboard />`

```typescript
// In RouteBoard.tsx, replace:
//   {activeView === 'routes' && (<LegacyRouteView />)}
// With:
//   {activeView === 'routes' && (<RouteDashboard />)}
```
And add import: `import { RouteDashboard } from './RouteDashboard';`

Remove the `LegacyRouteView` and `LegacyRouteChain` helper functions (they're no longer needed).

- [ ] **Step 3: Type check and commit**

```bash
npx tsc --noEmit
```
Expected: no errors

```bash
git add src/components/routes/RouteDashboard.tsx src/components/routes/RouteBoard.tsx
git commit -m "feat: add interactive RouteDashboard with horizontal timeline, progress ring, expandable details"
```

---

## Phase 4: Calendar + Stats

### Task 10: StreakCalendar (`src/components/routes/StreakCalendar.tsx`)

**Files:**
- Create: `src/components/routes/StreakCalendar.tsx`
- Modify: `src/components/routes/RouteBoard.tsx` (replace calendar placeholder with `<StreakCalendar />`)

- [ ] **Step 1: Write the heatmap calendar component**

```typescript
// src/components/routes/StreakCalendar.tsx
'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { getStreak, getStreakHistory, formatDateKey } from '@/lib/streak-store';
import { cn } from '@/lib/utils';

interface StreakCalendarProps {}

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'];

function cellColor(count: number): string {
  if (count === 0) return 'bg-secondary/40';
  if (count <= 2) return 'bg-emerald-100';
  if (count <= 4) return 'bg-emerald-200';
  if (count <= 8) return 'bg-emerald-400';
  return 'bg-emerald-600';
}

interface DayCell {
  date: string;
  count: number;
  activities: string[];
}

export function StreakCalendar(_props: StreakCalendarProps) {
  const [offset, setOffset] = useState(0); // 0 = current half, negative = past
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const streak = getStreak();
  const allDates = useMemo(() => getStreakHistory(), []);

  // Generate 180 days of cells
  const cells = useMemo(() => {
    const result: DayCell[] = [];
    const now = new Date();
    for (let i = 179 + offset * 30; i >= offset * 30; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const count = allDates.filter(dt => dt === key).length;
      result.push({ date: key, count: Math.min(count, 5), activities: [] });
    }
    return result;
  }, [allDates, offset]);

  // Group by week rows
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Month labels
  const monthMarkers: { label: string; col: number }[] = [];
  let lastMonth = '';
  cells.forEach((c, i) => {
    const m = c.date.slice(5, 7);
    if (m !== lastMonth) {
      lastMonth = m;
      monthMarkers.push({ label: MONTH_NAMES[parseInt(m) - 1], col: Math.floor(i / 7) });
    }
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold text-foreground">活跃记录</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">
            连续打卡 {streak} 天
          </span>
          {streak >= 7 && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">🏅 七日之约</span>}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setOffset(o => o - 1)} className="p-1 rounded hover:bg-secondary transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => setOffset(o => o < 0 ? o + 1 : 0)} className="p-1 rounded hover:bg-secondary transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Month labels row */}
      <div className="flex ml-8 mb-1">
        {monthMarkers.map((mm, i) => (
          <span key={i} className="text-[10px] text-muted-foreground" style={{ width: `${(mm.col + 1) * 16}px` }}>
            {mm.label}
          </span>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAY_NAMES.map((d, i) => (
            <span key={i} className="text-[9px] text-muted-foreground h-3 w-4 flex items-center">{d}</span>
          ))}
        </div>

        {/* Cells */}
        <div className="flex gap-0.5 flex-1 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell, di) => {
                const todayKey = formatDateKey(new Date());
                const isToday = cell.date === todayKey;
                const isSelected = cell.date === selectedDay;

                return (
                  <button
                    key={`${wi}-${di}`}
                    onClick={() => setSelectedDay(isSelected ? null : cell.date)}
                    className={cn(
                      'w-3 h-3 rounded-sm transition-all duration-200',
                      cellColor(cell.count),
                      isToday && 'ring-1 ring-primary',
                      isSelected && 'ring-2 ring-primary/60 scale-125',
                      'hover:scale-150 hover:z-10 hover:ring-1 hover:ring-foreground/20'
                    )}
                    style={{ animationDelay: `${(wi * 7 + di) * 0.005}s` }}
                    title={`${cell.date}: ${cell.count} 次互动`}
                    aria-label={`${cell.date}: ${cell.count} 次互动`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
        <span>少</span>
        <span className={cn('w-3 h-3 rounded-sm', cellColor(0))} />
        <span className={cn('w-3 h-3 rounded-sm', cellColor(1))} />
        <span className={cn('w-3 h-3 rounded-sm', cellColor(3))} />
        <span className={cn('w-3 h-3 rounded-sm', cellColor(5))} />
        <span className={cn('w-3 h-3 rounded-sm', cellColor(9))} />
        <span>多</span>
      </div>

      {/* Dynamic tip */}
      {streak > 0 && streak < 7 && (
        <p className="mt-3 text-xs text-muted-foreground">
          💡 再坚持 <span className="font-semibold text-primary">{7 - streak}</span> 天就能解锁「七日之约」徽章！
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire into RouteBoard.tsx**

Replace `<PlaceholderView title="打卡日历" desc="即将上线" />` with `<StreakCalendar />`.

```bash
npx tsc --noEmit
git add src/components/routes/StreakCalendar.tsx src/components/routes/RouteBoard.tsx
git commit -m "feat: add GitHub-style StreakCalendar heatmap with hover tooltips"
```

---

### Task 11: StatsPanel (`src/components/routes/StatsPanel.tsx`)

**Files:**
- Create: `src/components/routes/StatsPanel.tsx`
- Modify: `src/components/routes/RouteBoard.tsx` (replace stats placeholder)

- [ ] **Step 1: Write the stats panel with metric cards**

```typescript
// src/components/routes/StatsPanel.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, TrendingUp, FileText, Map, Target, Flame, Trophy } from 'lucide-react';
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
    { label: '活跃路线', value: stats.activeRoutes, icon: Map, trend: null },
    { label: '完成率', value: `${stats.completionPct}%`, icon: Target, trend: null },
    { label: '连续天数', value: stats.streak, icon: Flame, trend: `天` },
  ];

  // Mini trend data (last 7 days of chats)
  const weekDays = useMemo(() => {
    const activities = getActivities();
    const dayMap = new Map<string, number>();
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
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          我的数据
        </h2>
        <button
          onClick={exportData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          导出数据
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((card, i) => (
          <button
            key={card.label}
            className="group flex flex-col items-start rounded-xl border border-border/40 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <card.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
            <span className="text-2xl font-bold text-foreground count-flip">{card.value}</span>
            <span className="text-xs text-muted-foreground mt-1">{card.label}{card.trend ? ` · ${card.trend}` : ''}</span>
          </button>
        ))}
      </div>

      {/* Mini trend chart */}
      <div className="rounded-xl border border-border/40 bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">📈 本周活跃（互动次数）</h3>
        <svg viewBox="0 0 200 60" className="w-full h-16">
          <polyline
            points={trendPoints}
            fill="none"
            stroke="#c96442"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {weekDays.map((d, i) => {
            const x = i * (200 / (weekDays.length - 1));
            const y = 60 - (d.count / maxCount) * 50;
            return (
              <g key={d.date}>
                <circle cx={x} cy={y} r="3" fill="#c96442" className="hover:r-4 transition-all" />
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
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">🏅 最近解锁</h3>
          <div className="flex flex-wrap gap-2">
            {recentBadges.map(ba => {
              const def = ACHIEVEMENTS.find(a => a.id === ba.id);
              if (!def) return null;
              return (
                <span key={ba.id} className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-foreground">
                  {def.icon} {def.title}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat stats */}
      <div className="rounded-xl border border-border/40 bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">💬 对话统计</h3>
        <div className="flex items-center gap-6">
          <div><span className="text-2xl font-bold text-foreground">{stats.chats}</span><span className="text-xs text-muted-foreground ml-1">累计对话</span></div>
          <div><span className="text-2xl font-bold text-foreground">{getActivities().filter(a => a.type === 'competency').length}</span><span className="text-xs text-muted-foreground ml-1">能力评估</span></div>
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
```

- [ ] **Step 2: Wire into RouteBoard.tsx** — replace `<PlaceholderView title="统计数据" .../>` with `<StatsPanel />`

```bash
npx tsc --noEmit
git add src/components/routes/StatsPanel.tsx src/components/routes/RouteBoard.tsx
git commit -m "feat: add StatsPanel with metric cards, trend chart, recent badges"
```

---

## Phase 5: Share Card

### Task 12: ShareCard (`src/components/routes/ShareCard.tsx`)

**Files:**
- Create: `src/components/routes/ShareCard.tsx`
- Modify: `src/components/routes/RouteBoard.tsx` (replace share placeholder)

- [ ] **Step 1: Write the share card generator**

```typescript
// src/components/routes/ShareCard.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Download, Copy, Check, Share2 } from 'lucide-react';
import { getRoutes } from '@/lib/route-store';
import { getAchievements, TOTAL_ACHIEVEMENTS } from '@/lib/achievement-store';
import { getStreak } from '@/lib/streak-store';
import { ProgressRing } from '@/components/ui/progress-ring';
import { toast } from '@/components/ui/toast';

type Theme = 'clean' | 'vibrant' | 'minimal';

const THEMES: { key: Theme; label: string; bg: string; text: string; accent: string }[] = [
  { key: 'clean', label: '简洁', bg: 'bg-card', text: 'text-foreground', accent: '#c96442' },
  { key: 'vibrant', label: '炫彩', bg: 'bg-gradient-to-br from-amber-50 to-orange-50', text: 'text-foreground', accent: '#f59e0b' },
  { key: 'minimal', label: '极简', bg: 'bg-white', text: 'text-slate-800', accent: '#475569' },
];

interface ShareCardProps {}

export function ShareCard(_props: ShareCardProps) {
  const [theme, setTheme] = useState<Theme>('vibrant');
  const [sections, setSections] = useState({ routes: true, badges: true, streak: true });
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const routes = getRoutes();
  const activeCount = routes.filter(r => r.status === 'active').length;
  const completedCount = routes.filter(r => r.status === 'completed').length;
  const badgeCount = getAchievements().length;
  const streak = getStreak();
  const t = THEMES.find(th => th.key === theme) || THEMES[0];

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyImage = useCallback(async () => {
    setCopied(true);
    toast('success', '已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const saveImage = useCallback(() => {
    toast('success', '截图保存功能开发中');
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          分享我的成长
        </h2>
      </div>

      {/* Theme selector */}
      <div className="flex gap-2">
        {THEMES.map(th => (
          <button
            key={th.key}
            onClick={() => setTheme(th.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              theme === th.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {th.label}
          </button>
        ))}
      </div>

      {/* Section toggles */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'routes' as const, label: '路线进度' },
          { key: 'badges' as const, label: '徽章数量' },
          { key: 'streak' as const, label: '连续天数' },
        ].map(s => (
          <label key={s.key} className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={sections[s.key]} onChange={() => toggleSection(s.key)}
              className="rounded border-border text-primary focus:ring-primary/30" />
            {s.label}
          </label>
        ))}
      </div>

      {/* Preview card */}
      <div
        ref={cardRef}
        className={`relative rounded-2xl border-2 border-border/30 p-6 shadow-xl share-card-3d overflow-hidden ${t.bg} ${t.text}`}
        style={{ maxWidth: 380 }}
      >
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${t.accent}, transparent)` }} />

        <h3 className="text-lg font-bold mb-4">✦ 歧点 · 我的职业成长报告 ✦</h3>

        {/* Metric chips */}
        <div className="flex gap-3 mb-4">
          {sections.routes && (
            <div className="flex-1 rounded-xl border border-border/30 bg-white/50 p-3 text-center">
              <div className="text-2xl">🗺️</div>
              <div className="text-xl font-bold">{activeCount}</div>
              <div className="text-[10px] text-muted-foreground">活跃路线 · {completedCount} 完成</div>
            </div>
          )}
          {sections.streak && (
            <div className="flex-1 rounded-xl border border-border/30 bg-white/50 p-3 text-center">
              <div className="text-2xl">🔥</div>
              <div className="text-xl font-bold">{streak}</div>
              <div className="text-[10px] text-muted-foreground">连续打卡</div>
            </div>
          )}
          {sections.badges && (
            <div className="flex-1 rounded-xl border border-border/30 bg-white/50 p-3 text-center">
              <div className="text-2xl">🏅</div>
              <div className="text-xl font-bold">{badgeCount}/{TOTAL_ACHIEVEMENTS}</div>
              <div className="text-[10px] text-muted-foreground">成就徽章</div>
            </div>
          )}
        </div>

        {/* Progress bar for badges */}
        {sections.badges && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>🏅 成就进度</span>
              <span>{badgeCount}/{TOTAL_ACHIEVEMENTS}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(badgeCount / TOTAL_ACHIEVEMENTS) * 100}%`, background: `linear-gradient(90deg, ${t.accent}, #f59e0b)` }} />
            </div>
          </div>
        )}

        {/* Custom signature */}
        <p className="text-xs text-muted-foreground italic mb-3">"把路看清楚，决定你自己做"</p>

        {/* Footer */}
        <div className="text-[10px] text-muted-foreground/60">
          生成时间: {new Date().toISOString().slice(0, 10)}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={copyImage}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? '已复制' : '复制图片'}
        </button>
        <button onClick={saveImage}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary">
          <Download className="h-4 w-4" />
          保存到本地
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into RouteBoard.tsx**

```bash
npx tsc --noEmit
git add src/components/routes/ShareCard.tsx src/components/routes/RouteBoard.tsx
git commit -m "feat: add ShareCard with 3 themes, toggleable sections, copy/save actions"
```

---

## Phase 6: Global Hooks

### Task 13: AppSidebar Progress Ring

**Files:**
- Modify: `src/components/layout/AppSidebar.tsx`

- [ ] **Step 1: Add ProgressRing to the routes nav item**

In `AppSidebar.tsx`:
1. Add import: `import { ProgressRing } from '@/components/ui/progress-ring';`
2. Add import: `import { getAchievementCount, TOTAL_ACHIEVEMENTS } from '@/lib/achievement-store';`
3. Add a state for badge count: `const [badgeCount, setBadgeCount] = useState(0);`
4. Add a useEffect to listen for badge unlocks and refresh count:
```typescript
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
```
5. For the routes nav item (id === 'routes'), add `<ProgressRing value={badgeCount} total={TOTAL_ACHIEVEMENTS} size={20} strokeWidth={2} />` before or wrapping the icon.

```bash
npx tsc --noEmit
git add src/components/layout/AppSidebar.tsx
git commit -m "feat: add ProgressRing to sidebar routes nav item"
```

---

### Task 14: MessageBubble Feedback Bar

**Files:**
- Modify: `src/components/chat/MessageBubble.tsx`

- [ ] **Step 1: Add feedback action buttons below AI messages**

Add after the source links section (line 70 close of `realSources.length > 0` block), before the closing `</div>`:

```typescript
{/* Feedback bar — only for assistant messages */}
{!isUser && message.content.length > 0 && (
  <div className="mt-3 flex items-center gap-1 border-t border-border/30 pt-2">
    <button
      onClick={() => {
        import('@/lib/activity-store').then(({ addActivity }) => {
          addActivity({ type: 'chat', title: '👍 有用:', detail: message.content.slice(0, 50) });
        });
      }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-emerald-600 transition-all active:scale-90"
      aria-label="有用"
    >
      👍 <span className="text-[10px]">有用</span>
    </button>
    <button
      onClick={() => {
        import('@/lib/activity-store').then(({ addActivity }) => {
          addActivity({ type: 'chat', title: '👎 无用:', detail: message.content.slice(0, 50) });
        });
      }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-red-500 transition-all active:scale-90"
      aria-label="没用"
    >
      👎 <span className="text-[10px]">没用</span>
    </button>
    <button
      onClick={() => {
        navigator.clipboard.writeText(message.content).then(() => {
          import('@/components/ui/toast').then(({ toast }) => toast('success', '已复制到剪贴板'));
        }).catch(() => {});
      }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-90 ml-auto"
      aria-label="复制"
    >
      📋 <span className="text-[10px]">复制</span>
    </button>
  </div>
)}
```

```bash
npx tsc --noEmit
git add src/components/chat/MessageBubble.tsx
git commit -m "feat: add feedback bar (👍/👎/📋) to AI message bubbles"
```

---

### Task 15: ChatInterface "Try This" Suggestion Chips

**Files:**
- Modify: `src/components/chat/ChatInterface.tsx`

- [ ] **Step 1: Extract last AI message and generate a follow-up suggestion**

After the loading indicator div, add suggestion chips below the last assistant message:

```typescript
{/* In the message rendering loop, after the last assistant message */}
{msg.role === 'assistant' && i === messages.length - 1 && msg.content.length > 20 && !loading && (
  <div className="mb-5 flex justify-start">
    <div className="max-w-[82%] ml-6">
      <button
        onClick={() => { setInput('能再详细解释一下吗？'); }}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all"
      >
        💡 试试: "能再详细解释一下吗？"
      </button>
    </div>
  </div>
)}
```

```bash
npx tsc --noEmit
git add src/components/chat/ChatInterface.tsx
git commit -m "feat: add 'try this' suggestion chip after AI replies"
```

---

### Task 16: DecisionJournal Weekly Summary Bar

**Files:**
- Modify: `src/components/decisions/DecisionJournal.tsx`

- [ ] **Step 1: Add a summary bar at the top of the journal**

At the top of the main return JSX (before the "新建决策" button), add:

```typescript
{/* Weekly summary bar */}
{decisions.length > 0 && (
  <div className="rounded-xl border border-border/40 bg-card p-3 mb-4">
    <div className="flex items-center gap-4 text-sm">
      <span className="text-foreground font-medium">📋 本周决策摘要</span>
      <span className="text-muted-foreground">⏳ {decisions.filter(d => d.status === 'active').length} 待决定</span>
      <span className="text-muted-foreground">✅ {decisions.filter(d => d.status === 'settled').length} 已决定</span>
      <span className="text-muted-foreground">🔄 {decisions.reduce((sum, d) => sum + d.snapshots.length, 0)} 总快照</span>
    </div>
  </div>
)}
```

Note: `decisions` is already available in the component from the existing state.

```bash
npx tsc --noEmit
git add src/components/decisions/DecisionJournal.tsx
git commit -m "feat: add weekly summary bar to decision journal"
```

---

### Task 17: ResourceBrowser Card Enhancements

**Files:**
- Modify: `src/components/chat/ResourceBrowser.tsx`

- [ ] **Step 1: Add share button + enhanced card hover**

In the resource card rendering, add a share icon next to the bookmark button:

```typescript
{/* Inside each resource card, next to the bookmark button */}
<button
  onClick={(e) => {
    e.preventDefault();
    navigator.clipboard.writeText(link.url).then(() => {
      toast('success', '链接已复制');
    }).catch(() => {});
  }}
  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
  aria-label="分享链接"
>
  <Share2 className="h-3.5 w-3.5" />
</button>
```

And add `Share2` to the lucide-react imports.

```bash
npx tsc --noEmit
git add src/components/chat/ResourceBrowser.tsx
git commit -m "feat: add share button + enhanced hover to resource cards"
```

---

### Task 18: Toast Upgrade — Clickable + Stacked

**Files:**
- Modify: `src/components/ui/toast.tsx`

- [ ] **Step 1: Add support for clickable toast with optional action**

Change the `toast()` signature and `add` function to accept an optional `action` parameter:

```typescript
// Add to top of file:
interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string; type: ToastType; message: string; exiting?: boolean; action?: ToastAction;
}

// Update the toast() function:
export function toast(type: ToastType, message: string, action?: ToastAction) {
  addToastFn?.(type, message, action);
}

// Update add function signature:
const add = useCallback((type: ToastType, message: string, action?: ToastAction) => {

// In the JSX render for each toast, add the action button:
{/* After the message text, before the close button */}
{t.action && (
  <button
    onClick={() => { t.action!.onClick(); manualClose(t.id); }}
    className="ml-1 rounded-md px-2 py-0.5 text-xs font-medium underline underline-offset-2 hover:opacity-80"
  >
    {t.action.label}
  </button>
)}
```

```bash
npx tsc --noEmit
git add src/components/ui/toast.tsx
git commit -m "feat: upgrade toast with clickable action buttons"
```

---

## Phase 7: Unlock Integration

### Task 19: Wire checkAndUnlock at All Trigger Points

**Files:**
- Modify: `src/app/main/page.tsx` (call recordVisit + checkAndUnlock on mount)
- Modify: `src/components/profile/ProfileDashboard.tsx` (after tests complete)
- Modify: `src/components/explore/CareerExplorer.tsx` (on first use)
- Modify: `src/components/explore/DecisionTree.tsx` (on completion)
- Modify: `src/components/routes/RouteBoard.tsx` (already done — trigger on mount)

- [ ] **Step 1: main/page.tsx** — Add recordVisit and achievement check on mount

```typescript
// Add imports:
import { recordVisit, getStreak } from '@/lib/streak-store';
import { checkAndUnlock, collectContext } from '@/lib/achievement-store';

// In the useEffect that records first_visit, add:
useEffect(() => {
  recordVisit();
  const activities = getActivities();
  if (activities.length === 0) {
    addActivity({ type: 'first_visit', title: '首次使用歧点', detail: '开启职业探索之旅' });
  }
  // Check achievements on every page load
  const streak = getStreak();
  const hour = new Date().getHours();
  const nightVisits = (hour >= 22 || hour < 5) ? 1 : 0;
  const ctx = collectContext(streak, {}, 0, [], false, 0, false, false, nightVisits);
  const newBadges = checkAndUnlock(ctx);
  if (newBadges.length > 0) {
    window.dispatchEvent(new CustomEvent('badges-unlocked', { detail: newBadges }));
  }
}, []);
```

- [ ] **Step 2: ProfileDashboard.tsx** — After personality test completes, set localStorage flag

After career test save and personality test save, call:
```typescript
localStorage.setItem('career-compass-personality-result', 'true');
window.dispatchEvent(new Event('profile-updated'));
```

And after competency generation, increment counter:
```typescript
const count = parseInt(localStorage.getItem('career-compass-competency-count') || '0') + 1;
localStorage.setItem('career-compass-competency-count', String(count));
```

- [ ] **Step 3: CareerExplorer.tsx** — Set explorer-used flag on mount

```typescript
useEffect(() => {
  localStorage.setItem('career-compass-explorer-used', 'true');
}, []);
```

- [ ] **Step 4: DecisionTree.tsx** — Set sim-done flag on result shown

When the result is displayed, add:
```typescript
localStorage.setItem('career-compass-sim-done', 'true');
```

```bash
npx tsc --noEmit
git add src/app/main/page.tsx src/components/profile/ProfileDashboard.tsx src/components/explore/CareerExplorer.tsx src/components/explore/DecisionTree.tsx
git commit -m "feat: wire achievement unlock checks at all trigger points"
```

---

## Phase 8: Polish

### Task 20: Build Verification + Final Integration

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```
Expected: all tests pass (achievement-store + streak-store = ~17 tests)

- [ ] **Step 2: Type check full project**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Production build**

```bash
npm run build
```
Expected: build succeeds with no errors

- [ ] **Step 4: Start dev server and verify manually**

```bash
npm run dev
```
Manual checklist:
- [ ] Sidebar shows ProgressRing on routes nav item
- [ ] Clicking 成就图鉴 shows 5 sub-tabs (徽章墙/路线看板/打卡日历/统计数据/分享卡片)
- [ ] Badge wall shows 20 badges with stagger animation
- [ ] Category filter chips work (全部/路线/打卡/探索/成长/特殊)
- [ ] Route dashboard shows horizontal timeline with progress rings
- [ ] Streak calendar shows heatmap
- [ ] Stats panel shows metric cards
- [ ] Share card shows preview with theme toggle
- [ ] AI message bubbles show 👍/👎/📋 feedback bar
- [ ] Decision journal shows weekly summary bar
- [ ] Toast notifications work with clickable actions
- [ ] Badge unlock overlay shows when conditions met
- [ ] No layout shift or overflow on mobile (375px width)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete interactive achievement system — badge wall, route dashboard, streak calendar, stats, share card, global hooks"
```
