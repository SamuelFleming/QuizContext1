# 9012 — D1 post-deployment documentation

**Status:** Done  
**Phase:** 9 (ops, parallel to 9002–9008)  
**Depends on:** 9010 Compose scaffold and 9011 runbook/Caddyfile on `dev-deploy`. Does not re-run cutover.  
**Relevant scope:** D1 INT as built; docs only

## Objective
Collapse D1 planning leftovers into three lasting documents: the evolution roadmap, the living hosted runbook, and one as-built D1 record (architecture, chosen inventory, redacted credentials, and the SSH cutover that actually ran).

## In scope
- Rewrite the D1 record as [docs/reference/Deployment/D1/as-built.md](../../reference/Deployment/D1/as-built.md) from the setup record, infrastructure handoff, and [getting-started-hosted_1-5.txt](../../reference/Deployment/D1/getting-started-hosted_1-5.txt).
- Fold the former `DeploymentPlanning.md` milestone table into [deployment-evolution-plan.md](../../reference/Deployment/deployment-evolution-plan.md) and point D1 “how it was built” at the as-built record.
- Distinguish [docs/getting-started-hosted.md](../../getting-started-hosted.md) (how to operate INT now) from the as-built record (what D1 did).
- Retire the pre-cutover operator checklist as a living doc (stub only).
- Delete `DeploymentPlanning.md`, `QuizContext-D1-Cursor-Next-Steps-Prompt.md`, `QuizContext-D1-Infrastructure-Handoff.md`, and the stale setup-record filename after the rewrite.
- Retarget README, phase README, queue, and 9010/9011 companion links.
- Keep the verbatim transcript. Do not rewrite it.

## Out of scope
- Application, Docker, or Caddy code changes.
- New 9011 live tests or closing 9011 acceptance (9011 stays In progress unless closed separately).
- D2 tickets, CI, AWS, data migration.
- Committing secrets, rewriting the `.txt` transcript, or adding a `docs/deploy/` tree.
- Archiving `chat.md` / `chat-2.md`.

## Acceptance checks
- [x] One as-built record a future operator can follow (architecture, why, inventory, credential *names*, SSH order).
- [x] No duplicate D1–D6 milestone tables.
- [x] No leftover “not yet deployed” handoff.
- [x] No secret values (passwords, URI-with-password, private keys, `.env` contents).
- [x] Links from README, queue, 9010/9011, evolution plan, and hosted runbook resolve.
- [x] Verbatim transcript remains at `docs/reference/Deployment/D1/getting-started-hosted_1-5.txt`.

## Implementation notes
- Sources of truth after this ticket: evolution plan (direction), `docs/getting-started-hosted.md` (current how-to), `D1/as-built.md` (what shipped).
- Mark unproven 9011 smoke items (external HTTPS, Diagnostics UI, public port probe, post-Compose reboot) as confirm-if-done, not as passes.
- Droplet public IPv4 is an operator identifier. The laptop/ufw SSH source IP is a cutover-time value and may change; do not treat it as stable inventory.
