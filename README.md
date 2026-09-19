# Nya's Crossy Math

A static, browser-based 3D math adventure. Hop through a miniature meadow, dodge traffic, ride logs and watch for trains. Solve addition, subtraction, multiplication or division questions to earn bonuses and recover from bumps. All 30 character unlocks and the existing `nya_math_game_save` progression remain supported on the same browser and origin.

## Play locally

```sh
python3 -m http.server 8175 --bind 127.0.0.1
```

Open http://127.0.0.1:8175. Use an HTTP server; ES modules do not work reliably when opening `index.html` as a file. No build or package installation is required to play. The pinned Three.js runtime is included in `vendor/` with its MIT license. WebGL is required; current desktop and mobile browsers are targeted.

- Arrow keys / WASD: hop in four directions.
- On-screen arrows, taps and swipes: touch controls.
- Escape or pause button: pause/resume. Switching tabs pauses automatically.
- Every five new rows: a math stop. Correct answers earn 25 points plus a capped streak bonus. A wrong answer costs one heart.
- Traffic or water: solve a rescue question, then return to the last grass checkpoint.
- Finish an adventure from the pause menu to bank its points. Three lost hearts also finish the run. Refreshing an unfinished run discards that run's points.

## Development and verification

```sh
npm ci
npm test
npm run check
npm run test:browser
```

Browser tests use an installed Google Chrome through Playwright, run against port 8176, and save screenshots to `test-results/`. Unit tests cover collisions, river drift, train warning timing, pause/quiz freezing, score farming, bounded terrain, arithmetic and save migration. `npm run vendor` refreshes checked-in runtime files from the exact pinned dependency.

## Architecture

- `src/model.js`: renderer-independent crossing simulation, lanes, collisions, score and recovery.
- `src/world.js`: Three.js orthographic world, shared geometry/materials, shadows and camera.
- `src/app.js`: accessible HTML menus, quiz, controls, sound and persistence integration.
- `js/data.js`, `js/math.js`, `js/save.js`, `js/sound.js`: retained game data and services.
- `js/scenes/`, `js/config.js`: original Phaser implementation retained as historical reference, no longer loaded.
- `.factory/`: project-local software-factory workflow, task records and verification configuration.

Terrain is limited to 23 rows and reuses box geometry and materials. Pixel ratio is capped at 1.75. Reduced-motion preference disables decorative home movement and hop elevation. The game uses keyboard-accessible HTML controls, but the visual crossing world is not a screen-reader-equivalent experience.

## Hosting

The existing nginx Docker setup still serves the project directly. Deploy `index.html`, `style.css`, `src/`, `js/` and `vendor/` together. No runtime CDN or API requests are needed. Keep the same origin to retain existing local progress. Saves are per browser, not cloud-synced. No deployment has been made by this change.
