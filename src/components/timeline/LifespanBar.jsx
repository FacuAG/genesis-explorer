import React from 'react';
import './LifespanBar.css';

/**
 * Componente de visualización gráfica de Barras de Longevidad Patriarcal (LifespanBar)
 * Mapea visualmente la vida de los patriarcas desde Adán (AM 0) hasta José (AM 2369)
 * en un eje horizontal unificado de Anno Mundi (AM), e incluye sección para todos
 * los personajes con fechas no especificadas.
 */
export function LifespanBar({ people = [], onSelectPerson, selectedPersonId }) {
  // Personas con fechas cronológicas exactas
  const patriarchsWithDates = people
    .filter(p => p.chronology && typeof p.chronology.birth_am === 'number' && typeof p.chronology.death_am === 'number')
    .sort((a, b) => a.chronology.birth_am - b.chronology.birth_am);

  // Personas sin rango completo de fechas numéricas
  const peopleWithoutDates = people
    .filter(p => !(p.chronology && typeof p.chronology.birth_am === 'number' && typeof p.chronology.death_am === 'number'));

  const minAM = 0;
  const maxAM = 2369;
  const totalSpan = maxAM - minAM;

  return (
    <div className="lifespan-container">
      <div className="lifespan-header">
        <h3>📊 Longevidad y Cronología de Personajes ({people.length} Personajes Registrados)</h3>
        <p>Gráfico de barras Anno Mundi (AM) para patriarcas con longevidad detallada y catálogo de figuras del texto.</p>
      </div>

      {/* Escala Superior de Años AM */}
      <div className="lifespan-axis">
        <span style={{ left: '0%' }}>AM 0 (Creación)</span>
        <span style={{ left: '20%' }}>AM 500</span>
        <span style={{ left: '42%' }}>AM 1000</span>
        <span style={{ left: '65%' }}>AM 1558 (Sem)</span>
        <span style={{ left: '82%' }}>AM 1948 (Abraham)</span>
        <span style={{ left: '100%' }}>AM 2369 (José)</span>
      </div>

      {/* Lista de Barras de Vida Patriarcal */}
      <div className="lifespan-bars-list">
        {patriarchsWithDates.map(person => {
          const birth = person.chronology.birth_am;
          const death = person.chronology.death_am;
          const lifespan = person.chronology.lifespan || (death - birth);

          const leftPercent = Math.max(0, Math.min(100, ((birth - minAM) / totalSpan) * 100));
          const widthPercent = Math.max(1, Math.min(100 - leftPercent, ((death - birth) / totalSpan) * 100));

          const isSelected = person.id === selectedPersonId;

          return (
            <div
              key={person.id}
              className={`lifespan-row ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (onSelectPerson) onSelectPerson(person.id);
              }}
              title={`${person.name}: AM ${birth} – AM ${death} (${lifespan} años)`}
            >
              <div className="lifespan-person-info">
                <span className="person-bar-name">{person.name}</span>
                <span className="person-bar-age">{lifespan}a</span>
              </div>

              <div className="lifespan-track">
                <div
                  className={`lifespan-bar-fill category-${person.category || 'default'}`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`
                  }}
                >
                  <span className="bar-label-inside">
                    {person.name} (AM {birth}-{death})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección de Personajes con Fechas No Detalladas en el Texto */}
      {peopleWithoutDates.length > 0 && (
        <div className="undated-people-section">
          <h4>📋 Personajes e Históricos con Fechas de Nacimiento/Muerte no detalladas en Génesis ({peopleWithoutDates.length}):</h4>
          <div className="undated-chips-grid">
            {peopleWithoutDates.map(person => (
              <button
                key={person.id}
                className={`undated-person-chip ${person.id === selectedPersonId ? 'active' : ''}`}
                onClick={() => {
                  if (onSelectPerson) onSelectPerson(person.id);
                }}
                title={`Ver perfil completo de ${person.name}`}
              >
                👤 {person.name} <span className="chip-note">(Fecha AM N/A)</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
