# 7001 — Raise the upload size limit

**Status:** Done  
**Phase:** 7  
**Depends on:** None  
**Relevant scope:** Phase 7 README; F03; S03; P4-04

## Objective
A lecture PDF larger than 5 MB can be uploaded, extracted, reviewed, and saved, as long as the extracted text is within the existing character cap.

## In scope
- Raise `DOCUMENT_UPLOAD_MAX_BYTES` from 5 MB to 25 MB. The limit lives in `server-webApp` (`constants/validation.js` and the multer middleware). `server-data` does not check the raw file size.
- The 413 message states 25 MB.
- Swagger text that says 5 MB is updated.
- The client shows the server's 413 message (no hard-coded 5 MB copy).

## Out of scope
- New file types (7002 onward).
- Raising the 200,000 character extracted-text cap.
- Storing the original file, chunked upload, or an environment override.
- OCR or image handling (7012).

## Acceptance checks
- [x] A text PDF between 5 MB and 25 MB extracts, can be edited in review, saves, and reloads as the edited text.
- [x] A file over 25 MB returns 413 with a message that names 25 MB, and nothing is saved.
- [x] A file under 25 MB whose extracted text exceeds 200,000 characters still returns 422 and is not saved.
- [x] `.md` and `.txt` under the new limit still save. Unsupported types still return 415.
- [x] Swagger on `server-webApp` matches the extract route. No new data-API route.

## Implementation notes
Multer memory storage holds the file only during extraction. 25 MB is the peak extra memory for one upload, not a stored blob.
