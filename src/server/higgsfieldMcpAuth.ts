import type { Bindings } from './types';

const PROVIDER = 'higgsfield-mcp';
const DEFAULT_MCP_ORIGIN = 'https://mcp.higgsfield.ai';
const OAUTH_SCOPE = 'openid email offline_access';

type ConnectionRow = {
  client_id: string | null;
  client_secret_enc: string | null;
  access_token_enc: string | null;
  refresh_token_enc: string | null;
  expires_at: number | null;
  oauth_state: string | null;
  code_verifier_enc: string | null;
  account_email: string | null;
  updated_at: string | null;
};

function mcpOrigin(env: Bindings): URL {
  const url = new URL(env.HIGGSFIELD_MCP_URL || `${DEFAULT_MCP_ORIGIN}/mcp`);
  if (url.protocol !== 'https:' || url.hostname !== 'mcp.higgsfield.ai') {
    throw new Error('Higgsfield MCP is not configured with an approved endpoint');
  }
  return new URL(url.origin);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function randomUrlSafe(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

async function tokenKey(env: Bindings): Promise<CryptoKey> {
  if (!env.HIGGSFIELD_TOKEN_ENCRYPTION_KEY) {
    throw new Error('Higgsfield MCP is not configured: missing token encryption key');
  }
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(env.HIGGSFIELD_TOKEN_ENCRYPTION_KEY),
  );
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encrypt(env: Bindings, value: string): Promise<string> {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await tokenKey(env),
    new TextEncoder().encode(value),
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return bytesToBase64Url(combined);
}

async function decrypt(env: Bindings, value: string | null): Promise<string | null> {
  if (!value) return null;
  const combined = base64UrlToBytes(value);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: combined.slice(0, 12) },
    await tokenKey(env),
    combined.slice(12),
  );
  return new TextDecoder().decode(decrypted);
}

async function connection(db: D1Database): Promise<ConnectionRow | null> {
  return db.prepare(
    `SELECT client_id, client_secret_enc, access_token_enc, refresh_token_enc,
            expires_at, oauth_state, code_verifier_enc, account_email, updated_at
       FROM provider_connections WHERE provider = ?1`,
  ).bind(PROVIDER).first<ConnectionRow>();
}

async function jsonRequest(url: URL, init: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  const text = await response.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { error_description: text }; }
  if (!response.ok) {
    const detail = body?.error_description || body?.error || body?.detail || text || response.statusText;
    throw new Error(`Higgsfield OAuth failed (${response.status}): ${String(detail).slice(0, 240)}`);
  }
  return body;
}

async function registerClient(env: Bindings, callbackUrl: string): Promise<{ clientId: string; clientSecret: string | null }> {
  const origin = mcpOrigin(env);
  const result = await jsonRequest(new URL('/oauth2/register', origin), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_name: 'StoryHero',
      redirect_uris: [callbackUrl],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      scope: OAUTH_SCOPE,
    }),
  });
  if (!result?.client_id) throw new Error('Higgsfield OAuth returned no client id');
  return { clientId: result.client_id, clientSecret: result.client_secret || null };
}

function callbackFor(requestUrl: string): string {
  return new URL('/api/admin/higgsfield/callback', new URL(requestUrl).origin).toString();
}

export async function beginHiggsfieldOAuth(env: Bindings, requestUrl: string): Promise<string> {
  const callbackUrl = callbackFor(requestUrl);
  let row = await connection(env.DB);
  let clientId = row?.client_id || null;
  let clientSecretEnc = row?.client_secret_enc || null;

  if (!clientId) {
    const registered = await registerClient(env, callbackUrl);
    clientId = registered.clientId;
    clientSecretEnc = registered.clientSecret ? await encrypt(env, registered.clientSecret) : null;
  }

  const state = randomUrlSafe(24);
  const verifier = randomUrlSafe(48);
  const challengeBytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const challenge = bytesToBase64Url(challengeBytes);

  await env.DB.prepare(
    `INSERT INTO provider_connections
       (provider, client_id, client_secret_enc, oauth_state, code_verifier_enc, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))
     ON CONFLICT(provider) DO UPDATE SET
       client_id = excluded.client_id,
       client_secret_enc = excluded.client_secret_enc,
       oauth_state = excluded.oauth_state,
       code_verifier_enc = excluded.code_verifier_enc,
       updated_at = datetime('now')`,
  ).bind(PROVIDER, clientId, clientSecretEnc, state, await encrypt(env, verifier)).run();

  const authorize = new URL('/oauth2/authorize', mcpOrigin(env));
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', callbackUrl);
  authorize.searchParams.set('scope', OAUTH_SCOPE);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('code_challenge', challenge);
  authorize.searchParams.set('code_challenge_method', 'S256');
  return authorize.toString();
}

async function exchangeToken(env: Bindings, params: Record<string, string>, clientSecret: string | null): Promise<any> {
  const body = new URLSearchParams(params);
  if (clientSecret) body.set('client_secret', clientSecret);
  return jsonRequest(new URL('/oauth2/token', mcpOrigin(env)), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

function emailFromIdToken(idToken: unknown): string | null {
  if (typeof idToken !== 'string') return null;
  try {
    const payload = idToken.split('.')[1];
    if (!payload) return null;
    const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    return typeof parsed.email === 'string' ? parsed.email.toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function finishHiggsfieldOAuth(
  env: Bindings,
  requestUrl: string,
  code: string,
  state: string,
): Promise<void> {
  const row = await connection(env.DB);
  if (!row?.client_id || !row.oauth_state || row.oauth_state !== state || !row.code_verifier_enc) {
    throw new Error('Higgsfield OAuth state is invalid or expired');
  }
  const verifier = await decrypt(env, row.code_verifier_enc);
  const clientSecret = await decrypt(env, row.client_secret_enc);
  if (!verifier) throw new Error('Higgsfield OAuth verifier is missing');

  const token = await exchangeToken(env, {
    grant_type: 'authorization_code',
    code,
    client_id: row.client_id,
    redirect_uri: callbackFor(requestUrl),
    code_verifier: verifier,
  }, clientSecret);
  if (!token?.access_token) throw new Error('Higgsfield OAuth returned no access token');

  await env.DB.prepare(
    `UPDATE provider_connections SET
       access_token_enc = ?1,
       refresh_token_enc = COALESCE(?2, refresh_token_enc),
       expires_at = ?3,
       account_email = COALESCE(?4, account_email),
       oauth_state = NULL,
       code_verifier_enc = NULL,
       updated_at = datetime('now')
     WHERE provider = ?5`,
  ).bind(
    await encrypt(env, token.access_token),
    token.refresh_token ? await encrypt(env, token.refresh_token) : null,
    Math.floor(Date.now() / 1000) + Number(token.expires_in || 3600),
    emailFromIdToken(token.id_token),
    PROVIDER,
  ).run();
}

export async function getHiggsfieldAccessToken(env: Bindings): Promise<string> {
  if (env.HIGGSFIELD_MCP_ACCESS_TOKEN) return env.HIGGSFIELD_MCP_ACCESS_TOKEN;
  const row = await connection(env.DB);
  if (!row?.access_token_enc) {
    throw new Error('Higgsfield MCP is not configured: connect the owner account in /admin');
  }
  if ((row.expires_at || 0) > Math.floor(Date.now() / 1000) + 90) {
    const current = await decrypt(env, row.access_token_enc);
    if (current) return current;
  }
  const refreshToken = await decrypt(env, row.refresh_token_enc);
  if (!refreshToken || !row.client_id) {
    throw new Error('Higgsfield MCP connection expired: reconnect the owner account in /admin');
  }
  const refreshed = await exchangeToken(env, {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: row.client_id,
  }, await decrypt(env, row.client_secret_enc));
  if (!refreshed?.access_token) throw new Error('Higgsfield OAuth refresh returned no access token');
  await env.DB.prepare(
    `UPDATE provider_connections SET access_token_enc = ?1,
       refresh_token_enc = COALESCE(?2, refresh_token_enc), expires_at = ?3,
       updated_at = datetime('now') WHERE provider = ?4`,
  ).bind(
    await encrypt(env, refreshed.access_token),
    refreshed.refresh_token ? await encrypt(env, refreshed.refresh_token) : null,
    Math.floor(Date.now() / 1000) + Number(refreshed.expires_in || 3600),
    PROVIDER,
  ).run();
  return refreshed.access_token;
}

export async function reserveHiggsfieldCredits(env: Bindings): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const cost = Math.max(1, Number(env.HIGGSFIELD_CREDITS_PER_IMAGE || 2));
  const limit = Math.max(cost, Number(env.HIGGSFIELD_DAILY_CREDIT_LIMIT || 100));
  await env.DB.prepare(
    'INSERT INTO provider_usage (provider, day, credits_reserved, jobs) VALUES (?1, ?2, 0, 0) ON CONFLICT(provider, day) DO NOTHING',
  ).bind(PROVIDER, day).run();
  const reserved = await env.DB.prepare(
    `UPDATE provider_usage
        SET credits_reserved = credits_reserved + ?1, jobs = jobs + 1
      WHERE provider = ?2 AND day = ?3 AND credits_reserved + ?1 <= ?4`,
  ).bind(cost, PROVIDER, day, limit).run();
  if (!(reserved.meta?.changes ?? 0)) {
    throw new Error(`Higgsfield daily credit safety limit reached (${limit} credits)`);
  }
}

export async function higgsfieldConnectionStatus(env: Bindings): Promise<{
  connected: boolean;
  accountEmail: string | null;
  expiresAt: number | null;
  todayCreditsReserved: number;
  todayJobs: number;
  dailyLimit: number;
}> {
  const row = await connection(env.DB);
  const day = new Date().toISOString().slice(0, 10);
  const usage = await env.DB.prepare(
    'SELECT credits_reserved, jobs FROM provider_usage WHERE provider = ?1 AND day = ?2',
  ).bind(PROVIDER, day).first<any>();
  return {
    connected: !!(env.HIGGSFIELD_MCP_ACCESS_TOKEN || row?.access_token_enc),
    accountEmail: row?.account_email || null,
    expiresAt: row?.expires_at || null,
    todayCreditsReserved: Number(usage?.credits_reserved || 0),
    todayJobs: Number(usage?.jobs || 0),
    dailyLimit: Math.max(1, Number(env.HIGGSFIELD_DAILY_CREDIT_LIMIT || 100)),
  };
}
