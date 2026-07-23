import { useMemo } from 'react';
import genesisData from '../data/books/genesis.json';

/**
 * Custom Hook profesional para el consumo desacoplado y optimizado del dataset bíblico de Génesis (Schema 3.0).
 * Proporciona colecciones pre-indexadas con useMemo para garantizar rendimiento de velocidad extrema.
 */
export function useGenesisData() {
  // Indexación O(1) de entidades para búsquedas instantáneas en la UI
  const {
    eventsMap,
    peopleMap,
    locationsMap,
    covenantsMap,
    promisesMap,
    themesMap,
    questionsMap,
    chaptersMap
  } = useMemo(() => {
    const eMap = new Map();
    (genesisData.timeline_events || []).forEach(item => eMap.set(item.id, item));

    const pMap = new Map();
    (genesisData.people || []).forEach(item => pMap.set(item.id, item));

    const lMap = new Map();
    (genesisData.locations || []).forEach(item => lMap.set(item.id, item));

    const cMap = new Map();
    (genesisData.covenants || []).forEach(item => cMap.set(item.id, item));

    const prMap = new Map();
    (genesisData.messianic_promises || []).forEach(item => prMap.set(item.id, item));

    const thMap = new Map();
    (genesisData.themes || []).forEach(item => thMap.set(item.id, item));

    const qMap = new Map();
    (genesisData.questions || []).forEach(item => qMap.set(item.id, item));

    const chMap = new Map();
    (genesisData.chapters_map || []).forEach(item => chMap.set(item.chapter, item));

    return {
      eventsMap: eMap,
      peopleMap: pMap,
      locationsMap: lMap,
      covenantsMap: cMap,
      promisesMap: prMap,
      themesMap: thMap,
      questionsMap: qMap,
      chaptersMap: chMap
    };
  }, []);

  // Helper functions exportadas para el resto de la aplicación
  const getEventById = (id) => eventsMap.get(id) || null;
  const getPersonById = (id) => peopleMap.get(id) || null;
  const getLocationById = (id) => locationsMap.get(id) || null;
  const getCovenantById = (id) => covenantsMap.get(id) || null;
  const getMessianicPromiseById = (id) => promisesMap.get(id) || null;
  const getChapterByNumber = (chapNum) => chaptersMap.get(Number(chapNum)) || null;

  /**
   * Buscador global multi-entidad con filtro insensible a mayúsculas/minúsculas y acentos.
   */
  const searchAll = (query) => {
    if (!query || query.trim().length === 0) return { events: [], people: [], locations: [] };
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const events = (genesisData.timeline_events || []).filter(e => {
      const name = (e.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const summary = (e.summary || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || summary.includes(q);
    });

    const people = (genesisData.people || []).filter(p => {
      const name = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const meaning = (p.name_meaning || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || meaning.includes(q);
    });

    const locations = (genesisData.locations || []).filter(l => {
      const name = (l.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const region = (l.region || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || region.includes(q);
    });

    return { events, people, locations };
  };

  return {
    bookInfo: genesisData.book_info,
    eras: genesisData.eras || [],
    narrativeBlocks: genesisData.narrative_blocks || [],
    timelineEvents: genesisData.timeline_events || [],
    people: genesisData.people || [],
    locations: genesisData.locations || [],
    covenants: genesisData.covenants || [],
    messianicPromises: genesisData.messianic_promises || [],
    themes: genesisData.themes || [],
    questions: genesisData.questions || [],
    chaptersMap: genesisData.chapters_map || [],
    notableOverlaps: genesisData.notable_overlaps || [],
    // Maps indexados O(1)
    eventsMap,
    peopleMap,
    locationsMap,
    covenantsMap,
    promisesMap,
    themesMap,
    questionsMap,
    // Functions
    getEventById,
    getPersonById,
    getLocationById,
    getCovenantById,
    getMessianicPromiseById,
    getChapterByNumber,
    searchAll
  };
}
