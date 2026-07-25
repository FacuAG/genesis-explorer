// Helper para cargar pdfmake y vfs_fonts dinámicamente desde CDN de forma transparente
const loadPdfMake = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfMake && window.pdfMake.vfs) {
      resolve(window.pdfMake);
      return;
    }

    const scriptPdfMake = document.createElement('script');
    scriptPdfMake.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js';
    scriptPdfMake.onload = () => {
      const scriptFonts = document.createElement('script');
      scriptFonts.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js';
      scriptFonts.onload = () => resolve(window.pdfMake);
      scriptFonts.onerror = () => reject(new Error('No se pudieron cargar las fuentes de pdfmake'));
      document.body.appendChild(scriptFonts);
    };
    scriptPdfMake.onerror = () => reject(new Error('No se pudo cargar pdfmake'));
    document.body.appendChild(scriptPdfMake);
  });
};

// Helper para convertir el HTML limpio del editor TipTap/ContentEditable en la estructura vectorial de pdfmake
const convertHtmlToPdfMakeContent = (htmlString) => {
  if (!htmlString) return [{ text: 'Bosquejo sin contenido.', fontSize: 10.5, margin: [0, 5, 0, 5] }];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const nodes = Array.from(doc.body.childNodes);
  const pdfContent = [];

  const parseTextRuns = (element) => {
    const runs = [];
    const children = Array.from(element.childNodes);

    if (children.length === 0 && element.textContent) {
      return [{ text: element.textContent }];
    }

    children.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) runs.push({ text: child.textContent });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        const styleAttr = child.getAttribute('style') || '';
        const runText = child.textContent;
        if (!runText) return;

        let bgHex = null;
        if (styleAttr.includes('221, 199, 36') || styleAttr.includes('221 199 36') || styleAttr.includes('yellow')) {
          bgHex = '#ddc724';
        } else if (styleAttr.includes('63, 128, 163') || styleAttr.includes('63 128 163') || styleAttr.includes('blue')) {
          bgHex = '#3f80a3';
        } else if (styleAttr.includes('85, 189, 122') || styleAttr.includes('85 189 122') || styleAttr.includes('green')) {
          bgHex = '#55bd7a';
        } else if (styleAttr.includes('183, 84, 116') || styleAttr.includes('183 84 116') || styleAttr.includes('red')) {
          bgHex = '#b75474';
        }

        const runObj = {
          text: runText,
          bold: tag === 'strong' || tag === 'b' || !!bgHex,
          italics: tag === 'em' || tag === 'i',
          decoration: tag === 'u' ? 'underline' : undefined,
        };

        if (bgHex) {
          runObj.background = bgHex;
          runObj.color = '#ffffff';
        }

        runs.push(runObj);
      }
    });

    return runs.length > 0 ? runs : [{ text: element.textContent }];
  };

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) pdfContent.push({ text, fontSize: 10.5, margin: [0, 4, 0, 6] });
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();

    if (tag === 'h1') {
      pdfContent.push({
        text: node.textContent,
        fontSize: 16,
        bold: true,
        color: '#0f172a',
        margin: [0, 14, 0, 6],
        keepWithNext: true,
      });
    } else if (tag === 'h2') {
      pdfContent.push({
        text: node.textContent,
        fontSize: 13.5,
        bold: true,
        color: '#581c87',
        margin: [0, 12, 0, 4],
        keepWithNext: true,
      });
    } else if (tag === 'h3') {
      pdfContent.push({
        text: node.textContent,
        fontSize: 11.5,
        bold: true,
        color: '#1e3a8a',
        margin: [0, 10, 0, 3],
        keepWithNext: true,
      });
    } else if (tag === 'blockquote') {
      pdfContent.push({
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: node.textContent,
                italics: true,
                fontSize: 10,
                color: '#334155',
                fillColor: '#f8fafc',
                margin: [8, 6, 8, 6],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: (i) => (i === 0 ? 3.5 : 0),
          vLineColor: () => '#7c3aed',
        },
        margin: [0, 8, 0, 10],
      });
    } else if (tag === 'ul' || tag === 'ol') {
      const lis = Array.from(node.querySelectorAll('li'));
      const listItems = lis.map((li) => parseTextRuns(li));
      if (tag === 'ol') {
        pdfContent.push({ ol: listItems, fontSize: 10.5, margin: [10, 4, 0, 6] });
      } else {
        pdfContent.push({ ul: listItems, fontSize: 10.5, margin: [10, 4, 0, 6] });
      }
    } else if (tag === 'p' || tag === 'div') {
      pdfContent.push({
        text: parseTextRuns(node),
        fontSize: 10.5,
        lineHeight: 1.35,
        margin: [0, 3, 0, 5],
      });
    }
  });

  return pdfContent;
};

// Función principal exportable para descargar el PDF directo a 1-Clic
export async function downloadSermonPDFDirect(sermon) {
  try {
    const pdfMake = await loadPdfMake();
    const formattedDate = sermon.updatedAt
      ? new Date(sermon.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    const docDefinition = {
      pageSize: 'A4',
      // Márgenes simétricos estrictos [Izquierda, Arriba, Derecha, Abajo] en todas las hojas
      pageMargins: [42, 48, 42, 48],
      header: (currentPage) => {
        if (currentPage === 1) return null;
        return {
          text: sermon.title || 'Bosquejo Homilético',
          alignment: 'right',
          fontSize: 8,
          color: '#94a3b8',
          margin: [42, 20, 42, 0],
        };
      },
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            { text: 'Genesis Explorer — Suite Bible Explorer', fontSize: 8, color: '#94a3b8' },
            { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 8, color: '#94a3b8' },
          ],
          margin: [42, 15, 42, 0],
        };
      },
      content: [
        // Etiqueta superior
        { text: 'DOCUMENTO DE ESTUDIO & HOMILÉTICA PASTORAL', fontSize: 8, bold: true, color: '#64748b', margin: [0, 0, 0, 4] },
        // Título Principal
        { text: sermon.title || 'Bosquejo Homilético', fontSize: 20, bold: true, color: '#0f172a', margin: [0, 0, 0, 6] },
        // Fila de metadatos
        {
          columns: [
            { text: [{ text: 'PASAJE CLAVE: ', bold: true, color: '#334155' }, sermon.passage || 'Génesis'], fontSize: 9.5, color: '#475569' },
            { text: [{ text: 'FECHA: ', bold: true, color: '#334155' }, formattedDate], fontSize: 9.5, color: '#475569', alignment: 'right' },
          ],
          margin: [0, 0, 0, 8],
        },
        // Línea divisoria de cabecera
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 511, y2: 0, lineWidth: 1.5, lineColor: '#cbd5e1' }], margin: [0, 0, 0, 12] },
        // Proposición / Idea Central
        sermon.proposition
          ? {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      stack: [
                        { text: 'PROPOSICIÓN / IDEA CENTRAL:', fontSize: 7.5, bold: true, color: '#0369a1', margin: [0, 0, 0, 2] },
                        { text: `"${sermon.proposition}"`, fontSize: 10.5, italics: true, color: '#0f172a' },
                      ],
                      fillColor: '#f8fafc',
                      margin: [10, 8, 10, 8],
                    },
                  ],
                ],
              },
              layout: {
                hLineWidth: () => 0,
                vLineWidth: (i) => (i === 0 ? 3.5 : 0),
                vLineColor: () => '#0284c7',
              },
              margin: [0, 0, 0, 14],
            }
          : null,
        // Cuerpo del sermón procesado
        ...convertHtmlToPdfMakeContent(sermon.contentHtml),
      ].filter(Boolean),
      defaultStyle: {
        font: 'Roboto',
      },
    };

    const sanitizedTitle = (sermon.title || 'Predicacion').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]/g, '_');
    pdfMake.createPdf(docDefinition).download(`${sanitizedTitle}_Documento_Pastoral.pdf`);
  } catch (err) {
    console.error('Error al generar PDF directo con pdfmake, recurriendo a impresión nativa:', err);
    window.print();
  }
}
