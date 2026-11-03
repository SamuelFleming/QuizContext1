# 9006 — Shared study-history UI primitives

**Status:** Planned  
**Phase:** 9  
**Depends on:** 9004, 9005 (props should match business DTOs)  
**Relevant scope:** S02, S03, S05/S06; `docs/design/01_design-concept.md` Light Mint & Indigo

## Objective
Ship general-purpose presentational components for compact paginated lists and score visuals so dashboard, workspace, and quiz screens can compose them—without one mandatory StudyHistoryWidget or internal data fetching.

## In scope
- Place shared components under `client-webApp/src/components/` (e.g. `components/history/` or equivalent once used by 2+ features):
  1. **PaginatingQueryList** — compact rows (quiz or result); Prev/Next (UsagePanel / ScopeQuizList pattern); not full-bleed by default; props: `items`, `pagination`, `onPageChange`, `onSelectRow`, and a row render slot or equivalent.
  2. **ScoreCompletionCircle** — represents a percentage (average score); accessible (text alternative); SVG/CSS using theme tokens.
  3. **ScoreDistributionPlot** — Min | Max | Mean | Last on one scale; token colours only.
  4. **AttemptSeriesChart** — last-N percents as a simple line; `n` and series data via props; subtle motion allowed if it aids reading, not decoration-only.
- No chart library. No fetch inside components—features own loading via `services/`.
- Styles use existing CSS variables from `theme.css` / design concept (primary accent, surfaces, text tokens). Do not hard-code palette hex in components.
- Loading/empty/disabled pagination states are expressible via props.

## Out of scope
- Wiring into Dashboard, workspace, or quiz detail (9007, 9008).
- One mega container every screen must mount.
- Changing business APIs.
- Activity bar chart rewrite (may stay local to StudyHistorySection until 9008 optionally restyles).

## Acceptance checks
- [ ] All four primitives render from props alone in isolation (or a minimal story/demo usage in a feature file if needed for build).
- [ ] PaginatingQueryList invokes `onPageChange` / `onSelectRow` correctly; controls disable at bounds.
- [ ] Score visuals expose accessible names/values for the percent or min/max/mean/last figures.
- [ ] Components reference token names, not hard-coded hex.
- [ ] Client lint / production build pass for the new modules.

## Implementation notes
- Prefer small CSS modules or `app.css` sections consistent with `.compact-item-list` / `.pagination`.
- Keep APIs dumb: data in, events out.
