import { createInterface } from 'node:readline/promises';
import type { SseEvent } from '../client.js';
import { getInfo, getPricing, search } from '../client.js';
import { type Feature, findFeature } from '../features.js';
import { type OutputOptions, writeError, writeOutput } from '../output.js';

export interface SearchCommandOptions extends OutputOptions {
  body?: string;
  param?: string[];
  yes?: boolean;
  streamProgress?: boolean;
  [key: string]: unknown;
}

export async function searchCommand(
  features: Feature[],
  featureInput: string,
  query: string | undefined,
  options: SearchCommandOptions,
): Promise<void> {
  const feature = findFeature(features, featureInput);
  if (!feature) {
    writeError(`Unknown search: ${featureInput}`);
    writeError('Run `indicia list` to see available searches.');
    process.exit(2);
  }

  let body: Record<string, unknown>;
  if (options.body) {
    try {
      body = JSON.parse(options.body) as Record<string, unknown>;
    } catch {
      writeError('Invalid JSON in --body');
      process.exit(2);
    }
  } else {
    body = buildBodyFromFlags(feature, query, options);
  }

  if (!options.yes) {
    await confirmSearch(feature, options);
  }

  const showProgress =
    options.streamProgress ??
    (!options.json && !options.output && !options.quiet);

  const result = await search({
    feature,
    body,
    onStreamEvent: showProgress ? makeStreamHandler(feature.name) : undefined,
  });

  if (!result.success) {
    writeOutput({ success: false, error: formatError(result.error) }, options);
    process.exit(3);
  }

  // Some streaming endpoints emit only `individual` events with no terminal
  // `result`/`all`. In that case, surface the collected events as the data.
  const data =
    result.data ??
    (result.events?.length
      ? result.events.map(e => ({
          event: e.event,
          data: e.data,
        }))
      : undefined);

  writeOutput(
    {
      success: true,
      feature: feature.name,
      category: feature.category,
      data,
      eventCount: result.events?.length,
    },
    options,
  );
}

function buildBodyFromFlags(
  feature: Feature,
  query: string | undefined,
  options: SearchCommandOptions,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  // Apply known flags.
  for (const field of feature.bodyFields ?? []) {
    const value = options[field];
    if (value !== undefined) {
      body[field] = value;
    }
  }

  // Apply explicit --param values (useful for fields with unusual names or
  // for overriding a flag).
  for (const raw of options.param ?? []) {
    const separator = raw.indexOf('=');
    if (separator === -1) {
      writeError(`Invalid --param value: ${raw} (expected key=value)`);
      process.exit(2);
    }
    const key = raw.slice(0, separator);
    const value = raw.slice(separator + 1);
    body[key] = value;
  }

  // Positional query maps to the first empty body field, falling back to a
  // generic `query` field.
  if (query !== undefined) {
    const primaryField =
      feature.bodyFields?.find(f => body[f] === undefined) ??
      feature.bodyFields?.[0] ??
      'query';
    if (body[primaryField] === undefined) {
      body[primaryField] = query;
    }
  }

  // Validate that we have at least one field.
  if (Object.keys(body).length === 0) {
    writeError(
      'Provide a query argument, feature-specific flags, or --param (see --help).',
    );
    process.exit(2);
  }

  return body;
}

function formatError(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error === null || error === undefined) return 'Unknown error';
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

async function confirmSearch(
  feature: Feature,
  options: SearchCommandOptions,
): Promise<void> {
  let cost: number | undefined;
  let tokens: number | undefined;

  try {
    const [pricing, info] = await Promise.all([getPricing(), getInfo()]);
    cost =
      feature.priceKey !== undefined
        ? pricing.prices[feature.priceKey]
        : undefined;
    tokens = (info as { user?: { tokens?: number } }).user?.tokens;
  } catch {
    // Pricing/info are best-effort. Continue without confirming if they fail.
    return;
  }

  const costText =
    cost !== undefined
      ? `${cost} credit${cost === 1 ? '' : 's'}`
      : 'an unknown amount of credits';
  const balanceText =
    tokens !== undefined
      ? `You have ${tokens} credit${tokens === 1 ? '' : 's'}`
      : 'Your balance is unavailable';

  if (!process.stdin.isTTY) {
    if (!options.quiet) {
      writeError(
        `This search costs ${costText}. ${balanceText}. ` +
          'Run with --yes to acknowledge.',
      );
    }
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(
      `This search costs ${costText}. ${balanceText}. Continue? [Y/n] `,
    );
    const normalized = answer.trim().toLowerCase();
    if (normalized && normalized !== 'y' && normalized !== 'yes') {
      writeError('Cancelled.');
      process.exit(0);
    }
  } finally {
    rl.close();
  }
}

function makeStreamHandler(featureName: string): (event: SseEvent) => void {
  return event => {
    if (event.event === 'status') {
      writeError(`[${featureName}] ${event.data}`);
      return;
    }
    if (event.event === 'heartbeat') {
      return;
    }
    if (event.event === 'individual') {
      const data = event.data as
        | { service?: string; exists?: boolean }
        | undefined;
      const service = data?.service ?? 'service';
      const status = data && 'exists' in data ? String(data.exists) : 'done';
      writeError(`[${featureName}] ${service}: ${status}`);
    }
  };
}
