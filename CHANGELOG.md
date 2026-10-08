# Changelog

## [Unreleased]

### Changed
- 视觉语言整体迁移到 DNDL（DreamNight Design Language）v1.0 / 实现 1.1.0：
  品牌色板、直角几何、层级与阴影、动效曲线、Acrylic 材质规范
- DNDL 以确定版本引入到 `public/vendor/dndl/`（来源 `dreamnight16/dreamnight-design @ 3d0658e`），
  五个文件与上游逐字节一致，并在 `src/app/layout.tsx` 通过 `<link>` 加载
- 信息架构改为四段推进（看清自己 / 看清路 / 做决定 / 走下去）+ 可选辅助（决策教练）；
  8 个模块与 `?tab=` 取值、路由、数据流完全保留
- 首页改为不对称构图：排版 + 一块 Ink 实色场承载真实起薪分布与数据来源，
  第二屏为四块品牌实色场的「四段路」歧路板
- 导航改为 Ink 实色场上的阶段化导航轨，选中态使用整块品牌实色场
- Acrylic 只保留在覆盖层（移动端「更多」面板、抽屉、模态），并新增
  「覆盖层不透明」手动开关（写入 `[data-dn-transparency="off"]`）

### Fixed
- Tailwind v3 无法给 `var(--x)` 颜色应用透明度修饰符，全站 224 处
  `bg-primary/10`、`text-muted-foreground/40`、`border-border/30` 等类
  **从未生成过 CSS**，样式静默失效；已全部改为等价的实色 Token 或 `.cc-tint-*`
- 次要文字改用可读的 `--dn-text-secondary`（`#5B716B`），
  不再使用 `--dn-ink-muted` 或降低透明度的小字
- 移除无意义的持续运动（循环脉冲、流光、骨架微光、金色粒子），
  入场统一为一次性交错升入，不随数据刷新重播
- 修正文档与实现不一致：`AGENTS.md` / `CLAUDE.md` 描述的 terracotta 暖调、
  `tailwind.config.ts` 中 0 处使用的 `espresso/cream/terracotta/sage` 旧色，
  以及残留的 `#C96442` 焦点环已全部统一为 DNDL

### Added
- `docs/design-process/dndl-adoption.md` — DNDL 接入方式、信息架构推导与已知边界

## [0.1.0] - 2026-07-16

### Added
- AI 决策教练对话界面（基于 Claude API + RAG）
- 角色卡系统 — 8 维度渐进式信息收集
- 资源索引库 — 29 分类 / 310+ 策展链接
- 用户画像提取引擎
- 知识库爬虫系统（画像驱动搜索 + 权威源抓取 + 质量验证）
- shadcn/ui 组件库 + terracotta 暖调配色
- 顶栏切换：对话 / 资源库
- README / CONTRIBUTING / CODE_OF_CONDUCT / SECURITY
- MIT License

### Changed
- 知识库从路径匹配架构重构为原子事实架构
- AI 角色从"规划助手"重定位为"决策教练"

### Removed
- 预存职业路径（30 条）— 替换为原子知识库
