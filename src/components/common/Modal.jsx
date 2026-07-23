import React, { useEffect } from 'react';
import './Modal.css';

/**
 * Componente Modal profesional reutilizable para Genesis Explorer.
 * Soporta cierre con la tecla Escape, clic en el overlay exterior,
 * bloqueo de scroll del fondo y animaciones suaves de entrada.
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = '850px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-wrapper"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close-btn" onClick={onClose} title="Cerrar (Esc)">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
