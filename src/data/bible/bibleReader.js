/**
 * Motor de Lectura Bíblica Completo (Reina-Valera 1960 - RVR1960).
 * Búsqueda instantánea O(1) de cualquier pasaje de los 66 libros de la Biblia
 * (Génesis a Apocalipsis: 1.189 capítulos y 31.102 versículos).
 */

import fullBibleData from './rvr1960_full.json';

/**
 * Normalizador de nombres de libros bíblicos mapeados exactamente a las llaves de rvr1960_full.json
 */
/**
 * Normalizador de nombres de libros bíblicos mapeados exactamente a las llaves de rvr1960_full.json
 */
export function normalizeBookName(bookStr) {
  if (!bookStr) return 'Génesis';
  
  // Si la llave ya coincide de forma exacta (ej. "Génesis", "Mateo", "John", "Hebrews")
  if (fullBibleData[bookStr]) return bookStr;

  const b = bookStr.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Epístolas de Juan (1, 2, 3 Juan) - Deben verificarse ANTES del Evangelio de Juan
  if (b.startsWith('1 jua') || b.startsWith('1jua') || b.startsWith('1 jn') || b.startsWith('1jn') || b.startsWith('1 john')) return '1 John';
  if (b.startsWith('2 jua') || b.startsWith('2jua') || b.startsWith('2 jn') || b.startsWith('2jn') || b.startsWith('2 john')) return '2 John';
  if (b.startsWith('3 jua') || b.startsWith('3jua') || b.startsWith('3 jn') || b.startsWith('3jn') || b.startsWith('3 john')) return '3 John';

  // Pedro (1, 2 Pedro)
  if (b.startsWith('1 ped') || b.startsWith('1ped') || b.startsWith('1 pet')) return '1 Pedro';
  if (b.startsWith('2 ped') || b.startsWith('2ped') || b.startsWith('2 pet')) return '2 Pedro';

  // Samuel, Reyes, Crónicas, Corintios, Tesalonicenses, Timoteo
  if (b.startsWith('1 sam') || b.startsWith('1sam')) return '1 Samuel';
  if (b.startsWith('2 sam') || b.startsWith('2sam')) return '2 Samuel';
  if (b.startsWith('1 rey') || b.startsWith('1rey') || b.startsWith('1 kin')) return '1 Kings';
  if (b.startsWith('2 rey') || b.startsWith('2rey') || b.startsWith('2 kin')) return '2 Kings';
  if (b.startsWith('1 cro') || b.startsWith('1cro') || b.startsWith('1 chr')) return '1 Crónicas';
  if (b.startsWith('2 cro') || b.startsWith('2cro') || b.startsWith('2 chr')) return '2 Crónicas';
  if (b.startsWith('1 cor') || b.startsWith('1cor')) return '1 Corintios';
  if (b.startsWith('2 cor') || b.startsWith('2cor')) return '2 Corintios';
  if (b.startsWith('1 tes') || b.startsWith('1tes') || b.startsWith('1 th')) return '1 Thessalonians';
  if (b.startsWith('2 tes') || b.startsWith('2tes') || b.startsWith('2 th')) return '2 Thessalonians';
  if (b.startsWith('1 tim') || b.startsWith('1tim')) return '1 Timothy';
  if (b.startsWith('2 tim') || b.startsWith('2tim')) return '2 Timothy';

  // Evangelios y Hechos
  if (b.startsWith('mat')) return 'Mateo';
  if (b.startsWith('mar')) return 'Marcos';
  if (b.startsWith('luc')) return 'Lucas';
  if (b.startsWith('jua') || b.startsWith('john') || b === 'jn') return 'John';
  if (b.startsWith('hec') || b.startsWith('act')) return 'Hechos';

  // Antiguo Testamento
  if (b.startsWith('gen')) return 'Génesis';
  if (b.startsWith('exo')) return 'Éxodo';
  if (b.startsWith('lev')) return 'Levítico';
  if (b.startsWith('num')) return 'Numbers';
  if (b.startsWith('deu')) return 'Deuteronomio';
  if (b.startsWith('jos')) return 'Joshua';
  if (b.startsWith('jue') || b.startsWith('jzg')) return 'Jueces';
  if (b.startsWith('rut')) return 'Rut';
  if (b.startsWith('esd')) return 'Esdras';
  if (b.startsWith('neh')) return 'Nehemías';
  if (b.startsWith('est')) return 'Esther';
  if (b === 'job') return 'Job';
  if (b.startsWith('salm') || b.startsWith('psa')) return 'Salmos';
  if (b.startsWith('prov')) return 'Proverbs';
  if (b.startsWith('ecle') || b.startsWith('qoh')) return 'Eclesiastés';
  if (b.startsWith('cant') || b.startsWith('song')) return 'Cantar de los Cantares';
  if (b.startsWith('isa')) return 'Isaías';
  if (b.startsWith('jer')) return 'Jeremías';
  if (b.startsWith('lam')) return 'Lamentations';
  if (b.startsWith('eze')) return 'Ezekiel';
  if (b.startsWith('dan')) return 'Daniel';
  if (b.startsWith('ose')) return 'Oseas';
  if (b.startsWith('joe')) return 'Joel';
  if (b.startsWith('amo')) return 'Amós';
  if (b.startsWith('abd')) return 'Abdías';
  if (b.startsWith('jon')) return 'Jonás';
  if (b.startsWith('miq') || b.startsWith('mic')) return 'Micah';
  if (b.startsWith('nah')) return 'Nahúm';
  if (b.startsWith('hab')) return 'Habacuc';
  if (b.startsWith('sof')) return 'Sofonías';
  if (b.startsWith('hag')) return 'Hageo';
  if (b.startsWith('zac')) return 'Zacarías';
  if (b.startsWith('mal')) return 'Malachi';

  // Epístolas del Nuevo Testamento
  if (b.startsWith('rom')) return 'Romanos';
  if (b.startsWith('gal')) return 'Galatians';
  if (b.startsWith('efe')) return 'Efesios';
  if (b.startsWith('filip') || b.startsWith('flp') || b.startsWith('phi')) return 'Philippians';
  if (b.startsWith('col')) return 'Colossians';
  if (b.startsWith('tit')) return 'Titus';
  if (b.startsWith('filem') || b.startsWith('flm')) return 'Filemón';
  if (b.startsWith('heb')) return 'Hebrews';
  if (b.startsWith('sant') || b.startsWith('stg') || b.startsWith('jam')) return 'James';
  if (b.startsWith('jud')) return 'Judas';
  if (b.startsWith('apo') || b.startsWith('rev')) return 'Revelation';

  return 'Génesis';
}

/**
 * Parsea un string de referencia bíblica ("Mateo 1:1-16", "Rut 4:18-22", "Lucas 3:23-38")
 */
export function parseBiblicalRefString(refStr) {
  if (!refStr || typeof refStr !== 'string') return null;

  const match = refStr.trim().match(/^((?:\d\s+)?[A-Za-áéíóúÁÉÍÓÚñÑ]+(?:\s+[A-Za-áéíóúÁÉÍÓÚñÑ]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/i);

  if (!match) return null;

  const rawBook = match[1];
  const chapter = parseInt(match[2], 10);
  const verseStart = match[3] ? parseInt(match[3], 10) : 1;
  const verseEnd = match[4] ? parseInt(match[4], 10) : null;

  return {
    book: normalizeBookName(rawBook),
    rawBook,
    chapter,
    verseStart,
    verseEnd
  };
}

/**
 * Obtiene el texto exacto RVR1960 de cualquier pasaje de la Biblia (O(1) lookup)
 */
export function getVerseTextRVR1960(bookName, chapterNum, verseStart, verseEnd) {
  const normBook = normalizeBookName(bookName);
  const bookData = fullBibleData[normBook];

  if (!bookData) return null;

  const chapData = bookData[chapterNum] || bookData[String(chapterNum)];
  if (!chapData) return null;

  if (!verseEnd || verseEnd === verseStart) {
    return chapData[verseStart] || chapData[String(verseStart)] || null;
  }

  // Si es un rango de versículos (ej: Mateo 1:1-16)
  const versesText = [];
  for (let v = verseStart; v <= verseEnd; v++) {
    const vText = chapData[v] || chapData[String(v)];
    if (vText) {
      versesText.push(`[${v}] ${vText}`);
    }
  }

  return versesText.length > 0 ? versesText.join(' ') : null;
}
