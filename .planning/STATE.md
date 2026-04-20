---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Eye Animation Enhancement
status: shipped
last_updated: "2026-04-19T00:00:00Z"
last_activity: 2026-04-19
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-19)

**Core value:** A polished, fast, fully-static Next.js site with animated terminal hero and MDX docs — mirroring Ghostty website architecture exactly.
**Current focus:** Planning next milestone

## Current Position

Phase: 6 — Eye Animation Enhancement
Plan: 02 complete
Status: Shipped — v1.3 milestone archived 2026-04-19
Last activity: 2026-04-19 — v1.3 milestone closed

Progress: [██████████] 100%

## Accumulated Context

### Decisions

- Animation frames are pre-generated ASCII art in terminals/home/animation_frames/
- Eye rows detected dynamically by class="e" presence (not hardcoded row index)
- Post-generation validator asserts identical line lengths before/after modification
- Eye stages: squint (1–40), slit (41–80), half-open (81–130), three-quarter (131–180), round (181–235)
- All eye spans preserve `class="e"` and use `&gt;` HTML entity encoding
- Eye rows legitimately contain class="o" and class="h" spans alongside class="e" spans
- ghostty/ subtree must be excluded from tsconfig.json to prevent TS errors from blocking build
- npm 11 Invalid Version bug with sharp 0.34.x: use --no-package-lock --cache /tmp/npm-cache-$$ as workaround

### Pending Todos

None.

### Blockers/Concerns

None.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |
