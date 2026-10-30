# 9008 — Compose workspace and dashboard history UI

**Status:** Done  
**Phase:** 9  
**Depends on:** 9003, 9005, 9006  
**Relevant scope:** F08; S02 Dashboard; S03 Content Workspace; 7014 / 8009 / 8010

## Objective
Wire shared list and stats primitives into the dashboard study section and the subject/topic workspace summary; remove duplicated recent-result markup; call purpose-built business endpoints for each screen.

## In scope
- **Dashboard** (`StudyHistorySection`): keep rich overview (filters, activity, weakest). Swap duplicated list markup to **PaginatingQueryList** (and inject circle/distribution/series where the evolved dashboard DTO from 9003 supports them). Retain weakest lists (restyle lightly if needed). Continue using evolved `GET /study-history`.
- **Workspace** (`ScopeStudySummary` / study panel): call `GET /subjects/:subjectId/history` (9005 client) with optional `topicId`; default page size **3**. Use shared list + stats primitives; stop copying recent-result markup from the dashboard section.
- Keep **ScopeQuizList** on `GET /quizzes` with page size 3 (8010 density); do not merge quiz list into the history endpoint.
- Explicit loading/empty/error for both surfaces.
- No mega StudyHistoryWidget that every screen must mount.
- No answer keys, rubrics, explanations, responses, or snapshots.

## Out of scope
- Rewriting unrelated dashboard subject cards except where they already consume history APIs.
- Quiz detail composition (9007).
- Activity chart rewrite beyond token-safe reuse.
- New API shapes (use 9003 / 9005 as shipped).

## Acceptance checks
- [x] Dashboard study section still filters by subject/topic/activity and shows counts, activity, recent results (paginated), and weakest lists.
- [x] Workspace subject/topic summary shows counts, paginated recent results (page size 3), and shared stats visuals when data exists; no duplicated recent-result component markup with the dashboard.
- [x] ScopeQuizList pagination behaviour remains (page size 3).
- [x] Empty and error states are explicit; payloads/UI expose no keys or snapshots.
- [x] Client lint and production build pass. ~390px layout remains usable.

## Implementation notes
- Deduplicate by extracting shared presentational usage of 9006 primitives; delete or thin `ScopeStudySummary` / local `RecentResults` copies once unused.
- Dashboard may still own filter chrome and activity chart locally.
- Shared presentational pieces live in `components/history/`: `HistoryCounts` and `RecentResultsList` (wraps `PaginatingQueryList`). Features still own fetch.
- 9003 public DTO has counts, activity, weakest lists, paginated `recentResults` — not `avgPercent`, distribution, or `attemptSeries`. Dashboard therefore does not mount circle/distribution/series. Workspace 9005 DTO has those stats (no series), so the workspace panel shows the circle and distribution only.
