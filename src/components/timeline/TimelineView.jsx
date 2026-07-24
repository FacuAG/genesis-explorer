import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import {
  mapGenesisToVisData,
  EVENT_CATEGORIES,
  getEventAM,
  amToDate,
  dateToAM,
  getEventSummary,
  getEventRefStr
} from '../../utils/timelineMapper';
import { Modal } from '../common/Modal';
import { BibleRefLink } from '../common/BibleRefLink';
import { PersonDetailModal } from '../panels/PersonDetailModal';
import './TimelineView.css';

/**
 * Componente interactivo principal de la Línea de Tiempo de Genesis Explorer.
 * Utiliza el motor vis-timeline con renderizado de eje Anno Mundi (AM),
 * apilamiento dinámico anti-superposición, zoom real y selección interactiva de eventos.
 */
export function TimelineView({
  events = [],
  eras = [],
  narrativeBlocks = [],
  covenants = [],
  peopleMap,
  locationsMap,
  targetEventId,
  onSelectEvent,
  onSelectPerson
}) {
  const containerRef = useRef(null);
  const timelineInstanceRef = useRef(null);

  // Entidad activa seleccionada (Evento, Pacto, Bloque o Era)
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPerson, setModalPerson] = useState(null);

  // Estados de Filtro Avanzado
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlockId, setSelectedBlockId] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [filterText, setFilterText] = useState('');
  const [detailLevel, setDetailLevel] = useState(2); // Default Nivel 2: Limpio & Estructurado

  // Estado de Salto Rápido Activo
  const [activeJump, setActiveJump] = useState(null); // { id, startAM, endAM, label }

  const isFilterActive = selectedCategory !== 'all' || selectedBlockId !== 'all' || selectedChapter !== 'all' || filterText.trim().length > 0 || activeJump !== null;
  const activeDetailLevel = isFilterActive ? 3 : detailLevel;

  // Manejador del Salto Rápido con resalte
  const handleJumpToAM = (jumpId, startAM, endAM, label) => {
    setActiveJump({ id: jumpId, startAM, endAM, label });
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(startAM), amToDate(endAM), { animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    }
  };

  // Reset de todos los filtros
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBlockId('all');
    setSelectedChapter('all');
    setFilterText('');
    setActiveJump(null);
    setDetailLevel(2);
  };

  // Mapas auxiliares para búsqueda rápida O(1)
  const eventsMap = useMemo(() => {
    const map = new Map();
    events.forEach(e => map.set(e.id, e));
    return map;
  }, [events]);

  const blocksMap = useMemo(() => {
    const map = new Map();
    narrativeBlocks.forEach(b => map.set(b.id, b));
    return map;
  }, [narrativeBlocks]);

  const covenantsMap = useMemo(() => {
    const map = new Map();
    covenants.forEach(c => map.set(c.id, c));
    return map;
  }, [covenants]);

  const erasMap = useMemo(() => {
    const map = new Map();
    eras.forEach(e => map.set(e.id, e));
    return map;
  }, [eras]);

  // Filtrado reactivo de eventos
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Filtro 1: Categoría
      if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;

      // Filtro 2: Bloque Narrativo
      if (selectedBlockId !== 'all') {
        const block = blocksMap.get(selectedBlockId);
        if (block) {
          const am = getEventAM(evt);
          if (am < block.am_start || am > block.am_end) return false;
        }
      }

      // Filtro 3: Capítulo Bíblico
      if (selectedChapter !== 'all') {
        const chapNum = parseInt(selectedChapter, 10);
        const refChap = evt.scriptural_reference?.chapter || (evt.references && evt.references[0]?.chapter) || evt.chapter_start;
        if (refChap !== chapNum) return false;
      }

      // Filtro 4: Búsqueda por Texto Libre
      if (filterText.trim().length > 0) {
        const q = filterText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const nameMatch = (evt.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q);
        const summaryMatch = getEventSummary(evt).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q);
        const teachingMatch = (evt.theological_teaching || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q);
        if (!nameMatch && !summaryMatch && !teachingMatch) return false;
      }

      // Filtro 5: Salto Rápido Activo
      if (activeJump) {
        const am = getEventAM(evt);
        if (am < activeJump.startAM || am > activeJump.endAM) return false;
      }

      return true;
    });
  }, [events, selectedCategory, selectedBlockId, selectedChapter, filterText, activeJump, blocksMap]);

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
      zoomMin: 1000 * 60 * 60 * 24 * 365.25 * 40, // Límite mínimo de zoom: 40 años (evita repetición de años)
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
            if (onSelectEvent) onSelectEvent(eventObj);
          }
        }
      }
    });

    // Manejador de doble clic para abrir el modal directamente
    timeline.on('doubleClick', function (properties) {
      if (properties.item) {
        setIsModalOpen(true);
      }
    });

    return () => {
      if (timelineInstanceRef.current) {
        timelineInstanceRef.current.destroy();
        timelineInstanceRef.current = null;
      }
    };
  }, [filteredEvents, narrativeBlocks, covenants, eras, activeDetailLevel, isFilterActive, targetEventId, onSelectEvent, erasMap, blocksMap, covenantsMap, eventsMap]);

  // Controles manuales de Zoom y Navegación
  const handleZoomIn = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomIn(0.4);
  };

  const handleZoomOut = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomOut(0.4);
  };

  const handleResetZoom = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(-100), amToDate(2400), {
        animation: { duration: 500, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  const activeEventObj = selectedEntity?.type === 'event' ? selectedEntity.data : null;
  const activeBlockObj = selectedEntity?.type === 'block' ? selectedEntity.data : null;
  const activeCovenantObj = selectedEntity?.type === 'covenant' ? selectedEntity.data : null;

  return (
    <div className="timeline-view-container">
      {/* Barra de Filtros Avanzados y Controles */}
      <div className="timeline-controls-bar">
        <div className="filters-row">
          <div className="filter-group">
            <label>Nivel de Detalle (LOD):</label>
            <div className="lod-buttons">
              <button className={`lod-btn ${detailLevel === 1 ? 'active' : ''}`} onClick={() => setDetailLevel(1)}>1: Hitos</button>
              <button className={`lod-btn ${detailLevel === 2 ? 'active' : ''}`} onClick={() => setDetailLevel(2)}>2: Estructurado</button>
              <button className={`lod-btn ${detailLevel === 3 ? 'active' : ''}`} onClick={() => setDetailLevel(3)}>3: Exhaustivo ({events.length})</button>
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

        {/* Botones de Cámara */}
        <div className="camera-controls-row">
          <button className="cam-btn" onClick={handleZoomIn} title="Acercar Zoom">🔍 +</button>
          <button className="cam-btn" onClick={handleZoomOut} title="Alejar Zoom">🔍 -</button>
          <button className="cam-btn" onClick={handleResetZoom} title="Restablecer Vista Completa">🌐 Restablecer</button>
        </div>
      </div>

      {/* Lienzo del Motor vis-timeline */}
      <div className="timeline-canvas-wrapper">
        <div ref={containerRef} className="vis-timeline-canvas" />
      </div>

      {/* Panel Inferior de Inspección Rápida de Entidad Seleccionada */}
      {selectedEntity && (
        <div className="entity-inspector-panel">
          <div className="inspector-header">
            <span className="inspector-badge">
              {selectedEntity.type === 'event' ? '⚡ EVENTO BÍBLICO' : selectedEntity.type === 'covenant' ? '👑 PACTO DIVINO' : '📍 BLOQUE NARRATIVO'}
            </span>
            <h3>{selectedEntity.data.name}</h3>
            <button className="close-inspector-btn" onClick={() => setSelectedEntity(null)}>✕</button>
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
                    📖 Ver Ficha Completa ➔
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

      {/* Modal de Detalle de Evento */}
      {isModalOpen && activeEventObj && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="780px">
          <div className="event-detail-modal">
            <div className="event-modal-header">
              <span className="event-modal-am">Anno Mundi: AM {getEventAM(activeEventObj)}</span>
              <h2>{activeEventObj.name}</h2>
              <p className="event-modal-ref">📖 Reference: {getEventRefStr(activeEventObj)}</p>
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
