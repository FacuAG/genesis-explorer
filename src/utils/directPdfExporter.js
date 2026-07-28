// Helper para cargar html2pdf.js dinámicamente desde CDN de forma transparente
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

/**
 * MÓDULO ÚNICO DE EXPORTACIÓN PASTORAL EN PDF (Fuente Única de Verdad)
 * Usado idénticamente por:
 * 1. El botón "🖨️ Descargar PDF" de la vista de Púlpito (SermonPulpitView)
 * 2. El botón "🖨️ PDF" de las tarjetas de sermones (UserNotesPanel)
 */
export async function downloadSermonPDFDirect(sermon) {
  try {
    const html2pdf = await loadHtml2Pdf();
    const formattedDate = sermon.updatedAt
      ? new Date(sermon.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    // Contenedor temporal estandarizado con la Plantilla Editorial Pastoral Oficial
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '794px'; // Ancho A4 exacto a 96 DPI (210mm)

    tempContainer.innerHTML = `
      <div id="unified-sermon-pdf-paper" style="
        background: #ffffff !important;
        color: #0f172a !important;
        padding: 20mm 18mm 20mm 18mm !important;
        font-family: Georgia, 'Times New Roman', serif !important;
        font-size: 18px !important;
        line-height: 1.7 !important;
        box-sizing: border-box !important;
      ">
        <style>
          #unified-sermon-pdf-paper h1 {
            font-size: 1.4em !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            border-bottom: 2px solid #2563eb !important;
            padding-bottom: 0.35rem !important;
            margin-top: 1.5rem !important;
            margin-bottom: 0.75rem !important;
            font-family: Georgia, serif !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          #unified-sermon-pdf-paper h2 {
            font-size: 1.22em !important;
            font-weight: 700 !important;
            color: #581c87 !important;
            margin-top: 1.25rem !important;
            margin-bottom: 0.5rem !important;
            font-family: Georgia, serif !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          #unified-sermon-pdf-paper h3 {
            font-size: 1.1em !important;
            font-weight: 700 !important;
            color: #1e3a8a !important;
            margin-top: 1.1rem !important;
            margin-bottom: 0.4rem !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          #unified-sermon-pdf-paper p {
            margin-bottom: 0.85rem !important;
            color: #0f172a !important;
            line-height: 1.7 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            orphans: 3 !important;
            widows: 3 !important;
          }
          #unified-sermon-pdf-paper ul, #unified-sermon-pdf-paper ol {
            padding-left: 2.2rem !important;
            margin: 0.85rem 0 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #unified-sermon-pdf-paper li {
            margin-bottom: 0.4rem !important;
            line-height: 1.7 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #unified-sermon-pdf-paper blockquote {
            background: #f8fafc !important;
            border-left: 4px solid #7c3aed !important;
            padding: 0.85rem 1.2rem !important;
            margin: 1.1rem 0 !important;
            border-radius: 0 8px 8px 0 !important;
            font-size: 0.96em !important;
            color: #334155 !important;
            font-style: italic !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #unified-sermon-pdf-paper blockquote strong {
            color: #4c1d95 !important;
            font-style: normal !important;
          }
          #unified-sermon-pdf-paper p[style*="background"],
          #unified-sermon-pdf-paper div[style*="background"],
          #unified-sermon-pdf-paper h1[style*="background"],
          #unified-sermon-pdf-paper h2[style*="background"],
          #unified-sermon-pdf-paper h3[style*="background"],
          #unified-sermon-pdf-paper li[style*="background"],
          #unified-sermon-pdf-paper blockquote[style*="background"] {
            background: transparent !important;
            background-color: transparent !important;
          }
          #unified-sermon-pdf-paper span[style*="background"],
          #unified-sermon-pdf-paper mark,
          #unified-sermon-pdf-paper font[style*="background"] {
            display: inline !important;
            box-decoration-break: clone !important;
            -webkit-box-decoration-break: clone !important;
            padding: 0.1rem 0.3rem !important;
            border-radius: 3px !important;
            line-height: inherit !important;
            vertical-align: baseline !important;
            margin: 0 0.1rem !important;
          }
        </style>

        <header style="border-bottom: 2px solid #cbd5e1; padding-bottom: 1.2rem; margin-bottom: 1.6rem;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 0.4rem; font-family: system-ui, sans-serif;">DOCUMENTO DE ESTUDIO & HOMILÉTICA PASTORAL</div>
          <h1 style="margin: 0 0 0.75rem 0; font-size: 1.65em; font-weight: 800; color: #0f172a; font-family: Georgia, serif; line-height: 1.25; border: none; padding: 0;">${sermon.title || 'Bosquejo Homilético'}</h1>
          <div style="display: flex; justify-content: space-between; color: #475569; font-size: 0.9em; font-family: system-ui, sans-serif;">
            <div><strong style="color: #0f172a;">PASAJE CLAVE:</strong> ${sermon.passage || 'Génesis'}</div>
            <div><strong style="color: #0f172a;">FECHA:</strong> ${formattedDate}</div>
          </div>
          ${sermon.proposition ? `
            <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 0.8rem 1.1rem; border-radius: 0 8px 8px 0; margin-top: 0.85rem;">
              <span style="display: block; font-size: 0.75rem; font-weight: 800; color: #0369a1; letter-spacing: 1px; text-transform: uppercase; font-family: system-ui, sans-serif;">PROPOSICIÓN / IDEA CENTRAL:</span>
              <p style="margin: 0.25rem 0 0 0; color: #0f172a; font-style: italic; font-size: 1em; line-height: 1.5;">"${sermon.proposition}"</p>
            </div>
          ` : ''}
        </header>

        <div className="spv-doc-body">
          ${sermon.contentHtml || '<p>Bosquejo sin contenido.</p>'}
        </div>

        <footer style="display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #94a3b8; font-family: system-ui, sans-serif;">
          <div>Genesis Explorer — Suite Bible Explorer</div>
          <div>Documento de Estudio Pastoral</div>
        </footer>
      </div>
    `;

    document.body.appendChild(tempContainer);
    const element = tempContainer.firstElementChild;
    const sanitizedTitle = (sermon.title || 'Predicacion').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]/g, '_');

    const opt = {
      margin: [18, 16, 18, 16], // [arriba, izquierda, abajo, derecha] en mm (márgenes simétricos profesionales)
      filename: `${sanitizedTitle}_Documento_Pastoral.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2.5,
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(element).save();
    document.body.removeChild(tempContainer);
  } catch (err) {
    console.error('Error al generar PDF unificado:', err);
    window.print();
  }
}
