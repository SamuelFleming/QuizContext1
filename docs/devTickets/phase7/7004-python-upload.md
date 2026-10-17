# 7004 — Python file upload

**Status:** Done  
**Phase:** 7  
**Depends on:** 7001  
**Relevant scope:** Phase 7 README; F03; S03; P4-04

## Objective
A `.py` file is read as UTF-8 text, reviewed, and saved as a document. It is source text for later quizzes, not code the server runs.

## In scope
- Add `.py` beside `.txt` in the extract allow-list. MIME `text/x-python`.
- Same UTF-8 rules as `.txt`: reject invalid UTF-8 with 422, normalise a leading BOM and CRLF, reject empty files with 422.
- The file is never executed, imported, or logged. Only the reviewed text is stored.

## Out of scope
- Other code extensions (`.js`, `.ts`, `.java`, and the rest).
- `.ipynb` (7005).
- Syntax highlighting in the editor, syntax checks, and running the script.

## Acceptance checks
- [x] From the browser, a `.py` file with functions and comments uploads, review shows the source, and an edit persists after reload.
- [x] Invalid UTF-8 returns 422. An empty `.py` returns 422. Nothing is saved in either case.
- [x] A `.py` over 25 MB returns 413. Text over 200,000 characters returns 422.
- [x] Swagger lists `.py` on the extract route.

## Implementation notes
This is an allow-list change in `documentExtractionService.js`, not a new parser.
