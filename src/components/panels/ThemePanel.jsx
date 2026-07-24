import React, { useState } from 'react';
import { BibleRefLink } from '../common/BibleRefLink';
import { Modal } from '../common/Modal';
import { THEOLOGICAL_STUDIES } from '../../data/theology/themeStudies';
import './Panels.css';
import './ThemePanel.css';

/**
 * Componente para el Explorador de Temas Teológicos Transversales del Génesis.
 * Permite estudiar los 8 grandes temas bíblicos con exégesis evangélica profunda,
 * tratados multi-sección, términos en hebreo bíblico, referencias al NT y notas al pie.
 */
export function ThemePanel({ themes = [], eventsMap = new Map(), peopleMap = new Map(), onSelectEvent, onSelectPerson }) {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStudyTab, setActiveStudyTab] = useState('essay'); // 'essay' | 'hebrew' | 'nt' | 'events'

  const handleOpenTheme = (theme) => {
    setSelectedTheme(theme);
    setActiveStudyTab('essay');
    setIsModalOpen(true);
  };

  const currentStudy = selectedTheme ? THEOLOGICAL_STUDIES[selectedTheme.id] : null;

  return (
    <div className="panel-container">
      {/* Cabecera del Panel de Temas Teológicos */}
      <div className="panel-header">
        <div>
          <h2>🕊️ Temas Teológicos Transversales ({themes.length})</h2>
          <p>
            Tratados de exégesis sistemática e investigación profunda sobre los grandes hilos doctrinales del Génesis y su cumplimiento en Jesucristo.
          </p>
        </div>
      </div>

      {/* Grilla de Tarjetas de Temas Teológicos */}
      <div className="themes-grid">
        {themes.map((theme) => {
          const studyData = THEOLOGICAL_STUDIES[theme.id];
          return (
            <div key={theme.id} className="theme-card" onClick={() => handleOpenTheme(theme)}>
              <div className="theme-card-header">
                <span className="theme-icon">{theme.icon}</span>
                <div>
                  <h3 className="theme-title">{theme.title}</h3>
                  {studyData && <span className="theme-reading-badge">⏱️ {studyData.reading_time}</span>}
                </div>
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
                  📖 Abrir Tratado Completo ➔
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Lectura Exegética Académica del Tema Seleccionado */}
      {isModalOpen && selectedTheme && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="960px">
          <div className="theme-detail-modal">
            {/* Cabecera del Tratado */}
            <div className="theme-modal-header">
              <div className="theme-header-tags">
                <span className="theme-modal-badge">{selectedTheme.icon} Tema Teológico</span>
                {currentStudy && <span className="theme-framework-badge">📜 {currentStudy.author_framework}</span>}
              </div>
              <h2 className="theme-modal-title">{selectedTheme.title}</h2>
              <p className="theme-modal-subtitle">{selectedTheme.subtitle}</p>
            </div>

            {/* Navegación por Pestañas del Tratado */}
            <div className="study-modal-tabs">
              <button
                className={`study-tab-btn ${activeStudyTab === 'essay' ? 'active' : ''}`}
                onClick={() => setActiveStudyTab('essay')}
              >
                📚 Tratado Exegético
              </button>
              <button
                className={`study-tab-btn ${activeStudyTab === 'hebrew' ? 'active' : ''}`}
                onClick={() => setActiveStudyTab('hebrew')}
              >
                🔤 Léxico Hebreo ({selectedTheme.hebrew_terms?.length || 0})
              </button>
              <button
                className={`study-tab-btn ${activeStudyTab === 'nt' ? 'active' : ''}`}
                onClick={() => setActiveStudyTab('nt')}
              >
                ✝️ Cumplimiento NT ({selectedTheme.cross_references_nt?.length || 0})
              </button>
              <button
                className={`study-tab-btn ${activeStudyTab === 'events' ? 'active' : ''}`}
                onClick={() => setActiveStudyTab('events')}
              >
                ⚡ Eventos ({selectedTheme.key_event_ids?.length || 0})
              </button>
            </div>

            {/* TAB 1: Tratado Exegético Completo por Secciones */}
            {activeStudyTab === 'essay' && (
              <div className="study-tab-content">
                {currentStudy && currentStudy.sections ? (
                  <div className="essay-sections-container">
                    {currentStudy.sections.map((sec) => (
                      <div key={sec.id} className="essay-section-card">
                        <h3 className="essay-section-title">{sec.title}</h3>
                        <div className="essay-section-body">
                          {sec.content.split('\n\n').map((paragraph, pIdx) => (
                            <p key={pIdx}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="theme-section theology-card">
                    <h3 className="theme-section-subtitle">🏛️ Fundamento Doctrinal Evangélico</h3>
                    <p className="theme-doctrine-text">{selectedTheme.theological_doctrine}</p>
                    <p className="theme-description-full">{selectedTheme.description}</p>
                  </div>
                )}

                {/* Pasajes Fundamentales al pie del Tratado */}
                {selectedTheme.genesis_passages && selectedTheme.genesis_passages.length > 0 && (
                  <div className="theme-section essay-passages-box">
                    <h3 className="theme-section-subtitle">📖 Pasajes Clave del Génesis</h3>
                    <div className="theme-refs-flex">
                      {selectedTheme.genesis_passages.map((refStr, idx) => (
                        <BibleRefLink key={idx} reference={refStr} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Glosario de Términos en Hebreo Bíblico */}
            {activeStudyTab === 'hebrew' && (
              <div className="study-tab-content">
                {selectedTheme.hebrew_terms && selectedTheme.hebrew_terms.length > 0 ? (
                  <div className="hebrew-terms-grid">
                    {selectedTheme.hebrew_terms.map((term, idx) => (
                      <div key={idx} className="hebrew-term-card">
                        <div className="hebrew-original">{term.hebrew}</div>
                        <div className="hebrew-transliteration"><em>{term.transliteration}</em></div>
                        <p className="hebrew-meaning">{term.meaning}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data-msg">No hay términos en hebreo registrados para este tema.</p>
                )}

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
              </div>
            )}

            {/* TAB 3: Cumplimiento en el Nuevo Testamento */}
            {activeStudyTab === 'nt' && (
              <div className="study-tab-content">
                {selectedTheme.cross_references_nt && selectedTheme.cross_references_nt.length > 0 ? (
                  <div className="theme-section messianic-box">
                    <h3 className="theme-section-subtitle">✝️ Cumplimiento y Conexión en el Nuevo Testamento</h3>
                    <p className="nt-intro-note">
                      Haz clic en cualquier versículo para abrir el texto completo en Reina-Valera 1960:
                    </p>
                    <div className="theme-refs-flex">
                      {selectedTheme.cross_references_nt.map((refStr, idx) => (
                        <BibleRefLink key={idx} reference={refStr} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="no-data-msg">No hay referencias registradas.</p>
                )}
              </div>
            )}

            {/* TAB 4: Eventos Bíblicos Vinculados */}
            {activeStudyTab === 'events' && (
              <div className="study-tab-content">
                {selectedTheme.key_event_ids && selectedTheme.key_event_ids.length > 0 ? (
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
                ) : (
                  <p className="no-data-msg">No hay eventos asociados.</p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
