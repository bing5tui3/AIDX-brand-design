# Domain Pitfalls: Eye Animation in Pre-Generated ASCII Frames

**Domain:** Modifying pre-generated ASCII art animation frames with HTML span markup
**Researched:** 2026-04-18
**Milestone:** v1.3 Eye Animation Enhancement

---

## Critical Pitfalls

### Pitfall 1: HTML Entity Corruption in Eye Characters

**What goes wrong:** The existing frames already use `&gt;` (HTML entity) for the `>` eye characters — visible in frame_001.txt lines 25-34. If a frame generation script outputs raw `>` characters instead of `&gt;`, the Terminal component's `dangerouslySetInnerHTML` will render them correctly visually, but any downstream HTML serialization (static export, SSR hydration) may double-escape or misparse them. Conversely, if a script reads existing frames and re-emits them, it may decode `&gt;` to `>` and then fail to re-encode, breaking the span structure.

**Why it happens:** The frames are raw HTML fragments, not plain text. Any tool that treats them as text (Python `str.replace`, sed, awk) will operate on the literal bytes `&gt;` and may corrupt the entity or the surrounding span tags.

**Consequences:** Broken span tags cause the entire line's color classes to fail silently — the eye region renders as unstyled text or disappears entirely. The animation continues but the eye effect is invisible.

**Prevention:**
- Parse frames as HTML (use an HTML parser, not string replace) when modifying span content
- If writing a Python generator, always emit `&gt;` not `>` for the `>` character inside span tags
- After regeneration, diff a sample frame against the original to verify entity encoding is intact

**Detection:** Open a modified frame in a browser directly. If `>` appears as literal `&gt;` on screen, the entity was double-escaped. If the eye region has no color, the span was broken.

---

### Pitfall 2: Column Width Drift Breaking the Fixed-Width Grid

**What goes wrong:** The terminal is sized by `--columns: 100` and each frame line must be exactly 90 visible characters wide (the frame files show 90-char content + trailing spaces to pad to the column width). Eye shapes drawn with multi-character sequences like `( o )` or `O` occupy different column counts than the original `>>>>>` or `-----` sequences. A single character difference per line causes the entire frame to shift right or left relative to adjacent frames, producing a horizontal jitter visible at 31ms/frame.

**Why it happens:** ASCII art alignment is purely positional — every character is one monospace cell. Replacing 5 `>` chars with `( o )` (also 5 chars) is safe. Replacing with `(o)` (3 chars) leaves 2 trailing spaces that must be explicitly added, or the body outline shifts inward.

**Consequences:** Visible horizontal jitter during the eye-open transition. At 31ms/frame this is very noticeable. The terminal box itself won't resize (it's CSS-fixed) but the art inside will appear to wobble.

**Prevention:**
- Count characters in the eye region before and after modification — the replacement must be byte-for-byte the same length as the original
- Use a fixed-width eye shape that matches the original `>` count per row (rows 25-34 in frame_001 show 5, 8, 9, 10, 9, 9, 10, 9 `>` chars respectively — the left eye varies per row)
- Write a validation script that asserts every line in every modified frame has the same visible character count as the corresponding line in frame_001

**Detection:** Render two adjacent frames side-by-side in a static HTML file. Any horizontal shift in the body outline is a column count mismatch.

---

### Pitfall 3: Frame Sort Order Mismatch

**What goes wrong:** `loadAllTerminalFiles` in `terminal-data.tsx` uses `fs.readdir` which returns files in filesystem order (typically inode order on macOS, not lexicographic). The `HomeContent.tsx` then does `Object.keys(terminalData).filter(...).map(...)` — `Object.keys` on a plain object preserves insertion order in V8, which is the readdir order. If regenerated frames are written in a different order (e.g., frame_100 before frame_099 due to parallel writes), the animation sequence will be scrambled.

**Why it happens:** The pipeline relies on implicit filesystem ordering rather than explicit sort. This works for the original 235 frames because they were written sequentially. Regeneration scripts that write frames in parallel or use glob patterns without explicit sort break this assumption.

**Consequences:** The animation plays frames out of sequence — the eye-open transition appears at random points in the loop instead of at the intended moment.

**Prevention:**
- After regeneration, sort frames explicitly: `Object.keys(terminalData).filter(...).sort().map(...)`
- Or ensure the generation script writes frames in strict lexicographic order (frame_001 before frame_002, etc.)
- The sort fix in `HomeContent.tsx` is the safer long-term solution regardless

**Detection:** Add a `console.log` of the first 5 frame keys during development. If they are not `home/animation_frames/frame_001`, `frame_002`, etc. in order, the sort is broken.

---

### Pitfall 4: Span Tag Fragmentation Causing Misaligned Eye Pixels

**What goes wrong:** The existing frames wrap each individual `>` and `-` character in its own `<span class="e">` tag (visible in frame_001.txt lines 25-34: `<span class="e">&gt;</span><span class="e">&gt;</span>...`). This is intentional — it allows per-character color control. If a new eye shape uses multi-character spans like `<span class="e">( o )</span>`, the rendering is visually identical but the DOM structure differs. The problem arises if the eye transition mixes both styles across frames: some frames with per-char spans, others with multi-char spans. The `dangerouslySetInnerHTML` key is `i + line` — if the line string changes length due to span structure differences, React will always re-render that div, which is fine, but inconsistent span structure makes it harder to debug alignment issues.

**Why it happens:** Frame generation scripts may use different span-wrapping strategies for the new eye shapes vs. the original body shapes.

**Prevention:**
- Standardize on per-character spans for the eye region to match the existing convention
- This also makes column counting unambiguous (one span = one visible character)

---

## Integration Pitfalls

### Pitfall 5: Build-Time Frame Loading Performance

**What goes wrong:** `loadAllTerminalFiles` is called at build time (it's an async server function used in the page's `generateStaticParams` or page component). With 235 frames × ~50 lines each, this is ~11,750 `fs.readFile` calls in a sequential loop. Adding more frames (e.g., extending to 300 for a smoother eye transition) increases build time linearly. The current implementation reads files one at a time in a `for` loop — not parallelized.

**Why it happens:** The loop in `collectAllFilesRecursively` + the sequential `for (const path of allPaths)` read loop in `loadAllTerminalFiles` does not use `Promise.all`.

**Consequences:** Build time increases proportionally with frame count. At 235 frames this is acceptable; at 500+ it becomes noticeable on CI.

**Prevention:**
- If frame count stays at 235, no action needed
- If extending frame count, parallelize reads: `await Promise.all(allPaths.map(path => fs.readFile(path, 'utf8')))`
- Do not add frames beyond what the eye transition requires

---

### Pitfall 6: AnimationManager Frame Index Desync After Frame Count Change

**What goes wrong:** `AnimatedTerminal` initializes `currentFrame` at `16` (hardcoded). If the total frame count changes (e.g., from 235 to a different number), frame 16 may land in a visually awkward position — mid-transition rather than a stable "resting" state. More critically, the modulo `(currentFrame + 1) % frames.length` is correct, but if `frames` is passed as a new array reference on every render (due to the `.filter().map()` in `HomeContent`), React will re-render `AnimatedTerminal` and the `frames.length` in the closure may briefly be stale.

**Why it happens:** The `frames` array is reconstructed on every `HomeContent` render. The `animationManager` callback closes over `frames.length` indirectly via the `% frames.length` in `setCurrentFrame` — but since it uses the functional updater form `setCurrentFrame(f => (f + 1) % frames.length)`, `frames.length` is captured from the outer scope at the time the effect runs, not at callback time.

**Prevention:**
- Memoize `animationFrames` in `HomeContent` with `useMemo` keyed on `terminalData`
- Keep frame count at 235 or update the hardcoded `useState(16)` initial frame to a value that makes visual sense for the new sequence

---

### Pitfall 7: Eye Region Row Identification Across All 235 Frames

**What goes wrong:** The eye characters (`>` left eye, `-` right eye) appear on rows 25-34 of the frame (0-indexed from the top of the art). But the frame files include 2 blank lines at the top and the art itself shifts vertically across the animation cycle (the character "breathes" up and down). If the eye row is hardcoded as "rows 25-34", it will be wrong for frames where the art has shifted up or down by 1-2 rows.

**Why it happens:** The animation was generated with vertical movement. The eye position is not at a fixed row number — it tracks with the body outline.

**Consequences:** Eye modification script targets the wrong rows in some frames, leaving the original `>` characters unchanged in those frames and producing a flickering effect during the transition.

**Prevention:**
- Detect the eye row dynamically by searching for the `class="e"` span pattern within each frame, not by hardcoded row index
- Alternatively, search for the `&gt;` entity within `<span class="e">` tags to locate the left eye, and `-` within `<span class="e">` for the right eye

---

## Prevention Strategies

1. Write a frame validation script before and after modification that checks: (a) line count per frame is identical, (b) visible character count per line is identical, (c) all `<span>` tags are properly closed, (d) no raw `>` or `<` outside of tag syntax.

2. Test the transition on a subset of frames first (e.g., frames 100-150) before regenerating all 235.

3. Keep the original frames in a backup directory (`terminals/home/animation_frames_original/`) before any modification. The git history is a fallback but a local copy is faster to diff.

4. Render a static HTML test page that shows 10 consecutive frames side-by-side to visually verify alignment before running the full build.

5. Add an explicit `.sort()` to the `animationFrames` array construction in `HomeContent.tsx` as a defensive measure regardless of generation order.

---

## Phase Recommendations

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Frame generation script | HTML entity corruption (#1), column drift (#2) | Parse as HTML; validate character counts |
| Eye shape design | Column width drift (#2), span fragmentation (#4) | Match original char count per row; use per-char spans |
| Frame ordering | Sort order mismatch (#3) | Add `.sort()` in HomeContent; validate key order |
| Build integration | Load performance (#5), frame index desync (#6) | Keep frame count at 235; memoize frames array |
| Eye row targeting | Vertical shift across frames (#7) | Detect eye rows dynamically via span class search |

**Highest risk:** Pitfall #2 (column drift) and Pitfall #7 (eye row identification) — both are silent failures that only appear visually and are easy to miss in a text diff.
