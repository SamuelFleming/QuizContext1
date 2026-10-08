# QuizContext.io — Product Theory

**Document:** `03_Product-Theory.md`
**Status:** Initial Scope
**Project:** QuizContext.io

## 1. Central Product Principle

QuizContext.io is built around the principle that **AI-generated learning outcomes should be informed and constrained by a user-managed body of knowledge**.

Rather than treating AI as an unrestricted source of questions and answers, QuizContext enables users to define the material they intend to study.

This material establishes the context against which quizzes are generated, answers are evaluated, and learning feedback is provided.

The intended outcome is not simply more AI-generated questions, but **more relevant assessments that reflect the user's chosen learning material**.

## 2. The Value of User-Managed Context

Generic AI quiz generation can rely substantially on a model's existing knowledge of a subject.

While this may produce factually reasonable questions, those questions may not correspond to the terminology, emphasis, scope, or depth of the material a learner is studying.

QuizContext addresses this through a structured content management system:

**Subject → Topic → Nested Topics → Documents**

Users can maintain Markdown notes, descriptions, and supporting documents at appropriate levels of this hierarchy.

This structure provides three benefits:

* **Scope control:** Users determine which subjects, topics, and supporting material contribute to a quiz.
* **Contextual specificity:** AI can generate questions based on the concepts, terminology, and explanations contained in the selected material.
* **Traceability:** Generated questions and evaluations can retain references to the material that informed them.

The content hierarchy is therefore more than an organisational feature. It is a fundamental part of how QuizContext produces context-informed AI outcomes.

## 3. Context-Bounded AI

QuizContext introduces three context modes that determine how closely AI operations should adhere to supplied learning material.

| Mode            | Source Relationship                                                                 | Intended Outcome                                     |
| --------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Very Strict** | Directly supported by supplied content                                              | Source-specific factual and conceptual recall        |
| **Targeted**    | Grounded in supplied content with reasonable interpretation                         | Conceptual understanding, application, and synthesis |
| **Loose**       | Supplied content establishes the topic but does not exclusively constrain knowledge | Broader exploration and supplementary learning       |

### 3.1 Very Strict

The AI should generate questions and marking criteria that can be directly supported by the selected source material.

This mode is most suitable when the learner wants assessments closely aligned with supplied notes, readings, or examinable content.

The AI should avoid introducing unsupported facts or concepts, even when they are generally relevant to the subject.

### 3.2 Targeted — Default

The AI should remain grounded in the selected content while being permitted to interpret, combine, and apply the concepts it contains.

For example, supplied material describing convolutional neural networks could support questions requiring a learner to explain relationships between local receptive fields, weight sharing, and parameter efficiency.

The question need not reproduce a sentence from the source, provided its expected answer remains reasonably supported by the material.

**Targeted is the primary MVP mode**, balancing contextual alignment with useful conceptual assessment.

### 3.3 Loose

The AI may use the supplied material as a starting point and supplement it with relevant knowledge beyond the source.

This mode is intended for broader exploration rather than strictly source-specific examination preparation.

Where practical, the system should distinguish source-derived information from supplementary material so users understand the basis of generated questions and feedback.

### 3.4 Modes as Product Behaviour

Context modes should influence both:

* **Quiz generation:** Which concepts may be assessed and how questions are constructed.
* **Answer evaluation:** Which knowledge and criteria may be used when judging responses.

The selected mode must be explicit in the AI request and persisted with the generated quiz.

Modes are behavioural constraints, not guarantees that AI output will be perfectly grounded or factually accurate.

## 4. Content Resolution & Context Assembly

Before an AI operation, QuizContext must resolve the learning material associated with the user's selected scope.

A request may target:

* An entire subject.
* An individual topic.
* A topic and its descendant topics.

The backend collects relevant notes, descriptions, and extracted document content, then constructs a bounded context package for the AI operation.

The assembly process should:

1. Include only content the authenticated user is authorised to access.
2. Preserve source identification, such as subject, topic, and document references.
3. Respect configured input-size or token budgets.
4. Treat uploaded material as untrusted source data, not executable instructions.
5. Communicate when selected material cannot be fully included.

The MVP may use straightforward hierarchical traversal and bounded text assembly.

Embeddings, semantic search, vector databases, and retrieval-augmented generation are not required initially.

**A larger context package is not inherently a better one.** Relevant, identifiable material is more valuable than indiscriminately including all available content.

## 5. From Source Content to Quiz Questions

Quiz generation should transform selected learning material into a structured assessment artefact.

A generated question should ideally retain a relationship with:

* Its originating subject or topic.
* The concepts it assesses.
* Its expected answer or marking criteria.
* Supporting source references, where available.

For multiple-choice questions, generated answer options should be distinguishable and support a defensible correct answer.

For short-answer questions, the expected answer should describe the knowledge necessary to demonstrate understanding rather than require exact wording.

A question may be phrased differently from the source material without losing contextual alignment.

The objective is to test understanding of the source, not merely recognition of its wording.

## 6. From Quiz Answers to Meaningful Evaluation

QuizContext's evaluation process should distinguish between determining correctness and explaining understanding.

### Multiple-Choice Evaluation

Multiple-choice answers can be marked deterministically against the saved correct answer.

AI is not required to determine whether the selected option matches the expected answer.

### Short-Answer Evaluation

AI-assisted marking should consider:

* The question and its intended learning objective.
* The expected answer or marking criteria.
* The learner's submitted response.
* Relevant source context and the quiz's context mode.

Evaluation should recognise conceptually correct explanations even when their wording differs from the expected answer.

Feedback should identify demonstrated understanding, missing concepts, and material misunderstandings.

**The aim is educational feedback, not simply assigning a numerical score.**

AI-generated evaluations are fallible and should be presented as learning assistance rather than authoritative academic grading.

## 7. Persistence, Provenance & Repeatability

Generated quizzes are reusable learning artefacts, independent of subsequent changes to the original study material.

QuizContext should preserve:

* The selected generation scope.
* The context mode and generation settings.
* Generated questions and expected answers.
* Source references and sufficient provenance or source snapshots for later review.

Quiz attempts are recorded independently of quizzes, allowing repeated completion and comparison of results.

Completed evaluations should remain associated with the particular attempt and question they assessed.

This separation supports a continuous learning cycle without modifying historical results whenever the user's content changes.

## 8. AI Architecture Principles

QuizContext's implementation should preserve a clear boundary between ordinary application operations and AI-assisted outcomes.

* AI requests are executed through a centralised backend service.
* Prompt configurations and structured-output contracts are versioned.
* AI responses undergo server-side validation before persistence.
* AI operations record execution status and relevant usage information.
* Source material is bounded, labelled, and separated from instructions.
* AI failures should not compromise ordinary content-management operations.
* User-provided API credentials must remain protected.

CareerContext.io provides useful examples of these mechanisms, but QuizContext's AI workflows and context modes remain specific to its own product requirements.

## 9. MVP Product-Theory Boundaries

The MVP should demonstrate the value of structured context without attempting to solve every problem associated with AI-assisted learning.

It does not require:

* Perfect guarantees against hallucination.
* Automated verification of every generated claim.
* Semantic retrieval or embeddings.
* Advanced knowledge graphs or concept extraction.
* Adaptive learning algorithms.
* Sophisticated assessment analytics.

Instead, the initial implementation should prioritise **relevant source selection, bounded context assembly, structured question generation, meaningful evaluation, and traceable results**.

These capabilities establish the foundation for future improvements without requiring an elaborate AI architecture from the outset.

## 10. Guiding Product Hypothesis

The central hypothesis behind QuizContext.io is:

> Providing users with control over their learning context, combined with configurable AI grounding and source-informed evaluation, can produce a more relevant and useful active-recall experience than unrestricted topic-based AI quiz generation.

The MVP is intended to explore this hypothesis through practical use rather than assume it has already been demonstrated.

**Success means that generated questions and feedback meaningfully reflect the material the learner selected, while helping them identify what they understand and what requires further revision.**
