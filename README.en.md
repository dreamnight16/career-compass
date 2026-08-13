**Language:** [English](README.en.md) | [简体中文](README.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md)

# Divergence — See What Each Path Looks Like

> Not telling you which path to choose, but showing you what each path really looks like — then you decide.

[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-orange)](https://ui.shadcn.com/)

---

## Why This Exists

Many college students don't start thinking about their career until junior year. Grad school? Job hunting? Civil service? Study abroad? Every path has advocates and critics — it's hard to know who to trust.

Xiaohongshu and Zhihu are full of extreme cases: "non-elite school student gets into top grad program" or "X major is dead." The silent majority is invisible.

This project does one thing simply: **shows what each path really looks like** — without judging or giving standard answers.

---

## Core Principles

| Principle | Meaning |
|-----------|---------|
| **H-I-P (Human-in-Planning)** | AI never decides for you. It says "Path A: advantage X, risk Y. Path B: advantage W, risk Z" |
| **Role Card** | 8-dimension progressive profile. No recommendations before 6/8 dimensions filled |
| **Decision Framework** | Teaches you how to analyze similar choices yourself next time |
| **Data Traceability** | Every AI-cited data point links to a knowledge entry ID for source verification |
| **Anti-Survivorship Bias** | Explicitly flags when data represents extreme outliers |

---

## Quick Start

### Requirements

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
git clone https://github.com/dreamnight16/career-compass.git
cd career-compass

npm install

cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Dev Commands

```bash
npm run dev        # Development
npm run build      # Production build
npm run start      # Production server
npm run typecheck  # TypeScript type check
npm run lint       # ESLint
```

---

## Tech Stack

| Tech | Purpose |
|------|---------|
| [Next.js 14](https://nextjs.org/) | Full-stack framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [shadcn/ui](https://ui.shadcn.com/) | UI component library |
| [Tailwind CSS](https://tailwindcss.com/) | Styling system |
| [Claude API](https://docs.anthropic.com/) | AI chat engine |
| [lucide-react](https://lucide.dev/) | Icon library |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Session storage |

---

## Resource Index

Built-in **310+ curated links** covering:
- 13 MOE academic disciplines
- 84 MOE-approved competitions
- 45 industry-specific job platforms
- Research internships, academic conferences, paper publishing
- GitHub Awesome collections (30+ repos)

**Design principle: index where to find data, don't copy it.**

---

## Knowledge Crawler

```bash
cd knowledge-crawler
pip install -r requirements.txt
export DEEPSEEK_API_KEY=sk-...

# Dynamic search by user profile
python main.py --profile '{"major":"Finance","targetCity":"Shanghai","budget":200000}'

# Batch preset search
python main.py
```

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

Ways to contribute:
- Add/correct resource links
- Improve knowledge base atomic data
- Refine AI prompts
- Report bugs or request features

---

## License

[MIT](./LICENSE)
