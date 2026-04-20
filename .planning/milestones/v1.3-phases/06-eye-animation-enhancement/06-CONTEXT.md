# Phase 6: Eye Animation Enhancement - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Regenerate the 235 animation frames so the character's eyes evolve from squinting (`>` / `-`) to round circles (`( O )`) across the loop. The post-processing script modifies only the eye region in each `.txt` frame file. No React components, CSS, or build pipeline changes.

</domain>

<decisions>
## Implementation Decisions

### Script Approach
- **D-01:** Write a new post-processing script `scripts/generate-eye-frames.js` that reads existing `.txt` frames, detects eye rows dynamically, and rewrites them. Do NOT modify `scripts/generate-frames.js` — leave the original generator untouched.

### Eye Stage Progression
- **D-02:** 5-stage progression across 235 frames (replaces the existing blink keyframes entirely):
  - Frames 1–40: `>` / `-` squint (original characters, no change)
  - Frames 41–80: `_` slit (both eyes)
  - Frames 81–130: `( _ )` half-open arc (both eyes)
  - Frames 131–180: `( o )` three-quarter open (both eyes)
  - Frames 181–235: `( O )` full-round circle (both eyes)
- **D-03:** The existing blink keyframes (frames 88–100, 188–200) are ignored by the post-processing script. Eye shape is determined purely by frame number per the stage schedule above.

### Multi-Character Shape Rendering
- **D-04:** Width-matched replacement per row. For each eye row, the script counts the original character width (number of `<span class="e">` characters), then pads or trims the replacement shape to match exactly. This guarantees zero column drift regardless of row width variation.
- **D-05:** All replacement characters must be wrapped in individual `<span class="e">` per-character spans to match the existing convention (e.g., `<span class="e">(</span><span class="e"> </span><span class="e">O</span><span class="e"> </span><span class="e">)</span>`).

### Eye Row Detection
- **D-06:** Detect eye rows dynamically per frame by searching for `<span class="e">` containing `&gt;` or `-` — never hardcode row indices (EYE-01).

### Validation
- **D-07:** Post-generation validator asserts identical line lengths before/after modification for every frame (EYE-02, EYE-10).
- **D-08:** Validator also checks: (a) all `<span>` tags properly closed, (b) no raw `>` or `<` outside tag syntax, (c) `class="e"` present on all eye spans (EYE-09).

### Claude's Discretion
- Exact padding strategy when replacement shape is shorter than original width (e.g., center-pad vs right-pad)
- Whether to add `.sort()` to `HomeContent.tsx` animationFrames array as a defensive measure (Pitfall #3 from research)
- Backup strategy before overwriting frames (e.g., `animation_frames_original/` copy)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — EYE-01 through EYE-12, all mapped to Phase 6

### Research
- `.planning/research/ARCHITECTURE.md` — Option A/C analysis, build order, key constraints
- `.planning/research/FEATURES.md` — Eye shape vocabulary, stage progression, ASCII shape examples
- `.planning/research/PITFALLS.md` — 7 pitfalls: HTML entity corruption, column drift, sort order, span fragmentation, load performance, frame index desync, eye row identification
- `.planning/research/SUMMARY.md` — Concise summary of all research findings

### Source Files
- `scripts/generate-frames.js` — Original frame generator (read-only reference — do NOT modify)
- `terminals/home/animation_frames/frame_001.txt` — Reference frame for eye region structure
- `src/app/HomeContent.tsx` — Animation frame loading and rendering pipeline

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/generate-frames.js`: Has `getEyeChars(eyeState)` pattern — the new script follows the same per-pixel character mapping approach but reads from existing `.txt` files instead of rendering canvas
- `terminals/home/animation_frames/`: 235 `.txt` files, each 47 lines, containing pre-rendered HTML with `<span class="X">` color classes

### Established Patterns
- Eye spans: each character is its own `<span class="e">` tag (e.g., `<span class="e">&gt;</span><span class="e">&gt;</span>`)
- HTML entities: `>` is encoded as `&gt;` inside spans — the script must emit `&gt;` not `>`
- Frame files are plain UTF-8 text containing raw HTML fragments
- Left eye uses `&gt;` characters (class `e`), right eye uses `-` characters (class `e`)

### Integration Points
- `src/app/terminal-data.tsx`: `loadAllTerminalFiles()` reads all `.txt` files at build time — no changes needed
- `src/app/HomeContent.tsx`: Constructs `animationFrames` array from terminal data — no changes needed
- `next build` picks up regenerated frames automatically

</code_context>

<specifics>
## Specific Ideas

- Eye shape vocabulary from FEATURES.md:
  - Stage 1 (slit): `_` replacing each `>` or `-` character
  - Stage 2 (half-open): `( _ )` — width-matched to original row width
  - Stage 3 (three-quarter): `( o )` — width-matched
  - Stage 4 (full-round): `( O )` — width-matched
- Both eyes must be at the same stage at every frame (EYE-08)
- The script must be idempotent — running it twice produces the same output

</specifics>

<deferred>
## Deferred Ideas

- Pupil/iris detail inside the round eye (EYEP-01) — v2
- Pre-open blink effect (EYEP-02) — v2
- Staggered eye opening left-before-right (EYEP-03) — v2

</deferred>

---

*Phase: 06-eye-animation-enhancement*
*Context gathered: 2026-04-18*
