# Domain Pitfalls: Direct DOM Patching in React Animation

**Domain:** React/Next.js animation component with direct DOM manipulation
**Researched:** 2026-04-20
**Milestone:** v1.4 Animation Performance Optimization
**Context:** Adding direct DOM patching to `AnimatedTerminal` / `Terminal` in a Next.js 16 / React 19 App Router project

---

## Critical Pitfalls

### Pitfall 1: React Overwriting Direct DOM Patches on Re-Render

**Risk:** CRITICAL

**What goes wrong:** React's reconciler diffs a virtual DOM snapshot against what it *thinks* the real DOM looks like. If you directly mutate DOM nodes that React rendered (e.g., patching `innerHTML` of the row `<div>`s inside `Terminal`), React's next render will overwrite your changes — or produce corrupted output where its expected structure no longer matches reality.

**Why it happens:** React caches the last rendered vDOM tree. When it reconciles on the next state change (even an unrelated one), it compares against that cache, not the live DOM. Your direct patches are invisible to it.

**Consequences:** Flickering on the frame after any React re-render; corrupted HTML content; React warnings about unexpected DOM structure; in React 19 with concurrent features, partial renders can interleave with your patches mid-frame.

**Prevention:**
- Own the DOM nodes exclusively. Use `useRef` to get a container ref, render an *empty* container from React, and do all content writes imperatively. React never touches children it didn't create.
- The correct split: React owns the outer `<Terminal>` shell (header, scroll container, CSS classes). A `useRef` on the `<Code>` element hands off the inner content area to the imperative loop. React renders `null` or an empty fragment as children when in direct-patch mode.
- Never mix: don't let React render `lines.map(...)` children *and* also patch those same nodes imperatively.

**Detection:** React DevTools "highlight updates" flashing on every rAF tick means React is still re-rendering. If you see it after the refactor, the state/vDOM boundary is wrong.

**Phase:** v1.4 — this is the core architectural decision for the direct-DOM-patching work.

---

### Pitfall 2: StrictMode Double-Invoke Corrupting DOM Pre-Allocation

**Risk:** CRITICAL (development only, but masks real bugs)

**What goes wrong:** React 18+ StrictMode double-invokes effects (`useEffect` setup + teardown + setup again) in development. `AnimationManager` is instantiated in `useState(() => new AnimationManager(...))` — that initializer runs once. But the `useEffect` that calls `animationManager.start()` runs twice. If you add direct DOM setup in `useEffect` (e.g., pre-allocating row `<div>` nodes), that setup runs twice, potentially doubling DOM nodes.

**Why it happens:** StrictMode intentionally stresses effects to surface non-idempotent setup. The current `AnimationManager.start()` is idempotent (guards with `if (this._animation != null) return`), but any new DOM pre-allocation must also be idempotent.

**Consequences:** In dev, doubled DOM rows, doubled event listeners, or doubled `will-change` promotions. These disappear in production builds, making them hard to catch.

**Prevention:**
- Make all `useEffect` DOM setup idempotent: check if nodes already exist before creating them (e.g., `containerRef.current.children.length === 0` guard).
- Always pair every DOM mutation in setup with a full teardown in the cleanup function (`return () => { containerRef.current.innerHTML = '' }`).
- Test in dev mode (StrictMode active) before assuming correctness.

**Detection:** In dev, inspect the DOM after mount — if you see double the expected row count, StrictMode is exposing a non-idempotent setup.

**Phase:** v1.4 — must be verified during the direct-DOM-patching implementation.

---

### Pitfall 3: Hydration Mismatch from Client DOM Patches Before Hydration Completes

**Risk:** HIGH

**What goes wrong:** Next.js App Router prerenders components to static HTML. `AnimatedTerminal` is `"use client"` and uses `useState(16)` as the initial frame — so the server renders frame 16. The client hydrates, React expects the DOM to match frame 16, then the animation loop immediately starts patching. If the patch happens before React finishes hydration, React throws a hydration mismatch error and bails out to client-only rendering.

**Why it happens:** `requestAnimationFrame` can fire before React's hydration pass completes on slow devices or when the JS bundle is large. Direct DOM writes during that window corrupt the hydration checkpoint.

**Consequences:** React falls back to full client render (discards server HTML), console error, potential flash of unstyled/empty terminal.

**Prevention:**
- Gate `animationManager.start()` behind a `useEffect` — which already runs post-hydration. This is already correct in the current code.
- For direct DOM patching: only begin writing to DOM nodes inside `useEffect`, never in render or in a `useLayoutEffect` that fires before hydration completes.
- If pre-allocating row nodes, do it in `useEffect`, not during render.
- The `useState(16)` initial frame is fine — it gives React a stable server/client match for the initial render. Don't change it to `useState(0)` without also updating the server render.

**Detection:** Next.js will log `Error: Hydration failed because the server rendered HTML didn't match the client.` Check browser console after first load with `next build && next start`.

**Phase:** v1.4 — verify no hydration errors after patching refactor.

---

## Moderate Pitfalls

### Pitfall 4: Memory Leak — rAF Loop Not Cancelled on Unmount

**Risk:** HIGH

**What goes wrong:** `AnimationManager` holds a `requestAnimationFrame` handle in `this._animation`. The current `useEffect` cleanup removes event listeners but does NOT call `animationManager.pause()`. If the component unmounts (e.g., navigating away from the homepage), the rAF loop keeps running, and with direct DOM patching it will write to a detached DOM node indefinitely.

**Why it happens:** The cleanup function in `useEffect` only removes `focus`/`blur`/`keyup` listeners. The `animationManager` itself is never stopped on unmount.

**Consequences:** CPU usage continues after navigation. With direct DOM patching, writes to detached nodes accumulate. With `will-change` on the container, the compositor layer is never released.

**Prevention:** Add `animationManager.pause()` to the useEffect cleanup:
```tsx
return () => {
  window.removeEventListener("focus", handleFocus);
  window.removeEventListener("blur", handleBlur);
  window.removeEventListener("keyup", handleKeyUp);
  animationManager.pause(); // ADD THIS — currently missing
};
```
This is a bug in the current code that v1.4 must fix regardless of the DOM patching work.

**Detection:** Navigate to `/docs` and back. Open Chrome DevTools Performance tab — if rAF callbacks still appear after navigation, the loop leaked.

**Phase:** v1.4 — fix as part of the animation refactor. Low effort, high impact.

---

### Pitfall 5: visibilitychange Not Wired — Tab-Switch Does Not Pause Animation

**Risk:** MEDIUM

**What goes wrong:** The current code starts the animation only if `document.visibilityState === 'visible'` at mount time, but uses `window focus`/`blur` events to pause/resume. These are different signals:

- `window blur` fires when the browser window loses focus (user switches to another app) but the tab is still visible.
- `document.visibilityState` changes when the tab is hidden (user switches tabs) — this does NOT fire `window blur`.

So switching tabs does not pause the animation. The `visibilityState` check only runs once at mount.

**Why it happens:** `focus`/`blur` and `visibilitychange` are orthogonal browser events. The current AIDX port only uses one.

**Consequences:** Animation runs while the tab is hidden, burning CPU/battery. On mobile, this can trigger thermal throttling.

**Prevention:**
```tsx
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    animationManager.start();
  } else {
    animationManager.pause();
  }
};
document.addEventListener('visibilitychange', handleVisibilityChange);
// in cleanup: document.removeEventListener('visibilitychange', handleVisibilityChange);
```
Keep both `focus`/`blur` (window-level) and `visibilitychange` (tab-level). PROJECT.md already flags this as a known issue to fix in v1.4.

**Detection:** Open DevTools Performance tab, switch to another browser tab, switch back. If rAF callbacks appear during the hidden period, the fix is missing.

**Phase:** v1.4 — explicitly listed as a target feature ("fix tab-switch pause").

---

### Pitfall 6: will-change Overuse Causing GPU Memory Pressure

**Risk:** MEDIUM

**What goes wrong:** `will-change: transform` tells the browser to promote an element to its own compositor layer. Applied to the terminal container, this is correct and beneficial. Applied to each individual row `<div>` (235 rows), it creates 235 compositor layers, each backed by GPU texture memory.

**Why it happens:** Developers apply `will-change` broadly ("make it fast") without understanding that each promoted element consumes GPU VRAM proportional to its painted area.

**Consequences:** On integrated graphics (most laptops), promoting too many layers causes the browser to fall back to software compositing, which is slower than no `will-change` at all. On mobile, it can cause the tab to be killed by the OS memory manager.

**Prevention:**
- Apply `will-change: transform` to exactly one element: the outermost terminal container (`s.terminal` or its wrapper). Not to rows, not to the content area.
- Use `transform: translateZ(0)` as the promotion trigger if you need finer control — it promotes only when the transform is active.
- Remove `will-change` after the animation completes if the terminal ever enters a static state.
- Audit with Chrome DevTools Layers panel: the terminal should appear as exactly 1-2 layers, not hundreds.

**Detection:** Chrome DevTools → Layers panel → count compositor layers. More than 3 for the terminal area is a red flag.

**Phase:** v1.4 — apply when adding CSS GPU acceleration to the terminal container.

---

### Pitfall 7: IntersectionObserver vs visibilitychange — Wrong Tool for Pause Logic

**Risk:** MEDIUM

**What goes wrong:** `IntersectionObserver` detects whether an element is in the viewport. `visibilitychange` detects whether the tab/document is visible. They are not interchangeable:

- `IntersectionObserver` fires when the terminal scrolls out of view — useful for pausing when the user scrolls past the hero.
- `visibilitychange` fires when the tab is hidden — useful for pausing when the user switches tabs.

Using only `visibilitychange` means the animation runs while the terminal is scrolled off-screen. Using only `IntersectionObserver` means the animation runs in a hidden tab.

**Why it happens:** Developers pick one and assume it covers both cases.

**Consequences:** Wasted CPU when terminal is off-screen (common on mobile where the hero is above the fold and users scroll down).

**Prevention:** Use both:
- `IntersectionObserver` on the terminal container ref → pause when `intersectionRatio === 0`, resume when `> 0`.
- `visibilitychange` on `document` → pause when hidden, resume when visible.
- The final pause/resume decision is AND: run only when both visible AND intersecting.

**Detection:** Scroll the terminal off-screen. Open DevTools Performance — if rAF callbacks continue, `IntersectionObserver` is missing.

**Phase:** v1.4 — add `IntersectionObserver` as an enhancement alongside the `visibilitychange` fix.

---

## Minor Pitfalls

### Pitfall 8: dangerouslySetInnerHTML + Direct DOM Patch Double-Write Race

**Risk:** MEDIUM

**What goes wrong:** `Terminal` currently uses `dangerouslySetInnerHTML` to inject HTML strings into row `<div>`s. If you also directly patch those same nodes' `innerHTML` imperatively, you have two writers. React's `dangerouslySetInnerHTML` will overwrite your patch on the next render; your patch will overwrite React's render on the next frame. The result is a race condition producing flickering or stale content.

**Prevention:** Pick one writer per node. For the animation path: remove `dangerouslySetInnerHTML` from the row divs and write `innerHTML` imperatively only. For static/non-animated use of `Terminal`, `dangerouslySetInnerHTML` is fine — the two modes should be separate code paths (`AnimatedTerminal` uses a ref-based imperative renderer; `Terminal` used standalone keeps `dangerouslySetInnerHTML`).

**Phase:** v1.4 — the refactor must cleanly separate the animated and static rendering paths.

---

### Pitfall 9: Key Strategy Regression During DOM Patching Refactor

**Risk:** LOW

**What goes wrong:** The current `Terminal` uses `key={i + line}` (index + content). If the direct-DOM-patching approach is partial and React still renders some children, using `key={i + line}` will cause React to unmount/remount rows on every frame (because the key changes with content), defeating the purpose.

**Prevention:** If React still renders any children in the patched version, use `key={i}` (index only). If React renders no children (full imperative mode), remove the `lines.map` entirely.

**Phase:** v1.4 — decide the key strategy as part of the DOM boundary design.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Direct DOM patching in AnimatedTerminal | React overwriting patches on re-render (#1) | Own DOM nodes exclusively via ref; render empty container from React |
| StrictMode compatibility | Double-invoke corrupting pre-allocated rows (#2) | Idempotent setup + full teardown in useEffect cleanup |
| CSS GPU acceleration | will-change on too many elements (#6) | One `will-change: transform` on the outermost container only |
| Tab-switch pause fix | visibilitychange not wired up (#5) | Add `document.addEventListener('visibilitychange', ...)` with cleanup |
| Scroll-out-of-view pause | IntersectionObserver missing (#7) | Add IO on terminal container ref alongside visibilitychange |
| Unmount cleanup | rAF loop leaking after navigation (#4) | Call `animationManager.pause()` in useEffect cleanup return |
| Hydration | Direct DOM writes before hydration completes (#3) | All DOM writes inside useEffect only, never during render |
| dangerouslySetInnerHTML coexistence | Double-write race condition (#8) | Separate animated and static rendering paths |

## Sources

- Codebase analysis: `src/components/animated-terminal/index.tsx`, `src/components/terminal/index.tsx` (HIGH confidence — direct code inspection)
- React 19 reconciliation and useRef: https://react.dev/reference/react/useRef (HIGH confidence)
- React hydration errors: https://react.dev/errors/418 (HIGH confidence)
- MDN `visibilitychange` event: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event (HIGH confidence)
- MDN `IntersectionObserver`: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API (HIGH confidence)
- MDN `will-change`: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change (MEDIUM confidence — browser behavior varies)
- React StrictMode double-invoke: https://react.dev/reference/react/StrictMode (HIGH confidence)
