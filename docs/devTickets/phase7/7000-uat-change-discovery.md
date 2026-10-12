# 7000 — UAT change discovery

**Status:** Done  
**Phase:** 7  
**Depends on:** Phases 1–6 shipped  
**Relevant scope:** Phase 7 README; first real use of the MVP

## Objective
Test the shipped MVP and record each change wanted from that use as its own Phase 7 ticket. This ticket is the discovery pass. It does not build those changes.

## In scope
- Use the running app and note what fails or what should change.
- For each accepted change, add the next `7xxx` ticket in `docs/devTickets/phase7/`, then list it in this phase's README and in `devTickets_next.md`.
- Keep a short note of items that were tried and deliberately left without a ticket.

## Out of scope
- Implementing 7001 upward.
- Renumbering Phases 1–6. Those IDs stay `P1-01` through `P6-06`.
- Quiz `AI_INVALID_OUTPUT` reliability, until a later request.

## Acceptance checks
- [x] Changes captured so far are 7001–7005, 7010–7016, and 7026–7029. 7012 and 7026–7029 are deferred.
- [x] Discovery closed on 2026-10-13. No further item from this pass. Quiz `AI_INVALID_OUTPUT` reliability stays unscoped, as already recorded in the phase README.
- [x] This ticket changes no application code.

## Implementation notes
Closed by request. The captured tickets stand. `/implement-phase` skips a Discovery ticket, and this one is done. The first build ticket is 7001.
