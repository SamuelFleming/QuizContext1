# QuizContext.io — High-Level Solution

**Document:** `02_High-Level-Solution.md`
**Status:** Initial Scope
**Project:** QuizContext.io

## 1. Solution Overview

QuizContext.io is a web-based learning platform that combines user-managed study content with AI-assisted quiz generation, completion, and evaluation.

Users maintain a structured collection of learning material, select a subject or topic to study, and generate reusable quizzes informed by the corresponding content.

The application supports a complete learning cycle:

**Manage Content → Generate Quiz → Complete Quiz → Evaluate Answers → Review & Repeat**

The MVP prioritises functional learning workflows, contextual accuracy, and reusable backend capabilities over advanced study features or frontend complexity.

## 2. MVP Functional Scope

### 2.1 Accounts & User Configuration

* User registration, login, and authenticated application access.
* Basic user profile management.
* User-level OpenAI API configuration, supporting encrypted user-provided keys or an application-provided key.
* Basic AI usage tracking, including request activity, token consumption, and estimated cost.
* Application-provided AI usage restrictions.

### 2.2 Learning Content Management

Users organise their learning material through:

**Subject → Topic → Nested Topics → Documents**

* Create, view, edit, and delete subjects and topics.
* Nest topics recursively using a parent-child relationship.
* Maintain Markdown descriptions or notes against subjects and topics.
* Upload text-based documents and PDFs containing extractable text.
* Review and edit extracted document content before using it as learning context.
* Associate documents with subjects or topics.
* Generate AI-assisted descriptions from existing user content.

The content management system establishes the user's source material for subsequent AI operations.

### 2.3 Quiz Generation & Management

Users can generate quizzes against a selected subject or topic.

Quiz configuration includes:

* Learning scope: subject or topic, optionally including descendant topics.
* Number of questions.
* Question types: multiple choice and short answer.
* Context mode: Very Strict, Targeted, or Loose.
* Difficulty level.

**Targeted** is the primary MVP context mode; the other modes remain supported by the design and may be introduced incrementally.

Quiz generation resolves relevant learning content, constructs a bounded context package, and submits a structured generation request to the AI service.

Generated quizzes are persisted independently of their originating content and may be retrieved, reviewed, exported, or completed multiple times.

### 2.4 Quiz Completion & Evaluation

Users complete saved quizzes through an interactive assessment interface.

* Multiple-choice questions provide selectable answers.
* Short-answer questions provide free-text input.
* Users submit completed attempts for evaluation.
* Multiple-choice responses are marked deterministically.
* Short-answer responses are evaluated using AI against expected answers and relevant source context.

Evaluation results should include:

* Question-level result or score.
* Explanation of the evaluation.
* Missing or misunderstood concepts, where applicable.
* Relevant source references, where available.
* Overall quiz result.

Quiz attempts and their evaluations are persisted separately from the original quiz, allowing repeated completion and later review.

### 2.5 Quiz History & Export

* View previously generated quizzes.
* Reopen and repeat saved quizzes.
* Review completed attempts and evaluation feedback.
* Export generated quiz content in a basic portable format.

Advanced analytics, automated revision scheduling, and spaced repetition are outside MVP scope.

## 3. Core System Concepts

| Concept            | Responsibility                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **User**           | Owns study content, quizzes, attempts, and AI configuration.                                     |
| **Subject**        | Top-level container for a collection of learning material.                                       |
| **Topic**          | Recursively nestable learning unit belonging to a subject.                                       |
| **Document**       | User-supplied source material associated with a subject or topic.                                |
| **Quiz**           | Persisted collection of generated questions and generation configuration.                        |
| **Question**       | Individual assessment item containing its type, prompt, and expected answer or marking criteria. |
| **Quiz Attempt**   | One user's responses to a particular quiz.                                                       |
| **Evaluation**     | Marking outcome and feedback associated with an attempt or question.                             |
| **AI Run / Usage** | Record of AI operations, execution outcomes, and usage information.                              |

These are conceptual entities rather than prescribed database collections.

Questions and evaluations may be embedded within their corresponding quiz or attempt records where appropriate.

### 3.1 Content Resolution

Quiz generation begins with a selected learning scope.

The backend resolves relevant subject/topic notes and supporting documents, optionally including descendant topics.

Resolved material is assembled within a configurable context budget, preserving enough source identification to support references and subsequent evaluations.

When source material exceeds the supported context budget, the application must communicate the limitation rather than silently omit material.

### 3.2 Context-Bounded AI

AI generation and evaluation operate according to an explicit context mode:

* **Very Strict:** Source-supported questions and assessment criteria.
* **Targeted:** Source-grounded questions allowing reasonable conceptual interpretation and application.
* **Loose:** Broader topic-based generation permitting relevant external knowledge.

The selected mode forms part of the saved quiz configuration.

Source references should be retained where possible. References assist review but do not independently guarantee factual accuracy.

### 3.3 Quiz Persistence

A generated quiz is a reusable assessment artefact rather than a temporary AI response.

Each quiz retains:

* Its originating subject/topic scope.
* Generation options and context mode.
* Generated questions and expected answers.
* Sufficient source context or provenance to support later review and evaluation.

Individual attempts preserve submitted responses and their corresponding evaluation outcomes.

Subsequent source-content changes must not silently alter previously generated quizzes or completed attempts.

## 4. Core Application Flows

The following identifiers will be reused in `04_Flows-to-Screens.md`.

### F01 — Registration & Authentication

1. User registers or logs in.
2. The application authenticates the user and establishes a session.
3. User enters the authenticated application.
4. Protected content and operations remain accessible only to the owning user.

### F02 — Profile & AI Configuration

1. User opens account settings.
2. User updates basic profile information.
3. User selects application-provided AI access or provides their own OpenAI API key.
4. The application securely saves the configuration.
5. User can review basic AI usage information.

### F03 — Create & Manage Learning Content

1. User creates or selects a subject.
2. User creates topics and optionally nests them within existing topics.
3. User adds or edits Markdown notes and descriptions.
4. User uploads and reviews supporting documents.
5. The application persists the organised learning material.

### F04 — AI-Assisted Content Description

1. User selects an existing subject or topic.
2. User requests an AI-assisted description.
3. The backend assembles relevant user-owned content.
4. AI produces a suggested description.
5. User reviews, edits, and explicitly saves the suggestion.

### F05 — Generate & Save Quiz

1. User selects a subject or topic to study.
2. User configures question count, types, difficulty, context mode, and descendant inclusion.
3. The backend resolves the relevant learning content.
4. The AI service generates structured questions and expected answers.
5. The system validates and saves the generated quiz.
6. User reviews the quiz and may begin studying or export it.

### F06 — Complete & Submit Quiz

1. User opens a saved quiz.
2. User starts a new attempt.
3. The application presents questions and collects responses.
4. User submits the completed attempt.
5. Responses are persisted for evaluation.

### F07 — Evaluate Quiz Attempt

1. The backend retrieves the submitted attempt and its quiz.
2. Multiple-choice answers are marked deterministically.
3. Short-answer responses are evaluated through the AI service.
4. Results and feedback are associated with the attempt.
5. The completed evaluation becomes available to the user.

### F08 — Review & Repeat

1. User opens their saved quiz collection.
2. User selects a quiz and views previous attempts.
3. User reviews question-level feedback and overall results.
4. User may start another attempt against the same saved quiz.

### F09 — Export Quiz

1. User opens a saved quiz.
2. User selects the export action.
3. The application produces a portable quiz document.
4. User downloads the generated file.

## 5. High-Level Technical Architecture

QuizContext uses a dual-API MERN architecture:

```text
React / Vite Web Client
         |
         v
server-webApp (Express)
Authentication, Business Services,
AI Orchestration, API Clients
         |
         v
server-data (Express)
Persistence API, Ownership Validation,
Repositories
         |
         v
       MongoDB
```

**Architectural responsibilities:**

* `client-webApp` handles user interaction and presentation.
* `server-webApp` owns application behaviour, quiz logic, AI workflows, and user-facing APIs.
* `server-data` handles persistence and user-scoped data access without implementing AI or product workflows.
* Both APIs maintain Swagger/OpenAPI documentation.
* JWT authentication protects the user-facing API; an environment-managed internal API key authenticates backend-to-backend requests.

The two APIs run as separate local Node processes during MVP development.

QuizContext's backend interfaces should remain independent of the React client so that future applications, including Recall Radio, may consume relevant learning and assessment functionality.

## 6. Implementation Boundaries

The MVP will deliberately avoid:

* Voice interaction or Recall Radio-specific functionality.
* AI chatbot capabilities.
* Embeddings, vector databases, or retrieval-augmented generation.
* OCR and advanced document processing.
* Spaced repetition and automated learning plans.
* Advanced progress analytics.
* Collaborative learning or shared study libraries.
* Payments and subscription management.
* Multiple AI providers.

The implementation should favour straightforward, maintainable workflows, lightweight agent documentation, and incremental delivery.

## 7. MVP Completion Criteria

QuizContext's initial implementation is functionally complete when a user can:

1. Create an account and configure AI access.
2. Create a subject with nested topics, notes, and supporting documents.
3. Generate and persist a Targeted quiz using that content.
4. Complete multiple-choice and short-answer questions.
5. Receive meaningful evaluation feedback informed by the original learning material.
6. Review previous attempts, repeat a quiz, and export its questions.

The MVP should demonstrate a complete, context-informed learning workflow while establishing reusable backend infrastructure for future development.
