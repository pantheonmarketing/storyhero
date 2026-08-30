import { useAuth } from '../auth';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useLang } from '../i18n';

export function AuthProtect({ children }: { children: ReactNode }) {
  const { user, isPending } = useAuth();
  const location = useLocation();
  const { t } = useLang();

  if (isPending) {
    return (
      <div className="auth-page">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 14px' }} />
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
