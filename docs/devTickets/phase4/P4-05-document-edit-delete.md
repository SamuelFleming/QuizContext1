# P4-05 — Document edit, delete, and content cascades

**Status:** Planned  
**Phase:** 4  
**Depends on:** P4-04  
**Relevant scope:** MVP plan Phase 4 deliverable and done-when; F03; S03

## Objective
The user can edit a saved document's title and text and delete it. Deleting a topic or subject removes its documents, so nothing is left orphaned. This ticket closes the Phase 4 deliverable.

## In scope
- `server-data`: update (allow-list `title`, `content`; same limits as P4-04) and delete, scoped to `{ _id, userId }`. Moving a document to another subject or topic is not allowed.
- Cascades: deleting a topic deletes documents on that topic and its descendants; deleting a subject deletes all its documents. Done in `server-data` repositories alongside the P4-02 topic cascade.
- `server-webApp`: JWT-protected routes (proposed `PATCH/DELETE /documents/:documentId`).
- Client: edit a document in the detail panel with the shared editor/preview, and delete with confirmation. Subject and topic delete confirmations mention that documents are deleted too.
- Swagger on both APIs.
- Phase close-out: walk the full Phase 4 deliverable in the browser, then update the Phase 4 README, queue, and `devCompletion.md`.

## Out of scope
- Re-uploading or replacing the original file, version history, document move.
- Soft delete or trash.

## Acceptance checks
- [ ] From the browser, a user edits a document's text, reloads, and sees the change; deletes a document; deletes a topic that has documents on a descendant, and those documents are gone.
- [ ] Deleting a subject removes its topics and documents.
- [ ] User B cannot update or delete user A's document (404), and user B's delete of a subject or topic id belonging to A removes nothing.
- [ ] Missing auth returns 401 on both APIs; over-long content returns 400.
- [ ] Swagger on both APIs matches all implemented content routes.
- [ ] Full Phase 4 path checked: subject, nested topics, notes, uploaded text file and PDF, review, edit, delete.
