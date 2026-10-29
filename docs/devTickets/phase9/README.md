# Phase 9 — Optional quiz instructions + scoped study history

**Status:** 9000–9001 done (browser and live-provider UAT pending). Study-history tickets 9002–9008 Planned — phase reopened for that work. Ops 9010 Done (Compose scaffold; image build on the implement PC unrun — no Docker Desktop); 9011 Planned (INT host; parallel, not in the product Done-when).

**Objective.** (1) Let a learner optionally describe what a generated quiz should prioritise or avoid, while keeping source material, enforced quiz settings, and learner preferences distinct. (2) Improve study/results surfaces with a configurable internal study-history data API, use-case business endpoints, and reusable UI primitives across dashboard, subject/topic workspace, and quiz detail.

**Deliverable.** Optional quiz instructions API and UI as in 9000–9001. Then: one enriched `server-data` study-history endpoint; dashboard / quiz / subject-topic business DTOs on `server-webApp`; shared list and stats primitives; composed screens without a mega-widget.

**Depends on.** Phase 8 as shipped (including workspace study panel 8009/8010). Study-history work revises the 7013 split (aggregation moves to `server-data`; public dashboard route stays `GET /study-history`).

**Tickets.**
1. [9000](9000-optional-quiz-instructions-api.md) — API validation, versioned prompt integration, persistence, projection, and OpenAPI. Done.
2. [9001](9001-optional-quiz-instructions-ui.md) — generation textarea, request wiring, retained form state, and saved-quiz visibility. Done. Depends on 9000.
3. [9002](9002-study-history-data-api.md) — enriched internal study-history (filters, pagination, include flags) + OpenAPI. Planned.
4. [9003](9003-dashboard-study-history-api.md) — evolve JWT `GET /study-history` onto the data API; shared dataApi client. Planned. Depends on 9002.
5. [9004](9004-quiz-history-api.md) — `GET /quizzes/:quizId/history` + client service. Planned. Depends on 9002, 9003.
6. [9005](9005-subject-history-api.md) — `GET /subjects/:subjectId/history?topicId=` + client service. Planned. Depends on 9002, 9003.
7. [9006](9006-history-ui-primitives.md) — shared list, circle, distribution, series primitives. Planned. Depends on 9004, 9005.
8. [9007](9007-quiz-detail-history-ui.md) — compose quiz detail (stats, weakest, paginated attempts). Planned. Depends on 9004, 9006.
9. [9008](9008-workspace-dashboard-history-ui.md) — compose workspace + dashboard; remove duplicated markup. Planned. Depends on 9003, 9005, 9006.
10. [9010](9010-int-deployment-scaffold.md) — Docker Compose + hosted static/SPA serve. Done. Parallel to 9002–9008; does not depend on them. Compose `build`/`up` on this PC unrun (no Docker Desktop).
11. [9011](9011-int-runbook-cutover.md) — hosted runbook, Caddy, first INT cutover. Planned. Depends on 9010 and human Droplet/DNS/Atlas steps.

**Planning decisions (optional instructions — 9000–9001).**
- The API/storage field is `quizInstructions`; the UI label is **Quiz instructions (optional)**.
- Instructions are trimmed, nullable, and limited to 2,000 characters.
- Empty instructions use the unchanged `quiz-generation@1` instructions and input. Non-empty instructions use `quiz-generation@2` and a distinct `LEARNER_PREFERENCES` input section.
- Learner preferences yield to source grounding, selected format/count/difficulty/context mode, factual accuracy, validation, and safety.
- The value is stored separately from the frozen source snapshot. It is not copied into AI usage diagnostics, manifests, logs, or quiz-list summaries.
- There is no saved-quiz regeneration operation. Saved detail is read-only; the existing in-session **Generate another** action retains editable form state.

**Planning decisions (scoped study history — 9002–9008).**
- **7013 revision:** Aggregation and Mongo-side filter/pagination live on `server-data`. `server-webApp` owns JWT validation and screen-specific DTOs via one shared dataApi client. This intentionally changes 7013’s “aggregate on webApp from a dump” rule.
- Public dashboard endpoint remains `GET /study-history` (evolved), not `/dashboard/history`.
- `GET /quizzes/:quizId/attempts` stays for player/resume; `GET /quizzes/:quizId/history` is study/stats only.
- Workspace scope uses `GET /subjects/:subjectId/history?topicId=`. Quiz list stays on `GET /quizzes`.
- Evaluated attempts only by default; ignore `in_progress` / `evaluation_failed`.
- Pagination mirrors quiz-list: `page`, `limit`, `pagination: { page, limit, totalItems, totalPages }`. Data max limit 100. Business defaults: dashboard recent results **5**, workspace **3**, quiz attempts **5**.
- Scope `avgPercent`: mean of **latest-per-quiz** percents. Quiz `avgLastNPercent`: mean of last ≤N attempt percents (default **N=10**). Distribution min/max/mean/last: over **all** evaluated attempts in filter. `attemptSeries`: last ≤N percents oldest→newest.
- Weakest questions: top 5; prompt + score metadata only—never keys, rubrics, explanations, responses, or snapshots.
- Activity buckets remain dashboard-only (7013 UTC rules).
- UI: compose small shared primitives; no mandatory StudyHistoryWidget. SVG/CSS only (no chart library). Design tokens from Light Mint & Indigo.

**Planning decisions (INT host — 9010–9011).**
- One long-lived INT, not production: `https://int.quizcontext.app`. Compute is a DigitalOcean Droplet (~2 GB Ubuntu + Docker Compose + host Caddy). Not Vercel, App Platform, Tunnel, or Kubernetes.
- Cloudflare is **DNS only** (grey-cloud `int` A record). No Access, no extra registration gate. Existing QuizContext auth is enough.
- Two Compose services. `server-webApp` serves the SPA on loopback **4017**; Caddy terminates HTTPS. `server-data` stays on the Compose network. Atlas `quizcontext-int` starts empty. Local Mongo is not migrated in D1 (D2 activity).
- 9010 is locally verifiable compose/scaffold. 9011 is the runbook and live cutover. Roadmap: [deployment-evolution-plan.md](../../reference/Deployment/deployment-evolution-plan.md). Operator clicks: [deployment-operator-checklist.md](../../reference/Deployment/deployment-operator-checklist.md).

**Out of phase.** Adaptive or live oral interviews, reusable presets, profile-level preferences, editing historical generation metadata, a saved-quiz regeneration endpoint, automatic instruction rewriting/moderation, retries, batching, question-limit changes, RAG, billing, spaced repetition, and rewriting unrelated dashboard subject cards.
