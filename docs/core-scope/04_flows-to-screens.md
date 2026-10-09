# QuizContext.io — Flows to Screens

**Document:** `04_Flows-to-Screens.md`
**Status:** Initial Scope
**Project:** QuizContext.io

## 1. Purpose

This document maps QuizContext.io's core application flows to the screens and backend operations required to support them.

It establishes the initial frontend structure and navigation requirements without prescribing detailed component implementations, visual layouts, or final API contracts.

The application should prioritise an intuitive study workflow, minimal navigation overhead, and clear separation between managing learning content, generating quizzes, completing assessments, and reviewing results.

## 2. Screen Catalogue

| ID      | Screen                   | Primary Responsibility                                             |
| ------- | ------------------------ | ------------------------------------------------------------------ |
| **S01** | Authentication           | Registration and login.                                            |
| **S02** | Dashboard                | Entry point, subject overview, recent quizzes, and study activity. |
| **S03** | Content Workspace        | Subject/topic navigation, Markdown notes, and document management. |
| **S04** | Quiz Library             | Browse, retrieve, and manage generated quizzes.                    |
| **S05** | Quiz Detail & Generation | Configure new quizzes and inspect saved quiz content.              |
| **S06** | Quiz Player              | Complete an interactive quiz attempt.                              |
| **S07** | Quiz Results             | Review submitted answers, marking, and feedback.                   |
| **S08** | Profile & Settings       | Account details, OpenAI configuration, and usage information.      |

These represent logical screens rather than mandatory individual React components. Related views may share layouts, panels, or routes.

## 3. Navigation & Application Shell

QuizContext uses a minimalist, responsive, dark-themed interface with a persistent header navigation bar.

### Primary Navigation

```text
QuizContext.io
    |
    ├── Dashboard
    ├── Subjects
    ├── Quizzes
    └── Profile / Settings
```

**Navigation behaviour:**

* Authentication screens appear outside the authenticated application shell.
* The header provides access to primary application areas.
* Dashboard cards link directly to relevant subjects, quizzes, or recent results.
* Subject and topic navigation occurs within the Content Workspace.
* Quiz generation can be initiated from the Content Workspace or Quiz Library.
* Quiz completion and results use focused layouts to minimise distractions.

The frontend should avoid unnecessary nested navigation and excessive modal interactions.

## 4. Screen Responsibilities

### S01 — Authentication

Supports account registration, login, and access to protected application functionality.

**Primary functions:**

* Register an account.
* Log in.
* Display authentication and validation errors.
* Redirect authenticated users into the application.

### S02 — Dashboard

Provides a concise overview of the user's learning content and recent study activity.

**Primary functions:**

* Display existing subjects.
* Display recently generated quizzes.
* Display recent quiz attempts or results.
* Provide quick actions to create a subject or generate a quiz.
* Provide navigation into ongoing study activities.

The MVP does not require sophisticated analytics or progress visualisations.

### S03 — Content Workspace

The central interface for organising and maintaining user-managed learning content.

**Primary functions:**

* Create, edit, and delete subjects.
* Create, edit, nest, and delete topics.
* Navigate recursive topic hierarchies.
* Edit subject/topic Markdown content.
* Upload, inspect, edit, and delete supporting documents.
* Review extracted document text before saving.
* Request and review AI-assisted descriptions.
* Initiate quiz generation against a selected subject or topic.

The workspace should make the currently selected subject/topic and its associated learning material clear.

### S04 — Quiz Library

Provides access to previously generated quizzes.

**Primary functions:**

* Display saved quizzes.
* Identify each quiz's subject/topic and generation context.
* Open, repeat, export, or delete a quiz.
* Navigate to associated results and attempts.
* Initiate new quiz generation.

Basic filtering or sorting may be introduced where useful, but advanced discovery is outside MVP scope.

### S05 — Quiz Detail & Generation

Supports both configuring a new quiz and inspecting an existing quiz.

**Generation functions:**

* Select the originating subject/topic.
* Configure question count, question types, and difficulty.
* Select a context mode, defaulting to Targeted.
* Choose whether descendant topics are included.
* Request quiz generation.
* Display generation status and errors.

**Saved quiz functions:**

* Display generated questions and associated metadata.
* Show generation scope and context mode.
* Start a new attempt.
* View previous attempts.
* Export the quiz.

The generation form may be presented as a dedicated view or a focused panel, depending on the final UX implementation.

### S06 — Quiz Player

Provides a distraction-minimised interface for completing a saved quiz.

**Primary functions:**

* Start a new quiz attempt.
* Present multiple-choice and short-answer questions.
* Capture and preserve responses during the attempt.
* Display question navigation and completion progress.
* Submit responses for evaluation.
* Display submission or evaluation status.

Correct answers and marking criteria must not be exposed before submission.

The user should receive a warning before leaving an incomplete attempt.

### S07 — Quiz Results

Displays the outcomes of a completed quiz attempt.

**Primary functions:**

* Display overall result and question-level scores.
* Show submitted answers alongside expected answers.
* Present evaluation explanations and missing concepts.
* Display supporting source references where available.
* Allow navigation back to the associated quiz.
* Offer the option to repeat the quiz.

Evaluation results should be presented as AI-assisted learning feedback, not authoritative academic grading.

### S08 — Profile & Settings

Allows users to manage their account and AI configuration.

**Primary functions:**

* View and update basic profile information.
* Select application-provided or user-provided OpenAI API access.
* Securely add, replace, or remove a user-provided API key.
* Display basic AI usage information.
* Log out.

Sensitive API credentials must never be returned to the frontend after storage.

## 5. Application Flow → Screen Mapping

The following flows are defined in `02_High-Level-Solution.md`.

| Flow    | Description                      | Screens Involved    |
| ------- | -------------------------------- | ------------------- |
| **F01** | Registration & Authentication    | S01 → S02           |
| **F02** | Profile & AI Configuration       | S08                 |
| **F03** | Create & Manage Learning Content | S02 → S03           |
| **F04** | AI-Assisted Content Description  | S03                 |
| **F05** | Generate & Save Quiz             | S03/S04 → S05       |
| **F06** | Complete & Submit Quiz           | S05 → S06           |
| **F07** | Evaluate Quiz Attempt            | S06 → S07           |
| **F08** | Review & Repeat                  | S04 → S05/S07 → S06 |
| **F09** | Export Quiz                      | S05                 |

Multiple flows may share the same screen. The implementation should favour reuse over introducing unnecessary views.

## 6. Screen → Endpoint Matrix

The following identifies **logical user-facing API operations**, not final REST paths or request/response contracts.

All operations are expected to be exposed through `server-webApp`, which coordinates persistence through `server-data`.

| Screen                             | Data Loading Operations                                                        | Mutation / Action Operations                                      |
| ---------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| **S01 — Authentication**           | Current session/user                                                           | Register, login                                                   |
| **S02 — Dashboard**                | Subject summaries, recent quizzes, recent attempts                             | Create subject                                                    |
| **S03 — Content Workspace**        | Subjects, topic tree, selected content, documents                              | Subject/topic CRUD, document upload/update/delete, AI description |
| **S04 — Quiz Library**             | Saved quiz list, quiz metadata                                                 | Delete quiz, initiate generation                                  |
| **S05 — Quiz Detail & Generation** | Subject/topic options, selected content summary, saved quiz, attempt summaries | Generate quiz, export quiz, start attempt                         |
| **S06 — Quiz Player**              | Quiz questions, active attempt                                                 | Create/save/submit attempt                                        |
| **S07 — Quiz Results**             | Attempt, submitted answers, evaluation results, source references              | Repeat quiz                                                       |
| **S08 — Profile & Settings**       | User profile, AI configuration status, usage records                           | Update profile, configure/remove API key, logout                  |

### API Responsibility Boundaries

**`server-webApp`:**

* Exposes user-facing operations.
* Handles JWT authentication and application workflows.
* Coordinates data retrieval and mutations.
* Owns AI generation, evaluation, and usage orchestration.
* Communicates with `server-data` through an internal API client.

**`server-data`:**

* Exposes persistence-oriented operations to the business API.
* Enforces ownership and relevant data validation.
* Manages MongoDB access through repositories.
* Does not contain AI prompts, quiz-generation logic, or assessment workflows.

Both services maintain Swagger/OpenAPI documentation for their implemented endpoints.

## 7. Key UX Principles

### 7.1 Content-First Navigation

The content hierarchy should be easy to browse without repeatedly navigating between unrelated pages.

Users should understand which subject or topic is selected and what source material is associated with it.

### 7.2 Minimalist Study Experience

Quiz completion should minimise distractions and prioritise readable questions, clear answer inputs, and visible progress.

The interface should work on desktop and smaller screens.

### 7.3 Clear AI Interaction States

AI operations may take longer than ordinary CRUD requests.

The interface should communicate:

* Generation or evaluation in progress.
* Successful completion.
* Validation or provider errors.
* Missing or insufficient source content.
* Context limitations where selected material exceeds supported capacity.

### 7.4 Transparent Source Relationships

Where available, quizzes and evaluations should expose their relationship to originating study content.

Users should be able to understand what material informed a generated question or evaluation without requiring access to raw AI prompts.

### 7.5 Reusable, Practical Components

The frontend may adapt established CareerContext concepts, particularly Markdown editing, document review, authenticated layouts, and API service conventions.

However, QuizContext should retain its own visual identity and avoid importing unnecessary CareerContext-specific components.

## 8. MVP Screen Completion Criteria

The frontend scope is complete when a user can navigate through the full learning workflow:

1. Register or log in.
2. Create a subject and organise nested topics.
3. Add Markdown notes and supporting documents.
4. Configure and generate a quiz from selected material.
5. Complete and submit the quiz.
6. Review contextual feedback and previous attempts.
7. Repeat or export a saved quiz.
8. Manage their profile and AI configuration.

The interface should support these operations without requiring users to interact directly with backend APIs.

**Guiding UX objective:** Make the transition from organised learning content to active recall as simple and direct as possible.
