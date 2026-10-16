# P4-02 — Recursive topic tree in the Content Workspace

**Status:** Planned  
**Phase:** 4  
**Depends on:** P4-01  
**Relevant scope:** MVP plan Phase 4; F03; S03; `02_high-level-solution.md` §2.2, §3

## Objective
Inside a subject, the user can create topics at any depth, see them as a tree, select one, rename it, and delete it with its subtree.

## In scope
- `server-data`: `Topic` model with `userId` and `subjectId` (indexed), nullable `parentTopicId`, `name`, `description`, `notes`, timestamps. Same field limits as subjects (shared constants). One collection; no separate subtopic model.
- Create checks that the subject belongs to the caller and, when `parentTopicId` is given, that the parent belongs to the same user and subject. Otherwise 404 (missing or not owned) or 400 (parent in another subject).
- List returns all of a subject's topics as a flat array with `parentTopicId`; the client builds the tree. Read, update (allow-list `name`, `description`, `notes`), and delete are scoped to `{ _id, userId }`.
- Delete removes the topic and all its descendants. Deleting a subject (P4-01 route) now also deletes its topics.
- `server-webApp`: JWT-protected routes (proposed: `GET/POST /subjects/:subjectId/topics`, `GET/PATCH/DELETE /topics/:topicId`) through controller → `topicService` → `services/dataApi/topics.js`.
- Client: the Content Workspace shows the subject with a navigable topic tree (expand/collapse), "add topic" at subject level and under any topic, rename, and delete with a confirmation that names how many descendants go with it. The selected subject or topic is clearly indicated. Add `services/topicService.js`; tree components live in `features/content/` (or the feature folder P4-01 chose).
- Swagger on both APIs.

## Out of scope
- Moving or re-parenting a topic (and the cycle checks it needs). Nesting is chosen at creation.
- Manual ordering; topics sort by name or creation time.
- Notes editor UI (P4-03) and documents (P4-04).

## Acceptance checks
- [ ] From the browser, a user builds a tree at least three levels deep, reloads, and sees the same tree; renames a nested topic; deletes a middle topic and its descendants disappear.
- [ ] Deleting a subject removes its topics (check in MongoDB or via the list route).
- [ ] User B cannot list, read, create under, update, or delete user A's subject topics (404). A parent from another subject is rejected.
- [ ] Missing auth returns 401 on both APIs; invalid ids do not return 500.
- [ ] Swagger on both APIs lists the topic routes that exist.
- [ ] Client build passes.

## Implementation notes
Descendant deletion can collect ids from the flat subject list in the repository; no recursive Mongo aggregation is required at MVP scale. Phase 5 will reuse the same flat list to resolve descendants.
