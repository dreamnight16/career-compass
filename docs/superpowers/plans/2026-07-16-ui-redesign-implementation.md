# 歧点 UI 重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将歧点从单页聊天升级为落地页 + 侧边栏四模块主界面 + 用户活动记录的完整产品

**Architecture:** Landing page `/` → CTA → main app `/main` with shadcn sidebar. Four modules (AI Coach / Profile / Knowledge / Resources) share a sidebar shell, content swapped via URL search params. All state persists in localStorage — no backend.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, shadcn/ui (sidebar component already installed), Tailwind CSS, lucide-react, Inter font

**Spec:** `docs/superpowers/specs/2026-07-16-ui-redesign.md`

## Global Constraints

- No new npm dependencies — lucide-react / shadcn/ui / tailwindcss already installed
- No backend database — all persistence via localStorage
- H-I-P principle must not be broken anywhere in the UI copy
- Files under 800 lines, functions under 50 lines
- TypeScript strict — `npx tsc --noEmit` must pass
- Production build — `npm run build` must succeed
- Design: warm Editorial style, `font-serif` for hero title only, SVG noise texture on landing, 3px sidebar active indicator
- Sidebar icons: Sparkles / UserCircle / Database / Library (lucide-react)
- Sidebar default expanded (220px), collapsible to 64px, state in localStorage
- Module switching via URL search params `?tab=coach|profile|knowledge|resources`
- 150ms fade transition on module switch
- Reduced-motion respected everywhere
- All UI copy in Chinese

---

## File Structure

```
新建:
  src/app/main/page.tsx                         # 主界面 (sidebar shell + content router)
  src/components/layout/AppSidebar.tsx           # 侧边栏导航组件
  src/components/layout/ContentRouter.tsx        # 模块内容路由
  src/components/landing/HeroSection.tsx         # 落地页第一屏
  src/components/landing/FeatureGrid.tsx         # 落地页第二屏
  src/components/history/HistoryDrawer.tsx       # 历史记录抽屉
  src/lib/activity-store.ts                     # 活动记录工具函数

重写:
  src/app/page.tsx                              # 落地页 (替换旧两Tab界面)

修改:
  src/app/layout.tsx                             # 字体配置 + metadata
  src/app/globals.css                            # 噪点纹理 + hero动画 + font-serif
  src/components/chat/ChatInterface.tsx          # 移除 ProfileCard 外层入口包装
```

---

### Task 1: 落地页第一屏 `HeroSection`

**Files:**
- Create: `src/components/landing/HeroSection.tsx`
- Modify: `src/app/page.tsx` (重写为落地页入口)
- Modify: `src/app/globals.css` (添加噪点纹理 + font-serif + hero动画)

**Interfaces:**
- Consumes: 无（独立组件）
- Produces: `<HeroSection onEnter={...}>` — 全屏氛围 hero + CTA

- [ ] **Step 1: 添加 CSS 工具类**

在 `src/app/globals.css` 追加：

```css
/* 在 @layer base { ... } 内追加 */
.font-serif-hero {
  font-family: 'STSong', 'SimSun', 'Noto Serif SC', 'Source Han Serif SC', serif;
}

.noise-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

@keyframes hero-reveal {
  from { opacity: 0; filter: blur(12px); transform: translateY(8px); }
  to   { opacity: 1; filter: blur(0);   transform: translateY(0); }
}
.hero-reveal {
  animation: hero-reveal 1.2s ease-out forwards;
}
.hero-reveal-delay-1 { animation-delay: 0.2s; opacity: 0; }
.hero-reveal-delay-2 { animation-delay: 0.5s; opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .hero-reveal, .hero-reveal-delay-1, .hero-reveal-delay-2 {
    animation: none; opacity: 1; filter: none; transform: none;
  }
}
```

- [ ] **Step 2: 创建 `HeroSection.tsx`**

```typescript
'use client';

import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onEnter: () => void;
}

export function HeroSection({ onEnter }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden noise-bg"
      style={{ background: 'linear-gradient(180deg, oklch(97% 0.01 85) 0%, var(--background) 60%, rgba(201,100,66,0.06) 100%)' }}
    >
      {/* 柔和光晕 */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(201,100,66,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* 标题 */}
        <h1 className="font-serif-hero text-[clamp(3.5rem,8vw,7rem)] font-bold leading-none tracking-tight text-foreground hero-reveal">
          歧点
        </h1>

        {/* 签名装饰线 — SVG手绘风 */}
        <svg
          className="hero-reveal hero-reveal-delay-1 h-3 w-28"
          viewBox="0 0 112 12" fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 10 Q14 2 28 6 T56 6 T84 4 T110 8"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </svg>

        {/* 副标题 */}
        <p className="hero-reveal hero-reveal-delay-1 text-lg font-medium tracking-wide text-muted-foreground">
          为你探明前路
        </p>

        {/* 三行文案 */}
        <div className="hero-reveal-delay-2 hero-reveal mt-2 space-y-1">
          <p className="text-sm text-muted-foreground/70">不是告诉你该选哪条路</p>
          <p className="text-sm text-muted-foreground/70">而是让你看清每条路的样子</p>
          <p className="text-sm text-muted-foreground/70">然后自己决定</p>
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="hero-reveal-delay-2 hero-reveal mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
        >
          开始探索
        </button>
      </div>

      {/* 向下滚动提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/30">
        <ArrowDown className="h-5 w-5" />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: 创建 `FeatureGrid.tsx`**

<write file: `src/components/landing/FeatureGrid.tsx`>

```typescript
'use client';

import { Sparkles, UserCircle, Database, Library } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI规划师', desc: '一对一深度对话，教决策不替决策' },
  { icon: UserCircle, title: '个人画像', desc: '8维角色卡 + 能力诊断，看清自己' },
  { icon: Database, title: '数据库', desc: '300+职业数据点，每条都有来源' },
  { icon: Library, title: '资源库', desc: '300+精选学习资源，精准匹配' },
];

interface FeatureGridProps {
  onEnter: () => void;
}

export function FeatureGrid({ onEnter }: FeatureGridProps) {
  return (
    <section className="min-h-screen bg-background px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="mb-16 text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
          四大模块
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <f.icon className="mb-5 h-7 w-7 text-primary/70 transition-colors group-hover:text-primary" strokeWidth={1.5} />
              <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={onEnter}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
          >
            进入歧点
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: 重写 `page.tsx`**

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureGrid } from '@/components/landing/FeatureGrid';

export default function LandingPage() {
  const router = useRouter();

  const handleEnter = () => {
    router.push('/main');
  };

  return (
    <main>
      <HeroSection onEnter={handleEnter} />
      <FeatureGrid onEnter={handleEnter} />
    </main>
  );
}
```

- [ ] **Step 5: 类型检查**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 6: 提交**

```bash
git add src/components/landing/HeroSection.tsx src/components/landing/FeatureGrid.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: add landing page with editorial hero and feature grid"
```

---

### Task 2: 侧边栏布局 `AppSidebar` + `/main` 路由

**Files:**
- Create: `src/components/layout/AppSidebar.tsx`
- Create: `src/app/main/page.tsx`
- Create: `src/components/layout/ContentRouter.tsx`

**Interfaces:**
- Consumes: 现有 `ChatInterface`, `ResourceBrowser`; `CompetencyCard` + `ProfileCard` (后续 Task 整合)
- Produces: `<AppSidebar>` 组件; `/main` 页面; `<ContentRouter tab={string}>`

- [ ] **Step 1: 创建 `AppSidebar.tsx`**

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  Sparkles,
  UserCircle,
  Database,
  Library,
  ChevronLeft,
  ChevronRight,
  History,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'coach',     icon: Sparkles,    label: 'AI规划师', en: 'Coach' },
  { id: 'profile',   icon: UserCircle,  label: '个人画像', en: 'Profile' },
  { id: 'knowledge', icon: Database,    label: '数据库',   en: 'Knowledge' },
  { id: 'resources', icon: Library,     label: '资源库',   en: 'Resources' },
];

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED = 64;

export function AppSidebar({ onOpenHistory }: { onOpenHistory: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const activeTab = params.get('tab') || 'coach';
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('career-compass-sidebar-collapsed') === 'true'; }
    catch { return false; }
  });

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('career-compass-sidebar-collapsed', String(next)); }
    catch { /* ignore */ }
  };

  const navigate = (tabId: string) => {
    router.push(`/main?tab=${tabId}`);
  };

  return (
    <aside
      className="flex h-screen flex-col border-r border-border/50 bg-[var(--sidebar-background)] transition-[width] duration-200 ease-out"
      style={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border/30 px-4">
        <button
          onClick={toggleCollapse}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight text-foreground whitespace-nowrap">
            歧点
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary/80 text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              )}
            >
              {/* 左侧选中指示线 */}
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground/60'
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {!collapsed && (
                <span className="flex flex-col items-start leading-tight">
                  <span>{item.label}</span>
                  <span className="text-[10px] text-muted-foreground/50">{item.en}</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部用户区 */}
      <div className="border-t border-border/30 px-3 py-3">
        <button
          onClick={onOpenHistory}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            <User className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xs font-medium text-foreground">探索者</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                <History className="h-3 w-3" /> 历史记录
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: 创建 `ContentRouter.tsx`**

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ResourceBrowser } from '@/components/chat/ResourceBrowser';

/** Placeholder for Knowledge module — renders existing resource browser for now */
function KnowledgeView() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <p className="text-sm text-muted-foreground">数据库模块即将上线</p>
      <p className="mt-1 text-xs text-muted-foreground/60">浏览各维度的职业数据</p>
    </div>
  );
}

/** Placeholder for Profile module — will be replaced in Task 4 */
function ProfilePlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <p className="text-sm text-muted-foreground">个人画像模块即将上线</p>
      <p className="mt-1 text-xs text-muted-foreground/60">查看你的角色卡和能力画像</p>
    </div>
  );
}

export function ContentRouter() {
  const params = useSearchParams();
  const tab = params.get('tab') || 'coach';

  return (
    <div className="flex-1 overflow-hidden transition-opacity duration-150" key={tab}>
      {tab === 'coach' && <ChatInterface />}
      {tab === 'profile' && <ProfilePlaceholder />}
      {tab === 'knowledge' && <KnowledgeView />}
      {tab === 'resources' && <ResourceBrowser />}
    </div>
  );
}
```

- [ ] **Step 3: 创建 `/main/page.tsx`**

```typescript
'use client';

import { Suspense, useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ContentRouter } from '@/components/layout/ContentRouter';
import { HistoryDrawer } from '@/components/history/HistoryDrawer';

function MainContent() {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar onOpenHistory={() => setHistoryOpen(true)} />
      <ContentRouter />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><p className="text-sm text-muted-foreground">加载中…</p></div>}>
      <MainContent />
    </Suspense>
  );
}
```

- [ ] **Step 4: 类型检查 + 构建**

```bash
npx tsc --noEmit --pretty false
npm run build
```

- [ ] **Step 5: 提交**

```bash
git add src/components/layout/AppSidebar.tsx src/components/layout/ContentRouter.tsx src/app/main/page.tsx
git commit -m "feat: add sidebar layout shell with 4-module navigation and /main route"
```

---

### Task 3: AI规划师模块 — ChatInterface 适配

**Files:**
- Modify: `src/components/chat/ChatInterface.tsx` — 移除 ProfileCard 在最外层的入口包装

**Interfaces:**
- Consumes: 现有 `ChatInterface` 功能
- Produces: ChatInterface 仅保留对话功能，ProfileCard 和 CompetencyCard 的入口移至 Profile 模块

**改动说明：**

ChatInterface 当前在对话顶部显示 ProfileCard (`{messages.length > 1 && <ProfileCard ...>}`) 和 CompetencyCard / 职业输入框。这些入口应该在「个人画像」模块中，而不是对话区。

修改方式：保留对话核心功能（消息列表 + 输入框），移除：
1. ProfileCard 显示（第131行: `{messages.length > 1 && <div className="mb-6"><ProfileCard profile={profile} /></div>}`）
2. CompetencyCard 显示（第132-142行）
3. 职业输入入口（第143-164行）
4. 相关 state：`competencyProfile`, `studentCompetency`, `showCompetency`, `competencyLoading`, `competencyOccupation`, `selectedGapId`
5. 相关 imports：`CompetencyCard`, competency types, `batchMatch`
6. localStorage 恢复逻辑（第37-47行）

只需保留：对话消息列表、输入框、发送按钮、`profile` state（画像数据仍需要传给 API）。

- [ ] **Step 1: 修改 ChatInterface.tsx**

读取 `src/components/chat/ChatInterface.tsx`，删除上述条目，保留纯对话功能。关键保留：
- `messages`, `input`, `loading`, `profile` state
- `handleSend`（已包含 competencyProfile 发送）
- 消息列表 + 输入框 JSX
- `mergeProfile` 函数

- [ ] **Step 2: 类型检查 + 构建**

```bash
npx tsc --noEmit --pretty false && npm run build
```

- [ ] **Step 3: 提交**

```bash
git add src/components/chat/ChatInterface.tsx
git commit -m "refactor: strip competency/profile cards from ChatInterface — move to Profile module"
```

---

### Task 4: 个人画像模块

**Files:**
- Modify: `src/components/layout/ContentRouter.tsx` — 将 ProfilePlaceholder 替换为真实组件
- Create: `src/components/profile/ProfileDashboard.tsx`

**Interfaces:**
- Consumes: `ProfileCard`, `CompetencyCard`, localStorage 数据
- Produces: `<ProfileDashboard>` — 角色卡 + 能力画像 + 成长轨迹

- [ ] **Step 1: 创建 `ProfileDashboard.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { ProfileCard } from '@/components/chat/ProfileCard';
import { CompetencyCard } from '@/components/chat/CompetencyCard';
import type { OccupationCompetencyProfile, StudentCompetencyProfile, SelfAssessment, ProficiencyLevel } from '@/types/competency';
import { batchMatch } from '@/lib/resource-matcher';

export function ProfileDashboard() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [competencyProfile, setCompetencyProfile] = useState<OccupationCompetencyProfile | null>(null);
  const [studentCompetency, setStudentCompetency] = useState<StudentCompetencyProfile>({ selfAssessments: [], inferredSignals: [] });
  const [showCompetency, setShowCompetency] = useState(false);
  const [competencyLoading, setCompetencyLoading] = useState(false);
  const [competencyOccupation, setCompetencyOccupation] = useState('');
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('career-compass-competency');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentCompetency) setStudentCompetency(parsed.studentCompetency);
        if (parsed.competencyProfile) { setCompetencyProfile(parsed.competencyProfile); setShowCompetency(true); }
      }
      const profileSaved = localStorage.getItem('career-compass-profile');
      if (profileSaved) setProfile(JSON.parse(profileSaved));
      const activities = JSON.parse(localStorage.getItem('career-compass-activity') || '[]');
      setActivityCount(activities.length);
    } catch { /* ignore */ }
  }, []);

  const handleAssess = (competencyId: string, level: ProficiencyLevel, evidence: string) => {
    setStudentCompetency((prev) => {
      const existing = prev.selfAssessments.findIndex((a) => a.competencyId === competencyId);
      const assessment: SelfAssessment = { competencyId, currentLevel: level, evidence, lastUpdated: new Date().toISOString() };
      const selfAssessments = existing >= 0
        ? prev.selfAssessments.map((a, i) => (i === existing ? assessment : a))
        : [...prev.selfAssessments, assessment];
      const updated = { ...prev, selfAssessments };
      localStorage.setItem('career-compass-competency', JSON.stringify({ studentCompetency: updated, competencyProfile }));
      return updated;
    });
  };

  const handleGenerate = async () => {
    const occupation = competencyOccupation.trim();
    if (!occupation) return;
    setCompetencyLoading(true);
    try {
      const res = await fetch('/api/competency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ occupation }) });
      const json = await res.json();
      if (json.success && json.data) {
        setCompetencyProfile(json.data);
        setStudentCompetency((prev) => {
          const updated = { ...prev, targetCareer: occupation };
          localStorage.setItem('career-compass-competency', JSON.stringify({ studentCompetency: updated, competencyProfile: json.data }));
          return updated;
        });
        setShowCompetency(true);
      }
    } catch { /* ignore */ }
    finally { setCompetencyLoading(false); }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">个人画像</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 角色卡 */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">角色卡</h3>
          <ProfileCard profile={profile} />
        </div>

        {/* 能力画像入口 */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">能力画像</h3>
          {showCompetency && competencyProfile ? (
            <CompetencyCard
              profile={competencyProfile}
              selfAssessments={studentCompetency.selfAssessments}
              onAssess={handleAssess}
              onViewResources={() => {}}
              onRefresh={() => { setShowCompetency(false); setCompetencyProfile(null); setCompetencyOccupation(''); localStorage.removeItem('career-compass-competency'); }}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-card/40 px-4 py-3">
              <p className="mb-2 text-xs text-muted-foreground">生成目标职业的能力画像</p>
              <div className="flex gap-2">
                <input
                  value={competencyOccupation}
                  onChange={(e) => setCompetencyOccupation(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
                  placeholder="输入目标职业，如：律师..."
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                  disabled={competencyLoading}
                />
                <button
                  onClick={handleGenerate}
                  disabled={competencyLoading || !competencyOccupation.trim()}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-30"
                >
                  {competencyLoading ? '生成中...' : '查看能力需求'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 成长轨迹 */}
      <div className="mt-8">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">成长轨迹</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="对话次数" value={String(activityCount)} />
          <StatCard label="能力评估" value={String(studentCompetency.selfAssessments.length)} />
          <StatCard label="资源收藏" value="—" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 text-center shadow-sm">
      <p className="text-2xl font-bold text-foreground font-serif-hero">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
```

- [ ] **Step 2: 更新 ContentRouter**

在 `ContentRouter.tsx` 中，将 `ProfilePlaceholder` 替换为 `ProfileDashboard`：

```typescript
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';

// 在 ContentRouter 中:
{tab === 'profile' && <ProfileDashboard />}
```

- [ ] **Step 3: 类型检查 + 构建**

```bash
npx tsc --noEmit --pretty false && npm run build
```

- [ ] **Step 4: 提交**

```bash
git add src/components/profile/ProfileDashboard.tsx src/components/layout/ContentRouter.tsx
git commit -m "feat: add Profile module with role card, competency assessment, and growth stats"
```

---

### Task 5: 历史记录抽屉 + 活动日志

**Files:**
- Create: `src/components/history/HistoryDrawer.tsx`
- Create: `src/lib/activity-store.ts`

**Interfaces:**
- Consumes: localStorage `career-compass-activity` 数组
- Produces: `<HistoryDrawer open={boolean} onClose={...}>` 右侧抽屉面板

- [ ] **Step 1: 创建 `activity-store.ts`**

```typescript
export interface ActivityEntry {
  id: string;
  type: 'chat' | 'competency' | 'profile_update' | 'resource_save' | 'first_visit';
  title: string;
  detail?: string;
  timestamp: string;
}

const STORAGE_KEY = 'career-compass-activity';

export function getActivities(): ActivityEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
  const activities = getActivities();
  const newEntry: ActivityEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  activities.unshift(newEntry);
  // 保留最近 50 条
  if (activities.length > 50) activities.length = 50;
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
```

- [ ] **Step 2: 创建 `HistoryDrawer.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { getActivities, getStats, type ActivityEntry } from '@/lib/activity-store';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [search, setSearch] = useState('');
  const stats = getStats();

  useEffect(() => {
    if (open) setActivities(getActivities());
  }, [open]);

  const filtered = search.trim()
    ? activities.filter((a) => a.title.includes(search) || (a.detail || '').includes(search))
    : activities;

  if (!open) return null;

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />

      {/* drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-screen w-80 flex-col border-l border-border bg-card shadow-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">历史记录</h3>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 搜索 */}
        <div className="border-b border-border/30 px-4 py-2">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索历史..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>
        </div>

        {/* 活动列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {search ? '无匹配记录' : '暂无活动记录'}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((a) => (
                <div key={a.id} className="rounded-lg border border-border/40 bg-background px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{a.title}</span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(a.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                  {a.detail && <p className="mt-0.5 text-[11px] text-muted-foreground/70">{a.detail}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 统计 */}
        <div className="border-t border-border/50 px-4 py-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-secondary/50 px-3 py-2">
              <p className="text-lg font-bold text-foreground font-serif-hero">{stats.totalConversations}</p>
              <p className="text-[10px] text-muted-foreground">总对话</p>
            </div>
            <div className="rounded-lg bg-secondary/50 px-3 py-2">
              <p className="text-lg font-bold text-foreground font-serif-hero">{stats.competencyAssessments}</p>
              <p className="text-[10px] text-muted-foreground">能力评估</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: 在首次访问时记录活动**

在 `src/app/main/page.tsx` 的 `MainContent` 组件中添加：

```typescript
useEffect(() => {
  const activities = JSON.parse(localStorage.getItem('career-compass-activity') || '[]');
  if (activities.length === 0) {
    import('@/lib/activity-store').then((m) => {
      m.addActivity({ type: 'first_visit', title: '首次使用歧点', detail: '开启职业探索之旅' });
    });
  }
}, []);
```

- [ ] **Step 4: 类型检查 + 构建**

```bash
npx tsc --noEmit --pretty false && npm run build
```

- [ ] **Step 5: 提交**

```bash
git add src/components/history/HistoryDrawer.tsx src/lib/activity-store.ts src/app/main/page.tsx
git commit -m "feat: add history drawer with activity timeline and search"
```

---

### Task 6: 设计品质打磨 + 最终集成

**Files:**
- Modify: `src/app/globals.css` — 添加模块切换过渡
- Modify: `src/app/layout.tsx` — metadata 更新
- Modify: `src/components/chat/ChatInterface.tsx` — 确认精简后的组件正常

- [ ] **Step 1: globals.css 追加过渡动画**

```css
/* 在 @layer base { ... } 内追加 */
.module-fade-in {
  animation: module-fade 150ms ease-out;
}
@keyframes module-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .module-fade-in { animation: none; }
}
```

- [ ] **Step 2: layout.tsx metadata 更新**

```typescript
export const metadata: Metadata = {
  title: '歧点 — 为你探明前路',
  description: '不是告诉你该选哪条路，而是让你看清每条路的样子，然后自己决定。',
};
```

- [ ] **Step 3: 全项目类型检查**

```bash
npx tsc --noEmit --pretty false
```

- [ ] **Step 4: 生产构建**

```bash
npm run build
```

期望：所有路由正常，`/` (落地页) + `/main` (主界面) + `/api/chat` + `/api/competency` 均可用。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "style: polish design — hero intro, sidebar transitions, updated metadata"
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
npm run dev                         # 开发服务器手动验证
```

手动验证流程：
1. `npm run dev` → 打开 localhost:3000
2. 看到落地页 → 宋体大标题 + 手绘装饰线 + 噪点纹理 + 入场动画
3. 滚动到第二屏 → 四宫格卡片
4. 点击「进入歧点」→ 进入 `/main?tab=coach`
5. 左侧侧边栏 → 四个导航项 + lucide 图标 + 3px 选中指示线
6. 点击各模块 → 内容切换 150ms 淡入
7. 侧边栏折叠按钮 → 收起至 64px / 展开至 220px
8. 点击「历史记录」→ 右侧抽屉滑入
9. 刷新页面 → 侧边栏折叠状态从 localStorage 恢复
10. 开启 reduced-motion → 动画禁用
