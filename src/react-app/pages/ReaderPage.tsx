import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { Share2, Download, Palette, Volume2, Star, Heart, ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';
import { api, BookFull, Page } from '../api';
import { useLang } from '../i18n';
import { getStory } from '../../shared/stories';
import { phonicsTargetSegments } from '../../shared/phonics';

const proxied = (u: string) => `/api/img?u=${encodeURIComponent(u)}`;

/** Text size that fills the page nicely: short page text gets big storybook type. */
function fitFont(text: string, combo: boolean): string {
  const len = (text || '').length;
  if (combo) return len <= 90 ? '1.18rem' : len <= 150 ? '1.06rem' : '0.96rem';
  return len <= 90 ? '1.6rem' : len <= 150 ? '1.4rem' : len <= 220 ? '1.22rem' : '1.08rem';
}

function PhonicsEnglishLine({ text, group }: { text: string; group?: number | null }) {
  return <>{phonicsTargetSegments(group, text).map((chunk, index) => chunk.target
    ? <span className="phonics-target-letter" key={`${index}-${chunk.text}`}>{chunk.text}</span>
    : <span key={`${index}-${chunk.text}`}>{chunk.text}</span>
  )}</>;
}

export function ReaderPage({ shared = false }: { shared?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLang();
  const [book, setBook] = useState<BookFull | null>(null);
  const [error, setError] = useState('');
  const [flipIdx, setFlipIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState('');
  const [orderState, setOrderState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [audioSrc, setAudioSrc] = useState('');
  const [audioBusy, setAudioBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [coloringPdfBusy, setColoringPdfBusy] = useState(false);
  const flipRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Deduplicates concurrent audio generation: the background prefetcher and a user
  // click on the same page share one in-flight request instead of generating twice.
  const audioInflight = useRef<Map<string, Promise<string>>>(new Map());
  // Phones get combined image+text sheets (one flip per page); tablet+ keeps the
  // classic two-page spread (image left, text right). Decided once at mount.
  const [mobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    if (!id) return;
    (shared ? api.sharedBook(id) : api.book(id))
      .then(setBook)
      .catch((e) => setError(e.message));
  }, [id, shared]);

  const storyPages = useMemo(() => (book?.pages || []).filter((p) => p.idx > 0), [book]);
  const cover = book?.pages?.find((p) => p.idx === 0);
  const story = book ? getStory(book.story_id) : undefined;

  // Memoize flipbook sheets — recreating children on re-render resets react-pageflip
  const sheets = useMemo(() => {
    if (!book) return [];
    const primary = (p: Page) => (lang === 'th' ? p.text_th : p.text_en) || '';
    const isPhonics = book.mode === 'phonics';
    const isPractice = (p: Page) => isPhonics && p.idx === storyPages.length;
    const primaryLine = (p: Page) => lang === 'en' && isPhonics
      ? <PhonicsEnglishLine text={p.text_en} group={book.phonics_group} />
      : primary(p);
    const secondaryLine = (p: Page) => lang === 'th' && isPhonics
      ? <PhonicsEnglishLine text={p.text_en} group={book.phonics_group} />
      : (lang === 'th' ? p.text_en : p.text_th);
    const practiceLabel = (p: Page) => isPractice(p)
      ? <div className="phonics-practice-label"><Star size={13} /> {t('phonicsPracticeLabel')}</div>
      : null;
    const moral = (p: Page) =>
      p.idx === storyPages.length && story ? (
        <div style={{ marginTop: 8, fontSize: '.85rem', background: 'var(--cream)', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Star size={14} className="moral-star" /> {lang === 'th' ? story.moralTh : story.moralEn}
        </div>
      ) : null;
    const pageSheets = mobile
      ? // Phone: one sheet per page — illustration on top, text right under it
        storyPages.map((p) => (
          <div className="flip-page combo-page" key={`c${p.idx}`}>
            {p.image_url
              ? <img className="combo-img" src={p.image_url} alt="" loading="lazy" />
              : <div className="spin-stage combo-img"><div className="spinner" /></div>}
            <div className="txt">
              {practiceLabel(p)}
              <div className={`th ${isPractice(p) ? 'phonics-practice-text' : ''}`} style={{ fontSize: fitFont(primary(p), true) }}>{primaryLine(p)}</div>
              <div className="en">{secondaryLine(p)}</div>
              {moral(p)}
            </div>
            <div className="pageno">— {p.idx} —</div>
          </div>
        ))
      : // Tablet/desktop: classic spread — image sheet + facing text sheet
        storyPages.flatMap((p) => [
          <div className="flip-page img-page" key={`i${p.idx}`}>
            {p.image_url
              ? <img src={p.image_url} alt="" loading="lazy" />
              : <div className="spin-stage"><div className="spinner" /></div>}
          </div>,
          <div className="flip-page" key={`t${p.idx}`}>
            <div className="txt">
              {practiceLabel(p)}
              <div className={`th ${isPractice(p) ? 'phonics-practice-text' : ''}`} style={{ fontSize: fitFont(primary(p), false) }}>{primaryLine(p)}</div>
              <div className="en">{secondaryLine(p)}</div>
              {moral(p)}
            </div>
            <div className="pageno">— {p.idx} —</div>
          </div>,
        ]);
    return [
      <div className="flip-cover flip-front-cover" key="cover">
        {book.cover_url && <img src={book.cover_url} alt="" />}
        <div className="cov-t">
          <div className="t1">{book.title_th}</div>
          <div className="t2">{book.title_en}</div>
        </div>
      </div>,
      ...pageSheets,
      <div className="flip-cover" key="back">
        <div className="cov-t" style={{ height: '100%' }}>
          <div className="t1">~ {t('theEnd')} ~</div>
          {book.dedication && (
            <div className="t2" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <Heart size={13} fill="currentColor" /> {book.dedication}
            </div>
          )}
          <div className="t2" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <BookOpen size={14} /> StoryHero
          </div>
        </div>
      </div>,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, storyPages, lang, mobile]);

  // Flip sheet 0 = cover. Desktop: each story page = two sheets (image, text).
  // Mobile combo: each story page = one sheet.
  const currentStoryIdx = mobile
    ? Math.min(flipIdx, storyPages.length)
    : flipIdx === 0 ? 0 : Math.min(Math.ceil(flipIdx / 2), storyPages.length);
  const currentPage: Page | undefined =
    currentStoryIdx > 0 ? storyPages[currentStoryIdx - 1] : undefined;
  const canBrowserNarrate = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Returns the page's narration URL, generating (once) if needed. Shared by the
  // click handler and the background prefetcher.
  const ensureAudio = (pg: Page, l: 'th' | 'en'): Promise<string> => {
    const cached = l === 'th' ? pg.audio_url_th : pg.audio_url_en;
    if (cached) return Promise.resolve(cached);
    if (shared || !book) return Promise.reject(new Error('audio not available'));
    const key = `${pg.idx}-${l}`;
    let p = audioInflight.current.get(key);
    if (!p) {
      p = api.pageAudio(book.id, pg.idx, l)
        .then((res) => {
          if (l === 'th') pg.audio_url_th = res.url; else pg.audio_url_en = res.url;
          return res.url;
        })
        .finally(() => audioInflight.current.delete(key));
      audioInflight.current.set(key, p);
    }
    return p;
  };

  const playAudio = async (pg: Page | undefined, l: 'th' | 'en') => {
    if (!pg || !book) return;
    try {
      setAudioBusy(true);
      const url = await ensureAudio(pg, l);
      window.speechSynthesis?.cancel();
      setAudioSrc(url);
      setTimeout(() => audioRef.current?.play().catch(() => {}), 60);
    } catch (e: any) {
      const text = l === 'th' ? pg.text_th : pg.text_en;
      if ('speechSynthesis' in window && text?.trim()) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = l === 'th' ? 'th-TH' : 'en-US';
        utterance.rate = l === 'th' ? 0.88 : 0.92;
        utterance.pitch = 1.04;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } else if (!shared) setError(e.message);
    } finally { setAudioBusy(false); }
  };

  // Background prefetch: once the finished book is open, quietly generate narration
  // for every page in reading order (current UI language) so Listen plays instantly.
  // Results are cached in D1, so this is a one-time cost per book+language — after
  // that, everyone (including share-link viewers) gets instant playback.
  useEffect(() => {
    if (!book || shared || book.status !== 'done' || storyPages.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const pg of storyPages) {
        if (cancelled) return;
        try { await ensureAudio(pg, lang); } catch { return; } // stop quietly on failure
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, book?.status, shared, lang, storyPages.length]);

  // Flipping to a different page (or switching language) stops any narration that
  // was playing and removes the now-stale player — audio always belongs to the page
  // you're actually looking at. Then warm the new page's mp3 into the HTTP cache.
  useEffect(() => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setAudioSrc('');
    const url = currentPage && (lang === 'th' ? currentPage.audio_url_th : currentPage.audio_url_en);
    if (url) {
      const a = new Audio();
      a.preload = 'auto';
      a.src = url;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoryIdx, lang, book]);

  const downloadPdf = async () => {
    if (!book) return;
    setPdfBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 900, H = 1273; // canvas px → A4 portrait (210x297mm)

      const loadImg = (u: string) => new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => res(im);
        im.onerror = () => rej(new Error('img load failed'));
        im.src = proxied(u);
      });

      // Wrap Thai/English text onto the canvas (canvas uses browser fonts → Thai renders correctly)
      const wrap = (ctx: CanvasRenderingContext2D, text: string, maxW: number, locale: 'th' | 'en') => {
        const Segmenter = (Intl as any).Segmenter;
        const words: string[] = Segmenter
          ? Array.from(new Segmenter(locale, { granularity: 'word' }).segment(text), (part: any) => part.segment)
          : (text.match(/\S+\s*/g) || [text]);
        const lines: string[] = [];
        let line = '';
        for (const w of words) {
          // Intl.Segmenter can return punctuation as a separate token. Keep it
          // attached to the preceding word so a period never becomes an orphan
          // on its own line in the exported book.
          if (/^[.,!?;:\u2026'"\u201d\u2019)\]]+\s*$/.test(w) && line.trim()) {
            line = `${line.trimEnd()}${w}`;
            continue;
          }
          const probe = `${line}${w}`;
          if (ctx.measureText(probe).width > maxW && line.trim()) { lines.push(line.trim()); line = w.trimStart(); }
          else line = probe;
        }
        if (line.trim()) lines.push(line.trim());
        return lines;
      };

      const renderSheet = async (pg: Page | undefined, isCover: boolean) => {
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#fdf6ec';
        ctx.fillRect(0, 0, W, H);
        const imgUrl = isCover ? book.cover_url : pg?.image_url;
        if (imgUrl) {
          try {
            const image = await loadImg(imgUrl);
            if (isCover) ctx.drawImage(image, 0, 0, W, W);
            else ctx.drawImage(image, 70, 36, 760, 760);
          } catch { /* keep bg */ }
        }
        ctx.fillStyle = '#4a3728';
        ctx.textAlign = 'center';
        if (isCover) {
          ctx.font = 'bold 40px "Mali", "Noto Sans Thai", sans-serif';
          let y = W + 66;
          for (const ln of wrap(ctx, book.title_th || '', W - 100, 'th')) { ctx.fillText(ln, W / 2, y); y += 52; }
          ctx.font = 'italic 24px "Nunito", sans-serif';
          ctx.fillStyle = '#7a6553';
          for (const ln of wrap(ctx, book.title_en || '', W - 120, 'en')) { ctx.fillText(ln, W / 2, y); y += 34; }
          if (book.dedication) {
            ctx.font = '22px "Mali", "Noto Sans Thai", sans-serif';
            ctx.fillText(`♥ ${book.dedication}`, W / 2, y + 12);
          }
        } else if (pg) {
          const textTop = 840;
          const maxTextHeight = H - textTop - 42;
          let thSize = 24;
          let enSize = 17;
          let thLines: string[] = [];
          let enLines: string[] = [];
          let thLineHeight = 34;
          let enLineHeight = 24;

          // Fit both languages into the remaining page area while keeping the
          // type as large as the generated story length permits.
          for (let size = 24; size >= 17; size -= 1) {
            const englishSize = Math.max(13, Math.round(size * 0.72));
            ctx.font = `${size}px "Mali", "Noto Sans Thai", sans-serif`;
            const nextTh = wrap(ctx, pg.text_th || '', W - 110, 'th');
            ctx.font = `italic ${englishSize}px "Nunito", sans-serif`;
            const nextEn = wrap(ctx, pg.text_en || '', W - 110, 'en');
            const nextThHeight = Math.round(size * 1.42);
            const nextEnHeight = Math.round(englishSize * 1.42);
            thSize = size; enSize = englishSize;
            thLines = nextTh; enLines = nextEn;
            thLineHeight = nextThHeight; enLineHeight = nextEnHeight;
            if ((nextTh.length * nextThHeight) + 14 + (nextEn.length * nextEnHeight) <= maxTextHeight) break;
          }

          let y = textTop;
          ctx.font = `${thSize}px "Mali", "Noto Sans Thai", sans-serif`;
          for (const ln of thLines) { ctx.fillText(ln, W / 2, y); y += thLineHeight; }
          y += 8;
          ctx.font = `italic ${enSize}px "Nunito", sans-serif`;
          ctx.fillStyle = '#7a6553';
          for (const ln of enLines) { ctx.fillText(ln, W / 2, y); y += enLineHeight; }
        }
        return canvas.toDataURL('image/jpeg', 0.85);
      };

      pdf.addImage(await renderSheet(undefined, true), 'JPEG', 0, 0, 210, 297);
      for (const pg of storyPages) {
        pdf.addPage('a4');
        pdf.addImage(await renderSheet(pg, false), 'JPEG', 0, 0, 210, 297);
      }
      pdf.save(`${(book.title_en || 'storybook').replace(/[^\w ก-๙-]+/g, '')}.pdf`);
    } catch (e: any) {
      setError(`PDF: ${e.message}`);
    } finally { setPdfBusy(false); }
  };

  const downloadColoringPdf = async () => {
    if (!book) return;
    setColoringPdfBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
      const W = 900, H = 1273; // A4 portrait canvas
      const ART = 720;

      const loadImg = (u: string) => new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => res(im);
        im.onerror = () => rej(new Error('img load failed'));
        im.src = proxied(u);
      });

      const wrap = (ctx: CanvasRenderingContext2D, text: string, maxW: number, locale: 'th' | 'en') => {
        const Segmenter = (Intl as any).Segmenter;
        const words: string[] = Segmenter
          ? Array.from(new Segmenter(locale, { granularity: 'word' }).segment(text), (part: any) => part.segment)
          : (text.match(/\S+\s*/g) || [text]);
        const lines: string[] = [];
        let line = '';
        for (const word of words) {
          if (/^[.,!?;:\u2026'"\u201d\u2019)\]]+\s*$/.test(word) && line.trim()) {
            line = `${line.trimEnd()}${word}`;
            continue;
          }
          const probe = `${line}${word}`;
          if (ctx.measureText(probe).width > maxW && line.trim()) {
            lines.push(line.trim());
            line = word.trimStart();
          } else line = probe;
        }
        if (line.trim()) lines.push(line.trim());
        return lines;
      };

      // Turn the finished color illustration into high-contrast outlines in the
      // browser. A light blur removes painted texture before Sobel edge detection;
      // isolated dots are discarded and the remaining contours stay one pixel wide.
      // This creates clean coloring-page lines without another AI request or credit.
      const makeLineArt = (image: HTMLImageElement) => {
        const source = document.createElement('canvas');
        source.width = ART; source.height = ART;
        const sourceCtx = source.getContext('2d', { willReadFrequently: true })!;
        sourceCtx.fillStyle = '#fff';
        sourceCtx.fillRect(0, 0, ART, ART);
        const sw = image.naturalWidth || image.width;
        const sh = image.naturalHeight || image.height;
        const side = Math.min(sw, sh);
        sourceCtx.drawImage(image, (sw - side) / 2, (sh - side) / 2, side, side, 0, 0, ART, ART);

        const pixels = sourceCtx.getImageData(0, 0, ART, ART);
        const gray = new Uint8Array(ART * ART);
        for (let i = 0, p = 0; i < pixels.data.length; i += 4, p += 1) {
          gray[p] = Math.round((pixels.data[i] * .299) + (pixels.data[i + 1] * .587) + (pixels.data[i + 2] * .114));
        }

        // 3x3 Gaussian blur: keep silhouettes and facial features while removing
        // tiny brush texture that would otherwise become distracting black specks.
        const smooth = new Uint8Array(ART * ART);
        for (let y = 1; y < ART - 1; y += 1) {
          for (let x = 1; x < ART - 1; x += 1) {
            const p = (y * ART) + x;
            smooth[p] = Math.round((
              gray[p - ART - 1] + (2 * gray[p - ART]) + gray[p - ART + 1]
              + (2 * gray[p - 1]) + (4 * gray[p]) + (2 * gray[p + 1])
              + gray[p + ART - 1] + (2 * gray[p + ART]) + gray[p + ART + 1]
            ) / 16);
          }
        }

        const magnitude = new Uint16Array(ART * ART);
        const sample: number[] = [];
        for (let y = 1; y < ART - 1; y += 1) {
          for (let x = 1; x < ART - 1; x += 1) {
            const p = (y * ART) + x;
            const gx = -smooth[p - ART - 1] + smooth[p - ART + 1]
              - (2 * smooth[p - 1]) + (2 * smooth[p + 1])
              - smooth[p + ART - 1] + smooth[p + ART + 1];
            const gy = -smooth[p - ART - 1] - (2 * smooth[p - ART]) - smooth[p - ART + 1]
              + smooth[p + ART - 1] + (2 * smooth[p + ART]) + smooth[p + ART + 1];
            const edge = Math.min(1020, Math.abs(gx) + Math.abs(gy));
            magnitude[p] = edge;
            if (x % 6 === 0 && y % 6 === 0) sample.push(edge);
          }
        }
        sample.sort((a, b) => a - b);
        const adaptive = sample[Math.floor(sample.length * .90)] || 120;
        const threshold = Math.max(105, Math.min(180, adaptive));

        const edges = new Uint8Array(ART * ART);
        for (let p = 0; p < magnitude.length; p += 1) edges[p] = magnitude[p] >= threshold ? 1 : 0;

        const out = sourceCtx.createImageData(ART, ART);
        out.data.fill(255);
        for (let y = 1; y < ART - 1; y += 1) {
          for (let x = 1; x < ART - 1; x += 1) {
            const p = (y * ART) + x;
            if (!edges[p]) continue;
            let connected = 0;
            for (let oy = -1; oy <= 1; oy += 1) {
              for (let ox = -1; ox <= 1; ox += 1) {
                connected += edges[p + (oy * ART) + ox];
              }
            }
            if (connected >= 2) {
              const i = p * 4;
              out.data[i] = 18; out.data[i + 1] = 18; out.data[i + 2] = 18;
            }
          }
        }
        sourceCtx.putImageData(out, 0, 0);
        return source;
      };

      const renderColoringSheet = async (pg: Page | undefined, isCover: boolean) => {
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.strokeRect(28, 28, W - 56, H - 56);

        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';
        if (isCover) {
          ctx.font = 'bold 42px "Fredoka", "Mitr", "Noto Sans Thai", sans-serif';
          ctx.fillText(lang === 'th' ? 'สมุดระบายสีของฉัน' : 'My Coloring Book', W / 2, 82);
          ctx.font = '22px "SF Pro Display", "Noto Sans Thai", sans-serif';
          ctx.fillText(lang === 'th' ? 'พิมพ์ • ระบายสี • สนุกไปกับนิทาน' : 'Print • Color • Enjoy the story', W / 2, 118);
        } else if (pg) {
          ctx.font = 'bold 28px "Fredoka", "Mitr", "Noto Sans Thai", sans-serif';
          ctx.fillText(`${lang === 'th' ? 'หน้า' : 'Page'} ${pg.idx}`, W / 2, 76);
        }

        const imgUrl = isCover ? book.cover_url : pg?.image_url;
        if (imgUrl) {
          try {
            const image = await loadImg(imgUrl);
            const lineArt = makeLineArt(image);
            const artTop = isCover ? 144 : 100;
            ctx.drawImage(lineArt, 90, artTop, ART, ART);
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.strokeRect(90, artTop, ART, ART);
          } catch { /* keep a clean printable page when an image is unavailable */ }
        }

        if (isCover) {
          let y = 916;
          ctx.fillStyle = '#111';
          ctx.font = 'bold 32px "Mitr", "Noto Sans Thai", sans-serif';
          for (const line of wrap(ctx, book.title_th || '', W - 130, 'th')) { ctx.fillText(line, W / 2, y); y += 42; }
          ctx.font = 'italic 23px "SF Pro Display", sans-serif';
          for (const line of wrap(ctx, book.title_en || '', W - 150, 'en')) { ctx.fillText(line, W / 2, y); y += 31; }
          ctx.font = '20px "SF Pro Display", "Noto Sans Thai", sans-serif';
          ctx.fillText(lang === 'th' ? 'ชื่อ ______________________________' : 'This book belongs to ______________________________', W / 2, 1175);
        } else if (pg) {
          const maxTextHeight = 250;
          let thSize = 23, enSize = 16, thLines: string[] = [], enLines: string[] = [];
          let thLineHeight = 32, enLineHeight = 23;
          for (let size = 23; size >= 16; size -= 1) {
            const englishSize = Math.max(12, Math.round(size * .7));
            ctx.font = `${size}px "Mitr", "Noto Sans Thai", sans-serif`;
            const nextTh = wrap(ctx, pg.text_th || '', W - 120, 'th');
            ctx.font = `italic ${englishSize}px "SF Pro Display", sans-serif`;
            const nextEn = wrap(ctx, pg.text_en || '', W - 120, 'en');
            const nextThHeight = Math.round(size * 1.4);
            const nextEnHeight = Math.round(englishSize * 1.4);
            thSize = size; enSize = englishSize; thLines = nextTh; enLines = nextEn;
            thLineHeight = nextThHeight; enLineHeight = nextEnHeight;
            if ((nextTh.length * nextThHeight) + 12 + (nextEn.length * nextEnHeight) <= maxTextHeight) break;
          }
          let y = 870;
          ctx.fillStyle = '#111';
          ctx.font = `${thSize}px "Mitr", "Noto Sans Thai", sans-serif`;
          for (const line of thLines) { ctx.fillText(line, W / 2, y); y += thLineHeight; }
          y += 8;
          ctx.fillStyle = '#555';
          ctx.font = `italic ${enSize}px "SF Pro Display", sans-serif`;
          for (const line of enLines) { ctx.fillText(line, W / 2, y); y += enLineHeight; }
        }

        ctx.fillStyle = '#666';
        ctx.font = '16px "SF Pro Display", sans-serif';
        ctx.fillText('StoryHero by EngBrain', W / 2, H - 45);
        return canvas.toDataURL('image/png');
      };

      pdf.addImage(await renderColoringSheet(undefined, true), 'PNG', 0, 0, 210, 297);
      for (const pg of storyPages) {
        pdf.addPage('a4');
        pdf.addImage(await renderColoringSheet(pg, false), 'PNG', 0, 0, 210, 297);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      const safeTitle = (book.title_en || 'storybook').replace(/[^\w ก-๙-]+/g, '');
      pdf.save(`${safeTitle} Coloring Book.pdf`);
    } catch (e: any) {
      setError(`Coloring PDF: ${e.message}`);
    } finally { setColoringPdfBusy(false); }
  };

  if (error && !book) return <div className="reader"><div className="error-message">{error}</div></div>;
  if (!book) return <div className="auth-page"><div className="spinner" /></div>;

  const shareUrl = `${window.location.origin}/share/${book.id}`;
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { window.prompt('Copy link:', shareUrl); }
  };
  const submitOrder = async () => {
    if (!contact.trim() || !id) return;
    setOrderState('sending');
    try { await api.printOrder(id, contact.trim()); setOrderState('done'); }
    catch { setOrderState('idle'); }
  };

  return (
    <div className="reader">
      <div className="reader-top">
        <div>
          {!shared && <Link to="/app" style={{ color: 'var(--ink-soft)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={16} /> {t('myLibrary')}</Link>}
          <h1 className="reader-title">{lang === 'th' ? book.title_th : book.title_en}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={copyShare}>
            {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? t('shareCopied') : t('share')}
          </button>
          <button className="btn btn-secondary btn-sm" disabled={pdfBusy || coloringPdfBusy} onClick={downloadPdf}>
            <Download size={16} /> {pdfBusy ? t('makingPdf') : t('downloadPdf')}
          </button>
          <button className="btn btn-secondary btn-sm" disabled={pdfBusy || coloringPdfBusy} onClick={downloadColoringPdf}>
            <Palette size={16} /> {coloringPdfBusy ? t('makingColoringPdf') : t('downloadColoringPdf')}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="flipbook-stage">
        <div className="book-frame">
          {/* @ts-ignore — react-pageflip prop typing is loose */}
          <HTMLFlipBook
            ref={flipRef}
            width={400} height={mobile ? 560 : 500}
            minWidth={280} maxWidth={520} minHeight={350} maxHeight={mobile ? 700 : 650}
            size="stretch"
            showCover
            usePortrait
            mobileScrollSupport
            flippingTime={600}
            className="flipbook"
            style={{}}
            onFlip={(e: any) => setFlipIdx(e.data)}
          >
            {sheets}
          </HTMLFlipBook>
          {/* Center spine shadow — only meaningful over the open two-page spread */}
          {!mobile && flipIdx > 0 && flipIdx < sheets.length - 2 && <div className="book-spine" />}
        </div>
      </div>
      <p className="flip-hint">{t('flipHint')}</p>

      <div className="reader-nav" style={{ maxWidth: 560, margin: '10px auto 0' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => flipRef.current?.pageFlip()?.flipPrev()}><ChevronLeft size={18} /></button>
        <span style={{ color: 'var(--ink-soft)', fontSize: '.9rem' }}>
          {currentStoryIdx === 0 ? t('cover') : `${t('readerPage')} ${currentStoryIdx} ${t('ofPages')} ${storyPages.length}`}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={() => flipRef.current?.pageFlip()?.flipNext()}><ChevronRight size={18} /></button>
      </div>

      {/* Narration */}
      {(currentPage || cover) && (
        <div className="audio-bar">
          {(!shared || currentPage?.audio_url_th || canBrowserNarrate) && (
            <button className="btn btn-secondary btn-sm" disabled={audioBusy || !currentPage}
              onClick={() => playAudio(currentPage, 'th')}>
              <Volume2 size={16} /> {audioBusy ? t('preparingAudio') : t('listenTh')}
            </button>
          )}
          {(!shared || currentPage?.audio_url_en || canBrowserNarrate) && (
            <button className="btn btn-secondary btn-sm" disabled={audioBusy || !currentPage}
              onClick={() => playAudio(currentPage, 'en')}>
              <Volume2 size={16} /> {audioBusy ? t('preparingAudio') : t('listenEn')}
            </button>
          )}
          {audioSrc && <audio ref={audioRef} src={audioSrc} controls autoPlay />}
        </div>
      )}

      {book.dedication && flipIdx === 0 && (
        <div className="dedication-note">
          <Heart size={14} fill="currentColor" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
          {t('dedicationTo')}: {book.dedication}
        </div>
      )}

      {!shared && (
        <div className="reader-extras">
          <div className="print-card">
            <h3>{t('orderPrint')}</h3>
            <p>{t('orderPrintDesc')}</p>
            {orderState === 'done' ? (
              <p style={{ fontWeight: 700 }}>{t('orderThanks')}</p>
            ) : (
              <div className="print-form">
                <input className="input" placeholder={t('contactPlaceholder')}
                  value={contact} onChange={(e) => setContact(e.target.value)} />
                <button className="btn btn-primary" disabled={orderState === 'sending' || !contact.trim()} onClick={submitOrder}>
                  {t('submitOrder')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {shared && (
        <p style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/" className="btn btn-primary">{t('ctaStart')}</Link>
        </p>
      )}
    </div>
  );
}
