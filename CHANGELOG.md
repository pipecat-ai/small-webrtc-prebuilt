# Changelog

All notable changes to **SmallWebRTC Prebuilt** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- Updated client SDK dependency versions to latest @pipecat-ai versions.

## [1.0.0] - 2025-07-25

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

- A simple, ready-to-use client for testing the **SmallWebRTCTransport**.
  This prebuilt client provides basic WebRTC functionality and serves as a lightweight tool
  to quickly verify transport behavior without needing a custom implementation.
