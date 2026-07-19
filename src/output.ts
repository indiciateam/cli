import { writeFileSync } from 'node:fs';
import { formatResult } from './format.js';

export interface OutputOptions {
  json?: boolean;
  output?: string;
  quiet?: boolean;
}

export interface OutputPayload {
  success: boolean;
  feature?: string;
  category?: string;
  data?: unknown;
  error?: string;
  eventCount?: number;
}

export function writeOutput(
  payload: OutputPayload,
  options: OutputOptions,
): void {
  const text = options.json
    ? JSON.stringify(payload, null, 2)
    : formatForTerminal(payload);

  if (options.output) {
    writeFileSync(options.output, `${text}\n`, 'utf8');
    if (!options.quiet) {
      console.error(`Wrote output to ${options.output}`);
    }
    return;
  }

  console.log(text);
}

export function writeError(message: string): void {
  console.error(message);
}

function formatForTerminal(payload: OutputPayload): string {
  if (payload.error) {
    return `Error: ${payload.error}`;
  }

  if (payload.success && payload.feature && payload.category) {
    return formatResult(payload.feature, payload.category, payload.data);
  }

  return JSON.stringify(payload.data, null, 2);
}
