# Agent Converation (post implementation)

Phase 3 is complete: all four tickets ran in order, and each passed its checks before the next one started. Nothing has been committed.

One gap: no real successful OpenAI call has run yet, because there's no OpenAI key in your local server-webApp/.env. Every failure path was tested, including a fake key rejected by the real OpenAI API. The success path was tested against a local mock of OpenAI's API. To close the gap, either set OPENAI_API_KEY and AI_ENABLED=true in that file, or save a personal key on the Profile screen, then click Test connection.

P3-01 — Profile edit.

Changed: PATCH /users/me on both APIs. Only the display name can change; the data API enforces an allow-list, so a request can't touch email, the password hash, or another user's record. The Profile screen now has a real form.
Checked: rename works; empty or over-long names are rejected. A request that also sent email, password hash and another user's id changed neither account, and login still worked. Missing token or missing internal headers give 401. A headless browser confirmed the header and dashboard show the new name.
P3-02 — Encrypted personal key.

Changed: an access-mode choice (application key or your own) and a personal OpenAI key, encrypted with AES-256-GCM in the business API (src/ai/keyCrypto.js). The data API stores only the encrypted value. There's an "AI access" section on Profile.
Checked:
Encrypting then decrypting returns the original key, and a tampered value fails to decrypt.
The database holds only the encrypted fields, and saving the same key twice gives different ciphertext.
Replace and remove work, and another user can't read or delete your key.
No response, API log or page ever contained the key.
Deviation: the shared error handler used to hide every 5xx message. It now shows messages that are explicitly marked safe, so "key storage not configured" is readable.
P3-03 — OpenAI service and Test connection.

Changed: one entry point, runAiOperation in server-webApp/src/ai/. It picks the key per request, builds a fresh OpenAI client for each call (no cache tied to one key) and returns { message, code } errors. A new AiUsage collection records model, tokens, estimated cost and key mode, with no prompt text or key. There's a Test connection button on Profile.
Checked:
AI switched off, user mode with no key, and a bad key against real OpenAI each return the right error and are recorded.
Login and profile still work while AI fails.
With the mock, application and personal-key calls succeed and are recorded correctly. Switching modes used the application key, then the personal key, then the application key again, in that order.
P3-04 — Usage summary and monthly limit.

Changed: a "Usage this month" panel on Profile. Calls on the application key are refused once a user passes AI_APP_MONTHLY_TOKEN_LIMIT (default 100,000 tokens a month). The check sits inside runAiOperation, so Phases 5 and 6 inherit it.
Checked: with the limit lowered to 40 tokens, two calls succeeded and the third was refused and recorded. The totals matched, personal-key calls still ran and were counted separately, and a second user's summary was empty. The browser showed the panel refreshing after a test.
Usage panel

Other things to know:

Placeholders: the default model (gpt-4o-mini) and the price table in server-webApp/src/ai/aiConfig.js need checking against OpenAI's current models and pricing.
Local config I added: I appended a randomly generated AI_KEY_ENCRYPTION_KEY to your local server-webApp/.env. If it changes, stored personal keys can't be decrypted and users must re-enter them.
New dependency: openai was added to server-webApp.
Running processes: I restarted the data and business APIs and stopped the extra test server I'd started on port 4027.
Leftover folder: the auto-reviewer blocked one broad cleanup command, so the scratch folder %TEMP%\qc-e2e (browser-test scripts and screenshots, outside the repo) is still there. You can delete it.
Untracked .vscode/: a .vscode/ folder shows up in git status. I didn't create it.
Tickets, the queue, the completion log and the MVP plan are updated. When you've reviewed and committed, run /plan-phase for Phase 4.

You've also stopped the business API on port 4017, so both APIs are now down. Only the client dev server on 5017 may still be running.

I'll leave them stopped unless you ask me to restart them. To bring the stack back, run npm start in server-data and then in server-webApp.

## Pattern Refactor

Phase 4 is complete: all five tickets (P4-01 to P4-05) passed their checks and are marked done in the queue and devCompletion.md. Nothing is committed.

A signed-in user can now:

create a subject;
nest topics to any depth;
write Markdown notes;
upload a .md, .txt or text-based PDF, review and edit the extracted text, and save it;
edit and delete anything they own.
A second user can't see or change any of it. Both APIs' Swagger docs cover every content route that exists.

Per ticket

P4-01 Subjects:
Changed: create, list, read, update and delete on both APIs, with every query limited to the signed-in user's own records. Added the Subjects screen, the workspace page at /subjects/:id (matched in AppRoutes without a router library), and a subject list on the Dashboard.
Checked: 22 request checks, 17 browser checks.
P4-02 Topic tree:
Changed: one Topic collection with a parent link, and a check that a new topic's subject and parent belong to the user. Deleting a topic removes everything beneath it, and deleting a subject removes its topics. The workspace tree supports expand and collapse, and the delete confirmation says how many nested topics go with it.
Checked: 26 request checks, 18 browser checks.
P4-03 Markdown notes:
Changed: a shared editor and preview in components/markdown/ using react-markdown and remark-gfm with raw HTML off. It shows character counts, an unsaved-changes prompt, and a warning before leaving the page. The JSON body limit is now 1 MB on both servers.
Checked: 7 request checks and 17 browser checks. The browser checks confirmed that <script> and onerror tags show as text and javascript: links are stripped.
P4-04 Upload and review:
Changed: an extract step on the business API that saves nothing (5 MB limit, using multer and pdf-parse v2), followed by a separate save of the reviewed text. Errors are 413 for oversized files, 415 for unsupported types, and 422 for PDFs with no text, unreadable files, or text over 200,000 characters. apiClient now sends file uploads.
Checked: 37 request checks, 14 browser checks.
P4-05 Edit, delete, cascades:
Changed: document edit (title and text only) and delete. Deleting a topic now also removes documents on it and all topics beneath it; deleting a subject removes its topics and documents.
Checked: 25 request checks, plus a 16-step browser walkthrough of the whole phase that includes the second-user checks.
After each ticket I re-ran the earlier tickets' request and browser checks, and they all still pass. Lint passes apart from the existing Diagnostics.jsx warning, and the client builds.

Deviations and choices you may want to review

Document lists filter with ?topicId=<id>, ?topicId=none or no filter. none returns only documents attached to the subject itself; no filter returns every document in the subject, which is the form Phase 5 will want.
List responses leave out document text. You get the full text only when you open a single document.
Oversized extracted text is rejected rather than trimmed. Text over 200,000 characters returns a 422 asking the user to split the file, so nothing is silently cut.
New dependencies: react-markdown and remark-gfm in the client, and multer and pdf-parse in server-webApp. Both package-lock.json files changed. npm warned that a pdf-parse sub-dependency (@scarf/scarf) has an install script that wasn't run; nothing broke without it.
How I tested I ran separate copies of the APIs on ports 4107 and 4117 and the client on 5117, against your local MongoDB, so your running servers were left alone. Restart your own dev servers to pick up the new routes. I've stopped my test processes. The test scripts and sample files (including generated PDFs) are in your temp folder, outside the repo.



The next step is /plan-phase for Phase 5.