import React, { useState, useEffect } from 'react';
import './SermonPulpitView.css';

export default function SermonPulpitView({ sermon, onClose }) {
  const [fontSize, setFontSize] = useState(20); // 16px - 32px
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

  return (
    <div className="sermon-pulpit-view-overlay">
      {/* BARRA DE HERRAMIENTAS DEL MODO PÚLPITO */}
      <div className="spv-toolbar no-print">
        <div className="spv-left">
          <button className="spv-btn spv-close-btn" onClick={onClose}>
            ✕ Salir del Modo Púlpito
          </button>
          <span className="spv-badge">🎤 Vista de Lectura para el Altar</span>
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

        {/* CONTROLES DE TAMAÑO DE LETRA E IMPRESIÓN */}
        <div className="spv-right">
          <div className="spv-font-controls">
            <button className="spv-btn-sm" onClick={() => setFontSize(prev => Math.max(16, prev - 2))}>A-</button>
            <span className="spv-font-label">{fontSize}px</span>
            <button className="spv-btn-sm" onClick={() => setFontSize(prev => Math.min(32, prev + 2))}>A+</button>
          </div>

          <button className="spv-btn spv-print-btn" onClick={handlePrint} title="Imprimir o Guardar en PDF">
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO PRINCIPAL DEL SERMÓN (HOJA PÚLPITO / IMPRESIÓN A4) */}
      <div className="spv-document-container" style={{ fontSize: `${fontSize}px` }}>
        {/* Encabezado del Mensaje */}
        <div className="spv-doc-header">
          <h1 className="spv-doc-title">{sermon.title}</h1>
          <div className="spv-doc-meta">
            <span className="spv-meta-item">📖 <strong>Pasaje Base:</strong> {sermon.passage}</span>
            {sermon.updatedAt && (
              <span className="spv-meta-item">📅 {new Date(sermon.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            )}
          </div>
          {sermon.proposition && (
            <div className="spv-doc-proposition">
              <strong>Idea Central / Proposición:</strong>
              <p>"{sermon.proposition}"</p>
            </div>
          )}
        </div>

        {/* Cuerpo del Bosquejo Homilético */}
        <div
          className="spv-doc-body"
          dangerouslySetInnerHTML={{ __html: sermon.contentHtml || '<p>Bosquejo sin contenido.</p>' }}
        />

        {/* Pie de Página Imprimible */}
        <div className="spv-doc-footer print-only">
          <p>Genesis Explorer — Suite Bible Explorer | Hoja de Predicación Generada</p>
        </div>
      </div>
    </div>
  );
}
