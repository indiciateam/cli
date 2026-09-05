import { fallbackFeatures } from './fallback-features.generated.js';

export type FeatureCategory =
  | 'intelligence'
  | 'socials'
  | 'infrastructure'
  | 'tools';

export interface FeatureFlag {
  name: string;
  optionKey?: string;
  description: string;
  format?: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  path?: string[];
  choices?: unknown[];
}

export interface Feature {
  name: string;
  category: FeatureCategory;
  path: string;
  version: 1 | 2;
  streaming: boolean;
  description: string;
  contentType?: string;
  bodyFields?: string[];
  flags?: Record<string, FeatureFlag>;
  priceKey?: string;
}

const priceKeyByOperationId: Record<string, string> = {
  searchAddress: 'address',
  searchEmail: 'email',
  geolocateMedia: 'geolocation',
  searchGmail: 'gmail',
  searchHudsonRock: 'hudsonrock',
  searchWifiNetworkMap: 'wifi-network-map',
  searchLocationToBssid: 'location-to-bssid',
  searchPerson: 'person',
  searchPhone: 'phone',
  searchSeon: 'seon',
  virusTotalIntelligence: 'virustotal.intelligence',
  searchWebDatabases: 'web-dbs',
  searchWayback: 'wayback',
  searchDiscord: 'discord',
  searchGithub: 'github',
  searchReddit: 'reddit',
  searchRoblox: 'roblox',
  searchTiktok: 'tiktok',
  searchInstagram: 'instagram',
  searchXbox: 'xbox',
  searchPlaystation: 'playstation',
  searchEpic: 'epic',
  searchSteam: 'steam',
  searchUsername: 'username',
  searchCellTower: 'celltower',
  searchCertificates: 'certificates',
  searchDns: 'dnsdumpster',
  searchIpInfo: 'ipinfo',
  searchShodan: 'shodan',
  virusTotalContent: 'virustotal.content',
  searchWhois: 'whois',
  searchAppStore: 'appstore',
  analyzeCryptoAddress: 'crypto',
  lookupDiscordAlt: 'doogle',
  bypassDoubleCounter: 'doublecounter',
  downloadIntelxFile: 'intelx',
  resolveLink: 'link-resolver',
  downloadVirusTotalFile: 'virustotal.download',
  searchFace: 'pimeyes',
};

export interface OpenApiDocument {
  paths: Record<string, Record<string, OpenApiOperation>>;
}

interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  requestBody?: {
    required?: boolean;
    content: Record<string, { schema: OpenApiSchema }>;
  };
  responses?: Record<string, OpenApiResponse>;
}

interface OpenApiResponse {
  content?: Record<string, unknown>;
}

interface OpenApiSchema {
  type?: string;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  anyOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  description?: string;
  enum?: unknown[];
  format?: string;
  const?: unknown;
}

export function kebabCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[ _]/g, '-')
    .toLowerCase();
}

function isFeatureCategory(value: string): value is FeatureCategory {
  return ['intelligence', 'socials', 'infrastructure', 'tools'].includes(value);
}

function isStreamingOperation(op: OpenApiOperation): boolean {
  for (const response of Object.values(op.responses ?? {})) {
    if (Object.keys(response.content ?? {}).includes('text/event-stream')) {
      return true;
    }
  }
  return false;
}

function getRequestContentType(op: OpenApiOperation): string | undefined {
  const content = op.requestBody?.content;
  if (!content) return undefined;
  if (content['application/json']) return 'application/json';
  if (content['multipart/form-data']) return 'multipart/form-data';
  const first = Object.keys(content)[0];
  return first;
}

function flattenProperties(
  schema: OpenApiSchema | undefined,
): Record<string, OpenApiSchema> {
  if (!schema) return {};
  const out: Record<string, OpenApiSchema> = {};
  for (const [key, value] of Object.entries(schema.properties ?? {})) {
    out[key] = value;
  }
  for (const sub of schema.anyOf ?? schema.oneOf ?? []) {
    for (const [key, value] of Object.entries(sub.properties ?? {})) {
      out[key] = value;
    }
  }
  return out;
}

export function camelCase(input: string): string {
  return input.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

function collectFlags(
  schema: OpenApiSchema | undefined,
  flags: Record<string, FeatureFlag>,
  path: string[] = [],
): void {
  if (!schema) return;
  const properties = schema.properties ?? {};
  for (const [key, value] of Object.entries(properties)) {
    const currentPath = [...path, key];
    const hasNestedObjectProperties =
      value.type === 'object' &&
      value.properties &&
      Object.keys(value.properties).length > 0;
    if (hasNestedObjectProperties) {
      collectFlags(value, flags, currentPath);
      continue;
    }
    const flagName = kebabCase(key);
    const flagKey = currentPath.join('.');
    const type = (value.type as FeatureFlag['type']) ?? 'string';
    flags[flagKey] = {
      name: flagName,
      optionKey: camelCase(flagName),
      description: schemaDescription(flagKey, value),
      format: value.format,
      type,
      path: currentPath,
      choices: value.enum,
    };
  }
  for (const sub of schema.anyOf ?? schema.oneOf ?? []) {
    collectFlags(sub, flags, path);
  }
}

function schemaDescription(
  key: string,
  property: OpenApiSchema | undefined,
): string {
  if (!property) return `Request body field: ${key}`;
  const parts: string[] = [];
  if (property.description) parts.push(property.description);
  if (property.enum) parts.push(`Allowed: ${property.enum.join(', ')}`);
  if (property.format) parts.push(`Format: ${property.format}`);
  if (parts.length) return parts.join(' ');
  return `Request body field: ${key}`;
}

function openApiFeatureFromPath(
  path: string,
  op: OpenApiOperation,
): Feature | undefined {
  const versionMatch = path.match(/^\/v(\d+)\//);
  const version = versionMatch ? (Number(versionMatch[1]) as 1 | 2) : 1;
  const segments = path.split('/').filter(Boolean);

  let category: FeatureCategory | undefined;
  let name: string | undefined;

  if (segments[0] === 'v1' && segments[1] === 'tools' && segments[2]) {
    category = 'tools';
    name = segments[2];
  } else if (
    segments[0]?.startsWith('v') &&
    segments[1] === 'search' &&
    segments[2] &&
    segments[3]
  ) {
    const rawCategory = segments[2];
    if (!isFeatureCategory(rawCategory)) return undefined;
    category = rawCategory;
    name = segments[3];
  }

  if (!category || !name) return undefined;

  const contentType = getRequestContentType(op);
  const requestSchema = contentType
    ? op.requestBody?.content[contentType]?.schema
    : undefined;
  const properties = flattenProperties(requestSchema);
  const bodyFields = Object.keys(properties);
  const fallback = fallbackFeatures.find(f => f.path === path);
  const flags: Record<string, FeatureFlag> = {};
  collectFlags(requestSchema, flags);
  for (const flag of Object.values(flags)) {
    const fallbackFlag = fallback?.flags?.[flag.path?.join('.') ?? flag.name];
    if (fallbackFlag?.description) {
      flag.description = fallbackFlag.description;
    }
  }

  const priceKey = op.operationId
    ? priceKeyByOperationId[op.operationId]
    : undefined;
  const resolvedName = priceKey ?? name;

  return {
    name: resolvedName,
    category,
    path,
    version,
    streaming: isStreamingOperation(op),
    description: op.summary ?? op.description ?? `${resolvedName} search`,
    contentType,
    bodyFields,
    flags,
    priceKey: priceKey ?? resolvedName,
  };
}

export function featuresFromOpenApiDocument(doc: OpenApiDocument): Feature[] {
  const loaded: Feature[] = [];
  for (const [path, methods] of Object.entries(doc.paths)) {
    for (const op of Object.values(methods)) {
      const feature = openApiFeatureFromPath(path, op);
      if (feature) loaded.push(feature);
    }
  }
  return loaded;
}

let cachedFeatures: Feature[] | undefined;

export async function loadFeatures(baseUrl: string): Promise<Feature[]> {
  if (cachedFeatures) return cachedFeatures;

  const url = `${baseUrl.replace(/\/$/, '')}/openapi`;
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`OpenAPI fetch failed: ${res.status} ${res.statusText}`);
    }
    const doc = (await res.json()) as OpenApiDocument;
    const loaded = featuresFromOpenApiDocument(doc);
    cachedFeatures = loaded.length ? loaded : fallbackFeatures;
  } catch {
    cachedFeatures = fallbackFeatures;
  }

  return cachedFeatures;
}

export function clearFeatureCache(): void {
  cachedFeatures = undefined;
}

export function getFallbackFeatures(): Feature[] {
  return fallbackFeatures;
}

export function findFeature(
  features: Feature[],
  input: string,
): Feature | undefined {
  const normalized = input.toLowerCase().trim();
  return features.find(
    f =>
      f.name === normalized ||
      `${f.category}/${f.name}` === normalized ||
      f.path === normalized,
  );
}

export function listByCategory(
  features: Feature[],
): Record<FeatureCategory, Feature[]> {
  return features.reduce(
    (acc, f) => {
      acc[f.category] = acc[f.category] ?? [];
      acc[f.category].push(f);
      return acc;
    },
    {} as Record<FeatureCategory, Feature[]>,
  );
}
