import React, { useState } from 'react';
import useApi from '../hooks/useApi';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const { post } = useApi();
  const token = window.location.pathname.split('/').pop();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const { data } = await post('/api/auth/reset-password', { token, newPassword });
    setMessage(data?.message);
  };
  return (
    <div className="auth-page">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPasswordPage; 