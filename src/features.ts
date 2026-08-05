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

// Fallback list used when the OpenAPI spec cannot be fetched.
// These names intentionally line up with the pricing keys returned by
// /v1/pricing so that credit cost lookups work out of the box.
const fallbackFeatures: Feature[] = [
  // v1 intelligence
  {
    name: 'address',
    category: 'intelligence',
    path: '/v1/search/intelligence/address',
    version: 1,
    streaming: false,
    description: 'Search for individuals by address',
    priceKey: 'address',
    bodyFields: ['address1', 'city', 'state', 'zip', 'address2'],
    flags: {
      address1: { name: 'address1', description: 'Street address line 1' },
      city: { name: 'city', description: 'City' },
      state: { name: 'state', description: 'State' },
      zip: { name: 'zip', description: 'ZIP code' },
      address2: { name: 'address2', description: 'Street address line 2' },
      enhanced: {
        name: 'enhanced',
        description:
          'Enhanced mode: adds more results and associated people (+2 credits)',
        type: 'boolean',
      },
    },
  },
  {
    name: 'email',
    category: 'intelligence',
    path: '/v1/search/intelligence/email',
    version: 1,
    streaming: false,
    description: 'Search for individuals by email address',
    priceKey: 'email',
    bodyFields: ['query'],
    flags: {
      query: { name: 'query', description: 'Email address' },
      enhanced: {
        name: 'enhanced',
        description:
          'Enhanced mode: adds more results and associated people (+2 credits)',
        type: 'boolean',
      },
    },
  },
  {
    name: 'geolocation',
    category: 'intelligence',
    path: '/v1/search/intelligence/geolocation',
    version: 1,
    streaming: false,
    description: 'Analyze images to determine geographical location using AI',
    priceKey: 'geolocation',
  },
  {
    name: 'gmail',
    category: 'intelligence',
    path: '/v1/search/intelligence/gmail',
    version: 1,
    streaming: false,
    description: 'Comprehensive Gmail / Google Workspace email intelligence',
    priceKey: 'gmail',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Gmail address or query' } },
  },
  {
    name: 'hudsonrock',
    category: 'intelligence',
    path: '/v1/search/intelligence/hudsonrock',
    version: 1,
    streaming: false,
    description: 'Search for compromised data on Hudson Rock',
    priceKey: 'hudsonrock',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Search query' } },
  },
  {
    name: 'wifi-network-map',
    category: 'intelligence',
    path: '/v1/search/intelligence/wifi-network-map',
    version: 1,
    streaming: false,
    description: 'Geolocate Wi-Fi access points by BSSID using Apple WLOC',
    priceKey: 'wifi-network-map',
    bodyFields: ['query'],
    flags: {
      query: {
        name: 'query',
        description: 'One or more BSSIDs separated by commas or newlines',
      },
    },
  },
  {
    name: 'location-to-bssid',
    category: 'intelligence',
    path: '/v1/search/intelligence/location-to-bssid',
    version: 1,
    streaming: false,
    description: 'Find nearby Wi-Fi access points for a location',
    priceKey: 'location-to-bssid',
    bodyFields: ['query'],
    flags: {
      query: {
        name: 'query',
        description: 'GPS coordinates as "lat,lng" or a free-text address',
      },
    },
  },
  {
    name: 'person',
    category: 'intelligence',
    path: '/v1/search/intelligence/person',
    version: 1,
    streaming: false,
    description: 'Search for individuals by name and state',
    priceKey: 'person',
    bodyFields: ['name', 'city', 'state'],
    flags: {
      name: { name: 'name', description: 'Full name' },
      city: { name: 'city', description: 'City' },
      state: { name: 'state', description: 'State' },
      enhanced: {
        name: 'enhanced',
        description:
          'Enhanced mode: adds more results and associated people (+2 credits)',
        type: 'boolean',
      },
    },
  },
  {
    name: 'phone',
    category: 'intelligence',
    path: '/v1/search/intelligence/phone',
    version: 1,
    streaming: false,
    description: 'Advanced phone number investigation and carrier intelligence',
    priceKey: 'phone',
    bodyFields: ['query'],
    flags: {
      query: { name: 'query', description: 'Phone number' },
      enhanced: {
        name: 'enhanced',
        description:
          'Enhanced mode: adds more results and associated people (+2 credits)',
        type: 'boolean',
      },
    },
  },
  {
    name: 'pimeyes',
    category: 'intelligence',
    path: '/v1/search/intelligence/facial',
    version: 1,
    streaming: false,
    description: 'Search the internet for traces of a certain face',
    priceKey: 'pimeyes',
  },
  {
    name: 'seon',
    category: 'intelligence',
    path: '/v1/search/intelligence/seon',
    version: 1,
    streaming: false,
    description:
      "Evaluate potential threats with SEON's counter fraud intelligence",
    priceKey: 'seon',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Email, IP, or phone' } },
  },
  {
    name: 'virustotal.intelligence',
    category: 'intelligence',
    path: '/v1/search/intelligence/virustotal',
    version: 1,
    streaming: false,
    description: 'VirusTotal file/URL/domain/IP reputation intelligence',
    priceKey: 'virustotal.intelligence',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Search query' } },
  },
  {
    name: 'wayback',
    category: 'intelligence',
    path: '/v1/search/intelligence/wayback',
    version: 1,
    streaming: false,
    description:
      'Trace and read archived captures of a URL on the Wayback Machine',
    priceKey: 'wayback',
    bodyFields: ['url', 'timestamp', 'limit', 'from', 'to'],
    flags: {
      url: { name: 'url', description: 'URL or domain to look up' },
      timestamp: {
        name: 'timestamp',
        description:
          'Read the specific capture at this Wayback timestamp (yyyyMMddhhmmss)',
      },
      limit: {
        name: 'limit',
        description: 'Maximum number of snapshots to return (default 200)',
        type: 'number',
      },
      from: {
        name: 'from',
        description: 'Only captures from this date onward (yyyyMMddhhmmss)',
      },
      to: {
        name: 'to',
        description: 'Only captures up to this date (yyyyMMddhhmmss)',
      },
    },
  },
  {
    name: 'web-dbs',
    category: 'intelligence',
    path: '/v1/search/intelligence/web-dbs',
    version: 1,
    streaming: false,
    description: 'Search web databases',
    priceKey: 'web-dbs',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Search query' } },
  },

  // v1 socials
  {
    name: 'discord',
    category: 'socials',
    path: '/v1/search/socials/discord',
    version: 1,
    streaming: true,
    description: 'Search Discord users for profile and server info',
    priceKey: 'discord',
    bodyFields: ['query'],
    flags: {
      query: { name: 'query', description: 'Discord user ID or query' },
    },
  },
  {
    name: 'github',
    category: 'socials',
    path: '/v1/search/socials/github',
    version: 1,
    streaming: true,
    description: 'Search GitHub profiles, info, and commit emails',
    priceKey: 'github',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'GitHub username' } },
  },
  {
    name: 'roblox',
    category: 'socials',
    path: '/v1/search/socials/roblox',
    version: 1,
    streaming: true,
    description:
      'Lookup Roblox users, game statistics, and profile information',
    priceKey: 'roblox',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Roblox username or ID' } },
  },
  {
    name: 'reddit',
    category: 'socials',
    path: '/v1/search/socials/reddit',
    version: 1,
    streaming: false,
    description:
      "Search Reddit archives for a user's posts and comments, including deleted and removed content",
    priceKey: 'reddit',
    bodyFields: ['author', 'type', 'subreddit', 'limit', 'before'],
    flags: {
      author: { name: 'author', description: 'Reddit username' },
      type: {
        name: 'type',
        description: 'Whether to return posts or comments',
        choices: ['posts', 'comments'],
      },
      subreddit: {
        name: 'subreddit',
        description: 'Restrict results to a single subreddit',
      },
      limit: {
        name: 'limit',
        description: 'Maximum number of items (default 1000, max 1000)',
        type: 'number',
      },
      before: {
        name: 'before',
        description:
          'Pagination cursor: only items older than this epoch-second timestamp',
        type: 'number',
      },
    },
  },
  {
    name: 'tiktok',
    category: 'socials',
    path: '/v1/search/socials/tiktok',
    version: 1,
    streaming: true,
    description: 'Aggregate intelligence and data of a TikTok account',
    priceKey: 'tiktok',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'TikTok username' } },
  },
  {
    name: 'xbox',
    category: 'socials',
    path: '/v1/search/socials/xbox',
    version: 1,
    streaming: false,
    description: 'Lookup an Xbox Live profile by gamertag',
    priceKey: 'xbox',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Xbox Live gamertag' } },
  },
  {
    name: 'playstation',
    category: 'socials',
    path: '/v1/search/socials/playstation',
    version: 1,
    streaming: false,
    description: 'Lookup a PlayStation Network profile by online ID',
    priceKey: 'playstation',
    bodyFields: ['query'],
    flags: {
      query: { name: 'query', description: 'PlayStation Network online ID' },
    },
  },
  {
    name: 'epic',
    category: 'socials',
    path: '/v1/search/socials/epic',
    version: 1,
    streaming: false,
    description: 'Lookup an Epic Games account by display name or account ID',
    priceKey: 'epic',
    bodyFields: ['query'],
    flags: {
      query: {
        name: 'query',
        description: 'Epic Games display name or 32-char account ID',
      },
    },
  },
  {
    name: 'steam',
    category: 'socials',
    path: '/v1/search/socials/steam',
    version: 1,
    streaming: false,
    description: 'Lookup a Steam profile by vanity URL or SteamID64',
    priceKey: 'steam',
    bodyFields: ['query'],
    flags: {
      query: {
        name: 'query',
        description: 'Steam vanity URL name, SteamID64, or profile URL',
      },
    },
  },

  // v2 socials
  {
    name: 'username',
    category: 'socials',
    path: '/v2/search/socials/username',
    version: 2,
    streaming: true,
    description: 'Search various sites for a specific username',
    priceKey: 'username',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Username' } },
  },

  // v1 infrastructure
  {
    name: 'certificates',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/certificates',
    version: 1,
    streaming: false,
    description: 'Aggregate data pertaining to certificates of a website',
    priceKey: 'certificates',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Domain or query' } },
  },
  {
    name: 'dnsdumpster',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/dns',
    version: 1,
    streaming: false,
    description: 'Perform deep DNS analysis and find hidden subdomains',
    priceKey: 'dnsdumpster',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Domain' } },
  },
  {
    name: 'ipinfo',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/ipinfo',
    version: 1,
    streaming: false,
    description: 'Analyze details of an IP address',
    priceKey: 'ipinfo',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'IP address' } },
  },
  {
    name: 'portscan',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/portscan',
    version: 1,
    streaming: false,
    description: 'Port scanning and vulnerability assessment',
    priceKey: 'portscan',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'IP or host' } },
  },
  {
    name: 'shodan',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/shodan',
    version: 1,
    streaming: false,
    description: 'IP service and software intelligence',
    priceKey: 'shodan',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Shodan query' } },
  },
  {
    name: 'virustotal.content',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/virustotal',
    version: 1,
    streaming: false,
    description: 'Search VirusTotal for files containing specific content',
    priceKey: 'virustotal.content',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Search query' } },
  },
  {
    name: 'whois',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/whois',
    version: 1,
    streaming: false,
    description: 'Return information on a domain and its registration',
    priceKey: 'whois',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Domain' } },
  },

  // v1 tools
  {
    name: 'appstore',
    category: 'tools',
    path: '/v1/tools/appstore',
    version: 1,
    streaming: false,
    description:
      'Scrape app & developer info from the Google Play or Apple App Store',
    priceKey: 'appstore',
    bodyFields: ['query', 'store'],
    flags: {
      query: { name: 'query', description: 'App name or query' },
      store: { name: 'store', description: 'Store: apple or google' },
    },
  },
  {
    name: 'crypto',
    category: 'tools',
    path: '/v1/tools/crypto',
    version: 1,
    streaming: false,
    description:
      'Analyze a crypto address: balances, token holdings & transaction history',
    priceKey: 'crypto',
    bodyFields: ['address', 'network'],
    flags: {
      address: { name: 'address', description: 'Cryptocurrency address' },
      network: {
        name: 'network',
        description: 'Blockchain network (optional)',
      },
    },
  },
  {
    name: 'doogle',
    category: 'tools',
    path: '/v1/tools/doogle',
    version: 1,
    streaming: false,
    description:
      'Correlate and identify alternative Discord accounts of a user',
    priceKey: 'doogle',
    bodyFields: ['query'],
    flags: {
      query: { name: 'query', description: 'Discord user ID or query' },
    },
  },
  {
    name: 'doublecounter',
    category: 'tools',
    path: '/v1/tools/doublecounter',
    version: 1,
    streaming: false,
    description:
      'Bypass alt verification for Discord servers using Double Counter',
    priceKey: 'doublecounter',
    bodyFields: ['query'],
    flags: { query: { name: 'query', description: 'Double Counter request' } },
  },
  {
    name: 'intelx',
    category: 'tools',
    path: '/v1/tools/intelx',
    version: 1,
    streaming: false,
    description: 'Download a file from IntelX storage',
    priceKey: 'intelx',
    bodyFields: ['storageId', 'bucket', 'systemId'],
    flags: {
      storageId: {
        name: 'storage-id',
        optionKey: 'storageId',
        description: 'IntelX storage ID',
      },
      bucket: { name: 'bucket', description: 'IntelX bucket' },
      systemId: {
        name: 'system-id',
        optionKey: 'systemId',
        description: 'IntelX system ID',
      },
    },
  },
  {
    name: 'link-resolver',
    category: 'tools',
    path: '/v1/tools/link-resolver',
    version: 1,
    streaming: false,
    description:
      'Resolve a TikTok or Instagram share link to identify the user who shared it',
    priceKey: 'link-resolver',
    bodyFields: ['url'],
    flags: {
      url: { name: 'url', description: 'TikTok or Instagram share link' },
    },
  },
  {
    name: 'virustotal.download',
    category: 'tools',
    path: '/v1/tools/virustotal',
    version: 1,
    streaming: false,
    description: 'Download a file from VirusTotal by ID',
    priceKey: 'virustotal.download',
    bodyFields: ['id'],
    flags: { id: { name: 'id', description: 'VirusTotal file ID' } },
  },
];

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
  searchXbox: 'xbox',
  searchPlaystation: 'playstation',
  searchEpic: 'epic',
  searchSteam: 'steam',
  searchUsername: 'username',
  searchCertificates: 'certificates',
  searchDns: 'dnsdumpster',
  searchIpInfo: 'ipinfo',
  scanPorts: 'portscan',
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

interface OpenApiDocument {
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

  return {
    name,
    category,
    path,
    version,
    streaming: isStreamingOperation(op),
    description: op.summary ?? op.description ?? `${name} search`,
    contentType,
    bodyFields,
    flags,
    priceKey,
  };
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
    const loaded: Feature[] = [];
    for (const [path, methods] of Object.entries(doc.paths)) {
      for (const op of Object.values(methods)) {
        const feature = openApiFeatureFromPath(path, op);
        if (feature) loaded.push(feature);
      }
    }
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
