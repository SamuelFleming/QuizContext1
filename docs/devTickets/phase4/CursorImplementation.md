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