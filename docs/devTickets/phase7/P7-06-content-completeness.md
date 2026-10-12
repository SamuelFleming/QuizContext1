# P7-06 — Content completeness on subject and topic reads

**Status:** Planned  
**Phase:** 7  
**Depends on:** None  
**Relevant scope:** Phase 7 README; F03; S02; S03

## Objective
Subject and topic reads say whether that entity has its own study text, using one rule the workspace and the quiz picker can share.

## In scope
- Computed on read, not stored. A topic is `contentComplete` when its notes are non-empty after trim, or at least one document has that topic's id. A subject is `contentComplete` when its notes are non-empty after trim, or at least one document has `topicId` null.
- Child content does not make a parent `contentComplete`.
- Also return `hasDescription` (description non-empty after trim), `hasNotes`, and `documentCount` (own documents only).
- Subject list and subject read also return `topicCount` and `contentCompleteTopicCount` for that subject.
- Add the fields on the existing owner-scoped subject and topic list/read payloads in both APIs. The browser keeps calling `server-webApp` only.

## Out of scope
- Indicators and the bar (P7-07, P7-08).
- Blocking quiz selection (P7-10, P7-11). Description freshness (P7-09).
- A separate completeness collection, or a score that includes descriptions.

## Acceptance checks
- [ ] A topic with only a name is `contentComplete: false` and `documentCount: 0`. Adding notes or a document on that topic makes it true. A document on a child does not.
- [ ] A subject with only subject-level notes or a subject-level document is `contentComplete: true` even when every topic is incomplete. `topicCount` and `contentCompleteTopicCount` match the tree.
- [ ] `hasDescription` follows the description field only.
- [ ] User B's read of user A's subject or topic is 404, and B's counts do not include A's documents.
- [ ] Swagger on both APIs includes the new fields. No new route.

## Implementation notes
Count documents in `server-data` with the existing ownership filters. Do not ship document bodies on the list payloads to compute this in the client.
