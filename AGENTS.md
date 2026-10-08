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
- Tailwind CSS (DNDL tokens mapped to shadcn semantic variables)
- Codex API (Anthropic) / DeepSeek for chat
- Python knowledge crawler for data collection

## Key Files
- `src/app/page.tsx` — Landing page: hero with a real data snapshot + the four-stage board
- `src/components/landing/FeatureGrid.tsx` — 四段路歧路板 (stages × module entries, real counts)
- `src/data/catalog.ts` — real numbers shown on the landing page (computed from the data files)
- `src/app/main/page.tsx` — Main app shell: staged Ink rail + module content
- `src/components/layout/AppSidebar.tsx` — staged navigation rail (4 stages + optional coach)
- `src/components/chat/ChatInterface.tsx` — Main coaching chat
- `src/components/chat/ProfileCard.tsx` — 8-dimension role card
- `src/components/chat/ResourceBrowser.tsx` — Full-page resource directory (310+ links)
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

## Design System — DNDL (DreamNight Design Language)

The product uses DNDL v1.0 (implementation 1.1.0). Read `docs/design-process/dndl-adoption.md`
for how it is wired in, and `public/vendor/dndl/VERSION` for the pinned source.

- Token source of truth: `public/vendor/dndl/tokens.css` (loaded via `<link>` in `src/app/layout.tsx`).
  **These five vendored files are byte-identical to upstream — never edit values in place.**
- `src/app/globals.css` maps shadcn semantic variables onto `--dn-*` and defines the
  product-local `.cc-*` classes. Do not redefine brand primitives there.
- Use semantic tokens (`bg-background`, `text-foreground`, `border-border`) or the
  `bg-dn-*` / `text-dn-*` brand utilities. Never hardcode a colour.

Rules that are easy to get wrong:

- **Tailwind v3 silently drops opacity modifiers on `var()` colours.** `bg-primary/10`
  and `text-muted-foreground/40` generate *nothing*. Use full-strength tokens, or the
  `.cc-tint-*` classes for light tints.
- Text on a brand colour field uses `text-dn-on-color`; text on the Ink field uses
  `text-dn-on-ink`. Never `text-white`.
- `text-muted-foreground` (`#5B716B`) is the only secondary text colour allowed on light
  backgrounds. The raw `--dn-ink-muted` must not be used for small text.
- Default radius is 0. `rounded-full` is allowed only for avatars, icon circles and status dots.
- Shadows explain elevation only (Level 0/1 = none). Acrylic (`.dn-acrylic`) is for overlays
  only and must keep an opaque fallback.
- Entrance animation plays once on load (`.dn-rise` + `--dn-enter-index`); never replay it on
  data refresh. No decorative infinite motion.
- Never fabricate dynamic data. Static values must be labelled as static.
