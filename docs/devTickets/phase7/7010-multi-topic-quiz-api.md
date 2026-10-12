# 7010 — Quiz a chosen set of topics

**Status:** Planned  
**Phase:** 7  
**Depends on:** 7026 (deferred)  
**Relevant scope:** Phase 7 README; F05; product theory §4; P6-01

## Objective
The user can generate one quiz from an explicit list of topics in a subject. Topics with no notes and no documents are rejected. Whole-subject and single-topic generation stay as they are.

## In scope
- `POST /quizzes` accepts `topicIds` (1 to 30 ids) instead of `topicId`. Sending both is 400. Omitting both still means the whole subject.
- When `topicIds` is set, `includeDescendants` is ignored and stored false. Context is those topics and documents whose `topicId` is in the set. Ancestor names may be path labels only. Do not include ancestor notes, ancestor documents, or unselected siblings.
- Each id must belong to the caller and to `subjectId`. A topic that is not `contentComplete` returns 400 naming that topic, with no AI call and no quiz.
- If the combined text is still under the existing minimum, return the existing 422 `CONTEXT_INSUFFICIENT`.
- Persist `topicIds` on the quiz. `topicId` is null for this scope. `topicPath` is the selected topic names in request order, truncated to a safe stored length if needed. Title remains the subject name when more than one topic is selected.
- Study view, library list, and Markdown export show that path. They still omit answer keys on the study view.
- `assembleContext` grows a branch for this scope. One resolver, same labelling, budget, and manifest rules.
- Whole subject: unchanged, including empty topics simply contributing no text. Single topic plus `includeDescendants`: unchanged, except an incomplete selected topic is now 400. Incomplete descendants stay skipped and do not fail the request. The manifest is the record of what was included.

## Out of scope
- The form (7011).
- Changing question validation, output token budget, or `AI_INVALID_OUTPUT` handling.
- Quizzing topics across two subjects. Descriptions as a completeness requirement.

## Acceptance checks
- [ ] Two content-complete topics produce one stored quiz whose `topicIds` are those two, whose snapshot text includes their notes and documents, and whose snapshot does not include a third topic's notes.
- [ ] A list that includes a topic with no notes and no documents returns 400 naming it. No usage record and no quiz.
- [ ] `topicId` together with `topicIds` returns 400. More than 30 ids returns 400. Another user's topic id returns 404.
- [ ] Whole-subject generation still succeeds when the subject has enough text, even if some topics are empty.
- [ ] Single-topic generation of a content-complete topic still honours `includeDescendants`.
- [ ] Business study-view JSON has no answer key. Swagger on both APIs documents `topicIds`.

## Implementation notes
This is the fourth scope beside product theory §4. Do not rewrite core scope in this ticket. Existing quizzes have no `topicIds`; treat missing as an empty list.
