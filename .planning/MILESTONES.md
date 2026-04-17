# Milestones

## v1.0 MVP (Shipped: 2026-04-17)

**Phases completed:** 3 phases, 9 plans, 8 tasks

**Key accomplishments:**

- Next.js 16 + Biome 2.4.4 project config with MDX pipeline, full CSS token set, Pretendard font, and src/ skeleton — mirroring Ghostty website architecture exactly
- All CSS tokens, Pretendard font, style types, and MDX plugin stubs verified in place — dev server boots cleanly in 228ms with no module resolution errors
- Full component library: Text, Link, Button, Terminal, AnimatedTerminal, Navbar, Footer, NavTree, Sidecar, Breadcrumbs, JumplinkHeader, CodeBlock, Callout, Blockquote + all lib/docs utilities
- Root layout with AIDX metadata and SVG favicon, homepage server component loading terminal frames, HomeContent client component with animated terminal hero and Get Started/Documentation CTAs
- Docs catch-all route with static params generation, DocsPageContent with sidebar/sidecar layout, text-only 404 page with force-static, and AIDX v1 MDX component map
- Static build passes (exit 0), Biome lint clean across 33 files — all 4 routes prerendered as static HTML

---
