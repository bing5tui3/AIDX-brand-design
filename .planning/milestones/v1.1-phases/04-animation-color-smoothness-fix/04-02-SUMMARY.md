---
phase: 04-animation-color-smoothness-fix
plan: 02
status: complete
---

# Plan 02 Summary: AnimatedTerminal Smoothness Investigation

## What was done

Investigated and attempted ref-based DOM patching to eliminate React re-render jank in
`src/components/animated-terminal/index.tsx`. After extensive debugging, the original
`useState`-based implementation (identical to Ghostty) was retained.

### Attempted approach (reverted)
- Removed `useState` for `currentFrame`, replaced with `useRef` + direct `innerHTML` patching
- Encountered React StrictMode double-invocation bug causing 82 row divs instead of 41
- Fixed StrictMode bug, but changes introduced a continuous HMR reload loop (~650ms interval)

### Root cause of reload loop
Next.js was at version 16.2.4. That version rewrites `next-env.d.ts` to import from
`.next/dev/types/routes.d.ts` instead of `.next/types/routes.d.ts`. Turbopack watches the
new path, which regenerates on every compile cycle → infinite HMR reload.

### Resolution
- Downgraded `next` from 16.2.4 → 16.1.6 (matching Ghostty's lockfile version)
- Reverted `animated-terminal/index.tsx` and `terminal/index.tsx` to original Ghostty-identical code
- Reload loop eliminated; animation plays smoothly with correct colors from Plan 01

## Final state
- `src/components/animated-terminal/index.tsx`: unchanged from original
- `src/components/terminal/index.tsx`: unchanged from original
- `next` version: 16.1.6

## Verification
- No continuous HMR reload: ✓
- Animation plays smoothly: ✓ (human approved)
- Color classes `.e`/`.g`/`.h`/`.o` render correctly: ✓
- Terminal chrome unchanged: ✓
