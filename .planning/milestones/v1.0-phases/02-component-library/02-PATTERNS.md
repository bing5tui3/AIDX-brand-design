# Phase 2: Component Library — Pattern Map

**Mapped:** 2026-04-16
**Source:** CONTEXT.md + RESEARCH.md

---

## PATTERN MAPPING COMPLETE

---

## Pattern: Component File Structure

**Role:** Every component follows the same per-folder layout.

**Analog:** `~/Developments/ghostty-org/website/src/components/text/`

```
src/components/{name}/
  index.tsx          ← component implementation
  {Name}.module.css  ← scoped styles (if component has styles)
```

**Exceptions confirmed by research:**
- `animated-terminal/` — no CSS module (uses Terminal's styles)
- `pathname-filter/` — no CSS module (render-only logic)
- `button/` — internal dep, no COMP-XX ID but required by Link

---

## Pattern: CSS Custom Properties (Token Consumption)

**Role:** Components consume tokens from `globals.css`, never redefine them.

**Analog:** `src/styles/globals.css` (Phase 1 output)

```css
/* Components reference tokens like this — never hardcode values */
color: var(--gray-9);
background: var(--gray-1);
border-color: var(--brand-color);
height: var(--header-height);
```

**Brand swap:** `#3551F3` → `--brand-color` (already `#3A5ECF` in globals.css). No CSS edits needed in copied modules — Ghostty CSS already uses CSS vars everywhere except the wordmark SVG.

---

## Pattern: "use client" Directive

**Role:** Marks components that use browser APIs or React hooks.

**Analog:** `~/Developments/ghostty-org/website/src/components/terminal/index.tsx` line 1

```tsx
"use client";
```

**Components requiring this directive:**
Terminal, AnimatedTerminal, Navbar, NavTree, Sidecar, JumplinkHeader, CodeBlock, PathnameFilter, ScrollToTopButton

---

## Pattern: classnames for Conditional Classes

**Role:** All conditional class merging uses the `classnames` package.

**Analog:** `~/Developments/ghostty-org/website/src/components/terminal/index.tsx`

```tsx
import classNames from "classnames";

<div className={classNames(
  s.terminal,
  className,
  { [s.fontSmall]: fontSize === "small" },
  { [s.adwaita]: platformStyle === "adwaita" },
)} />
```

---

## Pattern: CSS Module Import

**Role:** Scoped styles imported as `s` object.

**Analog:** Every component with a CSS module

```tsx
import s from "./Terminal.module.css";
// Usage: className={s.terminal}
```

---

## Pattern: Zustand Store (LIB-04)

**Role:** Shared client state for docs header tracking.

**Analog:** `~/Developments/ghostty-org/website/src/lib/docs/store.ts`

```ts
import { create } from "zustand";

type DocsStoreState = {
  headerIdsInView: string[];
  updateHeaderIdInView: (inView: boolean, id: string) => void;
  resetHeaderIdsInView: () => void;
};

export const useDocsStore = create<DocsStoreState>()((set, get) => ({
  headerIdsInView: [],
  updateHeaderIdInView: (inView, id) => { /* ... */ },
  resetHeaderIdsInView: () => set({ headerIdsInView: [] }),
}));
```

**Consumers:** Sidecar (reads `headerIdsInView`), JumplinkHeader (calls `updateHeaderIdInView`)

---

## Pattern: useInView Integration (JumplinkHeader)

**Role:** Intersection Observer hook from `react-intersection-observer`.

**Analog:** `~/Developments/ghostty-org/website/src/components/jumplink-header/index.tsx`

```tsx
import { useInView } from "react-intersection-observer";
import { useDocsStore } from "@/lib/docs/store";

const { ref, inView } = useInView({ rootMargin: "-72px", threshold: 1 });
const updateHeaderIdInView = useDocsStore((state) => state.updateHeaderIdInView);

useEffect(() => {
  updateHeaderIdInView(inView, id);
}, [inView, id, updateHeaderIdInView]);
```

---

## Pattern: Path Alias `@/*`

**Role:** All internal imports use `@/` alias (maps to `./src/*` via tsconfig).

**Analog:** `~/Developments/ghostty-org/website/src/components/navbar/index.tsx`

```tsx
import { DOCS_PAGES_ROOT_PATH } from "@/lib/docs/config";
import { useDocsStore } from "@/lib/docs/store";
import type { UnitProp } from "@/types/style";
```

---

## Pattern: Remark/Rehype Plugin (`.mjs`)

**Role:** ESM plugins for MDX pipeline. Stubs exist; need full implementation.

**Analog:** `~/Developments/ghostty-org/website/src/lib/docs/rehype-highlight-all.mjs`

```js
import { all } from "lowlight";
import rehypeHighlight from "rehype-highlight";

export default function rehypeHighlightAll() {
  return rehypeHighlight({ detect: false, languages: all });
}
```

**Stub to replace** (current AIDX state):
```js
export default function rehypeHighlightAll() {
  return (tree) => tree;  // ← replace entirely
}
```

---

## Pattern: SVG as Next.js Image

**Role:** SVG wordmark imported and rendered via `next/image`.

**Analog:** `~/Developments/ghostty-org/website/src/components/navbar/index.tsx`

```tsx
import Image from "next/image";
import GhosttyWordmark from "./ghostty-wordmark.svg";
// → AIDX swap:
import AidxWordmark from "./aidx-wordmark.svg";

<Image src={AidxWordmark} alt="AIDX" />
```

**Asset prep:** Copy `aidx-wordmark.svg` from repo root to `src/components/navbar/aidx-wordmark.svg`.

---

## Pattern: AnimationManager Class (AnimatedTerminal)

**Role:** `requestAnimationFrame` loop with frame-rate control.

**Analog:** `~/Developments/ghostty-org/website/src/components/animated-terminal/index.tsx`

```ts
class AnimationManager {
  frameTime = 1000 / 30; // 30fps default
  updateFPS(fps: number) { this.frameTime = 1000 / fps; }
  start() { this._animation = requestAnimationFrame(this.update); }
  pause() { cancelAnimationFrame(this._animation!); }
}
```

Konami code bumps FPS to 240 (not 60 — research confirmed the source uses 240).

---

## Pattern: dangerouslySetInnerHTML for Terminal Lines

**Role:** Terminal frames contain pre-rendered `<span>` HTML with syntax classes.

**Analog:** `~/Developments/ghostty-org/website/src/components/terminal/index.tsx`

```tsx
<div
  key={i + line}
  dangerouslySetInnerHTML={{ __html: `${padding}${line}${padding}` }}
/>
```

Copy verbatim — do not sanitize. Frame content is build-time generated, not user input.

---

## Pattern: Lib Config Constants (LIB-01)

**Analog:** `~/Developments/ghostty-org/website/src/lib/docs/config.ts`

```ts
export const DOCS_DIRECTORY = "./docs";
export const DOCS_PAGES_ROOT_PATH = "/docs";
export const GITHUB_REPO_URL = "https://github.com/your-org/aidx"; // ← AIDX value
```

---

## Files to Create/Modify

### Wave 1 — Plan 02-01 (Primitives)

| File | Action | Analog |
|------|--------|--------|
| `src/components/text/index.tsx` | Create | `ghostty/components/text/index.tsx` |
| `src/components/text/Text.module.css` | Create | `ghostty/components/text/Text.module.css` |
| `src/components/link/index.tsx` | Create | `ghostty/components/link/index.tsx` |
| `src/components/link/Link.module.css` | Create | `ghostty/components/link/Link.module.css` |
| `src/components/button/index.tsx` | Create | `ghostty/components/button/index.tsx` |
| `src/components/button/Button.module.css` | Create | `ghostty/components/button/Button.module.css` |
| `src/components/button-links/index.tsx` | Create | `ghostty/components/button-links/index.tsx` |
| `src/components/button-links/ButtonLinks.module.css` | Create | `ghostty/components/button-links/ButtonLinks.module.css` |
| `src/components/grid-container/index.tsx` | Create | `ghostty/components/grid-container/index.tsx` |
| `src/components/grid-container/GridContainer.module.css` | Create | `ghostty/components/grid-container/GridContainer.module.css` |
| `src/components/terminal/index.tsx` | Create | `ghostty/components/terminal/index.tsx` |
| `src/components/terminal/Terminal.module.css` | Create | `ghostty/components/terminal/Terminal.module.css` |
| `src/components/animated-terminal/index.tsx` | Create | `ghostty/components/animated-terminal/index.tsx` |

### Wave 1 — Plan 02-03 (Lib Modules)

| File | Action | Analog |
|------|--------|--------|
| `src/lib/docs/config.ts` | Create | `ghostty/lib/docs/config.ts` + AIDX URL |
| `src/lib/docs/navigation.ts` | Create | `ghostty/lib/docs/navigation.ts` |
| `src/lib/docs/page.ts` | Create | `ghostty/lib/docs/page.ts` |
| `src/lib/docs/store.ts` | Create | `ghostty/lib/docs/store.ts` |
| `src/lib/docs/remark-heading-ids.mjs` | **Replace stub** | `ghostty/lib/docs/remark-heading-ids.mjs` |
| `src/lib/docs/remark-gfm-alerts-as-callouts.mjs` | **Replace stub** | `ghostty/lib/docs/remark-gfm-alerts-as-callouts.mjs` |
| `src/lib/docs/rehype-highlight-all.mjs` | **Replace stub** | `ghostty/lib/docs/rehype-highlight-all.mjs` |
| `src/lib/docs/docs-mdx.module.css` | Create | `ghostty/lib/docs/docs-mdx.module.css` |
| `package.json` | Add `lowlight` dep | — |

### Wave 2 — Plan 02-02 (Docs UI)

| File | Action | Analog |
|------|--------|--------|
| `src/components/navbar/aidx-wordmark.svg` | Copy from repo root | `aidx-wordmark.svg` |
| `src/components/navbar/index.tsx` | Create (brand swap) | `ghostty/components/navbar/index.tsx` |
| `src/components/navbar/Navbar.module.css` | Create | `ghostty/components/navbar/Navbar.module.css` |
| `src/components/footer/index.tsx` | Create | `ghostty/components/footer/index.tsx` |
| `src/components/footer/Footer.module.css` | Create | `ghostty/components/footer/Footer.module.css` |
| `src/components/nav-tree/index.tsx` | Create | `ghostty/components/nav-tree/index.tsx` |
| `src/components/nav-tree/NavTree.module.css` | Create | `ghostty/components/nav-tree/NavTree.module.css` |
| `src/components/sidecar/index.tsx` | Create | `ghostty/components/sidecar/index.tsx` |
| `src/components/sidecar/Sidecar.module.css` | Create | `ghostty/components/sidecar/Sidecar.module.css` |
| `src/components/breadcrumbs/index.tsx` | Create | `ghostty/components/breadcrumbs/index.tsx` |
| `src/components/breadcrumbs/Breadcrumbs.module.css` | Create | `ghostty/components/breadcrumbs/Breadcrumbs.module.css` |
| `src/components/jumplink-header/index.tsx` | Create | `ghostty/components/jumplink-header/index.tsx` |
| `src/components/jumplink-header/JumplinkHeader.module.css` | Create | `ghostty/components/jumplink-header/JumplinkHeader.module.css` |
| `src/components/codeblock/index.tsx` | Create | `ghostty/components/codeblock/index.tsx` |
| `src/components/codeblock/CodeBlock.module.css` | Create | `ghostty/components/codeblock/CodeBlock.module.css` |
| `src/components/callout/index.tsx` | Create | `ghostty/components/callout/index.tsx` |
| `src/components/callout/Callout.module.css` | Create | `ghostty/components/callout/Callout.module.css` |
| `src/components/blockquote/index.tsx` | Create | `ghostty/components/blockquote/index.tsx` |
| `src/components/blockquote/Blockquote.module.css` | Create | `ghostty/components/blockquote/Blockquote.module.css` |
| `src/components/pathname-filter/index.tsx` | Create | `ghostty/components/pathname-filter/index.tsx` |
| `src/components/section-wrapper/index.tsx` | Create | `ghostty/components/section-wrapper/index.tsx` |
| `src/components/section-wrapper/SectionWrapper.module.css` | Create | `ghostty/components/section-wrapper/SectionWrapper.module.css` |
| `src/components/scroll-to-top/index.tsx` | Create | `ghostty/components/scroll-to-top/index.tsx` |
| `src/components/scroll-to-top/ScrollToTop.module.css` | Create | `ghostty/components/scroll-to-top/ScrollToTop.module.css` |
