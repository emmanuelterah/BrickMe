import React from "react";
import "./LegoArtPreview.css";
import beforeImgDefault from "../images/lego1.jpg";
import afterImgDefault from "../images/lego3.jpg";

function LegoStudsRow({ count = 7, color = "#ffcf00" }) {
  return (
    <div className="lego-studs-row">
      {[...Array(count)].map((_, i) => (
        <svg key={i} width="32" height="18" viewBox="0 0 32 18" style={{ margin: '0 2px' }}>
          <ellipse cx="16" cy="9" rx="13" ry="7" fill={color} stroke="#e53d00" strokeWidth="2" />
          <ellipse cx="16" cy="7" rx="7" ry="3.5" fill="#fffbe7" opacity="0.25" />
        </svg>
      ))}
    </div>
  );
}

function LegoStud({ color = "#ffcf00" }) {
  return (
    <svg className="lego-stud" width="18" height="18" viewBox="0 0 18 18">
      <ellipse cx="9" cy="9" rx="7" ry="6" fill={color} stroke="#e53d00" strokeWidth="1.5" />
      <ellipse cx="9" cy="7" rx="4" ry="1.8" fill="#fffbe7" opacity="0.25" />
    </svg>
  );
}

function LegoMosaicOverlay() {
  return (
    <svg className="lego-mosaic-overlay" viewBox="0 0 180 180" width={180} height={180}>
      {[...Array(9)].map((_, row) =>
        [...Array(9)].map((_, col) => (
          <circle
            key={row + '-' + col}
            cx={col * 20 + 10}
            cy={row * 20 + 10}
            r={6}
            fill="#fffbe7"
            opacity={0.18 + 0.12 * ((row + col) % 2)}
          />
        ))
      )}
    </svg>
  );
}

export default function LegoArtPreview({ originalImage, legoArt, setLegoArt }) {
  // Use local images as default placeholders
  const beforeImg = originalImage || beforeImgDefault;
  const afterImg = legoArt || afterImgDefault;
  return (
    <section className="glass-card lego-art-preview">
      <LegoStudsRow />
      <h2>See Your LEGO-fied Art!</h2>
      <div className="preview-images">
        <div className="before fade-in">
          <span className="label">Before</span>
          <img src={beforeImg} alt="Original Upload or Placeholder" />
        </div>
        <div className="after fade-in">
          <span className="label">After</span>
          <div className="lego-art-img-container">
            <img src={afterImg} alt="LEGO Art or Placeholder" />
            <LegoMosaicOverlay />
          </div>
        </div>
      </div>
      <div className="lego-art-actions">
        <button className="lego-btn" disabled={!legoArt}>
          <LegoStud />Download
        </button>
        <button className="lego-btn blue" disabled={!legoArt}>
          <LegoStud color="#00b4d8" />Share
        </button>
      </div>
    </section>
  );
} 