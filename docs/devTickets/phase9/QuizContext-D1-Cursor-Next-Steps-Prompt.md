# Cursor prompt — transition QuizContext D1 from external setup to implementation

We are ready to move from external infrastructure provisioning to the D1 deployment implementation of QuizContext.

Please read, in order:
1. `QuizContext-D1-Infrastructure-Handoff.md` (new handoff; I will add it to the repo).
2. `docs/reference/Deployment/deployment-operator-checklist.md` and `docs/reference/Deployment/deployment-evolution-plan.md`.
3. Existing tickets 9010 and 9011, and the current `dev-deploy` code/environment examples.

The handoff records user-confirmed work already performed in Cloudflare, DigitalOcean and Atlas. Treat items marked **verify** as unconfirmed; do not silently infer completion. In particular, Cloudflare DNS resolves `int.quizcontext.app` to an SSH-accessible Ubuntu 24.04.5 Droplet; Atlas cluster `quizcontext-int`, Droplet IP access and a restricted DB user were configured. **No application deployment has occurred yet.** Do not ask me to re-provision these resources.

## What I need now

1. **Reconcile the operator checklist with the current state.** Make a short remaining-actions sequence split between Cursor work and my manual VM/platform actions. Point out blockers only if genuinely necessary.
2. **Confirm 9010 is implementation-ready and provide the exact execution and verification sequence**, as already scoped, on the existing `dev-deploy` branch. Preserve Release-2 behaviour and the Git/tag constraints. The eventual implementation must validate Compose build/runtime, static React SPA and API routing, `VITE_WEB_API_BASE_URL` same-origin behaviour, and the longer Atlas timeout. Keep the Data API private; only `server-webApp` may be bound to VM loopback port 4017.
3. **Confirm 9011 follows 9010 and identify the remaining owner actions**, as already scoped: tracked Caddyfile + `docs/getting-started-hosted.md`. The eventual runbook must be executable on Ubuntu 24.04, with exact commands for installing Docker/Compose and Caddy, safe VM environment-file creation, starting services, logs, health checks, DNS/HTTPS verification, reboot survival, subsequent redeployment and rollback. Keep Caddy (not Tunnel or App Platform). Keep Cloudflare DNS-only and normal app login; no Access/email whitelist.
4. **Specify the VM-only environment-file contract** using only the actual repository variables, showing redacted placeholders and precisely which variables each Compose service receives. Clarify `.env` interpolation versus `env_file`/`environment` injection, build-time Vite configuration, permissions and secret protection. I will enter real values manually on the VM using my password manager. **Never request, print, commit or embed credentials in documentation.** No new product env variable names unless absolutely required; report any such need before changing the contract.
5. **Check the AI availability/cost contradiction:** the current notes say `AI_ENABLED=false`, and suggest users bring their own OpenAI keys, but it is not yet verified whether user-key quiz generation works with the feature disabled. Inspect real code, report the exact behaviour and recommend a minimal secure INT setting that lets my classmate study without unexpected app-key spending. Don't invent a new quota subsystem for D1.
6. **Specify the later as-built deployment log** to include in the 9011 runbook (or reference the handoff log) so we can document actual commands, infrastructure versions, problems, non-secret identifiers, test outcomes and deployed Git SHA for a future portfolio/video case study. Do not record any secret values.

## Rules

- No `main` deployment. Existing `dev-deploy` branch and `first-use-9001` tag (`8583124`) must remain intact; scaffold later merges into `Phase9-historyEnhance` as planned.
- D1 remains DigitalOcean Droplet + Ubuntu + Docker Compose + Caddy + Cloudflare DNS-only + Atlas. No AWS, CI/CD, new service, database migration or extra access gate.
- No new application business-logic refactors or product behaviour changes, beyond narrow hosted compatibility fixes in 9010.
- Atlas URI uses `/quizcontext-int`; existing `server-data` passes only `MONGODB_URI` to Mongoose; do not add DB-name config code.
- No real secrets in code, commits, images, README or prompts. The VM environment file is untracked and permission-restricted.
- Before taking any action that depends on a live credential, stop at clear instructions for **me** to perform it. Do not pretend to have logged into my Cloudflare, DigitalOcean or Atlas accounts.

**This pass is planning / readiness review only. Do not change application code, execute infrastructure commands, start the deployment, or perform Git history operations.** Provide the remaining step-by-step sequence and any exact, narrowly scoped ticket/runbook amendments required. Then identify the next Cursor instruction to approve: **implement 9010**. Once separately approved, implement 9010, validate and report it, then begin 9011 only after its prerequisites are met. Keep the handoff/checklist updated with non-secret verified facts as work progresses.
