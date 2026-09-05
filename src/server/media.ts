import type { Bindings } from './types';

export type MediaPayload = {
  bytes: Uint8Array;
  contentType: string;
};

export function decodeBase64(value: string): Uint8Array {
  const clean = value.includes(',') ? value.slice(value.indexOf(',') + 1) : value;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function publicMediaUrl(requestUrl: string, key: string): string {
  return new URL(`/media/${key}`, requestUrl).toString();
}

export async function putMedia(
  env: Bindings,
  key: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void> {
  await env.MEDIA.put(key, bytes, {
    httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
  });
}

export async function putBase64Media(
  env: Bindings,
  key: string,
  base64: string,
  contentType: string,
): Promise<void> {
  await putMedia(env, key, decodeBase64(base64), contentType);
}

export function mediaKeyFromReference(reference: string): string | null {
  if (reference.startsWith('r2://')) return reference.slice(5);
  try {
    const url = new URL(reference);
    if (url.pathname.startsWith('/media/')) return decodeURIComponent(url.pathname.slice('/media/'.length));
  } catch {
    return null;
  }
  return null;
}

export function detectMediaContentType(bytes: Uint8Array, declared?: string | null): string {
  const normalized = String(declared || '').split(';')[0].trim().toLowerCase();
  if (normalized.startsWith('image/') || normalized.startsWith('audio/')) return normalized;
  if (bytes.length >= 8
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 12
    && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP') return 'image/webp';
  if (bytes.length >= 6) {
    const signature = String.fromCharCode(...bytes.subarray(0, 6));
    if (signature === 'GIF87a' || signature === 'GIF89a') return 'image/gif';
  }
  return normalized || 'application/octet-stream';
}

export async function loadMediaReference(env: Bindings, reference: string): Promise<MediaPayload> {
  const key = mediaKeyFromReference(reference);
  if (key) {
    const object = await env.MEDIA.get(key);
    if (!object) throw new Error(`Stored media not found: ${key}`);
    const bytes = new Uint8Array(await object.arrayBuffer());
    return {
      bytes,
      contentType: detectMediaContentType(bytes, object.httpMetadata?.contentType),
    };
  }

  let url: URL;
  try {
    url = new URL(reference);
  } catch {
    throw new Error('Invalid media reference');
  }
  if (url.protocol !== 'https:' || url.hostname !== 'assets.skillboss.co') {
    throw new Error('External media host is not allowed');
  }
  const response = await fetch(url, { cf: { cacheEverything: true, cacheTtl: 86400 } } as RequestInit);
  if (!response.ok) throw new Error(`Could not load legacy media (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  return {
    bytes,
    contentType: detectMediaContentType(bytes, response.headers.get('Content-Type')),
  };
}

/** Delete StoryHero-owned R2 objects referenced by DB rows. Legacy external
 * assets are ignored because StoryHero does not own them. */
export async function deleteMediaReferences(env: Bindings, references: Array<string | null | undefined>): Promise<number> {
  const keys = [...new Set(references.map((value) => value ? mediaKeyFromReference(value) : null).filter(Boolean) as string[])];
  if (!keys.length) return 0;
  await env.MEDIA.delete(keys);
  return keys.length;
}

export function mediaObjectResponse(object: R2ObjectBody): Response {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', object.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
