---
phase: 01-project-scaffold
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - .npmrc
  - biome.json
  - next.config.mjs
  - package.json
  - src/lib/docs/rehype-highlight-all.mjs
  - src/lib/docs/remark-gfm-alerts-as-callouts.mjs
  - src/lib/docs/remark-heading-ids.mjs
  - src/styles/globals.css
  - src/types/style.ts
  - tsconfig.json
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Scaffold configuration is mostly solid. The Next.js + MDX + Biome setup is coherent and the CSS design token system is well-structured. Three issues need attention before building on top of this scaffold: the three remark/rehype plugin stubs are no-ops that silently pass through all content unprocessed, the `noDangerouslySetInnerHtml` security rule is disabled globally in Biome, and `@next/mdx` version is mismatched against the installed `next` version.

## Warnings

### WR-01: All three MDX plugins are no-op stubs

**File:** `src/lib/docs/rehype-highlight-all.mjs:1`, `src/lib/docs/remark-gfm-alerts-as-callouts.mjs:1`, `src/lib/docs/remark-heading-ids.mjs:1`
**Issue:** Every plugin returns `(tree) => tree` — the identity function. They are wired into `next.config.mjs` and will be called at build time, but they do nothing. Syntax highlighting, GFM alert → callout conversion, and heading ID injection are all silently skipped. Any MDX content that relies on these features will render incorrectly in production without any build error.
**Fix:** Implement each plugin or, if they are intentional placeholders, add a `throw new Error("not implemented")` so the build fails loudly rather than silently producing broken output. Example for the highlight plugin:
```js
import { visit } from "unist-util-visit";
import { highlight } from "rehype-highlight";

export default function rehypeHighlightAll() {
  return highlight(); // delegate to rehype-highlight
}
```

### WR-02: `noDangerouslySetInnerHtml` security rule disabled globally

**File:** `biome.json:18`
**Issue:** `"security": { "noDangerouslySetInnerHtml": "off" }` turns off the XSS guard for the entire codebase. If any component passes unsanitized user-controlled or MDX-derived content to `dangerouslySetInnerHTML`, Biome will not catch it.
**Fix:** Remove the global override. If a specific component legitimately needs `dangerouslySetInnerHTML` (e.g., a syntax-highlighted code block), suppress it inline with a Biome ignore comment at that call site only:
```ts
// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized by rehype-sanitize
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### WR-03: `@next/mdx` version does not match `next` version

**File:** `package.json:13,21`
**Issue:** `next` is `^16.1.6` but `@next/mdx` is also `^16.1.6`. The `@mdx-js/loader` peer is `^3.1.1`. The `@next/mdx` package must be the same major/minor as `next` — a mismatch here can cause silent MDX compilation failures or runtime errors when the MDX loader's internal Next.js assumptions diverge from the installed version.
**Fix:** Pin both to the same exact version or use a range that guarantees alignment:
```json
"next": "16.1.6",
"@next/mdx": "16.1.6"
```
Run `npm ls next @next/mdx` to confirm they resolve to the same version after install.

## Info

### IN-01: `remark-mdx` listed as a runtime dependency but unused in config

**File:** `package.json:29`
**Issue:** `remark-mdx` is in `dependencies` but is not referenced in `next.config.mjs` `remarkPlugins` array. `@next/mdx` already bundles its own MDX remark transform internally, so this is a redundant dependency.
**Fix:** Remove `"remark-mdx": "^3.1.1"` from `dependencies` unless it is used directly in application code.

### IN-02: `biome.json` excludes `.mjs` plugin files from linting

**File:** `biome.json:4`
**Issue:** `"includes": ["**/src/**/*.ts", "**/src/**/*.tsx", "**/next.config.mjs"]` covers only `.ts`/`.tsx` and the config file. The three `.mjs` plugin files under `src/lib/docs/` are excluded, so Biome will never lint them. Bugs in those files (once implemented) will go unchecked.
**Fix:** Extend the includes pattern:
```json
"includes": ["**/src/**/*.ts", "**/src/**/*.tsx", "**/src/**/*.mjs", "**/next.config.mjs"]
```

### IN-03: `SpacingProp` template literal type will not distribute over `0`

**File:** `src/types/style.ts:3`
**Issue:** `UnitProp` is `\`${number}${Unit}\` | 0`. When `0` is used in a multi-value `SpacingProp` position like `` `${UnitProp} ${UnitProp}` ``, TypeScript will expand `0` as the string `"0"` in the template, producing `"0 0"` etc. This is technically valid but may surprise callers who pass the number `0` expecting it to work in a multi-value slot — it will, but only because TypeScript coerces `0` to `"0"` in template literals. The type is not wrong, but it is worth a comment to document the intent.
**Fix:** Add a clarifying comment:
```ts
// 0 is allowed as a unitless zero shorthand; TypeScript coerces it to "0" in template positions
export type UnitProp = `${number}${Unit}` | 0;
```

---

_Reviewed: 2026-04-16T00:00:00Z_
_Reviewer: Kiro (gsd-code-reviewer)_
_Depth: standard_
