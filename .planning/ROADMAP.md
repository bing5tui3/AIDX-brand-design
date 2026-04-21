# Roadmap: AIDX Website

## Milestones

- ✅ **v1.0 MVP** — Phases 1–3 (shipped 2026-04-17)
- ✅ **v1.1 Animation Fix** — Phase 4 (shipped 2026-04-17)
- ✅ **v1.2 Brand Asset Organization** — Phase 5 (shipped 2026-04-17)
- ✅ **v1.3 Eye Animation Enhancement** — Phase 6 (shipped 2026-04-19)
- 🔄 **v1.4 Animation Performance Optimization** — Phases 7–8 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–3) — SHIPPED 2026-04-17</summary>

- [x] Phase 1: Project Scaffold (2/2 plans) — completed 2026-04-16
- [x] Phase 2: Component Library (3/3 plans) — completed 2026-04-17
- [x] Phase 3: Pages, Docs & Build (4/4 plans) — completed 2026-04-17

</details>

<details>
<summary>✅ v1.1 Animation Fix (Phase 4) — SHIPPED 2026-04-17</summary>

- [x] Phase 4: Animation Color & Smoothness Fix (2/2 plans) — completed 2026-04-17

</details>

<details>
<summary>✅ v1.2 Brand Asset Organization (Phase 5) — SHIPPED 2026-04-17</summary>

- [x] Phase 5: Brand Asset Organization (1/1 plans) — completed 2026-04-17

</details>

<details>
<summary>✅ v1.3 Eye Animation Enhancement (Phase 6) — SHIPPED 2026-04-19</summary>

- [x] Phase 6: Eye Animation Enhancement (2/2 plans) — completed 2026-04-19

</details>

### v1.4 Animation Performance Optimization

- [ ] **Phase 7: Terminal Component Hardening** - Expose content ref and stabilize line keys so React reuses DOM nodes across frames
- [ ] **Phase 8: AnimatedTerminal DOM Patching & Lifecycle** - Bypass React re-renders for frame updates, fix lifecycle correctness, add CSS GPU hints and accessibility

## Phase Details

### Phase 7: Terminal Component Hardening
**Goal**: Terminal component is ref-forwarding and uses stable keys so React never recreates DOM nodes for unchanged lines
**Depends on**: Phase 6
**Requirements**: RENDER-01, RENDER-02
**Success Criteria** (what must be TRUE):
  1. AnimatedTerminal can obtain a direct ref to the Terminal's inner content element without prop drilling
  2. Switching animation frames does not cause React to unmount and remount line divs that haven't changed
  3. Static build passes with no TypeScript or Biome errors after the changes
**Plans**: 1 plan

Plans:
- [ ] 07-01-PLAN.md — Apply forwardRef wrapper and stable key={i} to Terminal component

### Phase 8: AnimatedTerminal DOM Patching & Lifecycle
**Goal**: Animation frame updates bypass React reconciliation entirely, the animation pauses correctly on tab switch and reduced-motion preference, and the terminal is GPU-composited with no screen reader noise
**Depends on**: Phase 7
**Requirements**: RENDER-03, LIFE-01, LIFE-02, LIFE-03, CSS-01, CSS-02, A11Y-01
**Success Criteria** (what must be TRUE):
  1. Advancing to the next animation frame does not trigger a React re-render — only a direct innerHTML write on the content element
  2. Switching browser tabs pauses the animation; returning to the tab resumes it from where it stopped
  3. With `prefers-reduced-motion: reduce` set, the animation stays paused even if the media query changes after initial mount
  4. Unmounting the component (e.g. navigating away) cancels the rAF loop with no console errors
  5. Screen readers do not announce frame content changes as the animation runs
**Plans**: 1 plan

Plans:
- [ ] 08-01-PLAN.md — Refactor AnimatedTerminal to direct innerHTML, fix lifecycle bugs, add CSS hints and aria-live

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Project Scaffold | v1.0 | 2/2 | Complete | 2026-04-16 |
| 2. Component Library | v1.0 | 3/3 | Complete | 2026-04-17 |
| 3. Pages, Docs & Build | v1.0 | 4/4 | Complete | 2026-04-17 |
| 4. Animation Color & Smoothness Fix | v1.1 | 2/2 | Complete | 2026-04-17 |
| 5. Brand Asset Organization | v1.2 | 1/1 | Complete | 2026-04-17 |
| 6. Eye Animation Enhancement | v1.3 | 2/2 | Complete | 2026-04-19 |
| 7. Terminal Component Hardening | v1.4 | 0/? | Not started | - |
| 8. AnimatedTerminal DOM Patching & Lifecycle | v1.4 | 0/? | Not started | - |
