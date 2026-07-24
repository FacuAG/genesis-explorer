import React, { useState } from 'react';
import { BibleRefLink } from '../common/BibleRefLink';
import { Modal } from '../common/Modal';
import './Panels.css';
import './ThemePanel.css';

/**
 * Componente para el Explorador de Temas Teológicos Transversales del Génesis.
 * Permite estudiar los 8 grandes temas bíblicos con exégesis evangélica,
 * términos en hebreo bíblico, referencias al Nuevo Testamento y notas al pie.
 */
export function ThemePanel({ themes = [], eventsMap = new Map(), peopleMap = new Map(), onSelectEvent, onSelectPerson }) {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenTheme = (theme) => {
    setSelectedTheme(theme);
    setIsModalOpen(true);
  };

  return (
    <div className="panel-container">
      {/* Cabecera del Panel de Temas Teológicos */}
      <div className="panel-header">
        <div>
          <h2>🕊️ Temas Teológicos Transversales ({themes.length})</h2>
          <p>
            Estudio sistemático de los grandes hilos doctrinales que atraviesan la narrativa del Génesis y se cumplen en el Nuevo Testamento.
          </p>
        </div>
      </div>

      {/* Grilla de Tarjetas de Temas Teológicos */}
      <div className="themes-grid">
        {themes.map((theme) => (
          <div key={theme.id} className="theme-card" onClick={() => handleOpenTheme(theme)}>
            <div className="theme-card-header">
              <span className="theme-icon">{theme.icon}</span>
              <h3 className="theme-title">{theme.title}</h3>
            </div>
            <h4 className="theme-subtitle">{theme.subtitle}</h4>
            <p className="theme-description">{theme.description}</p>

            <div className="theme-card-footer">
              <span className="theme-passages-count">
                📖 {theme.genesis_passages?.length || 0} Pasajes Clave
              </span>
              <span className="theme-nt-count">
                ✝️ {theme.cross_references_nt?.length || 0} Citas NT
              </span>
              <button className="theme-action-btn">
                📖 Estudiar Tema ➔
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Estudio Exegético del Tema Seleccionado */}
      {isModalOpen && selectedTheme && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="900px">
          <div className="theme-detail-modal">
            <div className="theme-modal-header">
              <span className="theme-modal-badge">{selectedTheme.icon} Tema Teológico</span>
              <h2 className="theme-modal-title">{selectedTheme.title}</h2>
              <p className="theme-modal-subtitle">{selectedTheme.subtitle}</p>
            </div>

            {/* Definición Doctrinal Evangélica */}
            <div className="theme-section theology-card">
              <h3 className="theme-section-subtitle">🏛️ Fundamento Doctrinal Evangélico</h3>
              <p className="theme-doctrine-text">{selectedTheme.theological_doctrine}</p>
              <p className="theme-description-full">{selectedTheme.description}</p>
            </div>

            {/* Pasajes Clave del Génesis */}
            {selectedTheme.genesis_passages && selectedTheme.genesis_passages.length > 0 && (
              <div className="theme-section">
                <h3 className="theme-section-subtitle">📖 Pasajes Fundamentales del Génesis</h3>
                <div className="theme-refs-flex">
                  {selectedTheme.genesis_passages.map((refStr, idx) => (
                    <BibleRefLink key={idx} reference={refStr} />
                  ))}
                </div>
              </div>
            )}

            {/* Referencias Cruzadas del Nuevo Testamento */}
            {selectedTheme.cross_references_nt && selectedTheme.cross_references_nt.length > 0 && (
              <div className="theme-section messianic-box">
                <h3 className="theme-section-subtitle">✝️ Cumplimiento en el Nuevo Testamento ({selectedTheme.cross_references_nt.length})</h3>
                <div className="theme-refs-flex">
                  {selectedTheme.cross_references_nt.map((refStr, idx) => (
                    <BibleRefLink key={idx} reference={refStr} />
                  ))}
                </div>
              </div>
            )}

            {/* Glosario de Términos en Hebreo Bíblico */}
            {selectedTheme.hebrew_terms && selectedTheme.hebrew_terms.length > 0 && (
              <div className="theme-section">
                <h3 className="theme-section-subtitle">🔤 Glosario de Términos en Hebreo Bíblico</h3>
                <div className="hebrew-terms-grid">
                  {selectedTheme.hebrew_terms.map((term, idx) => (
                    <div key={idx} className="hebrew-term-card">
                      <div className="hebrew-original">{term.hebrew}</div>
                      <div className="hebrew-transliteration"><em>{term.transliteration}</em></div>
                      <p className="hebrew-meaning">{term.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notas al Pie de Página / Aclaraciones Teológicas */}
            {selectedTheme.footnotes && selectedTheme.footnotes.length > 0 && (
              <div className="theme-section footnotes-card">
                <h3 className="theme-section-subtitle">📌 Notas Exegéticas al Pie de Página</h3>
                <ul className="footnotes-list">
                  {selectedTheme.footnotes.map((note, idx) => (
                    <li key={idx}>
                      <span className="footnote-num">[{idx + 1}]</span> {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Eventos Bíblicos Vinculados */}
            {selectedTheme.key_event_ids && selectedTheme.key_event_ids.length > 0 && (
              <div className="theme-section">
                <h3 className="theme-section-subtitle">⚡ Eventos Bíblicos donde actúa este Tema</h3>
                <div className="theme-linked-events">
                  {selectedTheme.key_event_ids.map(eventId => {
                    const evt = eventsMap.get(eventId);
                    if (!evt) return null;
                    return (
                      <button
                        key={eventId}
                        className="linked-event-chip"
                        onClick={() => {
                          setIsModalOpen(false);
                          if (onSelectEvent) onSelectEvent(eventId);
                        }}
                      >
                        ⚡ {evt.name} <span className="chip-am">AM {evt.year_am ?? 'N/A'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
