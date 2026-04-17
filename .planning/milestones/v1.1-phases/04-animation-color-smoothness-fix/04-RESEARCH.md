---
phase: 04-animation-color-smoothness-fix
milestone: v1.1
type: research
---

# Phase 4 Research: Animation Color & Smoothness Fix

## Current State

### Terminal.module.css — Missing Color Classes

`src/components/terminal/Terminal.module.css` lines 114–119:

```css
& > div {
  white-space: pre-wrap;
  & :global(.b) {
    color: var(--brand-color);
  }
}
```

Only `.b` is styled. Classes `.e`, `.g`, `.h`, `.o` used in animation frames have no color rules — they render as the default `var(--gray-6)` text color.

### AnimatedTerminal — React State Re-render Jank

`src/components/animated-terminal/index.tsx` current approach:

```tsx
const [currentFrame, setCurrentFrame] = useState(16);
const [animationManager] = useState(
  () => new AnimationManager(() => {
    setCurrentFrame((currentFrame) => (currentFrame + 1) % frames.length);
  }, baseFps),
);
```

On every tick (~32fps), `setCurrentFrame` triggers a full React re-render of the `Terminal` component, which re-renders all 41 `<div dangerouslySetInnerHTML>` rows. This causes visible jank.

The `Terminal` component renders lines as:
```tsx
{lines?.map((line, i) => (
  <div key={i + line} dangerouslySetInnerHTML={{ __html: `${padding}${line}${padding}` }} />
))}
```

Note: the key `i + line` means React will re-create DOM nodes when line content changes — making the jank worse.

## Reference Implementation (aidx-landing.html)

The reference uses pre-built row divs and direct `innerHTML` patching:

```javascript
// Pre-build row divs once
function setupLineDivs(rowCount) {
  el.innerHTML = '';
  const divs = [];
  for (let i = 0; i < rowCount; i++) {
    const d = document.createElement('div');
    el.appendChild(d);
    divs.push(d);
  }
  return divs;
}

// Only patch rows that changed
_renderFrame(lines) {
  const prev = this.prevLines;
  for (let i = 0; i < lines.length; i++) {
    if (!prev || prev[i] !== lines[i]) {
      this.divs[i].innerHTML = lines[i];
    }
  }
  this.prevLines = lines;
}
```

Key insight: only rows that differ between frames get their `innerHTML` updated. Most frames only change a few rows, so this is dramatically cheaper than a full React re-render.

## Fix Strategy

### Plan 1 (REQ-01): CSS color classes

Add 4 `:global()` rules alongside the existing `.b` rule in `Terminal.module.css`:

```css
& :global(.e) { color: #7ec8f0; }
& :global(.h) { color: #3A5ECF; }
& :global(.g) { color: #5577dd; }
& :global(.o) { color: #6699ff; }
```

### Plan 2 (REQ-02): Ref-based DOM patching

Refactor `AnimatedTerminal` to:
1. Hold a `containerRef` pointing to the terminal content `<Code>` element
2. On mount, pre-build row `<div>` elements and store refs in a `rowRefsRef`
3. Replace `AnimationManager` callback: instead of `setCurrentFrame`, call `_renderFrame` directly
4. `_renderFrame` patches only changed rows via `div.innerHTML = line`
5. Track `prevLinesRef` to skip unchanged rows
6. Keep all existing behavior: Konami code, focus/blur, reduced motion, `visibilityState` check

The `Terminal` component's `lines` prop becomes unused for `AnimatedTerminal` — instead, `AnimatedTerminal` renders `Terminal` without `lines` and manages the content area directly via refs.

**Alternative approach**: Rather than fighting Terminal's rendering, `AnimatedTerminal` can bypass `Terminal` entirely for the content area by using a `contentRef` passed down, or by rendering its own content div that matches Terminal's CSS structure.

**Simpler approach**: Keep `Terminal` as the chrome (header, border, sizing) but pass `lines={[]}` and use a `ref` on the `<Code>` element to directly manage its children. This requires `Terminal` to forward a ref to the `<Code>` element.

**Cleanest approach**: `AnimatedTerminal` renders `Terminal` with `disableScrolling={true}` and `lines={[]}`, then uses a `useEffect` to find the content div and pre-populate it with row divs, then patches them directly. This avoids any changes to `Terminal`.

The cleanest approach is preferred — zero changes to `Terminal`, all logic stays in `AnimatedTerminal`.

## Common Pitfalls

- `:global()` scope: the rules must be nested inside `& > div` to maintain CSS Modules scoping for the parent, while allowing the inner span classes to be global
- `useEffect` cleanup: the `AnimationManager` must be paused on unmount (already handled)
- Row count: must match `frames[0].length` (41 rows for the home animation)
- `whitespacePadding`: the reference implementation doesn't use padding — the current `AnimatedTerminal` passes `whitespacePadding` to `Terminal` which adds spaces. With direct DOM patching, padding must be applied manually to each row's innerHTML
