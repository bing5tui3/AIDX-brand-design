---
phase: 08-animated-terminal-dom-patching-lifecycle
verified: 2026-04-21T00:00:00Z
status: human_needed
score: 5/5 must-haves verified (automated); 2 items require human testing
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Switch browser tabs while animation is running, then return"
    expected: "Animation pauses when tab is hidden; resumes from last frame when tab becomes visible again"
    why_human: "document.visibilitychange behavior requires a live browser — cannot verify tab-switch pause/resume programmatically"
  - test: "Enable prefers-reduced-motion in OS settings after page load, then disable it"
    expected: "Animation pauses immediately when reduced-motion is enabled post-mount; resumes when disabled"
    why_human: "Reactive matchMedia behavior requires OS-level setting change at runtime — cannot simulate MediaQueryListEvent programmatically without a browser"
---

# Phase 8: AnimatedTerminal DOM Patching & Lifecycle — Verification Report

**Phase Goal:** Animation frame updates bypass React reconciliation entirely, the animation pauses correctly on tab switch and reduced-motion preference, and the terminal is GPU-composited with no screen reader noise
**Verified:** 2026-04-21T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Advancing an animation frame does not trigger a React re-render — only a direct innerHTML write on contentRef.current | VERIFIED | `useState` absent from animated-terminal/index.tsx; `contentRef.current.innerHTML` write at line 92; `frameIndexRef` is a `useRef` — no state setter |
| 2 | Switching browser tabs pauses the animation; returning resumes it from the last frame | ? HUMAN | `document.addEventListener("visibilitychange", handleVisibilityChange)` at line 139; handler calls `pause()`/`start()` correctly — wiring verified; runtime behavior needs human |
| 3 | With prefers-reduced-motion: reduce active at mount, the animation never starts | VERIFIED | `if (mql.matches) return;` at line 102 — early return before `animationManager.start()` is ever called |
| 4 | Enabling prefers-reduced-motion after mount pauses the animation; disabling it resumes | ? HUMAN | `mql.addEventListener("change", handleMotionChange)` at line 140; handler logic correct — wiring verified; runtime behavior needs human |
| 5 | Unmounting the component cancels the rAF loop with no console errors | VERIFIED | `animationManager.pause()` is the first statement in the useEffect cleanup at line 148; `AnimationManager.pause()` calls `cancelAnimationFrame` |
| 6 | Screen readers do not announce frame content changes (aria-live=off on the code element) | VERIFIED | `aria-live="off"` present on `<Code>` element at terminal/index.tsx line 108 |
| 7 | Terminal renders with identical visual output before and after the refactor | ? HUMAN | Initial frame rendered via `lines={frames[frameIndexRef.current]}` (React path); subsequent frames via innerHTML — visual equivalence requires browser comparison |

**Score:** 5/5 automated truths verified; 2 require human testing (tab-switch and reactive matchMedia runtime behavior); visual equivalence also flagged for human

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/animated-terminal/index.tsx` | AnimatedTerminal with useRef-based frame index and direct innerHTML writes | VERIFIED | `contentRef.current.innerHTML` at line 92; `frameIndexRef` at line 84; no `useState` |
| `src/components/terminal/index.tsx` | Terminal with aria-live=off on Code element | VERIFIED | `aria-live="off"` at line 108 |
| `src/components/terminal/Terminal.module.css` | CSS containment and GPU compositor hints | VERIFIED | `contain: strict` at line 2; `will-change: contents` at line 104 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/animated-terminal/index.tsx` | `src/components/terminal/index.tsx` | `ref={contentRef}` on `<Terminal>` — forwardRef bridge | WIRED | `ref={contentRef}` at animated-terminal line 157; Terminal is `forwardRef` at terminal/index.tsx line 30; `useImperativeHandle` at line 66 forwards `codeRef.current` |
| AnimationManager callback | `contentRef.current.innerHTML` | direct DOM write — no setState | WIRED | Callback at lines 89-96 writes `contentRef.current.innerHTML` directly; no `setState` call anywhere in the file |
| `document.visibilitychange` listener | `animationManager.pause()` / `animationManager.start()` | `document.visibilityState` check | WIRED | `document.addEventListener("visibilitychange", handleVisibilityChange)` at line 139; `removeEventListener` in cleanup at line 149 |
| `matchMedia` change listener | `animationManager.pause()` / `animationManager.start()` | `MediaQueryListEvent.matches` | WIRED | `mql.addEventListener("change", handleMotionChange)` at line 140; `mql.removeEventListener` in cleanup at line 150 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `animated-terminal/index.tsx` | `frames[frameIndexRef.current]` (initial render) | `frames` prop — static animation data passed from parent | Yes — prop is non-empty array of string[] frames | FLOWING |
| `animated-terminal/index.tsx` | `contentRef.current.innerHTML` (post-mount) | `frames[frameIndexRef.current]` in AnimationManager callback | Yes — same frames array, direct array access | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — animation behavior requires a live browser with rAF; no runnable entry point testable without starting the dev server.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| RENDER-03 | 08-01-PLAN.md | AnimatedTerminal uses direct innerHTML patching via contentRef instead of setCurrentFrame | SATISFIED | `contentRef.current.innerHTML` write at animated-terminal line 92; no `useState` for frame index |
| LIFE-01 | 08-01-PLAN.md | useEffect cleanup calls `animationManager.pause()` to cancel rAF loop on unmount | SATISFIED | `animationManager.pause()` is first call in cleanup at line 148 |
| LIFE-02 | 08-01-PLAN.md | AnimatedTerminal listens to `document.visibilitychange` to pause/resume on tab switch | SATISFIED | `document.addEventListener("visibilitychange", ...)` at line 139; old `window focus/blur` listeners absent |
| LIFE-03 | 08-01-PLAN.md | `prefers-reduced-motion` check uses a reactive `matchMedia` listener (not one-time mount check) | SATISFIED | `mql.addEventListener("change", handleMotionChange)` at line 140; mount check at line 102 is guard-only |
| CSS-01 | 08-01-PLAN.md | `.terminal` has `contain: strict` | SATISFIED | `contain: strict;` at Terminal.module.css line 2 |
| CSS-02 | 08-01-PLAN.md | `.content` has `will-change: contents` | SATISFIED | `will-change: contents;` at Terminal.module.css line 104 |
| A11Y-01 | 08-01-PLAN.md | `<Code>` element has `aria-live="off"` | SATISFIED | `aria-live="off"` at terminal/index.tsx line 108 |

All 7 requirement IDs declared in the PLAN frontmatter are accounted for. No orphaned requirements found — REQUIREMENTS.md traceability table maps all 7 IDs to this phase.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `animated-terminal/index.tsx` | 92 | `contentRef.current.innerHTML = ...` with pre-generated static frame data | Info | Intentional — frames are build-time static ASCII art, not user input; no XSS vector (documented in plan threat model T-08-01) |

No blockers or warnings found. The `innerHTML` write is the intended implementation, not a stub.

### Human Verification Required

#### 1. Tab Visibility Pause/Resume

**Test:** Open the homepage with the animated terminal running. Switch to a different browser tab and wait 3 seconds. Switch back.
**Expected:** Animation pauses immediately on tab switch (no rAF callbacks firing); resumes from the last frame index when the tab becomes visible again.
**Why human:** `document.visibilitychange` fires only in a live browser context. The wiring is verified in code but the runtime pause/resume behavior cannot be confirmed without a browser.

#### 2. Reactive prefers-reduced-motion

**Test:** Load the homepage with the animation running (reduced-motion off). Enable "Reduce Motion" in OS accessibility settings (macOS: System Settings > Accessibility > Display > Reduce Motion). Then disable it.
**Expected:** Animation pauses immediately when reduced-motion is enabled post-mount. Animation resumes when reduced-motion is disabled (assuming tab is visible).
**Why human:** `MediaQueryListEvent` fires only when the OS setting changes at runtime. The `mql.addEventListener("change", ...)` wiring is confirmed in code but the live reactive behavior requires OS-level interaction.

### Gaps Summary

No gaps. All 7 requirements are satisfied by substantive, wired implementations. Two items are routed to human verification because they require live browser/OS interaction — the code wiring for both is confirmed correct.

---

_Verified: 2026-04-21T00:00:00Z_
_Verifier: Kiro (gsd-verifier)_
