# AIDX Website

The AIDX product website — a static Next.js site (mirroring the Ghostty website architecture) with an animated terminal homepage, MDX docs, and standalone brand asset pages.

## Language

**Brand Design Page**:
The standalone static brand assets report (`/brand-report.html`) presenting AIDX logos, color palette, and asset inventory. Lives outside the Next.js route tree.
_Avoid_: Brand page, preview page, brand report (when referring to the linked page)

**Chrome**:
The shared Navbar and Footer wrapping every page except those listed in `NO_CHROME_PATHS`. The homepage renders without chrome, so homepage links must live in the homepage content itself.

**Homepage CTA Buttons**:
The row of `ButtonLink`s under the homepage tagline. The primary (brand-themed) button links to the Brand Design Page as "Brand Design"; the neutral button links to Docs.
_Avoid_: Get Started (retired as the primary homepage CTA)
