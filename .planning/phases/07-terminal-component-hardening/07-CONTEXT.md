# Phase 7: Terminal Component Hardening - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Two surgical changes to `Terminal`:
1. Expose the inner `Code` (`<code>`) element via `React.forwardRef` so Phase 8 can write `innerHTML` directly
2. Change line keys from `key={i + line}` to `key={i}` so React reuses DOM nodes across frames

No changes to AnimatedTerminal in this phase. No new npm packages.

</domain>

<decisions>
## Implementation Decisions

### Ref Forwarding (RENDER-01)

- **D-01:** Use `forwardRef<HTMLElement, TerminalProps>(function Terminal(props, ref) { ... })` — same pattern as Ghostty's `Code`, `Text`, and `Button` components
- **D-02:** The forwarded ref points to the inner `Code` element (the scrollable content area), not the outer `.terminal` div — Phase 8 needs direct access to write `innerHTML`
- **D-03:** Use `useImperativeHandle(ref, () => codeRef.current!, [])` to expose the inner element — keeps the existing internal `codeRef` for auto-scroll logic unchanged, no callback ref merging needed

### Stable Line Keys (RENDER-02)

- **D-04:** Change `key={i + line}` to `key={i}` on line divs
- **D-05:** Update the `biome-ignore` comment from "composite key includes line content" to "stable key intentional — lines update via direct DOM patching" to reflect the new rationale

### Claude's Discretion

- TypeScript ref type: use `HTMLElement` (matches Ghostty's `forwardRef<HTMLElement, ...>` pattern in `Code`/`Text`)
- Export: keep `export default` — no change to how Terminal is imported

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — RENDER-01 and RENDER-02 are the only requirements for this phase

### Ghostty Reference Patterns
- `ghostty/src/components/text/index.tsx` — `forwardRef<HTMLElement, TextProps>` pattern, `useImperativeHandle` not used here but `ref as any` pattern shown
- `ghostty/src/components/button/index.tsx` — `export default forwardRef(Button)` pattern

### Source Files to Modify
- `src/components/terminal/index.tsx` — the only file that changes in this phase
- `src/components/animated-terminal/index.tsx` — read-only reference; must still compile after Terminal API change

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Code` component (`src/components/text/index.tsx`): already uses `forwardRef<HTMLElement, ...>` — accepts a ref and passes it through. Terminal can pass the forwarded ref directly to `<Code ref={codeRef}>` after switching to `useImperativeHandle`.

### Established Patterns
- Ghostty uses `forwardRef<HTMLElement, Props>(function Name(props, ref) { ... })` — named function form, not arrow function
- `biome-ignore lint/suspicious/noArrayIndexKey` is the correct suppression for index-only keys
- Internal `codeRef = useRef<HTMLElement>(null)` stays in place for auto-scroll `useEffect`

### Integration Points
- `AnimatedTerminal` passes `lines={frames[currentFrame]}` to Terminal — this prop interface is unchanged
- After Phase 7, `AnimatedTerminal` can optionally pass a `ref` to Terminal to get the content element (Phase 8 will do this)

</code_context>

<specifics>
## Specific Ideas

- User confirmed: follow Ghostty's `forwardRef` pattern exactly (same type signature, same naming convention)
- Ghostty's `Code` component is the closest analog — Terminal's forwarded ref should behave the same way

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-terminal-component-hardening*
*Context gathered: 2026-04-20*
