---
phase: 02-component-library
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 46
files_reviewed_list:
  - next-env.d.ts
  - package.json
  - src/components/animated-terminal/index.tsx
  - src/components/blockquote/Blockquote.module.css
  - src/components/blockquote/index.tsx
  - src/components/breadcrumbs/index.tsx
  - src/components/button-links/ButtonLinks.module.css
  - src/components/button-links/index.tsx
  - src/components/button/Button.module.css
  - src/components/button/index.tsx
  - src/components/callout/Callout.module.css
  - src/components/callout/index.tsx
  - src/components/codeblock/CodeBlock.module.css
  - src/components/codeblock/index.tsx
  - src/components/footer/Footer.module.css
  - src/components/footer/index.tsx
  - src/components/grid-container/GridContainer.module.css
  - src/components/grid-container/index.tsx
  - src/components/jumplink-header/JumplinkHeader.module.css
  - src/components/jumplink-header/index.tsx
  - src/components/link/Link.module.css
  - src/components/link/index.tsx
  - src/components/nav-tree/NavTree.module.css
  - src/components/nav-tree/index.tsx
  - src/components/navbar/Navbar.module.css
  - src/components/navbar/aidx-wordmark.svg
  - src/components/navbar/index.tsx
  - src/components/pathname-filter/index.tsx
  - src/components/scroll-to-top/ScrollToTop.module.css
  - src/components/scroll-to-top/index.tsx
  - src/components/section-wrapper/SectionWrapper.module.css
  - src/components/section-wrapper/index.tsx
  - src/components/sidecar/Sidecar.module.css
  - src/components/sidecar/index.tsx
  - src/components/terminal/Terminal.module.css
  - src/components/terminal/index.tsx
  - src/components/text/Text.module.css
  - src/components/text/index.tsx
  - src/lib/docs/config.ts
  - src/lib/docs/docs-mdx.module.css
  - src/lib/docs/navigation.ts
  - src/lib/docs/page.ts
  - src/lib/docs/rehype-highlight-all.mjs
  - src/lib/docs/remark-gfm-alerts-as-callouts.mjs
  - src/lib/docs/remark-heading-ids.mjs
  - src/lib/docs/store.ts
findings:
  critical: 1
  warning: 5
  info: 4
  total: 10
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 46
**Status:** issues_found

## Summary

This phase scaffolds the full component library and docs infrastructure for the AIDX Next.js site. The code is generally well-structured and mirrors the Ghostty architecture as intended. One critical security issue was found in the Terminal component (`dangerouslySetInnerHTML` with unsanitized input). Five warnings cover logic bugs and missing error handling. Four info items flag minor quality issues.

## Critical Issues

### CR-01: Unsanitized HTML injected via dangerouslySetInnerHTML in Terminal

**File:** `src/components/terminal/index.tsx:105-108`
**Issue:** Each terminal line is rendered with `dangerouslySetInnerHTML`. The `line` values come from the `lines` prop, which is ultimately sourced from animation frame data. If any upstream caller ever passes user-controlled or externally-sourced content here, this is a direct XSS vector. Even for static data, using `dangerouslySetInnerHTML` without explicit sanitization is a security smell that should be documented or eliminated.
**Fix:** If lines contain only ANSI escape sequences converted to HTML spans (the typical terminal use case), sanitize with a strict allowlist before injection, or switch to a structured data model that renders spans without raw HTML:
```tsx
// Option A: sanitize before render (add a sanitize utility)
dangerouslySetInnerHTML={{ __html: sanitizeTerminalLine(`${padding}${line}${padding}`) }}

// Option B: if lines are plain text only, drop dangerouslySetInnerHTML entirely
<div key={i + line}>{`${padding}${line}${padding}`}</div>
```
At minimum, add a comment documenting that callers are responsible for ensuring `lines` contains only trusted, pre-sanitized HTML.

## Warnings

### WR-01: CopyButton reads clipboard text from parentNode — fragile DOM coupling

**File:** `src/components/codeblock/index.tsx:27-29`
**Issue:** `e.currentTarget.parentNode?.textContent` walks the DOM to find the code text. This couples the copy behavior to the exact DOM structure of `CodeBlock`. If the layout changes (e.g., a wrapper div is added), `parentNode` will point to the wrong element and copy incorrect or empty text silently. The `??""` fallback means the user gets no feedback that the copy failed.
**Fix:** Pass the code content as a prop to `CopyButton`, or use a `ref` on the `<pre>` element:
```tsx
function CopyButton({ getText }: { getText: () => string }) {
  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(getText());
    // ...
  }, [getText]);
  // ...
}
```

### WR-02: AnimatedTerminal starts at frame 16 — hardcoded magic number may exceed frames array bounds

**File:** `src/components/animated-terminal/index.tsx:82`
**Issue:** `useState(16)` initializes the animation at frame index 16. If a caller passes a `frames` array with fewer than 17 entries, `frames[currentFrame]` will be `undefined`, and `Terminal` will receive `lines={undefined}`. This causes a silent render with no content rather than a visible error.
**Fix:** Initialize to `0`, or clamp to `frames.length - 1`:
```tsx
const [currentFrame, setCurrentFrame] = useState(0);
```

### WR-03: AnimatedTerminal does not pause animation on component unmount

**File:** `src/components/animated-terminal/index.tsx:90-129`
**Issue:** The `useEffect` registers focus/blur/keyup listeners and conditionally starts the animation, but the cleanup function only removes the event listeners — it does not call `animationManager.pause()`. If the component unmounts while the animation is running (e.g., during client-side navigation), the `requestAnimationFrame` loop continues calling `setCurrentFrame` on an unmounted component, which causes a React state update on an unmounted component warning and wastes CPU.
**Fix:** Add `animationManager.pause()` to the effect cleanup:
```tsx
return () => {
  animationManager.pause(); // stop rAF loop
  window.removeEventListener("focus", handleFocus);
  window.removeEventListener("blur", handleBlur);
  window.removeEventListener("keyup", handleKeyUp);
};
```

### WR-04: store.ts updateHeaderIdInView removes ID regardless of inView value

**File:** `src/lib/docs/store.ts:16-19`
**Issue:** The `else` branch unconditionally removes the `id` from `headerIdsInView` whether `inView` is `false` or whether `inView` is `true` but the ID is already present. The condition `if (inView && !headerIds.includes(id))` correctly handles the "add" case, but the `else` fires for both "already in view" (no-op needed) and "out of view" (remove needed). This means calling `updateHeaderIdInView(true, id)` when the ID is already in the list will remove it — the opposite of the intended behavior.
**Fix:**
```ts
updateHeaderIdInView: (inView: boolean, id: string) => {
  const headerIds = get().headerIdsInView;
  if (inView && !headerIds.includes(id)) {
    set({ headerIdsInView: [...headerIds, id] });
  } else if (!inView) {
    set({ headerIdsInView: headerIds.filter((item) => item !== id) });
  }
},
```

### WR-05: loadMdxComponent uses a dynamic import with a string-concatenated path

**File:** `src/lib/docs/page.ts:101-103`
**Issue:** `await import(importPath)` where `importPath` is built from `docsRelativePath` (derived from a file path on disk). Next.js static analysis cannot statically analyze this import, which means the bundler cannot tree-shake or pre-bundle these modules. More importantly, if `docsRelativePath` is ever influenced by user input (e.g., a crafted URL slug), this becomes a path traversal / arbitrary module load vulnerability. The current call site derives the path from `fs.readdir` results, so it is not directly user-controlled today, but the function accepts any `relativeFilePath` string.
**Fix:** Add a guard that validates `docsRelativePath` contains no `..` segments before the dynamic import, and document the trust boundary:
```ts
if (docsRelativePath.includes("..")) {
  throw new Error(`Unsafe docs path: ${docsRelativePath}`);
}
const importPath = `../../../docs/${docsRelativePath}`;
```

## Info

### IN-01: GITHUB_REPO_URL is a placeholder in production config

**File:** `src/lib/docs/config.ts:8`
**Issue:** `GITHUB_REPO_URL` is set to `"https://github.com/your-org/aidx"`. This placeholder will appear in any "Edit on GitHub" links rendered to users.
**Fix:** Replace with the real repository URL before shipping, or gate the edit link UI on a non-placeholder check.

### IN-02: Breadcrumbs key uses array index concatenated with text — fragile

**File:** `src/components/breadcrumbs/index.tsx:24`
**Issue:** `key={\`${i}${breadcrumb.text}${breadcrumb.href}\`}` prefixes with the index, which defeats the purpose of a stable key. If breadcrumbs are reordered, React will still reconcile by position. Using `breadcrumb.text + breadcrumb.href` alone (without the index) would be a more meaningful key.
**Fix:**
```tsx
key={`${breadcrumb.text}:${breadcrumb.href ?? "null"}`}
```

### IN-03: require() used alongside ES module imports in page.ts

**File:** `src/lib/docs/page.ts:12`
**Issue:** `const nodePath = require("node:path")` mixes CommonJS `require` with ES module `import` statements in the same file. This works in Next.js due to its bundler, but it is inconsistent with the rest of the codebase and will cause issues if the file is ever run in a strict ESM context.
**Fix:**
```ts
import nodePath from "node:path";
```

### IN-04: MenuToggle in Navbar has no accessible label

**File:** `src/components/navbar/index.tsx:180`
**Issue:** The `<button>` for the mobile menu toggle has no `aria-label` or visible text — only decorative `div` children. Screen reader users will hear "button" with no context.
**Fix:**
```tsx
<button
  type="button"
  onClick={onToggle}
  className={s.menuToggle}
  aria-label={isOpen ? "Close menu" : "Open menu"}
  aria-expanded={isOpen}
>
```

---

_Reviewed: 2026-04-16T00:00:00Z_
_Reviewer: Kiro (gsd-code-reviewer)_
_Depth: standard_
