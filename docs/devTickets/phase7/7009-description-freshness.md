# 7009 — AI description freshness

**Status:** Planned  
**Phase:** 7  
**Depends on:** None  
**Relevant scope:** Phase 7 README; F04; S03; P5-03

## Objective
After the user accepts an AI description, the workspace says when that description is older than notes or documents later saved on the same subject or topic.

## In scope
- `descriptionGeneratedAt` and `sourcesChangedAt` on Subject and Topic, both null by default. Returned on the existing reads. Also return computed `descriptionStale`.
- Accepting a suggestion (including one the user edited before accept) sets `descriptionGeneratedAt` to the server time. The client sends a boolean such as `descriptionFromSuggestion: true` with the description save. It does not send a timestamp.
- A later save that changes the description and is not flagged as a suggestion clears `descriptionGeneratedAt`.
- `sourcesChangedAt` updates when notes on that entity change, or when a document with that subject and topic (or subject-level `topicId` null) is created, updated, or deleted. A description-only save does not change it. Changes on a child topic or on a child's documents do not change the parent.
- `descriptionStale` is true only when both timestamps are set and `sourcesChangedAt` is later than `descriptionGeneratedAt`.
- Workspace copy next to the description when stale: the description was accepted from AI, and notes or documents on this subject or topic changed afterward. Show the accepted date. No banner when not stale.
- Swagger on both APIs for the new fields and the save flag.

## Out of scope
- Auto-regenerating the description, blocking save, or blocking quizzes.
- Freshness for descriptions that were only typed by hand (`descriptionGeneratedAt` stays null).
- Rolling child edits up to the parent. Backfilling timestamps onto existing rows.
- A history of past descriptions.

## Acceptance checks
- [ ] Accepting a suggestion sets `descriptionGeneratedAt`. The description is not stale. Editing notes afterward, or adding, editing, or deleting a document on that same entity, makes `descriptionStale` true and the workspace shows the accepted date.
- [ ] A document on a child topic does not mark the parent stale.
- [ ] A manual description edit clears `descriptionGeneratedAt` and clears the stale state.
- [ ] A subject or topic that never accepted a suggestion in this version stays not stale, even if its notes are newer than `updatedAt` quirks of old rows.
- [ ] User B cannot set the flag on user A's subject or topic (404). A client-supplied timestamp is ignored.
- [ ] Suggest / discard behaviour from Phase 5 is unchanged when the user discards.

## Implementation notes
`updatedAt` cannot answer this. Description and notes share one document, so a description save would look like a content save. That is why these two fields exist. Set `sourcesChangedAt` in the subject, topic, and document write paths on `server-data`.
