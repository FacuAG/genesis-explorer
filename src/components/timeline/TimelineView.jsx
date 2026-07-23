import React from 'react';
import './TimelineView.css';

/**
 * Componente principal para la visualización cronológica (Timeline) de Genesis Explorer.
 * Integrará el motor vis-timeline en las sub-fases I-02 e I-03.
 */
export function TimelineView({ events, eras, narrativeBlocks }) {
  return (
    <div className="timeline-container">
      <div className="timeline-placeholder-card">
        <div className="timeline-header-info">
          <h2>⏳ Línea de Tiempo del Génesis (Anno Mundi)</h2>
          <p>
            Explora {events.length} eventos históricos desde la Creación (AM 0) hasta la Muerte de José (AM 2369).
          </p>
        </div>

        <div className="timeline-eras-preview">
          <h3>📌 Eras y Bloques Narrativos Registrados:</h3>
          <div className="eras-grid">
            {narrativeBlocks.map((block) => (
              <div key={block.id} className="era-badge-card">
                <span className="era-chapter-tag">Caps. {block.chapters_range}</span>
                <h4 className="era-title">{block.name}</h4>
                <p className="era-summary">{block.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
