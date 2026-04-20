# Feature Landscape: Eye Opening Animation

**Domain:** ASCII art character animation — eye-opening effect
**Researched:** 2026-04-18
**Milestone:** v1.3 Eye Animation Enhancement

---

## Table Stakes

Features users expect. Missing = animation feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Eyes change shape across frames | The whole point of the milestone — static eyes are the current bug | High | Currently 80 `>` and 45 `-` chars in every single frame, never changing |
| Symmetric progression | Both eyes should open at the same rate; asymmetry reads as a glitch | Medium | Left eye (`>`) and right eye (`-`) must be redesigned together |
| Smooth interpolation | Abrupt jumps between eye shapes break the illusion of life | High | Ghostty uses ~20-30 frames per transition stage; AIDX has 235 frames to work with |
| Eye region stays in the same position | The eye bounding box must not drift as shape changes | Medium | Ghostty eyes are anchored within the ghost body; AIDX eyes must stay within the face region |
| Final state is clearly "open/round" | The payoff must be legible — viewer must read it as open eyes | Medium | Ghostty ends with two large hollow circles; AIDX needs an equivalent round-eye ASCII shape |
| Color class `e` preserved on eye spans | The renderer already styles `class="e"` spans; eye chars must keep this class | Low | Confirmed in existing frames — all eye chars use `<span class="e">` |

---

## Differentiators

Features that elevate the effect beyond the minimum.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Easing curve on the opening | Slow start, fast middle, slow end (ease-in-out) feels organic vs linear | Medium | Ghostty achieves this by spending more frames on early/late stages |
| Pupil or iris detail at full-open state | A small filled center inside the round eye adds depth and character | Medium | Ghostty uses a small filled dot inside the hollow circle at peak open |
| Brief "blink" or squint before opening | A momentary extra-squint before opening creates anticipation | Low | Optional — adds personality without much frame cost |
| Eye shape matches character personality | 颜小慧 is a developer assistant — slightly wide, alert eyes suit the character | Low | Design decision, not a technical constraint |
| Transition tied to animation phase | Eyes open during the "active" phase of the animation loop, not randomly | Medium | Ghostty eyes grow during the ghost's descent/appearance phase |

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Blinking during the open state | Breaks the "waking up" narrative; viewer expects eyes to stay open once open | Hold the open state for the remainder of the loop |
| Different open/close speeds per eye | Reads as a bug, not a feature | Keep both eyes synchronized |
| Using new color classes not in Terminal.module.css | Will render as unstyled text | Only use existing classes: `e`, `g`, `h`, `o`, `b` |
| Replacing the entire character body to accommodate eyes | Scope creep — only the eye region needs to change | Surgically modify only the rows containing eye characters |
| Pixel-perfect circle in ASCII | Monospace grids can't make true circles; chasing perfection wastes frames | Use the best available ASCII approximation (see Eye Shape Progression below) |

---

## Eye Shape Progression

### How Ghostty Does It (HIGH confidence — directly observed in frames)

The Ghostty ghost has no explicit eye characters. Its eyes are **hollow regions** — empty whitespace carved out of the ghost body's `$` and `@` fill characters. The eye effect is achieved by:

1. **Frame 001 (closed/small):** The eye holes are narrow horizontal slits — just 2-3 rows of whitespace, each only ~5-8 chars wide. The surrounding body fill (`$`, `@`) crowds in from all sides.
2. **Frame 100 (mid-open):** The eye holes are taller and wider — ~5 rows, ~12 chars wide. The body fill has retreated, leaving a larger void.
3. **Frame 200 (near-full):** The eye holes are large ovals — ~7 rows, ~18 chars wide. The surrounding body fill forms a clear circular border.

The key insight: **Ghostty grows the empty space, not a drawn shape.** The "eye" is the absence of fill characters, bordered by the body fill acting as the eye socket.

### AIDX Current State (HIGH confidence — verified by frame diff)

- Left eye: `>` characters, 80 total, arranged in a triangular wedge pointing right (squinting)
- Right eye: `-` characters, 45 total, arranged in a horizontal dash cluster (squinting)
- Both are **identical in every frame** — zero animation

### Recommended Transition Stages for AIDX

The 235 frames should be divided into phases. Suggested allocation:

| Phase | Frames | Eye State | Description |
|-------|--------|-----------|-------------|
| Hold closed | 1–40 | `>` / `-` squint (current) | Character is "asleep" or focused |
| Cracking open | 41–80 | Narrow slit: `_` / `‐` or thin arc | Eyelid lifts slightly, a thin gap appears |
| Half open | 81–130 | Medium arc: `(` `)` style curves | Iris starts to show, eye is half-height |
| Opening | 131–180 | Taller arc: `(o)` / `(O)` | Eye clearly open, round shape emerging |
| Full open | 181–235 | Full circle: `( O )` or hollow oval | Eyes fully round, hold for rest of loop |

### ASCII Shape Vocabulary for Round Eyes

These are the buildable shapes in monospace ASCII, ordered from squint to round:

```
Stage 0 (squint):
  Left:  > > > > >
  Right: - - - - -

Stage 1 (slit):
  Left:  _ _ _ _ _
  Right: _ _ _ _ _

Stage 2 (half-open):
  Left:  ( _ _ )
  Right: ( _ _ )

Stage 3 (three-quarter):
  Left:  ( o )
  Right: ( o )

Stage 4 (full open, small):
  Left:  (  o  )
  Right: (  o  )

Stage 5 (full open, large — Ghostty-equivalent):
  Left:   /‾‾‾\
         | ( ) |
          \___/
  Right: same
```

For AIDX's monospace grid, the most legible full-open eye uses a 3-row structure:
```
  row N-1:  . ( . . . ) .
  row N:    ( . . O . . )
  row N+1:  . ( . . . ) .
```
Where `.` is background fill and `O` is the pupil (still using `class="e"`).

### What Makes Ghostty's Effect Compelling

1. **Scale contrast:** The eyes go from tiny slits to large circles — the size delta is dramatic, making the "opening" unmistakable.
2. **Negative space:** The eye is defined by what's NOT there (empty space inside the body fill), which is more readable than drawn characters.
3. **Gradual border formation:** As the eye grows, the surrounding body fill naturally forms a curved border — the eye socket emerges organically.
4. **Consistent character density:** The body fill characters (`$`, `@`) maintain consistent density around the eye, so the eye region reads as a clean hole rather than a degraded area.

For AIDX, the equivalent approach is: **replace the `>` and `-` eye characters with progressively rounder ASCII shapes**, while keeping the surrounding face fill (`$`, `@`, `h`-class chars) stable. The eye characters themselves carry the shape — unlike Ghostty's negative-space approach, AIDX needs to draw the eye explicitly because the character has a face, not a ghost body.

---

## Feature Dependencies

```
Eye shape progression → Frame regeneration (all 235 frames must be rewritten)
Frame regeneration → Eye region coordinate mapping (must know exact row/col of eye chars)
Eye region coordinate mapping → Existing frame analysis (done — rows 25-37 in AIDX frames)
Round eye ASCII shapes → Color class `e` compatibility (existing class, no CSS changes needed)
```

---

## MVP Recommendation

Prioritize:
1. Map exact eye region coordinates in the existing frames (rows 25–37, confirmed)
2. Design 5 eye shape stages (squint → slit → half → three-quarter → round)
3. Regenerate all 235 frames with the eye region replaced per the stage schedule above
4. Verify `class="e"` is applied to all eye characters in regenerated frames

Defer:
- Pupil detail (inner `O` character) — add only if the round shape reads as flat without it
- Blink effect — not needed for MVP, adds frame complexity

---

## Sources

- Direct frame analysis: `/Users/ruidemacbookair/Development/AIDX-brand-design/terminals/home/animation_frames/frame_001.txt`, `frame_100.txt`, `frame_200.txt`
- Direct frame analysis: `/Users/ruidemacbookair/Development/AIDX-brand-design/ghostty/terminals/home/animation_frames/frame_001.txt`, `frame_100.txt`, `frame_200.txt`
- Eye character count verification: grep across all 235 AIDX frames — confirmed static (80 `>`, 45 `-` in every frame)
- Ghostty eye mechanism: confirmed as negative-space hollow regions, no `class="e"` spans used
