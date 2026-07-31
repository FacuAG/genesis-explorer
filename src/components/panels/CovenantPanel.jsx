import './Panels.css';

/**
 * Componente para el Explorador de Pactos y Promesas Mesiánicas.
 */
export function CovenantPanel({ covenants = [], messianicPromises = [], bookTitle = 'Génesis' }) {
  return (
    <div className="panel-container">
      <div className="panel-section">
        <h2>👑 Pactos Bíblicos en {bookTitle} ({covenants.length})</h2>
        <div className="covenants-grid">
          {covenants.map((cov) => (
            <div key={cov.id} className="covenant-card">
              <div className="covenant-header">
                <h3>{cov.name}</h3>
                <span className="covenant-nature-tag">{cov.nature}</span>
              </div>
              <p className="covenant-desc">{cov.description}</p>
              {cov.key_verse && (
                <blockquote className="covenant-verse">
                  "{cov.key_verse.text}" — <strong>{cov.key_verse.reference}</strong>
                </blockquote>
              )}
              {cov.fulfillment_in_christ && (
                <div className="christ-fulfillment">
                  <strong>✝ Cumplimiento en Cristo:</strong> {cov.fulfillment_in_christ}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section" style={{ marginTop: '2.5rem' }}>
        <h2>✨ Promesas Mesiánicas en {bookTitle} ({messianicPromises.length})</h2>
        <div className="promises-grid">
          {messianicPromises.map((p) => (
            <div key={p.id} className="promise-card">
              <span className="promise-ref-badge">{p.reference}</span>
              <h3>{p.name}</h3>
              <p className="promise-text">"{p.text}"</p>
              <p className="promise-explanation">{p.theological_explanation}</p>
              {p.fulfillment_nt && (
                <p className="promise-nt"><strong>Nuevo Testamento:</strong> {p.fulfillment_nt}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
