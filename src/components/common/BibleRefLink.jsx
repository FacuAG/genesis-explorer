import { useState } from 'react';
import { VerseModal } from './VerseModal';
import './BibleRefLink.css';

/**
 * Componente reutilizable para renderizar referencias bíblicas interactivas clickeables.
 * Al hacer clic abre el modal de lectura del versículo en Reina-Valera 1960.
 */
export function BibleRefLink({ reference, label, className = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayLabel = label || reference || 'Cita Bíblica';

  return (
    <>
      <button
        className={`bible-ref-link-btn ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        title={`Haz clic para leer ${displayLabel} en Reina-Valera 1960`}
      >
        📜 {displayLabel}
      </button>

      {isModalOpen && (
        <VerseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          referenceString={typeof reference === 'string' ? reference : null}
          refObj={typeof reference === 'object' ? reference : null}
        />
      )}
    </>
  );
}
