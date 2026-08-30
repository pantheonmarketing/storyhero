import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, X, PenLine, ImagePlus, BookOpen, Palette, Crown, Check, Dices, SpellCheck2, Languages, Highlighter, Puzzle } from 'lucide-react';
import { api, Child, Book, fileToResizedBase64 } from '../api';
import { STORIES } from '../../shared/stories';
import { ART_STYLES, DEFAULT_STYLE_ID } from '../../shared/styles';
import { WORLDS, FRIENDS, VILLAINS, StoryElement } from '../../shared/elements';
import { PHONICS_GROUPS, getPhonicsGroup, type SupportedPhonicsGroup } from '../../shared/phonics';

/** Horizontal card picker for custom-story building blocks (world / friend / villain).
 *  Shows both languages on every card — English names double as vocab words. */
function ElementPicker({ label, items, value, onPick, noneLabel, lang }: {
  label: string; items: StoryElement[]; value: string;
  onPick: (id: string) => void; noneLabel: string; lang: string;
}) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <div className="el-row">
        <button type="button" className={`el-card el-none ${value === '' ? 'selected' : ''}`} onClick={() => onPick('')}>
          <div className="el-emoji"><Dices size={34} strokeWidth={1.75} /></div>
          <div className="el-label"><span className="el-name">{noneLabel}</span></div>
          {value === '' && <span className="el-check"><Check size={13} strokeWidth={3.5} /></span>}
        </button>
        {items.map((e) => (
          <button type="button" key={e.id} className={`el-card ${value === e.id ? 'selected' : ''}`}
            onClick={() => onPick(value === e.id ? '' : e.id)}>
            {e.preview.startsWith('http')
              ? <img className="el-photo" src={e.preview} alt={e.nameEn} loading="lazy" />
              : <div className="el-emoji">{e.emoji}</div>}
            <div className="el-label">
              <span className="el-name">{lang === 'th' ? e.nameTh : e.nameEn}</span>
              <span className="el-sub">{lang === 'th' ? e.nameEn : e.nameTh}</span>
            </div>
            {value === e.id && <span className="el-check"><Check size={13} strokeWidth={3.5} /></span>}
          </button>
        ))}
      </div>
    </div>
  );
}
import { useLang, type DictKey } from '../i18n';

type Step = 1 | 2 | 3 | 4 | 5;

const READING_AGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function suggestedPhonicsGroup(readingAge: number): SupportedPhonicsGroup {
  if (readingAge <= 4) return 1;
  return Math.min(7, readingAge - 3) as SupportedPhonicsGroup;
}

const PHONICS_UI: Record<SupportedPhonicsGroup, {
  groupKey: DictKey;
  titleKey: DictKey;
  placeholderKey: DictKey;
  ideas: readonly { labelKey: DictKey; value: string }[];
}> = {
  1: {
    groupKey: 'phonicsGroup1', titleKey: 'phonicsTitle', placeholderKey: 'phonicsIdeaPlaceholder',
    ideas: [
      { labelKey: 'phonicsIdeaAnt', value: 'An ant picnic' },
      { labelKey: 'phonicsIdeaTin', value: 'A surprise in a tin' },
      { labelKey: 'phonicsIdeaPin', value: 'A spinning pin' },
    ],
  },
  2: {
    groupKey: 'phonicsGroup2', titleKey: 'phonicsTitle2', placeholderKey: 'phonicsIdeaPlaceholder2',
    ideas: [
      { labelKey: 'phonicsIdeaHen', value: 'A hen and a red cap' },
      { labelKey: 'phonicsIdeaRat', value: 'A rat with ham' },
      { labelKey: 'phonicsIdeaCamp', value: 'A map at forest camp' },
    ],
  },
  3: {
    groupKey: 'phonicsGroup3', titleKey: 'phonicsTitle3', placeholderKey: 'phonicsIdeaPlaceholder3',
    ideas: [
      { labelKey: 'phonicsIdeaBug', value: 'A spotted bug' },
      { labelKey: 'phonicsIdeaPot', value: 'A nut in a hot pot' },
      { labelKey: 'phonicsIdeaRug', value: 'A puppy on a muddy rug' },
    ],
  },
  4: {
    groupKey: 'phonicsGroup4', titleKey: 'phonicsTitle4', placeholderKey: 'phonicsIdeaPlaceholder4',
    ideas: [
      { labelKey: 'phonicsIdeaBoat', value: 'A goat in a boat' },
      { labelKey: 'phonicsIdeaHorn', value: 'A goat with a horn at the farm' },
      { labelKey: 'phonicsIdeaJam', value: 'Jam in a jar on a rainy day' },
    ],
  },
  5: {
    groupKey: 'phonicsGroup5', titleKey: 'phonicsTitle5', placeholderKey: 'phonicsIdeaPlaceholder5',
    ideas: [
      { labelKey: 'phonicsIdeaBook', value: 'A book in a garden' },
      { labelKey: 'phonicsIdeaVest', value: 'A pink vest by a well' },
      { labelKey: 'phonicsIdeaKing', value: 'A singing king with a van' },
    ],
  },
  6: {
    groupKey: 'phonicsGroup6', titleKey: 'phonicsTitle6', placeholderKey: 'phonicsIdeaPlaceholder6',
    ideas: [
      { labelKey: 'phonicsIdeaMoth', value: 'A moth in a shed' },
      { labelKey: 'phonicsIdeaShop', value: 'A surprise box in a shop' },
      { labelKey: 'phonicsIdeaYak', value: 'A yak with yams' },
    ],
  },
  7: {
    groupKey: 'phonicsGroup7', titleKey: 'phonicsTitle7', placeholderKey: 'phonicsIdeaPlaceholder7',
    ideas: [
      { labelKey: 'phonicsIdeaChair', value: 'Fair hair by a chair' },
      { labelKey: 'phonicsIdeaBarn', value: 'A sound at the barn' },
      { labelKey: 'phonicsIdeaCoin', value: 'A coin on a quilt' },
    ],
  },
};

export function CreateWizardPage() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState('');

  // Step 1 — path (famous vs custom) + story / custom brief
  const [mode, setMode] = useState<'classic' | 'custom' | 'phonics'>('classic');
  const [storyId, setStoryId] = useState<string>((location.state as any)?.storyId || '');
  const [brief, setBrief] = useState('');
  const [phonicsGroup, setPhonicsGroup] = useState<SupportedPhonicsGroup>(1);
  const [phonicsInterest, setPhonicsInterest] = useState('');
  const [theme, setTheme] = useState('');
  const [readingLevel, setReadingLevel] = useState('');
  const [pageCount, setPageCount] = useState(11);
  const [worldId, setWorldId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [villainId, setVillainId] = useState('');
  // Step 2 — art style
  const [styleId, setStyleId] = useState<string>(DEFAULT_STYLE_ID);

  // Step 2 — child
  const [existing, setExisting] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState(5);
  const [readingAge, setReadingAge] = useState(5);
  const [gender, setGender] = useState<'boy' | 'girl'>('girl');
  const [photoB64, setPhotoB64] = useState('');
  const [dedication, setDedication] = useState('');
  const [friendName, setFriendName] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 3 — hero
  const [heroBusy, setHeroBusy] = useState(false);

  // Step 4 — book generation
  const [book, setBook] = useState<Book | null>(null);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [writing, setWriting] = useState(false);
  const generatingRef = useRef(false);
  const phonicsConfig = getPhonicsGroup(phonicsGroup) || PHONICS_GROUPS[0];
  const phonicsUi = PHONICS_UI[phonicsGroup];
  const recommendedPhonicsGroup = suggestedPhonicsGroup(readingAge);

  useEffect(() => {
    api.children().then(setExisting).catch(() => {});
  }, []);

  // Resume an in-progress book from the dashboard
  useEffect(() => {
    const resumeId = params.get('resume');
    if (!resumeId) return;
    api.book(resumeId).then((b) => {
      setStoryId(b.story_id);
      if (b.mode) setMode(b.mode);
      if (b.mode === 'phonics') {
        setPhonicsGroup(getPhonicsGroup(b.phonics_group)?.id || 1);
        if (b.custom_brief) setPhonicsInterest(b.custom_brief);
      }
      if (b.child) {
        setSelectedChild(b.child as Child);
        setReadingAge(Number(b.reading_age) || Number(b.child.age) || 5);
      }
      setBook(b);
      const imgs: Record<number, string> = {};
      for (const p of b.pages) if (p.image_url) imgs[p.idx] = p.image_url;
      setPageImages(imgs);
      setStep(5);
      if (b.status !== 'done') void illustrate(b);
    }).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickPhoto = async (file: File | undefined | null) => {
    if (!file) return;
    setError('');
    try {
      setBusy(true);
      const b64 = await fileToResizedBase64(file);
      setPhotoB64(b64);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };

  const submitChild = async () => {
    setError('');
    if (selectedChild) {
      setStep(4);
      // Regenerate the hero sheet when there is none yet, or when it was drawn
      // in a different art style than the one chosen for this book.
      if (!selectedChild.hero_url || (selectedChild.hero_style || DEFAULT_STYLE_ID) !== styleId) {
        void makeHero(selectedChild);
      }
      return;
    }
    if (!name.trim() || !photoB64) { setError(lang === 'th' ? 'กรุณากรอกชื่อและอัปโหลดรูป' : 'Please enter a name and upload a photo'); return; }
    try {
      setBusy(true);
      const child = await api.createChild({ name: name.trim(), age, gender, photo_b64: photoB64 });
      setSelectedChild(child);
      setStep(4);
      void makeHero(child);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };

  const makeHero = async (child: Child) => {
    setError('');
    setHeroBusy(true);
    try {
      const updated = await api.generateHero(child.id, styleId);
      setSelectedChild(updated);
    } catch (e: any) { setError(e.message); }
    finally { setHeroBusy(false); }
  };

  const startBook = async () => {
    if (!selectedChild || (mode === 'classic' && !storyId)) return;
    setError('');
    setStep(5);
    setWriting(true);
    try {
      const b = await api.createBook(selectedChild.id, mode === 'phonics' ? `phonics-g${phonicsGroup}` : mode === 'custom' ? 'custom' : storyId, {
        dedication: dedication.trim() || undefined,
        friend_name: friendName.trim() || undefined,
        art_style: styleId,
        reading_age: readingAge,
        ...(mode === 'phonics'
          ? {
              mode: 'phonics' as const,
              phonics_group: phonicsGroup,
              brief: phonicsInterest.trim() || undefined,
            }
          : mode === 'custom'
          ? {
              mode: 'custom' as const,
              brief: brief.trim(),
              theme: theme || undefined,
              reading_level: readingLevel || undefined,
              page_count: pageCount,
              world: worldId || undefined,
              friend: friendId || undefined,
              villain: villainId || undefined,
            }
          : {}),
      });
      setBook(b);
      setWriting(false);
      void illustrate(b);
    } catch (e: any) {
      setWriting(false);
      if (e.message === 'trial_limit') {
        setStep(4);
        setShowUpgrade(true);
      } else {
        setError(e.message);
      }
    }
  };

  // Sequentially request page illustrations until the book is done
  const illustrate = async (b: Book) => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    let failures = 0;
    try {
      let current: Book = b;
      while (current.status !== 'done') {
        try {
          const res = await api.nextPage(b.id);
          current = res.book || current;
          setBook({ ...current });
          if (typeof res.idx === 'number') {
            const full = await api.book(b.id);
            const imgs: Record<number, string> = {};
            for (const p of full.pages) if (p.image_url) imgs[p.idx] = p.image_url;
            setPageImages(imgs);
          }
          if (res.done) break;
          failures = 0;
        } catch (e: any) {
          failures += 1;
          if (failures >= 4) { setError(e.message || t('error')); break; }
          await new Promise((r) => setTimeout(r, 4000 * failures));
        }
      }
    } finally {
      generatingRef.current = false;
    }
  };

  const story = STORIES.find((s) => s.id === storyId);
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: t('wizStep1') }, { n: 2, label: t('wizStepStyle') },
    { n: 3, label: t('wizStep2') }, { n: 4, label: t('wizStep3') },
    { n: 5, label: t('wizStep4') },
  ];
  const doneCount = book?.pages_done ?? 0;
  const totalCount = book?.pages_total ?? 11;

  // Custom-mode helper data
  const IDEAS = lang === 'th'
    ? ['การผจญภัยใต้ทะเลในวันเกิด', 'ตามหาลูกหมาที่หายไป', 'วันแรกของโรงเรียนกับความกล้าหาญ', 'เดินทางสู่อวกาศกับเพื่อนหุ่นยนต์', 'ช่วยมังกรน้อยหาทางกลับบ้าน']
    : ['A birthday adventure under the sea', 'Finding a lost puppy', 'Being brave on the first day of school', 'A trip to space with a robot friend', 'Helping a baby dragon find its way home'];
  const THEMES: [string, string][] = [
    ['', t('customThemeNone')], ['courage', t('themeCourage')], ['kindness', t('themeKindness')],
    ['sharing', t('themeSharing')], ['honesty', t('themeHonesty')], ['friendship', t('themeFriendship')], ['bedtime calm', t('themeBedtime')],
  ];
  const LENGTHS: [number, string][] = [[6, t('pagesShort')], [11, t('pagesStandard')], [16, t('pagesLong')]];
  const LEVELS: [string, string][] = [
    ['', t('levelAuto')], ['simple', t('levelSimple')], ['growing', t('levelGrowing')], ['confident', t('levelConfident')],
  ];
  const surprise = () => setBrief(IDEAS[Math.floor(Math.random() * IDEAS.length)]);

  return (
    <div className="wizard">
      <div className="wiz-steps">
        {steps.map((s, i) => (
          <span key={s.n} style={{ display: 'flex', gap: 8 }}>
            {i > 0 && <span className="wiz-sep">·</span>}
            <span className={`wiz-step ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`}>
              <span className="dot">{step > s.n ? '✓' : s.n}</span> {s.label}
            </span>
          </span>
        ))}
      </div>

      {error && <div className="error-message" style={{ textAlign: 'center' }}>{error}</div>}

      {/* ---- STEP 1: choose classic, custom, or curriculum-controlled phonics ---- */}
      {step === 1 && (
        <>
          <div className="path-toggle">
            <button className={`path-btn ${mode === 'classic' ? 'selected' : ''}`} onClick={() => setMode('classic')}>
              <BookOpen size={26} strokeWidth={1.75} />
              <div><b>{t('pathFamous')}</b><span>{t('pathFamousSub')}</span></div>
            </button>
            <button className={`path-btn ${mode === 'custom' ? 'selected' : ''}`} onClick={() => setMode('custom')}>
              <PenLine size={26} strokeWidth={1.75} />
              <div><b>{t('pathCustom')}</b><span>{t('pathCustomSub')}</span></div>
            </button>
            <button className={`path-btn ${mode === 'phonics' ? 'selected' : ''}`} onClick={() => setMode('phonics')}>
              <SpellCheck2 size={27} strokeWidth={1.75} />
              <div><b>{t('pathPhonics')}</b><span>{t('pathPhonicsSub')}</span></div>
              {mode === 'phonics' && <span className="path-check"><Check size={13} strokeWidth={3.5} /></span>}
            </button>
          </div>

          {mode === 'classic' ? (
            <>
              <h1 className="wiz-title">{t('wizStep1')}</h1>
              <div className="wiz-wide">
                <div className="story-grid">
                  {STORIES.map((s) => (
                    <button key={s.id} className={`story-card ${storyId === s.id ? 'selected' : ''}`}
                      onClick={() => setStoryId(s.id)}>
                      <div className="story-cover"><img src={s.cover} alt={s.titleEn} loading="lazy" /></div>
                      <h3>{lang === 'th' ? s.titleTh : s.titleEn}</h3>
                      <div className="en">{lang === 'th' ? s.titleEn : s.titleTh}</div>
                      <div className="tag">{lang === 'th' ? s.taglineTh : s.taglineEn}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : mode === 'custom' ? (
            <div className="custom-form form-card">
              <div className="form-row">
                <label>{t('customIdeaLabel')}</label>
                <textarea className="input" rows={3} value={brief} maxLength={600}
                  onChange={(e) => setBrief(e.target.value)} placeholder={t('customIdeaPlaceholder')}
                  style={{ marginBottom: 10, resize: 'vertical' }} />
                <div className="idea-chips">
                  {IDEAS.map((idea) => (
                    <button key={idea} className="idea-chip" onClick={() => setBrief(idea)}>{idea}</button>
                  ))}
                  <button className="idea-chip surprise" onClick={surprise}><Dices size={14} strokeWidth={2.25} /> {t('customSurprise')}</button>
                </div>
              </div>

              <div className="form-row">
                <label>{t('customThemeLabel')}</label>
                <div className="chip-row">
                  {THEMES.map(([val, lbl]) => (
                    <button key={val} className={`opt-chip ${theme === val ? 'selected' : ''}`} onClick={() => setTheme(val)}>{lbl}</button>
                  ))}
                </div>
              </div>

              <ElementPicker label={t('customWorldLabel')} items={WORLDS} value={worldId}
                onPick={setWorldId} noneLabel={t('customThemeNone')} lang={lang} />
              <ElementPicker label={t('customFriendLabel')} items={FRIENDS} value={friendId}
                onPick={setFriendId} noneLabel={t('customThemeNone')} lang={lang} />
              <ElementPicker label={t('customVillainLabel')} items={VILLAINS} value={villainId}
                onPick={setVillainId} noneLabel={t('customThemeNone')} lang={lang} />

              <div className="form-row">
                <label>{t('lengthLabel')}</label>
                <div className="chip-row">
                  {LENGTHS.map(([n, lbl]) => (
                    <button key={n} className={`opt-chip ${pageCount === n ? 'selected' : ''}`} onClick={() => setPageCount(n)}>
                      {lbl} · {n} {lang === 'th' ? 'หน้า' : 'pages'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 0 }}>
                <label>{t('levelLabel')}</label>
                <div className="chip-row">
                  {LEVELS.map(([val, lbl]) => (
                    <button key={val} className={`opt-chip ${readingLevel === val ? 'selected' : ''}`} onClick={() => setReadingLevel(val)}>{lbl}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="phonics-form form-card">
              <div className="phonics-head">
                <div>
                  <div className="phonics-badges">
                    <span className="phonics-badge">{t(phonicsUi.groupKey)}</span>
                    <span className="phonics-ready"><Check size={12} strokeWidth={3} /> {t('phonicsReady')}</span>
                  </div>
                  <h1>{t(phonicsUi.titleKey)}</h1>
                  <p>{t('phonicsDescription')}</p>
                </div>
                <div className="phonics-sounds" aria-label={t(phonicsUi.groupKey)}>
                  {phonicsConfig.graphemes.map((sound) => <span key={sound}>{sound}</span>)}
                </div>
              </div>

              <div className="phonics-benefits">
                <div><BookOpen size={20} /><span>{t('phonicsBenefitPages')}</span></div>
                <div><Highlighter size={20} /><span>{t('phonicsBenefitHighlight')}</span></div>
                <div><Languages size={20} /><span>{t('phonicsBenefitThai')}</span></div>
                <div><Puzzle size={20} /><span>{t('phonicsBenefitPractice')}</span></div>
              </div>

              <div className="form-row phonics-interest">
                <label>{t('phonicsIdeaLabel')} <span>{t('phonicsOptional')}</span></label>
                <textarea className="input" rows={2} value={phonicsInterest} maxLength={240}
                  onChange={(e) => setPhonicsInterest(e.target.value)}
                  placeholder={t(phonicsUi.placeholderKey)}
                  style={{ marginBottom: 10, resize: 'vertical' }} />
                <div className="idea-chips">
                  {phonicsUi.ideas.map(({ labelKey, value }) => (
                    <button key={value} className="idea-chip" onClick={() => setPhonicsInterest(value)}>{t(labelKey)}</button>
                  ))}
                </div>
              </div>

              <div className="phonics-journey">
                <b>{t('phonicsJourney')}</b>
                {PHONICS_GROUPS.map((group) => (
                  <button key={group.id} className={phonicsGroup === group.id ? 'active' : ''}
                    onClick={() => { setPhonicsGroup(group.id); setPhonicsInterest(''); }}>
                    {group.id} · {group.graphemes.join(' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="wiz-actions">
            <span />
            <button className="btn btn-primary"
              disabled={mode === 'classic' ? !storyId : mode === 'custom' ? !brief.trim() : false}
              onClick={() => { if (mode === 'custom' && !brief.trim()) { setError(t('customIdeaRequired')); return; } setError(''); setStep(2); }}>
              {t('continue')}
            </button>
          </div>
        </>
      )}

      {/* ---- STEP 2: choose art style ---- */}
      {step === 2 && (
        <>
          <h1 className="wiz-title">{t('wizStepStyle')}</h1>
          <p className="style-picker-sub" style={{ textAlign: 'center', marginTop: -12, marginBottom: 24 }}>{t('stylePickerSub')}</p>
          <div className="wiz-wide">
            <div className="style-grid">
              {ART_STYLES.map((s) => (
                <button key={s.id} className={`style-card ${styleId === s.id ? 'selected' : ''}`}
                  onClick={() => setStyleId(s.id)}>
                  <img src={s.preview} alt={s.nameEn} loading="lazy" />
                  <span>{lang === 'th' ? s.nameTh : s.nameEn}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="wiz-actions">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>{t('back')}</button>
            <button className="btn btn-primary" disabled={!styleId} onClick={() => setStep(3)}>{t('continue')}</button>
          </div>
        </>
      )}

      {/* ---- STEP 3: child details + photo ---- */}
      {step === 3 && (
        <>
          <h1 className="wiz-title wiz-title-with-cover">
            {story && <img className="wiz-title-cover" src={story.cover} alt="" />}
            {t('wizStep2')}
          </h1>
          <div className="form-card">
            {existing.length > 0 && (
              <div className="form-row">
                <label>{t('usePreviousChild')}</label>
                <div className="child-chip-row">
                  {existing.map((ch) => (
                    <button key={ch.id} className={`child-chip ${selectedChild?.id === ch.id ? 'selected' : ''}`}
                      onClick={() => {
                        const deselecting = selectedChild?.id === ch.id;
                        setSelectedChild(deselecting ? null : ch);
                        setReadingAge(deselecting ? age : ch.age);
                      }}>
                      <img src={ch.hero_url || ch.photo_url} alt="" />
                      {ch.name} · {ch.age}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!selectedChild && (
              <>
                <div className="form-row">
                  <label>{t('childName')}</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'th' ? 'เช่น น้องมีนา' : 'e.g. Mina'} style={{ marginBottom: 0 }} />
                </div>
                <div className="form-row">
                  <label>{t('childAge')}</label>
                  <select className="input" value={age} onChange={(e) => {
                    const nextAge = Number(e.target.value);
                    setAge(nextAge);
                    setReadingAge(nextAge);
                  }} style={{ marginBottom: 0 }}>
                    {READING_AGES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="gender-row">
                    <button className={`gender-btn ${gender === 'girl' ? 'selected' : ''}`} onClick={() => setGender('girl')}>{t('girl')}</button>
                    <button className={`gender-btn ${gender === 'boy' ? 'selected' : ''}`} onClick={() => setGender('boy')}>{t('boy')}</button>
                  </div>
                </div>
                <div className="form-row">
                  <label>{t('uploadPhoto')}</label>
                  {photoB64 ? (
                    <div className="photo-preview">
                      <img src={`data:image/jpeg;base64,${photoB64}`} alt="" />
                      <button onClick={() => setPhotoB64('')}><X size={16} /></button>
                    </div>
                  ) : (
                    <label className="photo-drop" htmlFor="child-photo-input">
                      <Camera className="drop-icon" size={40} strokeWidth={1.5} />
                      <p>{busy ? t('loading') : t('uploadPhoto')}</p>
                      <small>{t('photoHint')}</small>
                      <input
                        id="child-photo-input"
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          pickPhoto(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="privacy-note">{t('privacyNote')}</p>
              </>
            )}

            <div className="reading-age-card">
              <div className="reading-age-copy">
                <label htmlFor="reading-age">{t('readingAgeLabel')}</label>
                <p>{t('readingAgeHelp')}</p>
              </div>
              <select id="reading-age" className="reading-age-select" value={readingAge}
                onChange={(e) => setReadingAge(Number(e.target.value))}>
                {READING_AGES.map((a) => (
                  <option key={a} value={a}>{a} {lang === 'th' ? 'ปี' : 'years'}</option>
                ))}
              </select>
              {mode === 'phonics' && (
                <div className="phonics-age-guide">
                  <div>
                    <strong>{t('phonicsAgeSuggestion')}: {t(PHONICS_UI[recommendedPhonicsGroup].groupKey)}</strong>
                    <span>{t('phonicsAgeCaution')}</span>
                  </div>
                  {phonicsGroup === recommendedPhonicsGroup ? (
                    <span className="phonics-age-match"><Check size={13} strokeWidth={3} /> {t('phonicsGroupMatches')}</span>
                  ) : (
                    <button type="button" className="btn btn-secondary btn-small"
                      onClick={() => { setPhonicsGroup(recommendedPhonicsGroup); setPhonicsInterest(''); }}>
                      {t('useSuggestedGroup')} {recommendedPhonicsGroup}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="form-row" style={{ marginTop: 8 }}>
              <label>{t('friendLabel')}</label>
              <input className="input" value={friendName} onChange={(e) => setFriendName(e.target.value)}
                placeholder={t('friendPlaceholder')} style={{ marginBottom: 0 }} maxLength={40} />
            </div>
            <div className="form-row">
              <label>{t('dedicationLabel')}</label>
              <input className="input" value={dedication} onChange={(e) => setDedication(e.target.value)}
                placeholder={t('dedicationPlaceholder')} style={{ marginBottom: 0 }} maxLength={200} />
            </div>
          </div>
          <div className="wiz-actions">
            <button className="btn btn-ghost" onClick={() => setStep(2)}>{t('back')}</button>
            <button className="btn btn-primary" disabled={busy} onClick={submitChild}>{t('continue')}</button>
          </div>
        </>
      )}

      {/* ---- STEP 4: hero preview ---- */}
      {step === 4 && selectedChild && (
        <div className="gen-stage">
          <h1 className="wiz-title">
            {heroBusy || !selectedChild.hero_url
              ? `${t('creatingHero')} ${selectedChild.name}...`
              : t('heroReady')}
          </h1>
          <div className="hero-frame">
            {heroBusy || !selectedChild.hero_url ? (
              <div className="spin-stage">
                <div className="spinner" />
                <p className="pulse">{t('creatingHeroSub')}</p>
              </div>
            ) : (
              <img src={selectedChild.hero_url} alt={selectedChild.name} />
            )}
          </div>
          {!heroBusy && selectedChild.hero_url && (
            <div className="hero-ctas">
              <button className="btn btn-secondary" onClick={() => makeHero(selectedChild)}>{t('heroRetry')}</button>
              <button className="btn btn-primary" onClick={startBook}>{t('heroApprove')}</button>
            </div>
          )}
          {!heroBusy && !selectedChild.hero_url && (
            <button className="btn btn-primary" onClick={() => makeHero(selectedChild)}>{t('retry')}</button>
          )}
        </div>
      )}

      {/* ---- STEP 5: book generation progress ---- */}
      {step === 5 && (
        <div className="gen-stage">
          {writing && (
            <>
              <h1 className="wiz-title"><PenLine className="title-icon" size={28} /> {t('writingStory')}</h1>
              <div className="hero-frame"><div className="spin-stage"><div className="spinner" /><p className="pulse">{mode === 'phonics' ? t('phonicsWriting') : mode === 'custom' ? brief : (lang === 'th' ? story?.titleTh : story?.titleEn)}</p></div></div>
            </>
          )}
          {!writing && book && book.status !== 'done' && (
            <div className="gen-progress">
              <h1 className="wiz-title"><Palette className="title-icon" size={28} /> {t('illustrating')} {Math.min(doneCount + 1, totalCount)} {t('ofPages')} {totalCount}</h1>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(doneCount / totalCount) * 100}%` }} />
              </div>
              <p style={{ color: 'var(--ink-soft)', fontSize: '.92rem' }}>{t('generatingNote')}</p>
              <div className="thumb-strip">
                {Array.from({ length: totalCount }, (_, i) => (
                  <div className="thumb" key={i}>
                    {pageImages[i]
                      ? <img src={pageImages[i]} alt="" />
                      : <span className={i === doneCount ? 'pulse' : ''} style={{ opacity: .35 }}>
                          {i === 0 ? <BookOpen size={22} /> : <ImagePlus size={22} />}
                        </span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!writing && book && book.status === 'done' && (
            <>
              <h1 className="wiz-title">{t('bookReady')}</h1>
              <div className="hero-frame">
                {book.cover_url && <img src={book.cover_url} alt="" />}
              </div>
              <button className="btn btn-primary" onClick={() => navigate(`/book/${book.id}`)}>{t('openBook')}</button>
            </>
          )}
          {!writing && !book && !error && (
            <div className="hero-frame"><div className="spin-stage"><div className="spinner" /></div></div>
          )}
          {error && book && (
            <button className="btn btn-secondary" style={{ marginTop: 16 }}
              onClick={() => { setError(''); void illustrate(book); }}>
              {t('retry')}
            </button>
          )}
        </div>
      )}

      {step === 5 && book && book.status !== 'done' && (
        <p style={{ textAlign: 'center', marginTop: 30 }}>
          <Link to="/app" style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>{t('myLibrary')}</Link>
        </p>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLang();
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState('');
  const join = async (pkg: string) => {
    setBusy(pkg);
    try { await api.packageInterest(pkg, ''); setDone(pkg); }
    catch { /* noop */ }
    finally { setBusy(''); }
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <BookOpen size={44} strokeWidth={1.5} style={{ margin: '0 auto 12px', color: 'var(--peach-deep)' }} />
        <h2>{t('upgradeTitle')}</h2>
        <p>{t('upgradeSub')}</p>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { id: 'starter', icon: <BookOpen size={18} />, label: `${t('pkgStarter')} — ฿790 (5 ${lang === 'th' ? 'เล่ม' : 'books'})` },
            { id: 'premium', icon: <Crown size={18} />, label: `${t('pkgPremium')} — ฿1,290 (10 ${lang === 'th' ? 'เล่ม' : 'books'})` },
          ].map((p) => (
            done === p.id
              ? <div key={p.id} style={{ fontWeight: 700, color: '#2e8b57' }}>{t('earlyBirdDone')}</div>
              : <button key={p.id} className="btn btn-primary" disabled={!!busy} onClick={() => join(p.id)}>
                  {p.icon}
                  {busy === p.id ? '...' : `${p.label} · ${t('earlyBird')}`}
                </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={onClose}>
          {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
        </button>
      </div>
    </div>
  );
}
