# Requirements: v1.2 Brand Asset Organization

## Goal

Consolidate all brand design assets scattered in the repo root into a proper project structure, and serve brand-report.html as a static web page.

## Scope

This milestone covers:
1. Moving all brand SVG assets into `src/assets/brand/`
2. Hosting `brand-report.html` as a static page via `public/`
3. Moving photo assets to `public/brand/photos/`
4. Moving utility scripts to `scripts/`
5. Archiving or deleting loose files (zip, ghostty-shots)
6. Updating any import paths that reference moved files

## Functional Requirements

### FR-1: Brand SVG Asset Consolidation
- All brand SVGs currently in repo root must move to `src/assets/brand/`
- Files: `aidx-icon.svg`, `aidx-icon-dark.svg`, `aidx-icon-motion.svg`, `aidx-wordmark.svg`, `aidx-wordmark-dark.svg`, `logo-wordmark-only.svg`, `logo-wordmark-only-dark.svg`, `logo-favicon.svg`, `logo-favicon-dark.svg`, `avatar-unified.svg`, `avatar-unified-dark.svg`, `avatar-terminal.svg`, `avatar-terminal-dark.svg`, `avatar-cyber-holo-v2.svg`
- The navbar `src/components/navbar/aidx-wordmark.svg` should be replaced by a symlink or import from `src/assets/brand/aidx-wordmark.svg` to eliminate duplication

### FR-2: Brand Report Static Hosting
- `brand-report.html` must move to `public/brand-report.html`
- It must be accessible at `http://localhost:3000/brand-report.html` (and in production)
- No modifications to the HTML content required — serve as-is

### FR-3: Photo Assets
- `xiaohuiyan.jpg`, `xiaohuiyan.png`, `xiaohuiyan-avatar.png` → `public/brand/photos/`

### FR-4: Utility Scripts
- `generate-frames.js`, `variants.js` → `scripts/`

### FR-5: Cleanup
- `aidx-brand-assets.zip` → delete (redundant with organized files in repo)
- `ghostty-shots/` → `scripts/ghostty-shots/` (reference material for frame generation)
- `preview.html` → move to `public/preview.html` if useful, or delete

## Non-Functional Requirements

- NFR-1: Static build must still pass (`next build`) after all moves
- NFR-2: Import paths in `src/` must be updated if any moved SVGs are referenced
- NFR-3: `public/` directory SVGs (favicon.svg, aidx-logo.svg) are NOT affected — already correct

## Out of Scope

- Converting SVGs to React components (separate design system task)
- Creating a new `/brand` Next.js route (user opted for static HTML)
- Updating docs content referencing brand assets
- PNG favicon generation (deferred to v2)
