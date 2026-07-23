import React, { useState } from 'react';
import './Panels.css';

/**
 * Componente Navegador Estructurado de los 50 Capítulos del Génesis.
 */
export function ChapterMapPanel({ chapters = [], eventsMap = new Map(), peopleMap = new Map(), onSelectEvent }) {
  const [selectedChapterNum, setSelectedChapterNum] = useState(1);

  const activeChapterObj = chapters.find(c => Number(c.chapter) === Number(selectedChapterNum));

  // Obtener eventos presentes en el capítulo activo
  const chapterEvents = (activeChapterObj?.event_ids || [])
    .map(id => eventsMap.get(id))
    .filter(Boolean);

  // Obtener personas presentes en el capítulo activo
  const chapterPeople = (activeChapterObj?.people_present || [])
    .map(id => peopleMap.get(id))
    .filter(Boolean);

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2>📖 Navegador de Capítulos del Génesis (Caps. 1 - 50)</h2>
        <p>Explora cada uno de los 50 capítulos con su título, bloque narrativo, eventos bíblicos y personajes presentes.</p>
      </div>

      {/* Selector Numérico de Capítulos en Grilla */}
      <div className="chapters-grid-selector">
        {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            className={`chapter-num-btn ${Number(selectedChapterNum) === num ? 'active' : ''}`}
            onClick={() => setSelectedChapterNum(num)}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Detalle del Capítulo Seleccionado */}
      {activeChapterObj ? (
        <div className="chapter-detail-card">
          <div className="chapter-card-header">
            <span className="chap-badge-big">Génesis Capítulo {activeChapterObj.chapter}</span>
            <h3>{activeChapterObj.title}</h3>
            {activeChapterObj.block_name && (
              <span className="chap-block-tag">📍 {activeChapterObj.block_name}</span>
            )}
          </div>

          <div className="chapter-body">
            <div className="chap-section">
              <h4>📜 Resumen del Capítulo</h4>
              <p className="chap-summary-text">{activeChapterObj.summary}</p>
            </div>

            {/* Eventos Bíblicos en este capítulo */}
            {chapterEvents.length > 0 && (
              <div className="chap-section">
                <h4>⚡ Eventos Bíblicos en el Capítulo {activeChapterObj.chapter} ({chapterEvents.length})</h4>
                <div className="chap-events-list">
                  {chapterEvents.map(evt => (
                    <div
                      key={evt.id}
                      className="chap-event-item"
                      onClick={() => { if (onSelectEvent) onSelectEvent(evt.id); }}
                    >
                      <span className="pe-am">AM {evt.year_am ?? 'N/A'}</span>
                      <strong>{evt.name}</strong>
                      <p>{evt.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personajes Presentes */}
            {chapterPeople.length > 0 && (
              <div className="chap-section">
                <h4>👥 Personajes Presentes en este Capítulo ({chapterPeople.length})</h4>
                <div className="chap-people-chips">
                  {chapterPeople.map(p => (
                    <span key={p.id} className="chap-person-chip">
                      👤 {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="chapter-detail-card">
          <h3>Génesis Capítulo {selectedChapterNum}</h3>
          <p>Selecciona un capítulo de la grilla superior para explorar sus detalles.</p>
        </div>
      )}
    </div>
  );
}
