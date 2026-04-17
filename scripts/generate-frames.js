/**
 * generate-frames.js
 * 为 AIDX avatar 生成 235 帧 ASCII 动画帧文件
 * 关键帧 + easeInOut 插值，对齐 Ghostty 帧号结构
 * 效果：静态正脸 + 眼镜特效（眨眼）+ 浮动
 *
 * 运行：node generate-frames.js
 */

'use strict';
const { createCanvas } = require('canvas');
const fs   = require('fs');
const path = require('path');

// ─── 网格尺寸 ────────────────────────────────────────────────────────────────
const COLS = 90, ROWS = 48;
const svgSize = 192;
const scale   = svgSize / 48; // 4

// ─── 最小 SVG path 解析器 ────────────────────────────────────────────────────
function drawSvgPath(ctx, d) {
  const tokens = d.match(/[MmCcLlZz]|[-+]?[0-9]*\.?[0-9]+/g) || [];
  let i = 0, cx = 0, cy = 0;
  const num = () => parseFloat(tokens[i++]);
  ctx.beginPath();
  while (i < tokens.length) {
    const cmd = tokens[i++];
    switch (cmd) {
      case 'M': cx = num(); cy = num(); ctx.moveTo(cx, cy); break;
      case 'm': cx += num(); cy += num(); ctx.moveTo(cx, cy); break;
      case 'C': {
        const x1=num(),y1=num(),x2=num(),y2=num(),x=num(),y=num();
        ctx.bezierCurveTo(x1,y1,x2,y2,x,y); cx=x; cy=y; break;
      }
      case 'c': {
        const x1=cx+num(),y1=cy+num(),x2=cx+num(),y2=cy+num(),x=cx+num(),y=cy+num();
        ctx.bezierCurveTo(x1,y1,x2,y2,x,y); cx=x; cy=y; break;
      }
      case 'L': cx=num(); cy=num(); ctx.lineTo(cx,cy); break;
      case 'l': cx+=num(); cy+=num(); ctx.lineTo(cx,cy); break;
      case 'Z': case 'z': ctx.closePath(); break;
    }
  }
}

// ─── SVG 路径 ────────────────────────────────────────────────────────────────
const hairPath  = 'M 24 4 C 40 4 44 12 44 22 C 44 28 43 33 42 37 C 41 41 39 42 36 40 C 33 38 31 34 30 28 C 29 22 31 18 36 18 C 34 14 30 16 24 16 C 18 16 14 14 12 18 C 17 18 19 22 18 28 C 17 34 15 38 12 40 C 9 42 7 41 6 37 C 5 33 4 28 4 22 C 4 12 8 4 24 4 Z';
const crownPath = 'M 24 4 C 40 4 44 12 44 22 C 38 20 32 16 24 16 C 16 16 10 20 4 22 C 4 12 8 4 24 4 Z';
const bangPath  = 'M 14 22 C 15 16 19 13 24 13 C 29 13 33 15 35 19 C 31 18 27 17.5 24 18 C 20 18.5 16 20 14 22 Z';

// ─── 关键帧定义（对齐 Ghostty 帧号结构）────────────────────────────────────
const PI = Math.PI;
const keyframes = [
  { frame: 1,   floatOffset: 0, eyeState: 0,   lightAngle: 0            },
  { frame: 47,  floatOffset: 2, eyeState: 0,   lightAngle: PI / 2       },
  { frame: 80,  floatOffset: 4, eyeState: 0,   lightAngle: PI           },
  { frame: 88,  floatOffset: 3, eyeState: 0.9, lightAngle: PI           },
  { frame: 94,  floatOffset: 3, eyeState: 1,   lightAngle: PI + 0.2     },
  { frame: 100, floatOffset: 3, eyeState: 0,   lightAngle: PI + 0.4     },
  { frame: 141, floatOffset: 2, eyeState: 0,   lightAngle: 3 * PI / 2   },
  { frame: 188, floatOffset: 0, eyeState: 0.9, lightAngle: 2*PI - 0.3   },
  { frame: 194, floatOffset: 0, eyeState: 1,   lightAngle: 2*PI - 0.1   },
  { frame: 200, floatOffset: 0, eyeState: 0,   lightAngle: 2 * PI       },
  { frame: 235, floatOffset: 0, eyeState: 0,   lightAngle: 2 * PI       },
];

// ─── 插值 ────────────────────────────────────────────────────────────────────
function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function lerp(a, b, t) { return a + (b - a) * t; }

function getParamsAtFrame(fi) {
  for (let i = 0; i < keyframes.length - 1; i++) {
    const kf1 = keyframes[i], kf2 = keyframes[i + 1];
    if (fi >= kf1.frame && fi <= kf2.frame) {
      const span = kf2.frame - kf1.frame;
      const t = easeInOut(span === 0 ? 0 : (fi - kf1.frame) / span);
      return {
        floatOffset: lerp(kf1.floatOffset, kf2.floatOffset, t),
        eyeState:    lerp(kf1.eyeState,    kf2.eyeState,    t),
        lightAngle:  lerp(kf1.lightAngle,  kf2.lightAngle,  t),
      };
    }
  }
  const last = keyframes[keyframes.length - 1];
  return { floatOffset: last.floatOffset, eyeState: last.eyeState, lightAngle: last.lightAngle };
}

// ─── Canvas 渲染工具 ─────────────────────────────────────────────────────────
function makeCtx() {
  const c = createCanvas(svgSize, svgSize);
  const ctx = c.getContext('2d');
  ctx.scale(scale, scale);
  return ctx;
}

function renderLayer(pathD, fillColor) {
  const ctx = makeCtx();
  ctx.fillStyle = fillColor;
  drawSvgPath(ctx, pathD);
  ctx.fill();
  return ctx.getImageData(0, 0, svgSize, svgSize);
}

function renderEllipse(cx, cy, rx, ry, fillColor) {
  const ctx = makeCtx();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  return ctx.getImageData(0, 0, svgSize, svgSize);
}

function renderGlow() {
  const ctx = makeCtx();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  drawSvgPath(ctx, hairPath);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(24, 24, 14, 15, 0, 0, Math.PI * 2);
  ctx.stroke();
  return ctx.getImageData(0, 0, svgSize, svgSize);
}

function renderEyeGT() {
  const ctx = makeCtx();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(16, 25); ctx.lineTo(21, 28.5); ctx.lineTo(16, 32);
  ctx.stroke();
  return ctx.getImageData(0, 0, svgSize, svgSize);
}

function renderEyeDash() {
  const ctx = makeCtx();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(29, 28.5); ctx.lineTo(35, 28.5);
  ctx.stroke();
  return ctx.getImageData(0, 0, svgSize, svgSize);
}

// ─── 静态图层 ────────────────────────────────────────────────────────────────
const faceImg      = renderEllipse(24, 24, 14, 15, '#fff');
const eyeGTImg     = renderEyeGT();
const eyeDashImg   = renderEyeDash();

// ─── 眨眼字符 ────────────────────────────────────────────────────────────────
function getEyeChars(eyeState) {
  if (eyeState < 0.3) return { gt: '&gt;', dash: '-' };
  if (eyeState < 0.7) return { gt: '\u00b7',  dash: '\u00b7' };
  return                     { gt: '_',    dash: '_' };
}

// ─── 字符亮度映射 ────────────────────────────────────────────────────────────
const hairRamp = ' .\u00b7:+=*%$@#';
const glowRamp = ' \u00b7.+=*%$@#';
const FIXED_LIGHT = PI / 6;
const AVATAR_CX = 24, AVATAR_CY = 24;

function generateFrame(params) {
  const { floatOffset, eyeState, lightAngle } = params;
  const floatRows = Math.round(floatOffset);

  const hairImg  = renderLayer(hairPath,  '#fff');
  const crownImg = renderLayer(crownPath, '#fff');
  const bangImg  = renderLayer(bangPath,  '#fff');
  const glowImg  = renderGlow();

  const baseShape = [], baseDepth = [];
  for (let r = 0; r < ROWS; r++) {
    baseShape[r] = new Uint8Array(COLS);
    baseDepth[r] = new Float32Array(COLS);
    for (let c = 0; c < COLS; c++) {
      const px  = Math.floor(c * svgSize / COLS);
      const py  = Math.floor(r * svgSize / ROWS);
      const idx = (py * svgSize + px) * 4;

      const isHair  = hairImg.data[idx+3]   > 30;
      const isCrown = crownImg.data[idx+3]  > 30;
      const isFace  = faceImg.data[idx+3]   > 30;
      const isBang  = bangImg.data[idx+3]   > 30;
      const isGlow  = glowImg.data[idx+3]   > 30;
      const isEyeGT   = eyeGTImg.data[idx+3]   > 30;
      const isEyeDash = eyeDashImg.data[idx+3] > 30;

      if      (isEyeGT)           baseShape[r][c] = 4;
      else if (isEyeDash)         baseShape[r][c] = 5;
      else if (isBang)            baseShape[r][c] = 3;
      else if (isCrown)           baseShape[r][c] = 1;
      else if (isHair && !isFace) baseShape[r][c] = 1;
      else if (isFace)            baseShape[r][c] = 2;
      else if (isHair)            baseShape[r][c] = 1;
      else if (isGlow)            baseShape[r][c] = 6;

      if (baseShape[r][c] > 0 && baseShape[r][c] !== 4 && baseShape[r][c] !== 5) {
        const dx = (c - COLS/2) / (COLS/2);
        const dy = (r - ROWS/2) / (ROWS/2);
        baseDepth[r][c] = Math.max(0, 1 - Math.sqrt(dx*dx + dy*dy));
      }
    }
  }

  const lx = Math.cos(FIXED_LIGHT);
  const ly = Math.sin(FIXED_LIGHT) * 0.5;
  const lz = 0.7;
  const eyeChars = getEyeChars(eyeState);
  const lines = [];

  for (let fr = 0; fr < floatRows; fr++) lines.push(' '.repeat(COLS));

  for (let r = 0; r < ROWS - floatRows; r++) {
    let spanCls = '', spanBuf = '', html = '';
    const flush = () => {
      if (!spanBuf) return;
      html += spanCls ? `<span class="${spanCls}">${spanBuf}</span>` : spanBuf;
      spanBuf = '';
    };

    for (let c = 0; c < COLS; c++) {
      const t = baseShape[r][c];
      if (t === 4) { flush(); spanCls = ''; html += `<span class="e">${eyeChars.gt}</span>`; continue; }
      if (t === 5) { flush(); spanCls = ''; html += `<span class="e">${eyeChars.dash}</span>`; continue; }
      if (t === 2 || t === 0) { if (spanCls !== '') { flush(); spanCls = ''; } spanBuf += ' '; continue; }

      let lit;
      if (t === 6) {
        const sx = c * 48 / COLS, sy = r * 48 / ROWS;
        const cellAngle = Math.atan2(sy - AVATAR_CY, sx - AVATAR_CX);
        const diff = ((cellAngle - lightAngle) % (PI*2) + PI*2) % (PI*2);
        lit = Math.max(0.2, 1.0 - Math.min(diff, PI*2 - diff) / PI * 0.8);
      } else {
        const dm = baseDepth;
        const d   = dm[r][c] || 0;
        const dl  = dm[r][c-1] ?? d, dr2 = dm[r][c+1] ?? d;
        const du  = dm[r-1]?.[c] ?? d, dd2 = dm[r+1]?.[c] ?? d;
        const nx = (dl - dr2) * 3, ny = (du - dd2) * 3, nz = 0.6;
        const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
        lit = (nx/len)*lx + (ny/len)*ly + (nz/len)*lz;
        lit = Math.max(0, Math.min(0.99, lit * 1.3 + 0.2));
        if (t === 1) lit = Math.max(0.28, lit);
      }

      const ramp = (t === 3 || t === 1) ? hairRamp : glowRamp;
      const ch = ramp[Math.floor(lit * (ramp.length - 1))];
      const nc = t === 3 ? 'g' : t === 1 ? 'h' : 'o';
      if (spanCls !== nc) { flush(); spanCls = nc; }
      spanBuf += ch;
    }
    flush();
    lines.push(html);
  }

  return lines.join('\n');
}

// ─── 主流程 ──────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, 'terminals', 'home', 'animation_frames');
fs.mkdirSync(outDir, { recursive: true });

console.log('生成 235 帧动画...');
const allFrames = [];
for (let fi = 1; fi <= 235; fi++) {
  const params  = getParamsAtFrame(fi);
  const content = generateFrame(params);
  const lines   = content.split('\n');
  allFrames.push(lines);
  const name    = `frame_${String(fi).padStart(3, '0')}.txt`;
  fs.writeFileSync(path.join(outDir, name), content, 'utf8');
  process.stdout.write(`\r  ${fi}/235`);
}

// 输出合并 JSON（行数组格式，供前端一次性加载）
const jsonPath = path.join(__dirname, 'terminals', 'home', 'frames.json');
fs.writeFileSync(jsonPath, JSON.stringify(allFrames), 'utf8');
console.log('\n完成！帧文件位于 terminals/home/animation_frames/');
console.log('合并 JSON：terminals/home/frames.json');
