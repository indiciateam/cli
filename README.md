# Indicia CLI

A command-line interface for [Indicia](https://indicia.app) OSINT searches. Built for automation, scripts, and agent workflows.

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

You can create an API key at [indicia.app/dashboard/account](https://indicia.app/dashboard/account).

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

### JSON output for automation

```bash
indicia search socials/github octocat --json
indicia search infrastructure/ipinfo 1.1.1.1 --output result.json
```

### Feature-specific flags

Tools and some endpoints expose their body fields as CLI flags:

```bash
indicia search tools/crypto --address 0xdAC17F958D2ee523a2206206994597C13D831ec7 --network ethereum
indicia search tools/intelx --storage-id <id> --bucket leaks.public
indicia search tools/virustotal.download --id <file-id>
```

For fields without a dedicated flag, or for advanced use, pass a raw JSON body:

```bash
indicia search tools/crypto --body '{"address":"0xdAC17F958D2ee523a2206206994597C13D831ec7","network":"ethereum"}'
```

### Streaming searches

Searches that return Server-Sent Events are streamed to stderr as progress updates and the final result is written to stdout:

```bash
indicia search socials/github octocat --json
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
