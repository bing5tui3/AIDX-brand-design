---
phase: 08-animated-terminal-dom-patching-lifecycle
fixed_at: 2026-04-21T00:00:00Z
review_path: .planning/phases/08-animated-terminal-dom-patching-lifecycle/08-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 08: Code Review Fix Report

**Fixed at:** 2026-04-21
**Source review:** .planning/phases/08-animated-terminal-dom-patching-lifecycle/08-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (1 Critical + 6 Warning)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: Unguarded innerHTML / dangerouslySetInnerHTML with external frame content

**Files modified:** `src/components/animated-terminal/index.tsx`, `src/components/terminal/index.tsx`
**Commit:** 73d250b
**Applied fix:** Added `sanitizeTerminalLine()` to both files. The function escapes all HTML entities then restores only the allowlisted syntax-highlighting span patterns (`class="b|e|h|g|o"`). Applied to the rAF `innerHTML` path in animated-terminal and to the `dangerouslySetInnerHTML` render in Terminal.

### WR-01: Hardcoded initial frame index 16 — out-of-bounds if frames.length < 17

**Files modified:** `src/components/animated-terminal/index.tsx`
**Commit:** 73d250b
**Applied fix:** Changed `useRef(16)` to `useRef(0)` so the initial frame index is always valid regardless of how many frames the caller provides.

### WR-02: Stale `frames` closure — animation manager captures first render's frames permanently

**Files modified:** `src/components/animated-terminal/index.tsx`
**Commit:** 73d250b
**Applied fix:** Added `framesRef = useRef(frames)` with a `useEffect` to keep it current. The rAF callback now reads `framesRef.current` for both the modulo wrap and the innerHTML update, eliminating the stale closure.

### WR-03: CSS `padding` shorthand overrides `padding-top` — `--code-margin-top` is dead

**Files modified:** `src/components/terminal/Terminal.module.css`
**Commit:** 5fb3cb2
**Applied fix:** Removed the separate `padding-top: var(--code-margin-top)` declaration and replaced the `padding: var(--padding)` shorthand with `padding: var(--code-margin-top) var(--padding) var(--padding)` so the top padding is correctly applied.

### WR-04: Missing `border-style` keyword in Adwaita header border

**Files modified:** `src/components/terminal/Terminal.module.css`
**Commit:** 2130ff4
**Applied fix:** Changed `border-bottom: 2px var(--adw-headerbar-shade-color)` to `border-bottom: 2px solid var(--adw-headerbar-shade-color)`, making the declaration valid and the Adwaita header separator visible.

### WR-05: `--control-size` undefined at `.terminal` level — height formula breaks before platform class is applied

**Files modified:** `src/components/terminal/Terminal.module.css`
**Commit:** d190dd5
**Applied fix:** Added `--control-size: 12px` as a fallback at the `.terminal` root level (matching the macOS value). The `.adwaita` variant still overrides it to `18px` as before.

### WR-06: Division by zero in scroll position calculation

**Files modified:** `src/components/terminal/index.tsx`
**Commit:** 69a3aa2
**Applied fix:** Extracted `scrollable = scrollHeight - clientHeight` and added an early return when `scrollable === 0`, preventing `NaN` from propagating and leaving `autoScroll` permanently disabled.

---

_Fixed: 2026-04-21_
_Fixer: Kiro (gsd-code-fixer)_
_Iteration: 1_
