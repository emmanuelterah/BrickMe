import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import useNavigation from '../hooks/useNavigation';

function ConfirmPage() {
  const [message, setMessage] = useState('Confirming...');
  const { get } = useApi();
  const { goTo } = useNavigation();
  useEffect(() => {
    const token = window.location.pathname.split('/').pop();
    get(`/api/auth/confirm/${token}`).then(({ data }) => setMessage(data?.message)).catch(() => setMessage('Confirmation failed'));
  }, [get]);
  return (
    <div className="auth-page">
      <h2>Account Confirmation</h2>
      <p>{message}</p>
      <a href="/login">Go to Login</a>
    </div>
  );
}

export default ConfirmPage; 