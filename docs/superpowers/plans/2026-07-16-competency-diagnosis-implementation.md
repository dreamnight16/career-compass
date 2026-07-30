# 能力诊断功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为歧点增加能力差距诊断 + 精准资源匹配功能，让学生知道离目标职业差多远、具体提升什么能力、去哪学。

**Architecture:** 增量叠加 — 不改现有 RAG/对话系统主体，在之上新增能力生成 API、前端能力卡片组件、资源匹配器三个独立模块。AI prompt 驱动能力画像生成，前端本地状态管理，标签匹配连接能力到学习资源。

**Tech Stack:** Next.js 14 App Router, TypeScript strict, shadcn/ui, Tailwind CSS, Claude API (Anthropic SDK), 无新增依赖

**Spec:** `docs/superpowers/specs/2026-07-16-competency-diagnosis-design.md`

## Global Constraints

- 不建教学平台、不建社区、不加后端数据库
- H-I-P 原则：AI 教决策不替决策，能力卡片展示差距而不推荐特定路径
- 前端本地存储用户状态（localStorage），无服务端持久化
- 不改动现有 RAG 检索和对话系统的主体逻辑
- 所有 AI 生成内容标注 `ai-inferred` 信任级别
- 能力数据模型对齐 Bloom 5 级 + 中国大学生就业能力 6 维模型
- 文件不超过 800 行，函数不超过 50 行
- 不可变数据模式

---

## File Structure

```
新建（4 个核心模块）:
  src/types/competency.ts                    # 能力相关类型定义
  src/lib/competency-generator.ts            # AI 能力画像生成 + System Prompt
  src/components/chat/CompetencyCard.tsx     # 能力画像卡片（全局视图）
  src/components/chat/GapPanel.tsx           # 差距详情面板（深度视图）
  src/app/api/competency/route.ts            # POST /api/competency 端点

修改（渐进集成）:
  src/types/index.ts                         # +AtomCategory 'competency', +UserProfile 扩展
  src/lib/rag.ts                             # buildSystemPrompt 注入能力上下文
  src/lib/profile-extractor.ts               # +能力信号提取规则
  src/components/chat/ChatInterface.tsx      # 集成 CompetencyCard + GapPanel
  src/data/resources.ts                      # 渐进添加能力标签
```

---

### Task 1: 能力类型定义 (`src/types/competency.ts`)

**Files:**
- Create: `src/types/competency.ts`

**Interfaces:**
- Produces: `CompetencyLayer`, `CompetencyType`, `ProficiencyLevel`, `Competency`, `StudentCompetencyProfile`, `CompetencyGap`, `CompetencyGapAnalysis`, `TrainingMatch`, `SelfAssessment`, `InferredSignal`, `OccupationCompetencyProfile`

- [ ] **Step 1: 创建 `src/types/competency.ts`**

```typescript
/** 能力冰山分层 — 对齐 McClelland/Spencer 冰山模型 */
export type CompetencyLayer =
  | 'skill'          // 可执行的技能（Bloom 应用层以上）
  | 'knowledge'      // 理论知识（Bloom 记忆+理解层）
  | 'cert'           // 可验证的证书/资质
  | 'self_concept'   // 自我认知、职业认同、价值观
  | 'trait'          // 责任心、抗压力、适应性
  | 'motive';        // 成就动机、亲和动机

/** 6 维能力分类 — 对齐中国大学生就业能力研究（鲍威&万义辉 2025 等） */
export type CompetencyType =
  | 'professional'   // 专业素养
  | 'transferable'   // 可迁移能力
  | 'digital'        // 数智素养
  | 'career_dev'     // 职业发展能力
  | 'emotional'      // 情绪管理
  | 'self_efficacy'; // 自我效能

/** 5 级能力水平 — 对齐 Bloom 认知分类学 + 中国国家职业技能等级 */
export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

/** 5 级标尺的行为描述 */
export const PROFICIENCY_LABELS: Record<ProficiencyLevel, { label: string; desc: string }> = {
  1: { label: '了解',     desc: '知道概念，没做过' },
  2: { label: '辅助完成', desc: '有人指导能完成' },
  3: { label: '独立完成', desc: '能自主交付' },
  4: { label: '分析优化', desc: '能拆解、对比、改进' },
  5: { label: '创新引领', desc: '能设计新方案、指导他人' },
};

/** 差距优先级 — 对齐技能差距分析业界标准 */
export type GapPriority = 'blocker' | 'critical' | 'important' | 'nice_to_have';

export const GAP_PRIORITY_LABELS: Record<GapPriority, string> = {
  blocker:     '🔴 硬门槛 — 不掌握无法入行',
  critical:    '🟠 核心能力 — 影响核心竞争力',
  important:   '🟡 重要 — 提升竞争力但非必须',
  nice_to_have:'🟢 锦上添花',
};

/** 单条能力条目 */
export interface Competency {
  id: string;
  name: string;                        // "法律检索与文书写作"
  layer: CompetencyLayer;
  type: CompetencyType;
  proficiencyLevels: Record<ProficiencyLevel, string>;  // 每级行为锚定描述
  relatedOccupations: string[];
  weightInOccupation: number;          // 0-1
  importanceRationale: string;
}

/** 职业能力画像 — AI 为某个目标职业生成的全套能力集合 */
export interface OccupationCompetencyProfile {
  occupation: string;                  // "律师（诉讼方向）"
  competencies: Competency[];
  generatedBy: 'ai' | 'community';
  trustLevel: 'ai-inferred' | 'community-unreviewed';
  generatedAt: string;
}

/** 学生自评某一条能力 */
export interface SelfAssessment {
  competencyId: string;
  currentLevel: ProficiencyLevel;
  evidence: string;
  lastUpdated: string;
}

/** AI 从对话中推断的能力信号 */
export interface InferredSignal {
  competencyId: string;
  inferredLevel: ProficiencyLevel;
  confidence: number;                  // 0-1
  source: string;                      // 推断依据
}

/** 学生能力画像 */
export interface StudentCompetencyProfile {
  targetCareer?: string;
  selfAssessments: SelfAssessment[];
  inferredSignals: InferredSignal[];
}

/** 单条差距 */
export interface CompetencyGap {
  competency: Competency;
  currentLevel: ProficiencyLevel;
  targetLevel: ProficiencyLevel;
  gap: number;                         // targetLevel - currentLevel
  priority: GapPriority;
}

/** 差距分析完整结果 */
export interface CompetencyGapAnalysis {
  targetOccupation: string;
  gaps: CompetencyGap[];
  generatedAt: string;
}
```

- [ ] **Step 2: 验证类型文件无语法错误**

```bash
npx tsc --noEmit --pretty false src/types/competency.ts
```

- [ ] **Step 3: 提交**

```bash
git add src/types/competency.ts
git commit -m "feat: add competency data model types with iceberg model + Bloom 5-level scale"
```

---

### Task 2: 扩展现有类型定义

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: `CompetencyLayer`, `CompetencyType`, `ProficiencyLevel` from `src/types/competency.ts`
- Produces: `AtomCategory` 新增 `'competency'`; `UserProfile` 新增 `currentCompetencies`, `targetCareer` 字段

- [ ] **Step 1: 修改 `src/types/index.ts`**

在 `AtomCategory` 中新增 `'competency'`，在 `UserProfile` 中新增能力相关可选字段。

```typescript
// 修改 AtomCategory（第 3-10 行，在 'life' 后加 'competency'）
export type AtomCategory =
  | 'salary'
  | 'education'
  | 'employment'
  | 'trend'
  | 'policy'
  | 'cost'
  | 'life'
  | 'competency';

// 修改 UserProfile（第 25-34 行，追加字段）
export interface UserProfile {
  grade: string;
  major: string;
  universityTier: string;
  targetCity: string;
  householdBudget: number;
  interests: string[];
  lifestyle: string[];
  redLines: string[];
  /** 学生关注的目标职业 */
  targetCareer?: string;
  /** 当前能力自评列表 */
  currentCompetencies?: {
    name: string;
    selfAssessedLevel: number;  // 1-5
  }[];
}
```

具体修改：
- 第 10 行 `'life'` 后加 `| 'competency'`
- 第 33 行 `redLines: string[]` 后加 `targetCareer?: string`
- 第 34 行后加 `currentCompetencies` 字段

- [ ] **Step 2: 验证类型检查通过**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 3: 提交**

```bash
git add src/types/index.ts
git commit -m "feat: extend types with competency AtomCategory and profile fields"
```

---

### Task 3: 能力画像生成 API

**Files:**
- Create: `src/lib/competency-generator.ts`
- Create: `src/app/api/competency/route.ts`

**Interfaces:**
- Consumes: `Competency`, `OccupationCompetencyProfile` from `src/types/competency.ts`
- Produces: `generateCompetencyProfile(occupation: string): Promise<OccupationCompetencyProfile>`, `POST /api/competency`

- [ ] **Step 1: 创建 `src/lib/competency-generator.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { OccupationCompetencyProfile, Competency } from '@/types/competency';

const SYSTEM_PROMPT = `你是一位职业能力分析师。你的任务是为给定的目标职业生成一份结构化的能力画像。

## 输出要求

输出一个 JSON 对象，格式如下：
{
  "occupation": "目标职业名称",
  "competencies": [
    {
      "id": "职业名-能力名（英文slug）",
      "name": "中文能力名",
      "layer": "skill|knowledge|cert|self_concept|trait|motive",
      "type": "professional|transferable|digital|career_dev|emotional|self_efficacy",
      "proficiencyLevels": {
        "1": "Level 1 的行为描述：了解阶段——知道概念但没做过什么",
        "2": "Level 2 的行为描述：辅助阶段——在他人指导下能完成",
        "3": "Level 3 的行为描述：独立阶段——能自主完成交付",
        "4": "Level 4 的行为描述：分析阶段——能拆解、对比、改进",
        "5": "Level 5 的行为描述：创新阶段——能设计新方案、指导他人"
      },
      "relatedOccupations": ["相近职业1", "相近职业2"],
      "weightInOccupation": 0.85,
      "importanceRationale": "这项能力为什么对这个职业重要（一句话）"
    }
  ]
}

## 规则

1. 生成 12-20 条能力，覆盖冰山各层和水上水下两部分。不要遗漏软能力（抗压力、沟通、职业认同等）和门槛证书。
2. layer 分类：skill=可执行的技术技能, knowledge=需要掌握的理论知识, cert=证书/资质/考试, self_concept=自我认知与职业认同, trait=性格特质, motive=内在动机
3. type 分类：professional=专业素养（本专业核心能力）, transferable=可迁移通用能力（沟通/合作/解决问题）, digital=数智素养（数字工具/AI使用）, career_dev=职业发展能力（求职/规划/人脉）, emotional=情绪管理（抗压/调节）, self_efficacy=自我效能（自信/责任感）
4. 5 级水平描述必须具体到该能力，用该职业的实际工作场景描述，不要泛泛而谈。
5. weightInOccupation 是 0-1 的权重，区分核心能力（0.8+）、支撑能力（0.5-0.8）、辅助能力（0.3-0.5）。
6. relatedOccupations 列出 2-4 个也需此能力的相近职业。
7. 如果该职业有国家法定准入门槛证书（如法律职业资格证、医师资格证、教师资格证），必须作为 layer="cert" 的条目。

只输出 JSON，不要任何解释文字。`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
    client = new Anthropic({ apiKey });
  }
  return client;
}

/** 解析 AI 返回的 JSON，容错处理 */
function parseCompetencyJSON(raw: string): OccupationCompetencyProfile {
  // 尝试直接解析
  try {
    return JSON.parse(raw) as OccupationCompetencyProfile;
  } catch {
    // 尝试提取 ```json ... ``` 块
    const jsonMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as OccupationCompetencyProfile;
    }
    throw new Error(`Failed to parse competency JSON from AI response`);
  }
}

/** 为指定职业生成能力画像 */
export async function generateCompetencyProfile(
  occupation: string
): Promise<OccupationCompetencyProfile> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    temperature: 0.3,  // 低温度确保结构化输出稳定
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `请为「${occupation}」生成职业能力画像。`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('AI returned no text content');
  }

  const profile = parseCompetencyJSON(textBlock.text);

  // 补充元数据
  profile.generatedBy = 'ai';
  profile.trustLevel = 'ai-inferred';
  profile.generatedAt = new Date().toISOString();

  // 校验必填字段
  if (!profile.competencies || profile.competencies.length === 0) {
    throw new Error('AI generated empty competency list');
  }

  return profile;
}

/** 暴露 competency 专用 system prompt，供对话中内联使用 */
export { SYSTEM_PROMPT as COMPETENCY_SYSTEM_PROMPT };
```

- [ ] **Step 2: 创建 `src/app/api/competency/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import type { OccupationCompetencyProfile } from '@/types/competency';
import { generateCompetencyProfile } from '@/lib/competency-generator';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<OccupationCompetencyProfile>>> {
  try {
    const body = await request.json();
    const occupation: string = body.occupation;

    if (!occupation || typeof occupation !== 'string' || occupation.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供目标职业' },
        { status: 400 }
      );
    }

    const profile = await generateCompetencyProfile(occupation.trim());

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 服务暂时不可用';
    console.error('[competency] error:', message);

    return NextResponse.json(
      {
        success: false,
        error: message.includes('ANTHROPIC_API_KEY')
          ? 'AI 服务未配置'
          : '能力画像生成失败，请稍后再试',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: 验证类型检查通过**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 4: 提交**

```bash
git add src/lib/competency-generator.ts src/app/api/competency/route.ts
git commit -m "feat: add competency profile generation API with AI prompt-driven generation"
```

---

### Task 4: 能力画像卡片组件（全局视图）

**Files:**
- Create: `src/components/chat/CompetencyCard.tsx`

**Interfaces:**
- Consumes: `OccupationCompetencyProfile`, `Competency`, `CompetencyGap`, `ProficiencyLevel`, `PROFICIENCY_LABELS`, `GAP_PRIORITY_LABELS` from `src/types/competency.ts`; `StudentCompetencyProfile` from `src/types/competency.ts`
- Produces: `<CompetencyCard>` 组件 — 展示目标职业能力全景 + 自评交互

- [ ] **Step 1: 创建 `src/components/chat/CompetencyCard.tsx`**

```typescript
'use client';
import { useState } from 'react';
import type {
  OccupationCompetencyProfile,
  Competency,
  CompetencyGap,
  CompetencyGapAnalysis,
  ProficiencyLevel,
  GapPriority,
  SelfAssessment,
} from '@/types/competency';
import {
  PROFICIENCY_LABELS,
  GAP_PRIORITY_LABELS,
} from '@/types/competency';

interface CompetencyCardProps {
  profile: OccupationCompetencyProfile;
  selfAssessments: SelfAssessment[];
  onAssess: (competencyId: string, level: ProficiencyLevel, evidence: string) => void;
  onViewResources: (competencyId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const COMPETENCY_TYPE_LABELS: Record<string, string> = {
  professional:  '📐 专业素养',
  transferable:  '🤝 可迁移能力',
  digital:       '💻 数智素养',
  career_dev:    '🧭 职业发展',
  emotional:     '🧘 情绪管理',
  self_efficacy: '🌱 自我效能',
};

/** 根据 gap 值确定优先级 */
function calcPriority(gap: number, weight: number): GapPriority {
  if (gap >= 3 && weight >= 0.8) return 'blocker';
  if (gap >= 2) return 'critical';
  if (gap >= 1) return 'important';
  return 'nice_to_have';
}

/** 计算差距分析结果 */
function computeGapAnalysis(
  profile: OccupationCompetencyProfile,
  assessments: SelfAssessment[]
): CompetencyGapAnalysis {
  const assessMap = new Map(assessments.map((a) => [a.competencyId, a.currentLevel]));
  const gaps: CompetencyGap[] = profile.competencies.map((comp) => {
    const currentLevel = assessMap.get(comp.id) ?? 1;
    const certTarget: ProficiencyLevel = comp.layer === 'cert' ? 5 : 3;
    const gap = certTarget - currentLevel;
    return {
      competency: comp,
      currentLevel: currentLevel as ProficiencyLevel,
      targetLevel: certTarget,
      gap,
      priority: calcPriority(gap, comp.weightInOccupation),
    };
  });
  gaps.sort((a, b) => b.gap - a.gap || b.competency.weightInOccupation - a.competency.weightInOccupation);
  return {
    targetOccupation: profile.occupation,
    gaps,
    generatedAt: new Date().toISOString(),
  };
}

/** 能力条颜色 */
function gapBarColor(gap: CompetencyGap): string {
  if (gap.gap <= 0) return 'bg-emerald-500';
  if (gap.gap === 1) return 'bg-amber-500';
  if (gap.gap === 2) return 'bg-orange-500';
  return 'bg-red-500';
}

function gapLabel(gap: CompetencyGap): string {
  if (gap.gap <= 0) return '✓ 已达标';
  if (gap.gap === 1) return '△ 待加强';
  return '✗ 差距大';
}

export function CompetencyCard({
  profile,
  selfAssessments,
  onAssess,
  onViewResources,
  onRefresh,
  loading,
}: CompetencyCardProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const analysis = computeGapAnalysis(profile, assessments);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">正在生成能力画像...</span>
        </div>
      </div>
    );
  }

  const assessedCount = assessments.length;
  const totalCount = profile.competencies.length;
  const fillPct = totalCount > 0 ? Math.round((assessedCount / totalCount) * 100) : 0;

  // 按 type 分组
  const grouped = new Map<string, CompetencyGap[]>();
  for (const gap of analysis.gaps) {
    const type = gap.competency.type;
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(gap);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* 头部 */}
      <div className="border-b border-border/50 bg-secondary/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span className="text-sm font-semibold">{profile.occupation} 能力画像</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground border border-border">
              {assessedCount}/{totalCount} 已评估
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="rounded p-1 text-muted-foreground hover:text-foreground text-xs"
            aria-label="刷新"
          >
            ↻ 换职业
          </button>
        </div>
        {/* 进度条 */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{fillPct}%</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {profile.trustLevel === 'ai-inferred' ? '🤖 AI 生成 · 仅供参考' : '👥 社区贡献'}
        </p>
      </div>

      {/* 能力列表，按 6 维分组 */}
      <div className="divide-y divide-border/30">
        {Array.from(grouped.entries()).map(([type, gaps]) => (
          <div key={type} className="px-4 py-3">
            <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {COMPETENCY_TYPE_LABELS[type] || type}
            </h4>
            <div className="space-y-2">
              {gaps.map((gap) => (
                <div key={gap.competency.id}>
                  <button
                    onClick={() => setExpanded(expanded === gap.competency.id ? null : gap.competency.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm truncate">{gap.competency.name}</span>
                        {gap.competency.layer === 'cert' && (
                          <span className="shrink-0 rounded bg-red-100 px-1 py-0.5 text-[10px] text-red-700">
                            门槛
                          </span>
                        )}
                      </div>
                      <span className={`shrink-0 ml-2 text-xs ${gap.gap <= 0 ? 'text-emerald-600' : gap.gap === 1 ? 'text-amber-600' : 'text-red-600'}`}>
                        {gapLabel(gap)}
                      </span>
                    </div>
                    {/* 水平对比条 */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${gapBarColor(gap)}`}
                          style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-12 text-right">
                        Lv.{gap.currentLevel} → {gap.targetLevel}
                      </span>
                    </div>
                  </button>

                  {/* 展开详情 */}
                  {expanded === gap.competency.id && (
                    <div className="mt-2 rounded-lg bg-background border border-border/50 p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        💡 {gap.competency.importanceRationale}
                      </p>
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                          当前：{gap.competency.proficiencyLevels[gap.currentLevel]}
                        </p>
                        <p className="text-foreground font-medium">
                          目标：{gap.competency.proficiencyLevels[gap.targetLevel]}
                        </p>
                      </div>
                      {/* 自评选择器 */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground mr-1">我的水平：</span>
                        {([1, 2, 3, 4, 5] as ProficiencyLevel[]).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() =>
                              onAssess(gap.competency.id, lvl, '')
                            }
                            className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                              gap.currentLevel === lvl
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                            }`}
                          >
                            {PROFICIENCY_LABELS[lvl].label}
                          </button>
                        ))}
                      </div>
                      {/* 查看资源按钮 */}
                      <button
                        onClick={() => onViewResources(gap.competency.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        📚 查看推荐学习资源 →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证类型检查通过**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 3: 提交**

```bash
git add src/components/chat/CompetencyCard.tsx
git commit -m "feat: add CompetencyCard component with gap visualization and self-assessment"
```

---

### Task 5: 差距详情面板组件（深度视图）

**Files:**
- Create: `src/components/chat/GapPanel.tsx`

**Interfaces:**
- Consumes: `CompetencyGapAnalysis`, `CompetencyGap`, `Competency`, `GAP_PRIORITY_LABELS` from `src/types/competency.ts`; `ResourceLink` from `src/data/resources.ts`
- Produces: `<GapPanel>` — 差距排序表 + 资源推荐

- [ ] **Step 1: 创建 `src/components/chat/GapPanel.tsx`**

```typescript
'use client';
import type { CompetencyGap, CompetencyGapAnalysis, ProficiencyLevel } from '@/types/competency';
import { PROFICIENCY_LABELS, GAP_PRIORITY_LABELS } from '@/types/competency';
import type { ResourceLink } from '@/data/resources';

interface GapPanelProps {
  analysis: CompetencyGapAnalysis;
  resourceMap: Map<string, ResourceLink[]>;  // competencyId → 匹配的资源
  onSelectGap: (gap: CompetencyGap) => void;
  selectedGapId?: string;
}

function prioritySort(a: CompetencyGap, b: CompetencyGap): number {
  const order = { blocker: 0, critical: 1, important: 2, nice_to_have: 3 };
  return order[a.priority] - order[b.priority] || b.gap - a.gap;
}

export function GapPanel({ analysis, resourceMap, onSelectGap, selectedGapId }: GapPanelProps) {
  const sorted = [...analysis.gaps].sort(prioritySort);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border/50 bg-secondary/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="text-sm font-semibold">能力差距分析</span>
          <span className="text-xs text-muted-foreground">
            ({sorted.filter((g) => g.gap > 0).length} 项需提升)
          </span>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {sorted.map((gap) => {
          const isSelected = selectedGapId === gap.competency.id;
          const resources = resourceMap.get(gap.competency.id) || [];

          return (
            <div key={gap.competency.id}>
              <button
                onClick={() => onSelectGap(gap)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-secondary/30 ${
                  isSelected ? 'bg-secondary/40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{gap.competency.name}</span>
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {PROFICIENCY_LABELS[gap.targetLevel as ProficiencyLevel].label}
                    </span>
                  </div>
                  <span className="shrink-0 ml-2 text-xs text-muted-foreground">
                    {GAP_PRIORITY_LABELS[gap.priority].split(' ')[0]}
                  </span>
                </div>

                {/* 展开资源列表 */}
                {isSelected && (
                  <div className="mt-3 space-y-2">
                    {resources.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">
                          学习路径（建议按顺序）：
                        </p>
                        {resources.slice(0, 5).map((r, i) => (
                          <a
                            key={i}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-md border border-border/50 bg-background px-3 py-2 text-sm hover:border-primary/30 transition-colors"
                          >
                            <span className="text-xs text-muted-foreground">{i + 1}.</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">↗</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        暂无匹配资源，建议在资源库中搜索「{gap.competency.name}」相关关键词
                      </p>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证类型检查通过**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 3: 提交**

```bash
git add src/components/chat/GapPanel.tsx
git commit -m "feat: add GapPanel component with priority-sorted gaps and resource display"
```

---

### Task 6: 资源匹配器

**Files:**
- Create: `src/lib/resource-matcher.ts`

**Interfaces:**
- Consumes: `Competency`, `CompetencyGap` from `src/types/competency.ts`; `ResourceLink`, `ResourceCategory`, `RESOURCE_INDEX` from `src/data/resources.ts`
- Produces: `matchResources(gap: CompetencyGap): ResourceLink[]`, `batchMatch(gaps: CompetencyGap[]): Map<string, ResourceLink[]>`

- [ ] **Step 1: 创建 `src/lib/resource-matcher.ts`**

```typescript
import type { Competency, CompetencyGap } from '@/types/competency';
import type { ResourceLink } from '@/data/resources';
import { RESOURCE_INDEX } from '@/data/resources';

/**
 * 从资源库中为一条能力差距匹配学习资源。
 *
 * 策略（优先级递减）：
 * 1. 精确标签匹配：资源 description 中包含能力名称关键词
 * 2. 分类模糊匹配：能力 type 对应资源库分类（如 'professional' → 对应学科的垂直招聘/学习资源）
 * 3. 通用资源兜底：返回通识学习平台
 */
export function matchResources(gap: CompetencyGap): ResourceLink[] {
  const comp = gap.competency;
  const results: ResourceLink[] = [];
  const seen = new Set<string>();

  // 提取能力名中的关键词
  const keywords = extractKeywords(comp.name);

  // 遍历所有资源分类
  for (const cat of RESOURCE_INDEX) {
    for (const link of cat.links) {
      if (seen.has(link.url)) continue;

      // 名字或描述包含任一关键词即匹配
      const text = (link.name + link.description).toLowerCase();
      const score = keywords.filter((kw) => text.includes(kw.toLowerCase())).length;

      if (score > 0) {
        results.push(link);
        seen.add(link.url);
      }
    }
  }

  return results.slice(0, 10);  // 最多返回 10 个
}

/** 批量匹配，返回 Map */
export function batchMatch(
  gaps: CompetencyGap[]
): Map<string, ResourceLink[]> {
  const map = new Map<string, ResourceLink[]>();
  for (const gap of gaps) {
    map.set(gap.competency.id, matchResources(gap));
  }
  return map;
}

/** 从能力名中提取搜索关键词 */
function extractKeywords(name: string): string[] {
  // 按常见分隔符拆分，并保留原词
  const keywords: string[] = [name];
  const parts = name.split(/[、，,\s/·]+/).filter((p) => p.length >= 2);
  keywords.push(...parts.map((p) => p.replace(/[（）()【】\[\]]/g, '')));
  return [...new Set(keywords)];
}
```

- [ ] **Step 2: 验证类型检查通过**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/resource-matcher.ts
git commit -m "feat: add resource matcher with keyword-based matching to 310+ links"
```

---

### Task 7: ChatInterface 集成

**Files:**
- Modify: `src/components/chat/ChatInterface.tsx`

**Interfaces:**
- Consumes: `CompetencyCard` from `./CompetencyCard`, `GapPanel` from `./GapPanel`, `OccupationCompetencyProfile`, `CompetencyGapAnalysis`, `SelfAssessment`, `StudentCompetencyProfile` from `@/types/competency`, `batchMatch` from `@/lib/resource-matcher`
- Produces: ChatInterface 新增能力诊断入口按钮 + CompetencyCard 展示 + localStorage 持久化

- [ ] **Step 1: 修改 `ChatInterface.tsx`，集成能力诊断功能**

在现有 ChatInterface 中：
1. 新增状态：`competencyProfile`, `studentCompetency`, `showCompetency`, `gapAnalysis`
2. chat 面板上方添加「输入目标职业」入口
3. 点击「生成能力画像」→ 调用 `/api/competency` → 展示 CompetencyCard
4. 自评回调 → 更新 `studentCompetency` → 持久化到 localStorage
5. 聊天界面中展示 CompetencyCard（代替 ProfileCard 的位置）

```typescript
// 在 ChatInterface.tsx 顶部新增 imports
import { CompetencyCard } from './CompetencyCard';
import type {
  OccupationCompetencyProfile,
  StudentCompetencyProfile,
  CompetencyGapAnalysis,
  SelfAssessment,
  ProficiencyLevel,
} from '@/types/competency';
import { batchMatch } from '@/lib/resource-matcher';

// 在 ChatInterface 函数内，现有 state 之后新增：
const [competencyProfile, setCompetencyProfile] = useState<OccupationCompetencyProfile | null>(null);
const [studentCompetency, setStudentCompetency] = useState<StudentCompetencyProfile>({ selfAssessments: [], inferredSignals: [] });
const [showCompetency, setShowCompetency] = useState(false);
const [competencyLoading, setCompetencyLoading] = useState(false);
const [competencyOccupation, setCompetencyOccupation] = useState('');

// localStorage key
const COMPETENCY_STORAGE_KEY = 'career-compass-competency';

// 页面加载时从 localStorage 恢复
useEffect(() => {
  try {
    const saved = localStorage.getItem(COMPETENCY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.studentCompetency) setStudentCompetency(parsed.studentCompetency);
      if (parsed.competencyProfile) setCompetencyProfile(parsed.competencyProfile);
    }
  } catch { /* ignore parse errors */ }
}, []);

// 自评回调
const handleAssess = (competencyId: string, level: ProficiencyLevel, evidence: string) => {
  setStudentCompetency((prev) => {
    const existing = prev.selfAssessments.findIndex((a) => a.competencyId === competencyId);
    const assessment: SelfAssessment = {
      competencyId,
      currentLevel: level,
      evidence,
      lastUpdated: new Date().toISOString(),
    };
    const selfAssessments =
      existing >= 0
        ? prev.selfAssessments.map((a, i) => (i === existing ? assessment : a))
        : [...prev.selfAssessments, assessment];
    const updated = { ...prev, selfAssessments };
    // 持久化
    localStorage.setItem(
      COMPETENCY_STORAGE_KEY,
      JSON.stringify({ studentCompetency: updated, competencyProfile })
    );
    return updated;
  });
};

// 生成能力画像
const handleGenerateCompetency = async () => {
  const occupation = competencyOccupation.trim();
  if (!occupation) return;
  setCompetencyLoading(true);
  try {
    const res = await fetch('/api/competency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occupation }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setCompetencyProfile(json.data);
      setStudentCompetency((prev) => {
        const updated = { ...prev, targetCareer: occupation };
        localStorage.setItem(
          COMPETENCY_STORAGE_KEY,
          JSON.stringify({ studentCompetency: updated, competencyProfile: json.data })
        );
        return updated;
      });
      setShowCompetency(true);
    }
  } catch {
    // 静默失败 — 用户可以通过重试
  } finally {
    setCompetencyLoading(false);
  }
};

// 查看资源（GapPanel 用）
const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
const handleViewResources = (competencyId: string) => {
  setSelectedGapId((prev) => (prev === competencyId ? null : competencyId));
};

// 在 JSX 中，ProfileCard 下方添加 competency 入口
// 在 <div className="chat-scroll ..."> 中，ProfileCard 之后，messages 之前：
/*
{showCompetency && competencyProfile && (
  <div className="mb-6">
    <CompetencyCard
      profile={competencyProfile}
      selfAssessments={studentCompetency.selfAssessments}
      onAssess={handleAssess}
      onViewResources={handleViewResources}
      onRefresh={() => { setShowCompetency(false); setCompetencyProfile(null); setCompetencyOccupation(''); }}
    />
  </div>
)}
*/

// 在 ProfileCard 和 messages 之间插入入口
/*
{!showCompetency && (
  <div className="mb-4 rounded-lg border border-dashed border-border/60 bg-card/40 px-4 py-3">
    <p className="text-xs text-muted-foreground mb-2">想知道你离目标职业还差哪些能力？</p>
    <div className="flex gap-2">
      <input
        value={competencyOccupation}
        onChange={(e) => setCompetencyOccupation(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateCompetency(); }}
        placeholder="输入目标职业，如：律师、产品经理..."
        className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
        disabled={competencyLoading}
      />
      <button
        onClick={handleGenerateCompetency}
        disabled={competencyLoading || !competencyOccupation.trim()}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-30"
      >
        {competencyLoading ? '生成中...' : '查看能力需求'}
      </button>
    </div>
  </div>
)}
*/
```

- [ ] **Step 2: 验证类型检查通过**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 3: 提交**

```bash
git add src/components/chat/ChatInterface.tsx
git commit -m "feat: integrate competency diagnosis into ChatInterface with localStorage persistence"
```

---

### Task 8: 能力信号提取器（从对话中推断能力水平）

**Files:**
- Modify: `src/lib/profile-extractor.ts`

**Interfaces:**
- Consumes: 现有 `extractProfile` 函数签名
- Produces: 新增 `extractCompetencySignals(messages): InferredSignal[]`

- [ ] **Step 1: 在 `profile-extractor.ts` 中新增能力信号提取函数**

```typescript
// 在文件末尾新增

import type { InferredSignal, ProficiencyLevel } from '@/types/competency';

/**
 * 从对话历史中提取学生暴露的能力信号。
 * 基于正则模式匹配学生提到的技能、课程、证书、项目经历，
 * 推断相关能力及其水平。
 */
export function extractCompetencySignals(
  messages: { role: string; content: string }[]
): InferredSignal[] {
  const fullText = messages.map((m) => m.content).join('\n');
  const signals: InferredSignal[] = [];

  // 学生自述的能力水平模式
  const patterns: [RegExp, string, ProficiencyLevel][] = [
    // 明确学过/考过 → Level 2-3
    [/我?修过[「「]?(.{2,12})[」」]?(?:课程|课)/g, 'course', 3],
    [/我?考了|我?拿过|我?通过[了]?(.{2,16})?(?:证书|资格证|考试)/g, 'cert', 3],
    [/我?做过|我?参加过|我?实习[过]?|我?完成[了]?(.{2,20})?(?:项目|比赛|竞赛|实习)/g, 'project', 3],
    // 不熟练 → Level 1-2
    [/(.{2,12})(?:不太会|不熟练|没学过|没接触过|基础差)/g, 'weak', 1],
    // 熟练 → Level 4
    [/(.{2,12})(?:很熟练|比较熟|经常用|一直在做|是我的强项)/g, 'strong', 4],
    // 教别人 → Level 5
    [/(.{2,12})(?:教[过]?|指导[过]?|带[过]?)(?:别人|同学|新人|学弟)/g, 'teach', 5],
  ];

  for (const [regex, source, level] of patterns) {
    let match: RegExpExecArray | null;
    // 重置 regex 的 lastIndex
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(fullText)) !== null) {
      const extracted = match[1]?.trim();
      if (extracted && extracted.length >= 2) {
        signals.push({
          competencyId: `inferred-${source}-${extracted}`,
          inferredLevel: level,
          confidence: source === 'weak' || source === 'strong' || source === 'teach' ? 0.7 : 0.5,
          source: `从对话中「${match[0]}」推断`,
        });
      }
    }
  }

  return signals;
}
```

- [ ] **Step 2: 验证类型检查通过**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/profile-extractor.ts
git commit -m "feat: add competency signal extraction from chat messages"
```

---

### Task 9: System Prompt 注入能力上下文

**Files:**
- Modify: `src/lib/rag.ts`

**Interfaces:**
- Consumes: `buildSystemPrompt` 现有签名; `StudentCompetencyProfile` from `@/types/competency`
- Produces: `buildSystemPrompt` 新增 `competencyProfile` 可选参数，注入能力上下文

- [ ] **Step 1: 修改 `buildSystemPrompt` 函数签名和内容**

在 `rag.ts` 中：

1. 新增 import
2. `buildSystemPrompt` 新增 `competencyProfile` 参数
3. 在 system prompt 末尾追加能力上下文段落

```typescript
// 在文件顶部新增 import
import type { StudentCompetencyProfile } from '@/types/competency';

// 修改 buildSystemPrompt 签名（第 117-120 行）
export function buildSystemPrompt(
  relevantAtoms: RagResult[],
  profile?: Partial<UserProfile>,
  competencyProfile?: StudentCompetencyProfile  // 新增
): string {

  // ... 现有代码不变 ...

  // 在 return 语句中，profileSection 之后，system prompt 正文之前，追加能力上下文：
  let competencySection = '';
  if (competencyProfile && competencyProfile.targetCareer) {
    competencySection = `\n## 能力画像\n- 目标职业：${competencyProfile.targetCareer}`;
    if (competencyProfile.selfAssessments.length > 0) {
      competencySection += `\n- 已评估 ${competencyProfile.selfAssessments.length} 项能力`;
    }
    competencySection += `\n\n如果学生提到与目标职业相关的能力话题，你可以：\n`;
    competencySection += `- 引导学生反思当前能力水平与目标的差距\n`;
    competencySection += `- 推荐具体的学习资源（从资源库匹配）\n`;
    competencySection += `- 但不要直接说"你应该学X"——问学生"你觉得当前哪项能力最需要提升？"\n`;
  }

  // 将 competencySection 插入到 profileSection 之后
  return `你是 歧点 的职业规划助手。...${atomsSection}${profileSection}${competencySection}`;
  //                                                                            ^^^^^^^^^^^^^^^^ 新增
}
```

注意：`buildSystemPrompt` 的调用方 `src/lib/ai.ts` 中 `chatWithAI` 的签名也需要新增 `competencyProfile` 参数，并传递给 `buildSystemPrompt`。

- [ ] **Step 2: 修改 `src/lib/ai.ts`，传递能力上下文**

```typescript
// 在 ai.ts 顶部新增 import
import type { StudentCompetencyProfile } from '@/types/competency';

// 修改 chatWithAI 签名（第 18 行）
export async function chatWithAI(
  messages: ChatMessage[],
  userProfile?: Partial<UserProfile>,
  competencyProfile?: StudentCompetencyProfile  // 新增
): Promise<{ reply: string; sources: ChatMessage['sources'] }> {

  // 修改 buildSystemPrompt 调用（第 37 行）
  const systemPrompt = buildSystemPrompt(relevantAtoms, userProfile, competencyProfile);
  //                                                                  ^^^^^^^^^^^^^^^^^ 新增
```

- [ ] **Step 3: 修改 `src/app/api/chat/route.ts`，从请求中接收能力上下文**

在 route.ts 中，请求体新增 `competencyProfile` 字段，传递给 `chatWithAI`。

```typescript
// 第 14-15 行修改
const body = await request.json();
const messages: ChatMessage[] = body.messages;
const competencyProfile = body.competencyProfile;  // 新增

// 第 25 行修改
const { reply, sources } = await chatWithAI(messages, profile, competencyProfile);
```

- [ ] **Step 4: 验证类型检查通过**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 5: 提交**

```bash
git add src/lib/rag.ts src/lib/ai.ts src/app/api/chat/route.ts
git commit -m "feat: inject competency context into AI system prompt for deeper coaching"
```

---

### Task 10: 全流程端到端验证 + 构建

**Files:**
- 无新建/修改，验证所有集成正确

- [ ] **Step 1: 类型检查全项目**

```bash
npx tsc --noEmit --pretty false
```

期望：无错误

- [ ] **Step 2: 生产构建验证**

```bash
npm run build
```

期望：构建成功，无 warning

- [ ] **Step 3: 验证 AI 能力画像生成质量**

手动测试（需要 ANTHROPIC_API_KEY 环境变量已配置）：
1. 启动 `npm run dev`
2. 在浏览器中打开 http://localhost:3000
3. 点击对话 Tab
4. 在能力诊断入口输入「律师」
5. 点击「查看能力需求」
6. 检查返回的能力画像是否包含：硬能力、软能力、门槛证书、5级行为描述
7. 在能力条上点击 Lv.1-5 做自评
8. 刷新页面 → 确认自评数据持久化

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: final integration verification — typecheck + build pass"
```

---

## Verification Checklist

每个 Task 完成后运行：

```bash
npx tsc --noEmit --pretty false   # 类型检查
```

全部完成后运行：

```bash
npm run build                       # 生产构建
```

手动测试流程：
1. `npm run dev` → 打开 localhost:3000
2. 输入目标职业 → 查看能力画像是否生成
3. 点击自评 → 确认 localStorage 持久化
4. 刷新页面 → 确认数据恢复
5. 在对话中提到能力相关话题 → 确认 AI 回复引用能力上下文
