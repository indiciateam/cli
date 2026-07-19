import { createRequire } from 'node:module';
import { Command } from 'commander';
import { infoCommand } from './commands/info.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { ConfigError, loadConfig } from './config.js';
import { writeError } from './output.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as {
  version: string;
  description: string;
};

export function buildCli(): Command {
  const program = new Command('indicia')
    .description(pkg.description)
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
      await listCommand(options);
    });

  program
    .command('search <feature> [query]')
    .description('Run an Indicia search')
    .option('-b, --body <json>', 'Pass a raw JSON request body')
    .option('-j, --json', 'Output as JSON')
    .option('-o, --output <file>', 'Write output to a file')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option(
      '--stream-progress',
      'Show streaming progress (default in terminal)',
    )
    .option('--no-stream-progress', 'Hide streaming progress')
    .option('--address <address>', 'Cryptocurrency address (tools/crypto)')
    .option('--network <network>', 'Blockchain network (tools/crypto)')
    .option('--storage-id <id>', 'IntelX storage ID (tools/intelx)')
    .option('--bucket <bucket>', 'IntelX bucket (tools/intelx)')
    .option('--id <id>', 'VirusTotal file ID (tools/virustotal.download)')
    .action(async (feature, query, options) => {
      ensureConfig();
      await searchCommand(feature, query, options);
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
