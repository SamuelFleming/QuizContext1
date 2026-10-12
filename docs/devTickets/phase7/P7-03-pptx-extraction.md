# P7-03 — PowerPoint extraction

**Status:** Planned  
**Phase:** 7  
**Depends on:** P7-01  
**Relevant scope:** Phase 7 README; F03; S03; P4-04

## Objective
A `.pptx` deck is extracted to slide text, reviewed by the user, and saved as a document. Pictures on the slides are omitted.

## In scope
- `POST /documents/extract` accepts `.pptx`.
- Slide text in slide order. Separate slides with a blank line and a `Slide N` label. Include speaker notes when the extractor returns them without a second parser.
- Empty extraction (image-only deck) returns 422 saying the slides had no extractable text and OCR is not supported.
- Legacy `.ppt` returns 415 and the message names `.pptx`.
- Same review and save path as other documents.

## Out of scope
- `.docx` (P7-02) except that both must keep working.
- Rebuilding slide layout, images, charts, or SmartArt (P7-12).
- Storing the `.pptx`.

## Acceptance checks
- [ ] From the browser, a `.pptx` with text on two slides uploads, review shows both slides in order, and the saved document matches the edited review text after reload.
- [ ] An image-only `.pptx` returns 422 and saves nothing.
- [ ] A `.ppt` file returns 415 naming `.pptx`.
- [ ] Over 25 MB returns 413. Extracted text over 200,000 characters returns 422.
- [ ] `.docx`, `.pdf`, `.md`, and `.txt` from earlier tickets still extract.
- [ ] Swagger lists `.pptx` on the extract route.

## Implementation notes
CareerContext used `officeparser` for `.pptx`. Confirm the current API before adding it. Do not copy that project’s extractor.
