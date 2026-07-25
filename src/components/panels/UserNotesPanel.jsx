import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllUserNotes,
  deleteNoteForVerse,
  getAllSermons,
  saveSermon,
  deleteSermon,
  exportUserDataToJson,
  importUserDataFromJson
} from '../../data/notesStorage';
import { getVerseTextRVR1960 } from '../../data/bible/bibleReader';
import SermonEditor from './SermonEditor';
import SermonPulpitView from './SermonPulpitView';
import { exportSermonToPDF } from '../../utils/pdfExporter';
import './UserNotesPanel.css';

export default function UserNotesPanel({ onNavigateToChapter, fullBibleData }) {
  // Pestañas Principales: 'notes' | 'sermons'
  const [activeTab, setActiveTab] = useState('notes');

  // Estado de Notas
  const [notesList, setNotesList] = useState([]);
  const [notesQuery, setNotesQuery] = useState('');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');

  // Estado de Sermones
  const [sermonsList, setSermonsList] = useState([]);
  const [activeSermon, setActiveSermon] = useState(null); // null = lista, object = editando
  const [pulpitSermon, setPulpitSermon] = useState(null); // null = inactivo, object = modo púlpito

  // Estado de Respaldo JSON (Import/Export)
  const [backupNotice, setBackupNotice] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    reloadAllData();
  }, []);

  const reloadAllData = () => {
    const loadedNotes = getAllUserNotes('genesis');
    const loadedSermons = getAllSermons('genesis');
    setNotesList(loadedNotes);
    setSermonsList(loadedSermons);
  };

  // ----------------------------------------------------------------------
  // FILTRADO Y MÉTROLOGÍA DE NOTAS
  // ----------------------------------------------------------------------

  // Lista de todas las etiquetas únicas (#Tag) encontradas en las notas
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set();
    notesList.forEach(n => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [notesList]);

  // Filtrado dinámico de notas
  const filteredNotes = useMemo(() => {
    return notesList.filter(n => {
      // Filtro por capítulo
      if (selectedChapterFilter !== 'all' && Number(n.chapter) !== Number(selectedChapterFilter)) {
        return false;
      }
      // Filtro por color
      if (selectedColorFilter !== 'all' && n.color !== selectedColorFilter) {
        return false;
      }
      // Filtro por etiqueta (#Tag)
      if (selectedTagFilter !== 'all' && (!n.tags || !n.tags.includes(selectedTagFilter))) {
        return false;
      }
      // Búsqueda por texto libre
      if (notesQuery.trim()) {
        const q = notesQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const contentNorm = (n.content || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const verseText = getVerseTextRVR1960('genesis', n.chapter, n.verse, fullBibleData).toLowerCase();
        return contentNorm.includes(q) || verseText.includes(q);
      }

      return true;
    });
  }, [notesList, selectedChapterFilter, selectedColorFilter, selectedTagFilter, notesQuery, fullBibleData]);

  // Eliminación de nota
  const handleDeleteNote = (chap, verse) => {
    if (window.confirm(`¿Seguro que deseas eliminar la nota del versículo Génesis ${chap}:${verse}?`)) {
      deleteNoteForVerse(chap, verse, 'genesis');
      reloadAllData();
    }
  };

  // ----------------------------------------------------------------------
  // NAVEGACIÓN Y ACCIONES DE SERMONES
  // ----------------------------------------------------------------------

  const handleCreateNewSermon = () => {
    const newSermonObj = {
      id: `sermon_${Date.now()}`,
      title: 'Nuevo Bosquejo Homilético',
      passage: 'Génesis 1:1',
      proposition: '',
      contentHtml: '',
      tags: ['#Predicación']
    };
    setActiveSermon(newSermonObj);
  };

  const handleSaveSermon = (savedSermon) => {
    saveSermon(savedSermon, 'genesis');
    reloadAllData();
    setActiveSermon(null);
  };

  const handleDeleteSermon = (sermonId) => {
    if (window.confirm('¿Seguro que deseas eliminar este bosquejo de prédica?')) {
      deleteSermon(sermonId, 'genesis');
      reloadAllData();
    }
  };

  // ----------------------------------------------------------------------
  // COPIAS DE SEGURIDAD (EXPORT / IMPORT JSON)
  // ----------------------------------------------------------------------

  const handleExportData = () => {
    const jsonStr = exportUserDataToJson('genesis');
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo_genesis_notes_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupNotice('✅ Respaldo JSON descargado con éxito.');
    setTimeout(() => setBackupNotice(''), 4000);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importUserDataFromJson(event.target.result, 'genesis');
      if (res.success) {
        reloadAllData();
        setBackupNotice(`✅ Importación exitosa: ${res.notesCount} notas y ${res.sermonsCount} sermones restaurados.`);
      } else {
        setBackupNotice(`❌ Error en la importación: ${res.error}`);
      }
      setTimeout(() => setBackupNotice(''), 5000);
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------------------------
  // RENDERIZADO DE MODOS SECUNDARIOS (EDITOR O PÚLPITO)
  // ----------------------------------------------------------------------

  if (pulpitSermon) {
    return (
      <SermonPulpitView
        sermon={pulpitSermon}
        onClose={() => setPulpitSermon(null)}
      />
    );
  }

  if (activeSermon) {
    return (
      <SermonEditor
        sermon={activeSermon}
        onSave={handleSaveSermon}
        onCancel={() => setActiveSermon(null)}
        userNotes={notesList}
        fullBibleData={fullBibleData}
      />
    );
  }

  return (
    <div className="user-notes-panel-container">
      {/* CABECERA PRINCIPAL DEL PANEL */}
      <div className="unp-header">
        <div className="unp-title-group">
          <h2>📝 Mi Cuaderno de Estudio y Prédicas</h2>
          <p className="unp-subtitle">
            Administra tus apuntes personales, resalta verdades doctrinales y estructura tus bosquejos homiléticos para el púlpito.
          </p>
        </div>

        {/* ACCIONES DE RESPALDO (EXPORT / IMPORT) */}
        <div className="unp-backup-actions">
          <button className="unp-btn unp-export-btn" onClick={handleExportData} title="Descargar copia de seguridad en JSON">
            💾 Exportar Respaldo JSON
          </button>
          <label className="unp-btn unp-import-btn" title="Restaurar notas desde un archivo JSON">
            📂 Importar Respaldo
            <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {backupNotice && <div className="unp-notice-banner">{backupNotice}</div>}

      {/* PESTAÑAS NAVEGADORAS */}
      <div className="unp-tabs-bar">
        <button
          className={`unp-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📖 Mis Notas y Apuntes ({notesList.length})
        </button>
        <button
          className={`unp-tab-btn ${activeTab === 'sermons' ? 'active' : ''}`}
          onClick={() => setActiveTab('sermons')}
        >
          🎤 Mi Cuaderno de Prédicas ({sermonsList.length})
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PESTAÑA 1: MIS NOTAS Y APUNTES BÍBLICOS                           */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'notes' && (
        <div className="unp-tab-content">
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="unp-filters-bar">
            {/* Buscador de Texto Libre */}
            <div className="unp-search-box">
              <span className="unp-search-icon">🔍</span>
              <input
                type="text"
                className="unp-search-input"
                placeholder="Buscar en tus notas o pasajes..."
                value={notesQuery}
                onChange={(e) => setNotesQuery(e.target.value)}
              />
              {notesQuery && (
                <button className="unp-clear-search" onClick={() => setNotesQuery('')}>✕</button>
              )}
            </div>

            {/* Filtro por Capítulo */}
            <select
              className="unp-select-filter"
              value={selectedChapterFilter}
              onChange={(e) => setSelectedChapterFilter(e.target.value)}
            >
              <option value="all">📖 Todos los Capítulos</option>
              {Array.from({ length: 50 }, (_, i) => i + 1).map(c => (
                <option key={c} value={c}>Capítulo {c}</option>
              ))}
            </select>

            {/* Filtro por Color */}
            <select
              className="unp-select-filter"
              value={selectedColorFilter}
              onChange={(e) => setSelectedColorFilter(e.target.value)}
            >
              <option value="all">🎨 Todos los Colores</option>
              <option value="gold">🟡 Dorado / Doctrina</option>
              <option value="blue">🔵 Azul / Promesa</option>
              <option value="green">🟢 Verde / Gracia</option>
              <option value="red">🔴 Rojo / Profecía</option>
            </select>

            {/* Filtro por Hashtag (#Tag) */}
            {allUniqueTags.length > 0 && (
              <select
                className="unp-select-filter"
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
              >
                <option value="all">🏷️ Todas las Etiquetas</option>
                {allUniqueTags.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          {/* LISTA DE TARJETAS DE NOTAS */}
          {filteredNotes.length === 0 ? (
            <div className="unp-empty-state">
              <span className="empty-icon">📝</span>
              <h3>No se encontraron notas</h3>
              <p>
                {notesList.length === 0
                  ? 'Aún no has escrito notas en el texto bíblico. Abre cualquier capítulo y haz clic en "📝 Nota Personal" en los versículos para añadir tus meditaciones.'
                  : 'No hay notas que coincidan con los filtros seleccionados.'}
              </p>
            </div>
          ) : (
            <div className="unp-notes-grid">
              {filteredNotes.map(n => {
                const bookTitle = n.book ? (n.book.charAt(0).toUpperCase() + n.book.slice(1)) : 'Génesis';
                const verseText = getVerseTextRVR1960(n.book || 'genesis', n.chapter, n.verse, fullBibleData);
                return (
                  <div key={n.id} className={`unp-note-card color-border-${n.color}`}>
                    <div className="unc-header">
                      <div className="unc-verse-tag">
                        <span className="unc-chap-badge">{bookTitle} {n.chapter}:{n.verse}</span>
                        <span className={`unc-color-dot ${n.color}`} />
                      </div>
                      <span className="unc-date">
                        {n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : ''}
                      </span>
                    </div>

                    {/* Texto del Versículo RVR1960 */}
                    <div className="unc-bible-passage">
                      <span className="v-num">{n.verse}.</span> {verseText}
                    </div>

                    {/* Contenido de la Nota Personal del Usuario */}
                    <div className="unc-user-content">
                      <p>{n.content}</p>
                    </div>

                    {/* Etiquetas (#Tags) */}
                    {n.tags && n.tags.length > 0 && (
                      <div className="unc-tags-list">
                        {n.tags.map((t, i) => (
                          <span key={i} className="unc-tag-chip">{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Acciones de la Tarjeta */}
                    <div className="unc-actions">
                      <button
                        className="unc-btn unc-go-btn"
                        onClick={() => onNavigateToChapter(n.chapter, n.verse)}
                      >
                        🎯 Ir al Versículo en el Lector
                      </button>
                      <button
                        className="unc-btn unc-del-btn"
                        onClick={() => handleDeleteNote(n.chapter, n.verse)}
                        title="Eliminar esta nota"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PESTAÑA 2: MI CUADERNO DE BOSQUEJOS Y SERMONES                    */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'sermons' && (
        <div className="unp-tab-content">
          <div className="unp-sermons-top-bar">
            <button className="unp-btn unp-create-sermon-btn" onClick={handleCreateNewSermon}>
              ➕ Crear Nuevo Bosquejo de Prédica
            </button>
          </div>

          {sermonsList.length === 0 ? (
            <div className="unp-empty-state">
              <span className="empty-icon">🎤</span>
              <h3>No tienes bosquejos de prédica redactados</h3>
              <p>Haz clic en "➕ Crear Nuevo Bosquejo" para comenzar a redactar tus sermones con nuestro editor homilético estructurado.</p>
            </div>
          ) : (
            <div className="unp-sermons-grid">
              {sermonsList.map(s => (
                <div key={s.id} className="unp-sermon-card">
                  <div className="usc-header">
                    <span className="usc-passage-badge">📖 {s.passage}</span>
                    <span className="usc-date">
                      {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : ''}
                    </span>
                  </div>

                  <h3 className="usc-title">{s.title}</h3>
                  {s.proposition && (
                    <p className="usc-proposition">
                      <strong>Idea Central:</strong> <em>"{s.proposition}"</em>
                    </p>
                  )}

                  {s.tags && s.tags.length > 0 && (
                    <div className="usc-tags">
                      {s.tags.map((t, i) => (
                        <span key={i} className="usc-tag">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="usc-actions">
                    <button
                      className="usc-btn usc-edit-btn"
                      onClick={() => setActiveSermon(s)}
                      title="Editar este bosquejo"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="usc-btn usc-pulpit-btn"
                      onClick={() => setPulpitSermon(s)}
                      title="Ver en Modo Púlpito para el Altar"
                    >
                      🎤 Púlpito
                    </button>
                    <button
                      className="usc-btn usc-print-btn"
                      onClick={() => exportSermonToPDF(s)}
                      title="Descargar archivo PDF Pastoral directamente en 1-Clic"
                    >
                      🖨️ PDF
                    </button>
                    <button
                      className="usc-btn usc-del-btn"
                      onClick={() => handleDeleteSermon(s.id)}
                      title="Eliminar este bosquejo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
