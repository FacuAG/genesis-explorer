import React, { useState, useRef, useMemo } from 'react';
import { getChapterExegesisData } from '../../data/bible/chapterExegesis';
import { getVerseTextRVR1960 } from '../../data/bible/bibleReader';
import './SermonEditor.css';

export default function SermonEditor({ sermon, onSave, onCancel, userNotes = [], fullBibleData }) {
  const [title, setTitle] = useState(sermon?.title || '');
  const [passage, setPassage] = useState(sermon?.passage || 'Génesis 1:1');
  const [proposition, setProposition] = useState(sermon?.proposition || '');
  const [tagInput, setTagInput] = useState(sermon?.tags ? sermon.tags.join(' ') : '#Predicación');

  // Referencia al div editable (contentEditable) para Rich Text
  const editorRef = useRef(null);

  // Deducir dinámicamente el libro y número de capítulo del pasaje introducido (ej. "Génesis 22:1-19", "Éxodo 3:14", "Mateo 5")
  const { detectedBookName, detectedChapNum } = useMemo(() => {
    if (!passage) return { detectedBookName: 'Génesis', detectedChapNum: 1 };
    
    const match = passage.match(/^([a-záéíóúñ\s]+)\s+(\d+)/i);
    if (match) {
      return {
        detectedBookName: match[1].trim(),
        detectedChapNum: Number(match[2])
      };
    }
    const numOnly = passage.match(/\d+/);
    return {
      detectedBookName: 'Génesis',
      detectedChapNum: numOnly ? Number(numOnly[0]) : 1
    };
  }, [passage]);

  const currentExegesis = getChapterExegesisData(detectedChapNum);

  // ----------------------------------------------------------------------
  // HERRAMIENTAS DE FORMATO RICH TEXT (Aplica sobre texto seleccionado)
  // ----------------------------------------------------------------------

  const executeCommand = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
  };

  const applyHighlightColor = (colorHex) => {
    executeCommand('hiliteColor', colorHex);
  };

  const removeHighlightColor = () => {
    executeCommand('hiliteColor', 'transparent');
    executeCommand('backColor', 'transparent');
  };

  const insertQuoteBlock = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      if (node.nodeType === 3) node = node.parentNode;

      const existingQuote = node.closest('blockquote');
      if (existingQuote) {
        // Toggle OFF: revertir cita a párrafo normal <p>
        document.execCommand('formatBlock', false, 'p');
        return;
      }
    }
    document.execCommand('formatBlock', false, 'blockquote');
  };

  const removeQuoteBlock = () => {
    executeCommand('formatBlock', false, 'p');
  };

  const insertHeading = (level) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      if (node.nodeType === 3) node = node.parentNode;

      const existingHeading = node.closest('h1, h2, h3');
      if (existingHeading && existingHeading.tagName.toLowerCase() === `h${level}`) {
        // Toggle OFF: si ya tiene H1/H2/H3 del mismo nivel, revertir a párrafo normal <p>
        document.execCommand('formatBlock', false, 'p');
        return;
      }
    }
    document.execCommand('formatBlock', false, `h${level}`);
  };

  // Insertar una cita bíblica / nota del usuario directamente en la posición del cursor del editor
  const handleInsertNoteToEditor = (noteObj) => {
    const bName = noteObj.book ? (noteObj.book.charAt(0).toUpperCase() + noteObj.book.slice(1)) : detectedBookName;
    const verseText = getVerseTextRVR1960(noteObj.book || 'genesis', noteObj.chapter, noteObj.verse, fullBibleData);
    const htmlToInsert = `
      <blockquote class="inserted-bible-quote">
        <span class="quote-header-row">
          <strong>📖 ${bName} ${noteObj.chapter}:${noteObj.verse} (RVR1960)</strong>
          <button type="button" class="remove-quote-floating-btn no-print" title="Quitar formato de cita conservando el texto" onclick="this.closest('blockquote').outerHTML = this.closest('blockquote').innerHTML.replace(/<button[\\s\\S]*?<\\/button>/, '')">✕ Quitar Cita</button>
        </span><br/>
        <em>"${verseText}"</em><br/>
        ${noteObj.content ? `<span class="note-comment">💡 Nota: ${noteObj.content}</span>` : ''}
      </blockquote>
      <p><br/></p>
    `;

    executeCommand('insertHTML', false, htmlToInsert);
  };

  // Insertar sugerencia exegética (ej. Bosquejo o Término Hebreo) en el editor
  const handleInsertExegesisToEditor = (textSnippet) => {
    const htmlToInsert = `<p><strong>📌 Exégesis:</strong> ${textSnippet}</p>`;
    executeCommand('insertHTML', htmlToInsert);
  };

  const handleSave = () => {
    const contentHtml = editorRef.current ? editorRef.current.innerHTML : '';
    const tagsArray = tagInput.match(/#[\wáéíóúÁÉÍÓÚñÑ]+/g) || ['#Predicación'];

    onSave({
      ...sermon,
      title: title || 'Bosquejo Sin Título',
      passage: passage || 'Génesis',
      proposition,
      contentHtml,
      tags: Array.from(new Set(tagsArray))
    });
  };

  return (
    <div className="sermon-editor-container">
      {/* BARRA SUPERIOR DE CONTROL */}
      <div className="se-top-bar">
        <button className="se-btn se-back-btn" onClick={onCancel}>
          ← Volver a la Lista de Sermones
        </button>
        <div className="se-top-actions">
          <button className="se-btn se-save-btn" onClick={handleSave}>
            💾 Guardar Bosquejo
          </button>
        </div>
      </div>

      {/* METADATOS DEL SERMÓN (TÍTULO, PASAJE, PROPOSICIÓN Y TAGS) */}
      <div className="se-metadata-card">
        <div className="se-input-row">
          <div className="se-input-group flex-2">
            <label>🎤 Título del Sermón / Lección:</label>
            <input
              type="text"
              className="se-input main-title-input"
              placeholder="Ej. La Fe Probada en el Monte Moriah"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="se-input-group flex-1">
            <label>📖 Pasaje Bíblico Principal:</label>
            <input
              type="text"
              className="se-input"
              placeholder="Ej. Génesis 22:1-19"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
            />
          </div>
        </div>

        <div className="se-input-row">
          <div className="se-input-group flex-2">
            <label>💡 Proposición / Idea Central del Mensaje:</label>
            <input
              type="text"
              className="se-input"
              placeholder="Ej. Dios prueba la fe de sus siervos para revelar su provisión redentora."
              value={proposition}
              onChange={(e) => setProposition(e.target.value)}
            />
          </div>

          <div className="se-input-group flex-1">
            <label>🏷️ Etiquetas (#Tags):</label>
            <input
              type="text"
              className="se-input"
              placeholder="#Predicación #Pulpito #Tipología"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* LAYOUT DE ESCRITURA: EDITOR RICH TEXT A LA IZQUIERDA Y PANEL AUXILIAR A LA DERECHA */}
      <div className="se-workspace-layout">
        {/* COLUMNA IZQUIERDA: EDITOR RICH TEXT */}
        <div className="se-editor-column">
          {/* BARRA DE HERRAMIENTAS TIPOGRÁFICAS (FORMATTING TOOLBAR) */}
          <div className="se-toolbar">
            {/* Títulos / Jerarquía */}
            <div className="tb-group">
              <button className="tb-btn" onClick={() => insertHeading(1)} title="Título H1 (Punto Principal)">H1</button>
              <button className="tb-btn" onClick={() => insertHeading(2)} title="Título H2 (Subpunto)">H2</button>
              <button className="tb-btn" onClick={() => insertHeading(3)} title="Título H3">H3</button>
            </div>

            <span className="tb-divider" />

            {/* Formato Básico */}
            <div className="tb-group">
              <button className="tb-btn bold" onClick={() => executeCommand('bold')} title="Negrita (Ctrl+B)">B</button>
              <button className="tb-btn italic" onClick={() => executeCommand('italic')} title="Cursiva (Ctrl+I)"><em>I</em></button>
              <button className="tb-btn underline" onClick={() => executeCommand('underline')} title="Subrayado (Ctrl+U)"><u>U</u></button>
            </div>

            <span className="tb-divider" />

            {/* Resaltador de Texto Multicolor */}
            <div className="tb-group">
              <span className="tb-label">Resaltar:</span>
              <button className="tb-color-dot gold" onClick={() => applyHighlightColor('#fde047')} title="Resaltar en Amarillo (Doctrina)" />
              <button className="tb-color-dot blue" onClick={() => applyHighlightColor('#93c5fd')} title="Resaltar en Azul (Promesa)" />
              <button className="tb-color-dot green" onClick={() => applyHighlightColor('#86efac')} title="Resaltar en Verde (Vida)" />
              <button className="tb-color-dot red" onClick={() => applyHighlightColor('#fca5a5')} title="Resaltar en Rojo (Juicio/Profecía)" />
              <button className="tb-btn tb-clear-highlight" onClick={removeHighlightColor} title="Quitar resaltado del texto seleccionado">🚫 Sin Color</button>
            </div>

            <span className="tb-divider" />

            {/* Listas y Citas */}
            <div className="tb-group">
              <button className="tb-btn" onClick={() => executeCommand('insertUnorderedList')} title="Lista con Viñetas">• Lista</button>
              <button className="tb-btn" onClick={() => executeCommand('insertOrderedList')} title="Lista Numerada">1. Lista</button>
              <button className="tb-btn" onClick={insertQuoteBlock} title="Convertir texto seleccionado en Bloque de Cita">💬 Cita</button>
              <button className="tb-btn tb-remove-quote" onClick={removeQuoteBlock} title="Quitar formato de cita conservando el texto">🚫 Quitar Cita</button>
            </div>
          </div>

          {/* ÁREA EDITABLE RICH TEXT */}
          <div
            ref={editorRef}
            className="se-rich-editor"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Escribe aquí tu introducción y puntos principales de la predicación..."
            dangerouslySetInnerHTML={{ __html: sermon?.contentHtml || '' }}
          />
        </div>

        {/* COLUMNA DERECHA: APUNTES Y ASISTENTE EXEGÉTICO PARA EL PÚLPITO */}
        <div className="se-sidebar-column">
          {/* ASISTENTE EXEGÉTICO AUTOMÁTICO */}
          {currentExegesis && (
            <div className="se-sidebar-box exegesis-assistant">
              <h3>⚡ Asistente Exegético para {detectedBookName} {detectedChapNum}</h3>

              {currentExegesis.outline && (
                <div className="sea-section">
                  <h4>Estructura Homilética del Capítulo:</h4>
                  {currentExegesis.outline.map((item, idx) => (
                    <div
                      key={idx}
                      className="sea-item-chip"
                      onClick={() => handleInsertExegesisToEditor(`${item.verses} — ${item.title}`)}
                      title="Haz clic para insertar este punto en tu bosquejo"
                    >
                      <span className="v-tag">{item.verses}</span>
                      <span className="t-tag">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {currentExegesis.hebrew_terms && (
                <div className="sea-section">
                  <h4>Términos Clave en Hebreo:</h4>
                  {currentExegesis.hebrew_terms.map((t, idx) => (
                    <div
                      key={idx}
                      className="sea-item-chip heb"
                      onClick={() => handleInsertExegesisToEditor(`Término en Hebreo: ${t.hebrew} (${t.transliteration}, Strong ${t.strong}) — ${t.meaning}`)}
                      title="Haz clic para insertar este análisis léxico"
                    >
                      <span className="h-tag">{t.hebrew} ({t.transliteration})</span>
                      <span className="m-tag">{t.meaning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LISTA DE MIS NOTAS Y VERSÍCULOS GUARDADOS */}
          <div className="se-sidebar-box user-notes-assistant">
            <h3>📖 Mis Notas y Citas Guardadas ({userNotes.length})</h3>
            <p className="sea-subtext">Haz clic en "📋 Insertar" para pegar la cita y tu nota en tu sermón:</p>

            {userNotes.length === 0 ? (
              <p className="empty-sub">No tienes notas registradas aún.</p>
            ) : (
              <div className="sea-notes-list">
                {userNotes.map(n => (
                  <div key={n.id} className="sea-note-item">
                    <div className="sni-header">
                      <span className="sni-ref">Gén. {n.chapter}:{n.verse}</span>
                      <button
                        className="sni-insert-btn"
                        onClick={() => handleInsertNoteToEditor(n)}
                      >
                        📋 Insertar en 1 Clic
                      </button>
                    </div>
                    {n.content && <p className="sni-text">"{n.content}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
