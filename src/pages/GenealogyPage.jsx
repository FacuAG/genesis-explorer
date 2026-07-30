import { useState } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from "reactflow";

import "reactflow/dist/style.css";

import {
  getPeople,
  getGenesisData
} from "../services/genesisService";

function GenealogyPage() {
  const people = getPeople();
  const data = getGenesisData();
  const relationships = data.relationships || [];

  const [selectedPerson, setSelectedPerson] =
  useState(null);

  const nodes = [];
  const edges = [];

  const generationMap = {};


  const getNodeColor = (person) => {
    if (person.importance >= 5)
      return "#d4af37";

    if (
      person.tags?.includes("messianic")
    )
      return "#7c3aed";

    return "#1e293b";
  };

  people.forEach((person) => {
    const gen = person.generation || 0;

    if (!generationMap[gen]) {
      generationMap[gen] = [];
    }

    generationMap[gen].push(person);
  });

  Object.entries(generationMap).forEach(
    ([generation, persons]) => {
      persons.forEach((person, index) => {
        nodes.push({
          id: person.id,
          position: {
            x: Number(generation) * 300,
            y: index * 120
          },
          data: {
            label: (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: getNodeColor(person),
                  color: "white",
                  border: "1px solid #475569",
                  minWidth: "120px",
                  textAlign: "center",
                  fontWeight: "bold"
                }}
              >
                {person.name}
              </div>
            )
          }
        });
      });
    }
  );

  relationships
  .filter(r => r.type === "parent")
  .forEach(rel => {
    edges.push({
      id: rel.id,
      source: rel.from,
      target: rel.to,
      type: "smoothstep",
      animated: false,
      markerEnd: {
        type: "arrowclosed"
      }
    });
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100vh"
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodeClick={(e, node) => {
          const person = people.find(
            p => p.id === node.id
          );

          setSelectedPerson(person);
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {selectedPerson && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: 350,
            height: "100vh",
            background: "#111",
            color: "white",
            padding: 20,
            overflowY: "auto",
            borderLeft: "1px solid #444",
            zIndex: 9999
          }}
        >
          <button
            onClick={() =>
              setSelectedPerson(null)
            }
          >
            X
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h2>{selectedPerson.name}</h2>

            <button
              onClick={() => {
                const node = nodes.find(
                  n => n.id === selectedPerson.id
                );

                if (node) {
                  console.log(node);
                }
              }}
            >
              Centrar
            </button>
          </div>

          <p>
            <strong>ID:</strong> {selectedPerson.id}
          </p>

          <p>
            <strong>Categoría:</strong>{" "}
            {selectedPerson.category}
          </p>

          <p>
            <strong>Nacimiento:</strong>{" "}
            {selectedPerson.birth_am}
          </p>

          <p>
            <strong>Muerte:</strong>{" "}
            {selectedPerson.death_am}
          </p>

          <p>
            <strong>Importancia:</strong>{" "}
            {selectedPerson.importance}
          </p>

          <p>
            <strong>Generación:</strong>{" "}
            {selectedPerson.generation}
          </p>

          <p>
            <strong>Descripción:</strong>
            <br />
            {selectedPerson.description}
          </p>

          <p>
            <strong>Enseñanza:</strong>
            <br />
            {selectedPerson.teaching}
          </p>
        </div>
      )}
    </div>
  );
}

export default GenealogyPage;