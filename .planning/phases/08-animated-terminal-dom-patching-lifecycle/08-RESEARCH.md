# Phase 8: AnimatedTerminal DOM Patching & Lifecycle — Research

**Researched:** 2026-04-21
**Domain:** React imperative DOM patching, rAF lifecycle, browser visibility API, CSS containment, ARIA live regions
**Confidence:** HIGH

---

## Summary

Phase 8 is a surgical refactor of `src/components/animated-terminal/index.tsx` and two CSS property additions to `Terminal.module.css`. The goal is to eliminate React reconciliation overhead on every animation frame by switching from `setCurrentFrame` (which triggers a full React re-render) to direct `innerHTML` writes on the `contentRef` obtained from the Phase 7 `forwardRef` Terminal.

Five bugs are fixed in the same pass: rAF loop leak on unmount (LIFE-01), wrong visibility event (`window.focus/blur` vs `document.visibilitychange`, LIFE-02), and one-time reduced-motion check instead of a reactive listener (LIFE-03). Two CSS performance hints are added (`contain: strict` on `.terminal`, `will-change: contents` on `.content`), and `aria-live="off"` is added to the `<Code>` element to silence screen readers during innerHTML churn.

All seven requirements (RENDER-03, LIFE-01, LIFE-02, LIFE-03, CSS-01, CSS-02, A11Y-01) are addressed in two files. No new npm packages. Visual output is byte-for-byte identical before and after.

**Primary recommendation:** Replace the `useState`/`setCurrentFrame` animation loop with a `useRef`-held frame index and direct `contentRef.current.innerHTML` writes inside the `AnimationManager` callback. Wire `document.visibilitychange` and a reactive `matchMedia` listener in the same `useEffect`, and call `animationManager.pause()` in the cleanup function.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Frame rendering (innerHTML write) | Browser / Client | — | Direct DOM mutation; must bypass React reconciler entirely |
| rAF loop management | Browser / Client | — | `requestAnimationFrame` is a browser API; `AnimationManager` class already encapsulates it |
| Tab visibility pause/resume | Browser / Client | — | `document.visibilitychange` is a browser event; no server involvement |
| Reduced-motion reactive check | Browser / Client | — | `matchMedia` listener is client-only |
| CSS containment / GPU hint | Browser / Client | — | `contain` and `will-change` are paint-layer browser hints |
| ARIA live region suppression | Browser / Client | — | `aria-live` is a DOM attribute consumed by the browser accessibility tree |

---

## Standard Stack

### Core (all already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x (project) | `useRef`, `useEffect`, `forwardRef` | Already in use; imperative escape hatch via refs is the documented React pattern for bypassing reconciliation [CITED: react.dev/reference/react/useRef] |
| Browser `document.visibilitychange` | Web API | Pause animation on tab switch | Correct API for tab visibility; `window.focus/blur` fires on iframe focus changes and OS window switches, not tab switches [ASSUMED] |
| Browser `matchMedia` + `change` event | Web API | Reactive reduced-motion | `MediaQueryList.addEventListener('change', ...)` is the standard reactive pattern; one-time `.matches` misses OS preference changes after mount [CITED: developer.mozilla.org/en-US/docs/Web/API/MediaQueryList] |
| CSS `contain: strict` | CSS Containment L2 | Isolate terminal layout/paint | Implies size + layout + paint + style containment; safe when element has explicit width/height [ASSUMED] |
| CSS `will-change: contents` | CSS Will-Change | GPU compositor layer for content area | Hints compositor to promote element; `contents` value is correct for innerHTML-mutated elements [ASSUMED] |

### No New Packages

All changes use existing React APIs and browser APIs. REQUIREMENTS.md "Out of Scope" explicitly forbids new npm packages. [VERIFIED: .planning/REQUIREMENTS.md]

---

## Architecture Patterns

### System Architecture Diagram

```
AnimatedTerminal (useEffect)
  │
  ├── AnimationManager.start()
  │     └── rAF loop → callback()
  │           └── frameIndex = (frameIndex + 1) % frames.length   [no setState]
  │                 └── contentRef.current.innerHTML = buildHTML(frames[frameIndex])
  │
  ├── document.visibilitychange listener
  │     ├── hidden  → animationManager.pause()
  │     └── visible → animationManager.start()
  │
  ├── matchMedia('prefers-reduced-motion: reduce').change listener
  │     ├── matches → animationManager.pause()
  │     └── !matches → animationManager.start()
  │
  └── useEffect cleanup
        └── animationManager.pause()   [cancels rAF, no leak]

Terminal (forwardRef — Phase 7 output)
  └── <Code ref={codeRef} aria-live="off">   [A11Y-01]
        └── line divs with key={i}           [RENDER-02, Phase 7]
```

### Recommended File Structure (no new files)

```
src/components/
├── animated-terminal/
│   └── index.tsx          # PRIMARY: refactor AnimatedTerminal
└── terminal/
    ├── index.tsx           # ADD aria-live="off" to <Code>
    └── Terminal.module.css # ADD contain: strict, will-change: contents
```

### Pattern 1: Direct innerHTML Write (RENDER-03)

**What:** Replace `setCurrentFrame` with a `useRef`-held frame index. The `AnimationManager` callback writes HTML directly to the DOM node obtained via `contentRef`.

**When to use:** Any time a React component drives high-frequency DOM updates where reconciliation cost exceeds the value of React managing that subtree.

**Key constraint:** The HTML written must be identical to what React would have rendered. The existing `lines?.map((line, i) => <div dangerouslySetInnerHTML={{__html: `${padding}${line}${padding}`}} />)` pattern produces `<div>${padding}${line}${padding}</div>` per line. The direct write must replicate this exactly.

```typescript
// Source: derived from existing Terminal render logic in src/components/terminal/index.tsx
// The innerHTML string must match what React renders for each line div
const buildFrameHTML = (lines: string[], padding: string): string =>
  lines.map((line) => `<div>${padding}${line}${padding}</div>`).join("");

// Inside AnimationManager callback (no setState):
const frameIndexRef = useRef(16); // matches original useState(16) initial value
const animationManager = useRef(
  new AnimationManager(() => {
    frameIndexRef.current = (frameIndexRef.current + 1) % frames.length;
    if (contentRef.current) {
      contentRef.current.innerHTML = buildFrameHTML(
        frames[frameIndexRef.current],
        " ".repeat(whitespacePadding),
      );
    }
  }, baseFps)
);
```

[ASSUMED — pattern derived from reading existing code, not from external docs]

### Pattern 2: Obtaining contentRef from forwardRef Terminal (RENDER-03 prerequisite)

**What:** `AnimatedTerminal` passes a `useRef<HTMLElement>(null)` to `<Terminal ref={contentRef}>`. After Phase 7, Terminal's `forwardRef` exposes the inner `<Code>` element via `useImperativeHandle`.

```typescript
// Source: src/components/terminal/index.tsx (Phase 7 output — already implemented)
const contentRef = useRef<HTMLElement>(null);
// ...
<Terminal ref={contentRef} ... />
// contentRef.current is now the <code> DOM node
```

[VERIFIED: src/components/terminal/index.tsx — forwardRef + useImperativeHandle already in place]

### Pattern 3: document.visibilitychange (LIFE-02)

**What:** Replace `window.focus`/`window.blur` with `document.visibilitychange`. The `document.visibilityState` property is `"visible"` or `"hidden"`.

```typescript
// Source: [ASSUMED — standard browser API pattern]
const handleVisibilityChange = () => {
  if (document.visibilityState === "hidden") {
    animationManager.pause();
  } else {
    animationManager.start();
  }
};
document.addEventListener("visibilitychange", handleVisibilityChange);
// cleanup:
document.removeEventListener("visibilitychange", handleVisibilityChange);
```

The existing code already checks `document.visibilityState === "visible"` before calling `animationManager.start()` on mount — this pattern is consistent with that. [VERIFIED: src/components/animated-terminal/index.tsx line 121]

### Pattern 4: Reactive matchMedia (LIFE-03)

**What:** Replace one-time `.matches` check with a `change` event listener on the `MediaQueryList` object.

```typescript
// Source: [ASSUMED — standard browser API pattern]
const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
if (mql.matches) {
  // don't start — reduced motion active at mount
  return;
}
const handleMotionChange = (e: MediaQueryListEvent) => {
  if (e.matches) {
    animationManager.pause();
  } else {
    animationManager.start();
  }
};
mql.addEventListener("change", handleMotionChange);
// cleanup:
mql.removeEventListener("change", handleMotionChange);
```

[ASSUMED — standard browser API; `MediaQueryList.addEventListener` is widely supported]

### Pattern 5: useEffect cleanup calling pause() (LIFE-01)

**What:** The existing cleanup only removes event listeners. It must also call `animationManager.pause()` to cancel the rAF loop.

```typescript
// Source: derived from existing code — cleanup currently missing pause()
return () => {
  animationManager.pause(); // ADD THIS — cancels rAF, sets _animation = null
  window.removeEventListener("focus", handleFocus);   // REMOVE (replaced by visibilitychange)
  window.removeEventListener("blur", handleBlur);     // REMOVE (replaced by visibilitychange)
  window.removeEventListener("keyup", handleKeyUp);   // KEEP
  document.removeEventListener("visibilitychange", handleVisibilityChange); // ADD
  mql.removeEventListener("change", handleMotionChange); // ADD
};
```

[VERIFIED: src/components/animated-terminal/index.tsx lines 124-128 — pause() call is absent]

### Anti-Patterns to Avoid

- **Calling `setState` inside the AnimationManager callback:** Defeats the entire purpose of RENDER-03. The callback must only mutate `frameIndexRef.current` and write `innerHTML`.
- **Using `window.focus`/`window.blur` for tab visibility:** These fire on OS-level window focus changes and iframe interactions, not tab switches. `document.visibilitychange` is the correct API. [ASSUMED]
- **One-time `matchMedia().matches` check:** Misses the case where the user enables reduced-motion after the component mounts (e.g., via OS accessibility settings). [ASSUMED]
- **Forgetting to remove the `matchMedia` listener:** `MediaQueryList` listeners are not automatically cleaned up on component unmount. [ASSUMED]
- **Writing innerHTML that doesn't match React's expected output:** If the Terminal component ever re-renders (e.g., platform detection on mount), React will overwrite the innerHTML with its own render. The direct-write path only runs after the initial React render stabilizes. This is safe because `AnimationManager.start()` is called after mount, and the initial frame is set by React's first render.
- **`contain: strict` without explicit dimensions:** `contain: strict` includes size containment, which requires the element to have explicit width and height. The terminal already sets both via CSS custom properties — this is safe. [ASSUMED]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab visibility detection | Custom focus/blur tracking | `document.visibilitychange` | Browser-native; handles all tab-switch scenarios including keyboard shortcuts |
| Reduced-motion detection | Custom CSS class toggle | `window.matchMedia` + `change` listener | OS-level preference; reactive to runtime changes |
| rAF loop management | New class or hook | Existing `AnimationManager` class | Already handles fps throttling, start/pause, and the Konami code easter egg |
| Frame HTML generation | New template engine | String interpolation matching Terminal's render | Must be identical to React's output; keep it minimal |

**Key insight:** The `AnimationManager` class is already correct and complete. Phase 8 only changes what the callback does (innerHTML write instead of setState) and fixes the lifecycle wiring around it.

---

## Common Pitfalls

### Pitfall 1: HTML Mismatch Between React Render and Direct Write

**What goes wrong:** The `buildFrameHTML` function produces different HTML than React's `dangerouslySetInnerHTML` render. On the next React re-render (e.g., platform detection state change on mount), React overwrites the direct-written content with its own render, causing a visual flash or incorrect frame.

**Why it happens:** React renders `<div>${padding}${line}${padding}</div>` with no extra whitespace. A naive `lines.join('\n')` would produce newlines between divs that React doesn't produce.

**How to avoid:** Match the exact output of Terminal's render: `lines.map(line => \`<div>${padding}${line}${padding}</div>\`).join("")` — no newlines, no extra attributes.

**Warning signs:** Visual flash when platform detection fires on mount (the `setPlatformStyle` useEffect in Terminal).

### Pitfall 2: AnimationManager Callback Closure Over Stale `frames`

**What goes wrong:** The `AnimationManager` is created once (via `useState(() => new AnimationManager(...))` in the current code). If `frames` or `whitespacePadding` changes, the callback closure captures the original values.

**Why it happens:** The callback is set at construction time. `frames.length` is used in the modulo operation.

**How to avoid:** Use a `useRef` for the frame index and access `frames` and `whitespacePadding` from the component scope via refs, or reconstruct the manager when props change. Since `frames` is a static prop (animation frames don't change at runtime), this is not a practical risk — but the implementation should use `useRef` for the manager to avoid the `useState` re-render on construction.

**Warning signs:** Animation loops back to frame 0 unexpectedly, or padding is wrong after a prop change.

### Pitfall 3: Double-Start on Mount

**What goes wrong:** `animationManager.start()` is called twice — once from the `visibilitychange` handler firing immediately, and once from the explicit start call in the effect body.

**Why it happens:** `document.visibilityState` is `"visible"` when the component mounts on the active tab. If the handler is registered before the explicit start call, and the browser fires a synthetic event, the manager could be started twice.

**How to avoid:** `AnimationManager.start()` already guards against double-start: `if (this._animation != null) return;`. [VERIFIED: src/components/animated-terminal/index.tsx line 24] The guard makes this safe, but the explicit start call after registering listeners is still the correct pattern (matches existing code line 121-123).

### Pitfall 4: Forgetting to Remove the `matchMedia` Listener

**What goes wrong:** `mql.removeEventListener("change", handler)` is not called in cleanup. The handler fires after unmount, calling `animationManager.start()` on a null `contentRef`.

**Why it happens:** `matchMedia` listeners are not tied to the React component lifecycle.

**How to avoid:** Always pair `mql.addEventListener` with `mql.removeEventListener` in the same `useEffect` cleanup.

**Warning signs:** Console error "Cannot set properties of null (setting 'innerHTML')" after navigating away.

### Pitfall 5: `contain: strict` Breaking Terminal Dimensions

**What goes wrong:** Adding `contain: strict` to `.terminal` causes the terminal to collapse to zero size because size containment requires explicit dimensions.

**Why it happens:** `contain: strict` includes `contain: size`, which tells the browser the element's size is independent of its children. Without explicit dimensions, the element collapses.

**How to avoid:** The terminal already sets explicit `width` and `height` via CSS custom properties (`--columns`, `--rows`, character dimensions). These are set via inline `style` prop in Terminal's JSX. `contain: strict` is safe here. [VERIFIED: src/components/terminal/index.tsx lines 94-99, Terminal.module.css lines 45-46]

---

## Code Examples

### Complete AnimatedTerminal Refactor Sketch

```typescript
// Source: derived from src/components/animated-terminal/index.tsx
// Changes: useRef for manager + frameIndex, direct innerHTML, visibilitychange, reactive matchMedia, cleanup pause

"use client";

import { useEffect, useRef } from "react";
import Terminal, { type TerminalProps } from "../terminal";

// AnimationManager class unchanged

export default function AnimatedTerminal({ ..., frames, whitespacePadding, frameLengthMs }: AnimatedTerminalProps) {
  const baseFps = 1000 / frameLengthMs;
  const contentRef = useRef<HTMLElement>(null);
  const frameIndexRef = useRef(16);
  const padding = " ".repeat(whitespacePadding ?? 0);

  // Use useRef so manager construction doesn't trigger re-render
  const managerRef = useRef<AnimationManager | null>(null);
  if (managerRef.current === null) {
    managerRef.current = new AnimationManager(() => {
      frameIndexRef.current = (frameIndexRef.current + 1) % frames.length;
      if (contentRef.current) {
        contentRef.current.innerHTML = frames[frameIndexRef.current]
          .map((line) => `<div>${padding}${line}${padding}</div>`)
          .join("");
      }
    }, baseFps);
  }
  const animationManager = managerRef.current;

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return; // reduced motion at mount — don't start

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        animationManager.pause();
      } else {
        animationManager.start();
      }
    };
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        animationManager.pause();
      } else if (document.visibilityState === "visible") {
        animationManager.start();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => { /* Konami code — unchanged */ };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    mql.addEventListener("change", handleMotionChange);
    window.addEventListener("keyup", handleKeyUp);

    if (document.visibilityState === "visible") {
      animationManager.start();
    }

    return () => {
      animationManager.pause(); // LIFE-01: cancel rAF on unmount
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mql.removeEventListener("change", handleMotionChange);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [animationManager, frames.length, baseFps]);

  // Render initial frame via React (Terminal renders lines prop on first render)
  // After mount, AnimationManager writes innerHTML directly — no setCurrentFrame
  return (
    <Terminal
      ref={contentRef}
      className={className}
      columns={columns}
      whitespacePadding={whitespacePadding}
      rows={rows}
      title={title}
      fontSize={fontSize}
      lines={frames[frameIndexRef.current]} // initial frame only — React renders this once
      disableScrolling={true}
    />
  );
}
```

[ASSUMED — sketch only; exact implementation may differ]

### CSS Changes

```css
/* Terminal.module.css — CSS-01 */
.terminal {
  contain: strict; /* ADD — isolates layout/paint from page */
  /* all existing properties unchanged */
}

/* Terminal.module.css — CSS-02 */
.content {
  will-change: contents; /* ADD — GPU compositor layer for innerHTML-mutated element */
  /* all existing properties unchanged */
}
```

[VERIFIED: src/components/terminal/Terminal.module.css — neither property currently present]

### aria-live Addition (A11Y-01)

```tsx
// src/components/terminal/index.tsx — inside Terminal forwardRef render
<Code
  ref={codeRef}
  aria-live="off"  // ADD — prevents screen reader announcements on innerHTML updates
  className={classNames(s.content, { [s.disableScrolling]: disableScrolling })}
  onScroll={handleScroll}
>
```

[VERIFIED: src/components/terminal/index.tsx line 106-112 — aria-live not currently present]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.focus`/`window.blur` for tab visibility | `document.visibilitychange` | Standard since HTML5 | Correct tab-switch detection; focus/blur fires on OS window changes too |
| One-time `matchMedia().matches` | `MediaQueryList.addEventListener('change', ...)` | Standard since Chrome 38 / Firefox 55 | Reactive to OS preference changes after mount |
| `useState` + React re-render per frame | `useRef` + direct `innerHTML` write | React 16+ (escape hatch pattern) | Eliminates reconciliation overhead for high-frequency updates |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `window.focus`/`window.blur` fires on OS window switches and iframe focus, not just tab switches | Standard Stack, Pitfalls | Low — even if wrong, `visibilitychange` is still the correct API per REQUIREMENTS.md |
| A2 | `contain: strict` is safe when element has explicit width/height via CSS custom properties | Standard Stack, Pitfalls | Medium — if size containment collapses the terminal, remove `contain: strict` and use `contain: layout paint style` instead |
| A3 | `will-change: contents` promotes the element to a GPU compositor layer | Standard Stack | Low — worst case it's a no-op hint; no visual regression |
| A4 | `MediaQueryList.addEventListener('change', ...)` is widely supported | Standard Stack | Low — supported in all modern browsers; project targets modern browsers |
| A5 | The `buildFrameHTML` string must use `.join("")` (no newlines) to match React's output | Code Examples, Pitfalls | Medium — if React adds whitespace between divs, the match assumption is wrong; verify by comparing React-rendered innerHTML with direct-written innerHTML in dev tools |
| A6 | Using `useRef` for `AnimationManager` instead of `useState` avoids a re-render on construction | Code Examples | Low — `useState(() => new AnimationManager(...))` also avoids re-render (lazy initializer); either pattern works |

---

## Open Questions

1. **Initial frame rendering after switch to direct innerHTML**
   - What we know: Terminal renders `lines={frames[frameIndexRef.current]}` on first React render. After mount, the AnimationManager writes innerHTML directly.
   - What's unclear: If Terminal re-renders (e.g., `platformStyle` state change on mount), React will overwrite the direct-written innerHTML with its own render of `lines`. The `lines` prop will be stale (initial frame 16) at that point.
   - Recommendation: Keep `lines` prop pointing to `frames[frameIndexRef.current]` — since `frameIndexRef` is a ref, it always holds the current frame index. React re-renders will use the current frame, not frame 16. This is correct behavior.

2. **Konami code easter egg with `useRef`-based manager**
   - What we know: The Konami code calls `animationManager.updateFPS(240)` or `animationManager.updateFPS(baseFps)`. This works the same with a `useRef`-held manager.
   - What's unclear: Nothing — `updateFPS` mutates the manager instance directly, no React state involved.
   - Recommendation: No change needed to Konami code logic.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 8 is a pure code/CSS change with no external dependencies beyond the existing project stack.

---

## Security Domain

No security-relevant changes in this phase. All changes are client-side DOM mutations, CSS hints, and ARIA attributes. No user input, no data persistence, no authentication, no network requests.

ASVS V5 (Input Validation): The `innerHTML` write uses pre-generated frame data from `frames` prop — this data is static, generated at build time, and not user-controlled. No XSS risk. [VERIFIED: animation frames are pre-generated ASCII art per STATE.md]

---

## Sources

### Primary (HIGH confidence)
- `src/components/animated-terminal/index.tsx` — current implementation, all bugs verified by reading
- `src/components/terminal/index.tsx` — Phase 7 forwardRef output, verified
- `src/components/terminal/Terminal.module.css` — CSS properties verified absent
- `.planning/REQUIREMENTS.md` — requirement definitions verified
- `.planning/phases/08-animated-terminal-dom-patching-lifecycle/08-UI-SPEC.md` — CSS and A11Y contracts verified
- `.planning/phases/07-terminal-component-hardening/07-CONTEXT.md` — Phase 7 locked decisions verified

### Secondary (MEDIUM confidence)
- MDN Web Docs pattern for `document.visibilitychange` and `MediaQueryList.addEventListener` — standard browser APIs, widely documented

### Tertiary (LOW confidence)
- CSS `contain: strict` safety with CSS custom property dimensions — [ASSUMED], not verified against MDN in this session
- `will-change: contents` GPU promotion behavior — [ASSUMED], not verified against MDN in this session

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are existing project dependencies; browser APIs are standard
- Architecture: HIGH — derived directly from reading the current implementation
- Pitfalls: MEDIUM — most derived from code reading; CSS containment behavior is ASSUMED
- CSS changes: MEDIUM — property names are correct; interaction with existing layout is ASSUMED safe

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stable APIs — browser APIs and React patterns don't change rapidly)
