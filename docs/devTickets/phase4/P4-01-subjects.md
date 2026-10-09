# P4-01 — Subjects vertical slice

**Status:** Planned  
**Phase:** 4  
**Depends on:** P3-08 (layered structure), P2-01 (trusted `X-User-Id`)  
**Relevant scope:** MVP plan Phase 4; F03; S02, S03; `02_high-level-solution.md` §2.2, §5.1

## Objective
A signed-in user can create, list, open, rename, and delete their own subjects from the Subjects screen and the Dashboard. This is the first content record and sets the ownership pattern that topics and documents copy.

## In scope
- `server-data`: `Subject` model with `userId` (indexed), `name`, `description`, `notes`, timestamps. Repository functions always filter on the trusted `X-User-Id` (`{ _id, userId }`); create takes the owner from the header, never the body. Keyed routes for list, create, read, update, and delete. A subject that is missing or owned by another user returns 404. A malformed id returns 400 or 404, never 500.
- Field rules (constants file): `name` required, trimmed, max 120 characters; `description` optional Markdown, max 2,000 characters; `notes` optional Markdown, max 50,000 characters. Update uses an explicit allow-list (`name`, `description`, `notes`).
- `server-webApp`: JWT-protected business routes (proposed: `GET/POST /subjects`, `GET/PATCH/DELETE /subjects/:subjectId`) through controller → `subjectService` → `services/dataApi/subjects.js`. Same validation as above, returning 400 `{ message }`.
- Delete is a hard delete. This ticket deletes only the subject; P4-02 and P4-05 add cascades for topics and documents.
- Client: replace the Subjects placeholder with a list, a create form, and a delete action with confirmation. Selecting a subject opens a minimal Content Workspace route (proposed `/subjects/:subjectId`) showing name and allowing rename. `AppRoutes` needs prefix matching for that path; there is no router library. Add `services/subjectService.js`.
- Dashboard: list the user's subjects (name, last updated) with a link into each, an empty state, and a "Create subject" quick action.
- Swagger on both APIs.

## Out of scope
- Topics, notes editor UI, and documents (P4-02 to P4-05). `description` and `notes` are accepted by the API but only edited in the UI from P4-03.
- Sorting, search, archive or soft delete.
- AI descriptions (Phase 5), quiz actions.

## Acceptance checks
- [ ] From the browser, a user creates two subjects, sees them on Subjects and Dashboard, renames one, opens it, and deletes one after confirming.
- [ ] Empty or over-long `name` returns 400 and the form shows the message.
- [ ] User B cannot read, update, or delete user A's subject through either API (404). A body `userId` is ignored on create and update.
- [ ] No token returns 401; `server-data` without the internal key or `X-User-Id` returns 401.
- [ ] Swagger on both APIs lists the subject routes that exist.
- [ ] Client build passes.

## Implementation notes
Follow the P3-06/P3-07 layering and `userRepository.js`. `userScopedRequest` in `services/dataApi/client.js` only passes 400/404 through; keep subject errors within those codes or extend it deliberately.
