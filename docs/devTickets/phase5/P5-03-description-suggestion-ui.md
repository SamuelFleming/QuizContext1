# P5-03 — Suggest, review, and save a description in the workspace

**Status:** Planned  
**Phase:** 5  
**Depends on:** P5-02  
**Relevant scope:** MVP plan Phase 5 deliverable and "Done when"; F04; S03; `docs/design/01_design-concept.md`

## Objective
From the Content Workspace detail panel, the user asks for a suggested description for the selected subject or topic. They see the suggestion and any context warning, edit it, and save it through the normal content update, or discard it. This closes Phase 5.

## In scope
- Client service call for `POST /ai/description-suggestions` (extend an existing service or add `services/aiService.js`).
- Detail panel: a "Suggest description" action. For topics, an "Include subtopics" toggle that defaults to on. Loading state, and the action is disabled while a request runs.
- Review area: the suggestion in the shared Markdown editor/preview (P4-03), editable, with Accept and Discard. Accept puts the text in the description field and saves through the existing subject or topic `PATCH`. Discard leaves the stored description untouched. Both are explicit; nothing saves automatically.
- Context notice: when `context.truncated` is true, show which sources were partly included or left out, from the manifest titles. Show a short "Based on N sources" summary.
- Errors: `CONTEXT_INSUFFICIENT` asks the user to add notes or documents first. AI errors show the server message. Profile-related codes (`AI_KEY_MISSING`, `AI_LIMIT_REACHED`, `AI_DISABLED`) point to Profile. After a failure, the description and notes editors keep their current saved and unsaved values.
- Respect the existing unsaved-changes guard. A pending suggestion counts as unsaved when the selection changes.
- Phase close-out: update the Phase 5 README, the queue, and `devCompletion.md`.

## Out of scope
- AI suggestions for notes or documents, regenerate-with-instructions, version history.
- Context-mode selection in the UI (the description always uses Targeted).
- Quiz screens.

## Acceptance checks
- [ ] Headless browser with a mocked provider: on a nested topic with notes and a document, request a suggestion, edit it, accept it, and see the edited description after reload.
- [ ] Discard leaves the previous description unchanged after reload.
- [ ] A truncated selection shows the partial-inclusion notice with source titles.
- [ ] An empty subject shows the insufficient-content message and nothing is saved.
- [ ] With AI disabled or no user key, the error and Profile pointer show, and existing notes and the description stay unchanged.
- [ ] Changing selection with a pending suggestion asks for confirmation.
- [ ] 390px layout stays usable. Theme tokens only.
- [ ] Lint and build pass. The Phase 4 browser path still passes.
