import React from 'react';

function LegoFyUpload({ uploadedImage, uploadedFileName, handleImageChange }) {
  return (
    <div className="lego-fy-upload-row">
      <label className="lego-fy-upload-label">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="lego-fy-upload-input"
        />
        <span className="lego-fy-upload-btn">
          <span role="img" aria-label="upload">📸</span> Choose a Photo
        </span>
      </label>
      <div className="lego-fy-upload-info">
        {uploadedFileName && <span className="lego-fy-upload-filename">{uploadedFileName}</span>}
        {uploadedImage && (
          <img
            src={URL.createObjectURL(uploadedImage)}
            alt="preview"
            className="lego-fy-preview"
          />
        )}
      </div>
    </div>
  );
}

export default LegoFyUpload; 