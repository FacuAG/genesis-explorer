import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { mapGenesisToVisData, amToDate, dateToAM, getEventAM, getEventChapter } from '../../utils/timelineMapper';
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
  onSelectPerson,
  activeBookId = 'genesis',
  bookTitle = 'Génesis'
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

  // Estado para la entidad seleccionada en el inspector rápido superior
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Estado para el modal de detalle exegético completo
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para el modal directo de personaje
  const [modalPerson, setModalPerson] = useState(null);

  // Estado y Timer para la ayuda de Zoom con Ctrl + Rueda del mouse (Opción 1 UX)
  const [showZoomHint, setShowZoomHint] = useState(false);
  const hintTimerRef = useRef(null);

  // Referencias para detección infalible de Doble Clic (en milisegundos)
  const lastClickTimeRef = useRef(0);
  const lastClickItemIdRef = useRef(null);

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

  // Helper para vincular un evento bíblico a su Bloque Narrativo del Génesis correspondiente
  const getBlockForEvent = (evt) => {
    if (!evt) return null;
    if (evt.block_id && blocksMap.has(evt.block_id)) {
      return blocksMap.get(evt.block_id);
    }
    const evtCh = getEventChapter(evt);
    for (const block of narrativeBlocks) {
      if (typeof block.chapters_start === 'number' && evtCh >= block.chapters_start && evtCh <= (block.chapters_end || 99)) {
        return block;
      }
    }
    return null;
  };

  // Helper para formatear párrafos con espaciado limpio y saltos de línea (enters)
  const renderFormattedParagraphs = (text) => {
    if (!text) return null;
    const paragraphs = text.split(/\n+/).filter(Boolean);
    if (paragraphs.length > 1) {
      return paragraphs.map((p, idx) => (
        <p key={idx} style={{ marginBottom: idx === paragraphs.length - 1 ? 0 : '0.85rem' }}>
          {p.trim()}
        </p>
      ));
    }
    const sentences = text.split(/(?<=\. )\s+/);
    if (sentences.length >= 4) {
      const mid = Math.ceil(sentences.length / 2);
      const p1 = sentences.slice(0, mid).join(' ');
      const p2 = sentences.slice(mid).join(' ');
      return (
        <>
          <p style={{ marginBottom: '0.85rem' }}>{p1.trim()}</p>
          <p>{p2.trim()}</p>
        </>
      );
    }
    return <p>{text}</p>;
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
      // 1. Filtro de Categoría
      if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;

      // 2. Filtro por Bloque Narrativo
      if (selectedBlockId !== 'all') {
        const blockObj = blocksMap.get(selectedBlockId);
        const evtCh = getEventChapter(evt);
        const directMatch = evt.block_id === selectedBlockId ||
          (selectedBlockId === 'nb_noah' && evt.block_id === 'nb_flood') ||
          (selectedBlockId === 'nb_babel_nations' && evt.block_id === 'nb_babel');
        const rangeMatch = blockObj && typeof blockObj.chapters_start === 'number' &&
          evtCh >= blockObj.chapters_start && evtCh <= (blockObj.chapters_end || 99);

        if (!directMatch && !rangeMatch) return false;
      }

      // 3. Filtro por Capítulo
      if (selectedChapter !== 'all') {
        const evtCh = getEventChapter(evt);
        if (Number(evtCh) !== Number(selectedChapter)) return false;
      }

      // 4. Buscador Rápido de Texto
      if (filterText.trim().length > 0) {
        const q = filterText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const name = (evt.name || evt.short_name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const summary = (evt.summary || evt.teaching || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const ref = (evt.scriptural_reference?.display || formatRef(evt.scriptural_reference) || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!name.includes(q) && !summary.includes(q) && !ref.includes(q)) return false;
      }

      return true;
    });
  }, [allEvents, selectedCategory, selectedBlockId, selectedChapter, filterText, blocksMap]);

  const isSearchOrCategoryFilterActive = useMemo(() => {
    return selectedCategory !== 'all' || selectedBlockId !== 'all' || selectedChapter !== 'all' || filterText.trim().length > 0;
  }, [selectedCategory, selectedBlockId, selectedChapter, filterText]);

  const isFilterActive = isSearchOrCategoryFilterActive;

  const { minAM, maxAM } = useMemo(() => {
    let min = 99999;
    let max = -99999;
    allEvents.forEach(e => {
      const am = getEventAM(e);
      if (am < min) min = am;
      if (am > max) max = am;
    });
    narrativeBlocks.forEach(b => {
      if (typeof b.am_start === 'number' && b.am_start < min) min = b.am_start;
      if (typeof b.am_end === 'number' && b.am_end > max) max = b.am_end;
    });
    if (min > max) { min = 0; max = 2500; }
    return { minAM: Math.max(-500, min), maxAM: max };
  }, [allEvents, narrativeBlocks]);

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
      min: amToDate(minAM - 150),
      max: amToDate(maxAM + 150),
      zoomMin: 1000 * 60 * 60 * 24 * 365.25 * 1, // Límite mínimo de zoom: 1 año
      zoomMax: 1000 * 60 * 60 * 24 * 365.25 * 5000,
      start: amToDate(minAM - 20),
      end: amToDate(maxAM + 20),
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

    // Manejador Unificado de Clic y Doble Clic con Detección Infalible de Delta Time
    const handleEntityActivation = (itemId, isDblClick = false) => {
      let targetEntity = null;

      if (itemId.startsWith('era_')) {
        const eraId = itemId.replace('era_', '');
        const eraObj = erasMap.get(eraId);
        if (eraObj) targetEntity = { type: 'era', data: eraObj };
      } else if (itemId.startsWith('block_')) {
        const blockId = itemId.replace('block_', '');
        const blockObj = blocksMap.get(blockId);
        if (blockObj) targetEntity = { type: 'block', data: blockObj };
      } else if (itemId.startsWith('cov_')) {
        const covId = itemId.replace('cov_', '');
        const covObj = covenantsMap.get(covId);
        if (covObj) targetEntity = { type: 'covenant', data: covObj };
      } else {
        const eventObj = eventsMap.get(itemId);
        if (eventObj) {
          targetEntity = { type: 'event', data: eventObj };
          if (onSelectEvent) onSelectEvent(eventObj.id);
        }
      }

      if (!targetEntity) return;

      if (isDblClick) {
        // DOBLE CLIC: Abre el Modal del Bloque Narrativo del Génesis o Entidad directamente
        if (targetEntity.type === 'event') {
          const linkedBlock = getBlockForEvent(targetEntity.data);
          if (linkedBlock) {
            setSelectedEntity({ type: 'block', data: linkedBlock });
          } else {
            setSelectedEntity(targetEntity);
          }
        } else {
          setSelectedEntity(targetEntity);
        }
        setIsModalOpen(true);
      } else {
        // UN SOLO CLIC: Selecciona el ítem y actualiza la vista previa del inspector superior
        setSelectedEntity(targetEntity);
      }
    };

    // 1. Manejador de Selección Clic / Doble Clic por Intervalo de Tiempo
    timeline.on('select', function (properties) {
      if (properties.items && properties.items.length > 0) {
        const itemId = properties.items[0];
        const now = Date.now();
        const delta = now - lastClickTimeRef.current;
        const isFastDblClick = delta < 500 && lastClickItemIdRef.current === itemId;

        lastClickTimeRef.current = now;
        lastClickItemIdRef.current = itemId;

        handleEntityActivation(itemId, isFastDblClick);
      }
    });

    // 2. Manejador de Evento doubleClick de Vis-Timeline
    timeline.on('doubleClick', function (properties) {
      if (properties.item) {
        handleEntityActivation(properties.item, true);
      }
    });

    return () => {
      timeline.destroy();
    };
  }, [eventsMap, blocksMap, covenantsMap, erasMap, onSelectEvent, narrativeBlocks]);

  // Mantener referencia sincronizada para el manejador de Doble Clic DOM nativo
  const selectedEntityRef = useRef(selectedEntity);
  useEffect(() => {
    selectedEntityRef.current = selectedEntity;
  }, [selectedEntity]);

  // Manejador DOM de Doble Clic Nativo (Garantiza respuesta instantánea en 100% de los casos)
  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const handleNativeDblClick = (e) => {
      const itemEl = e.target.closest('.vis-item');
      if (!itemEl) return;

      const current = selectedEntityRef.current;
      if (current) {
        if (current.type === 'event') {
          const linkedBlock = getBlockForEvent(current.data);
          if (linkedBlock) {
            setSelectedEntity({ type: 'block', data: linkedBlock });
          }
        }
        setIsModalOpen(true);
      }
    };

    containerEl.addEventListener('dblclick', handleNativeDblClick);
    return () => {
      containerEl.removeEventListener('dblclick', handleNativeDblClick);
    };
  }, [narrativeBlocks, blocksMap]);

  // Manejador UX Opción 1: Liberar el scroll de la página y requerir Ctrl + Rueda del mouse para hacer Zoom
  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const handleWheelCapture = (e) => {
      // Si el usuario presiona Ctrl o Cmd (en Mac), dejamos que vis-timeline procese el Zoom
      if (e.ctrlKey || e.metaKey) {
        return;
      }

      // Si NO presiona Ctrl: Detener que vis-timeline intercepte el wheel o haga zoom
      e.stopPropagation();

      // Mostrar cartel informativo discreto durante 1.8 segundos
      setShowZoomHint(true);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      hintTimerRef.current = setTimeout(() => {
        setShowZoomHint(false);
      }, 1800);
    };

    // Escuchar wheel en la fase de captura (capture: true)
    containerEl.addEventListener('wheel', handleWheelCapture, { capture: true });

    return () => {
      containerEl.removeEventListener('wheel', handleWheelCapture, { capture: true });
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  // 2. Actualización Reactiva de Ítems en memoria (Solo cuando cambian los eventos o filtros principales)
  useEffect(() => {
    const activeTargetId = targetEventId || (
      selectedEntity ? (
        selectedEntity.type === 'event' ? selectedEntity.data?.id :
        selectedEntity.type === 'block' ? `block_${selectedEntity.data?.id}` :
        selectedEntity.type === 'covenant' ? `cov_${selectedEntity.data?.id}` :
        selectedEntity.type === 'era' ? `era_${selectedEntity.data?.id}` : null
      ) : null
    );

    const { groups, items } = mapGenesisToVisData(
      filteredEvents,
      narrativeBlocks,
      covenants,
      eras,
      activeDetailLevel,
      isSearchOrCategoryFilterActive,
      activeTargetId
    );

    visGroupsRef.current.clear();
    visGroupsRef.current.add(groups);

    visItemsRef.current.clear();
    visItemsRef.current.add(items);
  }, [filteredEvents, narrativeBlocks, covenants, eras, activeDetailLevel, isSearchOrCategoryFilterActive, targetEventId]);

  // Re-ajuste automático de cámara y límites de vis-timeline al alternar de libro
  useEffect(() => {
    if (timelineInstanceRef.current && typeof minAM === 'number' && typeof maxAM === 'number') {
      try {
        timelineInstanceRef.current.setOptions({
          min: amToDate(minAM - 150),
          max: amToDate(maxAM + 150)
        });
        timelineInstanceRef.current.setWindow(
          amToDate(minAM - 20),
          amToDate(maxAM + 20),
          { animation: { duration: 500 } }
        );
      } catch (err) {
        console.warn("Error ajustando ventana de línea de tiempo:", err);
      }
    }
  }, [activeBookId, minAM, maxAM]);

  // 3. Auto-enfoque de cámara si hay targetEventId activo
  useEffect(() => {
    if (!targetEventId || !timelineInstanceRef.current) return;
    const eventObj = eventsMap.get(targetEventId);
    if (!eventObj) return;

    queueMicrotask(() => {
      setSelectedEntity({ type: 'event', data: eventObj });
    });
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

  // 4. Auto-enfoque de cámara al filtrar por Categoría, Bloque, Capítulo o Búsqueda
  useEffect(() => {
    if (!isFilterActive || filteredEvents.length === 0 || !timelineInstanceRef.current) return;
    try {
      const amYears = filteredEvents.map(getEventAM);
      const minAM = Math.min(...amYears);
      const maxAM = Math.max(...amYears);
      const startWin = amToDate(Math.max(-300, minAM - 100));
      const endWin = amToDate(Math.min(2500, maxAM + 100));
      timelineInstanceRef.current.setWindow(startWin, endWin, {
        animation: { duration: 600, easingFunction: 'easeInOutQuad' }
      });
    } catch (err) {
      console.warn("Error enfocando eventos filtrados:", err);
    }
  }, [filteredEvents, isFilterActive]);

  // Controladores de Zoom y Cámara
  const handleZoomIn = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomIn(0.4);
  };

  const handleZoomOut = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomOut(0.4);
  };

  const handleResetAllState = () => {
    setSelectedCategory('all');
    setSelectedBlockId('all');
    setSelectedChapter('all');
    setFilterText('');
    setActiveDetailLevel(2);
    setSelectedEntity(null);
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(-180), amToDate(2369), {
        animation: { duration: 600, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  // Limpiar todos los filtros activos
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBlockId('all');
    setSelectedChapter('all');
    setFilterText('');
  };

  // Extraer datos auxiliares para el inspector
  const activeEventObj = selectedEntity?.type === 'event' ? selectedEntity.data : null;
  const activeBlockObj = selectedEntity?.type === 'block' ? selectedEntity.data : null;
  const activeCovenantObj = selectedEntity?.type === 'covenant' ? selectedEntity.data : null;

  const getEventSummary = (evt) => evt?.summary || evt?.teaching || 'Sin resumen disponible.';
  const getEventRefStr = (evt) => evt?.scriptural_reference?.display || formatRef(evt?.scriptural_reference) || (evt?.chapter ? `${bookTitle} ${evt.chapter}` : bookTitle);

  const chaptersCount = useMemo(() => {
    if (narrativeBlocks.length > 0) {
      return Math.max(...narrativeBlocks.map(b => b.chapters_end || 1));
    }
    return activeBookId === 'matthew' ? 28 : 50;
  }, [narrativeBlocks, activeBookId]);

  return (
    <div className="timeline-view-wrapper">
      {/* BARRA DE FILTROS AVANZADOS DE 5 DIMENSIONES */}
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
                3: Exhaustivo ({allEvents.length})
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
              <option value="all">Todos los Capítulos (1-{chaptersCount})</option>
              {Array.from({ length: chaptersCount }, (_, i) => i + 1).map(cNum => (
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

        {/* Fila de Control de Cámara & Zoom (ARRIBA del lienzo, 100% visible sin tapar nada) */}
        <div className="camera-controls-row">
          <span className="cam-controls-label">🎥 Control de Zoom & Cámara:</span>
          <div className="cam-buttons-group">
            <button className="cam-btn" onClick={handleZoomIn} title="Acercar Cronología (Zoom +)">
              ➕ Acercar
            </button>
            <button className="cam-btn" onClick={handleZoomOut} title="Alejar Cronología (Zoom -)">
              ➖ Alejar
            </button>
            <button className="cam-btn reset-cam-btn" onClick={handleResetAllState} title="Restablecer Estado Inicial">
              🔄 Restablecer
            </button>
          </div>
        </div>
      </div>

      {/* 3. BANNER DE FILTROS ACTIVOS CON CHIPS DESMONTABLES INDIVIDUALES */}
      {isFilterActive && (
        <div className="active-filter-banner">
          <div className="banner-left-info">
            <span>✨ Filtros Activos ({filteredEvents.length} eventos visibles):</span>
            <div className="active-chips-list">
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

                <div className="inspector-actions" style={{ gap: '0.6rem', flexWrap: 'wrap' }}>
                  {getBlockForEvent(activeEventObj) && (
                    <button
                      className="open-modal-btn"
                      style={{ background: 'rgba(59, 130, 246, 0.35)', borderColor: '#60a5fa' }}
                      onClick={() => {
                        const linkedB = getBlockForEvent(activeEventObj);
                        if (linkedB) setSelectedEntity({ type: 'block', data: linkedB });
                        setIsModalOpen(true);
                      }}
                    >
                      📍 Ver Bloque Narrativo ➔
                    </button>
                  )}
                  <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
                    📖 Ver Ficha Exegética ➔
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

      {/* 5. LIENZO DEL MOTOR VIS-TIMELINE */}
      <div className="timeline-canvas-wrapper">
        <div ref={containerRef} className="vis-timeline-canvas" />
        {showZoomHint && (
          <div className="timeline-zoom-hint-pill">
            💡 Mantén <strong>Ctrl + Rueda del mouse</strong> para hacer Zoom en la cronología
          </div>
        )}
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
              <div className="block-modal-badge">Bloque Narrativo de {bookTitle}</div>
              <h2 className="entity-modal-title">{selectedEntity.data.name}</h2>
              <p className="entity-modal-ref">📖 Capítulos: {bookTitle} {selectedEntity.data.chapters_start} al {selectedEntity.data.chapters_end}</p>
              {selectedEntity.data.toledot_reference && (
                <p className="entity-modal-toledot">
                  ✨ <em>Sección Toledot:</em> "{selectedEntity.data.toledot_text}" ({selectedEntity.data.toledot_reference})
                </p>
              )}
              <div className="entity-modal-section">
                <h3>📜 Resumen Narrativo</h3>
                {renderFormattedParagraphs(selectedEntity.data.summary)}
              </div>
              {selectedEntity.data.theological_significance && (
                <div className="entity-modal-section">
                  <h3>🕊️ Enfoque Teológico</h3>
                  {renderFormattedParagraphs(selectedEntity.data.theological_significance)}
                </div>
              )}
              {selectedEntity.data.messianic_connection && (
                <div className="entity-modal-section messianic-box">
                  <h3>✝️ Conexión Mesiánica con Jesucristo</h3>
                  {renderFormattedParagraphs(selectedEntity.data.messianic_connection)}
                </div>
              )}
            </div>
          )}

          {selectedEntity.type === 'era' && (
            <div className="entity-modal-content">
              <div className="era-modal-badge">Gran Era de la Historia Sagrada</div>
              <h2 className="entity-modal-title">{selectedEntity.data.name} — {selectedEntity.data.subtitle}</h2>
              <p className="entity-modal-ref">📖 {bookTitle} Capítulos {selectedEntity.data.chapters_start} al {selectedEntity.data.chapters_end} | AM {selectedEntity.data.am_start} al {selectedEntity.data.am_end}</p>
              <div className="entity-modal-section">
                <h3>📜 Panorama General de la Era</h3>
                {renderFormattedParagraphs(selectedEntity.data.description)}
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
