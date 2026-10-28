# QuizContext deployment evolution

**Status:** Directional roadmap. D1 is the only milestone with implementation tickets (9010, 9011).  
**INT URL:** `https://int.quizcontext.app`  
**Not production.** Apex `quizcontext.app` stays parked until a later, separate production decision.

This document records **where hosting is going**, not how to provision D1. D1 execution is [9010](devTickets/phase9/9010-int-deployment-scaffold.md), [9011](devTickets/phase9/9011-int-runbook-cutover.md), and [deployment-operator-checklist.md](deployment-operator-checklist.md).

Do not treat D2–D6 as a backlog to implement now.

## Progression

| Milestone | Commitment | Capability added | Infrastructure |
| --- | --- | --- | --- |
| **D1 — Initial hosting** | **Committed now** | Internet-accessible INT, independent of a laptop | DigitalOcean Droplet, Docker Compose, Caddy, Cloudflare DNS, MongoDB Atlas |
| **D2 — CI/CD** | **Committed next ops milestone** | Automated test/build/deploy; recorded SHA; code rollback | GitHub Actions, container registry, same Droplet + Atlas |
| **D2 also:** local→Atlas data migration | **Committed as a separate D2 activity** | Deliberate copy of local study data, or an explicit decision to leave INT authoritative | Atlas backup + `mongodump`/`mongorestore` policy |
| **D3 — Independent component deployment** | **Committed after D2** | Update webApp or data API without rebuilding the other | Separate image pipelines; still one VM unless hosting later splits |
| **D4 — AWS evolution** | **Optional** | Port the same Compose stack onto EC2; IAM/VPC practice | AWS EC2 (and maybe ECR); Atlas unchanged |
| **D5 — Multi-client platform** | **Optional / product-led** | Recall Radio or other clients reuse learning capabilities | Existing dual-API first; extra public APIs only with a real requirement |
| **D6 — Advanced cloud** | **Optional** | Independently hosted/scaled services | ECS or similar, only if D3 hosting-split is no longer enough |

D1–D3 are a natural ops sequence. D4 is not a prerequisite for D5. D6 is not a destination we are aiming at for its own sake.

```text
D1  laptop → hosted INT (Compose + Caddy + Atlas)
        │
        ▼
D2  manual SSH deploy → CI/CD + registry + SHA rollback
        │                 (+ local→Atlas migration activity)
        ▼
D3  one Compose rebuild → independently released component images
        │
        ├── optional D4: same stack on AWS EC2
        ├── optional D5: more clients on the existing application API
        └── optional D6: managed containers if independent hosting is justified
```

## Principles that D1 already satisfies

These are the D1 choices that keep later milestones cheap. They are not a licence to build D2–D6 during D1.

| Area | D1 choice | Later value |
| --- | --- | --- |
| Containers | One image per Express app | D2 registry + D3 independent deploy |
| Network | `server-data` unpublished; browser → `server-webApp` only | Dual-API boundary survives extra clients |
| Logic | Quiz/AI stays in `server-webApp`, not `server-data` | Future clients should not reimplement evaluation |
| Config | Existing env names | Portable across Droplet / EC2 |
| Database | Atlas outside the VM | Host moves without moving Mongo |
| Frontend | React `dist` served by `server-webApp` | One public URL for D1; split later only if needed |
| Git | Known commit on `dev-deploy` / `Phase9-historyEnhance`; not `main` yet | CI/CD and rollback have a real SHA |
| Provider code | No DigitalOcean SDK in the apps | D4 is a host swap, not a rewrite |

---

## D1 — Initial hosting

**Objective.** Run Release-2 at `https://int.quizcontext.app` so the operator and a classmate can register, study, and quiz without the laptop staying on.

**New capability.** First persistent, internet-accessible environment (INT).

**Infrastructure changes.** One ~2 GB Ubuntu Droplet; Docker Compose (`server-data`, `server-webApp`); Caddy on the host (HTTPS → `127.0.0.1:4017`); Cloudflare **DNS only** for `int.quizcontext.app`; Atlas database `quizcontext-int` (empty). Manual git pull + compose rebuild.

**Depends on.** Release-2 (`first-use-9001` = `8583124`) plus 9010/9011. Not 9002–9008, not `main`.

**Unchanged.** Dual-API boundary; local `npm start` / Vite on 5017; product auth; quiz/AI behaviour; no extra public API; no Cloudflare Access or Tunnel.

**Why.** Exam revision needs a URL that works from another network. This is the smallest host that preserves the charter.

**Commitment.** Committed. Tickets 9010 then 9011.

---

## D2 — CI/CD

**Objective.** Make INT updates a repeatable pipeline instead of a remembered SSH session.

**New capability.** Automated tests (whatever the repo already has that is cheap to run), image build, push to a registry, deploy of a known SHA, documented rollback of **application code**.

**Infrastructure changes.** GitHub Actions and a container registry (for example GHCR). Same Droplet, same Caddy, same Atlas. Compose pulls images instead of (or as well as) building on the VM.

**Depends on.** D1 live and documented.

**Unchanged.** Two Express processes; Atlas; one public hostname; no AWS; no new product APIs.

**Why.** Manual deploys work once; they are how configuration drift and “which commit is live?” happen. CI/CD is the next engineering capability, and it is more useful than moving clouds.

**Commitment.** Next ops milestone after D1. No tickets yet.

### Data migration (D2 activity, separately verifiable)

**Recommendation: do local→Atlas migration in D2, not D3, and not D1.**

D1 starts Atlas empty and leaves local Mongo untouched so INT can go live this week. After a classmate uses INT for exam revision, **Atlas is a real shared database**, not a disposable sandbox.

D3 (independent deploys) does not make a data merge easier. D2 is the right home because backup/restore and “know which SHA is live” are already D2 themes, and because delaying until D3 only increases the chance both databases contain irreplaceable rows.

Treat it as its own go/no-go inside D2:

| INT state at migration time | Action |
| --- | --- |
| Only operator throwaway accounts | Backup Atlas, then `mongorestore` local dump into `quizcontext-int` (preserve `_id`s). Re-encrypt user AI keys if `AI_KEY_ENCRYPTION_KEY` differs (it should: D1 generates a new INT key). |
| Classmate (or operator) study data worth keeping | **Do not restore over INT.** Atlas stays authoritative. Local remains a separate dev DB. Optional later: selective import with user-id mapping — that is a merge, not `mongorestore`. |

Risks of a naive merge: duplicate emails with different user ids; broken subject/topic/quiz/attempt references; encrypted API keys that decrypt only with the original `AI_KEY_ENCRYPTION_KEY`; `mongorestore` inserts and does not reconcile. After a successful one-way copy, stop treating local Mongo as a second copy of INT.

No migration scripts in D1.

---

## D3 — Independent component deployment

**Objective.** Build and release `server-webApp` and `server-data` on separate cadences without splitting hosts yet.

**New capability.** Independent images, versions, and deploy workflows. Optionally a separately released frontend later — only if a client actually needs it.

**Infrastructure changes.** Two pipelines, still typically one Droplet and one Compose file. Independent *hosting* (different machines or Cloudflare Pages for the SPA) is a later choice, not the D3 requirement.

**Depends on.** D2 (images already in a registry).

**Unchanged.** Browser still must not call `server-data`. Quiz/AI logic still must not move into `server-data` “for convenience.”

**Why.** D1 already builds two images. D3 is the process that uses that. It is the cheapest preparation for extra clients.

**Commitment.** After D2. No tickets yet.

---

## D4 — AWS evolution

**Objective.** Gain practical AWS hosting experience by moving the **same** Compose stack, not by redesigning QuizContext.

**New capability.** EC2 (security groups, IAM, monitoring). Optionally ECR.

**Infrastructure changes.** New VM provider; Cloudflare `int` A record (or equivalent) pointed at the new host; Atlas stays. No Terraform/CloudFormation in D1, and none required to *plan* D4.

**Depends on.** D1 portable images + env contract. D2/D3 make the move safer but are not strictly required for a one-box lift.

**Unchanged.** Application architecture; Atlas; dual-API rule.

**Why.** Learning AWS on an already-containerised app is cheaper than learning AWS *and* inventing the first host at the same time. Billing will not automatically be lower than DigitalOcean.

**Commitment.** Optional direction.

---

## D5 — Multi-client platform

**Objective.** Other clients (Recall Radio, mobile, an admin app) use QuizContext learning capabilities instead of reimplementing them.

**New capability.** Additional user-facing applications. Extra **public** APIs only when a concrete client cannot use `server-webApp`.

**Infrastructure changes.** None required up front. First Recall Radio path: same `server-webApp` application API. A Radio-specific API, shared domain module, or admin API is a product ticket later.

**Depends on.** A real second client. Not D4.

**Unchanged.** `server-data` remains internal. Do not let a new client talk to Mongo or to the data API with a browser-supplied user id.

**Why.** The durable asset is subjects, quizzes, evaluation, and history — not the React shell.

**Commitment.** Optional, product-led. Do not extract shared services during D1 “for Recall Radio.”

---

## D6 — Advanced cloud deployment

**Objective.** Independently hosted/scaled services if D3-on-one-VM is no longer enough.

**New capability.** Managed containers (for example ECS) and service networking.

**Infrastructure changes.** Only when usage or client isolation justifies the cost.

**Depends on.** A demonstrated need after D3/D5.

**Unchanged.** If the app stays modest, Compose on one VM (DigitalOcean or EC2) remains acceptable.

**Why.** Orchestration is a response to operational need, not a maturity badge.

**Commitment.** Optional; not a target architecture.

---

## Explicitly not in this roadmap as D1 work

AWS, GitHub Actions, extra hosted environments, Kubernetes/ECS, new public APIs, shared-logic extraction, SPA/API split, local Mongo migration, Cloudflare Access/Tunnel, extra auth gates, IaC frameworks.
