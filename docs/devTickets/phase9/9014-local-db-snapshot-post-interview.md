# 9014 — Local DB snapshot (post-interview)

**Status:** Done  
**Phase:** 9 (ops archival; parallel to leftover 9011 checks)  
**Depends on:** Local MongoDB `quizcontext` in actual study use. Does not depend on 9000–9013.  
**Relevant scope:** Operator archive of the original local study database; source material for a later selective local→Atlas merge (D2 activity in [deployment-evolution-plan.md](../../reference/Deployment/deployment-evolution-plan.md)). No product flow.

## Objective
Preserve a complete dump of the current local `quizcontext` MongoDB after its first meaningful IFN680 interview-assessment use, with verifiable metadata and private storage, so the original study history exists independently of later exam use and of a future user-level migration.

## In scope
- Confirm the dump source is the laptop MongoDB used by local QuizContext (default `mongodb://127.0.0.1:27017/quizcontext`; if local `.env` points elsewhere, dump that URI instead).
- Confirm MongoDB Database Tools are installed (`mongodump --version` in Windows PowerShell).
- Pause QuizContext writes for the short dump (close or pause active study sessions). Keep MongoDB running.
- Create a gzip BSON archive of the **entire** local database with `mongodump --archive --gzip` into `%USERPROFILE%\QuizContext-Backups`, using the label `quizcontext-local-post-interview-<yyyy-MM-dd_HHmm>.archive.gz`.
- Record capture date/time, archive file name, file size, SHA-256, application `git rev-parse HEAD`, and whether the working tree had uncommitted changes.
- Note `first-use-9001` (`8583124` / Release-2) separately as the earlier first-use **code** milestone. It is not automatically the revision that matches this snapshot.
- Copy the archive to private, preferably encrypted storage **outside** the Git repository (and a second protected copy if practical).
- Confirm the existing local `AI_KEY_ENCRYPTION_KEY` is still in the password manager, stored separately from the dump. Encrypted user AI keys in the archive are only recoverable with that key.
- Write the metadata into this ticket’s outcome notes once captured. Optional Trello card may hold the same metadata only.

## Out of scope
- Application, API, OpenAPI, schema, or environment-variable changes.
- User-level extraction, `_id` remapping, or any local→Atlas migration tooling.
- Upload, restore, or overwrite of hosted `quizcontext-int` or any other user’s INT data.
- Changing, rotating, or attaching `AI_KEY_ENCRYPTION_KEY`, JWT, or other secrets.
- Committing the archive, checksum file, or any dump artefact to Git; attaching it to Trello or a ticket.
- Snapshot B after the IFN680 final ([9015](9015-local-db-snapshot-post-final.md), Deferred, not Phase 9).
- Original-user hosted migration ([9016](9016-original-user-hosted-migration.md), TBC).
- Optional restore testing (allowed later on 9015 against a disposable local database only).

## Acceptance checks
- [x] `mongodump` completed with exit code 0 and produced a nonempty `.archive.gz` outside the repository.
- [x] Outcome notes record: label `post-interview` | captured at | source db | archive file name | file size | SHA-256 | Git SHA | dirty/clean tree | storage location description (no secrets) | notes.
- [x] `first-use-9001` is recorded as a historical code tag only, not as this dump’s Git SHA unless `HEAD` actually is that tag.
- [x] Archive is not in the Git worktree, not staged, and not attached to Trello or this ticket.
- [x] Local `AI_KEY_ENCRYPTION_KEY` remains in the password manager; its value is not written here.
- [x] Local MongoDB and local QuizContext are unchanged and still usable.
- [x] No OpenAPI, application, or INT/Atlas change.

## Implementation notes
Run in **Windows PowerShell on the development laptop**, not over DigitalOcean SSH.

```powershell
$backupDir = Join-Path $env:USERPROFILE 'QuizContext-Backups'
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$archive = Join-Path $backupDir "quizcontext-local-post-interview-$stamp.archive.gz"

mongodump --uri='mongodb://127.0.0.1:27017/quizcontext' --archive="$archive" --gzip
if ($LASTEXITCODE -ne 0) { throw 'mongodump failed: do not mark this snapshot complete.' }

Get-Item $archive | Select-Object FullName, Length, LastWriteTime
Get-FileHash -Path $archive -Algorithm SHA256 | Format-List
```

From the QuizContext repository root:

```powershell
git rev-parse HEAD
git status --short
```

`--archive` + `--gzip` compress BSON; they do **not** encrypt the file. Treat the archive as sensitive (users, emails, password hashes, study content, encrypted AI-key material). Official tool: https://www.mongodb.com/docs/database-tools/mongodump/

Suggested outcome-note line: `Snapshot label | captured at | source db=quizcontext | archive file name | file size | SHA-256 | Git SHA | storage location description (no secrets) | notes`.

## Outcome notes
- post-interview | captured at 2026-11-03 11:11 AEST | source db=quizcontext (`mongodb://127.0.0.1:27017/quizcontext`) | archive file name `quizcontext-local-post-interview-2026-11-03_1111.archive.gz` | file size 1253507 bytes | SHA-256 `68849B9DB2717B7EBDEA75761D9E096EA2FD7D99EB5B3A629AE368AD33E321F0` | Git SHA `a487643ecf190df10c0f52d5afc7881275cd8b37` (branch `phase9-histEnhance-ui`) | dirty tree | storage=`C:\Users\flemo\QuizContext-Backups` (primary only; no second copy) | notes: mongodump 100.20.1 via winget `MongoDB.DatabaseTools`; dump used full path `C:\Program Files\MongoDB\Tools\100\bin\mongodump.exe` (not yet on PATH in the agent shell); collections dumped users/subjects/topics/documents/quizzes/attempts/aiusages; diagnostics still ok after dump; no app/OpenAPI/INT change.
- Historical code tag only: `first-use-9001` = `85831241d082fdf51a6d76b00c40d9e05a28d68b` (not this dump’s Git SHA).
- `AI_KEY_ENCRYPTION_KEY` remains in local `server-webApp/.env` and (operator) password manager, separate from the archive; value not written here.
