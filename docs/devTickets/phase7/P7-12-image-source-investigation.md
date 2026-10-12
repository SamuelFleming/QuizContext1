# P7-12 — Image-heavy source investigation

**Status:** Deferred  
**Phase:** 7  
**Depends on:** None  
**Relevant scope:** Phase 7 README; F03; P4-04

## Objective
Decide, in writing, whether lecture slides and other image-heavy files can become useful text without storing the original file. Do not implement extraction, OCR, or a vision call in this ticket.

## In scope
When this ticket is taken off deferral, a short note in `docs/devTickets/phase7/` answers:

- What today's extractors drop: scanned PDFs, image-only slides, pictures inside `.docx` and `.pptx`, notebook output images.
- One recommended approach for a later ticket. The option to examine first is: during review, replace each image with an AI-written text description, show those descriptions in the review step, and save only the resulting text.
- What that approach must not do: store image bytes, send images from the browser to a provider directly, skip the review step, or treat image text as instructions.
- Rough cost and failure behaviour: token use, timeout, a provider that returns no description, and how a partial result would appear in the review step.
- A recommendation to build it, narrow it (for example PDF pages only), or leave it.

## Out of scope
- Implementing OCR, a vision model, new upload types, or a change to the document schema.
- Quiz generation reliability.

## Acceptance checks
- [ ] The note exists and answers the five points above.
- [ ] No application code, dependency, or OpenAPI change is part of this ticket.

## Implementation notes
Leave this deferred until explicitly asked. P7-01 through P7-11 do not depend on it. Image-only PDFs and decks keep today's 422.
