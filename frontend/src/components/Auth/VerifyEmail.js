import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);

        setStatus('success');
        setMessage(
          response.message || 'Email verified successfully.'
        );
      } catch (error) {
        setStatus('error');
        setMessage(
          error.message || 'Email verification failed.'
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        {status === 'verifying' && (
          <>
            <h2>Verifying Email...</h2>
            <p>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <Link to="/login" className="btn btn-submit">
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <Link to="/login" className="btn btn-submit">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}