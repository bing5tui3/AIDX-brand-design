# Phase 3: Pages, Docs & Build - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 14 new/modified files
**Analogs found:** 12 / 14 (2 are content/asset files with no code analog)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/layout.tsx` | layout | request-response | `~/Developments/ghostty-org/website/src/app/layout.tsx` | exact |
| `src/app/layout.module.css` | config/style | — | `~/Developments/ghostty-org/website/src/app/layout.module.css` | exact |
| `src/app/page.tsx` | page (server) | request-response | `~/Developments/ghostty-org/website/src/app/page.tsx` | exact |
| `src/app/HomeContent.tsx` | component (client) | event-driven | `~/Developments/ghostty-org/website/src/app/HomeContent.tsx` | exact |
| `src/app/home-content.module.css` | config/style | — | `~/Developments/ghostty-org/website/src/app/home-content.module.css` | exact |
| `src/app/terminal-data.tsx` | utility | file-I/O | `~/Developments/ghostty-org/website/src/app/terminal-data.tsx` | exact |
| `src/app/not-found.tsx` | page (static) | request-response | `~/Developments/ghostty-org/website/src/app/not-found.tsx` | role-match (simplified) |
| `src/app/docs/[[...path]]/page.tsx` | route (server) | CRUD | `~/Developments/ghostty-org/website/src/app/docs/[[...path]]/page.tsx` | exact |
| `src/app/docs/DocsPageContent.tsx` | component (server) | request-response | `~/Developments/ghostty-org/website/src/app/docs/DocsPageContent.tsx` | exact |
| `src/app/docs/DocsPage.module.css` | config/style | — | `~/Developments/ghostty-org/website/src/app/docs/DocsPage.module.css` | exact |
| `mdx-components.tsx` | config/provider | transform | `~/Developments/ghostty-org/website/mdx-components.tsx` | role-match (subset) |
| `docs/nav.json` | config | — | `~/Developments/ghostty-org/website/docs/nav.json` | role-match |
| `docs/index.mdx` | content | — | no code analog | none |
| `docs/quick-start.mdx` | content | — | no code analog | none |

---

## Pattern Assignments

### `src/app/layout.tsx` (layout, request-response)

**Analog:** `~/Developments/ghostty-org/website/src/app/layout.tsx`
**Strategy:** Copy verbatim, apply AIDX deltas listed below.

**Imports pattern** (lines 1-13):
```typescript
import Footer from "@/components/footer";
import PathnameFilter from "@/components/pathname-filter";
import type { SimpleLink } from "@/components/link";
import Navbar from "@/components/navbar";
// REMOVE: import PreviewBanner from "@/components/preview-banner"; — D-02
import { jetbrainsMono, pretendardStdVariable } from "@/components/text";
import { DOCS_DIRECTORY } from "@/lib/docs/config";
import { loadDocsNavTreeData } from "@/lib/docs/navigation";
import "@/styles/globals.css";
import classNames from "classnames";
import type { Metadata } from "next";
import s from "./layout.module.css";
```

**Nav links delta** (lines 16-29 → AIDX version):
```typescript
// AIDX: two links only, no Discord — D-10
const navLinks: Array<SimpleLink> = [
  { text: "Docs", href: "/docs" },
  { text: "GitHub", href: "https://github.com/your-org/aidx" },
];

const NO_CHROME_PATHS = ["/"];
```

**Metadata delta** (lines 34-64 → AIDX version):
```typescript
// AIDX: SVG favicon only, no OG images, placeholder metadataBase — D-11/12/13
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: "AIDX",
  description: "AI-powered Developer Experience Platform",
  // openGraph.images removed — D-13
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    // shortcut/favicon.ico removed — D-12
  },
};
```

**Layout body delta** (lines 76-112 → AIDX version):
```typescript
// AIDX: PreviewBanner removed, navLinks simplified, footer copyright updated — D-02/D-10
export default async function AppLayout({ children }: { children: React.ReactNode }) {
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

---

### `src/app/layout.module.css` (config/style)

**Analog:** `~/Developments/ghostty-org/website/src/app/layout.module.css`
**Strategy:** Copy verbatim — no AIDX-specific changes needed.

**Full content** (lines 1-41):
```css
.rootLayout {
  font-family: var(--pretendard-std-variable);

  & a { color: var(--gray-9); }

  & table {
    --color-border: var(--gray-2);
    --color-header-border: var(--gray-3);
    --color-fg: var(--gray-5);
    --color-header-fg: var(--gray-7);
    display: block;
    table-layout: auto;
    border-collapse: collapse;
    margin: 32px 0;
    overflow: auto;
    /* ... th, td, tr rules verbatim */
  }
}
```

---

### `src/app/page.tsx` (page server component, request-response)

**Analog:** `~/Developments/ghostty-org/website/src/app/page.tsx`
**Strategy:** Copy verbatim, swap metadata strings only.

**Full file** (lines 1-16 → AIDX version):
```typescript
import HomeContent from "./HomeContent";
import { loadAllTerminalFiles } from "./terminal-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIDX",                                          // was "Ghostty"
  description: "AI-powered Developer Experience Platform", // was Ghostty description
};

export default async function HomePage() {
  const terminalData = await loadAllTerminalFiles("/home");
  return <HomeContent terminalData={terminalData} />;
}
```

---

### `src/app/HomeContent.tsx` (client component, event-driven)

**Analog:** `~/Developments/ghostty-org/website/src/app/HomeContent.tsx`
**Strategy:** Copy verbatim, apply three AIDX deltas: terminal title, tagline, CTA labels/hrefs.

**Imports pattern** (lines 1-10): copy verbatim — all imports exist in AIDX Phase 2 components.

**useWindowSize hook** (lines 17-31): copy verbatim — no changes needed.

**Terminal title delta** (line 67):
```typescript
// Ghostty: title={"👻 Ghostty"}
// AIDX:
title={"> AIDX"}   // D-05
```

**Tagline delta** (lines 81-85):
```typescript
// AIDX tagline — D-03
<P weight="regular" className={s.tagline}>
  AI-powered Developer Experience Platform. Accelerate your development workflow with intelligent tools.
</P>
```

**CTA buttons delta** (lines 87-95):
```typescript
// AIDX CTAs — D-04
<GridContainer className={s.buttonsList}>
  <ButtonLink href="#" text="Get Started" size="large" />
  <ButtonLink href="/docs" text="Documentation" size="large" theme="neutral" />
</GridContainer>
```

---

### `src/app/home-content.module.css` (config/style)

**Analog:** `~/Developments/ghostty-org/website/src/app/home-content.module.css`
**Strategy:** Copy verbatim — layout classes are brand-agnostic.

**Full content** (lines 1-31): copy verbatim. Classes: `.homePage`, `.terminalWrapper`, `.tagline`, `.buttonsList`, `.animatedTerminal`.

---

### `src/app/terminal-data.tsx` (utility, file-I/O)

**Analog:** `~/Developments/ghostty-org/website/src/app/terminal-data.tsx`
**Strategy:** Copy verbatim — no AIDX-specific changes needed.

**Full file** (lines 1-53): copy verbatim. Exports `loadAllTerminalFiles(subdirectory?)` and type `TerminalsMap`. Reads from `./terminals` directory which exists in AIDX with 235 frames.

---

### `src/app/not-found.tsx` (page static, request-response)

**Analog:** `~/Developments/ghostty-org/website/src/app/not-found.tsx`
**Strategy:** Do NOT copy verbatim — Ghostty version uses `next/image` with `/ghostty-404.png` which doesn't exist in AIDX. Use simplified version below.

**Ghostty version to avoid** (lines 1-35): imports `Image` from `next/image`, references `/ghostty-404.png` — causes build failure in AIDX.

**AIDX simplified version** (no image):
```typescript
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

**404Page.module.css:** Copy verbatim from `~/Developments/ghostty-org/website/src/app/404Page.module.css` (lines 1-35). The `.image` and `.imageCopyright` classes are unused but harmless.

---

### `src/app/docs/[[...path]]/page.tsx` (route server, CRUD)

**Analog:** `~/Developments/ghostty-org/website/src/app/docs/[[...path]]/page.tsx`
**Strategy:** Copy verbatim, one string swap only.

**Imports pattern** (lines 1-16): copy verbatim — all imports exist in AIDX Phase 2 lib.

**Static params + dynamic config** (lines 23, 68-77): copy verbatim:
```typescript
export const dynamicParams = false;  // line 23 — required for static export

export async function generateStaticParams(): Promise<Array<{ path: string[] }>> {
  const docsPageSlugs = await loadAllDocsPageSlugs(DOCS_DIRECTORY);
  const docsPagePaths = docsPageSlugs
    .filter((slug) => slug !== "index")
    .map((slug) => ({ path: slug.split("/") }));
  return [{ path: [] }, ...docsPagePaths];
}
```

**Breadcrumbs string delta** (line 58):
```typescript
// Ghostty: "Ghostty Docs"
// AIDX:
const breadcrumbs = navTreeToBreadcrumbs(
  "AIDX Docs",           // D-08 title
  DOCS_PAGES_ROOT_PATH,
  navTreeData,
  activePageSlug,
);
```

**params await pattern** (lines 83, 96): copy verbatim — Next.js 15 requires `await params`:
```typescript
const { path } = await params;
```

---

### `src/app/docs/DocsPageContent.tsx` (component server, request-response)

**Analog:** `~/Developments/ghostty-org/website/src/app/docs/DocsPageContent.tsx`
**Strategy:** Copy verbatim — no AIDX-specific changes needed. All imports (`Breadcrumbs`, `NavTree`, `ScrollToTopButton`, `Sidecar`, `H1`, `P`, `DOCS_PAGES_ROOT_PATH`, `GITHUB_REPO_URL`, `Pencil`) exist in AIDX.

**Imports pattern** (lines 1-10): copy verbatim.

**Core render pattern** (lines 19-84): copy verbatim. The `GITHUB_REPO_URL` constant in `src/lib/docs/config.ts` already points to `https://github.com/your-org/aidx`.

---

### `src/app/docs/DocsPage.module.css` (config/style)

**Analog:** `~/Developments/ghostty-org/website/src/app/docs/DocsPage.module.css`
**Strategy:** Copy verbatim — 167 lines of layout CSS, no brand-specific values.

---

### `mdx-components.tsx` (config/provider, transform)

**Analog:** `~/Developments/ghostty-org/website/mdx-components.tsx`
**Strategy:** Do NOT copy verbatim — Ghostty version imports v2 components that don't exist in AIDX. Use AIDX v1 subset below.

**Ghostty imports to omit** (lines 3-22): `ButtonLinks`, `CardLinks`, `DonateCard`, `GitHub`, `processGitHubLinks`, `Mermaid`, `SponsorBanner`, `SponsorCard`, `VTSequence`, `Video` — none exist in AIDX v1.

**AIDX v1 version** (repo root `mdx-components.tsx`):
```typescript
import type { MDXComponents } from "mdx/types";
import Blockquote from "@/components/blockquote";
import Callout, { Caution, Important, Note, Tip, Warning } from "@/components/callout";
import CodeBlock from "@/components/codeblock";
import JumplinkHeader from "@/components/jumplink-header";
import { BodyParagraph, LI } from "@/components/text";
import s from "@/lib/docs/docs-mdx.module.css";
import type { ComponentPropsWithoutRef } from "react";

const mdxComponents: MDXComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => <JumplinkHeader {...props} as="h1" />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <JumplinkHeader {...props} as="h2" />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <JumplinkHeader {...props} as="h3" />,
  h4: (props: ComponentPropsWithoutRef<"h4">) => <JumplinkHeader {...props} as="h4" />,
  h5: (props: ComponentPropsWithoutRef<"h5">) => <JumplinkHeader {...props} as="h5" />,
  h6: (props: ComponentPropsWithoutRef<"h6">) => <JumplinkHeader {...props} as="h6" />,
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

---

### `docs/nav.json` (config)

**Analog:** `~/Developments/ghostty-org/website/docs/nav.json` (structure reference only)
**Strategy:** Do not copy — adapt structure per D-07.

**AIDX v1 content:**
```json
{
  "items": [
    {
      "type": "folder",
      "path": "/getting-started",
      "title": "Getting Started",
      "children": [
        { "type": "link", "path": "/", "title": "Overview" },
        { "type": "link", "path": "/quick-start", "title": "Quick Start" }
      ]
    }
  ]
}
```

Note: `"/"` maps to `docs/index.mdx`; `"/quick-start"` maps to `docs/quick-start.mdx`. The folder path `/getting-started` is display-only and requires no MDX file.

---

### `docs/index.mdx` (content)

**No code analog** — content file. Write per D-08:
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

---

### `docs/quick-start.mdx` (content)

**No code analog** — content file. Write per D-09. Must demonstrate headings, code block, and callout (satisfies DOCS-03):
```mdx
---
title: Quick Start
description: Get up and running with AIDX in minutes
---

## Installation

Install AIDX using your preferred package manager:

\`\`\`bash
npm install -g aidx
\`\`\`

## First Steps

Run the AIDX CLI to verify your installation:

\`\`\`bash
aidx --version
\`\`\`

> [!NOTE]
> AIDX requires Node.js 18 or later.
```

The `> [!NOTE]` GFM alert is converted to `<Callout>` by `remark-gfm-alerts-as-callouts` (Phase 2 LIB-06).

---

## Shared Patterns

### Static Export Guards
**Apply to:** `src/app/not-found.tsx`, `src/app/docs/[[...path]]/page.tsx`

```typescript
// not-found.tsx — prevents SSR attempt on 404
export const dynamic = "force-static";

// docs/[[...path]]/page.tsx — unknown slugs become 404 at build time
export const dynamicParams = false;
```

### Next.js 15 Async Params
**Source:** `~/Developments/ghostty-org/website/src/app/docs/[[...path]]/page.tsx` lines 83, 96
**Apply to:** `src/app/docs/[[...path]]/page.tsx`

```typescript
// params is a Promise in Next.js 15 — must await
const { path } = await params;
```

### CSS Module Import Convention
**Source:** All Ghostty page files
**Apply to:** All page and component files

```typescript
import s from "./ComponentName.module.css";
// Usage: className={s.className}
// Combined: className={classNames(s.foo, s.bar)}
```

### Phase 2 Lib Import Paths
**Source:** `src/lib/docs/config.ts` (verified in AIDX)
**Apply to:** `src/app/layout.tsx`, `src/app/docs/[[...path]]/page.tsx`, `src/app/docs/DocsPageContent.tsx`

```typescript
import { DOCS_DIRECTORY, DOCS_PAGES_ROOT_PATH, GITHUB_REPO_URL } from "@/lib/docs/config";
import { loadDocsNavTreeData, navTreeToBreadcrumbs, docsMetadataTitle } from "@/lib/docs/navigation";
import { loadDocsPage, loadAllDocsPageSlugs } from "@/lib/docs/page";
```

### Public Asset Copy Commands
**Apply to:** ASSET-01, ASSET-02

```bash
# ASSET-01: favicon
cp /Users/ruiwang/Developments/webank/aidx/logo-favicon.svg \
   /Users/ruiwang/Developments/webank/aidx/public/favicon.svg

# ASSET-02: logo
cp /Users/ruiwang/Developments/webank/aidx/aidx-icon.svg \
   /Users/ruiwang/Developments/webank/aidx/public/aidx-logo.svg
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `docs/index.mdx` | content | — | Pure MDX content; no code pattern to copy |
| `docs/quick-start.mdx` | content | — | Pure MDX content; no code pattern to copy |

---

## Critical Anti-Patterns (Do Not Copy)

| Ghostty Pattern | Why It Breaks in AIDX | Fix |
|-----------------|----------------------|-----|
| `import PreviewBanner from "@/components/preview-banner"` in `layout.tsx` | Component doesn't exist in AIDX | Remove import and JSX element entirely |
| `import Image from "next/image"` + `/ghostty-404.png` in `not-found.tsx` | PNG doesn't exist in AIDX | Use simplified 404 (Pattern 4 in RESEARCH.md) |
| v2 component imports in `mdx-components.tsx` (`CardLinks`, `ButtonLinks`, `Mermaid`, etc.) | Components don't exist in AIDX v1 | Use AIDX v1 subset (Pattern 5 in RESEARCH.md) |
| `openGraph.images: [{ url: "/social-share-card.jpg" }]` in `layout.tsx` | File doesn't exist in AIDX | Remove `openGraph.images` entirely (D-13) |
| PNG favicon entries in `metadata.icons` | No PNG favicons in AIDX v1 | SVG-only: `{ icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] }` |

---

## Metadata

**Analog search scope:** `~/Developments/ghostty-org/website/src/app/`, `~/Developments/ghostty-org/website/mdx-components.tsx`, `/Users/ruiwang/Developments/webank/aidx/src/`
**Files scanned:** 12 Ghostty source files read directly
**Pattern extraction date:** 2026-04-16
