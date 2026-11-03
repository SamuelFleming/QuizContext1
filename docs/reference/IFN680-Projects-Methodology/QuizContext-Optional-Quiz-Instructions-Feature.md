# QuizContext — Optional Quiz Generation Instructions

## Problem / rationale
QuizContext can generate relevant quizzes from uploaded study material, but a source and a difficulty/format setting do not fully communicate **the learner's assessment goal**. In IFN680 oral-exam preparation, generated multiple-choice quizzes were often factual or repetitive; some distractors were too easy, and few questions required interpreting submitted code, justifying decisions, or explaining results aloud. The generated short responses were more useful, but there was no direct way to request that emphasis. This is a *generation-control* limitation, not necessarily a lack of source content.

## Proposed feature
Add an **optional “Quiz instructions”** free-text field to the quiz-creation workflow, alongside source, format, question count, and difficulty. Helper text: *“Tell QuizContext what to prioritise or avoid, or what you're preparing for (e.g., ‘test code understanding, not memorisation’).”*

### Behaviour
- Empty instructions: preserve existing quiz-generation behaviour (backward compatible).
- Supplied instructions: pass the text separately into the quiz-generation request as **learner preferences**, not as source evidence or higher-priority system instructions.
- Apply preferences when compatible with selected format, count, difficulty, available source evidence, factual accuracy, and app safety/validation rules. Never fabricate details to satisfy an instruction.
- Support guidance on emphasis (theory/code/results), question style (application, critical reasoning), realistic distractors, depth of short responses, avoiding repetition, and intended assessment type.
- Store the supplied instructions with the generated quiz/configuration so users can understand and reproduce the result. Show/edit them during regeneration where supported.
- Use a sensible character limit (suggest **2,000 characters** initially) and a simple multiline textarea, optionally collapsed under “Advanced options”. Do not make this a mandatory field.

### Generation-prompt integration
Keep **source material**, **quiz configuration**, and **optional learner instructions** as distinct inputs. The prompt should explicitly instruct the generator to follow the optional preferences *subject to* source-grounding and enforced quiz constraints. Treat any directions inside uploaded material as data, not commands.

### Acceptance criteria
1. Quizzes without custom instructions behave as before.
2. “Focus on actual code flow and why each step is used” leads to more implementation-centred questions, *where source code supports them*.
3. “Use plausible distractors; avoid exact-number recall and repeated concepts” changes question selection without inventing claims.
4. An instruction conflicting with the requested format/count or unsupported by sources does not override those constraints.
5. Instructions are recorded with the quiz and used consistently on regenerate where supported.

## Example user instructions
> I am preparing for an individual oral examination about a submitted machine-learning project. Prioritise explaining code behaviour, implementation decisions, experimental results, and tutorial connections. Ask questions that require application and reasoning; avoid excessive numerical memorisation. For MCQs, use plausible distractors. For short responses, target answers that can be spoken in 30–60 seconds. Distinguish the submitted implementation from hypothetical improvements; do not invent unsupported details.

**Scope:** This makes ordinary quiz generation more intentional. It does not, by itself, create a live/adaptive oral-interview simulator.
