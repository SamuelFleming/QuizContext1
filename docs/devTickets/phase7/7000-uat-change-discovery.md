# 7000 — UAT change discovery

**Status:** In progress  
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
- [x] Changes captured so far are 7001–7005, 7010–7012, and 7026–7029. 7012 and 7026–7029 are deferred.
- [ ] Further testing either adds the next `7xxx` ticket or records why the item stays unscoped.
- [ ] This ticket changes no application code.

## Implementation notes
`/implement-phase` skips a Discovery ticket. The first build ticket is 7001.
