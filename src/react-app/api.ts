// Typed fetch helpers for the StoryHero API

export interface Child {
  id: string; name: string; age: number; gender: 'boy' | 'girl';
  photo_url: string; hero_url: string | null; hero_style?: string | null;
  guardian_consent_at?: string | null;
}
export interface Book {
  id: string; child_id: string; story_id: string; title_th: string; title_en: string;
  status: 'writing' | 'illustrating' | 'done'; pages_total: number; pages_done: number;
  cover_url: string | null; error: string | null; child_name?: string;
  mode?: 'classic' | 'custom' | 'phonics'; phonics_group?: number | null; custom_brief?: string | null;
  reading_age?: number | null;
  public_gallery?: number; share_enabled?: number;
}
export interface Page {
  idx: number; text_th: string; text_en: string; image_url: string | null; status?: string;
  audio_url_th?: string | null; audio_url_en?: string | null;
}
export interface BookFull extends Book { pages: Page[]; child?: Child; dedication?: string | null }
export interface GalleryItem {
  id: string; story_id: string; title_th: string; title_en: string;
  cover_url: string; child_name: string;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = (j as any).error || msg; } catch { /* noop */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  children: () => req<Child[]>('/api/children'),
  createChild: (data: { name: string; age: number; gender: string; photo_b64: string; guardian_consent: boolean }) =>
    req<Child>('/api/children', { method: 'POST', body: JSON.stringify(data) }),
  deleteChild: (childId: string, confirmation: string) =>
    req<{ success: boolean }>(`/api/children/${childId}`, { method: 'DELETE', body: JSON.stringify({ confirmation }) }),
  generateHero: (childId: string, style?: string) =>
    req<Child>(`/api/children/${childId}/hero`, { method: 'POST', body: JSON.stringify({ style }) }),
  books: () => req<Book[]>('/api/books'),
  createBook: (
    child_id: string,
    story_id: string,
    extras?: {
      dedication?: string; friend_name?: string; art_style?: string;
      mode?: 'classic' | 'custom' | 'phonics'; brief?: string; theme?: string;
      reading_level?: string; page_count?: number;
      phonics_group?: number;
      reading_age?: number;
      world?: string; friend?: string; villain?: string;
    },
  ) => req<Book>('/api/books', { method: 'POST', body: JSON.stringify({ child_id, story_id, ...extras }) }),
  pageAudio: (bookId: string, idx: number, lang: 'th' | 'en') =>
    req<{ url: string }>(`/api/books/${bookId}/pages/${idx}/audio`, { method: 'POST', body: JSON.stringify({ lang }) }),
  packageInterest: (pkg: string, contact: string) =>
    req<{ success: boolean }>('/api/package-interest', { method: 'POST', body: JSON.stringify({ package: pkg, contact }) }),
  nextPage: (bookId: string) =>
    req<{ done: boolean; retry?: boolean; error?: string; idx?: number; book: Book }>(
      `/api/books/${bookId}/pages/next`, { method: 'POST', body: JSON.stringify({}) }),
  book: (id: string) => req<BookFull>(`/api/books/${id}`),
  sharedBook: (id: string) => req<BookFull>(`/api/share/${id}`),
  setBookShare: (id: string, enabled: boolean) =>
    req<{ success: boolean; share_enabled: number }>(`/api/books/${id}/share`, { method: 'POST', body: JSON.stringify({ enabled }) }),
  gallery: (limit = 8) => req<GalleryItem[]>(`/api/gallery?limit=${limit}`),
  printOrder: (bookId: string, contact: string) =>
    req<{ success: boolean }>(`/api/books/${bookId}/print-order`, { method: 'POST', body: JSON.stringify({ contact }) }),
  credits: () => req<{
    credits: number; unlimited: boolean; approved: boolean; approvedAt: string | null;
    bookLimit: number | null; booksUsed: number; booksRemaining: number | null;
  }>('/api/credits'),
  deleteAccount: (confirmation: string) =>
    req<{ success: boolean }>('/api/users/me', { method: 'DELETE', body: JSON.stringify({ confirmation }) }),
  adminUsers: () => req<AdminUser[]>('/api/admin/users'),
  adminGrant: (email: string, delta: number, reason?: string) =>
    req<{ success: boolean; email: string; credits: number }>('/api/admin/credits', { method: 'POST', body: JSON.stringify({ email, delta, reason }) }),
  adminLedger: (email?: string) =>
    req<LedgerEntry[]>(`/api/admin/ledger${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  adminBan: (email: string, banned: boolean) =>
    req<{ success: boolean; email: string; banned: boolean }>('/api/admin/ban', { method: 'POST', body: JSON.stringify({ email, banned }) }),
  adminApprove: (email: string, approved: boolean) =>
    req<{ success: boolean; email: string; approved: boolean; booksRemaining: number | null }>('/api/admin/approve', { method: 'POST', body: JSON.stringify({ email, approved }) }),
  adminDeleteUser: (email: string) =>
    req<{ success: boolean; email: string }>('/api/admin/delete-user', { method: 'POST', body: JSON.stringify({ email }) }),
  adminKieStatus: () => req<KieStatus>('/api/admin/kie/status'),
};

export interface AdminUser {
  email: string; credits: number; books: number; children: number;
  books_remaining: number | null; unlimited: boolean; last_book_at: string | null; approved: number;
  approved_at: string | null; approved_by: string | null; banned: number; signup: string | null;
}
export interface LedgerEntry {
  id: string; email: string; delta: number; reason: string | null; admin_email: string | null; created_at: string;
}
export interface KieStatus {
  configured: boolean;
  balance: number | null;
  error: string | null;
  model: string;
  resolution: string;
  todayCreditsReserved: number;
  todayJobs: number;
  dailyCreditLimit: number;
}

/** Downscale + JPEG-compress an image file client-side, return base64 (no data: prefix). */
export function fileToResizedBase64(file: File, maxDim = 896): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}
