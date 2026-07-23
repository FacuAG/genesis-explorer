import React from 'react';
import './Panels.css';

/**
 * Componente para el Explorador de Geografía y Ubicaciones de Génesis.
 */
export function LocationPanel({ locations }) {
  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2>📍 Ubicaciones Geográficas del Génesis ({locations.length})</h2>
        <p>Lugares bíblicos estratégicos con descripción histórica, coordenadas y eventos asociados.</p>
      </div>

      <div className="locations-grid">
        {locations.map((loc) => (
          <div key={loc.id} className="location-card">
            <div className="location-card-header">
              <h3>{loc.name}</h3>
              <span className="location-region-tag">{loc.region}</span>
            </div>
            <p className="location-modern">🌍 <em>Ubicación Moderna:</em> {loc.modern_country}</p>
            <p className="location-desc">{loc.description}</p>
            <p className="location-significance"><strong>Significado:</strong> {loc.significance}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
