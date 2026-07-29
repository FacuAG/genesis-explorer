import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PersonDetailModal } from './PersonDetailModal';
import './Panels.css';
import './GenealogyTreePanel.css';

/**
 * Componente profesional perfeccionado para el Visualizador Interactivo del Árbol Genealógico y Convivencias Patriarcales.
 * Incluye diagrama jerárquico por generaciones (Adán ➔ Jesucristo), fichas de relaciones familiares completas
 * y gráfico de superposición de vidas (Anno Mundi) con lectura exacta de datos y navegación 100% interactiva.
 */
export function GenealogyTreePanel({ people = [], peopleMap = new Map(), notableOverlaps = [], eventsMap = new Map(), onSelectEvent, onSelectPerson, onSelectChapter }) {
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'overlaps'
  const [treeLayoutMode, setTreeLayoutMode] = useState('hierarchical'); // 'hierarchical' | 'grid'
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all' | 'antediluvian' | 'postdiluvian' | 'patriarchs' | 'messianic_line'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedOverlapIndex, setSelectedOverlapIndex] = useState(0);
  const [overlapEraFilter, setOverlapEraFilter] = useState('all'); // 'all' | 'genesis' | 'kings' | 'gospels'

  const chartContainerRef = useRef(null);

  // Lista de antepasados directos de Jesús (Línea Mesiánica) con IDs exactos del dataset
  const messianicIds = useMemo(() => new Set([
    'adam', 'seth', 'enosh', 'kenan', 'mahalalel', 'jared', 'enoch', 'methuselah', 'lamech_sethite', 'lamech', 'noah',
    'shem', 'arpachshad', 'shelah', 'eber', 'peleg', 'reu', 'serug', 'nahor', 'terah',
    'abraham', 'isaac', 'jacob', 'judah', 'pharez', 'perez', 'hezron', 'ram', 'amminadab', 'nahshon', 'salmon',
    'boaz', 'obed', 'jesse', 'david', 'solomon', 'rehoboam', 'abijah', 'asa', 'jehoshaphat', 'jehoram',
    'uzziah', 'jotham', 'ahaz', 'hezekiah', 'manasseh', 'amon', 'josiah', 'jeconiah', 'shealtiel',
    'zerubbabel', 'abiud', 'eliakim', 'azor', 'zadok', 'achim', 'eliud', 'eleazar', 'matthan',
    'jacob_matthan', 'joseph', 'mary', 'jesus'
  ]), []);

  // Helper para extraer las fechas Anno Mundi de cualquier personaje sin undefined
  const getPersonDates = (p) => {
    if (!p) return { birth: 0, death: 100, lifespan: 100 };

    const birth = p.chronology?.birth_am ?? p.birth_am ?? 0;
    const lifespan = p.chronology?.lifespan ?? p.lifespan;
    const death = p.chronology?.death_am ?? p.death_am ?? (birth + (lifespan || 100));

    return { birth, death, lifespan: lifespan || (death - birth) };
  };

  // Helper para formatear nombres de personajes evitando mostrar IDs crudos como "enoch_cainite"
  const getFormattedName = (personOrId) => {
    if (!personOrId) return 'Desconocido';
    if (typeof personOrId === 'object') return personOrId.name;

    const pObj = peopleMap.get(personOrId);
    if (pObj) return pObj.name;

    if (personOrId === 'enoch_cainite') return 'Enoc (línea de Caín)';
    if (personOrId === 'lamech_cainite') return 'Lamec (línea de Caín)';
    if (personOrId === 'lamech_sethite') return 'Lamec (línea de Set)';
    if (personOrId === 'nahor_brother') return 'Nacor (hermano de Abraham)';
    if (personOrId === 'pharaoh_joseph') return 'Faraón (días de José)';

    return personOrId.charAt(0).toUpperCase() + personOrId.slice(1).replace(/_/g, ' ');
  };

  // Filtrado de personajes según período, tramo histórico y buscador
  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const dates = getPersonDates(p);
      const cat = p.category || '';
      const genNum = p.generation_from_adam || p.generation || p.chronology?.generation || 1;

      // Filtros por tramo histórico mesiánico
      if (periodFilter === 'genesis_line') {
        if (genNum > 23 || (p.period_era && p.period_era.startsWith('post_genesis'))) return false;
      }

      if (periodFilter === 'kings_line') {
        if (genNum < 24 || genNum > 49) return false;
      }

      if (periodFilter === 'gospels_line') {
        if (genNum < 50) return false;
      }

      if (periodFilter === 'antediluvian') {
        const isAntediluvian = (cat.includes('antediluvian') ||
          ['first_man', 'first_woman', 'cainite_line', 'first_martyr', 'flood_survivor'].includes(cat) ||
          dates.birth < 1056) && !['potiphar', 'pharaoh_joseph', 'tamar'].includes(p.id);
        if (!isAntediluvian) return false;
      }

      if (periodFilter === 'postdiluvian') {
        const isPostdiluvian = cat.includes('postdiluvian') ||
          ['shelah', 'eber', 'peleg', 'reu', 'serug', 'nahor', 'terah'].includes(p.id) ||
          (dates.birth >= 1056 && dates.birth < 1948);
        if (!isPostdiluvian) return false;
      }

      if (periodFilter === 'patriarchs') {
        const isPatriarch = ['covenant_patriarch', 'covenant_matriarch', 'tribal_patriarch', 'matriarch_secondary', 'savior_figure', 'patriarch_relative', 'egyptian_official'].includes(cat) ||
          dates.birth >= 1948;
        if (!isPatriarch) return false;
      }

      if (periodFilter === 'messianic_line') {
        if (!messianicIds.has(p.id)) return false;
      }

      // 2. Buscador en vivo
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const name = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const meaning = (p.name_meaning || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!name.includes(q) && !meaning.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      const gA = a.generation_from_adam || a.generation || a.chronology?.generation || 1;
      const gB = b.generation_from_adam || b.generation || b.chronology?.generation || 1;
      return gA - gB;
    });
  }, [people, periodFilter, searchQuery, messianicIds]);

  // Agrupación Jerárquica por Niveles de Generación desde Adán
  const generationTiers = useMemo(() => {
    const map = new Map();
    filteredPeople.forEach(p => {
      const genNum = p.generation_from_adam || p.generation || p.chronology?.generation || 1;
      if (!map.has(genNum)) {
        map.set(genNum, []);
      }
      map.get(genNum).push(p);
    });

    const sortedTiers = Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    return sortedTiers;
  }, [filteredPeople]);

  // Lista de Personajes para la Gráfica de Convivencia según Era Bíblica
  const { overlapPeopleList, chartMin, chartMax, axisTicks } = useMemo(() => {
    let ids = [];
    let min = 0;
    let max = 4033;
    let ticks = [
      { label: 'AM 0 (Creación)', pos: 0 },
      { label: 'AM 1056 (Noé)', pos: 26 },
      { label: 'AM 1948 (Abraham)', pos: 48 },
      { label: 'AM 2940 (Rey David)', pos: 73 },
      { label: 'AM 3445 (Zorobabel)', pos: 85 },
      { label: 'AM 4000 (Jesucristo)', pos: 99 }
    ];

    if (overlapEraFilter === 'genesis') {
      ids = ['adam', 'seth', 'enosh', 'kenan', 'mahalalel', 'jared', 'enoch', 'methuselah', 'lamech_sethite', 'noah', 'shem', 'arpachshad', 'shelah', 'eber', 'peleg', 'reu', 'serug', 'nahor', 'terah', 'abraham', 'isaac', 'jacob', 'joseph'];
      min = 0;
      max = 2369;
      ticks = [
        { label: 'AM 0 (Creación)', pos: 0 },
        { label: 'AM 500', pos: 21 },
        { label: 'AM 1056 (Noé)', pos: 44 },
        { label: 'AM 1656 (Diluvio)', pos: 70 },
        { label: 'AM 2008 (Abraham)', pos: 84 },
        { label: 'AM 2369 (José)', pos: 100 }
      ];
    } else if (overlapEraFilter === 'kings') {
      ids = ['boaz', 'obed', 'jesse', 'david', 'solomon', 'rehoboam', 'abijah', 'asa', 'jehoshaphat', 'jehoram', 'uzziah', 'jotham', 'ahaz', 'hezekiah', 'manasseh', 'amon', 'josiah', 'jeconiah', 'shealtiel', 'zerubbabel'];
      min = 2500;
      max = 3550;
      ticks = [
        { label: 'AM 2560 (Booz)', pos: 5 },
        { label: 'AM 2710 (Isaí)', pos: 20 },
        { label: 'AM 2940 (David)', pos: 42 },
        { label: 'AM 2980 (Salomón)', pos: 46 },
        { label: 'AM 3252 (Ezequías)', pos: 71 },
        { label: 'AM 3515 (Zorobabel)', pos: 96 }
      ];
    } else if (overlapEraFilter === 'gospels') {
      ids = ['matthan', 'jacob_matthan', 'joseph', 'mary', 'jesus'];
      min = 3840;
      max = 4055;
      ticks = [
        { label: 'AM 3840 (Matán)', pos: 0 },
        { label: 'AM 3950 (José)', pos: 51 },
        { label: 'AM 3984 (María)', pos: 67 },
        { label: 'AM 4000 (Nacimiento de Jesús)', pos: 74 },
        { label: 'AM 4033 (Resurrección)', pos: 90 }
      ];
    } else {
      // 'all'
      ids = ['adam', 'seth', 'enoch', 'methuselah', 'noah', 'shem', 'eber', 'terah', 'abraham', 'isaac', 'jacob', 'boaz', 'jesse', 'david', 'solomon', 'hezekiah', 'josiah', 'zerubbabel', 'joseph', 'mary', 'jesus'];
    }

    const list = ids.map(id => peopleMap.get(id)).filter(Boolean);
    return { overlapPeopleList: list, chartMin: min, chartMax: max, axisTicks: ticks };
  }, [overlapEraFilter, peopleMap]);

  // Convivencia actualmente seleccionada (Soporta esquemas flexibles de datos)
  const activeOverlap = notableOverlaps[selectedOverlapIndex] || notableOverlaps[0];
  const activeFromId = activeOverlap ? (activeOverlap.person1_id || activeOverlap.from) : null;
  const activeToId = activeOverlap ? (activeOverlap.person2_id || activeOverlap.to) : null;
  const activeYears = activeOverlap ? (activeOverlap.years_together || activeOverlap.years_overlap) : 0;
  const activeDescription = activeOverlap ? (activeOverlap.historical_note || activeOverlap.description || activeOverlap.note) : '';

  const activeOverlapPersonFrom = activeFromId ? peopleMap.get(activeFromId) : null;
  const activeOverlapPersonTo = activeToId ? peopleMap.get(activeToId) : null;

  // Auto-scroll suave en el gráfico al seleccionar un chip de convivencia
  useEffect(() => {
    if (activeTab === 'overlaps' && chartContainerRef.current && activeOverlapPersonFrom) {
      const targetBar = chartContainerRef.current.querySelector(`.chart-bar-row[data-person-id="${activeOverlapPersonFrom.id}"]`);
      if (targetBar) {
        targetBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedOverlapIndex, activeTab, activeOverlapPersonFrom]);

  // Helper para renderizar los botones de relaciones familiares con nombres limpios
  const renderFamilyChips = (person) => {
    const fatherId = person.father_id || person.father || person.family?.father || person.parents?.father;
    const motherId = person.mother_id || person.mother || person.family?.mother || person.parents?.mother;
    const spouseId = Array.isArray(person.spouses) ? person.spouses[0] : (person.spouse_id || person.spouse || person.family?.spouse);
    const childrenList = Array.isArray(person.children_ids) ? person.children_ids : (Array.isArray(person.children) ? person.children : (person.family?.children || []));

    const fatherObj = fatherId ? peopleMap.get(fatherId) : null;
    const motherObj = motherId ? peopleMap.get(motherId) : null;
    const spouseObj = spouseId ? peopleMap.get(spouseId) : null;

    return (
      <div className="gcard-relations-box">
        {fatherId && (
          <div className="gcard-rel-row">
            <span className="rel-label">🌱 Padre:</span>
            <button
              className="rel-chip"
              onClick={(e) => {
                e.stopPropagation();
                if (fatherObj) setSelectedPerson(fatherObj);
              }}
            >
              {getFormattedName(fatherObj || fatherId)}
            </button>
          </div>
        )}

        {motherId && (
          <div className="gcard-rel-row">
            <span className="rel-label">🌸 Madre:</span>
            <button
              className="rel-chip"
              onClick={(e) => {
                e.stopPropagation();
                if (motherObj) setSelectedPerson(motherObj);
              }}
            >
              {getFormattedName(motherObj || motherId)}
            </button>
          </div>
        )}

        {spouseId && (
          <div className="gcard-rel-row">
            <span className="rel-label">💍 Cónyuge:</span>
            <button
              className="rel-chip spouse-chip"
              onClick={(e) => {
                e.stopPropagation();
                if (spouseObj) setSelectedPerson(spouseObj);
              }}
            >
              {getFormattedName(spouseObj || spouseId)}
            </button>
          </div>
        )}

        {childrenList.length > 0 && (
          <div className="gcard-rel-row children-row">
            <span className="rel-label">👶 Hijos ({childrenList.length}):</span>
            <div className="children-chips-wrap">
              {childrenList.slice(0, 4).map(cId => {
                const childObj = typeof cId === 'string' ? peopleMap.get(cId) : cId;
                const childName = getFormattedName(childObj || cId);
                return (
                  <button
                    key={typeof cId === 'string' ? cId : childName}
                    className="rel-chip child-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (childObj) setSelectedPerson(childObj);
                    }}
                  >
                    {childName}
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
                className={`gtv-filter-chip ${periodFilter === 'genesis_line' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('genesis_line')}
              >
                🌿 Tramo Génesis (Gen #1 a #23)
              </button>
              <button
                className={`gtv-filter-chip ${periodFilter === 'kings_line' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('kings_line')}
              >
                👑 Tramo Real (Gen #24 a #49)
              </button>
              <button
                className={`gtv-filter-chip ${periodFilter === 'gospels_line' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('gospels_line')}
              >
                ✝️ Evangelios a Cristo (Gen #50 a #61)
              </button>
              <button
                className={`gtv-filter-chip ${periodFilter === 'messianic_line' ? 'active' : ''}`}
                onClick={() => setPeriodFilter('messianic_line')}
              >
                ✝️ Línea Mesiánica Completa
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
                    <span className="tier-label">Generación #{genNum} desde Adán</span>
                    <span className="tier-count">({genPeople.length} {genPeople.length === 1 ? 'personaje' : 'personajes'})</span>
                  </div>

                  <div className="tier-cards-row">
                    {genPeople.map(person => {
                      const isMessianic = messianicIds.has(person.id);
                      const dates = getPersonDates(person);

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
                            <span>⏳ AM {dates.birth} - AM {dates.death}</span>
                            {dates.lifespan && <strong>({dates.lifespan} años)</strong>}
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
                const dates = getPersonDates(person);
                const genNum = person.generation_from_adam || person.generation || person.chronology?.generation || 1;

                return (
                  <div
                    key={person.id}
                    className={`genealogy-card ${isMessianic ? 'messianic-card' : ''}`}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <div className="gcard-header">
                      <span className="gcard-index">Gen #{genNum} (#{index + 1})</span>
                      {isMessianic && <span className="gcard-messianic-badge" title="Línea Directa del Mesías">✝️ Promesa Mesiánica</span>}
                    </div>

                    <h3 className="gcard-name">{person.name}</h3>
                    {person.name_meaning && (
                      <p className="gcard-meaning">✨ "{person.name_meaning}"</p>
                    )}

                    <div className="gcard-lifespan-row">
                      <span>⏳ AM {dates.birth} - AM {dates.death}</span>
                      {dates.lifespan && <strong>({dates.lifespan} años)</strong>}
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
          {/* BARRA DE FILTRADO POR ERAS BÍBLICAS DEL GRÁFICO */}
          <div className="gtv-toolbar">
            <div className="gtv-period-filters">
              <button
                className={`gtv-filter-chip ${overlapEraFilter === 'all' ? 'active' : ''}`}
                onClick={() => setOverlapEraFilter('all')}
              >
                🌐 Todas las Eras (AM 0 a 4000)
              </button>
              <button
                className={`gtv-filter-chip ${overlapEraFilter === 'genesis' ? 'active' : ''}`}
                onClick={() => setOverlapEraFilter('genesis')}
              >
                🏛️ Era Patriarcal / Génesis
              </button>
              <button
                className={`gtv-filter-chip ${overlapEraFilter === 'kings' ? 'active' : ''}`}
                onClick={() => setOverlapEraFilter('kings')}
              >
                👑 Era de los Reyes
              </button>
              <button
                className={`gtv-filter-chip ${overlapEraFilter === 'gospels' ? 'active' : ''}`}
                onClick={() => setOverlapEraFilter('gospels')}
              >
                ✝️ Era de los Evangelios
              </button>
            </div>
          </div>

          {/* SELECTOR DE HISTORIAS DE CONVIVENCIA DESTACADAS */}
          <div className="overlaps-selector-bar">
            <h3>⚡ Convivencias Bíblicas Clave (Transmisión Oral Directa)</h3>
            <div className="overlap-chips-row">
              {notableOverlaps.map((overlap, idx) => {
                const p1Id = overlap.person1_id || overlap.from;
                const p2Id = overlap.person2_id || overlap.to;
                const p1 = peopleMap.get(p1Id);
                const p2 = peopleMap.get(p2Id);
                const p1Name = getFormattedName(p1 || p1Id);
                const p2Name = getFormattedName(p2 || p2Id);
                const years = overlap.years_together || overlap.years_overlap;
                const isSelected = idx === selectedOverlapIndex;

                return (
                  <button
                    key={idx}
                    className={`overlap-select-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedOverlapIndex(idx)}
                  >
                    <span>🤝 {p1Name} & {p2Name}</span>
                    <strong>({years} años)</strong>
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
                {getFormattedName(activeOverlapPersonFrom || activeFromId)} & {getFormattedName(activeOverlapPersonTo || activeToId)} convivieron durante {activeYears} años
              </h2>
              <p className="odc-description">{activeDescription}</p>
              
              <div className="odc-stats-row">
                <div className="odc-stat-item">
                  <span className="label">Nacimiento de {getFormattedName(activeOverlapPersonFrom || activeFromId)}:</span>
                  <span className="val">AM {getPersonDates(activeOverlapPersonFrom).birth}</span>
                </div>
                <div className="odc-stat-item">
                  <span className="label">Nacimiento de {getFormattedName(activeOverlapPersonTo || activeToId)}:</span>
                  <span className="val">AM {getPersonDates(activeOverlapPersonTo).birth}</span>
                </div>
                <div className="odc-stat-item highlight">
                  <span className="label">Años de Convivencia Simultánea:</span>
                  <span className="val">{activeYears} AÑOS</span>
                </div>
              </div>
            </div>
          )}

          {/* LIENZO DE BARRAS HORIZONTALES DINÁMICO SEGÚN LA ERA BÍBLICA */}
          <div ref={chartContainerRef} className="overlaps-timeline-chart">
            <div className="chart-header-axis">
              {axisTicks.map((tick, tIdx) => (
                <span key={tIdx} style={{ left: `${tick.pos}%`, position: 'absolute' }}>
                  {tick.label}
                </span>
              ))}
            </div>

            <div className="chart-bars-list" style={{ marginTop: '2.5rem' }}>
              {overlapPeopleList.map(p => {
                const dates = getPersonDates(p);
                const maxRange = Math.max(1, chartMax - chartMin);
                const leftPct = Math.max(0, Math.min(98, ((dates.birth - chartMin) / maxRange) * 100));
                const widthPct = Math.max(2, Math.min(100 - leftPct, ((dates.death - dates.birth) / maxRange) * 100));

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
                      <small>AM {dates.birth} - {dates.death}</small>
                    </button>

                    <div className="bar-track">
                      <div
                        className={`bar-fill ${isHighlightedInOverlap ? 'fill-gold-glow' : ''}`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        onClick={() => setSelectedPerson(p)}
                        title={`${p.name}: AM ${dates.birth} a AM ${dates.death} (${dates.lifespan || '?'} años)`}
                      >
                        <span className="bar-inner-text">{p.name} ({dates.lifespan}a)</span>
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
