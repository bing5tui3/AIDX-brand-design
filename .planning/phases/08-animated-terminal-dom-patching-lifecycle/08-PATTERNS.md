# Phase 8: AnimatedTerminal DOM Patching & Lifecycle — Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 3 (2 modified, 1 CSS)
**Analogs found:** 3 / 3

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/animated-terminal/index.tsx` | component | event-driven (rAF loop + browser events) | `src/components/animated-terminal/index.tsx` (self — refactor) | exact |
| `src/components/terminal/index.tsx` | component | request-response | `src/components/terminal/index.tsx` (self — additive) | exact |
| `src/components/terminal/Terminal.module.css` | config | — | `src/components/terminal/Terminal.module.css` (self — additive) | exact |

All three files are self-referential: Phase 8 modifies existing files, so the analog is the current implementation.

---

## Pattern Assignments

### `src/components/animated-terminal/index.tsx` (component, event-driven)

**Analog:** `src/components/animated-terminal/index.tsx` (current implementation — refactor in place)

**Imports pattern** (lines 1–4 — current):
```typescript
"use client";

import { useEffect, useState } from "react";
import Terminal, { type TerminalProps } from "../terminal";
```

**Imports pattern (after refactor)** — replace `useState` with `useRef`:
```typescript
"use client";

import { useEffect, useRef } from "react";
import Terminal, { type TerminalProps } from "../terminal";
```

**AnimationManager class** (lines 8–49 — unchanged, copy verbatim):
```typescript
class AnimationManager {
  _animation: number | null = null;
  callback: () => void;
  lastFrame = -1;
  frameTime = 1000 / 30;

  constructor(callback: () => void, fps = 30) {
    this.callback = callback;
    this.frameTime = 1000 / fps;
  }

  updateFPS(fps: number) {
    this.frameTime = 1000 / fps;
  }

  start() {
    if (this._animation != null) return;
    this._animation = requestAnimationFrame(this.update);
  }

  pause() {
    if (this._animation == null) return;
    this.lastFrame = -1;
    cancelAnimationFrame(this._animation);
    this._animation = null;
  }

  update = (time: number) => {
    const { lastFrame } = this;
    let delta = time - lastFrame;
    if (this.lastFrame === -1) {
      this.lastFrame = time;
    } else {
      while (delta >= this.frameTime) {
        this.callback();
        delta -= this.frameTime;
        this.lastFrame += this.frameTime;
      }
    }
    this._animation = requestAnimationFrame(this.update);
  };
}
```

**Core pattern — current (lines 82–88) — REPLACE this:**
```typescript
// BEFORE: useState triggers React re-render on every frame
const [currentFrame, setCurrentFrame] = useState(16);
const [animationManager] = useState(
  () =>
    new AnimationManager(() => {
      setCurrentFrame((currentFrame) => (currentFrame + 1) % frames.length);
    }, baseFps),
);
```

**Core pattern — after refactor (RENDER-03):**
```typescript
// AFTER: useRef holds frame index; callback writes innerHTML directly
const contentRef = useRef<HTMLElement>(null);
const frameIndexRef = useRef(16);
const padding = " ".repeat(whitespacePadding ?? 0);

const managerRef = useRef<AnimationManager | null>(null);
if (managerRef.current === null) {
  managerRef.current = new AnimationManager(() => {
    frameIndexRef.current = (frameIndexRef.current + 1) % frames.length;
    if (contentRef.current) {
      contentRef.current.innerHTML = frames[frameIndexRef.current]
        .map((line) => `<div>${padding}${line}${padding}</div>`)
        .join(""); // no newlines — must match React's dangerouslySetInnerHTML output
    }
  }, baseFps);
}
const animationManager = managerRef.current;
```

**Lifecycle pattern — current (lines 90–129) — REPLACE this:**
```typescript
// BEFORE: window.focus/blur (wrong API), no pause() in cleanup, no reactive matchMedia
useEffect(() => {
  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches === true;
  if (reducedMotion) {
    return;
  }

  const handleFocus = () => animationManager.start();
  const handleBlur = () => animationManager.pause();
  // ... Konami code ...
  window.addEventListener("focus", handleFocus);
  window.addEventListener("blur", handleBlur);
  window.addEventListener("keyup", handleKeyUp);

  if (document.visibilityState === "visible") {
    animationManager.start();
  }
  return () => {
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("keyup", handleKeyUp);
    // BUG LIFE-01: animationManager.pause() missing here
  };
}, [animationManager, frames.length, baseFps]);
```

**Lifecycle pattern — after refactor (LIFE-01, LIFE-02, LIFE-03):**
```typescript
// AFTER: visibilitychange, reactive matchMedia, pause() in cleanup
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
  const codeInProgress: string[] = [];
  const handleKeyUp = (event: KeyboardEvent) => {
    // Konami code — unchanged from current implementation
    const key = event.key.toLowerCase();
    if (KONAMI_CODE[codeInProgress.length] === key) {
      codeInProgress.push(key);
    } else {
      codeInProgress.length = 0;
    }
    if (codeInProgress.length !== KONAMI_CODE.length) {
      return;
    }
    if (animationManager.frameTime === 1000 / baseFps) {
      animationManager.updateFPS(240);
    } else {
      animationManager.updateFPS(baseFps);
    }
    codeInProgress.length = 0;
  };

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
```

**JSX return — current (lines 131–143) — REPLACE this:**
```tsx
// BEFORE: lines={frames[currentFrame]} — currentFrame is useState, triggers re-render
return (
  <Terminal
    className={className}
    columns={columns}
    whitespacePadding={whitespacePadding}
    rows={rows}
    title={title}
    fontSize={fontSize}
    lines={frames[currentFrame]}
    disableScrolling={true}
  />
);
```

**JSX return — after refactor:**
```tsx
// AFTER: ref={contentRef} wires forwardRef; lines uses ref value (no re-render on frame change)
return (
  <Terminal
    ref={contentRef}
    className={className}
    columns={columns}
    whitespacePadding={whitespacePadding}
    rows={rows}
    title={title}
    fontSize={fontSize}
    lines={frames[frameIndexRef.current]} // initial frame only — React renders once
    disableScrolling={true}
  />
);
```

---

### `src/components/terminal/index.tsx` (component, request-response)

**Analog:** `src/components/terminal/index.tsx` (current implementation — additive change only)

**Current `<Code>` element** (lines 106–124 — current):
```tsx
<Code
  ref={codeRef}
  className={classNames(s.content, {
    [s.disableScrolling]: disableScrolling,
  })}
  onScroll={handleScroll}
>
  {lines?.map((line, i) => {
    return (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: stable key intentional — lines update via direct DOM patching
        key={i}
        dangerouslySetInnerHTML={{
          __html: `${padding}${line}${padding}`,
        }}
      />
    );
  })}
</Code>
```

**After change (A11Y-01) — add `aria-live="off"`:**
```tsx
<Code
  ref={codeRef}
  aria-live="off"  // A11Y-01: suppress screen reader announcements during innerHTML churn
  className={classNames(s.content, {
    [s.disableScrolling]: disableScrolling,
  })}
  onScroll={handleScroll}
>
```

All other lines in `terminal/index.tsx` are unchanged. The `forwardRef` + `useImperativeHandle` wiring from Phase 7 (lines 30, 66) is already in place and must not be touched.

---

### `src/components/terminal/Terminal.module.css` (config)

**Analog:** `src/components/terminal/Terminal.module.css` (current implementation — additive change only)

**Current `.terminal` rule** (lines 1–13, 45–53 — relevant excerpt):
```css
.terminal {
  --code-margin-top: 12px;
  --padding: 7px;
  /* ... color variables ... */

  width: calc((var(--columns) * var(--content-character-width)) + (2 * var(--padding)) + 2px);
  height: calc((var(--rows) * var(--content-character-height)) + (2 * var(--padding)) + var(--control-size) + var(--code-margin-top) );
  background: var(--gray-0);
  /* ... */
}
```

**After change (CSS-01) — add `contain: strict` to `.terminal`:**
```css
.terminal {
  contain: strict; /* CSS-01: isolate layout/paint from page; safe — explicit width/height set via --columns/--rows */
  /* all existing properties unchanged */
}
```

**Current `.content` rule** (lines 102–132):
```css
& .content {
  font-size: var(--content-font-size);
  padding-top: var(--code-margin-top);
  color: var(--gray-6);
  word-wrap: break-word;
  scroll-behavior: smooth;
  overflow-y: scroll;
  padding: var(--padding);
  /* ... */
}
```

**After change (CSS-02) — add `will-change: contents` to `.content`:**
```css
& .content {
  will-change: contents; /* CSS-02: GPU compositor layer hint for innerHTML-mutated element */
  /* all existing properties unchanged */
}
```

---

## Shared Patterns

### useRef for imperative DOM access
**Source:** `src/components/terminal/index.tsx` lines 64–66
**Apply to:** `animated-terminal/index.tsx` — `contentRef` and `frameIndexRef`
```typescript
const codeRef = useRef<HTMLElement>(null);
// biome-ignore lint/style/noNonNullAssertion: codeRef is always mounted before this ref is consumed
useImperativeHandle(ref, () => codeRef.current!, []);
```
The `contentRef` in `AnimatedTerminal` receives the `<code>` DOM node via this `useImperativeHandle` bridge.

### useEffect cleanup pattern
**Source:** `src/components/animated-terminal/index.tsx` lines 124–128 (current — incomplete)
**Apply to:** `animated-terminal/index.tsx` — extend cleanup to include `animationManager.pause()` and new listener removals
```typescript
// Current cleanup (missing pause):
return () => {
  window.removeEventListener("focus", handleFocus);
  window.removeEventListener("blur", handleBlur);
  window.removeEventListener("keyup", handleKeyUp);
};
// Required: add animationManager.pause() as first line, swap focus/blur for visibilitychange, add mql cleanup
```

### dangerouslySetInnerHTML HTML shape
**Source:** `src/components/terminal/index.tsx` line 119
**Apply to:** `animated-terminal/index.tsx` — `buildFrameHTML` inline in callback
```typescript
// React renders each line as:
__html: `${padding}${line}${padding}`
// Direct innerHTML write must produce identical output:
frames[frameIndexRef.current]
  .map((line) => `<div>${padding}${line}${padding}</div>`)
  .join("") // no newlines — React produces no whitespace between sibling divs
```

---

## No Analog Found

None. All three files are self-referential modifications to existing files. No new files are introduced in Phase 8.

---

## Metadata

**Analog search scope:** `src/components/animated-terminal/`, `src/components/terminal/`
**Files scanned:** 3
**Pattern extraction date:** 2026-04-21
