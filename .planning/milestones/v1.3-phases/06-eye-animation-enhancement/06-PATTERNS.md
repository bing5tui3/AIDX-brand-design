# Phase 6: Eye Animation Enhancement - Pattern Map

**Mapped:** 2026-04-18
**Files analyzed:** 3
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `scripts/generate-eye-frames.js` | utility/script | file-I/O + transform | `scripts/generate-frames.js` | role-match |
| `terminals/home/animation_frames/frame_*.txt` | static asset | transform (batch) | `terminals/home/animation_frames/frame_001.txt` | exact |
| `src/app/HomeContent.tsx` | component | request-response | `src/app/HomeContent.tsx` (self) | exact |

---

## Pattern Assignments

### `scripts/generate-eye-frames.js` (utility/script, file-I/O + transform)

**Analog:** `scripts/generate-frames.js`

**Imports pattern** (lines 1-14):
```javascript
'use strict';
const fs   = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, '../terminals/home/animation_frames');
const BACKUP_DIR = path.join(__dirname, '../terminals/home/animation_frames_backup');
```

**Core file enumeration pattern** (lines 269-277 of generate-frames.js):
```javascript
// generate-frames.js writes frames in a sorted loop — copy this pattern for reading:
for (let fi = 1; fi <= 235; fi++) {
  const name = `frame_${String(fi).padStart(3, '0')}.txt`;
  fs.writeFileSync(path.join(outDir, name), content, 'utf8');
}

// For generate-eye-frames.js, enumerate with readdir + sort instead:
const files = fs.readdirSync(FRAMES_DIR)
  .filter(f => f.endsWith('.txt'))
  .sort(); // lexicographic = frame_001 ... frame_235
```

**Eye character mapping pattern** (lines 155-159 of generate-frames.js):
```javascript
// Original getEyeChars — maps eyeState float to character pair
function getEyeChars(eyeState) {
  if (eyeState < 0.3) return { gt: '&gt;', dash: '-' };
  if (eyeState < 0.7) return { gt: '\u00b7',  dash: '\u00b7' };
  return                     { gt: '_',    dash: '_' };
}

// New script uses stage number instead of eyeState float — same concept, different input:
const STAGE_SHAPES = {
  1: ['_'],
  2: ['(', ' ', '_', ' ', ')'],
  3: ['(', ' ', 'o', ' ', ')'],
  4: ['(', ' ', 'O', ' ', ')'],
};
function getStage(frameNum) {
  if (frameNum <= 40)  return 0; // squint — no change
  if (frameNum <= 80)  return 1; // slit: _
  if (frameNum <= 130) return 2; // half-open: ( _ )
  if (frameNum <= 180) return 3; // three-quarter: ( o )
  return 4;                       // full-round: ( O )
}
```

**Per-character span emission pattern** (lines 228-229 of generate-frames.js):
```javascript
// generate-frames.js emits one span per character — copy this exactly:
html += `<span class="e">${eyeChars.gt}</span>`;
html += `<span class="e">${eyeChars.dash}</span>`;

// generate-eye-frames.js builds replacement strings the same way:
function buildReplacement(width, shape) {
  let chars;
  if (shape.length === 1) {
    // Stage 1 slit: repeat single char to fill width
    chars = Array(width).fill(shape[0]);
  } else if (shape.length === width) {
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

**Backup pattern** (from RESEARCH.md implementation approach):
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

**Progress logging pattern** (line 276 of generate-frames.js):
```javascript
process.stdout.write(`\r  ${fi}/235`);
// After loop:
console.log('\n完成！');
```

---

### `terminals/home/animation_frames/frame_*.txt` (static asset, batch transform)

**Analog:** `terminals/home/animation_frames/frame_001.txt`

**Verified frame structure** (frame_001.txt, lines 1-48):
- 48 lines total, UTF-8, no trailing newline after line 48
- Lines 1-2: blank (spaces only, 90 chars wide)
- Lines 25-34: eye region (10 contiguous lines with `<span class="e">`)
- Eye region shifts vertically by 0-3 rows across frames — always detect dynamically

**Eye span format** (frame_001.txt, line 25):
```html
<span class="e">&gt;</span><span class="e">&gt;</span><span class="e">&gt;</span><span class="e">&gt;</span><span class="e">&gt;</span>
```
One `<span class="e">` per character. `>` encoded as `&gt;`. No multi-char spans.

**Mixed-row format** (frame_001.txt, line 28 — left + right clusters):
```html
<span class="e">&gt;</span>...(10 spans)...             <span class="e">-</span>...(13 spans)...
```
Left cluster (10 `&gt;` spans) + 13 plain spaces + right cluster (13 `-` spans).

**Per-row cluster widths** (verified across all 235 frames):
| Row offset | Left width | Right width | Gap |
|------------|-----------|-------------|-----|
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

**Eye row detection pattern** (must detect by `class="e"`, not by `&gt;`/`-`):
```javascript
function findEyeRows(lines) {
  const eyeRows = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<span class="e">')) {
      eyeRows.push(i);
    }
  }
  if (eyeRows.length !== 10) {
    throw new Error(`Expected 10 eye rows, found ${eyeRows.length} in frame`);
  }
  return eyeRows;
}
```

**Cluster splitting pattern** (split on whitespace gap between consecutive e-spans):
```javascript
function splitIntoClusters(line) {
  const spanPattern = /<span class="e">[^<]+<\/span>/g;
  const spans = [...line.matchAll(spanPattern)];
  if (spans.length === 0) return [];

  const clusters = [];
  let currentCluster = { start: spans[0].index, spans: [spans[0]] };

  for (let i = 1; i < spans.length; i++) {
    const gap = line.slice(spans[i-1].index + spans[i-1][0].length, spans[i].index);
    if (gap.length > 0) {
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
  return clusters;
}
```

---

### `src/app/HomeContent.tsx` (component, optional 1-line change)

**Analog:** `src/app/HomeContent.tsx` (self-modification)

**Current pattern** (lines 32-34):
```typescript
const animationFrames = Object.keys(terminalData)
  .filter((k) => k.startsWith("home/animation_frames"))
  .map((k) => terminalData[k]);
```

**Recommended change** — add `.sort()` between `.filter()` and `.map()`:
```typescript
const animationFrames = Object.keys(terminalData)
  .filter((k) => k.startsWith("home/animation_frames"))
  .sort()
  .map((k) => terminalData[k]);
```
This is a one-line defensive change. `terminal-data.tsx` uses `fs.readdir` with no sort guarantee; `.sort()` makes frame order filesystem-independent.

---

## Shared Patterns

### File I/O (read-modify-write)
**Source:** `scripts/generate-frames.js` lines 274-276
**Apply to:** `scripts/generate-eye-frames.js`
```javascript
// Read
const content = fs.readFileSync(path.join(FRAMES_DIR, file), 'utf8');
const lines = content.split('\n');
// ... modify lines ...
// Write (overwrite in place)
fs.writeFileSync(path.join(FRAMES_DIR, file), lines.join('\n'), 'utf8');
```

### HTML Entity Safety
**Source:** `scripts/generate-frames.js` line 228
**Apply to:** All span-building code in `generate-eye-frames.js`
```javascript
// CORRECT — emit HTML entity, not raw char:
`<span class="e">&gt;</span>`
// WRONG — raw > will break HTML rendering:
`<span class="e">></span>`
// Safe replacement chars (_, o, O, (, ), space) need no encoding.
// Only > needs &gt; — and stage 0 never touches those chars.
```

### Visible Length Validation
**Source:** RESEARCH.md "Don't Hand-Roll" section
**Apply to:** Validator in `generate-eye-frames.js`
```javascript
function stripHtml(line) {
  return line
    .replace(/<[^>]+>/g, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}
// Use: stripHtml(line).length must equal stripHtml(originalLine).length
```

---

## No Analog Found

All three files have analogs. No entries in this section.

---

## Metadata

**Analog search scope:** `scripts/`, `terminals/home/animation_frames/`, `src/app/`
**Files scanned:** 4 (generate-frames.js, frame_001.txt, HomeContent.tsx, 06-RESEARCH.md)
**Pattern extraction date:** 2026-04-18
