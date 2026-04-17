# Phase 3: Pages, Docs & Build - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 03-pages-docs-build
**Areas discussed:** Homepage copy, Docs content, Nav & site metadata, Favicon & public assets

---

## Homepage copy

| Option | Description | Selected |
|--------|-------------|----------|
| Write it now (I'll tell you) | Something like 'AIDX is an AI-powered developer experience platform.' Short, product-focused. | |
| Placeholder for now | Use a placeholder like 'AIDX — AI-powered developer experience.' Easy to swap later. | |
| Derive from aidx-landing.html | Copy Ghostty's tagline structure but swap product nouns — fill in from the existing landing page HTML. | ✓ |

**User's choice:** Derive from aidx-landing.html

---

| Option | Description | Selected |
|--------|-------------|----------|
| Use landing page copy as-is | Tagline: 'AI-powered Developer Experience Platform. Accelerate your development workflow with intelligent tools.' CTAs: 'Get Started' (primary) + 'Documentation' (secondary) | ✓ |
| Tweak the CTAs | Keep the tagline but change CTAs | |
| Other | I'll provide different copy entirely. | |

**User's choice:** Use landing page copy as-is

---

| Option | Description | Selected |
|--------|-------------|----------|
| > AIDX | Terminal title shows '> AIDX' matching the landing page h2 label. | ✓ |
| 🤖 AIDX | Terminal title shows '🤖 AIDX' — adds a visual icon like Ghostty uses 👻. | |
| AIDX | Terminal title shows 'AIDX' — clean, no prefix. | |

**User's choice:** > AIDX

---

## Docs content

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal placeholder content | Create docs/index.mdx + one page like 'Getting Started' or 'Overview' with placeholder content. Easy to replace later. | ✓ |
| I'll specify the content | I'll describe the sections and topics I want covered. | |
| Mirror Ghostty docs structure | Copy structure from Ghostty docs (about, install, config sections) and adapt titles to AIDX. | |

**User's choice:** Minimal placeholder content

---

| Option | Description | Selected |
|--------|-------------|----------|
| One section, two pages | nav.json has one section 'Getting Started' with two pages: 'Overview' (index.mdx) and 'Quick Start'. | ✓ |
| Two sections, one page each | nav.json has two sections: 'Getting Started' and 'Guides', each with one page. | |
| Claude's discretion | You decide the structure. | |

**User's choice:** One section, two pages

---

## Nav & site metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Docs + GitHub | Docs + GitHub (link TBD, use placeholder). Minimal — matches what AIDX has right now. | ✓ |
| Docs + GitHub + Discord | Docs + GitHub + Discord. Same as Ghostty's nav structure. | |
| Other | I'll specify the links. | |

**User's choice:** Docs + GitHub

---

| Option | Description | Selected |
|--------|-------------|----------|
| aidx.dev | title: 'AIDX', description: 'AI-powered Developer Experience Platform', metadataBase: 'https://aidx.dev' | |
| Placeholder URL for now | title: 'AIDX', description from landing page, metadataBase: placeholder 'https://example.com' | ✓ |
| Other | I'll provide the domain/description. | |

**User's choice:** Placeholder URL for now

---

## Favicon & public assets

| Option | Description | Selected |
|--------|-------------|----------|
| Generate at build time (script) | Use sharp/jimp in a build script to generate PNG variants from logo-favicon.svg at build time. | |
| Pre-generate and commit | Pre-generate the PNG files now using a one-off script and commit them to public/. | |
| SVG-only for now | Use logo-favicon.svg as-is for now. Modern browsers support SVG favicons. Add PNGs later. | ✓ |

**User's choice:** SVG-only for now

---

| Option | Description | Selected |
|--------|-------------|----------|
| SVG only — minimal | Copy logo-favicon.svg → public/favicon.svg and public/aidx-logo.svg. That's it. | ✓ |
| SVG + favicon.ico | Copy SVGs to public/ and also add a favicon.ico. | |

**User's choice:** SVG only — minimal

---

## Claude's Discretion

- Exact CSS token adjustments in copied page CSS Modules
- `NO_CHROME_PATHS` value in `layout.tsx` (keep `["/"]`)
- Footer copyright text
- `"Get Started"` CTA href (placeholder `#` until destination defined)

## Deferred Ideas

None — discussion stayed within phase scope.
