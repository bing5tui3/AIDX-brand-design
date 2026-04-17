---
phase: 04-animation-color-smoothness-fix
milestone: v1.1
type: context
---

# Phase 4 Context: Animation Color & Smoothness Fix

## Goal

Fix the homepage animated terminal hero so it visually matches `aidx-landing.html` exactly:
1. Correct colors for animation frame span classes `e`, `g`, `h`, `o`
2. Smooth frame rendering via direct DOM patching instead of React state re-renders

## Requirements

| ID | Description |
|----|-------------|
| REQ-01 | Add `:global(.e)`, `:global(.g)`, `:global(.h)`, `:global(.o)` color rules to `Terminal.module.css` |
| REQ-02 | Refactor `AnimatedTerminal` to use `useRef`-based row divs with direct `innerHTML` patching |
| REQ-03 | No visual regressions — terminal chrome, fonts, responsive breakpoints, docs pages unchanged |

## Key Decisions (from STATE.md)

- Animation frame classes `e`/`g`/`h`/`o` must be styled as `:global()` rules in Terminal.module.css
- AnimatedTerminal must use `useRef` + direct `innerHTML` patching to avoid React re-render jank
- No changes to terminal chrome, layout, or other routes

## Color Values (from aidx-landing.html)

| Class | Color | Role |
|-------|-------|------|
| `.e`  | `#7ec8f0` | Bright cyan highlight |
| `.h`  | `#3A5ECF` | Brand blue (same as `--brand-color`) |
| `.g`  | `#5577dd` | Mid blue |
| `.o`  | `#6699ff` | Light blue |

## Scope

**In scope:**
- `src/components/terminal/Terminal.module.css` — add 4 color rules
- `src/components/animated-terminal/index.tsx` — refactor to ref-based DOM patching

**Out of scope:**
- Any new features
- Changes to animation frame content or generation
- Changes to terminal layout/sizing
- Any other files
