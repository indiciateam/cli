import { createRequire } from 'node:module';
import { Command } from 'commander';
import { infoCommand } from './commands/info.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { ConfigError, loadConfig } from './config.js';
import { type Feature, findFeature, kebabCase } from './features.js';
import { writeError } from './output.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as {
  version: string;
  description: string;
};

const BOOLEAN_BASE_OPTIONS = new Set([
  '-j',
  '--json',
  '-y',
  '--yes',
  '-q',
  '--quiet',
  '--stream-progress',
  '--no-stream-progress',
  '-h',
  '--help',
]);

const VALUE_BASE_OPTIONS = new Set([
  '-b',
  '--body',
  '-p',
  '--param',
  '-o',
  '--output',
]);

function collect(value: string, previous: string[]): string[] {
  previous.push(value);
  return previous;
}

function featureHelpIntro(features: Feature[], argv: string[]): string {
  const featureInput = extractFeatureArg(argv);
  if (!featureInput) {
    return '\nRun `indicia search <category>/<name> --help` to see feature-specific flags.';
  }

  const feature = findFeature(features, featureInput);
  if (!feature) {
    return `\nUnknown search: ${featureInput}`;
  }

  return `\nFeature-specific flags for ${feature.category}/${feature.name}:`;
}

function extractFeatureArg(argv: string[]): string | undefined {
  const searchIndex = argv.findIndex(
    arg => arg === 'search' || arg.endsWith('/search'),
  );
  if (searchIndex === -1) return undefined;

  const afterSearch = argv.slice(searchIndex + 1);
  for (let i = 0; i < afterSearch.length; i++) {
    const arg = afterSearch[i];
    if (BOOLEAN_BASE_OPTIONS.has(arg)) {
      continue;
    }
    if (VALUE_BASE_OPTIONS.has(arg)) {
      if (!arg.includes('=') && afterSearch[i + 1] !== undefined) {
        i++;
      }
      continue;
    }
    if (!arg.startsWith('-')) {
      return arg;
    }
  }
  return undefined;
}

function registerFeatureOptions(search: Command, feature: Feature): void {
  const existing = new Set(search.options.map(o => o.long));
  for (const field of feature.bodyFields ?? []) {
    const flag = kebabCase(field);
    const long = `--${flag}`;
    if (existing.has(long)) continue;
    const description =
      feature.flags?.[field]?.description ?? `Request body field: ${field}`;
    search.option(`${long} <value>`, description);
    existing.add(long);
  }
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
    .addHelpText('before', () => featureHelpIntro(features, process.argv))
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

  // If the user already supplied a feature, register only that feature's flags
  // so help stays uncluttered and values are parsed correctly.
  const activeFeatureInput = extractFeatureArg(process.argv);
  const activeFeature = activeFeatureInput
    ? findFeature(features, activeFeatureInput)
    : undefined;
  if (activeFeature) {
    registerFeatureOptions(search, activeFeature);
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
