# Technology Stack: Eye Animation Frame Regeneration

**Project:** AIDX v1.3 Eye Animation Enhancement
**Researched:** 2026-04-18
**Scope:** Tools and approach for modifying `scripts/generate-frames.js` to add eye-becoming-round effect

---

## Recommended Approach

**Modify `scripts/generate-frames.js` directly using Node.js + the existing `canvas` npm package.**

No new tools or libraries are needed. The existing script already uses `node-canvas` (`createCanvas`, `getImageData`) to rasterize SVG paths into pixel grids, then maps pixel brightness to ASCII characters. The eye-becoming-round effect is a pure extension of this existing pipeline:

1. Add a new eye shape type — a rendered ellipse/circle — alongside the existing `renderEyeGT()` (the `>` shape) and `renderEyeDash()` (the `-` shape).
2. Add a new `eyeState` range (e.g. `eyeState > 0.7` → round) in `getEyeChars()`, or better: render the round eye as a canvas ellipse and composite it into the frame at the correct `eyeState` threshold.
3. Add new keyframes that drive `eyeState` to the "round" range at the desired animation moments.

The key insight: the current `eyeState` parameter already drives a 3-state transition (`> -` → `· ·` → `_ _`). Adding a 4th state (round circle) is a direct extension — render a small circle outline using `ctx.arc()` or `ctx.ellipse()` on a canvas layer, rasterize it to a pixel grid the same way `renderEyeGT()` does, and composite it when `eyeState` enters the new range.

**Confidence: HIGH** — based on direct reading of the existing script.

---

## Libraries/Tools

### Already in use — no additions needed

| Tool | Version | Role | Notes |
|------|---------|------|-------|
| `canvas` (node-canvas) | already installed | Rasterize shapes to pixel grids | Used for all existing eye/hair/face layers |
| Node.js `fs` | built-in | Write frame files | Already used |
| Node.js `path` | built-in | Output path resolution | Already used |

### What node-canvas provides that matters here

- `ctx.arc(cx, cy, r, 0, Math.PI * 2)` — draws a filled or stroked circle
- `ctx.ellipse(cx, cy, rx, ry, rotation, startAngle, endAngle)` — draws an ellipse (already used for `renderEllipse()`)
- `ctx.getImageData()` — returns pixel RGBA array for ASCII mapping (already used for all layers)
- `ctx.lineWidth`, `ctx.strokeStyle`, `ctx.lineCap` — already used for eye stroke rendering

The round eye can be rendered as a stroked circle (outline only, like the `>` eye) using `ctx.arc()` + `ctx.stroke()`, producing a hollow circle that maps to ASCII characters via the existing brightness pipeline.

### No new npm packages needed

The `canvas` package already handles everything. Adding `jimp`, `sharp`, `ascii-art`, or any other image/ASCII library would be redundant and add unnecessary complexity.

---

## Integration Points

### 1. New render function in generate-frames.js

Add alongside `renderEyeGT()` and `renderEyeDash()`:

```js
function renderEyeCircle(cx, cy, r) {
  const ctx = makeCtx();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  return ctx.getImageData(0, 0, svgSize, svgSize);
}
```

The `cx`, `cy`, `r` values should be tuned to match the face coordinate space (SVG units 0–48, scaled by `scale=4` to 192px canvas). The existing `>` eye is centered around `(16–21, 25–32)` and the `-` eye around `(29–35, 28.5)` in SVG units.

### 2. Extended eyeState range

Current `getEyeChars()` uses 3 bands: `< 0.3`, `0.3–0.7`, `>= 0.7`. Extend to 4:

```js
// eyeState: 0 = squint (> -), 0.3 = half (· ·), 0.7 = closed (_), 1.0 = round (○)
// OR restructure: 0 = squint, 0.5 = closed, 1.0 = round
```

The cleanest approach: keep `eyeState` as a 0–1 range but redefine the semantics so the animation arc goes `squint → closed → round` rather than `squint → half → closed`. This matches the "eye opening" narrative.

### 3. Composite logic in generateFrame()

In the per-cell loop, add a new shape type (e.g. `t === 7` for round eye) alongside the existing `t === 4` (GT eye) and `t === 5` (dash eye). The composite priority order already handles this — just add the new layer check before the face/hair checks.

### 4. Keyframe additions

Add keyframes that push `eyeState` to 1.0 (round) at the desired frames. The existing blink keyframes (frames 88–100 and 188–200) currently go to `eyeState: 1` which maps to `_`. Redefine `eyeState: 1` to mean "round" and add intermediate keyframes for the transition.

### 5. Re-run the script

```bash
node scripts/generate-frames.js
```

This regenerates all 235 `.txt` files in `terminals/home/animation_frames/` and the merged `frames.json`. The Next.js site reads these files statically — no site code changes needed if the HTML span structure is preserved.

---

## What NOT to Add

| Approach | Why to avoid |
|----------|-------------|
| `jimp` / `sharp` for image processing | Redundant — `node-canvas` already does pixel-level rasterization |
| `figlet` / `ascii-art` npm packages | These generate ASCII from text/images using fixed character maps; the existing custom brightness-ramp approach is more precise and already working |
| Python + PIL/Pillow | Introduces a second runtime; Node.js is already the tool for this script |
| Canvas-to-browser rendering (HTML Canvas) | Frame generation is a build-time Node.js script, not a browser task |
| Rewriting frames with string manipulation | The existing canvas-rasterize-then-map pipeline is the right abstraction; string-patching pre-generated frames would be fragile and hard to tune |
| Separate "eye overlay" post-processing step | Unnecessary complexity — the round eye layer fits naturally into the existing per-frame canvas compositing pipeline |
| Increasing frame count beyond 235 | The AnimatedTerminal component and frames.json are sized for 235 frames; changing this requires site code changes |

---

## Summary

The entire implementation lives in `scripts/generate-frames.js`. Add one new `renderEyeCircle()` function, extend the `eyeState` branching logic, add the new canvas layer to the per-cell compositor, tune the keyframes, and re-run. The `canvas` package already installed handles all rendering. No new dependencies, no new files, no site code changes required.
