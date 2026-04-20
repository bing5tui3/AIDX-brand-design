# Phase 6: Eye Animation Enhancement - Research

**Researched:** 2026-04-18
**Domain:** ASCII art frame post-processing — Node.js script modifying HTML span content in pre-generated `.txt` animation frames
**Confidence:** HIGH — all findings verified by direct inspection of frame files and source code

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Write `scripts/generate-eye-frames.js` — do NOT modify `scripts/generate-frames.js`
- **D-02:** 5-stage progression: frames 1–40 squint (`>` / `-`), 41–80 slit (`_`), 81–130 half-open (`( _ )`), 131–180 three-quarter (`( o )`), 181–235 full-round (`( O )`)
- **D-03:** Existing blink keyframes (84–97, 161–197) ignored — eye shape determined purely by frame number
- **D-04:** Width-matched replacement per row — count original `<span class="e">` chars, pad/trim replacement to match exactly
- **D-05:** All replacement chars wrapped in individual `<span class="e">` per-character spans
- **D-06:** Detect eye rows dynamically per frame by searching for `<span class="e">` — never hardcode row indices
- **D-07:** Post-generation validator asserts identical line lengths before/after for every frame
- **D-08:** Validator checks: (a) all `<span>` tags properly closed, (b) no raw `>` or `<` outside tag syntax, (c) `class="e"` present on all eye spans

### Claude's Discretion
- Exact padding strategy when replacement shape is shorter than original width (center-pad vs right-pad)
- Whether to add `.sort()` to `HomeContent.tsx` animationFrames array (Pitfall #3)
- Backup strategy before overwriting frames

### Deferred Ideas (OUT OF SCOPE)
- Pupil/iris detail inside the round eye (EYEP-01) — v2
- Pre-open blink effect (EYEP-02) — v2
- Staggered eye opening left-before-right (EYEP-03) — v2
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EYE-01 | Frame generator detects eye rows dynamically per frame | Verified: search for any `<span class="e">` — always exactly 10 contiguous rows per frame |
| EYE-02 | Post-generation validator asserts identical line lengths before/after | Verified: all 235 frames are 48 lines; visible char counts per line are stable |
| EYE-03 | Eye animation loops: squint → slit → half-open → round → squint | Verified: 5-stage schedule maps cleanly to 235 frames |
| EYE-04 | Frames 1–40 retain original `>` / `-` squint characters | Verified: frames 1–40 all have `&gt;`/`-` chars — no change needed |
| EYE-05 | Frames 41–80 show `_` slit eye shape | Verified: these frames currently have `&gt;`/`-` — script replaces with `_` |
| EYE-06 | Frames 81–130 show `( _ )` arc eye shape | Verified: includes blink frames 84–97 which currently have `_`/`·` — script overwrites |
| EYE-07 | Frames 181–235 show `( O )` round circle eye shape | Verified: includes blink frames 181–197 which currently have `_`/`·` — script overwrites |
| EYE-08 | Both eyes open symmetrically | Verified: left (gt) and right (dash) clusters are separate — replace each with same shape |
| EYE-09 | All eye spans preserve `class="e"` and use `&gt;` HTML entity encoding | Verified: existing convention confirmed; script must emit `&gt;` not `>` |
| EYE-10 | All 235 regenerated frames pass line-length validation | Verified: width-matching strategy guarantees this |
| EYE-11 | Static build passes with regenerated frames | Verified: no component changes needed; `loadAllTerminalFiles` picks up new content automatically |
| EYE-12 | Animation visually matches Ghostty's eye-opening quality at `fontSmall` size | Research: 5-stage progression with per-cluster width matching achieves this |
</phase_requirements>

---

## Summary

The 235 animation frames are plain UTF-8 files containing raw HTML fragments. Each frame is exactly 48 lines. The eye region is always exactly 10 contiguous lines containing `<span class="e">` spans — the only lines in any frame that use `class="e"`. The eye region shifts vertically by 0–3 rows across the animation cycle (the character "breathes"), so row detection must be dynamic.

The existing frames already contain blink animation: frames 84–97 use `_` and `·` eye chars, frames 161–197 use `·` and `_` chars. Per D-03, the new script ignores this — it overwrites all eye rows based purely on the frame number stage schedule. The detection strategy (D-06) must search for ANY `<span class="e">` span, not just `&gt;` or `-`, because blink frames have neither.

The critical structural fact: rows 4, 5, and 6 within the 10-eye-row block (0-indexed) contain BOTH the left eye cluster and the right eye cluster, separated by a fixed plain-space gap (13, 9, and 11 chars respectively). The replacement strategy must preserve these gaps and replace each cluster independently.

**Primary recommendation:** Detect eye rows by finding all lines with `<span class="e">`, split each row into left/right clusters by the plain-space gap, replace each cluster independently with the stage-appropriate shape padded/trimmed to the original cluster width.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Eye shape generation | Build-time script | — | Frame files are static assets; no runtime component involvement |
| Frame file I/O | Node.js script (fs module) | — | Plain UTF-8 read/write; no framework needed |
| Validation | Node.js script (same or separate) | — | Pre/post line-length assertion is a build-time check |
| Animation playback | Browser / Client | — | `AnimatedTerminal` is a pure renderer; unchanged |
| Frame loading | Frontend Server (build-time) | — | `loadAllTerminalFiles` reads at Next.js build time; unchanged |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js `fs` | built-in (v25.9.0) | Read/write frame files | No external deps needed; pure text processing |
| Node.js `path` | built-in | File path construction | Standard for cross-platform paths |
| Node.js `glob` / `fs.readdir` | built-in | Enumerate 235 frame files | Already used in `terminal-data.tsx` pattern |

### No External Dependencies Needed
`generate-eye-frames.js` is a pure text-processing script. It does NOT need `canvas` (that's only for the original pixel-to-ASCII rendering in `generate-frames.js`). All operations are string manipulation on UTF-8 files.

**Installation:** None required.

---

## Architecture Patterns

### System Architecture Diagram

```
frame_NNN.txt (235 files)
        |
        v
[generate-eye-frames.js]
  1. readdir → sort → for each frame
  2. readFileSync → split by \n
  3. detect 10 eye rows (any line with class="e")
  4. determine stage from frame number
  5. for each eye row:
       a. find left cluster (first consecutive e-span group)
       b. find right cluster (second group, if present)
       c. build replacement string for each cluster
       d. replace cluster spans in line HTML
  6. writeFileSync → overwrite frame file
        |
        v
[validator] (same script, post-write pass)
  - assert line count = 48
  - assert visible char count per line unchanged
  - assert all <span> tags closed
  - assert no raw > or < outside tags
  - assert class="e" on all eye spans
        |
        v
frame_NNN.txt (updated, same line count, same visible widths)
        |
        v
next build → picks up automatically via loadAllTerminalFiles
```

### Recommended Project Structure
```
scripts/
├── generate-frames.js       # original generator — DO NOT MODIFY
└── generate-eye-frames.js   # new post-processor (this phase)
```

### Pattern 1: Eye Row Detection

**What:** Find the 10 contiguous eye rows in any frame by searching for `<span class="e">`.
**When to use:** Every frame, regardless of current eye character type.

```javascript
// Source: verified by direct frame analysis
function findEyeRows(lines) {
  // Returns array of 10 line indices (always contiguous, always exactly 10)
  const eyeRows = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<span class="e">')) {
      eyeRows.push(i);
    }
  }
  // Verify exactly 10 contiguous rows found
  if (eyeRows.length !== 10) {
    throw new Error(`Expected 10 eye rows, found ${eyeRows.length}`);
  }
  return eyeRows;
}
```

### Pattern 2: Cluster Splitting on Mixed Rows

**What:** Rows at offsets 3, 4, 5 within the eye block contain both left and right eye clusters separated by a plain-space gap.
**When to use:** When replacing eye characters on rows that have two clusters.

```javascript
// Source: verified by direct frame analysis — gaps are fixed: 13, 9, 11 chars
function splitIntoClusters(line) {
  // Find all e-span groups separated by whitespace gaps
  const spanPattern = /<span class="e">[^<]+<\/span>/g;
  const spans = [...line.matchAll(spanPattern)];
  
  if (spans.length === 0) return [];
  
  const clusters = [];
  let currentCluster = { start: spans[0].index, spans: [spans[0]] };
  
  for (let i = 1; i < spans.length; i++) {
    const gap = line.slice(spans[i-1].index + spans[i-1][0].length, spans[i].index);
    if (gap.length > 0) {
      // Gap found — end current cluster, start new one
      currentCluster.end = spans[i-1].index + spans[i-1][0].length;
      clusters.push(currentCluster);
      currentCluster = { start: spans[i].index, spans: [spans[i]] };
    } else {
      currentCluster.spans.push(spans[i]);
    }
  }
  const lastSpan = spans[spans.length - 1];
  currentCluster.end = lastSpan.index + lastSpan[0].length;
  clusters.push(currentCluster);
  
  return clusters; // 1 cluster for rows 0-2, 6-9; 2 clusters for rows 3-5
}
```

### Pattern 3: Width-Matched Replacement

**What:** Build a replacement string of exactly N `<span class="e">` chars for a cluster of width N.
**When to use:** Every cluster replacement.

```javascript
// Source: verified — per-cluster widths are fixed across all frames
function buildReplacement(width, shape) {
  // shape is an array of chars, e.g. ['(', ' ', 'O', ' ', ')'] for stage 4
  // pad with spaces if shape is shorter than width
  // trim from edges if shape is longer than width
  let chars;
  if (shape.length === width) {
    chars = shape;
  } else if (shape.length < width) {
    // Center-pad with spaces
    const totalPad = width - shape.length;
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    chars = [...Array(leftPad).fill(' '), ...shape, ...Array(rightPad).fill(' ')];
  } else {
    // Trim symmetrically from edges
    const excess = shape.length - width;
    const trimLeft = Math.floor(excess / 2);
    chars = shape.slice(trimLeft, trimLeft + width);
  }
  
  return chars.map(c => {
    const encoded = c === '>' ? '&gt;' : c === '<' ? '&lt;' : c === '&' ? '&amp;' : c;
    return `<span class="e">${encoded}</span>`;
  }).join('');
}
```

### Pattern 4: Stage Schedule

**What:** Map frame number (1-indexed) to eye shape.
**When to use:** Once per frame.

```javascript
// Source: D-02 locked decision
function getStage(frameNum) {
  if (frameNum <= 40)  return 0; // squint — no change
  if (frameNum <= 80)  return 1; // slit: _
  if (frameNum <= 130) return 2; // half-open: ( _ )
  if (frameNum <= 180) return 3; // three-quarter: ( o )
  return 4;                       // full-round: ( O )
}

const STAGE_SHAPES = {
  1: ['_'],                          // slit — single char, repeated to fill width
  2: ['(', ' ', '_', ' ', ')'],      // half-open arc
  3: ['(', ' ', 'o', ' ', ')'],      // three-quarter
  4: ['(', ' ', 'O', ' ', ')'],      // full-round
};
// Stage 0: no replacement (keep original chars)
// Stages 1: repeat '_' to fill width
// Stages 2-4: center-pad STAGE_SHAPES[stage] to fill width
```

### Anti-Patterns to Avoid

- **Hardcoding row indices:** Eye rows shift by 0–3 lines across frames. Always detect dynamically.
- **String replace on raw text:** Frames contain HTML entities (`&gt;`). Use regex on the raw HTML string, not decoded text.
- **Single-span multi-char replacement:** `<span class="e">( O )</span>` — wrong. Must be per-character: `<span class="e">(</span><span class="e"> </span>...`
- **Treating mixed rows as single-cluster:** Rows 3–5 have two clusters. Replacing all e-spans as one block destroys the gap and shifts the right eye.
- **Using D-06's `&gt;` or `-` detection:** This misses blink frames (84–97, 161–197) which use `_` and `·`. Detect by `class="e"` presence instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing | Custom regex HTML parser | Simple targeted regex on known span structure | The frame format is highly regular — same span pattern every time |
| File enumeration | Custom glob | `fs.readdirSync` + `.filter` + `.sort()` | Built-in, sufficient for 235 files |
| Visible char counting | Unicode-aware char counter | `line.replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').length` | Frames only use ASCII + 3 HTML entities |

---

## Concrete Eye Row Structure (VERIFIED)

This is the ground truth for the planner and implementer.

### Per-Frame Eye Region Facts [VERIFIED: direct frame analysis]

- Every frame has exactly **10 contiguous lines** with `<span class="e">` spans
- The eye region shifts vertically: starts at line 25 (frames 1, 200, 235), line 27 (frame 50), line 28 (frame 100)
- All 235 frames have exactly **48 lines** total

### Per-Row Cluster Structure (row offset 0 = first eye row) [VERIFIED: frame_001 + all 235 frames]

| Row Offset | Left Cluster Width | Right Cluster Width | Gap Between |
|------------|-------------------|---------------------|-------------|
| 0 | 5 | — | — |
| 1 | 8 | — | — |
| 2 | 9 | — | — |
| 3 | 10 | 13 | 13 spaces |
| 4 | 9 | 17 | 9 spaces |
| 5 | 9 | 15 | 11 spaces |
| 6 | 10 | — | — |
| 7 | 10 | — | — |
| 8 | 7 | — | — |
| 9 | 3 | — | — |

**These cluster widths are identical across all 184 frames that have `&gt;`/`-` chars.** [VERIFIED: grep across all 235 frames shows single pattern]

### Existing Eye Character Types by Frame Range [VERIFIED: grep across all 235 frames]

| Frame Range | Current Eye Chars | Stage (D-02) | Script Action |
|-------------|-------------------|--------------|---------------|
| 1–40 | `&gt;` / `-` | 0 (squint) | No change |
| 41–83 | `&gt;` / `-` | 1 (slit) | Replace with `_` |
| 84–85 | `·` | 1 (slit) | Replace with `_` |
| 86–97 | `_` | 1 (slit) | Replace with `_` (already `_`, but script overwrites) |
| 98–130 | `&gt;` / `-` | 2 (half-open) | Replace with `( _ )` |
| 131–160 | `&gt;` / `-` | 3 (three-quarter) | Replace with `( o )` |
| 161–172 | `·` | 3 (three-quarter) | Replace with `( o )` |
| 173–180 | `_` | 3 (three-quarter) | Replace with `( o )` |
| 181–196 | `_` | 4 (full-round) | Replace with `( O )` |
| 197 | `·` | 4 (full-round) | Replace with `( O )` |
| 198–235 | `&gt;` / `-` | 4 (full-round) | Replace with `( O )` |

---

## Common Pitfalls

### Pitfall 1: D-06 Detection Misses Blink Frames
**What goes wrong:** D-06 says detect by searching for `&gt;` or `-` in `class="e"` spans. But frames 84–97 and 161–197 have `_` and `·` chars — no `&gt;` or `-`. Detection returns 0 eye rows, script skips those frames, leaving them with wrong eye chars.
**How to avoid:** Detect eye rows by searching for ANY `<span class="e">` occurrence, not specifically `&gt;` or `-`. The `class="e"` attribute is the reliable marker.
**Warning signs:** After running the script, frames 84–97 and 161–197 still show `_` or `·` instead of the stage-appropriate shape.

### Pitfall 2: Mixed-Row Single-Cluster Replacement
**What goes wrong:** Treating all e-spans on rows 3–5 as one cluster. The 13/9/11-char gaps between left and right eye are plain spaces — not spans. If you replace the entire span sequence as one block, you lose the gap and the right eye shifts left.
**How to avoid:** Split each row into clusters by detecting whitespace gaps between consecutive e-spans. Replace each cluster independently.
**Warning signs:** Right eye appears shifted left in the output frames.

### Pitfall 3: Stage 1 Slit Shape on Wide Rows
**What goes wrong:** Stage 1 replaces each char with `_`. For row offset 4 (right cluster width 17), this produces 17 underscores — a very wide slit. This is correct behavior per D-04, but visually the right eye looks much wider than the left (9 chars). This is an inherent asymmetry in the original character design.
**How to avoid:** Accept the asymmetry — it matches the original `>` vs `-` asymmetry. Do not artificially narrow the right eye.

### Pitfall 4: HTML Entity Double-Encoding
**What goes wrong:** Reading a frame file and then writing it back through a string operation that decodes `&gt;` to `>` and then re-encodes it as `&amp;gt;`.
**How to avoid:** Operate on the raw file bytes as strings. Never decode HTML entities. The replacement chars `(`, ` `, `O`, `)`, `_`, `o` are all safe ASCII — no encoding needed. Only `>` needs `&gt;`, and stage 0 (no change) never touches those chars.

### Pitfall 5: Frame Sort Order
**What goes wrong:** `HomeContent.tsx` line 32–34 constructs `animationFrames` via `Object.keys(terminalData).filter(...).map(...)` with no `.sort()`. `loadAllTerminalFiles` uses `fs.readdir` which returns filesystem order (inode order on macOS, not lexicographic). If the script writes frames in non-lexicographic order, the animation plays out of sequence.
**How to avoid:** Two mitigations:
  1. The script should process frames in sorted order (already natural if using `readdirSync` + `.sort()`)
  2. Add `.sort()` to `HomeContent.tsx` line 33 as a defensive measure (recommended — see discretion section)

---

## Implementation Approach

### Script Structure for `scripts/generate-eye-frames.js`

```javascript
'use strict';
const fs   = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, '../terminals/home/animation_frames');
const BACKUP_DIR = path.join(__dirname, '../terminals/home/animation_frames_backup');

// 1. Backup original frames (first run only)
// 2. Read all frame files, sorted lexicographically
// 3. For each frame:
//    a. Parse frame number from filename
//    b. Determine stage (0-4) from frame number
//    c. If stage 0: skip (no change)
//    d. Find 10 eye rows (lines with class="e")
//    e. For each eye row:
//       - Split into clusters
//       - Build replacement for each cluster
//       - Reconstruct line with replacements
//    f. Write modified frame back to file
// 4. Run validator on all frames
```

### Backup Strategy

Create `terminals/home/animation_frames_backup/` before first modification. Copy all 235 `.txt` files. The script checks if backup exists and skips if already present (idempotency). Git history is a fallback but local backup is faster to diff.

```javascript
function ensureBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const files = fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith('.txt'));
    for (const file of files) {
      fs.copyFileSync(path.join(FRAMES_DIR, file), path.join(BACKUP_DIR, file));
    }
    console.log(`Backed up ${files.length} frames to ${BACKUP_DIR}`);
  }
}
```

### Validation Approach

Run validation as a second pass after all frames are written. For each frame:

1. Line count: `lines.length === 48`
2. Visible char count per line: compare against backup (or pre-modification snapshot)
3. Span integrity: `/<span[^>]*>/.test(line)` — every open tag has a close tag
4. No raw angle brackets: no `>` or `<` outside of `<span...>` or `</span>` patterns
5. Eye span class: all e-spans have `class="e"`

```javascript
function validateFrame(originalLines, modifiedLines, frameFile) {
  const errors = [];
  if (originalLines.length !== modifiedLines.length) {
    errors.push(`Line count changed: ${originalLines.length} -> ${modifiedLines.length}`);
  }
  for (let i = 0; i < originalLines.length; i++) {
    const origVisible = stripHtml(originalLines[i]);
    const modVisible  = stripHtml(modifiedLines[i]);
    if (origVisible.length !== modVisible.length) {
      errors.push(`Line ${i+1} visible length changed: ${origVisible.length} -> ${modVisible.length}`);
    }
  }
  // Check span integrity, raw angle brackets, class="e" on eye spans
  // ...
  return errors;
}
```

### Test Approach

1. Run script on frames 41–45 only (first slit stage) — verify `_` replacement
2. Run script on frames 81–85 only (half-open, includes blink frame 84) — verify `( _ )` and blink frame handling
3. Run script on frames 181–185 only (full-round, includes blink frames 181–196) — verify `( O )`
4. Visual check: open 3 consecutive frames in a browser side-by-side
5. Run full 235 frames
6. Run `next build` — verify exit 0

---

## `.sort()` Recommendation for HomeContent.tsx

**Recommendation: YES, add `.sort()`.** [VERIFIED: `terminal-data.tsx` uses `fs.readdir` with no sort guarantee]

`HomeContent.tsx` line 32–34:
```typescript
// Current (no sort):
const animationFrames = Object.keys(terminalData)
  .filter((k) => k.startsWith("home/animation_frames"))
  .map((k) => terminalData[k]);

// Recommended (with sort):
const animationFrames = Object.keys(terminalData)
  .filter((k) => k.startsWith("home/animation_frames"))
  .sort()
  .map((k) => terminalData[k]);
```

This is a one-line defensive change. The script writes frames sequentially, so sort order should be correct, but `.sort()` makes it filesystem-order-independent. Low risk, high value.

---

## Padding Strategy Recommendation

**Recommendation: center-pad with spaces.**

For shapes shorter than the cluster width (e.g., `( O )` = 5 chars in a 9-char cluster):
- Center-pad: `  ( O )  ` — eye appears centered in its original bounding box
- Right-pad: `( O )    ` — eye appears left-aligned, looks unnatural

Center-padding preserves the visual center of the eye shape, which matches how the original `>` and `-` chars were distributed (roughly centered in their respective regions).

For the slit stage (stage 1), repeat `_` to fill the full width — no padding needed.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `generate-eye-frames.js` | ✓ | v25.9.0 | — |
| `fs` (built-in) | File I/O | ✓ | built-in | — |
| `path` (built-in) | Path construction | ✓ | built-in | — |
| `next build` | EYE-11 validation | ✓ | ^16.1.6 | — |

No missing dependencies.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Center-padding is visually preferable to right-padding | Padding Strategy | Eye shape appears off-center — easy to fix by changing pad direction |
| A2 | `( _ )`, `( o )`, `( O )` are the best ASCII shapes for the 3 open stages | Stage Shapes | Eye shapes look wrong — adjust shape arrays in script |
| A3 | The `animation_frames_backup` directory should NOT be committed to git | Backup Strategy | Backup gets committed, adding 235 files to repo — add to .gitignore |

**All structural claims (row counts, cluster widths, gap sizes, frame ranges) are VERIFIED by direct analysis.**

---

## Open Questions (RESOLVED)

1. **Should `animation_frames_backup/` be gitignored?**
   - RESOLVED: Yes — add `terminals/home/animation_frames_backup/` to `.gitignore`. Git history already preserves originals; the backup dir is a local working copy only. Plan 02 Task 2 implements this.

2. **Stage 4 shape for narrow rows (width 3, 5)**
   - RESOLVED: Use symmetric center-trim — `( O )` (5 chars) trimmed to 3 = ` O ` (chars at indices 1–3). `buildReplacement` uses `shape.slice(trimLeft, trimLeft + width)` where `trimLeft = Math.floor(excess/2)` = 1, yielding ` O `. Plan 01 Task 1 implements this via `buildReplacement`.

---

## Sources

### Primary (HIGH confidence)
- Direct frame analysis: `terminals/home/animation_frames/frame_001.txt`, `frame_050.txt`, `frame_090.txt`, `frame_100.txt`, `frame_161.txt`, `frame_173.txt`, `frame_197.txt` — eye row structure, cluster widths, gap sizes
- Grep across all 235 frames: confirmed single eye pattern, 10 rows per frame, 48 lines per frame
- `src/app/HomeContent.tsx` — confirmed no `.sort()` on animationFrames
- `src/app/terminal-data.tsx` — confirmed `fs.readdir` with no sort
- `scripts/generate-frames.js` — confirmed `canvas` dependency (not needed for new script)
- `.planning/config.json` — confirmed `nyquist_validation: false`

### Secondary (MEDIUM confidence)
- `.planning/research/PITFALLS.md` — 7 pitfalls, all cross-verified against frame analysis
- `.planning/research/ARCHITECTURE.md` — Option A/C analysis, confirmed correct
- `.planning/phases/06-eye-animation-enhancement/06-CONTEXT.md` — locked decisions

---

## Metadata

**Confidence breakdown:**
- Eye row structure: HIGH — verified by direct analysis of all 235 frames
- Cluster widths and gaps: HIGH — verified by grep across all 235 frames
- Stage schedule: HIGH — locked in D-02
- Padding strategy: MEDIUM — center-pad is assumed best, easy to change
- Sort recommendation: HIGH — verified `terminal-data.tsx` has no sort

**Research date:** 2026-04-18
**Valid until:** Stable — frame files don't change unless `generate-frames.js` is re-run
