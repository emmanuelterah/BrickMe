import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { AuthContext } from '../../context/AuthContext';

export default function Header({ onMicClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="header">
      <nav className="navbar">
        <div className="logo">
          <span className="brick-icon" aria-label="BrickMe logo">
            {/* Simple LEGO brick SVG */}
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="28" height="16" rx="4" fill="#ffcf00" stroke="#e53d00" strokeWidth="2"/>
              <rect x="6" y="2" width="6" height="6" rx="2" fill="#ffcf00" stroke="#e53d00" strokeWidth="1.5"/>
              <rect x="20" y="2" width="6" height="6" rx="2" fill="#ffcf00" stroke="#e53d00" strokeWidth="1.5"/>
            </svg>
          </span>
          <span className="logo-text">BrickMe</span>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/how-it-works">How It Works</Link></li>
          <li><Link to="/gallery">Gallery</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li className="mobile-auth">
            {user ? (
              <>
                <Link to="/dashboard"><button className="sign-up">Dashboard</button></Link>
                <button className="sign-up" onClick={() => { logout(); navigate('/'); }}>Logout</button>
              </>
            ) : (
              <Link to="/auth"><button className="sign-up">Sign Up / Sign In</button></Link>
            )}
            <button className="mic-nav" onClick={onMicClick} aria-label="Voice Assistant">
              <span role="img" aria-label="microphone">🎤</span>
            </button>
          </li>
        </ul>
        <div className="auth-actions desktop-auth">
          {user ? (
            <>
              <Link to="/dashboard"><button className="sign-up">Dashboard</button></Link>
              <button className="sign-up" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <Link to="/auth"><button className="sign-up">Sign Up</button></Link>
          )}
          <button className="mic-nav" onClick={onMicClick} aria-label="Voice Assistant">
            <span role="img" aria-label="microphone">🎤</span>
          </button>
        </div>
      </nav>
    </header>
  );
} 