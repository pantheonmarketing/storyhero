import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, Library, PenLine } from 'lucide-react';
import { api, Book } from '../api';
import { useLang } from '../i18n';
import { getStory } from '../../shared/stories';

export function DashboardPage() {
  const { lang, t } = useLang();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [credits, setCredits] = useState<{ credits: number; unlimited: boolean } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.books().then(setBooks).catch((e) => setError(e.message));
    api.credits().then(setCredits).catch(() => {});
  }, []);

  return (
    <div className="dash container">
      <div className="dash-head">
        <h1><BookOpen className="title-icon" size={28} /> {t('myLibrary')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {credits && !credits.unlimited && (
            <span className="credits-pill">
              <Coins size={15} /> {credits.credits} {t('creditsLeft')}
            </span>
          )}
          <Link to="/create" className="btn btn-primary">{t('createNew')}</Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {!books && !error && <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>}

      {books && books.length === 0 && (
        <div className="empty-state">
          <Library size={56} strokeWidth={1.25} style={{ margin: '0 auto 16px', color: 'var(--peach-deep)' }} />
          <p>{t('emptyLibrary')}</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: 20 }}>{t('ctaStart')}</Link>
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
