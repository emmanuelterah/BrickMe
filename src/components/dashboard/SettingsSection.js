import React from 'react';
import AvatarUpload from './settings/AvatarUpload';
import ThemeSelector from './settings/ThemeSelector';
import CropModal from './settings/CropModal';

function SettingsSection({
  name,
  setName,
  avatar,
  avatarUploading,
  handleAvatarFileChange,
  handleDropboxChoose,
  handleGoogleDriveChoose,
  user,
  avatarVersion,
  theme,
  handleThemeChange,
  handleProfileUpdate,
  message,
  cropModalOpen,
  cropImage,
  crop,
  setCrop,
  zoom,
  setZoom,
  onCropComplete,
  croppedPreview,
  handleCropSave,
  handleCropCancel
}) {
  return (
    <section className="dashboard-settings">
      <h2>Settings</h2>
      <form onSubmit={handleProfileUpdate} className="settings-form">
        <label>
          Name:
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        </label>
        <label>
          Avatar:
          <AvatarUpload
            avatar={avatar}
            avatarUploading={avatarUploading}
            handleAvatarFileChange={handleAvatarFileChange}
            handleDropboxChoose={handleDropboxChoose}
            handleGoogleDriveChoose={handleGoogleDriveChoose}
            user={user}
            avatarVersion={avatarVersion}
          />
        </label>
        <label>
          Theme:
          <ThemeSelector theme={theme} handleThemeChange={handleThemeChange} />
        </label>
        <button type="submit">Save Changes</button>
        {message && <span className="settings-message">{message}</span>}
      </form>
      <CropModal
        cropModalOpen={cropModalOpen}
        cropImage={cropImage}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        onCropComplete={onCropComplete}
        croppedPreview={croppedPreview}
        handleCropSave={handleCropSave}
        handleCropCancel={handleCropCancel}
        avatarUploading={avatarUploading}
        message={message}
      />
    </section>
  );
}

export default SettingsSection; 