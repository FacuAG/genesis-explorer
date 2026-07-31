import { useMemo } from 'react';
import genesisData from '../data/books/genesis.json';
import matthewData from '../data/books/matthew.json';

/**
 * Custom Hook profesional para el consumo desacoplado y optimizado del dataset bíblico (Schema 3.0).
 * Soporta alternar dinámicamente entre Génesis y Mateo.
 */
export function useGenesisData(bookId = 'genesis') {
  const currentData = useMemo(() => {
    return bookId === 'matthew' || bookId === 'mateo' ? matthewData : genesisData;
  }, [bookId]);
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
    (currentData.timeline_events || []).forEach(item => eMap.set(item.id, item));

    const pMap = new Map();
    (currentData.people || []).forEach(item => pMap.set(item.id, item));

    const lMap = new Map();
    (currentData.locations || []).forEach(item => lMap.set(item.id, item));

    const cMap = new Map();
    (currentData.covenants || []).forEach(item => cMap.set(item.id, item));

    const prMap = new Map();
    (currentData.messianic_promises || []).forEach(item => prMap.set(item.id, item));

    const thMap = new Map();
    (currentData.themes || []).forEach(item => thMap.set(item.id, item));

    const qMap = new Map();
    (currentData.questions || []).forEach(item => qMap.set(item.id, item));

    const chMap = new Map();
    (currentData.chapters_map || []).forEach(item => chMap.set(item.chapter_number || item.chapter, item));

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
  }, [currentData]);

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

    const events = (currentData.timeline_events || []).filter(e => {
      const name = (e.name || e.short_name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      // Schema v3.0 usa 'narrative'; schemas anteriores usan 'summary'. Soportar ambos.
      const summary = (e.summary || e.narrative || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || summary.includes(q);
    });


    const people = (currentData.people || []).filter(p => {
      const name = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const meaning = (p.name_meaning || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || meaning.includes(q);
    });

    const locations = (currentData.locations || []).filter(l => {
      const name = (l.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const region = (l.region || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || region.includes(q);
    });

    return { events, people, locations };
  };

  return {
    bookInfo: currentData.metadata || currentData.book_info,
    eras: currentData.eras || [],
    narrativeBlocks: currentData.narrative_blocks || [],
    timelineEvents: currentData.timeline_events || [],
    people: currentData.people || [],
    locations: currentData.locations || [],
    covenants: currentData.covenants || [],
    messianicPromises: currentData.messianic_promises || [],
    themes: currentData.themes || [],
    questions: currentData.questions || [],
    dispensations: currentData.dispensations || [],
    // Normalizar chapters_map: unificar 'chapter' y 'chapter_number' en un solo campo 'chapter'.
    // genesis.json usa 'chapter', matthew.json usa 'chapter_number'. El componente ChapterMapPanel
    // siempre lee c.chapter, por lo que normalizamos aquí para que funcione cualquier libro.
    chaptersMap: (currentData.chapters_map || []).map(c => ({
      ...c,
      chapter: c.chapter ?? c.chapter_number ?? 0
    })),

    notableOverlaps: currentData.notable_overlaps || [],
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
