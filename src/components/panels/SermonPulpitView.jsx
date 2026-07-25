import React, { useState, useEffect } from 'react';
import './SermonPulpitView.css';

export default function SermonPulpitView({ sermon, onClose }) {
  const [fontSize, setFontSize] = useState(18); // 14px - 28px
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Temporizador de Predicación (Cronómetro)
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hours = Math.floor(mins / 60);
    const displayMins = mins % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${displayMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${displayMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = sermon.updatedAt 
    ? new Date(sermon.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="sermon-pulpit-view-overlay">
      {/* BARRA DE HERRAMIENTAS DEL MODO PÚLPITO (Se oculta al imprimir) */}
      <div className="spv-toolbar no-print">
        <div className="spv-left">
          <button className="spv-btn spv-close-btn" onClick={onClose}>
            ✕ Volver al Editor
          </button>
          <span className="spv-badge">🎤 Vista Púlpito & Documento Teológico</span>
        </div>

        {/* CRONÓMETRO DE PREDICACIÓN */}
        <div className="spv-timer-box">
          <span className="spv-timer-icon">⏱️</span>
          <span className="spv-timer-digits">{formatTimer(secondsElapsed)}</span>
          <button
            className="spv-timer-toggle"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            title={isTimerRunning ? 'Pausar cronómetro' : 'Reanudar cronómetro'}
          >
            {isTimerRunning ? '⏸️' : '▶️'}
          </button>
          <button
            className="spv-timer-reset"
            onClick={() => setSecondsElapsed(0)}
            title="Reiniciar cronómetro"
          >
            🔄
          </button>
        </div>

        {/* CONTROLES DE LECTURA E IMPRESIÓN */}
        <div className="spv-right">
          <div className="spv-font-controls">
            <button className="spv-btn-sm" onClick={() => setFontSize(prev => Math.max(14, prev - 2))}>A-</button>
            <span className="spv-font-label">{fontSize}px</span>
            <button className="spv-btn-sm" onClick={() => setFontSize(prev => Math.min(28, prev + 2))}>A+</button>
          </div>

          <button className="spv-btn spv-print-btn" onClick={handlePrint} title="Imprimir o Exportar PDF Pastoral">
            🖨️ Exportar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* HOJA EDITORIAL TEOLÓGICA (Pantalla y PDF/Impresión A4) */}
      <div className="spv-document-container" style={{ fontSize: `${fontSize}px` }}>
        {/* Cabecera Académica / Pastoral */}
        <header className="spv-doc-header">
          <div className="spv-doc-top-tag">DOCUMENTO DE ESTUDIO & HOMILÉTICA PASTORAL</div>
          <h1 className="spv-doc-title">{sermon.title || 'Bosquejo Homilético'}</h1>
          
          <div className="spv-doc-meta-row">
            <span className="spv-meta-item"><strong>PASAJE CLAVE:</strong> {sermon.passage || 'Génesis'}</span>
            <span className="spv-meta-item"><strong>FECHA:</strong> {formattedDate}</span>
          </div>

          {sermon.proposition && (
            <div className="spv-doc-proposition-box">
              <span className="prop-label">PROPOSICIÓN / IDEA CENTRAL:</span>
              <p className="prop-text">"{sermon.proposition}"</p>
            </div>
          )}
        </header>

        {/* Cuerpo Exegético y Bosquejo del Mensaje */}
        <main
          className="spv-doc-body"
          dangerouslySetInnerHTML={{ __html: sermon.contentHtml || '<p>Bosquejo sin contenido.</p>' }}
        />

        {/* Pie de Página Editorial Formal */}
        <footer className="spv-doc-footer">
          <span>Genesis Explorer — Suite Bible Explorer</span>
          <span>Documento Exegético Pastoral</span>
        </footer>
      </div>
    </div>
  );
}
