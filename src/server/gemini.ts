import { encodeBase64, loadMediaReference, publicMediaUrl, putMedia } from './media';
import type { Bindings } from './types';
import { generateHiggsfieldImage } from './higgsfield';

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models';

function requireGeminiKey(env: Bindings): string {
  if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
  return env.GEMINI_API_KEY;
}

async function geminiRequest(
  env: Bindings,
  model: string,
  body: unknown,
  options: { maxAttempts?: number; timeoutMs?: number } = {},
): Promise<any> {
  const maxAttempts = Math.max(1, options.maxAttempts || 3);
  const timeoutMs = Math.max(5_000, options.timeoutMs || 45_000);
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(`${GEMINI_API}/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': requireGeminiKey(env),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error: any) {
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (2 ** attempt)));
        continue;
      }
      throw new Error(`Gemini ${model} request timed out or failed: ${String(error?.message || error).slice(0, 180)}`);
    }
    const text = await response.text();
    if (response.ok) return JSON.parse(text);

    let detail = text;
    try { detail = JSON.parse(text)?.error?.message || text; } catch { /* keep raw error */ }
    const retryable = (response.status === 429 || response.status === 503) && !/limit:\s*0/i.test(detail);
    if (retryable && attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 800 * (2 ** attempt)));
      continue;
    }
    throw new Error(`Gemini ${model} failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  throw new Error(`Gemini ${model} failed after retries`);
}

function responseParts(output: any): any[] {
  return output?.candidates?.[0]?.content?.parts || [];
}

function inlinePart(parts: any[]): { data: string; mimeType: string } | null {
  for (const part of parts) {
    const value = part?.inlineData || part?.inline_data;
    if (value?.data) return { data: value.data, mimeType: value.mimeType || value.mime_type || 'application/octet-stream' };
  }
  return null;
}

function cleanFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function imageExtension(mimeType: string): string {
  if (mimeType.includes('jpeg')) return 'jpg';
  if (mimeType.includes('webp')) return 'webp';
  return 'png';
}

function isGeminiFallbackError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /user location is not supported for the api use/i.test(message)
    || /request timed out or failed/i.test(message)
    || /failed \((?:429|500|502|503|504)\)/i.test(message)
    || /returned no image/i.test(message)
  );
}

export async function generateImage(
  env: Bindings,
  requestUrl: string,
  prompt: string,
  references: string[],
  fileName: string,
): Promise<string> {
  if (env.IMAGE_PROVIDER === 'higgsfield') {
    return generateHiggsfieldImage(env, requestUrl, prompt, references, fileName);
  }
  try {
    const parts: any[] = [{ text: prompt }];
    for (const reference of references) {
      const media = await loadMediaReference(env, reference);
      parts.push({ inlineData: { mimeType: media.contentType, data: encodeBase64(media.bytes) } });
    }

    const model = env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
    const output = await geminiRequest(env, model, {
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: '1:1' },
      },
    }, { maxAttempts: 1, timeoutMs: 45_000 });
    const image = inlinePart(responseParts(output));
    if (!image || !image.mimeType.startsWith('image/')) {
      const message = responseParts(output).map((part) => part?.text).filter(Boolean).join(' ').slice(0, 200);
      throw new Error(`Gemini returned no image${message ? `: ${message}` : ''}`);
    }

    const stem = cleanFileName(fileName.replace(/\.[^.]+$/, ''));
    const key = `public/generated/${stem}.${imageExtension(image.mimeType)}`;
    await putMedia(env, key, new Uint8Array(atob(image.data).split('').map((char) => char.charCodeAt(0))), image.mimeType);
    return publicMediaUrl(requestUrl, key);
  } catch (error) {
    if (env.IMAGE_FALLBACK_PROVIDER !== 'higgsfield' || !isGeminiFallbackError(error)) throw error;
    const primaryDetail = error instanceof Error ? error.message : String(error);
    console.warn(`Gemini image generation is temporarily unavailable; falling back to Higgsfield. ${primaryDetail.slice(0, 180)}`);
    try {
      return await generateHiggsfieldImage(env, requestUrl, prompt, references, fileName);
    } catch (fallbackError) {
      const detail = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      throw new Error(`Gemini image generation failed and the Higgsfield fallback also failed: ${detail.slice(0, 220)}`);
    }
  }
}

export async function generateJson(env: Bindings, prompt: string): Promise<any> {
  const model = env.GEMINI_TEXT_MODEL || 'gemini-3.7-flash';
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  };
  const parseOutput = (output: any): any => {
    let text = responseParts(output).map((part) => part?.text).filter(Boolean).join('').trim();
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) text = fence[1].trim();

    // Models occasionally append a second object or commentary after otherwise
    // valid JSON. Extract the first complete object while respecting braces in
    // quoted strings instead of slicing from the first "{" to the last "}".
    const start = text.indexOf('{');
    if (start >= 0) {
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let i = start; i < text.length; i += 1) {
        const char = text[i];
        if (inString) {
          if (escaped) escaped = false;
          else if (char === '\\') escaped = true;
          else if (char === '"') inString = false;
          continue;
        }
        if (char === '"') inString = true;
        else if (char === '{') depth += 1;
        else if (char === '}') {
          depth -= 1;
          if (depth === 0) return JSON.parse(text.slice(start, i + 1));
        }
      }
    }
    return JSON.parse(text);
  };

  let output: any;
  try {
    output = await geminiRequest(env, model, body, { maxAttempts: 1, timeoutMs: 25_000 });
    return parseOutput(output);
  } catch (error) {
    const fallback = env.GEMINI_TEXT_FALLBACK_MODEL || 'gemini-3.1-flash-lite';
    if (fallback === model) throw error;
    output = await geminiRequest(env, fallback, body, { maxAttempts: 3, timeoutMs: 45_000 });
    return parseOutput(output);
  }
}

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
}

function pcmToWav(pcm: Uint8Array, sampleRate = 24000): Uint8Array {
  const wav = new Uint8Array(44 + pcm.length);
  const view = new DataView(wav.buffer);
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm.length, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, pcm.length, true);
  wav.set(pcm, 44);
  return wav;
}

export async function generateSpeech(
  env: Bindings,
  requestUrl: string,
  text: string,
  language: 'th' | 'en',
  fileName: string,
): Promise<string> {
  const model = env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
  const fallbackModel = env.GEMINI_TTS_FALLBACK_MODEL || 'gemini-2.5-flash-preview-tts';
  const direction = language === 'th'
    ? 'Read naturally in warm, expressive Thai for a young child.'
    : 'Read naturally in warm, expressive English for a young child.';
  const body = {
    contents: [{ role: 'user', parts: [{ text: `${direction}\n\n${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  };
  const models = [...new Set([model, fallbackModel])];
  let output: any = null;
  let lastError: unknown = null;
  for (let i = 0; i < models.length; i += 1) {
    try {
      output = await geminiRequest(env, models[i], body, {
        maxAttempts: 1,
        timeoutMs: 60_000,
      });
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!output) throw lastError instanceof Error ? lastError : new Error('Narration generation failed');
  const audio = inlinePart(responseParts(output));
  if (!audio || !audio.mimeType.startsWith('audio/')) throw new Error('Gemini returned no narration audio');

  const raw = new Uint8Array(atob(audio.data).split('').map((char) => char.charCodeAt(0)));
  const isPcm = /L16|pcm/i.test(audio.mimeType);
  const bytes = isPcm ? pcmToWav(raw, Number(audio.mimeType.match(/rate=(\d+)/)?.[1] || 24000)) : raw;
  const contentType = isPcm ? 'audio/wav' : audio.mimeType.split(';')[0];
  const extension = contentType.includes('mpeg') ? 'mp3' : contentType.includes('ogg') ? 'ogg' : 'wav';
  const stem = cleanFileName(fileName.replace(/\.[^.]+$/, ''));
  const key = `public/audio/${stem}.${extension}`;
  await putMedia(env, key, bytes, contentType);
  return publicMediaUrl(requestUrl, key);
}
