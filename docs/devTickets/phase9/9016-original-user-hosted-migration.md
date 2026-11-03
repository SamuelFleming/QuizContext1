# 9016 — Original user hosted migration

**Status:** TBC / Deferred  
**Phase:** later (not Phase 9; no host milestone assigned)  
**Depends on:** [9014](9014-local-db-snapshot-post-interview.md) (Snapshot A, archival) and [9015](9015-local-db-snapshot-post-final.md) (Snapshot B, **preferred migration source**). Do not start until both snapshots exist and this ticket is explicitly un-deferred.  
**Relevant scope:** One-way, selective copy of the original local study user into the hosted database. Not a product feature. Not a whole-database restore.

## Objective
One day, move the original local QuizContext user’s identity and owned study history into the hosted app so that first real IFN680 use (interview + final) is preserved there — without overwriting classmates or other hosted accounts.

This ticket is a **stash only**. Do not plan, script, or execute the migration yet.

## Background
QuizContext began as a local study tool for IFN680. INT is now live (`quizcontext-int` on Atlas at planning time; the later host may differ). The creator still studies against **local** Mongo `quizcontext`; invited users use the hosted database independently. The two databases are not kept in sync.

9014 and 9015 take **complete** local dumps so the later job has a recoverable source. A complete dump is an archive, not permission to `mongorestore` it into a shared hosted database.

**Why not a plain restore:** by revisit time the host will likely already have other users. `mongorestore` (especially with `--drop`) can replace or collide with that data. Email is unique on `User`. Local and hosted `AI_KEY_ENCRYPTION_KEY` values differ, so copied `aiKey` ciphertext will not decrypt. Hosted JWTs use the hosted `JWT_SECRET`; sessions do not transfer. A Git rollback does not undo Mongo writes.

**Intent:** personal continuity plus product provenance — the account that actually drove QuizContext’s evolution. This must not block exam study or existing INT users.

## In scope
**TBC.** When this ticket is revisited, plan then. Likely direction to investigate (not decided):

- One original user and that user’s owned or dependent records.
- Additive import into the then-current hosted database, after a destination backup.
- Identity handling if the same email already exists on the host (merge / rename / abort — decide at plan time).
- Encrypted user OpenAI keys: omit or decrypt-locally / re-encrypt-with-host-key; never leave a dead ciphertext that looks valid; never put plaintext keys in dumps, logs, or tickets.

Exact collections, ownership fields, and reference graph must be read from **then-current** models and from Snapshot B. Do not assume today’s list is complete.

## Out of scope (now and unless later approved)
- Planning or implementing this during Phase 9, during exam preparation, or as part of 9014/9015.
- Whole-database restore into live Atlas / `quizcontext-int`.
- Importing other local users; overwriting hosted accounts; syncing local and hosted after the one-way copy.
- Transferring environment secrets (`AI_KEY_ENCRYPTION_KEY`, `JWT_SECRET`, internal API key).
- Application feature work required only to make migration nicer.

## Acceptance checks
**TBC** when planned. The later plan should be able to prove, at minimum:

- Original user can sign in on the host with the selected historical study data.
- Owned relationships still resolve; other hosted accounts are unchanged.
- No unusable encrypted API-key values and no exposed credentials.
- Local Mongo remains untouched unless separately decided.
- Source snapshot identity (9015 preferred) and application Git SHA are recorded.

## Implementation notes
`/implement-phase` and `/implement-ticket` skip this until it is explicitly un-deferred **and** planned as its own ticket revision.

Preferred source: 9015 Snapshot B (full first-study-cycle). 9014 Snapshot A stays the post-interview archive even if B is the migrate-from copy.

Today’s `server-data` models all carry `userId` except `User` itself: `Subject`, `Topic` (`subjectId`, `parentTopicId`), `Document`, `Quiz` (`subjectId` / `topicId` / `topicIds` as strings; questions and `sourceSnapshot` embedded), `Attempt`, `AiUsage`. That is a hint for a future inventory, not a frozen collection list. There is no separate Concept collection today; question `concepts` are embedded.

Related ops note (not a schedule): [deployment-evolution-plan.md](../../reference/Deployment/deployment-evolution-plan.md) already treats local→Atlas as a separate D2-era activity and forbids restore-over-INT once classmate data exists.

**Revisit trigger:** after the IFN680 final, when there is time and the hosted schema/branch is stable. May land in D1.x, D2, or later — same intent regardless of milestone name.
