import { describe, it, expect, beforeEach } from 'vitest';
import {
  addDecision,
  addSnapshot,
  deleteDecision,
  getDecisions,
  reopenDecision,
  settleDecision,
  type DecisionOption,
} from '@/lib/decision-store';

const STORAGE_KEY = 'career-compass-decisions';

function createLocalStorageStub(): Storage {
  const store = new Map<string, string>();
  const stub = {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  };
  return stub as Storage;
}

const sampleOptions: DecisionOption[] = [
  { label: '考研', pros: '够到学历门槛更高的岗位', cons: '两三年时间成本' },
  { label: '就业', pros: '更早积累经验和收入', cons: '起点学历受限' },
];

beforeEach(() => {
  globalThis.localStorage = createLocalStorageStub();
});

describe('addDecision / getDecisions', () => {
  it('roundtrips a new decision through localStorage', () => {
    const created = addDecision('毕业后考研还是就业？', sampleOptions);

    const decisions = getDecisions();
    expect(decisions).toHaveLength(1);

    const stored = decisions[0];
    expect(stored.id).toBe(created.id);
    expect(stored.question).toBe('毕业后考研还是就业？');
    expect(stored.options).toEqual(sampleOptions);
    expect(stored.status).toBe('open');
    expect(stored.snapshots).toEqual([]);
    expect(stored.createdAt).toBe(created.createdAt);
    expect(stored.updatedAt).toBe(created.updatedAt);
  });

  it('returns an empty array when nothing is stored', () => {
    expect(getDecisions()).toEqual([]);
  });

  it('lists the newest decision first', () => {
    addDecision('第一个纠结', sampleOptions);
    addDecision('第二个纠结', sampleOptions);

    const decisions = getDecisions();
    expect(decisions).toHaveLength(2);
    expect(decisions[0].question).toBe('第二个纠结');
    expect(decisions[1].question).toBe('第一个纠结');
  });
});

describe('addSnapshot', () => {
  it('appends snapshots in order with the newest last', () => {
    const created = addDecision('实习去大厂还是小团队？', sampleOptions);

    addSnapshot(created.id, { leaning: '考研', confidence: 40, reasoning: '第一次的想法', missingInfo: '目标院校分数线' });
    addSnapshot(created.id, { leaning: '就业', confidence: 65, reasoning: '第二次的想法', missingInfo: '目标岗位真实薪资' });

    const stored = getDecisions()[0];
    expect(stored.snapshots).toHaveLength(2);
    expect(stored.snapshots[0].reasoning).toBe('第一次的想法');
    expect(stored.snapshots[1].reasoning).toBe('第二次的想法');
    expect(stored.snapshots[1].leaning).toBe('就业');
    expect(stored.snapshots[0].id).not.toBe(stored.snapshots[1].id);
    expect(stored.snapshots[1].createdAt >= stored.snapshots[0].createdAt).toBe(true);
  });

  it('clamps confidence into the 0-100 range', () => {
    const created = addDecision('要不要转专业？', sampleOptions);

    addSnapshot(created.id, { leaning: '考研', confidence: 150, reasoning: '', missingInfo: '' });
    addSnapshot(created.id, { leaning: '就业', confidence: -20, reasoning: '', missingInfo: '' });

    const stored = getDecisions()[0];
    expect(stored.snapshots[0].confidence).toBe(100);
    expect(stored.snapshots[1].confidence).toBe(0);
  });

  it('leaves other decisions untouched when the id is unknown', () => {
    const created = addDecision('未知 id 操作', sampleOptions);

    addSnapshot('missing-id', { leaning: '考研', confidence: 50, reasoning: '不应写入', missingInfo: '' });

    const decisions = getDecisions();
    expect(decisions).toHaveLength(1);
    expect(decisions[0].id).toBe(created.id);
    expect(decisions[0].snapshots).toHaveLength(0);
  });
});

describe('settleDecision / reopenDecision', () => {
  it('settles with the chosen option and reopens back to open', () => {
    const created = addDecision('毕业后考研还是就业？', sampleOptions);

    settleDecision(created.id, '考研');
    const settled = getDecisions()[0];
    expect(settled.status).toBe('settled');
    expect(settled.settledChoice).toBe('考研');

    reopenDecision(created.id);
    const reopened = getDecisions()[0];
    expect(reopened.status).toBe('open');
    expect(reopened.settledChoice).toBeUndefined();
  });

  it('keeps snapshots intact across settle and reopen', () => {
    const created = addDecision('保留快照？', sampleOptions);
    addSnapshot(created.id, { leaning: '考研', confidence: 70, reasoning: '想法', missingInfo: '' });

    settleDecision(created.id, '考研');
    reopenDecision(created.id);

    expect(getDecisions()[0].snapshots).toHaveLength(1);
  });
});

describe('corrupt data recovery', () => {
  it('recovers from non-array JSON by clearing the key', () => {
    localStorage.setItem(STORAGE_KEY, '{}');

    expect(getDecisions()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns an empty array for invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{');

    expect(getDecisions()).toEqual([]);
  });

  it('filters out malformed entries but keeps valid ones', () => {
    const valid = {
      id: 'ok-1',
      question: '有效条目',
      options: [],
      snapshots: [],
      status: 'open',
      createdAt: '2026-07-18T00:00:00.000Z',
      updatedAt: '2026-07-18T00:00:00.000Z',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([null, 42, 'text', { id: 'broken' }, valid]));

    const decisions = getDecisions();
    expect(decisions).toHaveLength(1);
    expect(decisions[0].id).toBe('ok-1');
  });
});

describe('deleteDecision', () => {
  it('removes only the target decision', () => {
    const first = addDecision('第一个纠结', sampleOptions);
    const second = addDecision('第二个纠结', sampleOptions);

    deleteDecision(first.id);

    const decisions = getDecisions();
    expect(decisions).toHaveLength(1);
    expect(decisions[0].id).toBe(second.id);
  });

  it('does nothing for an unknown id', () => {
    addDecision('保留我', sampleOptions);

    deleteDecision('missing-id');

    expect(getDecisions()).toHaveLength(1);
  });
});
