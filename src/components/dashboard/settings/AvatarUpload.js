import React from 'react';

function AvatarUpload({ avatar, avatarUploading, handleAvatarFileChange, handleDropboxChoose, handleGoogleDriveChoose, user, avatarVersion }) {
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleAvatarFileChange} />
      <button type="button" onClick={handleDropboxChoose} style={{ marginLeft: 8 }}>Choose from Dropbox</button>
      <button type="button" onClick={handleGoogleDriveChoose} style={{ marginLeft: 8 }}>Choose from Google Drive</button>
      {avatarUploading && <span>Uploading...</span>}
      {user?.profile?.avatar && (
        <img
          src={`${user.profile.avatar}?v=${avatarVersion}`}
          alt="avatar preview"
          style={{ width: 64, height: 64, borderRadius: '50%', marginTop: 8 }}
          className={avatarVersion ? 'avatar-animate' : ''}
          onAnimationEnd={e => e.currentTarget.classList.remove('avatar-animate')}
        />
      )}
    </div>
  );
}

export default AvatarUpload; 