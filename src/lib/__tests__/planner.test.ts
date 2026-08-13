import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/ai-client', () => ({
  chat: vi.fn(),
}));

vi.mock('@/lib/web-search', () => ({
  searchWeb: vi.fn(),
}));

vi.mock('@/data/knowledge', () => ({
  searchAtoms: vi.fn(),
}));

import { generateRoutes, buildPlanQuery } from '@/lib/planner';
import { chat } from '@/lib/ai-client';
import { searchWeb } from '@/lib/web-search';
import { searchAtoms } from '@/data/knowledge';

const mockChat = vi.mocked(chat);
const mockSearchWeb = vi.mocked(searchWeb);
const mockSearchAtoms = vi.mocked(searchAtoms);

beforeEach(() => {
  mockChat.mockReset();
  mockSearchWeb.mockReset();
  mockSearchAtoms.mockReset();
  mockSearchWeb.mockResolvedValue([]);
  mockSearchAtoms.mockResolvedValue([]);
});

describe('buildPlanQuery', () => {
  it('builds a human-readable query from profile fields', () => {
    const q = buildPlanQuery({
      major: '计算机科学与技术',
      grade: '大三',
      universityTier: '985',
      targetCity: '上海',
      householdBudget: 300000,
    });

    expect(q).toContain('专业：计算机科学与技术');
    expect(q).toContain('年级：大三');
    expect(q).toContain('预算：30万');
  });
});

describe('generateRoutes JSON parsing/validation', () => {
  it('parses valid planner JSON into routes with ordered node statuses', async () => {
    mockChat.mockResolvedValue({
      text: JSON.stringify({
        routes: [
          {
            title: '路线A',
            overview: '概述',
            fit: '适合人群',
            requirements: ['门槛'],
            cost: '1000元',
            salary: '10k',
            tags: ['标签'],
            nodes: [
              { label: '最终目标', detail: '达成条件' },
              { label: '步骤1', detail: '做什么' },
              { label: '当前起点', detail: '现状' },
            ],
          },
        ],
      }),
    });

    const routes = await generateRoutes({ major: '计算机科学与技术' });

    expect(routes).toHaveLength(1);
    expect(routes[0].title).toBe('路线A');
    expect(routes[0].nodes).toHaveLength(3);
    expect(routes[0].nodes[0].status).toBe('goal');
    expect(routes[0].nodes[1].status).toBe('locked');
    expect(routes[0].nodes[2].status).toBe('active');
  });

  it('throws when the AI returns no JSON object', async () => {
    mockChat.mockResolvedValue({ text: '这不是JSON' });

    await expect(generateRoutes({})).rejects.toThrow(/Planner returned invalid JSON/);
  });

  it('throws when the JSON has no routes array', async () => {
    mockChat.mockResolvedValue({ text: JSON.stringify({ foo: 'bar' }) });

    await expect(generateRoutes({})).rejects.toThrow(/no routes array/);
  });
});
