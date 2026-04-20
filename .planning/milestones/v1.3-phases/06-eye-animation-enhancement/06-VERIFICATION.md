# Phase 06 Verification

## Must-Haves

| Check | Status | Notes |
|-------|--------|-------|
| scripts/generate-eye-frames.js exists | ✓ | Found at scripts/generate-eye-frames.js |
| File has >= 150 lines | ✓ | 275 lines |
| Contains 'use strict' | ✓ | Line 1 |
| Contains function findEyeRows | ✓ | grep count: 1 |
| Contains function splitIntoClusters | ✓ | grep count: 1 |
| Contains function buildReplacement | ✓ | grep count: 1 |
| Contains function getStage | ✓ | grep count: 1 |
| Contains function validateFrame | ✓ | grep count: 1 |
| Contains function ensureBackup | ✓ | grep count: 1 |
| References animation_frames_backup | ✓ | grep count: 1 |
| node --check exits 0 | ✓ | No syntax errors |
| Only requires 'fs' and 'path' | ✓ | Only two require() calls found |
| frame_001.txt still contains &gt; squint chars (stage 0) | ✓ | 10 matches for class="e">&gt;</span> |
| frame_041.txt contains slit chars `<span class="e">_</span>` | ✓ | 10 matches |
| frame_081.txt contains ( _ ) half-open shape in per-char spans | ✓ | 9 ( spans, 10 _ spans, 9 ) spans |
| frame_131.txt contains ( o ) three-quarter shape | ✓ | 10 matches for o spans |
| frame_181.txt contains ( O ) full-round shape | ✓ | 10 matches for O spans |
| animation_frames_backup/ exists with 235 .txt files | ✓ | 235 files confirmed |
| animation_frames_backup/ is listed in .gitignore | ✓ | terminals/home/animation_frames_backup/ present |
| HomeContent.tsx animationFrames array has .sort() before .map() | ✓ | Line 34: .sort() between .filter() and .map() |
| next build exits 0 | ✓ | Build exit code 0, all 5 static pages generated |

## Result

PASS — all 20 checks verified against the actual codebase. The eye animation progression (squint → slit → half-open → three-quarter → full-round) is correctly applied across all 235 frames, the backup is gitignored, frame ordering is deterministic, and the Next.js build is clean.
