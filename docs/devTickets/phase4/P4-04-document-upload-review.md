# P4-04 — Document upload, extraction, and review

**Status:** Done  
**Phase:** 4  
**Depends on:** P4-03  
**Relevant scope:** MVP plan Phase 4 and §6 "PDF text"; F03 step 4; S03; `02_high-level-solution.md` §2.2

## Objective
The user uploads a Markdown, text, or extractable PDF file to a subject or topic, reviews and edits the extracted text, and saves it as a document. Only the reviewed text is stored.

## In scope
- `server-webApp`: an extract route (proposed `POST /documents/extract`, multipart, JWT-protected) that reads the file in memory and returns `{ title, content, originalFileName, mimeType, sizeBytes }` without saving anything. `.md` and `.txt` decode as UTF-8; `.pdf` uses a text-extraction library. Extraction code lives in a service (e.g. `services/documentExtractionService.js`).
- Clear errors: over 5 MB returns 413; unsupported type returns 415 naming the allowed types; a PDF with no extractable text (scanned or image-only) returns 422 saying OCR is not supported. Original bytes are never persisted or logged.
- Save route (proposed `POST /documents`) with `subjectId`, optional `topicId`, `title`, reviewed `content`, and the file metadata. Title required, max 200 characters; content required, max 200,000 characters.
- `server-data`: `Document` model with `userId`, `subjectId`, nullable `topicId` (all indexed), `title`, `content`, `originalFileName`, `mimeType`, `sizeBytes`, timestamps. Create verifies the subject, and the topic if given, belong to the caller and to each other (404 otherwise). List by subject, optionally by topic, returns metadata without `content`; read returns one document with `content`. All scoped to `{ _id, userId }`.
- `server-webApp`: list and read routes (proposed `GET /subjects/:subjectId/documents?topicId=`, `GET /documents/:documentId`).
- Client: the detail panel lists documents for the selected subject or topic. "Add document" opens upload, then a review step with editable title and extracted text (reusing the P4-03 editor/preview), then Save or Cancel. Opening a document shows its content read-only. Add `services/documentService.js`; the upload uses `FormData` through `apiClient`.
- Swagger on both APIs, including the multipart request and the 413/415/422 responses.

## Out of scope
- Editing or deleting a saved document, and cascades (P4-05).
- OCR, `.docx`/`.pptx`/other office formats, storing original files, download/export.
- Treating document text as AI input (Phase 5 labels and bounds it).

## Acceptance checks
- [x] From the browser, a user uploads a `.md`, a `.txt`, and a text PDF to a nested topic, edits the extracted text in review, saves, and sees the edited text after reload.
- [x] Cancelling review stores nothing.
- [x] A `.docx` or image returns 415, an image-only PDF returns 422, and a file over 5 MB returns 413. Each shows a clear message in the UI.
- [x] User B cannot attach a document to user A's subject or topic, or list or read user A's documents (404).
- [x] Missing auth returns 401 on both APIs.
- [x] Swagger on both APIs lists the document routes that exist.
- [x] Client build passes.

## Implementation notes
New `server-webApp` dependencies: `multer` (memory storage) and `pdf-parse` (check its current API; v2 differs from v1). Extraction belongs to `server-webApp`; `server-data` only receives JSON. `apiClient` currently sets a JSON content type, so the upload path must let the browser set the multipart boundary. `userScopedRequest` maps only 400/404 through, which is enough for the save path.
