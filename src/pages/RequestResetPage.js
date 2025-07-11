import React, { useState } from 'react';
import useApi from '../hooks/useApi';

function RequestResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { post } = useApi();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const { data } = await post('/api/auth/request-reset', { email });
    setMessage(data?.message);
  };
  return (
    <div className="auth-page">
      <h2>Request Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RequestResetPage; 