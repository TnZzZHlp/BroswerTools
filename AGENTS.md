# BroswerTools

## Purpose and confirmed scope

BroswerTools is a personal, modular browser extension. WebRTC privacy control is its first feature, not its entire identity. Preserve the spelling of the project name.

Target desktop Chrome, desktop Firefox, and Firefox for Android from the same WXT codebase. Use TypeScript, React, ESM, and WXT browser-specific builds. The primary UI is the extension popup.

## WebRTC behavior

- Use browser-level privacy controls on both browsers, plus best-effort page-script blocking on Chromium only.
- Enable protection by default on first installation and persist the user's choice locally.
- Firefox: set `privacy.network.peerConnectionEnabled` to `false` to disable peer connections globally. This does not disable camera/microphone capture itself.
- Chromium: set `privacy.network.webRTCIPHandlingPolicy` to `disable_non_proxied_udp` and register the packaged page blocker in the MAIN world at `document_start`. Neither layer guarantees complete WebRTC disabling or no IP exposure.
- Persist dynamic registration across browser sessions, target HTTP/HTTPS documents and all eligible frames, and use originating-frame matching for supported related documents. Chrome 119+ is required.
- Block `RTCPeerConnection` and its WebKit alias synchronously without awaiting storage or messages in the page. Keep the injected script unprivileged and self-contained.
- Count intercepted constructor calls in a document-local closure. Expose only a read-only count, and do not let metrics failure prevent constructor blocking. Metrics are best-effort page-context observations, not trusted security evidence.
- The popup reads counts from the current tab's accessible, still-loaded documents while open. New documents start at zero; removed frames lose their counts. Do not store browsing history or accumulate website statistics.
- Distinguish zero from unavailable counters. Firefox's browser-level disable API provides no interception events, so display unsupported statistics rather than zero.
- On disable, unregister only our script ID. Already patched documents remain patched until reload; do not attempt to restore native constructors or claim existing connections are closed.
- Registration status describes future permitted documents, not proven coverage of any current page. Account for withheld site access, browser-restricted pages, missing APIs, frame/worker blind spots, settings/navigation races, and recovered native references.
- No per-site exceptions, signaling, media capture, or external services are needed for this feature.
- On disable, clear only this extension's setting override. Do not force a browser default or restore a previously observed value by setting it again.
- Read `levelOfControl` before changing a setting. Report enterprise restrictions, competing extensions, unsupported APIs, and failures honestly.
- Distinguish saved user intent from the effective browser setting. Never display success solely because a preference was saved.
- Reconcile saved intent on installation, browser startup, and background initialization. Serialize mutations to avoid overlapping state changes.
- Do not promise to terminate existing connections. Ask users to reload affected pages after changing protection.
- The current implementation controls regular browsing settings only. Do not promise private-window protection without separate verification.

## Module boundaries

- `entrypoints/background.ts`: thin background bootstrap and message routing.
- `entrypoints/webrtc-blocker.ts`: thin Chromium-only unlisted script bootstrap, dynamically registered by the background.
- `entrypoints/popup/main.tsx`: thin React bootstrap.
- `entrypoints/popup/App.tsx`: thin popup composition; feature cards live in `features/webrtc/ui/`.
- `features/webrtc/`: settings persistence, browser privacy adapter, page blocker and registration lifecycle, document counters, current-tab statistics, reconciliation, typed messages, hooks, and feature cards.
- Add future tools in separate `features/<feature>/` modules; do not grow a monolithic background or popup component.
- `wxt.config.ts`: WXT modules and manifest metadata/permissions.
- `public/icon/`: packaged extension icons.
- `.wxt/` and `.output/`: generated files; never edit or commit them.

## Browser integration

Use `browser` from `wxt/browser` and capability checks. WXT's generated Chromium types may omit Firefox-only APIs; isolate narrow, runtime-checked Firefox typings in the privacy adapter rather than scattering casts.

Both browsers use `storage`, `privacy`, and `activeTab` (to identify the current website after opening the popup). Chromium additionally needs `scripting` and HTTP/HTTPS host permissions for page blocking and reading document counters. Do not ship the page blocker or its additional permissions in Firefox builds. Do not add browsing history, tabs, telemetry, or network requests without a confirmed requirement.

Keep all privileged mutations in the background. Validate message shape and sender before accepting commands. Handle promise rejections and expose actionable errors in the popup. Do not repeatedly fight settings controlled by another extension or policy.

## Development

Use pnpm and keep `pnpm-lock.yaml` in sync with `package.json`.

- `pnpm install`: install dependencies and generate WXT types via `postinstall`.
- `pnpm dev`: develop for Chrome.
- `pnpm dev:firefox`: develop for Firefox.
- `pnpm compile`: TypeScript validation.
- `pnpm build`: production Chrome build.
- `pnpm build:firefox`: production Firefox build.
- `pnpm zip` / `pnpm zip:firefox`: package browser-specific artifacts.

The TypeScript configuration inherits generated WXT defaults. Do not assume dependencies or generated files already exist in a fresh checkout. Keep the WXT-generated `@` alias rather than introducing a conflicting path mapping.

## Validation and change discipline

Run type checking and both browser builds after implementation changes. Build success does not establish runtime behavior on Firefox Android or real desktop browsers.

For privacy changes, manually check first-install defaults, persistence, restart reconciliation, toggling off and on, effective settings, policy/extension conflicts, unsupported APIs, and page reload behavior. For Chromium, also check early inline constructor calls, frame coverage, withheld website access, and registration cleanup. Report which checks were actually performed.

There is no project test runner. Do not add test infrastructure, mocks, dependencies, or CI without approval. Add only minimal necessary regression or high-risk logic tests if an existing test setup is introduced later.

Keep entrypoints thin, changes focused, UI labels concise, and all content free of emoji. Do not add explanatory comments, extra documentation, or unrelated cleanup unless requested. Never describe Chromium routing restrictions as complete WebRTC blocking.
