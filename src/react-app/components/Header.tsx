import { useEffect } from 'react';
import { useAuth } from '../auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpenCheck, Clock3, Library, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useLang } from '../i18n';
import { Logo } from './Logo';

export function Header() {
  const { user, logout, refetch } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.email) void refetch();
  }, [location.pathname, refetch, user?.email]);

  useEffect(() => {
    const refreshQuota = () => { void refetch(); };
    window.addEventListener('storyhero:quota-changed', refreshQuota);
    return () => window.removeEventListener('storyhero:quota-changed', refreshQuota);
  }, [refetch]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const quotaLabel = !user?.approved
    ? t('approvalPendingPill')
    : user.unlimited
      ? t('unlimitedBooks')
      : `${user.booksRemaining ?? 0} ${t('creditsLeft')}`;
  const quotaTone = !user?.approved
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : user.unlimited
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-purple-200 bg-purple-50 text-purple-700';
  const quotaIcon = !user?.approved
    ? <Clock3 className="h-4 w-4 shrink-0" />
    : user.unlimited
      ? <ShieldCheck className="h-4 w-4 shrink-0" />
      : <BookOpenCheck className="h-4 w-4 shrink-0" />;
  const quotaPill = (className: string) => user && (
    <span className={`${className} items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${quotaTone}`} role="status">
      {quotaIcon}
      <span>{quotaLabel}</span>
    </span>
  );

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="cursor-pointer shrink-0">
            <Logo variant="dark" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {quotaPill('hidden sm:inline-flex')}
            <button
              className="rounded-full border border-gray-200 bg-white px-3 sm:px-4 py-1.5 text-sm font-bold text-gray-500 hover:border-purple-300 transition-colors"
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            >
              <span className={lang === 'th' ? 'text-purple-600' : ''}>ไทย</span>
              <span className="mx-1 text-gray-300">/</span>
              <span className={lang === 'en' ? 'text-purple-600' : ''}>EN</span>
            </button>
            {user ? (
              <>
                <Link
                  to="/app"
                  className="hidden sm:inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <Library className="h-4 w-4" />
                  <span>{t('myLibrary')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 sm:px-6 py-2 text-sm transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>{t('login')}</span>
              </Link>
            )}
          </div>
        </div>
        {quotaPill('flex sm:hidden mt-2 w-full')}
      </div>
    </header>
  );
}
