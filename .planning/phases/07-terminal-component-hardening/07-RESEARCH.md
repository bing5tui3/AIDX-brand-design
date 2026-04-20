# Phase 7: Terminal Component Hardening - Research

**Researched:** 2026-04-20
**Domain:** React ref-forwarding, stable list keys, TypeScript component APIs
**Confidence:** HIGH

## Summary

This phase makes two surgical edits to `src/components/terminal/index.tsx`. Both changes are
well-understood React patterns with zero ambiguity — the codebase already contains the exact
reference implementations to copy from.

Change 1 (RENDER-01): Wrap Terminal in `React.forwardRef` so Phase 8 can obtain a ref to the
inner `<Code>` element and write `innerHTML` directly. The `useImperativeHandle` hook bridges
the forwarded ref to the existing internal `codeRef` without disturbing the auto-scroll logic.

Change 2 (RENDER-02): Replace `key={i + line}` with `key={i}` on line divs. The composite key
forces React to unmount/remount every DOM node whenever line content changes — which happens on
every animation frame. A stable index key lets React reuse the existing nodes and only update
their `innerHTML` via `dangerouslySetInnerHTML`.

No new packages. No changes to AnimatedTerminal. One file changes.

**Primary recommendation:** Copy the `forwardRef<HTMLElement, Props>(function Name(...))` pattern
verbatim from `src/components/text/index.tsx` (Code component, line 68) — it is the exact
pattern required and already lives in this repo.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Use `forwardRef<HTMLElement, TerminalProps>(function Terminal(props, ref) { ... })` — named function form
- D-02: Forwarded ref points to the inner `Code` element (not the outer `.terminal` div)
- D-03: Use `useImperativeHandle(ref, () => codeRef.current!, [])` — keeps internal `codeRef` unchanged
- D-04: Change `key={i + line}` to `key={i}` on line divs
- D-05: Update the `biome-ignore` comment to "stable key intentional — lines update via direct DOM patching"
- TypeScript ref type: `HTMLElement` (matches Ghostty pattern)
- Export: keep `export default` — no change to import sites

### Claude's Discretion
- None beyond what is locked above

### Deferred Ideas (OUT OF SCOPE)
- None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RENDER-01 | Terminal component exposes content element ref via `React.forwardRef` | `forwardRef` + `useImperativeHandle` pattern verified in `src/components/text/index.tsx` and Ghostty reference |
| RENDER-02 | Terminal uses stable `key={i}` for line divs (not `key={i + line}`) | React reconciliation behavior verified; `biome-ignore` suppression pattern confirmed in existing code |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Ref forwarding | Browser / Client | — | Pure React component API change; no server involvement |
| Stable list keys | Browser / Client | — | React reconciler runs in the browser; key strategy affects DOM reuse |
| Auto-scroll logic | Browser / Client | — | `codeRef` scroll behavior is unchanged; stays in component |

## Standard Stack

### Core (no new packages — all existing)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | (project's existing) | `forwardRef`, `useImperativeHandle`, `useRef` | Built-in React APIs |
| typescript | (project's existing) | `React.Ref<HTMLElement>` type annotation | Project standard |

No installation step — this phase uses only APIs already present.

## Architecture Patterns

### System Architecture Diagram

```
AnimatedTerminal
  │  passes lines={frames[currentFrame]}
  ▼
Terminal (forwardRef wrapper)
  │  useImperativeHandle exposes codeRef.current
  │  forwarded ref → caller gets HTMLElement handle
  ▼
<Code ref={codeRef}>          ← inner element, ref target for Phase 8
  │
  ▼
<div key={i} dangerouslySetInnerHTML />   ← stable DOM nodes, reused each frame
```

### Recommended Project Structure

No structural changes. Single file edit:

```
src/components/terminal/
└── index.tsx    ← only file modified
```

### Pattern 1: forwardRef with useImperativeHandle

**What:** Wrap the component in `forwardRef` so callers can pass a ref. Use `useImperativeHandle`
to point the forwarded ref at the internal `codeRef` without merging refs or using callback refs.

**When to use:** When a component owns an internal ref for its own logic AND needs to expose that
same element to a parent.

**Example (verified from `src/components/text/index.tsx` line 68 and CONTEXT.md D-01/D-03):**

```typescript
// Source: src/components/text/index.tsx (Code component, line 68) + CONTEXT.md decisions
import { forwardRef, useImperativeHandle, useRef, type UIEvent } from "react";

export default forwardRef<HTMLElement, TerminalProps>(function Terminal(
  { columns, rows, fontSize = "medium", className, title, lines,
    whitespacePadding = 0, disableScrolling = false }: TerminalProps,
  ref: React.Ref<HTMLElement>,
) {
  const codeRef = useRef<HTMLElement>(null);

  // Expose inner Code element to caller without disturbing internal codeRef usage
  useImperativeHandle(ref, () => codeRef.current!, []);

  // ... existing auto-scroll useEffect uses codeRef unchanged ...

  return (
    <div className={...}>
      <Code
        ref={codeRef}
        className={...}
        onScroll={handleScroll}
      >
        {lines?.map((line, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: stable key intentional — lines update via direct DOM patching
            key={i}
            dangerouslySetInnerHTML={{ __html: `${padding}${line}${padding}` }}
          />
        ))}
      </Code>
    </div>
  );
});
```

### Pattern 2: Stable index keys for mutable content

**What:** Use `key={i}` (position-stable) instead of `key={i + line}` (content-derived) when
the list length is fixed and content updates in-place rather than reordering.

**When to use:** Fixed-length lists where items update by content mutation, not insertion/deletion.
Animation frames always have the same number of rows — position is the stable identity.

**Anti-Patterns to Avoid**

- **Merging two refs with a callback ref:** Not needed here. `useImperativeHandle` cleanly
  separates the internal ref from the forwarded ref. Don't replace `codeRef` with a merged
  callback ref.
- **Forwarding ref to the outer `.terminal` div:** Phase 8 needs `innerHTML` access to the
  scrollable content area (`<code>`), not the wrapper. Forwarding to the wrong element would
  silently break Phase 8.
- **Arrow function form for forwardRef:** Project convention (Ghostty pattern) uses named
  function form: `forwardRef<H, P>(function Terminal(...) {})`. Don't use arrow functions.
- **Removing the biome-ignore comment entirely:** The suppression is still needed — Biome will
  flag `key={i}` as a lint error without it. Only the comment text changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exposing inner ref to parent | Custom imperative handle object | `useImperativeHandle` | React's built-in solution; handles cleanup automatically |
| Ref type for generic HTML element | Custom union type | `React.Ref<HTMLElement>` | Matches existing `Code`/`Text` pattern in this codebase |

**Key insight:** Both changes are one-liner React API calls. There is nothing to invent.

## Common Pitfalls

### Pitfall 1: Forgetting to update the biome-ignore comment text

**What goes wrong:** The old comment says "composite key includes line content" — after the
change to `key={i}`, this comment is factually wrong and misleading.
**Why it happens:** Developers change the code but not the comment.
**How to avoid:** The comment text is part of D-05 — treat it as a required change, not optional.
**Warning signs:** Old comment text still present after the key change.

### Pitfall 2: useImperativeHandle dependency array

**What goes wrong:** Passing `[codeRef]` as the dependency array causes the handle to be
recreated on every render (ref objects are stable but the pattern is fragile).
**Why it happens:** Developers add the ref to deps "to be safe."
**How to avoid:** Use `[]` — the factory `() => codeRef.current!` captures the ref object
which is stable for the component lifetime. [ASSUMED — standard React guidance]
**Warning signs:** TypeScript or ESLint warnings about exhaustive deps.

### Pitfall 3: AnimatedTerminal compilation break

**What goes wrong:** If Terminal's export signature changes in a way AnimatedTerminal doesn't
expect, the build fails.
**Why it happens:** `export default forwardRef(...)` changes the inferred type of the default
export.
**How to avoid:** AnimatedTerminal uses `Terminal` without passing a ref — this is valid for
forwardRef components (ref is optional). No changes to AnimatedTerminal needed. Verify build
compiles after the edit.
**Warning signs:** TypeScript error in `animated-terminal/index.tsx` referencing Terminal props.

## Code Examples

### Current state (before)

```typescript
// src/components/terminal/index.tsx — current
export default function Terminal({ ... }: TerminalProps) {
  const codeRef = useRef<HTMLElement>(null);
  // ...
  return (
    // ...
    <div key={i + line} ... />  // ← content-derived key, forces remount
  );
}
```

### Target state (after) — RENDER-01 + RENDER-02

```typescript
// Source: CONTEXT.md D-01/D-02/D-03/D-04/D-05 + src/components/text/index.tsx pattern
import { forwardRef, useImperativeHandle, useRef, ... } from "react";

export default forwardRef<HTMLElement, TerminalProps>(function Terminal(
  props: TerminalProps,
  ref: React.Ref<HTMLElement>,
) {
  const codeRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => codeRef.current!, []);

  // auto-scroll useEffect unchanged — still uses codeRef directly

  return (
    // ...
    <div
      // biome-ignore lint/suspicious/noArrayIndexKey: stable key intentional — lines update via direct DOM patching
      key={i}
      dangerouslySetInnerHTML={...}
    />
  );
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `key={i + line}` content-derived key | `key={i}` stable index key | This phase | React reuses DOM nodes; no unmount/remount per frame |
| Plain function component | `forwardRef` wrapper | This phase | Callers can obtain ref to inner `<code>` element |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useImperativeHandle(ref, () => codeRef.current!, [])` with empty deps array is correct | Common Pitfalls #2 | Stale ref handle — but ref objects are stable so risk is negligible |

## Open Questions

None. All implementation decisions are locked in CONTEXT.md and verified against the codebase.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — code-only change to a single TypeScript file)

## Sources

### Primary (HIGH confidence)
- `src/components/terminal/index.tsx` — current implementation read directly [VERIFIED: codebase]
- `src/components/text/index.tsx` — `forwardRef<HTMLElement, ...>` pattern, `Code` component [VERIFIED: codebase]
- `ghostty/src/components/text/index.tsx` — canonical Ghostty reference pattern [VERIFIED: codebase]
- `ghostty/src/components/button/index.tsx` — `export default forwardRef(Button)` pattern [VERIFIED: codebase]
- `.planning/phases/07-terminal-component-hardening/07-CONTEXT.md` — locked decisions D-01 through D-05 [VERIFIED: codebase]

### Secondary (MEDIUM confidence)
- React `useImperativeHandle` docs — standard hook for exposing imperative handles [ASSUMED: training knowledge, well-established API]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all APIs verified in existing codebase
- Architecture: HIGH — single file, two changes, both patterns present in repo
- Pitfalls: HIGH — derived from direct code inspection

**Research date:** 2026-04-20
**Valid until:** Stable indefinitely (React core APIs, no external dependencies)
