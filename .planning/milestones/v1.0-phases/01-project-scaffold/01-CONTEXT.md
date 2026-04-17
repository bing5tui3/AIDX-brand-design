# Phase 1: Project Scaffold - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Initialize a runnable Next.js project with correct config, design tokens, fonts, and type foundations. No UI components, no pages, no docs content — just the skeleton that Phase 2 builds on.

Deliverables: `package.json`, `next.config.mjs`, `tsconfig.json`, `biome.json`, `src/styles/globals.css` (full token set), font files in place, `src/types/style.ts`.

</domain>

<decisions>
## Implementation Decisions

### Ghostty Source Reference
- **D-01:** Mirror the Ghostty website source at `~/Development/ghostty-org/website` (local clone). Planner MUST read this repo directly for config files, dependency versions, and architectural patterns — not infer from memory.

### Next.js Version
- **D-02:** Use the exact Next.js version from `~/Development/ghostty-org/website/package.json`. Do not pin to 15 or latest — read the Ghostty package.json and match it exactly.

### Design Token Scope
- **D-03:** Define ALL CSS custom properties in `src/styles/globals.css` during Phase 1 — brand color, gray scale, header/footer heights, callout colors, AND syntax highlight (atom-one) classes. Phase 2 components consume tokens; they do not define them.

### Font File Sourcing
- **D-04:** Copy `pretendard-std-variable.woff2` from the Ghostty local clone. Source path: `~/Development/ghostty-org/website/src/components/text/font/pretendard-std-variable.woff2` (or equivalent path in the Ghostty repo). Place at `src/components/text/font/pretendard-std-variable.woff2`.
- **D-05:** JetBrains Mono loaded from Google Fonts (no local file needed).

### Claude's Discretion
- Exact Biome rule configuration (copy from Ghostty's biome.json verbatim)
- Directory skeleton creation (create all `src/` subdirectories upfront for Phase 2 readiness)
- `next.config.mjs` MDX pipeline setup (copy from Ghostty, swap brand-specific values)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Ghostty Website Source (primary reference)
- `~/Development/ghostty-org/website/package.json` — Exact dependency versions to mirror (Next.js, React, Biome, MDX pipeline, etc.)
- `~/Development/ghostty-org/website/next.config.mjs` — MDX pipeline config, remark/rehype plugins, static export settings
- `~/Development/ghostty-org/website/tsconfig.json` — TypeScript config with `@/*` path alias
- `~/Development/ghostty-org/website/biome.json` — Linting and formatting rules to copy verbatim
- `~/Development/ghostty-org/website/src/styles/globals.css` — Full CSS token set to adapt (swap Ghostty brand color `#3551F3` → AIDX `#3A5ECF`)
- `~/Development/ghostty-org/website/src/components/text/font/` — Font files including `pretendard-std-variable.woff2`
- `~/Development/ghostty-org/website/src/types/style.ts` — `Unit`, `UnitProp`, `SpacingProp` types to copy

### AIDX Requirements
- `.planning/REQUIREMENTS.md` §SETUP-01–SETUP-05 — Project setup requirements
- `.planning/REQUIREMENTS.md` §STYLE-01–STYLE-03 — Design token requirements
- `.planning/REQUIREMENTS.md` §FONT-01–FONT-02 — Font requirements
- `.planning/REQUIREMENTS.md` §LIB-09 — Shared type requirements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `terminals/home/animation_frames/` — 235 `.txt` frames with ANSI escape codes; ready to use in Phase 3 (not needed for Phase 1 scaffold)
- `aidx-icon.svg`, `aidx-wordmark.svg`, `aidx-icon-dark.svg`, `aidx-wordmark-dark.svg`, `logo-favicon.svg`, `logo-favicon-dark.svg` — Brand SVGs in repo root; will be moved to `public/` and `src/components/navbar/` in Phase 3

### Established Patterns
- No existing Next.js patterns — greenfield. All patterns come from Ghostty source.
- Current `package.json` has only `canvas` dep (used for frame generation) — replace entirely, do not preserve

### Integration Points
- Phase 1 output (`src/styles/globals.css`, `src/types/style.ts`, font files, config files) is consumed directly by Phase 2 component work
- `next.config.mjs` MDX pipeline must be in place before Phase 3 docs routing works

</code_context>

<specifics>
## Specific Ideas

- "Mirror Ghostty website architecture exactly" — this is a hard constraint, not a preference. Read Ghostty source files directly rather than approximating.
- Brand color swap: everywhere Ghostty uses `#3551F3`, AIDX uses `#3A5ECF`. Background: `#0f0f11` (same dark theme approach).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-project-scaffold*
*Context gathered: 2026-04-16*
