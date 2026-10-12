# 7007 — Topic completeness indicators

**Status:** Planned  
**Phase:** 7  
**Depends on:** 7006  
**Relevant scope:** Phase 7 README; F03; S03; `docs/design/01_design-concept.md`

## Objective
In the content workspace, each topic shows whether it has its own study text and whether it has a description.

## In scope
- On each topic in the tree, a short text indicator from `contentComplete`: "Has content" or "No notes or documents".
- A second short indicator from `hasDescription`: "Has description" or "No description".
- The selected topic's detail header repeats the same two facts.
- Use existing theme tokens. Indicators are text, not colour alone.

## Out of scope
- The subject percentage bar (7008).
- Hiding or disabling topics in the tree. The user can still open and edit an incomplete topic.
- Quiz picker changes (7011). Freshness (7009).

## Acceptance checks
- [ ] A topic with no notes and no documents shows "No notes or documents". After notes are saved, it shows "Has content" without a full page reload beyond the normal save refresh.
- [ ] A topic whose only content is a child topic still shows "No notes or documents".
- [ ] A topic with notes and a description shows both positive labels. Clearing the description flips only the description label.
- [ ] At 390px the tree remains usable and does not overflow horizontally.
- [ ] No new API route.

## Implementation notes
Read the flags from the topic list already loaded for the tree. Do not recompute completeness in the client.
