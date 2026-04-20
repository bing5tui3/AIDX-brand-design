# Feature Landscape: Smooth 30fps Terminal Animation

**Domain:** Web animation performance — ASCII art terminal hero in Next.js/React 19
**Researched:** 2026-04-20
**Milestone:** v1.4 Animation Performance Optimization

---

## Existing Code Context

The animation pipeline already exists:
- `AnimatedTerminal` — `requestAnimationFrame` loop via `AnimationManager` class, advances `currentFrame` via `useState`, passes `frames[currentFrame]` to `Terminal`
- `Terminal` — renders `lines[]` as `<div dangerouslySetInnerHTML>` per line, keyed by `i + line`
- 235 pre-generated HTML frames, each an array of strings with colored `<span>` tags
- `prefers-reduced-motion` checked once on mount (not reactive)
- `window focus/blur` used for pause/resume — misses tab-switch without focus change

Every frame update triggers: `setState` → React reconcile → vdom diff 235 `<div>` nodes → DOM patch. At 30fps that is 30 reconcile cycles per second on the main thread.

---

## Table Stakes

Features users expect. Missing = animation feels broken or inaccessible.

| Feature | Why Expected | Complexity | Depends On |
|---------|--------------|------------|------------|
| Direct DOM patching — bypass React state for frame updates | `setState` at 30fps forces React reconciliation on every frame; direct `innerHTML` write to a `useRef` container eliminates vdom overhead entirely. This is the root cause of jank. | Medium | `AnimatedTerminal` — forward a ref to the inner `<code>` element; `AnimationManager.callback` writes the joined HTML string directly |
| Stable line keys in Terminal | Current key `i + line` causes React to destroy/recreate DOM nodes when line content changes; `key={i}` (index-only) lets React reuse nodes and only patch `innerHTML` per line | Low | `Terminal` component `lines.map` — one-character change |
| `visibilitychange` event listener for tab-switch pause | Current code only checks `document.visibilityState` on mount and uses `window focus/blur`; switching tabs without losing focus (e.g. cmd+tab on macOS) never fires blur, so animation runs in background burning CPU | Low | `AnimatedTerminal` `useEffect` — add `document.addEventListener('visibilitychange', ...)` with cleanup |
| `prefers-reduced-motion` reactive listener | Currently a one-time check on mount; if user enables reduced-motion after page load the animation keeps running. WCAG 2.1 SC 2.3.3 requires respecting this preference. | Low | `AnimatedTerminal` `useEffect` — add `matchMedia.addEventListener('change', handler)` |
| CSS GPU layer promotion for terminal container | Without `will-change: transform` on the terminal content wrapper, every `innerHTML` repaint can trigger a full-page composite; promoting to its own compositor layer isolates repaints to the terminal region | Low | `Terminal.module.css` — add `will-change: transform` to `.content` |

---

## Differentiators

Features that improve quality beyond baseline. Not expected, but valued.

| Feature | Value Proposition | Complexity | Depends On |
|---------|-------------------|------------|------------|
| Frame-skip on catch-up | `AnimationManager` already accumulates delta and calls `callback()` multiple times per rAF tick when behind; with direct DOM patching, skip intermediate frames and write only the latest — avoids wasted paints when the browser is under load | Low | Direct DOM patching already in place; change callback to track latest frame index, write once per rAF |
| IntersectionObserver pause when scrolled off-screen | Terminal hero is above the fold but on mobile or long pages the user may scroll past it; IO pause stops rAF when `intersectionRatio === 0`, saving CPU when animation is invisible | Medium | `AnimatedTerminal` — add `useRef` on wrapper div, observe in `useEffect`, call `animationManager.pause/start` |
| `aria-label` + `aria-live="off"` on terminal content | Screen readers will try to announce every `innerHTML` change at 30fps without this; `aria-live="off"` suppresses live-region announcements, `aria-label="Terminal animation"` gives context | Low | `Terminal` component — add attrs to `<code>` element |
| `content-visibility: auto` on terminal wrapper | Browser skips layout/paint for off-screen content automatically; pairs with IntersectionObserver for belt-and-suspenders off-screen savings | Low | `Terminal.module.css` — test carefully, can cause layout shift if terminal height is not fixed |

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| CSS-only animation (keyframes) | Frames are pre-generated HTML strings with colored spans — not CSS-animatable; converting 235 frames to CSS keyframes would bloat the stylesheet by hundreds of KB | Keep JS-driven rAF loop, optimize the DOM write path |
| Web Animations API (`element.animate()`) | WAAPI is for CSS property interpolation, not innerHTML swapping; wrong tool for this content type | N/A |
| Canvas rendering | Would require re-implementing the entire colored-span rendering pipeline as canvas draw calls; massive scope increase for marginal gain on text content at 30fps | Direct DOM patching is sufficient |
| React `useTransition` / `startTransition` for frame updates | `startTransition` marks updates as non-urgent and can defer them — the opposite of what animation needs; frame updates must be synchronous with the rAF callback | Direct DOM ref writes, no React state involvement |
| `requestIdleCallback` for frame scheduling | rIC fires during idle time, not at display refresh boundaries; produces irregular frame timing and visible jank | Keep rAF-based `AnimationManager` |
| `will-change: transform` on every line `<div>` | Promoting 235 individual divs to GPU layers causes layer explosion — each layer consumes GPU texture memory; on mobile this can crash the tab | Apply `will-change` only to the single `.content` container |
| Double-buffering / off-screen DOM | Unnecessary complexity for HTML string swaps; the browser already batches paints within a single rAF callback | Single `innerHTML` write per frame |

---

## Feature Dependencies

```
Direct DOM patching
  → requires: useRef forwarded to Terminal <code> element (or bypass Terminal entirely)
  → enables: frame-skip for free (track latest frame index, write once per rAF)
  → enables: aria-live="off" (no React re-render to fight)
  → makes: stable line keys irrelevant (React no longer owns the DOM nodes)

Stable line keys (index-only)
  → requires: Terminal component key change (i + line → i)
  → only needed if React state path is kept as fallback or for non-animated Terminal usage

visibilitychange listener
  → requires: AnimatedTerminal useEffect — document.addEventListener('visibilitychange', handler)
  → pairs with: existing window focus/blur handlers (keep both)

prefers-reduced-motion reactive
  → requires: AnimatedTerminal useEffect — matchMedia.addEventListener('change', handler)
  → replaces: one-time .matches check on mount (keep initial check, add listener)

GPU layer promotion
  → requires: Terminal.module.css — will-change: transform on .content only
  → warning: do NOT apply to individual line divs — layer explosion risk

IntersectionObserver pause
  → requires: wrapper ref in AnimatedTerminal, IO in useEffect
  → pairs with: visibilitychange (both call animationManager.pause/start)
  → order: IO fires before visibilitychange in scroll scenarios
```

---

## MVP Recommendation

Prioritize in this order — each is a self-contained change with no cross-dependencies:

1. Direct DOM patching in `AnimatedTerminal` — eliminates the root cause (React reconciliation at 30fps). Single `useRef` + `innerHTML` write in `AnimationManager.callback`. Biggest impact, medium effort.
2. `visibilitychange` listener — one `addEventListener` call, fixes the tab-switch CPU drain bug listed in PROJECT.md as a known issue.
3. GPU layer promotion — one CSS rule on `.content` in `Terminal.module.css`. Zero JS changes.
4. `prefers-reduced-motion` reactive listener — three lines of JS, correct accessibility behavior.
5. `aria-live="off"` on terminal content — one attribute, prevents screen reader spam at 30fps.

Defer:
- IntersectionObserver pause — terminal is above the fold; low real-world impact until page grows longer
- `content-visibility: auto` — test carefully; can cause layout shift on first paint if terminal height is not fixed
- Stable line keys — only matters if React state path is kept; direct DOM patching makes it moot

---

## Sources

- MDN Page Visibility API: https://developer.mozilla.org/en/DOM/Using_the_Page_Visibility_API
- Motion.dev — when browsers throttle rAF: https://motion.dev/magazine/when-browsers-throttle-requestanimationframe
- Motion.dev — web animation performance tier list: https://motion.dev/magazine/web-animation-performance-tier-list
- GPU layer explosion warning: https://loke.dev/blog/the-layer-explosion-gpu-memory
- Composited animations explainer: https://adame.io/technique/avoid-non-composited-animations/
- Addyosmani rAF frame-rate limiting gist: https://gist.github.com/addyosmani/5434533
