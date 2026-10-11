# Preschool player and picture questions
Task ID: little-explorer
Stage: external review
Branch/worktree: codex/little-explorer, .worktrees/little-explorer
Base: origin/main d4323d3 (PR #1 merged, Greptile passed)

## Outcome and scope
Main menu player picker: Nya (age 7, existing arithmetic) and Ariana (age 3). Younger mode cycles counting 1–5, number-word-to-object groups, shapes, colors and simple AB repeating patterns. Three large visual choices, optional browser spoken prompts, untimed interaction. Existing 3D crossing and heart/recovery rules remain. Separate progress per player, preserving the original Nya save key and arithmetic choices. No accounts, remote assets or gameplay difficulty redesign.

## Acceptance criteria
- Player picker visibly changes practice settings and routes both checkpoint and rescue questions to correct generator; switching back restores Nya math choices.
- Preschool questions cover all five requested skills with valid unique answers, 1–5 object counts, no automatic difficulty growth and unambiguous AB patterns.
- Picture choices, readable labels, keyboard focus, responsive touch targets and Hear question action support adult-assisted/non-reading play. Speech unavailability and mute handled without preventing answering.
- Existing save migrates as Nya; both players retain independent score, character and last settings. Invalid player preference falls back safely; storage failure permits play.
- Correct/incorrect preschool responses, feedback, continuation, pause/replay and arithmetic regressions verified.
- Unit, syntax/local asset and browser checks pass; screenshots inspected on desktop/mobile.

## Plan and design
Preserve meadow palette, rounded typography and existing UI. Add two friendly name-and-avatar buttons before practice choices. Preschool practice summary replaces arithmetic controls and difficulty, showing the five included skills. Use local SVG illustrations for apples, simple shapes and color swatches; three picture choices in quiz. Browser speech is optional, explicit and respects mute. Separate generation and visual rendering from app orchestration. Use native worktree from freshly fetched origin/main because original worktree has unrelated handoff edits.

## Progress and evidence
Inspected current app, save service and tests. New branch from merged main; previous local work preserved. Preview uses port 8175; Playwright owns 8176. No merge/deployment authorized. Previous authorization to push for Greptile review persists for this project workflow.

## Implemented and first verification
User confirmed names: Nya (7), Ariana (3). Implemented named player picker, independent save keys, bounded picture-question generator, optional explicit speech and responsive quiz/menu layout. Initial test run: 18 unit tests and 9 browser journeys passed. Screenshot inspection covered both menu layouts, counting, patterns and mobile incorrect-answer feedback. Added late speech-error handling after that run; final factory verification follows. Speech is mocked in automation, actual device voices remain untested.

## Handoff
Branch codex/little-explorer from d4323d3; checkout .worktrees/little-explorer. All edits scoped to index/style, save/app services, preschool module, tests, README and this task. Preview port 8175; browser checks own 8176. Next: final factory checks, commit, push and open PR for required Greptile review using existing workflow authorization; resolve valid findings. No merge/deployment authorization.

## Final local review
Factory run evidence/20261011T143741533982Z-6c6d0dd8/results.json passed all checks. Subsequent profile review found that a second tab changing the remembered player could redirect an active run's score into the other player's save. Added a reproducing regression test and cached initial player selection per tab; focused tests and final committed-revision checks follow. Preview now serves this branch on the original port 8175, preserving the local origin.

## Acceptance evidence and final verification
Committed revision 6338b71 passed factory run evidence/20261011T143957839536Z-2a862142/results.json: 19 unit tests, 9 Playwright browser journeys, JavaScript syntax and local-asset checks. No workspace mutation during checks. Screenshots copied into the evidence folder: menus desktop/mobile, Ariana counting/pattern, mobile correction. Original 3D menu captured as before-menu.png when available.
- Player routing/settings/progress: browser player-switching + legacy-save tests, profiles.test.js isolation/reload/corruption/storage-blocked/cross-tab tests.
- Five skills and 1–5 bounds: preschool.test.js 500-cycle validation and arithmetic/pattern checks; browser answers all five skills from rendered prompts/pictures.
- Correct/wrong feedback, recovery/replay: preschool browser suite, plus original Nya flow and model regression suites.
- Speech: mock verifies spoken prompts, unavailable/muted fallback, and late-error-after-close behavior. Actual audio/voice quality not manually tested.
- Responsive UX: Chrome desktop 1440x900/mobile 390x844 screenshots inspected; three large answer targets and continue button visible. Physical devices and Safari/Firefox untested.
No production merge/deployment performed. Preview serves this worktree on 8175. Repository main has an automatic deployment workflow, so merging would publish and is outside this task's current authorization.

## Review submission
Pushed codex/little-explorer and opened https://github.com/Tpizz23/Nya-s-Crossy-Math/pull/2. Greptile Review confirmed IN_PROGRESS for tested commit 6338b716190afde18efdbeea4d96ca7745de9e2e. Required external review is pending; next action is reading and triaging the completed review. Only local task/review records changed after commit.

## Greptile P2 follow-up
User requested fixing speech cancellation test coverage. Added a recording speech mock and assertions for cancellation after correct/incorrect answers, close, and hidden tab, plus exact feedback narration. Changes are confined to browser tests and factory records; production speech behavior already implements the requested paths. Run focused speech tests and all required factory checks, then push the reviewed branch for iteration 2. No merge/deployment.
