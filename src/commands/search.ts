import type { SseEvent } from '../client.js';
import { search } from '../client.js';
import { findFeature } from '../features.js';
import { type OutputOptions, writeError, writeOutput } from '../output.js';

export interface SearchCommandOptions extends OutputOptions {
  body?: string;
  streamProgress?: boolean;
  address?: string;
  network?: string;
  storageId?: string;
  bucket?: string;
  id?: string;
}

export async function searchCommand(
  featureInput: string,
  query: string | undefined,
  options: SearchCommandOptions,
): Promise<void> {
  const feature = findFeature(featureInput);
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

  const showProgress =
    options.streamProgress ??
    (!options.json && !options.output && !options.quiet);

  const result = await search({
    feature,
    body,
    onStreamEvent: showProgress ? makeStreamHandler(feature.name) : undefined,
  });

  if (!result.success) {
    writeOutput({ success: false, error: result.error }, options);
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
  feature: ReturnType<typeof findFeature> & {},
  query: string | undefined,
  options: SearchCommandOptions,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const flags = feature.flags ?? {};

  // Apply known flags.
  for (const [field, flag] of Object.entries(flags)) {
    const value = options[flag.name as keyof SearchCommandOptions];
    if (value !== undefined) {
      body[field] = value;
    }
  }

  // Positional query maps to the primary body field.
  if (query !== undefined) {
    const primaryField = feature.bodyFields?.[0] ?? 'query';
    if (body[primaryField] === undefined) {
      body[primaryField] = query;
    }
  }

  // Validate that we have at least one field.
  if (Object.keys(body).length === 0) {
    writeError(
      'Provide a query argument or use feature-specific flags (see --help).',
    );
    process.exit(2);
  }

  return body;
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
