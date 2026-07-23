import genesisData from "../data/genesis-v3.json";

export const getGenesisData = () => genesisData;

export const getTimelineEvents = () =>
  genesisData.timeline_events || [];

export const getPeople = () =>
  genesisData.people || [];

export const getLocations = () =>
  genesisData.locations || [];

export const getCovenants = () =>
  genesisData.covenants || [];

export const getPromises = () =>
  genesisData.messianic_promises || [];

export const getQuestions = () =>
  genesisData.questions || [];

export const getDispensations = () =>
  genesisData.dispensations || [];

export const getRelationships = () =>
  genesisData.relationships || [];

export const getHierarchy = () =>
  genesisData.hierarchy || [];

export const getOverlaps = () =>
  genesisData.notable_overlaps || [];

export const getEventById = (id) =>
  genesisData.timeline_events?.find(
    (event) => event.id === id
  );

export const getPersonById = (id) =>
  genesisData.people?.find(
    (person) => person.id === id
  );

export const searchEverything = (term) => {
  const search = term.toLowerCase();

  return {
    people: getPeople().filter((p) =>
      p.name?.toLowerCase().includes(search)
    ),

    events: getTimelineEvents().filter((e) =>
      e.name?.toLowerCase().includes(search)
    ),

    locations: getLocations().filter((l) =>
      l.name?.toLowerCase().includes(search)
    ),

    covenants: getCovenants().filter((c) =>
      c.name?.toLowerCase().includes(search)
    ),
  };
};

export const getParents = (person) => {
  if (!person || !person.parents) return [];

  return person.parents
    .map(id =>
      genesisData.people.find(p => p.id === id)
    )
    .filter(Boolean);
};

export const getChildren = (person) => {
  if (!person) return [];

  return genesisData.people.filter(
    p => p.parents?.includes(person.id)
  );
};

export const getSpouses = (person) => {
  if (!person) return [];

  const spouseIds = [];

  if (person.spouse)
    spouseIds.push(person.spouse);

  if (person.spouses)
    spouseIds.push(...person.spouses);

  return spouseIds
    .map(id =>
      genesisData.people.find(p => p.id === id)
    )
    .filter(Boolean);
};

export const getLocationById = (id) =>
  genesisData.locations?.find(l => l.id === id);

export const getPromiseByPerson = (personId) =>
  genesisData.messianic_promises?.filter(
    p => p.through?.includes(personId)
  ) || [];

export const getEventsByPerson = (personId) =>
  genesisData.timeline_events?.filter(
    e =>
      e.related_people?.includes(personId)
  ) || [];