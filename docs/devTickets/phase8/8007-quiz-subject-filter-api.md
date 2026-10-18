# 8007 — Quiz library `subjectId` filter

**Status:** Ready  
**Phase:** 8 (follow-on)  
**Depends on:** 7030  
**Relevant scope:** S03; S04; F05; 7013 topic/subject matching

## Objective
Owner-scoped `GET /quizzes` can filter by one `subjectId` so the Content Workspace can list every quiz for a subject, including whole-subject quizzes.

## In scope
- Add optional `subjectId` on the business and data quiz list queries.
- Match quizzes where `quiz.subjectId` equals that id. Unknown or another user's subject is 404 (same ownership pattern as `GET /study-history`).
- Combine with existing filters: `subjectId` + `topicIds` means quizzes in that subject that also match the topic OR rule (`topicId` or membership in `topicIds`). Count filters and sorts stay unchanged.
- `topicIds` alone keeps current semantics (whole-subject quizzes excluded).
- Update Swagger/OpenAPI on both APIs.

## Out of scope
- Frontend / workspace panel (8009).
- Returning answer keys, marking criteria, or source snapshots.
- Changing topic-filter OR semantics, pagination bounds, or attempt-summary loading.
- Title search, difficulty, context-mode, or date-range filters.

## Likely implementation areas
- `server-webApp/src/services/quizService.js` (`readListQuery`)
- `server-webApp/src/services/dataApi/quizzes.js`
- `server-webApp/src/openapi/paths/quizzes.js`
- `server-data/src/controllers/quizController.js`
- `server-data/src/repositories/quizRepository.js`
- `server-data/src/openapi/paths/quizzes.js`

## Acceptance checks
- [ ] `GET /quizzes?subjectId=` returns only that subject's quizzes, including whole-subject quizzes, with correct pagination totals.
- [ ] `subjectId` + `topicIds` returns only quizzes in that subject that match the topic OR rule; whole-subject quizzes are excluded when `topicIds` is present.
- [ ] Unknown or other-user `subjectId` is 404. Missing JWT is 401. Malformed `subjectId` is 400.
- [ ] Existing list behaviour without `subjectId` is unchanged.
- [ ] Both live OpenAPI documents include `subjectId`.

## Implementation notes
7030 left subject filtering out of scope. Reuse the study-history ownership check pattern for the subject id before querying. Filtering stays in `server-data` under the trusted `X-User-Id`.
