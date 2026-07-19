export type FeatureCategory =
  | 'intelligence'
  | 'socials'
  | 'infrastructure'
  | 'tools';

export interface FeatureFlag {
  name: string;
  description: string;
}

export interface Feature {
  name: string;
  category: FeatureCategory;
  path: string;
  version: 1 | 2;
  streaming: boolean;
  description: string;
  bodyFields?: string[];
  flags?: Record<string, FeatureFlag>;
}

export const features: Feature[] = [
  // v1 intelligence
  {
    name: 'address',
    category: 'intelligence',
    path: '/v1/search/intelligence/address',
    version: 1,
    streaming: false,
    description: 'Search for individuals by address',
  },
  {
    name: 'email',
    category: 'intelligence',
    path: '/v1/search/intelligence/email',
    version: 1,
    streaming: false,
    description: 'Search for individuals by email address',
  },
  {
    name: 'geolocation',
    category: 'intelligence',
    path: '/v1/search/intelligence/geolocation',
    version: 1,
    streaming: false,
    description: 'Analyze images to determine geographical location using AI',
  },
  {
    name: 'gmail',
    category: 'intelligence',
    path: '/v1/search/intelligence/gmail',
    version: 1,
    streaming: false,
    description: 'Comprehensive Gmail / Google Workspace email intelligence',
  },
  {
    name: 'hudsonrock',
    category: 'intelligence',
    path: '/v1/search/intelligence/hudsonrock',
    version: 1,
    streaming: false,
    description: 'Search for compromised data on Hudson Rock',
  },
  {
    name: 'person',
    category: 'intelligence',
    path: '/v1/search/intelligence/person',
    version: 1,
    streaming: false,
    description: 'Search for individuals by name and state',
  },
  {
    name: 'phone',
    category: 'intelligence',
    path: '/v1/search/intelligence/phone',
    version: 1,
    streaming: false,
    description: 'Advanced phone number investigation and carrier intelligence',
  },
  {
    name: 'pimeyes',
    category: 'intelligence',
    path: '/v1/search/intelligence/facial',
    version: 1,
    streaming: false,
    description: 'Search the internet for traces of a certain face',
  },
  {
    name: 'seon',
    category: 'intelligence',
    path: '/v1/search/intelligence/seon',
    version: 1,
    streaming: false,
    description:
      "Evaluate potential threats with SEON's counter fraud intelligence",
  },
  {
    name: 'virustotal.intelligence',
    category: 'intelligence',
    path: '/v1/search/intelligence/virustotal',
    version: 1,
    streaming: false,
    description: 'VirusTotal file/URL/domain/IP reputation intelligence',
  },
  {
    name: 'web-dbs',
    category: 'intelligence',
    path: '/v1/search/intelligence/web-dbs',
    version: 1,
    streaming: false,
    description: 'Search web databases',
  },

  // v1 socials
  {
    name: 'discord',
    category: 'socials',
    path: '/v1/search/socials/discord',
    version: 1,
    streaming: true,
    description: 'Search Discord users for profile and server info',
  },
  {
    name: 'github',
    category: 'socials',
    path: '/v1/search/socials/github',
    version: 1,
    streaming: true,
    description: 'Search GitHub profiles, info, and commit emails',
  },
  {
    name: 'roblox',
    category: 'socials',
    path: '/v1/search/socials/roblox',
    version: 1,
    streaming: true,
    description:
      'Lookup Roblox users, game statistics, and profile information',
  },
  {
    name: 'tiktok',
    category: 'socials',
    path: '/v1/search/socials/tiktok',
    version: 1,
    streaming: true,
    description: 'Aggregate intelligence and data of a TikTok account',
  },

  // v2 socials
  {
    name: 'username',
    category: 'socials',
    path: '/v2/search/socials/username',
    version: 2,
    streaming: true,
    description: 'Search various sites for a specific username',
  },

  // v1 infrastructure
  {
    name: 'certificates',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/certificates',
    version: 1,
    streaming: false,
    description: 'Aggregate data pertaining to certificates of a website',
  },
  {
    name: 'dnsdumpster',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/dnsdumpster',
    version: 1,
    streaming: false,
    description: 'Perform deep DNS analysis and find hidden subdomains',
  },
  {
    name: 'ipinfo',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/ipinfo',
    version: 1,
    streaming: false,
    description: 'Analyze details of an IP address',
  },
  {
    name: 'portscan',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/portscan',
    version: 1,
    streaming: false,
    description: 'Port scanning and vulnerability assessment',
  },
  {
    name: 'shodan',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/shodan',
    version: 1,
    streaming: false,
    description: 'IP service and software intelligence',
  },
  {
    name: 'virustotal.content',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/virustotal',
    version: 1,
    streaming: false,
    description: 'Search VirusTotal for files containing specific content',
  },
  {
    name: 'whois',
    category: 'infrastructure',
    path: '/v1/search/infrastructure/whois',
    version: 1,
    streaming: false,
    description: 'Return information on a domain and its registration',
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
    bodyFields: ['query'],
  },
  {
    name: 'crypto',
    category: 'tools',
    path: '/v1/tools/crypto',
    version: 1,
    streaming: false,
    description:
      'Analyze a crypto address: balances, token holdings & transaction history',
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
  },
  {
    name: 'doublecounter',
    category: 'tools',
    path: '/v1/tools/doublecounter',
    version: 1,
    streaming: false,
    description:
      'Bypass alt verification for Discord servers using Double Counter',
  },
  {
    name: 'intelx',
    category: 'tools',
    path: '/v1/tools/intelx',
    version: 1,
    streaming: false,
    description: 'Download a file from IntelX storage',
    bodyFields: ['storageId', 'bucket'],
    flags: {
      storageId: { name: 'storage-id', description: 'IntelX storage ID' },
      bucket: { name: 'bucket', description: 'IntelX bucket' },
    },
  },
  {
    name: 'virustotal.download',
    category: 'tools',
    path: '/v1/tools/virustotal',
    version: 1,
    streaming: false,
    description: 'Download a file from VirusTotal by ID',
    bodyFields: ['id'],
    flags: {
      id: { name: 'id', description: 'VirusTotal file ID' },
    },
  },
];

export function findFeature(input: string): Feature | undefined {
  const normalized = input.toLowerCase().trim();
  return features.find(
    f =>
      f.name === normalized ||
      `${f.category}/${f.name}` === normalized ||
      f.path === normalized,
  );
}

export function listByCategory(): Record<FeatureCategory, Feature[]> {
  return features.reduce(
    (acc, f) => {
      acc[f.category] = acc[f.category] ?? [];
      acc[f.category].push(f);
      return acc;
    },
    {} as Record<FeatureCategory, Feature[]>,
  );
}
