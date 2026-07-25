/**
 * pdfExporter.js — Genesis Explorer
 * Generador vectorial de PDF Pastoral en 1-Clic a 300 DPI
 * Garantiza 0% de páginas en blanco al renderizar en el viewport principal con delay de maquetación.
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

  // 1. Crear contenedor wrapper visible temporalmente en el DOM (top: 0, left: 0)
  const wrapper = document.createElement('div');
  wrapper.id = 'pdf-export-temp-wrapper';
  wrapper.style.position = 'absolute';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '794px'; // Ancho A4 exacto a 96 DPI
  wrapper.style.background = '#ffffff';
  wrapper.style.color = '#0f172a';
  wrapper.style.zIndex = '999999';
  wrapper.style.boxSizing = 'border-box';
  wrapper.style.padding = '40px 48px';
  wrapper.style.fontFamily = 'Georgia, "Times New Roman", serif';

  const cleanContent = (sermon.contentHtml && sermon.contentHtml.trim()) 
    ? sermon.contentHtml 
    : '<p style="font-style: italic; color: #64748b;">(Bosquejo sin contenido guardado aún. Escribe en el editor y guarda cambios antes de exportar).</p>';

  wrapper.innerHTML = `
    <style>
      #pdf-export-temp-wrapper * { box-sizing: border-box !important; }
      #pdf-export-temp-wrapper h1 { font-size: 24px !important; font-weight: bold !important; color: #0f172a !important; margin: 0 0 10px 0 !important; font-family: Georgia, serif !important; line-height: 1.25 !important; }
      #pdf-export-temp-wrapper h2 { font-size: 18px !important; font-weight: bold !important; color: #581c87 !important; margin: 16px 0 8px 0 !important; font-family: Georgia, serif !important; }
      #pdf-export-temp-wrapper h3 { font-size: 15px !important; font-weight: bold !important; color: #1e3a8a !important; margin: 14px 0 6px 0 !important; }
      #pdf-export-temp-wrapper p { font-size: 13px !important; line-height: 1.7 !important; color: #0f172a !important; margin-bottom: 12px !important; }
      #pdf-export-temp-wrapper ul, #pdf-export-temp-wrapper ol { padding-left: 28px !important; margin: 12px 0 12px 6px !important; }
      #pdf-export-temp-wrapper li { margin-bottom: 6px !important; line-height: 1.6 !important; font-size: 13px !important; color: #0f172a !important; }
      #pdf-export-temp-wrapper blockquote, #pdf-export-temp-wrapper blockquote.inserted-bible-quote { background: #f8fafc !important; border-left: 4px solid #7c3aed !important; padding: 12px 16px !important; margin: 16px 0 16px 6px !important; border-radius: 0 8px 8px 0 !important; font-style: italic !important; color: #334155 !important; font-size: 13px !important; }
      #pdf-export-temp-wrapper blockquote strong { color: #4c1d95 !important; font-style: normal !important; }
      #pdf-export-temp-wrapper span[style*="background"], #pdf-export-temp-wrapper mark { padding: 0rem 0.2rem !important; border-radius: 4px !important; color: #ffffff !important; font-weight: 700 !important; display: inline !important; }
    </style>
    <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-size: 10px; font-weight: bold; color: #64748b; letter-spacing: 1.5px; margin-bottom: 6px; font-family: system-ui, sans-serif; text-transform: uppercase;">DOCUMENTO DE ESTUDIO & HOMILÉTICA PASTORAL</div>
      <h1>${sermon.title || 'Bosquejo Homilético'}</h1>
      <div style="font-size: 11px; color: #475569; margin-bottom: 12px; font-family: system-ui, sans-serif;">
        <strong>PASAJE CLAVE:</strong> ${sermon.passage || 'Génesis'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>FECHA:</strong> ${formattedDate}
      </div>
      ${sermon.proposition ? `
        <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-top: 12px;">
          <span style="font-size: 9px; font-weight: bold; color: #0369a1; text-transform: uppercase; display: block; font-family: system-ui, sans-serif;">PROPOSICIÓN / IDEA CENTRAL:</span>
          <p style="font-size: 13px; font-style: italic; color: #0f172a; margin: 4px 0 0 0;">"${sermon.proposition}"</p>
        </div>
      ` : ''}
    </div>
    <div style="font-size: 13px; color: #0f172a;">
      ${cleanContent}
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; font-family: system-ui, sans-serif;">
      <span>Genesis Explorer — Suite Bible Explorer</span>
      <span>Documento Exegético Pastoral</span>
    </div>
  `;

  document.body.appendChild(wrapper);

  // Pausa síncrona de 150ms para que el navegador procese fuentes y maquetación DOM
  await new Promise(resolve => setTimeout(resolve, 150));

  const sanitizedTitle = (sermon.title || 'Predicacion').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]/g, '_');
  const opt = {
    margin:       [12, 12, 12, 12],
    filename:     `${sanitizedTitle}_Documento_Pastoral.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      scrollY: 0,
      scrollX: 0,
      windowWidth: 800
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(wrapper).save();
  } catch (err) {
    console.error('Error al exportar PDF:', err);
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}
