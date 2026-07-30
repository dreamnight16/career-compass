# 歧点 UI 重构设计文档

> 版本: v1.0 | 日期: 2026-07-16 | 状态: 设计确认

## 1. 目标

将歧点从单页聊天工具升级为完整产品界面：
- 先落地页介绍，再进入主界面
- 侧边栏导航四模块：AI规划师、个人画像、数据库、资源库
- 用户使用记录与历史信息展示
- 界面有设计品质感（Editorial 温暖手帐风格）

## 2. 设计方向

**温暖 Editorial** — 像精心排版的个人成长手帐。暖色氛围、讲究字体、卡片质感、留白充裕。

### 设计品质要求

基于 `web/design-quality.md`：

1. **Typography**：落地页大标题字重对比，正文 `leading-relaxed`
2. **Texture**：背景 SVG 噪点纹理（CSS data URI）
3. **Depth**：侧边栏与内容区阴影分层，卡片 `shadow-sm` → hover `shadow-md`
4. **Motion**：文字入场（blur→清晰 1.2s）、模块切换淡入（200ms）、侧边栏折叠过渡
5. **Rhythm**：间距 4px 基准递增
6. **至少命中 6/10 设计品质项**：层级对比、间距节奏、深度分层、字体性格、语义化颜色、hover/focus 状态

## 3. 落地页

### 视觉结构

两屏滚动：

**第一屏（全屏氛围）**

- 背景：暖色渐变（`--background` → `--primary/10`），叠加 SVG 噪点纹理
- 中央：「歧点」大标题（~6rem, `font-bold`）+ 副标题「为你探明前路」
- 三行解释文字，字号递减形成节奏：
  > 不是告诉你该选哪条路
  > 而是让你看清每条路的样子
  > 然后自己决定
- CTA 按钮「开始探索 →」（`--primary` 填充，hover 微放大）
- 底部 `ArrowDown` 图标（lucide-react），提示向下滚动
- 动画序列：文字 blur→清晰 + 光晕微脉动，约 1.2s

**第二屏（模块介绍）**

- 滚动触达
- 四大模块 2×2 网格卡片：
  - `Sparkles` AI规划师 — 一对一深度对话
  - `UserCircle` 个人画像 — 8维角色卡 + 能力诊断
  - `Database` 数据库 — 300+职业数据点
  - `Library` 资源库 — 300+精选学习资源
- 每卡片：lucide 图标 + 模块名 + 一行描述
- CTA「进入歧点 →」

### 图标方案

全部使用 `lucide-react`（与 shadcn/ui 统一）：

| 位置 | 图标 | 理由 |
|------|------|------|
| AI规划师 | `Sparkles` | AI 智慧感，精致星芒 |
| 个人画像 | `UserCircle` | 干净人像轮廓 |
| 数据库 | `Database` | 数据可信感 |
| 资源库 | `Library` | 书架/资源汇集 |
| 历史记录 | `History` | 时钟回溯 |
| 侧边栏折叠 | `ChevronLeft` / `ChevronRight` | 展开/收起 |
| 落地页滚动 | `ArrowDown` | 向下提示 |
| 用户默认头像 | `User` | 未设置时占位 |

## 4. 主界面布局

### 整体结构

```
┌──────┬──────────────────────────────────────┐
│ 侧边栏 │ 内容区                                  │
│      │                                        │
│ Logo  │ 顶部: 模块标题 + 面包屑                   │
│ ──── │ ───────────────────────────────        │
│ 导航  │                                        │
│ 四项  │ 主体: 当前模块完整内容                     │
│      │                                        │
│ ──── │                                        │
│ 用户  │                                        │
│ 信息  │                                        │
└──────┴──────────────────────────────────────────┘
```

### 侧边栏

- **宽度**：展开 220px，收起 64px（仅图标），默认展开，可折叠
- **顶部**：「歧点」Logo + 品牌名（收起时仅 Logo）
- **四个导航项**：
  - `Sparkles` AI规划师 / Coach
  - `UserCircle` 个人画像 / Profile
  - `Database` 数据库 / Knowledge
  - `Library` 资源库 / Resources
- **选中态**：左侧 terracotta 竖线 + 背景微提亮 + 文字变 `--primary`
- **切换过渡**：内容区 200ms 淡入
- **底部用户区**：
  - 默认头像（首字缩写 + `--primary` 背景圆形）
  - 用户名 + 使用天数 + 对话次数
  - 「历史记录」按钮 → 展开抽屉面板

### 内容区

- **顶部栏**：模块标题 + 面包屑路径
- **主体**：模块内容，带 CSS transition 切换

## 5. 模块内容

### AI规划师（默认模块 / 首页）

- 当前 `ChatInterface` 移入此模块
- 能力诊断入口（职业输入 + CompetencyCard）位于对话上方
- 对话区保持现有功能不变

### 个人画像

- 顶部：角色卡（ProfileCard 已有）+ 能力画像（CompetencyCard 已有），左右并排
- 中部：成长轨迹区
  - 迷你统计卡片：对话次数、能力评估数、资源收藏数
  - 最近活动时间线（基于 localStorage 记录）
- 底部：如无数据则显示引导文案

### 数据库

- 知识原子浏览：按维度分类（薪资/教育/就业/趋势/政策/成本/生活/能力）
- 卡片列表 + 关键词搜索
- 每个原子展示标题 + 摘要 + 来源标注

### 资源库

- 现有 `ResourceBrowser` 组件移入此模块
- 保持 310+ 链接 + 分类筛选 + 搜索功能不变

## 6. 用户记录系统

### 侧边栏底部

- 头像圆形 `User` / 首字缩写
- 用户名（从 localStorage 读取，默认「探索者」）
- 使用天数（首次访问日期 → 今天）
- 对话次数（累计）

### 历史记录抽屉

点击侧边栏「历史记录」→ 右侧滑入抽屉面板（Sheet/Drawer）：

- 搜索框
- 活动时间线：
  - 生成能力画像 → 点击查看
  - 对话记录 → 点击继续对话
  - 更新个人画像 → 点击查看
- 底部统计：总对话 / 能力评估 / 资源收藏 / 画像完整度

### 数据存储

全部 localStorage：
- `career-compass-messages`：对话历史
- `career-compass-profile`：用户画像
- `career-compass-competency`：能力诊断数据
- `career-compass-activity`：活动记录（新增）
- `career-compass-settings`：用户偏好（新增，如侧边栏折叠状态）

不引入后端数据库。

## 7. 技术架构

### 路由设计

```
/                  → 落地页（首次访问/未开始过对话）
/main              → 主界面（已使用过/点击「进入歧点」）
  /main?tab=coach  → AI规划师（默认）
  /main?tab=profile → 个人画像
  /main?tab=knowledge → 数据库
  /main?tab=resources → 资源库
```

使用 URL search params 控制当前 Tab，支持直接链接到指定模块。

### 文件变更

```
新建：
  src/app/page.tsx                          # 重写为落地页
  src/app/main/page.tsx                     # 主界面（侧边栏 + 内容区）
  src/components/layout/Sidebar.tsx          # 侧边栏导航
  src/components/layout/AppLayout.tsx        # 主界面布局容器
  src/components/landing/HeroSection.tsx     # 落地页第一屏
  src/components/landing/FeatureGrid.tsx     # 落地页第二屏（四宫格）
  src/components/history/HistoryDrawer.tsx   # 历史记录抽屉
  src/components/history/ActivityTimeline.tsx # 活动时间线
  src/lib/activity-store.ts                 # 活动记录 localStorage 管理

修改：
  src/components/chat/ChatInterface.tsx      # 移除 ProfileCard 外层包装
  src/components/chat/ProfileCard.tsx        # 适配新布局
  src/components/chat/ResourceBrowser.tsx    # 适配新布局
  src/app/layout.tsx                         # 可能需要调整
```

### 状态管理

- 当前 Tab：URL search params（`useSearchParams`）
- 侧边栏折叠：localStorage + useState
- 用户活动记录：自定义 `useActivityLog` hook
- 对话/画像/能力：保持现有 localStorage 方案

## 8. 设计系统（保持现有）

不新增颜色 token，全部复用 shadcn CSS 变量：
- `--primary`: #C96442 (terracotta)
- `--background`: #FDF9F4 (cream)
- `--foreground`: #2C1A0E (espresso)
- `--border`: #D9C9B0 (taupe)
- `--card`: 白色卡片背景
- `--secondary`: 浅暖灰

噪点纹理 CSS：
```css
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
```

## 9. 开发顺序

1. 落地页（`/` 路由重写）
2. 主界面布局 + 侧边栏（`/main` 路由 + Sidebar + AppLayout）
3. AI规划师模块（ChatInterface 迁移）
4. 个人画像模块（ProfileCard + CompetencyCard 整合）
5. 数据库模块（知识原子浏览）
6. 资源库模块（ResourceBrowser 迁移）
7. 用户记录系统（活动日志 + 历史抽屉）
8. 动画与设计品质打磨

## 10. 成功指标

- 落地页 → 主界面过渡流畅，无闪烁
- 四模块切换 200ms 内完成
- 侧边栏折叠/展开动画 200ms
- localStorage 活动记录完整（对话、评估、收藏均记录）
- 所有页面通过 `npm run build` 生产构建
- 命中 6+ 设计品质项
