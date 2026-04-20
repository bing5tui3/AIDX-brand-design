---
phase: 06-eye-animation-enhancement
plan: "01"
subsystem: build-scripts
tags: [animation, ascii-art, post-processing, node-script]
dependency_graph:
  requires: []
  provides: [scripts/generate-eye-frames.js]
  affects: [terminals/home/animation_frames]
tech_stack:
  added: []
  patterns: [node-script, html-span-manipulation, center-pad-replacement]
key_files:
  created:
    - scripts/generate-eye-frames.js
  modified: []
decisions:
  - Center-pad replacement shapes when shape is shorter than cluster width
  - Detect eye rows by class="e" presence (not by specific chars) to handle blink frames
  - Replace clusters right-to-left within each line to preserve string indices
metrics:
  duration: "~5 minutes"
  completed: "2026-04-18"
  tasks_completed: 1
  tasks_total: 1
---

# Phase 06 Plan 01: Generate Eye Frames Script Summary

Node.js post-processor that reads 235 ASCII animation frames and applies a 5-stage eye-opening progression (squint → slit → half-open → three-quarter → full-round) by replacing `<span class="e">` clusters with width-matched replacements.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Write scripts/generate-eye-frames.js | 4e07563 | scripts/generate-eye-frames.js |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `scripts/generate-eye-frames.js` exists: FOUND
- Commit `4e07563` exists: FOUND
- `node --check` exits 0: VERIFIED
- All 7 required functions present: VERIFIED (findEyeRows, splitIntoClusters, buildReplacement, getStage, validateFrame, ensureBackup, main)
- Only `fs` and `path` required: VERIFIED
- `generate-frames.js` untouched: VERIFIED
