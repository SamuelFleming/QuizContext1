# 8009 — Workspace study panel and size summary

**Status:** Ready  
**Phase:** 8 (follow-on)  
**Depends on:** 8006, 8007, 8008, 7013  
**Relevant scope:** S03 Content Workspace; F03; F08 study history

## Objective
On the Content Workspace selected subject or topic, show content size, a paginated quiz list for that scope, and scoped study history—filling the 8006 Quiz history scaffold.

## In scope
- **Size strip** near the detail header (under eyebrow/title): show own characters from `ownContentChars`. When a subtree exists (subject `topicCount > 0`, or topic has nested descendants) and the UI should surface rollup, also show `subtreeContentChars` as “including subtopics” / “with subtopics”. Empty own + non-empty subtree is first-class (e.g. “0 own · 12,400 with subtopics”). When there is no subtree, show a single own total.
- Prefer detail-panel size only. A one-line size on `SubjectsPage` list rows is allowed only if it stays compact and does not clutter the list; otherwise leave the list unchanged.
- Replace the empty Quiz history section with two blocks:
  1. **Quizzes** — paginated list via `listQuizzes({ subjectId })` for a subject, or `listQuizzes({ topicIds: [topicId] })` for a topic. Small page size (e.g. 5), Previous/Next or equivalent, link each row to quiz detail, and explicit empty/loading/error states. Reuse library row patterns lightly; do not embed the full Quiz Library filter chrome.
  2. **Study history** — `getStudyHistory({ subjectId, topicId })` with fixed compact defaults (e.g. `recent=5`; omit activity chart and weakest lists). Show counts (`quizzesSaved`, `quizzesAttempted`, `evaluatedAttempts`), recent results, and `lastStudiedAt`. Extract a thin `ScopeStudySummary` (or similar) under `features/content/`; do not paste the full Dashboard filter bar.
- Wire current `subjectId` and selected `topicId` from `ContentWorkspace` into `NodeDetails`.
- Keep answer keys, rubrics, expected answers, and source bodies out of the panel.
- Client styles for the size strip and panel blocks using existing tokens.

## Out of scope
- Completeness indicators or bar (7027, 7028 stay deferred).
- Quiz Library redesign or new global filters.
- New study-history collection or API shape changes.
- Activity chart / weakest topics/questions on this panel.
- API work covered by 8007 and 8008.

## Likely implementation areas
- `client-webApp/src/features/content/NodeDetails.jsx`
- `client-webApp/src/features/content/ContentWorkspace.jsx`
- New under `features/content/`: e.g. `ContentSizeSummary.jsx`, `ScopeQuizList.jsx`, `ScopeStudySummary.jsx`
- `client-webApp/src/services/quizService.js` (`subjectId` on `listQuizzes`)
- `client-webApp/src/services/studyHistoryService.js` (reuse)
- `client-webApp/src/styles/app.css`

## Acceptance checks
- [ ] Selecting a subject shows size (own, and with-subtopics when topics exist), a paginated quiz list for that subject (including whole-subject quizzes), and study-history counts/recent results for that subject.
- [ ] Selecting a topic shows size (own, and with-subtopics when nested descendants exist), quizzes matching that topic id (`topicId` or `topicIds` membership), and study history scoped to that topic (whole-subject quizzes excluded).
- [ ] A subject with no own notes/docs but topic content shows 0 own and a non-zero with-subtopics total when 8008 fields are present.
- [ ] Empty quiz and empty evaluated-history states are explicit; loading and error states do not break the rest of the detail panel.
- [ ] Rows link to existing quiz/attempt routes; response and UI expose no answer keys, criteria, or source snapshots.
- [ ] Client lint and production build pass. Narrow viewport (~390px) keeps the panel usable.

## Implementation notes
8006 left a heading-only scaffold after Generate quiz. Quiz matching must stay aligned with 7013/7030/8007. Prefer small presentational components over importing the full `StudyHistorySection`.
