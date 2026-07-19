# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
