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

const STORAGE_KEY = 'mingdao-achievements';

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
    check: (ctx) => ctx.routes.some(r => (r as unknown as Record<string, unknown>).status === 'completed'),
  },
  {
    id: 'dual-routes', title: '双线并进', icon: '🛤', category: 'route',
    description: '同时保持 2 条路线活跃', condition: '2 条活跃路线',
    check: (ctx) => ctx.routes.filter(r => (r as unknown as Record<string, unknown>).status === 'active').length >= 2,
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
      d => (d as unknown as Record<string, unknown>).status === 'settled'
    ).length >= 5,
    progress: (ctx) => ({
      current: Math.min(
        ctx.decisions.filter(d => (d as unknown as Record<string, unknown>).status === 'settled').length,
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
    id: 'mingdao-master', title: '歧点大师', icon: '💎', category: 'special',
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
