# Development Queue

Roadmap: [00_MVP-Development-Plan.md](00_MVP-Development-Plan.md). Phases are scoped there. Tickets are written one phase at a time.

## MVP phase outline
| Phase | Goal | State |
|---|---|---|
| 1 | Local foundations + one dual-API vertical slice | Done |
| 2 | Authentication, ownership + foundational persistence | Done |
| 3 | User profile, secure AI key configuration + usage; code organisation refactor | Done |
| 4 | Subjects, recursive topics, Markdown + document ingestion | Done |
| 5 | OpenAI integration + AI-assisted descriptions | Done |
| 6 | Quiz generation, completion, evaluation, history + export | Done |
| 7 | Initial UAT: wider text extraction, content completeness, multi-topic quizzes | Build complete; manual UAT pending |
| 8 | AI quiz generation experiment: configurable budgets, usage visibility, model catalogue, quiz model picker; workspace quiz visibility + content size | 8000–8010 done |
| 9 | Optional quiz-generation instructions | Build complete; browser and live-provider UAT pending |

## Phase 1 order
1. [P1-01](phase1/P1-01-local-applications.md) — done.
2. [P1-02](phase1/P1-02-internal-diagnostic-api.md) — done.
3. [P1-03](phase1/P1-03-connectivity-screen.md) — done.

## Next approved ticket
None queued. Phase 9 build is complete; browser and live-provider UAT remain pending.

## Phase 9 proposed order
1. [9000](phase9/9000-optional-quiz-instructions-api.md) — API validation, versioned prompt integration, persistence, projection, and OpenAPI. Done.
2. [9001](phase9/9001-optional-quiz-instructions-ui.md) — generation textarea, request wiring, retained state, and saved-quiz visibility. Done. Depends on 9000.

## Phase 7 proposed order
0. [7000](phase7/7000-uat-change-discovery.md) — test the MVP and capture wanted changes. Done.
1. [7001](phase7/7001-upload-size-limit.md) — raw upload limit 25 MB. Done.
2. [7002](phase7/7002-docx-extraction.md) — Word `.docx` to reviewed text. Done.
3. [7003](phase7/7003-pptx-extraction.md) — PowerPoint `.pptx` to reviewed text. Done.
4. [7004](phase7/7004-python-upload.md) — `.py` as UTF-8 text. Done.
5. [7005](phase7/7005-notebook-upload.md) — `.ipynb` cell sources to reviewed text. Done.
6. [7006](phase7/7006-content-completeness.md) — computed completeness on subject and topic reads. Done. Renamed from 7026.
7. [7010](phase7/7010-multi-topic-quiz-api.md) — generate from an explicit topic set. Done. Depends on 7006.
8. [7011](phase7/7011-quiz-topic-picker.md) — multi-select; incomplete topics cannot be chosen. Done (browser checks pending manual UAT). Depends on 7006 and on 7010.
9. [7013](phase7/7013-study-history-api.md) — study history summary from saved quizzes and evaluated attempts. Done.
10. [7014](phase7/7014-study-history-dashboard.md) — Dashboard counts, activity, recent results, and weakest topics and questions. Done (browser checks pending manual UAT). Depends on 7013.
11. [7015](phase7/7015-ai-run-diagnostics.md) — record scope, size, token counts, and why an AI reply was rejected. Done.
12. [7016](phase7/7016-ai-run-visibility.md) — show those diagnostics on Profile and on a failed quiz generation. Done (browser checks pending manual UAT). Depends on 7015.
13. [7017](phase7/7017-ai-usage-pagination.md) — paginate AI usage history. Done (browser checks pending manual UAT). Depends on 7015 and 7016.
14. [7018](phase7/7018-quiz-generation-diagnostics-api.md) — preview quiz input metrics and return safe AI run diagnostics. Done (provider-mocked UAT pending). Depends on 7015.
15. [7019](phase7/7019-quiz-generation-progress-ui.md) — loading, result, error, and details UX. Done (browser UAT pending). Depends on 7016 and 7018.
16. [7030](phase7/7030-quiz-title-library-api.md) — optional quiz titles plus filtered, sorted, paginated library APIs. Done.
17. [7031](phase7/7031-quiz-title-library-ui.md) — title entry and scalable Quiz library controls. Done. Depends on 7030.
18. [7032](phase7/7032-quiz-title-rename.md) — rename a saved quiz title. Done. Depends on 7030.
19. [7012](phase7/7012-image-source-investigation.md) — image-heavy files. **Deferred.** `/implement-phase` skips it. Do not implement until asked.
20. [7027](phase7/7027-topic-completeness-indicators.md) — workspace indicators. **Deferred.** Depends on 7006.
21. [7028](phase7/7028-subject-completeness-bar.md) — per-subject completeness bar. **Deferred.** Depends on 7006.
22. [7029](phase7/7029-description-freshness.md) — AI description older than later notes or documents. **Deferred.**

Shared rules are in the [Phase 7 README](phase7/README.md). Quiz `AI_INVALID_OUTPUT` reliability is not in this phase.

## Phase 8 proposed order
1. [8000](phase8/8000-ai-quiz-generation-experiment.md) — configurable quiz output and reasoning controls, plus the manual experiment guide. Done.
2. [8001](phase8/8001-question-type-counts-ai-usage.md) — persist nullable question-type counts on AI usage. Done. Depends on 7015.
3. [8003](phase8/8003-question-type-counts-ui.md) — show those counts on Profile and shared AiRunDetails. Done (browser UAT pending). Depends on 8001 and 7016.
4. [8002](phase8/8002-model-catalogue.md) — central model catalogue for pricing and default selection. Done. Depends on 8000; independent of 8001/8003.
5. [8004](phase8/8004-quiz-model-selection-api.md) — `GET /ai/models`, optional `model` on preview/generate, preview cost estimates. Done. Depends on 8002 and 7018.
6. [8005](phase8/8005-quiz-model-picker-ui.md) — generate-form model picker (default Luna) + live estimate summary. Done. Depends on 8004 and 7019.
7. [8006](phase8/8006-workspace-tree-layout.md) — workspace topic tree cap/scroll, alphanumeric order, Quiz History scaffold. Done.
8. [8007](phase8/8007-quiz-subject-filter-api.md) — `GET /quizzes` optional `subjectId` filter. Done. Depends on 7030.
9. [8008](phase8/8008-content-character-totals.md) — own and subtree content character totals on subject/topic reads. Done. Depends on 7006.
10. [8009](phase8/8009-workspace-study-panel.md) — workspace size summary, scoped quiz list, study history panel. Done. Depends on 8006, 8007, 8008, and 7013.
11. [8010](phase8/8010-workspace-lhs-density-document-modal.md) — LHS density (Quizzes under Documents), compact rows, page size 3, document open modal. Done. Depends on 8009.

Shared rules are in the [Phase 8 README](phase8/README.md). Retries, a higher question limit, batching, prompt changes, and raw-output capture stay out until a later decision.

## Phase 6 proposed order
1. [P6-01](phase6/P6-01-quiz-generation-api.md) — generation API, quiz persistence, study-view projection. Done.
2. [P6-02](phase6/P6-02-quiz-generation-ui.md) — generation form and saved-quiz detail. Done.
3. [P6-03](phase6/P6-03-attempt-player.md) — attempts and Quiz Player (no marking). Done.
4. [P6-04](phase6/P6-04-attempt-evaluation-api.md) — submit evaluates; MC by comparison, short answer via AI. Done.
5. [P6-05](phase6/P6-05-quiz-results.md) — results screen and evaluation-failed retry. Done.
6. [P6-06](phase6/P6-06-library-repeat-export.md) — library, history, delete, export, dashboard, phase close-out. Done.

## Phase 5 proposed order
1. [P5-01](phase5/P5-01-context-package.md) — context resolver, data API source read with document content, budget, truncation and insufficient-content reporting, context-mode input. Done.
2. [P5-02](phase5/P5-02-description-suggestion-api.md) — description suggestion route, versioned prompt and validator, `AiUsage` run-log fields. Done.
3. [P5-03](phase5/P5-03-description-suggestion-ui.md) — workspace suggest, review, accept, and discard; phase close-out. Done.

Planning decisions (`AiUsage` as the run log, character budget, `very_strict` naming) are listed in the [Phase 5 README](phase5/README.md).

## Phase 4 proposed order
1. [P4-01](phase4/P4-01-subjects.md) — subject CRUD, Subjects screen, Dashboard list. Done.
2. [P4-02](phase4/P4-02-topic-tree.md) — recursive topic tree and subtree delete. Done.
3. [P4-03](phase4/P4-03-markdown-notes.md) — Markdown description and notes with safe preview. Done.
4. [P4-04](phase4/P4-04-document-upload-review.md) — document upload, extraction, review, save. Done.
5. [P4-05](phase4/P4-05-document-edit-delete.md) — document edit/delete, cascades, phase close-out. Done.

Planning decisions (hard delete with cascade, no topic move, no stored originals, limits) are listed in the [Phase 4 README](phase4/README.md).

## Phase 3 proposed order
1. [P3-01](phase3/P3-01-profile.md) — profile read and update. Done.
2. [P3-02](phase3/P3-02-ai-key-settings.md) — AI access mode and encrypted user key (AES-256-GCM in `server-webApp`). Done.
3. [P3-03](phase3/P3-03-ai-boundary-check.md) — OpenAI boundary, key resolution, `AiUsage` record, connectivity check. Done.
4. [P3-04](phase3/P3-04-usage-summary-limit.md) — usage summary and application-key monthly token limit. Done.
5. [P3-05](phase3/P3-05-code-organisation-convention.md) — folder and layer convention in core scope. Done.
6. [P3-06](phase3/P3-06-server-data-structure.md) — server-data layered structure. Done.
7. [P3-07](phase3/P3-07-server-webapp-structure.md) — server-webApp layered structure. Done.
8. [P3-08](phase3/P3-08-client-structure.md) — client-webApp feature structure. Done.

Open follow-up (still open after Phase 5, which was verified against a mocked provider): a real successful OpenAI call has not been run locally (no key). Set `OPENAI_API_KEY` and `AI_ENABLED=true`, or save a personal key, then use Test connection on Profile. The default model and price table in `server-webApp/src/config/aiConfig.js` are placeholders to verify.

## Phase 2 proposed order
1. [P2-01](phase2/P2-01-user-identity.md) — user record and trusted `X-User-Id`. Done.
2. [P2-02](phase2/P2-02-auth-api.md) — register, login, JWT, current user. Done.
3. [P2-03](phase2/P2-03-auth-shell.md) — auth screens and protected shell. Done.

## Active / blocked
Next implement: none queued. Phase 9 browser and live-provider UAT remain pending, alongside 7011, 7014, 7016, 7017, 7018, 7019, and the 7032 detail-screen click where noted.

The user-identity channel is `X-User-Id` plus the existing internal API key. Password hashing and JWT issuance stay on `server-webApp`.
