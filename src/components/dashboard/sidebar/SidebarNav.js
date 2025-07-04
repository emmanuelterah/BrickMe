import React from 'react';

function SidebarNav({ selected, onSelect }) {
  return (
    <nav className="sidebar-nav">
      <button className={selected === 'home' ? 'active' : ''} onClick={() => onSelect('home')}>🏠 Home</button>
      <button className={selected === 'lego-fy' ? 'active' : ''} onClick={() => onSelect('lego-fy')}>🖼️ LEGO-fy Image</button>
      <button className={selected === 'mosaic' ? 'active' : ''} onClick={() => onSelect('mosaic')}>🟫 Mosaic Builder</button>
      <button className={selected === 'ai' ? 'active' : ''} onClick={() => onSelect('ai')}>🤖 AI Chat</button>
      <button className={selected === 'settings' ? 'active' : ''} onClick={() => onSelect('settings')}>⚙️ Settings</button>
      <button className="disabled" disabled>🧱 3D Instructions (soon)</button>
      <button className="disabled" disabled>🧑‍🎨 Minifig Builder (soon)</button>
    </nav>
  );
}

export default SidebarNav; 