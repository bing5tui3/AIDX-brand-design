# Phase 3: Pages, Docs & Build - Research

**Researched:** 2026-04-16
**Domain:** Next.js App Router page assembly, MDX docs content, static asset placement, static build verification
**Confidence:** HIGH

## Summary

Phase 3 assembles the AIDX site from components and lib modules already delivered in Phase 2. The work is almost entirely copy-and-adapt from the Ghostty website source — the same strategy used in Phases 1 and 2. Every canonical file has been read directly from `~/Developments/ghostty-org/website/` and the exact deltas required for AIDX are documented below.

The phase has three distinct tracks: (1) page files in `src/app/` — layout, homepage, docs route, 404, and MDX component map; (2) docs content — `docs/nav.json`, `docs/index.mdx`, `docs/quick-start.mdx`; (3) public assets — favicon SVGs and logo SVG copied from repo root. All three tracks converge at BUILD-01/02/03: `npm run build` must pass clean.

The only non-trivial risk is the 404 page's `next/image` usage — Ghostty's `not-found.tsx` imports a PNG that doesn't exist in AIDX. The AIDX 404 must be simplified to remove the image entirely, keeping only the text content and CSS layout.

**Primary recommendation:** Copy each Ghostty file verbatim, apply the documented AIDX deltas (brand strings, removed PreviewBanner, simplified 404), then run `npm run build` as the phase gate.


<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Copy page files verbatim from `~/Developments/ghostty-org/website/src/app/` — same strategy as Phase 2. Do targeted find-replace for AIDX-specific values. Do not rewrite from scratch.
- D-02: `PreviewBanner` is removed (decided in Phase 2, D-05). Remove all imports and usages of `PreviewBanner` in `layout.tsx`.
- D-03: Tagline: `"AI-powered Developer Experience Platform. Accelerate your development workflow with intelligent tools."` — sourced from `aidx-landing.html`.
- D-04: CTA buttons: primary `"Get Started"` (href `#` placeholder) + secondary `"Documentation"` (href `/docs`).
- D-05: Terminal window title: `"> AIDX"`.
- D-06: Minimal placeholder content — enough to satisfy DOCS-01/02/03. Real content added later.
- D-07: `docs/nav.json` structure: one section `"Getting Started"` with two pages — `"Overview"` (maps to `docs/index.mdx`) and `"Quick Start"` (maps to `docs/quick-start.mdx`).
- D-08: `docs/index.mdx` — frontmatter `title: "AIDX Docs"`, `description: "AI-powered Developer Experience Platform"`, `hideSidecar: true`. Body: brief intro + placeholder links.
- D-09: `docs/quick-start.mdx` — frontmatter `title: "Quick Start"`. Body: demonstrates headings, a code block, and a callout (satisfies DOCS-03).
- D-10: Navbar and footer links: `Docs` (href `/docs`) + `GitHub` (href `https://github.com/your-org/aidx`). No Discord link for v1.
- D-11: Site metadata: `title: "AIDX"`, `description: "AI-powered Developer Experience Platform"`, `metadataBase: new URL("https://example.com")`.
- D-12: SVG-only favicons. Copy `logo-favicon.svg` → `public/favicon.svg` and `public/aidx-logo.svg`. No PNG variants, no favicon.ico for v1.
- D-13: No OG social share image for v1. Remove `openGraph.images` entry from metadata or use placeholder path.

### Claude's Discretion
- Exact CSS adjustments in copied page CSS Modules (minor token swaps only)
- `NO_CHROME_PATHS` value in `layout.tsx` (keep `["/"]`)
- Footer copyright text (use `© AIDX` or similar)
- `"Get Started"` CTA href — use `#` placeholder

### Deferred Ideas (OUT OF SCOPE)
- PNG favicon variants (16, 32, 128, 256px)
- OG social share image
- Real `"Get Started"` CTA destination
- Real GitHub repo URL
- Discord nav link
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-01 | `src/app/layout.tsx` — root layout with fonts, navbar (excluded on `/`), footer (excluded on `/`), metadata, docs nav tree loaded once | Ghostty `layout.tsx` read directly; AIDX deltas documented in Architecture Patterns |
| PAGE-02 | `src/app/page.tsx` — homepage loads terminal animation frames, renders `HomeContent` | Ghostty `page.tsx` read directly; 3-line file, copy verbatim with metadata swap |
| PAGE-03 | `src/app/HomeContent.tsx` — client component with `AnimatedTerminal`, tagline, CTA buttons | Ghostty `HomeContent.tsx` read directly; deltas: title, tagline, CTA labels |
| PAGE-04 | `src/app/terminal-data.tsx` — `loadAllTerminalFiles` server utility | Ghostty `terminal-data.tsx` read directly; copy verbatim, no changes needed |
| PAGE-05 | `src/app/docs/[[...path]]/page.tsx` — catch-all docs route with `generateStaticParams` | Ghostty docs page read directly; one string swap: `"Ghostty Docs"` → `"AIDX Docs"` |
| PAGE-06 | `src/app/docs/DocsPageContent.tsx` — docs layout with sidebar, content, sidecar, edit link | Ghostty `DocsPageContent.tsx` read directly; copy verbatim |
| PAGE-07 | `src/app/not-found.tsx` — 404 page | Ghostty version uses `next/image` with a PNG that doesn't exist in AIDX — must simplify |
| PAGE-08 | `mdx-components.tsx` — MDX component map | Ghostty version maps Ghostty-specific components; AIDX version omits v2 components |
| DOCS-01 | `docs/nav.json` with at least one section and two pages | Structure documented in D-07; exact JSON in Code Examples |
| DOCS-02 | `docs/index.mdx` — docs landing page with frontmatter | Content documented in D-08; exact MDX in Code Examples |
| DOCS-03 | At least one additional MDX doc page demonstrating headings, code blocks, callouts | `docs/quick-start.mdx` documented in D-09; exact MDX in Code Examples |
| ASSET-01 | `public/` contains favicon files | D-12: SVG-only for v1; `logo-favicon.svg` → `public/favicon.svg` |
| ASSET-02 | `public/` contains AIDX logo SVG (`aidx-logo.svg`) | `aidx-icon.svg` from repo root → `public/aidx-logo.svg` |
| ASSET-03 | Navbar SVG wordmark at `src/components/navbar/aidx-wordmark.svg` | Already present from Phase 2 — verified |
| BUILD-01 | `npm run build` completes without errors | Static export; pitfalls documented |
| BUILD-02 | `npm run lint` passes with no errors or warnings | Biome check; common lint issues documented |
| BUILD-03 | Site is fully static (no SSR, no API routes) | `dynamicParams = false` on docs route; `force-static` on 404 |
</phase_requirements>


## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Root layout (fonts, nav, footer) | Frontend Server (SSR) | — | `layout.tsx` is a server component; loads nav tree at build time |
| Homepage terminal animation | Browser / Client | Frontend Server (SSR) | `HomeContent.tsx` is `"use client"`; `page.tsx` loads frames server-side |
| Docs routing + static params | Frontend Server (SSR) | — | `generateStaticParams` runs at build time; `dynamicParams = false` |
| Docs content rendering | Frontend Server (SSR) | — | `DocsPageContent.tsx` is a server component; MDX compiled at build |
| MDX component map | Frontend Server (SSR) | Browser / Client | `mdx-components.tsx` maps elements; client components (Sidecar, JumplinkHeader) hydrate |
| Public assets (favicons, logo) | CDN / Static | — | Files in `public/` served directly by Next.js static file serving |
| 404 page | Frontend Server (SSR) | — | `not-found.tsx` with `force-static` export |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.1.6 | App Router, static export, MDX pipeline | Already installed (Phase 1) |
| @next/mdx | ^16.1.6 | MDX compilation in Next.js | Already configured in `next.config.mjs` |
| gray-matter | ^4.0.3 | Frontmatter parsing from MDX files | Already installed (Phase 2 lib) |
| lucide-react | ^0.575.0 | Pencil icon in DocsPageContent edit link | Already installed |

All packages are already installed from Phases 1 and 2. Phase 3 requires no new `npm install`.

[VERIFIED: package.json read directly from /Users/ruiwang/Developments/webank/aidx/package.json]

### No New Dependencies
Phase 3 is pure assembly — no new packages needed. All imports reference Phase 2 components and lib modules.

## Architecture Patterns

### System Architecture Diagram

```
Build time:
  docs/*.mdx ──────────────────────────────────────────────────────────────────┐
  docs/nav.json ──────────────────────────────────────────────────────────────┐│
  terminals/home/animation_frames/*.txt ─────────────────────────────────────┐││
                                                                              │││
  next build                                                                  │││
    ├── layout.tsx (server) ← loadDocsNavTreeData(docs/) ←──────────────────┘││
    │     └── Navbar + Footer (excluded on "/") via PathnameFilter            ││
    ├── page.tsx (server) ← loadAllTerminalFiles("/home") ←─────────────────┘│
    │     └── HomeContent.tsx (client) ← AnimatedTerminal + CTAs              │
    ├── docs/[[...path]]/page.tsx (server)                                     │
    │     ├── generateStaticParams ← loadAllDocsPageSlugs(docs/) ←───────────┘
    │     ├── loadDocsNavTreeData + loadDocsPage + navTreeToBreadcrumbs
    │     └── DocsPageContent (server) ← NavTree + Sidecar + MDX content
    ├── not-found.tsx (static) → 404 HTML
    └── mdx-components.tsx → MDX element → component map

Runtime (browser):
  HomeContent.tsx → useWindowSize → responsive terminal font size
  JumplinkHeader → useInView → useDocsStore (zustand) → Sidecar scroll
```

### Recommended Project Structure
```
src/app/
├── layout.tsx              # Root layout (server component)
├── layout.module.css       # Root layout styles
├── page.tsx                # Homepage (server component)
├── HomeContent.tsx         # Homepage client component
├── home-content.module.css # Homepage styles
├── terminal-data.tsx       # loadAllTerminalFiles utility
├── not-found.tsx           # 404 page
└── docs/
    ├── DocsPageContent.tsx     # Docs layout (server component)
    ├── DocsPage.module.css     # Docs layout styles
    └── [[...path]]/
        └── page.tsx            # Catch-all docs route

docs/
├── nav.json                # Nav tree structure
├── index.mdx               # Docs landing page
└── quick-start.mdx         # Quick start page

public/
├── favicon.svg             # Copied from logo-favicon.svg
└── aidx-logo.svg           # Copied from aidx-icon.svg

mdx-components.tsx          # MDX component map (repo root)
```

### Pattern 1: Root Layout with Conditional Chrome
**What:** `layout.tsx` loads docs nav tree once at build time, wraps children with Navbar and Footer conditionally excluded on the homepage via `PathnameFilter`.
**When to use:** Every page in the app inherits this layout.

```typescript
// Source: ~/Developments/ghostty-org/website/src/app/layout.tsx (adapted)
// AIDX deltas: remove PreviewBanner, change navLinks, update metadata

const navLinks: Array<SimpleLink> = [
  { text: "Docs", href: "/docs" },
  { text: "GitHub", href: "https://github.com/your-org/aidx" },
];

const NO_CHROME_PATHS = ["/"];

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: "AIDX",
  description: "AI-powered Developer Experience Platform",
  // No openGraph.images for v1 (D-13)
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default async function AppLayout({ children }) {
  const docsNavTree = await loadDocsNavTreeData(DOCS_DIRECTORY, "");
  const currentYear = new Date().getFullYear();
  return (
    <html lang="en">
      <body className={classNames(s.rootLayout, pretendardStdVariable.variable, jetbrainsMono.variable)}>
        {/* PreviewBanner removed — D-02 */}
        <PathnameFilter paths={NO_CHROME_PATHS} mode="exclude">
          <Navbar links={navLinks} docsNavTree={docsNavTree} cta={{ href: "#", text: "Get Started" }} />
        </PathnameFilter>
        {children}
        <PathnameFilter paths={NO_CHROME_PATHS} mode="exclude">
          <Footer links={navLinks} copyright={`© ${currentYear} AIDX`} />
        </PathnameFilter>
      </body>
    </html>
  );
}
```

### Pattern 2: Homepage Client Component
**What:** `HomeContent.tsx` is `"use client"` — uses `useWindowSize` hook to pick responsive terminal font size. Terminal title and tagline are the only AIDX-specific changes.
**When to use:** Homepage only.

```typescript
// Source: ~/Developments/ghostty-org/website/src/app/HomeContent.tsx (adapted)
// AIDX deltas: title "> AIDX", tagline text, CTA labels/hrefs

<AnimatedTerminal
  title={"> AIDX"}          // D-05
  fontSize={fontSize}
  whitespacePadding={windowWidth > 950 ? 20 : windowWidth > 850 ? 10 : 0}
  className={s.animatedTerminal}
  columns={100}
  rows={41}
  frames={animationFrames}
  frameLengthMs={31}
/>

<P weight="regular" className={s.tagline}>
  AI-powered Developer Experience Platform. Accelerate your development workflow with intelligent tools.
</P>

<GridContainer className={s.buttonsList}>
  <ButtonLink href="#" text="Get Started" size="large" />           {/* D-04 */}
  <ButtonLink href="/docs" text="Documentation" size="large" theme="neutral" />
</GridContainer>
```

### Pattern 3: Docs Catch-All Route
**What:** `docs/[[...path]]/page.tsx` uses `generateStaticParams` to pre-render all docs pages. `dynamicParams = false` ensures unknown paths become 404s at build time.
**When to use:** All `/docs/*` routes.

```typescript
// Source: ~/Developments/ghostty-org/website/src/app/docs/[[...path]]/page.tsx (adapted)
// AIDX delta: "Ghostty Docs" → "AIDX Docs" in navTreeToBreadcrumbs call

const breadcrumbs = navTreeToBreadcrumbs(
  "AIDX Docs",           // was "Ghostty Docs"
  DOCS_PAGES_ROOT_PATH,
  navTreeData,
  activePageSlug,
);
```

### Pattern 4: Simplified 404 Page
**What:** Ghostty's `not-found.tsx` uses `next/image` with a PNG (`/ghostty-404.png`) that doesn't exist in AIDX. The AIDX version must remove the image entirely.
**When to use:** 404 route only.

```typescript
// AIDX not-found.tsx — simplified, no image
import type { Metadata } from "next";
import { H2, P } from "@/components/text";
import s from "./404Page.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Page not found | AIDX",
  description: "We couldn't find what you were looking for.",
};

export default function NotFoundPage() {
  return (
    <main className={s.notFoundPage}>
      <header className={s.header}>
        <H2>This page could not be found.</H2>
        <P>Try browsing the <a href="/docs">documentation</a>.</P>
      </header>
    </main>
  );
}
```

The `404Page.module.css` can be copied verbatim from Ghostty — the `.image` and `.imageCopyright` classes simply won't be referenced and cause no harm.

### Pattern 5: MDX Component Map
**What:** `mdx-components.tsx` at repo root maps MDX elements to Phase 2 components. The AIDX version omits v2-only components (Mermaid, VTSequence, GitHub, DonateCard, SponsorBanner, SponsorCard, CardLinks, ButtonLinks, Video) that don't exist yet.
**When to use:** All MDX rendering.

```typescript
// mdx-components.tsx — AIDX v1 (omits v2 components)
import type { MDXComponents } from "mdx/types";
import Blockquote from "@/components/blockquote";
import Callout, { Caution, Important, Note, Tip, Warning } from "@/components/callout";
import CodeBlock from "@/components/codeblock";
import JumplinkHeader from "@/components/jumplink-header";
import { BodyParagraph, LI } from "@/components/text";
import s from "@/lib/docs/docs-mdx.module.css";
import type { ComponentPropsWithoutRef } from "react";

const mdxComponents: MDXComponents = {
  h1: (props) => <JumplinkHeader {...props} as="h1" />,
  h2: (props) => <JumplinkHeader {...props} as="h2" />,
  h3: (props) => <JumplinkHeader {...props} as="h3" />,
  h4: (props) => <JumplinkHeader {...props} as="h4" />,
  h5: (props) => <JumplinkHeader {...props} as="h5" />,
  h6: (props) => <JumplinkHeader {...props} as="h6" />,
  li: (props: ComponentPropsWithoutRef<"li">) => <LI {...props} />,
  p: (props: ComponentPropsWithoutRef<"p">) => <BodyParagraph {...props} />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => <CodeBlock {...props} />,
  blockquote: Blockquote,
  Callout, Note, Tip, Important, Warning, Caution,
  "callout-title": () => null,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
```

### Anti-Patterns to Avoid
- **Importing PreviewBanner in layout.tsx:** Component doesn't exist in AIDX (Phase 2 D-05). Import causes build failure.
- **Using `next/image` in not-found.tsx with missing PNG:** Ghostty's 404 references `/ghostty-404.png` which doesn't exist in AIDX. Remove the image entirely.
- **Copying Ghostty's `openGraph.images` with `/social-share-card.jpg`:** File doesn't exist in AIDX. Remove or use placeholder path (D-13).
- **Copying Ghostty's favicon metadata with PNG paths:** AIDX uses SVG-only favicons for v1 (D-12). Use `{ url: "/favicon.svg", type: "image/svg+xml" }`.
- **Including v2 MDX components in mdx-components.tsx:** Components like `CardLinks`, `ButtonLinks`, `Mermaid`, `VTSequence` don't exist in AIDX v1. Their import will cause a build error.
- **Forgetting `dynamicParams = false` on docs route:** Without it, Next.js attempts runtime rendering for unknown slugs, breaking static export.


## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Docs nav tree loading | Custom JSON parser | `loadDocsNavTreeData` from Phase 2 `src/lib/docs/navigation.ts` | Already implemented and tested |
| MDX page loading + frontmatter | Custom fs + gray-matter | `loadDocsPage` from Phase 2 `src/lib/docs/page.ts` | Handles ENOENT → 404, frontmatter, heading extraction |
| Static params generation | Manual slug list | `loadAllDocsPageSlugs` from Phase 2 `src/lib/docs/page.ts` | Recursively discovers all MDX files |
| Terminal frame loading | Custom file reader | `loadAllTerminalFiles` from `terminal-data.tsx` (copy from Ghostty) | Handles recursive traversal, slug keying |
| Responsive font size logic | Custom breakpoint hook | `useWindowSize` pattern from Ghostty `HomeContent.tsx` | Already proven; handles SSR hydration flash |

**Key insight:** All complex logic is already in Phase 2 lib modules. Phase 3 only wires them together via page components.

## Code Examples

### docs/nav.json (D-07)
```json
{
  "items": [
    {
      "type": "folder",
      "path": "/getting-started",
      "title": "Getting Started",
      "children": [
        {
          "type": "link",
          "path": "/",
          "title": "Overview"
        },
        {
          "type": "link",
          "path": "/quick-start",
          "title": "Quick Start"
        }
      ]
    }
  ]
}
```

Note: The nav.json `path` values are relative to the docs root. `"/"` maps to `docs/index.mdx`. `"/quick-start"` maps to `docs/quick-start.mdx`. The folder `path: "/getting-started"` is a display grouping only — it does not require a corresponding MDX file.

[VERIFIED: Ghostty nav.json structure read directly; AIDX structure derived from D-07]

### docs/index.mdx (D-08)
```mdx
---
title: AIDX Docs
description: AI-powered Developer Experience Platform
hideSidecar: true
---

Welcome to the AIDX documentation.

AIDX is an AI-powered developer experience platform that accelerates your development workflow with intelligent tools.

## Get Started

- [Quick Start](/docs/quick-start) — Get up and running in minutes
```

### docs/quick-start.mdx (D-09)
```mdx
---
title: Quick Start
description: Get up and running with AIDX in minutes
---

## Installation

Install AIDX using your preferred package manager:

```bash
npm install -g aidx
```

## First Steps

Run the AIDX CLI to verify your installation:

```bash
aidx --version
```

> [!NOTE]
> AIDX requires Node.js 18 or later.
```

The `> [!NOTE]` GFM alert syntax is converted to a `<Callout>` by the `remark-gfm-alerts-as-callouts` plugin (Phase 2 LIB-06). This satisfies DOCS-03's requirement to demonstrate callout rendering.

### Asset Copy Commands
```bash
# ASSET-01: favicon
cp /Users/ruiwang/Developments/webank/aidx/logo-favicon.svg \
   /Users/ruiwang/Developments/webank/aidx/public/favicon.svg

# ASSET-02: logo
cp /Users/ruiwang/Developments/webank/aidx/aidx-icon.svg \
   /Users/ruiwang/Developments/webank/aidx/public/aidx-logo.svg

# ASSET-03: navbar wordmark — already present from Phase 2
# src/components/navbar/aidx-wordmark.svg ✓
```

[VERIFIED: file listing of repo root SVGs and src/components/navbar/ read directly]

## Common Pitfalls

### Pitfall 1: PreviewBanner Import in layout.tsx
**What goes wrong:** Build fails with "Cannot find module '@/components/preview-banner'".
**Why it happens:** Ghostty's `layout.tsx` imports `PreviewBanner` — the component doesn't exist in AIDX (Phase 2 D-05 removed it).
**How to avoid:** Remove the import line and the `<PreviewBanner />` JSX element from `layout.tsx`.
**Warning signs:** TypeScript error on import; build error mentioning `preview-banner`.

### Pitfall 2: Missing PNG in not-found.tsx
**What goes wrong:** Build warning or runtime 404 for `/ghostty-404.png`; `next/image` may throw if the file is absent.
**Why it happens:** Ghostty's `not-found.tsx` references a PNG that doesn't exist in AIDX.
**How to avoid:** Use the simplified AIDX 404 pattern (Pattern 4 above) — no image, text only.
**Warning signs:** Build output mentions missing static file; 404 page shows broken image.

### Pitfall 3: v2 Component Imports in mdx-components.tsx
**What goes wrong:** Build fails with "Cannot find module '@/components/card-links'" (or similar).
**Why it happens:** Ghostty's `mdx-components.tsx` imports components that don't exist in AIDX v1.
**How to avoid:** Use the AIDX v1 MDX component map (Pattern 5 above) — only import Phase 2 components.
**Warning signs:** TypeScript errors on import; build error listing missing component paths.

### Pitfall 4: nav.json Path Mismatch
**What goes wrong:** Docs pages return 404 or nav tree shows broken links.
**Why it happens:** `nav.json` path values must match the MDX file slugs exactly. `"/"` → `index.mdx`, `"/quick-start"` → `quick-start.mdx`.
**How to avoid:** Verify each `path` in `nav.json` has a corresponding `.mdx` file in `docs/`.
**Warning signs:** `loadDocsPage` throws ENOENT; `generateStaticParams` returns empty array.

### Pitfall 5: openGraph.images with Missing File
**What goes wrong:** Build warning; social share image returns 404 in production.
**Why it happens:** Ghostty's `layout.tsx` references `/social-share-card.jpg` which doesn't exist in AIDX.
**How to avoid:** Remove `openGraph.images` from metadata entirely (D-13).
**Warning signs:** Build output mentions missing public file; Lighthouse flags missing OG image.

### Pitfall 6: Biome Lint Failures on Copied Files
**What goes wrong:** `npm run lint` fails after copying Ghostty files.
**Why it happens:** Ghostty files may have patterns that Biome flags (e.g., `noImgElement` for plain `<img>` tags).
**How to avoid:** The AIDX `biome.json` has `"noDangerouslySetInnerHtml": "off"` but not `noImgElement`. The `DocsPageContent.tsx` plain `<img>` in `mdx-components.tsx` needs a `// biome-ignore` comment if Biome flags it.
**Warning signs:** `npm run lint` output shows `lint/performance/noImgElement`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params` as direct object | `params` as `Promise<{...}>` | Next.js 15 | Must `await params` in page components |
| `export const dynamic = "force-static"` | Same — still valid | — | Required on 404 page for static export |
| `dynamicParams = false` | Same — still valid | — | Required on docs catch-all for static export |

**Note on `await params`:** Next.js 15 made `params` a Promise. Ghostty's `docs/[[...path]]/page.tsx` already uses `const { path } = await params` — copy this pattern verbatim. [VERIFIED: read directly from Ghostty source]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `aidx-icon.svg` is the correct source for `public/aidx-logo.svg` (ASSET-02) | Code Examples | Wrong icon used; low risk — easy to swap |
| A2 | GFM alert `> [!NOTE]` syntax is correctly handled by the Phase 2 `remark-gfm-alerts-as-callouts` plugin | Code Examples | Callout doesn't render; DOCS-03 not satisfied |

## Open Questions (RESOLVED)

1. **ASSET-01 requirement says favicon.ico + PNG variants, but D-12 says SVG-only** (RESOLVED)
   - What we know: REQUIREMENTS.md ASSET-01 lists `favicon.ico, favicon-16.png, favicon-32.png, favicon-128.png, favicon-256.png`. D-12 overrides this to SVG-only for v1.
   - Resolution: D-12 (locked decision) narrows ASSET-01 scope to SVG-only for v1. PNG variants and favicon.ico are explicitly deferred in CONTEXT.md. Use `icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] }` — omit `shortcut` since no `.ico` file exists. Modern browsers handle SVG favicons.

2. **`docs/nav.json` folder path `/getting-started` — does it need a corresponding MDX file?** (RESOLVED)
   - What we know: In Ghostty, folder nodes with `children` are display groupings only. The `loadDocsNavTreeData` function reads `nav.json` structure; it doesn't require a file at the folder path.
   - Resolution: Folder nodes in nav.json are display-only groupings — no corresponding MDX file is needed. The `loadDocsNavTreeData` function processes the JSON structure without validating folder paths against the filesystem. This matches Ghostty behavior.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `npm run build` | ✓ | (system) | — |
| npm | package install | ✓ | (system) | — |
| Ghostty source | Canonical reference files | ✓ | ~/Developments/ghostty-org/website/ | — |
| terminals/home/animation_frames/ | PAGE-02/03 | ✓ | 235 frames | — |
| src/components/ (Phase 2) | All page imports | ✓ | 18 components | — |
| src/lib/docs/ (Phase 2) | PAGE-05/06 | ✓ | 8 lib files | — |

[VERIFIED: directory listings read directly]

## Security Domain

Security enforcement is not applicable to this phase. Phase 3 creates static HTML pages with no authentication, no user input processing, no API routes, and no server-side data handling beyond build-time file reads. All data flows are read-only at build time.

## Sources

### Primary (HIGH confidence)
- `~/Developments/ghostty-org/website/src/app/layout.tsx` — root layout pattern, metadata structure, PreviewBanner usage
- `~/Developments/ghostty-org/website/src/app/HomeContent.tsx` — homepage client component pattern
- `~/Developments/ghostty-org/website/src/app/page.tsx` — homepage server component pattern
- `~/Developments/ghostty-org/website/src/app/terminal-data.tsx` — terminal file loader utility
- `~/Developments/ghostty-org/website/src/app/not-found.tsx` — 404 page pattern (with image to remove)
- `~/Developments/ghostty-org/website/src/app/docs/[[...path]]/page.tsx` — docs catch-all route
- `~/Developments/ghostty-org/website/src/app/docs/DocsPageContent.tsx` — docs layout component
- `~/Developments/ghostty-org/website/src/app/docs/DocsPage.module.css` — docs layout styles
- `~/Developments/ghostty-org/website/src/app/home-content.module.css` — homepage styles
- `~/Developments/ghostty-org/website/src/app/layout.module.css` — root layout styles
- `~/Developments/ghostty-org/website/src/app/404Page.module.css` — 404 styles
- `~/Developments/ghostty-org/website/mdx-components.tsx` — MDX component map (full Ghostty version)
- `~/Developments/ghostty-org/website/docs/nav.json` — nav.json structure reference
- `~/Developments/ghostty-org/website/docs/index.mdx` — docs index MDX reference
- `/Users/ruiwang/Developments/webank/aidx/package.json` — confirmed no new deps needed
- `/Users/ruiwang/Developments/webank/aidx/src/lib/docs/config.ts` — GITHUB_REPO_URL, DOCS_DIRECTORY constants
- `/Users/ruiwang/Developments/webank/aidx/src/components/navbar/` — aidx-wordmark.svg already present
- `/Users/ruiwang/Developments/webank/aidx/terminals/home/animation_frames/` — 235 frames confirmed

### Secondary (MEDIUM confidence)
- `.planning/phases/03-pages-docs-build/03-CONTEXT.md` — locked decisions D-01 through D-13
- `.planning/phases/01-project-scaffold/01-PATTERNS.md` — established copy-verbatim pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json; no new deps
- Architecture: HIGH — all source files read directly from Ghostty and AIDX repos
- Pitfalls: HIGH — identified by direct comparison of Ghostty source vs AIDX state
- Docs content: HIGH — exact structure documented from D-07/08/09 decisions

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable stack, no fast-moving dependencies)
