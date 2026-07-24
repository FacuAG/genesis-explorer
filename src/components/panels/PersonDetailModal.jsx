import React from 'react';
import { Modal } from '../common/Modal';
import { formatLifespan } from '../../utils/formatters';
import { BibleRefLink } from '../common/BibleRefLink';
import './PersonDetailModal.css';

/**
 * Componente modal de perfil completo para cualquier personaje bíblico de Génesis.
 */
export function PersonDetailModal({ person, isOpen, onClose, peopleMap = new Map(), eventsMap = new Map(), onSelectEvent }) {
  if (!person) return null;

  const birth = person.chronology?.birth_am;
  const death = person.chronology?.death_am;
  const lifespan = person.chronology?.lifespan;
  const lifespanStr = formatLifespan(birth, death, lifespan);

  // Obtener la información de convivencias patriarcales notables
  const overlapsList = person.notable_overlaps || [];

  // Obtener la lista de eventos bíblicos asociados
  const eventObjects = (person.event_ids || [])
    .map(id => eventsMap.get(id))
    .filter(Boolean);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="880px">
      <div className="person-detail-modal">
        {/* Cabecera del Personaje */}
        <div className="person-modal-header">
          <div className="header-top-info">
            <span className="person-category-tag">{person.category || 'Personaje'}</span>
            <span className="person-lifespan-tag" title="Años Anno Mundi (Contados desde la Creación del Mundo)">⏳ {lifespanStr}</span>
          </div>
          <h2 className="person-modal-title">{person.name}</h2>
          <p className="person-modal-meaning">
            <strong>Hebreo:</strong> {person.name_origin || person.name} — <em>"{person.name_meaning || 'Sin especificar'}"</em>
          </p>
        </div>

        {/* Biografía Completa */}
        {person.biography && (
          <div className="person-section">
            <h3 className="person-section-subtitle">📜 Biografía & Historia Bíblica</h3>
            <div className="biography-content">
              {typeof person.biography === 'object' ? (
                <>
                  {person.biography.early_life && <p><strong>Vida Temprana:</strong> {person.biography.early_life}</p>}
                  {person.biography.key_moments && <p><strong>Momentos Clave:</strong> {person.biography.key_moments}</p>}
                  {person.biography.later_years && <p><strong>Años Finales y Legado:</strong> {person.biography.later_years}</p>}
                </>
              ) : (
                <p>{person.biography}</p>
              )}
            </div>
          </div>
        )}

        {/* Arco de Personaje y Carácter */}
        {person.character_arc && (
          <div className="person-section">
            <h3 className="person-section-subtitle">🌟 Arco Narrativo y Carácter</h3>
            <p className="section-text">{person.character_arc}</p>
          </div>
        )}

        {/* Trazas de Personalidad */}
        {person.personality_traits && person.personality_traits.length > 0 && (
          <div className="person-section">
            <h3 className="person-section-subtitle">💎 Rasgos de Personalidad</h3>
            <div className="traits-badges-container">
              {person.personality_traits.map((trait, idx) => (
                <span key={idx} className="trait-badge">✦ {trait}</span>
              ))}
            </div>
          </div>
        )}

        {/* Significancia Teológica */}
        {person.theological_significance && (
          <div className="person-section theology-card">
            <h3 className="person-section-subtitle">🏛️ Significancia Teológica</h3>
            <p className="theology-text">{person.theological_significance}</p>
          </div>
        )}

        {/* Versículo Clave */}
        {person.key_verse && (
          <div className="person-section">
            <h3 className="person-section-subtitle">💬 Versículo Clave</h3>
            <blockquote className="person-key-verse">
              <p>"{person.key_verse.text}"</p>
              <div className="verse-citation-row">
                <cite>— {person.key_verse.reference}</cite>
                <BibleRefLink reference={person.key_verse.reference} label="Leer Versículo RVR1960" />
              </div>
            </blockquote>
          </div>
        )}

        {/* Referencias al Nuevo Testamento */}
        {person.cross_references_nt && person.cross_references_nt.length > 0 && (
          <div className="person-section">
            <h3 className="person-section-subtitle">✝ Conexión con el Nuevo Testamento ({person.cross_references_nt.length})</h3>
            <div className="nt-refs-list">
              {person.cross_references_nt.map((refStr, idx) => (
                <BibleRefLink key={idx} reference={refStr} />
              ))}
            </div>
          </div>
        )}

        {/* Convivencias Patriarcales Notables */}
        {overlapsList.length > 0 && (
          <div className="person-section">
            <h3 className="person-section-subtitle">🤝 Convivencia Contemporánea con otros Patriarcas</h3>
            <div className="overlaps-grid">
              {overlapsList.map((ov, idx) => {
                const otherPerson = peopleMap.get(ov.with_person_id || ov.person2_id || ov.person1_id);
                return (
                  <div key={idx} className="overlap-item-card">
                    <span className="overlap-years">{ov.years_together} Años Compartidos</span>
                    <h4 className="overlap-with">con {otherPerson ? otherPerson.name : ov.with_person_id}</h4>
                    <p className="overlap-note">{ov.note || ov.historical_note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Eventos Bíblicos Participantes */}
        {eventObjects.length > 0 && (
          <div className="person-section">
            <h3 className="person-section-subtitle">⚡ Eventos Bíblicos donde Participa ({eventObjects.length})</h3>
            <div className="person-events-grid">
              {eventObjects.map(evt => (
                <div key={evt.id} className="person-event-chip" onClick={() => { if (onSelectEvent) onSelectEvent(evt.id); }}>
                  <span className="pe-am" title={`Año del Mundo ${evt.year_am ?? 'N/A'}`}>AM {evt.year_am ?? 'N/A'}</span>
                  <span className="pe-title">{evt.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
