import './Panels.css';

/**
 * Componente para el módulo de Preguntas Teológicas Frecuentes.
 */
export function QuestionPanel({ questions = [], bookTitle = 'Génesis' }) {
  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2>❓ Preguntas Teológicas Frecuentes de {bookTitle} ({questions.length})</h2>
        <p>Respuestas exegéticas profundas fundamentadas en las Escrituras.</p>
      </div>

      <div className="questions-list">
        {questions.map((q) => (
          <div key={q.id} className="question-card">
            <h3 className="question-title">{q.question}</h3>
            <p className="question-answer">{q.answer}</p>
            {q.biblical_references && (
              <div className="question-refs">
                <strong>Referencias Bíblicas:</strong> {q.biblical_references.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
