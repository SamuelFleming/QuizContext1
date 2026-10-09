# Phase 3 addendum — Code organisation refactor

**Why.** Phases 1–3 shipped working features in flat `src/` folders. `CLAUDE.md` already required routes → controllers → services/repositories, but no controllers existed, and the folder convention (CareerContext-style) was never written into `docs/core-scope/`. This addendum records the audit, the convention now in core scope, and the move-only tickets that bring the code in line before Phase 4 adds content routes.

**Tickets.** [P3-05](P3-05-code-organisation-convention.md) → [P3-06](P3-06-server-data-structure.md) → [P3-07](P3-07-server-webapp-structure.md) → [P3-08](P3-08-client-structure.md).

## 1. Audit (state at commit `dd33f26`)

**Documentation.** The layering was stated in `CLAUDE.md` and `.cursor/rules/backend.mdc`; the frontend `features/<domain>/` layout only appeared in the advisory `docs/reference/03_Reusable-Patterns.md`. `docs/core-scope/` had no folder convention. P3-05 adds it as `02_high-level-solution.md` §5.1.

**server-data** — everything flat in `src/` except `models/`.
- `userRoutes.js` (154 lines) held validation, response shaping, and duplicate-key handling: a controller named as a router.
- `app.js` had inline `/health` and `/diagnostics/database` handlers.
- `internalAuth.js` (middleware), `http.js` (helpers + error handler), `db.js` (config), repositories, and a 532-line `openapi.js` all loose in `src/`.
- The display-name limit `80` and the modes `application`/`user` repeated as literals in both APIs.

**server-webApp** — flat apart from `ai/`.
- `authRoutes.js`, `userRoutes.js`, `settingsRoutes.js` held validation, hashing, key encryption, and the connectivity-check prompt: business logic in routes, no controllers or services.
- `auth.js` mixed middleware (`requireAuth`) with service logic (hash, verify, issue token).
- `dataClient.js` (152 lines) covered every server-data resource in one file.
- `app.js` had an inline diagnostics handler; `http.js` mixed helpers and the error handler; ~460-line `openapi.js`.
- `ai/` was the right idea under a different name; `keyCrypto.js` and `aiConfig.js` are a utility and configuration, not OpenAI client code.

**client-webApp**
- No `app/`, `context/`, `features/`, `services/`, or `styles/`.
- `App.jsx` held auth state, token handling, navigation, and routing; `user` and `onUnauthorized` threaded through props.
- `lib/api.js` combined the client, token storage, and every domain call.
- `components/` mixed shared layout (`Shell`) with Profile-only `AiAccessSettings` and `UsagePanel`; screens in `pages/`.
- Stylesheets loose in `src/`; Vite scaffold assets (`hero.png`, `react.svg`, `vite.svg`) unused.

## 2. Target mapping

Move-only: no endpoint, response shape, OpenAPI content, or UI change. Completed tickets P1-01 to P3-04 and `devCompletion.md` keep their original file paths as a historical record; use this mapping to find the current location.

**server-data/src**
- `config/db.js` ← `db.js`
- `middleware/internalAuth.js` ← `internalAuth.js`; `middleware/errorHandler.js` ← `notFound`, `errorHandler` from `http.js`
- `utils/responses.js` ← `sendData`, `sendMessage`
- `routes/{userRoutes,aiUsageRoutes,diagnosticsRoutes}.js` — wiring only (health + database diagnostic leave `app.js`)
- `controllers/{userController,aiUsageController,diagnosticsController}.js` ← handler bodies
- `repositories/{userRepository,aiUsageRepository}.js` ← moved
- `models/` unchanged
- `constants/user.js` — `DISPLAY_NAME_MAX`, `AI_ACCESS_MODES`
- `openapi/index.js`, `openapi/components.js`, `openapi/paths/{system,users,aiUsage}.js` ← split `openapi.js`

**server-webApp/src**
- `routes/{authRoutes,userRoutes,settingsRoutes,diagnosticsRoutes}.js`
- `controllers/{authController,userController,settingsController,diagnosticsController}.js`
- `middleware/requireAuth.js` ← `auth.js`; `middleware/errorHandler.js` ← `http.js`
- `services/authService.js` (register/login, hash, verify, token), `services/userService.js`, `services/aiSettingsService.js` (mode, key validate + encrypt, status, usage, connectivity check)
- `services/dataApi/{client,users,aiSettings,aiUsage,diagnostics}.js` ← `dataClient.js`
- `openai/{aiClient,aiService,aiErrors,keyResolver,usageLimit}.js` ← `ai/`
- `config/aiConfig.js` ← `ai/aiConfig.js`
- `utils/keyCrypto.js` (unchanged cryptography), `utils/responses.js`, `utils/httpError.js`
- `constants/validation.js`, `constants/aiAccessModes.js`
- `openapi/` split as in server-data

**client-webApp/src**
- `main.jsx` stays (Vite entry)
- `app/App.jsx`, `app/useNavigation.js`
- `app/AppRoutes.jsx` — the route switch
- `context/AuthProvider.jsx`, `context/authContext.js`, `context/useAuth.js` — user, auth check, sign in/out lifted from `App.jsx` (split so React fast refresh works)
- `components/layout/Shell.jsx`, `components/Placeholder.jsx`
- `features/auth/AuthPage.jsx`, `features/dashboard/Dashboard.jsx`, `features/diagnostics/Diagnostics.jsx`, `features/profile/{ProfilePage,AiAccessSettings,UsagePanel}.jsx`
- `services/apiClient.js` + `services/{authService,userService,settingsService,diagnosticsService}.js` ← `lib/api.js`
- `styles/{theme,index,app}.css`
- Unused scaffold assets deleted

## 3. Verification approach
Per ticket: both servers start; the OpenAPI spec serialises identically to the pre-refactor snapshot; request smoke for register, login, `GET`/`PATCH /users/me`, `/settings/ai*`, `POST /settings/ai/check`; 401 without internal key / JWT. Client: lint, production build, headless browser pass through login, Profile, Diagnostics, logout.

## 4. Risks
- Splitting routes into controllers/services is the only step touching logic; it must stay a cut-and-paste of handler bodies.
- `AuthContext` changes how components receive the user; behaviour (including dropping an expired token) must match.
