# Requirements — v1.4 Animation Performance Optimization

## Milestone Goal

Eliminate React reconciliation overhead on each frame update so the homepage terminal animation runs as smoothly as Ghostty's.

## Active Requirements

### Core Rendering

- [ ] **RENDER-01**: Terminal component exposes content element ref via `React.forwardRef`
- [ ] **RENDER-02**: Terminal uses stable `key={i}` for line divs (not `key={i + line}`)
- [ ] **RENDER-03**: AnimatedTerminal uses direct `innerHTML` patching via `contentRef` instead of `setCurrentFrame` for frame updates after initial render

### Lifecycle & Correctness

- [ ] **LIFE-01**: AnimatedTerminal `useEffect` cleanup calls `animationManager.pause()` to cancel rAF loop on unmount
- [ ] **LIFE-02**: AnimatedTerminal listens to `document.visibilitychange` to pause/resume on tab switch
- [ ] **LIFE-03**: `prefers-reduced-motion` check uses a reactive `matchMedia` listener (not one-time mount check)

### CSS Performance

- [ ] **CSS-01**: `.terminal` has `contain: strict` to isolate layout/paint from page
- [ ] **CSS-02**: `.content` has `will-change: contents` for GPU compositor layer (not applied to individual row divs)

### Accessibility

- [ ] **A11Y-01**: `<Code>` element has `aria-live="off"` to prevent screen reader announcements on innerHTML updates

## Future Requirements

- IntersectionObserver-based pause when terminal scrolls out of viewport (defer — terminal is above the fold)
- `content-visibility: auto` on terminal container (defer — low payoff until page grows)

## Out of Scope

- New npm packages — all changes use existing React APIs and browser APIs
- Changes to animation frame content or generation pipeline — frames are correct, rendering is the issue
- Server-side rendering changes — site remains fully static

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| RENDER-01 | Phase 7 | Pending |
| RENDER-02 | — | Pending |
| RENDER-03 | — | Pending |
| LIFE-01 | — | Pending |
| LIFE-02 | — | Pending |
| LIFE-03 | — | Pending |
| CSS-01 | — | Pending |
| CSS-02 | — | Pending |
| A11Y-01 | — | Pending |
