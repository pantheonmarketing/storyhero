import { useAuth } from '../auth';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';
import { useLang } from '../i18n';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export function LoginPage() {
  const { user, isPending, sendOTP, verifyOTP, loginGoogle, googleClientId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailMode, setEmailMode] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/app';

  useEffect(() => {
    if (user && !isPending) navigate(from, { replace: true });
  }, [user, isPending, navigate, from]);

  const handleGoogleLogin = useCallback(async (credential: string) => {
    try {
      setError('');
      setLoading(true);
      await loginGoogle(credential);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
      setLoading(false);
    }
  }, [from, loginGoogle, navigate]);

  const handleGoogleError = useCallback((message: string) => {
    setError(message);
    setLoading(false);
  }, []);

  const handleSendOTP = async () => {
    if (!email) { setError(t('emailPlaceholder')); return; }
    try {
      setError('');
      setLoading(true);
      await sendOTP(email);
      setOtpSent(true);
    } catch (err) {
      setError(String((err as any)?.message || err).includes('banned')
        ? t('accountSuspended')
        : 'Failed to send code. Please check your email.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return;
    try {
      setError('');
      setLoading(true);
      await verifyOTP(email, otp);
      navigate(from, { replace: true });
    } catch (err) {
      setError(String((err as any)?.message || err).includes('banned')
        ? t('accountSuspended')
        : 'Invalid or expired code');
    } finally { setLoading(false); }
  };

  if (isPending) return <div className="auth-page"><div className="spinner" /></div>;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <BookOpen size={44} strokeWidth={1.5} style={{ margin: '0 auto 12px', color: 'var(--peach-deep)' }} />
        <h1>{t('loginTitle')}</h1>
        <p>{t('loginSub')}</p>
        {error && <div className="error-message">{error}</div>}

        {googleClientId && (
          <>
            <GoogleSignInButton
              clientId={googleClientId}
              disabled={loading}
              onCredential={handleGoogleLogin}
              onError={handleGoogleError}
            />
            <div className="auth-divider">{t('or')}</div>
          </>
        )}

        {!emailMode ? (
          <button className="btn btn-secondary" onClick={() => setEmailMode(true)}><Mail size={18} /> {t('loginEmail')}</button>
        ) : !otpSent ? (
          <div>
            <input className="input" type="email" placeholder={t('emailPlaceholder')}
              value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            <button className="btn btn-secondary" onClick={handleSendOTP} disabled={loading}>
              {loading ? t('sending') : t('sendCode')}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '.9rem', marginBottom: 10 }}>{t('codeSentTo')} <b>{email}</b></p>
            <p style={{ fontSize: '.78rem', color: 'var(--ink-soft)', margin: '-2px 0 10px' }}>{t('checkSpam')}</p>
            <input className="input" type="text" placeholder={t('codePlaceholder')} maxLength={6}
              value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading} />
            <button className="btn btn-primary" onClick={handleVerifyOTP} disabled={loading}>
              {loading ? t('verifying') : t('verify')}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setOtpSent(false)} disabled={loading} style={{ marginTop: 8 }}>
              {t('useDifferentEmail')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
