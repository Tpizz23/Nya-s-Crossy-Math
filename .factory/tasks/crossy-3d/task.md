# Build a 3D math crossing adventure
Task ID: crossy-3d
Stage: verify / external review pending
Owner/harness: Codex desktop
Branch: codex/crossy-3d, base c00b808c555d20d50e1fb00d31d2d2f7afcbd837
Checkout: Nya-s-Crossy-Math/.worktrees/crossy-3d

## Outcome and scope
Replace flat emoji gameplay with a genuine Three.js miniature 3D landscape and accessible HTML game controls. Preserve all four math operations, difficulties, save key, scores and 30 character unlocks. Static hosting stays supported. No publishing or account changes.

## Acceptance criteria
1. Actual lit 3D geometry: terrain, character, cars, logs, trees and rail crossing, verified in desktop/mobile screenshots.
2. Responsive keyboard, tap/swipe and button controls; hopping, bounded camera follow and no forced scrolling. Pause freezes simulation and tab hiding pauses. Browser tests.
3. Roads collide, logs carry player, trains warn before arrival. Quizzes freeze action, correct responses reward points, wrong responses cost one heart; safe recovery and game over work. Model and browser tests.
4. New-distance scoring cannot be farmed by backtracking. Difficulty and world object count are bounded. Unit tests.
5. Existing saves and character unlock thresholds persist; all math modes produce valid unique choices. Unit and browser tests.
6. Static site runs without runtime CDN requests. Syntax, asset validation, automated tests, runtime console and responsive checks pass.

## Design and plan
Miniature woodland toy aesthetic. Sky #d9edf0, meadow #aaca72, forest #244d43, river #59b9ce, butter #ffe09b, coral #ec8967. Rounded heavy system typography; broad 3D world as the main visual with a left-aligned title and compact setup panel. During play, only score, hearts, pause, hints and directional controls. Geometry provides the visual identity instead of decorative cards.
Separate deterministic gameplay model, Three.js renderer and DOM interface. Existing data/save/sound are retained; math generator becomes independent of Phaser. Vendor the pinned Three.js runtime for static hosting. Test model separately and full user journeys in Playwright.

## Before evidence
GitHub baseline is Phaser 3, 400x600 canvas, emoji sprites and forced scrolling. Inspected GameScene: repeated forward movement earns points; water drift and column state diverge. Screenshot: /tmp/nya-before.png. Browser baseline depends on remote Phaser CDN.

## Progress
Factory installed and isolated worktree created. Source cloned separately to preserve older non-Git parent workspace. Implementation and local review finished. Initial factory verification passed all 3 checks (10 unit tests and 4 browser journeys). Final committed-revision verification is next.

## Handoff
Ports: 8174 baseline, 8175 implementation. No remote writes authorized. Configured Greptile review will remain pending if no connected service/PR is available.


## Acceptance evidence
1. Desktop/mobile images in test-results/ show real shaded 3D terrain, frog, vehicles, logs and rails. Final river flicker fix visually confirmed.
2. Browser suite verifies keyboard and pointer gestures, on-screen buttons, pause/resume; model tests verify freeze behavior. Manual desktop rendering has no console errors.
3. Model tests exercise collisions, log carry, warning-before-train, rescue and lives; browser journeys exercise correct/wrong answers and three-heart game over.
4. Model tests verify no repeated-distance scoring and <=23 lanes through 1,000 generated rows, with speed capped at 1.7 tiles/sec.
5. Tests sample 3,200 math problems across all operations/difficulties, check legacy data and invalid-save fallback; browser tests verify character selection and saved progress after reload.
6. Initial factory run: evidence/20260918T212323022840Z-0b66b8e7/results.json (passed). Runtime request check confirms no external dependencies. npm audit reported zero vulnerabilities.

## Environment and delivery status
Node 22.23.0, Python 3.13.2, Three.js 0.180.0, Playwright 1.55.1; installed Google Chrome used in headless tests. Browser launch requires sandbox escalation in this Codex environment; approval succeeded. Test server 8176 is owned by Playwright and stopped after each run. Interactive preview remains on 8175.
Next action after final local verification: obtain authorization to push codex/crossy-3d and open a PR; confirm Greptile repository connection and obtain review. No remote write or deployment performed. See review.md and pr-body.md. Physical mobile devices, Safari and Firefox have not been exercised; mobile evidence is Chrome viewport emulation. Stylized shared block bodies preserve 30 unlock identities with color/accessory variants, not 30 bespoke detailed sculptures.
