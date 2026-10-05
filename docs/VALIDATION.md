# Validation · 2026-10-05

Verified in browser:
- Recovered original mesh displays on first open using Canvas fallback (test browser disables WebGL).
- Two user-owned sample photos selected together populate all eight screen assignments.
- Direct screen hit opens image chooser; single-image selection replaces that screen.
- Drag rotates original mesh; reset returns to the opening angle.
- Shuffle changes photo assignments, keeping physical structure.
- Build opens a decoded PNG with naturalWidth 1200 and naturalHeight 1600.
- Without SDK, save shows browser instructions and never reports native success.
- 390×844 and 320×640 embedded test viewports show model, eight selectors and all three actions without horizontal clipping.

Automated checks:
- `npm run pack`: one root index.html; only allowed file types; relative resources; external scripts; all referenced files present; no network/Worker/eval calls in application bundle.
- No AgentRuntime dependencies. Each output file <2MiB and compressed ZIP <5MiB (conservative budgets).
- `node scripts/test-save.mjs`: mock success payloads, missing SDK fallback, missing temp API, invalid temp path, and rejected permission.

Not verified:
- Actual Xiaohongshu container JSBridge / real album permission.
- WebGL on iOS and Android (browser environment has GL disabled).
- Platform upload acceptance, review or publication.
- Low-end hardware performance and full EXIF-format/device matrix.

Browser QA used user-owned sample images; those photos and the preview screenshot are excluded from GitHub. QA photos, screenshots, source geometry and QA shell are NOT shipped in release ZIP. The production tool starts with empty screens. `scripts/preview-qa.mjs` generates a temporary QA page after build; `npm run pack` rebuilds dist and excludes it.
