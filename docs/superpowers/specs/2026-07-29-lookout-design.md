# 世界线（Worldline）— 设计文档

> 让全国各地的高中生知道自己的同龄人在做什么，有什么样的资源，在走什么样的路，打破信息差，减少"只会做题"的现象。

## 1. 产品定位

| 维度 | 歧点（Mingdao） | 世界线（Worldline） |
|------|----------------|----------------|
| 目标用户 | 大学生 | 高中生 |
| 核心问题 | "我该选什么职业？" | "同龄人在走什么路？用什么资源？" |
| 产品类型 | 生涯规划教练 | 类社区资源展示平台 |
| 核心功能 | AI 对话推演路线 | 浏览发现 + 资源展示 |
| AI 角色 | 核心 — 推演路线、分析利弊 | 辅助 — 帮学生找到相关内容 |
| 内容主体 | 职业路径、薪资、城市成本 | 赛道科普、学习资源、时间节点 |

## 2. 仓库架构

三个完全独立的仓库：

```
maven/        → 通用库（独立 npm 包，发布到 npm）
career-compass/      → 歧点（独立项目，npm install @maven/*）
edutrack/      → 世界线（独立项目，npm install @maven/*）
```

### 2.1 maven（通用库）结构

```
maven/
├── packages/
│   ├── ai-core/           → @maven/ai-core    — AI 客户端 + RAG + Web 搜索 + 流协议
│   ├── ai-types/          → @maven/ai-types   — ChatMessage、ApiResponse 等通用类型
│   ├── utils/             → @maven/utils      — cn()、escapeHtml、safeMarkdown、streak
│   ├── stores/            → @maven/stores     — 通用 data-store、activity-store、decision-store
│   └── session/           → @maven/session    — 通用渐进式画像引擎
├── tooling/
│   ├── typescript/        → 共享 tsconfig 基配置
│   └── eslint/            → 共享 ESLint 配置
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

| 子包 | 职责 | 领域耦合 |
|------|------|---------|
| `@maven/ai-core` | 多供应商 AI 客户端、RAG 检索管线、Web 搜索、流协议解析 | 零 |
| `@maven/ai-types` | ChatMessage、ApiResponse<T>、知识原子等通用类型定义 | 零 |
| `@maven/utils` | cn()、escapeHtml、safeMarkdown、streak-store | 零 |
| `@maven/stores` | 通用 JSON 数据加载器、活动日志、决策日志 | 低（类型枚举可配置） |
| `@maven/session` | 通用渐进式画像引擎，提供可配置维度 | 低（维度内容可配置） |

**技术栈：** TypeScript strict / tsup 构建 / pnpm workspace / changesets 发布 / vitest 测试

### 2.2 edutrack（世界线）结构

```
edutrack/
├── src/
│   ├── app/               → Next.js App Router 页面
│   ├── components/        → UI 组件
│   │   ├── layout/        → BottomNav、PageHeader
│   │   ├── home/          → TrackCard、CategoryFilter
│   │   ├── track/         → TrackOverview、TrackTimeline、TrackResources
│   │   ├── timeline/      → GradeSelector、TimelineList
│   │   ├── resources/     → ResourceCard、ResourceFilter、ResourceSearch
│   │   ├── ask/           → AskInput、AskResult
│   │   └── shared/        → EmptyState、LoadingSkeleton、TagBadge
│   ├── lib/
│   │   ├── tracks.ts      → 赛道数据加载
│   │   ├── resources.ts   → 资源数据加载
│   │   └── timeline.ts    → 时间线数据加载
│   └── data/
│       ├── tracks/        → 赛道 Markdown/JSON 内容
│       ├── resources/     → 资源索引 JSON
│       └── timeline/      → 时间节点 JSON
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

**技术栈：** Next.js 14 App Router / TypeScript strict / Tailwind CSS 3 / lucide-react / 内容文件驱动（Markdown + JSON，无数据库）/ Vercel 部署

## 3. 页面结构

| 页面 | 路由 | 核心功能 |
|------|------|---------|
| 首页 | `/` | 赛道发现流：卡片流展示各赛道，分类筛选 |
| 赛道详情 | `/tracks/[id]` | 一条路的完整信息：是什么 + 适合谁 + 时间节点 + 资源 |
| 时间线 | `/timeline` | 按年级筛选关键事件节点 |
| 资源地图 | `/resources` | 分类浏览 + 搜索资源 |
| AI 问路 | `/ask` | 辅助搜索：输入自身情况，推荐相关赛道和资源 |

### 底部导航

```text
┌────────┬────────┬────────┬────────┐
│ 发现 🏠  │ 时间线 📅 │ 资源库 📚 │ AI 问问 💬 │
└────────┴────────┴────────┴────────┘
```

## 4. 数据模型

### 4.1 赛道卡片（TrackCard）

```typescript
interface TrackCard {
  id: string;                    // "informatics-olympiad"
  name: string;                  // "信息学竞赛"
  category: TrackCategory;       // 'competition' | 'enrollment' | 'art' | 'sport' | 'overseas' | 'vocational'
  oneLiner: string;              // "用算法敲开名校大门"
  overview: string;              // 这是什么路（Markdown）
  suitableFor: string[];         // ["理科突出", "能坚持长期训练"]
  notSuitableFor: string[];      // ["想高三再突击"]
  keyNodes: TimelineNode[];      // 关键时间节点
  resources: LinkedResource[];   // 配套资源
}
```

### 4.2 资源条目（ResourceEntry）

```typescript
interface ResourceEntry {
  id: string;
  name: string;
  url: string;
  description: string;
  type: 'book' | 'course' | 'tool' | 'community' | 'official' | 'article' | 'video';
  cost: 'free' | 'paid' | 'freemium';
  tracks: string[];              // 关联赛道 ID
  gradeRange: [number, number];  // 适合年级 [10, 12]
  tags: string[];
}
```

### 4.3 时间节点（TimelineNode）

```typescript
interface TimelineNode {
  grade: string;                 // "高一上"
  month: number;                 // 9
  event: string;                 // "NOIP 初赛"
  action: string;                // "提前 3 个月刷真题"
  deadline?: string;             // "2025-09-15"
}
```

### 数据关系

```
TimelineNode ──N:M── TrackCard ──1:N── ResourceEntry
```

- 一个赛道有多个时间节点、多份资源
- 时间节点可以属于多个赛道
- 资源关联到一个或多个赛道

## 5. 视觉设计

### 设计 tokens

```css
:root {
  /* 主色调 — 天蓝色 */
  --color-primary: #2563EB;
  --color-primary-light: #3B82F6;
  --color-primary-dark: #1D4ED8;

  /* 强调色 — 暖黄，关键信息突显 */
  --color-accent: #F59E0B;

  /* 背景 — 浅灰蓝 */
  --color-bg: #F0F4FF;
  --color-surface: #FFFFFF;

  /* 文字 */
  --color-text: #1E293B;
  --color-text-muted: #64748B;

  /* 赛道分类色 */
  --color-competition: #7C3AED;   /* 紫 — 竞赛 */
  --color-enrollment: #059669;    /* 绿 — 升学 */
  --color-art: #DB2777;           /* 粉 — 艺考 */
  --color-sport: #EA580C;         /* 橙 — 体育 */
  --color-overseas: #0891B2;      /* 青 — 出国 */
  --color-vocational: #4F46E5;    /* 靛 — 职教 */

  /* 圆角 */
  --radius-card: 12px;
  --radius-chip: 999px;

  /* 字体 */
  --font-display: 'Noto Sans SC', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* 阴影 */
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-card-hover: 0 4px 16px rgba(37,99,235,0.12);
}
```

### 与歧点的视觉差异

| | 歧点 | 世界线 |
|---|---|---|
| 主色 | 陶土红 `#C96442` | 天蓝 `#2563EB` |
| 底色 | 奶油白 `#FDF9F4` | 浅灰蓝 `#F0F4FF` |
| 气质 | 沉稳、可信赖 | 活力、明亮 |
| 圆角 | 4-16px | 12-999px（更圆） |

## 6. 共享库边界

**共享（@maven/*）：**
- AI 多供应商客户端 + RAG 检索管线 + Web 搜索 + 流协议解析
- 通用类型定义（ChatMessage、ApiResponse 等）
- 工具函数（cn、escapeHtml、safeMarkdown）
- 通用存储模式（数据加载器、活动日志、决策日志）
- 渐进式画像引擎

**不共享（各 App 独立）：**
- 知识库/赛道/资源/时间线内容
- 系统提示词和 AI 角色
- UI 组件（各 App 独立设计）
- 设计 tokens（歧点 terracotta，世界线天蓝）
- 路由和页面结构

## 7. 范围与优先级

### Phase 1：雏形（当前阶段）
1. 搭建 `maven` 库（ai-core, ai-types, utils, stores, session）
2. 发布 `@maven/*` 到 npm
3. 搭建 `edutrack` 项目
4. 实现赛道浏览 + 详情（3-5 个种子赛道）
5. 实现时间线页面
6. 实现资源地图页面
7. 实现 AI 问路页面（辅助搜索）

### Phase 2：上线后
- 内容扩充（更多赛道、资源）
- AI 对话质量优化
- 用户反馈收集

### Phase 3：社区化
- UGC 内容入口
- 用户分享路径故事
