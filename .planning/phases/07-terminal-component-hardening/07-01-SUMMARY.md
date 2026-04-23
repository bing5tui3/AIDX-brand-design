---
phase: 07-terminal-component-hardening
plan: 01
status: completed
completed_at: "2026-04-20"
---

# Summary: Terminal forwardRef + Stable Keys

## What changed

`src/components/terminal/index.tsx` — two surgical changes:

1. **forwardRef wrapper** — Terminal is now `forwardRef<HTMLElement, TerminalProps>` with `useImperativeHandle(ref, () => codeRef.current!, [])` exposing the inner `<code>` element to callers. Unblocks Phase 8 DOM patching without prop drilling.

2. **Stable line keys** — `key={i + line}` replaced with `key={i}`. React now reuses existing DOM nodes across animation frame updates instead of unmounting/remounting them. Eliminates per-frame DOM churn that caused animation jank.

## Verification

- `npx tsc --noEmit` — exits 0
- `npx biome check src/components/terminal/index.tsx` — exits 0
- `npm run build` — exits 0, static export succeeds (5/5 pages)
</content>
</invoke>