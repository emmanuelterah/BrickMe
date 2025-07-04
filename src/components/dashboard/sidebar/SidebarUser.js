import React from 'react';

function SidebarUser({ user, avatarVersion }) {
  return (
    <div className="sidebar-user">
      <img
        src={user?.profile?.avatar ? `${user.profile.avatar}?v=${avatarVersion}` : '/logo192.png'}
        alt="avatar"
        className={`sidebar-avatar${avatarVersion ? ' avatar-animate' : ''}`}
        onAnimationEnd={e => e.currentTarget.classList.remove('avatar-animate')}
      />
      <div className="sidebar-username">{user?.profile?.name || user?.email}</div>
    </div>
  );
}

export default SidebarUser; 