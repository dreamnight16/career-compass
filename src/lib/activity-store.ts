export interface ActivityEntry {
  id: string;
  type: 'chat' | 'competency' | 'profile_update' | 'resource_save' | 'first_visit';
  title: string;
  detail?: string;
  timestamp: string;
}

const STORAGE_KEY = 'career-compass-activity';

function guard(): boolean {
  return typeof localStorage !== 'undefined';
}

export function getActivities(): ActivityEntry[] {
  if (!guard()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) { localStorage.removeItem(STORAGE_KEY); return []; }
    return parsed.filter((a: unknown) =>
      a && typeof a === 'object' && typeof (a as Record<string, unknown>).id === 'string' && typeof (a as Record<string, unknown>).type === 'string'
    ) as ActivityEntry[];
  } catch {
    return [];
  }
}

export function addActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
  if (!guard()) return;
  const activities = getActivities();
  const newEntry: ActivityEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  activities.unshift(newEntry);
  // 保留最近 50 条
  while (activities.length > 50) activities.pop();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch { /* ignore */ }
}

export function getStats() {
  const activities = getActivities();
  return {
    totalConversations: activities.filter((a) => a.type === 'chat').length,
    competencyAssessments: activities.filter((a) => a.type === 'competency').length,
    resourceSaves: activities.filter((a) => a.type === 'resource_save').length,
    firstVisit: activities.find((a) => a.type === 'first_visit')?.timestamp,
  };
}
