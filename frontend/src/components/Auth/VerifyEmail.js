import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const verificationRequests = useRef(new Map());

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    let isCurrent = true;

    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        let request = verificationRequests.current.get(token);
        if (!request) {
          request = authAPI.verifyEmail(token);
          verificationRequests.current.set(token, request);
        }

        const response = await request;

        if (isCurrent) {
          setStatus('success');
          setMessage(
            response.message || 'Email verified successfully.'
          );
        }
      } catch (error) {
        if (isCurrent) {
          setStatus('error');
          setMessage(
            error.message || 'Email verification failed.'
          );
        }
      }
    };

    verifyEmail();

    return () => {
      isCurrent = false;
    };
  }, [token]);

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