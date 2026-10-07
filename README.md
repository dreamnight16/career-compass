**语言 / Language:** [English](README.en.md) | [简体中文](README.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md)

# 歧点 — 看清每条岔路的样子

> 不是告诉你该选哪条路，而是让你看清楚每条路的样子，然后自己决定。

[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-orange)](https://ui.shadcn.com/)

---

## 为什么要做这个

上大学的时候，很多人到大三才开始想"我到底要干嘛"。考研？工作？考公？出国？每条路都有人说好有人说坑，不知道谁说的是真的。

小红书和知乎上到处都是"双非逆袭985"和"XX专业已死"，发帖的都是极端案例，沉默的大多数根本看不到。

这个项目做的事很简单：**把每条路真实的样子展示出来** 不替你判断，也不会给出什么标准答案。

---

## 核心原则

| 原则 | 含义 |
|------|------|
| **H-I-P（人主导规划）** | 助手只把 A、B 两条路的优势和风险摆出来，决定由你做 |
| **角色卡机制** | 8 维度渐进式信息收集，信息不足 6 维度不推荐 |
| **教决策框架** | 教你下次遇到类似问题时自己分析 |
| **数据可追溯** | 每条引用都标注知识条目 ID，可以点开核对来源 |
| **反幸存者偏差** | 数据是极端个例时明确指出 |

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/dreamnight16/career-compass.git
cd career-compass

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# AI 辅助是可选的；不填密钥也可以使用画像、资源库、数据对比、测评和路径模拟

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 开始使用。

### 开发命令

```bash
npm run dev        # 开发模式
npm run build      # 生产构建
npm run start      # 生产运行
npm run typecheck  # TypeScript 类型检查
npm run lint       # ESLint 检查
```

---

## 技术栈

| 技术 | 用途 |
|------|------|
| [Next.js 14](https://nextjs.org/) | 全栈框架 (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [shadcn/ui](https://ui.shadcn.com/) | UI 组件库 |
| [Tailwind CSS](https://tailwindcss.com/) | 样式系统 |
| [Claude API](https://docs.anthropic.com/) | 可选的 AI 对话与规划辅助 |
| [lucide-react](https://lucide.dev/) | 图标库 |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 会话存储 |

---

## 项目结构

```
career-compass/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/chat/         # AI 对话 API
│   │   ├── layout.tsx        # 根布局
│   │   ├── page.tsx          # 首页（顶栏切换）
│   │   └── globals.css       # 全局样式 + shadcn 主题
│   ├── components/
│   │   ├── chat/             # 聊天组件
│   │   │   ├── ChatInterface.tsx    # 聊天主界面
│   │   │   ├── MessageBubble.tsx    # 消息气泡
│   │   │   ├── ProfileCard.tsx      # 角色卡
│   │   │   └── ResourceBrowser.tsx  # 资源浏览器
│   │   └── ui/               # shadcn UI 组件
│   ├── data/
│   │   ├── resources.ts      # 资源索引（310+ 策展链接）
│   │   └── knowledge/        # 原子知识库（7 维度）
│   ├── lib/
│   │   ├── ai.ts             # AI 客户端
│   │   ├── rag.ts            # RAG 检索引擎
│   │   └── profile-extractor.ts  # 用户画像提取
│   └── types/
│       └── index.ts          # TypeScript 类型定义
├── knowledge-crawler/        # 知识库爬虫（Python）
├── docs/                     # 设计文档
├── .github/                  # GitHub Issue/PR 模板
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
└── LICENSE
```

---

## 资源索引

内置 **310+ 策展链接**，覆盖：
- 13 个教育部学科门类
- 84 项教育部白名单竞赛
- 45 个行业垂直招聘平台
- 科研暑研/学术会议/论文发表
- GitHub Awesome 系列（30+ 仓库）

**设计原则：不搬运数据，只索引「去哪找」。**

---

## 知识库爬虫

```bash
cd knowledge-crawler
pip install -r requirements.txt
export DEEPSEEK_API_KEY=sk-...

# 根据用户画像动态搜索
python main.py --profile '{"major":"金融学","targetCity":"上海","budget":200000}'

# 批量预置搜索
python main.py
```

---

## 贡献

欢迎贡献！详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

贡献方式：
- 新增/修正资源链接
- 完善知识库原子数据
- 改进 AI 提示词
- 报告 Bug 或提出功能请求

---

## 设计文档

- [产品设计文档](docs/superpowers/specs/2026-07-16-college-career-maze-design.md)
- [知识库设计文档](docs/superpowers/specs/2026-07-16-knowledge-base-redesign.md)
- [MVP 实现计划](docs/superpowers/plans/2026-07-16-college-career-maze-mvp.md)

---

## License

[MIT](./LICENSE)
