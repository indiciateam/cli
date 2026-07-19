# Indicia CLI

A command-line interface for [Indicia](https://indicia.app).

## Installation

```bash
npm install -g @indiciaosint/cli
# or
pnpm add -g @indiciaosint/cli
```

## Configuration

Set your Indicia API key:

```bash
export INDICIA_API_KEY="your-api-key"
```

You can create a key at [indicia.app/dashboard/account](https://indicia.app/dashboard/account).

Optionally override the API base URL:

```bash
export INDICIA_API_URL="https://api.indicia.app"
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

### Media uploads

Image-based searches accept a file path for the `--media` flag. The CLI reads the file and sends it as `multipart/form-data`:

```bash
indicia search intelligence/facial --media ./suspect.jpg
indicia search intelligence/geolocation --media ./photo.jpg --location-hint "NYC" --model enhanced
```

For fields without a dedicated flag, or for advanced use, pass `--param key=value` or a raw JSON body:

```bash
indicia search tools/crypto --param address=0xdAC17F958D2ee523a2206206994597C13D831ec7 --param network=ethereum
indicia search tools/crypto --body '{"address":"0xdAC17F958D2ee523a2206206994597C13D831ec7","network":"ethereum"}'
```

### Cost confirmation

By default `indicia search` shows the credit cost and asks for confirmation before running. To skip the prompt, pass `--yes`:

```bash
indicia search socials/github octocat --yes
```

Non-interactive environments (for example, CI) print the cost and continue without prompting.

### JSON output and file output

```bash
indicia search socials/github octocat --json
indicia search infrastructure/ipinfo 1.1.1.1 --output result.json
```

### Streaming searches

Searches that return Server-Sent Events are streamed to stderr as progress updates and the final result is written to stdout:

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
| 4    | Configuration error (missing API key) |

## Releasing

This package is published to npm as `@indiciaosint/cli`.

```bash
pnpm version [patch|minor|major]
git push --follow-tags
```

The GitHub Actions `release.yml` workflow publishes automatically when a `v*` tag is pushed.
