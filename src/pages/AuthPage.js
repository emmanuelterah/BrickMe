import React, { useState } from 'react';
import './AuthPage.css';

function AuthPage() {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  // Shared state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Signup only
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  // Feedback
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, profile: { name, avatar } }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Signup failed');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      setMessage('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-card">
        <div className="auth-logo">
          {/* LEGO-style SVG logo */}
          <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="9" width="42" height="24" rx="6" fill="#ffcf00" stroke="#e53d00" strokeWidth="3"/>
            <rect x="9" y="3" width="9" height="9" rx="3" fill="#ffcf00" stroke="#e53d00" strokeWidth="2"/>
            <rect x="30" y="3" width="9" height="9" rx="3" fill="#ffcf00" stroke="#e53d00" strokeWidth="2"/>
          </svg>
        </div>
        {mode === 'signup' ? (
          <>
            <h2>Create your account</h2>
            <form onSubmit={handleSignup} autoComplete="off">
              <input type="text" placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#888',
                    fontSize: '1.1em',
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Sign Up'}
              </button>
            </form>
            <button className="toggle-link" onClick={() => { setMode('login'); setMessage(''); }}>Already have an account? Sign In</button>
          </>
        ) : (
          <>
            <h2>Sign in to BrickMe</h2>
            <form onSubmit={handleLogin} autoComplete="off">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#888',
                    fontSize: '1.1em',
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Sign In'}
              </button>
            </form>
            <button className="toggle-link" onClick={() => { setMode('signup'); setMessage(''); }}>New user? Sign Up</button>
          </>
        )}
        <div className="auth-message">{message}</div>
      </div>
    </div>
  );
}

export default AuthPage; 