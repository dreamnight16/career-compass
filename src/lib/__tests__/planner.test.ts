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

  it('joins interests and lifestyle with 、', () => {
    const q = buildPlanQuery({
      interests: ['游戏', '编程'],
      lifestyle: ['稳定优先', '追求高薪'],
    });

    expect(q).toContain('兴趣：游戏、编程');
    expect(q).toContain('偏好：稳定优先、追求高薪');
  });

  it('omits budget when it is zero', () => {
    expect(buildPlanQuery({ householdBudget: 0 })).not.toContain('预算');
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

  it('throws when the AI returns JSON-like but unparseable text', async () => {
    mockChat.mockResolvedValue({ text: '{ 这不是合法 JSON }' });

    await expect(generateRoutes({})).rejects.toThrow(/unparseable JSON/);
  });

  it('applies default values when route fields are missing', async () => {
    mockChat.mockResolvedValue({ text: JSON.stringify({ routes: [{ title: '只有标题' }] }) });

    const routes = await generateRoutes({});

    expect(routes).toHaveLength(1);
    expect(routes[0].title).toBe('只有标题');
    expect(routes[0].cost).toBe('暂无数据');
    expect(routes[0].salary).toBe('暂无可靠数据');
    expect(routes[0].requirements).toEqual([]);
    expect(routes[0].tags).toEqual([]);
    expect(routes[0].nodes).toEqual([]);
    expect(routes[0].id).toMatch(/^route-\d+-0$/);
  });

  it('marks the only node as goal when a route has a single node', async () => {
    mockChat.mockResolvedValue({ text: JSON.stringify({ routes: [{ nodes: [{ label: '起点', detail: '现状' }] }] }) });

    const routes = await generateRoutes({});

    expect(routes[0].nodes).toHaveLength(1);
    expect(routes[0].nodes[0].status).toBe('goal');
  });
});
