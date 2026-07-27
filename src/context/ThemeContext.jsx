import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Cargar tema guardado o usar 'dark' como valor predeterminado
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('genesis_explorer_theme') || 'dark';
  });

  useEffect(() => {
    // Aplicar el atributo data-theme al elemento <html> raíz de la aplicación
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('genesis_explorer_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}
