# Phase 7: Terminal Component Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 07-terminal-component-hardening
**Areas discussed:** Ref forwarding target, Dual-ref handling, Biome lint comment

---

## Ref Forwarding Target

| Option | Description | Selected |
|--------|-------------|----------|
| Forward to outer `.terminal` div | Standard root-element forwarding | |
| Forward to inner `Code` element | Direct access to content for Phase 8 innerHTML writes | ✓ |

**User's choice:** Inner `Code` element (confirmed after reviewing Ghostty's `forwardRef` patterns)
**Notes:** User asked to reference Ghostty. Ghostty's `Code`/`Text`/`Button` all use `forwardRef<HTMLElement, Props>`. Ghostty has not implemented this specific Terminal change — AIDX v1.4 extends beyond Ghostty here.

---

## Dual-ref Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Callback ref merging | Set both internal and forwarded ref in a callback | |
| `useImperativeHandle` | Keep internal `codeRef` unchanged, expose via forwarded ref | ✓ |

**User's choice:** `useImperativeHandle`
**Notes:** Keeps existing auto-scroll `useEffect` unchanged. Standard React pattern.

---

## Biome Lint Comment

| Option | Description | Selected |
|--------|-------------|----------|
| Keep existing comment | "composite key includes line content" — now inaccurate | |
| Update comment | "stable key intentional — lines update via direct DOM patching" | ✓ |
| Remove comment | Biome would flag the index-only key | |

**User's choice:** Update comment
**Notes:** Existing comment was written for the composite key rationale; new comment explains the intentional stable-key design.

---

## Claude's Discretion

- TypeScript ref type: `HTMLElement` (matches Ghostty pattern)
- Export style: keep `export default`

## Deferred Ideas

None.
