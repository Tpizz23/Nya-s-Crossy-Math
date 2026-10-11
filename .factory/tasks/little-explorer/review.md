# Review: little-explorer
Status: awaiting submission
Provider: Greptile (required)
Iteration: 0

## Local review
- Existing original save key retained for Nya; Ariana uses an independent key, with validated player choice and fallback for blocked storage. Unit and browser tests cover isolation and persistence.
- Save outgoing arithmetic preferences before switching players so Nya's selected operation/difficulty are restored even without starting a run.
- Generate all five preschool skills at checkpoint/rescue stops; answer identity supports string IDs and preserves numeric arithmetic behavior.
- Keep preschool quantities bounded at 1–5 without distance-driven scaling. Three distinct choices and one correct answer verified across 500 generated questions.
- Cancel speech when answering, closing dialogs, muting or hiding the tab. Ignore cancellation errors and guard against late errors for detached dialogs. Mock browser test covers delayed speech failure after closing.
- Inspect desktop/mobile screenshots; numeral answers show a single large numeral, object groups render separate SVGs, pattern sequence and next-item slot fit mobile width.

- Pin player selection per tab so switching players in another tab cannot redirect an active run to the wrong save. Reproduced with a failing regression test, then fixed by caching the initial player selection.

## External review
Pending publication of the verified branch and a Greptile review for the submitted commit. No merge or deployment performed.
