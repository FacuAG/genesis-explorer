import React from 'react';
import './Panels.css';

/**
 * Componente para el Explorador de las 4 Dispensaciones Bíblicas del Génesis.
 */
export function DispensationPanel({ dispensations = [] }) {
  // Las 4 dispensaciones principales descritas en Génesis (si no vinieran en JSON)
  const defaultDispensations = [
    {
      id: 'disp_innocence',
      number: 1,
      name: 'Dispensación de la Inocencia',
      chapters_range: 'Génesis 1:28 – 3:6',
      steward: 'Adán y Eva en el Edén',
      responsibility: 'Llenar la tierra, sojuzgarla y no comer del Árbol del Conocimiento del Bien y del Mal.',
      failure: 'Desobediencia a la orden divina comiendo del fruto prohibido tentados por la serpiente.',
      judgment: 'Muerte espiritual, expulsión del Jardín del Edén y maldición sobre la creación.',
      grace: 'El Protoevangelio (Génesis 3:15) y vestiduras de piel provistas por Dios.'
    },
    {
      id: 'disp_conscience',
      number: 2,
      name: 'Dispensación de la Conciencia',
      chapters_range: 'Génesis 3:7 – 8:14',
      steward: 'La Humanidad Post-Caída (Set a Noé)',
      responsibility: 'Hacer el bien guiados por la conciencia moral interna y acercarse a Dios mediante sacrificios.',
      failure: 'Corrupción universal, violencia desbordada e iniquidad continua en los pensamientos del hombre.',
      judgment: 'El Cataclismo del Diluvio Universal que destruyó a toda la humanidad impenitente.',
      grace: 'Preservación de Noé y su familia en el Arca y preservación de la vida animal.'
    },
    {
      id: 'disp_human_gov',
      number: 3,
      name: 'Dispensación del Gobierno Humano',
      chapters_range: 'Génesis 8:15 – 11:32',
      steward: 'Noé y sus descendientes (Sem, Cam, Jafet)',
      responsibility: 'Fructificar, multiplicar, poblar la tierra y administrar la justicia humana (pena capital).',
      failure: 'Rebelión abierta en Babel bajo Nimrod, negándose a dispersarse y buscando auto-exaltación.',
      judgment: 'Confusión de las lenguas en la Torre de Babel y dispersión forzada por toda la tierra.',
      grace: 'Elección soberana de Abram de Ur de los Caldeos para originar una nación bendita.'
    },
    {
      id: 'disp_promise',
      number: 4,
      name: 'Dispensación de la Promesa',
      chapters_range: 'Génesis 12:1 – Éxodo 1:7',
      steward: 'Los Patriarcas (Abraham, Isaac, Jacob, José)',
      responsibility: 'Permanecer en la Tierra Prometida de Canaán confiando en el pacto incondicional de Dios.',
      failure: 'Descensos periódicos a Egipto por hambrunas, faltas de fe y rivalidad tribal.',
      judgment: 'Esclavitud prolongada en Egipto bajo un Faraón que no conocía a José.',
      grace: 'Preservación de la descendencia patriarcal en Goshen y promesa de la gran Redención del Éxodo.'
    }
  ];

  const list = dispensations.length > 0 ? dispensations : defaultDispensations;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2>🕊️ Las 4 Dispensaciones del Génesis</h2>
        <p>Períodos bíblicos de administración divina donde Dios prueba la responsabilidad humana frente a Su revelación.</p>
      </div>

      <div className="dispensations-list">
        {list.map((d) => (
          <div key={d.id} className="dispensation-card">
            <div className="disp-card-header">
              <span className="disp-number-badge">Dispensación #{d.number}</span>
              <h3>{d.name}</h3>
              <span className="disp-range-tag">{d.chapters_range}</span>
            </div>

            <div className="disp-grid-details">
              <div className="disp-detail-item">
                <strong>👤 Administrador:</strong>
                <p>{d.steward}</p>
              </div>

              <div className="disp-detail-item">
                <strong>📜 Responsabilidad Humana:</strong>
                <p>{d.responsibility}</p>
              </div>

              <div className="disp-detail-item warning-item">
                <strong>⚠️ Fracaso Humano:</strong>
                <p>{d.failure}</p>
              </div>

              <div className="disp-detail-item judgment-item">
                <strong>🔥 Juicio Divino:</strong>
                <p>{d.judgment}</p>
              </div>

              <div className="disp-detail-item grace-item">
                <strong>🕊️ Gracia y Promesa:</strong>
                <p>{d.grace}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
