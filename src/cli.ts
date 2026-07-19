import { createRequire } from 'node:module';
import { Command } from 'commander';
import { infoCommand } from './commands/info.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { ConfigError, loadConfig } from './config.js';
import { type Feature, kebabCase } from './features.js';
import { writeError } from './output.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as {
  version: string;
  description: string;
};

const RESERVED_SEARCH_OPTIONS = new Set([
  'body',
  'param',
  'yes',
  'json',
  'output',
  'quiet',
  'streamProgress',
  'noStreamProgress',
]);

function collect(value: string, previous: string[]): string[] {
  previous.push(value);
  return previous;
}

export function buildCli(features: Feature[]): Command {
  const program = new Command('indicia')
    .description('Indicia CLI')
    .version(pkg.version, '-v, --version', 'Display version')
    .configureOutput({ writeErr: str => writeError(str.trimEnd()) })
    .exitOverride();

  program
    .command('info')
    .description('Get information about the authenticated user and API key')
    .option('-j, --json', 'Output as JSON')
    .option('-q, --quiet', 'Suppress non-essential output')
    .action(async options => {
      ensureConfig();
      await infoCommand(options);
    });

  program
    .command('list')
    .description('List available Indicia searches')
    .option('-j, --json', 'Output as JSON')
    .action(async options => {
      await listCommand(features, options);
    });

  const search = program
    .command('search <feature> [query]')
    .description('Run an Indicia search')
    .option('-b, --body <json>', 'Pass a raw JSON request body')
    .option(
      '-p, --param <key=value>',
      'Set a body field (can be repeated)',
      collect,
      [],
    )
    .option('-y, --yes', 'Skip the cost confirmation prompt')
    .option('-j, --json', 'Output as JSON')
    .option('-o, --output <file>', 'Write output to a file')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option(
      '--stream-progress',
      'Show streaming progress (default in terminal)',
    )
    .option('--no-stream-progress', 'Hide streaming progress');

  // Expose every known body field as a CLI flag so multi-property searches
  // work without forcing users to hand-write JSON.
  const dynamicFields = new Set<string>();
  for (const feature of features) {
    for (const field of feature.bodyFields ?? []) {
      dynamicFields.add(field);
    }
  }
  for (const field of dynamicFields) {
    const flag = kebabCase(field);
    if (RESERVED_SEARCH_OPTIONS.has(field)) continue;
    search.option(`--${flag} <value>`, `Request body field: ${field}`);
  }

  search.action(async (feature, query, options) => {
    ensureConfig();
    await searchCommand(features, feature, query, options);
  });

  return program;
}

function ensureConfig(): void {
  try {
    loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) {
      writeError(err.message);
      process.exit(4);
    }
    throw err;
  }
}
