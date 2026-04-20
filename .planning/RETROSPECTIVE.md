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

## Milestone: v1.3 — Eye Animation Enhancement

**Shipped:** 2026-04-19
**Phases:** 1 | **Plans:** 2 | **Timeline:** 2 days (2026-04-18 → 2026-04-19)

### What Was Built
- `scripts/generate-eye-frames.js` — Node.js post-processor with 5-stage eye-opening progression
- 235 animation frames regenerated: squint (1–40) → slit (41–80) → half-open (81–130) → three-quarter (131–180) → full-round (181–235)
- Built-in line-length validator (`validateFrame()`) asserting no column drift after modification
- `.sort()` added to `HomeContent.tsx` for deterministic frame ordering
- `next build` passing after two pre-existing blockers fixed

### What Worked
- Frame post-processing approach (vs CSS/SVG overlay) was the right call — no stable pixel anchor exists for an overlay
- Dynamic eye-row detection via `class="e"` presence handled blink frames correctly without special-casing
- Right-to-left cluster replacement preserved string indices cleanly
- Two-plan structure (write script → run script) gave a clean checkpoint between authoring and execution

### What Was Inefficient
- Validator check 5 was incorrect from the start — it rejected legitimate `class="o"` and `class="h"` spans on eye rows, requiring a fix mid-execution
- Requirements traceability table was never updated during execution (same pattern as v1.0) — all 12 EYE requirements still showed Pending at milestone close
- npm 11 Invalid Version bug with sharp 0.34.x caused an unexpected install failure; workaround required

### Patterns Established
- `tsconfig.json` must exclude `ghostty/` to prevent subtree TS errors from blocking build
- npm install workaround for sharp 0.34.x: `--no-package-lock --cache /tmp/npm-cache-$$`
- Frame post-processor pattern: `generate-eye-frames.js` is idempotent and safe to re-run

### Key Lessons
1. Validator logic should be tested against real frame content before running at scale — a false-positive on legitimate spans wastes a full regeneration run
2. Requirements checkbox tracking during execution remains an open process gap (second milestone in a row)
3. Pre-existing build blockers (tsconfig, npm bugs) should be surfaced in research phase, not discovered during execution

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Timeline | Key Approach |
|-----------|--------|-------|----------|-------------|
| v1.0 | 3 | 9 | 2 days | Ghostty verbatim copy + brand swap |
| v1.3 | 1 | 2 | 2 days | Node.js frame post-processor with built-in validator |

### Top Lessons (Verified Across Milestones)

1. Architecture mirroring an existing, proven codebase dramatically compresses build time
2. Clear done-signal (build passes, lint clean) eliminates ambiguity at phase end
3. Requirements checkbox tracking during execution is a persistent gap — two milestones in a row closed with unchecked boxes
