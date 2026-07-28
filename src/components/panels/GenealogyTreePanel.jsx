import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PersonDetailModal } from './PersonDetailModal';
import './Panels.css';
import './GenealogyTreePanel.css';

/**
 * Componente profesional perfeccionado para el Visualizador Interactivo del Árbol Genealógico y Convivencias Patriarcales.
 * Incluye diagrama jerárquico por generaciones (Adán ➔ Jesucristo), fichas de relaciones familiares completas
 * y gráfico de superposición de vidas (Anno Mundi) con auto-scroll y salto a la Línea de Tiempo.
 */
export function GenealogyTreePanel({ people = [], peopleMap = new Map(), notableOverlaps = [], eventsMap = new Map(), onSelectEvent, onSelectPerson, onSelectChapter }) {
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'overlaps'
  const [treeLayoutMode, setTreeLayoutMode] = useState('hierarchical'); // 'hierarchical' | 'grid'
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all' | 'antediluvian' | 'postdiluvian' | 'patriarchs' | 'messianic_line'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedOverlapIndex, setSelectedOverlapIndex] = useState(0);

  const chartContainerRef = useRef(null);

  // Lista de antepasados directos de Jesús (Línea Mesiánica) con IDs exactos del dataset
  const messianicIds = useMemo(() => new Set([
    'adam', 'seth', 'enosh', 'kenan', 'mahalalel', 'jared', 'enoch', 'methuselah', 'lamech', 'noah',
    'shem', 'arpachshad', 'shelah', 'eber', 'peleg', 'reu', 'serug', 'nahor', 'terah',
    'abraham', 'isaac', 'jacob', 'judah', 'pharez', 'perez', 'hezron', 'ram', 'amminadab', 'nahshon', 'salmon',
    'boaz', 'obed', 'jesse', 'david', 'solomon', 'rehoboam', 'abijah', 'asa', 'jehoshaphat', 'jehoram',
    'uzziah', 'jotham', 'ahaz', 'hezekiah', 'manasseh', 'amon', 'josiah', 'jeconiah', 'shealtiel',
    'zerubbabel', 'abiud', 'eliakim', 'azor', 'zadok', 'achim', 'eliud', 'eleazar', 'matthan',
    'jacob_matthan', 'joseph', 'jesus'
  ]), []);

  // Filtrado de personajes según período y buscador
  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      // 1. Filtro por Período
      if (periodFilter === 'antediluvian' && p.category !== 'antediluvian') return false;
      if (periodFilter === 'postdiluvian' && p.category !== 'postdiluvian') return false;
      if (periodFilter === 'patriarchs' && p.category !== 'patriarch' && p.category !== 'twelve_tribes') return false;
      if (periodFilter === 'messianic_line' && !messianicIds.has(p.id)) return false;

      // 2. Buscador en vivo
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const name = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const meaning = (p.name_meaning || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!name.includes(q) && !meaning.includes(q)) return false;
      }

      return true;
    });
  }, [people, periodFilter, searchQuery, messianicIds]);

  // Agrupación Jerárquica por Niveles de Generación desde Adán
  const generationTiers = useMemo(() => {
    const map = new Map();
    filteredPeople.forEach(p => {
      const genNum = p.generation_from_adam || p.generation || 99;
      if (!map.has(genNum)) {
        map.set(genNum, []);
      }
      map.get(genNum).push(p);
    });

    const sortedTiers = Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    return sortedTiers;
  }, [filteredPeople]);

  // Lista de Patriarcas Principales para la Gráfica de Convivencia Temporal (Anno Mundi 0 a 2369)
  const overlapPatriarchs = useMemo(() => {
    const keyIds = [
      'adam', 'seth', 'enosh', 'kenan', 'mahalalel', 'jared', 'enoch', 'methuselah', 'lamech', 'noah',
      'shem', 'arpachshad', 'shelah', 'eber', 'peleg', 'reu', 'serug', 'nahor', 'terah',
      'abraham', 'isaac', 'jacob', 'joseph'
    ];
    return keyIds.map(id => peopleMap.get(id)).filter(Boolean);
  }, [peopleMap]);

  // Convivencia actualmente seleccionada
  const activeOverlap = notableOverlaps[selectedOverlapIndex] || notableOverlaps[0];
  const activeOverlapPersonFrom = activeOverlap ? peopleMap.get(activeOverlap.from) : null;
  const activeOverlapPersonTo = activeOverlap ? peopleMap.get(activeOverlap.to) : null;

  // Auto-scroll suave en el gráfico al seleccionar un chip de convivencia
  useEffect(() => {
    if (activeTab === 'overlaps' && chartContainerRef.current && activeOverlapPersonFrom) {
      const targetBar = chartContainerRef.current.querySelector(`.chart-bar-row[data-person-id="${activeOverlapPersonFrom.id}"]`);
      if (targetBar) {
        targetBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedOverlapIndex, activeTab, activeOverlapPersonFrom]);

  // Helper para renderizar los botones de relaciones familiares
  const renderFamilyChips = (person) => {
    const fatherId = person.father_id || person.father || person.parents?.father;
    const motherId = person.mother_id || person.mother || person.parents?.mother;
    const spouseId = Array.isArray(person.spouses) ? person.spouses[0] : (person.spouse_id || person.spouse);
    const childrenList = Array.isArray(person.children_ids) ? person.children_ids : (Array.isArray(person.children) ? person.children : []);

    const fatherObj = fatherId ? peopleMap.get(fatherId) : null;
    const motherObj = motherId ? peopleMap.get(motherId) : null;
    const spouseObj = spouseId ? peopleMap.get(spouseId) : null;

    return (
      <div className="gcard-relations-box">
        {fatherObj && (
          <div className="gcard-rel-row">
            <span className="rel-label">🌱 Padre:</span>
            <button
              className="rel-chip"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPerson(fatherObj);
              }}
            >
              {fatherObj.name}
            </button>
          </div>
        )}

        {motherObj && (
          <div className="gcard-rel-row">
            <span className="rel-label">🌸 Madre:</span>
            <button
              className="rel-chip"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPerson(motherObj);
              }}
            >
              {motherObj.name}
            </button>
          </div>
        )}

        {spouseObj && (
          <div className="gcard-rel-row">
            <span className="rel-label">💍 Cónyuge:</span>
            <button
              className="rel-chip spouse-chip"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPerson(spouseObj);
              }}
            >
              {spouseObj.name}
            </button>
          </div>
        )}

        {childrenList.length > 0 && (
          <div className="gcard-rel-row children-row">
            <span className="rel-label">👶 Hijos ({childrenList.length}):</span>
            <div className="children-chips-wrap">
              {childrenList.slice(0, 4).map(cId => {
                const childObj = peopleMap.get(cId);
                return (
                  <button
                    key={cId}
                    className="rel-chip child-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (childObj) setSelectedPerson(childObj);
                    }}
                  >
                    {childObj ? childObj.name : cId}
                  </button>
                );
              })}
              {childrenList.length > 4 && (
                <span className="more-children-tag">+{childrenList.length - 4} más</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="genealogy-panel-container">
      {/* 1. CABECERA PRINCIPAL Y SELECTOR DE PESTAÑAS */}
      <header className="genealogy-header">
        <div className="genealogy-header-titles">
          <div className="genealogy-badge">📜 HERMENÉUTICA & LINAJE REDENTOR</div>
          <h1 className="genealogy-title">🌳 Árbol Genealógico & Convivencias Patriarcales</h1>
          <p className="genealogy-subtitle">
            Explora las 63 generaciones desde Adán hasta Jesucristo y descubre la sorprendente transmisión oral directa de la verdad divina entre patriarcas convivientes.
          </p>
        </div>

        <div className="genealogy-tab-switcher">
          <button
            className={`genealogy-tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
            onClick={() => setActiveTab('tree')}
          >
            🌳 Árbol Genealógico Interactivo
          </button>
          <button
            className={`genealogy-tab-btn ${activeTab === 'overlaps' ? 'active' : ''}`}
            onClick={() => setActiveTab('overlaps')}
          >
            📊 Vidas Superpuestas & Convivencia (AM)
          </button>
        </div>
      </header>

      {/* 2. PESTAÑA A: ÁRBOL GENEALÓGICO INTERACTIVO */}
      {activeTab === 'tree' && (
        <div className="genealogy-tree-view">
          {/* BARRA DE FILTROS, MODO DE VISTA Y BÚSQUEDA */}
          <div className="gtv-toolbar">
            <div className="gtv-period-filters">
              <button
                className={`gtv-filter-chip ${periodFilter === 'all' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('all')}
              >
                Todas las Generaciones ({people.length})
              </button>
              <button
                className={`gtv-filter-chip ${periodFilter === 'antediluvian' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('antediluvian')}
              >
                🏛️ Antediluvianos (Adán ➔ Noé)
              </button>
              <button
                className={`gtv-filter-chip ${periodFilter === 'postdiluvian' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('postdiluvian')}
              >
                🌍 Postdiluvianos (Sem ➔ Taré)
              </button>
              <button
                className={`gtv-filter-chip ${periodFilter === 'patriarchs' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('patriarchs')}
              >
                👑 Patriarcas & 12 Tribus
              </button>
              <button
                className={`gtv-filter-chip ${periodFilter === 'messianic_line' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('messianic_line')}
              >
                ✝️ Línea Mesiánica a Cristo
              </button>
            </div>

            <div className="gtv-right-controls">
              {/* SELECTOR DE MODO DE VISTA (JERÁRQUICO vs FICHERO) */}
              <div className="layout-mode-toggle">
                <button
                  className={`mode-btn ${treeLayoutMode === 'hierarchical' ? 'active' : ''}`}
                  onClick={() => setTreeLayoutMode('hierarchical')}
                  title="Ver organizado jerárquicamente por niveles de generación"
                >
                  🌳 Por Generaciones
                </button>
                <button
                  className={`mode-btn ${treeLayoutMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setTreeLayoutMode('grid')}
                  title="Ver en formato Fichero Continuo"
                >
                  🎴 Fichero
                </button>
              </div>

              {/* BUSCADOR EN VIVO */}
              <div className="gtv-search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="gtv-search-input"
                  placeholder="Buscar personaje o significado (ej. Adán, Sem, Noé)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="gtv-clear-search" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>
            </div>
          </div>

          {/* VISTA A.1: MODO JERÁRQUICO POR NIVELES DE GENERACIÓN */}
          {treeLayoutMode === 'hierarchical' && (
            <div className="genealogy-hierarchical-tree">
              {generationTiers.map(([genNum, genPeople]) => (
                <div key={genNum} className="generation-tier-block">
                  <div className="tier-header-badge">
                    <span className="tier-icon">🌿</span>
                    <span className="tier-label">Generación #{genNum !== 99 ? genNum : 'Varias'}</span>
                    <span className="tier-count">({genPeople.length} {genPeople.length === 1 ? 'personaje' : 'personajes'})</span>
                  </div>

                  <div className="tier-cards-row">
                    {genPeople.map(person => {
                      const isMessianic = messianicIds.has(person.id);

                      return (
                        <div
                          key={person.id}
                          className={`genealogy-card ${isMessianic ? 'messianic-card' : ''}`}
                          onClick={() => setSelectedPerson(person)}
                        >
                          <div className="gcard-header">
                            <span className="gcard-index">Gen #{genNum}</span>
                            {isMessianic && <span className="gcard-messianic-badge" title="Línea Directa del Mesías">✝️ Línea Mesiánica</span>}
                          </div>

                          <h3 className="gcard-name">{person.name}</h3>
                          {person.name_meaning && (
                            <p className="gcard-meaning">✨ "{person.name_meaning}"</p>
                          )}

                          <div className="gcard-lifespan-row">
                            <span>⏳ AM {person.birth_am ?? '?'} - AM {person.death_am ?? '?'}</span>
                            {person.lifespan && <strong>({person.lifespan} años)</strong>}
                          </div>

                          {/* RELACIONES FAMILIARES CONECTADAS */}
                          {renderFamilyChips(person)}

                          {person.verse_text && (
                            <p className="gcard-verse-preview">"{person.verse_text}"</p>
                          )}

                          <div className="gcard-footer-actions">
                            <button className="gcard-btn" onClick={() => setSelectedPerson(person)}>
                              📖 Ver Biografía & Relaciones ➔
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA A.2: MODO FICHERO DE TARJETAS */}
          {treeLayoutMode === 'grid' && (
            <div className="genealogy-cards-grid">
              {filteredPeople.map((person, index) => {
                const isMessianic = messianicIds.has(person.id);

                return (
                  <div
                    key={person.id}
                    className={`genealogy-card ${isMessianic ? 'messianic-card' : ''}`}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <div className="gcard-header">
                      <span className="gcard-index">#{index + 1}</span>
                      {isMessianic && <span className="gcard-messianic-badge" title="Línea Directa del Mesías">✝️ Promesa Mesiánica</span>}
                    </div>

                    <h3 className="gcard-name">{person.name}</h3>
                    {person.name_meaning && (
                      <p className="gcard-meaning">✨ "{person.name_meaning}"</p>
                    )}

                    <div className="gcard-lifespan-row">
                      <span>⏳ AM {person.birth_am ?? '?'} - AM {person.death_am ?? '?'}</span>
                      {person.lifespan && <strong>({person.lifespan} años)</strong>}
                    </div>

                    {/* RELACIONES FAMILIARES CONECTADAS */}
                    {renderFamilyChips(person)}

                    {person.verse_text && (
                      <p className="gcard-verse-preview">"{person.verse_text}"</p>
                    )}

                    <div className="gcard-footer-actions">
                      <button className="gcard-btn" onClick={() => setSelectedPerson(person)}>
                        📖 Ver Biografía & Relaciones ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. PESTAÑA B: GRÁFICO DE CONVIVENCIAS Y SUPERPOSICIÓN TEMPORAL */}
      {activeTab === 'overlaps' && (
        <div className="genealogy-overlaps-view">
          {/* SELECTOR DE HISTORIAS DE CONVIVENCIA DESTACADAS */}
          <div className="overlaps-selector-bar">
            <h3>⚡ 5 Convivencias Bíblicas Clave (Transmisión Oral Directa)</h3>
            <div className="overlap-chips-row">
              {notableOverlaps.map((overlap, idx) => {
                const p1 = peopleMap.get(overlap.from);
                const p2 = peopleMap.get(overlap.to);
                const isSelected = idx === selectedOverlapIndex;

                return (
                  <button
                    key={idx}
                    className={`overlap-select-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedOverlapIndex(idx)}
                  >
                    <span>🤝 {p1?.name || overlap.from} & {p2?.name || overlap.to}</span>
                    <strong>({overlap.years_overlap} años)</strong>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TARJETA EXPLICATIVA DE LA CONVIVENCIA SELECCIONADA */}
          {activeOverlap && (
            <div className="overlap-detail-card">
              <div className="odc-badge">🕊️ Hermenéutica de Transmisión Oral Directa</div>
              <h2 className="odc-title">
                {activeOverlapPersonFrom?.name} & {activeOverlapPersonTo?.name} convivieron durante {activeOverlap.years_overlap} años
              </h2>
              <p className="odc-description">{activeOverlap.description}</p>
              
              <div className="odc-stats-row">
                <div className="odc-stat-item">
                  <span className="label">Nacimiento de {activeOverlapPersonFrom?.name}:</span>
                  <span className="val">AM {activeOverlapPersonFrom?.birth_am}</span>
                </div>
                <div className="odc-stat-item">
                  <span className="label">Nacimiento de {activeOverlapPersonTo?.name}:</span>
                  <span className="val">AM {activeOverlapPersonTo?.birth_am}</span>
                </div>
                <div className="odc-stat-item highlight">
                  <span className="label">Años de Convivencia Simultánea:</span>
                  <span className="val">{activeOverlap.years_overlap} AÑOS</span>
                </div>
              </div>
            </div>
          )}

          {/* LIENZO DE BARRAS HORIZONTALES (EJE ANNO MUNDI 0 A 2369) */}
          <div ref={chartContainerRef} className="overlaps-timeline-chart">
            <div className="chart-header-axis">
              <span>AM 0 (Creación)</span>
              <span>AM 500</span>
              <span>AM 1056 (Noé)</span>
              <span>AM 1656 (Diluvio)</span>
              <span>AM 2008 (Abraham)</span>
              <span>AM 2369 (José)</span>
            </div>

            <div className="chart-bars-list">
              {overlapPatriarchs.map(p => {
                const birth = p.birth_am ?? 0;
                const death = p.death_am ?? birth + (p.lifespan || 100);
                
                // Mapear AM 0 a 2400 a porcentaje 0% - 100%
                const leftPct = Math.max(0, Math.min(100, (birth / 2369) * 100));
                const widthPct = Math.max(1.5, Math.min(100 - leftPct, ((death - birth) / 2369) * 100));

                const isFromActive = activeOverlapPersonFrom?.id === p.id;
                const isToActive = activeOverlapPersonTo?.id === p.id;
                const isHighlightedInOverlap = isFromActive || isToActive;

                return (
                  <div
                    key={p.id}
                    data-person-id={p.id}
                    className={`chart-bar-row ${isHighlightedInOverlap ? 'active-overlap-row' : ''}`}
                  >
                    <button
                      className="bar-label-btn"
                      onClick={() => setSelectedPerson(p)}
                      title={`Ver biografía de ${p.name}`}
                    >
                      <strong>{p.name}</strong>
                      <small>AM {birth} - {death}</small>
                    </button>

                    <div className="bar-track">
                      <div
                        className={`bar-fill ${isHighlightedInOverlap ? 'fill-gold-glow' : ''}`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        onClick={() => setSelectedPerson(p)}
                        title={`${p.name}: AM ${birth} a AM ${death} (${p.lifespan || '?'} años)`}
                      >
                        <span className="bar-inner-text">{p.name} ({p.lifespan}a)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DIRECTO DE PERSONAJE CON NAVEGACIÓN A EVENTOS Y CAPÍTULOS */}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          isOpen={Boolean(selectedPerson)}
          onClose={() => setSelectedPerson(null)}
          peopleMap={peopleMap}
          eventsMap={eventsMap}
          onSelectPerson={(nextId) => {
            const nextP = peopleMap.get(nextId);
            if (nextP) setSelectedPerson(nextP);
            if (onSelectPerson) onSelectPerson(nextId);
          }}
          onSelectEvent={(eventId) => {
            setSelectedPerson(null);
            if (onSelectEvent) onSelectEvent(eventId);
          }}
          onSelectChapter={(chapNum) => {
            setSelectedPerson(null);
            if (onSelectChapter) onSelectChapter(chapNum);
          }}
        />
      )}
    </div>
  );
}
