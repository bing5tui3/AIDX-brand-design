# Phase 1: Project Scaffold - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 8 new files + 3 stub plugin files
**Analogs found:** 8 / 8 (all from Ghostty source — greenfield project, no existing AIDX patterns)

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `package.json` | config | build | `/Users/ruiwang/Developments/ghostty-org/website/package.json` | exact |
| `tsconfig.json` | config | build | `/Users/ruiwang/Developments/ghostty-org/website/tsconfig.json` | exact |
| `biome.json` | config | build | `/Users/ruiwang/Developments/ghostty-org/website/biome.json` | exact |
| `next.config.mjs` | config | build | `/Users/ruiwang/Developments/ghostty-org/website/next.config.mjs` | exact |
| `src/styles/globals.css` | config | static | `/Users/ruiwang/Developments/ghostty-org/website/src/styles/globals.css` | exact (brand swap only) |
| `src/types/style.ts` | utility | transform | `/Users/ruiwang/Developments/ghostty-org/website/src/types/style.ts` | exact |
| `src/lib/docs/remark-heading-ids.mjs` | utility | transform | RESEARCH.md Pattern 3 (stub pattern) | stub |
| `src/lib/docs/remark-gfm-alerts-as-callouts.mjs` | utility | transform | RESEARCH.md Pattern 3 (stub pattern) | stub |
| `src/lib/docs/rehype-highlight-all.mjs` | utility | transform | RESEARCH.md Pattern 3 (stub pattern) | stub |
| `src/components/text/font/pretendard-std-variable.woff2` | asset | file-I/O | `/Users/ruiwang/Developments/ghostty-org/website/src/components/text/font/pretendard-std-variable.woff2` | exact (binary copy) |

---

## Pattern Assignments

### `package.json` (config, build)

**Analog:** `/Users/ruiwang/Developments/ghostty-org/website/package.json`

**Action:** Replace current `package.json` entirely. Do NOT merge with existing `canvas` dep.

**Complete pattern** (lines 1-44 of Ghostty package.json):
```json
{
  "name": "aidx",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "format": "biome format --write ."
  },
  "dependencies": {
    "@mdx-js/loader": "^3.1.1",
    "@next/mdx": "^16.1.6",
    "@r4ai/remark-callout": "^0.6.2",
    "classnames": "^2.5.1",
    "fast-xml-parser": "^5.3.7",
    "gray-matter": "^4.0.3",
    "lucide-react": "^0.575.0",
    "mermaid": "^11.12.3",
    "next": "^16.1.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-intersection-observer": "^10.0.3",
    "rehype-highlight": "^7.0.2",
    "remark-frontmatter": "^5.0.0",
    "remark-gfm": "^4.0.1",
    "remark-mdx": "^3.1.1",
    "remark-parse": "^11.0.0",
    "slugify": "^1.6.6",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.4",
    "@types/node": "^25.3.0",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "typescript": "^5.9.3"
  },
  "overrides": {
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3"
  }
}
```

**Critical:** The `overrides` block (lines 40-43) is mandatory — pins React 19 types to avoid peer dep conflicts.

---

### `tsconfig.json` (config, build)

**Analog:** `/Users/ruiwang/Developments/ghostty-org/website/tsconfig.json`

**Action:** Copy verbatim — no AIDX-specific changes needed.

**Complete pattern** (verified from Ghostty tsconfig.json):
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

---

### `biome.json` (config, build)

**Analog:** `/Users/ruiwang/Developments/ghostty-org/website/biome.json`

**Action:** Copy verbatim — no AIDX-specific changes needed.

**Complete pattern** (verified from Ghostty biome.json):
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

**Critical:** `$schema` URL must match installed Biome version (`2.4.4`).

---

### `next.config.mjs` (config, build)

**Analog:** `/Users/ruiwang/Developments/ghostty-org/website/next.config.mjs`

**Action:** Copy verbatim — no AIDX-specific changes needed. The three `require.resolve()` paths reference stub files that must exist before `next dev` runs.

**Complete pattern** (verified from Ghostty next.config.mjs):
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

---

### `src/styles/globals.css` (config, static)

**Analog:** `/Users/ruiwang/Developments/ghostty-org/website/src/styles/globals.css`

**Action:** Copy verbatim with TWO value swaps only:
- Line 33: `--brand-color: #3551F3` → `--brand-color: #3A5ECF`
- Line 34: `--brand-color-hsl: 240 100% 45%` → `--brand-color-hsl: 226 61% 52%`

**Brand token swap** (lines 33-34 of Ghostty globals.css):
```css
/* Ghostty (copy from): */
--brand-color: #3551F3;
--brand-color-hsl: 240 100% 45%;

/* AIDX (replace with): */
--brand-color: #3A5ECF;
--brand-color-hsl: 226 61% 52%;
```

**All other tokens copy verbatim** — gray scale (lines 35-44), atom-one colors (lines 53-61), callout aliases (lines 63-67), hljs classes (lines 79-146), print media query (lines 148-177).

---

### `src/types/style.ts` (utility, transform)

**Analog:** `/Users/ruiwang/Developments/ghostty-org/website/src/types/style.ts`

**Action:** Copy verbatim — 7 lines, no changes.

**Complete pattern** (verified from Ghostty src/types/style.ts):
```typescript
export type Unit = "px" | "em";
export type UnitProp = `${number}${Unit}` | 0;
export type SpacingProp =
  | UnitProp
  | `${UnitProp} ${UnitProp}`
  | `${UnitProp} ${UnitProp} ${UnitProp}`
  | `${UnitProp} ${UnitProp} ${UnitProp} ${UnitProp}`;
```

---

### MDX Plugin Stubs (utility, transform)

**Files:**
- `src/lib/docs/remark-heading-ids.mjs`
- `src/lib/docs/remark-gfm-alerts-as-callouts.mjs`
- `src/lib/docs/rehype-highlight-all.mjs`

**Analog:** No Ghostty analog — these are Phase 1 stubs; full implementations are Phase 2 work.

**Action:** Create each as a no-op stub. The function name must match the filename (camelCase). These files must exist before `next dev` runs due to `require.resolve()` in `next.config.mjs`.

**Stub pattern** (apply to all three, varying function name):
```javascript
// src/lib/docs/remark-heading-ids.mjs
export default function remarkHeadingIds() {
  return (tree) => tree;
}
```

```javascript
// src/lib/docs/remark-gfm-alerts-as-callouts.mjs
export default function remarkGfmAlertsAsCallouts() {
  return (tree) => tree;
}
```

```javascript
// src/lib/docs/rehype-highlight-all.mjs
export default function rehypeHighlightAll() {
  return (tree) => tree;
}
```

---

### `src/components/text/font/pretendard-std-variable.woff2` (asset, file-I/O)

**Analog:** `/Users/ruiwang/Developments/ghostty-org/website/src/components/text/font/pretendard-std-variable.woff2`

**Action:** Binary copy — `cp` the file from Ghostty source to AIDX destination. No modification.

**Copy command:**
```bash
mkdir -p src/components/text/font
cp /Users/ruiwang/Developments/ghostty-org/website/src/components/text/font/pretendard-std-variable.woff2 \
   src/components/text/font/pretendard-std-variable.woff2
```

**Usage pattern** (Phase 3 layout.tsx — for planner reference):
```typescript
import localFont from "next/font/local";

const pretendard = localFont({
  src: "../components/text/font/pretendard-std-variable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});
```

---

## Shared Patterns

### Directory Skeleton
**Apply to:** All file creation steps
**Action:** Create these directories upfront before writing files:
```
src/app/
src/components/text/font/
src/lib/docs/
src/styles/
src/types/
```

### Config File Provenance
**Source:** All config files (`package.json`, `tsconfig.json`, `biome.json`, `next.config.mjs`) come from `/Users/ruiwang/Developments/ghostty-org/website/`
**Apply to:** All config file creation steps
**Rule:** Copy verbatim first, then apply only the documented AIDX-specific changes. Do not infer or approximate values.

---

## No Analog Found

None — all files have verified analogs in the Ghostty source.

---

## Metadata

**Analog search scope:** `/Users/ruiwang/Developments/ghostty-org/website/`
**Files scanned:** 6 Ghostty source files read directly
**Pattern extraction date:** 2026-04-16
**Note:** This is a greenfield project. No existing AIDX `src/` directory. All patterns sourced from Ghostty. The only AIDX-specific delta is the brand color swap in `globals.css`.
