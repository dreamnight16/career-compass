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
      const d = new Date(2026, 6, 18);
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

    it('heals corrupted storage and records today', () => {
      store.set('career-compass-streak', JSON.stringify({ not: 'an array' }));
      recordVisit();
      const history = getStreakHistory();
      expect(history).toContain(formatDateKey(new Date()));
      expect(getStreak()).toBe(1);
    });

    it('filters non-string entries when recording', () => {
      store.set('career-compass-streak', JSON.stringify([123, null, formatDateKey(new Date(Date.now() - 86400000))]));
      recordVisit();
      const history = getStreakHistory();
      expect(history.every(d => typeof d === 'string')).toBe(true);
      expect(getStreak()).toBe(2); // yesterday + today
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
