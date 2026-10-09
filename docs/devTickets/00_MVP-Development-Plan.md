# QuizContext.io — MVP Development Plan

**Status:** Roadmap approved. Phase tickets are not written yet.  
**Date:** 9 October 2026  
**Role:** Phase sequence for `/plan-phase`. Product behaviour stays in the [Project Ideation Charter](../ProjectIdeationCharter.md) and `docs/core-scope/`. CareerContext notes in `docs/reference/` are advisory.

## 1. Purpose

Ship the MVP learning cycle in six phases:

**Manage content → generate a quiz → complete it → evaluate answers → review and repeat.**

Each phase ends in something a developer can demonstrate, through the React client whenever a person would see it. Build a thin vertical slice, then extend it. Write detailed tickets only when that phase is about to start.

The MVP is done when a learner can register, organise their own material, generate a Targeted quiz from it, complete multiple-choice and short-answer questions, receive source-informed feedback, review attempts, repeat the quiz, and export it.

## 2. Fixed architecture

```text
client-webApp (React/Vite)
        |
        v
server-webApp (Express)
  JWT, business logic, AI, quiz workflows
        |
        v
server-data (Express)
  persistence, validation, ownership
        |
        v
      MongoDB
```

The browser calls `server-webApp` only. `server-webApp` calls `server-data` with an environment-held internal API key that is never exposed to the browser. `server-data` stores and validates data and enforces ownership. It does not call OpenAI, assemble prompts, or score quizzes.

Both processes run separately in local development. Each documents the endpoints it actually implements in Swagger/OpenAPI. User-facing quiz and content operations stay on the business API so a later client (including Recall Radio) can call them. The MVP does not build that client, voice, or a second UI.

From the first real screens (Phase 2), the UI is a minimalist, responsive shell: authentication outside the app, then header navigation for Dashboard, Subjects, Quizzes, and Profile. Screens may share layouts. Visual styling follows `docs/design/01_design-concept.md` (current palette: Light Mint & Indigo). Colours are named tokens in one client theme file; components use the token names. Flows F01–F09 and screens S01–S08 are defined in core-scope; this plan only assigns them to phases.

## 3. Cross-phase constraints

Later phases reuse these rules. They are not re-decided per entity.

**Service auth and user identity.** The internal API key proves that `server-webApp` is the caller. The acting user is a separate fact, taken from the verified JWT and passed so `server-data` can scope every user-owned read and write. A user id in a browser body or query is not authority. Cross-user access fails at the data boundary.

**AI setup before product AI.** Phase 3 chooses the OpenAI key (application key or encrypted user key), executes calls through one service in `server-webApp`, and records usage. Phase 5 and Phase 6 call that boundary. Stored keys never appear in responses, logs, or run records.

**One content-resolution path.** Phase 5 builds an ownership-scoped context package: a subject or topic, optional descendants, notes, and reviewed document text. Text is labelled and bounded as source data. The package reports truncation and insufficient content. Phase 6 generation and short-answer evaluation use the same resolver.

**Separate learning records.** A quiz stores its questions, expected answers, generation settings, context mode, and enough source snapshot or provenance to explain later review. An attempt stores one sitting's responses. An evaluation stores marking and feedback for that attempt. Questions and evaluation detail may live inside the parent record. Edits to notes or documents leave saved quizzes and completed attempts unchanged.

**Hidden marking until submit.** The Quiz Player receives prompts and multiple-choice options. Correct answers and marking criteria stay on the server until the attempt is submitted.

**Context mode.** Targeted is the default and the mode the MVP must demonstrate. The selected mode is stored on the quiz and sent with generation and evaluation. Very Strict and Loose stay representable so they can be refined after Targeted works. A mode guides the model; it does not certify factual accuracy. Feedback is study help, not official grading.

**Failure isolation.** A failed extraction or AI call returns a clear error and leaves registration, content editing, and opening a saved quiz working.

## 4. Phases

<a id="phase-1"></a>

### Phase 1 — Foundations and architecture

**Objective.** Run all three applications locally and prove the path from the browser to MongoDB.

**Scope.** Initialise `client-webApp`, `server-webApp`, and `server-data`. Connect MongoDB through `server-data`. Add environment variables and local run scripts. Establish routing, error handling, and a small shared response convention. Publish Swagger for implemented routes on both APIs. Authenticate `server-webApp` to `server-data` with the internal API key, via a dedicated internal client. Add one diagnostic that walks React → `server-webApp` → `server-data` → MongoDB and shows connectivity on the frontend.

**Depends on.** Local Node, MongoDB, and environment configuration. No earlier product phase.

**Deliverable.** The stack starts, both APIs document the diagnostic, and the frontend shows the connectivity result.

**Done when.** A successful check displays service and database status from the full path. A down database or unreachable data API is visible as a failed check.

**Out of phase.** User accounts, entity CRUD, and OpenAI.

<a id="phase-2"></a>

### Phase 2 — Authentication and data infrastructure

**Objective.** A person can register, log in, and read their own persisted account through the protected client and both APIs.

**Scope.** Registration, login, and password hashing (F01, S01). JWT issuance and auth middleware on `server-webApp`, with protected user-facing routes. Login and registration sit outside the shell; success enters a minimal Dashboard shell and header nav. Persist the user through `server-data`. Validate inputs and use one error shape. Enforce ownership with a reusable data-access pattern, proven on the user record. Pass verified user identity with the internal API key, as in §3. The Phase 2 tickets name that propagation mechanism before content entities copy it.

**Depends on.** Phase 1 processes, internal client, errors, and OpenAPI.

**Deliverable.** From the frontend, a user can register, log in, open the protected shell, and see their own account.

**Done when.** Authenticated "get my user" succeeds through both APIs. A missing or invalid user context is rejected by `server-data`. Another user's record is not returned. Swagger matches the auth and user routes that exist.

**Out of phase.** Subjects, topics, documents, quizzes, and AI settings. Do not add those collections ahead of their phases.

<a id="phase-3"></a>

### Phase 3 — User profile and AI configuration

**Objective.** The user can manage profile and AI access, and the backend can run a controlled OpenAI call with the resolved key while recording usage.

**Scope.** Profile read and update (F02, S08). Application-provided or user-provided OpenAI access. Encrypt a user key at rest; allow replace and remove; never return or log the secret. The ticket that adds encryption states the method. Resolve the key per request inside `server-webApp`. Add one OpenAI client boundary, adapting CareerContext's structured call, timeouts, and typed errors. A per-user key must not reuse a cache built for a single environment secret. Record each operation with model, token counts, and estimated cost. Apply a basic per-user limit on the application key. Settings can run a connectivity check and show a simple usage summary.

**Depends on.** Phase 2 identity, ownership, and user persistence.

**Deliverable.** Settings store AI configuration safely, and a controlled OpenAI call uses the selected key and writes a usage record.

**Done when.** The user can edit profile fields, add, replace, and remove a key, see that a key is set without seeing it, run the check, and see usage. Application-key use past the basic limit is refused. With AI disabled or the provider failing, ordinary account access still works.

**Out of phase.** Content-informed prompts, quiz generation, evaluation, billing, and extra providers.

<a id="phase-4"></a>

### Phase 4 — Content management

**Objective.** The user can build the study hierarchy later AI will read. Content management stands on its own, without AI.

**Scope.** Subject create, read, update, and delete. Topics as one recursive parent-child tree inside a subject (F03, S03). Markdown notes and descriptions on subjects and topics. Documents on a subject or topic: upload, extract, review, edit, and delete. MVP file types are Markdown/text and PDFs that already contain extractable text. Persist the extracted text the user has reviewed, plus light file metadata. Ownership on every content record, using the Phase 2 pattern. Content Workspace for the tree, notes, and documents. Dashboard lists the user's subjects and can start one. Both APIs expose the content operations the client uses.

**Depends on.** Phase 2. Phase 3 is already in place so encryption work is finished before content tickets, and Phase 5 can follow immediately. Content features themselves do not call OpenAI.

**Deliverable.** A signed-in user can create a subject, nest topics, write notes, upload a text file or extractable PDF, review and edit the extracted text, and delete content they own.

**Done when.** That path works in the frontend. A second user cannot read or change the first user's subjects, topics, or documents. Unsupported or non-extractable files return a clear error. Swagger matches the implemented content routes.

**Out of phase.** Embeddings, RAG, OCR, office formats beyond text and extractable PDF, AI descriptions, and quizzes.

<a id="phase-5"></a>

### Phase 5 — Initial AI integration

**Objective.** Selected learning content can inform an AI suggestion that the user reviews and explicitly saves.

**Scope.** Drive calls through the Phase 3 boundary: versioned prompt, structured output, server-side validation, typed errors, and an execution log linked to usage. Resolve only the caller's subject or topic, with optional descendants and their documents. Assemble the bounded, source-labelled package from §3, including truncation and insufficient-content results. Generate a suggested subject or topic description (F04 on S03). The user reviews, edits, and saves it through the normal content update. Nothing is written until they accept. Carry a context-mode input on the assembly path so Phase 6 can pass Targeted, and later Strict or Loose, without a second resolver.

**Depends on.** Phase 3 key resolution and usage records, and Phase 4 content plus ownership.

**Deliverable.** From a subject or topic that has notes or documents, the user requests a description, sees the suggestion and any context warning, edits it, and saves it.

**Done when.** The suggestion uses that user's content only. Empty or oversized selections return an explicit error or a partial-inclusion notice. Invalid model output is rejected and not stored. The run is logged without the raw key or a full secret-bearing prompt. A failed call leaves existing notes unchanged.

**Out of phase.** Quiz generation, answer marking, chat, and embeddings.

<a id="phase-6"></a>

### Phase 6 — Quizzing MVP

**Objective.** Close active recall: generate, save, complete, evaluate, review, repeat, and export.

**Scope.** When this phase is planned, split it into slices in this order:

1. **Generate and save** (F05, S05). Choose subject or topic, descendant inclusion, question count, multiple-choice and short-answer mix, difficulty, and context mode (default Targeted). Resolve context with the Phase 5 assembler. Validate the structured questions and store the quiz with its settings and source snapshot or provenance. Show the saved quiz.
2. **Play and submit** (F06, S06). Start an attempt, collect answers, and submit. The player payload has no answer key or marking criteria.
3. **Evaluate and review** (F07, S07). Mark multiple choice by comparison with the stored correct option. Evaluate short answers with AI against the stored criteria, relevant source context, and the quiz's context mode. Store feedback on the attempt: question result, explanation, missing concepts, and source references where available, plus an overall result.
4. **Library, repeat, and export** (F08, F09, S04). List quizzes with scope and mode. Delete a quiz, open past attempts, start another attempt on the same quiz, and download a basic portable export. Dashboard then shows recent quizzes and attempts (S02).

**Depends on.** Phase 5 context assembly and the AI boundary. Phase 3 usage limits still apply to generation and short-answer marking. Phase 4 content is the source material.

**Deliverable.** A user generates a Targeted quiz from their material, completes both question types, reads contextual feedback, reviews the attempt, repeats the same quiz, and exports it.

**Done when.** Editing the source notes does not change the saved quiz or earlier attempts. A second attempt does not overwrite the first. The player response contains no marking criteria. Insufficient context blocks generation with a clear message. Swagger documents the quiz, attempt, and evaluation routes that exist.

**Out of phase.** Chat, voice, spaced repetition, advanced analytics, adaptive sequencing, and shared libraries. Very Strict and Loose can wait until Targeted generation and evaluation are solid; the stored mode must already allow them.

## 5. Flow assignment

| Flow | Phase | Outcome |
| --- | --- | --- |
| F01 Registration and authentication | 2 | S01 → protected shell |
| F02 Profile and AI configuration | 3 | S08 |
| F03 Learning content | 4 | S02 subjects, S03 workspace |
| F04 AI-assisted description | 5 | Review and save on S03 |
| F05–F09 Quiz, attempt, evaluation, repeat, export | 6 | S04–S07, dashboard activity |

## 6. Sequencing and risks

Keep the six phases in order. The main risks sit on the boundaries, not on extra features.

- **Identity propagation** is easy to get wrong by trusting a client-supplied user id. Settle the mechanism in the Phase 2 ticket that first calls `server-data` for a user-owned record, and reuse it unchanged.
- **Key handling** has no CareerContext encrypt-at-rest pattern to copy, and its client cache assumes one environment key. Phase 3 specifies encryption, per-request key selection, and what a usage record may store.
- **Provenance** must be frozen at generation time. A quiz that only points at live notes will change when the user edits content, which breaks historical review and later evaluation.
- **Phase 6 width.** Generation, the player, evaluation, and the library are separate demonstrable slices. Planning them together in one ticket will hide the answer-key and provenance rules.
- **Context budget.** Oversized material must be reported. Silently trimming sources makes Targeted feedback look more grounded than it is.
- **PDF text.** Only extractable text is in scope. The Phase 4 review step is what keeps bad extraction out of later AI context.

Phase 4 stays after Phase 3 even though content does not need a model key. That keeps encryption and content CRUD in separate tickets and lets Phase 5 start as soon as content exists.

## 7. How tickets are produced

Tickets for phase N live in `docs/devTickets/phaseN/` next to that phase's README. IDs are `PN-01`, `PN-02`, using `_TICKET_TEMPLATE.md`. One ticket is one shippable slice.

`/plan-phase` reads this plan's section for that phase, writes a small ticket set, and updates `devTickets_next.md`. It does not implement. Implementation then takes one approved ticket, updates OpenAPI for routes that ticket adds, and checks the slice. Agents do not create Git commits unless the user asks.

If a ticket, this plan, and core-scope disagree, stop and name the conflict. This plan orders the work. Core-scope remains the product description.
