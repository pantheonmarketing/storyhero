import { useAuth } from '../auth';
import { Link, useNavigate } from 'react-router-dom';
import { Library, LogIn, LogOut } from 'lucide-react';
import { useLang } from '../i18n';
import { Logo } from './Logo';

export function Header() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="cursor-pointer">
          <Logo variant="dark" />
        </Link>

        <div className="flex items-center space-x-3">
          <button
            className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-bold text-gray-500 hover:border-purple-300 transition-colors"
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
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 text-sm transition-colors"
            >
              <LogIn className="h-4 w-4" />
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
