import React from 'react';

function SidebarThemeSelect({ theme, onThemeChange }) {
  return (
    <select value={theme} onChange={e => onThemeChange(e.target.value)}>
      <option value="default">Default</option>
      <option value="dark">Dark</option>
      <option value="lego">Lego</option>
      <option value="ocean">Ocean</option>
    </select>
  );
}

export default SidebarThemeSelect; 