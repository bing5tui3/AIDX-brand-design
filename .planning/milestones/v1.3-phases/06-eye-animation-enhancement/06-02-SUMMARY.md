---
phase: 06-eye-animation-enhancement
plan: 02
subsystem: ui
tags: [animation, terminal, next.js, typescript]

requires:
  - phase: 06-01
    provides: scripts/generate-eye-frames.js post-processor tool

provides:
  - 235 animation frames with stage-based eye shapes (squint → slit → half-open → three-quarter → full-round)
  - Deterministic frame ordering via .sort() in HomeContent.tsx
  - animation_frames_backup/ excluded from git
  - Passing next build

affects:
  - homepage animation rendering
  - future frame regeneration runs

tech-stack:
  added: []
  patterns:
    - "Frame post-processing: run generate-eye-frames.js to regenerate eye shapes; idempotent"
    - "npm install workaround: use --no-package-lock --cache /tmp/npm-cache-$$ to bypass npm 11 Invalid Version bug with sharp 0.34.x"

key-files:
  created:
    - .gitignore
  modified:
    - terminals/home/animation_frames/frame_041.txt through frame_235.txt (195 files, stages 1-4)
    - scripts/generate-eye-frames.js (validator check 5 fix)
    - src/app/HomeContent.tsx (.sort() added)
    - package.json (sharp override, npm 11 workaround)
    - tsconfig.json (exclude ghostty/ subtree)

key-decisions:
  - "Validator check 5 was incorrect: eye rows legitimately contain class=o and class=h spans alongside class=e spans; removed the bad-span regex and replaced with a narrower check"
  - "Excluded ghostty/ subtree from TypeScript compilation to unblock build (pre-existing issue)"
  - "Used npm install --no-package-lock --cache /tmp to work around npm 11 Invalid Version bug with sharp 0.34.x @img/sharp-libvips-* packages"

patterns-established:
  - "tsconfig.json must exclude ghostty/ to prevent subtree TS errors from blocking build"

requirements-completed: []

duration: 24min
completed: 2026-04-18
---

# Phase 06 Plan 02: Eye Animation Frame Regeneration Summary

**235 animation frames regenerated with stage-based eye shapes (squint/slit/half-open/three-quarter/full-round), .sort() added to HomeContent.tsx for deterministic playback, next build passing**

## Performance

- **Duration:** 24 min
- **Started:** 2026-04-18T15:30:04Z
- **Completed:** 2026-04-18T15:53:44Z
- **Tasks:** 2
- **Files modified:** 200

## Accomplishments
- All 235 frames regenerated: stages 0-4 applied per frame schedule, blink frames 084/161/197 correctly overwritten
- Validator bug fixed in generate-eye-frames.js (check 5 false-positived on legitimate non-eye spans)
- .sort() added to animationFrames construction in HomeContent.tsx
- next build exits 0 after fixing two pre-existing blockers

## Task Commits

1. **Task 1: Run generate-eye-frames.js and verify frame output** - `7852b19` (feat)
2. **Task 2: Add .sort() to HomeContent.tsx, gitignore backup, run next build** - `4edd8a4` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `terminals/home/animation_frames/frame_041.txt` through `frame_235.txt` - 195 frames with eye shapes applied
- `scripts/generate-eye-frames.js` - Validator check 5 fixed
- `src/app/HomeContent.tsx` - .sort() added between .filter() and .map()
- `.gitignore` - Created; excludes node_modules/, .next/, animation_frames_backup/
- `package.json` - sharp override to 0.33.5 (npm 11 workaround)
- `tsconfig.json` - ghostty/ excluded from TS compilation

## Decisions Made
- Validator check 5 replaced: the original regex flagged any non-`class="e"` span on an eye row, but eye rows legitimately contain `class="o"` and `class="h"` spans. The new check only validates content inside `class="e"` spans.
- ghostty/ excluded from tsconfig: the Ghostty subtree references components that don't exist in the AIDX project; excluding it is correct since it's a reference-only subtree.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed validator check 5 in generate-eye-frames.js**
- **Found during:** Task 1 (Run generate-eye-frames.js)
- **Issue:** Validator regex `/<span(?! class="e")[^>]*>` matched `class="o"` and `class="h"` spans that legitimately appear on the same lines as eye spans, causing all stage 1-4 frames to fail validation despite correct content
- **Fix:** Replaced the broad bad-span regex with a narrower check that only inspects content inside `class="e"` spans for raw angle brackets
- **Files modified:** scripts/generate-eye-frames.js
- **Verification:** Script re-run exits 0, "Done. All frames validated successfully."
- **Committed in:** 7852b19 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed npm install failure (npm 11 Invalid Version bug)**
- **Found during:** Task 2 (next build)
- **Issue:** npm 11.12.1 throws `TypeError: Invalid Version` when resolving `@img/sharp-libvips-*@1.2.4` transitive deps of Next.js sharp integration
- **Fix:** Used `npm install --no-package-lock --cache /tmp/npm-cache-$$` to bypass the deduplication step that triggers the bug
- **Files modified:** package.json (sharp override added as additional guard)
- **Verification:** npm install exits 0, 327 packages installed
- **Committed in:** 4edd8a4 (Task 2 commit)

**3. [Rule 3 - Blocking] Excluded ghostty/ subtree from TypeScript compilation**
- **Found during:** Task 2 (next build TypeScript check)
- **Issue:** `ghostty/mdx-components.tsx` imports `@/components/card-links` which doesn't exist in the AIDX project, causing TS type error that fails the build
- **Fix:** Added `"ghostty"` to `exclude` array in tsconfig.json
- **Files modified:** tsconfig.json
- **Verification:** next build TypeScript check passes
- **Committed in:** 4edd8a4 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All fixes necessary for build to pass. No scope creep.

## Issues Encountered
- npm 11 has a known bug with `@img/sharp-libvips-*` packages that have empty version strings in their tarballs; workaround is `--no-package-lock` with a temp cache dir.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 235 frames have correct eye shapes; homepage animation will show the full squint-to-round progression
- generate-eye-frames.js is idempotent and can be re-run safely if frames need regeneration
- next build is clean and passing

## Self-Check: PASSED

All files confirmed present. Both task commits verified in git log.
