# Phase 2: Component Library — Research

**Researched:** 2026-04-16
**Status:** Complete

---

## RESEARCH COMPLETE

---

## 1. Source Inventory

All 17 component directories (COMP-18 excluded per D-05) and all 8 lib modules confirmed present in `~/Developments/ghostty-org/website/src/`.

### Components to copy

| Component | Source path | TSX lines | CSS Module | CSS lines | `"use client"` |
|-----------|-------------|-----------|------------|-----------|----------------|
| Text | `components/text/index.tsx` | 122 | `Text.module.css` | 92 | No |
| Link / ButtonLink | `components/link/index.tsx` | 81 | `Link.module.css` | 77 | No |
| Button (internal) | `components/button/index.tsx` | 47 | `Button.module.css` | 54 | No |
| ButtonLinks | `components/button-links/index.tsx` | ~40 | `ButtonLinks.module.css` | ~30 | No |
| GridContainer | `components/grid-container/index.tsx` | 48 | `GridContainer.module.css` | 14 | No |
| Terminal | `components/terminal/index.tsx` | 150 | `Terminal.module.css` | 165 | **Yes** |
| AnimatedTerminal | `components/animated-terminal/index.tsx` | 143 | *(none)* | — | **Yes** |
| Navbar | `components/navbar/index.tsx` | 188 | `Navbar.module.css` | 123 | **Yes** |
| Footer | `components/footer/index.tsx` | 35 | `Footer.module.css` | 41 | No |
| NavTree | `components/nav-tree/index.tsx` | 214 | `NavTree.module.css` | 87 | **Yes** |
| Sidecar | `components/sidecar/index.tsx` | 101 | `Sidecar.module.css` | 69 | **Yes** |
| Breadcrumbs | `components/breadcrumbs/index.tsx` | 43 | `Breadcrumbs.module.css` | 20 | No |
| JumplinkHeader | `components/jumplink-header/index.tsx` | 109 | `JumplinkHeader.module.css` | 85 | **Yes** |
| CodeBlock | `components/codeblock/index.tsx` | 47 | `CodeBlock.module.css` | 49 | **Yes** |
| Callout | `components/callout/index.tsx` | 84 | `Callout.module.css` | 28 | No |
| Blockquote | `components/blockquote/index.tsx` | 15 | `Blockquote.module.css` | 6 | No |
| PathnameFilter | `components/pathname-filter/index.tsx` | 30 | *(none)* | — | **Yes** |
| SectionWrapper | `components/section-wrapper/index.tsx` | 19 | `SectionWrapper.module.css` | 9 | No |
| ScrollToTopButton | `components/scroll-to-top/index.tsx` | 55 | `ScrollToTop.module.css` | 30 | **Yes** |

**Note:** `Button` is an internal dependency of `Link`/`ButtonLink` — it must be copied as `src/components/button/` even though it has no COMP-XX requirement ID. `ButtonLinks` is similarly an internal MDX helper.

### Lib modules to copy / flesh out

| Module | Source path | Status in AIDX |
|--------|-------------|----------------|
| `config.ts` | `lib/docs/config.ts` | Not yet created |
| `navigation.ts` | `lib/docs/navigation.ts` | Not yet created |
| `page.ts` | `lib/docs/page.ts` | Not yet created |
| `store.ts` | `lib/docs/store.ts` | Not yet created |
| `remark-heading-ids.mjs` | `lib/docs/remark-heading-ids.mjs` | **Stub exists** — needs full implementation |
| `remark-gfm-alerts-as-callouts.mjs` | `lib/docs/remark-gfm-alerts-as-callouts.mjs` | **Stub exists** — needs full implementation |
| `rehype-highlight-all.mjs` | `lib/docs/rehype-highlight-all.mjs` | **Stub exists** — needs full implementation |
| `docs-mdx.module.css` | `lib/docs/docs-mdx.module.css` | Not yet created |

---

## 2. Phase 1 Output State

Confirmed present in AIDX:
- `src/styles/globals.css` — full CSS token set with `--brand-color: #3A5ECF`, gray scale, header/footer heights, callout colors, syntax highlight classes
- `src/types/style.ts` — `Unit`, `UnitProp`, `SpacingProp` types implemented
- `src/components/text/font/pretendard-std-variable.woff2` — font file in place
- `src/lib/docs/remark-heading-ids.mjs` — stub (returns tree unchanged)
- `src/lib/docs/remark-gfm-alerts-as-callouts.mjs` — stub (returns tree unchanged)
- `src/lib/docs/rehype-highlight-all.mjs` — stub (returns tree unchanged)
- `aidx-wordmark.svg` — in repo root, ready to copy into navbar directory

**Not yet present:**
- No component TSX files in `src/components/text/` (only the `font/` subdirectory)
- No `src/components/navbar/`, `src/components/footer/`, etc.
- No `src/lib/docs/config.ts`, `navigation.ts`, `page.ts`, `store.ts`, `docs-mdx.module.css`

---

## 3. Dependency Audit

### Already installed (package.json)
- `classnames` ^2.5.1 ✓
- `lucide-react` ^0.575.0 ✓
- `zustand` ^5.0.11 ✓
- `slugify` ^1.6.6 ✓
- `react-intersection-observer` ^10.0.3 ✓ (used by JumplinkHeader's `useInView`)
- `@r4ai/remark-callout` ^0.6.2 ✓ (used by remark-gfm-alerts-as-callouts.mjs)
- `rehype-highlight` ^7.0.2 ✓

### In node_modules but NOT in package.json
- `lowlight` — present as transitive dep of `rehype-highlight`, but not declared. `rehype-highlight-all.mjs` imports `{ all } from "lowlight"`. **Must add `lowlight` to package.json dependencies** to make the import explicit and stable.

### No missing packages
All other imports (`next/font/local`, `next/font/google`, `next/link`, `next/image`, `next/navigation`, `react`, `node:fs`) are covered by existing deps.

---

## 4. Brand Swap Map

Only three substitutions needed across all copied files:

| What | Ghostty value | AIDX value | Where |
|------|--------------|------------|-------|
| Wordmark SVG import | `./ghostty-wordmark.svg` | `./aidx-wordmark.svg` | `navbar/index.tsx` line 16 |
| Wordmark alt text | `"Ghostty"` | `"AIDX"` | `navbar/index.tsx` line 91 |
| GitHub repo URL | `https://github.com/ghostty-org/website` | `https://github.com/your-org/aidx` | `lib/docs/config.ts` |

**No CSS color swaps needed.** The Ghostty brand color `#3551F3` only appears in `ghostty-wordmark.svg` (which is replaced entirely). All component CSS uses CSS custom properties (`--brand-color`, `--gray-*`) that already resolve to AIDX values via `globals.css`.

---

## 5. Cross-Component Dependencies

The following dependency order must be respected within each plan:

### Plan 02-01 (Primitives) internal order
1. `Text` — no component deps (only `next/font`)
2. `Link` / `ButtonLink` — depends on `Text` (imports `pretendardStdVariable`)
3. `Button` — no component deps (internal, used by Link)
4. `ButtonLinks` — depends on `Link`
5. `GridContainer` — depends on `@/types/style` (already exists)
6. `Terminal` — depends on `Text` (imports `Code`, `P`)
7. `AnimatedTerminal` — depends on `Terminal`

### Plan 02-02 (Docs UI) internal order
1. `Blockquote` — no component deps
2. `Callout` — depends on `Blockquote`, `Text`
3. `Breadcrumbs` — depends on `Link`
4. `NavTree` — depends on `Link`
5. `Footer` — depends on `GridContainer`, `Link`, `Text`
6. `Navbar` — depends on `GridContainer`, `Link`, `NavTree`, `Text`, `@/lib/docs/config`
7. `CodeBlock` — depends on `Text`
8. `PathnameFilter` — no component deps
9. `SectionWrapper` — no component deps
10. `ScrollToTopButton` — no component deps
11. `JumplinkHeader` — depends on `Text`, `@/lib/docs/store` (LIB-04)
12. `Sidecar` — depends on `Text`, `@/lib/docs/store` (LIB-04)

**Critical:** `JumplinkHeader` and `Sidecar` both depend on `useDocsStore` (LIB-04). LIB-04 must be implemented before these two components, or Plan 02-02 must implement `store.ts` first within its task sequence.

### Plan 02-03 (Lib modules) internal order
1. `config.ts` — no deps
2. `store.ts` — depends on `zustand` only
3. `navigation.ts` — depends on `@/components/breadcrumbs`, `@/components/nav-tree` (type imports)
4. `page.ts` — depends on `config.ts`, `gray-matter`, `@next/mdx`
5. `remark-heading-ids.mjs` — depends on `slugify`
6. `remark-gfm-alerts-as-callouts.mjs` — depends on `@r4ai/remark-callout`
7. `rehype-highlight-all.mjs` — depends on `lowlight`, `rehype-highlight`
8. `docs-mdx.module.css` — no deps

**Plan ordering implication:** Plan 02-03 must run before Plan 02-02 completes (or `store.ts` must be extracted to run first), because `JumplinkHeader` and `Sidecar` import from `@/lib/docs/store`. The safest approach: implement `store.ts` as the first task in Plan 02-02, before any component that needs it.

---

## 6. Terminal Frame Data

The AIDX repo has `terminals/home/animation_frames/` with 235 `.txt` frame files and a `terminals/home/frames.json` (pre-serialized array of `string[][]`). The `AnimatedTerminal` component accepts `frames: AnimationFrame[]` where `AnimationFrame = string[]`. Phase 3 wires up the actual frame loading — Phase 2 only needs the component to accept and render the prop correctly.

---

## 7. Key Implementation Notes

### `"use client"` directive
Components with `"use client"`: Terminal, AnimatedTerminal, Navbar, NavTree, Sidecar, JumplinkHeader, CodeBlock, PathnameFilter, ScrollToTopButton. Copy verbatim — do not add or remove this directive.

### SVG imports in Next.js
`navbar/index.tsx` imports `GhosttyWordmark from "./ghostty-wordmark.svg"` using Next.js's built-in SVG handling (via `next/image`). The AIDX swap is: copy `aidx-wordmark.svg` from repo root to `src/components/navbar/aidx-wordmark.svg`, then change the import to `import AidxWordmark from "./aidx-wordmark.svg"` and update the `alt` prop to `"AIDX"`.

### `dangerouslySetInnerHTML` in Terminal
`Terminal` uses `dangerouslySetInnerHTML` to render pre-formatted HTML lines (the animation frames contain `<span>` tags with syntax highlight classes). This is intentional — copy verbatim.

### Stub replacement for lib plugins
The three `.mjs` stubs in `src/lib/docs/` must be replaced with full implementations (not appended to). The stubs currently return `(tree) => tree` — the real implementations import external packages and return proper remark/rehype transforms.

### `lowlight` package
Add `"lowlight": "*"` (or pin to the version in node_modules) to `package.json` dependencies before implementing `rehype-highlight-all.mjs`. Without this, the import works locally (transitive dep) but may break in CI or after a clean install.

### CSS Module corrections vs UI-SPEC
The UI-SPEC component inventory table has two inaccuracies (confirmed by reading Ghostty source):
- `Sidecar` **does** have `Sidecar.module.css` (69 lines) — UI-SPEC shows "—"
- `Breadcrumbs` **does** have `Breadcrumbs.module.css` (20 lines) — UI-SPEC shows "—"
Copy both CSS modules.

---

## 8. Plan Structure Validation

CONTEXT.md D-07 specifies 3 plans. Research confirms this split is correct:

| Plan | Contents | Key risk |
|------|----------|----------|
| 02-01 Primitives | Text, Link, ButtonLink, Button, ButtonLinks, GridContainer, Terminal, AnimatedTerminal | Terminal's `dangerouslySetInnerHTML` — copy verbatim, don't sanitize |
| 02-02 Docs UI | Navbar, Footer, NavTree, Sidecar, Breadcrumbs, JumplinkHeader, CodeBlock, Callout, Blockquote, PathnameFilter, SectionWrapper, ScrollToTopButton | `store.ts` must exist before JumplinkHeader/Sidecar — implement store.ts first in this plan |
| 02-03 Lib modules | config.ts, navigation.ts, page.ts, store.ts, remark-heading-ids.mjs, remark-gfm-alerts-as-callouts.mjs, rehype-highlight-all.mjs, docs-mdx.module.css | Stub replacement (not append), lowlight dep declaration |

**Wave assignment:** Plans 02-01 and 02-03 can run in parallel (Wave 1) since primitives don't depend on lib modules. Plan 02-02 must run after both (Wave 2) since it depends on both primitive components and `store.ts`.

---

## 9. Verification Strategy

After all plans complete, verify:

1. `npx tsc --noEmit` — zero TypeScript errors across all 17 components + 8 lib modules
2. `grep -r "ghostty\|ghostty-org\|Ghostty" src/components/ src/lib/` — zero matches (brand swap complete)
3. `grep -r "3551F3\|3551f3" src/` — zero matches
4. `ls src/components/*/index.tsx | wc -l` — at least 19 files (17 components + button + button-links)
5. `node -e "require('./src/lib/docs/store')"` — no import errors (zustand store loads)
6. Check `src/components/navbar/aidx-wordmark.svg` exists
