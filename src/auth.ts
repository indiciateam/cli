import { execFile } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { getAuthUrl, getBaseUrl, saveAccessToken } from './config.js';
import { writeError } from './output.js';

export const CLI_OAUTH_CLIENT_ID = 'indicia-cli';

const DEVICE_GRANT = 'urn:ietf:params:oauth:grant-type:device_code';
const SCOPES = 'openid profile email offline_access';

export interface LoginResult {
  path: string;
  method: 'device' | 'browser';
}

function authApi(path: string): string {
  return `${getAuthUrl()}/api/auth${path}`;
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text || res.statusText };
  }
}

function openBrowser(url: string): void {
  const cmd =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  execFile(cmd, args, () => {
    // Opening the browser is best-effort; the URL is always printed.
  });
}

function formatUserCode(code: string): string {
  const clean = code.replace(/-/g, '');
  if (clean.length === 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  return clean;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export async function loginWithDevice(): Promise<LoginResult> {
  const start = await fetch(authApi('/device/code'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ client_id: CLI_OAUTH_CLIENT_ID, scope: SCOPES }),
  });
  const data = await readJson(start);
  if (!start.ok) {
    throw new Error(
      String(
        data.error_description || data.error || 'Failed to start device login',
      ),
    );
  }

  const deviceCode = String(data.device_code || '');
  const userCode = String(data.user_code || '');
  const verificationUri = String(data.verification_uri || '');
  const verificationUriComplete = String(
    data.verification_uri_complete || verificationUri,
  );
  let intervalMs = Math.max(Number(data.interval) || 5, 1) * 1000;
  const expiresAt = Date.now() + (Number(data.expires_in) || 1800) * 1000;

  writeError(`Open ${verificationUriComplete}`);
  writeError(
    `Or visit ${verificationUri} and enter ${formatUserCode(userCode)}`,
  );
  openBrowser(verificationUriComplete);

  while (Date.now() < expiresAt) {
    await sleep(intervalMs);
    const poll = await fetch(authApi('/device/token'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: DEVICE_GRANT,
        device_code: deviceCode,
        client_id: CLI_OAUTH_CLIENT_ID,
      }),
    });
    const token = await readJson(poll);
    const error = String(token.error || '');
    if (error === 'authorization_pending') continue;
    if (error === 'slow_down') {
      intervalMs += 5000;
      continue;
    }
    if (!poll.ok || !token.access_token) {
      throw new Error(
        String(token.error_description || token.error || 'Device login failed'),
      );
    }
    return {
      path: saveAccessToken(String(token.access_token)),
      method: 'device',
    };
  }

  throw new Error('Device login timed out');
}

function pkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  return {
    verifier,
    challenge: createHash('sha256').update(verifier).digest('base64url'),
  };
}

async function registerPublicClient(redirectUri: string): Promise<string> {
  const res = await fetch(authApi('/oauth2/register'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_name: 'Indicia CLI',
      client_uri: 'https://indicia.app',
      redirect_uris: [redirectUri],
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      type: 'native',
      scope: SCOPES,
    }),
  });
  const data = await readJson(res);
  if (!res.ok || !data.client_id) {
    throw new Error(
      String(
        data.error_description ||
          data.error ||
          'Failed to register OAuth client',
      ),
    );
  }
  return String(data.client_id);
}

function startCallbackServer(expectedState: string): Promise<{
  redirectUri: string;
  wait: () => Promise<string>;
  close: () => void;
}> {
  return new Promise((resolveListen, rejectListen) => {
    let resolveCode: (code: string) => void = () => {};
    let rejectCode: (err: Error) => void = () => {};
    const codePromise = new Promise<string>((resolve, reject) => {
      resolveCode = resolve;
      rejectCode = reject;
    });

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end();
        return;
      }
      const error = url.searchParams.get('error');
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      if (error || !code || state !== expectedState) {
        res.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
        res.end(
          '<html><body>Login failed. You can close this window.</body></html>',
        );
        rejectCode(
          new Error(
            error || 'Authorization was denied or the state did not match',
          ),
        );
        return;
      }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(
        '<html><body>Signed in. You can close this window and return to the CLI.</body></html>',
      );
      resolveCode(code);
    });

    server.on('error', rejectListen);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address && typeof address === 'object' ? address.port : 0;
      resolveListen({
        redirectUri: `http://127.0.0.1:${port}/callback`,
        wait: () => codePromise,
        close: () => {
          server.close();
        },
      });
    });
  });
}

export async function loginWithBrowser(): Promise<LoginResult> {
  const state = randomBytes(16).toString('hex');
  const { verifier, challenge } = pkce();
  const callback = await startCallbackServer(state);
  try {
    const clientId = await registerPublicClient(callback.redirectUri);
    const authorize = new URL(authApi('/oauth2/authorize'));
    authorize.searchParams.set('response_type', 'code');
    authorize.searchParams.set('client_id', clientId);
    authorize.searchParams.set('redirect_uri', callback.redirectUri);
    authorize.searchParams.set('scope', SCOPES);
    authorize.searchParams.set('code_challenge', challenge);
    authorize.searchParams.set('code_challenge_method', 'S256');
    authorize.searchParams.set('state', state);
    authorize.searchParams.set('resource', getBaseUrl());

    writeError(`Open ${authorize.toString()}`);
    openBrowser(authorize.toString());

    const code = await callback.wait();
    const tokenRes = await fetch(authApi('/oauth2/token'), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callback.redirectUri,
        client_id: clientId,
        code_verifier: verifier,
        resource: getBaseUrl(),
      }),
    });
    const token = await readJson(tokenRes);
    if (!tokenRes.ok || !token.access_token) {
      throw new Error(
        String(
          token.error_description || token.error || 'Token exchange failed',
        ),
      );
    }
    return {
      path: saveAccessToken(String(token.access_token)),
      method: 'browser',
    };
  } finally {
    callback.close();
  }
}
