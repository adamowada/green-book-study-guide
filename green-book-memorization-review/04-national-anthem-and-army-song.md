# National Anthem and Army Song

This combines four related red-star markers into one review destination while preserving their separate source headings and test units.

- `10-1. The National Anthem`: PDF pages 157-158 (printed pages 151-152).
- `The Star-Spangled Banner`: PDF page 158 (printed page 152).
- `10-2. The Army Song` background paragraph: PDF page 158 (printed page 152).
- `Army Song` lyrics: PDF page 159 (printed page 153).

## Complete Green Book sections

### 10-1. The National Anthem

Written by Francis Scott Key in 1814, the Star Spangled Banner was played at military occasions ordered by President Woodrow Wilson in 1916, and in 1931 was designated as our national anthem by an Act of Congress.

The Star-Spangled Banner is the timeless rendition of our sacred American Flag and country's patriotic spirit.

### The Star-Spangled Banner

Oh, say, can you see, by the dawn's early light,

What so proudly we hailed at the twilight's last gleaming?

Whose broad stripes and bright stars, thro' the perilous fight'

O'er the ramparts we watched were so gallantly streaming.

And the rockets’ red glare, the bombs bursting in air, gave proof through the night that our flag was still there. Oh, say, does that Star-Spangled Banner yet wave

O'er the land of the free and the home of the brave?

### 10-2. The Army Song

The Army Song tells the heroic story of our past, present, and future. It was originally written by First Lieutenant Edmund L. Gruber, a Field Artillery officer, in 1908 and it was adopted in 1952 as the official song of our Army. As a time-honored tradition, the song is played at the conclusion of every U.S. Army ceremony in which all Soldiers are expected to stand and proudly sing the lyrics.

### Army Song

March along, sing our song, with the Army of the free.

Count the brave, count the true, who have fought to victory.

We're the Army and proud of our name! We're the Army and proudly proclaim.

First to fight for the right, And to build the Nation's might, And The Army Goes Rolling Along.

Proud of all we have done, Fighting till the battle's won, And the Army Goes Rolling Along.

Then it's Hi! Hi! Hey! The Army's on its way. Count off the cadence loud and strong.

For where e'er we go, you will always know, That The Army Goes Rolling Along.

## Source transcription notes

- The Green Book visibly prints `thro' the perilous fight'`, including the final apostrophe where a comma would normally appear.
- It prints `rockets’ red glare` with the apostrophe after the `s`.
- These source punctuation oddities should remain visible in Review but disappear under punctuation-insensitive grading.

## Proposed combined UI

Use one navigation section named `National Anthem & Army Song`, containing two stacked subsections. Each subsection has `Background` and `Lyrics` groups, so the four source stars become one uncluttered destination without blending the two works together.

### Background fields

Test atomic facts rather than requiring the explanatory prose verbatim:

- National Anthem: author; 1814; President Woodrow Wilson's 1916 military-occasion order; the 1931 Act of Congress; and what the anthem represents.
- Army Song: what its story covers; First Lieutenant Edmund L. Gruber and Field Artillery; 1908; adoption in 1952; and the ceremony protocol.

Use short text, person, and year inputs. Normalize titles (`First Lieutenant`/`1LT`) only through explicit aliases. Require four digits for years.

### Lyric fields

- Use one multiline field per printed lyric block: six for the National Anthem and seven for the Army Song.
- Easy mode shows first-letter hints for the current block. Hard mode shows only a prompt such as `National Anthem - block 3`.
- Ignore case, punctuation, apostrophe style, whitespace, and physical line wrapping; otherwise require every word in order.
- Accept only documented lexical variants, including `thro'`/`through`, `O'er`/`over`, and the Green Book's `where e'er` alongside the [Army's official `where'er`](https://www.army.mil/values/song.html?s=2023). Do not use fuzzy matching or permit omitted/reordered words.
- Score each block separately and show the first missing or differing word after submission.
