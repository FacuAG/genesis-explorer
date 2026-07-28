/**
 * Motor de Lectura Bíblica Completo (Reina-Valera 1960 - RVR1960).
 * Búsqueda instantánea O(1) de cualquier pasaje de los 66 libros de la Biblia
 * (Génesis a Apocalipsis: 1.189 capítulos y 31.102 versículos).
 */

import fullBibleData from './rvr1960_full.json';

/**
 * Normalizador de nombres de libros bíblicos en español con prefijos estrictos
 */
function normalizeBookName(bookStr) {
  if (!bookStr) return 'Génesis';
  const b = bookStr.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (b.startsWith('gen')) return 'Génesis';
  if (b.startsWith('exo')) return 'Éxodo';
  if (b.startsWith('lev')) return 'Levítico';
  if (b.startsWith('num')) return 'Números';
  if (b.startsWith('deu')) return 'Deuteronomio';
  if (b.startsWith('jos')) return 'Josué';
  if (b.startsWith('jue') || b.startsWith('jzg')) return 'Jueces';
  if (b.startsWith('rut')) return 'Rut';
  if (b.startsWith('1 sam') || b.startsWith('1sam')) return '1 Samuel';
  if (b.startsWith('2 sam') || b.startsWith('2sam')) return '2 Samuel';
  if (b.startsWith('1 rey') || b.startsWith('1rey')) return '1 Reyes';
  if (b.startsWith('2 rey') || b.startsWith('2rey')) return '2 Reyes';
  if (b.startsWith('1 cro') || b.startsWith('1cro')) return '1 Crónicas';
  if (b.startsWith('2 cro') || b.startsWith('2cro')) return '2 Crónicas';
  if (b.startsWith('esd')) return 'Esdras';
  if (b.startsWith('neh')) return 'Nehemías';
  if (b.startsWith('est')) return 'Ester';
  if (b === 'job') return 'Job';
  if (b.startsWith('salm') || b.startsWith('psal')) return 'Salmos';
  if (b.startsWith('prov')) return 'Proverbios';
  if (b.startsWith('ecle') || b.startsWith('qoh')) return 'Eclesiastés';
  if (b.startsWith('cant') || b.startsWith('song')) return 'Cantar de los Cantares';
  if (b.startsWith('isa')) return 'Isaías';
  if (b.startsWith('jer')) return 'Jeremías';
  if (b.startsWith('lam')) return 'Lamentaciones';
  if (b.startsWith('eze')) return 'Ezequiel';
  if (b.startsWith('dan')) return 'Daniel';
  if (b.startsWith('oseas') || b === 'ose' || b.startsWith('ose ')) return 'Oseas';
  if (b.startsWith('joe')) return 'Joel';
  if (b.startsWith('amo')) return 'Amós';
  if (b.startsWith('abd')) return 'Abdías';
  if (b.startsWith('jon')) return 'Jonás';
  if (b.startsWith('miq')) return 'Miqueas';
  if (b.startsWith('nah')) return 'Nahúm';
  if (b.startsWith('hab')) return 'Habacuc';
  if (b.startsWith('sof')) return 'Sofonías';
  if (b.startsWith('hag')) return 'Hageo';
  if (b.startsWith('zac')) return 'Zacarías';
  if (b.startsWith('mal')) return 'Malaquías';
  if (b.startsWith('mat')) return 'San Mateo';
  if (b.startsWith('mar')) return 'San Marcos';
  if (b.startsWith('luc')) return 'San Lucas';
  if (b.startsWith('jua') || b.startsWith('john') || b === 'jn') return 'San Juan';
  if (b.startsWith('hec') || b.startsWith('act')) return 'Hechos';
  if (b.startsWith('rom')) return 'Romanos';
  if (b.startsWith('1 cor') || b.startsWith('1cor')) return '1 Corintios';
  if (b.startsWith('2 cor') || b.startsWith('2cor')) return '2 Corintios';
  if (b.startsWith('gal')) return 'Gálatas';
  if (b.startsWith('efe')) return 'Efesios';
  if (b.startsWith('filip') || b.startsWith('flp')) return 'Filipenses';
  if (b.startsWith('col')) return 'Colosenses';
  if (b.startsWith('1 tes') || b.startsWith('1tes')) return '1 Tesalonicenses';
  if (b.startsWith('2 tes') || b.startsWith('2tes')) return '2 Tesalonicenses';
  if (b.startsWith('1 tim') || b.startsWith('1tim')) return '1 Timoteo';
  if (b.startsWith('2 tim') || b.startsWith('2tim')) return '2 Timoteo';
  if (b.startsWith('tit')) return 'Tito';
  if (b.startsWith('filem') || b.startsWith('flm')) return 'Filemón';
  if (b.startsWith('heb')) return 'Hebreos';
  if (b.startsWith('sant') || b.startsWith('stg')) return 'Santiago';
  if (b.startsWith('1 ped') || b.startsWith('1ped')) return '1 Pedro';
  if (b.startsWith('2 ped') || b.startsWith('2ped')) return '2 Pedro';
  if (b.startsWith('1 jua') || b.startsWith('1jn')) return '1 Juan';
  if (b.startsWith('2 jua') || b.startsWith('2jn')) return '2 Juan';
  if (b.startsWith('3 jua') || b.startsWith('3jn')) return '3 Juan';
  if (b.startsWith('jud')) return 'Judas';
  if (b.startsWith('apoc') || b.startsWith('rev')) return 'Apocalipsis';

  return bookStr.trim();
}

/**
 * Parsea un string de cita bíblica (ej. "Génesis 1:1-3", "Salmo 23:1", "Romanos 8:28", "Juan 3:16", "Colosenses 1:15-17")
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

const EnglishBookAliases = {
  'Génesis': 'Génesis', 'Éxodo': 'Éxodo', 'Levítico': 'Levítico', 'Números': 'Numbers', 'Deuteronomio': 'Deuteronomio',
  'Josué': 'Joshua', 'Jueces': 'Jueces', 'Rut': 'Rut', '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
  '1 Reyes': '1 Kings', '2 Reyes': '2 Kings', '1 Crónicas': '1 Crónicas', '2 Crónicas': '2 Crónicas',
  'Esdras': 'Esdras', 'Nehemías': 'Nehemías', 'Ester': 'Esther', 'Job': 'Job', 'Salmos': 'Salmos',
  'Proverbios': 'Proverbs', 'Eclesiastés': 'Eclesiastés', 'Cantar de los Cantares': 'Cantar de los Cantares',
  'Isaías': 'Isaías', 'Jeremías': 'Jeremías', 'Lamentaciones': 'Lamentations', 'Ezequiel': 'Ezekiel',
  'Daniel': 'Daniel', 'Oseas': 'Oseas', 'Joel': 'Joel', 'Amós': 'Amós', 'Abdías': 'Abdías', 'Jonás': 'Juan',
  'Miqueas': 'Micah', 'Nahúm': 'Nahúm', 'Habacuc': 'Habacuc', 'Sofonías': 'Sofonías', 'Hageo': 'Hageo',
  'Zacarías': 'Zacarías', 'Malaquías': 'Malachi', 'Mateo': 'Mateo', 'San Mateo': 'Mateo', 'Marcos': 'Marcos',
  'San Marcos': 'Marcos', 'Lucas': 'Lucas', 'San Lucas': 'Lucas', 'Juan': 'John', 'San Juan': 'John',
  'Hechos': 'Hechos', 'Romanos': 'Romanos', '1 Corintios': '1 Corintios', '2 Corintios': '2 Corintios',
  'Gálatas': 'Galatians', 'Efesios': 'Efesios', 'Filipenses': 'Philippians', 'Colosenses': 'Colossians',
  '1 Tesalonicenses': '1 Thessalonians', '2 Tesalonicenses': '2 Thessalonians', '1 Timoteo': '1 Timothy',
  '2 Timoteo': '2 Timothy', 'Tito': 'Titus', 'Filemón': 'Filemón', 'Hebreos': 'Hebrews', 'Santiago': 'James',
  '1 Pedro': '1 Pedro', '2 Pedro': '2 Pedro', '1 Juan': '1 John', '2 Juan': '2 John', '3 Juan': '3 John',
  'Judas': 'Judas', 'Apocalipsis': 'Revelation'
};

/**
 * Consulta el texto RVR1960 exacto de CUALQUIER pasaje bíblico de los 66 libros de la Biblia.
 */
export function getVerseTextRVR1960(book, chapter, verseStart = 1, verseEnd = null) {
  const normBook = normalizeBookName(book);
  const englishAlias = EnglishBookAliases[normBook] || EnglishBookAliases[book];

  // Intentar obtener el libro desde la base de datos completa de 66 libros con fallbacks flexibles
  const bookData = fullBibleData[normBook] ||
                   (englishAlias ? fullBibleData[englishAlias] : null) ||
                   fullBibleData[`San ${normBook}`] ||
                   fullBibleData[book] ||
                   fullBibleData[`San ${book}`] ||
                   (normBook.startsWith('San ') ? fullBibleData[normBook.replace('San ', '')] : null);

  if (!bookData) {
    return `${normBook} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960).`;
  }

  const chapData = bookData[String(chapter)];
  if (!chapData) {
    return `${normBook} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960).`;
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

  return `${normBook} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960).`;
}
