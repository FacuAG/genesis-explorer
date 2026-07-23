/**
 * Utilidad profesional para transformar el dataset de Génesis (Schema 3.0)
 * a los objetos DataSet requeridos por vis-timeline.
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
 * Convierte un año Anno Mundi (AM) a un objeto Date falso de escala uniforme
 * para que vis-timeline pueda renderizar el eje cronológico Anno Mundi sin distorsión.
 * AM 0 se mapea al año 1000-01-01, AM 2369 al año 3369-01-01.
 */
export function amToDate(yearAM) {
  const baseYear = 1000;
  const am = typeof yearAM === 'number' ? yearAM : 0;
  const targetYear = baseYear + am;
  
  // Usar formato YYYY-01-01 con padStart de 4 dígitos
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
 * Transforma los eventos, bloques narrativos y pactos de genesis.json en ítems y grupos para vis-timeline.
 */
export function mapGenesisToVisData(events = [], narrativeBlocks = [], covenants = []) {
  // 1. Definición de Grupos de la Timeline
  const groups = [
    {
      id: 'blocks_group',
      content: '<span class="group-label">📍 Bloques Narrativos</span>',
      order: 1,
      className: 'vis-group-blocks'
    },
    {
      id: 'events_group',
      content: '<span class="group-label">⚡ Eventos Bíblicos</span>',
      order: 2,
      className: 'vis-group-events'
    },
    {
      id: 'covenants_group',
      content: '<span class="group-label">👑 Pactos & Promesas</span>',
      order: 3,
      className: 'vis-group-covenants'
    }
  ];

  const items = [];

  // 2. Mapear Bloques Narrativos como Rangos (Background / Box)
  narrativeBlocks.forEach(block => {
    // Estimación de rango de años AM para cada bloque narrativo
    let startAM = 0;
    let endAM = 100;

    if (block.id === 'nb_creation') { startAM = 0; endAM = 2; }
    else if (block.id === 'nb_fall') { startAM = 2; endAM = 1056; }
    else if (block.id === 'nb_flood') { startAM = 1056; endAM = 1700; }
    else if (block.id === 'nb_babel') { startAM = 1700; endAM = 1948; }
    else if (block.id === 'nb_abraham') { startAM = 1948; endAM = 2048; }
    else if (block.id === 'nb_isaac') { startAM = 2048; endAM = 2168; }
    else if (block.id === 'nb_jacob') { startAM = 2168; endAM = 2259; }
    else if (block.id === 'nb_joseph') { startAM = 2259; endAM = 2369; }

    items.push({
      id: `block_${block.id}`,
      group: 'blocks_group',
      content: `<div class="vis-block-item"><strong>${block.name}</strong> <span class="chap-badge">Caps. ${block.chapters_range}</span></div>`,
      start: amToDate(startAM),
      end: amToDate(endAM),
      type: 'range',
      className: `vis-item-narrative-block block-${block.id}`,
      title: `${block.name} (Génesis Caps. ${block.chapters_range})`
    });
  });

  // 3. Mapear Eventos Bíblicos en el grupo events_group
  events.forEach(e => {
    const cat = EVENT_CATEGORIES[e.category] || { label: 'Evento', color: '#6366f1', icon: '📌' };
    const amYear = e.year_am ?? 0;
    const refStr = e.scriptural_reference ? `Gén. ${e.scriptural_reference.chapter}:${e.scriptural_reference.verse_start}` : '';

    const contentHtml = `
      <div class="vis-event-card category-${e.category}">
        <span class="event-icon">${cat.icon}</span>
        <span class="event-title">${e.name}</span>
        <span class="event-am-tag">AM ${amYear}</span>
      </div>
    `;

    const tooltipHtml = `
      <div class="vis-tooltip-box">
        <h4>${cat.icon} ${e.name}</h4>
        <p class="tooltip-am"><strong>Año:</strong> AM ${amYear} | <strong>Cita:</strong> ${refStr}</p>
        <p class="tooltip-summary">${e.summary}</p>
        ${e.key_verse ? `<blockquote class="tooltip-verse">"${e.key_verse.text}"</blockquote>` : ''}
      </div>
    `;

    items.push({
      id: e.id,
      group: 'events_group',
      content: contentHtml,
      start: amToDate(amYear),
      type: 'box',
      className: `vis-item-event cat-${e.category}`,
      title: tooltipHtml
    });
  });

  // 4. Mapear Pactos en covenants_group
  covenants.forEach(cov => {
    let covAM = 0;
    if (cov.id === 'edenic_covenant') covAM = 0;
    if (cov.id === 'adamic_covenant') covAM = 2;
    if (cov.id === 'noahic_covenant') covAM = 1657;
    if (cov.id === 'abrahamic_covenant') covAM = 2033;
    if (cov.id === 'circumcision_covenant') covAM = 2047;

    items.push({
      id: `cov_${cov.id}`,
      group: 'covenants_group',
      content: `<div class="vis-covenant-card">👑 <strong>${cov.name}</strong></div>`,
      start: amToDate(covAM),
      type: 'box',
      className: 'vis-item-covenant',
      title: `<strong>${cov.name}</strong>: ${cov.description}`
    });
  });

  return { groups, items };
}
