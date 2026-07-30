// src/lib/streak-store.ts
/** 连续访问天数追踪 — localStorage */

const STORAGE_KEY = 'career-compass-streak';

function guard(): boolean {
  return typeof localStorage !== 'undefined';
}

export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`; // 本地时区 YYYY-MM-DD
}

/**
 * 记录一次当日访问。幂等 — 同一天多次调用只记一次。
 */
export function recordVisit(): void {
  if (!guard()) return;
  const today = formatDateKey(new Date());
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const valid = Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === 'string') : [];
    if (valid.includes(today)) return;
    // 保留过去 365 天
    const cutoff = formatDateKey(new Date(Date.now() - 365 * 86400000));
    const next = [...valid, today].filter(d => d >= cutoff).sort();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // JSON 解析失败 → 重置为仅今天
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([today])); } catch { /* ignore */ }
  }
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

    const valid = dates.filter((d): d is string => typeof d === 'string');
    const sorted = [...valid].sort().reverse(); // 最新在前
    const today = formatDateKey(new Date());
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));

    // 今天或昨天必须有记录，否则连续中断
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 1;
    const [y, m, day] = sorted[0].split('-').map(Number);
    const startDate = new Date(y, m - 1, day);
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
    const valid = dates.filter((d): d is string => typeof d === 'string');
    const cutoff = formatDateKey(new Date(Date.now() - 180 * 86400000));
    return valid.filter(d => d >= cutoff).sort();
  } catch {
    return [];
  }
}
