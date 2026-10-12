# 7008 — Subject completeness bar

**Status:** Planned  
**Phase:** 7  
**Depends on:** 7006  
**Relevant scope:** Phase 7 README; F03; S02; S03; `docs/design/01_design-concept.md`

## Objective
Each subject shows a completeness bar: how many of its topics have their own study text. This is the study-profile bar. It is not added to the account Profile screen.

## In scope
- Workspace, on the selected subject: a bar labelled "N of M topics have content". The value is `contentCompleteTopicCount / topicCount`.
- Dashboard subject list: the same bar and label on each subject, using the counts from the subject list.
- Zero topics: empty bar and the label "No topics yet". Do not show 100%.
- A caption under the workspace bar, separate from the percentage: "Subject notes or documents" yes or no, from the subject's `contentComplete`.
- Accessible progress element (`progressbar`, with the current and max values). Tokens only.

## Out of scope
- Account Profile / S08.
- Counting descriptions, freshness, or descendant-only content in the percentage.
- Blocking navigation or quiz generation from the bar.

## Acceptance checks
- [ ] A subject with 4 topics, 1 of which has notes or a document, shows 1 of 4 on the workspace and on the dashboard. Both update after a topic gains its first notes.
- [ ] A subject with no topics shows "No topics yet" and an empty bar, including when the subject itself has notes.
- [ ] A subject with notes but no complete topics still shows 0 of M, and the caption says the subject has notes or documents.
- [ ] The account Profile screen has no completeness bar.
- [ ] At 390px the bar and label fit. No new route.

## Implementation notes
S02 said the MVP would not require progress visualisations. This bar is the Phase 7 exception, scoped to topic content-completeness only.
