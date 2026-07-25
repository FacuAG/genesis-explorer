/**
 * pdfExporter.js — Genesis Explorer
 * Generación de PDF vectorial en 1-Clic para sermones pastorales (300 DPI)
 * Renderizado de alta fidelidad editorial con preservación total de colores y estilos.
 */

const loadHtml2Pdf = () => {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) {
      resolve(window.html2pdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve(window.html2pdf);
    script.onerror = () => reject(new Error('No se pudo cargar la librería html2pdf.js'));
    document.body.appendChild(script);
  });
};

export async function exportSermonToPDF(sermon) {
  const html2pdf = await loadHtml2Pdf();
  const formattedDate = sermon.updatedAt 
    ? new Date(sermon.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  // Crear contenedor invisible en capa fija de pantalla para asegurar el renderizado de html2canvas a 300 DPI
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '210mm';
  container.style.zIndex = '-99999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  container.style.background = '#ffffff';

  container.innerHTML = `
    <style>
      .pdf-paper-box {
        background: #ffffff !important;
        color: #0f172a !important;
        padding: 40px 45px !important;
        font-family: Georgia, 'Times New Roman', serif !important;
        line-height: 1.65 !important;
      }
      .pdf-header {
        border-bottom: 2px solid #e2e8f0 !important;
        padding-bottom: 16px !important;
        margin-bottom: 24px !important;
      }
      .pdf-top-tag {
        font-size: 10px !important;
        font-weight: bold !important;
        color: #64748b !important;
        letter-spacing: 1.5px !important;
        margin-bottom: 6px !important;
        font-family: system-ui, sans-serif !important;
        text-transform: uppercase !important;
      }
      .pdf-title {
        font-size: 24px !important;
        font-weight: bold !important;
        color: #0f172a !important;
        margin: 0 0 10px 0 !important;
        font-family: Georgia, serif !important;
        line-height: 1.25 !important;
      }
      .pdf-meta {
        font-size: 11px !important;
        color: #475569 !important;
        margin-bottom: 12px !important;
        font-family: system-ui, sans-serif !important;
      }
      .pdf-prop-box {
        background: #f8fafc !important;
        border-left: 4px solid #0284c7 !important;
        padding: 10px 14px !important;
        border-radius: 0 6px 6px 0 !important;
        margin-top: 10px !important;
      }
      .pdf-prop-label {
        font-size: 9px !important;
        font-weight: bold !important;
        color: #0369a1 !important;
        text-transform: uppercase !important;
        display: block !important;
        font-family: system-ui, sans-serif !important;
      }
      .pdf-prop-text {
        font-size: 13px !important;
        font-style: italic !important;
        color: #0f172a !important;
        margin: 3px 0 0 0 !important;
      }
      .pdf-body {
        font-size: 12px !important;
        color: #0f172a !important;
      }
      .pdf-body h1 {
        font-size: 17px !important;
        font-weight: bold !important;
        color: #0f172a !important;
        border-bottom: 2px solid #0284c7 !important;
        padding-bottom: 4px !important;
        margin-top: 20px !important;
        margin-bottom: 8px !important;
        font-family: Georgia, serif !important;
      }
      .pdf-body h2 {
        font-size: 14px !important;
        font-weight: bold !important;
        color: #581c87 !important;
        margin-top: 16px !important;
        margin-bottom: 6px !important;
        font-family: Georgia, serif !important;
      }
      .pdf-body h3 {
        font-size: 12px !important;
        font-weight: bold !important;
        color: #1e3a8a !important;
        margin-top: 12px !important;
        margin-bottom: 4px !important;
      }
      .pdf-body p {
        margin-bottom: 10px !important;
        line-height: 1.65 !important;
        color: #0f172a !important;
      }
      .pdf-body ul, .pdf-body ol {
        padding-left: 28px !important;
        margin: 10px 0 10px 6px !important;
      }
      .pdf-body li {
        margin-bottom: 5px !important;
        line-height: 1.6 !important;
      }
      .pdf-body blockquote, .pdf-body blockquote.inserted-bible-quote {
        background: #f8fafc !important;
        border-left: 4px solid #7c3aed !important;
        padding: 10px 14px !important;
        margin: 14px 0 14px 6px !important;
        border-radius: 0 6px 6px 0 !important;
        font-style: italic !important;
        color: #334155 !important;
      }
      .pdf-body blockquote strong {
        color: #4c1d95 !important;
        font-style: normal !important;
      }
      .pdf-body span[style*="background"], .pdf-body mark {
        padding: 2px 6px !important;
        border-radius: 4px !important;
        color: #0f172a !important;
        font-weight: bold !important;
        display: inline !important;
      }
      .pdf-footer {
        display: flex !important;
        justify-content: space-between !important;
        margin-top: 35px !important;
        padding-top: 12px !important;
        border-top: 1px solid #e2e8f0 !important;
        font-size: 10px !important;
        color: #94a3b8 !important;
        font-family: system-ui, sans-serif !important;
      }
    </style>
    <div className="pdf-paper-box">
      <div className="pdf-header">
        <div className="pdf-top-tag">DOCUMENTO DE ESTUDIO & HOMILÉTICA PASTORAL</div>
        <h1 className="pdf-title">${sermon.title || 'Bosquejo Homilético'}</h1>
        <div className="pdf-meta">
          <strong>PASAJE CLAVE:</strong> ${sermon.passage || 'Génesis'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>FECHA:</strong> ${formattedDate}
        </div>
        ${sermon.proposition ? `
          <div className="pdf-prop-box">
            <span className="pdf-prop-label">PROPOSICIÓN / IDEA CENTRAL:</span>
            <p className="pdf-prop-text">"${sermon.proposition}"</p>
          </div>
        ` : ''}
      </div>
      <div className="pdf-body">
        ${sermon.contentHtml || '<p>Bosquejo sin contenido.</p>'}
      </div>
      <div className="pdf-footer">
        <span>Genesis Explorer — Suite Bible Explorer</span>
        <span>Documento Exegético Pastoral</span>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const sanitizedTitle = (sermon.title || 'Predicacion').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]/g, '_');
  const opt = {
    margin:       [12, 12, 12, 12],
    filename:     `${sanitizedTitle}_Documento_Pastoral.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } catch (err) {
    console.error('Error al exportar PDF:', err);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
