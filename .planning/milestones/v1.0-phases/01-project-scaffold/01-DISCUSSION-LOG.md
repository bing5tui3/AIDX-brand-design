# Phase 1: Project Scaffold - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 01-project-scaffold
**Areas discussed:** Ghostty source reference, Next.js version, Design token scope, Font file sourcing

---

## Ghostty Source Reference

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub: ghostty-org/website | Use the public GitHub repo as reference | |
| Local clone — provide path | User has a local clone | ✓ |
| Requirements are sufficient | Skip Ghostty source reference | |

**User's choice:** Local clone at `~/Development/ghostty-org/website`
**Notes:** User confirmed the Ghostty source is available locally. Planner should read it directly.

---

## Next.js Version

| Option | Description | Selected |
|--------|-------------|----------|
| Match Ghostty's version exactly | Read Ghostty package.json and match | ✓ |
| Next.js 15 (latest stable) | Use 15.x regardless of Ghostty | |
| Latest Next.js available | Always use latest | |

**User's choice:** Match Ghostty's version exactly
**Notes:** Read `~/Development/ghostty-org/website/package.json` to determine the exact version.

---

## Design Token Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All tokens upfront | Define full token set in Phase 1 | ✓ |
| Phase 1 essentials only | Add callout/syntax tokens in Phase 2 | |

**User's choice:** All tokens upfront
**Notes:** globals.css should define brand color, grays, header/footer heights, callout colors, and syntax highlight classes all in Phase 1.

---

## Font File Sourcing

| Option | Description | Selected |
|--------|-------------|----------|
| Copy from Ghostty local clone | Use file from ~/Development/ghostty-org/website | ✓ |
| Download from Pretendard official | Download from GitHub/CDN | |
| Use CDN instead of self-hosting | Skip local woff2 | |

**User's choice:** Copy from Ghostty local clone
**Notes:** Copy `pretendard-std-variable.woff2` from the Ghostty repo's font directory.

---

## Claude's Discretion

- Biome configuration (copy verbatim from Ghostty)
- Directory skeleton structure
- next.config.mjs MDX pipeline (copy from Ghostty, swap brand values)

## Deferred Ideas

None.
