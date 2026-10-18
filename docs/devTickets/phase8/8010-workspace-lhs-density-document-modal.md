# 8010 — Workspace LHS density and document open modal

**Status:** Ready  
**Phase:** 8 (follow-on)  
**Depends on:** 8009  
**Relevant scope:** S03 Content Workspace; F03 documents; F08 study history (display only)

## Objective
Make the Content Workspace left column denser and usable: place the scoped quiz list under Documents, tighten document and quiz rows, shrink pagination, and open documents in a modal so review/edit/delete are not trapped in the narrow side panel.

## In scope
- **LHS column order** (under the topic tree): Documents, then Quizzes. Move the scoped quiz list out of the RHS detail panel (`NodeDetails`) into the workspace side column beneath `DocumentsPanel`.
- **RHS detail panel:** keep Study history / recent results (and existing size strip, notes, generate quiz, etc.). Quizzes no longer dominate the detail column.
- **Document list rows:** one compact line — **filename + size only** (still clickable). Drop the separate title line from the list row (title remains available in the open/edit UI).
- **Quiz list rows:** one primary title line; avoid a “double title”. Compact meta on a secondary line only if needed (e.g. question/attempt counts or latest score — not a second title-sized line).
- **Pagination**
  - Quizzes: page size **3**. Heading shows total count (e.g. `Quizzes (12)`). **Previous / Next on the same row as the Quizzes heading** when more than one page exists.
  - Study history recent results: request/display **3** recent results (`recent=3` or equivalent compact default). No new study-history API.
- **Document open UX:** clicking a document opens a **modal** (prefer native `<dialog>` consistent with the existing AI-run dialog pattern) for open / edit / delete. The LHS list stays the compact list (not replaced by the viewer). Closing the modal returns to the list without remounting the whole workspace or clearing unrelated selection/notes state.
  - Upload → extract → review → save may also use the same modal overlay so the narrow column is not swapped for a full form; Cancel/close returns to the list.
- Empty, loading, and error states stay local to Documents, Quizzes, and Study history blocks.
- Keep answer keys, rubrics, expected answers, and source/document bodies out of the list rows (body only inside the open/edit modal after an explicit open).
- Client styles using existing tokens; usable at ~390px width.

## Out of scope
- API / OpenAPI / data-model changes (reuse existing `listQuizzes`, `getStudyHistory`, document CRUD/extract).
- Quiz Library redesign, completeness indicators (7027/7028), or broader workspace redesign beyond denser LHS + document modal.
- Changing Generate quiz, notes editor, topic tree behaviour, or size-summary rules except as needed to relocate Quizzes and host the document modal.
- True multi-page study-history paging beyond the existing `recent` window (no new endpoints).
- Moving Study history onto the LHS.

## Likely implementation areas
- `client-webApp/src/features/content/ContentWorkspace.jsx`
- `client-webApp/src/features/content/DocumentsPanel.jsx`
- `client-webApp/src/features/content/NodeDetails.jsx`
- `client-webApp/src/features/content/ScopeQuizList.jsx`
- `client-webApp/src/features/content/ScopeStudySummary.jsx`
- `client-webApp/src/styles/app.css`
- Optional thin shared dialog chrome reuse from `QuizGeneratePage` / `.ai-run-dialog` patterns (do not couple features tightly)

## Acceptance checks
- [ ] LHS order under the tree: Documents (compact filename + size rows), then Quizzes (page size 3; heading includes total count; Previous/Next aligned with the Quizzes heading when multi-page).
- [ ] RHS detail panel shows Study history / recent results with at most 3 recent results; scoped Quizzes are no longer rendered in `NodeDetails`.
- [ ] Clicking a document opens a modal with existing open / edit / delete capabilities; after close, the document list is still usable and the workspace selection/notes state is intact.
- [ ] Document list rows do not show a separate title line; quiz rows do not show a double title.
- [ ] Empty, loading, and error states remain local; list UIs expose no answer keys, criteria, or source/document body text.
- [ ] Client lint and production build pass. Narrow viewport (~390px) keeps the side column and modal usable (no unusable horizontal overflow for the primary actions).

## Implementation notes
8009 placed Quizzes and Study history together in the detail panel; this ticket splits them for density. Prefer lifting open/edit/review into a dialog while keeping list state in `DocumentsPanel`. Quiz scoping rules from 8007/8009 (`subjectId` vs `topicIds`) must not change.
