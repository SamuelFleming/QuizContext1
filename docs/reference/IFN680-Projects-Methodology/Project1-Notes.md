# I strongly support adding a Notes / Instructions field to QuizContext

This is probably the most immediately useful improvement you could make to your application.

Currently, the generated quizzes appear to be guided by the uploaded content, quiz format and difficulty.

But consider two very different users uploading the same material.

One wants to learn the concepts for the first time.

Another is preparing to defend a machine-learning implementation in a university oral examination.

They need very different questions.

**The uploaded material tells QuizContext what to examine. The instructions field would tell it how to examine that material.**

I would implement a field called something like:

**Quiz Instructions (Optional)**

It could be a simple text area where the user provides additional instructions for the quiz-generation model.

These instructions would be passed alongside the knowledge source and the selected quiz configuration.

For your IFN680 preparation, this would be particularly valuable.

## Example 1 — General Project Revision

For a 20-question multiple-choice quiz:

```
‌
```

```
Generate questions to assess my understanding of this
university machine-learning assignment.

Prioritise:
- The project's objectives and requirements.
- Relevant machine-learning theory.
- Implementation decisions.
- Interpretation of experimental results.
- Connections to the corresponding tutorials.

Avoid questions that only require recalling exact
numerical values unless those values are essential
to understanding the conclusions.

Use realistic distractors that reflect common
misunderstandings rather than obviously incorrect answers.

Include questions requiring application of concepts
to unfamiliar scenarios.

Do not introduce facts or implementation details
that are unsupported by the supplied material.
```

This would encourage the generation of questions requiring more reasoning.

## Example 2 — Code and Implementation Examination

For a quiz containing 10 multiple-choice and 10 short responses:

```
‌
```

```
I am preparing for an individual oral examination
covering the code submitted for this assignment.

Prioritise understanding of the implementation.

Generate questions that require me to:
- Explain important functions and code blocks.
- Describe the overall execution flow.
- Explain the purpose of libraries and algorithms.
- Justify important implementation decisions.
- Interpret model outputs and evaluation metrics.
- Identify limitations or potential improvements.
- Predict what would happen if parts of the code changed.

For short-response questions, prefer questions
that require explanations rather than definitions.

Where useful, include small excerpts of code from
the supplied material and ask what they do.

Distinguish between the actual submitted implementation
and hypothetical alternative approaches.

Avoid excessive repetition of the same concepts.
```

This is the configuration I think would be particularly useful for Projects 4–8.

## Example 3 — Oral Interview Preparation

This would be my preferred configuration for your final revision.

```
‌
```

```
I am preparing for a 12-minute individual oral
examination covering eight machine-learning projects.

Generate challenging short-response questions
that simulate questions from university teaching staff.

Focus on:
1. What the project required.
2. What we implemented and why.
3. How the submitted code works.
4. What the experimental results demonstrate.
5. How the work relates to relevant tutorial concepts.

Prioritise explanation, reasoning, and understanding
over factual recall.

Include questions that:
- Ask me to justify implementation decisions.
- Require interpretation of results.
- Test understanding of key code components.
- Ask about limitations and alternatives.
- Connect theoretical concepts to practical implementation.

Some questions should combine multiple concepts,
similar to how an examiner might ask follow-up questions.

Expected answers should be achievable verbally
within approximately 30-60 seconds.

Do not require exact numerical recall unless important.
Use only the supplied material as the factual basis.
```