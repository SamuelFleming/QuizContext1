# 8006 — Workspace topic tree layout + quiz history scaffold

**Status:** Done  
**Phase:** 8 (follow-on)  
**Depends on:** P4-02 (workspace tree), P6-02 (generate from workspace)  
**Relevant scope:** S03 Content Workspace; F03

## Objective
Cap and scroll the Content Workspace topic tree so Documents and quiz actions stay reachable, present siblings in alphanumeric order, and scaffold a Quiz History placeholder for a later metrics ticket.

## In scope
- Limit `.tree-panel` height (`max-height: 22rem`, same as `.topic-picker`) with internal scroll when topics overflow.
- Sort sibling topics alphanumerically in `childrenByParent` (case-insensitive, numeric-aware) so the workspace tree, quiz TopicPicker, and library topic filter share order.
- Add a lightweight Quiz History block on the selected subject/topic detail panel (heading + placeholder copy only).

## Out of scope
- Sticky tree, JS height sync to Notes, drag-reorder, server-side topic ordering.
- Completeness indicators (7027/7028).
- Real quiz/performance metrics or study-history API wiring into this panel.
- OpenAPI / API changes.

## Acceptance checks
- [x] With many expanded topics, `.tree-panel` stops growing past ~22rem and scrolls internally.
- [x] Sibling topics appear in alphanumeric order (case-insensitive; numeric-aware).
- [x] Detail panel still shows Notes, Generate quiz, Documents, Add topic; Quiz history placeholder is visible without metrics.
- [x] Narrow viewport: capped tree still scrolls; layout stacks as today.
- [x] Client lint/build (or focused smoke) pass; no API/OpenAPI changes.

## Outcome notes
- `.tree-panel` uses `max-height: 22rem; overflow: auto`.
- `childrenByParent` sorts siblings with `localeCompare` (`numeric`, `sensitivity: "base"`).
- Quiz History scaffold after Generate quiz on `NodeDetails`.
- Client production build passes. Visual overflow/390px checks remain manual.

## Implementation notes
- Sort: `client-webApp/src/features/content/topicTree.js` — `childrenByParent`.
- Height/scroll: `client-webApp/src/styles/app.css` — `.tree-panel`.
- Scaffold: `client-webApp/src/features/content/NodeDetails.jsx` (after Generate quiz).
