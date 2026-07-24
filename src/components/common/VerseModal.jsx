import React, { useState } from 'react';
import { parseBiblicalRefString, getVerseTextRVR1960 } from '../../data/bible/bibleReader';
import { Modal } from './Modal';
import './VerseModal.css';

/**
 * Modal interactivo para visualizar cualquier versículo de la Biblia en Reina-Valera 1960 (RVR1960).
 */
export function VerseModal({ isOpen, onClose, referenceString, refObj }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Determinar la referencia estructurada
  let parsed = null;
  if (refObj) {
    parsed = {
      book: refObj.book || 'Génesis',
      chapter: refObj.chapter || refObj.chapter_start || 1,
      verseStart: refObj.verse_start || refObj.verse_start_ref || 1,
      verseEnd: refObj.verse_end || refObj.verse_end_ref || null
    };
  } else if (referenceString) {
    parsed = parseBiblicalRefString(referenceString);
  }

  const book = parsed?.book || 'Génesis';
  const chapter = parsed?.chapter || 1;
  const verseStart = parsed?.verseStart || 1;
  const verseEnd = parsed?.verseEnd || null;

  const displayRefStr = verseEnd
    ? `${book} ${chapter}:${verseStart}-${verseEnd}`
    : `${book} ${chapter}:${verseStart}`;

  // Obtener texto bíblico RVR1960
  const verseText = getVerseTextRVR1960(book, chapter, verseStart, verseEnd) ||
    `"Texto bíblico de ${displayRefStr} (Santa Biblia Reina-Valera 1960)."`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${verseText}" — ${displayRefStr} (RVR1960)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📜 Cita Bíblica — Reina-Valera 1960`}>
      <div className="verse-modal-wrapper">
        <div className="verse-modal-header">
          <span className="verse-version-badge">RVR1960</span>
          <h2 className="verse-ref-title">{displayRefStr}</h2>
        </div>

        <div className="verse-body-card">
          <p className="verse-text-content">"{verseText}"</p>
        </div>

        <div className="verse-modal-actions">
          <button className={`copy-verse-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? '✅ Versículo Copiado!' : '📋 Copiar Versículo'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
