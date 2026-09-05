import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star, BookOpen, Zap, Palette, Share2, Heart, Shield, Clock, Gift,
  CheckCircle, Quote, Users, Mic, FileDown, Camera, Crown, ArrowRight,
} from 'lucide-react';
import { STORIES, getStory } from '../../shared/stories';
import { api, GalleryItem } from '../api';
import { useLang } from '../i18n';
import { Logo } from '../components/Logo';

// Showcase demo — Pixar-style cover of the photo-bubble girl (matches the hero mockup),
// "Read Example" opens a real, finished Pixar-style book (Jonny & the Emerald City).
const DEMO = {
  cover: '/legacy/4960bf81-9a33-4617-9251-483b164253c4-storyhero-demo-cover-pixar.png',
  p1: '/legacy/d45c2344-daf1-4dd5-bec3-83645035cc25-page-defc199b-aa44-4006-a836-dd416615a1b4-1.png',
  p2: '/legacy/a8dc5c07-6f38-47af-ad97-7c0e0409ea90-page-defc199b-aa44-4006-a836-dd416615a1b4-2.png',
  p3: '/legacy/7cc2e79f-8e01-48b7-adda-b34477fbfc25-page-defc199b-aa44-4006-a836-dd416615a1b4-3.png',
  share: '/share/defc199b-aa44-4006-a836-dd416615a1b4',
};

// AI-generated lifestyle photography (premium campaign shots, generated in-house)
const PHOTOS = {
  heroBg: '/legacy/4c46dff2-38c1-45fe-b4ff-2eb24f13f72f-storyhero-hero-bg.png',
  thatsMe: '/legacy/ecb4e988-6505-40c6-8b60-29eab8351179-storyhero-feature-thatsme.png',
  bedtime: '/legacy/f170ad90-be38-4072-ab59-ec24a5eaeaf5-storyhero-feature-bedtime.png',
  keepsake: '/legacy/e3b868de-506b-4e22-bc9d-77bdb9c1b836-storyhero-feature-keepsake.png',
  stepPhoto: '/legacy/218002f5-1521-484b-ab2c-b48525e8a73b-storyhero-step-photo.png',
  stepShare: '/legacy/7e9e0669-837f-4a59-8df7-feb13dff6549-storyhero-step-share.png',
  childPhoto: '/legacy/1ddf660f-3db6-43f8-b3c9-81982d60b7be-storyhero-child-photo.png',
  avatarBoy: '/legacy/b0fe452e-b869-49e0-ab84-832eab802e8d-storyhero-avatar-boy.png',
  avatarToddler: '/legacy/d5b2824a-eb3e-4700-892f-d233f9854853-storyhero-avatar-toddler.png',
};

// "Your child, every style" — one real photo rendered as the same hero in 4 art styles
const FOUR_WAYS = [
  { img: '/legacy/9ce0bfee-84fb-44c5-9d2b-bed6bfcf5404-storyhero-4ways-watercolor.png', th: 'สีน้ำคลาสสิก', en: 'Classic Watercolor' },
  { img: '/legacy/5464ac86-3c51-41ef-9e6d-0bc851c52a27-storyhero-4ways-animation-3d.png', th: 'แนวพิกซาร์', en: 'Pixar-Inspired 3D' },
  { img: '/legacy/ddf3d2d4-883c-43cb-9c81-1a825353e3bd-storyhero-4ways-fairytale-cartoon.png', th: 'แนวดิสนีย์', en: 'Disney-Inspired' },
  { img: '/legacy/d0b726ea-cef8-49c2-b8a7-ddaade9d9164-storyhero-4ways-real-magic.png', th: 'เสมือนจริง', en: 'Real Life Magic' },
];

/** 3D book mockup with the "real photo" bubble — the photo→book transformation in one glance */
function BookMockup({ th }: { th: boolean }) {
  return (
    <div className="book3d-scene w-[78%] max-w-[380px] mx-auto">
      <div className="book3d">
        <div className="spine"></div>
        <img className="cover" src={DEMO.cover} alt="Personalized storybook cover" />
        <div className="pages"></div>
        <div className="photo-bubble">
          <img src={PHOTOS.childPhoto} alt="Child's photo" />
        </div>
        <div className="mockup-caption">
          <Camera size={14} className="inline mr-1 -mt-0.5" /> {th ? 'รูปจริง 1 ใบ' : '1 real photo'} <span className="arrow">→</span> {th ? 'ฮีโร่ทั้งเล่ม' : 'hero of the book'}
        </div>
      </div>
    </div>
  );
}

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export function LandingPage() {
  const { lang } = useLang();
  const th = lang === 'th';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 font-sf pb-20 md:pb-0">
      <CinematicHero th={th} />
      <Hero th={th} />
      <FourWays th={th} />
      <BookGallery th={th} />
      <ProductDemo th={th} />
      <Features th={th} />
      <ValueStack th={th} />
      <Testimonials th={th} />
      <FAQ th={th} />
      <Order th={th} />
      <Footer th={th} />
    </div>
  );
}

/* ================== CINEMATIC HERO (Seedance clip, scroll-scrubbed) ==================
   10s generated shot: lamplit attic → the storybook bursts open → a child flies out
   riding the baby dragon → starfield finale. Desktop scrubs a 121-frame webp sequence
   on a pinned canvas (scrolling = flying); mobile plays the mp4 once and holds the
   final frame. Assets live in public/hero/. */
const CINE = {
  frames: 121,
  src: (i: number) => `/hero/f-${String(i + 1).padStart(3, '0')}.webp`,
  video: '/hero/hero-cinema.mp4',
  poster: '/hero/f-001.webp',
};

function CinematicHero({ th }: { th: boolean }) {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  // Scrub only on desktop pointers without reduced-motion; everyone else gets the video.
  const [scrub] = useState(
    () => window.matchMedia('(min-width: 768px)').matches &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!scrub) return;
    const imgs: (HTMLImageElement | null)[] = new Array(CINE.frames).fill(null);
    let lastDrawn = -1;
    const draw = (f: number) => {
      const cv = canvasRef.current;
      if (!cv) return;
      let use = f;
      while (use > 0 && !imgs[use]) use--; // nearest loaded frame while preloading
      const im = imgs[use];
      if (!im || lastDrawn === use) return;
      lastDrawn = use;
      cv.getContext('2d')!.drawImage(im, 0, 0, cv.width, cv.height);
    };
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      setProgress(p);
      draw(Math.round(p * (CINE.frames - 1)));
    };
    for (let i = 0; i < CINE.frames; i++) {
      const im = new Image();
      im.src = CINE.src(i);
      im.onload = () => { imgs[i] = im; if (i === 0) onScroll(); };
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [scrub]);

  const overlay = (
    <>
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 pb-14 md:pb-20 px-6 text-center text-white">
        <h1 className="font-playfair font-bold text-4xl md:text-6xl lg:text-7xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          {th ? 'ลูกของคุณ คือฮีโร่ของนิทาน' : 'Your Child. The Hero.'}
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
          {th ? 'อัปโหลดรูป 1 ใบ แล้วดูลูกน้อยบินเข้าไปในนิทานของตัวเอง' : 'One photo - and they fly into their own storybook.'}
        </p>
        <button
          onClick={() => navigate('/create')}
          className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 md:px-12 py-4 md:py-5 text-lg md:text-xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white/20"
        >
          <BookOpen className="w-5 h-5" /> {th ? 'เข้าร่วมทดลองใช้สำหรับผู้ปกครอง' : 'Join the Parent Beta'}
        </button>
      </div>
      {scrub && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-widest uppercase transition-opacity duration-500 pointer-events-none"
          style={{ opacity: progress > 0.05 ? 0 : 1 }}
        >
          {th ? 'เลื่อนเพื่อเปิดหนังสือ' : 'Scroll to open the book'} ↓
        </div>
      )}
    </>
  );

  if (!scrub) {
    return (
      <section className="relative h-[100svh] bg-black overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={CINE.video} poster={CINE.poster}
          muted playsInline autoPlay preload="auto"
        />
        {overlay}
      </section>
    );
  }
  return (
    <section ref={wrapRef} className="relative bg-black" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-cover" />
        {overlay}
      </div>
    </section>
  );
}

/* ============================ HERO ============================ */
function Hero({ th }: { th: boolean }) {
  const navigate = useNavigate();
  // Only show the mobile sticky CTA once the user has scrolled past the hero's
  // own CTA button, so the two never overlap.
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 620);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
      {/* Sticky top banner — quiet ink + gold so it doesn't fight the cinematic fade above */}
      <div className="sticky top-0 z-50 bg-indigo-950/95 backdrop-blur-sm text-amber-200 py-2 px-4 border-b border-white/10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2.5 text-sm font-medium tracking-wide">
            <Gift className="w-4 h-4" />
            <span>{th ? 'ทดลองใช้สำหรับผู้ปกครอง: อนุมัติแล้วสร้างได้สูงสุด 6 เล่ม' : 'Parent beta: approved accounts can create up to 6 books'}</span>
          </div>
        </div>
      </div>

      {/* Background image + fades */}
      <div className="absolute inset-0">
        <img src={PHOTOS.heroBg} alt="" className="w-full h-full object-cover object-[50%_48%]" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/35 to-indigo-900/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/70 via-transparent to-transparent"></div>
        {/* Left scrim so the copy column always wins over the photo */}
        <div className="absolute inset-0 lg:bg-gradient-to-r lg:from-indigo-950/75 lg:via-indigo-950/35 lg:to-transparent bg-indigo-950/30"></div>
        {/* Bridge from the cinematic starfield above */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent"></div>
      </div>

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] z-10"></div>

      {/* Radial lighting */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-[16%] right-[18%] animate-hero-float"><BookOpen className="w-6 h-6 text-yellow-300/40 animate-pulse" /></div>
        <div className="absolute top-3/4 right-[8%] animate-hero-float delay-1000"><Star className="w-8 h-8 text-pink-300/40 animate-pulse" /></div>
        <div className="absolute top-[62%] left-[4%] animate-hero-float delay-500"><Star className="w-4 h-4 text-blue-300/40 animate-pulse" /></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
        <div className="text-center lg:text-left space-y-8">
          <div className="text-center lg:text-left">
            <span className="text-purple-200/90 text-sm font-semibold tracking-[0.2em] uppercase">
              {th ? 'สำหรับพ่อแม่ที่อยากให้ลูกรักการอ่าน' : 'For parents raising little readers'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.12] font-playfair">
            <span className="text-white block">{th ? 'ลูกของคุณ คือฮีโร่' : 'Watch your child become'}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 block">
              {th ? 'ในนิทานคลาสสิก' : 'the hero of classic tales'}
            </span>
          </h1>

          <div className="flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-blue-50">
              <Clock className="w-4 h-4 text-amber-300" />
              {th ? 'เสร็จภายใน 10 นาที' : 'Ready in under 10 minutes'}
            </span>
          </div>

          <h2 className="text-lg md:text-xl text-blue-100 leading-relaxed font-light">
            {th
              ? 'อัปโหลดรูปลูก 1 ใบ แล้ว AI จะวาดลูกของคุณเป็นตัวเอกในนิทานที่เราทุกคนโตมากับมัน ภาพประกอบสวยงาม 11 หน้า สองภาษาไทย-อังกฤษ พร้อมเสียงอ่าน'
              : 'Upload one photo and AI paints your child as the hero of the classic tales we all grew up with - 11 beautiful illustrations, bilingual Thai-English, with narration.'}
          </h2>

          {/* Social proof card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-6 max-w-lg mx-auto lg:mx-0 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="flex -space-x-2">
                {[PHOTOS.childPhoto, PHOTOS.avatarBoy, PHOTOS.avatarToddler].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />)}</div>
            </div>
            <p className="text-sm font-medium">
              {th ? 'เนื้อเรื่อง 10 หน้า + ปก · สองภาษา · เสียงอ่าน · PDF' : '10 story pages + cover · Bilingual · Narration · PDF'}
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center justify-center gap-2 text-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-10 py-5 sm:py-6 text-lg sm:text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-4 border-white/20 w-full sm:w-auto"
            >
              <BookOpen className="w-5 h-5" /> {th ? 'สมัครทดลองใช้สำหรับผู้ปกครอง' : 'Request Parent Beta Access'}
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-blue-100 pt-6 flex-wrap">
            {[
              th ? 'ใช้ได้ทุกอุปกรณ์' : 'Works on Any Device',
              th ? 'อนุมัติบัญชีก่อนสร้าง • ไม่ต้องใส่บัตร' : 'Account approval required • no card needed',
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3D book mockup: real photo → hero of the book */}
        <div className="pt-6 lg:pt-0 pb-8">
          <BookMockup th={th} />
        </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA — only appears once scrolled past the hero's own CTA, so they never overlap */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-2xl z-40 md:hidden transition-transform duration-300 ${pastHero ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold flex-1 flex items-center gap-2"><BookOpen className="w-4 h-4 shrink-0" /> {th ? 'ลูกคุณเป็นฮีโร่ใน 10 นาที' : 'Your child, the hero - in 10 minutes'}</p>
          <button onClick={() => navigate('/create')} className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-2 font-bold rounded-full ml-4">
            {th ? 'เริ่มเลย' : 'Start Now'}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================ YOUR CHILD, EVERY STYLE ============================ */
function FourWays({ th }: { th: boolean }) {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-3 mb-6">
          <Palette className="w-5 h-5 text-purple-600" />
          <span className="text-purple-700 font-semibold">{th ? '10 สไตล์ภาพวาด' : '10 Art Styles'}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-playfair">
          {th ? 'รูปเดียว ' : 'One Photo. '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            {th ? 'ได้ทุกสไตล์' : 'Every Style.'}
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          {th
            ? 'อัปโหลดรูปลูก 1 ใบ แล้วเลือกสไตล์ที่ชอบ นี่คือเด็กคนเดียวกันใน 4 สไตล์ยอดฮิต'
            : 'Upload one photo, pick your favorite look - here\'s the same child in 4 of our most-loved styles'}
        </p>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
          {/* Source photo */}
          <div className="shrink-0 text-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl mx-auto ring-4 ring-purple-100">
              <img src={PHOTOS.childPhoto} alt="Real child photo" className="w-full h-full object-cover" />
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-gray-700">
              <Camera className="w-4 h-4 text-purple-500" /> {th ? 'รูปจริง 1 ใบ' : '1 real photo'}
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="w-8 h-8 text-purple-400 rotate-90 lg:rotate-0 shrink-0" />

          {/* 4 style renditions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
            {FOUR_WAYS.map((w, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="aspect-square overflow-hidden">
                  <img src={w.img} alt={w.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="py-2.5 px-2">
                  <span className="text-xs md:text-sm font-bold text-gray-800">{th ? w.th : w.en}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/create')} className="mt-12 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 text-lg font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300">
          <Palette className="w-5 h-5" /> {th ? 'สมัครทดลองใช้สำหรับผู้ปกครอง' : 'Join the Parent Beta'}
        </button>
      </div>
    </section>
  );
}

/* ============================ BOOK GALLERY (real output) ============================ */

// Fallback filler cards (real pages from the Meena demo book) — only used to pad the
// grid out to a minimum of 4 when there aren't yet enough real user books to show.
const FALLBACK_CARDS = [
  { img: DEMO.cover, titleTh: 'การผจญภัยของมังกรน้อย', titleEn: 'The Little Dragon Adventure', byTh: 'สร้างจากรูปจริง', byEn: 'Made from a real photo', catTh: 'แนวพิกซาร์', catEn: 'Pixar Style' },
  { img: DEMO.p1, titleTh: 'พายุหมุนสู่ดินแดนออซ', titleEn: 'The Cyclone to Oz', byTh: 'หน้า 1 จากเล่มจริง', byEn: 'Page 1, real book', catTh: 'ตัวอย่างจริง', catEn: 'Real Sample' },
  { img: DEMO.p2, titleTh: 'ถนนอิฐสีเหลือง', titleEn: 'The Yellow Brick Road', byTh: 'หน้า 2 จากเล่มจริง', byEn: 'Page 2, real book', catTh: 'ตัวอย่างจริง', catEn: 'Real Sample' },
  { img: DEMO.p3, titleTh: 'เพื่อนใหม่ระหว่างทาง', titleEn: 'New Friends on the Way', byTh: 'หน้า 3 จากเล่มจริง', byEn: 'Page 3, real book', catTh: 'ตัวอย่างจริง', catEn: 'Real Sample' },
];

function BookGallery({ th }: { th: boolean }) {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<GalleryItem[] | null>(null);

  useEffect(() => {
    api.gallery(8).then(setGallery).catch(() => setGallery([]));
  }, []);

  const realCards = (gallery || []).map((g) => {
    const story = getStory(g.story_id);
    return {
      img: g.cover_url,
      title: th ? g.title_th : g.title_en,
      by: g.child_name,
      cat: story ? (th ? story.titleTh : story.titleEn) : 'StoryHero',
    };
  });
  // Exclude filler cards whose image is already shown as a real book (the demo
  // Meena book is itself one of the real entries once it exists in the DB).
  const usedCovers = new Set(realCards.map((c) => c.img));
  const fallback = FALLBACK_CARDS
    .filter((f) => !usedCovers.has(f.img))
    .map((f) => ({ img: f.img, title: th ? f.titleTh : f.titleEn, by: th ? f.byTh : f.byEn, cat: th ? f.catTh : f.catEn }));
  // Show real user books first; pad with demo pages only until we have at least 4 cards.
  const books = realCards.length >= 4 ? realCards : [...realCards, ...fallback].slice(0, Math.max(4, realCards.length));

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 mb-6 shadow-lg">
            <Heart className="w-5 h-5 text-pink-500" />
            <span className="text-purple-700 font-semibold">{th ? 'ตัวอย่างจริงจากระบบ 100%' : '100% Real App Output'}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-playfair">
            {th ? 'นิทานจริงที่ AI วาดให้' : 'Real Stories, Really Illustrated'}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {th ? 'ลูกคุณคือดาวเด่นทุกหน้า' : 'Your Child Stars on Every Page'}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {th
              ? 'ภาพทั้งหมดนี้มาจากเล่มจริงที่สร้างในระบบ รูปเดียว กลายเป็นตัวละครหน้าเดิมทั้ง 11 หน้า'
              : 'Every image below is from a real book made in the app - one photo became the same character across all 11 pages'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {books.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="relative">
                <img src={b.img} alt={b.title} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <span className="absolute top-3 left-3 bg-purple-600/90 text-white text-xs font-bold px-3 py-1 rounded-full">{b.cat}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-gray-500">{b.by}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">{th ? 'เล่มต่อไปคือของลูกคุณ!' : 'Your Child\'s Story Could Be Next!'}</h3>
            <p className="text-purple-100 mb-6">
              {th ? 'อ่านเล่มตัวอย่างเต็ม ๆ หรือสมัครทดลองใช้เพื่อสร้างได้สูงสุด 6 เล่ม' : 'Read the full example book, or join the beta to create up to 6 books'}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to={DEMO.share} className="inline-flex items-center gap-2 bg-white/20 border border-white/40 text-white hover:bg-white/30 px-8 py-3 text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300">
                <BookOpen className="w-5 h-5" /> {th ? 'อ่านเล่มตัวอย่าง' : 'Read Example'}
              </Link>
              <button onClick={() => navigate('/create')} className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300">
                {th ? 'เริ่มสร้างวันนี้' : 'Start Creating Today'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ PRODUCT DEMO (3 steps) ============================ */
function ProductDemo({ th }: { th: boolean }) {
  const navigate = useNavigate();
  const steps = [
    {
      icon: <Camera className="w-12 h-12" />,
      title: th ? 'อัปโหลดรูปลูกน้อย' : 'Upload a Photo',
      subtitle: th ? 'ง่าย เร็ว ปลอดภัย!' : 'Fun, Fast & Easy!',
      description: th
        ? 'เลือกนิทานคลาสสิกที่ชอบ อัปโหลดรูปหน้าชัด ๆ 1 ใบ แล้ว AI จะวาด "ตัวละครฮีโร่" ที่หน้าเหมือนลูกคุณจนจำได้ทันที'
        : 'Pick a classic tale, upload one clear photo, and AI draws a hero character your child instantly recognizes as themselves.',
      features: [th ? 'เลือกนิทานคลาสสิก 8 เรื่อง' : 'Choose from 8 classic tales', th ? 'รูปเดียวพอ' : 'Just one photo', th ? 'ดูตัวอย่างก่อน วาดใหม่ได้' : 'Preview & redraw until perfect'],
      color: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50', img: PHOTOS.stepPhoto,
    },
    {
      icon: <Palette className="w-12 h-12" />,
      title: th ? 'AI วาดนิทานทั้งเล่ม' : 'AI Illustrates the Whole Book',
      subtitle: th ? 'โลกนิทานมีชีวิต!' : 'Make the World Come to Life!',
      description: th
        ? 'AI แต่งเรื่องตามวัยของลูก แล้ววาดภาพประกอบ 11 หน้า ลูกคุณหน้าเดิม ชุดเดิม ทุกหน้า พร้อมข้อคิดท้ายเรื่อง'
        : 'AI writes an age-perfect story and paints 11 illustrations - same face, same costume, every page, with a moral at the end.',
      features: [th ? 'ภาพวาดสีน้ำ 11 หน้า' : '11 watercolor pages', th ? 'สองภาษาไทย-อังกฤษ' : 'Thai-English bilingual', th ? 'ปรับตามอายุ 2-12 ปี' : 'Adapted for ages 2-12'],
      color: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', img: DEMO.p2,
    },
    {
      icon: <Share2 className="w-12 h-12" />,
      title: th ? 'อ่าน ฟัง แชร์ พิมพ์' : 'Read, Listen, Share & Print',
      subtitle: th ? 'ไม่เกิน 10 นาที!' : 'Under 10 Minutes!',
      description: th
        ? 'เปิดอ่านแบบหนังสือพลิกหน้า ฟังเสียงอ่านนิทาน ดาวน์โหลด PDF แชร์ให้ปู่ย่าตายาย หรือสั่งพิมพ์เป็นเล่มจริงส่งถึงบ้าน'
        : 'Flip through a real page-turning book, listen to narration, download the PDF, share with grandparents, or order a printed hardcover.',
      features: [th ? 'เสียงอ่านไทย-อังกฤษ' : 'Thai & English narration', th ? 'ดาวน์โหลด PDF ฟรี' : 'Free PDF download', th ? 'สั่งพิมพ์เล่มจริงได้' : 'Printed hardcover available'],
      color: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50', img: PHOTOS.stepShare,
    },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-3 mb-6">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-purple-700 font-semibold">{th ? 'ใช้งานยังไง' : 'How It Works'}</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-playfair">
              <span className="block mb-2">{th ? 'จากรูปถ่าย สู่' : 'From One Photo to a'}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {th ? 'นิทานเล่มพิเศษ' : 'Published Storybook'}
              </span>
              <span className="block text-2xl md:text-3xl mt-4 text-gray-500 font-medium">{th ? 'แค่ 3 ขั้นตอน' : 'In just 3 simple steps'}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {th ? 'ไม่ต้องมีทักษะอะไรเลย ' : 'No experience needed. '}
              <span className="font-semibold text-purple-600">{th ? 'แค่รูปลูก 1 ใบ' : 'Just one photo'}</span>
              {th ? ' ที่เหลือให้เวทมนตร์จัดการ!' : ' - the magic handles the rest!'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="group hover:scale-105 transition-all duration-500">
                <div className={`relative overflow-hidden bg-gradient-to-br ${step.bg} border-2 border-white shadow-2xl h-full rounded-lg`}>
                  <div className="absolute -top-4 -left-4 z-20">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-xl border-4 border-white`}>
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>
                  </div>
                  <div className="p-8 pt-12">
                    <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                      <div className="text-white">{step.icon}</div>
                    </div>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <div className={`inline-block bg-gradient-to-r ${step.color} text-white px-4 py-1 rounded-full text-sm font-semibold`}>{step.subtitle}</div>
                    </div>
                    <div className="mb-6 relative w-full h-48 rounded-2xl overflow-hidden">
                      <img src={step.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <p className="text-gray-700 text-center mb-6 leading-relaxed">{step.description}</p>
                    <div className="space-y-2">
                      {step.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-3">
                          <div className={`w-2 h-2 bg-gradient-to-r ${step.color} rounded-full`}></div>
                          <span className="text-gray-600 font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">{th ? 'พร้อมเห็นลูกเป็นฮีโร่หรือยัง?' : 'Ready to See Your Child Become the Hero?'}</h3>
              <p className="text-purple-100 text-lg mb-6">{th ? 'บัญชีที่อนุมัติแล้วสร้างได้สูงสุด 6 เล่ม' : 'Approved accounts can create up to 6 books'}</p>
              <button onClick={() => navigate('/create')} className="bg-white text-purple-600 hover:bg-gray-50 rounded-full px-8 py-4 text-lg font-semibold shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center">
                {th ? 'เริ่มสร้างนิทานเลย' : 'Start Creating Stories Now'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ FEATURES ============================ */
function Features({ th }: { th: boolean }) {
  const rows = [
    {
      icon: <Heart className="w-8 h-8" />, color: 'from-pink-500 to-rose-500', img: PHOTOS.thatsMe,
      title: th ? 'ความมั่นใจที่ซื้อไม่ได้ด้วยเงิน' : 'Confidence Money Can\'t Buy',
      sub: th ? 'จาก "หนูอ่านไม่เก่ง" เป็น "นี่หนูเอง!"' : 'From "I can\'t read" to "That\'s ME!"',
      desc: th
        ? 'เด็ก ๆ อ่านซ้ำแล้วซ้ำอีกเมื่อตัวเองเป็นตัวเอก ทุกหน้าที่พลิกคือความภูมิใจ ทุกครั้งที่อ่านจบคือความมั่นใจที่เพิ่มขึ้น'
        : 'Kids read again and again when they\'re the hero. Every page turn is pride; every finished book builds confidence.',
      points: [th ? 'ลูกขอเปิดอ่านเองทุกคืน' : 'They ask for it every night', th ? 'หน้าลูกอยู่ในทุกภาพวาด' : 'Their face in every illustration', th ? 'คุณธรรมติดตัวไปตลอด' : 'Values that stick for life'],
    },
    {
      icon: <Mic className="w-8 h-8" />, color: 'from-blue-500 to-indigo-500', img: PHOTOS.bedtime,
      title: th ? 'สองภาษา พร้อมเสียงอ่าน' : 'Bilingual with Narration',
      sub: th ? 'ฝึกอังกฤษแบบไม่รู้ตัว' : 'English practice in disguise',
      desc: th
        ? 'ทุกหน้ามีภาษาไทยและอังกฤษคู่กัน พร้อมเสียงอ่านทั้งสองภาษา ให้ลูกฟังก่อนนอน หรือฝึกอ่านตามได้เลย'
        : 'Every page pairs Thai and English, with narration in both. Perfect for bedtime listening or read-along practice.',
      points: [th ? 'เสียงอ่านไทยและอังกฤษ' : 'Thai & English audio', th ? 'คำแปลเทียบทุกหน้า' : 'Side-by-side translation', th ? 'ปรับระดับภาษาตามวัย' : 'Language level matches age'],
    },
    {
      icon: <Gift className="w-8 h-8" />, color: 'from-amber-500 to-orange-500', img: PHOTOS.keepsake,
      title: th ? 'ของขวัญที่เก็บได้ตลอดชีวิต' : 'A Keepsake for Life',
      sub: th ? 'PDF ฟรี + พิมพ์เป็นเล่มจริงได้' : 'Free PDF + printed hardcover',
      desc: th
        ? 'ดาวน์โหลด PDF เก็บไว้ได้ตลอด แชร์ลิงก์ให้ปู่ย่าตายายเปิดอ่านได้ทันที หรือสั่งพิมพ์ปกแข็งส่งถึงบ้าน ของขวัญวันเกิดที่ไม่มีใครเหมือน'
        : 'Download the PDF forever, share a link grandparents can open instantly, or order a printed hardcover - a birthday gift no one else can give.',
      points: [th ? 'คำอุทิศส่วนตัวในเล่ม' : 'Personal dedication page', th ? 'แชร์ลิงก์ให้ครอบครัว' : 'Family share link', th ? 'หนังสือจริงส่งถึงบ้าน' : 'Real book, shipped home'],
    },
  ];
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-playfair">
            {th ? 'ทำไมพ่อแม่ถึง' : 'Why Parents Are'}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {th ? 'หลงรัก StoryHero' : 'Falling in Love with StoryHero'}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {th ? 'ในที่สุดก็มีเวลาหน้าจอที่ทำให้คุณรู้สึกเป็นพ่อแม่แห่งปี' : 'Finally, screen time that makes you feel like Parent of the Year'}
          </p>
        </div>

        <div className="space-y-16">
          {rows.map((r, i) => (
            <div key={i} className={`flex flex-col ${i % 2 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10`}>
              <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-stretch">
                <div className={`w-16 h-16 bg-gradient-to-r ${r.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-5`}>{r.icon}</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{r.title}</h3>
                <p className="font-semibold mb-4 text-purple-600">{r.sub}</p>
                <p className="text-gray-600 leading-relaxed mb-5">{r.desc}</p>
                <ul className="space-y-2 inline-flex flex-col items-start mx-auto md:mx-0">
                  {r.points.map((p, pi) => (
                    <li key={pi} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /><span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <img src={r.img} alt="" className="rounded-3xl shadow-2xl w-full max-w-md mx-auto hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            { icon: <Shield className="w-6 h-6" />, t: th ? 'ปลอดภัยสำหรับเด็ก' : 'Parent Peace of Mind', d: th ? 'ไม่มีโฆษณา ไม่มีเนื้อหาแปลก รูปลูกใช้สร้างตัวละครเท่านั้น' : 'No ads, no random content - photos used only for the character' },
            { icon: <Clock className="w-6 h-6" />, t: th ? 'เสร็จในไม่กี่นาที' : 'Instant Proud Parent Moments', d: th ? 'นิทานพร้อมแชร์ในไม่กี่นาที ไม่ใช่หลายชั่วโมง' : 'Stories ready to share in minutes, not hours' },
            { icon: <Users className="w-6 h-6" />, t: th ? 'ทั้งครอบครัวได้ยิ้ม' : 'The Whole Family Smiles', d: th ? 'ปู่ย่าตายายเปิดลิงก์ดูหลานเป็นฮีโร่ได้ทันที' : 'Grandparents open the link and see their hero grandchild instantly' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">{f.icon}</div>
              <h4 className="font-bold text-gray-900 mb-2">{f.t}</h4>
              <p className="text-gray-600 text-sm">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ VALUE STACK ============================ */
function ValueStack({ th }: { th: boolean }) {
  const items = [
    { icon: <Crown className="w-5 h-5" />, name: th ? 'ตัวละครฮีโร่จากรูปลูก (สร้างได้สูงสุด 3 แบบ)' : 'Hero character from your child\'s photo (up to 3 versions)', value: '฿590' },
    { icon: <Palette className="w-5 h-5" />, name: th ? 'ภาพประกอบสีน้ำ 11 หน้า หน้าเดิมทุกภาพ' : '11 consistent watercolor illustrations', value: '฿890' },
    { icon: <BookOpen className="w-5 h-5" />, name: th ? 'นิทานสองภาษา ปรับตามวัยลูก' : 'Bilingual story adapted to your child\'s age', value: '฿390' },
    { icon: <Mic className="w-5 h-5" />, name: th ? 'เสียงอ่านนิทานไทย + อังกฤษ' : 'Thai + English narration audio', value: '฿290', bonus: true },
    { icon: <FileDown className="w-5 h-5" />, name: th ? 'ดาวน์โหลด PDF + ลิงก์แชร์ครอบครัว' : 'PDF download + family share link', value: '฿190', bonus: true },
    { icon: <Heart className="w-5 h-5" />, name: th ? 'หน้าคำอุทิศส่วนตัว' : 'Personal dedication page', value: '฿90', bonus: true },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-playfair">
            {th ? 'ทุกอย่างที่ได้รับ ' : 'Everything You Get '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">{th ? 'ในสิทธิ์ทดลองใช้' : 'in Your Beta Access'}</span>
          </h2>
          <p className="text-xl text-gray-600">{th ? 'ชุดนิทานครบวงจรมูลค่ารวมกว่า ฿2,440' : 'A complete storybook package worth over ฿2,440'}</p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl border border-purple-100">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-1">{th ? 'แพ็กเกจนิทานฮีโร่ครบชุด' : 'Complete Hero Storybook Package'}</h3>
            <p className="text-purple-100">{th ? 'ทุกอย่างที่ลูกน้อยต้องมีในนิทาน สูงสุด 6 เล่ม' : 'Everything your little hero needs across up to 6 books'}</p>
          </div>
          <div className="bg-white p-8">
            <div className="space-y-4">
              {items.map((it, i) => (
                <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 rounded-xl ${it.bonus ? 'bg-orange-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white shrink-0">{it.icon}</div>
                    <span className="text-gray-800 font-medium">
                      {it.name}
                      {it.bonus && <span className="ml-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full align-middle">BONUS</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                    <span className="text-gray-400 line-through text-sm">{it.value}</span>
                    <span className="text-green-600 font-bold text-sm whitespace-nowrap">✓ {th ? 'รวมแล้ว' : 'Included'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-6 pt-6 text-center">
              <p className="text-gray-500 mb-1">{th ? 'มูลค่ารวม:' : 'Total Value:'}</p>
              <p>
                <span className="text-2xl text-gray-400 line-through mr-3">฿2,440</span>
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">{th ? 'ฟรี' : 'FREE'}</span>
              </p>
              <button onClick={() => scrollTo('order')} className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 text-lg font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                {th ? 'สมัครและขออนุมัติ' : 'Sign In and Request Access'}
              </button>
              <p className="text-gray-400 text-sm mt-3">{th ? 'ไม่ต้องใส่บัตร • ทีมงานตรวจสอบก่อนเริ่มสร้าง' : 'No card needed • Team approval before generation'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-10 text-center">
          {[
            { icon: <Shield className="w-6 h-6" />, t: th ? 'รูปลูกปลอดภัย' : 'Photos Kept Safe' },
            { icon: <Clock className="w-6 h-6" />, t: th ? 'เสร็จใน 10 นาที' : 'Ready in 10 Minutes' },
            { icon: <Gift className="w-6 h-6" />, t: th ? 'สร้างได้สูงสุด 6 เล่ม' : 'Up to 6 Beta Books' },
          ].map((g, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-gray-600">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">{g.icon}</div>
              <span className="text-sm font-semibold">{g.t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ TESTIMONIALS (dark) ============================ */
function Testimonials({ th }: { th: boolean }) {
  const stats = [
    { icon: <BookOpen className="w-6 h-6" />, num: '11', label: th ? 'ภาพวาดต่อเล่ม' : 'Illustrations per book' },
    { icon: <Clock className="w-6 h-6" />, num: '10', label: th ? 'นาทีจากรูปถึงเล่มจบ' : 'Minutes photo-to-book' },
    { icon: <Mic className="w-6 h-6" />, num: '2', label: th ? 'ภาษา พร้อมเสียงอ่าน' : 'Languages with narration' },
    { icon: <Gift className="w-6 h-6" />, num: '฿0', label: th ? 'ค่าเล่มแรกของคุณ' : 'Cost of your first book' },
  ];
  const quotes = th ? [
    { q: 'อัปโหลดรูปลูกตอนสองทุ่ม สามทุ่มลูกนอนกอดไอแพดฟังนิทานตัวเองเป็นสังข์ทอง ยิ้มไม่หุบเลยค่ะ', hl: 'จากรูปถ่ายสู่นิทานในคืนเดียว', name: 'ตัวอย่างการใช้งานจริง', role: 'นิทานสังข์ทอง อายุ 5 ขวบ' },
    { q: 'สิ่งที่ประทับใจที่สุดคือหน้าลูกเหมือนเดิมทั้ง 11 หน้า ไม่ใช่เปลี่ยนไปเรื่อย ๆ เหมือนแอปอื่น ปู่ย่าดูแล้วจำหลานได้ทันที', hl: 'ตัวละครหน้าเดิมทุกหน้า', name: 'จุดเด่นของระบบ', role: 'เทคโนโลยี Character Consistency' },
  ] : [
    { q: 'Uploaded a photo at 8pm - by 9pm the little one was falling asleep listening to their own Sang Thong story, grinning ear to ear.', hl: 'Photo to storybook in one evening', name: 'Real usage example', role: 'Sang Thong book, age 5' },
    { q: 'The most impressive part: the same face across all 11 pages, not morphing like other apps. Grandparents recognized their grandchild instantly.', hl: 'Same character, every page', name: 'System highlight', role: 'Character consistency engine' },
  ];
  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
      <div className="absolute top-10 left-[12%] animate-twinkle"><Star className="w-6 h-6 text-yellow-300/60" /></div>
      <div className="absolute bottom-16 right-[10%] animate-twinkle animation-delay-2000"><Star className="w-5 h-5 text-pink-300/60" /></div>
      <div className="absolute top-1/3 right-[20%] animate-twinkle animation-delay-4000"><Star className="w-4 h-4 text-blue-300/60" /></div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-6 h-6 text-yellow-300" />
            <span className="text-purple-200 font-semibold uppercase tracking-wide text-sm">{th ? 'เวทมนตร์ของจริง' : 'Real Magic Happening'}</span>
            <Star className="w-6 h-6 text-yellow-300" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-playfair">{th ? 'ตัวเลขที่พิสูจน์แล้ว' : 'The Numbers Behind the Magic'}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:border-white/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-amber-300 mx-auto mb-3">{s.icon}</div>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300">{s.num}</div>
              <div className="text-purple-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {quotes.map((tq, i) => (
            <div key={i} className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 rounded-2xl p-8 relative hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white mb-4"><Quote className="w-5 h-5" /></div>
              <p className="text-purple-100 leading-relaxed mb-4">"{tq.q}"</p>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl px-4 py-2 mb-5">
                <p className="text-yellow-200 text-sm font-semibold">{tq.hl}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{tq.name}</p>
                  <p className="text-purple-300 text-sm">{tq.role}</p>
                </div>
                <div className="flex">{[...Array(5)].map((_, si) => <Star key={si} className="w-4 h-4 text-yellow-300 fill-current" />)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
          {[th ? 'ตัวอย่างจากเล่มจริง' : 'From Real Books', th ? 'ไม่มีรีวิวปลอม' : 'No Fake Reviews', th ? 'ลองฟรีได้เอง' : 'Try It Free Yourself'].map((tb, i) => (
            <div key={i} className="flex items-center gap-2 text-purple-200 text-sm">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>{tb}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ FAQ ============================ */
function FAQ({ th }: { th: boolean }) {
  const faqs: [string, string][] = th ? [
    ['รูปลูกของฉันปลอดภัยไหม?', 'รูปต้นฉบับเป็นส่วนตัวและใช้สร้างตัวละครเท่านั้น หนังสือใหม่เป็นส่วนตัวโดยค่าเริ่มต้น และคุณลบข้อมูลเด็กได้เองทุกเมื่อ'],
    ['ใช้เวลานานแค่ไหน?', 'ประมาณ 10 นาทีต่อเล่ม อัปโหลดรูป เลือกนิทาน แล้ว AI สร้างเนื้อเรื่อง 10 หน้าและปกให้อัตโนมัติ'],
    ['หน้าลูกจะเหมือนจริงไหม?', 'AI สร้างตัวละครนิทานจากรูปจริงของลูก คุณเห็นตัวอย่างก่อนและสร้างตัวเลือกได้สูงสุด 3 แบบ'],
    ['ทดลองใช้ได้กี่เล่ม? ต้องใส่บัตรไหม?', 'บัญชีผู้ปกครองที่ผ่านการอนุมัติสร้างได้สูงสุด 6 เล่ม ไม่ต้องใส่บัตรเครดิต'],
    ['มีภาษาอะไรบ้าง?', 'ทุกหน้ามีภาษาไทยและอังกฤษคู่กัน พร้อมเสียงอ่านทั้งสองภาษา'],
    ['สั่งพิมพ์เป็นเล่มจริงได้ไหม?', 'ได้ค่ะ กดสนใจสั่งพิมพ์ในหน้านิทาน ทีมงานจะติดต่อกลับเรื่องหนังสือปกแข็งส่งถึงบ้าน'],
  ] : [
    ['Is my child\'s photo safe?', 'The original photo is private and used only for character creation. New books are private by default, and you can delete child data yourself at any time.'],
    ['How long does it take?', 'About 10 minutes per book. Upload a photo, pick a tale, and AI creates 10 story pages plus a cover automatically.'],
    ['Will it really look like my child?', 'AI creates a storybook character from the real photo. You preview first and can create up to 3 versions.'],
    ['How many beta books can I make? Card needed?', 'Approved parent accounts can create up to 6 books. No credit card is required.'],
    ['Which languages?', 'Every page pairs Thai and English, with narration audio in both languages.'],
    ['Can I order a printed copy?', 'Yes - tap the print-interest button on your finished book and our team will contact you about a hardcover.'],
  ];
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-playfair">{th ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions'}</h2>
          <p className="text-xl text-gray-600">{th ? 'ทุกอย่างที่ควรรู้เกี่ยวกับ StoryHero' : 'Everything you need to know about StoryHero'}</p>
        </div>
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {faqs.map(([q, a], i) => (
            <details key={i} className="group py-2">
              <summary className="flex items-center justify-between cursor-pointer list-none py-4 text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-purple-500 text-2xl leading-none group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <p className="text-gray-600 pb-5 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
        <div className="bg-purple-50 rounded-2xl p-6 text-center mt-10">
          <h3 className="font-bold text-gray-900 mb-1">{th ? 'ยังมีคำถามอีกไหม?' : 'Still have questions?'}</h3>
          <p className="text-gray-600 text-sm">{th ? 'ทักมาได้เลย ทีมงานยินดีช่วยเสมอ' : 'Reach out anytime - we\'re happy to help'}</p>
        </div>
      </div>
    </section>
  );
}

/* ============================ ORDER / PRICING ============================ */
function Order({ th }: { th: boolean }) {
  const navigate = useNavigate();
  return (
    <section id="order" className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-6 py-3 mb-6">
            <Shield className="w-5 h-5 text-orange-600" />
            <span className="text-orange-700 font-semibold uppercase text-sm tracking-wide">{th ? 'ทดลองใช้สำหรับผู้ปกครอง' : 'Parent Beta Access'}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-playfair">
            {th ? 'สร้างชั้นหนังสือเล็ก ๆ' : 'Build a Little Library'}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{th ? 'ที่ลูกเป็นฮีโร่' : 'Where Your Child Is the Hero'}</span>
          </h2>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 flex flex-col border-4 border-purple-500">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg whitespace-nowrap">
              <Shield className="w-3.5 h-3.5" /> {th ? 'อนุมัติโดยทีมงาน' : 'TEAM APPROVED'}
            </div>
            <div className="text-center mb-6">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-purple-500" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold text-gray-900">{th ? 'สิทธิ์ทดลองใช้ 6 เล่ม' : '6-Book Beta Access'}</h3>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 my-3">{th ? 'ฟรี' : 'FREE'}</div>
              <p className="text-gray-500 text-sm">{th ? 'ไม่ต้องใส่บัตร • ตรวจสอบบัญชีก่อนเริ่มสร้าง' : 'No card • Account review required before creating'}</p>
            </div>
            <ul className="space-y-3 text-gray-700 flex-1">
              {[th ? 'สร้างนิทานได้สูงสุด 6 เล่มต่อบัญชี' : 'Up to 6 books per parent account', th ? 'แต่ละเล่มมีเนื้อเรื่องสูงสุด 10 หน้า + ปก' : 'Up to 10 story pages plus a cover per book', th ? 'สองภาษา + เสียงอ่าน + PDF' : 'Bilingual + narration + PDF', th ? 'หนังสือเป็นส่วนตัว และเลือกแชร์กับครอบครัวได้' : 'Private books with optional family sharing'].map((f, i) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" />{f}</li>
              ))}
            </ul>
            <button onClick={() => navigate('/create')} className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300">
              {th ? 'สมัครและขออนุมัติ' : 'Sign In and Request Access'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-10 mt-12 flex-wrap text-gray-600">
          {[
            { icon: <Shield className="w-5 h-5" />, t: th ? 'ข้อมูลปลอดภัย' : 'Secure & Private' },
            { icon: <Clock className="w-5 h-5" />, t: th ? 'ตรวจสอบบัญชีก่อนสร้าง' : 'Approval Before Generation' },
            { icon: <Heart className="w-5 h-5" />, t: th ? 'ทำด้วยรักเพื่อครอบครัวไทย' : 'Made with love for Thai families' },
          ].map((g, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium">
              <span className="text-purple-500">{g.icon}</span>{g.t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ FOOTER ============================ */
function Footer({ th }: { th: boolean }) {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 text-center border-b border-gray-800">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
          {th ? 'อย่าให้ลูกพลาดเวทมนตร์ของ' : 'Don\'t Let Your Child Miss the Magic of'}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{th ? 'การเป็นฮีโร่' : 'Being the Hero'}</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          {th ? 'เปลี่ยนเวลาหน้าจอเป็นเวลาแห่งจินตนาการ สมัครทดลองใช้สำหรับผู้ปกครองวันนี้' : 'Turn screen time into imagination time. Join the parent beta today.'}
        </p>
        <button onClick={() => navigate('/create')} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 text-lg font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300">
          {th ? 'สมัครและขออนุมัติ' : 'Request Beta Access'}
        </button>
        <p className="text-gray-500 text-sm mt-4 flex items-center justify-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-green-500" /> {th ? 'สูงสุด 6 เล่ม • ไม่ต้องใส่บัตร • ต้องผ่านการอนุมัติ' : 'Up to 6 books • No card • Approval required'}
        </p>
      </div>
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="mb-3">
            <Logo variant="light" size="sm" />
          </div>
          <p className="text-gray-400 text-sm">{th ? 'นิทานคลาสสิกที่ลูกคุณเป็นตัวเอก สองภาษา พร้อมเสียงอ่าน' : 'Classic tales starring your child - bilingual, with narration.'}</p>
        </div>
        {[
          { h: th ? 'ผลิตภัณฑ์' : 'Product', links: [[th ? 'นิทานทั้งหมด' : 'Stories', '/#order'], [th ? 'ตัวอย่างเล่มจริง' : 'Example Book', DEMO.share], [th ? 'ราคา' : 'Pricing', '/#order']] },
          { h: th ? 'บัญชี' : 'Account', links: [[th ? 'เข้าสู่ระบบ' : 'Log In', '/login'], [th ? 'ชั้นหนังสือ' : 'My Library', '/app'], [th ? 'สร้างนิทาน' : 'Create', '/create']] },
          { h: th ? 'ช่วยเหลือ' : 'Support', links: [[th ? 'คำถามที่พบบ่อย' : 'FAQ', '/#faq'], [th ? 'ความเป็นส่วนตัว' : 'Privacy', '/privacy'], [th ? 'ข้อกำหนด' : 'Terms', '/terms'], [th ? 'ติดต่อเรา' : 'Contact', '/contact']] },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="font-bold mb-3 text-gray-200">{col.h}</h4>
            <ul className="space-y-2">
              {col.links.map(([label, href], li) => (
                <li key={li}><Link to={href} className="text-gray-400 hover:text-purple-300 text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm flex items-center justify-center gap-1.5 flex-wrap">
        <span>© {new Date().getFullYear()} StoryHero by EngBrain ·</span>
        <span className="inline-flex items-center gap-1">{th ? 'สร้างด้วย' : 'Made with'} <Heart className="w-3.5 h-3.5 text-purple-400 fill-current" /> {th ? 'เพื่อครอบครัวไทย' : 'for creative families'}</span>
      </div>
    </footer>
  );
}
