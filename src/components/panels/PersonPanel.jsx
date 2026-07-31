import { useState, useEffect, useMemo } from 'react';
import { LifespanBar } from '../timeline/LifespanBar';
import { PersonDetailModal } from './PersonDetailModal';
import './Panels.css';

const CATEGORY_LABELS = {
  antediluvian_patriarch: '📜 Antediluvianos',
  postdiluvian_patriarch: '⛺ Postdiluvianos',
  covenant_patriarch: '👑 Patriarcas del Pacto',
  covenant_matriarch: '🌸 Matriarcas',
  tribal_patriarch: '🛡️ Tribus de Israel',
  messianic_line: '✨ Línea Mesiánica',
  savior_figure: '🕊️ Prototipo de Cristo',
  apostle: '✝️ Apóstoles de Cristo',
  ruler: '🏛️ Gobernantes / Reyes',
  prophet: '📜 Profetas & Precursores',
  disciple: '👥 Discípulos & Creyentes',
  family: '👨‍👩‍👧‍👦 Familiares',
  religious_leader: '📜 Líderes Religiosos',
  biblical_figure: '👤 Figuras Bíblicas'
};

/**
 * Componente para el Explorador de Personajes Bíblicos.
 * Incluye gráfico LifespanBar, catálogo de todos los personajes, relaciones familiares directas,
 * filtro por categoría y modal de perfil bíblico completo.
 */
export function PersonPanel({ people = [], peopleMap, eventsMap, targetPersonId, onSelectEvent, bookTitle = 'Génesis' }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activePersonId, setActivePersonId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (targetPersonId) {
      queueMicrotask(() => {
        setActivePersonId(targetPersonId);
        setIsModalOpen(true);
      });
    }
  }, [targetPersonId]);

  const handleOpenPerson = (personId) => {
    setActivePersonId(personId);
    setIsModalOpen(true);
  };

  const availableCategories = useMemo(() => {
    const set = new Set();
    people.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }, [people]);

  const filteredPeople = selectedCategory === 'all'
    ? people
    : people.filter(p => p.category === selectedCategory);

  const activePersonObj = people.find(p => p.id === activePersonId) || (peopleMap ? peopleMap.get(activePersonId) : null);

  return (
    <div className="panel-container">
      {/* Gráfico Visual de Barras de Longevidad Patriarcal */}
      <LifespanBar
        people={people}
        onSelectPerson={handleOpenPerson}
        selectedPersonId={activePersonId}
        bookTitle={bookTitle}
      />

      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>👥 Personajes de {bookTitle} ({filteredPeople.length} de {people.length})</h2>
          <p>Perfiles bíblicos detallados, genealogía y relaciones familiares de todos los patriarcas, matriarcas y figuras históricas.</p>
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
            {availableCategories.map(catKey => (
              <option key={catKey} value={catKey}>
                {CATEGORY_LABELS[catKey] || catKey.charAt(0).toUpperCase() + catKey.slice(1).replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grilla de Tarjetas de Personajes */}
      <div className="people-grid">
        {filteredPeople.map((person) => {
          const lifespanStr = person.chronology?.lifespan ? `${person.chronology.lifespan} años` : 'No especificada';

          const hasBirth = typeof person.chronology?.birth_am === 'number';
          const hasDeath = typeof person.chronology?.death_am === 'number';
          let dateRangeStr = '';
          if (hasBirth && hasDeath) {
            dateRangeStr = `(AM ${person.chronology.birth_am} – AM ${person.chronology.death_am})`;
          } else if (hasBirth) {
            dateRangeStr = `(AM ${person.chronology.birth_am})`;
          }

          const fatherId = person.father || person.family?.father;
          const fatherObj = fatherId && peopleMap ? peopleMap.get(fatherId) : null;
          const spouseId = Array.isArray(person.spouses) ? person.spouses[0] : (person.spouse || person.family?.spouse);
          const spouseObj = spouseId && peopleMap ? peopleMap.get(spouseId) : null;

          return (
            <div key={person.id} className="person-card">
              <div className="person-card-header">
                <h3 className="person-name">{person.name}</h3>
                {person.category && (
                  <span className="person-category-badge">
                    {CATEGORY_LABELS[person.category] || person.category}
                  </span>
                )}
              </div>
              <p className="person-meaning"><em>Significado:</em> {person.name_meaning || 'No especificado'}</p>
              <p className="person-lifespan">
                ⏳ Longevidad: {lifespanStr} {dateRangeStr && <span className="date-range-note">{dateRangeStr}</span>}
              </p>

              {/* Muestra de Relaciones Familiares Clave */}
              {(fatherObj || spouseObj) && (
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {fatherObj && <span>👨 Padre: <strong>{fatherObj.name}</strong></span>}
                  {spouseObj && <span>💍 Esposa: <strong>{spouseObj.name}</strong></span>}
                </div>
              )}

              {person.theological_significance && (
                <p className="person-theology">{person.theological_significance.substring(0, 150)}...</p>
              )}
              <button
                className="person-detail-action-btn"
                onClick={() => handleOpenPerson(person.id)}
              >
                📖 Ver Biografía y Árbol Familiar ➔
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalle Completo de Personaje */}
      {isModalOpen && activePersonObj && (
        <PersonDetailModal
          person={activePersonObj}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          peopleMap={peopleMap}
          eventsMap={eventsMap}
          onSelectEvent={onSelectEvent}
          onSelectPerson={(nextPersonId) => handleOpenPerson(nextPersonId)}
        />
      )}
    </div>
  );
}
