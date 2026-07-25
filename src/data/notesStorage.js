/**
 * notesStorage.js — Genesis Explorer / Bible Explorer Suite
 * Módulo de Persistencia Local y Gestión de Datos de Usuario (Client-Side Storage)
 * 
 * Gestiona:
 * 1. Notas Personales y Resaltados por Versículo (`[book]_user_notes`)
 * 2. Cuaderno de Bosquejos y Sermones Homiléticos (`[book]_user_sermons`)
 * 3. Copias de Seguridad (Exportación e Importación de datos JSON)
 */

const DEFAULT_BOOK = 'genesis';

// ----------------------------------------------------------------------
// 1. GESTIÓN DE NOTAS Y RESALTADOS POR VERSÍCULO
// ----------------------------------------------------------------------

/**
 * Obtiene todas las notas de versículos guardadas para un libro.
 * @param {string} book - Identificador del libro (por defecto 'genesis')
 * @returns {Array<Object>} Lista de objetos Note: { id, book, chapter, verse, content, color, tags, updatedAt }
 */
export function getAllUserNotes(book = DEFAULT_BOOK) {
  try {
    const raw = localStorage.getItem(`${book}_user_notes_v2`);
    if (raw) {
      return JSON.parse(raw);
    }

    // Migración transparente desde el formato legacy genesis_notes_ch_[chap]
    const legacyNotes = migrateLegacyNotes(book);
    if (legacyNotes.length > 0) {
      saveAllUserNotes(legacyNotes, book);
      return legacyNotes;
    }

    return [];
  } catch (err) {
    console.error(`[notesStorage] Error al leer notas de ${book}:`, err);
    return [];
  }
}

/**
 * Guarda el array completo de notas en localStorage.
 */
export function saveAllUserNotes(notesArray, book = DEFAULT_BOOK) {
  try {
    localStorage.setItem(`${book}_user_notes_v2`, JSON.stringify(notesArray));
  } catch (err) {
    console.error(`[notesStorage] Error al guardar notas de ${book}:`, err);
  }
}

/**
 * Obtiene la nota guardada para un versículo específico.
 */
export function getNoteForVerse(chapter, verse, book = DEFAULT_BOOK) {
  const notes = getAllUserNotes(book);
  return notes.find(n => Number(n.chapter) === Number(chapter) && Number(n.verse) === Number(verse)) || null;
}

/**
 * Guarda o actualiza la nota de un versículo.
 * @param {number} chapter - Número de capítulo
 * @param {number} verse - Número de versículo
 * @param {Object} noteData - Datos de la nota: { content, color, tags }
 * @param {string} book - Identificador del libro
 */
export function saveNoteForVerse(chapter, verse, noteData = {}, book = DEFAULT_BOOK) {
  const notes = getAllUserNotes(book);
  const existingIdx = notes.findIndex(n => Number(n.chapter) === Number(chapter) && Number(n.verse) === Number(verse));

  const updatedNote = {
    id: `note_${book}_ch${chapter}_v${verse}`,
    book,
    chapter: Number(chapter),
    verse: Number(verse),
    content: noteData.content || '',
    color: noteData.color || 'gold',
    tags: Array.isArray(noteData.tags) ? noteData.tags : extractTags(noteData.content || ''),
    updatedAt: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    notes[existingIdx] = { ...notes[existingIdx], ...updatedNote };
  } else {
    notes.push(updatedNote);
  }

  saveAllUserNotes(notes, book);
  return updatedNote;
}

/**
 * Elimina la nota de un versículo específico.
 */
export function deleteNoteForVerse(chapter, verse, book = DEFAULT_BOOK) {
  const notes = getAllUserNotes(book);
  const filtered = notes.filter(n => !(Number(n.chapter) === Number(chapter) && Number(n.verse) === Number(verse)));
  saveAllUserNotes(filtered, book);
}

// ----------------------------------------------------------------------
// 2. GESTIÓN DEL CUADERNO DE BOSQUEJOS Y SERMONES
// ----------------------------------------------------------------------

/**
 * Obtiene todos los sermones / bosquejos guardados por el usuario.
 * @returns {Array<Object>} Lista de sermones: { id, title, passage, proposition, contentHtml, tags, createdAt, updatedAt }
 */
export function getAllSermons(book = DEFAULT_BOOK) {
  try {
    const raw = localStorage.getItem(`${book}_user_sermons`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error(`[notesStorage] Error al leer sermones de ${book}:`, err);
    return [];
  }
}

/**
 * Guarda el array completo de sermones en localStorage.
 */
export function saveAllSermons(sermonsArray, book = DEFAULT_BOOK) {
  try {
    localStorage.setItem(`${book}_user_sermons`, JSON.stringify(sermonsArray));
  } catch (err) {
    console.error(`[notesStorage] Error al guardar sermones de ${book}:`, err);
  }
}

/**
 * Obtiene un sermón por su ID único.
 */
export function getSermonById(sermonId, book = DEFAULT_BOOK) {
  const sermons = getAllSermons(book);
  return sermons.find(s => s.id === sermonId) || null;
}

/**
 * Guarda o actualiza un sermón homilético.
 * @param {Object} sermonObj - Datos del sermón
 */
export function saveSermon(sermonObj, book = DEFAULT_BOOK) {
  const sermons = getAllSermons(book);
  const now = new Date().toISOString();

  const sermonId = sermonObj.id || `sermon_${Date.now()}`;
  const existingIdx = sermons.findIndex(s => s.id === sermonId);

  const newSermon = {
    id: sermonId,
    book,
    title: sermonObj.title || 'Bosquejo Sin Título',
    passage: sermonObj.passage || 'Génesis',
    proposition: sermonObj.proposition || '',
    contentHtml: sermonObj.contentHtml || '',
    tags: Array.isArray(sermonObj.tags) ? sermonObj.tags : extractTags(sermonObj.contentHtml || ''),
    createdAt: sermonObj.createdAt || now,
    updatedAt: now
  };

  if (existingIdx !== -1) {
    sermons[existingIdx] = { ...sermons[existingIdx], ...newSermon };
  } else {
    sermons.unshift(newSermon); // Agregar al inicio de la lista
  }

  saveAllSermons(sermons, book);
  return newSermon;
}

/**
 * Elimina un sermón por su ID.
 */
export function deleteSermon(sermonId, book = DEFAULT_BOOK) {
  const sermons = getAllSermons(book);
  const filtered = sermons.filter(s => s.id !== sermonId);
  saveAllSermons(filtered, book);
}

// ----------------------------------------------------------------------
// 3. RESPALDO Y RESTAURACIÓN (EXPORT / IMPORT JSON)
// ----------------------------------------------------------------------

/**
 * Genera un objeto JSON completo con todas las notas y sermones para exportar.
 */
export function exportUserDataToJson(book = DEFAULT_BOOK) {
  const notes = getAllUserNotes(book);
  const sermons = getAllSermons(book);

  const backupData = {
    app: 'Bible Explorer Suite',
    book,
    exportedAt: new Date().toISOString(),
    version: '2.0',
    notes,
    sermons
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Importa y restaura datos desde un string JSON de respaldo.
 */
export function importUserDataFromJson(jsonString, book = DEFAULT_BOOK) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.notes && !data.sermons) {
      throw new Error('Formato de respaldo no válido.');
    }

    if (Array.isArray(data.notes)) {
      saveAllUserNotes(data.notes, book);
    }
    if (Array.isArray(data.sermons)) {
      saveAllSermons(data.sermons, book);
    }

    return { success: true, notesCount: data.notes?.length || 0, sermonsCount: data.sermons?.length || 0 };
  } catch (err) {
    console.error('[notesStorage] Error al importar respaldo:', err);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------------------------
// FUNCIONES AUXILIARES INTERNAS
// ----------------------------------------------------------------------

/**
 * Extrae hashtags (#Etiqueta) de cualquier texto o HTML.
 */
function extractTags(str) {
  if (!str) return [];
  const matches = str.match(/#[\wáéíóúÁÉÍÓÚñÑ]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Migra notas legacy del formato localStorage `genesis_notes_ch_[chap]` al esquema v2.
 */
function migrateLegacyNotes(book) {
  const migrated = [];
  try {
    for (let c = 1; c <= 50; c++) {
      const raw = localStorage.getItem(`${book}_notes_ch_${c}`);
      if (raw) {
        const obj = JSON.parse(raw);
        Object.keys(obj).forEach(verseNum => {
          if (obj[verseNum]) {
            migrated.push({
              id: `note_${book}_ch${c}_v${verseNum}`,
              book,
              chapter: Number(c),
              verse: Number(verseNum),
              content: obj[verseNum],
              color: 'gold',
              tags: extractTags(obj[verseNum]),
              updatedAt: new Date().toISOString()
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('[notesStorage] Error durante migración legacy:', e);
  }
  return migrated;
}
