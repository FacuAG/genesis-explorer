/**
 * Utilidades de formateo profesional para el sistema cronológico Anno Mundi (AM)
 * y referencias bíblicas de Genesis Explorer.
 */

/**
 * Formatea un año Anno Mundi (AM)
 */
export function formatAMYear(yearAM) {
  if (yearAM === null || yearAM === undefined) return 'N/A';
  return `AM ${yearAM}`;
}

/**
 * Formatea un rango de longevidad patriarcal
 */
export function formatLifespan(birthAM, deathAM, lifespan) {
  if (birthAM === null || birthAM === undefined) return 'Fecha no especificada';
  const deathStr = deathAM !== null && deathAM !== undefined ? `AM ${deathAM}` : 'Desconocida / Vivo';
  const spanStr = lifespan ? ` (${lifespan} años)` : '';
  return `AM ${birthAM} – ${deathStr}${spanStr}`;
}

/**
 * Formatea un objeto de referencia bíblica
 */
export function formatScriptureRef(ref) {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  const book = ref.book || 'Génesis';
  const chap = ref.chapter || 1;
  const start = ref.verse_start || 1;
  const end = ref.verse_end;
  
  if (end && end !== start) {
    return `${book} ${chap}:${start}-${end}`;
  }
  return `${book} ${chap}:${start}`;
}
