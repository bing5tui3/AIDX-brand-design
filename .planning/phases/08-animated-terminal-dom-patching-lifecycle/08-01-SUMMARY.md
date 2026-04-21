---
phase: 08-animated-terminal-dom-patching-lifecycle
plan: 01
subsystem: ui
tags: [react, animation, requestAnimationFrame, innerHTML, accessibility, css-containment]

requires:
  - phase: 07-terminal-component-hardening
    provides: Terminal forwardRef + useImperativeHandle bridge enabling contentRef wiring

provides:
  - AnimatedTerminal with useRef-based frame index and direct innerHTML writes (no React re-render per frame)
  - Three lifecycle bug fixes: rAF cleanup on unmount, visibilitychange API, reactive matchMedia
  - Terminal CSS containment and GPU compositor hints
  - aria-live="off" on Terminal Code element

affects:
  - any phase touching AnimatedTerminal or Terminal rendering pipeline

tech-stack:
  added: []
  patterns:
    - "Direct DOM mutation via contentRef.current.innerHTML bypasses React reconciliation for high-frequency animation updates"
    - "useRef for stable mutable state (frame index, manager instance) that must not trigger re-renders"
    - "document visibilitychange replaces window focus/blur for tab-level animation pause/resume"
    - "Reactive matchMedia via mql.addEventListener('change') for live prefers-reduced-motion response"

key-files:
  created: []
  modified:
    - src/components/animated-terminal/index.tsx
    - src/components/terminal/index.tsx
    - src/components/terminal/Terminal.module.css

key-decisions:
  - "Direct innerHTML write in AnimationManager callback eliminates ~30 React re-renders/sec for ~11KB frame content"
  - "frameIndexRef.current used for initial React render; subsequent frames written via innerHTML only"
  - "contain: strict safe on .terminal because explicit width/height are set via --columns/--rows CSS vars"
  - "will-change: contents on .content promotes element to GPU compositor layer for innerHTML mutations"

patterns-established:
  - "Bypass React reconciliation for high-frequency DOM updates: useRef + direct innerHTML, not useState"
  - "Animation lifecycle: visibilitychange for tab pause, matchMedia change for reduced-motion reactivity, pause() in cleanup"

requirements-completed: [RENDER-03, LIFE-01, LIFE-02, LIFE-03, CSS-01, CSS-02, A11Y-01]

duration: 8min
completed: 2026-04-21
---

# Phase 08 Plan 01: AnimatedTerminal DOM Patching and Lifecycle Summary

**Direct innerHTML animation loop replacing React state-driven re-renders, with three lifecycle bug fixes and CSS containment/GPU hints on Terminal**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-21T00:00:00Z
- **Completed:** 2026-04-21T00:08:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- AnimatedTerminal callback now writes `contentRef.current.innerHTML` directly — no `useState`, no React re-render per frame (RENDER-03)
- Three lifecycle bugs fixed: rAF leak on unmount (LIFE-01), wrong focus/blur API replaced with `visibilitychange` (LIFE-02), one-time reduced-motion check made reactive via `mql.addEventListener` (LIFE-03)
- Terminal gains `contain: strict` (CSS-01), `will-change: contents` (CSS-02), and `aria-live="off"` (A11Y-01)

## Task Commits

1. **Task 1: Refactor AnimatedTerminal** - `0ba071f` (feat)
2. **Task 2: aria-live, contain: strict, will-change** - `8a5ddae` (feat)

## Files Created/Modified

- `src/components/animated-terminal/index.tsx` — useRef frame index, direct innerHTML, visibilitychange, reactive matchMedia, pause() in cleanup
- `src/components/terminal/index.tsx` — aria-live="off" on Code element
- `src/components/terminal/Terminal.module.css` — contain: strict on .terminal, will-change: contents on .content

## Decisions Made

- `contain: strict` is safe on `.terminal` because the element has explicit dimensions via `--columns`/`--rows` CSS custom properties — no layout escape risk
- `padding` variable duplicated in AnimatedTerminal for innerHTML callback; Terminal still computes its own padding for the initial React render

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Animation performance refactor complete; direct DOM patching eliminates reconciliation overhead for ~11KB/frame content
- No blockers for subsequent phases

---
*Phase: 08-animated-terminal-dom-patching-lifecycle*
*Completed: 2026-04-21*
