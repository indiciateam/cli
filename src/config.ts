export interface CliConfig {
  apiKey: string;
  baseUrl: string;
}

export function loadConfig(): CliConfig {
  const apiKey = process.env.INDICIA_API_KEY;
  if (!apiKey) {
    throw new ConfigError(
      'Missing INDICIA_API_KEY. Set it in your environment or run:\n' +
        '  export INDICIA_API_KEY="your-api-key"\n' +
        'Create a key at https://indicia.app/dashboard/account',
    );
  }

  const baseUrl = process.env.INDICIA_API_URL ?? 'https://api.indicia.app';
  return { apiKey, baseUrl };
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}
