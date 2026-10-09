# Implement Phase

Implement the user-named QuizContext phase. **Do not plan another phase, commit, or push.**

Invoking this command approves that phase's already written tickets. Complete them one at a time, in queue order, by following `.cursor/commands/implement-ticket.md` for each. Do not merge them into one change.

1. Read `CLAUDE.md`, that phase in `docs/devTickets/00_MVP-Development-Plan.md`, its README, and `docs/devTickets/devTickets_next.md`.
2. Take the phase's tickets in the queue's proposed order. Skip any ticket already listed in `devCompletion.md`. If a dependency is unfinished or a ticket is blocked, stop.
3. For each remaining ticket, follow `implement-ticket` in full: inspect the code, make the smallest change that meets that ticket, update live OpenAPI, run that ticket's focused check, then update the ticket, the queue, and `devCompletion.md`.
4. Start the next ticket only after the current one passes. If a check fails, or the ticket conflicts with the MVP plan or core-scope, stop. Leave that ticket in progress or blocked with the reason. Do not continue.
5. Stay inside the named phase. Keep the two API boundaries intact. When the last ticket passes, stop.

## Output

Summarise each ticket: what changed, what was checked, and any deviation. If the run stopped early, name the blocking ticket.

The user reviews, commits, and pushes. The next phase starts only when the user runs `/plan-phase` for it.
