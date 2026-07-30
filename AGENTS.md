# 歧点 — Project Context for AI Assistants

## What This Is
A career planning tool for Chinese university students. Helps students see the real costs and tradeoffs of each path so they can make their own decisions.

## Core Philosophy (NON-NEGOTIABLE)
- **H-I-P**: AI never says "你应该选X". It presents tradeoffs: "A has X salary but Y hours, B has W salary but Z freedom — which matters more to you?"
- **Role Card**: 8-dimension progressive profile building. Never recommend before 6/8 dimensions filled.
- **Data traceability**: Every AI claim must reference a source the user can verify.
- **Don't copy data, index where to find it**: The resource library links to authoritative sources, not our copies.

## Tech Stack
- Next.js 14 App Router + TypeScript strict
- Tailwind CSS (CSS variable theme: terracotta warm palette)
- Codex API (Anthropic) / DeepSeek for chat
- Python knowledge crawler for data collection

## Key Files
- `src/app/page.tsx` — Landing page with hero + feature grid
- `src/app/main/page.tsx` — Main app shell with sidebar navigation (8 modules)
- `src/components/chat/ChatInterface.tsx` — Main coaching chat
- `src/components/chat/ProfileCard.tsx` — 8-dimension role card
- `src/components/chat/ResourceBrowser.tsx` — Full-page resource directory (310+ links)
- `src/components/layout/AppSidebar.tsx` — Side navigation with 8 tabs
- `src/lib/rag.ts` — RAG retrieval + system prompt
- `src/lib/planner.ts` — Route generation from profile
- `src/lib/data-store.ts` — Unified data loading from public/data/*.json
- `src/data/resources.ts` — 310+ curated resource links (29 categories)
- `src/data/knowledge/` — Atomic knowledge facts (7 dimensions)

## Commands
```bash
npm run dev        # Development server
npm run build      # Production build
npm run typecheck  # tsc --noEmit
npm run test       # vitest
```

## Design System
All colors use shadcn CSS variables:
- `--primary`: #C96442 (terracotta)
- `--background`: #FDF9F4 (cream)
- `--foreground`: #2C1A0E (espresso)
- `--border`: #D9C9B0 (taupe)

Use semantic tokens (`bg-background`, `text-foreground`, `border-border`) in components, never hardcode colors.
