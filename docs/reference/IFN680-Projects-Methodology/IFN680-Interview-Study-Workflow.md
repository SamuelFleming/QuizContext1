# IFN680 Assessment 2 — Reusable Project Study Workflow

**Objective:** Be able to explain and defend *what the project required, what the group submitted, why the approach was used, what the results mean, and how the work connects to the tutorials* in a **12-minute individual oral interview across eight projects**.

## Inputs to collect (per project)
- **Essential:** task specification; final submitted report; final submitted code/notebooks; outputs, figures, tables and important results.
- **Supporting:** associated tutorial description and notebook/solution; relevant project notes and lecture context if needed.
- **Source discipline:** distinguish **required by task**, **actually implemented**, **claimed in report**, **tutorial theory**, and **possible improvements**. Flag mismatches rather than silently resolving them. Account for code written by teammates.

## Minimum knowledge coverage (regardless of document layout)
1. **Task:** aim, prediction/problem type, deliverables and evaluation requirements.
2. **Approach:** model/algorithm, dataset, preprocessing, training and testing sequence.
3. **Decisions:** what was selected/tuned, why, and key alternatives.
4. **Code:** main entry points/functions, inputs → transformations → outputs, important parameters and libraries, how metrics/artifacts are produced.
5. **Results:** 2–4 anchor figures/findings, what comparisons show, conclusion and what the results *do not* prove.
6. **Theory/tutorial links:** key concepts used, and meaningful contrasts with tutorial methods.
7. **Critical understanding:** limitations, assumptions, potential errors/leakage, and realistic improvements (clearly distinguished from submitted work).
8. **Oral readiness:** a 30–60-second overview plus plausible follow-up questions.

## Four stages

| Stage | Primary output/activity | QuizContext use (assuming optional instructions are implemented) | Check of readiness |
|---|---|---|---|
| **1. Understand the project** | Read a concise `ProjectN-Revision.md` (roughly 2–4 pages). Reconstruct the implementation and results; explain the overview aloud. | No quiz yet; use this to establish understanding. | Summarise task → approach → result → why in 30–60 seconds without notes. |
| **2. Test foundational understanding** | Upload a comprehensive `ProjectN-QuizContext.md` knowledge source. | ~15–20 MCQs. Instructions: *“Prioritise core theory, project objective, evaluation procedure, results interpretation and tutorial links. Include applied questions and credible distractors. Avoid repeated or trivia-only questions.”* | Explain the reasoning behind correct answers, not merely choose them. Record gaps. |
| **3. Test implementation understanding** | Use the same source if code detail is sufficient; otherwise add a dedicated `ProjectN-Implementation.md` (selected **actual** code, data flow, design choices, outputs). | ~5 MCQs + 10 short responses (or primarily short responses). Instructions: *“Test actual submitted code flow, roles of functions and parameters, why decisions were made, results, limitations and ‘what if’ changes. Ground questions in supplied code. Prefer 30–60-second explanatory answers; distinguish submitted behaviour from alternatives.”* | Explain meaningful code excerpts and justify the approach aloud, without relying on answer options. |
| **4. Simulate the oral interview** | Practise spoken Q&A from the revision sheets and reports; rotate across projects. | Use short-response questions as prompts: *“Ask examiner-style questions requiring explanation, defence and interpretation, with realistic follow-up angles.”* **QuizContext alone is not adaptive**; use a conversational mock interview for dynamic follow-ups and timing. | Answer unfamiliar follow-ups clearly, and complete at least one mixed-project **12-minute** mock interview. |

## Document strategy — flexible, not mandatory
- **Default two deliverables per project:** `ProjectN-Revision.md` (human-readable, brief) and `ProjectN-QuizContext.md` (self-contained, precise, quiz-ready).
- **Optional:** `ProjectN-Implementation.md` when complex code or teammates' contributions deserve a deeper explanation. No need to split files just to fill a character allowance.
    - For these (and other parts that may reference the code), please pay attention to the section numbering in the ipynb files. They were explicitly ustilised for easy tracking when completing the project, and may be a great thing to utilise for quick recall and learning for the interview => this could also be implemented as a 'what's where' section, which outlines the sections of the code files, and in one or two secntences what they do. Such as:
        - Project 3, `development.ipynb`: section '3.2 Experiment 2 - Learning Rate Optimisation with Optuna' this is where....
- Source length should match complexity. **100,000 characters is a maximum, not a target.** Useful, non-duplicative examples and faithful code excerpts matter more than volume. (see below)

### Document Size & Content Constraints

Document Size & Content Constraints

> All generated study materials should prioritise relevance, clarity and efficient use of context over exhaustive documentation. QuizContext currently has a 100,000-character upload limit per knowledge source, so individual QuizContext documents should ideally target 20,000–40,000 characters, with a recommended maximum of 60,000 characters to allow flexibility. Revision sheets should aim to eb failry concise (not too long and over details) to remain practical for human study - and if any detail it should the absolutely crucial details of the projects. More complex projects may justify additional detail, but this should be separated into supplementarynotes rather than unnecessarily expanding the primary documents. These are guidelines rather than strict limits: preserving essential implementation details, results and theoretical understanding takes priority over meeting an arbitrary character count.

## Reusable per-project hand-off brief
> Using this project's final task sheet, submission code and report, and associated tutorials, produce (1) a concise interview revision sheet and (2) a self-contained QuizContext knowledge source. Cover the eight minimum knowledge areas above. Prioritise **submitted implementation and evidence**, with tutorial connections. Include key actual code excerpts and explain the data/control flow. Keep required/implemented/reported/hypothetical claims distinct. Identify any uncertainty or inconsistencies explicitly. Optimise for explaining work aloud, not memorising every value. Add a short 30–60-second project explanation and exam-style question prompts.

## Feedback loop
After each quiz or mock interview, keep a tiny **gap log**: topic → what I misunderstood → corrected explanation → follow-up question to retest. Target subsequent quiz instructions at those gaps instead of repeating material already mastered.
