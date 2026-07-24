import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { mapGenesisToVisData, amToDate, dateToAM, getEventAM } from '../../data/timeline/timelineMapper';
import { Modal } from '../common/Modal';
import { BibleRefLink } from '../common/BibleRefLink';
import { PersonDetailModal } from '../panels/PersonDetailModal';
import './TimelineView.css';

// Diccionario de categorías de eventos
const EVENT_CATEGORIES = {
  creation: { label: 'Creación & Orígenes', icon: '🌱' },
  patriarch: { label: 'Patriarcas & Vidas', icon: '👑' },
  covenant: { label: 'Pactos Divinos', icon: '📜' },
  judgment: { label: 'Juicio & Caída', icon: '⚡' },
  miracle: { label: 'Milagros & Teofanías', icon: '✨' },
  exile: { label: 'Exilio & Migración', icon: '⛺' }
};

/**
 * Componente principal de la Línea de Tiempo Cronológica interactiva (Anno Mundi)
 * impulsada por el motor gráfico vis-timeline.
 */
export function TimelineView({
  timelineEvents = [],
  narrativeBlocks = [],
  covenants = [],
  eras = [],
  peopleMap = new Map(),
  locationsMap = new Map(),
  eventsMap = new Map(),
  targetEventId,
  onSelectEvent,
  onSelectPerson
}) {
  const containerRef = useRef(null);
  const timelineInstanceRef = useRef(null);

  // Estados de Filtros y Nivel de Detalle (LOD)
  const [activeDetailLevel, setActiveDetailLevel] = useState(2); // 1: Hitos, 2: Estructurado, 3: Exhaustivo
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlockId, setSelectedBlockId] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [filterText, setFilterText] = useState('');
  const [activeJump, setActiveJump] = useState(null); // 'adam', 'noah', 'abraham', 'joseph', 'exodus'

  // Estado para la entidad seleccionada en el inspector rápido superior
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Estado para el modal de detalle completo de evento
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para el modal directo de personaje
  const [modalPerson, setModalPerson] = useState(null);

  // Mapeos rápidos para recuperación de entidades por ID
  const covenantsMap = useMemo(() => {
    const map = new Map();
    covenants.forEach(c => map.set(c.id, c));
    return map;
  }, [covenants]);

  const blocksMap = useMemo(() => {
    const map = new Map();
    narrativeBlocks.forEach(b => map.set(b.id, b));
    return map;
  }, [narrativeBlocks]);

  const erasMap = useMemo(() => {
    const map = new Map();
    eras.forEach(e => map.set(e.id, e));
    return map;
  }, [eras]);

  // Filtrado reactivo de eventos según los controles activos
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter(evt => {
      // Filtro de Categoría
      if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;

      // Filtro por Bloque Narrativo
      if (selectedBlockId !== 'all' && evt.block_id !== selectedBlockId) return false;

      // Filtro por Capítulo
      if (selectedChapter !== 'all' && Number(evt.chapter) !== Number(selectedChapter)) return false;

      // Buscador Rápido de Texto
      if (filterText.trim().length > 0) {
        const q = filterText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const name = (evt.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const summary = (evt.summary || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const ref = (evt.scriptural_reference?.display || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!name.includes(q) && !summary.includes(q) && !ref.includes(q)) return false;
      }

      return true;
    });
  }, [timelineEvents, selectedCategory, selectedBlockId, selectedChapter, filterText]);

  const isFilterActive = useMemo(() => {
    return selectedCategory !== 'all' || selectedBlockId !== 'all' || selectedChapter !== 'all' || filterText.trim().length > 0 || activeJump !== null;
  }, [selectedCategory, selectedBlockId, selectedChapter, filterText, activeJump]);

  // Auto-enfoque de cámara y destello de ítem cuando se selecciona un targetEventId desde cualquier panel
  useEffect(() => {
    if (!targetEventId || !timelineInstanceRef.current) return;
    const eventObj = eventsMap.get(targetEventId);
    if (!eventObj) return;

    setSelectedEntity({ type: 'event', data: eventObj });
    try {
      const yearAM = getEventAM(eventObj);
      const startWin = amToDate(Math.max(-200, yearAM - 150));
      const endWin = amToDate(Math.min(2500, yearAM + 150));

      timelineInstanceRef.current.setSelection([targetEventId]);
      timelineInstanceRef.current.setWindow(startWin, endWin, {
        animation: { duration: 600, easingFunction: 'easeInOutQuad' }
      });
    } catch (err) {
      console.warn("No se pudo seleccionar la entidad en el canvas de timeline:", err);
    }
  }, [targetEventId, eventsMap]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Transformar datos para vis-timeline asegurando targetEventId
    const { groups, items } = mapGenesisToVisData(
      filteredEvents,
      narrativeBlocks,
      covenants,
      eras,
      activeDetailLevel,
      isFilterActive,
      targetEventId
    );

    const visGroups = new DataSet(groups);
    const visItems = new DataSet(items);

    // Opciones avanzadas del motor vis-timeline
    const options = {
      stack: true,
      zoomable: true,
      moveable: true,
      selectable: true,
      showCurrentTime: false,
      margin: {
        item: 18,
        axis: 26
      },
      orientation: {
        axis: 'top',
        item: 'top'
      },
      min: amToDate(-300),
      max: amToDate(2500),
      zoomMin: 1000 * 60 * 60 * 24 * 365.25 * 40, // Límite mínimo de zoom: 40 años
      zoomMax: 1000 * 60 * 60 * 24 * 365.25 * 3000,
      start: amToDate(-180),
      end: amToDate(2369),
      format: {
        minorLabels: function (date) {
          const am = dateToAM(date);
          return `AM ${am}`;
        },
        majorLabels: function (date) {
          const am = dateToAM(date);
          return `Anno Mundi (AM ${am})`;
        }
      },
      template: function (item) {
        return item.content;
      }
    };

    // Inicialización del motor vis-timeline
    const timeline = new Timeline(containerRef.current, visItems, visGroups, options);
    timelineInstanceRef.current = timeline;

    // Enfoque automático inicial si hay targetEventId activo (Ventana panorámica de 300 años)
    if (targetEventId) {
      const eventObj = eventsMap.get(targetEventId);
      if (eventObj) {
        const yearAM = getEventAM(eventObj);
        const startWin = amToDate(Math.max(-200, yearAM - 150));
        const endWin = amToDate(Math.min(2500, yearAM + 150));
        setTimeout(() => {
          try {
            timeline.setSelection([targetEventId]);
            timeline.setWindow(startWin, endWin, {
              animation: { duration: 600, easingFunction: 'easeInOutQuad' }
            });
          } catch (err) {
            console.warn("Error en setWindow de targetEventId:", err);
          }
        }, 120);
      }
    }

    // Manejador del evento de selección (clic en cualquier ítem)
    timeline.on('select', function (properties) {
      if (properties.items && properties.items.length > 0) {
        const itemId = properties.items[0];

        if (itemId.startsWith('era_')) {
          const eraId = itemId.replace('era_', '');
          const eraObj = erasMap.get(eraId);
          if (eraObj) setSelectedEntity({ type: 'era', data: eraObj });
        } else if (itemId.startsWith('block_')) {
          const blockId = itemId.replace('block_', '');
          const blockObj = blocksMap.get(blockId);
          if (blockObj) setSelectedEntity({ type: 'block', data: blockObj });
        } else if (itemId.startsWith('cov_')) {
          const covId = itemId.replace('cov_', '');
          const covObj = covenantsMap.get(covId);
          if (covObj) setSelectedEntity({ type: 'covenant', data: covObj });
        } else {
          const eventObj = eventsMap.get(itemId);
          if (eventObj) {
            setSelectedEntity({ type: 'event', data: eventObj });
            if (onSelectEvent) onSelectEvent(eventObj.id);
          }
        }
      }
    });

    return () => {
      timeline.destroy();
    };
  }, [filteredEvents, narrativeBlocks, covenants, eras, activeDetailLevel, isFilterActive, targetEventId, eventsMap, blocksMap, covenantsMap, erasMap, onSelectEvent]);

  // Controladores de Zoom y Cámara
  const handleZoomIn = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomIn(0.4);
  };

  const handleZoomOut = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomOut(0.4);
  };

  const handleResetZoom = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(-180), amToDate(2369), {
        animation: { duration: 600, easingFunction: 'easeInOutQuad' }
      });
      setSelectedEntity(null);
    }
  };

  // Limpiar todos los filtros activos
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBlockId('all');
    setSelectedChapter('all');
    setFilterText('');
    setActiveJump(null);
  };

  // Extraer datos auxiliares para el inspector
  const activeEventObj = selectedEntity?.type === 'event' ? selectedEntity.data : null;
  const activeBlockObj = selectedEntity?.type === 'block' ? selectedEntity.data : null;
  const activeCovenantObj = selectedEntity?.type === 'covenant' ? selectedEntity.data : null;

  const getEventSummary = (evt) => evt?.summary || evt?.teaching || 'Sin resumen disponible.';
  const getEventRefStr = (evt) => evt?.scriptural_reference?.display || (evt?.chapter ? `Génesis ${evt.chapter}` : 'Génesis');

  return (
    <div className="timeline-view-wrapper">
      {/* Barra de Filtros Avanzados y Controles */}
      <div className="timeline-controls-bar">
        <div className="filters-row">
          <div className="filter-group">
            <label>Nivel de Detalle (LOD):</label>
            <div className="lod-buttons">
              <button className={`lod-btn ${activeDetailLevel === 1 ? 'active' : ''}`} onClick={() => setActiveDetailLevel(1)}>
                1: Hitos
              </button>
              <button className={`lod-btn ${activeDetailLevel === 2 ? 'active' : ''}`} onClick={() => setActiveDetailLevel(2)}>
                2: Estructurado
              </button>
              <button className={`lod-btn ${activeDetailLevel === 3 ? 'active' : ''}`} onClick={() => setActiveDetailLevel(3)}>
                3: Exhaustivo ({timelineEvents.length})
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Categoría:</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="timeline-select">
              <option value="all">Todas las Categorías</option>
              {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Buscador Rápido:</label>
            <input
              type="text"
              placeholder="Buscar evento (ej. Abram, Diluvio)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="timeline-search-input"
            />
          </div>

          {isFilterActive && (
            <button className="reset-filters-btn" onClick={handleResetFilters}>
              🔄 Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* PANEL DE EXPLICACIÓN DEL EVENTO SELECCIONADO (AHORA UBICADO ARRIBA DE LA LÍNEA DE TIEMPO) */}
      {selectedEntity && (
        <div className="entity-inspector-panel top-inspector">
          <div className="inspector-header">
            <span className="inspector-badge">
              {selectedEntity.type === 'event' ? '⚡ EVENTO BÍBLICO' : selectedEntity.type === 'covenant' ? '👑 PACTO DIVINO' : '📍 BLOQUE NARRATIVO'}
            </span>
            <h3>{selectedEntity.data.name}</h3>
            <button className="close-inspector-btn" onClick={() => setSelectedEntity(null)}>✕ Cerrar Explicación</button>
          </div>

          <div className="inspector-body">
            {activeEventObj && (
              <>
                <div className="inspector-meta-row">
                  <span className="inspector-am-tag">⏳ Anno Mundi: AM {getEventAM(activeEventObj)}</span>
                  <span className="inspector-ref-tag">📖 {getEventRefStr(activeEventObj)}</span>
                  <span className="inspector-cat-tag">
                    {EVENT_CATEGORIES[activeEventObj.category]?.icon} {EVENT_CATEGORIES[activeEventObj.category]?.label}
                  </span>
                </div>
                <p className="inspector-summary">{getEventSummary(activeEventObj)}</p>

                {activeEventObj.theological_teaching && (
                  <div className="inspector-doctrine-box">
                    <strong>🏛️ Enfoque Exegético:</strong> {activeEventObj.theological_teaching}
                  </div>
                )}

                {/* Personajes Vinculados */}
                {activeEventObj.key_people && activeEventObj.key_people.length > 0 && (
                  <div className="inspector-people-row">
                    <strong>👥 Personajes:</strong>
                    {activeEventObj.key_people.map(pId => {
                      const pObj = peopleMap?.get(pId);
                      return (
                        <button
                          key={pId}
                          className="inspector-person-chip"
                          onClick={() => {
                            if (pObj) setModalPerson(pObj);
                          }}
                        >
                          👤 {pObj ? pObj.name : pId}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="inspector-actions">
                  <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
                    📖 Ver Ficha Exegética Completa ➔
                  </button>
                </div>
              </>
            )}

            {activeBlockObj && (
              <>
                <p className="inspector-summary">{activeBlockObj.summary}</p>
                <div className="inspector-meta-row">
                  <span>⏳ Duración AM: AM {activeBlockObj.am_start} - AM {activeBlockObj.am_end}</span>
                  <span>📖 Capítulos: {activeBlockObj.chapters_range}</span>
                </div>
              </>
            )}

            {activeCovenantObj && (
              <>
                <p className="inspector-summary">{activeCovenantObj.description}</p>
                <div className="inspector-doctrine-box">
                  <strong>📜 Significado Teológico:</strong> {activeCovenantObj.theological_significance}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* LIENZO DEL MOTOR VIS-TIMELINE CON CONTROLES DE ZOOM FLOTANTES INTEGRADOS */}
      <div className="timeline-canvas-wrapper" style={{ position: 'relative' }}>
        {/* BOTONES DE ZOOM FLOTANTES INTEGRADOS DIRECTAMENTE EN EL LIENZO */}
        <div className="floating-timeline-zoom-controls">
          <button className="ft-zoom-btn" onClick={handleZoomIn} title="Acercar Cronología (Zoom +)">
            ➕ <span className="ft-btn-text">Acercar</span>
          </button>
          <button className="ft-zoom-btn" onClick={handleZoomOut} title="Alejar Cronología (Zoom -)">
            ➖ <span className="ft-btn-text">Alejar</span>
          </button>
          <button className="ft-zoom-btn ft-reset-btn" onClick={handleResetZoom} title="Restablecer Panorama Completo">
            🌐 <span className="ft-btn-text">Panorama Completo</span>
          </button>
        </div>

        <div ref={containerRef} className="vis-timeline-canvas" />
      </div>

      {/* Modal de Detalle de Evento */}
      {isModalOpen && activeEventObj && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="780px">
          <div className="event-detail-modal">
            <div className="event-modal-header">
              <span className="event-modal-am">Anno Mundi: AM {getEventAM(activeEventObj)}</span>
              <h2>{activeEventObj.name}</h2>
              <p className="event-modal-ref">📖 Referencia: {getEventRefStr(activeEventObj)}</p>
            </div>

            <div className="event-modal-body">
              <div className="em-section">
                <h3>📜 Narrativa Bíblica</h3>
                <p>{getEventSummary(activeEventObj)}</p>
              </div>

              {activeEventObj.theological_teaching && (
                <div className="em-section em-doctrine-card">
                  <h3>🏛️ Enseñanza Teológica Evangélica</h3>
                  <p>{activeEventObj.theological_teaching}</p>
                </div>
              )}

              {activeEventObj.scriptural_verse && (
                <div className="em-section em-verse-box">
                  <h3>💬 Texto de la Escritura</h3>
                  <blockquote>
                    <p>"{activeEventObj.scriptural_verse.text}"</p>
                    <cite>— {activeEventObj.scriptural_verse.reference}</cite>
                  </blockquote>
                  <BibleRefLink reference={activeEventObj.scriptural_verse.reference} label="Abrir Versículo Completo RVR1960" />
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Directo de Personaje */}
      {modalPerson && (
        <PersonDetailModal
          person={modalPerson}
          isOpen={Boolean(modalPerson)}
          onClose={() => setModalPerson(null)}
          peopleMap={peopleMap}
          eventsMap={eventsMap}
          onSelectPerson={(nextPersonId) => {
            const nextP = peopleMap.get(nextPersonId);
            if (nextP) setModalPerson(nextP);
          }}
        />
      )}
    </div>
  );
}
