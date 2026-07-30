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
