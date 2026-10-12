# Phase 7 — Initial UAT feedback

**Status:** Discovery in progress (7000). Planned build tickets are 7001–7005, 7010, 7011, 7013, and 7014. 7012 and 7026–7029 are deferred.

**Objective.** Refine the shipped MVP from first real use: more study files become reviewed text, and the user can see whether a subject, topic, or AI description is complete enough to quiz.

**Deliverable.** Larger uploads; `.docx`, `.pptx`, `.py`, and `.ipynb` extraction on the existing review-then-save path; topic completeness indicators; a per-subject completeness bar; a date check for accepted AI descriptions; quizzes over an explicit set of topics, with incomplete topics refused.

**Depends on.** Phases 4–6 as shipped.

**Roadmap.** [Phase 7 in the MVP plan](../00_MVP-Development-Plan.md#phase-7).

**Tickets.** IDs from this phase onward are `7000`, `7001`, and so on. Phases 1–6 keep `P1-01` style.

0. [7000](7000-uat-change-discovery.md) — test the MVP and capture wanted changes. Discovery, in progress. Not an implementation ticket.
1. [7001](7001-upload-size-limit.md) — raw upload limit 25 MB.
2. [7002](7002-docx-extraction.md) — Word `.docx`.
3. [7003](7003-pptx-extraction.md) — PowerPoint `.pptx`.
4. [7004](7004-python-upload.md) — `.py`.
5. [7005](7005-notebook-upload.md) — `.ipynb`.
6. [7010](7010-multi-topic-quiz-api.md) — generation from an explicit topic set. Depends on deferred 7026.
7. [7011](7011-quiz-topic-picker.md) — form for that set; incomplete topics cannot be chosen. Depends on deferred 7026 and on 7010.
8. [7013](7013-study-history-api.md) — study history summary from saved quizzes and evaluated attempts.
9. [7014](7014-study-history-dashboard.md) — Dashboard counts, activity, recent results, and weakest topics and questions. Depends on 7013.
10. [7012](7012-image-source-investigation.md) — image-heavy sources. Deferred.
11. [7026](7026-content-completeness.md) — completeness facts on subject and topic reads. Deferred.
12. [7027](7027-topic-completeness-indicators.md) — indicators in the workspace tree. Deferred.
13. [7028](7028-subject-completeness-bar.md) — bar on the workspace subject and the dashboard. Deferred.
14. [7029](7029-description-freshness.md) — AI description vs later notes and documents. Deferred.

**Not in this phase.** Quiz `AI_INVALID_OUTPUT` failures (output budget, strict validation, retries). Held until a later prompt. Do not fold a generation-reliability fix into these tickets.

**Conflicts with current core scope (intentional; do not silently "fix" core scope while implementing).**

- Product theory §4 allows an entire subject, one topic, or a topic plus descendants. 7010 adds a fourth scope: an explicit set of topics, without their unselected siblings or descendants. Core scope stays the MVP description until someone updates it on purpose.
- S02 says the MVP does not require progress visualisations. The subject bar (7028) and the study-history summary (7013, 7014) are post-MVP UAT additions.
- S05 speaks of one subject or topic. 7011 extends the generation form.

**Planning decisions (change before implementing if wrong).**

- **Still text in the database.** Original bytes are not stored. Extraction stays in `server-webApp`. `server-data` still receives JSON. The user still reviews and can edit before save.
- **25 MB raw file, 200,000 character text cap unchanged.** The 5 MB rejection was the UAT failure. Lecture PDFs are often large because of images even when the words are short. The extracted-text cap stays 200,000 characters; a file that extracts more than that still returns 422 and asks the user to split it. Upload uses memory only for the duration of extraction.
- **New types this phase:** `.docx`, `.pptx`, `.py`, `.ipynb`. Already allowed: `.md`, `.markdown`, `.txt`, text PDFs. Legacy `.doc` and `.ppt` stay unsupported (415 naming `.docx` or `.pptx`). No OCR.
- **Libraries.** `.docx` via a Word extractor (CareerContext used `mammoth`). `.pptx` via a slide-text extractor (CareerContext used `officeparser`). Confirm current APIs. Do not copy CareerContext source. `.py` is UTF-8, same as `.txt`. `.ipynb` is parsed as a notebook: code and markdown cell sources, in order, labelled. Outputs, images, and widget state are omitted.
- **Content-complete means own study text.** A topic is content-complete when its own notes are non-empty after trim, or it has at least one document with that `topicId`. A child's notes do not make the parent complete. A subject is content-complete when its own notes are non-empty or it has at least one document with `topicId` null. A description is not required for content-complete. These flags are computed on read, not stored.
- **The bar is per subject, not the account Profile.** It is the study-profile equivalent of CareerContext's profile bar. Percentage = content-complete topics / all topics in that subject. Zero topics shows an empty bar and "No topics yet", not 100%. Subject-level notes or documents are a separate caption, not part of the percentage. S08 is unchanged.
- **Incomplete topics cannot be picked for a quiz.** The form rejects a topic that is not content-complete. Whole-subject quizzes stay allowed: empty topics are already left out of the context package, and the form says which topics will be left out. Checking a parent checks the content-complete topics under it and skips the incomplete ones. Those skipped topics are named. They do not fail the request.
- **A chosen set is exact.** The form sends `topicIds` for each checked topic, including a subtopic whose parent was left unchecked. A parent's notes are not pulled in unless that parent is checked. `includeDescendants` is not sent by the form. Do not send both `topicId` and `topicIds`. Maximum 30 topics, all in the same subject.
- **Freshness is only for an accepted AI description, and only at that entity.** Accepting a suggestion sets `descriptionGeneratedAt` to now, even if the user edited the suggestion first. A later manual change to the description clears it. `sourcesChangedAt` updates when that entity's notes change, or when a document on that entity is created, updated, or deleted. Descendant changes do not count. The description is stale when both timestamps exist and `sourcesChangedAt` is later. Existing rows stay unset, so nothing already saved is marked stale until a new suggestion is accepted and later sources change. Freshness does not block quizzes or saves.
