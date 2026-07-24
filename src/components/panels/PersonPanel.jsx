import React, { useState } from 'react';
import { LifespanBar } from '../timeline/LifespanBar';
import { PersonDetailModal } from './PersonDetailModal';
import './Panels.css';

/**
 * Componente para el Explorador de Personajes de Génesis.
 * Incluye gráfico LifespanBar, catálogo de los 33 personajes, filtro por categoría y modal de perfil bíblico completo.
 */
export function PersonPanel({ people = [], peopleMap, eventsMap, onSelectEvent }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activePersonId, setActivePersonId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenPerson = (personId) => {
    setActivePersonId(personId);
    setIsModalOpen(true);
  };

  const filteredPeople = selectedCategory === 'all'
    ? people
    : people.filter(p => p.category === selectedCategory);

  const activePersonObj = people.find(p => p.id === activePersonId);

  return (
    <div className="panel-container">
      {/* Gráfico Visual de Barras de Longevidad Patriarcal */}
      <LifespanBar
        people={people}
        onSelectPerson={handleOpenPerson}
        selectedPersonId={activePersonId}
      />

      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>👥 Personajes del Génesis ({filteredPeople.length} de {people.length})</h2>
          <p>Perfiles bíblicos detallados de todos los patriarcas, matriarcas y figuras históricas documentadas en el texto.</p>
        </div>

        {/* Filtro por Categoría de Personaje */}
        <div className="person-filter-box">
          <label htmlFor="person-cat-select" style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: '0.5rem' }}>Categoría:</label>
          <select
            id="person-cat-select"
            className="toolbar-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">🌐 Todos los Personajes ({people.length})</option>
            <option value="antediluvian_patriarch">📜 Antediluvianos</option>
            <option value="postdiluvian_patriarch">⛺ Postdiluvianos</option>
            <option value="covenant_patriarch">👑 Patriarcas del Pacto</option>
            <option value="covenant_matriarch">🌸 Matriarcas</option>
            <option value="tribal_patriarch">🛡️ Tribus de Israel</option>
            <option value="messianic_line">✨ Línea Mesiánica</option>
            <option value="savior_figure">🕊️ Prototipo de Cristo</option>
          </select>
        </div>
      </div>

      {/* Grilla de Tarjetas de Personajes */}
      <div className="people-grid">
        {filteredPeople.map((person) => {
          const hasBirth = typeof person.chronology?.birth_am === 'number';
          const hasDeath = typeof person.chronology?.death_am === 'number';
          const lifespanStr = person.chronology?.lifespan ? `${person.chronology.lifespan} años` : 'No especificada';

          let dateRangeStr = '';
          if (hasBirth && hasDeath) {
            dateRangeStr = `(AM ${person.chronology.birth_am} – AM ${person.chronology.death_am})`;
          } else if (hasBirth) {
            dateRangeStr = `(Nació AM ${person.chronology.birth_am})`;
          } else {
            dateRangeStr = `(Fechas AM no detalladas en el texto)`;
          }

          return (
            <div key={person.id} className="person-card">
              <div className="person-card-header">
                <h3 className="person-name">{person.name}</h3>
                {person.category && <span className="person-category-badge">{person.category}</span>}
              </div>
              <p className="person-meaning"><em>Significado:</em> {person.name_meaning || 'No especificado'}</p>
              <p className="person-lifespan">
                ⏳ Longevidad: {lifespanStr} <span className="date-range-note">{dateRangeStr}</span>
              </p>
              {person.theological_significance && (
                <p className="person-theology">{person.theological_significance.substring(0, 160)}...</p>
              )}
              <button
                className="person-detail-action-btn"
                onClick={() => handleOpenPerson(person.id)}
              >
                📖 Ver Biografía Completa ➔
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de Perfil Completo del Personaje */}
      <PersonDetailModal
        person={activePersonObj}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        peopleMap={peopleMap}
        eventsMap={eventsMap}
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
}
