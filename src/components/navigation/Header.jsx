import React from 'react';
import './Header.css';

/**
 * Componente Header profesional para Genesis Explorer.
 * Incluye título de la aplicación, selector de libro activo, barra de búsqueda global y navegación por pestañas de estudio.
 */
export function Header({ activeTab, setActiveTab, searchQuery, setSearchQuery, totalStats }) {
  return (
    <header className="app-header">
      <div className="header-top-row">
        <div className="brand-container">
          <div className="brand-logo-badge">
            <span className="brand-icon">📜</span>
          </div>
          <div className="brand-titles">
            <h1 className="brand-title">
              GENESIS <span className="brand-title-accent">EXPLORER</span>
            </h1>
            <p className="brand-subtitle">
              Estudio Bíblico Visual & Cronología Patriarcal Anno Mundi (AM)
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Selector de Libro Multi-Libro (Preparado para expansión) */}
          <div className="book-selector-container">
            <label htmlFor="book-select" className="book-select-label">Libro Activo:</label>
            <div className="select-wrapper">
              <select id="book-select" className="book-select-input" defaultValue="genesis">
                <option value="genesis">📖 Génesis (50 Caps - 82 Eventos)</option>
                <option value="exodus" disabled>📖 Éxodo (Próximamente)</option>
                <option value="matthew" disabled>📖 Mateo (Próximamente)</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas del libro */}
          {totalStats && (
            <div className="stats-badges-container">
              <span className="stat-badge" title="Eventos Cronológicos">
                ⚡ <strong>{totalStats.eventsCount}</strong> Eventos
              </span>
              <span className="stat-badge" title="Personajes Documentados">
                👥 <strong>{totalStats.peopleCount}</strong> Personajes
              </span>
              <span className="stat-badge stat-badge-gold" title="Pactos y Promesas">
                🤝 <strong>{totalStats.covenantsCount}</strong> Pactos
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Búsqueda y Navegación Principal */}
      <div className="header-bottom-row">
        <nav className="header-nav-tabs">
          {/* GRUPO 1: ESTUDIO DEL LIBRO ACTIVO */}
          <div className="nav-group book-group">
            <span className="nav-group-title">📖 LIBRO ACTIVO (GÉNESIS)</span>
            <div className="nav-group-buttons">
              <button
                className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                <span className="tab-icon">⏳</span> Línea de Tiempo
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'chapters' ? 'active' : ''}`}
                onClick={() => setActiveTab('chapters')}
              >
                <span className="tab-icon">📖</span> Capítulos (1-50)
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'people' ? 'active' : ''}`}
                onClick={() => setActiveTab('people')}
              >
                <span className="tab-icon">👤</span> Personajes
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
                onClick={() => setActiveTab('locations')}
              >
                <span className="tab-icon">📍</span> Ubicaciones
              </button>
            </div>
          </div>

          {/* GRUPO 2: HERRAMIENTAS Y MÓDULOS TRANSVERSALES (SUITE BÍBLICA GLOBAL) */}
          <div className="nav-group global-group">
            <span className="nav-group-title">🌐 SUITE BÍBLICA TRANSVERSAL</span>
            <div className="nav-group-buttons">
              <button
                className={`nav-tab-btn ${activeTab === 'genealogy' ? 'active' : ''}`}
                onClick={() => setActiveTab('genealogy')}
              >
                <span className="tab-icon">🌳</span> Árbol & Convivencias
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'covenants' ? 'active' : ''}`}
                onClick={() => setActiveTab('covenants')}
              >
                <span className="tab-icon">✝️</span> Hilo Mesiánico & Pactos
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'dispensations' ? 'active' : ''}`}
                onClick={() => setActiveTab('dispensations')}
              >
                <span className="tab-icon">👑</span> 7 Dispensaciones
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
                onClick={() => setActiveTab('themes')}
              >
                <span className="tab-icon">🕊️</span> Temas Teológicos
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('questions')}
              >
                <span className="tab-icon">❓</span> Preguntas Teológicas
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <span className="tab-icon">📝</span> Cuaderno & Prédicas
              </button>
            </div>
          </div>
        </nav>

        {/* Buscador Global */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar eventos, personajes o lugares..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
