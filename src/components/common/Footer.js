import React from "react";
import "./Footer.css";

function SocialIcon({ type, href, label }) {
  const icons = {
    ig: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" fill="#fff" stroke="#e53d00" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="#e53d00"/><circle cx="18" cy="6" r="1.5" fill="#e53d00"/></svg>
    ),
    x: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" fill="#fff" stroke="#e53d00" strokeWidth="2"/><path d="M7 7l10 10M17 7L7 17" stroke="#e53d00" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    yt: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" fill="#fff" stroke="#e53d00" strokeWidth="2"/><polygon points="10,8 16,12 10,16" fill="#e53d00"/></svg>
    ),
    tiktok: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" fill="#fff" stroke="#e53d00" strokeWidth="2"/><path d="M15 8v4a3 3 0 11-3-3" stroke="#e53d00" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    li: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" fill="#fff" stroke="#e53d00" strokeWidth="2"/><rect x="7" y="10" width="2" height="7" fill="#e53d00"/><rect x="11" y="13" width="2" height="4" fill="#e53d00"/><circle cx="8" cy="8" r="1" fill="#e53d00"/></svg>
    ),
  };
  return (
    <a href={href} aria-label={label} className={`icon ${type}`} target="_blank" rel="noopener noreferrer">
      {icons[type]}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="footer-main glass-card">
      <div className="footer-content">
        <div className="footer-col about">
          <h3>About BrickMe</h3>
          <p>AI-powered fun for your face — transform your favorite photos into LEGO masterpieces.</p>
        </div>
        <div className="footer-col links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-col contact">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:hello@brickme.ai">hello@brickme.ai</a></li>
            <li>+1 (555) 123-4567</li>
            <li>123 Brick Lane, Toy City</li>
          </ul>
        </div>
        <div className="footer-col social-news">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <SocialIcon type="ig" href="#" label="Instagram" />
            <SocialIcon type="x" href="#" label="X" />
            <SocialIcon type="yt" href="#" label="YouTube" />
            <SocialIcon type="tiktok" href="#" label="TikTok" />
            <SocialIcon type="li" href="#" label="LinkedIn" />
          </div>
          <form className="newsletter">
            <input type="email" placeholder="Subscribe for weekly brickspiration" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 BrickMe. Built with creativity — one brick at a time.
      </div>
    </footer>
  );
} 