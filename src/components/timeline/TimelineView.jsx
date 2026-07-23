import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data/standalone';
import { mapGenesisToVisData, amToDate } from '../../utils/timelineMapper';
import { TimelineControls } from './TimelineControls';
import { EventPanel } from '../panels/EventPanel';
import './TimelineView.css';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

/**
 * Componente interactivo principal de la Línea de Tiempo de Genesis Explorer.
 * Utiliza el motor vis-timeline con renderizado de eje Anno Mundi (AM),
 * apilamiento dinámico anti-superposición, zoom real y selección interactiva de eventos.
 */
export function TimelineView({ events = [], eras = [], narrativeBlocks = [], covenants = [], peopleMap, locationsMap, onSelectEvent, onSelectPerson }) {
  const containerRef = useRef(null);
  const timelineInstanceRef = useRef(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de Filtro Avanzado
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlockId, setSelectedBlockId] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [filterText, setFilterText] = useState('');

  // Filtrado multi-criterio de eventos
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // 1. Filtro por Categoría
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;

      // 2. Filtro por Bloque Narrativo
      if (selectedBlockId !== 'all') {
        const block = narrativeBlocks.find(b => b.id === selectedBlockId);
        if (block && block.chapters_range) {
          const [startCh, endCh] = block.chapters_range.split('-').map(Number);
          const eventCh = e.scriptural_reference?.chapter;
          if (eventCh && (eventCh < startCh || eventCh > endCh)) return false;
        }
      }

      // 3. Filtro por Capítulo Específico
      if (selectedChapter !== 'all') {
        const targetCh = Number(selectedChapter);
        if (e.scriptural_reference?.chapter !== targetCh) return false;
      }

      // 4. Filtro por Texto / Palabra clave
      if (filterText && filterText.trim().length > 0) {
        const q = filterText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const name = (e.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const summary = (e.summary || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!name.includes(q) && !summary.includes(q)) return false;
      }

      return true;
    });
  }, [events, selectedCategory, selectedBlockId, selectedChapter, filterText, narrativeBlocks]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Transform data for vis-timeline
    const { groups, items } = mapGenesisToVisData(filteredEvents, narrativeBlocks, covenants);

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
        item: 12,
        axis: 18
      },
      orientation: {
        axis: 'top',
        item: 'top'
      },
      min: amToDate(0),
      max: amToDate(2400),
      start: amToDate(0),
      end: amToDate(2369),
      format: {
        minorLabels: function(date, scale) {
          const am = date.getUTCFullYear() - 1000;
          return `AM ${am}`;
        },
        majorLabels: function(date, scale) {
          const am = date.getUTCFullYear() - 1000;
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

    // Manejador del evento de selección
    timeline.on('select', function (properties) {
      if (properties.items && properties.items.length > 0) {
        const itemId = properties.items[0];
        if (!itemId.startsWith('block_') && !itemId.startsWith('cov_')) {
          setSelectedEventId(itemId);
          if (onSelectEvent) {
            const eventObj = events.find(e => e.id === itemId);
            onSelectEvent(eventObj || itemId);
          }
        }
      }
    });

    // Manejador de doble clic para abrir el modal de detalle directamente
    timeline.on('doubleClick', function (properties) {
      if (properties.item && !properties.item.startsWith('block_') && !properties.item.startsWith('cov_')) {
        setSelectedEventId(properties.item);
        setIsModalOpen(true);
      }
    });

    return () => {
      if (timelineInstanceRef.current) {
        timelineInstanceRef.current.destroy();
        timelineInstanceRef.current = null;
      }
    };
  }, [filteredEvents, narrativeBlocks, covenants, onSelectEvent, events]);

  // Funciones de navegación de zoom y salto de ventana Anno Mundi
  const handleZoomIn = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomIn(0.4);
  };

  const handleZoomOut = () => {
    if (timelineInstanceRef.current) timelineInstanceRef.current.zoomOut(0.4);
  };

  const handleFitAll = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(0), amToDate(2369), { animation: true });
    }
  };

  const handleJumpToAM = (startAM, endAM) => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(startAM), amToDate(endAM), { animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    }
  };

  // Evento actualmente seleccionado para la vista rápida inferior
  const currentSelectedObj = events.find(e => e.id === selectedEventId);

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
        narrativeBlocks={narrativeBlocks}
        onJumpToAM={handleJumpToAM}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitAll={handleFitAll}
      />

      {/* Contenedor Principal de la Línea de Tiempo vis-timeline */}
      <div className="vis-timeline-mount" ref={containerRef} />

      {/* Tarjeta de Evento Seleccionado en Vivo (Quick Preview Panel) */}
      {currentSelectedObj && (
        <div className="selected-event-preview-bar">
          <div className="preview-header">
            <span className="preview-badge">Evento Seleccionado</span>
            <h3>{currentSelectedObj.name}</h3>
            <span className="preview-am">Anno Mundi: AM {currentSelectedObj.year_am}</span>
            <button className="preview-detail-btn" onClick={() => setIsModalOpen(true)}>
              📖 Ver Detalle Exegético ➔
            </button>
            <button className="preview-close-btn" onClick={() => setSelectedEventId(null)}>✕</button>
          </div>
          <p className="preview-summary">{currentSelectedObj.summary}</p>
          {currentSelectedObj.key_verse && (
            <p className="preview-verse">
              "{currentSelectedObj.key_verse.text}" — <strong>{currentSelectedObj.key_verse.reference}</strong>
            </p>
          )}
        </div>
      )}

      {/* Modal de Detalle Completo del Evento */}
      <EventPanel
        event={currentSelectedObj}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        peopleMap={peopleMap}
        locationsMap={locationsMap}
        onSelectPerson={onSelectPerson}
      />
    </div>
  );
}

