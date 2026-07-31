import { useMemo } from 'react';
import './LifespanBar.css';

/**
 * Componente de visualización gráfica de Barras de Longevidad Patriarcal (LifespanBar).
 * Mapea visualmente la vida de los personajes en un eje horizontal de Anno Mundi (AM).
 * Detecta automáticamente brechas cronológicas lejanas (ej. Abraham/David vs Siglo I)
 * y agrupa los personajes por Segmentos/Épocas para garantizar máxima legibilidad en TODOS los libros.
 */
export function LifespanBar({ people = [], onSelectPerson, selectedPersonId, bookTitle = 'Génesis' }) {
  // Personas con fechas cronológicas exactas
  const patriarchsWithDates = useMemo(() => {
    return people
      .filter(p => p.chronology && typeof p.chronology.birth_am === 'number' && typeof p.chronology.death_am === 'number')
      .sort((a, b) => a.chronology.birth_am - b.chronology.birth_am);
  }, [people]);

  // Personas sin rango completo de fechas numéricas
  const peopleWithoutDates = useMemo(() => {
    return people.filter(p => !(p.chronology && typeof p.chronology.birth_am === 'number' && typeof p.chronology.death_am === 'number'));
  }, [people]);

  // Algoritmo Universal de Agrupamiento por Segmentos / Épocas Cronológicas
  const segments = useMemo(() => {
    if (patriarchsWithDates.length === 0) return [];

    const GAP_THRESHOLD = 300; // Umbral de brecha temporal (años AM)
    const list = [];

    let currentSeg = {
      people: [patriarchsWithDates[0]],
      minAM: patriarchsWithDates[0].chronology.birth_am,
      maxAM: patriarchsWithDates[0].chronology.death_am || patriarchsWithDates[0].chronology.birth_am + 50
    };

    for (let i = 1; i < patriarchsWithDates.length; i++) {
      const person = patriarchsWithDates[i];
      const birth = person.chronology.birth_am;
      const death = person.chronology.death_am || birth + 50;

      // Brecha desde el máximo del segmento actual hasta el nacimiento del siguiente personaje
      if (birth - currentSeg.maxAM > GAP_THRESHOLD) {
        list.push(currentSeg);
        currentSeg = {
          people: [person],
          minAM: birth,
          maxAM: death
        };
      } else {
        currentSeg.people.push(person);
        currentSeg.minAM = Math.min(currentSeg.minAM, birth);
        currentSeg.maxAM = Math.max(currentSeg.maxAM, death);
      }
    }
    list.push(currentSeg);

    return list;
  }, [patriarchsWithDates]);

  const hasPatriarchBars = patriarchsWithDates.length > 0;

  return (
    <div className="lifespan-container">
      <div className="lifespan-header">
        <h3>📊 Catálogo y Cronología de Personajes de {bookTitle} ({people.length} Personajes Registrados)</h3>
        <p>Perfiles bíblicos, relaciones familiares y catálogo cronológico de figuras del texto sagrado.</p>
      </div>

      {/* Escala de Barras por Segmentos / Épocas */}
      {hasPatriarchBars && (
        <div className="lifespan-segments-wrapper">
          {segments.map((seg, sIdx) => {
            const minAM = seg.minAM;
            const maxAM = seg.maxAM;
            const totalSpan = Math.max(1, maxAM - minAM);

            // Calcular salto con respecto al segmento anterior si existe
            const prevSeg = sIdx > 0 ? segments[sIdx - 1] : null;
            const gapYears = prevSeg ? minAM - prevSeg.maxAM : 0;

            return (
              <div key={sIdx} className="lifespan-segment-card">
                {/* Indicador de Ruptura de Época / Salto Generacional si hay brecha masiva */}
                {prevSeg && (
                  <div className="lifespan-break-banner">
                    <div className="break-line" />
                    <span className="break-badge">
                      ⚡ Salto Generacional: +{gapYears} Años de Historia (AM {prevSeg.maxAM} ➔ AM {minAM})
                    </span>
                    <div className="break-line" />
                  </div>
                )}

                {/* Título de la Época si hay múltiples segmentos */}
                {segments.length > 1 && (
                  <div className="segment-era-header">
                    <h4>
                      🗓️ Época / Época {sIdx + 1}: AM {minAM} – AM {maxAM} ({seg.people.length} Personaje{seg.people.length !== 1 ? 's' : ''})
                    </h4>
                  </div>
                )}

                {/* Escala del Eje Horizontal del Segmento */}
                <div className="lifespan-axis">
                  <span style={{ left: '0%' }}>AM {minAM}</span>
                  <span style={{ left: '50%' }}>AM {Math.round(minAM + totalSpan * 0.50)}</span>
                  <span style={{ left: '100%' }}>AM {maxAM}</span>
                </div>

                {/* Lista de Barras de Vida del Segmento */}
                <div className="lifespan-bars-list">
                  {seg.people.map(person => {
                    const birth = person.chronology.birth_am;
                    const death = person.chronology.death_am;
                    const lifespan = person.chronology.lifespan || (death - birth);

                    const leftPercent = Math.max(0, Math.min(100, ((birth - minAM) / totalSpan) * 100));
                    const widthPercent = Math.max(2, Math.min(100 - leftPercent, ((death - birth) / totalSpan) * 100));

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
              </div>
            );
          })}
        </div>
      )}

      {/* Sección de Personajes e Históricos del libro */}
      {peopleWithoutDates.length > 0 && (
        <div className="undated-people-section">
          <h4>📋 Personajes e Históricos Documentados en {bookTitle} ({peopleWithoutDates.length}):</h4>
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
                👤 {person.name} {person.chronology?.lifespan ? `(${person.chronology.lifespan}a)` : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
