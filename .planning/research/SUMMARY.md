# Research Summary — v1.4 Animation Performance Optimization

## Stack Additions

| API / Pattern | Why |
|---|---|
| `React.forwardRef` on `Terminal` | Exposes inner `<Code>` ref to `AnimatedTerminal` without prop-drilling |
| `useRef` for frame index | Mutable cursor — never triggers a render, replaces `useState(currentFrame)` in the rAF loop |
| Direct `innerHTML` write in rAF callback | Bypasses React reconciliation; single synchronous DOM mutation per changed line |
| `document.visibilitychange` event | Pauses on tab switch — orthogonal to `window focus/blur`, both needed |
| `contain: strict` on `.terminal` | Isolates layout/paint; frame updates cannot trigger page-level reflow |
| `will-change: contents` on `.content` | Promotes terminal content area to its own compositor layer |

Nothing new to install.

## Feature Table Stakes

Must ship in v1.4:

1. **Direct DOM patching** — replace `setCurrentFrame` with `contentRef.current.children[i].innerHTML = line` per changed line
2. **Stable line keys** — `key={i}` instead of `key={i + line}` in `Terminal`
3. **`visibilitychange` listener** — fixes known tab-switch CPU drain bug
4. **`animationManager.pause()` in cleanup** — fixes rAF leak on navigation (currently missing)
5. **`prefers-reduced-motion` reactive listener** — WCAG 2.1 SC 2.3.3 compliance
6. **`aria-live="off"` on `<Code>`** — prevents screen reader spam at 30fps

Defer: IntersectionObserver pause, `content-visibility: auto`.

## Architecture Changes

Build order: Terminal first, then AnimatedTerminal.

- `src/components/terminal/index.tsx` — wrap with `React.forwardRef`, forward ref to `<Code>` (unify with existing `codeRef`), change key to `key={i}`
- `src/components/animated-terminal/index.tsx` — add `contentRef`, demote `currentFrame` to `useRef` (keep `useState(16)` for initial render only), add `patchFrame()` imperative function, replace `setCurrentFrame` in callback with `patchFrame`, add `visibilitychange` listener, add `animationManager.pause()` to cleanup
- `src/components/terminal/Terminal.module.css` — add `contain: strict` to `.terminal`, add `will-change: contents` to `.content` only

## Watch Out For

1. **React overwriting direct DOM patches** — `frameIndex` must be `useRef` not `useState`; `lines` prop to `Terminal` must never change after mount. Verify with React DevTools "highlight updates" — zero flashes during animation.

2. **StrictMode double-invoke** — `useEffect` DOM setup must be idempotent and fully torn down in cleanup. Bugs here disappear in production, so test in dev mode.

3. **`will-change` on individual row divs causes GPU layer explosion** — apply only to the single `.content` container. 41 promoted layers degrades to software compositing on integrated graphics. Audit with Chrome DevTools Layers panel: expect 1-2 layers max.
