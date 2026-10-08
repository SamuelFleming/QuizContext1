# QuizContext.io — Project Ideation Charter

**Project:** QuizContext.io
**Status:** Ideation / Rapid MVP Development
**Date:** 8 October 2026
**Technology:** MERN Stack (MongoDB, Express, React/Vite, Node.js) + OpenAI API

## 1. Project Vision

QuizContext.io is an AI-empowered study platform that transforms user-managed learning content into targeted quizzes, assessments, and personalised feedback.

The platform addresses the difficulty of studying and revising large volumes of material, particularly where generic AI-generated questions do not adequately reflect the specific content being studied.

Its defining principle is **context-informed AI**: users establish a structured knowledge base that informs and constrains AI-generated learning outcomes.

## 2. Core Product Concept

Users organise their study material into a hierarchical content management system:

**Subject → Topic → Nested Topics → Documents**

Subjects and topics can contain Markdown content, descriptions, and supporting documents. Topics support recursive nesting.

Users can generate quizzes against an entire subject or individual topics, optionally including descendant topics and their supporting material.

QuizContext manages three primary learning outcomes:

1. **Quiz Generation:** AI generates reusable quizzes containing multiple-choice and short-answer questions based on selected source content.
2. **Quiz Completion:** Users complete saved quizzes through an interactive web interface, with attempts persisted independently.
3. **Answer Evaluation:** Multiple-choice answers receive deterministic marking, while written responses receive AI-assisted evaluation, including scores, explanations, missing concepts, and relevant source references where available.

Generated quizzes retain their originating content scope, generation configuration, and sufficient source context to support later review.

## 3. Context-Bounded AI Philosophy

QuizContext differentiates itself through configurable control over how AI interprets user-provided material.

| Mode                   | Intended Behaviour                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Very Strict**        | Questions and evaluations must be directly supported by the supplied material.                                |
| **Targeted (Default)** | Questions remain grounded in source material while allowing conceptual reasoning, application, and synthesis. |
| **Loose**              | Source material establishes the learning topic, while relevant external knowledge may supplement the outcome. |

The MVP prioritises **Targeted mode**, while preserving the architectural ability to support all three.

AI operations will use structured inputs and outputs, with explicit source-content resolution and configurable generation instructions.

## 4. Technical Direction

The application uses a backend-oriented, dual-API MERN architecture:

```text
client-webApp (React/Vite)
          |
          v
server-webApp (Express)
  Routes → Controllers → Services / API Clients
          |
          v
server-data (Express)
  Routes → Controllers → Repositories
          |
          v
       MongoDB
```

**Architectural constraints:**

* `server-webApp` owns business logic, AI orchestration, quiz generation, and evaluation.
* `server-data` remains a lightweight persistence API, responsible for data access, validation, and ownership enforcement.
* Both APIs expose Swagger/OpenAPI documentation and run as separate local Node processes during MVP development.
* JWT authentication protects user-facing APIs; an environment-managed internal API key secures communication between backend services.
* Core quiz and content functionality must be exposed through reusable APIs, independent of the React interface.

The architecture deliberately explores business/data-access separation while remaining portable and suitable for future client applications.

## 5. AI Integration & User Configuration

QuizContext will adapt proven OpenAI integration patterns from CareerContext.io.

AI integration will distinguish between provider configuration, request execution, and usage tracking.

Users may supply their own OpenAI API key or use an application-provided key, subject to basic usage restrictions.

User-provided keys must be encrypted at rest, excluded from API responses and logs, and handled exclusively through the backend.

AI usage records will capture operations, model information, token consumption, and estimated cost.

## 6. MVP Scope & Boundaries

**In scope:**

* User authentication and profile management.
* Subject, recursive topic, and document management.
* Markdown editing and text-based document ingestion, including extractable PDF content.
* AI-assisted content descriptions.
* Context-informed quiz generation and persistence.
* Multiple-choice and short-answer quiz completion.
* Quiz attempt persistence and answer evaluation.
* Basic quiz export and review.
* Minimalist, dark-themed, responsive web interface.

**Deferred:** AI chatbot, voice interaction, embeddings/RAG, OCR, spaced repetition, advanced analytics, collaborative learning, payment systems, and native mobile applications.

## 7. Relationship to Existing Projects

**CareerContext.io:** Provides architectural inspiration, reusable MERN patterns, content-management concepts, and existing OpenAI integration mechanisms. QuizContext is an independent application, not a CareerContext module.

**Recall Radio:** A prospective mobile, audio-first learning interface that could consume QuizContext's content, quiz, and evaluation APIs. QuizContext should preserve compatibility with this future use case without implementing voice functionality during the MVP.

## 8. Rapid Development Principles

QuizContext is intentionally a rapid, AI-assisted implementation using Cursor.

Development will follow these principles:

* **Reuse before reinventing:** Adapt relevant CareerContext patterns rather than redesigning established solutions.
* **Backend-first:** Prioritise functional APIs, persistence, and AI workflows over frontend sophistication.
* **Minimal agent overhead:** Maintain concise project documentation, Cursor rules, commands, and development tickets.
* **Phased implementation:** Establish foundations, authentication/data, user AI configuration, content management, initial AI integration, and quizzing functionality.
* **Incremental delivery:** Implement and verify small vertical slices before extending patterns across the application.
* **Pragmatic verification:** Use lightweight functional checks rather than extensive regression-test infrastructure.
* **Controlled execution:** Cursor agents implement scoped tasks and document completion; Git commits remain user-managed.

The core documentation should guide implementation without over-constraining future product evolution.

## 9. MVP Success Criteria

The MVP succeeds when a user can:

1. Register and organise their own study content.
2. Upload or write learning material against subjects and topics.
3. Generate and save a context-informed quiz.
4. Complete the quiz and receive meaningful, source-informed evaluation.
5. Review previous attempts and repeat quizzes.

**Guiding objective:** Deliver a functional, reusable learning and assessment platform that demonstrates the value of structured user knowledge combined with context-bounded AI.
