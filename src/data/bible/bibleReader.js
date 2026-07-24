/**
 * Motor de Lectura Bíblica Completo (Reina-Valera 1960 - RVR1960).
 * Búsqueda instantánea O(1) de cualquier pasaje de los 66 libros de la Biblia
 * (Génesis a Apocalipsis: 1.189 capítulos y 31.102 versículos).
 */

import fullBibleData from './rvr1960_full.json';

/**
 * Normalizador de nombres de libros bíblicos en español
 */
function normalizeBookName(bookStr) {
  if (!bookStr) return 'Génesis';
  const b = bookStr.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (b.includes('gen')) return 'Génesis';
  if (b.includes('exo')) return 'Éxodo';
  if (b.includes('lev')) return 'Levítico';
  if (b.includes('num')) return 'Números';
  if (b.includes('deut')) return 'Deuteronomio';
  if (b.includes('jos')) return 'Josué';
  if (b.includes('jue') || b.includes('jzg')) return 'Jueces';
  if (b.includes('rut')) return 'Rut';
  if (b.includes('1 sam') || b.includes('1sam')) return '1 Samuel';
  if (b.includes('2 sam') || b.includes('2sam')) return '2 Samuel';
  if (b.includes('1 rey') || b.includes('1rey')) return '1 Reyes';
  if (b.includes('2 rey') || b.includes('2rey')) return '2 Reyes';
  if (b.includes('1 cro') || b.includes('1cro')) return '1 Crónicas';
  if (b.includes('2 cro') || b.includes('2cro')) return '2 Crónicas';
  if (b.includes('esd')) return 'Esdras';
  if (b.includes('neh')) return 'Nehemías';
  if (b.includes('est')) return 'Ester';
  if (b === 'job') return 'Job';
  if (b.includes('salm') || b.includes('psal')) return 'Salmos';
  if (b.includes('prov')) return 'Proverbios';
  if (b.includes('ecle') || b.includes('qoh')) return 'Eclesiastés';
  if (b.includes('cant') || b.includes('song')) return 'Cantar de los Cantares';
  if (b.includes('isa')) return 'Isaías';
  if (b.includes('jer')) return 'Jeremías';
  if (b.includes('lam')) return 'Lamentaciones';
  if (b.includes('ezeq')) return 'Ezequiel';
  if (b.includes('dan')) return 'Daniel';
  if (b.includes('ose')) return 'Oseas';
  if (b.includes('joe')) return 'Joel';
  if (b.includes('amo')) return 'Amós';
  if (b.includes('abd')) return 'Abdías';
  if (b.includes('jon')) return 'Jonás';
  if (b.includes('miq')) return 'Miqueas';
  if (b.includes('nah')) return 'Nahúm';
  if (b.includes('hab')) return 'Habacuc';
  if (b.includes('sof')) return 'Sofonías';
  if (b.includes('hag')) return 'Hageo';
  if (b.includes('zac')) return 'Zacarías';
  if (b.includes('mal')) return 'Malaquías';
  if (b.includes('mat')) return 'Mateo';
  if (b.includes('marc') || b.includes('mar')) return 'Marcos';
  if (b.includes('luc')) return 'Lucas';
  if (b.includes('jua') || b.includes('john')) return 'Juan';
  if (b.includes('hec') || b.includes('act')) return 'Hechos';
  if (b.includes('rom')) return 'Romanos';
  if (b.includes('1 cor') || b.includes('1cor')) return '1 Corintios';
  if (b.includes('2 cor') || b.includes('2cor')) return '2 Corintios';
  if (b.includes('gal')) return 'Gálatas';
  if (b.includes('efe')) return 'Efesios';
  if (b.includes('fil') || b.includes('php')) return 'Filipenses';
  if (b.includes('col')) return 'Colosenses';
  if (b.includes('1 tes') || b.includes('1tes') || b.includes('1th')) return '1 Tesalonicenses';
  if (b.includes('2 tes') || b.includes('2tes') || b.includes('2th')) return '2 Tesalonicenses';
  if (b.includes('1 tim') || b.includes('1tim')) return '1 Timoteo';
  if (b.includes('2 tim') || b.includes('2tim')) return '2 Timoteo';
  if (b.includes('tit')) return 'Tito';
  if (b.includes('fil') || b.includes('phm')) return 'Filemón';
  if (b.includes('heb')) return 'Hebreos';
  if (b.includes('sant') || b.includes('jam')) return 'Santiago';
  if (b.includes('1 ped') || b.includes('1ped')) return '1 Pedro';
  if (b.includes('2 ped') || b.includes('2ped')) return '2 Pedro';
  if (b.includes('1 jua') || b.includes('1jn')) return '1 Juan';
  if (b.includes('2 jua') || b.includes('2jn')) return '2 Juan';
  if (b.includes('3 jua') || b.includes('3jn')) return '3 Juan';
  if (b.includes('jud')) return 'Judas';
  if (b.includes('apoc') || b.includes('rev')) return 'Apocalipsis';

  return bookStr.trim();
}

/**
 * Parsea un string de cita bíblica (ej. "Génesis 1:1-3", "Salmo 23:1", "Romanos 8:28", "Juan 3:16")
 */
export function parseBiblicalRefString(refStr) {
  if (!refStr || typeof refStr !== 'string') return null;

  const clean = refStr.trim();
  const match = clean.match(/^([1-3]?\s?[A-Za-zÁÉÍÓÚáéíóúÑñ\.\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/);

  if (!match) {
    return { raw: clean, book: clean, chapter: 1, verseStart: 1, verseEnd: null };
  }

  const normBook = normalizeBookName(match[1]);

  return {
    raw: clean,
    book: normBook,
    chapter: parseInt(match[2], 10),
    verseStart: match[3] ? parseInt(match[3], 10) : 1,
    verseEnd: match[4] ? parseInt(match[4], 10) : null
  };
}

/**
 * Consulta el texto RVR1960 exacto de CUALQUIER pasaje bíblico de los 66 libros de la Biblia.
 */
export function getVerseTextRVR1960(book, chapter, verseStart = 1, verseEnd = null) {
  const normBook = normalizeBookName(book);

  // Intentar obtener el libro desde la base de datos completa de 66 libros
  const bookData = fullBibleData[normBook] || fullBibleData[book];

  if (!bookData) {
    return `"${normBook} capítulo ${chapter}, versículo(s) ${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960)."`;
  }

  const chapData = bookData[String(chapter)];
  if (!chapData) {
    return `"${normBook} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960)."`;
  }

  if (verseEnd && verseEnd > verseStart) {
    const verses = [];
    for (let v = verseStart; v <= verseEnd; v++) {
      if (chapData[String(v)]) {
        verses.push(`${v}. ${chapData[String(v)]}`);
      }
    }
    if (verses.length > 0) return verses.join(' ');
  }

  const singleVerse = chapData[String(verseStart)];
  if (singleVerse) return `${verseStart}. ${singleVerse}`;

  return `"${normBook} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960)."`;
}
