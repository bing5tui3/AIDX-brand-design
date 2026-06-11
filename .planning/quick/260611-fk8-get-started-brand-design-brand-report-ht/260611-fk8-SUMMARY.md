---
phase: quick-260611-fk8
plan: 01
subsystem: homepage
tags: [cta, homepage, brand-design]
requires: [public/brand-report.html]
provides: ["Homepage Brand Design primary CTA linking to /brand-report.html"]
affects: [src/app/HomeContent.tsx]
tech-stack:
  added: []
  patterns: ["ButtonLink with '/'-prefixed href renders same-tab internal navigation"]
key-files:
  created: []
  modified: [src/app/HomeContent.tsx]
decisions:
  - "Primary CTA uses default (brand) ButtonLink theme — no theme prop"
  - "Same-tab navigation; no target=_blank since Link treats '/'-prefixed hrefs as internal"
metrics:
  duration: ~3m
  completed: 2026-06-11
---

# Phase quick-260611-fk8 Plan 01: Brand Design CTA Summary

Replaced the homepage's retired `href="#"` "Get Started" primary CTA with a "Brand Design" button linking to the static Brand Design Page at `/brand-report.html`, keeping brand-themed styling and same-tab navigation.

## What Was Built

- `src/app/HomeContent.tsx`: The first `ButtonLink` in the `buttonsList` `GridContainer` now uses `href="/brand-report.html"` and `text="Brand Design"`, retaining `size="large"` and the default (brand) theme.
- The neutral "Documentation" button is unchanged.
- The navbar/footer "Get Started" CTA in `src/app/layout.tsx` is untouched.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Replace Get Started CTA with Brand Design link | 9d3ccca | src/app/HomeContent.tsx |

## Verification Results

- `grep 'href="/brand-report.html"' src/app/HomeContent.tsx` — found (line 77)
- `grep 'text="Brand Design"' src/app/HomeContent.tsx` — found (line 78)
- `grep 'Get Started' src/app/HomeContent.tsx` — 0 matches (removed)
- `grep 'Get Started' src/app/layout.tsx` — still present (chrome CTA unchanged)
- `npx biome check src/app/HomeContent.tsx` — passed (no fixes)
- `npm run build` — succeeded (static export, all 5 pages generated)
- `public/brand-report.html` — exists (link target present)

## Deviations from Plan

None to the implementation — plan executed exactly as written.

## Deferred Issues

- `npm run lint` (repo-wide `biome check .`) fails with: "Found a nested root configuration" from `ghostty/biome.json`. This is a pre-existing condition introduced by the `ghostty/` git subtree merge (commit 586ac70), unrelated to this single-file change. The modified file passes `biome check` cleanly in isolation. Out of scope per executor scope-boundary rules; logged here for visibility. Recommended future fix: scope the root `biome.json` to exclude `ghostty/`, or remove the nested config.

## Self-Check: PASSED

- FOUND: src/app/HomeContent.tsx
- FOUND commit: 9d3ccca
