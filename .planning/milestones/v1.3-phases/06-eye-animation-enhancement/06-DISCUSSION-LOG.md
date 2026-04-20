# Phase 6: Eye Animation Enhancement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18
**Phase:** 06-eye-animation-enhancement
**Areas discussed:** Script approach, Frames 131–180 gap, Multi-char eye rendering, Blink vs opening progression

---

## Script Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Modify generate-frames.js | Update keyframes + getEyeChars + add new canvas shapes. Reuses existing infrastructure. | |
| New post-processing script | Write scripts/generate-eye-frames.js that reads existing frames and rewrites eye regions. Doesn't touch the generator. | ✓ |

**User's choice:** New post-processing script
**Notes:** Preserve generate-frames.js as-is.

---

## Frames 131–180 Gap

| Option | Description | Selected |
|--------|-------------|----------|
| ( o ) three-quarter open | 5-stage progression, smoother visual ramp | ✓ |
| ( O ) jump to full-round at 131 | 4-stage, eyes reach full-open earlier | |
| Hold half-open until 181 | Longer hold on ( _ ), then jump to ( O ) | |

**User's choice:** `( o )` three-quarter open
**Notes:** User initially asked to check Ghostty equivalent — confirmed Ghostty uses negative space (no class="e" spans), so no direct comparison. Chose 5-stage progression.

---

## Multi-Character Eye Rendering

| Option | Description | Selected |
|--------|-------------|----------|
| Width-matched replacement per row | Count original char width per row, pad/trim replacement to match | ✓ |
| New canvas shapes in generator | Add arc/circle rendering to generate-frames.js | |
| Fixed-width with padding | Fixed-width shape, pad narrower rows with spaces | |

**User's choice:** Width-matched replacement per row
**Notes:** Guarantees zero column drift regardless of row width variation.

---

## Blink vs Opening Progression

| Option | Description | Selected |
|--------|-------------|----------|
| Replace blinks with opening progression | Eye shape determined purely by frame number per stage schedule | ✓ |
| Keep blinks, add opening on top | Preserve existing blink keyframes, layer opening on top | |

**User's choice:** Replace blinks with opening progression
**Notes:** Matches EYE-03 exactly. Existing blink keyframes (frames 88–100, 188–200) are ignored by the post-processing script.

---

## Claude's Discretion

- Exact padding strategy for width-matched replacement (center-pad vs right-pad)
- Whether to add `.sort()` to HomeContent.tsx animationFrames array
- Backup strategy before overwriting frames
