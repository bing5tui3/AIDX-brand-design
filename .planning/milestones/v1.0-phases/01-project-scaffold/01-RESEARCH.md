# Phase 1: Project Scaffold - Research

**Researched:** 2026-04-16
**Domain:** Next.js 16 App Router scaffold, CSS design tokens, local fonts, TypeScript config, Biome linting
**Confidence:** HIGH — all findings verified directly from Ghostty source (local clone) per D-01

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Mirror the Ghostty website source at `~/Developments/ghostty-org/website`. Planner MUST read this repo directly for config files, dependency versions, and architectural patterns — not infer from memory.
- **D-02:** Use the exact Next.js version from `~/Developments/ghostty-org/website/package.json`. Do not pin to 15 or latest — read the Ghostty package.json and match it exactly.
- **D-03:** Define ALL CSS custom properties in `src/styles/globals.css` during Phase 1 — brand color, gray scale, header/footer heights, callout colors, AND syntax highlight (atom-one) classes. Phase 2 components consume tokens; they do not define them.
- **D-04:** Copy `pretendard-std-variable.woff2` from `~/Developments/ghostty-org/website/src/components/text/font/pretendard-std-variable.woff2`. Place at `src/components/text/font/pretendard-std-variable.woff2`.
- **D-05:** JetBrains Mono loaded from Google Fonts (no local file needed).

### Claude's Discretion
- Exact Biome rule configuration (copy from Ghostty's biome.json verbatim)
- Directory skeleton creation (create all `src/` subdirectories upfront for Phase 2 readiness)
- `next.config.mjs` MDX pipeline setup (copy from Ghostty, swap brand-specific values)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SETUP-01 | Next.js 15+, TypeScript, Biome configured matching Ghostty | Ghostty package.json verified: next `^16.1.6`, typescript `^5.9.3`, @biomejs/biome `^2.4.4` |
| SETUP-02 | package.json with all required dependencies | Full dep list verified from Ghostty package.json — see Standard Stack |
| SETUP-03 | tsconfig.json with `@/*` path alias → `./src/*` | Ghostty tsconfig.json verified verbatim — see Code Examples |
| SETUP-04 | biome.json for TypeScript/TSX linting and formatting | Ghostty biome.json verified verbatim — see Code Examples |
| SETUP-05 | next.config.mjs with MDX pipeline | Ghostty next.config.mjs verified — requires 3 local plugin files as stubs in Phase 1 |
| STYLE-01 | globals.css with all CSS custom properties | Full token set verified from Ghostty globals.css — brand color swap documented |
| STYLE-02 | Print mode inverts color scheme via `@media print` | Verified in Ghostty globals.css — full inverted gray scale + atom-one print values |
| STYLE-03 | `.hljs-*` syntax highlighting classes defined globally | Verified in Ghostty globals.css — atom-one-dark theme, 12 class groups |
| FONT-01 | Pretendard Std Variable as local font from woff2 | File confirmed at Ghostty source path; Next.js `localFont` pattern required |
| FONT-02 | JetBrains Mono from Google Fonts | Standard Next.js `next/font/google` pattern |
| LIB-09 | `src/types/style.ts` with Unit, UnitProp, SpacingProp | Verified verbatim from Ghostty src/types/style.ts — 7 lines, copy exactly |
</phase_requirements>

---

## Summary

Phase 1 is a pure configuration and token phase — no rendered UI, no components, no pages. The entire implementation is a direct copy-and-adapt of the Ghostty website source, with one brand color swap (`#3551F3` → `#3A5ECF`) and a project name change.

The Ghostty source at `~/Developments/ghostty-org/website` has been read directly. All dependency versions, config file contents, CSS tokens, and type definitions are verified. The planner can treat every value in this document as authoritative — no approximation needed.

One non-obvious constraint: `next.config.mjs` references three local plugin files (`remark-gfm-alerts-as-callouts.mjs`, `remark-heading-ids.mjs`, `rehype-highlight-all.mjs`) via `require.resolve()`. These files must exist at their expected paths before `next dev` can start, even if they are empty stubs. Phase 1 must create stub versions so the dev server boots.

**Primary recommendation:** Copy Ghostty config files verbatim, apply the brand color swap, create stub MDX plugin files, and the scaffold is complete.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| CSS design tokens | Static / Build | — | globals.css loaded at build time, no runtime tier |
| Font loading | Frontend Server (Next.js) | CDN (Google Fonts) | next/font handles optimization and self-hosting |
| TypeScript path aliases | Build tooling | — | tsconfig.json, resolved by Next.js bundler |
| Linting / formatting | Build tooling | — | Biome runs as CLI, not a runtime concern |
| MDX pipeline config | Frontend Server (Next.js) | — | next.config.mjs processed at build/dev startup |
| Type definitions | Build tooling | — | src/types/style.ts, compile-time only |

---

## Standard Stack

### Core (verified from Ghostty package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | `^16.1.6` | App Router framework, static export | Ghostty exact version |
| react | `19.2.4` | UI runtime | Ghostty exact version (pinned, not range) |
| react-dom | `19.2.4` | DOM renderer | Ghostty exact version (pinned) |
| typescript | `^5.9.3` | Type checking | Ghostty devDep |
| @biomejs/biome | `^2.4.4` | Lint + format | Ghostty devDep |
| @types/node | `^25.3.0` | Node type defs | Ghostty devDep |
| @types/react | `19.2.14` | React type defs | Ghostty devDep (pinned via overrides) |
| @types/react-dom | `19.2.3` | ReactDOM type defs | Ghostty devDep (pinned via overrides) |

[VERIFIED: /Users/ruiwang/Developments/ghostty-org/website/package.json]

### MDX Pipeline (Phase 1 config only — plugins are stubs)

| Library | Version | Purpose |
|---------|---------|---------|
| @next/mdx | `^16.1.6` | Next.js MDX integration |
| @mdx-js/loader | `^3.1.1` | MDX webpack loader |
| remark-frontmatter | `^5.0.0` | YAML frontmatter in MDX |
| remark-gfm | `^4.0.1` | GitHub Flavored Markdown |
| remark-mdx | `^3.1.1` | MDX remark plugin |
| remark-parse | `^11.0.0` | Remark parser |
| rehype-highlight | `^7.0.2` | Syntax highlighting |

[VERIFIED: /Users/ruiwang/Developments/ghostty-org/website/package.json]

### Other Dependencies (install now, used in Phase 2+)

| Library | Version | Purpose |
|---------|---------|---------|
| classnames | `^2.5.1` | Conditional CSS class joining |
| fast-xml-parser | `^5.3.7` | XML parsing (terminal data) |
| gray-matter | `^4.0.3` | Frontmatter parsing |
| lucide-react | `^0.575.0` | Icon library |
| mermaid | `^11.12.3` | Diagram rendering (Phase 2+) |
| react-intersection-observer | `^10.0.3` | InView hooks |
| slugify | `^1.6.6` | URL slug generation |
| zustand | `^5.0.11` | State management |
| @r4ai/remark-callout | `^0.6.2` | Callout block remark plugin |

[VERIFIED: /Users/ruiwang/Developments/ghostty-org/website/package.json]

**Installation:**
```bash
npm install next@^16.1.6 react@19.2.4 react-dom@19.2.4 \
  @next/mdx@^16.1.6 @mdx-js/loader@^3.1.1 \
  remark-frontmatter@^5.0.0 remark-gfm@^4.0.1 remark-mdx@^3.1.1 remark-parse@^11.0.0 \
  rehype-highlight@^7.0.2 @r4ai/remark-callout@^0.6.2 \
  classnames@^2.5.1 fast-xml-parser@^5.3.7 gray-matter@^4.0.3 \
  lucide-react@^0.575.0 mermaid@^11.12.3 react-intersection-observer@^10.0.3 \
  slugify@^1.6.6 zustand@^5.0.11

npm install -D @biomejs/biome@^2.4.4 typescript@^5.9.3 \
  @types/node@^25.3.0 "@types/react@19.2.14" "@types/react-dom@19.2.3"
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/                    # Next.js App Router (Phase 3)
├── components/
│   └── text/
│       └── font/           # pretendard-std-variable.woff2 (Phase 1)
├── lib/
│   └── docs/               # MDX plugin stubs (Phase 1), full impl Phase 2
├── styles/
│   └── globals.css         # All CSS tokens (Phase 1)
└── types/
    └── style.ts            # Unit/UnitProp/SpacingProp (Phase 1)
terminals/                  # Existing animation frames (Phase 3)
docs/                       # MDX content (Phase 3)
public/                     # Static assets (Phase 3)
```

### Pattern 1: next/font Local Font Loading

**What:** Next.js `localFont` API self-hosts the woff2 and injects CSS variables
**When to use:** Any local font file (Pretendard Std Variable)

```typescript
// src/app/layout.tsx (Phase 3 — but font setup pattern needed now)
// Source: Next.js docs / Ghostty pattern
import localFont from "next/font/local";

const pretendard = localFont({
  src: "../components/text/font/pretendard-std-variable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});
```

### Pattern 2: next/font Google Fonts

**What:** Next.js `next/font/google` fetches and self-hosts Google Fonts at build time
**When to use:** JetBrains Mono

```typescript
// Source: Next.js docs
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

### Pattern 3: MDX Plugin Stub Files

**What:** `next.config.mjs` uses `require.resolve()` to locate plugin files at startup. If the files don't exist, `next dev` throws `MODULE_NOT_FOUND`.
**When to use:** Phase 1 must create empty/stub versions of all three plugin files.

```javascript
// src/lib/docs/remark-heading-ids.mjs — Phase 1 stub
// Full implementation in Phase 2 (LIB-05)
export default function remarkHeadingIds() {
  return (tree) => tree;
}
```

```javascript
// src/lib/docs/remark-gfm-alerts-as-callouts.mjs — Phase 1 stub
export default function remarkGfmAlertsAsCallouts() {
  return (tree) => tree;
}
```

```javascript
// src/lib/docs/rehype-highlight-all.mjs — Phase 1 stub
export default function rehypeHighlightAll() {
  return (tree) => tree;
}
```

### Anti-Patterns to Avoid

- **Copying `--brand-color-hsl` verbatim from Ghostty:** Ghostty uses `240 100% 45%` for `#3551F3`. AIDX `#3A5ECF` is `226 61% 52%`. Must recalculate.
- **Omitting the `overrides` block in package.json:** Ghostty pins `@types/react` and `@types/react-dom` via `overrides` to avoid peer dep conflicts with React 19. Copy this block.
- **Skipping stub plugin files:** `next.config.mjs` calls `require.resolve()` at startup. Missing files = boot failure.
- **Preserving the existing `canvas` dep:** Current `package.json` has only `canvas` (used for frame generation). Replace entirely — do not merge.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font optimization | Manual `<link>` tags | `next/font` | Automatic subsetting, self-hosting, CLS prevention |
| CSS variable injection | Manual style tags | `next/font` CSS variables | Integrated with Next.js build pipeline |
| MDX processing | Custom webpack config | `@next/mdx` + `createMDX` | Handles loader, extensions, plugin chain |
| Linting + formatting | ESLint + Prettier | Biome | Single tool, faster, Ghostty constraint |

---

## Code Examples

### Verified: package.json scripts block
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "format": "biome format --write ."
  }
}
```
[VERIFIED: /Users/ruiwang/Developments/ghostty-org/website/package.json]

### Verified: tsconfig.json (complete)
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] },
    "target": "ES2017",
    "plugins": [{ "name": "next" }]
  },
  "include": [
    "next-env.d.ts", "**/*.ts", "**/*.tsx",
    ".next/types/**/*.ts", ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```
[VERIFIED: /Users/ruiwang/Developments/ghostty-org/website/tsconfig.json]

### Verified: biome.json (complete)
```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.4/schema.json",
  "files": {
    "includes": ["**/src/**/*.ts", "**/src/**/*.tsx", "**/next.config.mjs"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "assist": { "actions": { "source": { "organizeImports": "off" } } },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": { "noForEach": "off" },
      "correctness": { "useExhaustiveDependencies": "off" },
      "security": { "noDangerouslySetInnerHtml": "off" }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always"
    }
  }
}
```
[VERIFIED: /Users/ruiwang/Developments/ghostty-org/website/biome.json]

### Verified: next.config.mjs (complete)
```javascript
import createMDX from "@next/mdx";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const gfmAlertsAsCalloutsPlugin = require.resolve(
  "./src/lib/docs/remark-gfm-alerts-as-callouts.mjs",
);
const headingIdsPlugin = require.resolve(
  "./src/lib/docs/remark-heading-ids.mjs",
);
const syntaxHighlightingPlugin = require.resolve(
  "./src/lib/docs/rehype-highlight-all.mjs",
);

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      "remark-frontmatter",
      "remark-gfm",
      gfmAlertsAsCalloutsPlugin,
      headingIdsPlugin,
    ],
    rehypePlugins: [syntaxHighlightingPlugin],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
  experimental: {
    largePageDataBytes: 2 * 1024 * 1024,
  },
  env: {
    GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || "",
  },
  async headers() {
    const headers = [];
    if (process.env.VERCEL_ENV !== "production") {
      headers.push({
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
        source: "/:path*",
      });
    }
    return headers;
  },
};

export default withMDX(nextConfig);
```
[VERIFIED: /Users/ruiwang/Developments/ghostty-org/website/next.config.mjs]

### Verified: src/types/style.ts (complete)
```typescript
export type Unit = "px" | "em";
export type UnitProp = `${number}${Unit}` | 0;
export type SpacingProp =
  | UnitProp
  | `${UnitProp} ${UnitProp}`
  | `${UnitProp} ${UnitProp} ${UnitProp}`
  | `${UnitProp} ${UnitProp} ${UnitProp} ${UnitProp}`;
```
[VERIFIED: /Users/ruiwang/Developments/ghostty-org/website/src/types/style.ts]

### Verified: globals.css brand color swap

Only two values change from Ghostty's globals.css:
- `--brand-color: #3551F3` → `--brand-color: #3A5ECF`
- `--brand-color-hsl: 240 100% 45%` → `--brand-color-hsl: 226 61% 52%`

All other tokens (gray scale, atom-one, callout aliases, print media query) copy verbatim.
[VERIFIED: HSL calculated from hex #3A5ECF; all other values from Ghostty globals.css]

---

## Common Pitfalls

### Pitfall 1: Missing MDX Plugin Stub Files
**What goes wrong:** `next dev` throws `Error: Cannot find module './src/lib/docs/remark-heading-ids.mjs'` at startup
**Why it happens:** `next.config.mjs` calls `require.resolve()` at module load time, before any build step
**How to avoid:** Create all three plugin files as no-op stubs before running `next dev`
**Warning signs:** `MODULE_NOT_FOUND` error on first `npm run dev`

### Pitfall 2: Wrong HSL for brand-color-hsl
**What goes wrong:** `color-mix()` in `::selection` produces wrong color
**Why it happens:** Copying Ghostty's `240 100% 45%` (for `#3551F3`) instead of recalculating for `#3A5ECF`
**How to avoid:** Use `226 61% 52%` (verified calculation above)
**Warning signs:** Selection highlight color looks wrong in browser

### Pitfall 3: Preserving existing package.json
**What goes wrong:** `canvas` dep conflicts with Next.js build; wrong scripts
**Why it happens:** Merging instead of replacing
**How to avoid:** Replace `package.json` entirely — current file is frame-generation only
**Warning signs:** `npm install` errors about native bindings

### Pitfall 4: React 19 peer dep conflicts
**What goes wrong:** npm warns about peer dependency mismatches for `@types/react`
**Why it happens:** React 19 types are pinned, not ranged
**How to avoid:** Copy Ghostty's `overrides` block verbatim: `"@types/react": "19.2.14"`, `"@types/react-dom": "19.2.3"`
**Warning signs:** npm peer dep warnings during install

### Pitfall 5: Biome schema version mismatch
**What goes wrong:** Biome reports schema validation errors
**Why it happens:** `$schema` URL in biome.json must match the installed Biome version
**How to avoid:** Schema is `https://biomejs.dev/schemas/2.4.4/schema.json` matching `@biomejs/biome@^2.4.4`
**Warning signs:** Biome CLI reports schema errors on first run

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, next dev | ✓ | (darwin, shell: zsh) | — |
| Ghostty woff2 font | FONT-01 | ✓ | file confirmed at source path | — |
| Google Fonts CDN | FONT-02 | ✓ (internet) | — | — |

Font file confirmed: `/Users/ruiwang/Developments/ghostty-org/website/src/components/text/font/pretendard-std-variable.woff2` exists.
[VERIFIED: bash ls]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `--brand-color-hsl: 226 61% 52%` is the correct HSL for `#3A5ECF` | Code Examples | Selection highlight color slightly off — low visual impact |

All other claims in this research were verified directly from Ghostty source files or computed programmatically.

---

## Open Questions

None — all phase requirements have verified implementation paths from the Ghostty source.

---

## Sources

### Primary (HIGH confidence)
- `/Users/ruiwang/Developments/ghostty-org/website/package.json` — exact dependency versions
- `/Users/ruiwang/Developments/ghostty-org/website/next.config.mjs` — MDX pipeline config
- `/Users/ruiwang/Developments/ghostty-org/website/tsconfig.json` — TypeScript config
- `/Users/ruiwang/Developments/ghostty-org/website/biome.json` — Biome rules
- `/Users/ruiwang/Developments/ghostty-org/website/src/styles/globals.css` — full CSS token set
- `/Users/ruiwang/Developments/ghostty-org/website/src/types/style.ts` — type definitions
- `/Users/ruiwang/Developments/ghostty-org/website/src/components/text/font/` — font file confirmed

### Computed
- HSL for `#3A5ECF`: calculated via Node.js inline script → `226 61% 52%`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — read directly from Ghostty package.json
- Architecture: HIGH — read directly from Ghostty config files
- Pitfalls: HIGH — derived from actual file contents and known Next.js behavior

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable stack — Next.js/Biome versions unlikely to change within 30 days)
