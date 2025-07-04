import React from 'react';

function ThemeSelector({ theme, handleThemeChange }) {
  return (
    <select value={theme} onChange={e => handleThemeChange(e.target.value)}>
      <option value="default">Default</option>
      <option value="dark">Dark</option>
      <option value="lego">Lego</option>
      <option value="ocean">Ocean</option>
    </select>
  );
}

export default ThemeSelector; 