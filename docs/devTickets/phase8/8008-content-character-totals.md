# 8008 — Content character totals on subject and topic reads

**Status:** Ready  
**Phase:** 8 (follow-on)  
**Depends on:** 7006  
**Relevant scope:** S03; F03; completeness projection

## Objective
Subject and topic list/read payloads include living character totals so summaries can show study-material size without shipping document bodies to the client.

## In scope
- Computed on read in `server-data` (extend the completeness projection path), not stored.
- Always return both fields on subject and topic list/read payloads (stable client contract):
  - `ownContentChars` — character length of own `notes` (as stored) plus the sum of `content` lengths for documents attached to that node only (subject: `topicId` null; topic: that topic id).
  - `subtreeContentChars` — `ownContentChars` plus the same measure for every descendant topic. For a subject, include subject-level own content plus every topic under that subject. For a topic, include that topic plus nested descendants. When there is no subtree, `subtreeContentChars === ownContentChars`.
- Description is excluded (same study-body boundary as `contentComplete`: notes and documents feed quizzes; description does not).
- Aggregation must not load full document bodies into list responses (length aggregation / projected length sums only).
- Add the fields on existing owner-scoped subject and topic payloads in both APIs. The browser keeps calling `server-webApp` only.
- Update Swagger/OpenAPI on both APIs.

## Out of scope
- Word counts.
- Including description in the totals.
- UI (8009).
- Changing `contentComplete`, `hasNotes`, `documentCount`, or related completeness rules.
- A stored total, separate collection, or backfill job.

## Likely implementation areas
- `server-data/src/utils/completeness.js` (or adjacent size helper)
- `server-data/src/repositories/subjectRepository.js`
- `server-data/src/repositories/topicRepository.js` (and document length aggregation)
- `server-data/src/models/subject.js`, `server-data/src/models/topic.js`
- `server-data/src/openapi/components.js`
- `server-webApp/src/openapi/components.js` (pass-through schemas)

## Acceptance checks
- [ ] A topic with notes of length N and one document of length M reports `ownContentChars = N + M` and the same `subtreeContentChars` when it has no children.
- [ ] A subject with empty own notes/docs and topics that have content reports `ownContentChars = 0` and `subtreeContentChars` equal to the sum of those topics' own content (plus nested descendants).
- [ ] A topic's `subtreeContentChars` includes nested descendant notes/docs and does not include sibling topics.
- [ ] List and read payloads include both fields; document `content` bodies are not added to list responses to compute them.
- [ ] User B's totals never include user A's content; cross-user subject/topic read stays 404.
- [ ] Both live OpenAPI documents include the new fields. No new route.

## Implementation notes
Reuse ownership filters already used for `documentCount`. Prefer Mongo `$strLenCP` (or equivalent) on `content` and notes rather than fetching strings. Keep description out so parents that only hold structure still show useful “with subtopics” size in 8009.
