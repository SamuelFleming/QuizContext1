# Implement Numerous

Implement the tickets named in the same message. They may come from any phase. **Do not plan, commit, or push.** `/implement-phase` is unchanged and still runs one whole phase.

Invoking this command approves those already written tickets. Complete them one at a time, in the order named, by following `.cursor/commands/implement-ticket.md` for each. Do not merge them into one change. If the message names no ticket IDs, stop and ask which ones to run.

1. Read `CLAUDE.md` and `docs/devTickets/devTickets_next.md`. Read each ticket when you reach it, plus only the scope that ticket names. Do not re-read earlier tickets, other phases, or the whole core-scope set between tickets.
2. Skip a ticket already listed in `devCompletion.md`, and skip a ticket marked Discovery or Deferred. If a named ticket depends on one that is neither done nor earlier in this run, stop.
3. For each remaining ticket, follow `implement-ticket` with one focused check: a startup, a request, a build, or the changed screen, whichever shows that ticket's acceptance. Do not re-run earlier tickets, a phase regression, or a wide browser pass. A visible UI change gets one pass of the flow that ticket changed.
4. Update that ticket, `devTickets_next.md`, and `devCompletion.md` when its check passes. Start the next ticket only then. If a check fails, make one minimal pass on that failure. Fix it when the cause is local and inside the ticket, such as a startup error, a wrong port, a missing import, or a Swagger path, then run the same check again. Stop when that still fails, or the block is significant: a conflict with the MVP plan or core-scope, a broken API boundary, or something outside the ticket. Leave the ticket in progress or blocked with the reason. Do not continue.
5. Keep the two API boundaries intact. When the last named ticket passes, stop. Do not start a ticket the user did not name.

## Output

Summarise each ticket: what changed, what was checked, and any deviation. If the run stopped early, name the blocking ticket.

The user reviews, commits, and pushes.
