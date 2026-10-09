# Phase 2 — Authentication and data infrastructure

**Objective.** Let a user register, log in, and read their own account through the protected client and both APIs.

**Deliverable.** Registration, login, a protected application shell, and retrieval of the signed-in user's persisted record, with ownership enforced in `server-data`.

**Depends on.** Phase 1 (running stack, internal API client, error and OpenAPI conventions).

**Roadmap.** [Phase 2 in the MVP plan](../00_MVP-Development-Plan.md#phase-2).

**Tickets.** Planned, in order. Implement only after one is approved, or run `/implement-phase` for Phase 2.

1. [P2-01](P2-01-user-identity.md) — user record and trusted `X-User-Id` header.
2. [P2-02](P2-02-auth-api.md) — register, login, JWT, and current user.
3. [P2-03](P2-03-auth-shell.md) — auth screens and protected shell.
