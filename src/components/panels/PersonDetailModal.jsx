import React from 'react';
import { Modal } from '../common/Modal';
import { formatLifespan } from '../../utils/formatters';
import { BibleRefLink } from '../common/BibleRefLink';
import './PersonDetailModal.css';

/**
 * Componente modal de perfil completo para cualquier personaje bíblico de Génesis.
 * Incluye navegación de relaciones familiares (Padre, Madre, Cónyuge e Hijos).
 */
export function PersonDetailModal({ person, isOpen, onClose, peopleMap = new Map(), eventsMap = new Map(), onSelectEvent, onSelectPerson }) {
  if (!person) return null;

  const birth = person.chronology?.birth_am;
  const death = person.chronology?.death_am;
  const lifespan = person.chronology?.lifespan;
  const lifespanStr = formatLifespan(birth, death, lifespan);

  // Obtener convivencias patriarcales notables
  const overlapsList = person.notable_overlaps || [];

  // Obtener eventos bíblicos asociados
  const eventObjects = (person.event_ids || [])
    .map(id => eventsMap.get(id))
    .filter(Boolean);

  // Normalizar datos de relaciones familiares
  const fatherId = person.father || person.family?.father || person.parents?.father;
  const fatherObj = fatherId ? (peopleMap.get(fatherId) || { name: fatherId }) : null;

  const motherId = person.mother || person.family?.mother || person.parents?.mother;
  const motherObj = motherId ? (peopleMap.get(motherId) || { name: motherId }) : null;

  const spousesList = Array.isArray(person.spouses)
    ? person.spouses
    : (person.spouse ? [person.spouse] : (person.family?.spouse ? [person.family.spouse] : []));

  const childrenList = Array.isArray(person.children)
    ? person.children
    : (person.family?.children || []);

  const genFromAdam = person.generation_from_adam || person.generation || person.chronology?.generation;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="880px">
      <div className="person-detail-modal">
        {/* Cabecera del Personaje */}
        <div className="person-modal-header">
          <div className="header-top-info">
            <span className="person-category-tag">{person.category || 'Personaje'}</span>
            {genFromAdam && (
              <span className="person-gen-tag" title="Generación en la línea lineal desde Adán">
                👑 Gen. #{genFromAdam} desde Adán
              </span>
            )}
            <span className="person-lifespan-tag" title="Años Anno Mundi (Contados desde la Creación del Mundo)">⏳ {lifespanStr}</span>
          </div>
          <h2 className="person-modal-title">{person.name}</h2>
          <p className="person-modal-meaning">
            <strong>Hebreo:</strong> {person.name_origin || person.name} — <em>"{person.name_meaning || 'Sin especificar'}"</em>
          </p>
        </div>

        {/* 👨‍👩‍👧‍👦 Sección de Relaciones Familiares Directas */}
        <div className="person-section family-card-box">
          <h3 className="person-section-subtitle">👨‍👩‍👧‍👦 Relaciones Familiares Directas</h3>
          <div className="family-tree-grid">
            {/* Padre y Madre */}
            <div className="fam-group">
              <span className="fam-label">Padres:</span>
              <div className="fam-chips">
                {fatherObj ? (
                  <button
                    className="fam-chip father-chip"
                    onClick={() => onSelectPerson && fatherObj.id && onSelectPerson(fatherObj.id)}
                  >
                    👨 <strong>Padre:</strong> {fatherObj.name}
                  </button>
                ) : (
                  <span className="fam-none">Padre no documentado</span>
                )}

                {motherObj && (
                  <button
                    className="fam-chip mother-chip"
                    onClick={() => onSelectPerson && motherObj.id && onSelectPerson(motherObj.id)}
                  >
                    👩 <strong>Madre:</strong> {motherObj.name}
                  </button>
                )}
              </div>
            </div>

            {/* Cónyuge(s) */}
            {spousesList.length > 0 && (
              <div className="fam-group">
                <span className="fam-label">Cónyuge(s):</span>
                <div className="fam-chips">
                  {spousesList.map((spId, idx) => {
                    const spObj = typeof spId === 'string' ? (peopleMap.get(spId) || { name: spId, id: spId }) : spId;
                    return (
                      <button
                        key={idx}
                        className="fam-chip spouse-chip"
                        onClick={() => onSelectPerson && spObj.id && onSelectPerson(spObj.id)}
                      >
                        💍 {spObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hijos */}
            {childrenList.length > 0 && (
              <div className="fam-group">
                <span className="fam-label">Descendientes / Hijos ({childrenList.length}):</span>
                <div className="fam-chips">
                  {childrenList.map((chId, idx) => {
                    const chObj = typeof chId === 'string' ? (peopleMap.get(chId) || { name: chId, id: chId }) : chId;
                    return (
                      <button
                        key={idx}
                        className="fam-chip child-chip"
                        onClick={() => onSelectPerson && chObj.id && onSelectPerson(chObj.id)}
                      >
                        👶 {chObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
                const otherPersonId = ov.with_person_id || ov.person2_id || ov.person1_id;
                const otherPerson = peopleMap.get(otherPersonId);
                return (
                  <div key={idx} className="overlap-item-card">
                    <span className="overlap-years">{ov.years_together} Años Compartidos</span>
                    <h4 className="overlap-with">
                      con {otherPerson ? (
                        <button
                          className="overlap-person-btn"
                          onClick={() => onSelectPerson && onSelectPerson(otherPersonId)}
                        >
                          {otherPerson.name}
                        </button>
                      ) : otherPersonId}
                    </h4>
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
                <div
                  key={evt.id}
                  className="person-event-chip"
                  onClick={() => {
                    if (onClose) onClose();
                    if (onSelectEvent) onSelectEvent(evt.id);
                  }}
                >
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
