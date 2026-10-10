Phase 5 is implemented. All three tickets passed their checks, and the run didn't stop early. Everything was tested against a mock OpenAI server, because a real OpenAI call still can't be made locally without a key. Nothing is committed.

From a subject or topic in the workspace, a user can now click "Suggest description" and review the AI suggestion. They can edit it, then accept it (which saves it) or discard it.

P5-01 — Context package

Changed: a new internal data API route, GET /subjects/:id/context-sources, returns only the caller's subject, the topics in scope, and their documents with full text.
In server-webApp, services/contextService.js (assembleContext) builds the package. It orders the sources, labels each one as untrusted data, and stops a source's text from breaking out of its label.
It applies a 48,000-character limit and reports which sources were included, cut short, or left out. Under 200 characters of real text counts as not enough content.
It accepts a context mode, defaulting to targeted.
Checked: a focused script passed 25 of 25. It covered ordering, the size limit, the not-enough-content case, a source containing prompt-injection text, other users getting 404, and missing credentials getting 401.
P5-02 — Suggestion API

Changed: a new route, POST /ai/description-suggestions, goes through the existing AI service with a versioned prompt and an output check (non-empty, at most 2,000 characters).
If there isn't enough content, it returns 422 CONTEXT_INSUFFICIENT before any AI call.
The usage record now also stores the prompt version and counts describing the context. It still stores no prompt text, source text, or key.
The suggestion is never saved by this route.
Checked: 40 of 40 against the mock. Invalid AI output is rejected, logged as failed, and leaves the description unchanged. Oversized content is reported as partly included. AI disabled, no user key, and the monthly limit each return their error while content routes keep working. Database records and server logs contain no source text, prompt, or key.
P5-03 — Workspace screen

Changed: the Suggest button, an "Include subtopics" toggle, an editable review, Accept and save, and Discard. A notice shows which sources were cut short or left out. Errors are clear, with an "Open Profile" button for key or limit problems.
Accepting saves only the description. Any unsaved notes stay as they are.
A pending suggestion counts as unsaved work when switching topics.
Checked: a headless Chrome run passed 24 of 24, including the 390px phone layout. The Phase 4 browser scripts (82 checks) and request scripts (122 checks) still pass. Lint shows only the Diagnostics warning that was already there, and the build passes.


Small changes beyond the ticket text:

createHttpError can now carry an error code, and the error handler returns it as code. This is how CONTEXT_INSUFFICIENT reaches the client.
The resolver also returns which subject or topic was selected, so the prompt can name it even when that node has no notes of its own.
The "Discard unsaved notes?" prompt now reads "Discard unsaved changes?", since it also covers a pending suggestion.
The context mode names very_strict, targeted and loose follow core scope's "Very Strict". CLAUDE.md still says "Strict", so one of the two should be updated.

The temporary test scripts and servers are cleaned up. The queue, devCompletion.md, the Phase 5 README and the roadmap status line are all updated. Phase 6 should call assembleContext for generation and stop when it reports not enough content.