import './Header.css';

/**
 * Componente Header maquetado con la arquitectura limpia de dos filas:
 * - Fila Superior: Marca + Módulos de la Suite Bíblica Global en el margen derecho.
 * - Fila Inferior: Contexto del Libro Activo (Selector, Estadísticas, Menú de Génesis y Buscador).
 */
export function Header({ activeTab, setActiveTab, searchQuery, setSearchQuery, totalStats, activeBookId, setActiveBookId }) {
  return (
    <header className="app-header">
      {/* 1. FILA SUPERIOR: MARCA (IZQUIERDA) Y MÓDULOS GLOBALES (DERECHA) */}
      <div className="header-top-row">
        <div className="brand-container">
          <div className="brand-logo-badge">
            <span className="brand-icon">📜</span>
          </div>
          <div className="brand-titles">
            <h1 className="brand-title">
              BIBLE <span className="brand-title-accent">EXPLORER</span>
            </h1>
            <p className="brand-subtitle">
              Estudio Bíblico Visual & Cronología Mesiánica (Adán a Cristo)
            </p>
          </div>
        </div>

        {/* MENÚ DE MÓDULOS DE LA SUITE BÍBLICA GLOBAL (MARGEN DERECHO) */}
        <nav className="header-global-nav" aria-label="Suite Bíblica Global">
          <button
            className={`nav-tab-btn global-tab-btn ${activeTab === 'genealogy' ? 'active' : ''}`}
            onClick={() => setActiveTab('genealogy')}
            title="Árbol Genealógico y Vidas Superpuestas"
          >
            <span className="tab-icon">🌳</span> Árbol & Convivencias
          </button>
          <button
            className={`nav-tab-btn global-tab-btn ${activeTab === 'covenants' ? 'active' : ''}`}
            onClick={() => setActiveTab('covenants')}
            title="Hilo Redentor Mesiánico y Pactos Bíblicos"
          >
            <span className="tab-icon">✝️</span> Hilo Mesiánico & Pactos
          </button>
          <button
            className={`nav-tab-btn global-tab-btn ${activeTab === 'dispensations' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispensations')}
            title="Las 7 Dispensaciones de la Historia Bíblica"
          >
            <span className="tab-icon">👑</span> 7 Dispensaciones
          </button>
          <button
            className={`nav-tab-btn global-tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
            title="Tratados de Teología Sistemática"
          >
            <span className="tab-icon">🕊️</span> Temas Teológicos
          </button>
          <button
            className={`nav-tab-btn global-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
            title="Preguntas Teológicas y Apologética"
          >
            <span className="tab-icon">❓</span> Preguntas Teológicas
          </button>
          <button
            className={`nav-tab-btn global-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
            title="Cuaderno Personal y Editor de Prédicas PDF"
          >
            <span className="tab-icon">📝</span> Cuaderno & Prédicas
          </button>
        </nav>
      </div>

      {/* 2. FILA INFERIOR: CONTEXTO DEL LIBRO ACTIVO + NAVEGACIÓN Y BUSCADOR */}
      <div className="header-bottom-row">
        <div className="header-book-context">
          {/* Selector de Libro Active */}
          <div className="book-selector-container">
            <label htmlFor="book-select" className="book-select-label">Libro Activo:</label>
            <div className="select-wrapper">
              <select
                id="book-select"
                className="book-select-input"
                value={activeBookId || 'genesis'}
                onChange={(e) => setActiveBookId && setActiveBookId(e.target.value)}
              >
                <option value="genesis">📖 Génesis (50 Caps - 82 Eventos)</option>
                <option value="matthew">✝️ San Mateo (28 Caps - 20 Eventos)</option>
                <option value="exodus" disabled>📖 Éxodo (Próximamente)</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas del libro */}
          {totalStats && (
            <div className="stats-badges-container">
              <span className="stat-badge" title="Eventos Cronológicos de Génesis">
                ⚡ <strong>{totalStats.eventsCount}</strong> Eventos
              </span>
              <span className="stat-badge" title="Personajes Documentados">
                👥 <strong>{totalStats.peopleCount}</strong> Personajes
              </span>
              <span className="stat-badge stat-badge-gold" title="Pactos Bíblicos en Génesis">
                🤝 <strong>{totalStats.covenantsCount}</strong> Pactos
              </span>
            </div>
          )}

          <span className="header-v-divider">|</span>

          {/* Menú de Módulos Específicos del Libro */}
          <nav className="header-book-nav" aria-label="Módulos del Libro Activo">
            <button
              className={`nav-tab-btn book-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <span className="tab-icon">⏳</span> Línea de Tiempo
            </button>
            <button
              className={`nav-tab-btn book-tab-btn ${activeTab === 'chapters' ? 'active' : ''}`}
              onClick={() => setActiveTab('chapters')}
            >
              <span className="tab-icon">📖</span> Capítulos (1-{activeBookId === 'matthew' ? 28 : 50})
            </button>
            <button
              className={`nav-tab-btn book-tab-btn ${activeTab === 'people' ? 'active' : ''}`}
              onClick={() => setActiveTab('people')}
            >
              <span className="tab-icon">👤</span> Personajes
            </button>
            <button
              className={`nav-tab-btn book-tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
              onClick={() => setActiveTab('locations')}
            >
              <span className="tab-icon">📍</span> Ubicaciones
            </button>
          </nav>
        </div>

        {/* Buscador Global en la derecha */}
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
