import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getTimelineEvents, getPeople } from "../services/genesisService";
import { useState } from "react";
import { getGenesisData } from "../services/genesisService";
import {
  getParents,
  getChildren,
  getSpouses
} from "../services/genesisService";
import {
  getEventsByPerson,
  getPromiseByPerson,
  getLocationById
} from "../services/genesisService";

function TimelinePage() {

  const events = getTimelineEvents();
  const people = getPeople();
  const data = getGenesisData();

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const YEAR_SCALE = 2.5;
  const WIDTH = 7000;

  const peopleWithDates = people
   
    .sort((a, b) => {
      const ga = a.generation ?? 999;
      const gb = b.generation ?? 999;

      if (ga !== gb) {
        return ga - gb;
      }

      return (
        (a.birth_am || 0) -
        (b.birth_am || 0)
      );
    });

  const peopleMap = Object.fromEntries(
    people.map((p) => [p.id, p])
  );

  const getPersonName = (id) => {
    const person = data.people.find((p) => p.id === id);
    return person ? person.name : id;
  };

  const getParent = (person) => {
    if (!person.parents?.length) return null;

    return people.find(
      p => p.id === person.parents[0]
    );
  };

  const getPersonById = (id) => {
    return data.people.find((p) => p.id === id);
  };

  const getPersonY = (personId) => {
    const index = peopleWithDates.findIndex(
      (p) => p.id === personId
    );

    if (index === -1) return null;

    return 250 + index * 45;
  };
  
  const parents = selectedPerson
  ? getParents(selectedPerson)
  : [];

  const children = selectedPerson
    ? getChildren(selectedPerson)
    : [];

  const spouses = selectedPerson
    ? getSpouses(selectedPerson)
    : [];

  const personEvents = selectedPerson
  ? events.filter(event =>
      event.related_people?.includes(selectedPerson.id)
    )
  : [];

  const personPromises = selectedPerson
    ? data.messianic_promises.filter(p =>
        p.through?.includes(selectedPerson.id)
      )
    : [];

  const personLocation =
    selectedPerson?.location
      ? data.locations.find(
          l => l.id === selectedPerson.location
        )
      : null;

  const isRelatedToSelected = (person) => {
    if (!selectedPerson) return false;

    if (person.id === selectedPerson.id) return true;

    const parents = getParents(selectedPerson);
    const children = getChildren(selectedPerson);
    const spouses = getSpouses(selectedPerson);

    return (
      parents.some(p => p.id === person.id) ||
      children.some(c => c.id === person.id) ||
      spouses.some(s => s.id === person.id)
    );
  };

  const getPersonColor = (person) => {
    switch (person.category?.toLowerCase()) {
      case "patriarch":
        return "#ffd700";

      case "woman":
        return "#ff69b4";

      case "messianic":
        return "#9c27b0";

      default:
        return "#3cb371";
    }
  };

  const relationshipLines = [];

  if (selectedPerson) {

    parents.forEach(parent => {
      relationshipLines.push({
        from: parent.id,
        to: selectedPerson.id,
        color: "#ff4444"
      });
    });

    children.forEach(child => {
      relationshipLines.push({
        from: selectedPerson.id,
        to: child.id,
        color: "#44aaff"
      });
    });

    spouses.forEach(spouse => {
      relationshipLines.push({
        from: selectedPerson.id,
        to: spouse.id,
        color: "#ff66cc"
      });
    });

  }

  const focusPerson = (person) => {
    setSelectedPerson(person);

    if (!window.timelineRef) return;

    const row = rowMap[person.id] ?? 0;

    const x =
      person.birth_am != null
        ? person.birth_am * YEAR_SCALE
        : ((getParent(person)?.birth_am || 0) *
            YEAR_SCALE) +
          120;

    const y = 250 + row * 45;

    window.timelineRef.setTransform(
      -x + window.innerWidth / 2,
      -y + window.innerHeight / 2,
      1,
      400
    );
  };

  const getEventY = (event) => {
    const year = event.approx_year_am || 0;

    const nearbyEvents = events.filter(
      e =>
        Math.abs(
          (e.approx_year_am || 0) - year
        ) < 50
    );

    const position = nearbyEvents.findIndex(
      e => e.id === event.id
    );

    return 60 + position * 70;
  };

  const getEventX = (event) => {
    const year = event.approx_year_am || 0;

    const nearbyEvents = events.filter(
      e =>
        Math.abs(
          (e.approx_year_am || 0) - year
        ) < 50
    );

    const position = nearbyEvents.findIndex(
      e => e.id === event.id
    );

    return (
      year * YEAR_SCALE +
      position * 40
    );
  };

  const generationMap = {};

  people.forEach((person) => {
    const gen = person.generation ?? 999;

    if (!generationMap[gen]) {
      generationMap[gen] = [];
    }

    generationMap[gen].push(person);
  });

  const rowMap = {};

  let currentRow = 0;

  Object.keys(generationMap)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((gen) => {
      generationMap[gen].forEach((person) => {
        rowMap[person.id] = currentRow;
        currentRow++;
      });

      currentRow += 1;
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#111",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 15,
          left: 15,
          zIndex: 9999
        }}
      >
        <input
          type="text"
          placeholder="Buscar persona..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: 250,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #555",
            background: "#222",
            color: "white"
          }}
        />

        {search && (
          <div
            style={{
              background: "#222",
              border: "1px solid #444",
              maxHeight: 300,
              overflowY: "auto"
            }}
          >
            {filteredPeople.slice(0, 20).map((person) => (
              <div
                key={person.id}
                onClick={() => {
                  focusPerson(person);
                  setSearch("");
                }}
                style={{
                  padding: 10,
                  cursor: "pointer",
                  borderBottom: "1px solid #333"
                }}
              >
                {person.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <TransformWrapper
        ref={(ref) => (window.timelineRef = ref)}
        initialScale={0.5}
        minScale={0.2}
        maxScale={5}
        wheel={{ step: 0.001 }}
        centerOnInit
      >
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              width: WIDTH,
              height: peopleWithDates.length * 45 + 700,
              background: "#181818",
            }}
          >
            {/* Escala */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: i * 250,
                  top: 20,
                }}
              >
                <div
                  style={{
                    width: 2,
                    height: 20,
                    background: "#555",
                  }}
                />

                <div
                  style={{
                    color: "#888",
                    fontSize: 12,
                  }}
                >
                  {i * 100} AM
                </div>
              </div>
            ))}

            {/* Eventos */}
            {events.map((event, index) => {
              const x = getEventX(event);
              const y = getEventY(event);

              return (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setSelectedPerson(null);
                  }}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background:
                        selectedEvent?.id === event.id
                          ? "#ffd700"
                          : isEventRelatedToSelected(event)
                          ? "#22c55e"
                          : "#00bfff",
                      border: "2px solid white",
                      marginBottom: 6
                    }}
                  />

                  <div
                    style={{
                      background:
                        selectedEvent?.id === event.id
                          ? "#ffd700"
                          : isEventRelatedToSelected(event)
                          ? "#14532d"
                          : "#1f2937",
                      opacity:
                        selectedPerson &&
                        !isEventRelatedToSelected(event)
                          ? 0.25
                          : 1,
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border:
                        selectedEvent?.id === event.id
                          ? "2px solid #fff"
                          : isEventRelatedToSelected(event)
                          ? "1px solid #22c55e"
                          : "1px solid #444",
                      width: 120,
                      fontSize: 11,
                      boxShadow: "0 2px 8px rgba(0,0,0,.35)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        marginBottom: 4
                      }}
                    >
                      {event.name}
                    </div>

                    {event.approx_year_am && (
                      <div
                        style={{
                          color: "#999",
                          fontSize: 11
                        }}
                      >
                        {event.approx_year_am} AM
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Línea horizontal */}
            <div
              style={{
                position: "absolute",
                top: 160,
                left: 0,
                width: WIDTH,
                height: 2,
                background: "#444",
              }}
            />

            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 350 + i * 90,
                  color: "#666",
                  fontSize: 12,
                  width: 100
                }}
              >
                Gen {i}
              </div>
            ))}

            {/* VIDAS */}
            {peopleWithDates.map((person) => {
              const parent = getParent(person);

              const x =
                person.birth_am != null
                  ? person.birth_am * YEAR_SCALE
                  : parent?.birth_am != null
                  ? parent.birth_am * YEAR_SCALE + 120
                  : 50;

              const width =
                person.birth_am != null &&
                person.death_am != null
                  ? (person.death_am - person.birth_am) *
                    YEAR_SCALE
                  : 10;

              const row =
                rowMap[person.id] ?? 0;

              const y = 350 + row * 45;

              return (
                <div key={person.id}>
                  {/* nombre */}

                  <div
                    onClick={() => focusPerson(person)}
                    style={{
                      position: "absolute",
                      left: Math.max(10, x - 110),
                      top: y - 6,
                      width: 100,
                      textAlign: "right",
                      color:
                        selectedPerson?.id === person.id
                          ? "#ffd700"
                          : isRelatedToSelected(person)
                          ? "#00ff88"
                          : "white",
                      opacity:
                        selectedPerson &&
                        selectedPerson.id !== person.id &&
                        !isRelatedToSelected(person)
                          ? 0.25
                          : 1,
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      userSelect: "none"
                    }}
                  >
                    {person.name}
                  </div>

                  {/* barra */}
                  
                  <div
                    onClick={() => focusPerson(person)}
                    style={{
                      background:
                        person.birth_am != null &&
                        person.death_am != null
                          ? getPersonColor(person)
                          : "transparent",

                      border:
                        person.birth_am != null &&
                        person.death_am != null
                          ? "none"
                          : "2px dashed #999",
                          
                      opacity:
                        selectedPerson &&
                        selectedPerson.id !== person.id &&
                        !isRelatedToSelected(person)
                          ? 0.25
                          : 1,
                      cursor: "pointer",
                      position: "absolute",
                      left: x,
                      top: y,
                      width: width,
                      height: 12,
                      borderRadius: 6,
                    }}
                  />
                </div>
              );
            })}

          </div>
        </TransformComponent>
      </TransformWrapper>
      
      {selectedPerson && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: "350px",
            height: "100vh",
            background: "#222",
            color: "white",
            padding: "20px",
            overflowY: "auto",
            borderLeft: "1px solid #444",
            zIndex: 9999
          }}
        >
          <button
            onClick={() => focusPerson(null)}
            style={{
              float: "right"
            }}
          >
            X
          </button>

          <h2>{selectedPerson.name}</h2>

          <p>
            <strong>Categoría:</strong>{" "}
            {selectedPerson.category}
          </p>

          <p>
            <strong>Nacimiento:</strong>{" "}
            {selectedPerson.birth_am ?? "-"}
          </p>

          <p>
            <strong>Muerte:</strong>{" "}
            {selectedPerson.death_am ?? "-"}
          </p>

          <p>
            <strong>Vida:</strong>{" "}
            {selectedPerson.lifespan ?? "-"} años
          </p>

          {personLocation && (
            <p>
              <strong>Ubicación:</strong>{" "}
              {personLocation.name}
            </p>
          )}

          {parents.length > 0 && (
            <>
              <h3>Padres</h3>

              <ul>
                {parents.map(parent => (
                  <li
                    key={parent.id}
                    style={{
                      cursor: "pointer",
                      color: "#1976d2"
                    }}
                    onClick={() => focusPerson(parent)}
                  >
                    {parent.name}
                  </li>
                ))}
              </ul>
            </>
          )}

          {children.length > 0 && (
            <>
              <h3>Hijos</h3>

              <ul>
                {children.map(child => (
                  <li
                    key={child.id}
                    style={{
                      cursor: "pointer",
                      color: "#1976d2"
                    }}
                    onClick={() => focusPerson(child)}
                  >
                    {child.name}
                  </li>
                ))}
              </ul>
            </>
          )}

          {spouses.length > 0 && (
            <>
              <h3>Cónyuge(s)</h3>

              <ul>
                {spouses.map(spouse => (
                  <li
                    key={spouse.id}
                    style={{
                      cursor: "pointer",
                      color: "#1976d2"
                    }}
                    onClick={() => focusPerson(spouse)}
                  >
                    {spouse.name}
                  </li>
                ))}
              </ul>
            </>
          )}

          {selectedPerson.special && (
            <p>
              <strong>Especial:</strong>{" "}
              {selectedPerson.special}
            </p>
          )}

          {personEvents.length > 0 && (
            <>
              <h3>Eventos relacionados</h3>

              <ul>
                {personEvents.map((event) => (
                  <li key={event.id}>
                    {event.name}
                    {event.approx_year_am &&
                      ` (${event.approx_year_am} AM)`}
                  </li>
                ))}
              </ul>
            </>
          )}

          {personPromises.length > 0 && (
            <>
              <h3>Promesas mesiánicas</h3>

              <ul>
                {personPromises.map((promise) => (
                  <li key={promise.id}>
                    {promise.title}
                  </li>
                ))}
              </ul>
            </>
          )}

          {selectedPerson.verses?.map((verse, i) => (
            <blockquote key={i}>
              <p>{verse.text}</p>

              <small>
                <strong>{verse.reference}</strong>
              </small>
            </blockquote>
          ))}
        </div>
      )}
      {selectedEvent && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: "350px",
            height: "100vh",
            background: "#222",
            color: "white",
            padding: "20px",
            overflowY: "auto",
            borderLeft: "1px solid #444",
            zIndex: 9999
          }}
        >
          <button
            onClick={() => setSelectedEvent(null)}
            style={{
              float: "right"
            }}
          >
            X
          </button>

          <h2>{selectedEvent.name}</h2>

          <p>
            <strong>Año:</strong>{" "}
            {selectedEvent.approx_year_am ?? "-"} AM
          </p>

          {selectedEvent.category && (
            <p>
              <strong>Categoría:</strong>{" "}
              {selectedEvent.category}
            </p>
          )}

          {selectedEvent.description && (
            <>
              <h3>Descripción</h3>
              <p>{selectedEvent.description}</p>
            </>
          )}

          {selectedEvent.teaching && (
            <>
              <h3>Enseñanza</h3>
              <p>{selectedEvent.teaching}</p>
            </>
          )}

          {selectedEvent.related_people?.length > 0 && (
            <>
              <h3>Personas relacionadas</h3>

              <ul>
                {selectedEvent.related_people.map(id => {
                  const person =
                    data.people.find(
                      p => p.id === id
                    );

                  if (!person) return null;

                  return (
                    <li
                      key={id}
                      style={{
                        cursor: "pointer",
                        color: "#4fc3f7"
                      }}
                      onClick={() => {
                        setSelectedEvent(null);
                        focusPerson(person);
                      }}
                    >
                      {person.name}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {selectedEvent.verses?.map((verse, i) => (
            <blockquote key={i}>
              <p>{verse.text}</p>

              <small>
                <strong>
                  {verse.reference}
                </strong>
              </small>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimelinePage;