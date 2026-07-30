import './Panels.css';

/**
 * Componente para el Explorador Transversal de las 7 Dispensaciones Bíblicas.
 * Cubre la teología sistemática desde Génesis hasta Apocalipsis.
 */
export function DispensationPanel({ dispensations = [] }) {
  return (
    <div className="panel-container">
      <div className="panel-header">
        <div className="panel-header-titles">
          <span className="genealogy-badge">🌐 MÓDULO TEOLÓGICO TRANSVERSAL (SUITE BÍBLICA)</span>
          <h2>👑 Las 7 Dispensaciones Bíblicas (De Génesis a Apocalipsis)</h2>
          <p>
            Períodos de administración divina en los que Dios prueba la responsabilidad de la humanidad frente a Su verdad revelada. 
            <strong> 4 dispensaciones corresponden al Génesis</strong> y <strong>3 dispensaciones abarcan el Éxodo, la Ley, la Era de la Gracia y el Reino Milenial</strong>.
          </p>
        </div>
      </div>

      <div className="dispensations-list">
        {dispensations.map((d) => (
          <div key={d.id} className={`dispensation-card ${d.in_genesis ? 'genesis-disp-card' : 'global-disp-card'}`}>
            <div className="disp-card-header">
              <div className="disp-badge-row">
                <span className="disp-number-badge">Dispensación #{d.number} de 7</span>
                {d.in_genesis ? (
                  <span className="disp-genesis-tag">📖 Presente en Génesis</span>
                ) : (
                  <span className="disp-global-tag">🌐 Historia Bíblica Global</span>
                )}
              </div>
              <h3>{d.name}</h3>
              <span className="disp-range-tag">{d.chapters_range}</span>
            </div>

            <div className="disp-grid-details">
              <div className="disp-detail-item">
                <strong>👤 Administrador / Mayordomo:</strong>
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
                <strong>🕊️ Gracia y Revelación Redentora:</strong>
                <p>{d.grace}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
