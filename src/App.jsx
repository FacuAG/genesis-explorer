import React, { useState, useMemo } from 'react';
import { useGenesisData } from './hooks/useGenesisData';
import { Header } from './components/navigation/Header';
import { TimelineView } from './components/timeline/TimelineView';
import { PersonPanel } from './components/panels/PersonPanel';
import { ThemePanel } from './components/panels/ThemePanel';
import { CovenantPanel } from './components/panels/CovenantPanel';
import { LocationPanel } from './components/panels/LocationPanel';
import { DispensationPanel } from './components/panels/DispensationPanel';
import { ChapterMapPanel } from './components/panels/ChapterMapPanel';
import { QuestionPanel } from './components/panels/QuestionPanel';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetEventId, setTargetEventId] = useState(null);
  const [targetPersonId, setTargetPersonId] = useState(null);

  const genesis = useGenesisData();

  // Estadísticas globales para el Header
  const totalStats = useMemo(() => ({
    eventsCount: genesis.timelineEvents.length,
    peopleCount: genesis.people.length,
    covenantsCount: genesis.covenants.length
  }), [genesis.timelineEvents, genesis.people, genesis.covenants]);

  // Manejador centralizado para seleccionar un evento desde cualquier panel e ir a la línea de tiempo con foco y destello
  const handleSelectEvent = (eventId) => {
    if (eventId) {
      setTargetEventId(eventId);
    }
    setActiveTab('timeline');
  };

  // Manejador centralizado para seleccionar un personaje desde cualquier panel e ir a Personajes
  const handleSelectPerson = (personId) => {
    if (personId) {
      setTargetPersonId(personId);
    }
    setActiveTab('people');
  };

  // Resultados del buscador global
  const searchResults = useMemo(() => {
    return genesis.searchAll(searchQuery);
  }, [searchQuery, genesis]);

  return (
    <div className="genesis-app-root">
      {/* Cabecera Principal */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalStats={totalStats}
      />

      {/* Vista de Resultados de Búsqueda (si hay query activa) */}
      {searchQuery ? (
        <main className="app-main-content">
          <div className="search-results-container">
            <h2>🔍 Resultados de Búsqueda para "{searchQuery}"</h2>

            {searchResults.events.length === 0 && searchResults.people.length === 0 && searchResults.locations.length === 0 ? (
              <p className="no-results-msg">No se encontraron coincidencias en el libro del Génesis.</p>
            ) : (
              <div className="search-results-sections">
                {searchResults.events.length > 0 && (
                  <section className="search-section">
                    <h3>⚡ Eventos Encontrados ({searchResults.events.length})</h3>
                    <div className="search-cards-grid">
                      {searchResults.events.map(e => (
                        <div key={e.id} className="search-card" onClick={() => handleSelectEvent(e.id)}>
                          <h4>{e.name}</h4>
                          <span className="search-am-tag">Anno Mundi: AM {e.year_am ?? 'N/A'}</span>
                          <p>{e.summary}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {searchResults.people.length > 0 && (
                  <section className="search-section">
                    <h3>👥 Personajes Encontrados ({searchResults.people.length})</h3>
                    <div className="search-cards-grid">
                      {searchResults.people.map(p => (
                        <div key={p.id} className="search-card" onClick={() => handleSelectPerson(p.id)}>
                          <h4>{p.name}</h4>
                          <p><em>{p.name_meaning}</em></p>
                          <p>{p.theological_significance}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {searchResults.locations.length > 0 && (
                  <section className="search-section">
                    <h3>📍 Ubicaciones Encontradas ({searchResults.locations.length})</h3>
                    <div className="search-cards-grid">
                      {searchResults.locations.map(l => (
                        <div key={l.id} className="search-card">
                          <h4>{l.name} ({l.region})</h4>
                          <p>{l.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      ) : (
        /* Vista Normal según pestaña seleccionada */
        <main className="app-main-content">
          {activeTab === 'timeline' && (
            <TimelineView
              events={genesis.timelineEvents}
              timelineEvents={genesis.timelineEvents}
              eras={genesis.eras}
              narrativeBlocks={genesis.narrativeBlocks}
              covenants={genesis.covenants}
              peopleMap={genesis.peopleMap}
              locationsMap={genesis.locationsMap}
              eventsMap={genesis.eventsMap}
              targetEventId={targetEventId}
              onSelectPerson={handleSelectPerson}
            />
          )}

          {activeTab === 'people' && (
            <PersonPanel
              people={genesis.people}
              peopleMap={genesis.peopleMap}
              eventsMap={genesis.eventsMap}
              targetPersonId={targetPersonId}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {activeTab === 'themes' && (
            <ThemePanel
              themes={genesis.themes}
              eventsMap={genesis.eventsMap}
              peopleMap={genesis.peopleMap}
              onSelectEvent={handleSelectEvent}
              onSelectPerson={handleSelectPerson}
            />
          )}

          {activeTab === 'dispensations' && (
            <DispensationPanel dispensations={genesis.dispensations} />
          )}

          {activeTab === 'chapters' && (
            <ChapterMapPanel
              chapters={genesis.chaptersMap}
              eventsMap={genesis.eventsMap}
              peopleMap={genesis.peopleMap}
              onSelectEvent={handleSelectEvent}
              onSelectPerson={handleSelectPerson}
            />
          )}

          {activeTab === 'covenants' && (
            <CovenantPanel
              covenants={genesis.covenants}
              messianicPromises={genesis.messianicPromises}
            />
          )}

          {activeTab === 'locations' && (
            <LocationPanel locations={genesis.locations} />
          )}

          {activeTab === 'questions' && (
            <QuestionPanel questions={genesis.questions} />
          )}
        </main>
      )}

      {/* Pie de Página */}
      <footer className="app-footer">
        <p>
          <strong>Genesis Explorer</strong> — Basado en el sistema de cronología Anno Mundi (AM) y el estándar bíblico Reina-Valera 1960.
        </p>
      </footer>
    </div>
  );
}

export default App;
