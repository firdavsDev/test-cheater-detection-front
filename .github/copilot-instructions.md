## Quick context for code-writing agents

This is a small Nuxt 3 app (Vue 3) for a "Test Cheater Detection" frontend. Key facts an agent needs right away:

- Package manager: `pnpm` (see `package.json` -> `packageManager`). Use `pnpm dev` / `pnpm build` / `pnpm preview` for local workflows.
- Framework: Nuxt 3. App entry: `app.vue`. Routes are in `pages/` (e.g. `pages/index.vue`, `pages/tests/[id].vue`).
- Styling: project uses a single custom stylesheet `assets/css/custom.css` (no Tailwind at runtime). Many components contain component-specific style blocks (see `pages/index.vue`).
- Face detection: uses `face-api.js` (dependency in `package.json`) with model files expected under `public/models/`.

## Big-picture architecture

- Pages (routes): `pages/*` contains the UI. `pages/tests/[id].vue` is the test runner page that wires up the video, canvas, and the face-tracking composable.
- Composables: `composables/` holds reusable logic. Important ones:
  - `composables/useFaceTracking.ts` — core client-side logic for loading models and tracking a live video stream. Look for: `loadModels()`, `startTracking(video, canvas)` and reactive refs `isCheating`, `lookAwayCount`.
  - `composables/useMockTests.ts` — mock test data provider used by `pages/index.vue`.
- Public assets: `public/models/` must contain `face-api.js` model files (e.g. `tiny_face_detector_model-weights_manifest.json`, corresponding shards).

## Developer workflows & commands (concrete)

- Install deps (preferred):
  ```bash
  pnpm install
  ```
- Dev server:
  ```bash
  pnpm dev
  # opens on http://localhost:3000 by default
  ```
- Production build / preview:
  ```bash
  pnpm build
  pnpm preview
  ```
- If you need to initialize Tailwind in other forks you might see `npx tailwindcss init -p`, but this project currently uses `assets/css/custom.css` and `nuxt.config.ts` already points to it.

## Integration points & important patterns

- face-api.js usage:
  - Models are loaded from `'/models'` inside `useFaceTracking.loadModels()` (so model files live under `public/models/`).
  - Detection is performed with `faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()`.
  - Detection loop is requestAnimationFrame-based inside `startTracking()`.
  - Config/thresholds are simple module-level constants in `useFaceTracking.ts`: `MAX_LOOK_AWAY`, `THRESHOLD`. The code increments `lookAwayCount` when the detected nose X deviates from the video center.

- Video wiring (where to look): `pages/tests/[id].vue` creates `<video ref="videoRef">` and `<canvas ref="canvasRef">`, calls `loadModels()` then, after stream start, calls `startTracking(videoRef.value, canvasRef.value)`.

## Project-specific conventions

- Style: project prefers a single `assets/css/custom.css` and component-level style definitions rather than a utility framework. When editing components, prefer adding or reusing classes in `assets/css/custom.css` or component `<style>` blocks.
- Composables: stateful behavior (reactive refs) is exported directly from composables and used in pages via import and function call (see `useFaceTracking` exports `isCheating`, `lookAwayCount`, `loadModels`, `startTracking`).
- Logging: the codebase uses verbose console logs in `useFaceTracking.ts` for runtime guidance; preserve or extend those when adding debugging behavior.

## Debugging tips (reproducible checks)

- If face detection fails:
  1. Verify model files are present: `ls public/models` should show the weight manifest and shards.
  2. Confirm `loadModels()` logs: look for `✅ Models loaded.` in the browser console.
  3. Verify video stream: browser console on `pages/tests/[id].vue` should show `📹 Video stream started` (this project logs that). If not, check `navigator.mediaDevices.getUserMedia` usage in the page.
  4. Add `console.log('Detection result:', result)` after `detectSingleFace(...)` to see `null` vs object.
  5. Ensure `video.videoWidth` / `video.videoHeight` are non-zero before detection (wait for `loadedmetadata` or `onplay`).

## Examples the agent can apply directly

- Loading + starting tracker (pseudo-example from current code):
  ```ts
  await loadModels() // loads from '/models'
  // after video stream starts
  startTracking(videoElement, canvasElement)
  ```

- Detection behavior to respect when editing: `isCheating` flips true when `lookAwayCount >= MAX_LOOK_AWAY` — do not remove this reactive contract unless replacing the whole detection policy. Tests/pages read `isCheating` to show modal/blocking behavior.

## Files to reference first

- `composables/useFaceTracking.ts` — main integration with face-api.js
- `pages/tests/[id].vue` — wiring of camera, canvas, and UI during a test
- `pages/index.vue` — example of data flow using `useMockTests` and presentational patterns
- `nuxt.config.ts` — global CSS includes
- `package.json` — scripts and dependency list (face-api.js is a key runtime dependency)

---
If any of these files are moved or models are served from a different path, reply with the new path and I will update these instructions. Ready to iterate — tell me if you want more strict rules (formatting, unit test patterns, or commit message prefixes) added.
