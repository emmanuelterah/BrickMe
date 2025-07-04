import React from "react";
import "./HeroSection.css";
import img1 from "../../images/lego1.jpg";
import img2 from "../../images/lego2.jpg";

function LegoStud({ color = "#ffcf00" }) {
  return (
    <svg className="lego-stud" width="22" height="22" viewBox="0 0 22 22">
      <ellipse cx="11" cy="11" rx="9" ry="8" fill={color} stroke="#e53d00" strokeWidth="2" />
      <ellipse cx="11" cy="8.5" rx="5" ry="2.5" fill="#fffbe7" opacity="0.25" />
    </svg>
  );
}

function LegoMosaicOverlay() {
  // Simulate a LEGO mosaic grid overlay
  return (
    <svg className="lego-mosaic-overlay" viewBox="0 0 240 240" width={240} height={240}>
      {[...Array(12)].map((_, row) =>
        [...Array(12)].map((_, col) => (
          <circle
            key={row + '-' + col}
            cx={col * 20 + 10}
            cy={row * 20 + 10}
            r={7}
            fill="#fffbe7"
            opacity={0.18 + 0.12 * ((row + col) % 2)}
          />
        ))
      )}
    </svg>
  );
}

function playLegoSnap() {
  const audio = new window.Audio("/lego-snap.mp3");
  audio.volume = 0.5;
  audio.play();
}

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content glass-card">
        <h1>
          Turn Your Selfies into <span className="lego-text">Brick Legends!</span>
        </h1>
        <p>
          Upload any photo and watch the magic happen — get your own LEGO-style pixel art!
        </p>
        <div className="cta-buttons">
          <button className="lego-btn" onClick={playLegoSnap}>
            <LegoStud />Upload Your Photo
          </button>
          <button className="lego-btn blue" onClick={playLegoSnap}>
            <LegoStud color="#00b4d8" />Talk to the AI
          </button>
        </div>
      </div>
      <div className="hero-image glass-card">
        <div className="animated-img-premium">
          <img
            src={img1}
            alt="Sample Portrait"
            className="portrait-img"
          />
          <div className="lego-mosaic-container">
            <img
              src={img2}
              alt="LEGO Mosaic Example"
              className="lego-art-img"
            />
            <LegoMosaicOverlay />
          </div>
        </div>
      </div>
    </section>
  );
} 