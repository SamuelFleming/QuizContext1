# 7005 — Jupyter notebook upload

**Status:** Planned  
**Phase:** 7  
**Depends on:** 7001  
**Relevant scope:** Phase 7 README; F03; S03; P4-04

## Objective
A `.ipynb` notebook becomes readable text the user can review and save. Cell outputs and images are left out.

## In scope
- `POST /documents/extract` accepts `.ipynb` (`application/json` or the notebook MIME the browser sends; key off the extension).
- Parse notebook JSON. Walk cells in order. For each code or markdown cell, write a heading `Code` or `Markdown` and the cell source.
- Join multi-part cell sources. Skip raw cells, attachments, outputs, and widget state.
- Invalid JSON, or a file with no notebook `cells` array, returns 422. A notebook whose cells have no source text returns 422.
- The extracted text still goes through the existing review step and the 200,000 character cap.

## Out of scope
- Running the notebook, or keeping outputs so they can be re-run.
- Images in markdown cells or output display data (7012).
- `.py` behaviour beyond not breaking 7004.

## Acceptance checks
- [ ] From the browser, a notebook with one markdown cell and one code cell uploads, review shows both sources in order and does not show output images or stream output, and the saved edit persists after reload.
- [ ] A non-JSON `.ipynb` and a JSON file that is not a notebook return 422 and save nothing.
- [ ] Over 25 MB returns 413. Extracted text over 200,000 characters returns 422.
- [ ] `.py` upload from 7004 still works.
- [ ] Swagger lists `.ipynb` on the extract route.

## Implementation notes
Use `JSON.parse` on the buffer after a UTF-8 check. Do not add a Jupyter runtime. Neutralise nothing special here; context assembly already treats saved document text as untrusted.
