import React, { useRef } from "react";
import "./ImageUpload.css";

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

export default function ImageUpload({ onImageUpload }) {
  const fileInput = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onImageUpload(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onImageUpload(URL.createObjectURL(file));
  };

  return (
    <div className="glass-card image-upload-card">
      <LegoStudsRow />
      <div
        className="image-upload lego-upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInput.current.click()}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          style={{ display: "none" }}
          onChange={handleChange}
        />
        <div className="upload-instructions">
          <span role="img" aria-label="brick">🧱</span>
          Drag & drop or <span className="upload-link">click to upload</span> an image!
        </div>
      </div>
    </div>
  );
} 