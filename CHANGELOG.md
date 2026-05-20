# Changelog

All notable changes to **Pipecat AI Prebuilt** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Package rename note

This project was previously published as `pipecat-ai-small-webrtc-prebuilt`.
That package is now end-of-life, and its final release was `2.5.0`.

The current package is `pipecat-ai-prebuilt`. Its first release was `1.0.0`.
Users should install:

```bash
pip install pipecat-ai-prebuilt
```

## [1.0.1] - 2026-05-20

### Changed

- Moved the transport selector into the console header and updated it to use
  the `voice-ui-kit` Select component.
- Restored the Pipecat logo next to the header title and refined header spacing.

## [1.0.0] - 2026-05-14

### Changed

- Renamed the package from `pipecat-ai-small-webrtc-prebuilt` to
  `pipecat-ai-prebuilt`.
- Expanded the prebuilt client from Small WebRTC-specific support to support
  all Pipecat transports.
- Renamed the Python package module from `small_webrtc_prebuilt` to
  `pipecat_ai_prebuilt`.
- Updated project metadata, README, publishing workflows, test app, and local
  build tooling for the new package name.
- Added `scripts/local_build.sh` for local package builds.

## Legacy `pipecat-ai-small-webrtc-prebuilt` history

The following releases belong to the old `pipecat-ai-small-webrtc-prebuilt`
package line and are kept for historical reference.

## [2.5.0] - 2026-04-22

### Changed

- Updated client dependencies to:
  - `voice-ui-kit` to `0.8.2`
  - `@pipecat-ai/client-js` to `1.7.0`
  - `@pipecat-ai/client-react` to `1.2.1`

  The update to `voice-ui-kit` improves conversation karaoke highlighting 
  and optimizes the conversation rendering.

## [2.4.0] - 2026-03-13

### Changed

- Updated client dependencies to:
  - `voice-ui-kit` to `0.8.1`
  - `@pipecat-ai/client-js` to `1.6.1`
  - `@pipecat-ai/client-react` to `1.2.0`

  The update to `voice-ui-kit` improves conversation turn detection and karaoke
  highlighting and optimizes the conversation rendering.

## [2.3.0] - 2026-02-25

### Changed

- Update to `voice-ui-kit` 0.8.0, which adds support for function call status
  information in the ConversationPanel.

## [2.2.0] - 2026-02-13

### Changed

- Updated client SDK dependency versions to latest @pipecat-ai versions.

### Fixed

- Fixed an issue where reconnecting after a disconnect was not possible. The page had to be reloaded.

## [2.1.0] - 2026-02-05

### Changed

- Update to `voice-ui-kit` 0.7.1, which introduces support for the
  `bot-output` event. Now the conversation panel displays text optimally for
  configured TTS service.

## [2.0.4] - 2025-12-30

### Changed

- Updated client SDK dependency versions to latest @pipecat-ai versions.

### Fixed

- Resolved an issue where output audio devices could not be changed.

## [2.0.3] - 2025-12-30 (Unpublished)

Internal release for testing workflows.

## [2.0.2] - 2025-12-30 (Unpublished)

Internal release for testing workflows.

## [2.0.1] - 2025-12-30 (Unpublished)

Internal release for testing workflows.

## [2.0.0] - 2025-11-30

### Changed

- Refactor the client to use the voice-ui-kit's `startBotParams`.

- Updated client SDK dependency versions to latest `@pipecat-ai` versions.

## `pipecat-ai-small-webrtc-prebuilt` [1.0.0] - 2025-07-25

### Changed

- Migrated client SDK dependency versions to 1.x.x.

### Fixed

- Fixed a CSS issue where the top bar was missing margin. Also, added border
  radius to the bot and debug containers.

## [0.7.0] - 2025-05-28

- Added `User transcript` to text chat so both User spoken and User typed messages appear in chat.

## [0.6.3] - 2025-05-23

- Added text chat UI. Toggle on by setting "bot-text-container" `div` and "input-area" `form` CSS to `display: flex`.

## [0.5.0] - 2025-04-11

### Added

- Bumping to use version `0.0.3` of `@pipecat-ai/small-webrtc-transport`.
  - [Changelog]().

## [0.4.0] - 2025-04-10

### Added

- Bumping to use version `0.0.2` of `@pipecat-ai/small-webrtc-transport`.
  - [Changelog](https://github.com/pipecat-ai/pipecat-client-web-transports/blob/main/transports/small-webrtc-transport/CHANGELOG.md#002---2025-04-10).

### Fixed

- Fixed issue where we were reconnecting after changing the audio or video device.

## [0.3.0] - 2025-04-10

### Fixed

- Check resolution when track is active to determine visualizer visibility.

## [0.2.0] - 2025-04-09

### Added

- Improved the README with instructions on how to use it.

## [0.1.0] - 2025-04-09

### Added

- A simple, ready-to-use prebuilt client supporting all Pipecat transports.
  This prebuilt client provides a lightweight UI to quickly verify transport
  behavior without needing a custom implementation.
