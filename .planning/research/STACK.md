# Technology Stack: Animation Performance Optimization

**Project:** AIDX Website — v1.4 Animation Performance Optimization
**Researched:** 2026-04-20
**Scope:** Bypassing React reconciliation for 30fps terminal frame animation

---

## The Core Problem

The current `AnimatedTerminal` calls `setCurrentFrame(...)` on every rAF tick, which triggers a full React re-render of the `Terminal` component. `Terminal` then re-renders all 41 `<div>` rows, each with `dangerouslySetInnerHTML`. React 19 has a known regression (issue #31660) where `dangerouslySetInnerHTML` causes extra repaints. At 30fps that's 30 reconciliation cycles/second touching ~41 DOM nodes each — entirely avoidable.

The fix is to hold a `useRef` to the content container and write `innerHTML` directly in the rAF callback, bypassing React entirely for frame updates.

---

## Technique 1: Direct DOM Patching via `useRef` + `innerHTML`

**Confidence:** HIGH (React official docs + well-established pattern)

### Why it helps

`useRef` returns a stable object whose `.current` property is a live reference to the DOM node. Writing to `node.innerHTML` is a single synchronous DOM mutation — no virtual DOM diff, no fiber reconciliation, no component re-render. For content that changes every frame and is already pre-rendered HTML strings, this is the correct tool.

React's own docs explicitly endorse this pattern for "escape hatch" imperative DOM work. For animation frames, stepping outside React is exactly right.

### Integration with existing code

`Terminal` already has `const codeRef = useRef<HTMLElement>(null)` attached to the `<Code>` element (the scrollable content container). The change is:

1. Expose `codeRef` via a callback ref prop from `Terminal` (e.g. `contentRef?: React.RefObject<HTMLElement>`)
2. In `AnimatedTerminal`, hold a ref to the content node
3. Replace `setCurrentFrame(...)` with a direct write:

```tsx
// AnimatedTerminal — replace useState frame tracking
const contentRef = useRef<HTMLElement>(null);
const frameIndexRef = useRef(16); // mutable, no re-render

// In AnimationManager callback (no setState):
const nextIndex = (frameIndexRef.current + 1) % frames.length;
frameIndexRef.current = nextIndex;
if (contentRef.current) {
  contentRef.current.innerHTML = frames[nextIndex]
    .map((line) => `<div>${line}</div>`)
    .join("");
}
```

`frameIndexRef` is a plain mutable ref — changing it never triggers a render. The DOM update is direct.

### What NOT to do

Do not use `dangerouslySetInnerHTML` on individual `<div>` rows inside a React render cycle for animation. Each frame update causes React to diff 41 elements. The React 19 regression (issue #31660) makes this worse — `dangerouslySetInnerHTML` triggers extra repaints in React 19 even when the content hasn't changed.

---

## Technique 2: `useRef` for Animation State (not `useState`)

**Confidence:** HIGH (React official docs)

### Why it helps

`useState` is for values that, when changed, should cause a re-render. Animation frame index is not that — the DOM update happens imperatively. Using `useState` for frame index means every tick schedules a React render, which batches in React 19 but still runs the reconciler.

`useRef` stores mutable values that survive re-renders without causing them. React's own conceptual implementation shows `useRef` is just a `useState` whose setter is never called — mutations are free.

### Rule of thumb for this codebase

| Value | Hook | Reason |
|-------|------|--------|
| Current frame index | `useRef` | Changes every 33ms, never needs to trigger render |
| DOM content node | `useRef` | Stable reference, imperative writes |
| `AnimationManager` instance | `useState(() => new ...)` | Already correct — stable init, never re-created |
| Platform style (macos/adwaita) | `useState` | Correct — triggers one render on mount |
| Auto-scroll state | `useState` | Correct — triggers render to update scroll behavior |

---

## Technique 3: `requestAnimationFrame` Best Practices in React 19

**Confidence:** HIGH (React docs + browser spec)

### Current implementation is mostly correct

The existing `AnimationManager` class is well-structured:
- Uses a class to avoid closure stale-ref issues
- Tracks `lastFrame` for delta-based frame stepping
- Handles the "catch-up" loop for missed frames
- Cancels via `cancelAnimationFrame` on cleanup

### Gap 1: Visibility API is checked only on mount

The current `useEffect` checks `document.visibilityState === "visible"` once at mount time, then relies on `window focus/blur` events. Tab switching fires `visibilitychange`, not `blur`. A user switching tabs without losing window focus (clicking another tab in the same browser window) will not pause the animation.

Fix: add a `visibilitychange` listener in the same `useEffect`:

```tsx
const handleVisibility = () => {
  if (document.visibilityState === "visible") {
    animationManager.start();
  } else {
    animationManager.pause();
  }
};
document.addEventListener("visibilitychange", handleVisibility);
// in cleanup:
document.removeEventListener("visibilitychange", handleVisibility);
```

### Gap 2: rAF loop not cancelled on unmount

The current cleanup removes event listeners but does NOT call `animationManager.pause()`. If the component unmounts while animating (navigating away), the rAF loop continues until GC. Add `animationManager.pause()` to the cleanup return.

### Do not use `useLayoutEffect` for rAF scheduling

`useLayoutEffect` runs synchronously after DOM mutations, before paint. Starting a rAF loop there is unnecessary and causes SSR hydration warnings in Next.js. `useEffect` is correct here.

---

## Technique 4: CSS GPU Acceleration

**Confidence:** HIGH (MDN + browser rendering model)

### `will-change: contents` on the terminal content area

Tells the browser the element's contents will change frequently. The browser can promote it to its own compositor layer, avoiding full-page repaints on each frame update.

```css
/* Terminal.module.css — add to .content */
.content {
  will-change: contents;
}
```

Apply only to the scrollable `<code>` content element, not the outer `.terminal` wrapper. `will-change` consumes GPU memory — scope it tightly.

### `contain: strict` on the terminal wrapper

CSS `contain` tells the browser this element's layout, paint, and size are independent from the rest of the page. A frame update inside `.content` cannot trigger layout recalculation outside the terminal box.

```css
/* Terminal.module.css — add to .terminal */
.terminal {
  contain: strict;
}
```

`contain: strict` = `contain: size layout paint style`. Safe here because the terminal already has explicit `width` and `height` from CSS custom properties (`--columns`, `--rows`).

### `transform: translateZ(0)` — use only if needed

The classic GPU promotion hack. Creates a new stacking context and compositor layer. Only add if profiling shows the layer isn't being promoted by `will-change` alone.

```css
.content {
  transform: translateZ(0); /* force compositor layer if will-change isn't enough */
}
```

### What NOT to add

- Do not add `will-change` to every element — it pre-allocates GPU memory and degrades performance when overused.
- Do not use `opacity: 0.999` as a GPU hack — `will-change` replaces this cleanly.
- Do not animate `width`, `height`, `top`, `left`, `margin`, or `padding` — these trigger layout. The terminal is static-sized so this isn't a concern, but avoid introducing any such animations.

---

## Technique 5: Stable Line Keys in Terminal

**Confidence:** HIGH (React reconciliation docs)

### Current key is wrong for animation

```tsx
// Current — key changes every frame even if line content is identical
key={i + line}
```

When `line` content changes (every frame), the key changes, React unmounts the old `<div>` and mounts a new one. For 41 lines × 30fps = 1,230 DOM node replacements per second.

### Fix: index-only key

```tsx
key={i}
```

With `key={i}`, React reuses the same DOM node and only updates its `innerHTML`. Combined with direct DOM patching (Technique 1), React never touches these nodes during animation at all — but if React does render (e.g., on mount), stable keys mean it reuses nodes instead of replacing them.

This is safe because the lines array is always exactly `rows` (41) elements long and order is positional, not identity-based.

---

## Integration Summary

| Change | File | What it does |
|--------|------|--------------|
| Replace `setCurrentFrame` with `contentRef.current.innerHTML = ...` | `animated-terminal/index.tsx` | Eliminates 30 React renders/sec |
| Store frame index in `useRef` not `useState` | `animated-terminal/index.tsx` | No state updates in rAF loop |
| Add `visibilitychange` listener | `animated-terminal/index.tsx` | Fixes tab-switch pause bug |
| Add `animationManager.pause()` to cleanup | `animated-terminal/index.tsx` | Prevents rAF leak on unmount |
| Change `key={i + line}` to `key={i}` | `terminal/index.tsx` | Stable DOM nodes on React renders |
| Add `will-change: contents` to `.content` | `Terminal.module.css` | GPU layer for content area |
| Add `contain: strict` to `.terminal` | `Terminal.module.css` | Isolates layout/paint to terminal box |
| Expose content ref from `Terminal` | `terminal/index.tsx` | Allows `AnimatedTerminal` to write directly |

---

## What NOT to Add

- **No animation library** (Framer Motion, GSAP, etc.) — the animation is pre-rendered HTML frames, not CSS/JS property interpolation. These libraries solve a different problem.
- **No Web Workers** — the bottleneck is DOM writes, not computation. Workers can't touch the DOM.
- **No canvas rendering** — the frames are HTML with `<span>` color classes. Rewriting to canvas would require a full frame pipeline rewrite.
- **No `useTransition` or `startTransition`** — these defer non-urgent React state updates. The goal here is to eliminate React state updates entirely for frame changes.
- **No `React.memo` on Terminal** — with direct DOM patching, Terminal won't re-render during animation at all. Memo adds overhead for no benefit.

---

## Sources

- React docs — Manipulating the DOM with Refs: https://react.dev/learn/manipulating-the-dom-with-refs
- React docs — Referencing Values with Refs: https://react.dev/learn/referencing-values-with-refs
- React 19 issue #31660 — dangerouslySetInnerHTML causes repaint: https://github.com/facebook/react/issues/31660
- MDN — CSS contain: https://developer.mozilla.org/en-US/docs/Web/CSS/contain
- MDN — CSS will-change: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
- MDN — Page Visibility API: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
- Web Animation Performance Tier List (motion.dev): https://motion.dev/magazine/web-animation-performance-tier-list
