import React, { useEffect, useState } from 'react';
import API_BASE from '../api';

function ConfirmPage() {
  const [message, setMessage] = useState('Confirming...');
  useEffect(() => {
    const token = window.location.pathname.split('/').pop();
    fetch(`${API_BASE}/api/auth/confirm/${token}`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Confirmation failed'));
  }, []);
  return (
    <div className="auth-page">
      <h2>Account Confirmation</h2>
      <p>{message}</p>
      <a href="/login">Go to Login</a>
    </div>
  );
}

export default ConfirmPage; 