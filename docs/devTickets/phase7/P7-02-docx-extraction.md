# P7-02 — Word document extraction

**Status:** Planned  
**Phase:** 7  
**Depends on:** P7-01  
**Relevant scope:** Phase 7 README; F03; S03; P4-04

## Objective
A `.docx` file is extracted to text, reviewed by the user, and saved as a document. The original Word file is not stored.

## In scope
- `POST /documents/extract` accepts `.docx` and returns the same `{ title, content, originalFileName, mimeType, sizeBytes }` shape as today.
- Extract body text in document order. Drop images. Do not follow instructions embedded in the file; the text is untrusted source data, same as other uploads.
- Empty extraction returns 422. A file that is not a readable `.docx` returns 422. Legacy `.doc` returns 415 and the message names `.docx`.
- Review, edit, and save stay on the existing document screens. No new save fields.

## Out of scope
- `.pptx` (P7-03), `.py` (P7-04), `.ipynb` (P7-05).
- Comments, tracked changes, headers, and footers, unless the extractor includes them with no extra work. Do not add a second code path to hunt for them.
- OCR, embedded-image captions (P7-12), and storing the `.docx`.

## Acceptance checks
- [ ] From the browser, a `.docx` with headings and paragraphs uploads, the review step shows that text, an edit survives reload.
- [ ] A `.docx` with no extractable text returns 422 and saves nothing.
- [ ] A `.doc` file returns 415 naming `.docx`.
- [ ] Extracted text over 200,000 characters returns 422. A `.docx` over 25 MB returns 413.
- [ ] User B cannot save the extracted text onto user A's subject (404).
- [ ] Swagger lists `.docx` on the extract route.

## Implementation notes
CareerContext used `mammoth` for `.docx`. Confirm the current API. Keep extraction in `documentExtractionService.js`. `server-data` still stores reviewed `content` only.
