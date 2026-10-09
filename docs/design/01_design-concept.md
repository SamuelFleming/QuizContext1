# QuizContext.io — Design Concept

**Status:** Visual source of truth
**Theme:** Light Mint & Indigo (current palette)
**Purpose:** Define frontend styling, layouts, components, and interactions for MVP development. Product behaviour stays in `docs/core-scope/`.

## 1. Visual Direction

QuizContext.io should feel like a modern, minimalist learning platform combining the functionality of a productivity application with the interactivity of a contemporary study tool.

**Design principles:**

* Light, airy, fresh, and academically focused.
* Clean layouts with generous spacing.
* Consistent cards, navigation, and typography.
* Subtle animations that improve interactivity.
* Functional, accessible, and responsive.

Avoid excessive decoration, heavy gamification, and unnecessarily complex components.

## 2. Colour Palette — Mint & Indigo

| Token            | Hex       | Usage                                      |
| ---------------- | --------- | ------------------------------------------ |
| Background       | `#F5FAFF` | Application background                     |
| Surface          | `#FFFFFF` | Cards and panels                           |
| Elevated Surface | `#E6F5F7` | Active panels and overlays                 |
| Border           | `#D7E5EC` | Separators and boundaries                  |
| Primary Accent   | `#6366F1` | Buttons, selection, progress               |
| Secondary Accent | `#14B8A6` | Links, secondary emphasis, mint highlights |
| Primary Text     | `#0F172A` | Headings and body text                     |
| Secondary Text   | `#64748B` | Descriptions and metadata                  |
| Success          | `#22C55E` | Correct answers and success                |
| Warning          | `#F59E0B` | Warnings and partial results               |
| Error            | `#EF4444` | Incorrect answers and errors               |

Implement colours as named tokens in a single client theme file (CSS variables). Components refer to those names and do not hard-code hex values. Light Mint & Indigo is the only palette the MVP ships. A later change, including a possible post-MVP setting where a user selects a palette, replaces or swaps that token set. The MVP does not include a theme picker.

Use the secondary accent and success colours for fills, borders, and icons. Body text and small labels use the text tokens, because those accent hex values are weak as small text on the light background.

## 3. Layout & Navigation

**Global layout:**

* Persistent top navigation bar: Dashboard, Subjects, Quizzes, Profile.
* Centred content containers with comfortable spacing.
* Consistent page headings, sections, and action placement.
* Responsive layouts supporting desktop and mobile.

**Content Workspace:**

* Two-column desktop layout.
* Left: expandable subject/topic navigation tree.
* Right: selected topic, Markdown editor/preview, and associated documents.
* Collapse topic navigation into a drawer on mobile.

**Quiz Player:**

* Focused layout with minimal distractions.
* One prominent question card at a time.
* Question progress indicator.
* Clear Previous/Next navigation.
* Large selectable answer cards and readable short-answer inputs.

## 4. Components & Styling

Prefer a small set of reusable UI components:

* Application shell and navigation.
* Cards and panels.
* Buttons and form inputs.
* Subject/topic navigation tree.
* Markdown editor and preview.
* Document cards.
* Quiz question and answer cards.
* Progress indicators.
* Result and feedback components.
* Loading, empty, and error states.

**Styling conventions:**

* Typography: Inter or similar modern sans-serif.
* Spacing: Consistent 8px-based scale.
* Border radius: Approximately 10–14px.
* Subtle borders and shadows.
* Consistent hover, selected, disabled, and focus states.

Avoid building a comprehensive component library before it is needed.

## 5. Motion & Interaction

Use lightweight animation to make interactions feel smooth and responsive.

| Interaction         | Behaviour                                   |
| ------------------- | ------------------------------------------- |
| Page entrance       | Fade in with slight upward movement         |
| Card entrance       | Subtle staggered fade/slide                 |
| Card hover          | Gentle border or surface highlight          |
| Button interaction  | Small colour/brightness transition          |
| Quiz navigation     | Horizontal slide and fade between questions |
| Answer selection    | Smooth border/background transition         |
| Progress indicators | Animated progress updates                   |
| Loading             | Subtle skeleton or progress state           |

**Timing:** Most transitions should take approximately 150–300ms.

Prefer CSS transitions and animations. Respect `prefers-reduced-motion`.

## 6. Screen-Specific Guidance

| Screen            | Design Emphasis                                                    |
| ----------------- | ------------------------------------------------------------------ |
| Dashboard         | Concise overview, subject cards, recent quizzes, quick actions     |
| Content Workspace | Clear hierarchy, readable Markdown, convenient document management |
| Quiz Generation   | Simple configuration with selectable context-mode cards            |
| Quiz Player       | Prominent questions, interactive answer cards, smooth transitions  |
| Quiz Results      | Clear scoring, informative feedback, source references             |
| Quiz Library      | Clean, searchable collection of saved quizzes                      |
| Settings          | Practical forms and secure API key configuration                   |

## 7. Implementation Principles

* Maintain consistent design tokens across all screens.
* Reuse components where functionality genuinely overlaps.
* Prioritise usability over decorative complexity.
* Ensure sufficient contrast and keyboard accessibility.
* Avoid copying CareerContext.io's visual identity.
* Use the design concept as guidance, not a rigid component specification.
* Allow incremental refinement as screens are implemented.

**Guiding objective:** Deliver a cohesive, modern learning application that feels approachable during content management and engaging during quiz completion.
