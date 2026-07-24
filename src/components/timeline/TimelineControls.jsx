import React from 'react';
import { EVENT_CATEGORIES } from '../../utils/timelineMapper';
import './TimelineControls.css';

/**
 * Componente de Controles y Filtros Avanzados para la Línea de Tiempo de Génesis.
 */
export function TimelineControls({
  eventsCount = 0,
  selectedCategory,
  setSelectedCategory,
  selectedBlockId,
  setSelectedBlockId,
  selectedChapter,
  setSelectedChapter,
  filterText,
  setFilterText,
  detailLevel = 3,
  setDetailLevel,
  activeJump,
  narrativeBlocks = [],
  onJumpToAM,
  onZoomIn,
  onZoomOut,
  onFitAll
}) {
  // Hitos bíblicos estratégicos auditados con cronología exacta Anno Mundi (AM)
  const QUICK_JUMPS = [
    { id: 'creation', label: '✨ Creación', amStart: 0, amEnd: 10, title: 'Salto a la Creación y el Edén (AM 0)' },
    { id: 'flood', label: '🌊 El Diluvio', amStart: 1650, amEnd: 1665, title: 'Salto al Diluvio de Noé (AM 1656)' },
    { id: 'babel', label: '🗼 Torre de Babel', amStart: 1745, amEnd: 1770, title: 'Salto a Babel y la Confusión de Lenguas (AM 1757)' },
    { id: 'abraham', label: '👑 Llamado Abraham', amStart: 2075, amEnd: 2110, title: 'Salto al Llamado de Abraham a los 75 años (AM 2083) y el Pacto' },
    { id: 'joseph', label: '🌾 José en Egipto', amStart: 2270, amEnd: 2310, title: 'Salto a José Gobernador de Egipto (AM 2289) y reunión familiar' }
  ];

  return (
    <div className="timeline-controls-wrapper">
      {/* Fila 1: Filtros de Búsqueda y Selección */}
      <div className="controls-row-filters">
        {/* Buscador de Eventos */}
        <div className="filter-group search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="timeline-search-input"
            placeholder="Filtrar eventos por palabra..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          {filterText && (
            <button className="clear-search-btn" onClick={() => setFilterText('')}>✕</button>
          )}
        </div>

        {/* Selector de Nivel de Detalle Semántico (LOD) */}
        <div className="filter-group lod-selector-group">
          <label className="filter-label">🔍 Nivel de Zoom:</label>
          <div className="lod-buttons-toggle">
            <button
              className={`lod-btn ${detailLevel === 1 ? 'active' : ''}`}
              onClick={() => setDetailLevel(1)}
              title="Nivel 1: Muestra únicamente Eras Teológicas y Pactos Divinos (Visión limpia macro)"
            >
              1. Eras & Pactos
            </button>
            <button
              className={`lod-btn ${detailLevel === 2 ? 'active' : ''}`}
              onClick={() => setDetailLevel(2)}
              title="Nivel 2: Muestra Bloques Narrativos y Hitos Bíblicos Principales"
            >
              2. Bloques
            </button>
            <button
              className={`lod-btn ${detailLevel === 3 ? 'active' : ''}`}
              onClick={() => setDetailLevel(3)}
              title="Nivel 3: Detalle Completo de los 82 Eventos Bíblicos"
            >
              3. Eventos (Detalle)
            </button>
          </div>
        </div>

        {/* Selector de Categoría */}
        <div className="filter-group">
          <label className="filter-label">Categoría:</label>
          <select
            className="controls-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las Categorías</option>
            {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Bloque Narrativo */}
        <div className="filter-group">
          <label className="filter-label">Bloque Narrativo:</label>
          <select
            className="controls-select"
            value={selectedBlockId}
            onChange={(e) => setSelectedBlockId(e.target.value)}
          >
            <option value="all">Todos los Bloques Narrativos</option>
            {narrativeBlocks.map(b => {
              const chapRange = b.chapters_range || `${b.chapters_start ?? ''}-${b.chapters_end ?? ''}`;
              return (
                <option key={b.id} value={b.id}>
                  📍 {b.name} (Caps. {chapRange})
                </option>
              );
            })}
          </select>
        </div>

        {/* Selector de Capítulo Específico del 1 al 50 */}
        <div className="filter-group">
          <label className="filter-label">Capítulo:</label>
          <select
            className="controls-select chapter-select"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
          >
            <option value="all">Todos (1 - 50)</option>
            {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Capítulo {num}</option>
            ))}
          </select>
        </div>

        {/* Contador de Eventos Visibles */}
        <div className="events-count-badge">
          ⚡ {eventsCount} Evento{eventsCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Fila 2: Saltos Rápido a Hitos Bíblicos y Zoom */}
      <div className="controls-row-jumps">
        <div className="quick-jumps-group">
          <span className="quick-jumps-title">📍 Salto Rápido:</span>
          <div className="quick-jump-buttons">
            {QUICK_JUMPS.map((jump) => (
              <button
                key={jump.id}
                className={`jump-chip-btn ${activeJump === jump.id ? 'active' : ''}`}
                onClick={() => onJumpToAM(jump.id, jump.amStart, jump.amEnd, jump.label)}
                title={jump.title}
              >
                {jump.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de Navegación de Zoom */}
        <div className="zoom-actions-group">
          <button className="control-action-btn" onClick={onZoomIn} title="Acercar Zoom">
            🔍 + Zoom
          </button>
          <button className="control-action-btn" onClick={onZoomOut} title="Alejar Zoom">
            🔍 - Zoom
          </button>
          <button className="control-action-btn action-accent" onClick={onFitAll} title="Ver Todo Génesis (AM 0 - 2369)">
            🌌 Ver Todo (AM 0 - 2369)
          </button>
        </div>
      </div>
    </div>
  );
}
