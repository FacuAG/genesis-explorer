/**
 * pdfExporter.js — Genesis Explorer
 * Generación de PDF vectorial en 1-Clic para sermones pastorales (300 DPI)
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

  // Crear contenedor temporal fuera de pantalla para renderizado limpio
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';

  container.innerHTML = `
    <div style="background: #ffffff; color: #0f172a; padding: 32px 36px; font-family: Georgia, 'Times New Roman', serif; line-height: 1.6;">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 20px;">
        <div style="font-size: 10px; font-weight: bold; color: #64748b; letter-spacing: 1.5px; margin-bottom: 6px; font-family: system-ui, sans-serif;">DOCUMENTO DE ESTUDIO & HOMILÉTICA PASTORAL</div>
        <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin: 0 0 10px 0; font-family: Georgia, serif; line-height: 1.25;">${sermon.title || 'Bosquejo Homilético'}</h1>
        <div style="font-size: 11px; color: #475569; margin-bottom: 12px; font-family: system-ui, sans-serif;">
          <strong>PASAJE CLAVE:</strong> ${sermon.passage || 'Génesis'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>FECHA:</strong> ${formattedDate}
        </div>
        ${sermon.proposition ? `
          <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-top: 10px;">
            <span style="font-size: 9px; font-weight: bold; color: #0369a1; text-transform: uppercase; display: block; font-family: system-ui, sans-serif;">PROPOSICIÓN / IDEA CENTRAL:</span>
            <p style="font-size: 13px; font-style: italic; color: #0f172a; margin: 3px 0 0 0;">"${sermon.proposition}"</p>
          </div>
        ` : ''}
      </div>
      <div style="font-size: 13px; color: #0f172a;">
        ${sermon.contentHtml || '<p>Bosquejo sin contenido.</p>'}
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 35px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; font-family: system-ui, sans-serif;">
        <span>Genesis Explorer — Suite Bible Explorer</span>
        <span>Documento Exegético Pastoral</span>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const sanitizedTitle = (sermon.title || 'Predicacion').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]/g, '_');
  const opt = {
    margin:       [16, 16, 16, 16],
    filename:     `${sanitizedTitle}_Documento_Pastoral.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } finally {
    document.body.removeChild(container);
  }
}
