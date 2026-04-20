'use strict';
const fs   = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, '../terminals/home/animation_frames');
const BACKUP_DIR = path.join(__dirname, '../terminals/home/animation_frames_backup');

// Stage shapes: stage 1 uses null (repeat '_'), stages 2-4 use char arrays
const STAGE_SHAPES = {
  1: null,                              // slit — repeat '_' to fill width
  2: ['(', ' ', '_', ' ', ')'],         // half-open
  3: ['(', ' ', 'o', ' ', ')'],         // three-quarter
  4: ['(', ' ', 'O', ' ', ')'],         // full-round
};

/**
 * Map frame number (1-indexed) to eye stage (0-4).
 * D-02 locked decision.
 */
function getStage(frameNum) {
  if (frameNum <= 40)  return 0; // squint — no change
  if (frameNum <= 80)  return 1; // slit: _
  if (frameNum <= 130) return 2; // half-open: ( _ )
  if (frameNum <= 180) return 3; // three-quarter: ( o )
  return 4;                       // full-round: ( O )
}

/**
 * Ensure backup directory exists. Idempotent — skips if already present.
 */
function ensureBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const files = fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith('.txt'));
    for (const file of files) {
      fs.copyFileSync(
        path.join(FRAMES_DIR, file),
        path.join(BACKUP_DIR, file)
      );
    }
    console.log(`Backed up ${files.length} frames to ${BACKUP_DIR}`);
  }
}

/**
 * Find the 10 eye rows in a frame by searching for any <span class="e">.
 * Throws if count is not exactly 10.
 */
function findEyeRows(lines) {
  const eyeRows = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<span class="e">')) {
      eyeRows.push(i);
    }
  }
  if (eyeRows.length !== 10) {
    throw new Error(`Expected 10 eye rows, found ${eyeRows.length}`);
  }
  return eyeRows;
}

/**
 * Split a line into clusters of consecutive <span class="e"> spans.
 * A gap (any non-empty string between spans) starts a new cluster.
 * Returns array of {start, end, spanCount}.
 */
function splitIntoClusters(line) {
  const spanPattern = /<span class="e">[^<]+<\/span>/g;
  const spans = [...line.matchAll(spanPattern)];

  if (spans.length === 0) return [];

  const clusters = [];
  let currentCluster = { start: spans[0].index, spans: [spans[0]] };

  for (let i = 1; i < spans.length; i++) {
    const prevEnd = spans[i - 1].index + spans[i - 1][0].length;
    const gap = line.slice(prevEnd, spans[i].index);
    if (gap.length > 0) {
      currentCluster.end = prevEnd;
      currentCluster.spanCount = currentCluster.spans.length;
      clusters.push(currentCluster);
      currentCluster = { start: spans[i].index, spans: [spans[i]] };
    } else {
      currentCluster.spans.push(spans[i]);
    }
  }
  const lastSpan = spans[spans.length - 1];
  currentCluster.end = lastSpan.index + lastSpan[0].length;
  currentCluster.spanCount = currentCluster.spans.length;
  clusters.push(currentCluster);

  return clusters;
}

/**
 * Build a replacement HTML string of exactly `width` <span class="e"> chars.
 * Each stage fills the full cluster width with a single repeated character:
 *   1 → '_____'  (slit, filled)
 *   2 → 'o   o'  (half-open, hollow outline with · edge)
 *   3 → 'o   o'  (three-quarter, hollow outline with o edge)
 *   4 → 'O   O'  (full-round, hollow outline with O edge)
 * Stages 2-4 use hollow outlines: edge char at both ends, spaces inside.
 */
function buildReplacement(width, stage) {
  const STAGE_CHAR = { 1: '_', 2: '\xB7', 3: 'o', 4: 'O' };
  let chars;
  if (stage === 1) {
    chars = Array(width).fill('_');
  } else {
    const c = STAGE_CHAR[stage];
    if (width <= 2) {
      chars = Array(width).fill(c);
    } else {
      // Hollow outline: edge char at both ends, spaces inside
      chars = Array(width).fill(' ');
      chars[0] = c;
      chars[width - 1] = c;
    }
  }

  return chars.map(c => {
    const encoded = c === '>' ? '&gt;' : c === '<' ? '&lt;' : c === '&' ? '&amp;' : c;
    return `<span class="e">${encoded}</span>`;
  }).join('');
}

/**
 * Process a single frame file: detect eye rows, apply stage replacement, write back.
 * Returns {originalLines, modifiedLines} for stage > 0, or null for stage 0.
 */
function processFrame(filePath, frameNum) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');
  const originalLines = [...lines];

  const stage = getStage(frameNum);
  if (stage === 0) return null;

  const eyeRowIndices = findEyeRows(lines);

  for (const rowIdx of eyeRowIndices) {
    const clusters = splitIntoClusters(lines[rowIdx]);
    if (clusters.length === 0) continue;

    // Replace from right to left to preserve earlier indices
    for (let ci = clusters.length - 1; ci >= 0; ci--) {
      const cluster = clusters[ci];
      const replacement = buildReplacement(cluster.spanCount, stage);
      lines[rowIdx] =
        lines[rowIdx].slice(0, cluster.start) +
        replacement +
        lines[rowIdx].slice(cluster.end);
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return { originalLines, modifiedLines: lines };
}

/**
 * Compute visible character length of an HTML line by stripping tags and decoding entities.
 */
function visibleLength(line) {
  return line
    .replace(/<[^>]+>/g, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .length;
}

/**
 * Validate that a modified frame preserves structural integrity.
 * Returns array of error strings (empty = pass).
 */
function validateFrame(originalLines, modifiedLines, frameFile) {
  const errors = [];

  // 1. Line count unchanged
  if (originalLines.length !== modifiedLines.length) {
    errors.push(`${frameFile}: line count changed ${originalLines.length} -> ${modifiedLines.length}`);
    return errors; // can't compare lines if counts differ
  }

  for (let i = 0; i < modifiedLines.length; i++) {
    const line = modifiedLines[i];

    // 2. Visible length unchanged
    const origVis = visibleLength(originalLines[i]);
    const modVis  = visibleLength(line);
    if (origVis !== modVis) {
      errors.push(`${frameFile} line ${i + 1}: visible length changed ${origVis} -> ${modVis}`);
    }

    // 3. All spans closed
    const openCount  = (line.match(/<span/g)  || []).length;
    const closeCount = (line.match(/<\/span>/g) || []).length;
    if (openCount !== closeCount) {
      errors.push(`${frameFile} line ${i + 1}: unclosed spans (${openCount} open, ${closeCount} close)`);
    }

    // 4. No raw angle brackets outside tag syntax
    const stripped = line
      .replace(/<[^>]+>/g, '')
      .replace(/&gt;/g, '')
      .replace(/&lt;/g, '')
      .replace(/&amp;/g, '');
    if (stripped.includes('<') || stripped.includes('>')) {
      errors.push(`${frameFile} line ${i + 1}: raw angle bracket found outside tag syntax`);
    }

    // 5. Eye spans have class="e" — only check spans within eye clusters
    // (Lines may also contain class="o" / class="h" spans which are legitimate)
    if (originalLines[i].includes('<span class="e">')) {
      const eyeSpanPattern = /<span class="e">([^<]+)<\/span>/g;
      for (const m of line.matchAll(eyeSpanPattern)) {
        if (m[1].includes('<') || m[1].includes('>')) {
          errors.push(`${frameFile} line ${i + 1}: raw angle bracket inside eye span`);
        }
      }
    }
  }

  return errors;
}

/**
 * Main entry point.
 */
function main() {
  ensureBackup();

  const files = fs.readdirSync(FRAMES_DIR)
    .filter(f => f.endsWith('.txt'))
    .sort();

  if (files.length !== 235) {
    console.warn(`WARNING: expected 235 frames, found ${files.length}`);
  }

  const allErrors = [];

  for (const file of files) {
    const match = file.match(/frame_(\d+)\.txt/);
    if (!match) continue;
    const frameNum = parseInt(match[1], 10);
    const filePath = path.join(FRAMES_DIR, file);

    const result = processFrame(filePath, frameNum);
    if (result) {
      const errors = validateFrame(result.originalLines, result.modifiedLines, file);
      if (errors.length > 0) {
        allErrors.push(...errors);
      }
    }

    process.stdout.write(`\r  ${frameNum}/235`);
  }

  console.log('');

  if (allErrors.length > 0) {
    for (const err of allErrors) {
      console.error('ERROR:', err);
    }
    process.exit(1);
  }

  console.log('Done. All frames validated successfully.');
}

main();
