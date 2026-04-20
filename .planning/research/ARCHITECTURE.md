# Architecture: Direct DOM Patching for AnimatedTerminal

**Domain:** React animation performance — bypassing reconciliation for high-frequency frame updates
**Researched:** 2026-04-20
**Milestone:** v1.4 Animation Performance Optimization

---

## Current Architecture

```
AnimatedTerminal (client component)
  state: currentFrame (int, 0-234)
  class: AnimationManager (rAF loop, calls setCurrentFrame on tick)
  |
  v  [React re-render on every frame tick]
Terminal (client component)
  props: lines = frames[currentFrame]  <- full array swap each frame
  renders: lines.map((line, i) => <div key={i+line} dangerouslySetInnerHTML />)
                                              ^
                                              composite key forces DOM node replacement
                                              even when only a few lines changed
```

### What happens on each frame tick (current)

1. `AnimationManager.callback()` fires
2. `setCurrentFrame(n+1)` triggers React state update
3. React schedules re-render of `AnimatedTerminal`
4. `Terminal` re-renders — all 41 `<div>` nodes diffed
5. `key={i+line}` means any changed line gets a new DOM node (unmount + remount)
6. Browser paints

Cost per frame: full React reconciliation + up to 41 DOM node replacements.

---

## Proposed Architecture

```
AnimatedTerminal (client component)
  ref: contentRef -> points to Terminal's <Code> element
  class: AnimationManager (rAF loop, calls patchFrame directly)
  state: currentFrame (int) - ONLY for initial render, never updated after mount
  |
  v  [initial React render only]
Terminal (client component, forwardRef)
  props: contentRef forwarded to <Code ref={contentRef}>
  renders: lines.map((line, i) => <div key={i} dangerouslySetInnerHTML />)
                                              ^
                                              index-only key - React reuses DOM nodes
  |
  v  [after mount: direct DOM writes, zero React involvement]
AnimationManager.callback()
  -> reads frames[frameIndex] array
  -> iterates contentRef.current.children
  -> sets child.innerHTML = padding + line + padding  per changed line
```

### What happens on each frame tick (proposed)

1. `AnimationManager.callback()` fires
2. `patchFrame(nextFrameIndex)` called directly — no setState
3. Loop over 41 children of `contentRef.current`, set `.innerHTML` only where line differs
4. Browser paints

Cost per frame: 41 string comparisons + N innerHTML assignments (N = changed lines, typically 5-15 out of 41).

---

## Component Changes

### Terminal — modified

| Change | Detail |
|--------|--------|
| Add `forwardRef` | Wrap with `React.forwardRef`, forward ref to the `<Code>` element |
| Change `key` | `key={i}` instead of `key={i+line}` — stable keys let React reuse DOM nodes |
| No other changes | `lines` prop still used for initial render; `dangerouslySetInnerHTML` stays |

```tsx
// Before
export default function Terminal({ lines, ... }: TerminalProps) {
  const codeRef = useRef<HTMLElement>(null);
  ...
  <Code ref={codeRef} ...>
    {lines?.map((line, i) => (
      <div key={i + line} dangerouslySetInnerHTML={{ __html: `${padding}${line}${padding}` }} />
    ))}
  </Code>
}

// After
const Terminal = React.forwardRef<HTMLElement, TerminalProps>(
  function Terminal({ lines, ... }, ref) {
    // merge forwarded ref with internal scroll ref — same element serves both purposes
    const codeRef = useRef<HTMLElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLElement | null>) ?? codeRef;
    ...
    <Code ref={resolvedRef} ...>
      {lines?.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length frame list, index is stable
        <div key={i} dangerouslySetInnerHTML={{ __html: `${padding}${line}${padding}` }} />
      ))}
    </Code>
  }
);
export default Terminal;
```

Note: Terminal's internal `codeRef` is used for auto-scroll (`scrollTo` in a `useEffect`). With `forwardRef`, the forwarded ref and the scroll ref point to the same `<Code>` element — unify them. Since `disableScrolling={true}` is set by AnimatedTerminal, the auto-scroll effect is a no-op in that context anyway.

### AnimatedTerminal — modified

| Change | Detail |
|--------|--------|
| Add `contentRef` | `useRef<HTMLElement>(null)` passed to Terminal as forwarded ref |
| Replace `setCurrentFrame` in callback | Call `patchFrame()` instead |
| Keep `useState(16)` | Used only for initial render — never updated after mount |
| Demote frame tracking to `useRef` | `frameIndex.current` replaces `currentFrame` state for the rAF loop |
| Add `patchFrame()` | Imperative function that writes directly to DOM children |
| Keep all visibility/focus/Konami logic | No changes needed |

```tsx
const contentRef = useRef<HTMLElement>(null);
const frameIndex = useRef(16); // mutable cursor, not state
const padding = " ".repeat(whitespacePadding ?? 0);

function patchFrame(nextIndex: number) {
  const el = contentRef.current;
  if (!el) return;
  const frame = frames[nextIndex];
  const children = el.children;
  for (let i = 0; i < frame.length; i++) {
    const line = `${padding}${frame[i]}${padding}`;
    if ((children[i] as HTMLElement).innerHTML !== line) {
      (children[i] as HTMLElement).innerHTML = line;
    }
  }
  frameIndex.current = nextIndex;
}

// AnimationManager callback:
new AnimationManager(() => {
  patchFrame((frameIndex.current + 1) % frames.length);
}, baseFps)

// Terminal receives ref:
<Terminal
  ref={contentRef}
  lines={frames[16]}   // initial frame only, never changes
  disableScrolling={true}
  ...
/>
```

---

## Data Flow

```
Initial render path (React, runs once at mount):
  AnimatedTerminal
    -> frames[16] passed as lines prop
    -> Terminal renders 41 <div key={i}> nodes with dangerouslySetInnerHTML
    -> contentRef attached to <Code> element
    -> DOM is stable after hydration

Animation path (imperative, runs 30x/sec after mount):
  rAF tick
    -> AnimationManager.update()
    -> patchFrame(nextIndex)
    -> contentRef.current.children[i].innerHTML = newLine  (only changed lines)
    -> browser paint
    (React never involved)

Pause/resume path (unchanged):
  window focus/blur -> animationManager.start() / .pause()
  Konami code -> animationManager.updateFPS(240)
  Both still work — they only affect AnimationManager timing, not the callback
```

---

## Integration Points

### 1. Terminal `forwardRef` wrapping

- File: `src/components/terminal/index.tsx`
- Change type: modification
- Risk: LOW — `forwardRef` is a transparent wrapper; all existing callers that don't pass a ref are unaffected
- The internal `codeRef` used for auto-scroll must be unified with the forwarded ref. Use the forwarded ref directly as the scroll target — it is the same element.

### 2. AnimatedTerminal `patchFrame` + `contentRef`

- File: `src/components/animated-terminal/index.tsx`
- Change type: modification
- Risk: LOW — AnimationManager class is unchanged; only the callback body changes
- `useState(currentFrame)` is demoted to initial-render-only; frame tracking moves to `useRef`
- `padding` value must be accessible inside `patchFrame` — it is derived from `whitespacePadding` prop, so capture it in the closure

### 3. Key stability in Terminal line map

- File: `src/components/terminal/index.tsx`
- Change type: modification (remove `+ line` from key)
- Risk: LOW — stable keys are strictly better for fixed-length lists; no semantic change for non-animated usage
- Biome lint rule `noArrayIndexKey` will flag `key={i}` — add a biome-ignore comment with rationale

---

## Build Order

Dependencies flow in one direction: Terminal must be modified before AnimatedTerminal can use the forwarded ref.

1. **Terminal** — add `forwardRef`, unify `codeRef` with forwarded ref, change key to `key={i}`
2. **AnimatedTerminal** — add `contentRef`, replace `setCurrentFrame` callback with `patchFrame`, demote frame cursor to `useRef`
3. Smoke test: homepage animation runs, no React warnings, no console errors
4. (Optional, same milestone) CSS `will-change: transform` on terminal container for GPU layer promotion

---

## Constraints and Gotchas

### React ownership of innerHTML

After initial render, React "owns" the DOM nodes it created. Writing `.innerHTML` directly bypasses React's virtual DOM. This is safe here because:
- React never re-renders Terminal after mount (no state changes in AnimatedTerminal after the initial frame — `setCurrentFrame` is removed from the rAF callback)
- The `lines` prop passed to Terminal never changes after mount
- If React ever does re-render Terminal (e.g., `platformStyle` state change on mount), it will overwrite the direct DOM writes — but that is correct behavior (React's render is the source of truth for structure; direct writes are ephemeral frame content). The `platformStyle` effect runs once on mount before the animation starts, so there is no race.

### Auto-scroll conflict

Terminal's `useEffect` scrolls `codeRef.current` when `lines?.length` changes. Since `lines` never changes after mount in the animated context, this effect never fires again — no conflict.

### SSR / hydration

Terminal is `"use client"`. The forwarded ref is only populated after hydration. `patchFrame` guards with `if (!el) return` so pre-hydration ticks are safe no-ops. The initial frame (16) is rendered by React on first paint, so there is no blank-frame flash.

### Konami code / FPS change

`animationManager.updateFPS(240)` still works — it only changes `frameTime`, not the callback. `patchFrame` handles any frame rate transparently.

### `padding` closure capture

`whitespacePadding` is a prop. In the current code, `padding` is computed as `" ".repeat(whitespacePadding)` inside the render function. After the refactor, `patchFrame` is defined inside the component function body, so it closes over `padding` naturally — no special handling needed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| forwardRef pattern | HIGH | Standard React API, stable since React 16.3 |
| Direct innerHTML writes | HIGH | Established escape hatch, used in many animation libs |
| Key stability change | HIGH | Index-only key is correct for fixed-length lists |
| No React re-render after mount | HIGH | Verified: no state in AnimatedTerminal changes after initial render once patchFrame replaces setCurrentFrame |
| Performance gain | MEDIUM | Eliminates reconciliation overhead; actual gain depends on browser/device |
