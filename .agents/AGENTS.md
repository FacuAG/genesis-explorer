# Genesis Explorer — Contexto del Proyecto para el Agente

## ¿Qué es este proyecto?

**Genesis Explorer** es una aplicación web interactiva cuyo propósito es explorar, visualizar y estudiar el contenido del libro del Génesis (y la genealogía hacia Jesucristo) de manera estructurada, visual y pedagógica.

La idea central es convertir el contenido bíblico del Génesis —genealogías, personajes, eventos, pactos, dispensaciones, ubicaciones geográficas y promesas mesiánicas— en una herramienta de estudio moderna, visualmente rica e interactiva. El proyecto permite que cualquier persona explore la narrativa del Génesis sin necesidad de leer el texto lineal, navegando en cambio a través de líneas de tiempo, árboles genealógicos, mapas, preguntas teológicas y promesas mesiánicas.

---

## Stack Tecnológico

| Tecnología       | Versión / Detalle                         |
|-----------------|-------------------------------------------|
| **Framework**    | React 19 (con JSX)                        |
| **Bundler**      | Vite 8                                    |
| **Lenguaje**     | JavaScript (ESM, sin TypeScript)          |
| **Estilos**      | CSS Vanilla (sin frameworks como Tailwind)|
| **Linting**      | ESLint 10                                 |
| **Datos**        | JSON estático (src/data/genesis.json)     |
| **Deploy**       | No configurado aún (solo dev local)       |

**Comandos clave:**
- `npm run dev` — Inicia el servidor de desarrollo (Vite HMR).
- `npm run build` — Compila la app para producción.
- `npm run lint` — Ejecuta ESLint.

---

## Estructura del Proyecto

```
genesis-explorer/
├── public/
│   ├── favicon.svg       # Ícono de la app
│   └── icons.svg         # Sprite SVG con íconos de UI
├── src/
│   ├── assets/
│   │   ├── hero.png      # Imagen héroe de la pantalla inicial
│   │   ├── react.svg     # Logo React (placeholder del template)
│   │   └── vite.svg      # Logo Vite (placeholder del template)
│   ├── data/
│   │   └── genesis.json  # ★ FUENTE DE DATOS PRINCIPAL — ver detalle abajo
│   ├── App.jsx           # Componente raíz de la app
│   ├── App.css           # Estilos del componente principal
│   ├── index.css         # Variables globales, reset y tipografía
│   └── main.jsx          # Punto de entrada (monta React en #root)
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## La Fuente de Datos: src/data/genesis.json

Este archivo JSON es el **corazón del proyecto**. Está estructurado en capas (definidas en `layers`) y contiene toda la información bíblica estructurada. **No debe modificarse a la ligera**, ya que es la fuente de verdad de toda la app.

### Capas de datos disponibles (`layers`):
1. **chronology** — Línea de tiempo de eventos con año Anno Mundi (AM), categoría, enseñanza y referencias bíblicas exactas.
2. **genealogy** — Genealogía principal desde Adán hasta Jesucristo (63 personas en línea directa).
3. **relationships** — Relaciones explícitas entre personas (padre/madre → hijo, cónyuge).
4. **hierarchy** — Jerarquía narrativa: Libro → Historia → Eventos.
5. **covenants** — Pactos bíblicos (Creación, Edén, Noé, Abraham, Circuncisión).
6. **messianic_promises** — Promesas mesiánicas (Eva → Sem → Abraham → Isaac → Jacob → Judá → Jesucristo).
7. **geography** — Ubicaciones geográficas (Edén, Ararat, Babel, Ur, Harán, Canaán, Egipto, etc.).
8. **dispensations** — Las 4 dispensaciones del Génesis (Inocencia, Conciencia, Gobierno Humano, Promesa).
9. **questions** — Preguntas teológicas frecuentes con referencias bíblicas y versículos.

### Personas documentadas (64 en `people`):
- Patriarcas antediluvianos: Adán, Eva, Caín, Abel, Set → Matusalén → Noé.
- Patriarcas postdiluvianos: Sem, Cam, Jafet, Arfaxad → Taré → Abraham.
- Patriarcas del período de promesa: Abraham, Sara, Isaac, Rebeca, Jacob, Lea, Raquel, los 12 hijos de Jacob.
- Figuras hasta Cristo: David, Jesucristo.
- Cada persona incluye: nombre en español, categoría, años de vida (birth_am/death_am/lifespan), padres, cónyuge/s, hijos, referencias bíblicas y versículo en español.

### Eventos de la línea de tiempo (`timeline_events`):
- 15 eventos desde la Creación (AM 0) hasta la Muerte de José (AM 2369).
- Cada evento tiene: id, nombre, categoría, año AM, fecha exacta (si existe), ubicación, enseñanza, referencias y versículo.
- Categorías de eventos: `creation`, `genealogy`, `judgment`, `miracle`, `restoration`, `covenant`, `patriarch`, `exile`, `sin`.

### Datos únicos que potencian funcionalidades avanzadas:
- **`notable_overlaps`**: Tabla de convivencias entre patriarcas (ej.: Adán convivió 243 años con Matusalén).
- **`main_genealogy`**: Array lineal de los 63 antepasados directos de Jesús desde Adán.
- **`messianic_promises`**: Rastrea cómo la promesa del Mesías se fue transmitiendo de generación en generación.

---

## Estado Actual del Proyecto

El proyecto se encuentra en su **estado inicial de template**. El App.jsx actual es el template por defecto de Vite + React, mostrando una pantalla de "Get Started".

**Lo que EXISTE actualmente:**
- Setup completo de Vite + React 19.
- Sistema de diseño base (variables CSS en index.css): colores, tipografía, modo claro/oscuro automático.
- Dataset bíblico completo y muy rico en genesis.json (v2.0).
- Estructura de carpetas ordenada.

**Lo que AÚN NO EXISTE (está por construir):**
- Ninguna pantalla/vista real de la app está implementada.
- No hay routing entre vistas.
- No hay componentes funcionales propios.
- No se consume el genesis.json en ninguna parte del código aún.
- No hay visualizaciones: timelines, árboles genealógicos, mapas, etc.

---

## Visión y Objetivos del Proyecto

El objetivo es construir una **aplicación web de estudio bíblico** sobre el Génesis, visualmente premium e interactiva, que incluya al menos:

1. **Línea de Tiempo Interactiva** — Visualizar los eventos del Génesis en un eje cronológico (Anno Mundi), con filtros por categoría y detalle de cada evento.

2. **Árbol Genealógico** — Visualización de las genealogías: desde Adán hasta Jesús, con vidas superpuestas (usando los datos de notable_overlaps), y posibilidad de hacer clic en cada persona para ver su perfil completo.

3. **Explorador de Personas** — Vista con tarjetas o fichas de cada personaje, con sus datos biográficos, relaciones, versículos y referencias.

4. **Mapa de Ubicaciones** — Visualización geográfica de los lugares del Génesis (Edén, Ararat, Babel, Ur, Canaán, Egipto, etc.) con eventos asociados.

5. **Dispensaciones** — Visualización de las 4 dispensaciones con sus eventos correspondientes.

6. **Promesas Mesiánicas** — Rastro visual de la línea mesiánica desde Eva hasta Jesús.

7. **Preguntas Teológicas** — Sección de preguntas frecuentes con contexto bíblico.

8. **Pactos Bíblicos** — Vista de los pactos con sus participantes y significado.

---

## Estilo y Diseño

El sistema de diseño base está definido en src/index.css mediante variables CSS:
- **Modo claro**: fondo blanco, acento violeta (#aa3bff), textos oscuros.
- **Modo oscuro**: fondo oscuro (#16171d), acento lila (#c084fc), textos claros.
- El cambio de modo es **automático** según preferencia del sistema operativo (prefers-color-scheme).
- Tipografía: system-ui, Segoe UI, Roboto (sans-serif).
- El diseño debe ser **premium, moderno y visualmente impactante**. No se aceptan diseños básicos o simples.

---

## Reglas de Trabajo del Agente en Este Proyecto

1. **No modificar genesis.json** salvo que el usuario pida explícitamente agregar o corregir datos bíblicos.
2. **No instalar librerías externas** sin consultar primero. El stack es React + Vite + CSS vanilla. Si se necesita una librería (p.ej. para el árbol genealógico o el mapa), proponer opciones y esperar aprobación.
3. **No hacer cambios destructivos en index.css** — El sistema de variables debe preservarse. Se puede extender, no reemplazar.
4. **El código debe ser siempre JSX + JavaScript**. No usar TypeScript.
5. **Priorizar componentes reutilizables**: a medida que se construyan vistas, los componentes deben ir en src/components/.
6. **Siempre verificar que el proyecto compile** antes de dar una tarea por terminada.
7. Si el usuario usa las palabras **"Analizar"** o **"Debate"**, no enviar ni modificar código hasta recibir confirmación explícita.

---

## Referencias Bíblicas Usadas

- **Libro principal**: Génesis (toda la obra).
- **Genealogía extendida**: Mateo 1 (genealogía de Jesús, rama de José) y Lucas 3 (genealogía completa hasta Adán).
- **Sistema cronológico**: Anno Mundi (AM) — años desde la Creación.
- **Idioma de los versículos**: Español (Reina-Valera clásica).
