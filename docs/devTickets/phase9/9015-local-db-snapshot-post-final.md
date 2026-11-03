# 9015 — Local DB snapshot (post-final)

**Status:** Deferred  
**Phase:** later (not Phase 9)  
**Depends on:** IFN680 final exam / study cycle finished. Independent of 9014 succeeding, but uses the same dump method.  
**Relevant scope:** Second archive of the original local study database after continued exam use and any in-period feature work. Preferred source for later [9016](9016-original-user-hosted-migration.md). No product flow. Not a Phase 9 ticket.

## Objective
After the IFN680 final, preserve a second complete dump of the local `quizcontext` MongoDB so later study data and any exam-period product changes are captured, without migrating anything yet.

## In scope
When this ticket is taken off deferral:

- Repeat the 9014 dump procedure against the same local database URI, with archive label `quizcontext-local-post-final-<yyyy-MM-dd_HHmm>.archive.gz`.
- Pause writes during the dump. Keep MongoDB running.
- Record capture date/time, archive file name, file size, SHA-256, `git rev-parse HEAD`, and dirty/clean tree.
- Optionally create a **tested, committed** Git milestone tag for the evolved app (do not move `first-use-9001`).
- Optionally capture a small number of before/after screenshots of the study workspace (no secrets, no archive files).
- Copy the archive to private encrypted storage outside Git, with a second protected copy if practical.
- Confirm local `AI_KEY_ENCRYPTION_KEY` is still in the password manager, separate from the dump.
- Write metadata into this ticket’s outcome notes (optional Trello metadata only; no attachments).
- Optional recoverability check: restore into a **disposable local** database only.

## Out of scope
- Implementing this before the IFN680 final / study cycle is finished.
- Application, API, OpenAPI, schema, or environment-variable changes required to take the dump.
- User-level extraction or local→hosted migration ([9016](9016-original-user-hosted-migration.md), TBC).
- Restore into live Atlas, `quizcontext-int`, or any hosted database.
- Overwriting INT users or rotating encryption keys.
- Committing or attaching the archive or secrets.
- Replacing or repeating 9014. Keep both archives.

## Acceptance checks
- [ ] Ticket was un-deferred only after the exam/study cycle.
- [ ] `mongodump` completed with exit code 0 and produced a nonempty `.archive.gz` outside the repository.
- [ ] Outcome notes record the same metadata shape as 9014, with label `post-final`.
- [ ] Archive is not in Git and not attached to Trello or this ticket.
- [ ] Local `AI_KEY_ENCRYPTION_KEY` remains in the password manager; its value is not written here.
- [ ] Local MongoDB and local QuizContext remain unchanged and usable.
- [ ] If a restore test ran, it targeted a disposable local database only — never Atlas / INT.
- [ ] No OpenAPI, application, or INT/Atlas change from the dump itself.

## Implementation notes
Leave deferred until explicitly asked after the final exam. This is **not** Phase 9 work; `/implement-phase` for Phase 9 skips it. `/implement-ticket` skips it until un-deferred.

Same PowerShell method as 9014; only the file label changes:

```powershell
$backupDir = Join-Path $env:USERPROFILE 'QuizContext-Backups'
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$archive = Join-Path $backupDir "quizcontext-local-post-final-$stamp.archive.gz"

mongodump --uri='mongodb://127.0.0.1:27017/quizcontext' --archive="$archive" --gzip
if ($LASTEXITCODE -ne 0) { throw 'mongodump failed: do not mark this snapshot complete.' }

Get-Item $archive | Select-Object FullName, Length, LastWriteTime
Get-FileHash -Path $archive -Algorithm SHA256 | Format-List
```

From the repository root: `git rev-parse HEAD` and `git status --short`. `--gzip` is compression, not encryption. Official tool: https://www.mongodb.com/docs/database-tools/mongodump/
