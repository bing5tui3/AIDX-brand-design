# AIDX Website

## What This Is

AIDX is an AI-powered developer experience product. This project refactors the current static HTML prototype into a production-grade Next.js website using the same architecture as the Ghostty website — App Router, MDX-based docs, animated terminal hero, CSS Modules, TypeScript, and Biome for linting/formatting.

## Core Value

A polished, fast, fully-static Next.js site with an animated terminal hero on the homepage and MDX-driven documentation — mirroring the Ghostty website architecture exactly.

## Requirements

### Validated

- ✓ Next.js 16 App Router project with TypeScript and Biome — v1.0
- ✓ Global CSS design tokens matching AIDX brand (`--brand-color: #3A5ECF`, gray scale, atom-one syntax theme) — v1.0
- ✓ Pretendard Std Variable font (woff2 local) + JetBrains Mono — v1.0
- ✓ MDX pipeline with remark-frontmatter, remark-gfm, custom heading IDs, GFM-alerts-as-callouts, rehype-highlight — v1.0
- ✓ Animated terminal hero on homepage (235 frames from `terminals/home/animation_frames/`) — v1.0
- ✓ MDX-based docs system with sidebar nav, sidecar TOC, breadcrumbs, and syntax highlighting — v1.0
- ✓ Navbar with AIDX wordmark, nav links, CTA button, mobile hamburger menu — v1.0
- ✓ Footer with nav links and copyright — v1.0
- ✓ Full component library: Text, Link, Button, GridContainer, Terminal, AnimatedTerminal, NavTree, Sidecar, Breadcrumbs, JumplinkHeader, CodeBlock, Callout, Blockquote, PathnameFilter, SectionWrapper, ScrollToTopButton — v1.0
- ✓ Static build passes, all 4 routes prerendered as static HTML — v1.0
- ✓ `docs/nav.json`, `docs/index.mdx`, `docs/quick-start.mdx` — v1.0
- ✓ 404 page — v1.0
- ✓ Favicon SVG and AIDX logo in `public/` — v1.0

## Current Milestone: v1.3 Eye Animation Enhancement

**Goal:** Port the Ghostty "eye becoming round" animation effect to the AIDX homepage character (颜小慧), making her squinting eyes evolve into round circles during the animation loop.

**Target features:**
- Regenerate animation frames so eyes transition from squinting (`>` / `-`) to round circles
- Match Ghostty's eye-opening visual quality and timing
- Keep animation smooth at 31ms/frame, 235 frames

### Active

- [ ] Animation frame color classes `e`/`g`/`h`/`o` styled in Terminal.module.css (v1.1)
- [ ] AnimatedTerminal ref-based direct DOM patching for smooth rendering (v1.1)
- [ ] Mermaid diagram rendering in MDX (v2)
- [ ] GitHub issue link processor `GH-123 → link` (v2)
- [ ] Search functionality (v2)
- [ ] Additional homepage sections: InfoCards, TerminalCards, TabbedTerminals (v2)
- [ ] PNG favicons and favicon.ico (deferred from v1 — SVG-only for now)
- [ ] Download page with release data (v2)

### Out of Scope

- Server-side rendering / API routes — must be fully static
- VT sequence component — Ghostty-specific, not applicable
- Sponsor/donate cards — not needed for AIDX
- i18n / localization — defer to v2
- Dark/light mode toggle — dark-only matches Ghostty

## Context

**Shipped v1.0 (2026-04-17):** 3 phases, 9 plans, 129 files changed, ~4,100 LOC TypeScript/CSS.

Tech stack: Next.js 16, React 19, TypeScript, Biome 2, CSS Modules, MDX (`@next/mdx`, gray-matter, remark-gfm, rehype-highlight), zustand, lucide-react, slugify.

235 animation frames in `terminals/home/animation_frames/` power the homepage hero. Brand SVG assets in repo root are used for navbar wordmark, favicon, and logo.

Known technical debt:
- `GITHUB_REPO_URL` in `src/lib/docs/config.ts` is a placeholder (`https://github.com/your-org/aidx`)
- PNG favicon variants (favicon.ico, -16, -32, -128, -256) were deferred — SVG-only for v1
- No real docs content yet beyond scaffold pages

## Constraints

- **Tech Stack**: Must mirror Ghostty website architecture exactly — Next.js App Router, CSS Modules, TypeScript, Biome, MDX
- **Static**: No server-side rendering, no API routes, no serverless functions
- **Fonts**: Pretendard Std Variable (local woff2) + JetBrains Mono (Google Fonts)
- **Brand**: AIDX brand color `#3A5ECF`, dark theme `#0f0f11` background

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mirror Ghostty architecture exactly | User explicitly requested this | ✓ Good — clean architecture, easy to maintain |
| Keep existing terminals/ animation frames | Already generated, 235 frames ready | ✓ Good — reused verbatim, no rework |
| Replace package.json entirely | Current deps (canvas) are for frame generation, not the website | ✓ Good — clean slate |
| Use AIDX brand color #3A5ECF | From existing landing page, consistent with brand assets | ✓ Good — consistent |
| SVG-only favicon for v1 | PNG variants are extra work; SVG is sufficient for modern browsers | ✓ Good — deferred PNG work to v2 |
| Verbatim Ghostty component copy + AIDX brand swap | Fastest path to working site; no rewrite needed | ✓ Good — 2-day build |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after v1.0 milestone*
