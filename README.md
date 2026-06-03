# Memorize the Green Book

A local-first study tool for memorizing selected sections of the Army's Green Book:

- Army Values
- The Soldier's Creed
- Military time
- General orders
- Special orders
- Phonetic alphabet
- Army rank structure, with insignia images and pay grades

The app is a single-page Next.js website with Tailwind styling and client-side storage. Easy and Hard study modes share one attempt: Easy shows first-letter hints, while Hard keeps the same answers with less help. Answers are graded in the browser, corrections appear after submit, and the attempt can be cleared or retaken. If browser storage is unavailable, progress falls back silently to memory for the current open page.

Rank cards show the insignia and a plain visual description, then ask for both the rank name and pay grade. Rank names accept canonical titles or abbreviations, and pay grades accept forms like `E4` or `E-4`.

## Source Material

The study material is based on `TP600-4 The Soldiers Green Book_Aug 2025.pdf`, included in this repository.

## License

MIT
