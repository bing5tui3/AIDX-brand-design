# Architecture: Eye Animation Integration

**Domain:** ASCII art terminal animation — eye shape evolution in pre-generated HTML frames
**Researched:** 2026-04-18
**Confidence:** HIGH — based on direct inspection of all relevant source files

---

## Current System Facts

The animation pipeline is:

1. `terminals/home/animation_frames/frame_NNN.txt` — 235 plain-text files, each 47 lines, containing pre-rendered HTML with `<span class="X">` color classes (`b`, `e`, `g`, `h`, `o`)
2. `src/app/terminal-data.tsx` — `loadAllTerminalFiles()` reads all `.txt` files at build time, returns a `TerminalsMap` (slug → string[])
3. `src/app/HomeContent.tsx` — filters `terminalData` for `home/animation_frames` keys, passes the array of `string[]` as `frames` to `AnimatedTerminal`
4. `src/components/animated-terminal/index.tsx` — `AnimationManager` drives `requestAnimationFrame` at 31ms/frame, advances `currentFrame` index, passes `frames[currentFrame]` as `lines` to `Terminal`
5. `src/components/terminal/index.tsx` — renders each line via `dangerouslySetInnerHTML`

The eye region uses `class="e"` spans. In frame_001, the left eye is `>>>>>` through `>>>` (squinting, lines 25–34) and the right eye is `---` through `-----------------` (lines 28–34). Inspection of frames 50, 200, and 235 confirms the eye spans are **identical across all 235 frames** — no evolution exists yet.

---

## Integration Options

### Option A — Regenerate all 235 frames with eye evolution baked in

Modify the upstream frame-generation script (or write a new one) to produce frames where the eye characters transition from squinting (`>`, `-`) to round circles (`O`, `o`, `0`) across a defined frame range. The resulting `.txt` files replace the current ones verbatim.

**Pros:**
- Zero changes to any React component, CSS, or build pipeline
- The animation system already handles everything — it just plays frames
- Eye evolution is perfectly frame-accurate and deterministic
- No runtime overhead, no DOM complexity
- Consistent with how Ghostty handles its own animation evolution

**Cons:**
- Requires a frame-generation script (Python or Node) to be written or modified
- The 235 `.txt` files must be regenerated and committed (~235 file changes)
- If the character art changes later, frames must be regenerated again

### Option B — Overlay a separate CSS/SVG eye animation on top of the terminal

Add a positioned `<div>` or `<svg>` element as a sibling/child of `AnimatedTerminal`, absolutely positioned to sit over the eye region of the character. Animate it with CSS keyframes or a JS animation library independently of the frame loop.

**Pros:**
- No frame regeneration needed
- Eye animation can be tweaked in CSS without touching frame files

**Cons:**
- The terminal renders at variable font sizes (`xtiny`, `tiny`, `small`) and variable `whitespacePadding` (0, 10, or 20 columns depending on viewport). The eye position in pixels shifts with every breakpoint — precise overlay alignment is extremely fragile.
- The character art itself is ASCII, so the eye region has no fixed pixel anchor. Any overlay would need to be recalibrated for every font size and padding combination.
- The existing `>` and `-` eye characters would still be visible underneath unless the overlay fully occludes them, requiring careful z-index and background color matching.
- Adds runtime DOM complexity and a second animation loop running independently of the frame loop — they can drift.
- Breaks the "terminal renders its own content" contract of the architecture.

### Option C — Modify specific frame ranges to add eye shapes

Write a targeted script that reads the existing `.txt` files, identifies the eye-region lines by pattern matching on `class="e"` spans, and rewrites only those lines across a subset of frames (e.g., frames 150–235) to show the eye opening. Other lines in each frame are left untouched.

**Pros:**
- Surgical — only the eye lines change, the rest of each frame is preserved exactly
- Smaller diff than full regeneration if the body art is complex to reproduce
- Same zero-component-change benefit as Option A

**Cons:**
- Requires careful line-number targeting (the eye region spans lines 25–36 in the current frames, but this could shift if the character's vertical position changes across frames)
- Pattern matching on the existing HTML span structure is brittle if span boundaries change
- Effectively the same work as Option A if the eye region needs to be redrawn from scratch anyway (which it does — the transition from `>` to `O` is a shape change, not a color change)

---

## Recommended Approach

**Option A — regenerate all 235 frames with eye evolution baked in.**

The evidence is decisive:

1. The current frames already have a consistent eye region (lines 25–36, `class="e"` spans). The eye shape is static across all 235 frames. The work is to make it dynamic.
2. The frame pipeline is the only place where content is authored. The React components are pure renderers — they have no knowledge of what the frames contain. Keeping it that way is correct.
3. Option B's overlay approach fails on the variable font size + padding system. `HomeContent.tsx` computes three font sizes and three padding values at runtime based on viewport. There is no stable pixel coordinate for the eye region.
4. Option C is Option A with extra steps — if you're writing a script to modify eye lines, you're writing a frame generator. Do it cleanly.

The implementation is a Node.js or Python script that:
- Reads each of the 235 `.txt` files
- For frames in the "squinting" phase (e.g., 1–150): keeps eyes as `>` / `-`
- For frames in the "opening" phase (e.g., 151–200): progressively widens the eye opening (fewer `>` characters, then a gap, then a partial circle)
- For frames in the "open" phase (e.g., 201–235): replaces eye spans with round circle characters (`O`, `o`, `(o)`, etc.) using the same `class="e"` span wrapper

The script outputs new `.txt` files to `terminals/home/animation_frames/`, which are committed. The website build picks them up automatically via `loadAllTerminalFiles()`.

---

## New Components Needed

None. The existing pipeline handles everything.

The only new artifact is a **frame generation/mutation script**, which lives outside the Next.js app (e.g., `scripts/generate-eye-frames.js` or `.py`). It is a build-time tool, not a runtime component.

---

## Modified Files

| File | Change |
|------|--------|
| `terminals/home/animation_frames/frame_NNN.txt` (all 235) | Eye region lines rewritten to show evolution |
| `scripts/generate-eye-frames.js` (new) | Script that produces the evolved frames |

No changes to:
- `src/components/animated-terminal/index.tsx`
- `src/components/terminal/index.tsx`
- `src/app/terminal-data.tsx`
- `src/app/HomeContent.tsx`
- Any CSS module

---

## Build Order

1. Identify the exact eye region: lines 25–36 in the current frames, left eye uses `>` characters (class `e`), right eye uses `-` characters (class `e`). Confirm the column positions are stable across all 235 frames before writing the script.
2. Design the eye evolution sequence — decide frame ranges for squint / opening / open phases and what ASCII shapes represent each stage.
3. Write `scripts/generate-eye-frames.js`: reads existing frames, rewrites eye lines for the target frame range, writes output files.
4. Run the script, visually inspect a sample of output frames (frame 150, 175, 200, 235) to verify the transition looks correct.
5. Commit the 235 updated `.txt` files.
6. Run `next build` — no code changes needed, the new frames are picked up automatically.

---

## Key Constraints to Respect

- Each frame file must remain exactly 47 lines (the terminal is configured for `rows={41}` plus header/padding). Do not add or remove lines.
- Each line must fit within 100 columns (`columns={100}` in `HomeContent.tsx`). The eye region currently sits around columns 9–45 (left eye) and 55–80 (right eye) — verify exact positions before scripting.
- The `class="e"` span is the eye color class. Use it for all eye characters in the evolved frames to maintain consistent coloring.
- The script must be idempotent — running it twice should produce the same output.
