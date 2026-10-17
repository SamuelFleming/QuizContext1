# Implement Ticket

Implement **one user-selected, approved** ticket (`P1-01` style for Phases 1–6, or `7001` style from Phase 7). Skip a ticket marked Discovery or Deferred.

1. Read `CLAUDE.md`, the ticket and only its relevant core-scope sections/rules.
2. Inspect affected code and relevant reference examples only if needed. Flag conflicts rather than silently changing requirements.
3. Make the smallest coherent implementation satisfying acceptance criteria. Keep the two API boundaries intact.
4. Update live Swagger/OpenAPI for changed endpoints in each affected API.
5. Run focused verification (build/startup, request smoke tests, or narrow tests) appropriate to the change. Report unrun checks.
6. Update ticket status, `devTickets_next.md`, and `devCompletion.md` once criteria are satisfied; otherwise leave status in progress/blocked with precise reason.
7. Return a brief result: modified files, checks/results, deviations, next dependency.

Do not implement adjacent tickets, refactor unrelated code, or run Git commits/pushes without explicit instruction.
