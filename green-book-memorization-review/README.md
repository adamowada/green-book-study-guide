# Green Book Memorization Review

This folder contains the August 2025 Soldier's Green Book material that is marked for memorization but is not already tested by the app. It also records a proposed input and grading design for later implementation.

The red star is a strong memorization marker, but it is not an exhaustive content rule: the Army Values list has no red star in this edition and should remain in the app because Soldiers are still expected to know it.

## Source and transcription conventions

- Primary source: `TP600-4 The Soldiers Green Book_Aug 2025.pdf` in the project root.
- PDF page numbers below refer to the actual PDF index. The printed footer page is six pages lower in this portion of the book.
- Wording and capitalization are preserved. Routine apostrophe typography is normalized except where a source-specific oddity is called out; physical line wrapping is reflowed into readable Markdown.
- The review files include the complete starred section as reference text. A narrower proposed practice scope is called out separately where appropriate.

## Inventory

| Material | PDF pages | Current app coverage | Review file |
| --- | ---: | --- | --- |
| Army Values | 35-37 | Already tested, despite having no red star | Existing app content |
| Soldier's Creed | 38 | Already tested | Existing app content |
| Battle Buddy System | 43-45 | Missing | [01-battle-buddy-system.md](./01-battle-buddy-system.md) |
| BCT/OSUT/AIT Golden Rules | 47 | Missing | [02-bct-osut-ait-golden-rules.md](./02-bct-osut-ait-golden-rules.md) |
| Military Time | 59 | Already tested | Existing app content |
| General Orders and Special Orders | 61-62 | Already tested | Existing app content |
| Phonetic Alphabet | 64 | Already tested | Existing app content |
| Army Rank Structure | 94-99 | Already tested | Existing app content |
| Improper Relationships | 148 | Missing | [03-improper-relationships.md](./03-improper-relationships.md) |
| National Anthem and Army Song material | 157-159 | Missing | [04-national-anthem-and-army-song.md](./04-national-anthem-and-army-song.md) |
| Code of Conduct | 159-160 | Missing | [05-code-of-conduct.md](./05-code-of-conduct.md) |

The four related star markers for `The National Anthem`, `The Star-Spangled Banner`, the Army Song background, and the `Army Song` lyrics are intentionally combined into one review/app destination with distinct National Anthem and Army Song subsections.

## Shared input and grading contract

Easy and Hard should always use the same correctness rules. Easy may reveal first-letter hints or structural labels; Hard should remove those hints without becoming stricter.

1. Normalize Unicode apostrophes and dashes, case-fold, trim surrounding whitespace, and collapse repeated whitespace before grading.
2. For recitations, ignore punctuation and line-break differences but require the same words in the same order. Do not use fuzzy spelling, semantic similarity, or undocumented synonyms.
3. Accept lexical variants only when they are explicitly documented by an official source. Keep the Green Book wording as the displayed canonical correction.
4. Grade unnumbered lists by distinct recognized items so a learner is not penalized merely for recalling the bullets in a different order. Preserve pairing and order for numbered rules and articles.
5. Treat structured formats through small parsers rather than raw string equality. For example, military-time suffixes should be case-insensitive while colon-formatted civilian time remains invalid.
6. Show targeted feedback for each missing clause or subfield. Avoid turning a nearly correct long recital into one unexplained wall of red.
7. Keep explanatory source notes neutral and post-submit so they neither give away an answer nor imply that a learner using another official version was wrong.

Military time should follow the same presentation-variance rule: trim surrounding whitespace and accept the documented suffixes (`Z`, `hours`, and `hrs`) without case sensitivity, while still requiring the canonical four-digit time. Forms such as `14:00` should remain rejected unless the product deliberately adds them as taught formats.

Longer term, each field should declare an `inputKind` and `gradingProfile` instead of deriving behavior from its section ID. Useful profiles are `recitation`, `unordered-list`, `paired-rule`, `structured-facts`, `formatted-value`, and `composite-identification`.

## General Order 3 wording decision

The discrepancy is real:

- The [August 2025 Soldier's Green Book](https://adminpubs.tradoc.army.mil/pamphlets/TP600-4.pdf), paragraph 4-11, ends with `commander of relief`.
- [TC 3-22.6, Guard Duty](https://rdl.train.army.mil/catalog-ws/view/100.ATSC/4E331B92-38E9-4E79-96DE-DD65C598169A-1484743106809/tc3_22x6c1.pdf), the subject-specific Army publication, uses `Commander of the Relief`.
- The current [U.S. Army Blue Book, Volume 2](https://rdl.train.army.mil/catalog-ws/view/The-Profession/res/files/The-Army-Blue-Book-VOL2.pdf) and [Army Recruiting guard-duty material](https://recruiting.army.mil/Portals/15/Future-Soldier/Initial%20Soldier%20Training%20-%20Guard%20Duty.pdf?ver=2020-04-28-114701-147) also include `the`.

Recommended treatment:

- Keep the Green Book sentence as the canonical displayed answer.
- Add the complete `commander of the relief` sentence as an explicit accepted alias.
- Give both versions the same green `Correct` result.
- After submission, show this muted note beneath General Order 3:

> Wording note: Official Army publications use both “commander of relief” and “commander of the relief.” Both are accepted here; use the version your cadre teaches.

- Do not put this note in the red correction component and do not describe either official form as a mistake.
