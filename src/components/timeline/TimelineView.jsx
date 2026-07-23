import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data/standalone';
import {
  mapGenesisToVisData,
  amToDate,
  getEventAM,
  getEventSummary,
  getEventRefStr,
  getEventChapter
} from '../../utils/timelineMapper';
import { TimelineControls } from './TimelineControls';
import { EventPanel } from '../panels/EventPanel';
import { Modal } from '../common/Modal';
import './TimelineView.css';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

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
  onSelectEvent,
  onSelectPerson
}) {
  const containerRef = useRef(null);
  const timelineInstanceRef = useRef(null);

  // Entidad activa seleccionada (Evento, Pacto, Bloque o Era)
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de Filtro Avanzado
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlockId, setSelectedBlockId] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [filterText, setFilterText] = useState('');
  const [detailLevel, setDetailLevel] = useState(2); // Default Nivel 2: Limpio & Estructurado

  // Maps para búsqueda $O(1)$ de Pactos, Bloques y Eras
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

  const eventsMap = useMemo(() => {
    const map = new Map();
    events.forEach(e => map.set(e.id, e));
    return map;
  }, [events]);

  // Filtrado multi-criterio de eventos
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // 1. Filtro por Categoría
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;

      // 2. Filtro por Bloque Narrativo
      if (selectedBlockId !== 'all') {
        const block = narrativeBlocks.find(b => b.id === selectedBlockId);
        if (block) {
          const startCh = block.chapters_start ?? 1;
          const endCh = block.chapters_end ?? 50;
          const eventCh = getEventChapter(e);
          if (eventCh && (eventCh < startCh || eventCh > endCh)) return false;
        }
      }

      // 3. Filtro por Capítulo Específico
      if (selectedChapter !== 'all') {
        const targetCh = Number(selectedChapter);
        const eventCh = getEventChapter(e);
        if (eventCh !== targetCh) return false;
      }

      // 4. Filtro por Texto / Palabra clave
      if (filterText && filterText.trim().length > 0) {
        const q = filterText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const name = (e.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const summary = getEventSummary(e).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!name.includes(q) && !summary.includes(q)) return false;
      }

      return true;
    });
  }, [events, selectedCategory, selectedBlockId, selectedChapter, filterText, narrativeBlocks]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Transform data for vis-timeline with Semantic Zoom Level of Detail (LOD)
    const { groups, items } = mapGenesisToVisData(filteredEvents, narrativeBlocks, covenants, eras, detailLevel);

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
        item: 16,
        axis: 24
      },
      orientation: {
        axis: 'top',
        item: 'top'
      },
      min: amToDate(-100),
      max: amToDate(2450),
      // Inicio desfasado a AM -60 para evitar solapamientos con la barra de grupos izquierda
      start: amToDate(-60),
      end: amToDate(2369),
      format: {
        minorLabels: function(date, scale) {
          let yr = 1000;
          if (date) {
            if (date instanceof Date) yr = date.getUTCFullYear();
            else if (typeof date.year === 'function') yr = date.year();
            else if (typeof date.getFullYear === 'function') yr = date.getFullYear();
            else { const d = new Date(date); if (!isNaN(d.getTime())) yr = d.getUTCFullYear(); }
          }
          const am = yr - 1000;
          return am < 0 ? `Antes de AM 0` : `AM ${am}`;
        },
        majorLabels: function(date, scale) {
          let yr = 1000;
          if (date) {
            if (date instanceof Date) yr = date.getUTCFullYear();
            else if (typeof date.year === 'function') yr = date.year();
            else if (typeof date.getFullYear === 'function') yr = date.getFullYear();
            else { const d = new Date(date); if (!isNaN(d.getTime())) yr = d.getUTCFullYear(); }
          }
          const am = yr - 1000;
          return am < 0 ? `Período Inicial` : `Anno Mundi (AM ${am})`;
        }
      },
      template: function (item) {
        return item.content;
      }
    };

    // Inicialización del motor vis-timeline
    const timeline = new Timeline(containerRef.current, visItems, visGroups, options);
    timelineInstanceRef.current = timeline;

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
  }, [filteredEvents, narrativeBlocks, covenants, eras, detailLevel, onSelectEvent, erasMap, blocksMap, covenantsMap, eventsMap]);

  // Funciones de navegación de zoom y salto de ventana Anno Mundi
  const handleZoomIn = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.zoomIn(0.4);
      if (detailLevel < 3) setDetailLevel(3);
    }
  };

  const handleZoomOut = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomOut(0.4);
  };

  const handleFitAll = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(-60), amToDate(2369), { animation: true });
    }
  };

  const handleJumpToAM = (startAM, endAM) => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(startAM), amToDate(endAM), { animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
      setDetailLevel(3);
    }
  };

  return (
    <div className="timeline-view-wrapper">
      {/* Panel Flotante de Controles y Filtros Avanzados */}
      <TimelineControls
        eventsCount={filteredEvents.length}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBlockId={selectedBlockId}
        setSelectedBlockId={setSelectedBlockId}
        selectedChapter={selectedChapter}
        setSelectedChapter={setSelectedChapter}
        filterText={filterText}
        setFilterText={setFilterText}
        detailLevel={detailLevel}
        setDetailLevel={setDetailLevel}
        narrativeBlocks={narrativeBlocks}
        onJumpToAM={handleJumpToAM}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitAll={handleFitAll}
      />

      {/* Contenedor Principal de la Línea de Tiempo vis-timeline */}
      <div className="vis-timeline-mount" ref={containerRef} />

      {/* Previsualizador Rápido Inferior según la entidad seleccionada */}
      {selectedEntity && (
        <div className="selected-event-preview-bar">
          {selectedEntity.type === 'event' && (
            <>
              <div className="preview-header">
                <span className="preview-badge badge-event">⚡ Evento Bíblico</span>
                <h3>{selectedEntity.data.name}</h3>
                <span className="preview-am">AM {getEventAM(selectedEntity.data)} | {getEventRefStr(selectedEntity.data)}</span>
                <button className="preview-detail-btn" onClick={() => setIsModalOpen(true)}>
                  📖 Abrir Modal Exegético ➔
                </button>
                <button className="preview-close-btn" onClick={() => setSelectedEntity(null)}>✕</button>
              </div>
              <p className="preview-summary">{getEventSummary(selectedEntity.data)}</p>
            </>
          )}

          {selectedEntity.type === 'covenant' && (
            <>
              <div className="preview-header">
                <span className="preview-badge badge-covenant">👑 Pacto Divino</span>
                <h3>{selectedEntity.data.name}</h3>
                <span className="preview-am">{selectedEntity.data.scriptural_reference}</span>
                <button className="preview-detail-btn" onClick={() => setIsModalOpen(true)}>
                  👑 Ver Pacto Completo ➔
                </button>
                <button className="preview-close-btn" onClick={() => setSelectedEntity(null)}>✕</button>
              </div>
              <p className="preview-summary">{selectedEntity.data.description}</p>
              {selectedEntity.data.theological_significance && (
                <p className="preview-verse">
                  <strong>Significado Teológico:</strong> {selectedEntity.data.theological_significance}
                </p>
              )}
            </>
          )}

          {selectedEntity.type === 'block' && (
            <>
              <div className="preview-header">
                <span className="preview-badge badge-block">📍 Bloque Narrativo</span>
                <h3>{selectedEntity.data.name}</h3>
                <span className="preview-am">Génesis Caps. {selectedEntity.data.chapters_start}-{selectedEntity.data.chapters_end}</span>
                <button className="preview-detail-btn" onClick={() => setIsModalOpen(true)}>
                  📍 Ver Bloque Completo ➔
                </button>
                <button className="preview-close-btn" onClick={() => setSelectedEntity(null)}>✕</button>
              </div>
              <p className="preview-summary">{selectedEntity.data.summary}</p>
            </>
          )}

          {selectedEntity.type === 'era' && (
            <>
              <div className="preview-header">
                <span className="preview-badge badge-era">🌐 Era Teológica</span>
                <h3>{selectedEntity.data.name} ({selectedEntity.data.subtitle})</h3>
                <span className="preview-am">Caps. {selectedEntity.data.chapters_start}-{selectedEntity.data.chapters_end} | AM {selectedEntity.data.am_start} - {selectedEntity.data.am_end}</span>
                <button className="preview-detail-btn" onClick={() => setIsModalOpen(true)}>
                  🌐 Ver Era Completa ➔
                </button>
                <button className="preview-close-btn" onClick={() => setSelectedEntity(null)}>✕</button>
              </div>
              <p className="preview-summary">{selectedEntity.data.description}</p>
            </>
          )}
        </div>
      )}

      {/* Modal Genérico de Detalle Exegético */}
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
              onSelectPerson={onSelectPerson}
            />
          )}

          {selectedEntity.type === 'covenant' && (
            <div className="entity-modal-content">
              <div className="covenant-modal-badge">Pacto Divino Solemnizado</div>
              <h2 className="entity-modal-title">{selectedEntity.data.name}</h2>
              <p className="entity-modal-ref">📜 Cita Bíblica: {selectedEntity.data.scriptural_reference}</p>
              <div className="entity-modal-section">
                <h3>📖 Descripción del Pacto</h3>
                <p>{selectedEntity.data.description}</p>
              </div>
              {selectedEntity.data.parties && (
                <div className="entity-modal-section">
                  <h3>🤝 Partes Involucradas</h3>
                  <p><strong>Dios:</strong> {selectedEntity.data.parties.divine}</p>
                  <p><strong>Humano / Representante:</strong> {selectedEntity.data.parties.human}</p>
                </div>
              )}
              {selectedEntity.data.theological_significance && (
                <div className="entity-modal-section">
                  <h3>🕊️ Significado Teológico & Redentor</h3>
                  <p>{selectedEntity.data.theological_significance}</p>
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
    </div>
  );
}
