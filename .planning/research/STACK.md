# Stack Research

**Domain:** Brand visual identity — character avatar, icon system, wordmark, brand guidelines
**Researched:** 2026-04-16
**Confidence:** HIGH (core tools), MEDIUM (AI-assist workflow)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Adobe Illustrator | 2025 (v29) | Vector drawing — mascot, wordmark, icons | Industry standard for production-quality vector art; pen tool precision, bezier control, and SVG export are unmatched for brand assets that must scale from 16px favicon to billboard. Procreate sketches get vectorized here. |
| Figma | Current (2025) | Design system hub — component library, brand tokens, handoff | 80%+ market share for UI/UX; Variables (design tokens) natively support color/typography primitives; icon components with variants live here; the single source of truth for dev handoff. |
| Procreate | 5X (iPad) | Character concept sketching and expression exploration | Fastest tool for loose ideation on 颜小慧's personality, poses, and expression sheets before committing to vector. Natural brush feel accelerates character exploration vs. jumping straight to Illustrator. |

### Supporting Libraries / Tools

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SVGO | 3.x | SVG optimization — strip editor metadata, reduce file size 60-80% | Run on every icon export before committing to repo; Figma's SVG Export plugin uses SVGO under the hood |
| Figma SVG Export plugin | Latest | Batch export icons with SVGO presets applied | When exporting the full icon set; avoids manual SVGO CLI per file |
| Style Dictionary | 4.x | Transform Figma Variables/design tokens to CSS/JSON/platform formats | When brand tokens (colors, typography) need to flow into code; bridges Figma Variables → CSS custom properties |
| Zeroheight | Current | Living brand guidelines documentation | When the brand spec needs to be shareable with stakeholders and stays in sync with Figma; connects directly to Figma library |

### Development / Delivery Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Figma Variables | Brand token storage (colors, type scale, spacing) | Use primitive → semantic → component token hierarchy; 69.8% of teams use this per Supernova 2024 survey |
| Midjourney v7 (--cref / --oref) | AI-assisted character concept generation | Use `--cref` with a reference image to maintain 颜小慧 consistency across pose variations; treat output as sketch reference only — final art must be vectorized in Illustrator |
| Adobe Firefly | AI fill/variation for brand illustration elements | Integrated into Illustrator 2025; useful for generating texture/background variants that match brand style |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Adobe Illustrator | Affinity Designer 2 | Budget-constrained teams; one-time purchase vs. subscription. Affinity has strong vector tools but weaker SVG export fidelity and smaller professional ecosystem for brand work |
| Adobe Illustrator | Figma (vector only) | Simple icon-only projects with no complex illustration; Figma's vector tools are adequate for geometric icons but lack the pen tool precision needed for organic character curves |
| Zeroheight | Notion + embedded Figma | Small teams or early-stage; Notion is free and flexible but lacks live Figma sync and token documentation features |
| Midjourney | Stable Diffusion (local) | When IP/data privacy is a hard requirement; SD requires more prompt engineering for consistent characters and has steeper setup cost |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Adobe XD | Adobe has put XD in maintenance mode; no new features since 2023, being replaced by Firefly-integrated workflows | Figma for UI/design system work |
| Canva | Insufficient vector precision for professional brand assets; exports are rasterized or low-fidelity SVG; no real token system | Figma + Illustrator |
| Sketch | macOS-only, lost significant market share, limited collaboration; icon/token ecosystem has migrated to Figma | Figma |
| AI-only final assets (Midjourney/DALL-E as final output) | AI-generated rasters are not scalable vectors; character consistency degrades across generations; no clean SVG path data for dev use | Use AI for concept sketches only; vectorize finals in Illustrator |
| Raster formats (PNG/JPG) as master files | Cannot scale without quality loss; no path editing; bloated file sizes for icon sets | SVG as master format for all icons and wordmark |

## Stack Patterns by Variant

**For 颜小慧 avatar (character illustration):**
- Sketch in Procreate → vectorize in Illustrator → export layered SVG variants (full body, bust, icon crop)
- Maintain a "character sheet" Illustrator file with all expressions and poses as separate artboards

**For icon system:**
- Design all icons in Figma on a consistent grid (24x24px base, 1.5px stroke weight)
- Store as Figma components with size variants (16/20/24/32px)
- Export via SVG Export plugin with SVGO preset; commit optimized SVGs to repo

**For wordmark:**
- Design in Illustrator (full typographic control, outline conversion)
- Export as SVG (paths only, no embedded fonts) + PNG at 1x/2x/3x
- Store master .ai file; never use rasterized wordmark as source

**For brand guidelines:**
- Figma Variables for all tokens (colors, type, spacing)
- Zeroheight connected to Figma library for living documentation
- Export a static PDF snapshot at each milestone for stakeholder distribution

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Style Dictionary 4.x | Figma Variables JSON export | SD4 breaking changes from v3; use v4 for W3C DTCG token format compatibility |
| SVGO 3.x | Node 18+ | SVGO 2.x still works but 3.x has better default presets for icon optimization |
| Figma Variables | Figma desktop + web (2024+) | Variables require Figma's current editor; not available in older Figma versions or Sketch importers |

## Sources

- https://www.glowui.com/blog/figma-icons — Figma 80%+ market share (2026 edition, HIGH confidence)
- https://artofstyleframe.com/blog/how-to-build-design-system-figma/ — Figma Variables adoption stats (MEDIUM confidence, cites Supernova 2024)
- https://www.designsystemscollective.com/the-evolution-of-design-system-tokens-a-2025-deep-dive-into-next-generation-figma-structures-969be68adfbe — Token architecture 2025 (MEDIUM confidence)
- https://blog.simafeedback.com/articles/figma-vs-adobe-xd-2025 — Adobe XD maintenance mode confirmation (HIGH confidence)
- https://www.figma.com/community/plugin/814345141907543603/svg-export — SVGO integration in Figma SVG Export plugin (HIGH confidence)
- https://www.imaginepro.ai/blog/2025/7/midjourney-character-reference-guide — Midjourney --cref character consistency (MEDIUM confidence)
- https://zeroheight.com/documentation/ — Zeroheight Figma sync capabilities (HIGH confidence)
- https://docusoftware.info/adobe-illustrator-2025-vs-popular-alternatives/ — Illustrator vs alternatives comparison (MEDIUM confidence)
- https://www.contra.com/p/27gPrBO3-expressive-mascot-design-and-animation — Procreate → Illustrator mascot workflow (MEDIUM confidence)

---
*Stack research for: AIDX brand design — avatar, icon system, wordmark, brand guidelines*
*Researched: 2026-04-16*
