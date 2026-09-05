# Indicia CLI

A command-line interface for [Indicia](https://indicia.app).

## Installation

```bash
npm install -g @indiciaosint/cli
# or
pnpm add -g @indiciaosint/cli
```

## Configuration

### Sign in (recommended)

```bash
indicia login
```

This starts a device-code flow: the CLI prints a link (and tries to open
your browser). Approve the request at [indicia.app/device](https://indicia.app/device),
and the CLI stores a token in `~/.config/indicia/credentials.json`.

Use the same web authorization-code flow with a localhost callback:

```bash
indicia login --browser
```

Sign out with `indicia logout`.

### API key

For CI and scripts, set an API key instead. It overrides a saved login:

```bash
export INDICIA_API_KEY="your-api-key"
```

Create a key at [indicia.app/dashboard/account](https://indicia.app/dashboard/account).

Optional environment variables:

```bash
export INDICIA_API_URL="https://api.indicia.app"
export INDICIA_AUTH_URL="https://indicia.app"
export INDICIA_CONFIG_DIR="$HOME/.config/indicia"
```

## Usage

### Get account info

```bash
indicia info
```

### List available searches

```bash
indicia list
```

### Run a search

```bash
indicia search socials/github octocat
indicia search infrastructure/ipinfo 1.1.1.1
indicia search intelligence/email user@example.com
```

### Multi-property searches

Searches that need more than one property expose each field as a flag:

```bash
indicia search intelligence/person --name "John Doe" --state CA
indicia search intelligence/address --address1 "123 Main St" --city "New York" --state NY --zip 10001
indicia search tools/crypto --address 0xdAC17F958D2ee523a2206206994597C13D831ec7 --network ethereum
indicia search tools/intelx --storage-id <id> --bucket leaks.public
indicia search tools/virustotal.download --id <file-id>
```

The `intelligence/person` and `intelligence/address` endpoints expect US state
abbreviations (e.g. `MD`, `NY`, `CA`).

### Arrays and nested objects in flags

Some endpoints require arrays or objects. `--param` accepts JSON literals, so you
can pass them without writing a full `--body`:

```bash
# Hudson Rock domain lookup
indicia search intelligence/hudsonrock bcps.org --type domain

# Web databases password search across multiple services
indicia search intelligence/web-dbs Kennygocrazyyy \
  --param services='["cloudsint","intelligencex.identityportal","leakcheck","snusbase"]' \
  --param leakCheckType=password \
  --param snusbaseType=password
```

For fields without a dedicated flag, or for advanced use, pass a raw JSON body:

```bash
indicia search tools/crypto --body '{"address":"0xdAC17F958D2ee523a2206206994597C13D831ec7","network":"ethereum"}'
```

### Media uploads

Image-based searches accept a file path for the `--media` flag. The CLI reads
the file and sends it as `multipart/form-data`:

```bash
indicia search intelligence/facial --media ./suspect.jpg
indicia search intelligence/geolocation --media ./photo.jpg --location-hint "NYC" --model enhanced
```

### Cost confirmation

By default `indicia search` shows the credit cost and asks for confirmation
before running. To skip the prompt, pass `--yes`:

```bash
indicia search socials/github octocat --yes
```

Non-interactive environments (for example, CI) print the cost and continue
without prompting.

### JSON output and file output

```bash
indicia search socials/github octocat --json
indicia search infrastructure/ipinfo 1.1.1.1 --output result.json
```

### Streaming searches

Searches that return Server-Sent Events are streamed to stderr as progress
updates and the final result is written to stdout:

```bash
indicia search socials/github octocat --json --no-stream-progress
```

## Exit codes

| Code | Meaning          |
|------|------------------|
| 0    | Success          |
| 1    | General error    |
| 2    | Invalid usage    |
| 3    | API error        |
| 4    | Configuration error (not authenticated) |

## Releasing

This package is published to npm as `@indiciaosint/cli`.

A daily `Regen` workflow (00:00 UTC, also `workflow_dispatch`) pulls
`https://api.indicia.app/openapi`, rewrites
`src/fallback-features.generated.ts`, and if the fallback changed (or regen
was forced) patch-bumps, tags `vX.Y.Z`, and publishes. Same shape as
[`@indiciaosint/sdk`](https://www.npmjs.com/package/@indiciaosint/sdk).

```bash
pnpm sync-fallback   # regenerate fallback features from live OpenAPI
```

Manual publish still works: `pnpm version [patch|minor|major] && git push --follow-tags`.
The `release.yml` workflow publishes when a `v*` tag or GitHub release is created.
