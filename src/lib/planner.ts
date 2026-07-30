/**
 * 路线生成器 — 基于用户画像 + 搜索数据 + 知识库，生成路线。
 * 所有数字必须来自真实数据，禁止编造。
 */

import type { UserProfile, ChatSource } from '@/types';
import { chat } from './ai-client';
import { searchWeb } from './web-search';
import { searchAtoms } from '@/data/knowledge';

export interface RouteNode {
  id: string;
  label: string;
  status: 'locked' | 'active' | 'done' | 'goal';
  detail: string;
}

export interface Route {
  id: string;
  title: string;
  overview: string;
  fit: string;
  requirements: string[];
  cost: string;
  salary: string;
  tags: string[];
  nodes: RouteNode[];
  sources: ChatSource[];
  generatedAt: string;
}

const PLAN_PROMPT = `<role>你是歧点的路线规划引擎。基于用户画像和真实数据，生成JSON格式的职业生涯路线。</role>

<rules>
1. 只生成2条路线。每条路线必须有明确的里程碑节点（4-6个）。
2. **所有薪资、成本数字必须来自下方注入的「真实数据」或「搜索结果」——你自己绝对不能编造任何数字。**
3. 如果数据中没有某条路线的具体薪资，写"暂无可靠数据"，不要猜。
4. 节点从下到上是先后顺序：起点在最下 → 中间步骤 → 最终目标在最上。
5. 整个输出必须是纯JSON。不要markdown代码块标记，不要任何其他文字。
</rules>

<output_format>
{
  "routes": [{
    "title": "路线名称",
    "overview": "一句话概述（不包含数字）",
    "fit": "适合什么样的人",
    "requirements": ["门槛条件1", "门槛条件2"],
    "cost": "时间/金钱代价（仅使用真实数据）",
    "salary": "薪资范围（仅使用真实数据，标注来源）",
    "tags": ["标签1", "标签2"],
    "nodes": [
      {"label":"最终目标","detail":"达成条件"},
      {"label":"步骤3","detail":"具体做什么"},
      {"label":"步骤2","detail":"具体做什么"},
      {"label":"步骤1","detail":"具体做什么"},
      {"label":"当前起点","detail":"你的现状"}
    ]
  }]
}
</output_format>`;

export function buildPlanQuery(profile: Partial<UserProfile>): string {
  const parts: string[] = [];
  if (profile.major) parts.push(`专业：${profile.major}`);
  if (profile.grade) parts.push(`年级：${profile.grade}`);
  if (profile.universityTier) parts.push(`学校：${profile.universityTier}`);
  if (profile.targetCity) parts.push(`目标城市：${profile.targetCity}`);
  if (profile.householdBudget && profile.householdBudget > 0) parts.push(`预算：${Math.round(profile.householdBudget / 10000)}万`);
  if (profile.interests?.length) parts.push(`兴趣：${profile.interests.join('、')}`);
  if (profile.lifestyle?.length) parts.push(`偏好：${profile.lifestyle.join('、')}`);
  return parts.join('，');
}

export async function generateRoutes(profile: Partial<UserProfile>): Promise<Route[]> {
  const profileText = buildPlanQuery(profile);
  const query = `${profile.major || ''}职业方向 发展路径 薪资要求`.trim();

  // 1. 搜索
  const webResults = await searchWeb(query);
  const searchText = webResults.slice(0, 5).map(r =>
    `- ${r.title}: ${r.snippet}（来源：${r.url}）`
  ).join('\n');

  // 2. 本地知识库
  const atoms = await Promise.all([
    searchAtoms('薪资', ['salary'], 3),
    profile.major ? searchAtoms(profile.major, [], 3) : Promise.resolve([]),
    profile.targetCity ? searchAtoms(profile.targetCity, ['cost'], 2) : Promise.resolve([]),
  ]);
  const allAtoms = [...new Set(atoms.flat())];
  const atomText = allAtoms.map(a =>
    `- [${a.trustLevel === 'official' ? '官方' : '参考'}] ${a.title}: ${a.content}${a.data ? ' 数据:' + JSON.stringify(a.data) : ''}`
  ).join('\n');

  const result = await chat({
    systemPrompt: PLAN_PROMPT,
    maxTokens: 2048,
    temperature: 0.2,
    messages: [{
      role: 'user',
      content: `## 用户画像\n${profileText}\n\n## 真实数据（必须引用）\n${searchText}\n\n${atomText}\n\n请生成2条路线。不要编造任何数字。没有可靠数据就说"暂无可靠数据"。`,
    }],
  });

  const text = result.text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Planner returned invalid JSON: ' + text.slice(0, 200));

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Planner returned unparseable JSON: ' + text.slice(0, 200));
  }

  const routesList = data.routes;
  if (!routesList || !Array.isArray(routesList)) {
    throw new Error('Planner returned no routes array');
  }

  const routes: Route[] = routesList.map((r: unknown, i: number) => {
    const o = r && typeof r === 'object' ? (r as Record<string, unknown>) : {};
    const nodesRaw = o.nodes;
    const nodes: RouteNode[] = Array.isArray(nodesRaw) && nodesRaw.length > 0
      ? (nodesRaw as Record<string, unknown>[]).map((n: Record<string, unknown>, j: number) => ({
          id: `node-${Date.now()}-${i}-${j}`,
          label: String(n.label || ''),
          status: (
            j === 0 ? 'goal' :
            j === (nodesRaw as unknown[]).length - 1 ? 'active' :
            'locked'
          ) as RouteNode['status'],
          detail: String(n.detail || ''),
        }))
      : [];

    // 去重 web 结果作为 sources
    const seen = new Set<string>();
    const sources: ChatSource[] = [];
    for (const w of webResults) {
      if (!seen.has(w.url)) {
        seen.add(w.url);
        sources.push({ title: w.title, url: w.url, snippet: w.snippet });
      }
    }

    return {
      id: `route-${Date.now()}-${i}`,
      title: String(o.title || ''),
      overview: String(o.overview || ''),
      fit: String(o.fit || ''),
      requirements: Array.isArray(o.requirements) ? o.requirements.map(String) : [],
      cost: String(o.cost || '暂无数据'),
      salary: String(o.salary || '暂无可靠数据'),
      tags: Array.isArray(o.tags) ? o.tags.map(String) : [],
      nodes,
      sources,
      generatedAt: new Date().toISOString(),
    };
  });

  return routes;
}
