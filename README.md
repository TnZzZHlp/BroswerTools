# BroswerTools

Personal browser tools built with WXT, React, and TypeScript. The first feature is a global WebRTC privacy switch in the popup.

## WebRTC control

Protection is enabled by default and your choice is saved locally.

| Browser | Enabled behavior |
| --- | --- |
| Chrome / Chromium desktop 119+ | Restricts non-proxied UDP with `webRTCIPHandlingPolicy` and injects a best-effort blocker for `RTCPeerConnection` and its WebKit alias before scripts in eligible HTTP/HTTPS documents. Does **not** guarantee complete WebRTC disabling or no IP exposure. |
| Firefox desktop / Android | Sets `peerConnectionEnabled` to `false`, disabling WebRTC peer connections globally. Camera/microphone access itself is not disabled. |

Turning protection off clears only this extension's override. Browser settings, administrative policies, or other extensions may still restrict WebRTC. The popup reports whether this extension actually controls the setting, rather than only displaying the saved choice.

There are no site exceptions. Controls target regular browsing; private-window behavior is not guaranteed. Reload affected pages after changes; existing connections are not guaranteed to stop immediately.

Chrome's page blocker is persistently registered in the MAIN world at `document_start` for eligible documents and frames. It requires website access. Registration is not proof that a current page is covered: restricted browser pages, some frames, workers, recovered native references, and settings/navigation races can escape interception. Turning protection off removes future injection, but already patched pages remain blocked until reloaded.

Both browsers request `storage`, `privacy`, and `activeTab` to identify the website when opening the popup. Chrome additionally requests `scripting` and HTTP/HTTPS website access for page blocking and counters. There is no telemetry or external service.

The popup shows the current website and, on Chrome, the number of intercepted constructor calls in the current tab's accessible, still-loaded documents. It updates while the popup is open. Counts reset with document reloads and disappear when frames are removed; no site history is saved. A dash means unavailable, not zero. Firefox's global disable API exposes no interception events, so Firefox cannot report a count.

## Develop and build

Requires Node.js compatible with WXT and pnpm.

```sh
pnpm install
pnpm dev
pnpm dev:firefox
pnpm compile
pnpm build
pnpm build:firefox
```

- Chrome: load `.output/chrome-mv3/` as an unpacked extension from `chrome://extensions`.
- Firefox desktop: temporarily load `.output/firefox-mv2/manifest.json` from `about:debugging`. WXT defaults to Manifest V2 for Firefox.
- Firefox Android: use a compatible Firefox Android release and its supported signed add-on installation or development/debugging workflow. Desktop-style unpacked installation does not apply. Android runtime behavior still needs device verification.
- `pnpm zip` and `pnpm zip:firefox` produce browser-specific packages. Packaging alone does not sign a Firefox add-on.

## Structure

- `entrypoints/`: background bootstrap and popup UI.
- `features/webrtc/`: privacy adapter, page blocker and document counters, current-tab statistics, persisted preferences, serialized controller, messaging, hooks, and popup cards.
- `AGENTS.md`: project instructions and confirmed feature boundaries.

Type checking and production builds do not replace browser verification. Check first-install defaults, toggling, persistence after restart, competing extensions/policies, frame coverage, website-access restrictions, and Firefox Android behavior on real devices before relying on protection.
