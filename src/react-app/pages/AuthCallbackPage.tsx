import { useEffect, useState } from 'react';

/** OAuth popup callback: exchanges the code for a session, notifies opener, closes. */
export function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        if (errorParam) throw new Error(errorParam);
        if (!code) throw new Error('No authorization code received');

        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
          credentials: 'include',
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error((data as any).error || 'Failed to create session');
        }
        setStatus('success');
        if (window.opener) {
          // Legacy popup flow (if a popup somehow opened this page)
          window.opener.postMessage({ type: 'oauth-success' }, window.location.origin);
          window.close();
        } else {
          // Full-page redirect flow: session cookie is set, go straight to the app
          window.location.replace('/app');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Login failed');
        if (window.opener) {
          window.opener.postMessage(
            { type: 'oauth-error', error: err instanceof Error ? err.message : 'Login failed' },
            window.location.origin
          );
          setTimeout(() => window.close(), 2000);
        }
      }
    };
    handleCallback();
  }, []);

  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center' }}>
        {status === 'processing' && (<><div className="spinner" style={{ margin: '0 auto 14px' }} /><p>Completing login...</p></>)}
        {status === 'success' && <p style={{ color: '#2e8b57', fontSize: 18 }}>Login successful!</p>}
        {status === 'error' && (<><p style={{ color: '#c0392b', fontSize: 18 }}>Login failed</p><p>{error}</p></>)}
      </div>
    </div>
  );
}
