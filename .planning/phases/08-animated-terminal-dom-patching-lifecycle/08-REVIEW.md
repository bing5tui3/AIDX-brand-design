---
phase: 08-animated-terminal-dom-patching-lifecycle
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/components/animated-terminal/index.tsx
  - src/components/terminal/index.tsx
  - src/components/terminal/Terminal.module.css
findings:
  critical: 1
  warning: 6
  info: 2
  total: 9
status: issues_found
---

# Phase 08: Code Review Report

**Reviewed:** 2026-04-21
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Three files reviewed: the animated terminal driver, the base Terminal component, and its CSS module. The animation lifecycle and DOM-patching approach are sound overall — rAF cleanup, visibility handling, and reduced-motion support are all correctly implemented. However there are several correctness bugs: a hardcoded out-of-bounds frame index, a stale closure over the `frames` prop, a CSS property override that silently kills `--code-margin-top`, a missing `border-style` keyword, and an unset CSS custom property used in a size calculation. One XSS risk is present via unguarded `innerHTML`/`dangerouslySetInnerHTML` usage.

---

## Critical Issues

### CR-01: Unguarded innerHTML / dangerouslySetInnerHTML with external frame content

**File:** `src/components/animated-terminal/index.tsx:92-94` and `src/components/terminal/index.tsx:119-122`

**Issue:** Both the rAF callback and the React render path inject frame/line content directly into the DOM without sanitization. If `frames` or `lines` ever originates from user input, a URL parameter, or a CMS, arbitrary HTML executes in the page context. Even with static data today, the pattern is unsafe by default and will silently become exploitable if the data source changes.

**Fix:** Escape HTML entities before injection, or use a sanitizer. For the rAF path:
```ts
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// in the rAF callback:
contentRef.current.innerHTML = frames[frameIndexRef.current]
  .map((line) => `<div>${padding}${escapeHtml(line)}${padding}</div>`)
  .join("");
```
Apply the same escape in `Terminal`'s `dangerouslySetInnerHTML` render. If intentional HTML spans (`.b`, `.e`, `.h` classes) must be preserved, use a strict allowlist sanitizer (e.g., DOMPurify with `ALLOWED_TAGS: ['span']`).

---

## Warnings

### WR-01: Hardcoded initial frame index 16 — out-of-bounds if frames.length < 17

**File:** `src/components/animated-terminal/index.tsx:84`

**Issue:** `frameIndexRef` is initialized to `16`. On the first render, `frames[frameIndexRef.current]` (line 164) is passed as `lines` to `Terminal`. If the caller passes fewer than 17 frames, this is `undefined`, and `Terminal` renders nothing silently. There is no guard.

**Fix:**
```ts
const frameIndexRef = useRef(0);
```
Or clamp to a valid index:
```ts
const frameIndexRef = useRef(Math.min(16, frames.length - 1));
```

---

### WR-02: Stale `frames` closure — animation manager captures first render's frames permanently

**File:** `src/components/animated-terminal/index.tsx:88-97`

**Issue:** The `AnimationManager` callback is constructed once (guarded by `managerRef.current === null`) and closes over `frames` from the first render. If the parent re-renders with a new `frames` array (same or different length), the rAF loop continues displaying the original frames. The `useEffect` dep array includes `frames.length` but not `frames`, so even a full array replacement won't recreate the manager.

**Fix:** Store `frames` in a ref and read from it inside the callback:
```ts
const framesRef = useRef(frames);
useEffect(() => { framesRef.current = frames; }, [frames]);

// in AnimationManager callback:
frameIndexRef.current = (frameIndexRef.current + 1) % framesRef.current.length;
if (contentRef.current) {
  contentRef.current.innerHTML = framesRef.current[frameIndexRef.current]
    .map((line) => `<div>${padding}${line}${padding}</div>`)
    .join("");
}
```

---

### WR-03: CSS `padding` shorthand overrides `padding-top` — `--code-margin-top` is dead

**File:** `src/components/terminal/Terminal.module.css:106,111`

**Issue:** `.content` sets `padding-top: var(--code-margin-top)` on line 106, then `padding: var(--padding)` on line 111. The shorthand on line 111 resets all four padding sides, making the `padding-top` declaration on line 106 completely ineffective. The terminal height formula on line 47 includes `var(--code-margin-top)` in its calculation, so the outer box is taller than the content area it contains — a layout gap appears at the bottom.

**Fix:** Remove the redundant `padding-top` and use the shorthand with an explicit top override, or use longhand properties:
```css
& .content {
  padding: var(--code-margin-top) var(--padding) var(--padding);
}
```

---

### WR-04: Missing `border-style` keyword in Adwaita header border

**File:** `src/components/terminal/Terminal.module.css:142`

**Issue:** `border-bottom: 2px var(--adw-headerbar-shade-color)` is missing the required style keyword (`solid`, `dashed`, etc.). The CSS shorthand requires `<width> <style> <color>` — omitting style makes the declaration invalid and the border does not render. The Adwaita header separator is invisible.

**Fix:**
```css
border-bottom: 2px solid var(--adw-headerbar-shade-color);
```

---

### WR-05: `--control-size` undefined at `.terminal` level — height formula breaks before platform class is applied

**File:** `src/components/terminal/Terminal.module.css:47`

**Issue:** The `.terminal` height formula on line 47 references `var(--control-size)`, but `--control-size` is only defined inside `&.adwaita` (line 137) and `&.macos` (line 159). During SSR or before the `useEffect` on line 44 of `terminal/index.tsx` runs (which sets the platform class), the terminal renders without either variant class. `--control-size` resolves to the CSS initial value of `0`, making the terminal shorter than intended and causing a layout shift on hydration.

**Fix:** Define a fallback value at the `.terminal` level:
```css
.terminal {
  --control-size: 12px; /* fallback; overridden by .macos and .adwaita */
  ...
}
```

---

### WR-06: Division by zero in scroll position calculation

**File:** `src/components/terminal/index.tsx:53-55`

**Issue:** `handleScroll` computes `scrollTop / (scrollHeight - clientHeight)`. When content does not overflow (`scrollHeight === clientHeight`), the denominator is `0`, producing `NaN`. `Math.ceil(NaN)` is `NaN`, so neither branch (`< 100` or `=== 100`) fires. `autoScroll` state is never set to `true` after this condition, which can leave auto-scroll permanently disabled if the terminal starts with no overflow and content is later added.

**Fix:**
```ts
const scrollable = scrollHeight - clientHeight;
if (scrollable === 0) return; // nothing to scroll
const position = Math.ceil((scrollTop / scrollable) * 100);
```

---

## Info

### IN-01: `useEffect` auto-scroll depends on `lines?.length` — misses same-length content changes

**File:** `src/components/terminal/index.tsx:74`

**Issue:** The auto-scroll `useEffect` lists `lines?.length` as a dependency. If `lines` is replaced with an array of the same length but different content, the effect does not re-run and the terminal does not scroll to the new bottom. This is a minor gap for the static-content use case but could matter if `Terminal` is reused with streaming content.

**Fix:** Add `lines` itself to the dependency array (React will compare by reference, so new arrays always trigger):
```ts
}, [lines, autoScroll]);
```

---

### IN-02: `--code-margin-top` variable set but effectively unused after WR-03

**File:** `src/components/terminal/Terminal.module.css:3`

**Issue:** Once WR-03 is fixed, `--code-margin-top` will be used correctly. Until then it is a dead variable. Noting here for tracking — resolves automatically when WR-03 is addressed.

**Fix:** Resolve WR-03.

---

_Reviewed: 2026-04-21_
_Reviewer: Kiro (gsd-code-reviewer)_
_Depth: standard_
