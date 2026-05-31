# Green Book Memorizer Website Plan

## Summary

Build a single-page Next.js memorization tool using the existing Tailwind/Headless UI components and browser `localStorage` only. The app will support `easy` and `hard` modes, fixed Green Book sections, client-side grading, red corrections after submit, `Clear all`, and post-submit `Retake`.

Source material comes from `TP600-4 The Soldiers Green Book_Aug 2025.pdf`. Relevant PDF pages found: Army Values 35-38, Soldier's Creed 38, Military Time 58-59, General/Special Orders 61-62, Phonetic Alphabet 64, Rank Structure 94-99. Rank pages contain 28 extractable insignia images.

## Standing Workflow

After each implementation stage, add, commit, and push the completed work to `main`.

## Progress

- [x] Stage 1: Scaffold The App
- [x] Stage 2: Extract And Model Green Book Content
- [ ] Stage 3: Define Client State And Grading
- [ ] Stage 4: Build The Homepage UI
- [ ] Stage 5: Verification

## Stages

### 1. Scaffold The App

- Create a root-level Next.js App Router project with TypeScript, Tailwind CSS, ESLint, and no backend routes.
- Keep the existing root `components/` folder and import from it via `@/components/...`.
- Install required UI dependencies already implied by the components: `@headlessui/react`, `clsx`, `motion`, plus `lucide-react` for action icons.
- Configure Tailwind v4/PostCSS with `@import "tailwindcss";`, matching the included component syntax.

### 2. Extract And Model Green Book Content

- Add a one-time extraction workflow for the PDF:
  - Extract canonical text for the fixed sections into `lib/green-book-content.ts`.
  - Extract rank insignia images from PDF pages 94-99 into `public/ranks/`.
  - Save rank insignia as opaque white-backed PNGs so PDF transparency does not render as black artifacts.
  - Map each rank image to its canonical rank title and accepted aliases.
- Hard-code the final study data in TypeScript so the runtime app has no PDF dependency.
- Use line/phrase-level blanks:
  - Army Values: one field per value.
  - Soldier's Creed: one field per creed line/sentence.
  - Military Time: prompt with civilian time, user fills military time.
  - General Orders: one field per order.
  - Special Orders: one field for the definition.
  - Phonetic Alphabet: prompt with letter, user fills code word.
  - Rank Structure: show rank image only, user types the rank.

### 3. Define Client State And Grading

- Add core types for mode, study sections, study items, study fields, and stored study state.
- Store drafts in `localStorage` under a versioned key like `green-book-memorizer:v1`.
- Keep answer maps separate for `easy` and `hard` so switching modes does not leak answers.
- `Clear all`: clears both modes' answers and submission states, but keeps the selected mode.
- `Submit`: grades all fields in the active mode, marks inputs read-only, shows wrong corrections in red, and displays section/global scores.
- `Retake`: available only after submit; clears active-mode answers and grading state.
- Normalize grading case-insensitively and punctuation-insensitively:
  - Trim and collapse whitespace.
  - Ignore case.
  - Normalize curly quotes/dashes.
  - Ignore punctuation for rank answers.
  - Military time requires exact four digits.
  - Rank answers accept canonical title and common abbreviation aliases, with correction text showing the canonical title.

### 4. Build The Homepage UI

- Implement `app/page.tsx` as the only route and render a client-side `StudyApp`.
- Layout:
  - Compact header with title, mode segmented control, progress/score, and action buttons.
  - Desktop: sticky left section navigation plus main exercise area.
  - Mobile: top section selector or horizontal tabs, single-column exercise flow.
- Use included components for controls: `Button`, `Input`, `Textarea`, `Badge`, `Table`, `Heading`, `Text`, `Divider`, `Radio`/segmented mode controls.
- Style with a restrained Green Book-inspired palette: off-white/zinc surfaces, deep green accents, muted gold highlights, red correction states.
- Avoid a marketing landing page; the memorization tool is the first screen.

### 5. Verification

- Add unit tests for:
  - Normalization and punctuation-insensitive rank grading.
  - Military time exact matching.
  - Empty answers grading as incorrect.
  - `Clear all`, `Submit`, and `Retake` state transitions.
  - Separate easy/hard localStorage answer maps.
- Run `npm run lint` and `npm run build`.
- Verify responsive UI manually or with browser screenshots at mobile, tablet, and desktop widths.
- Confirm all rank images render, have useful alt text, and match their expected canonical rank.
