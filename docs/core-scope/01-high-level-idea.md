# QuizContext.io — High-Level Idea

**Document:** `01_High-Level-Idea.md`
**Status:** Initial Scope
**Project:** QuizContext.io

## 1. Background & Motivation

QuizContext.io originates from a personal need to study and revise large volumes of learning material more effectively.

University subjects and other structured learning environments frequently involve extensive lecture slides, readings, technical concepts, and supporting documents. Preparing meaningful revision questions from this material can be time-consuming, while conventional study methods can encourage passive review rather than active recall.

AI-powered study tools can reduce the effort involved in creating quizzes, but their generated questions and explanations may draw heavily on general model knowledge rather than the specific material a learner needs to understand.

QuizContext explores an alternative: allowing users to establish and maintain their own learning context, which forms the foundation of AI-generated assessments.

## 2. Problem Statement

Learners studying substantial or complex collections of material face three related challenges:

1. **Content fragmentation:** Relevant information is distributed across subjects, topics, lecture materials, personal notes, and supporting documents.
2. **Revision preparation overhead:** Converting that information into useful questions and assessments requires additional time and effort.
3. **Insufficient contextual alignment:** Generic AI-generated quizzes and answer evaluations may not accurately reflect the scope, terminology, or conceptual emphasis of the supplied learning material.

The central problem is not simply generating more questions, but generating **relevant questions and meaningful feedback from the material a learner intends to study**.

## 3. Product Vision

QuizContext.io is an AI-empowered learning platform that transforms user-managed study content into targeted quizzes, assessments, and personalised feedback.

Users establish a structured learning knowledge base, select what they want to study, and use AI to generate and evaluate quizzes informed by that material.

**Core principle: User-managed learning context should inform and constrain AI-generated learning outcomes.**

The platform should support both source-specific examination preparation and broader conceptual understanding, without assuming that every learner requires the same degree of adherence to their material.

## 4. Core Product Concepts

### 4.1 User-Managed Learning Context

Users organise learning material through a hierarchical content management system:

**Subject → Topic → Nested Topics → Documents**

Subjects and topics can contain written descriptions, Markdown notes, and supporting documents. Topics can contain further topics, allowing users to represent learning material at varying levels of detail.

This structured content provides the source context for AI operations.

### 4.2 Context-Informed Quiz Generation

Users select a subject or topic, optionally including its descendants, and request an AI-generated quiz.

QuizContext resolves the relevant source material and generates questions aligned with the selected learning scope.

Generated quizzes are saved and can be completed or revisited independently of their source content.

### 4.3 Context-Bounded AI

QuizContext introduces configurable AI context modes:

| Mode            | Concept                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| **Very Strict** | Assess only what is directly supported by the supplied learning material.                               |
| **Targeted**    | Remain grounded in the material while permitting conceptual interpretation, application, and synthesis. |
| **Loose**       | Use the material as a starting point while allowing relevant external knowledge.                        |

**Targeted** is the default and primary MVP mode.

These modes are intended to influence both question generation and the assessment of written responses.

### 4.4 Active Recall & Learning Feedback

QuizContext supports interactive quiz completion and records individual attempts.

Multiple-choice questions can receive deterministic marking, while written answers can be evaluated using AI against expected answers and relevant learning context.

Feedback should help users identify correct understanding, missing concepts, and areas requiring further revision.

The platform therefore supports a recurring learning cycle:

**Organise Content → Generate Quiz → Complete Quiz → Evaluate Understanding → Revise**

## 5. Intended Users & Use Cases

QuizContext initially targets individual learners who manage their own study material, particularly:

* University students revising lecture slides, readings, and technical subjects.
* Learners preparing for examinations or knowledge-based assessments.
* Professionals studying technical concepts, certifications, or substantial documentation.
* Independent learners wanting questions aligned with their chosen sources.

A representative use case is a university student uploading machine-learning lecture notes, organising them by topic, generating a targeted quiz, completing short-answer questions, and receiving feedback identifying concepts that were omitted or misunderstood.

## 6. Product Identity & Direction

QuizContext is distinguished by the relationship between three capabilities:

**Structured Knowledge:** Users control the learning material and how it is organised.

**Context-Bounded Intelligence:** AI uses that material with an explicit level of contextual freedom.

**Assessment & Feedback:** Generated questions and recorded attempts help users test their understanding.

The project draws architectural inspiration from CareerContext.io, particularly its user-managed content and content-informed AI operations, but remains a separate application with its own product and technical direction.

QuizContext is also intended to provide reusable backend capabilities that could eventually support **Recall Radio**, a separate mobile, audio-first active-recall application.

## 7. Initial Scope & Future Direction

The initial product focuses on individual user accounts, content organisation, document ingestion, quiz generation, interactive completion, answer evaluation, and basic quiz history.

Advanced capabilities such as audio interaction, AI chat, spaced repetition, collaborative learning, sophisticated analytics, and retrieval-augmented generation are outside the initial MVP.

The long-term opportunity is to evolve QuizContext from a quiz-generation tool into a reusable learning and assessment platform capable of supporting multiple study interfaces.

**Initial success means that a learner can supply their own study content, generate a relevant quiz, complete it, and receive feedback that meaningfully reflects the material they intended to learn.**
