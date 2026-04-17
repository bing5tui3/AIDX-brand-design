# Phase 2: Component Library - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 02-component-library
**Areas discussed:** Copy strategy, AIDX-specific values, Konami easter egg, Plan structure

---

## Copy Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Copy and swap | Copy each file from Ghostty source, then do targeted find-replace for brand values | ✓ |
| Rewrite to match API | Read Ghostty source as reference, write fresh files matching the same component API | |
| Hybrid | Copy simple files, rewrite complex ones (AnimatedTerminal, Sidecar) from scratch | |

**User's choice:** Copy and swap

---

| Option | Description | Selected |
|--------|-------------|----------|
| Everything verbatim | Copy every file including CSS Modules, SVGs, and .mjs plugins | |
| Code verbatim, CSS may adjust | Copy .tsx and .mjs files verbatim; CSS Modules may need minor token adjustments | ✓ |
| Code verbatim, CSS fresh | Copy .tsx verbatim only; rewrite all CSS Modules fresh against the AIDX token set | |

**User's choice:** Code verbatim, CSS may adjust

---

## AIDX-Specific Values

| Option | Description | Selected |
|--------|-------------|----------|
| Use a real GitHub repo URL | Use https://github.com/webank-ai/aidx or similar | |
| Placeholder URL for now | Use https://github.com/your-org/aidx — easy to swap later | ✓ |
| No GitHub URL | Remove edit links entirely | |

**User's choice:** Placeholder URL for now

---

| Option | Description | Selected |
|--------|-------------|----------|
| aidx-wordmark.svg | Use aidx-wordmark.svg (already in repo root) | ✓ |
| aidx-wordmark-dark.svg | Use the dark variant | |
| Theme-aware | Switch between light/dark variants based on theme | |

**User's choice:** aidx-wordmark.svg

---

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as-is | Renders null unless GIT_COMMIT_REF=tip | |
| Remove PreviewBanner | AIDX won't use preview deployments | ✓ |
| Rename env var | Use AIDX_PREVIEW=true instead | |

**User's choice:** Remove PreviewBanner entirely

---

## Konami Easter Egg

| Option | Description | Selected |
|--------|-------------|----------|
| Keep it | Keep the Konami code (↑↑↓↓←→←→BA) that bumps animation to 60fps | ✓ |
| Remove it | Simpler AnimatedTerminal, no easter egg | |

**User's choice:** Keep it

---

## Plan Structure

| Option | Description | Selected |
|--------|-------------|----------|
| One plan | All 18 components + 8 lib modules in one plan | |
| 3 plans by group | Primitives / Docs UI / Lib modules | ✓ |
| 2 plans | All components + all lib modules | |

**User's choice:** 3 plans by group — Primitives, Docs UI, Lib modules

---

## Claude's Discretion

- Exact CSS token adjustments in copied CSS Modules
- Directory structure within src/components/ (mirror Ghostty's per-component folder layout)
- Import path fixes after copying

## Deferred Ideas

None
