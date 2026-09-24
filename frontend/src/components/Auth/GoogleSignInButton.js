import React, { useEffect, useRef, useState } from 'react';
import { authAPI } from '../../services/api';

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

const loadGoogleIdentityScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google sign-in failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Google sign-in failed to load.'));
    document.head.appendChild(script);
  });

export default function GoogleSignInButton({ onSuccess, onError, disabled = false }) {
  const buttonRef = useRef(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const initialiseGoogleSignIn = async () => {
      try {
        const config = await authAPI.getGoogleConfig();
        if (!config.enabled || !config.clientId) {
          if (isActive) {
            setMessage('Google sign-in is not configured yet.');
          }
          return;
        }

        await loadGoogleIdentityScript();
        if (!isActive || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: config.clientId,
          callback: async ({ credential }) => {
            try {
              const response = await authAPI.loginWithGoogle(credential);
              onSuccess(response);
            } catch (error) {
              onError(error.message || 'Google sign-in failed.');
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
      } catch (error) {
        if (isActive) {
          setMessage(error.message || 'Google sign-in failed to load.');
        }
      }
    };

    initialiseGoogleSignIn();
    return () => { isActive = false; };
  }, [onError, onSuccess]);

  if (disabled) return null;

  return (
    <div className="google-sign-in">
      <div ref={buttonRef} />
      {message && <p className="google-sign-in-message">{message}</p>}
    </div>
  );
}
