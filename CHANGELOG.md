# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-08-01

### Added

- `wayback` search: trace archived captures of a URL on the Wayback Machine, or read a specific capture (emails, secrets, subdomains, and other intelligence extracted from the archived page).
- `reddit` search: query the Arctic Shift and PullPush Reddit archives for a user's posts or comments, including deleted and removed content, with cursor pagination via `--before`.

## [0.3.0] - 2026-07-28

### Added

- `location-to-bssid` search: find nearby Wi-Fi access points for GPS coordinates or a free-text address.
- `wifi-network-map` search: geolocate Wi-Fi access points by BSSID.

## [0.2.1] - 2026-07-19

### Added

- Nested object request body fields are now flattened into individual CLI flags (e.g. `infrastructure/portscan --skip-ping`).
- Boolean body fields are exposed as toggle flags that do not require a value.
- `indicia list` now shows the actual CLI flag names instead of raw body field names.

### Fixed

- API responses that report an internal error as `{ status: 500, value: {} }` now render a clean message instead of raw JSON.

## [0.2.0] - 2026-07-19

### Added

- Search endpoints now expose every request body field as a CLI flag, including multi-property searches.
- `--param key=value` option for setting arbitrary body fields.
- `-y, --yes` option to skip the credit cost confirmation prompt.
- Credit cost confirmation before each search, using `/v1/pricing` and `/v1/info`.
- Dynamic feature list loaded from `https://api.indicia.app/openapi` with a static fallback.
- Multipart/form-data request support for media-based searches.
- Nested arrays and objects are now fully expanded in formatted terminal output.
- `--param` values that look like JSON arrays/objects/numbers/booleans are parsed automatically.
- `search --help` only shows flags for the requested feature, keeping the default help uncluttered.

### Changed

- CLI descriptions and documentation now describe the tool as a CLI without alluding to specific use cases.

### Fixed

- API error objects are no longer rendered as `[object Object]`.
- Multipart file uploads now include the correct MIME type based on file extension.
- Streaming endpoints that emit a terminal data-only event now surface the final `data` payload correctly.

## [0.1.0] - 2026-07-19

### Added

- Initial release of `indicia-cli`.
- `indicia info` command for account/key metadata.
- `indicia list` command to enumerate available searches.
- `indicia search <feature> [query]` command supporting intelligence, socials, infrastructure, and tools endpoints.
- Streaming Server-Sent Events support for socials searches.
- JSON output (`--json`), file output (`--output`), and raw body support (`--body`).
- Agent skill at `.agents/skills/indicia-cli/SKILL.md`.
