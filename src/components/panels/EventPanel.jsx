import React from 'react';
import { Modal } from '../common/Modal';
import { EVENT_CATEGORIES } from '../../utils/timelineMapper';
import { formatScriptureRef } from '../../utils/formatters';
import { BibleRefLink } from '../common/BibleRefLink';
import './EventPanel.css';

/**
 * Componente modal/panel de detalle completo para un evento bíblico de Génesis.
 */
export function EventPanel({ event, isOpen, onClose, peopleMap = new Map(), locationsMap = new Map(), onSelectPerson, onSelectLocation }) {
  if (!event) return null;

  const categoryInfo = EVENT_CATEGORIES[event.category] || { label: 'Evento', color: '#6366f1', icon: '📌' };
  const scriptureRef = formatScriptureRef(event.scriptural_reference);

  // Obtener la información completa de las personas participantes
  const keyPeopleObjects = (event.key_people || [])
    .map(id => peopleMap.get(id))
    .filter(Boolean);

  // Obtener la ubicación geográfica asociada
  const locationObj = event.location_id ? locationsMap.get(event.location_id) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="820px">
      <div className="event-panel-detail">
        {/* Cabecera del Evento */}
        <div className="event-detail-header">
          <div className="header-meta-row">
            <span className={`event-cat-badge cat-${event.category}`}>
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            <span className="event-am-year-badge" title={`Año del Mundo ${event.year_am ?? 'N/A'} (Años desde la Creación del Mundo)`}>
              Año del Mundo: AM {event.year_am ?? 'N/A'}
            </span>
            {scriptureRef && (
              <BibleRefLink reference={event.scriptural_reference || scriptureRef} label={scriptureRef} />
            )}
          </div>
          <h2 className="event-detail-title">{event.name}</h2>
        </div>

        {/* Resumen / Narrativa Principal */}
        <div className="event-section">
          <h3 className="section-subtitle">📜 Resumen Narrativo</h3>
          <p className="event-narrative-text">{event.summary}</p>
        </div>

        {/* Pasaje / Versículo Clave Destacado */}
        {event.key_verse && (
          <div className="event-section">
            <h3 className="section-subtitle">💬 Versículo Clave</h3>
            <blockquote className="event-key-verse-box">
              <p className="verse-text">"{event.key_verse.text}"</p>
              <div className="verse-citation-row">
                <cite className="verse-citation">— {event.key_verse.reference}</cite>
                <BibleRefLink reference={event.key_verse.reference} label="Leer Versículo RVR1960" />
              </div>
            </blockquote>
          </div>
        )}

        {/* Referencias Cruzadas del Nuevo Testamento */}
        {event.cross_references_nt && event.cross_references_nt.length > 0 && (
          <div className="event-section">
            <h3 className="section-subtitle">✝️ Cumplimiento & Referencias Cruzadas en el NT ({event.cross_references_nt.length})</h3>
            <div className="cross-refs-grid">
              {event.cross_references_nt.map((refStr, idx) => (
                <BibleRefLink key={idx} reference={refStr} />
              ))}
            </div>
          </div>
        )}

        {/* Enseñanza Teológica */}
        {event.theological_teaching && (
          <div className="event-section theological-box">
            <h3 className="section-subtitle">🏛️ Enseñanza & Significado Teológico</h3>
            <p className="theological-text">{event.theological_teaching}</p>
          </div>
        )}

        {/* Personajes Participantes */}
        {keyPeopleObjects.length > 0 && (
          <div className="event-section">
            <h3 className="section-subtitle">👥 Personajes Presentes ({keyPeopleObjects.length})</h3>
            <div className="people-chips-container">
              {keyPeopleObjects.map(person => (
                <button
                  key={person.id}
                  className="person-chip-btn"
                  onClick={() => {
                    if (onSelectPerson) onSelectPerson(person.id);
                  }}
                  title={`Ver perfil de ${person.name}`}
                >
                  <span className="chip-icon">👤</span>
                  <span className="chip-name">{person.name}</span>
                  {person.category && <span className="chip-cat">({person.category})</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ubicación Geográfica */}
        {locationObj && (
          <div className="event-section">
            <h3 className="section-subtitle">📍 Ubicación Geográfica</h3>
            <div className="location-info-card">
              <div className="loc-card-header">
                <strong>{locationObj.name}</strong> <span className="loc-region">({locationObj.region})</span>
              </div>
              <p className="loc-modern">🌍 <em>Ubicación Moderna:</em> {locationObj.modern_country}</p>
              <p className="loc-desc">{locationObj.description}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
