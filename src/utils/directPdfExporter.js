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

// Función principal exportable para descargar el PDF 100% idéntico a la pantalla a 1-Clic
export async function downloadSermonPDFDirect(sermon) {
  try {
    const html2pdf = await loadHtml2Pdf();
    
    // Obtener el nodo visual de la hoja editorial `#sermon-pdf-paper`
    let element = document.getElementById('sermon-pdf-paper');
    
    // Si el usuario presiona el botón desde la tarjeta y el modal no está montado, creamos un contenedor temporal idéntico
    let tempContainer = null;
    if (!element) {
      const formattedDate = sermon.updatedAt 
        ? new Date(sermon.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

      tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '800px';

      tempContainer.innerHTML = `
        <div id="temp-sermon-pdf-paper" className="pdf-paper-wrapper" style="background:#ffffff; color:#0f172a; padding:2.5rem 3rem; font-family:Georgia, 'Times New Roman', serif; line-height:1.75;">
          <header style="border-bottom:2px solid #e2e8f0; padding-bottom:1.25rem; margin-bottom:1.75rem;">
            <div style="font-size:0.78rem; font-weight:800; color:#64748b; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:0.5rem; font-family:system-ui, sans-serif;">DOCUMENTO DE ESTUDIO & HOMILÉTICA PASTORAL</div>
            <h1 style="margin:0 0 0.85rem 0; font-size:2.2em; font-weight:800; color:#0f172a; font-family:Georgia, serif; line-height:1.25;">${sermon.title || 'Bosquejo Homilético'}</h1>
            <div style="display:flex; justify-content:space-between; color:#475569; font-size:0.9em; margin-bottom:1.2rem; font-family:system-ui, sans-serif;">
              <div><strong>PASAJE CLAVE:</strong> ${sermon.passage || 'Génesis'}</div>
              <div><strong>FECHA:</strong> ${formattedDate}</div>
            </div>
            ${sermon.proposition ? `
              <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:0.85rem 1.2rem; border-radius:0 8px 8px 0; margin-top:0.85rem;">
                <span style="display:block; font-size:0.75rem; font-weight:800; color:#0369a1; letter-spacing:1px; text-transform:uppercase; font-family:system-ui, sans-serif;">PROPOSICIÓN / IDEA CENTRAL:</span>
                <p style="margin:0.3rem 0 0 0; color:#0f172a; font-style:italic; font-size:1.05em;">"${sermon.proposition}"</p>
              </div>
            ` : ''}
          </header>
          <div className="spv-doc-body" style="font-size:1em; color:#0f172a;">
            ${sermon.contentHtml || '<p>Bosquejo sin contenido.</p>'}
          </div>
          <footer style="display:flex; justify-content:space-between; margin-top:3rem; padding-top:1rem; border-top:1px solid #e2e8f0; font-size:0.82rem; color:#94a3b8; font-family:system-ui, sans-serif;">
            <div>Genesis Explorer — Suite Bible Explorer</div>
            <div>Documento de Estudio Pastoral</div>
          </footer>
        </div>
      `;
      document.body.appendChild(tempContainer);
      element = tempContainer.firstElementChild;
    }

    const sanitizedTitle = (sermon.title || 'Predicacion').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]/g, '_');

    // Configuración exacta para PDF de alta fidelidad 300 DPI 100% idéntico a la pantalla
    const opt = {
      margin:       [12, 14, 14, 14], // [arriba, izquierda, abajo, derecha] en mm
      filename:     `${sanitizedTitle}_Documento_Pastoral.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2.5, 
        useCORS: true, 
        logging: false,
        letterRendering: true
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(element).save();

    if (tempContainer) {
      document.body.removeChild(tempContainer);
    }
  } catch (err) {
    console.error('Error al generar PDF directo, recurriendo a impresión de navegador:', err);
    window.print();
  }
}
