# Architecture Research

**Domain:** Brand identity system for tech/AI platform
**Researched:** 2026-04-16
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

A brand identity system is a layered dependency graph, not a flat collection of assets.
Each layer depends on the one below it being stable before it can be finalized.

```
┌─────────────────────────────────────────────────────────────┐
│                   Layer 4: Brand Guidelines                  │
│   (documents rules, usage, do/don't — depends on all below) │
├─────────────────────────────────────────────────────────────┤
│                   Layer 3: Derived Assets                    │
│  ┌──────────────────┐        ┌──────────────────────────┐   │
│  │   Icon System    │        │   Avatar Scene Variants  │   │
│  │ (UI/product icons│        │ (poses, sizes, contexts) │   │
│  │  inherit tokens) │        │  (inherit character DNA) │   │
│  └──────────────────┘        └──────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Layer 2: Primary Marks                     │
│  ┌──────────────────┐        ┌──────────────────────────┐   │
│  │    Wordmark      │        │   Character / Avatar     │   │
│  │  (AIDX logotype) │        │  (颜小慧 core design)    │   │
│  └──────────────────┘        └──────────────────────────┘   │
│         Both depend on Layer 1 tokens being locked           │
├─────────────────────────────────────────────────────────────┤
│                   Layer 1: Brand Tokens                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Color   │  │  Type-   │  │  Shape   │  │  Brand   │    │
│  │ Palette  │  │ography   │  │ Language │  │  Voice   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│         Foundation — must be decided before anything else    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Brand Tokens | Color palette, typeface choices, shape language (rounded vs sharp), spacing rhythm | Figma styles / design token JSON |
| Wordmark | Text-based logo spelling "AIDX" — primary identification mark | Vector (SVG/AI), multiple lockups |
| Character / Avatar (颜小慧) | Personified brand mascot — emotional anchor, platform face | Illustration files, reference sheet |
| Icon System | Functional UI icons for platform features — must feel like they belong to the same family as the character | SVG icon set, Figma component library |
| Brand Guidelines | Codified rules for all of the above — usage, spacing, color application, do/don't | PDF + Figma doc |

## Recommended Project Structure

```
brand/
├── tokens/                  # Layer 1 — foundation
│   ├── colors.json          # Primary, secondary, neutral, semantic
│   ├── typography.json      # Typeface names, scale, weights
│   └── shape.json           # Corner radius, stroke weight rules
├── wordmark/                # Layer 2a
│   ├── AIDX-wordmark.svg    # Primary horizontal lockup
│   ├── AIDX-wordmark-stacked.svg
│   └── AIDX-favicon.svg     # Reduced mark for small sizes
├── character/               # Layer 2b
│   ├── reference-sheet.png  # Master character reference (proportions, colors)
│   ├── avatar-default.svg   # Standard forward-facing pose
│   ├── avatar-variants/     # Poses, expressions, size adaptations
│   └── character-spec.md    # Personality, visual DNA, usage rules
├── icons/                   # Layer 3a — derived from tokens + character DNA
│   ├── system/              # Core UI icons (nav, actions, status)
│   └── feature/             # Platform-specific feature icons
└── guidelines/              # Layer 4
    ├── brand-guidelines.pdf
    └── brand-guidelines.fig  # Figma source
```

### Structure Rationale

- `tokens/`: Locked first — everything downstream references these values
- `wordmark/` and `character/`: Parallel tracks in Layer 2, but character design typically takes longer and should start first
- `icons/`: Built after character is approved — they must share the same visual DNA (stroke weight, corner radius, color palette)
- `guidelines/`: Written last, documents what was actually built

## Architectural Patterns

### Pattern 1: Token-First Foundation

**What:** Define color palette, typeface, and shape language as explicit named values before drawing anything. These become the "DNA" that all assets inherit.

**When to use:** Always — this is non-negotiable for a consistent system.

**Trade-offs:** Adds upfront time but prevents the most common failure mode (assets that look like they came from different brands).

**Example:**
```
Primary: #[brand-color]
Character skin: uses Primary tint
Wordmark fill: uses Primary
Icon stroke: uses Primary or Neutral
```

### Pattern 2: Character-First for Mascot-Led Brands

**What:** When the brand mascot is the primary identity vehicle (as with 颜小慧 for AIDX), design the character before finalizing the wordmark. The character's visual style should inform the wordmark's personality.

**When to use:** When the mascot is the emotional core of the brand — not just a supporting element.

**Trade-offs:** Wordmark design is slightly delayed, but the result is a wordmark that feels like it belongs to the same world as the character. Doing it in reverse often produces a mismatch.

**Example flow:**
```
Tokens locked → Character designed → Wordmark designed to match character's energy
                                   → Icon system inherits character's line weight + corner radius
```

### Pattern 3: Icon System as Character Extension

**What:** UI icons are not designed independently — they are derived from the character's visual language. Same stroke weight, same corner radius, same color palette.

**When to use:** Always for mascot-led brands. Creates visual coherence between the character and the product UI.

**Trade-offs:** Requires character to be approved before icon work begins. Cannot parallelize these two tracks.

## Data Flow

### Asset Dependency Chain

```
Brand Strategy (personality, values)
    ↓
Brand Tokens (color, type, shape)
    ↓                    ↓
Character Design    Wordmark Design
(颜小慧)            (AIDX logotype)
    ↓
Icon System
(inherits character DNA)
    ↓
Brand Guidelines
(documents all of the above)
```

### Key Data Flows

1. **Token → Character:** Character's color palette must be a subset of brand tokens. Skin tones, clothing colors, and accent colors are all drawn from the token palette.
2. **Character → Icons:** Icon stroke weight, corner radius, and visual style are extracted from the character's illustration style and applied consistently across all icons.
3. **Character + Wordmark → Guidelines:** Guidelines document how the two primary marks relate — minimum spacing, co-usage rules, forbidden combinations.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| MVP (launch) | Core character reference sheet, primary wordmark, 20-30 essential icons, 1-page usage rules |
| Growth (platform expansion) | Full character variant library (poses, expressions), extended icon set, full guidelines PDF |
| Enterprise (partner ecosystem) | Brand API / Figma token library, partner usage kit, localization variants |

### Scaling Priorities

1. **First bottleneck:** Character reference sheet — without a locked reference, every new asset risks visual drift. Lock this before producing any variants.
2. **Second bottleneck:** Icon consistency — as the icon set grows, maintaining visual coherence requires a strict grid and style spec derived from the character.

## Anti-Patterns

### Anti-Pattern 1: Wordmark Before Character

**What people do:** Design the wordmark first because it seems simpler, then design the character to "match" it.

**Why it's wrong:** For mascot-led brands, the character is the emotional core. A wordmark designed without the character's personality tends to feel corporate and disconnected. The character ends up feeling like an afterthought.

**Do this instead:** Lock brand tokens → design character → let character's energy inform wordmark style.

### Anti-Pattern 2: Icons Designed in Isolation

**What people do:** Hire a separate icon designer or use an off-the-shelf icon library without adapting it to the brand.

**Why it's wrong:** Icons that don't share the character's visual DNA break the sense of a unified system. Users subconsciously notice the mismatch even if they can't articulate it.

**Do this instead:** Extract a style spec from the approved character (stroke weight, corner radius, color usage) and use it as the icon design brief.

### Anti-Pattern 3: Guidelines Written During Design

**What people do:** Write brand guidelines in parallel with asset creation to save time.

**Why it's wrong:** Guidelines document decisions. If assets are still changing, guidelines become outdated immediately and create confusion about what's canonical.

**Do this instead:** Write guidelines after each layer is approved and stable. Treat guidelines as the final deliverable of each phase, not a parallel workstream.

### Anti-Pattern 4: Too Many Variants Too Early

**What people do:** Design 20 character poses and expressions before the base character is approved.

**Why it's wrong:** If the base character changes (which it will during review), all variants need rework. This is the most common source of wasted effort in character design projects.

**Do this instead:** Get one canonical reference sheet approved first. Only then produce variants.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Tokens → Character | Character spec references token values by name | Ensures character colors stay in sync with palette |
| Character → Icons | Icon style spec extracted from character reference sheet | Must be documented explicitly, not assumed |
| All assets → Guidelines | Guidelines are the read-only output layer | No asset should be modified to fit guidelines — guidelines document what assets are |
| Brand system → UI design system | Brand tokens feed into UI component library | This is out of scope for current phase but the token structure should anticipate it |

## Sources

- Brand identity system structure: https://inkbotdesign.com/brand-identity-system/ (MEDIUM confidence — verified against multiple sources)
- Enterprise brand identity components: https://vivaldigroup.com/brand-identity-design-enterprise-guide/ (MEDIUM confidence)
- Brand identity design process and build order: https://www.brandvm.com/post/brand-identity-design-process (MEDIUM confidence)
- Character/mascot as brand identity vehicle: https://www.bwmarketingworld.com/article/for-the-love-of-brand-mascots-the-resurgence-of-brand-icons-in-ads-431248 (LOW confidence — single source)
- Computing mascots and their relationship to wordmarks/logos: https://en.wikipedia.org/wiki/List_of_computing_mascots (MEDIUM confidence)
- Design token architecture: https://www.designsystemscollective.com/the-evolution-of-design-system-tokens-a-2025-deep-dive-into-next-generation-figma-structures-969be68adfbe (HIGH confidence — current 2025 source)

---
*Architecture research for: AIDX brand identity system*
*Researched: 2026-04-16*
