<!-- GSD:project-start source:PROJECT.md -->
## Project

**AIDX Website**

AIDX is an AI-powered developer experience product. This project refactors the current static HTML prototype into a production-grade Next.js website using the same architecture as the Ghostty website — App Router, MDX-based docs, animated terminal hero, CSS Modules, TypeScript, and Biome for linting/formatting.

**Core Value:** A polished, fast, fully-static Next.js site with an animated terminal hero on the homepage and MDX-driven documentation — mirroring the Ghostty website architecture exactly.

### Constraints

- **Tech Stack**: Must mirror Ghostty website architecture exactly — Next.js App Router, CSS Modules, TypeScript, Biome, MDX
- **Static**: No server-side rendering, no API routes, no serverless functions
- **Fonts**: Pretendard Std Variable (local woff2) + JetBrains Mono (Google Fonts)
- **Brand**: AIDX brand color `#3A5ECF`, dark theme `#0f0f11` background

### Template Reference

The Ghostty website (`https://github.com/ghostty-org/website.git`) is the canonical template for this project. It is included as a git subtree at `./ghostty/`. The AIDX site must match its architecture, layout, and visual quality as closely as possible, adapted to AIDX brand and content.

To update the subtree: `git subtree pull --prefix=ghostty https://github.com/ghostty-org/website.git main --squash`
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->



## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes
