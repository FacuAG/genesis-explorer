/**
 * Utilidad profesional para transformar el dataset de Génesis (Schema 3.0)
 * a los objetos DataSet requeridos por vis-timeline con jerarquía semántica de Zoom (LOD).
 */

// Categorías de eventos y sus esquemas de color/icono en CSS
export const EVENT_CATEGORIES = {
  creation: { label: 'Creación', color: '#10b981', icon: '✨' },
  genealogy: { label: 'Genealogía', color: '#6366f1', icon: '📜' },
  judgment: { label: 'Juicio Divino', color: '#ef4444', icon: '🔥' },
  miracle: { label: 'Milagro / Teofanía', color: '#f59e0b', icon: '⚡' },
  restoration: { label: 'Restauración / Gracia', color: '#14b8a6', icon: '🕊️' },
  covenant: { label: 'Pacto Divino', color: '#eab308', icon: '👑' },
  patriarch: { label: 'Ciclo Patriarcal', color: '#ec4899', icon: '👤' },
  exile: { label: 'Migración / Exilio', color: '#8b5cf6', icon: '🏕️' },
  sin: { label: 'Rebelión / Pecado', color: '#64748b', icon: '⚠️' }
};

/**
 * Extrae el año Anno Mundi (AM) real de cualquier evento bíblico del dataset.
 */
export function getEventAM(e) {
  if (!e) return 0;
  if (typeof e.year_am === 'number') return e.year_am;
  if (e.chronology) {
    if (typeof e.chronology.approx_year_am === 'number') return e.chronology.approx_year_am;
    if (typeof e.chronology.year_am === 'number') return e.chronology.year_am;
    if (typeof e.chronology.exact_year_am === 'number') return e.chronology.exact_year_am;
  }
  return 0;
}

/**
 * Extrae el resumen o narrativa de un evento.
 */
export function getEventSummary(e) {
  if (!e) return '';
  return e.summary || e.narrative || '';
}

/**
 * Formatea de forma 100% segura cualquier referencia bíblica (string u objeto).
 */
export function formatRef(ref) {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object') {
    const book = ref.book || 'Génesis';
    const ch = ref.chapter || ref.chapter_start || '';
    const vs = ref.verse_start || ref.verse_start_ref || '';
    const ve = ref.verse_end || ref.verse_end_ref || '';
    if (ch && vs) {
      return `${book} ${ch}:${vs}${ve ? '-' + ve : ''}`;
    }
    if (ch) return `${book} cap. ${ch}`;
  }
  return '';
}

/**
 * Extrae la cita bíblica formateada en string.
 */
export function getEventRefStr(e) {
  if (!e) return '';
  if (e.scriptural_reference) {
    return formatRef(e.scriptural_reference);
  }
  if (e.references && e.references.length > 0) {
    return formatRef(e.references[0]);
  }
  if (e.chapter_start) {
    return `Gén. ${e.chapter_start}:${e.verse_start_ref || 1}`;
  }
  return '';
}

/**
 * Extrae el número de capítulo entero para filtros.
 */
export function getEventChapter(e) {
  if (!e) return 1;
  if (e.scriptural_reference?.chapter) return e.scriptural_reference.chapter;
  if (e.references && e.references.length > 0) return e.references[0].chapter;
  if (e.chapter_start) return e.chapter_start;
  return 1;
}

/**
 * Convierte un año Anno Mundi (AM) a un objeto Date falso de escala uniforme
 * AM 0 se mapea al año 1000-01-01, AM 2369 al año 3369-01-01.
 */
export function amToDate(yearAM) {
  const baseYear = 1000;
  const am = typeof yearAM === 'number' ? yearAM : 0;
  const targetYear = baseYear + am;
  const yearStr = String(targetYear).padStart(4, '0');
  return new Date(`${yearStr}-01-01T00:00:00Z`);
}

/**
 * Convierte una fecha de vis-timeline de vuelta al año Anno Mundi (AM)
 */
export function dateToAM(date) {
  if (!date) return 0;
  if (date instanceof Date) return date.getUTCFullYear() - 1000;
  if (typeof date.year === 'function') return date.year() - 1000;
  if (typeof date.getFullYear === 'function') return date.getFullYear() - 1000;
  const d = new Date(date);
  return (isNaN(d.getTime()) ? 0 : d.getUTCFullYear()) - 1000;
}

/**
 * Transforma los eventos, bloques narrativos, eras y pactos de genesis.json
 * en ítems y grupos para vis-timeline según el nivel de detalle semántico (LOD).
 */
export function mapGenesisToVisData(
  events = [],
  narrativeBlocks = [],
  covenants = [],
  eras = [],
  detailLevel = 3,
  isFilterActive = false
) {
  // 1. Grupos Jerárquicos de la Timeline
  const groups = [
    {
      id: 'eras_group',
      content: '<span class="group-label">🌐 Eras Teológicas</span>',
      order: 1,
      className: 'vis-group-eras'
    },
    {
      id: 'blocks_group',
      content: '<span class="group-label">📍 Bloques Narrativos</span>',
      order: 2,
      className: 'vis-group-blocks'
    },
    {
      id: 'covenants_group',
      content: '<span class="group-label">👑 Pactos Divinos</span>',
      order: 3,
      className: 'vis-group-covenants'
    }
  ];

  // Agregar grupo de eventos si hay nivel 2/3 o si hay un filtro activo
  if (detailLevel >= 2 || isFilterActive) {
    groups.push({
      id: 'events_group',
      content: '<span class="group-label">⚡ Eventos Bíblicos</span>',
      order: 4,
      className: 'vis-group-events'
    });
  }

  const items = [];

  // 2. Mapear Eras Teológicas
  eras.forEach(era => {
    const startAM = era.am_start ?? 0;
    const endAM = era.am_end ?? 2369;

    items.push({
      id: `era_${era.id}`,
      group: 'eras_group',
      content: `
        <div class="vis-era-item">
          <strong>🏛️ ${era.name}</strong>
          <span class="era-chap-tag">Caps. ${era.chapters_start}-${era.chapters_end}</span>
          <span class="era-am-range">AM ${startAM} – ${endAM}</span>
        </div>
      `,
      start: amToDate(startAM),
      end: amToDate(endAM),
      type: 'range',
      className: `vis-item-era era-${era.id}`
    });
  });

  // 3. Mapear Bloques Narrativos
  narrativeBlocks.forEach(block => {
    const startAM = block.am_start ?? 0;
    const endAM = block.am_end ?? (startAM + 10);
    const chapRange = block.chapters_range || `${block.chapters_start ?? ''}-${block.chapters_end ?? ''}`;

    items.push({
      id: `block_${block.id}`,
      group: 'blocks_group',
      content: `
        <div class="vis-block-item">
          <span class="block-icon">${block.icon || '📍'}</span>
          <strong>${block.name}</strong>
          <span class="chap-badge">Caps. ${chapRange}</span>
        </div>
      `,
      start: amToDate(startAM),
      end: amToDate(endAM),
      type: 'range',
      className: `vis-item-narrative-block block-${block.id}`
    });
  });

  // 4. Mapear Pactos en covenants_group
  covenants.forEach(cov => {
    let covAM = 0;
    if (cov.id === 'edenic_covenant' || cov.id === 'eden_covenant') covAM = 0;
    if (cov.id === 'adamic_covenant' || cov.id === 'adamic') covAM = 2;
    if (cov.id === 'noahic_covenant') covAM = 1657;
    if (cov.id === 'abrahamic_covenant') covAM = 2033;
    if (cov.id === 'circumcision_covenant') covAM = 2047;

    items.push({
      id: `cov_${cov.id}`,
      group: 'covenants_group',
      content: `<div class="vis-covenant-card">👑 <strong>${cov.name}</strong></div>`,
      start: amToDate(covAM),
      type: 'box',
      className: 'vis-item-covenant'
    });
  });

  // 5. Mapear Eventos Bíblicos (Con resalte especial si hay filtro activo)
  let visibleEvents = events;

  if (!isFilterActive) {
    if (detailLevel === 1) {
      visibleEvents = [];
    } else if (detailLevel === 2) {
      visibleEvents = events.filter(e => {
        const am = getEventAM(e);
        return (
          e.category === 'covenant' ||
          e.category === 'creation' ||
          e.category === 'judgment' ||
          am === 0 || am === 1656 || am === 1750 || am === 2023 || am === 2288
        );
      });
    }
  }

  visibleEvents.forEach(e => {
    const cat = EVENT_CATEGORIES[e.category] || { label: 'Evento', color: '#6366f1', icon: '📌' };
    const amYear = getEventAM(e);
    const eventName = e.short_name || e.name;
    const highlightClass = isFilterActive ? 'vis-item-highlighted' : '';

    const contentHtml = `
      <div class="vis-event-card category-${e.category}">
        <span class="event-icon">${cat.icon}</span>
        <span class="event-title">${eventName}</span>
        <span class="event-am-tag">AM ${amYear}</span>
      </div>
    `;

    items.push({
      id: e.id,
      group: 'events_group',
      content: contentHtml,
      start: amToDate(amYear),
      type: 'box',
      className: `vis-item-event cat-${e.category} ${highlightClass}`
    });
  });

  return { groups, items };
}
