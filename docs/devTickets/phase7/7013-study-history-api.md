# 7013 — Study history summary

**Status:** Planned  
**Phase:** 7  
**Depends on:** None  
**Relevant scope:** Phase 7 README; F08; S02; P6-04; P6-06

## Objective
The caller can read one summary of quizzes saved and quizzes actually completed, scoped to everything, one subject, or one topic. The summary is computed from the quizzes and evaluated attempts that already exist. It does not add a second history store.

## In scope
- `GET /study-history` on `server-webApp` (JWT). `server-data` gains one owner-scoped read that returns the fields this summary needs. The browser never calls `server-data`.
- Query, all optional except as stated:
  - `subjectId` — limit to that subject. Unknown or another user's subject is 404.
  - `topicId` — requires `subjectId`, otherwise 400. Matches a quiz whose `topicId` is that id, or whose `topicIds` contains it when that field exists. A whole-subject quiz is not included in a topic filter.
  - `recent` — `1`, `3`, `5`, or `all`. Default `5`.
  - `activity` — `7`, `30`, or `90`. Default `7`. Counts days, not quizzes.
- Counts, for the subject/topic filter, ignoring `recent` and `activity`:
  - `quizzesSaved` — quizzes in scope.
  - `quizzesAttempted` — those with at least one `evaluated` attempt.
  - `evaluatedAttempts` — evaluated attempts in scope.
- `recentResults` — one row per quiz, using that quiz's latest evaluated attempt, newest first. `recent=1|3|5` returns that many. `recent=all` returns at most 50 and includes `recentTotal` so the client can say the list is capped. Each row has attempt id, quiz id, title, subject name, topic path, submitted time, score, max score, and percent. No question text.
- `activity` — evaluated attempts bucketed by `submittedAt` in UTC. `7` is one bucket per day. `30` and `90` are one bucket per week, week starting Monday. Empty buckets are present with count 0. In-progress and `evaluation_failed` attempts are not included.
- `weakestTopics` — up to 5. Group evaluated quizzes by stored `topicId`, or by the subject when `topicId` is null. Use each quiz's latest evaluated percent. Sort by average percent ascending, then by quiz count descending. Each row has the stored subject name, topic path or "Whole subject", average percent, and quiz count. A deleted topic still appears under the name stored on the quiz.
- `weakestQuestions` — up to 5. Across evaluated attempts in scope, average the stored per-question score for the same quiz question id. Sort by average score ascending, then by times answered descending. Each row has prompt, quiz title, scope names, average score, times answered, and the attempt id of the most recent answer. No correct option, expected answer, marking criteria, explanation, or snapshot.
- `lastStudiedAt` — submitted time of the newest evaluated attempt in the filter, or null.
- Swagger on both APIs. The business response is this summary only.

## Out of scope
- Dashboard widgets (7014).
- A separate study-history collection, backfill job, or export.
- Concept-level weakness. Question `concepts` and `missingConcepts` stay unused here.
- Changing how an attempt is marked. This ticket only reads stored evaluations.
- Counting in-progress or failed evaluations as completions.

## Acceptance checks
- [ ] A user with two subjects sees all-scope counts equal to the sum of the per-subject counts. A topic filter does not include a whole-subject quiz or another topic's quiz.
- [ ] Two evaluated attempts on one quiz produce `quizzesAttempted` 1 and `evaluatedAttempts` 2. `recent=1` returns that quiz once, with the later score.
- [ ] An in-progress attempt does not change counts, activity, weakest lists, or `lastStudiedAt`.
- [ ] `activity=7` returns 7 daily buckets including zeros. A day with two evaluated attempts has count 2.
- [ ] The weakest question row has the prompt and scores only. The JSON has no answer key, criteria, explanation, or snapshot.
- [ ] User B's subject id is 404. No token is 401. `topicId` without `subjectId` is 400.
- [ ] Swagger on both APIs matches the route.

## Implementation notes
P6-06 already lists recent attempts and stores score, percent, and per-question results on the attempt. Do not copy those documents into a new collection. Aggregation belongs in `server-webApp`. `server-data` only returns owned quiz and attempt fields, still without offering the read to the browser. S02 said the MVP would not require progress visualisations. This summary is the Phase 7 exception, and 7014 is what draws it.
