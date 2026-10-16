# Phase 4 — Content management

**Objective.** Let a user organise study material with no AI required.

**Deliverable.** Subjects, recursively nested topics, Markdown notes, and reviewed text/PDF documents, managed in the Content Workspace.

**Depends on.** Phase 2 ownership and identity propagation. Phase 3 is sequenced first so content tickets stay separate from AI-key work.

**Roadmap.** [Phase 4 in the MVP plan](../00_MVP-Development-Plan.md#phase-4).

**Tickets.** Planned, in order. Implement only after one is approved, or run `/implement-phase` for Phase 4. All code follows `docs/core-scope/02_high-level-solution.md` §5.1.

1. [P4-01](P4-01-subjects.md) — subject CRUD, ownership pattern for content, Subjects screen and Dashboard list.
2. [P4-02](P4-02-topic-tree.md) — recursive topics, workspace tree, subtree delete.
3. [P4-03](P4-03-markdown-notes.md) — Markdown description and notes editor with safe preview.
4. [P4-04](P4-04-document-upload-review.md) — upload `.md`/`.txt`/text PDF, extract, review, save.
5. [P4-05](P4-05-document-edit-delete.md) — document edit and delete, cascades, phase close-out.

**Planning decisions (change before implementing if wrong).**
- Hard delete with cascade (subject → topics → documents), confirmed in the UI. Saved quizzes in Phase 6 keep their own source snapshot, so this does not break history.
- Topics are nested at creation; moving a topic is deferred.
- Only reviewed extracted text and light metadata are stored; original files are not.
- Extraction runs in `server-webApp`. `server-data` receives JSON only.
- Limits: name 120, description 2,000, notes 50,000, document title 200, document content 200,000 characters; uploads 5 MB.
