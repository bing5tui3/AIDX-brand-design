# Pitfalls Research

**Domain:** Brand identity design for tech platform (character avatar, icon system, wordmark)
**Researched:** 2026-04-16
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Avatar Character Without a Defined Personality Bible

**What goes wrong:**
颜小慧 gets drawn differently by different contributors or across different phases — expression range, proportions, color values, and personality tone drift. The character becomes inconsistent across UI, marketing, and documentation contexts.

**Why it happens:**
Teams start with a single reference illustration and assume it's enough. Without a documented character spec (personality traits, expression library, pose constraints, forbidden uses), every new asset is a fresh interpretation.

**How to avoid:**
Before producing any derivative assets, create a character bible: canonical proportions sheet, color values (not just swatches — exact hex/HSL), defined expression states (neutral, happy, thinking, error), and explicit rules for what the character cannot do (e.g., no aggressive poses, no off-brand contexts).

**Warning signs:**
- Two versions of the avatar look like different characters at a glance
- Team members ask "which version is correct?" when referencing the avatar
- Avatar color values differ between Figma components and exported assets

**Phase to address:**
Avatar design phase — character bible must be the first deliverable, before any scene or variant work begins.

---

### Pitfall 2: Icon System Built Without a Grid and Stroke Contract

**What goes wrong:**
Icons look visually inconsistent — some feel heavy, some feel thin, some have rounded corners while others are sharp. At 16px or 20px (common UI sizes), icons become illegible or lose their meaning.

**Why it happens:**
Icons are designed at 48px or 64px where everything looks fine, then exported at small sizes without testing. No shared grid (e.g., 24px canvas with 2px padding) or stroke weight contract (e.g., 1.5px uniform stroke) is established upfront.

**How to avoid:**
Define the icon grid before drawing a single icon: canvas size, safe zone padding, stroke weight, corner radius, and whether icons are filled or outlined. Test every icon at 16px and 20px before accepting it. Use a single source-of-truth Figma component with auto-layout constraints.

**Warning signs:**
- Icons look fine in design review but feel "off" in the actual UI
- Some icons use fills, others use strokes — no rule exists
- Exported SVGs have inconsistent viewBox dimensions

**Phase to address:**
Icon system phase — grid spec must precede all icon drawing.

---

### Pitfall 3: Wordmark Tied to a Font Without Licensing Verification

**What goes wrong:**
The wordmark is designed using a commercial typeface. Later, the font license prohibits logo use, embedding in apps, or use in certain regions. The wordmark must be redrawn or the font replaced — expensive rework.

**Why it happens:**
Designers pick fonts for aesthetics and assume "we bought the font" covers all uses. Font licenses have specific clauses: desktop use, web embedding, app embedding, logo/trademark use, and broadcast are often separate licenses.

**How to avoid:**
Before finalizing the wordmark typeface, verify the license explicitly covers: logo/trademark use, web embedding (WOFF), app embedding, and commercial use without per-seat limits. Prefer converting the wordmark to outlines (paths) immediately after approval — this removes the font dependency entirely and makes the wordmark a standalone vector asset.

**Warning signs:**
- Wordmark file still references a live font rather than outlined paths
- Font was sourced from a free font site without checking the license
- No license documentation exists alongside the brand assets

**Phase to address:**
Wordmark design phase — license check before any design work; outline conversion before handoff.

---

### Pitfall 4: Brand Assets Not Prepared for Dark Mode and Reversed Contexts

**What goes wrong:**
The wordmark and avatar look great on white backgrounds. On dark UI surfaces, in dark mode, or on colored backgrounds, they become invisible, muddy, or clash with the surface. No dark-mode variants exist, so developers improvise — often badly.

**Why it happens:**
Brand design is done on white artboards. Dark mode is treated as a "later" problem. By the time the platform ships dark mode, the brand assets are already locked and no one owns the variant work.

**How to avoid:**
For every primary brand asset (wordmark, avatar, icon set), produce: light-background version, dark-background version, and monochrome/single-color version. Define which version is used in which context in the brand guidelines. Test on the actual platform background colors, not just white and black.

**Warning signs:**
- Brand guidelines only show assets on white backgrounds
- No monochrome version of the wordmark exists
- Developers are using CSS `filter: invert()` on the logo as a workaround

**Phase to address:**
Brand guidelines phase — variant production is part of the asset delivery checklist, not an afterthought.

---

### Pitfall 5: Icon Metaphors That Don't Translate Across Cultures

**What goes wrong:**
Icons use metaphors that are intuitive in one cultural context but confusing or offensive in another. For a platform like AIDX that may serve Chinese and international users, this is a real risk — e.g., hand gestures, directional arrows, color meanings.

**Why it happens:**
Icon designers default to Western UI conventions (e.g., a mailbox for email, a house for home) without checking whether those metaphors are universally understood. Color meanings also differ: red means danger in Western contexts but luck/success in Chinese contexts.

**How to avoid:**
For each icon, ask: does this metaphor work for both Chinese and international users? Prefer abstract/universal metaphors over culturally specific ones. For color-coded icons, test meaning with target users from both cultural contexts. Reference established icon libraries (Material Design, SF Symbols) as a baseline for universally understood metaphors.

**Warning signs:**
- Icons were designed by a single designer without cross-cultural review
- Color is the only differentiator between icon states (e.g., red = error, green = success — problematic for colorblind users and culturally ambiguous)
- No user testing was done on icon comprehension

**Phase to address:**
Icon system phase — cultural review checkpoint before finalizing the icon set.

---

### Pitfall 6: Mascot/Avatar Designed Only at One Scale

**What goes wrong:**
颜小慧 is designed as a detailed full-body or bust illustration. When used as a 32px avatar, 16px favicon, or small UI indicator, the detail collapses and the character becomes unrecognizable. No simplified variants exist for small sizes.

**Why it happens:**
The hero illustration is the focus. Small-size variants feel like "just resize it" — but detailed characters don't scale down gracefully. Hair, facial features, and accessories merge into noise.

**How to avoid:**
Design explicit scale variants: full illustration (for hero/marketing), simplified bust (for profile/avatar contexts), icon-scale mark (for 32px and below). Each variant should be purpose-built, not a mechanical resize. The icon-scale mark may be an abstract reduction of the character's most distinctive feature (e.g., a simplified face or signature element).

**Warning signs:**
- The avatar looks blurry or unrecognizable at 32px
- No favicon version of the brand mark exists
- Developers are using the full illustration at small sizes with CSS scaling

**Phase to address:**
Avatar design phase — scale variants are a required deliverable alongside the hero illustration.

---

### Pitfall 7: Brand Guidelines That Are a PDF, Not a Living System

**What goes wrong:**
Brand guidelines are delivered as a static PDF or Figma file. Developers can't extract exact values. The file goes out of date immediately. New team members can't find it. Assets get re-exported inconsistently.

**Why it happens:**
Brand guidelines are treated as a design deliverable, not a system. The assumption is "designers will manage this" — but in practice, developers need machine-readable values (hex codes, spacing units, font names) and engineers need exportable assets.

**How to avoid:**
Deliver brand guidelines as: (1) a Figma library with components and styles that can be inspected for exact values, (2) a written spec document with copy-pasteable values, and (3) an asset export folder with named, versioned files in all required formats (SVG, PNG @1x/2x/3x, WebP). Define a naming convention for all assets upfront.

**Warning signs:**
- Brand guidelines exist only as a PDF
- Developers are asking designers for hex codes that are already "in the guidelines"
- Multiple versions of the same asset exist with no clear canonical source

**Phase to address:**
Brand guidelines phase — delivery format is part of the phase definition, not an afterthought.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip character bible, use single reference image | Faster start | Character drift across all future assets, expensive retroactive standardization | Never |
| Use live font in wordmark (don't outline) | Easier to edit | Font license risk, dependency on font availability in all environments | Never for final delivery |
| Design icons only at 48px, skip small-size testing | Faster icon production | Illegible icons in actual UI, requires redesign | Never |
| Deliver brand guidelines as PDF only | Faster to produce | Developers can't extract values, assets get re-exported inconsistently | MVP only, must be replaced |
| Skip dark mode variants | Faster initial delivery | Developers improvise dark mode handling, brand inconsistency | MVP only if dark mode is explicitly out of scope |
| Single avatar scale (no small variants) | Less design work | Unusable at small sizes, developers use CSS scaling hacks | Never if avatar appears in UI |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Figma → Dev handoff | Exporting raster PNGs for icons instead of SVG | Export all icons as SVG with clean paths; provide PNG fallbacks only for environments that don't support SVG |
| SVG assets in web/app | Leaving design tool metadata (Figma layer names, unused defs) in exported SVGs | Run all SVGs through SVGO or equivalent optimizer before delivery |
| Font in wordmark | Embedding font file in SVG export | Convert wordmark to outlined paths; SVG should contain only path data |
| Avatar in UI components | Using the full-detail illustration at all sizes | Use the appropriate scale variant per context; document which variant maps to which use case |
| Brand colors in code | Hardcoding hex values in components | Define brand colors as design tokens; reference tokens in all implementations |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimized SVG exports from Figma | Large file sizes, slow page loads, SVGs with embedded fonts or raster images | Run SVGO on all SVG exports; audit file sizes before delivery | Any production use |
| Full-resolution avatar used everywhere | Slow load on mobile, layout shift | Provide responsive image variants; use appropriate size per context | Mobile/low-bandwidth contexts |
| Icon font instead of SVG sprite or inline SVG | Flash of unstyled icons, accessibility issues, harder to maintain | Use SVG-based icon system from the start | Any scale beyond prototype |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Avatar character with only one expression | Feels static and robotic; misses opportunity for emotional connection | Design a minimum expression set: neutral, positive, thinking/loading, error/sorry |
| Icons without text labels in navigation | Users can't learn icon meanings; high error rate for new users | Always pair icons with labels in primary navigation; icon-only acceptable only for well-established conventions |
| Brand colors chosen for aesthetics only, not accessibility | Text on brand-colored backgrounds fails WCAG contrast requirements | Check all brand color combinations against WCAG AA contrast ratios during color palette definition |
| Mascot used in error states without appropriate expression | Feels tone-deaf; a smiling mascot on an error page is jarring | Map mascot expressions to UI states; error states need an appropriate (concerned/apologetic) expression |

---

## "Looks Done But Isn't" Checklist

- [ ] **Avatar:** Has scale variants (hero, bust/avatar, icon-scale) — verify all three exist as separate files
- [ ] **Avatar:** Has expression variants (neutral, positive, thinking, error) — verify each is documented in character bible
- [ ] **Wordmark:** Is outlined (no live font dependency) — verify SVG contains only path elements, no `<text>` or `<font>` tags
- [ ] **Wordmark:** Has dark-mode/reversed variant — verify dark background version exists
- [ ] **Icon system:** All icons tested at 16px and 20px — verify legibility at smallest intended size
- [ ] **Icon system:** All SVGs optimized (no Figma metadata) — verify file size and clean path data
- [ ] **Brand colors:** All color combinations checked for WCAG AA contrast — verify contrast ratios documented
- [ ] **Brand guidelines:** Values are machine-readable (not just visual) — verify hex codes, font names, spacing values are copy-pasteable
- [ ] **Font license:** Covers logo/trademark, web, and app use — verify license documentation exists

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Character drift (no bible) | HIGH | Audit all existing assets, pick canonical version, retroactively document character bible, redraw non-conforming assets |
| Font license violation in wordmark | HIGH | Identify compliant replacement font or commission custom lettering, redraw wordmark, update all instances |
| No dark mode variants | MEDIUM | Design dark variants for all primary assets, update brand guidelines, audit all platform surfaces |
| Unoptimized SVGs in production | LOW | Run batch SVGO optimization, re-export from Figma with clean settings, replace in codebase |
| Icon illegibility at small sizes | MEDIUM | Identify failing icons, redesign with simplified forms, re-export and replace |
| PDF-only brand guidelines | MEDIUM | Migrate to Figma library with inspectable styles, create asset export folder with versioned files |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| No character bible | Avatar design phase (first deliverable) | Character bible document exists before any variant work begins |
| Icon grid not defined | Icon system phase (before drawing) | Grid spec document approved before first icon is drawn |
| Font license not verified | Wordmark phase (before design starts) | License documentation on file; wordmark delivered as outlined paths |
| No dark mode variants | Brand guidelines phase | Dark and monochrome variants exist for all primary assets |
| Cultural metaphor issues in icons | Icon system phase (review checkpoint) | Cross-cultural review completed; no culturally specific metaphors without validation |
| Single avatar scale only | Avatar design phase | Three scale variants delivered: hero, bust, icon-scale |
| Brand guidelines as PDF only | Brand guidelines phase | Figma library + written spec + asset export folder all delivered |

---

## Sources

- [The Worst Mascots In History — DreamFarm Agency](https://dreamfarmagency.com/blog/brand-mascot-failures-the-worst-mascots-in-history/)
- [What To Do If People Hate Your Brand Mascot — Smashing Magazine](https://www.smashingmagazine.com/2020/02/people-hate-brand-mascot-guide)
- [Brand Mascots in B2B Tech — Everything Design](https://www.everything.design/blog/brand-mascots-b2b-tech)
- [Icon Design Principles That Hold Up at Small Sizes](https://freeicoconverter.com/blog/design-principles.html)
- [SVG Icons for UI & Software Designers — Creative Freedom](https://www.creativefreedom.co.uk/icon-designers-blog/svg-icons-for-ui-and-software-designers-myths-and-best-practices/)
- [SVG Logos and Asset Pipelines — Monotonomo](https://www.monotonomo.com/journal/svg-logos-asset-pipelines/)
- [Color adjustment of brand logos for dark mode display — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12822999/)
- [5 Design-to-Development Handoff Mistakes — Webstacks](https://webstacks.com/blog/design-to-developer-handoff-mistakes)
- [The Complete Wordmark Logo Design Guide — X-Design](https://www.x-design.com/resources/the-complete-wordmark-logo-design-guide)
- [How Visual Systems Break — Designer Daily](https://www.designer-daily.com/designing-for-scale-how-visual-systems-break-and-how-to-make-them-resilient-201751)
- [Fix This on Your Logo Before You Scale — Aneeverse](https://www.aneeverse.com/blog/fix-this-on-your-logo-before-you-scale)

---
*Pitfalls research for: AIDX brand identity (character avatar, icon system, wordmark)*
*Researched: 2026-04-16*
