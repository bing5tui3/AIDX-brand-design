# Feature Research

**Domain:** Tech platform brand identity system with character mascot (颜小慧 / xiaohuiyan)
**Researched:** 2026-04-16
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist or the brand system is incomplete and unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Primary logo mark | Every brand needs a primary lockup — symbol + wordmark together | LOW | The combination mark is the canonical form |
| Wordmark (text-only) | Needed when symbol doesn't fit or isn't recognized yet | LOW | Typographic treatment of "AIDX" |
| Logo symbol / icon | Standalone mark for app icons, favicons, small contexts | LOW | Must work at 16px and 512px |
| Favicon / app icon | Platform UI requires it; missing = browser tab shows blank | LOW | Derived from logo symbol, not a separate design |
| Primary color palette | Without defined colors, every designer picks differently | LOW | Primary + neutral + semantic (error/success/warning) |
| Typography system | Heading + body typeface with hierarchy rules | LOW | Must specify weights, sizes, line-height |
| Avatar — primary pose | Core character asset; everything else derives from this | HIGH | 颜小慧 canonical standing/neutral pose, full color |
| Avatar — multiple sizes | Same character must work at 512px hero and 32px chat bubble | MEDIUM | At minimum: large (512px+), medium (128px), small (32px) |
| Avatar — light/dark variants | Platform UIs have both modes; avatar must work in both | MEDIUM | Background-transparent versions required |
| Brand guidelines document | Without this, assets are used inconsistently immediately | MEDIUM | Covers logo, color, type, avatar usage rules |
| File format exports | SVG (vector), PNG (raster at 1x/2x/3x), ICO (favicon) | LOW | Missing formats = assets can't be used |

### Differentiators (Competitive Advantage)

Features that express brand personality and create competitive separation.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Avatar expression set | Character feels alive; enables contextual emotional communication | HIGH | Min 6 expressions: neutral, happy, thinking, surprised, error/sad, success |
| Avatar pose variants | Enables storytelling across UI states (onboarding, empty states, errors) | HIGH | Min 3 poses: standing, pointing/directing, waving/greeting |
| Character personality doc | Ensures all future content (copy, motion, illustration) stays on-brand | MEDIUM | Backstory, personality traits, voice, forbidden behaviors |
| Icon set in brand style | Custom icons vs generic library icons signals design maturity | HIGH | Functional UI icons drawn to match 颜小慧's visual language |
| Color system with semantic tokens | Design tokens enable consistent implementation across product surfaces | MEDIUM | Maps brand colors to UI roles (primary, surface, on-surface) |
| Avatar usage in UI contexts | Defines how 颜小慧 appears in product (chat, onboarding, empty states) | MEDIUM | Placement rules, sizing, do/don't examples |
| Dark mode color palette | Tech platforms are expected to support dark mode; brand must too | MEDIUM | Separate palette or token mapping for dark surfaces |
| Brand motion principles | Defines how the brand moves — easing, speed, personality in animation | HIGH | Even if no animations in v1, principles guide future work |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full animation / motion assets | "The mascot should move!" | Requires separate motion design discipline; blocks static asset delivery; high cost for unvalidated character | Define motion principles in guidelines; defer actual animations to v2 |
| 3D character model | Looks impressive, modern | Requires 3D artist, rigging, render pipeline; 10x cost of 2D; hard to maintain consistency | Nail the 2D character first; 3D is a v2+ upgrade path |
| Merchandise / print templates | "We'll need this eventually" | Print requires CMYK/Pantone specs, bleed, different resolution rules; premature | Add Pantone values to color system; defer actual print templates |
| Social media template library | Seems like part of brand | Dozens of templates across platforms; becomes stale fast; not brand foundation | Define visual language rules so any designer can create on-brand content |
| Multiple mascot characters | "We need a team of characters" | Dilutes 颜小慧's identity before it's established; doubles design cost | Establish one character deeply before expanding the universe |
| Photographic style guide | Comprehensive brand systems include this | No photography assets exist yet; premature to define style | Add a one-paragraph "photography direction" note in guidelines; full guide later |

## Feature Dependencies

```
[Primary logo mark]
    └──requires──> [Wordmark] + [Logo symbol]
                       └──requires──> [Primary color palette]
                                          └──requires──> [Typography system]

[Avatar — primary pose]
    └──requires──> [Character personality doc] (personality drives visual decisions)
    └──enables──> [Avatar expression set]
                      └──enables──> [Avatar pose variants]
                                        └──enables──> [Avatar usage in UI contexts]

[Brand guidelines document]
    └──requires──> ALL of: logo, color, typography, avatar primary pose
    └──enhanced by──> expression set, pose variants, icon set

[Icon set in brand style]
    └──requires──> [Primary color palette] + [Avatar primary pose] (visual language reference)

[Dark mode color palette]
    └──requires──> [Primary color palette]

[Color system with semantic tokens]
    └──requires──> [Primary color palette] + [Dark mode color palette]
```

### Dependency Notes

- **Avatar primary pose requires character personality doc:** Visual design decisions (expression, posture, clothing, color) must be grounded in personality — otherwise the character has no soul and will drift across designers.
- **Brand guidelines require all core assets:** The guidelines document is a synthesis artifact, not a starting point. It can only be written after logo, color, type, and avatar are finalized.
- **Icon set requires avatar visual language:** Icons should share the same stroke weight, corner radius, and visual personality as 颜小慧. Design the character first, extract the visual DNA, then apply to icons.
- **Expression set enhances UI contexts:** Empty states, error pages, and onboarding flows become significantly more engaging when 颜小慧 can express the appropriate emotion for the context.

## MVP Definition

### Launch With (v1)

Minimum viable brand system — what's needed to ship a coherent, usable identity.

- [ ] Character personality doc — defines 颜小慧's traits, voice, and visual direction before any pixels are drawn
- [ ] Primary color palette — 3-5 colors with hex/RGB values and usage rules
- [ ] Typography system — 1-2 typefaces with hierarchy (H1–H3, body, caption)
- [ ] Avatar — primary pose, full color, transparent background — the canonical 颜小慧
- [ ] Avatar — size variants (512px, 128px, 32px) from primary pose
- [ ] Avatar — light and dark background variants
- [ ] Wordmark — typographic AIDX treatment
- [ ] Logo symbol — standalone mark derived from avatar or abstract mark
- [ ] Primary logo lockup — symbol + wordmark combined
- [ ] File exports — SVG, PNG @1x/2x/3x, ICO for all logo assets
- [ ] Brand guidelines v1 — covers logo usage, color, type, avatar do/don't

### Add After Validation (v1.x)

Add once core assets are in use and feedback is gathered.

- [ ] Avatar expression set (6 expressions) — triggered when UI needs emotional states
- [ ] Avatar pose variants (3 poses) — triggered when product has onboarding/empty states to design
- [ ] Dark mode color palette — triggered when product ships dark mode
- [ ] Color system with semantic tokens — triggered when engineering needs design tokens
- [ ] Icon set (core 20-30 icons) — triggered when product UI needs custom icons

### Future Consideration (v2+)

Defer until brand is established and character is validated with users.

- [ ] Extended icon set (50+ icons) — defer until product scope is clear
- [ ] Brand motion principles — defer until animation work begins
- [ ] 3D character model — defer; requires validated 2D character first
- [ ] Print / merchandise specs — defer until there's a concrete use case
- [ ] Social media template library — defer; define rules, not templates

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Character personality doc | HIGH | LOW | P1 |
| Avatar — primary pose | HIGH | HIGH | P1 |
| Primary color palette | HIGH | LOW | P1 |
| Typography system | HIGH | LOW | P1 |
| Wordmark | HIGH | MEDIUM | P1 |
| Logo symbol | HIGH | MEDIUM | P1 |
| Primary logo lockup | HIGH | LOW | P1 |
| File format exports | HIGH | LOW | P1 |
| Avatar size variants | HIGH | LOW | P1 |
| Brand guidelines v1 | HIGH | MEDIUM | P1 |
| Avatar expression set | HIGH | HIGH | P2 |
| Avatar pose variants | MEDIUM | HIGH | P2 |
| Dark mode palette | MEDIUM | LOW | P2 |
| Semantic color tokens | MEDIUM | MEDIUM | P2 |
| Icon set (core) | MEDIUM | HIGH | P2 |
| Brand motion principles | LOW | MEDIUM | P3 |
| Extended icon set | LOW | HIGH | P3 |
| 3D character model | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Duolingo (Duo owl) | GitHub (Octocat) | Our Approach (颜小慧) |
|---------|--------------|--------------|--------------|
| Character personality | Sassy, motivating, meme-able | Playful, hacker-friendly | Professional + intelligent + approachable |
| Expression range | 20+ expressions, highly emotive | ~10 poses, less expressive | Start with 6 core expressions, expand |
| UI integration | Deeply embedded in product flows | Primarily marketing/community | Embedded in platform UI (chat, onboarding, states) |
| Character consistency | Strict style guide, licensed | Open source, community remixes | Strict guidelines, controlled usage |
| Icon system | Separate from character | Separate from character | Icons share character's visual DNA |
| 3D / animation | Yes (v2+ equivalent) | Limited | Defer to v2+ |

## Sources

- dreamfarmstudios.com — mascot character system deliverables (MEDIUM confidence, industry practitioner)
- dreamfarmagency.com — brand mascot guide including expression/pose/format requirements (MEDIUM confidence)
- artversion.com — brand identity system components (MEDIUM confidence, design agency)
- inkbotdesign.com — complete brand identity system deliverables 2026 (MEDIUM confidence)
- Duolingo, GitHub brand systems — competitor analysis (HIGH confidence, direct observation)

---
*Feature research for: AIDX brand identity system with 颜小慧 character mascot*
*Researched: 2026-04-16*
