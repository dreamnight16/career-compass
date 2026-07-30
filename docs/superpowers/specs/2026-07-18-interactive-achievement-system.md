# 歧点互动化改造 — 成就系统 + 全站互动增强

> 目标：把"成就图鉴"从静态 SVG 路线图升级为全站互动核心，每个组件都有可玩性，留住用户。

## 优先级

**B(成就收集) → D(社交分享) → C(内容新鲜) → A(打卡进度)**

用户北极星指标：日活留存。核心策略：成就图鉴作为目的地页 + 全站互动钩子拉回流。

## 技术约束

- 纯前端，零后端依赖
- 所有持久化用 localStorage
- Next.js 14 App Router + TypeScript + Tailwind CSS
- 无动画框架依赖，纯 CSS `@keyframes` + Canvas 粒子系统
- 部署在 Vercel

---

## 一、架构总览

```
                    ┌──────────────────────────────┐
                    │     侧边栏 — 成就进度环        │
                    │  (始终可见，点击跳转成就图鉴)   │
                    └──────────┬───────────────────┘
                               │
    ┌──────────────┬───────────┼───────────┬──────────────┐
    │              │           ▼           │              │
    │  聊天反馈     │   ┌──────────────┐    │  决策摘要     │
    │  👍👎 按钮   │   │  成就图鉴中心  │    │  本周决定数   │
    │  行动按钮    │   │  (重头戏)     │    │  状态条      │
    │              │   │              │    │              │
    └──────────────┘   │ • 徽章墙     │    └──────────────┘
                       │ • 路线看板   │
                       │ • 打卡日历   │
                       │ • 统计面板   │
                       │ • 分享卡片   │
                       └──────────────┘
```

### 新增文件

| 文件 | 作用 |
|------|------|
| `src/lib/achievement-store.ts` | 成就定义 + 解锁逻辑 + localStorage |
| `src/lib/streak-store.ts` | 连续访问天数追踪 |
| `src/components/routes/AchievementWall.tsx` | 徽章墙网格 + 解锁动画 |
| `src/components/routes/RouteDashboard.tsx` | 交互式路线看板（拖拽+时间线+粒子连线） |
| `src/components/routes/StreakCalendar.tsx` | GitHub 风格热力图 |
| `src/components/routes/StatsPanel.tsx` | 统计摘要面板 |
| `src/components/routes/ShareCard.tsx` | 分享卡片生成 |
| `src/components/ui/badge-unlock.tsx` | 徽章解锁弹窗 + 粒子特效 |
| `src/components/ui/progress-ring.tsx` | 侧边栏进度环 SVG 组件 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `RouteBoard.tsx` | 重构为成就中心容器页，内部用 `useState` 管理子视图切换（徽章墙 / 路线看板 / 打卡日历 / 统计面板 / 分享卡片），不走 URL 参数 |
| `AppSidebar.tsx` | 添加进度环 + 微动效 |
| `ChatInterface.tsx` | 添加消息反馈按钮 |
| `MessageBubble.tsx` | 添加操作按钮行 |
| `DecisionJournal.tsx` | 添加本周摘要条 |
| `ResourceBrowser.tsx` | 卡片增强（收藏+分享+关联） |
| `globals.css` | 新增庆典动画 keyframes |
| `toast.tsx` | 升级为可点击、可堆叠 |

---

## 二、成就徽章系统

### 20 枚徽章，5 个类别

#### 🥇 路线里程碑（4 枚）

| 徽章 | 解锁条件 | 图标 |
|------|---------|------|
| 初出茅庐 | 生成第一条路线 | 🗺️ |
| 目标达成 | 完成一整条路线 | 🎯 |
| 双线并进 | 同时拥有 2 条活跃路线 | 🛤️ |
| 路线收藏家 | 累计生成 5 条路线 | 📚 |

#### 🔥 连续打卡（5 枚）

| 徽章 | 解锁条件 | 图标 |
|------|---------|------|
| 三日之约 | 连续 3 天访问 | 🔥 |
| 七日之约 | 连续 7 天访问 | 📅 |
| 半月坚持 | 连续 14 天 | 🌙 |
| 月度冠军 | 连续 30 天 | 👑 |
| 季常青 | 连续 90 天 | 🌲 |

#### 🔍 探索发现（4 枚）

| 徽章 | 解锁条件 | 图标 |
|------|---------|------|
| 初次探索 | 首次使用职业探索器 | 🔍 |
| 博学多才 | 浏览 50+ 条资源链接 | 🌐 |
| 数据达人 | 看过全部 3 个数据对比视图 | 📊 |
| 路径模拟 | 完成一次决策树模拟 | 🧭 |

#### 🧬 成长印记（4 枚）

| 徽章 | 解锁条件 | 图标 |
|------|---------|------|
| 自我认知 | 完成大五人格测评 | 🧬 |
| 职业画像 | 填写 6/8 维度画像 | 💼 |
| 能力评估 | 完成 3 次能力评估 | 🎓 |
| 决策新手 | 日志中完成 5 个决策 | 📝 |

#### 💎 特殊成就（3 枚）

| 徽章 | 解锁条件 | 图标 |
|------|---------|------|
| 全能选手 | 解锁 8+ 枚徽章 | 🌟 |
| 歧点大师 | 解锁 15+ 枚徽章 | 💎 |
| 夜猫子 | 晚上 10 点后使用过 3 次 | 🦉 |

### 数据模型

```typescript
interface AchievementDef {
  id: string;
  title: string;
  icon: string;
  category: 'route' | 'streak' | 'explore' | 'growth' | 'special';
  description: string;
  condition: string;            // 人类可读的解锁条件
  check: (ctx: AppContext) => boolean;
  progress?: (ctx: AppContext) => { current: number; target: number };
}

interface UnlockedAchievement {
  id: string;
  unlockedAt: string;           // ISO timestamp
}

interface AppContext {
  routes: Route[];
  streakDays: number;
  profile: Partial<UserProfile>;
  activities: ActivityEntry[];
  decisions: DecisionEntry[];
  resourceViews: number;
  compareViews: string[];       // 看过的对比视图名
  personalityDone: boolean;
  competencyCount: number;
  explorerUsed: boolean;
  simDone: boolean;
  nightVisits: number;
}
```

### 存储

- Key: `career-compass-achievements`
- Value: `UnlockedAchievement[]`
- 解锁逻辑：`checkAndUnlock(ctx: AppContext) => Achievement[]` 返回本次新解锁列表

### 解锁时机（钩子插入点）

| 事件 | 触发检查的类别 |
|------|---------------|
| 路线生成后 | route |
| 路线节点完成 | route |
| 页面访问 | streak + explore + special |
| 大五评测完成 | growth |
| 能力评估完成 | growth |
| 决策提交/确定 | growth |
| 资源浏览 | explore |
| 对比视图切换 | explore |
| 职业探索器使用 | explore |
| 决策树完成 | explore |

---

## 三、徽章墙 UI

### 布局

- 顶部：标题 "🏆 成就大厅" + 解锁进度 "已解锁 X / 20"
- 分类筛选栏：5 个分类按钮（路线 / 打卡 / 探索 / 成长 / 特殊），默认"全部"
- 徽章网格：4 列响应式网格（移动端 2 列）
- 每个徽章卡片 4 种状态：未解锁 / 进行中 / 已解锁 / 刚解锁

### 卡片状态设计

**未解锁**：图标灰阶 + blur，灰色文字，显示解锁条件
**进行中**：半透明彩色图标 + 呼吸脉冲动画，显示进度条 (current/target)
**已解锁**：彩色图标 + 微妙金色边框，显示解锁日期
**刚解锁**：弹簧弹入 + 金色光晕脉冲 + 粒子爆散 + 灰度→彩色过渡

### 筛选切换动画

卡片先缩小消失 (scale 0.8, opacity 0) → 布局重新排列 → 卡片弹入出现 (spring-in, stagger 50ms)

### 徽章 hover

上浮 4px + 阴影加深 + 边框发光（terracotta 色系光晕）

---

## 四、路线看板重设计

### 现状

`RouteBoard.tsx` 用 SVG foreignObject 渲染纵向节点链，只能点击节点 toggle 状态。

### 目标

每条路线一个可展开/折叠的卡片，包含：

| 区域 | 内容 |
|------|------|
| 卡片头部 | 进度环(SVG) + 路线标题 + 标签 + 薪资/时间 |
| 操作栏 | 编辑目标 / 重新生成 / 分享 / 删除 |
| 节点时间线 | 横向滚动 + 可拖拽排序 + 流动粒子连线 |
| 详情展开区 | 门槛条件 / 适合人群 / 数据来源 / 个人笔记 |

### 进度环

- SVG 圆环，`stroke-dashoffset` 过渡动画
- hover 放大 1.1x + 显示精确百分比 tooltip
- 颜色随进度变化：灰(<25%) → 橙(25-50%) → 绿(50-75%) → 金(75-100%)
- 完成时触发徽章检查 + 庆祝粒子

### 节点时间线

- **横向排列**，超出容器时可拖拽滚动（鼠标按下拖动 + 触摸支持）
- **节点可拖拽排序**：按住节点拖动，其他节点自动让位，松手弹回定位。排序结果持久化到 localStorage（修改 route-store 的 updateNodeOrder 方法），排序后连线自动重排
- **连线粒子流**：小光点沿连线从已完成节点流向当前活跃节点
  - 速度根据节点间距离自适应
  - 颜色从绿色渐变到橙色
  - 用 CSS animation + 多个小圆点实现
- **节点点击**：弹跳 0.3s → 绿色波纹扩散 → 连线粒子流到下一个节点 → 进度环数字递增
- **节点 hover**：放大 1.05x + 阴影提升 + 弹出详情气泡

### 操作动画

| 操作 | 动画 |
|------|------|
| 完成节点 | 弹跳 → 波纹扩散 → 粒子流 → 进度递增 |
| 废弃路线 | 卡片缩小消失 + 烟雾粒子 + Toast 确认 |
| 展开详情 | 手风琴展开 + 内容透明→不透明滑入 |
| 生成新路线 | 骨架屏 shimmer → 卡片从下弹入 |
| 编辑笔记 | 双击文字变输入框 + focus 边框发光 |
| 分享按钮 | 图标跳动 + tooltip |

---

## 五、打卡日历

### 初始化

在 `main/page.tsx` 的 `useEffect` 中调用 `recordVisit()`，每次页面加载时记录当日访问。

### 布局

GitHub 贡献图风格热力图：
- 7 行（周一~周日）× 约 26 列（半年）
- 顶部左右箭头翻月
- 左侧颜色图例（浅→深 = 互动次数）
- 底部动态提示

### 数据

`src/lib/streak-store.ts`：
- `recordVisit()` — 每次访问调用，记录日期
- `getStreak() => number` — 返回连续天数
- `getStreakHistory() => Date[]` — 过去 180 天所有访问日期
- 存储 key: `career-compass-streak`

### 互动

| 操作 | 反馈 |
|------|------|
| hover 格子 | tooltip 显示日期 + 互动次数 + 当天活动摘要 |
| 点击格子 | 高亮该天 + 下方展开当天活动详情列表 |
| 左右翻月 | 整行格子平滑滑动过渡 |
| 首次加载 | 格子从下往上逐行填充，stagger 30ms/行 |
| 今天有活动后 | 今日格子从当前色过渡到更深色 + 脉冲 |

---

## 六、统计面板

### 四大指标卡

| 指标 | 数据来源 |
|------|---------|
| 总决策数 | decision-store |
| 活跃路线 | route-store |
| 路线完成率 | route-store (completed/active) |
| 连续天数 | streak-store |

每个指标卡：
- 大数字（翻牌动画）
- 迷你趋势箭头（本月/本周变化）
- hover 变色 + 点击弹出详情列表

### 迷你趋势图

- SVG 折线图，显示本周每日互动次数
- hover 数据点显示 tooltip

### 子面板

- **最近解锁**：显示最近 3 个徽章，点击跳转徽章墙
- **本周待办**：AI 生成的个性化建议列表，点击跳转对应功能
- **对话统计**：本周/累计对话次数

### 导出数据

- 按钮 hover 时文件图标跳动
- 点击后生成 JSON 下载（已有功能，增加下载动画）

---

## 七、分享卡片

### 功能区

- 3 套视觉主题：简洁 / 炫彩 / 极简，实时切换
- 信息勾选开关：路线进度 / 徽章数量 / 连续天数 / 决策记录 / 能力雷达 / 个性标签
- 操作按钮：复制图片、保存本地、复制链接

### 卡片内容

```
╔══════════════════════════════╗
║  ✦ 歧点 · 我的职业成长报告 ✦ ║
║                              ║
║  ┌────┐  ┌────┐  ┌────┐    ║
║  │ 🗺️ │  │ 🔥 │  │ 🎯 │    ║
║  │ 3  │  │ 7  │  │ 42 │    ║
║  │路线│  │连击│  │完成│    ║
║  └────┘  └────┘  └────┘    ║
║                              ║
║  🏅 已解锁 3/20 枚成就徽章   ║
║                              ║
║  "自定义签名"                ║
║                              ║
║  扫码加入歧点 →              ║
╚══════════════════════════════╝
```

### 互动

| 操作 | 反馈 |
|------|------|
| 主题切换 | 卡片配色平滑过渡 0.4s |
| 勾选开关 | 对应区块缩小消失/弹入出现 |
| 复制图片 | 按钮变 ✅ + 卡片边框闪烁 |
| 保存本地 | 下载进度条动画 |
| 卡片 hover | CSS 3D 透视旋转（perspective + rotateY） |

---

## 八、全站互动钩子

### 侧边栏进度环

- SVG 环形进度条，放在成就图鉴导航项前
- 始终可见，颜色随进度变化（灰→橙→绿→金）
- 解锁新徽章时：环弹跳 + 数字翻牌 + 金色粒子飘出
- hover：放大 1.2x + 发光 + tooltip "X 枚徽章·查看成就"
- 点击：跳转成就图鉴

### 聊天反馈

- 每条 AI 回复底部新增操作栏：👍 有用 / 👎 没用 / 📋 复制 / 🔄 重新生成
- 👍/👎 点击后按钮弹跳 + 计数保存到 activity
- 📋 复制后按钮变 ✅ + toast
- 🔄 重新生成：当前回复淡出 + 新回复淡入
- 新增"试试这个"行动建议按钮，点击自动填入输入框 + 输入框边框闪烁

### 决策摘要条

- 决策日志页顶部固定吸顶
- 显示：待决定数 / 已决定数 / 总快照数
- 三个数字可点击筛选
- 最近决策预览
- AI 提示（打字机效果逐字出现）

### 资源卡片增强

- 收藏按钮始终可见，点击后星形旋转一周变实心
- 分享按钮
- 关联推荐（同类别其他资源）
- 卡片 hover 微倾斜 + 边框发光

### Toast 升级

- 支持点击跳转（如 "[查看成就 →]"）
- 成就解锁类 toast 优先显示
- 多个 toast 堆叠时自动折叠为 "N 条更新" 按钮
- 右滑关闭单条 toast

---

## 九、动画系统

### 新增 CSS @keyframes（写入 globals.css）

| 动画名 | 用途 |
|--------|------|
| `badge-enter` | 徽章卡片入场 stagger（上移+淡入+缩放） |
| `badge-colorize` | 徽章解锁：灰度→彩色 + blur→清晰 |
| `glow-pulse` | 金色光晕脉冲（新解锁徽章） |
| `progress-shimmer` | 进度条流光扫过 |
| `badge-bounce` | 徽章 hover 弹跳 |
| `flow-particle` | 路线节点连线流动粒子 |
| `ripple-out` | 节点完成波纹扩散 |
| `float-up` | 元素上浮 + 淡入 |
| `count-flip` | 数字翻牌效果 |

### 粒子系统

- Canvas 组件 `ParticleCanvas.tsx`
- 用于：徽章解锁弹窗、全路线完成庆祝、进度环金色粒子
- 粒子类型：金色光点、彩色纸屑（庆祝）、烟雾（放弃路线）

### Reduced Motion

所有动画在 `prefers-reduced-motion: reduce` 时禁用，元素直接显示最终状态。

---

## 十、实现顺序

| 阶段 | 内容 | 预估 |
|------|------|------|
| Phase 1 | 基础设施：achievement-store + streak-store + progress-ring + globals.css 动画 | 基础数据层 |
| Phase 2 | 徽章墙：AchievementWall + badge-unlock 弹窗 + 粒子系统 | 核心吸引 |
| Phase 3 | 路线看板：RouteDashboard（拖拽+时间线+粒子连线） | 深度互动 |
| Phase 4 | 打卡日历 + 统计面板：StreakCalendar + StatsPanel | 数据可视化 |
| Phase 5 | 分享卡片：ShareCard | 社交裂变 |
| Phase 6 | 全站钩子：侧边栏/聊天反馈/决策摘要/资源增强/Toast升级 | 粘性闭环 |
| Phase 7 | 解锁钩子插入：在所有触发点插入 checkAndUnlock 调用 | 串联所有 |
| Phase 8 | 调优：动画性能、移动端适配、reduced-motion | 打磨 |

---

## 十一、不做的事（明确边界）

- ❌ 后端 API / 数据库
- ❌ 用户登录系统
- ❌ 排行榜 / 好友系统（D 优先但一版不做社交网络）
- ❌ 推送通知（需要 Service Worker + 后端）
- ❌ 第三方动画库（framer-motion / GSAP）
- ❌ 国际化
