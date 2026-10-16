# Source extracts (read-only snapshots)

These files are **CareerContext snapshots for reading**, not drop-in QuizContext modules. Relative `require()` paths will not run here. Adapt the ideas; do not paste the tree into a new app.

Read `../01_AI-Integration.md` and `../03_Reusable-Patterns.md` first.

## Do not copy unchanged

- `ai/index.js` registers CareerContext prompts — reuse `runPrompt`, not the `require('./prompts/...')` list.
- `ai/aiClient.js` caches one SDK client on a single env key — per-user keys need per-request key resolution.
- `ai/aiRunService.js` / `models/AiRun.js` have no `providerMode` or `estimatedCost`.
- `middleware/loadOwnedExperience.js` is an **ownership pattern**; rename to Subject/Topic/Quiz equivalents.
- CareerContext AI **suggests only**. Quiz generation and marking should persist as explicit user operations.

## Original paths

| Extract | CareerContext source |
|---|---|
| `ai/aiClient.js` | `server/src/services/ai/aiClient.js` |
| `ai/aiConfig.js` | `server/src/services/ai/aiConfig.js` |
| `ai/aiErrors.js` | `server/src/services/ai/aiErrors.js` |
| `ai/promptRegistry.js` | `server/src/services/ai/promptRegistry.js` |
| `ai/structuredOutput.js` | `server/src/services/ai/structuredOutput.js` |
| `ai/index.js` | `server/src/services/ai/index.js` |
| `ai/aiRunService.js` | `server/src/services/ai/aiRunService.js` |
| `models/AiRun.js` | `server/src/models/AiRun.js` |
| `utils/serviceError.js` | `server/src/utils/serviceError.js` |
| `middleware/authenticateWithJwt.js` | `server/src/middleware/auth/authenticateWithJwt.js` |
| `middleware/loadOwnedExperience.js` | `server/src/middleware/evidence/loadOwnedExperience.js` |

Intentionally omitted: flow services, prompts, document extraction, list query, and frontend components.
