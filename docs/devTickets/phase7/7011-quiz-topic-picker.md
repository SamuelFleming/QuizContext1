# 7011 — Quiz topic picker

**Status:** Done (lint and build verified; browser acceptance checks pending manual UAT)  
**Phase:** 7  
**Depends on:** 7006, 7010  
**Relevant scope:** Phase 7 README; F05; S05; P6-02

## Objective
The generation form can target the whole subject, or any set of topics and subtopics in that subject. A subtopic can be included without its parent. Topics with no notes and no documents cannot be chosen.

## In scope
- The control is a list, not a native dropdown. One row needs both a checkbox and an expand arrow, which a dropdown cannot show.
- The first row is **Whole subject**. Choosing it clears every topic checkbox. Checking any topic clears Whole subject.
- Under that, topics follow the workspace tree. Each subtopic is indented under its parent so the nesting is visible. This applies at every depth, not only one level down.
- A topic that has children has an arrow that shows or hides the next level. Hiding a level does not change what is checked.
- Every topic row has its own checkbox.
- Checking a topic checks that topic and every content-complete topic under it.
- Unchecking a topic unchecks that topic and every topic under it.
- Checking or unchecking a subtopic does not change its parent. A subtopic can be checked while its parent stays unchecked. That parent's own notes and documents are then left out of the quiz.
- There is no separate "Include subtopics" switch. Checking the parent is that action. Any subtopic can then be unchecked on its own.
- A topic that is not `contentComplete` is visible and disabled, with the text "No notes or documents". Checking a parent does not check it.
- When Whole subject is selected, name the topics that are not content-complete as "These topics have no notes or documents and will be left out", or say that every topic has content.
- The form submits `topicIds` for exactly the checked, content-complete topics. It does not send `topicId` or `includeDescendants`. Whole subject sends neither.
- Opening the form with a `topicId` query checks that topic, and the content-complete topics under it, when that topic is content-complete. It does not check the parent. When it is not content-complete, check nothing and show "No notes or documents".
- Client checks mirror the server: at least one topic when Whole subject is off, no incomplete id, and not both Whole subject and `topicIds`.
- A 400 that names an incomplete topic is shown on the form. Existing generation errors stay.

## Out of scope
- Workspace tree indicators (7027) and the subject bar (7028).
- Changing question counts, difficulty, or context mode.
- Quiz `AI_INVALID_OUTPUT` work.

## Acceptance checks
- [ ] From the browser, checking two complete topics generates a quiz and the detail view names both. A topic with no notes and no documents cannot be checked.
- [ ] Checking a topic that has complete subtopics generates a quiz whose detail view names that topic and those subtopics. Unchecking one of those subtopics before submit leaves it out.
- [ ] Checking only a subtopic, with its parent left unchecked, generates a quiz that names the subtopic and does not name the parent as selected material.
- [ ] Whole-subject mode still generates, and names any topics that will be left out.
- [ ] A workspace link for an incomplete topic opens the form without that topic selected, and with the reason visible.
- [ ] Submitting zero chosen topics shows a form error and does not call the API.
- [ ] At 390px the Whole subject row, the arrows, and the indented checkboxes are usable. Lint and build pass. *(Lint and build verified; browser checks above await manual UAT.)*

## Implementation notes
Use `contentComplete` from the topic list. Do not infer it from empty description fields. The form expands a parent check into explicit ids. 7010 still accepts a single `topicId` with `includeDescendants` on the API. This form does not send that pair.
