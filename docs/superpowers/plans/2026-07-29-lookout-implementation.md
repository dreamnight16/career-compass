# 望塔（Lookout）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two repositories — `maven` (shared AI+data npm library) and `lookout` (high school information gap platform) — plus seed content for 3-5 tracks.

**Architecture:** Three independent repositories. `maven` publishes 5 npm packages consumed by `lookout`. `lookout` is a Next.js 14 App Router app with 5 pages (home, track detail, timeline, resources, AI ask), file-driven content (Markdown/JSON), and a sky-blue youthful visual design.

**Tech Stack:** TypeScript strict, Next.js 14 App Router, Tailwind CSS 3, tsup (maven build), pnpm workspace (maven only), vitest, lucide-react, Vercel deploy.

## Global Constraints

- TypeScript strict mode in all projects
- No database — all content from Markdown/JSON files in `src/data/`
- No barrel files — use `exports` field in package.json for maven packages
- No hardcoded colors — use Tailwind CSS variable tokens only
- All copy in Chinese (zh-CN)
- Mobile-first responsive design
- No `console.log` in production code
- Immutable data patterns — create new objects, never mutate

---

## Part A: maven — Shared Library

### Task A1: Scaffold maven monorepo

**Files:**
- Create: `maven/pnpm-workspace.yaml`
- Create: `maven/package.json`
- Create: `maven/turbo.json`
- Create: `maven/.gitignore`
- Create: `maven/tooling/typescript/base.json`
- Create: `maven/tooling/typescript/package.json`
- Create: `maven/tooling/eslint/base.js`
- Create: `maven/tooling/eslint/package.json`

**Produces:** Monorepo root with pnpm workspace + turbo pipeline + shared tooling configs.

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "maven",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "turbo build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
  - "tooling/*"
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
.turbo/
*.tsbuildinfo
```

- [ ] **Step 5: Create tooling/typescript/base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 6: Create tooling/typescript/package.json**

```json
{
  "name": "@maven/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json"]
}
```

- [ ] **Step 7: Create tooling/eslint/base.js**

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', '.turbo/'],
};
```

- [ ] **Step 8: Create tooling/eslint/package.json**

```json
{
  "name": "@maven/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "base.js",
  "files": ["base.js"]
}
```

- [ ] **Step 9: Install and verify**

Run: `cd maven && pnpm install`
Expected: pnpm installs turbo and creates pnpm-lock.yaml

- [ ] **Step 10: Commit**

```bash
cd maven && git init && git add -A && git commit -m "chore: scaffold maven monorepo with turbo + pnpm workspace"
```

---

### Task A2: @maven/ai-types

**Files:**
- Create: `maven/packages/ai-types/package.json`
- Create: `maven/packages/ai-types/tsconfig.json`
- Create: `maven/packages/ai-types/tsup.config.ts`
- Create: `maven/packages/ai-types/src/message.ts`
- Create: `maven/packages/ai-types/src/api.ts`
- Create: `maven/packages/ai-types/src/index.ts`

**Produces:** `@maven/ai-types` — ChatMessage, ApiResponse, Source, KnowledgeAtom types.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@maven/ai-types",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@maven/tsconfig": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@maven/tsconfig/base.json",
  "include": ["src"],
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

- [ ] **Step 3: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

- [ ] **Step 4: Create src/message.ts**

```typescript
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface ChatSource {
  type: 'knowledge' | 'web' | 'inferred';
  title: string;
  url: string;
  trustLevel: 'verified' | 'community' | 'ai-inferred';
}

export interface KnowledgeAtom {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  sourceUrl: string;
  trustLevel: 'verified' | 'community' | 'ai-inferred';
  lastUpdated: string;
}
```

- [ ] **Step 5: Create src/api.ts**

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

- [ ] **Step 6: Create src/index.ts**

```typescript
export type { ChatMessage, Source, ChatSource, KnowledgeAtom } from './message.js';
export type { ApiResponse } from './api.js';
```

- [ ] **Step 7: Build, typecheck, test**

Run: `cd maven && pnpm run build --filter=@maven/ai-types`
Expected: tsup builds dist/index.js + dist/index.d.ts

Run: `cd maven && pnpm run typecheck --filter=@maven/ai-types`
Expected: tsc --noEmit passes

Run: `cd maven/packages/ai-types && npx vitest run`
Expected: no tests yet, exits 0

- [ ] **Step 8: Commit**

```bash
cd maven && git add packages/ai-types/ && git commit -m "feat(ai-types): add ChatMessage, ApiResponse, KnowledgeAtom types"
```

---

### Task A3: @maven/utils

**Files:**
- Create: `maven/packages/utils/package.json`
- Create: `maven/packages/utils/tsconfig.json`
- Create: `maven/packages/utils/tsup.config.ts`
- Create: `maven/packages/utils/src/cn.ts`
- Create: `maven/packages/utils/src/escape.ts`
- Create: `maven/packages/utils/src/cn.test.ts`
- Create: `maven/packages/utils/src/escape.test.ts`
- Create: `maven/packages/utils/src/index.ts`

**Produces:** `@maven/utils` — cn(), escapeHtml(), safeMarkdown().

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@maven/utils",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "@maven/tsconfig": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json** (same pattern as A2 Step 2)

```json
{
  "extends": "@maven/tsconfig/base.json",
  "include": ["src"],
  "compilerOptions": { "outDir": "dist" }
}
```

- [ ] **Step 3: Create tsup.config.ts** (same pattern as A2 Step 3)

```typescript
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

- [ ] **Step 4: Write failing test for cn()**

Create `src/cn.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { cn } from './cn.js';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('handles conditional classes via object', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});
```

- [ ] **Step 5: Run test to verify failure**

Run: `cd maven/packages/utils && npx vitest run`
Expected: FAIL — cn is not defined

- [ ] **Step 6: Implement cn()**

Create `src/cn.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7: Run test to verify pass**

Run: `cd maven/packages/utils && npx vitest run`
Expected: PASS (3 tests)

- [ ] **Step 8: Write failing test for escapeHtml + safeMarkdown**

Create `src/escape.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { escapeHtml, safeMarkdown } from './escape.js';

describe('escapeHtml', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('passes through safe text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('safeMarkdown', () => {
  it('converts **bold** to <strong>', () => {
    expect(safeMarkdown('hello **world** today')).toBe(
      'hello <strong>world</strong> today'
    );
  });

  it('converts newlines to <br/>', () => {
    expect(safeMarkdown('line1\nline2')).toBe('line1<br/>line2');
  });

  it('ignores code blocks', () => {
    const input = 'text with `code` block';
    expect(safeMarkdown(input)).toBe('text with `code` block');
  });
});
```

- [ ] **Step 9: Run test to verify failure**

Run: `cd maven/packages/utils && npx vitest run`
Expected: FAIL — escapeHtml, safeMarkdown not defined

- [ ] **Step 10: Implement escapeHtml + safeMarkdown**

Create `src/escape.ts`:

```typescript
const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ENTITIES[ch] ?? ch);
}

export function safeMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}
```

- [ ] **Step 11: Run all tests to verify pass**

Run: `cd maven/packages/utils && npx vitest run`
Expected: all 7 tests PASS

- [ ] **Step 12: Create src/index.ts**

```typescript
export { cn } from './cn.js';
export { escapeHtml, safeMarkdown } from './escape.js';
```

- [ ] **Step 13: Build**

Run: `cd maven && pnpm run build --filter=@maven/utils`
Expected: tsup builds successfully

- [ ] **Step 14: Commit**

```bash
cd maven && git add packages/utils/ && git commit -m "feat(utils): add cn(), escapeHtml(), safeMarkdown()"
```

---

### Task A4: @maven/ai-core

**Files:**
- Create: `maven/packages/ai-core/package.json`
- Create: `maven/packages/ai-core/tsconfig.json`
- Create: `maven/packages/ai-core/tsup.config.ts`
- Create: `maven/packages/ai-core/src/client.ts`
- Create: `maven/packages/ai-core/src/client.test.ts`
- Create: `maven/packages/ai-core/src/streaming.ts`
- Create: `maven/packages/ai-core/src/web-search.ts`
- Create: `maven/packages/ai-core/src/index.ts`

**Produces:** `@maven/ai-core` — multi-provider AI client, streaming protocol parser, web search.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@maven/ai-core",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    "./client": {
      "types": "./dist/client.d.ts",
      "import": "./dist/client.js"
    },
    "./streaming": {
      "types": "./dist/streaming.d.ts",
      "import": "./dist/streaming.js"
    },
    "./web-search": {
      "types": "./dist/web-search.d.ts",
      "import": "./dist/web-search.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@maven/ai-types": "workspace:*"
  },
  "devDependencies": {
    "@maven/tsconfig": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  },
  "peerDependencies": {
    "@anthropic-ai/sdk": "^0.32.0"
  },
  "peerDependenciesMeta": {
    "@anthropic-ai/sdk": {
      "optional": true
    }
  }
}
```

- [ ] **Step 2: Create tsconfig.json + tsup.config.ts** (same patterns as A3)

- [ ] **Step 3: Write failing test for streaming protocol parser**

Create `src/streaming.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseSourcesLine, stripDoneMarker } from './streaming.js';

describe('parseSourcesLine', () => {
  it('parses a valid JSON sources line', () => {
    const line = '{"type":"sources","data":[{"title":"test","url":"https://example.com","snippet":"desc"}]}';
    const result = parseSourcesLine(line);
    expect(result).toEqual([
      { title: 'test', url: 'https://example.com', snippet: 'desc' },
    ]);
  });

  it('returns null for non-sources lines', () => {
    expect(parseSourcesLine('hello world')).toBeNull();
    expect(parseSourcesLine('{"type":"message","data":"hi"}')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(parseSourcesLine('not json')).toBeNull();
  });
});

describe('stripDoneMarker', () => {
  it('removes [DONE] from end', () => {
    expect(stripDoneMarker('some text[DONE]')).toBe('some text');
  });

  it('removes [DONE] with space before it', () => {
    expect(stripDoneMarker('some text [DONE]')).toBe('some text ');
  });

  it('does nothing if no [DONE]', () => {
    expect(stripDoneMarker('normal text')).toBe('normal text');
  });
});
```

- [ ] **Step 4: Run to verify failure**

Run: `cd maven/packages/ai-core && npx vitest run`
Expected: FAIL

- [ ] **Step 5: Implement streaming.ts**

```typescript
import type { Source } from '@maven/ai-types';

export function parseSourcesLine(line: string): Source[] | null {
  try {
    const parsed = JSON.parse(line);
    if (parsed.type === 'sources' && Array.isArray(parsed.data)) {
      return parsed.data as Source[];
    }
    return null;
  } catch {
    return null;
  }
}

export function stripDoneMarker(text: string): string {
  return text.replace(/\s?\[DONE\]$/, '');
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `cd maven/packages/ai-core && npx vitest run`
Expected: PASS (6 tests)

- [ ] **Step 7: Write failing test for AI client**

Create `src/client.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildChatUrl, pickProvider } from './client.js';

describe('pickProvider', () => {
  it('returns anthropic when ANTHROPIC_API_KEY is set', () => {
    const result = pickProvider({ ANTHROPIC_API_KEY: 'sk-ant-test' });
    expect(result).toBe('anthropic');
  });

  it('returns deepseek when DEEPSEEK_API_KEY is set and no anthropic key', () => {
    const result = pickProvider({ DEEPSEEK_API_KEY: 'sk-ds-test' });
    expect(result).toBe('deepseek');
  });

  it('prefers anthropic over deepseek when both are set', () => {
    const result = pickProvider({
      ANTHROPIC_API_KEY: 'sk-ant-test',
      DEEPSEEK_API_KEY: 'sk-ds-test',
    });
    expect(result).toBe('anthropic');
  });

  it('returns null when no provider keys are set', () => {
    const result = pickProvider({});
    expect(result).toBeNull();
  });
});

describe('buildChatUrl', () => {
  it('builds DeepSeek chat URL', () => {
    expect(buildChatUrl('deepseek')).toBe(
      'https://api.deepseek.com/v1/chat/completions'
    );
  });

  it('throws for anthropic (uses SDK, not URL)', () => {
    expect(() => buildChatUrl('anthropic')).toThrow();
  });
});
```

- [ ] **Step 8: Run to verify failure**

Run: `cd maven/packages/ai-core && npx vitest run`
Expected: FAIL — client functions not found

- [ ] **Step 9: Implement client.ts**

```typescript
export type AIProvider = 'anthropic' | 'deepseek';

export function pickProvider(env: Record<string, string | undefined>): AIProvider | null {
  if (env.ANTHROPIC_API_KEY) return 'anthropic';
  if (env.DEEPSEEK_API_KEY) return 'deepseek';
  return null;
}

export function buildChatUrl(provider: AIProvider): string {
  switch (provider) {
    case 'deepseek':
      return 'https://api.deepseek.com/v1/chat/completions';
    case 'anthropic':
      throw new Error('Anthropic uses SDK, not direct URL. Use createAnthropicClient().');
  }
}
```

- [ ] **Step 10: Run all tests to verify pass**

Run: `cd maven/packages/ai-core && npx vitest run`
Expected: all tests PASS

- [ ] **Step 11: Implement web-search.ts**

```typescript
import type { Source } from '@maven/ai-types';

interface WebSearchOptions {
  query: string;
  maxResults?: number;
  timeout?: number;
  provider?: 'brave' | 'duckduckgo';
}

export async function searchWeb(opts: WebSearchOptions): Promise<Source[]> {
  const { query, maxResults = 8, timeout = 8000, provider = 'duckduckgo' } = opts;

  if (provider === 'brave' && process.env.BRAVE_API_KEY) {
    return searchBrave(query, maxResults, timeout);
  }
  return searchDuckDuckGo(query, maxResults, timeout);
}

async function searchBrave(
  query: string,
  maxResults: number,
  timeout: number
): Promise<Source[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': process.env.BRAVE_API_KEY!,
        },
        signal: controller.signal,
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return ((json.web?.results ?? []) as Array<Record<string, string>>).map(
      (r) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        snippet: r.description ?? '',
      })
    );
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function searchDuckDuckGo(
  query: string,
  maxResults: number,
  timeout: number
): Promise<Source[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );
    if (!res.ok) return [];
    const html = await res.text();
    return extractDuckDuckGoResults(html, maxResults);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function extractDuckDuckGoResults(html: string, maxResults: number): Source[] {
  const results: Source[] = [];
  const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
  const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  const links: Array<{ url: string; title: string }> = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null && links.length < maxResults) {
    links.push({ url: m[1] ?? '', title: m[2] ?? '' });
  }

  const snippets: string[] = [];
  while ((m = snippetRegex.exec(html)) !== null && snippets.length < maxResults) {
    snippets.push(m[1]?.replace(/<[^>]*>/g, '').trim() ?? '');
  }

  for (let i = 0; i < Math.min(links.length, maxResults); i++) {
    results.push({
      title: links[i]!.title,
      url: links[i]!.url,
      snippet: snippets[i] ?? '',
    });
  }
  return results;
}
```

- [ ] **Step 12: Create src/index.ts**

```typescript
export { pickProvider, buildChatUrl } from './client.js';
export type { AIProvider } from './client.js';
export { parseSourcesLine, stripDoneMarker } from './streaming.js';
export { searchWeb } from './web-search.js';
```

- [ ] **Step 13: Build and test**

Run: `cd maven && pnpm run build --filter=@maven/ai-core`
Expected: builds all entry points

Run: `cd maven/packages/ai-core && npx vitest run`
Expected: all tests PASS

- [ ] **Step 14: Commit**

```bash
cd maven && git add packages/ai-core/ && git commit -m "feat(ai-core): add AI client, streaming parser, web search"
```

---

### Task A5: @maven/stores

**Files:**
- Create: `maven/packages/stores/package.json`
- Create: `maven/packages/stores/tsconfig.json`
- Create: `maven/packages/stores/tsup.config.ts`
- Create: `maven/packages/stores/src/data-store.ts`
- Create: `maven/packages/stores/src/data-store.test.ts`
- Create: `maven/packages/stores/src/index.ts`

**Produces:** `@maven/stores` — generic fetch+ cache JSON data loader, localStorage-backed.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@maven/stores",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@maven/tsconfig": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json + tsup.config.ts** (same patterns)

- [ ] **Step 3: Write failing test for DataStore**

Create `src/data-store.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('createDataStore', () => {
  it('loads and caches data', async () => {
    // Dynamic import since we test the module
    const { createDataStore } = await import('./data-store.js');

    let fetchCount = 0;
    const mockFetch = async (_url: string) => {
      fetchCount++;
      return {
        ok: true,
        json: async () => ({ data: [{ id: '1', name: 'test' }] }),
      };
    };

    const store = createDataStore<{ id: string; name: string }>({
      endpoint: '/data/test.json',
      fetch: mockFetch as unknown as typeof fetch,
    });

    expect(store.isLoaded()).toBe(false);

    const result = await store.load();
    expect(result).toBe(true);
    expect(fetchCount).toBe(1);
    expect(store.getAll()).toEqual([{ id: '1', name: 'test' }]);
    expect(store.isLoaded()).toBe(true);

    // Second call should be cached, no re-fetch
    await store.load();
    expect(fetchCount).toBe(1);
  });
});
```

- [ ] **Step 4: Run to verify failure**

Run: `cd maven/packages/stores && npx vitest run`
Expected: FAIL

- [ ] **Step 5: Implement data-store.ts**

```typescript
interface DataStoreOptions<T> {
  endpoint: string;
  fetch?: typeof globalThis.fetch;
}

export interface DataStore<T> {
  load(): Promise<boolean>;
  getAll(): T[];
  findById(id: string): T | undefined;
  filter(predicate: (item: T) => boolean): T[];
  isLoaded(): boolean;
  hasError(): boolean;
  getError(): string | null;
}

export function createDataStore<T extends { id: string }>(
  opts: DataStoreOptions<T>
): DataStore<T> {
  const fetcher = opts.fetch ?? globalThis.fetch;
  let data: T[] = [];
  let loaded = false;
  let error: string | null = null;
  let loadPromise: Promise<void> | null = null;

  async function load(): Promise<boolean> {
    if (loaded) return true;
    if (loadPromise) {
      try {
        await loadPromise;
        return loaded;
      } catch {
        return false;
      }
    }

    loadPromise = (async () => {
      try {
        const res = await fetcher(opts.endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        data = (json.data ?? json) as T[];
        loaded = true;
      } catch (e) {
        error = e instanceof Error ? e.message : '数据加载失败';
      }
    })();

    try {
      await loadPromise;
      return loaded;
    } catch {
      return false;
    }
  }

  function getAll(): T[] {
    return data;
  }

  function findById(id: string): T | undefined {
    return data.find((item) => item.id === id);
  }

  function filter(predicate: (item: T) => boolean): T[] {
    return data.filter(predicate);
  }

  function isLoaded(): boolean {
    return loaded;
  }

  function hasError(): boolean {
    return !loaded && error !== null;
  }

  function getError(): string | null {
    return error;
  }

  return { load, getAll, findById, filter, isLoaded, hasError, getError };
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `cd maven/packages/stores && npx vitest run`
Expected: PASS

- [ ] **Step 7: Create src/index.ts**

```typescript
export { createDataStore } from './data-store.js';
export type { DataStore } from './data-store.js';
```

- [ ] **Step 8: Build and commit**

Run: `cd maven && pnpm run build --filter=@maven/stores`
Expected: builds successfully

```bash
cd maven && git add packages/stores/ && git commit -m "feat(stores): add generic createDataStore with fetch+cache"
```

---

### Task A6: @maven/session

**Files:**
- Create: `maven/packages/session/package.json`
- Create: `maven/packages/session/tsconfig.json`
- Create: `maven/packages/session/tsup.config.ts`
- Create: `maven/packages/session/src/session.ts`
- Create: `maven/packages/session/src/session.test.ts`
- Create: `maven/packages/session/src/index.ts`

**Produces:** `@maven/session` — generic progressive profiling state machine.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@maven/session",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@maven/tsconfig": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json + tsup.config.ts** (same patterns)

- [ ] **Step 3: Write failing test for SessionMachine**

Create `src/session.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('createSessionMachine', () => {
  it('starts in collect stage', async () => {
    const { createSessionMachine } = await import('./session.js');

    const machine = createSessionMachine({
      dimensions: [
        { key: 'grade', label: '年级', question: '你现在几年级？' },
        { key: 'interest', label: '兴趣', question: '你对什么方向感兴趣？' },
        { key: 'province', label: '省份', question: '你在哪个省？' },
      ],
      collectThreshold: 2,
    });

    expect(machine.getStage()).toBe('collect');
    const next = machine.nextMissingDimension({});
    expect(next).toEqual({ key: 'grade', label: '年级', question: '你现在几年级？' });
  });

  it('transitions to ready stage when threshold met', async () => {
    const { createSessionMachine } = await import('./session.js');

    const machine = createSessionMachine({
      dimensions: [
        { key: 'a', label: 'A', question: '?' },
        { key: 'b', label: 'B', question: '?' },
        { key: 'c', label: 'C', question: '?' },
      ],
      collectThreshold: 2,
    });

    expect(machine.getStage()).toBe('collect');

    machine.setValue('a', 'v1');
    machine.setValue('b', 'v2');

    expect(machine.getStage()).toBe('ready');
  });

  it('returns null when all dimensions filled', async () => {
    const { createSessionMachine } = await import('./session.js');

    const machine = createSessionMachine({
      dimensions: [{ key: 'a', label: 'A', question: '?' }],
      collectThreshold: 1,
    });

    machine.setValue('a', 'v1');
    const next = machine.nextMissingDimension({ a: 'v1' });
    expect(next).toBeNull();
  });
});
```

- [ ] **Step 4: Run to verify failure**

Run: `cd maven/packages/session && npx vitest run`
Expected: FAIL

- [ ] **Step 5: Implement session.ts**

```typescript
export interface Dimension {
  key: string;
  label: string;
  question: string;
}

export interface SessionConfig {
  dimensions: Dimension[];
  collectThreshold: number;
  initialStage?: 'collect' | 'ready';
}

export type Stage = 'collect' | 'ready';

export interface SessionMachine {
  getStage(): Stage;
  setValue(key: string, value: string): void;
  getValues(): Record<string, string>;
  nextMissingDimension(currentValues: Record<string, string>): Dimension | null;
  getFilledCount(currentValues: Record<string, string>): number;
}

export function createSessionMachine(config: SessionConfig): SessionMachine {
  const { dimensions, collectThreshold, initialStage = 'collect' } = config;
  const values: Record<string, string> = {};

  function getFilledCount(currentValues: Record<string, string>): number {
    return dimensions.filter((d) => Boolean(currentValues[d.key])).length;
  }

  function getStage(): Stage {
    if (getFilledCount(values) >= collectThreshold) return 'ready';
    return initialStage;
  }

  function setValue(key: string, value: string): void {
    values[key] = value;
  }

  function getValues(): Record<string, string> {
    return { ...values };
  }

  function nextMissingDimension(
    currentValues: Record<string, string>
  ): Dimension | null {
    for (const dim of dimensions) {
      if (!currentValues[dim.key]) return dim;
    }
    return null;
  }

  return { getStage, setValue, getValues, nextMissingDimension, getFilledCount };
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `cd maven/packages/session && npx vitest run`
Expected: PASS (3 tests)

- [ ] **Step 7: Create src/index.ts**

```typescript
export { createSessionMachine } from './session.js';
export type { Dimension, SessionConfig, Stage, SessionMachine } from './session.js';
```

- [ ] **Step 8: Build and commit**

Run: `cd maven && pnpm run build --filter=@maven/session`
Expected: builds

Run: `cd maven && pnpm run build`
Expected: all packages build successfully

```bash
cd maven && git add packages/session/ && git commit -m "feat(session): add generic progressive profiling state machine"
```

---

## Part B: lookout — High School Information Platform

### Task B1: Scaffold lookout Next.js project

**Files:**
- Create: `lookout/package.json`
- Create: `lookout/tsconfig.json`
- Create: `lookout/next.config.js`
- Create: `lookout/tailwind.config.ts`
- Create: `lookout/postcss.config.js`
- Create: `lookout/src/app/globals.css`
- Create: `lookout/src/app/layout.tsx`
- Create: `lookout/.gitignore`

**Produces:** Working Next.js 14 project with Tailwind + sky-blue design tokens.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "lookout",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@maven/ai-core": "^0.1.0",
    "@maven/ai-types": "^0.1.0",
    "@maven/stores": "^0.1.0",
    "@maven/utils": "^0.1.0",
    "lucide-react": "^0.400.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] },
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@maven/ai-core', '@maven/ai-types', '@maven/utils', '@maven/stores'],
};
module.exports = nextConfig;
```

- [ ] **Step 4: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        accent: '#F59E0B',
        background: '#F0F4FF',
        surface: '#FFFFFF',
        foreground: '#1E293B',
        muted: '#64748B',
        competition: '#7C3AED',
        enrollment: '#059669',
        art: '#DB2777',
        sport: '#EA580C',
        overseas: '#0891B2',
        vocational: '#4F46E5',
      },
      borderRadius: {
        card: '12px',
        chip: '999px',
      },
      fontFamily: {
        display: ['"Noto Sans SC"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(37,99,235,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
```

- [ ] **Step 7: Create src/app/layout.tsx**

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '望塔 — 看见同龄人的路',
  description: '全国各地高中生在走什么路、用什么资源、什么时候做什么。打破信息差。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-background text-foreground font-body min-h-screen">
        <main className="max-w-lg mx-auto pb-16">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Create .gitignore**

```
node_modules/
.next/
out/
*.tsbuildinfo
```

- [ ] **Step 9: Install and verify dev server**

Run: `cd lookout && npm install && npm run dev`
Expected: Next.js dev server starts on :3000, visit shows empty page with blue-ish background

- [ ] **Step 10: Commit**

```bash
cd lookout && git init && git add -A && git commit -m "chore: scaffold lookout Next.js 14 project with sky-blue design system"
```

---

### Task B2: Data model types + seed content

**Files:**
- Create: `lookout/src/types/index.ts`
- Create: `lookout/src/data/tracks/informatics-olympiad.json`
- Create: `lookout/src/data/tracks/strong-base-plan.json`
- Create: `lookout/src/data/tracks/comprehensive-evaluation.json`
- Create: `lookout/src/data/resources/index.json`
- Create: `lookout/src/data/timeline/index.json`

**Produces:** Type definitions + 3 seed tracks with resources and timeline nodes.

- [ ] **Step 1: Create src/types/index.ts**

```typescript
export type TrackCategory = 'competition' | 'enrollment' | 'art' | 'sport' | 'overseas' | 'vocational';

export interface TimelineNode {
  grade: string;
  month: number;
  event: string;
  action: string;
  deadline?: string;
}

export interface LinkedResource {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface TrackCard {
  id: string;
  name: string;
  category: TrackCategory;
  oneLiner: string;
  overview: string;
  suitableFor: string[];
  notSuitableFor: string[];
  keyNodes: TimelineNode[];
  resources: LinkedResource[];
}

export type ResourceType = 'book' | 'course' | 'tool' | 'community' | 'official' | 'article' | 'video';
export type ResourceCost = 'free' | 'paid' | 'freemium';

export interface ResourceEntry {
  id: string;
  name: string;
  url: string;
  description: string;
  type: ResourceType;
  cost: ResourceCost;
  tracks: string[];
  gradeRange: [number, number];
  tags: string[];
}

export interface GlobalTimelineNode {
  grade: string;
  month: number;
  event: string;
  action: string;
  tracks: string[];
  deadline?: string;
}
```

- [ ] **Step 2: Create seed track — 信息学竞赛**

Create `src/data/tracks/informatics-olympiad.json`:

```json
{
  "id": "informatics-olympiad",
  "name": "信息学竞赛",
  "category": "competition",
  "oneLiner": "用算法敲开名校大门",
  "overview": "信息学奥林匹克竞赛（NOI系列）是五大学科竞赛之一。从省级联赛（NOIP）到全国决赛（NOI）再到国际竞赛（IOI），成绩优异者可获得保送或降分录取资格。\n\n**核心考试内容：** 算法设计、数据结构、C++编程。\n\n**适合省份：** 浙江、江苏、广东等竞赛强省有完善的培训体系。弱省学生需要更强的自学能力。",
  "suitableFor": [
    "理科思维突出",
    "能坚持长期训练（至少1-2年）",
    "有一定数学基础",
    "对编程有好奇心"
  ],
  "notSuitableFor": [
    "想高三再突击——竞赛需要长期积累",
    "不喜欢长时间对着电脑",
    "所在学校没有竞赛教练且自驱力不足"
  ],
  "keyNodes": [
    { "grade": "高一上", "month": 9, "event": "开始学习C++基础语法", "action": "找一本入门教材，每天1小时练习" },
    { "grade": "高一上", "month": 10, "event": "参加CSP-J/S第一轮", "action": "检测自己目前水平", "deadline": "2025-09-15" },
    { "grade": "高一下", "month": 4, "event": "省选（部分省份）", "action": "进入省队的关键一战" },
    { "grade": "高二上", "month": 10, "event": "NOIP 联赛", "action": "冲刺省一等奖" },
    { "grade": "高二下", "month": 4, "event": "省选", "action": "争取进入省队" },
    { "grade": "高二下", "month": 7, "event": "NOI 全国决赛", "action": "金牌保送清北，银牌强基破格" }
  ],
  "resources": [
    { "id": "luogu", "name": "洛谷", "url": "https://www.luogu.com.cn/", "description": "国内最大的OI刷题社区，有题库、题解、比赛" },
    { "id": "oi-wiki", "name": "OI Wiki", "url": "https://oi-wiki.org/", "description": "信息学竞赛知识百科，覆盖所有算法和数据结构" },
    { "id": "codeforces", "name": "Codeforces", "url": "https://codeforces.com/", "description": "国际算法竞赛平台，锻炼实战能力" }
  ]
}
```

- [ ] **Step 3: Create seed track — 强基计划**

Create `src/data/tracks/strong-base-plan.json`:

```json
{
  "id": "strong-base-plan",
  "name": "强基计划",
  "category": "enrollment",
  "oneLiner": "基础学科的国家赛道",
  "overview": "强基计划是2020年起实施的招生改革，聚焦数学、物理、化学、生物、信息学、历史、哲学、古文字等基础学科。由36所双一流A类高校招生。\n\n**录取方式：** 高考成绩（85%）+ 校考（15%），竞赛银牌及以上可破格入围。\n\n**注意：** 强基录取后原则上不能转专业，选择前要确定自己真的热爱基础学科。",
  "suitableFor": [
    "对基础学科有真实兴趣",
    "高考成绩在省内排名靠前（一本线以上）",
    "有竞赛经历可以加分但不是必须",
    "愿意长期深耕一个领域"
  ],
  "notSuitableFor": [
    "想通过强基作为跳板转热门专业——政策不允许",
    "对基础学科无感、只想要名校光环",
    "高考成绩在一本线以下（无报考资格）"
  ],
  "keyNodes": [
    { "grade": "高一上", "month": 9, "event": "了解强基计划政策", "action": "阅读教育部文件和各校招生简章" },
    { "grade": "高二下", "month": 4, "event": "判断是否适合强基", "action": "结合兴趣和成绩，决定是否要走这条路" },
    { "grade": "高三上", "month": 12, "event": "关注各校强基简章发布", "action": "提前锁定目标院校" },
    { "grade": "高三下", "month": 4, "event": "强基报名", "action": "网上报名，选择院校和专业" },
    { "grade": "高三下", "month": 6, "event": "参加高考", "action": "高考成绩是入围的关键" },
    { "grade": "高三下", "month": 7, "event": "校考", "action": "笔试+面试+体测" }
  ],
  "resources": [
    { "id": "moe-strong-base", "name": "教育部强基计划专题", "url": "https://gaokao.chsi.com.cn/gkzt/jcxkzs", "description": "官方政策解读和报名入口" },
    { "id": "tsinghua-qiangji", "name": "清华强基经验帖", "url": "https://www.zhihu.com/topic/21056828", "description": "知乎上清华强基过来人的经验分享" }
  ]
}
```

- [ ] **Step 4: Create seed track — 综合评价**

Create `src/data/tracks/comprehensive-evaluation.json`:

```json
{
  "id": "comprehensive-evaluation",
  "name": "综合评价招生",
  "category": "enrollment",
  "oneLiner": "不只看分数的一条路",
  "overview": "综合评价招生是部分高校（如南方科技大学、上海纽约大学、昆山杜克大学等）采用的多元录取方式。不同于纯看高考分，综合评价会考察学生的综合素质、面试表现、高中成绩等。\n\n**适合：** 成绩中上但不算顶尖，有特长或社会实践经历的学生。",
  "suitableFor": [
    "成绩在省内中上水平",
    "有课外活动、社会实践、志愿服务等经历",
    "表达能力好，面试不怯场",
    "英语能力较强（部分中外合作院校）"
  ],
  "notSuitableFor": [
    "高考成绩非常突出（走统招可能去更好的学校）",
    "没有任何课外经历、简历空白",
    "面试表达能力很弱且不愿意练习"
  ],
  "keyNodes": [
    { "grade": "高一", "month": 9, "event": "开始积累综合素质材料", "action": "参与社团、志愿服务、竞赛，保留证明材料" },
    { "grade": "高二", "month": 9, "event": "持续积累+了解目标院校", "action": "研究各校综评简章，针对性准备" },
    { "grade": "高三上", "month": 12, "event": "各校综评报名开始", "action": "准备材料、写自荐信", "deadline": "2025-12-31" },
    { "grade": "高三下", "month": 6, "event": "高考后校考/面试", "action": "准备中英文面试" }
  ],
  "resources": [
    { "id": "sustech-admission", "name": "南科大招生网", "url": "https://zs.sustech.edu.cn/", "description": "综合评价招生标杆院校" },
    { "id": "nyush-admission", "name": "上纽大招生", "url": "https://shanghai.nyu.edu/cn/admissions", "description": "中外合作办学综评代表" }
  ]
}
```

- [ ] **Step 5: Create seed resources index**

Create `src/data/resources/index.json`:

```json
[
  {
    "id": "luogu",
    "name": "洛谷",
    "url": "https://www.luogu.com.cn/",
    "description": "国内最大的OI刷题社区，海量题库+题解+定期比赛",
    "type": "tool",
    "cost": "freemium",
    "tracks": ["informatics-olympiad"],
    "gradeRange": [10, 12],
    "tags": ["编程", "算法", "竞赛"]
  },
  {
    "id": "oi-wiki",
    "name": "OI Wiki",
    "url": "https://oi-wiki.org/",
    "description": "信息学竞赛知识百科，覆盖所有算法与数据结构，开源协作",
    "type": "article",
    "cost": "free",
    "tracks": ["informatics-olympiad"],
    "gradeRange": [10, 12],
    "tags": ["编程", "算法", "知识库"]
  },
  {
    "id": "codeforces",
    "name": "Codeforces",
    "url": "https://codeforces.com/",
    "description": "全球最大算法竞赛平台，定期举办比赛，锻炼实战能力",
    "type": "tool",
    "cost": "free",
    "tracks": ["informatics-olympiad"],
    "gradeRange": [10, 12],
    "tags": ["编程", "算法", "比赛"]
  },
  {
    "id": "moe-strong-base",
    "name": "教育部强基计划专题",
    "url": "https://gaokao.chsi.com.cn/gkzt/jcxkzs",
    "description": "阳光高考网强基计划官方入口，政策+报名",
    "type": "official",
    "cost": "free",
    "tracks": ["strong-base-plan"],
    "gradeRange": [11, 12],
    "tags": ["政策", "强基", "官方"]
  },
  {
    "id": "tsinghua-qiangji",
    "name": "清华强基经验帖合集",
    "url": "https://www.zhihu.com/topic/21056828",
    "description": "知乎上清华强基过来人的经验分享",
    "type": "community",
    "cost": "free",
    "tracks": ["strong-base-plan"],
    "gradeRange": [11, 12],
    "tags": ["强基", "经验", "面试"]
  },
  {
    "id": "sustech-admission",
    "name": "南方科技大学招生网",
    "url": "https://zs.sustech.edu.cn/",
    "description": "综合评价招生标杆院校，每年12月发布综评简章",
    "type": "official",
    "cost": "free",
    "tracks": ["comprehensive-evaluation"],
    "gradeRange": [11, 12],
    "tags": ["综合评价", "招生", "官方"]
  },
  {
    "id": "nyush-admission",
    "name": "上海纽约大学招生",
    "url": "https://shanghai.nyu.edu/cn/admissions",
    "description": "中外合作办学综合评价招生代表，校园日面试",
    "type": "official",
    "cost": "free",
    "tracks": ["comprehensive-evaluation"],
    "gradeRange": [11, 12],
    "tags": ["综合评价", "中外合作", "面试"]
  },
  {
    "id": "acwing",
    "name": "AcWing",
    "url": "https://www.acwing.com/",
    "description": "算法学习平台，有系统的课程体系，从入门到进阶",
    "type": "course",
    "cost": "freemium",
    "tracks": ["informatics-olympiad"],
    "gradeRange": [10, 12],
    "tags": ["编程", "算法", "课程"]
  }
]
```

- [ ] **Step 6: Create seed timeline index**

Create `src/data/timeline/index.json`:

```json
[
  { "grade": "高一上", "month": 9, "event": "CSP-J/S 第一轮认证报名", "action": "关注NOI官网，及时报名", "tracks": ["informatics-olympiad"], "deadline": "2025-09-15" },
  { "grade": "高一上", "month": 9, "event": "开始了解各条升学路径", "action": "浏览望塔赛道页面，了解竞赛、强基、综评的区别", "tracks": ["informatics-olympiad", "strong-base-plan", "comprehensive-evaluation"] },
  { "grade": "高一上", "month": 10, "event": "CSP-S 第二轮", "action": "参加认证，检验水平", "tracks": ["informatics-olympiad"] },
  { "grade": "高一下", "month": 3, "event": "省选（部分省份）", "action": "进入省队的关键一战", "tracks": ["informatics-olympiad"] },
  { "grade": "高二上", "month": 10, "event": "NOIP 联赛", "action": "冲刺省一等奖", "tracks": ["informatics-olympiad"] },
  { "grade": "高二上", "month": 12, "event": "部分院校综评简章发布", "action": "关注目标院校招生网", "tracks": ["comprehensive-evaluation"] },
  { "grade": "高二下", "month": 7, "event": "NOI 全国决赛", "action": "金牌前50名保送清北", "tracks": ["informatics-olympiad"] },
  { "grade": "高三上", "month": 12, "event": "综合评价报名集中期", "action": "准备自荐信、证明材料，网上报名", "tracks": ["comprehensive-evaluation"], "deadline": "2025-12-31" },
  { "grade": "高三下", "month": 4, "event": "强基计划招生简章发布", "action": "锁定目标院校，网上报名", "tracks": ["strong-base-plan"] },
  { "grade": "高三下", "month": 6, "event": "高考", "action": "所有赛道的基础", "tracks": ["informatics-olympiad", "strong-base-plan", "comprehensive-evaluation"] },
  { "grade": "高三下", "month": 7, "event": "强基校考 / 综评面试", "action": "准备笔试面试，展示综合素质", "tracks": ["strong-base-plan", "comprehensive-evaluation"] }
]
```

- [ ] **Step 7: Commit**

```bash
cd lookout && git add src/types/ src/data/ && git commit -m "feat(data): add types + 3 seed tracks with resources and timeline"
```

---

### Task B3: Data loaders

**Files:**
- Create: `lookout/src/lib/tracks.ts`
- Create: `lookout/src/lib/resources.ts`
- Create: `lookout/src/lib/timeline.ts`
- Create: `lookout/src/lib/tracks.test.ts`
- Create: `lookout/src/lib/resources.test.ts`
- Create: `lookout/src/lib/timeline.test.ts`

**Produces:** Three data-loading modules that read content from JSON files.

- [ ] **Step 1: Write failing test for tracks loader**

Create `src/lib/tracks.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('tracks lib', () => {
  it('getAllTracks returns array', async () => {
    const { getAllTracks } = await import('./tracks');
    const tracks = getAllTracks();
    expect(Array.isArray(tracks)).toBe(true);
    expect(tracks.length).toBeGreaterThanOrEqual(3);
  });

  it('getTrackById returns a track', async () => {
    const { getTrackById } = await import('./tracks');
    const track = getTrackById('informatics-olympiad');
    expect(track).toBeDefined();
    expect(track!.name).toBe('信息学竞赛');
  });

  it('getTrackById returns undefined for missing id', async () => {
    const { getTrackById } = await import('./tracks');
    expect(getTrackById('nonexistent')).toBeUndefined();
  });

  it('getTracksByCategory filters correctly', async () => {
    const { getTracksByCategory } = await import('./tracks');
    const comp = getTracksByCategory('competition');
    expect(comp.length).toBeGreaterThanOrEqual(1);
    expect(comp.every((t) => t.category === 'competition')).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd lookout && npx vitest run`
Expected: FAIL

- [ ] **Step 3: Implement tracks.ts**

```typescript
import type { TrackCard, TrackCategory } from '@/types';
import informaticsOlympiad from '@/data/tracks/informatics-olympiad.json';
import strongBasePlan from '@/data/tracks/strong-base-plan.json';
import comprehensiveEvaluation from '@/data/tracks/comprehensive-evaluation.json';

const tracks: TrackCard[] = [
  informaticsOlympiad as TrackCard,
  strongBasePlan as TrackCard,
  comprehensiveEvaluation as TrackCard,
];

export function getAllTracks(): TrackCard[] {
  return tracks;
}

export function getTrackById(id: string): TrackCard | undefined {
  return tracks.find((t) => t.id === id);
}

export function getTracksByCategory(category: TrackCategory | 'all'): TrackCard[] {
  if (category === 'all') return tracks;
  return tracks.filter((t) => t.category === category);
}
```

- [ ] **Step 4: Implement resources.ts**

```typescript
import type { ResourceEntry, ResourceType, ResourceCost } from '@/types';
import resourcesData from '@/data/resources/index.json';

const resources: ResourceEntry[] = resourcesData as ResourceEntry[];

export function getAllResources(): ResourceEntry[] {
  return resources;
}

export function getResourceById(id: string): ResourceEntry | undefined {
  return resources.find((r) => r.id === id);
}

export function getResourcesByTrack(trackId: string): ResourceEntry[] {
  return resources.filter((r) => r.tracks.includes(trackId));
}

export function filterResources(opts: {
  type?: ResourceType;
  cost?: ResourceCost;
  search?: string;
  trackId?: string;
}): ResourceEntry[] {
  let result = resources;
  if (opts.trackId) {
    result = result.filter((r) => r.tracks.includes(opts.trackId));
  }
  if (opts.type) {
    result = result.filter((r) => r.type === opts.type);
  }
  if (opts.cost) {
    result = result.filter((r) => r.cost === opts.cost);
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return result;
}
```

- [ ] **Step 5: Implement timeline.ts**

```typescript
import type { GlobalTimelineNode } from '@/types';
import timelineData from '@/data/timeline/index.json';

const timeline: GlobalTimelineNode[] = timelineData as GlobalTimelineNode[];

export function getAllTimelineNodes(): GlobalTimelineNode[] {
  return timeline;
}

export function getTimelineByGrade(grade: string): GlobalTimelineNode[] {
  return timeline.filter((n) => n.grade === grade);
}

export function getTimelineByTrack(trackId: string): GlobalTimelineNode[] {
  return timeline.filter((n) => n.tracks.includes(trackId));
}

export function getGrades(): string[] {
  return ['高一上', '高一下', '高二上', '高二下', '高三上', '高三下'];
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `cd lookout && npx vitest run`
Expected: tracks tests PASS

- [ ] **Step 7: Commit**

```bash
cd lookout && git add src/lib/ && git commit -m "feat(lib): add tracks, resources, timeline data loaders"
```

---

### Task B4: Shared UI components

**Files:**
- Create: `lookout/src/components/shared/TagBadge.tsx`
- Create: `lookout/src/components/shared/EmptyState.tsx`
- Create: `lookout/src/components/shared/LoadingSkeleton.tsx`

**Produces:** TagBadge, EmptyState, LoadingSkeleton — used across all pages.

- [ ] **Step 1: Create TagBadge.tsx**

```typescript
interface TagBadgeProps {
  label: string;
  colorClass?: string;
}

export function TagBadge({ label, colorClass = 'bg-primary/10 text-primary' }: TagBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-chip ${colorClass}`}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create EmptyState.tsx**

```typescript
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create LoadingSkeleton.tsx**

```typescript
interface LoadingSkeletonProps {
  count?: number;
  height?: string;
}

export function LoadingSkeleton({ count = 3, height = 'h-32' }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-background animate-pulse rounded-card border border-primary/10`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd lookout && git add src/components/shared/ && git commit -m "feat(ui): add TagBadge, EmptyState, LoadingSkeleton shared components"
```

---

### Task B5: Layout — BottomNav + PageHeader

**Files:**
- Create: `lookout/src/components/layout/BottomNav.tsx`
- Create: `lookout/src/components/layout/PageHeader.tsx`
- Create: `lookout/src/components/layout/BottomNav.test.tsx`

**Produces:** Persistent bottom tab navigation + reusable page header.

- [ ] **Step 1: Create BottomNav.tsx**

```typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, BookOpen, MessageCircle } from 'lucide-react';

const TABS = [
  { id: 'home', label: '发现', icon: Home, href: '/' },
  { id: 'timeline', label: '时间线', icon: Calendar, href: '/timeline' },
  { id: 'resources', label: '资源库', icon: BookOpen, href: '/resources' },
  { id: 'ask', label: 'AI 问问', icon: MessageCircle, href: '/ask' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-primary/10 z-50">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {TABS.map((tab) => {
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-card transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create PageHeader.tsx**

```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-4 pt-6 pb-3">
      <h1 className="text-2xl font-bold font-display text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd lookout && git add src/components/layout/ && git commit -m "feat(layout): add BottomNav and PageHeader"
```

---

### Task B6: Home page — track discovery

**Files:**
- Create: `lookout/src/components/home/TrackCard.tsx`
- Create: `lookout/src/components/home/CategoryFilter.tsx`
- Create: `lookout/src/app/page.tsx`

**Produces:** Home page with category filter + track card grid.

- [ ] **Step 1: Create TrackCard.tsx**

```typescript
import Link from 'next/link';
import { TagBadge } from '@/components/shared/TagBadge';
import type { TrackCard as TrackCardType } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  competition: 'bg-competition/10 text-competition',
  enrollment: 'bg-enrollment/10 text-enrollment',
  art: 'bg-art/10 text-art',
  sport: 'bg-sport/10 text-sport',
  overseas: 'bg-overseas/10 text-overseas',
  vocational: 'bg-vocational/10 text-vocational',
};

const CATEGORY_LABELS: Record<string, string> = {
  competition: '竞赛',
  enrollment: '升学',
  art: '艺考',
  sport: '体育',
  overseas: '出国',
  vocational: '职教',
};

interface TrackCardProps {
  track: TrackCardType;
}

export function TrackCard({ track }: TrackCardProps) {
  const catColor = CATEGORY_COLORS[track.category] ?? 'bg-primary/10 text-primary';

  return (
    <Link href={`/tracks/${track.id}`}>
      <article className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow p-4 border border-primary/5">
        <div className="flex items-center gap-2 mb-2">
          <TagBadge
            label={CATEGORY_LABELS[track.category] ?? track.category}
            colorClass={catColor}
          />
        </div>
        <h3 className="text-lg font-bold font-display text-foreground mb-1">
          {track.name}
        </h3>
        <p className="text-sm text-muted mb-3">{track.oneLiner}</p>
        <div className="flex flex-wrap gap-1.5">
          {track.suitableFor.slice(0, 3).map((s) => (
            <TagBadge key={s} label={s} colorClass="bg-accent/10 text-accent" />
          ))}
        </div>
      </article>
    </Link>
  );
}
```

- [ ] **Step 2: Create CategoryFilter.tsx**

```typescript
import type { TrackCategory } from '@/types';

const FILTERS: Array<{ id: TrackCategory | 'all'; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'competition', label: '竞赛' },
  { id: 'enrollment', label: '升学' },
  { id: 'art', label: '艺考' },
  { id: 'sport', label: '体育' },
  { id: 'overseas', label: '出国' },
  { id: 'vocational', label: '职教' },
];

interface CategoryFilterProps {
  selected: TrackCategory | 'all';
  onSelect: (id: TrackCategory | 'all') => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`shrink-0 px-4 py-1.5 rounded-chip text-sm font-medium transition-colors ${
            selected === f.id
              ? 'bg-primary text-white'
              : 'bg-surface text-muted hover:text-foreground border border-primary/10'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrackCard } from '@/components/home/TrackCard';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAllTracks, getTracksByCategory } from '@/lib/tracks';
import type { TrackCategory } from '@/types';

export default function HomePage() {
  const [category, setCategory] = useState<TrackCategory | 'all'>('all');
  const tracks = getTracksByCategory(category);
  const allTracks = getAllTracks();

  return (
    <>
      <PageHeader
        title="望塔"
        subtitle={`看看全国同龄人在走什么路 · ${allTracks.length} 条赛道`}
      />
      <CategoryFilter selected={category} onSelect={setCategory} />
      <div className="px-4 space-y-3">
        {tracks.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="暂无赛道"
            description="这个分类下还没有内容，我们会尽快补充"
          />
        ) : (
          tracks.map((track) => <TrackCard key={track.id} track={track} />)
        )}
      </div>
      <BottomNav />
    </>
  );
}
```

- [ ] **Step 4: Verify dev server**

Run: `cd lookout && npm run dev`
Expected: Homepage at localhost:3000 shows 3 track cards + bottom nav

- [ ] **Step 5: Commit**

```bash
cd lookout && git add src/app/page.tsx src/components/home/ && git commit -m "feat(home): add track discovery with category filter"
```

---

### Task B7: Track detail page

**Files:**
- Create: `lookout/src/components/track/TrackOverview.tsx`
- Create: `lookout/src/components/track/TrackTimeline.tsx`
- Create: `lookout/src/components/track/TrackResources.tsx`
- Create: `lookout/src/app/tracks/[id]/page.tsx`

**Produces:** Full track detail: what it is, who it's for, timeline, resources.

- [ ] **Step 1: Create TrackOverview.tsx**

```typescript
import type { TrackCard } from '@/types';
import { TagBadge } from '@/components/shared/TagBadge';

interface TrackOverviewProps {
  track: TrackCard;
}

export function TrackOverview({ track }: TrackOverviewProps) {
  return (
    <div className="px-4 space-y-4">
      <section>
        <h2 className="text-lg font-bold font-display mb-2">📖 这是什么路</h2>
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {track.overview}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold font-display mb-2">✅ 适合你，如果</h2>
        <div className="flex flex-wrap gap-2">
          {track.suitableFor.map((s) => (
            <TagBadge key={s} label={s} colorClass="bg-enrollment/10 text-enrollment" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold font-display mb-2">❌ 不适合你，如果</h2>
        <div className="flex flex-wrap gap-2">
          {track.notSuitableFor.map((s) => (
            <TagBadge key={s} label={s} colorClass="bg-sport/10 text-sport" />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create TrackTimeline.tsx**

```typescript
import type { TimelineNode } from '@/types';

interface TrackTimelineProps {
  nodes: TimelineNode[];
}

export function TrackTimeline({ nodes }: TrackTimelineProps) {
  const byGrade = new Map<string, TimelineNode[]>();
  for (const node of nodes) {
    const existing = byGrade.get(node.grade) ?? [];
    existing.push(node);
    byGrade.set(node.grade, existing);
  }

  return (
    <div className="px-4 space-y-4">
      <h2 className="text-lg font-bold font-display">📅 关键时间节点</h2>
      {Array.from(byGrade.entries()).map(([grade, gradeNodes]) => (
        <div key={grade}>
          <h3 className="text-sm font-semibold text-primary mb-2">{grade}</h3>
          <div className="space-y-2">
            {gradeNodes.map((node, i) => (
              <div
                key={i}
                className="flex gap-3 pl-3 border-l-2 border-primary/20"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{node.event}</p>
                  <p className="text-xs text-muted mt-0.5">{node.action}</p>
                  {node.deadline && (
                    <p className="text-xs text-accent mt-0.5">⏰ {node.deadline}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create TrackResources.tsx**

```typescript
import Link from 'next/link';
import type { LinkedResource } from '@/types';
import { ExternalLink } from 'lucide-react';

interface TrackResourcesProps {
  resources: LinkedResource[];
}

export function TrackResources({ resources }: TrackResourcesProps) {
  return (
    <div className="px-4 space-y-3">
      <h2 className="text-lg font-bold font-display">📚 配套资源</h2>
      {resources.map((r) => (
        <a
          key={r.id}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-surface rounded-card border border-primary/10 p-3 hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{r.name}</span>
            <ExternalLink size={14} className="text-muted" />
          </div>
          <p className="text-xs text-muted mt-1">{r.description}</p>
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create page.tsx**

```typescript
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { TrackOverview } from '@/components/track/TrackOverview';
import { TrackTimeline } from '@/components/track/TrackTimeline';
import { TrackResources } from '@/components/track/TrackResources';
import { getTrackById } from '@/lib/tracks';
import { BottomNav } from '@/components/layout/BottomNav';

interface TrackPageProps {
  params: { id: string };
}

export default function TrackPage({ params }: TrackPageProps) {
  const track = getTrackById(params.id);
  if (!track) notFound();

  return (
    <>
      <PageHeader title={track.name} subtitle={track.oneLiner} />
      <div className="space-y-6 pb-4">
        <TrackOverview track={track} />
        {track.keyNodes.length > 0 && <TrackTimeline nodes={track.keyNodes} />}
        {track.resources.length > 0 && <TrackResources resources={track.resources} />}
      </div>
      <BottomNav />
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd lookout && git add src/app/tracks/ src/components/track/ && git commit -m "feat(track): add track detail page with overview, timeline, resources"
```

---

### Task B8: Timeline page

**Files:**
- Create: `lookout/src/components/timeline/GradeSelector.tsx`
- Create: `lookout/src/components/timeline/TimelineList.tsx`
- Create: `lookout/src/app/timeline/page.tsx`

**Produces:** Timeline page with grade selector + event list.

- [ ] **Step 1: Create GradeSelector.tsx**

```typescript
import { getGrades } from '@/lib/timeline';

interface GradeSelectorProps {
  selected: string;
  onSelect: (grade: string) => void;
}

export function GradeSelector({ selected, onSelect }: GradeSelectorProps) {
  const grades = getGrades();

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
      <button
        onClick={() => onSelect('all')}
        className={`shrink-0 px-3 py-1.5 rounded-chip text-sm font-medium transition-colors ${
          selected === 'all'
            ? 'bg-primary text-white'
            : 'bg-surface text-muted hover:text-foreground border border-primary/10'
        }`}
      >
        全部
      </button>
      {grades.map((g) => (
        <button
          key={g}
          onClick={() => onSelect(g)}
          className={`shrink-0 px-3 py-1.5 rounded-chip text-sm font-medium transition-colors ${
            selected === g
              ? 'bg-primary text-white'
              : 'bg-surface text-muted hover:text-foreground border border-primary/10'
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create TimelineList.tsx**

```typescript
import type { GlobalTimelineNode } from '@/types';

interface TimelineListProps {
  nodes: GlobalTimelineNode[];
}

const GRADE_ORDER = ['高一上', '高一下', '高二上', '高二下', '高三上', '高三下'];

export function TimelineList({ nodes }: TimelineListProps) {
  const byGrade = new Map<string, GlobalTimelineNode[]>();
  for (const node of nodes) {
    const existing = byGrade.get(node.grade) ?? [];
    existing.push(node);
    byGrade.set(node.grade, existing);
  }

  const sortedGrades = Array.from(byGrade.keys()).sort(
    (a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b)
  );

  return (
    <div className="px-4 space-y-6">
      {sortedGrades.map((grade) => (
        <div key={grade}>
          <h3 className="text-sm font-bold text-primary mb-3 sticky top-0 bg-background py-1">
            {grade}
          </h3>
          <div className="space-y-3">
            {byGrade.get(grade)!.map((node, i) => (
              <div
                key={i}
                className="flex gap-3 pl-3 border-l-2 border-primary/20"
              >
                <div className="flex-1 bg-surface rounded-card p-3 shadow-card">
                  <p className="text-sm font-medium text-foreground">
                    {node.event}
                  </p>
                  <p className="text-xs text-muted mt-1">{node.action}</p>
                  {node.deadline && (
                    <p className="text-xs text-accent mt-1 font-medium">
                      ⏰ 截止：{node.deadline}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create page.tsx**

```typescript
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { GradeSelector } from '@/components/timeline/GradeSelector';
import { TimelineList } from '@/components/timeline/TimelineList';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAllTimelineNodes } from '@/lib/timeline';

export default function TimelinePage() {
  const [grade, setGrade] = useState('all');
  const allNodes = getAllTimelineNodes();

  const filtered = useMemo(
    () => (grade === 'all' ? allNodes : allNodes.filter((n) => n.grade === grade)),
    [grade, allNodes]
  );

  return (
    <>
      <PageHeader
        title="时间线"
        subtitle="每个阶段该做什么，一目了然"
      />
      <GradeSelector selected={grade} onSelect={setGrade} />
      {filtered.length === 0 ? (
        <EmptyState icon="📅" title="暂无节点" description="这个阶段还没有内容" />
      ) : (
        <TimelineList nodes={filtered} />
      )}
      <BottomNav />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd lookout && git add src/app/timeline/ src/components/timeline/ && git commit -m "feat(timeline): add timeline page with grade filter"
```

---

### Task B9: Resources page

**Files:**
- Create: `lookout/src/components/resources/ResourceCard.tsx`
- Create: `lookout/src/components/resources/ResourceFilter.tsx`
- Create: `lookout/src/components/resources/ResourceSearch.tsx`
- Create: `lookout/src/app/resources/page.tsx`

**Produces:** Resources page with search, type/cost filter, card grid.

- [ ] **Step 1: Create ResourceSearch.tsx**

```typescript
interface ResourceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResourceSearch({ value, onChange }: ResourceSearchProps) {
  return (
    <div className="px-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索资源..."
        className="w-full px-4 py-2.5 rounded-card border border-primary/10 bg-surface text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/30 transition-colors"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create ResourceFilter.tsx**

```typescript
import type { ResourceType, ResourceCost } from '@/types';

const TYPES: Array<{ id: ResourceType | 'all'; label: string }> = [
  { id: 'all', label: '全部类型' },
  { id: 'book', label: '书籍' },
  { id: 'course', label: '课程' },
  { id: 'tool', label: '工具' },
  { id: 'community', label: '社区' },
  { id: 'official', label: '官方' },
  { id: 'article', label: '文章' },
  { id: 'video', label: '视频' },
];

const COSTS: Array<{ id: ResourceCost | 'all'; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'free', label: '免费' },
  { id: 'freemium', label: '部分免费' },
  { id: 'paid', label: '付费' },
];

interface ResourceFilterProps {
  type: ResourceType | 'all';
  cost: ResourceCost | 'all';
  onTypeChange: (t: ResourceType | 'all') => void;
  onCostChange: (c: ResourceCost | 'all') => void;
}

export function ResourceFilter({
  type,
  cost,
  onTypeChange,
  onCostChange,
}: ResourceFilterProps) {
  return (
    <div className="px-4 space-y-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => onTypeChange(t.id)}
            className={`shrink-0 px-3 py-1 rounded-chip text-xs font-medium transition-colors ${
              type === t.id
                ? 'bg-primary text-white'
                : 'bg-surface text-muted hover:text-foreground border border-primary/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {COSTS.map((c) => (
          <button
            key={c.id}
            onClick={() => onCostChange(c.id)}
            className={`shrink-0 px-3 py-1 rounded-chip text-xs font-medium transition-colors ${
              cost === c.id
                ? 'bg-accent text-white'
                : 'bg-surface text-muted hover:text-foreground border border-primary/10'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ResourceCard.tsx**

```typescript
import { ExternalLink } from 'lucide-react';
import { TagBadge } from '@/components/shared/TagBadge';
import type { ResourceEntry } from '@/types';

const COST_LABELS: Record<string, string> = {
  free: '免费',
  paid: '付费',
  freemium: '部分免费',
};

const COST_COLORS: Record<string, string> = {
  free: 'bg-enrollment/10 text-enrollment',
  paid: 'bg-sport/10 text-sport',
  freemium: 'bg-accent/10 text-accent',
};

interface ResourceCardProps {
  resource: ResourceEntry;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-surface rounded-card border border-primary/10 p-4 shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground flex-1 mr-2">
          {resource.name}
        </h3>
        <ExternalLink size={14} className="text-muted shrink-0 mt-0.5" />
      </div>
      <p className="text-xs text-muted mb-3">{resource.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <TagBadge
          label={COST_LABELS[resource.cost] ?? resource.cost}
          colorClass={COST_COLORS[resource.cost] ?? 'bg-primary/10 text-primary'}
        />
        {resource.tags.slice(0, 3).map((t) => (
          <TagBadge key={t} label={t} colorClass="bg-primary/10 text-primary" />
        ))}
      </div>
    </a>
  );
}
```

- [ ] **Step 4: Create page.tsx**

```typescript
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { ResourceSearch } from '@/components/resources/ResourceSearch';
import { ResourceFilter } from '@/components/resources/ResourceFilter';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { filterResources } from '@/lib/resources';
import type { ResourceType, ResourceCost } from '@/types';

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<ResourceType | 'all'>('all');
  const [cost, setCost] = useState<ResourceCost | 'all'>('all');

  const results = useMemo(
    () =>
      filterResources({
        search: search || undefined,
        type: type === 'all' ? undefined : type,
        cost: cost === 'all' ? undefined : cost,
      }),
    [search, type, cost]
  );

  return (
    <>
      <PageHeader title="资源库" subtitle="同龄人在用这些资源" />
      <div className="space-y-3 pb-4">
        <ResourceSearch value={search} onChange={setSearch} />
        <ResourceFilter
          type={type}
          cost={cost}
          onTypeChange={setType}
          onCostChange={setCost}
        />
        <div className="px-4 space-y-3">
          {results.length === 0 ? (
            <EmptyState icon="📚" title="没有找到" description="试试换个搜索词或筛选条件" />
          ) : (
            results.map((r) => <ResourceCard key={r.id} resource={r} />)
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd lookout && git add src/app/resources/ src/components/resources/ && git commit -m "feat(resources): add resource library with search and filters"
```

---

### Task B10: Ask page — AI-powered search

**Files:**
- Create: `lookout/src/components/ask/AskInput.tsx`
- Create: `lookout/src/components/ask/AskResult.tsx`
- Create: `lookout/src/app/ask/page.tsx`

**Produces:** Simple AI-assisted search: student types situation → gets track + resource recommendations.

- [ ] **Step 1: Create AskInput.tsx**

```typescript
interface AskInputProps {
  onSubmit: (query: string) => void;
  loading: boolean;
}

export function AskInput({ onSubmit, loading }: AskInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('query') as HTMLInputElement;
    const query = input.value.trim();
    if (query && !loading) {
      onSubmit(query);
      input.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4">
      <div className="flex gap-2">
        <input
          name="query"
          type="text"
          placeholder="比如：我是河南高二理科生，对计算机感兴趣..."
          className="flex-1 px-4 py-3 rounded-card border border-primary/10 bg-surface text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/30 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-primary text-white rounded-card text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? '思考中...' : '提问'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create AskResult.tsx**

```typescript
import { TrackCard } from '@/components/home/TrackCard';
import { ResourceCard } from '@/components/resources/ResourceCard';
import type { TrackCard as TrackCardType, ResourceEntry } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';

interface AskResultProps {
  query: string;
  tracks: TrackCardType[];
  resources: ResourceEntry[];
}

export function AskResult({ query, tracks, resources }: AskResultProps) {
  const hasResults = tracks.length > 0 || resources.length > 0;

  return (
    <div className="px-4 space-y-4">
      <p className="text-sm text-muted">
        关于「{query}」的结果：
      </p>
      {!hasResults && (
        <EmptyState
          icon="💬"
          title="没有精确匹配"
          description="换个方式描述你的情况试试，或者直接浏览赛道页面"
        />
      )}
      {tracks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2">相关赛道</h3>
          <div className="space-y-2">
            {tracks.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        </div>
      )}
      {resources.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2">相关资源</h3>
          <div className="space-y-2">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create page.tsx**

```typescript
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { AskInput } from '@/components/ask/AskInput';
import { AskResult } from '@/components/ask/AskResult';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAllTracks } from '@/lib/tracks';
import { filterResources } from '@/lib/resources';

export default function AskPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const allTracks = getAllTracks();

  const handleSubmit = async (q: string) => {
    setQuery(q);
    setSubmitted(true);
    setLoading(true);
    // Simulate AI search delay — in production, call @maven/ai-core client
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
  };

  const matchTracks = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return allTracks.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.oneLiner.toLowerCase().includes(q) ||
        t.suitableFor.some((s) => s.toLowerCase().includes(q)) ||
        t.overview.toLowerCase().includes(q)
    );
  }, [query, allTracks]);

  const matchResources = useMemo(() => {
    if (!query) return [];
    return filterResources({ search: query });
  }, [query]);

  return (
    <>
      <PageHeader
        title="AI 问问"
        subtitle="说说你的情况，帮你找到适合的赛道和资源"
      />
      <div className="space-y-4 pb-4">
        <AskInput onSubmit={handleSubmit} loading={loading} />
        {!submitted && (
          <EmptyState
            icon="💬"
            title="不知道怎么问？"
            description="试试：'我想走竞赛' 或 '河南理科生有什么升学途径'"
          />
        )}
        {submitted && !loading && (
          <AskResult query={query} tracks={matchTracks} resources={matchResources} />
        )}
      </div>
      <BottomNav />
    </>
  );
}
```

- [ ] **Step 4: Full build verification**

Run: `cd lookout && npm run build`
Expected: Next.js production build succeeds

- [ ] **Step 5: Commit**

```bash
cd lookout && git add src/app/ask/ src/components/ask/ && git commit -m "feat(ask): add AI-assisted search page"
```

---

## Verification Checklist

After all tasks complete:

- [ ] `maven/`: `pnpm run build` passes (all 5 packages)
- [ ] `maven/`: `pnpm run test` passes
- [ ] `maven/`: `pnpm run typecheck` passes
- [ ] `lookout/`: `npm run build` passes (Next.js production build)
- [ ] `lookout/`: `npm run typecheck` passes
- [ ] `lookout/`: `npm run test` passes
- [ ] `lookout/`: Visit `localhost:3000` — home page shows 3 track cards
- [ ] `lookout/`: Click a track card → detail page with overview + timeline + resources
- [ ] `lookout/`: Visit `/timeline` → grade filter + event list
- [ ] `lookout/`: Visit `/resources` → search + filter + card grid
- [ ] `lookout/`: Visit `/ask` → type query → see track + resource matches
- [ ] Bottom navigation works across all pages
