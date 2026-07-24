import React, { useState, useMemo } from 'react';
import { getVerseTextRVR1960 } from '../../data/bible/bibleReader';
import { getChapterExegesisData } from '../../data/bible/chapterExegesis';
import { BibleRefLink } from '../common/BibleRefLink';
import { PersonDetailModal } from './PersonDetailModal';
import './Panels.css';
import './ChapterMapPanel.css';

/**
 * Componente profesional para la Sala de Estudio Exegético por Capítulo (Génesis 1 a 50).
 * Integra lectura continua en Reina-Valera 1960, bosquejo homilético, lección doctrinal,
 * términos en hebreo bíblico, referencias al NT y modal directo de biografías de personajes.
 */
export function ChapterMapPanel({ chapters = [], eventsMap = new Map(), peopleMap = new Map(), onSelectEvent, onSelectPerson }) {
  const [selectedChapNum, setSelectedChapNum] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [modalPerson, setModalPerson] = useState(null);

  // Ordenar lista de 50 capítulos
  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) => a.chapter - b.chapter);
  }, [chapters]);

  // Filtrar capítulos en la vista de cuadrícula
  const filteredChapters = useMemo(() => {
    if (!filterQuery) return sortedChapters;
    const q = filterQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return sortedChapters.filter(c => {
      const title = (c.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const summary = (c.summary || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return title.includes(q) || summary.includes(q) || String(c.chapter) === q;
    });
  }, [sortedChapters, filterQuery]);

  // Objeto del capítulo activo seleccionado
  const selectedChapterObj = useMemo(() => {
    if (!selectedChapNum) return null;
    return sortedChapters.find(c => c.chapter === selectedChapNum) || null;
  }, [sortedChapters, selectedChapNum]);

  // Datos exegéticos del capítulo activo
  const exegesisData = useMemo(() => {
    if (!selectedChapNum) return null;
    return getChapterExegesisData(selectedChapNum, selectedChapterObj);
  }, [selectedChapNum, selectedChapterObj]);

  // Texto bíblico completo RVR1960 del capítulo seleccionado (línea por línea)
  const chapterVersesList = useMemo(() => {
    if (!selectedChapNum) return [];
    const verses = [];
    for (let v = 1; v <= 60; v++) {
      const vText = getVerseTextRVR1960('Génesis', selectedChapNum, v);
      if (vText && !vText.includes('Santa Biblia Reina-Valera') && vText.startsWith(`${v}.`)) {
        verses.push({
          number: v,
          text: vText.replace(`${v}. `, '')
        });
      }
    }
    return verses;
  }, [selectedChapNum]);

  // Copiar capítulo completo al portapapeles
  const handleCopyChapter = () => {
    if (!selectedChapterObj) return;
    const fullText = `GÉNESIS CAPÍTULO ${selectedChapNum} (RVR1960)\n` +
      `${selectedChapterObj.title}\n\n` +
      chapterVersesList.map(v => `${v.number}. ${v.text}`).join('\n');

    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Abrir modal de biografía y relaciones familiares del personaje
  const handleOpenPersonModal = (personId) => {
    const p = peopleMap.get(personId);
    if (p) {
      setModalPerson(p);
    }
  };

  return (
    <div className="panel-container">
      {/* VISTA 1: Rejilla de los 50 Capítulos si no hay capítulo abierto */}
      {!selectedChapterObj ? (
        <>
          <div className="panel-header">
            <div>
              <h2>📖 Centro de Estudio por Capítulos (1 al 50)</h2>
              <p>
                Selecciona cualquier capítulo del Génesis para ingresar a su <strong>Sala de Estudio Exegético</strong> con lectura RVR1960, bosquejo homilético, hebreo bíblico y eventos AM.
              </p>
            </div>

            {/* Buscador de Capítulos */}
            <div className="chapter-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="chapter-search-input"
                placeholder="Filtrar por n° o tema (ej. 12, Abram, Diluvio)..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
              {filterQuery && (
                <button className="clear-filter-btn" onClick={() => setFilterQuery('')}>✕</button>
              )}
            </div>
          </div>

          <div className="chapters-grid">
            {filteredChapters.map((c) => {
              const eventCount = (c.key_events || []).length;
              const peopleCount = (c.key_people || []).length;

              return (
                <div
                  key={c.chapter}
                  className="chapter-card"
                  onClick={() => setSelectedChapNum(c.chapter)}
                >
                  <div className="chapter-card-header">
                    <span className="chapter-num-badge">Cap. {c.chapter}</span>
                    <span className="chapter-block-tag">{c.block_id ? c.block_id.replace('nb_', '').toUpperCase() : 'GÉNESIS'}</span>
                  </div>
                  <h3 className="chapter-card-title">{c.title}</h3>
                  <p className="chapter-card-summary">{c.summary}</p>
                  <div className="chapter-card-footer">
                    <span className="cc-stat">⚡ {eventCount} Evento{eventCount !== 1 ? 's' : ''}</span>
                    <span className="cc-stat">👥 {peopleCount} Personaje{peopleCount !== 1 ? 's' : ''}</span>
                    <button className="chapter-study-btn">📖 Estudiar ➔</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* VISTA 2: Sala de Estudio Exegético de Capítulo (Pantalla Dividida) */
        <div className="chapter-study-room">
          {/* Navegación y Cabecera del Capítulo */}
          <div className="study-room-topbar">
            <button className="back-grid-btn" onClick={() => setSelectedChapNum(null)}>
              ⬅️ Volver a la Rejilla de 50 Capítulos
            </button>

            <div className="chapter-nav-controls">
              <button
                className="nav-chap-arrow"
                disabled={selectedChapNum <= 1}
                onClick={() => setSelectedChapNum(prev => Math.max(1, prev - 1))}
              >
                ◀ Cap. {selectedChapNum - 1}
              </button>
              <span className="current-chap-pill">GÉNESIS {selectedChapNum} DE 50</span>
              <button
                className="nav-chap-arrow"
                disabled={selectedChapNum >= 50}
                onClick={() => setSelectedChapNum(prev => Math.min(50, prev + 1))}
              >
                Cap. {selectedChapNum + 1} ▶
              </button>
            </div>
          </div>

          <div className="chapter-study-header">
            <div className="csh-titles">
              <span className="csh-badge">📖 Sala de Estudio Teológico</span>
              <h2>Génesis Capítulo {selectedChapNum}: {selectedChapterObj.title}</h2>
              <p className="csh-summary">{selectedChapterObj.summary}</p>
            </div>
            <div className="csh-actions">
              <button className="copy-chapter-btn" onClick={handleCopyChapter}>
                {copySuccess ? '✓ ¡Capítulo Copiado!' : '📋 Copiar Capítulo RVR1960'}
              </button>
            </div>
          </div>

          {/* Cuerpo Principal de Estudio en 2 Columnas */}
          <div className="chapter-study-grid">
            {/* COLUMNA IZQUIERDA: Lector RVR1960 & Bosquejo Homilético */}
            <div className="chapter-left-col">
              {/* Bosquejo Homilético / Estructura del Capítulo */}
              {exegesisData?.outline && (
                <div className="exegesis-box outline-box">
                  <h3>📑 Bosquejo Homilético y Estructura Literaria</h3>
                  <div className="outline-list">
                    {exegesisData.outline.map((item, idx) => (
                      <div key={idx} className="outline-item">
                        <span className="outline-verses">{item.verses}</span>
                        <span className="outline-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lector de Texto Bíblico Completo RVR1960 */}
              <div className="biblical-text-reader-box">
                <div className="btr-header">
                  <h3>📜 Texto Sagrado Reina-Valera 1960 ({chapterVersesList.length} Versículos)</h3>
                  <span className="btr-tag">RVR1960</span>
                </div>

                <div className="verses-continuous-flow">
                  {chapterVersesList.map((v) => (
                    <p key={v.number} className="verse-paragraph">
                      <sup className="verse-num" title="Número de Versículo">{v.number}</sup> {v.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Ficha Exegética & Conexiones Interactivas */}
            <div className="chapter-right-col">
              {/* Lección Doctrinal Principal */}
              {exegesisData?.theological_teaching && (
                <div className="exegesis-box doctrine-box">
                  <h3>🏛️ Lección Doctrinal Principal</h3>
                  <p>{exegesisData.theological_teaching}</p>
                </div>
              )}

              {/* Eventos Bíblicos en este Capítulo (Con lazo a la Línea de Tiempo) */}
              {selectedChapterObj.key_events && selectedChapterObj.key_events.length > 0 && (
                <div className="exegesis-box events-box">
                  <h3>⚡ Eventos Bíblicos en este Capítulo ({selectedChapterObj.key_events.length})</h3>
                  <p className="box-note-sm">Haz clic en un evento para ir a la Línea de Tiempo y enfocar su ítem:</p>
                  <div className="chapter-events-list">
                    {selectedChapterObj.key_events.map(eventId => {
                      const evt = eventsMap.get(eventId);
                      if (!evt) return null;
                      return (
                        <div
                          key={eventId}
                          className="chapter-event-chip"
                          onClick={() => {
                            if (onSelectEvent) onSelectEvent(eventId);
                          }}
                        >
                          <span className="cec-am" title={`Año del Mundo ${evt.year_am ?? 'N/A'}`}>
                            AM {evt.year_am ?? 'N/A'}
                          </span>
                          <span className="cec-name">{evt.name}</span>
                          <span className="cec-arrow">➔</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Personajes Participantes (Abre modal directo sin salir del capítulo) */}
              {selectedChapterObj.key_people && selectedChapterObj.key_people.length > 0 && (
                <div className="exegesis-box people-box">
                  <h3>👥 Personajes en este Capítulo ({selectedChapterObj.key_people.length})</h3>
                  <p className="box-note-sm">Haz clic en un personaje para abrir su perfil completo y relaciones familiares:</p>
                  <div className="chapter-people-list">
                    {selectedChapterObj.key_people.map(personId => {
                      const p = peopleMap.get(personId);
                      if (!p) return null;
                      return (
                        <div
                          key={personId}
                          className="chapter-person-chip"
                          onClick={() => handleOpenPersonModal(personId)}
                        >
                          👤 <strong>{p.name}</strong> <em>({p.name_meaning || 'Patriarca'})</em>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Glosario de Hebreo Bíblico del Capítulo */}
              {exegesisData?.hebrew_terms && exegesisData.hebrew_terms.length > 0 && (
                <div className="exegesis-box hebrew-box">
                  <h3>🔤 Glosario de Términos en Hebreo</h3>
                  <div className="chapter-hebrew-list">
                    {exegesisData.hebrew_terms.map((term, idx) => (
                      <div key={idx} className="chap-hebrew-item">
                        <span className="ch-heb">{term.hebrew}</span>
                        <span className="ch-trans"><em>{term.transliteration}</em></span>
                        <span className="ch-mean">{term.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cumplimiento Mesiánico & Nuevo Testamento */}
              {exegesisData?.nt_cross_references && exegesisData.nt_cross_references.length > 0 && (
                <div className="exegesis-box nt-box">
                  <h3>✝️ Citas y Cumplimiento en el NT</h3>
                  <div className="chap-nt-refs">
                    {exegesisData.nt_cross_references.map((refStr, idx) => (
                      <BibleRefLink key={idx} reference={refStr} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Biografía y Relaciones Familiares */}
      {modalPerson && (
        <PersonDetailModal
          person={modalPerson}
          isOpen={Boolean(modalPerson)}
          onClose={() => setModalPerson(null)}
          peopleMap={peopleMap}
          eventsMap={eventsMap}
          onSelectEvent={onSelectEvent}
          onSelectPerson={(nextPersonId) => {
            const nextP = peopleMap.get(nextPersonId);
            if (nextP) setModalPerson(nextP);
          }}
        />
      )}
    </div>
  );
}
