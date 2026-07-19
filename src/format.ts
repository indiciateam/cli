const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

export const c = colors;

export function isColorEnabled(): boolean {
  return process.env.NO_COLOR !== '1' && process.stdout.isTTY;
}

export function colorize(text: string, color: keyof typeof colors): string {
  if (!isColorEnabled()) return text;
  return `${colors[color]}${text}${colors.reset}`;
}

export function formatResult(
  feature: string,
  category: string,
  data: unknown,
): string {
  if (data === undefined || data === null) {
    return colorize('No data returned.', 'gray');
  }

  const formatter = formatters[`${category}/${feature}`] ?? formatters[feature];
  if (formatter) {
    return formatter(data);
  }

  return genericFormatter(data);
}

const formatters: Record<string, (data: unknown) => string> = {
  'intelligence/email': emailFormatter,
  'infrastructure/ipinfo': ipinfoFormatter,
  'infrastructure/whois': whoisFormatter,
  'socials/github': githubFormatter,
  'socials/username': usernameFormatter,
  info: infoFormatter,
};

function labelValue(label: string, value: unknown): string {
  const valueText =
    value === undefined || value === null
      ? colorize('—', 'gray')
      : String(value);
  return `${colorize(label, 'cyan')}: ${valueText}`;
}

function prettyJson(data: unknown): string {
  return colorizeJson(JSON.stringify(data, null, 2));
}

function colorizeJson(json: string): string {
  if (!isColorEnabled()) return json;
  return json
    .replace(
      /"([^"\\]*(?:\\.[^"\\]*)*)":/g,
      `${colors.cyan}"$1"${colors.reset}:`,
    )
    .replace(
      /: "([^"\\]*(?:\\.[^"\\]*)*)"/g,
      `: ${colors.green}"$1"${colors.reset}`,
    )
    .replace(/: (\d+(?:\.\d+)?)/g, `: ${colors.yellow}$1${colors.reset}`)
    .replace(/: (true|false|null)/g, `: ${colors.magenta}$1${colors.reset}`);
}

function genericFormatter(data: unknown): string {
  return formatValue(data, 0);
}

function formatValue(value: unknown, depth: number): string {
  if (value === null || value === undefined) {
    return colorize('—', 'gray');
  }

  if (typeof value === 'string') {
    if (value === '') return colorize('(empty)', 'gray');
    if (/^https?:\/\/\S+$/i.test(value)) {
      return value;
    }
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return colorize('[]', 'gray');
    if (depth >= 2) {
      return colorize(`[${value.length} items]`, 'gray');
    }
    const lines: string[] = [];
    for (let i = 0; i < value.length; i++) {
      const item = formatValue(value[i], depth + 1);
      const prefix = depth === 0 ? `${colorize(String(i), 'cyan')}.` : '•';
      lines.push(`${'  '.repeat(depth)}${prefix} ${indent(item, depth + 1)}`);
    }
    return lines.join('\n');
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return colorize('{}', 'gray');
    if (depth >= 3) {
      return colorize(`{${entries.length} fields}`, 'gray');
    }
    const lines: string[] = [];
    for (const [key, val] of entries) {
      if (val === undefined) continue;
      const formatted = formatValue(val, depth + 1);
      const indented = indent(formatted, depth + 1);
      lines.push(`${'  '.repeat(depth)}${colorize(key, 'cyan')}: ${indented}`);
    }
    return lines.join('\n');
  }

  return String(value);
}

function indent(text: string, depth: number): string {
  const pad = '  '.repeat(depth);
  return text.replace(/\n/g, `\n${pad}`);
}

function infoFormatter(data: unknown): string {
  const d = data as {
    user?: {
      name?: string;
      email?: string;
      username?: string;
      tokens?: number;
      role?: string;
    };
    key?: {
      name?: string;
      start?: string;
      rateLimitMax?: number;
      rateLimitTimeWindow?: number;
      requestCount?: number;
    };
  };
  const lines: string[] = [
    colorize('Indicia Account', 'bold'),
    labelValue('Name', d.user?.name ?? d.user?.username),
    labelValue('Email', d.user?.email),
    labelValue('Role', d.user?.role),
    labelValue('Credits', d.user?.tokens?.toLocaleString()),
    '',
    colorize('API Key', 'bold'),
    labelValue('Name', d.key?.name),
    labelValue('Key', d.key?.start ? `${d.key.start}…` : undefined),
    labelValue(
      'Rate limit',
      d.key?.rateLimitMax && d.key?.rateLimitTimeWindow
        ? `${d.key.rateLimitMax} req / ${d.key.rateLimitTimeWindow / 1000}s`
        : undefined,
    ),
    labelValue('Requests made', d.key?.requestCount?.toLocaleString()),
  ];
  return lines.join('\n');
}

function emailFormatter(data: unknown): string {
  const d = data as { web?: Array<{ site?: string; data?: unknown }> };
  const lines: string[] = [colorize('Email Results', 'bold')];
  const results = d.web ?? [];
  if (!results.length) {
    lines.push(colorize('No results found.', 'gray'));
    return lines.join('\n');
  }
  for (const r of results) {
    lines.push(
      `  ${colorize(r.site ?? 'source', 'cyan')}: ${JSON.stringify(r.data)}`,
    );
  }
  return lines.join('\n');
}

function ipinfoFormatter(data: unknown): string {
  const d = data as {
    ip?: string;
    city?: string;
    region?: string;
    country_name?: string;
    latitude?: number;
    longitude?: number;
    asn?: { name?: string; domain?: string; type?: string };
    company?: { name?: string; type?: string };
    threat?: {
      trust_score?: number;
      is_vpn?: boolean;
      is_proxy?: boolean;
      is_datacenter?: boolean;
      is_tor?: boolean;
    };
    time_zone?: { name?: string; current_time?: string };
  };

  const location = [d.city, d.region, d.country_name]
    .filter(Boolean)
    .join(', ');
  const org = d.company?.name ?? d.asn?.name ?? '—';

  const lines: string[] = [
    colorize('IP Information', 'bold'),
    labelValue('IP', d.ip),
    labelValue('Location', location),
    labelValue(
      'Coordinates',
      d.latitude !== undefined ? `${d.latitude}, ${d.longitude}` : undefined,
    ),
    labelValue('Organization', org),
    labelValue('Type', d.company?.type ?? d.asn?.type),
    labelValue('Timezone', d.time_zone?.name),
    '',
    colorize('Threat Assessment', 'bold'),
    labelValue('Trust score', d.threat?.trust_score),
    labelValue('VPN', d.threat?.is_vpn),
    labelValue('Proxy', d.threat?.is_proxy),
    labelValue('Datacenter', d.threat?.is_datacenter),
    labelValue('Tor', d.threat?.is_tor),
  ];
  return lines.join('\n');
}

function whoisFormatter(data: unknown): string {
  const d = data as {
    data?: {
      domain?: string;
      registrar?: { name?: string; abuseEmail?: string };
      dates?: { created?: string; expires?: string };
      nameservers?: Array<{ ldhName?: string }>;
      status?: string[];
      dnssec?: { delegationSigned?: boolean };
    };
  };
  const domain = d.data;
  if (!domain) return prettyJson(data);

  const lines: string[] = [
    colorize('WHOIS', 'bold'),
    labelValue('Domain', domain.domain),
    labelValue('Registrar', domain.registrar?.name),
    labelValue('Abuse email', domain.registrar?.abuseEmail),
    labelValue('Created', domain.dates?.created),
    labelValue('Expires', domain.dates?.expires),
    labelValue(
      'Nameservers',
      domain.nameservers
        ?.map(n => n.ldhName)
        .filter(Boolean)
        .join(', '),
    ),
    labelValue('Status', domain.status?.join(', ')),
    labelValue('DNSSEC signed', domain.dnssec?.delegationSigned),
  ];
  return lines.join('\n');
}

function githubFormatter(data: unknown): string {
  const d = data as {
    username?: string;
    name?: string | null;
    bio?: string | null;
    location?: string | null;
    company?: string | null;
    avatar_url?: string;
    followers?: number;
    following?: number;
    public_repos?: number;
    public_gists?: number;
    commits?: number;
    commitRepoCount?: number;
    lastSeen?: string | null;
    createdAt?: string;
    commitEmails?: Record<string, string[]>;
  };

  const emails = d.commitEmails
    ? Object.entries(d.commitEmails).map(
        ([email, names]) => `${email} (${names.join(', ')})`,
      )
    : [];

  const lines: string[] = [
    colorize('GitHub Profile', 'bold'),
    labelValue(
      'Profile',
      d.username ? `https://github.com/${d.username}` : undefined,
    ),
    labelValue('Username', d.username),
    labelValue('Name', d.name),
    labelValue('Bio', d.bio),
    labelValue('Location', d.location),
    labelValue('Company', d.company),
    labelValue('Followers', d.followers?.toLocaleString()),
    labelValue('Following', d.following?.toLocaleString()),
    labelValue('Public repos', d.public_repos?.toLocaleString()),
    labelValue('Public gists', d.public_gists?.toLocaleString()),
    labelValue('Commits found', d.commits?.toLocaleString()),
    labelValue('Commit repos', d.commitRepoCount?.toLocaleString()),
    labelValue('Last seen', d.lastSeen),
    labelValue('Joined', d.createdAt),
  ];

  if (emails.length) {
    lines.push('', colorize('Commit Emails', 'bold'));
    for (const email of emails) {
      lines.push(`  ${email}`);
    }
  }
  return lines.join('\n');
}

function usernameFormatter(data: unknown): string {
  const items = Array.isArray(data)
    ? data.map(
        i =>
          i.data as {
            service?: string;
            exists?: boolean;
            url?: string;
            duration_ms?: number;
          },
      )
    : [];

  if (!items.length) {
    return colorize('No username results.', 'gray');
  }

  const found = items.filter(i => i.exists).length;
  const lines: string[] = [
    colorize('Username Search', 'bold'),
    `${colorize('Found', 'green')}: ${found} / ${items.length}`,
    '',
  ];

  const maxService = Math.max(...items.map(i => (i.service ?? '').length), 6);
  const statusWidth = 8;
  const header = `${'Service'.padEnd(maxService)}  ${'Status'.padEnd(statusWidth)}  Duration`;
  lines.push(colorize(header, 'bold'));

  for (const item of items) {
    const statusText = item.exists ? 'found' : 'missing';
    const status = item.exists
      ? colorize(statusText, 'green')
      : colorize(statusText, 'gray');
    const duration =
      item.duration_ms !== undefined ? `${item.duration_ms}ms` : '—';
    const row = `${(item.service ?? '').padEnd(maxService)}  ${statusText.padEnd(statusWidth)}  ${duration}`;
    lines.push(row.replace(statusText, status));
    if (item.url) {
      lines.push(`  ${colorize('→', 'gray')} ${item.url}`);
    }
  }
  return lines.join('\n');
}
