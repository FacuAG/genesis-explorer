import React from 'react';
import './Panels.css';

/**
 * Componente para el Explorador de Personajes de Génesis.
 */
export function PersonPanel({ people }) {
  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2>👥 Personajes del Génesis ({people.length})</h2>
        <p>Perfiles bíblicos detallados con longevidad Anno Mundi, trazas de personalidad y genealogía.</p>
      </div>

      <div className="people-grid">
        {people.map((person) => (
          <div key={person.id} className="person-card">
            <div className="person-card-header">
              <h3 className="person-name">{person.name}</h3>
              {person.category && <span className="person-category-badge">{person.category}</span>}
            </div>
            <p className="person-meaning"><em>Significado:</em> {person.name_meaning || 'No especificado'}</p>
            {person.chronology && (
              <p className="person-lifespan">
                ⏳ Longevidad: {person.chronology.lifespan ? `${person.chronology.lifespan} años` : 'N/A'} (AM {person.chronology.birth_am ?? '?'} – AM {person.chronology.death_am ?? '?'})
              </p>
            )}
            {person.theological_significance && (
              <p className="person-theology">{person.theological_significance}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
