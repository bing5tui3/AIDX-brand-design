'use strict';
const fs   = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, '../terminals/home/animation_frames');
const BACKUP_DIR = path.join(__dirname, '../terminals/home/animation_frames_backup');

function getStage(frameNum) {
  if (frameNum <= 40)  return 0;
  if (frameNum <= 80)  return 1;
  if (frameNum <= 130) return 2;
  if (frameNum <= 180) return 3;
  return 4;
}

const STAGE_CHAR = { 1: '_', 2: '\xB7', 3: 'o', 4: '@' };

// @ symbol pattern (10 wide, 10 tall). '#' = eye char, ' ' = empty.
const AT_PATTERN = [
  '  @@@@@@  ',
  ' @      @ ',
  '@  @@@@  @',
  '@ @    @ @',
  '@ @   @@ @',
  '@ @@@@   @',
  '@        @',
  ' @        ',
  '  @@@@@@  ',
  '   @@@@   ',
];

// Absolute column ranges for each eye's @ pattern
const LEFT_EYE_COL  = 30;  // cols 30-39
const RIGHT_EYE_COL = 55;  // cols 55-64
const PATTERN_WIDTH  = 10;

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

function findEyeRows(lines) {
  const eyeRows = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<span class="e">')) eyeRows.push(i);
  }
  if (eyeRows.length !== 10) throw new Error(`Expected 10 eye rows, found ${eyeRows.length}`);
  return eyeRows;
}

/**
 * Parse a line into segments: [{type:'plain'|'e'|'h'|'o'|..., col, width, html}]
 * Each segment maps to a range of visible columns.
 */
function parseLine(line) {
  const segments = [];
  const tagRe = /<span class="([^"]+)">([^<]+)<\/span>/g;
  let col = 0;
  let lastIdx = 0;
  let m;

  while ((m = tagRe.exec(line)) !== null) {
    // Plain text before this span
    const before = line.slice(lastIdx, m.index);
    if (before.length > 0) {
      const text = decodeEntities(before.replace(/<[^>]+>/g, ''));
      if (text.length > 0) {
        segments.push({ type: 'plain', col, width: text.length, html: before });
        col += text.length;
      }
    }
    const cls = m[1];
    const raw = m[2];
    const text = decodeEntities(raw);
    segments.push({ type: cls, col, width: text.length, html: m[0] });
    col += text.length;
    lastIdx = m.index + m[0].length;
  }

  // Trailing content
  const after = line.slice(lastIdx);
  if (after.length > 0) {
    const text = decodeEntities(after.replace(/<[^>]+>/g, ''));
    if (text.length > 0) {
      segments.push({ type: 'plain', col, width: text.length, html: after });
    }
  }
  return segments;
}

function decodeEntities(s) {
  return s.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
}

function encodeChar(ch) {
  if (ch === '>') return '&gt;';
  if (ch === '<') return '&lt;';
  if (ch === '&') return '&amp;';
  return ch;
}

/**
 * Compute which absolute columns should have class="e" spans for a given stage and eye row.
 * Returns a Map<col, char> for columns that should be eye-colored.
 */
function getEyeColumns(stage, eyeRowIndex) {
  const c = STAGE_CHAR[stage];
  const eyeCols = new Map();

  if (stage === 1) {
    // Slit: no shape change, handled separately
    return eyeCols;
  }

  // Left eye @ pattern
  const row = AT_PATTERN[eyeRowIndex];
  for (let j = 0; j < PATTERN_WIDTH; j++) {
    if (row[j] !== ' ') {
      eyeCols.set(LEFT_EYE_COL + j, c);
    }
  }

  // Right eye @ pattern (same shape)
  for (let j = 0; j < PATTERN_WIDTH; j++) {
    if (row[j] !== ' ') {
      eyeCols.set(RIGHT_EYE_COL + j, c);
    }
  }

  return eyeCols;
}

/**
 * Rebuild an eye row's HTML so class="e" spans appear at the columns
 * specified by eyeCols, and all other eye spans become plain spaces.
 */
function rebuildLine(segments, eyeCols) {
  let html = '';

  for (const seg of segments) {
    if (seg.type === 'e') {
      // Replace each char in this eye segment
      for (let i = 0; i < seg.width; i++) {
        const col = seg.col + i;
        if (eyeCols.has(col)) {
          html += `<span class="e">${encodeChar(eyeCols.get(col))}</span>`;
        } else {
          html += ' ';
        }
      }
    } else if (seg.type === 'plain') {
      // Check if any columns in this plain segment should become eye spans
      let plainHtml = '';
      let consumed = 0;
      for (let i = 0; i < seg.width; i++) {
        const col = seg.col + i;
        if (eyeCols.has(col)) {
          plainHtml += `<span class="e">${encodeChar(eyeCols.get(col))}</span>`;
        } else {
          plainHtml += ' ';
        }
        consumed++;
      }
      html += plainHtml;
    } else {
      // Non-eye spans (class="h", "o", etc.) — keep as-is
      html += seg.html;
    }
  }

  return html;
}

/**
 * For stage 1 (slit), just replace eye span chars with '_' (no shape change).
 */
function rebuildLineSlit(segments) {
  let html = '';
  for (const seg of segments) {
    if (seg.type === 'e') {
      for (let i = 0; i < seg.width; i++) {
        html += '<span class="e">_</span>';
      }
    } else {
      html += seg.html;
    }
  }
  return html;
}

function processFrame(filePath, frameNum) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');
  const originalLines = [...lines];

  const stage = getStage(frameNum);
  if (stage === 0) return null;

  const eyeRowIndices = findEyeRows(lines);

  for (let eyeRowIndex = 0; eyeRowIndex < eyeRowIndices.length; eyeRowIndex++) {
    const rowIdx = eyeRowIndices[eyeRowIndex];
    const segments = parseLine(lines[rowIdx]);

    if (stage === 1) {
      lines[rowIdx] = rebuildLineSlit(segments);
    } else {
      const eyeCols = getEyeColumns(stage, eyeRowIndex);
      lines[rowIdx] = rebuildLine(segments, eyeCols);
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return { originalLines, modifiedLines: lines };
}

function visibleLength(line) {
  return line.replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').length;
}

function validateFrame(originalLines, modifiedLines, frameFile) {
  const errors = [];
  if (originalLines.length !== modifiedLines.length) {
    errors.push(`${frameFile}: line count changed`);
    return errors;
  }
  for (let i = 0; i < modifiedLines.length; i++) {
    const origVis = visibleLength(originalLines[i]);
    const modVis  = visibleLength(modifiedLines[i]);
    if (origVis !== modVis) {
      errors.push(`${frameFile} line ${i+1}: visible length ${origVis} -> ${modVis}`);
    }
    const openCount  = (modifiedLines[i].match(/<span/g) || []).length;
    const closeCount = (modifiedLines[i].match(/<\/span>/g) || []).length;
    if (openCount !== closeCount) {
      errors.push(`${frameFile} line ${i+1}: unclosed spans`);
    }
  }
  return errors;
}

function main() {
  ensureBackup();
  const files = fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith('.txt')).sort();
  if (files.length !== 235) console.warn(`WARNING: expected 235 frames, found ${files.length}`);

  const allErrors = [];
  for (const file of files) {
    const match = file.match(/frame_(\d+)\.txt/);
    if (!match) continue;
    const frameNum = parseInt(match[1], 10);
    const result = processFrame(path.join(FRAMES_DIR, file), frameNum);
    if (result) {
      allErrors.push(...validateFrame(result.originalLines, result.modifiedLines, file));
    }
    process.stdout.write(`\r  ${frameNum}/235`);
  }
  console.log('');
  if (allErrors.length > 0) {
    for (const err of allErrors) console.error('ERROR:', err);
    process.exit(1);
  }
  console.log('Done. All frames validated successfully.');
}

main();
