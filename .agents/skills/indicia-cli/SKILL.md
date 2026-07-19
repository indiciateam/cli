---
name: indicia-cli
description: Use the Indicia CLI (`indicia`) to run searches against the Indicia API.
disable-model-invocation: false
---

# Indicia CLI

## Purpose

The Indicia CLI wraps the public Indicia API. It handles authentication, request routing, streaming Server-Sent Events, JSON output, and formatted terminal output.

## When to use

- Running a single Indicia search from the terminal.
- Any task where the user asks to "search Indicia", "run an Indicia lookup", or "use the Indicia CLI".

## Installation

Published as `@indiciaosint/cli`, binary name is `indicia`:

```bash
npm install -g @indiciaosint/cli
# or
pnpm add -g @indiciaosint/cli
```

After install, run commands with `indicia`.

## Configuration

Set the API key in the environment:

```bash
export INDICIA_API_KEY="your-api-key"
```

Create a key at https://indicia.app/dashboard/account.

Optional environment variables:

- `INDICIA_API_URL` — override the API base URL (default `https://api.indicia.app`).

## Core commands

### `indicia list`

List every available search module.

```bash
indicia list
```

Use `--json` for machine-readable output.

### `indicia info`

Health check and account information. Returns the authenticated user and current API key metadata.

```bash
indicia info
```

### `indicia search <feature> [query]`

Run a search. `<feature>` is written as `<category>/<name>`, for example:

```bash
indicia search socials/github octocat
indicia search infrastructure/ipinfo 1.1.1.1
indicia search intelligence/email user@example.com
indicia search socials/username octocat
```

#### Options

| Flag | Description |
|------|-------------|
| `--body '<json>'` | Send a raw JSON body. |
| `-p, --param <key=value>` | Set a body field (repeatable). |
| `-y, --yes` | Skip the credit cost confirmation prompt. |
| `-j, --json` | Emit JSON to stdout. |
| `-o, --output <file>` | Write JSON output to a file. |
| `-q, --quiet` | Suppress progress and info messages. |
| `--stream-progress` | Show SSE progress (default in an interactive terminal). |
| `--no-stream-progress` | Hide SSE progress. |

#### Feature-specific flags

Endpoints expose their body fields as CLI flags. Prefer flags over `--body`:

```bash
# Person search
indicia search intelligence/person --name "John Doe" --state CA

# Crypto address analysis
indicia search tools/crypto --address 0xdAC17F958D2ee523a2206206994597C13D831ec7 --network ethereum

# IntelX file retrieval
indicia search tools/intelx --storage-id <id> --bucket leaks.public

# VirusTotal download
indicia search tools/virustotal.download --id <file-id>
```

Use `--param key=value` or `--body` when no dedicated flag exists for a field.

### Media uploads

Image-based searches accept a file path for the `--media` flag. The CLI reads the file and sends it as `multipart/form-data`:

```bash
indicia search intelligence/facial --media ./suspect.jpg
indicia search intelligence/geolocation --media ./photo.jpg --location-hint "NYC" --model enhanced
```

## Streaming searches

Some endpoints (GitHub, Roblox, TikTok, Discord, and the v2 username search) stream Server-Sent Events. The CLI:

- Writes progress/status events to stderr.
- Writes the terminal `result` or `all` event to stdout (or the file specified by `--output`).
- Always exits non-zero if the stream emits an error event.

For deterministic output, combine `--json` with `--no-stream-progress`:

```bash
indicia search socials/github octocat --json --no-stream-progress
```

## Output contract

Successful non-streaming responses and terminal streaming events are wrapped as:

```json
{
  "success": true,
  "feature": "github",
  "category": "socials",
  "data": { ... }
}
```

Failures return:

```json
{
  "success": false,
  "error": "..."
}
```

Exit codes:

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Invalid usage / unknown feature |
| `3` | API error |
| `4` | Missing `INDICIA_API_KEY` |

## Notes

- Do not commit API keys. Keep `INDICIA_API_KEY` in environment variables or a secrets manager.
- The CLI performs searches that may return personal information. Only run searches the user has explicitly authorized.
- Each search consumes Indicia credits according to the user's plan and key permissions.
