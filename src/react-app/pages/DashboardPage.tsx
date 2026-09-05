import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, Library, PenLine, ShieldCheck, ChevronRight, Clock3 } from 'lucide-react';
import { api, Book } from '../api';
import { useLang } from '../i18n';
import { useAuth } from '../auth';
import { getStory } from '../../shared/stories';

export function DashboardPage() {
  const { lang, t } = useLang();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [credits, setCredits] = useState<{
    credits: number; unlimited: boolean; approved: boolean;
    bookLimit: number | null; booksUsed: number; booksRemaining: number | null;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.books().then(setBooks).catch((e) => setError(e.message));
    api.credits().then(setCredits).catch(() => {});
  }, []);

  const approved = !!user?.approved;
  const unlimited = !!(credits?.unlimited ?? user?.unlimited);
  const booksRemaining = credits?.booksRemaining ?? user?.booksRemaining ?? 0;
  const canCreate = approved && (unlimited || booksRemaining > 0);

  return (
    <div className="dash container">
      <div className="dash-head">
        <h1><BookOpen className="title-icon" size={28} /> {t('myLibrary')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {approved && credits && !credits.unlimited && (
            <span className="credits-pill">
              <Coins size={15} /> {booksRemaining} {t('creditsLeft')}
            </span>
          )}
          {canCreate && <Link to="/create" className="btn btn-primary">{t('createNew')}</Link>}
        </div>
      </div>

      {!approved && (
        <div className="account-access-card pending" role="status">
          <span className="account-access-icon"><Clock3 size={24} /></span>
          <span>
            <strong>{t('approvalPendingTitle')}</strong>
            <small>{t('approvalPendingBody')}</small>
          </span>
          <span className="account-access-pill">{t('approvalPendingPill')}</span>
        </div>
      )}

      {approved && !unlimited && booksRemaining === 0 && (
        <div className="account-access-card limit" role="status">
          <span className="account-access-icon"><BookOpen size={24} /></span>
          <span>
            <strong>{t('bookLimitTitle')}</strong>
            <small>{t('bookLimitBody')}</small>
          </span>
          <span className="account-access-pill">6 / 6</span>
        </div>
      )}

      <Link to="/privacy-data" className="privacy-summary-card">
        <span className="privacy-summary-icon"><ShieldCheck size={22} /></span>
        <span>
          <strong>{lang === 'th' ? 'ความเป็นส่วนตัวและข้อมูล' : 'Privacy & data'}</strong>
          <small>{lang === 'th' ? 'หนังสือเป็นส่วนตัวโดยค่าเริ่มต้น จัดการข้อมูลเด็กและลิงก์ครอบครัว' : 'Books are private by default. Manage child data and family links.'}</small>
        </span>
        <ChevronRight size={20} />
      </Link>

      {error && <div className="error-message">{error}</div>}
      {!books && !error && <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>}

      {books && books.length === 0 && (
        <div className="empty-state">
          <Library size={56} strokeWidth={1.25} style={{ margin: '0 auto 16px', color: 'var(--peach-deep)' }} />
          <p>{approved ? t('emptyLibrary') : t('approvalPendingEmpty')}</p>
          {canCreate && <Link to="/create" className="btn btn-primary" style={{ marginTop: 20 }}>{t('ctaStart')}</Link>}
        </div>
      )}

      {books && books.length > 0 && (
        <div className="book-grid">
          {books.map((b) => {
            const story = getStory(b.story_id);
            const inProgress = b.status !== 'done';
            const to = inProgress ? `/create?resume=${b.id}` : `/book/${b.id}`;
            return (
              <Link to={to} className="book-card" key={b.id}>
                <div className="book-cover">
                  {b.cover_url
                    ? <img src={b.cover_url} alt="" loading="lazy" />
                    : story?.cover
                      ? <img src={story.cover} alt="" loading="lazy" />
                      : <div className="placeholder"><BookOpen size={40} strokeWidth={1.5} /></div>}
                </div>
                <div className="book-info">
                  <h3>{lang === 'th' ? b.title_th : b.title_en}</h3>
                  <p>{b.child_name}</p>
                  <p style={{ marginTop: 8 }}>
                    {inProgress
                      ? <span className="pill pill-progress"><PenLine size={12} /> {b.pages_done}/{b.pages_total}</span>
                      : <span className="pill pill-done">✓ {t('bookReady')}</span>}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
