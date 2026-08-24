import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export interface CliConfig {
  apiKey?: string;
  accessToken?: string;
  baseUrl: string;
  authUrl: string;
}

interface StoredCredentials {
  accessToken: string;
  tokenType?: string;
}

export function getAuthUrl(): string {
  return (process.env.INDICIA_AUTH_URL ?? 'https://indicia.app').replace(
    /\/$/,
    '',
  );
}

export function getBaseUrl(): string {
  return (process.env.INDICIA_API_URL ?? 'https://api.indicia.app').replace(
    /\/$/,
    '',
  );
}

export function credentialsPath(): string {
  if (process.env.INDICIA_CONFIG_DIR) {
    return join(process.env.INDICIA_CONFIG_DIR, 'credentials.json');
  }
  if (process.platform === 'win32') {
    return join(
      process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'),
      'indicia',
      'credentials.json',
    );
  }
  return join(
    process.env.XDG_CONFIG_HOME || join(homedir(), '.config'),
    'indicia',
    'credentials.json',
  );
}

function readStoredToken(): string | undefined {
  try {
    const stored = JSON.parse(
      readFileSync(credentialsPath(), 'utf8'),
    ) as StoredCredentials;
    if (stored.accessToken) return stored.accessToken;
  } catch {
    // Missing or unreadable credentials file is not an error here.
  }
  return undefined;
}

export function saveAccessToken(accessToken: string): string {
  const path = credentialsPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify({ accessToken, tokenType: 'Bearer' }, null, 2)}\n`,
    { encoding: 'utf8', mode: 0o600 },
  );
  return path;
}

export function clearAccessToken(): boolean {
  try {
    rmSync(credentialsPath());
    return true;
  } catch {
    return false;
  }
}

export function loadConfig(): CliConfig {
  const apiKey = process.env.INDICIA_API_KEY;
  const accessToken = apiKey ? undefined : readStoredToken();
  if (!apiKey && !accessToken) {
    throw new ConfigError(
      'Not authenticated. Run `indicia login` or set INDICIA_API_KEY.\n' +
        'Create a key at https://indicia.app/dashboard/account',
    );
  }

  return {
    apiKey,
    accessToken,
    baseUrl: getBaseUrl(),
    authUrl: getAuthUrl(),
  };
}

export function authHeaders(): Record<string, string> {
  const { apiKey, accessToken } = loadConfig();
  if (apiKey) return { 'x-api-key': apiKey };
  if (accessToken) return { authorization: `Bearer ${accessToken}` };
  throw new ConfigError('Not authenticated');
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}
