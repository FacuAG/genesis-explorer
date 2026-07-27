import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'dark', label: 'Oscuro', icon: '🌙' },
    { id: 'sepia', label: 'Sepia', icon: '📜' },
    { id: 'light', label: 'Claro', icon: '☀️' }
  ];

  return (
    <div className="theme-toggle-segmented" title="Cambiar tema visual de la aplicación">
      {themes.map(t => (
        <button
          key={t.id}
          className={`theme-toggle-btn ${theme === t.id ? 'active' : ''}`}
          onClick={() => setTheme(t.id)}
        >
          <span className="theme-icon">{t.icon}</span>
          <span className="theme-label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
