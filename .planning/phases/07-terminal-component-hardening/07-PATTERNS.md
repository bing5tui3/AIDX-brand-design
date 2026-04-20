# Phase 7: Terminal Component Hardening - Pattern Map

**Mapped:** 2026-04-20
**Files analyzed:** 1 (modified)
**Analogs found:** 1 / 1

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/terminal/index.tsx` | component | event-driven | `src/components/text/index.tsx` (`Code` + `Text`) | exact |

## Pattern Assignments

### `src/components/terminal/index.tsx` (component, event-driven)

**Analog:** `src/components/text/index.tsx`

**Imports pattern** (lines 1-7 of terminal, plus forwardRef addition):

```typescript
"use client";

import classNames from "classnames";
import type React from "react";
import { forwardRef, type UIEvent, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Code, P } from "../text";
import s from "./Terminal.module.css";
```

Note: `forwardRef` and `useImperativeHandle` are added to the existing import from `"react"`. The `type React` import stays for `React.CSSProperties`.

**forwardRef wrapper pattern** (analog: `src/components/text/index.tsx` lines 33-43 and 68-73):

```typescript
// Text component — primary analog for named-function forwardRef form
const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as: Tag, children, className, id, font = "body", weight = "light", onScroll }: TextProps,
  ref: React.Ref<HTMLElement>,
) { ... });

// Code component — secondary analog, same pattern, simpler props
export const Code = forwardRef<HTMLElement, SpecificTagTextProps>(function Code(
  props: SpecificTagTextProps,
  ref: React.Ref<HTMLElement>,
) {
  return <Text ref={ref} font="code" weight="regular" as="code" {...props} />;
});
```

Apply to Terminal: replace `export default function Terminal({...}: TerminalProps)` with:

```typescript
export default forwardRef<HTMLElement, TerminalProps>(function Terminal(
  {
    columns,
    rows,
    fontSize = "medium",
    className,
    title,
    lines,
    whitespacePadding = 0,
    disableScrolling = false,
  }: TerminalProps,
  ref: React.Ref<HTMLElement>,
) {
```

**useImperativeHandle pattern** (no existing codebase usage — standard React API, verified in RESEARCH.md):

```typescript
const codeRef = useRef<HTMLElement>(null);

// Add immediately after codeRef declaration, before other useEffects
useImperativeHandle(ref, () => codeRef.current!, []);
```

The existing `codeRef` at line 54 of `src/components/terminal/index.tsx` is unchanged. `useImperativeHandle` bridges the forwarded `ref` to `codeRef.current` without replacing or merging refs.

**Stable key + biome-ignore pattern** (current state at lines 101-110 of terminal):

```typescript
// BEFORE (lines 104-105):
// biome-ignore lint/suspicious/noArrayIndexKey: composite key includes line content
key={i + line}

// AFTER (D-04 + D-05):
// biome-ignore lint/suspicious/noArrayIndexKey: stable key intentional — lines update via direct DOM patching
key={i}
```

The `biome-ignore` suppression comment is required — without it Biome flags `key={i}` as a lint error. Only the comment text changes; the suppression directive stays identical.

**Full target shape** (combining all changes, based on current `src/components/terminal/index.tsx`):

```typescript
"use client";

import classNames from "classnames";
import type React from "react";
import { forwardRef, type UIEvent, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Code, P } from "../text";
import s from "./Terminal.module.css";

import { X, Menu, LayoutGrid, SquarePlus } from "lucide-react";

export type TerminalFontSize = "xtiny" | "tiny" | "small" | "medium" | "large";
export interface TerminalProps {
  className?: string;
  columns: number;
  rows: number;
  fontSize?: TerminalFontSize;
  title?: string;
  lines?: string[];
  whitespacePadding?: number;
  disableScrolling?: boolean;
}

export default forwardRef<HTMLElement, TerminalProps>(function Terminal(
  {
    columns,
    rows,
    fontSize = "medium",
    className,
    title,
    lines,
    whitespacePadding = 0,
    disableScrolling = false,
  }: TerminalProps,
  ref: React.Ref<HTMLElement>,
) {
  // ... all existing state and handlers unchanged ...

  const codeRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => codeRef.current!, []);  // ← ADD THIS LINE

  // ... existing auto-scroll useEffect unchanged (still uses codeRef) ...

  return (
    // ... outer div unchanged ...
    <Code ref={codeRef} ...>
      {lines?.map((line, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: stable key intentional — lines update via direct DOM patching
          key={i}                                         // ← WAS: key={i + line}
          dangerouslySetInnerHTML={{ __html: `${padding}${line}${padding}` }}
        />
      ))}
    </Code>
  );
});
```

---

## Shared Patterns

### forwardRef named-function form
**Source:** `src/components/text/index.tsx` lines 33-43
**Apply to:** `src/components/terminal/index.tsx`

```typescript
// Convention: named function inside forwardRef, NOT arrow function
forwardRef<HTMLElement, Props>(function ComponentName(props: Props, ref: React.Ref<HTMLElement>) {
  // ...
})
```

### biome-ignore array index key suppression
**Source:** `src/components/terminal/index.tsx` line 104 (current)
**Apply to:** same file, updated comment text

```typescript
// biome-ignore lint/suspicious/noArrayIndexKey: <rationale>
key={i}
```

---

## No Analog Found

None — both patterns have exact analogs in the codebase.

---

## Metadata

**Analog search scope:** `src/components/text/index.tsx`, `src/components/terminal/index.tsx`
**Files scanned:** 2
**Pattern extraction date:** 2026-04-20
