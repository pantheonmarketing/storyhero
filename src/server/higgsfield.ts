import { getHiggsfieldAccessToken, reserveHiggsfieldCredits } from './higgsfieldMcpAuth';
import { loadMediaReference, publicMediaUrl, putMedia } from './media';
import type { Bindings } from './types';

const MCP_ENDPOINT = 'https://mcp.higgsfield.ai/mcp';

function endpoint(env: Bindings): URL {
  const url = new URL(env.HIGGSFIELD_MCP_URL || MCP_ENDPOINT);
  if (url.protocol !== 'https:' || url.hostname !== 'mcp.higgsfield.ai' || url.pathname !== '/mcp') {
    throw new Error('Higgsfield MCP is not configured with an approved endpoint');
  }
  return url;
}

function mcpPayload(text: string): any {
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('data: ')) continue;
    try { return JSON.parse(line.slice(6)); } catch { /* try the next event */ }
  }
  try { return JSON.parse(text); } catch { throw new Error('Higgsfield MCP returned an unreadable response'); }
}

async function mcpRequest(env: Bindings, method: string, params: any): Promise<any> {
  const token = await getHiggsfieldAccessToken(env);
  const response = await fetch(endpoint(env), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: crypto.randomUUID(), method, params }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Higgsfield MCP failed (${response.status})`);
  const payload = mcpPayload(text);
  if (payload?.error) {
    throw new Error(`Higgsfield MCP failed: ${String(payload.error.message || payload.error).slice(0, 240)}`);
  }
  return payload?.result;
}

async function mcpTool(env: Bindings, name: string, args: any): Promise<any> {
  const result = await mcpRequest(env, 'tools/call', { name, arguments: args });
  const message = Array.isArray(result?.content)
    ? result.content.filter((part: any) => part?.type === 'text').map((part: any) => part.text).join('\n')
    : '';
  if (result?.isError || /input validation error|not enough credits|insufficient credits/i.test(message)) {
    throw new Error(`Higgsfield MCP tool ${name} failed: ${message.slice(0, 300)}`);
  }
  return result;
}

async function uploadReference(env: Bindings, reference: string, index: number): Promise<string> {
  const media = await loadMediaReference(env, reference);
  const extension = media.contentType.includes('png') ? 'png' : media.contentType.includes('webp') ? 'webp' : 'jpg';
  const requested = await mcpTool(env, 'media_upload', {
    filename: `storyhero-reference-${index}.${extension}`,
    content_type: media.contentType,
  });
  const upload = requested?.structuredContent?.uploads?.[0];
  if (!upload?.upload_url || !upload?.media_id) throw new Error('Higgsfield MCP returned no media upload target');
  const uploadUrl = new URL(upload.upload_url);
  if (uploadUrl.protocol !== 'https:') throw new Error('Higgsfield MCP returned an unsafe upload URL');
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': media.contentType },
    body: new Uint8Array(media.bytes).buffer,
  });
  if (!response.ok) throw new Error(`Higgsfield media upload failed (${response.status})`);
  await mcpTool(env, 'media_confirm', { media_id: upload.media_id, type: 'image' });
  return upload.media_id;
}

function jobIdFrom(result: any): string | null {
  const first = result?.structuredContent?.results?.[0];
  const direct = first?.job_id || first?.jobId || first?.id;
  if (typeof direct === 'string') return direct;
  const text = Array.isArray(result?.content)
    ? result.content.map((part: any) => part?.text || '').join('\n')
    : '';
  return text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)?.[0] || null;
}

async function waitForImage(env: Bindings, jobId: string): Promise<string> {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const status = await mcpTool(env, 'job_status', { jobId, sync: true });
    const generation = status?.structuredContent?.generation;
    if (generation?.status === 'completed') {
      const url = generation?.results?.rawUrl || generation?.results?.url || generation?.results?.minUrl;
      if (!url) throw new Error('Higgsfield completed without an image URL');
      return url;
    }
    if (['failed', 'canceled', 'nsfw'].includes(generation?.status)) {
      throw new Error(`Higgsfield generation ${generation.status}${generation.error ? `: ${generation.error}` : ''}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error('Higgsfield generation timed out');
}

function cleanFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.[^.]+$/, '');
}

export async function generateHiggsfieldImage(
  env: Bindings,
  requestUrl: string,
  prompt: string,
  references: string[],
  fileName: string,
): Promise<string> {
  const mediaIds: string[] = [];
  for (const [index, reference] of references.slice(0, 8).entries()) {
    mediaIds.push(await uploadReference(env, reference, index));
  }

  // Reserve against a hard owner-defined daily ceiling before the provider can
  // charge the account. Reservations are intentionally not refunded on failure.
  await reserveHiggsfieldCredits(env);
  const submitted = await mcpTool(env, 'generate_image', {
    params: {
      model: env.HIGGSFIELD_IMAGE_MODEL || 'nano_banana_pro',
      prompt,
      count: 1,
      aspect_ratio: '1:1',
      resolution: '1k',
      medias: mediaIds.map((value) => ({ value, role: 'image_references' })),
      get_cost: false,
      use_unlim: false,
    },
  });
  const jobId = jobIdFrom(submitted);
  if (!jobId) throw new Error('Higgsfield MCP returned no generation job id');
  const outputUrl = await waitForImage(env, jobId);
  const parsedOutputUrl = new URL(outputUrl);
  if (parsedOutputUrl.protocol !== 'https:') throw new Error('Higgsfield returned an unsafe result URL');
  const output = await fetch(parsedOutputUrl);
  if (!output.ok) throw new Error(`Could not download Higgsfield result (${output.status})`);
  const contentType = output.headers.get('Content-Type') || 'image/png';
  const extension = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';
  const key = `public/generated/${cleanFileName(fileName)}.${extension}`;
  await putMedia(env, key, new Uint8Array(await output.arrayBuffer()), contentType);
  return publicMediaUrl(requestUrl, key);
}
