import React, { useState, useMemo, useEffect } from 'react';
import { getVerseTextRVR1960 } from '../../data/bible/bibleReader';
import { getChapterExegesisData } from '../../data/bible/chapterExegesis';
import { BibleRefLink } from '../common/BibleRefLink';
import { PersonDetailModal } from './PersonDetailModal';
import './Panels.css';
import './ChapterMapPanel.css';

/**
 * Componente profesional para la Sala de Estudio Exegético por Capítulo (Génesis 1 a 50).
 * Incluye barra de lectura pegajosa (Sticky Header), control dinámico de fuente (A-/A+),
 * Menú Flotante de Acciones para Versículos Seleccionados, Botones Flotantes Laterales de Capítulos y Volver Arriba.
 */
export function ChapterMapPanel({ chapters = [], eventsMap = new Map(), peopleMap = new Map(), onSelectEvent, onSelectPerson }) {
  const [selectedChapNum, setSelectedChapNum] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [modalPerson, setModalPerson] = useState(null);

  // Estados de Control de Lectura Bíblica
  const [fontSize, setFontSize] = useState(16); // 13px - 26px
  const [verseSearchText, setVerseSearchText] = useState('');
  const [highlightedVerses, setHighlightedVerses] = useState({}); // { [verseNum]: colorString | true }
  const [selectedColor, setSelectedColor] = useState('gold'); // 'gold' | 'blue' | 'green' | 'red'
  const [isFullscreenReader, setIsFullscreenReader] = useState(false);
  const [selectionNotice, setSelectionNotice] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  // Estados de Audio TTS, Léxico Hebreo y Notas Personales
  const [isHebrewLexiconActive, setIsHebrewLexiconActive] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioVerseNum, setCurrentAudioVerseNum] = useState(null);
  const [userNotes, setUserNotes] = useState({}); // { [verseNum]: noteString }
  const [editingNoteVerseNum, setEditingNoteVerseNum] = useState(null);
  const [noteInputText, setNoteInputText] = useState('');

  // Cargar notas personales de localStorage cuando cambia el capítulo
  useEffect(() => {
    if (!selectedChapNum) return;
    try {
      const saved = localStorage.getItem(`genesis_notes_ch_${selectedChapNum}`);
      if (saved) {
        setUserNotes(JSON.parse(saved));
      } else {
        setUserNotes({});
      }
    } catch (err) {
      console.warn("Error leyendo notas personales:", err);
    }
  }, [selectedChapNum]);

  // Cancelar reproducción de voz sintética si se sale o cambia de capítulo
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedChapNum]);

  // Guardar nota personal en localStorage
  const handleSaveUserNote = (verseNum, text) => {
    const updated = { ...userNotes, [verseNum]: text };
    if (!text.trim()) delete updated[verseNum];
    setUserNotes(updated);
    try {
      localStorage.setItem(`genesis_notes_ch_${selectedChapNum}`, JSON.stringify(updated));
    } catch (err) {
      console.warn("Error guardando nota personal:", err);
    }
    setEditingNoteVerseNum(null);
    setNoteInputText('');
  };

  // Lector de Audio TTS asistido en voz alta
  const handleToggleAudioTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert("Tu navegador no soporta voz sintética (TTS).");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentAudioVerseNum(null);
      return;
    }

    if (chapterVersesList.length === 0) return;

    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);

    let idx = 0;
    const speakNext = () => {
      if (idx >= chapterVersesList.length) {
        setIsPlayingAudio(false);
        setCurrentAudioVerseNum(null);
        return;
      }
      const v = chapterVersesList[idx];
      setCurrentAudioVerseNum(v.number);

      const utterance = new SpeechSynthesisUtterance(`Versículo ${v.number}. ${v.text}`);
      utterance.lang = 'es-ES';
      utterance.rate = 0.92;

      utterance.onend = () => {
        idx++;
        speakNext();
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setCurrentAudioVerseNum(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  // Scroll al extremo superior al cambiar de capítulo
  useEffect(() => {
    if (selectedChapNum !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedChapNum]);

  // Listener para calcular la barra de progreso de lectura
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrevChapter = () => {
    if (selectedChapNum > 1) {
      setSelectedChapNum(prev => prev - 1);
      setHighlightedVerses({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextChapter = () => {
    if (selectedChapNum < 50) {
      setSelectedChapNum(prev => prev + 1);
      setHighlightedVerses({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    for (let v = 1; v <= 65; v++) {
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

  // Lista de números de versículos seleccionados
  const selectedVerseNums = useMemo(() => {
    return Object.keys(highlightedVerses)
      .map(Number)
      .filter(num => Boolean(highlightedVerses[num]))
      .sort((a, b) => a - b);
  }, [highlightedVerses]);

  // Alternar resaltado individual de versículo
  const toggleVerseHighlight = (vNum) => {
    setHighlightedVerses(prev => {
      const current = prev[vNum];
      if (current) {
        const copy = { ...prev };
        delete copy[vNum];
        return copy;
      } else {
        return { ...prev, [vNum]: selectedColor };
      }
    });
  };

  // Copiar versículos seleccionados con cita bíblica formateada
  const handleCopySelectedVerses = () => {
    if (selectedVerseNums.length === 0) return;

    const rangeStr = selectedVerseNums.length === 1
      ? `${selectedVerseNums[0]}`
      : `${selectedVerseNums[0]}-${selectedVerseNums[selectedVerseNums.length - 1]}`;

    const selectedLines = selectedVerseNums.map(num => {
      const vObj = chapterVersesList.find(v => v.number === num);
      return `${num}. ${vObj ? vObj.text : ''}`;
    });

    const formattedText = `GÉNESIS ${selectedChapNum}:${rangeStr} (RVR1960)\n` + selectedLines.join('\n');

    navigator.clipboard.writeText(formattedText);
    setSelectionNotice(`✓ ${selectedVerseNums.length} versículo(s) copiado(s) al portapapeles!`);
    setTimeout(() => setSelectionNotice(''), 3000);
  };

  // Cambiar color de resaltado de la selección activa
  const handleApplyColor = (color) => {
    setSelectedColor(color);
    if (selectedVerseNums.length > 0) {
      setHighlightedVerses(prev => {
        const next = { ...prev };
        selectedVerseNums.forEach(n => { next[n] = color; });
        return next;
      });
    }
  };

  // Limpiar selección activa
  const handleClearSelection = () => {
    setHighlightedVerses({});
    setSelectionNotice('');
  };

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
                  onClick={() => {
                    setSelectedChapNum(c.chapter);
                    setHighlightedVerses({});
                    setVerseSearchText('');
                  }}
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
        <div className={`chapter-study-room ${isFullscreenReader ? 'fullscreen-mode' : ''}`}>
          {/* Navegación y Cabecera del Capítulo */}
          <div className="study-room-topbar">
            <button className="back-grid-btn" onClick={() => setSelectedChapNum(null)}>
              ⬅️ Volver a los 50 Capítulos
            </button>

            <div className="chapter-nav-controls">
              <button
                className="nav-chap-arrow"
                disabled={selectedChapNum <= 1}
                onClick={() => {
                  setSelectedChapNum(prev => Math.max(1, prev - 1));
                  setHighlightedVerses({});
                }}
              >
                ◀ Cap. {selectedChapNum - 1}
              </button>
              <span className="current-chap-pill">GÉNESIS {selectedChapNum} DE 50</span>
              <button
                className="nav-chap-arrow"
                disabled={selectedChapNum >= 50}
                onClick={() => {
                  setSelectedChapNum(prev => Math.min(50, prev + 1));
                  setHighlightedVerses({});
                }}
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
                {copySuccess ? '✓ ¡Capítulo Copiado!' : '📋 Copiar RVR1960'}
              </button>
            </div>
          </div>

          {/* Banner de Enfoque Mesiánico de Cristología */}
          {exegesisData?.christological_theme && (
            <div className="christological-banner">
              <span className="cb-badge">✝️ Revelación Mesiánica & Cumplimiento en Cristo</span>
              <p>{exegesisData.christological_theme}</p>
            </div>
          )}

          {/* Cuerpo Principal de Estudio en 2 Columnas */}
          <div className="chapter-study-grid">
            {/* COLUMNA IZQUIERDA: Lector RVR1960 & Bosquejo Homilético */}
            <div className="chapter-left-col">
              {/* Bosquejo Homilético / Estructura del Capítulo */}
              {exegesisData?.outline && !isFullscreenReader && (
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

              {/* Lector de Texto Bíblico Completo RVR1960 con Header Pegajoso (Sticky Header) */}
              <div className="biblical-text-reader-box">
                {/* Botones Flotantes Laterales Adjuntos al Contenedor de Lectura */}
                {selectedChapNum > 1 && (
                  <button
                    className="reader-side-nav-btn prev-chap"
                    onClick={handlePrevChapter}
                    title={`Ir al Capítulo ${selectedChapNum - 1}`}
                  >
                    <span className="side-nav-arrow">◀</span>
                    <span className="side-nav-text">Cap. {selectedChapNum - 1}</span>
                  </button>
                )}

                {selectedChapNum < 50 && (
                  <button
                    className="reader-side-nav-btn next-chap"
                    onClick={handleNextChapter}
                    title={`Ir al Capítulo ${selectedChapNum + 1}`}
                  >
                    <span className="side-nav-text">Cap. {selectedChapNum + 1}</span>
                    <span className="side-nav-arrow">▶</span>
                  </button>
                )}

                {/* BARRA DE NAVEGACIÓN Y CONTROLES PEGAJOSA (STICKY HEADER) */}
                <div className="sticky-reader-toolbar">
                  <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
                  <div className="srt-left">
                    <div className="srt-chapter-navigation">
                      <button
                        className="srt-nav-btn"
                        disabled={selectedChapNum <= 1}
                        onClick={handlePrevChapter}
                        title={`Capítulo Anterior (Cap. ${selectedChapNum - 1})`}
                      >
                        ◀ Cap. {selectedChapNum - 1}
                      </button>
                      <span className="srt-title-badge">📖 GÉNESIS {selectedChapNum}</span>
                      <button
                        className="srt-nav-btn"
                        disabled={selectedChapNum >= 50}
                        onClick={handleNextChapter}
                        title={`Capítulo Siguiente (Cap. ${selectedChapNum + 1})`}
                      >
                        Cap. {selectedChapNum + 1} ▶
                      </button>
                    </div>
                  </div>

                  {/* Búsqueda dentro del Capítulo */}
                  <div className="srt-search-box">
                    <span className="srt-search-icon">🔍</span>
                    <input
                      type="text"
                      className="srt-search-input"
                      placeholder="Buscar palabra en versículos..."
                      value={verseSearchText}
                      onChange={(e) => setVerseSearchText(e.target.value)}
                    />
                    {verseSearchText && (
                      <button className="srt-clear-btn" onClick={() => setVerseSearchText('')}>✕</button>
                    )}
                  </div>

                  {/* Controles de Tamaño de Letra (A- / A+), Audio TTS, Léxico y Pantalla Completa */}
                  <div className="srt-font-controls">
                    <button
                      className={`srt-font-btn ${isPlayingAudio ? 'active' : ''}`}
                      onClick={handleToggleAudioTTS}
                      title={isPlayingAudio ? 'Pausar Audio' : 'Escuchar Capítulo en Voz Alta (Audio TTS)'}
                    >
                      {isPlayingAudio ? '⏸️ Audio' : '▶ Escuchar'}
                    </button>

                    <button
                      className={`srt-font-btn ${isHebrewLexiconActive ? 'active' : ''}`}
                      onClick={() => setIsHebrewLexiconActive(!isHebrewLexiconActive)}
                      title="Mostrar u Ocultar Glosario Hebreo Interlineal"
                    >
                      📜 Léxico
                    </button>

                    <button
                      className="srt-font-btn"
                      onClick={() => setFontSize(prev => Math.max(13, prev - 1.5))}
                      title="Disminuir tamaño de letra"
                    >
                      A-
                    </button>
                    <span className="srt-font-size-label">{fontSize}px</span>
                    <button
                      className="srt-font-btn"
                      onClick={() => setFontSize(prev => Math.min(26, prev + 1.5))}
                      title="Agrandar tamaño de letra"
                    >
                      A+
                    </button>

                    <button
                      className={`srt-fullscreen-btn ${isFullscreenReader ? 'active' : ''}`}
                      onClick={() => setIsFullscreenReader(!isFullscreenReader)}
                      title={isFullscreenReader ? 'Salir de lectura enfocada' : 'Modo Lectura Enfocada / Pantalla Completa'}
                    >
                      {isFullscreenReader ? '🗗 Restaurar' : '⛶ Lectura Limpia'}
                    </button>
                  </div>
                </div>

                {/* Flujo de Versículos con Resaltado, Audio TTS y Notas Personales */}
                <div className="verses-continuous-flow">
                  {chapterVersesList.map((v) => {
                    const highlightValue = highlightedVerses[v.number];
                    const isHighlighted = Boolean(highlightValue);
                    const colorClass = typeof highlightValue === 'string' ? `color-${highlightValue}` : 'color-gold';
                    const isAudioPlayingThis = currentAudioVerseNum === v.number;
                    const hasUserNote = Boolean(userNotes[v.number]);

                    const matchesSearch = verseSearchText.trim().length > 0 &&
                      v.text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .includes(verseSearchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

                    return (
                      <div key={v.number} className="verse-container-block">
                        <p
                          className={`verse-paragraph verse-line ${isHighlighted ? `user-highlighted ${colorClass}` : ''} ${matchesSearch ? 'search-match' : ''} ${isAudioPlayingThis ? 'verse-audio-playing' : ''}`}
                          style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.65}px` }}
                          onClick={() => toggleVerseHighlight(v.number)}
                          title="Haz clic para seleccionar o marcar este versículo"
                        >
                          <sup className="verse-num">{v.number}</sup> {v.text}
                          {hasUserNote && (
                            <span
                              className="user-note-badge"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNoteVerseNum(v.number);
                                setNoteInputText(userNotes[v.number] || '');
                              }}
                              title="Ver / Editar Nota Personal"
                            >
                              ✏️ Nota
                            </span>
                          )}
                        </p>

                        {/* Muestra de Nota Personal Existente */}
                        {hasUserNote && editingNoteVerseNum !== v.number && (
                          <div className="existing-note-pill" onClick={() => { setEditingNoteVerseNum(v.number); setNoteInputText(userNotes[v.number]); }}>
                            💬 <strong>Mi Nota (v.{v.number}):</strong> {userNotes[v.number]}
                          </div>
                        )}

                        {/* Editor Inline de Nota Personal */}
                        {editingNoteVerseNum === v.number && (
                          <div className="inline-note-editor" onClick={(e) => e.stopPropagation()}>
                            <strong>📝 Nota Personal en Génesis {selectedChapNum}:{v.number}</strong>
                            <textarea
                              className="inline-note-textarea"
                              placeholder="Escribe tu reflexión devocional, comentario o idea de estudio..."
                              value={noteInputText}
                              onChange={(e) => setNoteInputText(e.target.value)}
                            />
                            <div className="inline-note-actions">
                              <button className="save-note-btn" onClick={() => handleSaveUserNote(v.number, noteInputText)}>
                                💾 Guardar Nota
                              </button>
                              <button className="cancel-note-btn" onClick={() => setEditingNoteVerseNum(null)}>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Ficha Exegética & Conexiones Interactivas */}
            {!isFullscreenReader && (
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
            )}
          </div>
        </div>
      )}

      {/* MENÚ FLOTANTE CONTEXTUAL PARA VERSÍCULOS SELECCIONADOS */}
      {selectedVerseNums.length > 0 && (
        <div className="floating-verse-action-bar">
          <div className="fva-info">
            <span className="fva-count-badge">📖 {selectedVerseNums.length} Versículo{selectedVerseNums.length > 1 ? 's' : ''} Seleccionado{selectedVerseNums.length > 1 ? 's' : ''}</span>
            <span className="fva-range-tag">Gén. {selectedChapNum}:{selectedVerseNums.join(', ')}</span>
          </div>

          {selectionNotice && (
            <span className="fva-notice">{selectionNotice}</span>
          )}

          <div className="fva-actions">
            {/* Paleta de Colores de Resaltado */}
            <div className="fva-color-picker" title="Elegir color de resaltador">
              <button
                className={`color-dot gold ${selectedColor === 'gold' ? 'active' : ''}`}
                onClick={() => handleApplyColor('gold')}
                title="Amarillo / Revelación Doctrina"
              />
              <button
                className={`color-dot blue ${selectedColor === 'blue' ? 'active' : ''}`}
                onClick={() => handleApplyColor('blue')}
                title="Azul / Pacto y Promesas"
              />
              <button
                className={`color-dot green ${selectedColor === 'green' ? 'active' : ''}`}
                onClick={() => handleApplyColor('green')}
                title="Verde / Gracia y Vida"
              />
              <button
                className={`color-dot red ${selectedColor === 'red' ? 'active' : ''}`}
                onClick={() => handleApplyColor('red')}
                title="Rojo / Juicio y Profecía"
              />
            </div>

            {/* Botón Escribir Nota Personal */}
            <button
              className="fva-btn fva-note-btn"
              onClick={() => {
                const targetV = selectedVerseNums[0];
                if (targetV) {
                  setEditingNoteVerseNum(targetV);
                  setNoteInputText(userNotes[targetV] || '');
                }
              }}
            >
              📝 Nota Personal
            </button>

            {/* Botón Copiar Selección */}
            <button className="fva-btn fva-copy-btn" onClick={handleCopySelectedVerses}>
              📋 Copiar Selección Formateada
            </button>

            {/* Botón Limpiar Selección */}
            <button className="fva-btn fva-clear-btn" onClick={handleClearSelection}>
              ✕ Desmarcar
            </button>
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
      {/* BOTÓN FLOTANTE VOLVER ARRIBA EN CUALQUIER PUNTO DE LA PÁGINA */}
      {selectedChapNum !== null && (
        <button
          className="floating-scroll-top-btn"
          onClick={handleScrollToTop}
          title="Volver al inicio de la página"
        >
          ⬆️ <span className="scroll-top-text">Volver al Inicio</span>
        </button>
      )}
    </div>
  );
}
