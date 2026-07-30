export interface DecisionOption {
  label: string;
  pros: string;
  cons: string;
}

export interface DecisionSnapshot {
  id: string;
  leaning: string;          // 当前倾向（选项 label 或自由文本）
  confidence: number;       // 0-100 信心度
  reasoning: string;        // 我此刻的想法
  missingInfo: string;      // 还缺什么信息
  createdAt: string;        // ISO
}

export interface DecisionEntry {
  id: string;
  question: string;         // 纠结的问题
  options: DecisionOption[];
  snapshots: DecisionSnapshot[];  // 想法演变时间线，最新的在最后
  status: 'open' | 'settled';
  settledChoice?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'career-compass-decisions';
const MIN_CONFIDENCE = 0;
const MAX_CONFIDENCE = 100;

function guard(): boolean {
  return typeof localStorage !== 'undefined';
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return MIN_CONFIDENCE;
  return Math.min(MAX_CONFIDENCE, Math.max(MIN_CONFIDENCE, value));
}

function isValidEntry(entry: unknown): boolean {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.question === 'string' &&
    Array.isArray(e.options) &&
    Array.isArray(e.snapshots) &&
    (e.status === 'open' || e.status === 'settled')
  );
}

export function getDecisions(): DecisionEntry[] {
  if (!guard()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) { localStorage.removeItem(STORAGE_KEY); return []; }
    return parsed.filter(isValidEntry) as DecisionEntry[];
  } catch {
    return [];
  }
}

function saveDecisions(decisions: DecisionEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
  } catch { /* ignore */ }
}

export function addDecision(question: string, options: DecisionOption[]): DecisionEntry {
  const now = new Date().toISOString();
  const entry: DecisionEntry = {
    id: makeId(),
    question,
    options: options.map((o) => ({ ...o })),
    snapshots: [],
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };
  if (!guard()) return entry;
  // 最新的决策放在最前
  saveDecisions([entry, ...getDecisions()]);
  return entry;
}

export function addSnapshot(decisionId: string, snapshot: Omit<DecisionSnapshot, 'id' | 'createdAt'>): void {
  if (!guard()) return;
  const now = new Date().toISOString();
  const newSnapshot: DecisionSnapshot = {
    ...snapshot,
    confidence: clampConfidence(snapshot.confidence),
    id: makeId(),
    createdAt: now,
  };
  saveDecisions(
    getDecisions().map((d) =>
      d.id === decisionId
        ? { ...d, snapshots: [...d.snapshots, newSnapshot], updatedAt: now }
        : d
    )
  );
}

export function settleDecision(decisionId: string, choice: string): void {
  if (!guard()) return;
  const now = new Date().toISOString();
  saveDecisions(
    getDecisions().map((d) =>
      d.id === decisionId
        ? { ...d, status: 'settled' as const, settledChoice: choice, updatedAt: now }
        : d
    )
  );
}

export function reopenDecision(decisionId: string): void {
  if (!guard()) return;
  const now = new Date().toISOString();
  saveDecisions(
    getDecisions().map((d) => {
      if (d.id !== decisionId) return d;
      const { settledChoice: _omitted, ...rest } = d;
      return { ...rest, status: 'open' as const, updatedAt: now };
    })
  );
}

export function deleteDecision(decisionId: string): void {
  if (!guard()) return;
  saveDecisions(getDecisions().filter((d) => d.id !== decisionId));
}
