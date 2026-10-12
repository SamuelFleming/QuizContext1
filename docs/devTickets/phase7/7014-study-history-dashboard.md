# 7014 — Study history on the Dashboard

**Status:** Planned  
**Phase:** 7  
**Depends on:** 7013  
**Relevant scope:** Phase 7 README; S02; `docs/design/01_design-concept.md`; P6-06

## Objective
The Dashboard shows the 7013 study summary: how many quizzes exist, how many have been completed, how recent that work is, and which topics and questions are weakest. The existing subject list and recent quiz and attempt lists stay.

## In scope
- A study-history section on the current Dashboard (`features/dashboard/Dashboard.jsx`). No new route.
- Filters bound to the 7013 query: all subjects, or one subject, then optionally one topic of that subject. Recent results: last 1, 3, 5, or all. Activity window: 7 days, 30 days, or 90 days. Changing a filter reloads the summary. The subject and topic pickers use the existing list calls.
- Counts line: quizzes saved, quizzes attempted, evaluated attempts, and "Last studied" as the date of `lastStudiedAt` or "No evaluated attempt yet".
- Activity chart from the `activity` buckets. Bars use theme tokens. 7 days shows a bar per day. 30 and 90 days show a bar per week. Each bar has a text label for its count, not colour alone. A short line states the window total, for example "4 evaluated attempts in the last 7 days".
- Recent results list the returned rows with title, scope, date, and score, and open that attempt. When `recent=all` and `recentTotal` is greater than the rows shown, say that the list is capped.
- Weakest topics, up to 5, showing stored scope name, average percent, and quiz count. Weakest questions, up to 5, showing the prompt, quiz title, average score, and times answered, and opening the latest attempt for that question.
- Empty states: no quizzes in the filter; quizzes saved but none evaluated. Loading and error states match the existing dashboard cards.
- 390px: filters stack, the chart does not overflow horizontally, and the bars remain readable.

## Out of scope
- Removing or redesigning the existing Subjects, Recent quizzes, and Recent attempts cards.
- A separate analytics page, concept weakness, spaced repetition, and exporting the history.
- New chart libraries. Bars are plain layout.

## Acceptance checks
- [ ] From the browser, after one evaluated attempt, the Dashboard shows quizzes saved, quizzes attempted, the score in recent results, a non-zero activity bucket, and last studied. Opening the result row lands on that attempt.
- [ ] Choosing a subject limits the counts to that subject. Choosing a topic limits them further. All subjects restores the full counts.
- [ ] Last 1 shows one quiz. A second evaluated attempt on the same quiz does not add a second recent-results row.
- [ ] A filter with quizzes but no evaluated attempt shows the empty completion state and does not show a weakest list.
- [ ] The section shows no correct option, expected answer, or marking criteria.
- [ ] At 390px the filters and chart fit. Lint and build pass.

## Implementation notes
This is the frontend for 7013. S02's "no sophisticated analytics" note is the same Phase 7 exception recorded on 7013. The Dashboard is the place for this history; do not add a second screen in this ticket.
