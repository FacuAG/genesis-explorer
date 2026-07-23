import React, { useEffect, useRef, useState } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data/standalone';
import { mapGenesisToVisData, amToDate } from '../../utils/timelineMapper';
import './TimelineView.css';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

/**
 * Componente interactivo principal de la Línea de Tiempo de Genesis Explorer.
 * Utiliza el motor vis-timeline con renderizado de eje Anno Mundi (AM),
 * apilamiento dinámico anti-superposición, zoom real y selección interactiva de eventos.
 */
export function TimelineView({ events, eras, narrativeBlocks, covenants, onSelectEvent }) {
  const containerRef = useRef(null);
  const timelineInstanceRef = useRef(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Filtro activo por categoría de evento
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!containerRef.current) return;

    // Filter events by category if selected
    const filteredEvents = selectedCategory === 'all'
      ? events
      : events.filter(e => e.category === selectedCategory);

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
      // Formateador personalizado para la escala del eje Anno Mundi
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
        // Ignorar selecciones de bloques o pactos en el callback de evento
        if (!itemId.startsWith('block_') && !itemId.startsWith('cov_')) {
          setSelectedEventId(itemId);
          if (onSelectEvent) {
            const eventObj = events.find(e => e.id === itemId);
            onSelectEvent(eventObj || itemId);
          }
        }
      }
    });

    // Cleanup al desmontar el componente o cambiar filtro
    return () => {
      if (timelineInstanceRef.current) {
        timelineInstanceRef.current.destroy();
        timelineInstanceRef.current = null;
      }
    };
  }, [events, narrativeBlocks, covenants, selectedCategory, onSelectEvent]);

  // Funciones de navegación de zoom
  const handleZoomIn = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.zoomIn(0.4);
    }
  };

  const handleZoomOut = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.zoomOut(0.4);
    }
  };

  const handleFitAll = () => {
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setWindow(amToDate(0), amToDate(2369));
    }
  };

  // Evento actualmente seleccionado para la vista rápida inferior
  const currentSelectedObj = events.find(e => e.id === selectedEventId);

  return (
    <div className="timeline-view-wrapper">
      {/* Barra de Controles y Filtros Superior */}
      <div className="timeline-toolbar">
        <div className="toolbar-left">
          <label className="toolbar-label">Filtrar Categoria:</label>
          <select
            className="toolbar-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">🔍 Todas las Categorias ({events.length})</option>
            <option value="creation">✨ Creación</option>
            <option value="covenant">👑 Pacto Divino</option>

            <option value="judgment">🔥 Juicio Divino</option>
            <option value="miracle">⚡ Milagro / Teofanía</option>
            <option value="patriarch">👤 Ciclo Patriarcal</option>
            <option value="restoration">🕊️ Restauración / Gracia</option>

            <option value="exile">🏕️ Migración / Exilio</option>
            <option value="sin">⚠️ Rebelión / Pecado</option>
          </select>
        </div>

        <div className="toolbar-controls">
          <button className="control-btn" onClick={handleZoomIn} title="Acercar Zoom">
            🔍 + Zoom
          </button>
          <button className="control-btn" onClick={handleZoomOut} title="Alejar Zoom">
            🔍 - Zoom
          </button>
          <button className="control-btn control-btn-accent" onClick={handleFitAll} title="Ver Todo Génesis">
            🌌 Ver Todo (AM 0 - 2369)
          </button>
        </div>
      </div>

      {/* Contenedor Principal de la Línea de Tiempo vis-timeline */}
      <div className="vis-timeline-mount" ref={containerRef} />

      {/* Tarjeta de Evento Seleccionado en Vivo (Quick Preview Panel) */}
      {currentSelectedObj && (
        <div className="selected-event-preview-bar">
          <div className="preview-header">
            <span className="preview-badge">Evento Seleccionado</span>
            <h3>{currentSelectedObj.name}</h3>
            <span className="preview-am">Anno Mundi: AM {currentSelectedObj.year_am}</span>
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
    </div>
  );
}
