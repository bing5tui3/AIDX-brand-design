# Phase 2: Component Library - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement every reusable UI component and lib utility module. No pages, no routing, no docs content — just the building blocks Phase 3 assembles into pages.

Deliverables: 18 components (COMP-01–18) and 8 lib modules (LIB-01–08), all typed and importable.

</domain>

<decisions>
## Implementation Decisions

### Copy Strategy
- **D-01:** Copy component files verbatim from `~/Developments/ghostty-org/website/src/components/` and `~/Developments/ghostty-org/website/src/lib/`. Do targeted find-replace for brand values (color, wordmark, repo URL). Do not rewrite from scratch.
- **D-02:** `.tsx` and `.mjs` files are copied verbatim. CSS Modules are copied but may need minor token adjustments where Ghostty-specific values don't map to AIDX tokens (since `globals.css` already has the full AIDX token set from Phase 1).

### AIDX-Specific Values
- **D-03:** `GITHUB_REPO_URL` in `src/lib/docs/config.ts` — use placeholder `https://github.com/your-org/aidx` for now. Easy to swap when the real repo URL is known.
- **D-04:** Navbar wordmark — use `aidx-wordmark.svg` (already in repo root). Copy it into the navbar component directory, replacing `ghostty-wordmark.svg`.
- **D-05:** `PreviewBanner` (COMP-18) — **remove entirely**. AIDX does not use preview deployments. Do not implement this component.

### Konami Easter Egg
- **D-06:** Keep the Konami code easter egg in `AnimatedTerminal` (↑↑↓↓←→←→BA bumps FPS to 60). Copy verbatim from Ghostty.

### Plan Structure
- **D-07:** Split Phase 2 into 3 plans:
  - **Plan 02-01:** Primitives — `Text`, `Link`/`ButtonLink`, `GridContainer`, `Terminal`, `AnimatedTerminal`
  - **Plan 02-02:** Docs UI — `Navbar`, `Footer`, `NavTree`, `Sidecar`, `Breadcrumbs`, `JumplinkHeader`, `CodeBlock`, `Callout`, `Blockquote`, `PathnameFilter`, `SectionWrapper`, `ScrollToTopButton`
  - **Plan 02-03:** Lib modules — all LIB-01–08 (`config.ts`, `navigation.ts`, `page.ts`, `store.ts`, `remark-heading-ids.mjs`, `remark-gfm-alerts-as-callouts.mjs`, `rehype-highlight-all.mjs`, `docs-mdx.module.css`)

### Claude's Discretion
- Exact CSS token adjustments in copied CSS Modules (minor value swaps only)
- Directory structure within `src/components/` (mirror Ghostty's per-component folder layout)
- Any import path fixes needed after copying (e.g. `@/lib/docs/` aliases)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Ghostty Website Source (primary reference — copy from here)
- `~/Developments/ghostty-org/website/src/components/` — All component source files to copy verbatim
- `~/Developments/ghostty-org/website/src/lib/docs/` — All lib module source files to copy verbatim
- `~/Developments/ghostty-org/website/src/components/text/index.tsx` — Text component with font exports
- `~/Developments/ghostty-org/website/src/components/navbar/index.tsx` — Navbar with mobile menu
- `~/Developments/ghostty-org/website/src/components/animated-terminal/index.tsx` — AnimatedTerminal with rAF loop
- `~/Developments/ghostty-org/website/src/components/sidecar/index.tsx` — Sidecar with useDocsStore
- `~/Developments/ghostty-org/website/src/lib/docs/store.ts` — Zustand store for headerIdsInView
- `~/Developments/ghostty-org/website/src/lib/docs/page.ts` — loadDocsPage, DocsPageData type
- `~/Developments/ghostty-org/website/src/lib/docs/navigation.ts` — loadDocsNavTreeData, navTreeToBreadcrumbs

### AIDX Requirements
- `.planning/REQUIREMENTS.md` §COMP-01–COMP-18 — Component specs
- `.planning/REQUIREMENTS.md` §LIB-01–LIB-08 — Lib module specs

### Phase 1 Output (consumed by Phase 2)
- `src/styles/globals.css` — Full CSS token set; components consume these, do not redefine
- `src/types/style.ts` — `Unit`, `UnitProp`, `SpacingProp` types
- `src/components/text/font/pretendard-std-variable.woff2` — Font file already in place

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/styles/globals.css` — All CSS custom properties already defined (brand color, gray scale, header/footer heights, syntax highlight classes). Components import these via CSS Modules.
- `src/types/style.ts` — `Unit`, `UnitProp`, `SpacingProp` already implemented.
- `src/lib/docs/remark-heading-ids.mjs`, `remark-gfm-alerts-as-callouts.mjs`, `rehype-highlight-all.mjs` — MDX plugin stubs already in place from Phase 1; LIB-05–07 will flesh these out.
- `aidx-wordmark.svg` (repo root) — Ready to copy into navbar component directory.

### Established Patterns
- Ghostty uses per-component folders: `src/components/navbar/index.tsx` + `Navbar.module.css`. Mirror this structure exactly.
- CSS Modules for all component styles — no Tailwind, no inline styles.
- `"use client"` directive on interactive components (Navbar, AnimatedTerminal, Sidecar, JumplinkHeader).
- `classnames` package for conditional class merging.

### Integration Points
- `AnimatedTerminal` reads frame files at runtime — Phase 3 wires up the actual `terminals/home/animation_frames/` path.
- `Navbar` accepts `docsNavTree: NavTreeNode[]` prop — Phase 3 passes this from `loadDocsNavTreeData`.
- `Sidecar` reads from `useDocsStore` — `JumplinkHeader` must be implemented in the same phase to populate the store.
- `useDocsStore` (LIB-04) is a dependency of both `Sidecar` (COMP-09) and `JumplinkHeader` (COMP-11) — implement lib first within Plan 02-03, or ensure store is available before those components.

</code_context>

<specifics>
## Specific Ideas

- "Mirror Ghostty website architecture exactly" — copy files directly, don't approximate. Read Ghostty source before writing any component.
- `PreviewBanner` is explicitly removed — do not create a stub or placeholder for it.
- Brand swap: `#3551F3` → `#3A5ECF` wherever it appears in copied CSS. Background `#0f0f11` stays the same.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-component-library*
*Context gathered: 2026-04-16*
