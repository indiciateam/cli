#!/usr/bin/env node
import { CommanderError } from 'commander';
import { buildCli } from './cli.js';
import { writeError } from './output.js';

const cli = buildCli();

try {
  await cli.parseAsync(process.argv);
} catch (err) {
  if (err instanceof CommanderError) {
    // Help, version, and usage errors already printed by Commander.
    process.exit(err.exitCode ?? 1);
  }
  const message = err instanceof Error ? err.message : String(err);
  if (message) {
    writeError(message);
  }
  process.exit(1);
}
