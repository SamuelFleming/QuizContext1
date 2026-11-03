# 9013 — Interim branding assets

**Status:** Done  
**Phase:** 9 (INT-facing polish, parallel to leftover 9011 checks)  
**Depends on:** None  
**Relevant scope:** Client presentation only; design tokens in `docs/design/01_design-concept.md`

## Objective
Replace leftover Vite scaffold branding (purple lightning-bolt favicon and unused social-icon sprite) with a replaceable QuizContext mark that matches Light Mint & Indigo, so the hosted app does not look like a default Vite starter.

## In scope
- Replace `client-webApp/public/favicon.svg` with the quiz-card-and-check mark from `client-webApp/public/A-quiz-card-check.svg` (indigo tile, white quiz card, mint check; palette hexes only).
- Add an opaque 180×180 `apple-touch-icon.png`.
- Update `index.html` with SVG favicon, PNG fallback, apple-touch icon, and `theme-color`.
- Delete unused `client-webApp/public/icons.svg`.
- Show the same small mark beside the QuizContext wordmark in the header, Auth, and Diagnostics eyebrows.
- Keep the mark interim and file-swappable; do not treat it as a locked brand.

## Out of scope
- Final logo, wordmark typography, marketing site, PWA manifest, Open Graph / social cards, dark-mode variants, theme picker, runtime or server-side icon generation.
- API, auth, Docker, or Caddy changes.

## Acceptance checks
- [x] Browser tab no longer shows the Vite lightning bolt after a hard refresh.
- [x] Favicon SVG is the quiz-card-and-check mark and uses only palette hexes (`#6366F1`, `#14B8A6`, `#FFFFFF`).
- [x] `apple-touch-icon.png` is 180×180 with an opaque background.
- [x] Header, login/register, and Diagnostics show the mark beside QuizContext.
- [x] Unused Vite `icons.svg` is removed.
- [x] Client production build passes. No OpenAPI change.

## Implementation notes
- Favicon stays at `/favicon.svg` so the existing link path still works. Cache-bust with `?v=2` after the mark swap.
- The chosen artwork is `A-quiz-card-check.svg`; `favicon.svg` is that same mark.
- Colour the SVG with hex values, not CSS variables (the file is loaded outside the theme).
- Replacing the two public files later is enough to change the mark.

## Outcome notes
- Interim mark is the quiz-card-and-check SVG (indigo tile, white card with two list rows, mint check) plus a matching opaque 180×180 PNG.
- Header, Auth, and Diagnostics share `BrandMark`. Unused Vite `icons.svg` is gone.
- Client production build passed. Browser check: login, Diagnostics, and signed-in dashboard header show the mark; `/favicon.svg` is the quiz-card-and-check SVG (no Vite purple). Hard-refresh recommended for cached tabs.
