import React from 'react';
import SidebarUser from './sidebar/SidebarUser';
import SidebarNav from './sidebar/SidebarNav';
import SidebarThemeSelect from './sidebar/SidebarThemeSelect';

function Sidebar({ user, onSelect, selected, onThemeChange, theme, onLogout, avatarVersion }) {
  return (
    <aside className="dashboard-sidebar">
      <SidebarUser user={user} avatarVersion={avatarVersion} />
      <SidebarNav selected={selected} onSelect={onSelect} />
      <div className="sidebar-bottom">
        <SidebarThemeSelect theme={theme} onThemeChange={onThemeChange} />
        <button className="sidebar-logout" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar; 