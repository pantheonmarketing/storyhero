import type { Bindings } from './types';

async function hashIdentity(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function reserveWindowedRequest(
  env: Bindings,
  scope: string,
  identity: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const identityHash = await hashIdentity(identity);
  await env.DB.prepare(
    `INSERT INTO request_limits (scope, identity_hash, window_start, count)
     VALUES (?1, ?2, ?3, 0) ON CONFLICT(scope, identity_hash, window_start) DO NOTHING`,
  ).bind(scope, identityHash, windowStart).run();
  const result = await env.DB.prepare(
    `UPDATE request_limits SET count = count + 1
     WHERE scope = ?1 AND identity_hash = ?2 AND window_start = ?3 AND count < ?4`,
  ).bind(scope, identityHash, windowStart, limit).run();
  return !!(result.meta?.changes ?? 0);
}

export async function reserveGeminiImage(env: Bindings): Promise<void> {
  const provider = 'gemini-image';
  const day = new Date().toISOString().slice(0, 10);
  const limit = Math.max(1, Number(env.GEMINI_DAILY_IMAGE_LIMIT || 100));
  await env.DB.prepare(
    'INSERT INTO provider_usage (provider, day, credits_reserved, jobs) VALUES (?1, ?2, 0, 0) ON CONFLICT(provider, day) DO NOTHING',
  ).bind(provider, day).run();
  const result = await env.DB.prepare(
    `UPDATE provider_usage SET credits_reserved = credits_reserved + 1, jobs = jobs + 1
     WHERE provider = ?1 AND day = ?2 AND jobs < ?3`,
  ).bind(provider, day, limit).run();
  if (!(result.meta?.changes ?? 0)) {
    throw new Error(`Gemini daily image safety limit reached (${limit} images)`);
  }
}
