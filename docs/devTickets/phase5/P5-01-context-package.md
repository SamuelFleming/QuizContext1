# P5-01 — Ownership-scoped context package

**Status:** Planned  
**Phase:** 5  
**Depends on:** P4-05  
**Relevant scope:** MVP plan §3 "One content-resolution path" and "Context mode", Phase 5; `03_product-theory.md` §4; `02_high-level-solution.md` §5.1

## Objective
One resolver in `server-webApp` turns a subject or topic selection into a bounded, source-labelled context package for the caller only. It reports what was included, truncated, or left out, and whether there is enough content. Phase 5 description suggestions and Phase 6 generation and evaluation both use it.

## In scope
- `server-data`: one keyed, owner-scoped read (proposed `GET /subjects/:subjectId/context-sources?topicId=&includeDescendants=true|false`). It returns the subject (name, description, notes), the topics in scope (id, parent, name, description, notes), and their documents **with** `content`. No `topicId` means the whole subject. With a `topicId`, it returns that topic and, if requested, its descendants (reuse `collectSubtreeIds`). Subject-level documents are included only when no `topicId` is given. A subject or topic the caller does not own returns 404.
- `server-webApp`: `services/dataApi/` client for that route, plus `services/contextService.js` exposing something like `assembleContext(userId, { subjectId, topicId, includeDescendants, contextMode, maxChars })`.
- Ordering: the selected node's description and notes, then its documents, then descendants breadth-first, each topic's notes before its documents.
- Labelling: each source is wrapped in a clear delimiter carrying its type (subject, topic, document), id, title, and topic path. The package includes a fixed statement that the source text is untrusted data, not instructions. Delimiter-like text inside a source is neutralised so it cannot close the block.
- Bounding: a character budget (`AI_CONTEXT_MAX_CHARS`, proposed default 48,000; an operation may pass a lower value). Sources are added whole in order. The first source that does not fit is truncated to the remaining budget, and every later source is excluded.
- Result: `{ text, contextMode, manifest: [{ type, id, title, path, chars, status: included|truncated|excluded }], totals: { includedChars, availableChars }, truncated, insufficient }`. Content is insufficient when there is less non-whitespace text than `AI_CONTEXT_MIN_CHARS` (proposed default 200). Empty notes and empty descriptions are skipped and not listed.
- Context mode: `constants/contextModes.js` with `very_strict`, `targeted`, `loose`. Default `targeted`; reject unknown values. The resolver carries the mode in its result and does not change selection by mode yet.
- Swagger on `server-data` for the new route.

## Out of scope
- Any business API route or client change. P5-02 is the first caller.
- Token counting, relevance ranking, embeddings, RAG.
- Mode-specific selection rules.
- Storing the package. Phase 6 decides what a quiz snapshots.

## Acceptance checks
- [ ] Focused check against the running data API: a three-level tree with notes and documents produces the expected order and labels for a subject, for a topic with descendants, and for a topic without descendants.
- [ ] With a small `maxChars`, exactly one source is `truncated`, later ones are `excluded`, and `truncated` is true.
- [ ] A subject with only a name, or blank notes, returns `insufficient: true`.
- [ ] Source text containing the delimiter and "ignore previous instructions" stays inside its labelled block.
- [ ] User B's call for user A's subject or topic returns 404 at the data API. Missing key or `X-User-Id` returns 401.
- [ ] An unknown `contextMode` is rejected. Omitting it gives `targeted`.
- [ ] `server-data` Swagger lists the new route.

## Implementation notes
- Document list routes currently omit `content` (`documentRepository.listDocuments`). This ticket adds a content-bearing read instead of making one read per document.
- Core scope says "Very Strict"; `CLAUDE.md` says "Strict". Use `very_strict` to match core scope.
