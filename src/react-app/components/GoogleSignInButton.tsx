import { useEffect, useRef } from 'react';

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let googleScript: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google) return Promise.resolve();
  if (googleScript) return googleScript;
  googleScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google sign-in'));
    document.head.appendChild(script);
  });
  return googleScript;
}

export function GoogleSignInButton({
  clientId,
  disabled,
  onCredential,
  onError,
}: {
  clientId: string;
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}) {
  const button = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleScript().then(() => {
      if (cancelled || !button.current || !window.google) return;
      button.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) onCredential(response.credential);
          else onError('Google did not return a sign-in credential');
        },
      });
      window.google.accounts.id.renderButton(button.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
        text: 'continue_with',
      });
    }).catch((error) => onError(error instanceof Error ? error.message : 'Could not load Google sign-in'));
    return () => { cancelled = true; };
  }, [clientId, onCredential, onError]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', opacity: disabled ? 0.65 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div ref={button} />
    </div>
  );
}
