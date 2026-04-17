# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-17
**Phases:** 3 | **Plans:** 9 | **Timeline:** 2 days (2026-04-16 → 2026-04-17)

### What Was Built
- Next.js 16 + Biome 2 project config mirroring Ghostty website architecture exactly
- Full component library (18 components): Text, Link, Button, Terminal, AnimatedTerminal, Navbar, Footer, NavTree, Sidecar, Breadcrumbs, JumplinkHeader, CodeBlock, Callout, Blockquote, PathnameFilter, SectionWrapper, ScrollToTopButton
- All lib/docs utilities: zustand store, MDX plugins, navigation, page loading
- Homepage with 235-frame animated terminal hero and CTA buttons
- MDX docs system: catch-all route, sidebar nav, sidecar TOC, breadcrumbs
- Static build clean — 4 routes prerendered, Biome lint green across 33 files

### What Worked
- Verbatim Ghostty component copy + AIDX brand swap was extremely efficient — no rewrite, just substitution
- Three-phase structure (scaffold → components → pages) created clean dependency ordering with no blockers
- Static build verification as the final plan gave a clear, objective done signal
- Animation frames were pre-generated — no work needed, just wire-up

### What Was Inefficient
- Requirements checkboxes in REQUIREMENTS.md were never updated during execution — had to proceed with unchecked boxes at milestone close
- Phase 2, Plan 02 one-liner was corrupted (picked up a lint rule error instead of an accomplishment) — summary-extract fallback quality varies
- No visual browser testing was done during execution — UI correctness unverified

### Patterns Established
- Ghostty verbatim copy pattern: copy component → swap brand color/wordmark → verify TypeScript compiles
- SVG-only favicon acceptable for v1; PNG variants always deferred to v2
- Placeholder `GITHUB_REPO_URL` in config.ts is the standard for first-ship; update when repo is public
- `noArrayIndexKey` biome rule suppressed with composite keys (index + content slice) for animation frames

### Key Lessons
1. Tracking requirement checkbox state during execution prevents milestone-close friction
2. A two-day build is achievable when the architecture is copied verbatim from a known-good source
3. Summary one-liners should be written as prose in the SUMMARY.md front-matter, not inferred from body text

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Timeline | Key Approach |
|-----------|--------|-------|----------|-------------|
| v1.0 | 3 | 9 | 2 days | Ghostty verbatim copy + brand swap |

### Top Lessons (Verified Across Milestones)

1. Architecture mirroring an existing, proven codebase dramatically compresses build time
2. Clear done-signal (build passes, lint clean) eliminates ambiguity at phase end
