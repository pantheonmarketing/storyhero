import { mediaKeyFromReference, publicMediaUrl, putMedia } from './media';
import { reserveKieCredits } from './usage';
import type { Bindings } from './types';

const KIE_API = 'https://api.kie.ai';
const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 45;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

function requireKieKey(env: Bindings): string {
  if (!env.KIE_API_KEY) throw new Error('KIE_API_KEY is not configured');
  return env.KIE_API_KEY;
}

function requireSigningKey(env: Bindings): string {
  if (!env.KIE_REFERENCE_SIGNING_KEY) throw new Error('KIE_REFERENCE_SIGNING_KEY is not configured');
  return env.KIE_REFERENCE_SIGNING_KEY;
}

async function kieRequest(env: Bindings, path: string, init?: RequestInit): Promise<any> {
  const response = await fetch(`${KIE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireKieKey(env)}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });
  const text = await response.text();
  let payload: any = null;
  try { payload = JSON.parse(text); } catch { /* handled below */ }
  if (!response.ok || !payload) {
    throw new Error(`Kie API failed (${response.status}): ${String(payload?.msg || text || response.statusText).slice(0, 240)}`);
  }
  if (!payload.data && payload.success !== true) {
    throw new Error(`Kie API failed: ${String(payload.msg || 'Unknown provider error').slice(0, 240)}`);
  }
  return payload;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function mediaSignature(env: Bindings, expires: number, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(requireSigningKey(env)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(`${expires}:${key}`));
  return bytesToBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

async function kieReferenceUrl(env: Bindings, requestUrl: string, reference: string): Promise<string> {
  const key = mediaKeyFromReference(reference);
  if (key) {
    const expires = Math.floor(Date.now() / 1000) + 10 * 60;
    const url = new URL('/api/provider-media', requestUrl);
    url.searchParams.set('expires', String(expires));
    url.searchParams.set('key', key);
    url.searchParams.set('signature', await mediaSignature(env, expires, key));
    return url.toString();
  }

  const url = new URL(reference);
  if (url.protocol !== 'https:' || url.hostname !== 'assets.skillboss.co') {
    throw new Error('Kie reference image host is not allowed');
  }
  return url.toString();
}

export async function verifyKieMediaRequest(env: Bindings, requestUrl: string): Promise<string | null> {
  const url = new URL(requestUrl);
  const expires = Number(url.searchParams.get('expires'));
  const key = url.searchParams.get('key') || '';
  const signature = url.searchParams.get('signature') || '';
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(expires) || expires < now || expires > now + 15 * 60) return null;
  if (!key || key.includes('..') || (!key.startsWith('private/') && !key.startsWith('public/generated/'))) return null;
  const expected = await mediaSignature(env, expires, key);
  return constantTimeEqual(signature, expected) ? key : null;
}

function cleanFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.[^.]+$/, '');
}

function resultUrl(resultJson: unknown): string | null {
  let result: any = resultJson;
  if (typeof result === 'string') {
    try { result = JSON.parse(result); } catch { return null; }
  }
  const direct = result?.resultUrls?.[0]
    || result?.result_urls?.[0]
    || result?.urls?.[0]
    || result?.images?.[0]?.url
    || result?.url;
  return typeof direct === 'string' ? direct : null;
}

async function submitTask(
  env: Bindings,
  prompt: string,
  imageInputs: string[],
): Promise<string> {
  const payload = await kieRequest(env, '/api/v1/jobs/createTask', {
    method: 'POST',
    body: JSON.stringify({
      model: env.KIE_IMAGE_MODEL || 'nano-banana-2',
      input: {
        prompt,
        image_input: imageInputs,
        aspect_ratio: '1:1',
        resolution: env.KIE_IMAGE_RESOLUTION || '1K',
        output_format: 'png',
      },
    }),
  });
  const taskId = payload?.data?.taskId;
  if (typeof taskId !== 'string' || !taskId) throw new Error('Kie API returned no generation task id');
  return taskId;
}

async function waitForTask(env: Bindings, taskId: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const payload = await kieRequest(env, `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
    const task = payload?.data;
    if (task?.state === 'success') {
      const url = resultUrl(task.resultJson);
      if (!url) throw new Error('Kie completed without an image URL');
      return url;
    }
    if (task?.state === 'fail') {
      throw new Error(`Kie image generation failed${task.failMsg ? `: ${String(task.failMsg).slice(0, 220)}` : ''}`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error('Kie image generation is still processing; retry shortly');
}

function safeRemoteImageUrl(value: string): URL {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  const unsafeHost = host === 'localhost'
    || host === '0.0.0.0'
    || host === '::1'
    || /^127\./.test(host)
    || /^10\./.test(host)
    || /^192\.168\./.test(host)
    || /^169\.254\./.test(host)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (url.protocol !== 'https:' || url.username || url.password || unsafeHost) {
    throw new Error('Kie returned an unsafe result URL');
  }
  return url;
}

export async function generateKieImage(
  env: Bindings,
  requestUrl: string,
  prompt: string,
  references: string[],
  fileName: string,
): Promise<string> {
  const jobKey = cleanFileName(fileName);
  const existing = await env.DB.prepare(
    `SELECT task_id, status, result_url,
            CAST(strftime('%s', 'now') AS INTEGER) - CAST(strftime('%s', created_at) AS INTEGER) AS age_seconds
       FROM image_jobs WHERE job_key = ?1 AND provider = 'kie'`,
  ).bind(jobKey).first<any>();
  if (existing?.status === 'stored' && existing.result_url) return existing.result_url;

  let taskId = existing?.task_id && existing?.status !== 'fail' && Number(existing.age_seconds || 0) < 30 * 60
    ? String(existing.task_id)
    : '';
  if (!taskId) {
    const imageInputs: string[] = [];
    for (const reference of references.slice(0, 4)) {
      imageInputs.push(await kieReferenceUrl(env, requestUrl, reference));
    }
    await reserveKieCredits(env);
    taskId = await submitTask(env, prompt, imageInputs);
    await env.DB.prepare(
      `INSERT INTO image_jobs (job_key, provider, task_id, status, created_at, updated_at)
       VALUES (?1, 'kie', ?2, 'submitted', datetime('now'), datetime('now'))
       ON CONFLICT(job_key) DO UPDATE SET provider = 'kie', task_id = excluded.task_id,
         status = 'submitted', result_url = NULL, error = NULL,
         created_at = datetime('now'), updated_at = datetime('now')`,
    ).bind(jobKey, taskId).run();
  }

  let outputUrl: string;
  try {
    outputUrl = await waitForTask(env, taskId);
  } catch (error: any) {
    const message = String(error?.message || error).slice(0, 300);
    if (!/still processing/i.test(message)) {
      await env.DB.prepare(
        "UPDATE image_jobs SET status = 'fail', error = ?1, updated_at = datetime('now') WHERE job_key = ?2",
      ).bind(message, jobKey).run();
    }
    throw error;
  }

  const output = await fetch(safeRemoteImageUrl(outputUrl));
  if (!output.ok) throw new Error(`Could not download Kie result (${output.status})`);
  const declaredLength = Number(output.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_IMAGE_BYTES) throw new Error('Kie result image is too large');
  const bytes = new Uint8Array(await output.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error('Kie result image is too large');
  const contentType = (output.headers.get('Content-Type') || 'image/png').split(';')[0];
  if (!contentType.startsWith('image/')) throw new Error('Kie returned a non-image result');
  const extension = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';
  const key = `public/generated/${jobKey}.${extension}`;
  await putMedia(env, key, bytes, contentType);
  const storedUrl = publicMediaUrl(requestUrl, key);
  await env.DB.prepare(
    "UPDATE image_jobs SET status = 'stored', result_url = ?1, error = NULL, updated_at = datetime('now') WHERE job_key = ?2",
  ).bind(storedUrl, jobKey).run();
  return storedUrl;
}

export async function kieConnectionStatus(env: Bindings): Promise<{
  configured: boolean;
  balance: number | null;
  error: string | null;
  model: string;
  resolution: string;
  todayCreditsReserved: number;
  todayJobs: number;
  dailyCreditLimit: number;
}> {
  const day = new Date().toISOString().slice(0, 10);
  const usage = await env.DB.prepare(
    "SELECT credits_reserved, jobs FROM provider_usage WHERE provider = 'kie-image' AND day = ?1",
  ).bind(day).first<any>();
  const base = {
    configured: !!env.KIE_API_KEY,
    balance: null as number | null,
    error: null as string | null,
    model: env.KIE_IMAGE_MODEL || 'nano-banana-2',
    resolution: env.KIE_IMAGE_RESOLUTION || '1K',
    todayCreditsReserved: Number(usage?.credits_reserved || 0),
    todayJobs: Number(usage?.jobs || 0),
    dailyCreditLimit: Math.max(1, Number(env.KIE_DAILY_CREDIT_LIMIT || 800)),
  };
  if (!env.KIE_API_KEY) return base;
  try {
    const payload = await kieRequest(env, '/api/v1/chat/credit');
    base.balance = Number(payload.data);
  } catch (error: any) {
    base.error = String(error?.message || error).slice(0, 200);
  }
  return base;
}
