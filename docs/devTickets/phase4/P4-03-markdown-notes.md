# P4-03 — Markdown descriptions and notes

**Status:** Done  
**Phase:** 4  
**Depends on:** P4-02  
**Relevant scope:** MVP plan Phase 4; F03; S03; frontend rule on safe Markdown rendering

## Objective
For the selected subject or topic, the user can write and save a short description and longer Markdown notes, and preview them rendered safely.

## In scope
- Client: in the Content Workspace detail panel, edit `description` and `notes` for the selected subject or topic using one shared editor/preview pair (textarea plus rendered preview). Save, saving, success, validation-error, and unsaved-changes states. Character counts against the P4-01 limits.
- Render Markdown with `react-markdown` + `remark-gfm` and no raw HTML (`rehype-raw` not used). The editor/preview components live in `components/` because Phase 5 and 6 reuse them.
- Uses the existing subject and topic PATCH routes. Raise the JSON body limit on both servers just enough for a 50,000-character notes field if the default is too small.
- Swagger only if a route or schema changes.

## Out of scope
- AI-assisted description (Phase 5). The `description` field is where Phase 5 will save an accepted suggestion.
- Rich-text/WYSIWYG editing, autosave, version history.
- Documents (P4-04).

## Acceptance checks
- [x] From the browser, a user saves Markdown notes (headings, lists, code, a table) on a subject and on a nested topic; after reload both render correctly.
- [x] HTML or `<script>` in notes shows as text and does not execute.
- [x] Over-long description or notes returns 400 and the panel shows the message.
- [x] Editing another user's subject or topic is still rejected (404).
- [x] Client build passes.

## Implementation notes
New client dependencies: `react-markdown`, `remark-gfm`. Adapt the CareerContext editor/preview idea only (`docs/reference/03_Reusable-Patterns.md`), not its styling.
