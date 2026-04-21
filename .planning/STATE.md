---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Animation Performance Optimization
status: Defining requirements
last_updated: "2026-04-21T07:01:05.888Z"
last_activity: 2026-04-20 — Milestone v1.4 started
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 2
  completed_plans: 2
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-20)

**Core value:** A polished, fast, fully-static Next.js site with animated terminal hero and MDX docs — mirroring Ghostty website architecture exactly.
**Current focus:** v1.4 Animation Performance Optimization

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-04-20 — Milestone v1.4 started

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
- AnimatedTerminal/Terminal code is identical to Ghostty — choppiness is due to frame content complexity (AIDX frames have many <span> elements for eye animation, ~11KB/frame)
- key={i + line} in Terminal causes DOM node recreation for changed lines — fix to key={i}
- Direct innerHTML write in AnimationManager callback eliminates ~30 React re-renders/sec for ~11KB frame content
- contain: strict safe on .terminal because explicit width/height set via --columns/--rows CSS vars

### Pending Todos

None.

### Blockers/Concerns

None.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |
