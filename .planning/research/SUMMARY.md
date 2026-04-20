# Research Summary: v1.3 Eye Animation Enhancement

## Stack additions

No new npm packages. The existing `canvas` (node-canvas) package handles everything. Add inside `scripts/generate-frames.js`:
- `renderEyeCircle(cx, cy, r)` using `ctx.arc()` + `ctx.stroke()`
- Extended `eyeState` branching redefining `1.0` as "round" instead of "closed underscore"
- New keyframes pushing `eyeState` to 1.0 at the desired moments

## Feature table stakes

- Eyes change shape across frames (current static state is the bug)
- Symmetric progression — both eyes open at the same rate
- Smooth interpolation — ~20–30 frames per transition stage
- Eye bounding box does not drift as shape changes
- Final state is clearly legible as "open/round"
- `class="e"` preserved on all eye spans

5-stage progression across 235 frames (loop: open → close → repeat):

| Phase | Frames | Eye State |
|-------|--------|-----------|
| Hold closed | 1–40 | `>` / `-` squint |
| Cracking open | 41–80 | `_` slit |
| Half open | 81–130 | `( _ )` arc |
| Opening | 131–180 | `( o )` |
| Full open | 181–235 | `( O )` round circle |

## Architecture decision

Option A — regenerate all 235 frames with eye evolution baked in via `scripts/generate-frames.js`. The frame pipeline is the only place content is authored; React components are pure renderers. CSS/SVG overlay fails because `HomeContent.tsx` computes font size + padding at runtime from viewport — no stable pixel anchor.

Modified files only:
- `scripts/generate-frames.js`
- `terminals/home/animation_frames/frame_NNN.txt` (all 235)

## Watch Out For

1. **Column width drift** — replacement chars must be byte-for-byte the same visible character count as the original row. Write a post-generation validator asserting identical line lengths. Left eye rows vary: 5, 8, 9, 10, 9, 9, 10, 9 `>` chars per row.

2. **Eye row misidentification** — the character breathes vertically; eye rows are NOT at a fixed line number across all 235 frames. Detect eye rows dynamically by searching for `<span class="e">` containing `&gt;` or `-` within each frame.

3. **HTML entity corruption** — frames use `&gt;` not `>` inside span tags. Any script treating frames as plain text may decode entities on read and fail to re-encode on write. Always emit `&gt;` for `>` inside spans; diff a sample frame after generation to verify.
