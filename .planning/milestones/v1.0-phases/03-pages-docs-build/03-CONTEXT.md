# Phase 3: Pages, Docs & Build - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up all app pages, create initial docs content, place public assets, and verify the static build passes. Components and lib modules are already implemented (Phase 2). This phase assembles them into a working site.

Deliverables: PAGE-01–08 (all app pages), DOCS-01–03 (docs content), ASSET-01–03 (public assets), BUILD-01–03 (passing static build).

</domain>

<decisions>
## Implementation Decisions

### Page Structure
- **D-01:** Copy page files verbatim from `~/Developments/ghostty-org/website/src/app/` — same strategy as Phase 2. Do targeted find-replace for AIDX-specific values. Do not rewrite from scratch.
- **D-02:** `PreviewBanner` is removed (decided in Phase 2, D-05). Remove all imports and usages of `PreviewBanner` in `layout.tsx`.

### Homepage Copy
- **D-03:** Tagline: `"AI-powered Developer Experience Platform. Accelerate your development workflow with intelligent tools."` — sourced from `aidx-landing.html`.
- **D-04:** CTA buttons: primary `"Get Started"` (href `#` placeholder) + secondary `"Documentation"` (href `/docs`).
- **D-05:** Terminal window title: `"> AIDX"`.

### Docs Content
- **D-06:** Minimal placeholder content — enough to satisfy DOCS-01/02/03. Real content added later.
- **D-07:** `docs/nav.json` structure: one section `"Getting Started"` with two pages — `"Overview"` (maps to `docs/index.mdx`) and `"Quick Start"` (maps to `docs/quick-start.mdx`).
- **D-08:** `docs/index.mdx` — frontmatter `title: "AIDX Docs"`, `description: "AI-powered Developer Experience Platform"`, `hideSidecar: true`. Body: brief intro + placeholder links.
- **D-09:** `docs/quick-start.mdx` — frontmatter `title: "Quick Start"`. Body: demonstrates headings, a code block, and a callout (satisfies DOCS-03 requirement for component rendering verification).

### Nav Links & Site Metadata
- **D-10:** Navbar and footer links: `Docs` (href `/docs`) + `GitHub` (href `https://github.com/your-org/aidx` — same placeholder as `GITHUB_REPO_URL` from Phase 2). No Discord link for v1.
- **D-11:** Site metadata: `title: "AIDX"`, `description: "AI-powered Developer Experience Platform"`, `metadataBase: new URL("https://example.com")` — placeholder URL, swap when domain is known.

### Public Assets
- **D-12:** SVG-only favicons for now. Copy `logo-favicon.svg` → `public/favicon.svg` and `public/aidx-logo.svg`. No PNG variants, no favicon.ico for v1.
- **D-13:** No OG social share image for v1 (Ghostty has `social-share-card.jpg` — omit from AIDX until design is ready). Remove the `openGraph.images` entry from metadata or use a placeholder path.

### Claude's Discretion
- Exact CSS adjustments in copied page CSS Modules (minor token swaps only)
- `NO_CHROME_PATHS` value in `layout.tsx` (keep `["/"]` — homepage has no navbar/footer, same as Ghostty)
- Footer copyright text (use `© AIDX` or similar)
- `"Get Started"` CTA href — use `#` placeholder until a real destination is defined

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Ghostty Website Source (primary reference — copy from here)
- `~/Developments/ghostty-org/website/src/app/layout.tsx` — Root layout with fonts, navbar, footer, metadata
- `~/Developments/ghostty-org/website/src/app/page.tsx` — Homepage server component
- `~/Developments/ghostty-org/website/src/app/HomeContent.tsx` — Client component with AnimatedTerminal + CTAs
- `~/Developments/ghostty-org/website/src/app/home-content.module.css` — Homepage styles
- `~/Developments/ghostty-org/website/src/app/layout.module.css` — Root layout styles
- `~/Developments/ghostty-org/website/src/app/terminal-data.tsx` — `loadAllTerminalFiles` server utility
- `~/Developments/ghostty-org/website/src/app/not-found.tsx` — 404 page
- `~/Developments/ghostty-org/website/src/app/docs/[[...path]]/page.tsx` — Catch-all docs route
- `~/Developments/ghostty-org/website/src/app/docs/DocsPageContent.tsx` — Docs layout component
- `~/Developments/ghostty-org/website/src/app/docs/DocsPage.module.css` — Docs page styles
- `~/Developments/ghostty-org/website/mdx-components.tsx` — MDX component map
- `~/Developments/ghostty-org/website/docs/nav.json` — Nav structure reference (adapt, don't copy)
- `~/Developments/ghostty-org/website/docs/index.mdx` — Docs index reference (adapt, don't copy)

### AIDX Requirements
- `.planning/REQUIREMENTS.md` §PAGE-01–PAGE-08 — Page specs
- `.planning/REQUIREMENTS.md` §DOCS-01–DOCS-03 — Docs content specs
- `.planning/REQUIREMENTS.md` §ASSET-01–ASSET-03 — Public asset specs
- `.planning/REQUIREMENTS.md` §BUILD-01–BUILD-03 — Build verification specs

### Phase 2 Output (consumed by Phase 3)
- `src/components/` — All 18 components ready to import
- `src/lib/docs/` — All lib modules ready to import
- `aidx-landing.html` — Source of homepage copy (tagline, CTA labels)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `terminals/home/animation_frames/` — 235 `.txt` frames with ANSI escape codes; `loadAllTerminalFiles("/home")` reads these at build time
- `aidx-wordmark.svg`, `aidx-icon.svg`, `aidx-wordmark-dark.svg`, `aidx-icon-dark.svg` — Brand SVGs in repo root; copy to `src/components/navbar/` (wordmark) and `public/` (logo)
- `logo-favicon.svg`, `logo-favicon-dark.svg` — Favicon SVGs in repo root; copy to `public/`

### Established Patterns
- Copy verbatim from Ghostty, do targeted find-replace — same as Phase 1 and Phase 2
- `"use client"` on `HomeContent.tsx` — already the pattern in Ghostty
- `NO_CHROME_PATHS = ["/"]` — homepage has no navbar/footer chrome
- CSS Modules for all page-level styles

### Integration Points
- `layout.tsx` imports `Navbar`, `Footer`, `PathnameFilter` from Phase 2 components
- `page.tsx` imports `HomeContent` and `loadAllTerminalFiles`
- `HomeContent.tsx` imports `AnimatedTerminal`, `ButtonLink`, `GridContainer`, `P` from Phase 2
- `docs/[[...path]]/page.tsx` imports `loadDocsNavTreeData`, `loadDocsPage`, `navTreeToBreadcrumbs` from Phase 2 lib
- `mdx-components.tsx` maps MDX elements to Phase 2 components (`JumplinkHeader`, `CodeBlock`, `Callout`, etc.)

</code_context>

<specifics>
## Specific Ideas

- Homepage tagline verbatim from `aidx-landing.html`: `"AI-powered Developer Experience Platform. Accelerate your development workflow with intelligent tools."`
- Terminal title: `"> AIDX"` (matches the `>_ AIDX` label from the landing page, adapted for terminal title bar)
- "Mirror Ghostty website architecture exactly" — read Ghostty source files directly, don't approximate
- Brand swap: `#3551F3` → `#3A5ECF`, `ghostty` → `aidx` in copy/metadata, remove `PreviewBanner` entirely

</specifics>

<deferred>
## Deferred Ideas

- PNG favicon variants (16, 32, 128, 256px) — add when design tooling is available
- OG social share image — add when design is ready
- Real `"Get Started"` CTA destination — placeholder `#` for now
- Real GitHub repo URL — placeholder `https://github.com/your-org/aidx` for now
- Discord nav link — not needed for v1

</deferred>

---

*Phase: 03-pages-docs-build*
*Context gathered: 2026-04-16*
