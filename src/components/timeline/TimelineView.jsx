import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { mapGenesisToVisData, amToDate, dateToAM, getEventAM } from '../../utils/timelineMapper';
import { formatScriptureRef } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { EventPanel } from '../panels/EventPanel';
import { PersonDetailModal } from '../panels/PersonDetailModal';
import './TimelineView.css';

// Diccionario de categorías de eventos bíblicos
const EVENT_CATEGORIES = {
  creation: { label: 'Creación & Orígenes', icon: '🌱' },
  patriarch: { label: 'Patriarcas & Vidas', icon: '👑' },
  covenant: { label: 'Pactos Divinos', icon: '📜' },
  judgment: { label: 'Juicio & Caída', icon: '⚡' },
  miracle: { label: 'Milagros & Teofanías', icon: '✨' },
  exile: { label: 'Exilio & Migración', icon: '⛺' }
};

/**
 * Componente principal de la Línea de Tiempo Cronológica interactiva (Anno Mundi).
 * Módulo unificado sin destrucción de canvas (actualización in-memory con DataSet reactivo)
 * para un rendimiento ultra-fluido sin parpadeos ni reinicios de cámara.
 */
export function TimelineView({
  events = [],
  timelineEvents = [],
  narrativeBlocks = [],
  covenants = [],
  eras = [],
  peopleMap = new Map(),
  locationsMap = new Map(),
  eventsMap: externalEventsMap,
  targetEventId,
  onSelectEvent,
  onSelectPerson
}) {
  const allEvents = useMemo(() => {
    if (Array.isArray(events) && events.length > 0) return events;
    if (Array.isArray(timelineEvents) && timelineEvents.length > 0) return timelineEvents;
    return [];
  }, [events, timelineEvents]);

  const eventsMap = useMemo(() => {
    if (externalEventsMap && externalEventsMap.size > 0) return externalEventsMap;
    const map = new Map();
    (allEvents || []).forEach(e => map.set(e.id, e));
    return map;
  }, [externalEventsMap, allEvents]);
  const containerRef = useRef(null);
  const timelineInstanceRef = useRef(null);

  // DataSets persistentes para actualizar ítems sin destruir vis-timeline
  const visGroupsRef = useRef(new DataSet());
  const visItemsRef = useRef(new DataSet());

  // Estados de Filtros y Nivel de Detalle (LOD)
  const [activeDetailLevel, setActiveDetailLevel] = useState(2); // 1: Hitos, 2: Estructurado, 3: Exhaustivo
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlockId, setSelectedBlockId] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [filterText, setFilterText] = useState('');
  const [activeJump, setActiveJump] = useState(null); // 'adam', 'noah', 'abraham', 'joseph', 'exodus'

  // Estado para la entidad seleccionada en el inspector rápido superior
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Estado para el modal de detalle exegético completo
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

  const QUICK_JUMP_EVENT_IDS = {
    adam: 'creation_adam_eve',
    noah: 'flood_start',
    abraham: 'abraham_call',
    joseph: 'joseph_interprets_pharaoh',
    exodus: 'joseph_reveals_himself'
  };

  // Handler para saltos rápidos a hitos históricos clave en la cronología
  const handleQuickJump = (jumpKey, yearAM) => {
    setActiveJump(jumpKey);

    // Buscar el evento hito correspondiente en el dataset
    const milestoneEventId = QUICK_JUMP_EVENT_IDS[jumpKey];
    let milestoneEvent = milestoneEventId ? eventsMap.get(milestoneEventId) : null;

    // Si no encuentra por ID directo, buscar por coincidencia aproximada de año AM
    if (!milestoneEvent && allEvents.length > 0) {
      milestoneEvent = allEvents.find(e => Math.abs(getEventAM(e) - yearAM) <= 15);
    }

    if (milestoneEvent) {
      setSelectedEntity({ type: 'event', data: milestoneEvent });
      if (onSelectEvent) onSelectEvent(milestoneEvent.id);

      if (timelineInstanceRef.current) {
        try {
          timelineInstanceRef.current.setSelection([milestoneEvent.id]);
        } catch (err) {
          console.warn("No se pudo seleccionar el hito en el canvas:", err);
        }
      }
    }

    if (timelineInstanceRef.current) {
      const startWin = amToDate(Math.max(-300, yearAM - 140));
      const endWin = amToDate(Math.min(2500, yearAM + 140));
      timelineInstanceRef.current.setWindow(startWin, endWin, {
        animation: { duration: 700, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  // Helper para formatear referencias bíblicas
  const formatRef = (ref) => {
    if (!ref) return 'Génesis';
    if (typeof ref === 'string') return ref;
    return formatScriptureRef(ref) || 'Génesis';
  };

  // Filtrado reactivo de eventos según los controles activos
  const filteredEvents = useMemo(() => {
    return allEvents.filter(evt => {
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
        const ref = (evt.scriptural_reference?.display || formatRef(evt.scriptural_reference) || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!name.includes(q) && !summary.includes(q) && !ref.includes(q)) return false;
      }

      return true;
    });
  }, [timelineEvents, selectedCategory, selectedBlockId, selectedChapter, filterText]);

  const isFilterActive = useMemo(() => {
    return selectedCategory !== 'all' || selectedBlockId !== 'all' || selectedChapter !== 'all' || filterText.trim().length > 0 || activeJump !== null;
  }, [selectedCategory, selectedBlockId, selectedChapter, filterText, activeJump]);

  // 1. Inicialización ÚNICA de vis-timeline al montar el componente
  useEffect(() => {
    if (!containerRef.current) return;

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

    const timeline = new Timeline(containerRef.current, visItemsRef.current, visGroupsRef.current, options);
    timelineInstanceRef.current = timeline;

    // Manejador de selección de ítems
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
  }, [eventsMap, blocksMap, covenantsMap, erasMap, onSelectEvent]);

  // 2. Actualización Reactiva de Ítems en memoria SIN destruir el canvas
  useEffect(() => {
    const activeTargetId = targetEventId || (selectedEntity?.type === 'event' ? selectedEntity.data?.id : null);
    const { groups, items } = mapGenesisToVisData(
      filteredEvents,
      narrativeBlocks,
      covenants,
      eras,
      activeDetailLevel,
      isFilterActive,
      activeTargetId
    );

    visGroupsRef.current.clear();
    visGroupsRef.current.add(groups);

    visItemsRef.current.clear();
    visItemsRef.current.add(items);
  }, [filteredEvents, narrativeBlocks, covenants, eras, activeDetailLevel, isFilterActive, targetEventId, selectedEntity]);

  // 3. Auto-enfoque de cámara si hay targetEventId activo
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
  const getEventRefStr = (evt) => evt?.scriptural_reference?.display || formatRef(evt?.scriptural_reference) || (evt?.chapter ? `Génesis ${evt.chapter}` : 'Génesis');

  return (
    <div className="timeline-view-wrapper">
      {/* 1. BARRA DE SALTOS RÁPIDOS A HITOS ANNO MUNDI */}
      <div className="quick-jump-bar">
        <span className="qj-label">🚀 Saltos Rápidos:</span>
        <div className="qj-buttons">
          <button className={`qj-btn ${activeJump === 'adam' ? 'active' : ''}`} onClick={() => handleQuickJump('adam', 0)}>
            🌟 Adán & Creación (AM 0)
          </button>
          <button className={`qj-btn ${activeJump === 'noah' ? 'active' : ''}`} onClick={() => handleQuickJump('noah', 1656)}>
            🌊 Diluvio (AM 1656)
          </button>
          <button className={`qj-btn ${activeJump === 'abraham' ? 'active' : ''}`} onClick={() => handleQuickJump('abraham', 2083)}>
            📜 Llamado de Abram (AM 2083)
          </button>
          <button className={`qj-btn ${activeJump === 'joseph' ? 'active' : ''}`} onClick={() => handleQuickJump('joseph', 2289)}>
            🌾 José en Egipto (AM 2289)
          </button>
          <button className={`qj-btn ${activeJump === 'exodus' ? 'active' : ''}`} onClick={() => handleQuickJump('exodus', 2369)}>
            ⛺ Muerte de José (AM 2369)
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS AVANZADOS DE 5 DIMENSIONES */}
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
            <label>Bloque Narrativo:</label>
            <select value={selectedBlockId} onChange={(e) => setSelectedBlockId(e.target.value)} className="timeline-select">
              <option value="all">Todos los Bloques Narrativos</option>
              {narrativeBlocks.map(b => (
                <option key={b.id} value={b.id}>{b.name} (Caps. {b.chapters_start}-{b.chapters_end})</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Capítulo:</label>
            <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)} className="timeline-select">
              <option value="all">Todos los Capítulos (1-50)</option>
              {Array.from({ length: 50 }, (_, i) => i + 1).map(cNum => (
                <option key={cNum} value={cNum}>Capítulo {cNum}</option>
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

      {/* 3. BANNER DE FILTROS ACTIVOS CON CHIPS DESMONTABLES INDIVIDUALES */}
      {isFilterActive && (
        <div className="active-filter-banner">
          <div className="banner-left-info">
            <span>✨ Filtros Activos ({filteredEvents.length} eventos visibles):</span>
            <div className="active-chips-list">
              {activeJump && (
                <span className="filter-chip chip-jump">
                  🚀 Salto: {activeJump.toUpperCase()}
                  <button className="chip-remove-btn" onClick={() => setActiveJump(null)}>✕</button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="filter-chip chip-category">
                  🏷️ {EVENT_CATEGORIES[selectedCategory]?.label}
                  <button className="chip-remove-btn" onClick={() => setSelectedCategory('all')}>✕</button>
                </span>
              )}
              {selectedBlockId !== 'all' && (
                <span className="filter-chip chip-block">
                  📍 {blocksMap.get(selectedBlockId)?.name}
                  <button className="chip-remove-btn" onClick={() => setSelectedBlockId('all')}>✕</button>
                </span>
              )}
              {selectedChapter !== 'all' && (
                <span className="filter-chip chip-chapter">
                  📖 Cap. {selectedChapter}
                  <button className="chip-remove-btn" onClick={() => setSelectedChapter('all')}>✕</button>
                </span>
              )}
              {filterText.trim().length > 0 && (
                <span className="filter-chip chip-search">
                  🔍 "{filterText}"
                  <button className="chip-remove-btn" onClick={() => setFilterText('')}>✕</button>
                </span>
              )}
            </div>
          </div>
          <button className="reset-filters-btn-sm" onClick={handleResetFilters}>
            Restablecer Todo
          </button>
        </div>
      )}

      {/* 4. PANEL DE EXPLICACIÓN DE ENTIDAD SELECCIONADA (UBICADO ARRIBA DE LA LÍNEA) */}
      {selectedEntity && (
        <div className="entity-inspector-panel top-inspector">
          <div className="inspector-header">
            <span className="inspector-badge">
              {selectedEntity.type === 'event' ? '⚡ EVENTO BÍBLICO' : selectedEntity.type === 'covenant' ? '👑 PACTO DIVINO' : selectedEntity.type === 'block' ? '📍 BLOQUE NARRATIVO' : '🌐 ERA TEOLÓGICA'}
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

                {/* Personajes Vinculados con opción de clic directo a biografía */}
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
                  <span>📖 Capítulos: {activeBlockObj.chapters_range || `${activeBlockObj.chapters_start}-${activeBlockObj.chapters_end}`}</span>
                </div>
                <div className="inspector-actions">
                  <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
                    📍 Ver Bloque Completo ➔
                  </button>
                </div>
              </>
            )}

            {activeCovenantObj && (
              <>
                <p className="inspector-summary">{activeCovenantObj.description}</p>
                <div className="inspector-doctrine-box">
                  <strong>📜 Significado Teológico:</strong> {activeCovenantObj.theological_significance}
                </div>
                <div className="inspector-actions">
                  <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
                    👑 Ver Pacto Completo ➔
                  </button>
                </div>
              </>
            )}

            {selectedEntity.type === 'era' && (
              <>
                <p className="inspector-summary">{selectedEntity.data.description}</p>
                <div className="inspector-meta-row">
                  <span>📖 Capítulos {selectedEntity.data.chapters_start} al {selectedEntity.data.chapters_end}</span>
                  <span>⏳ AM {selectedEntity.data.am_start} al {selectedEntity.data.am_end}</span>
                </div>
                <div className="inspector-actions">
                  <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
                    🌐 Ver Era Completa ➔
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. LIENZO DEL MOTOR VIS-TIMELINE CON CONTROLES DE ZOOM FLOTANTES INTEGRADOS */}
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

      {/* 6. MODAL GENÉRICO DE DETALLE EXEGÉTICO COMPLETO */}
      {isModalOpen && selectedEntity && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            selectedEntity.type === 'event' ? `⚡ ${selectedEntity.data.name}` :
            selectedEntity.type === 'covenant' ? `👑 ${selectedEntity.data.name}` :
            selectedEntity.type === 'block' ? `📍 ${selectedEntity.data.name}` :
            `🌐 ${selectedEntity.data.name}`
          }
        >
          {selectedEntity.type === 'event' && (
            <EventPanel
              event={selectedEntity.data}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              peopleMap={peopleMap}
              locationsMap={locationsMap}
              onSelectPerson={(pId) => {
                const pObj = peopleMap.get(pId);
                if (pObj) setModalPerson(pObj);
              }}
            />
          )}

          {selectedEntity.type === 'covenant' && (
            <div className="entity-modal-content">
              <div className="covenant-modal-badge">Pacto Divino Solemnizado</div>
              <h2 className="entity-modal-title">{selectedEntity.data.name}</h2>
              <p className="entity-modal-ref">📜 Cita Bíblica: {formatRef(selectedEntity.data.scriptural_reference)}</p>
              <div className="entity-modal-section">
                <h3>📖 Descripción del Pacto</h3>
                <p>{selectedEntity.data.description}</p>
              </div>
              {selectedEntity.data.parties && (
                <div className="entity-modal-section">
                  <h3>🤝 Partes Involucradas</h3>
                  <p><strong>Dios:</strong> {selectedEntity.data.parties.god || selectedEntity.data.parties.divine || 'Jehová Dios'}</p>
                  <p><strong>Humano / Representante:</strong> {selectedEntity.data.parties.human_representative || selectedEntity.data.parties.human || 'La Humanidad'}</p>
                </div>
              )}
              {selectedEntity.data.theological_significance && (
                <div className="entity-modal-section">
                  <h3>🕊️ Significado Teológico & Redentor</h3>
                  <p>{selectedEntity.data.theological_significance}</p>
                </div>
              )}
              {selectedEntity.data.fulfillment_in_christ && (
                <div className="entity-modal-section messianic-box">
                  <h3>✝️ Cumplimiento en Jesucristo</h3>
                  <p>{selectedEntity.data.fulfillment_in_christ}</p>
                </div>
              )}
            </div>
          )}

          {selectedEntity.type === 'block' && (
            <div className="entity-modal-content">
              <div className="block-modal-badge">Bloque Narrativo del Génesis</div>
              <h2 className="entity-modal-title">{selectedEntity.data.name}</h2>
              <p className="entity-modal-ref">📖 Capítulos: Génesis {selectedEntity.data.chapters_start} al {selectedEntity.data.chapters_end}</p>
              {selectedEntity.data.toledot_reference && (
                <p className="entity-modal-toledot">
                  ✨ <em>Sección Toledot:</em> "{selectedEntity.data.toledot_text}" ({selectedEntity.data.toledot_reference})
                </p>
              )}
              <div className="entity-modal-section">
                <h3>📜 Resumen Narrativo</h3>
                <p>{selectedEntity.data.summary}</p>
              </div>
              {selectedEntity.data.theological_significance && (
                <div className="entity-modal-section">
                  <h3>🕊️ Enfoque Teológico</h3>
                  <p>{selectedEntity.data.theological_significance}</p>
                </div>
              )}
              {selectedEntity.data.messianic_connection && (
                <div className="entity-modal-section messianic-box">
                  <h3>✝️ Conexión Mesiánica con Jesucristo</h3>
                  <p>{selectedEntity.data.messianic_connection}</p>
                </div>
              )}
            </div>
          )}

          {selectedEntity.type === 'era' && (
            <div className="entity-modal-content">
              <div className="era-modal-badge">Gran Era de la Historia Sagrada</div>
              <h2 className="entity-modal-title">{selectedEntity.data.name} — {selectedEntity.data.subtitle}</h2>
              <p className="entity-modal-ref">📖 Génesis Capítulos {selectedEntity.data.chapters_start} al {selectedEntity.data.chapters_end} | AM {selectedEntity.data.am_start} al {selectedEntity.data.am_end}</p>
              <div className="entity-modal-section">
                <h3>📜 Panorama General de la Era</h3>
                <p>{selectedEntity.data.description}</p>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* 7. MODAL DIRECTO DE PERSONAJE (BIOGRAFÍA & RELACIONES FAMILIARES) */}
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
