import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { loadConfig } from './config.js';
import type { Feature } from './features.js';

export interface ApiError {
  status: number;
  statusText: string;
  body: unknown;
}

export class IndiciaApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? formatApiError((body as { error?: unknown }).error)
        : `${status} ${statusText}`;
    super(message);
    this.name = 'IndiciaApiError';
  }
}

function formatApiError(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error === null || error === undefined) return 'Unknown API error';
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export interface SearchOptions {
  feature: Feature;
  body: Record<string, unknown>;
  onStreamEvent?: (event: SseEvent) => void;
}

export interface SseEvent {
  id?: string;
  event?: string;
  data: unknown;
}

export interface SearchResult {
  success: boolean;
  data?: unknown;
  error?: string;
  events?: SseEvent[];
}

export interface PricingResponse {
  success: boolean;
  current: number;
  prices: Record<string, number>;
}

function getHeaders(): Record<string, string> {
  const { apiKey } = loadConfig();
  return {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    accept: 'application/json, text/event-stream',
  };
}

function getBaseUrl(): string {
  const { baseUrl } = loadConfig();
  return baseUrl.replace(/\/$/, '');
}

export async function getInfo(): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}/v1/info`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return parseResponse(res);
}

export async function getPricing(): Promise<PricingResponse> {
  const res = await fetch(`${getBaseUrl()}/v1/pricing`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return parseResponse(res) as Promise<PricingResponse>;
}

export async function search(options: SearchOptions): Promise<SearchResult> {
  const { feature, body, onStreamEvent } = options;
  const isMultipart = feature.contentType === 'multipart/form-data';
  const { headers, requestBody } = isMultipart
    ? await buildMultipartRequest(feature, body)
    : { headers: getHeaders(), requestBody: JSON.stringify(body) };

  const res = await fetch(`${getBaseUrl()}${feature.path}`, {
    method: 'POST',
    headers,
    body: requestBody,
  });

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/event-stream')) {
    return handleStream(res, onStreamEvent);
  }

  const data = await parseResponse(res);
  return data as SearchResult;
}

async function buildMultipartRequest(
  feature: Feature,
  body: Record<string, unknown>,
): Promise<{ headers: Record<string, string>; requestBody: FormData }> {
  const { apiKey } = loadConfig();
  const headers: Record<string, string> = {
    'x-api-key': apiKey,
    accept: 'application/json, text/event-stream',
  };
  const data = new FormData();

  for (const [field, value] of Object.entries(body)) {
    const flag = feature.flags?.[field];
    if (flag?.format === 'binary' && typeof value === 'string') {
      const path = resolve(value);
      const file = await readFile(path);
      const filename = basename(path);
      data.append(field, new Blob([file]), filename);
    } else if (value !== undefined) {
      data.append(field, String(value));
    }
  }

  return { headers, requestBody: data };
}

async function parseResponse(res: Response): Promise<unknown> {
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new IndiciaApiError(res.status, res.statusText, body);
  }

  const text = await res.text();
  if (!text) return { success: true };
  try {
    return JSON.parse(text);
  } catch {
    return { success: true, data: text };
  }
}

async function handleStream(
  res: Response,
  onStreamEvent?: (event: SseEvent) => void,
): Promise<SearchResult> {
  if (!res.body) {
    return { success: false, error: 'Stream response had no body' };
  }

  const events: SseEvent[] = [];
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  let terminalEvent: SseEvent | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    const chunkEvents = parseSseLines(lines);
    for (const event of chunkEvents) {
      events.push(event);
      onStreamEvent?.(event);

      if (event.event === 'result' || event.event === 'all') {
        terminalEvent = event;
      }
    }
  }

  // Flush any remaining bytes.
  if (buffer.trim()) {
    const chunkEvents = parseSseLines([buffer]);
    for (const event of chunkEvents) {
      events.push(event);
      onStreamEvent?.(event);
      if (event.event === 'result' || event.event === 'all') {
        terminalEvent = event;
      }
    }
  }

  // Errors from streaming endpoints are emitted as data-only events.
  const errorEvent = events.find(
    e =>
      !e.event &&
      typeof e.data === 'object' &&
      e.data !== null &&
      'success' in e.data &&
      e.data.success === false,
  );
  if (errorEvent) {
    const errorData = errorEvent.data as { error?: string };
    return { success: false, error: errorData.error ?? 'Stream error', events };
  }

  if (terminalEvent) {
    return { success: true, data: terminalEvent.data, events };
  }

  return { success: true, events };
}

function parseSseLines(lines: string[]): SseEvent[] {
  let id: string | undefined;
  let event: string | undefined;
  const dataLines: string[] = [];
  const events: SseEvent[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (dataLines.length) {
        events.push({
          id,
          event,
          data: parseJsonSafe(dataLines.join('\n')),
        });
        id = undefined;
        event = undefined;
        dataLines.length = 0;
      }
      continue;
    }

    if (line.startsWith('id:')) {
      id = line.slice(3).trim();
    } else if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length) {
    events.push({
      id,
      event,
      data: parseJsonSafe(dataLines.join('\n')),
    });
  }

  return events;
}

function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
