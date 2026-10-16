# Phase 3 — User profile and AI configuration

**Objective.** Let a user manage profile and OpenAI access, and prove a controlled model call can run with the resolved key.

**Deliverable.** Profile and settings UI, encrypted user keys or application-key access, a connectivity check, and a usage record (tokens and estimated cost).

**Depends on.** Phase 2 identity, ownership, and user persistence.

**Roadmap.** [Phase 3 in the MVP plan](../00_MVP-Development-Plan.md#phase-3).

**Tickets.** Planned, in order. Implement only after one is approved, or run `/implement-phase` for Phase 3.

1. [P3-01](P3-01-profile.md) — profile read and update.
2. [P3-02](P3-02-ai-key-settings.md) — AI access mode and AES-256-GCM encrypted user key.
3. [P3-03](P3-03-ai-boundary-check.md) — OpenAI boundary, per-request key resolution, usage record, connectivity check.
4. [P3-04](P3-04-usage-summary-limit.md) — usage summary and application-key monthly limit.

**Addendum: code organisation refactor** ([pattern-refactor.md](pattern-refactor.md)). Move-only; no behaviour change.

5. [P3-05](P3-05-code-organisation-convention.md) — folder and layer convention in core scope.
6. [P3-06](P3-06-server-data-structure.md) — server-data layered structure.
7. [P3-07](P3-07-server-webapp-structure.md) — server-webApp layered structure.
8. [P3-08](P3-08-client-structure.md) — client-webApp feature structure.
