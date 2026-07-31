# GUÍA DE IMPLEMENTACIÓN — NUEVO LIBRO BÍBLICO
## Bible Explorer · Documento Oficial para Agentes IA

> **INSTRUCCIÓN PARA LA IA:** Leer este documento **completo** antes de escribir una sola línea de código. Cada sección está ordenada por dependencia: si saltás una, algo va a fallar en silencio.

---

# BLOQUE 0 — ARQUITECTURA DE COMUNICACIÓN ENTRE PANTALLAS

## 0.1 Qué es esto y por qué es lo más importante

La app tiene pantallas que se **hablan entre sí**. Cuando el usuario toca un personaje en la Línea de Tiempo, la app lo lleva a la pantalla Personajes y lo muestra ya seleccionado. Cuando toca un capítulo en el Árbol Genealógico, va a Capítulos y lo abre directamente.

Estos puentes funcionan a través de **3 callbacks globales** que viven en `App.jsx` y se pasan como props a cada pantalla. Si los datos del libro nuevo no tienen los `id` exactos que estos callbacks esperan, el puente falla en silencio: el click se ejecuta, la pantalla cambia, pero no pasa nada más.

**Este es el error más común al agregar un libro nuevo y el más difícil de detectar.**

---

## 0.2 Los 3 Contratos Globales (definidos en `src/App.jsx`)

### CONTRATO 1: `handleSelectEvent(eventId: string)`

```
QUIÉN LO DISPARA:
  - TimelineView       → click en evento del hito de salto rápido
  - TimelineView       → click en cualquier bloque de evento en la timeline
  - ChapterMapPanel    → botón "Ver en Línea de Tiempo" en el panel de capítulo
  - ThemePanel         → click en evento desde la lista de un tema teológico
  - PersonDetailModal  → click en evento desde la ficha de un personaje
  - GenealogyTreePanel → via PersonDetailModal → click en evento

QUÉ HACE:
  1. Guarda el eventId en el estado targetEventId de App.jsx
  2. Cambia el activeTab a 'timeline'
  3. TimelineView recibe el nuevo targetEventId y hace scroll + destello visual

QUÉ NECESITA DEL DATO:
  - El campo `id` de cada objeto en el array `timeline_events` del JSON del libro
  - DEBE ser único, en snake_case, sin espacios
  - Ejemplo válido:   "sermon_mount", "baptism_jesus", "transfiguration"
  - Ejemplo INVÁLIDO: "Sermón del Monte", "evento-1", ""

CONSECUENCIA SI FALTA O ESTÁ MAL:
  - La pantalla cambia a Timeline pero no se enfoca ningún evento
  - No hay error visible en consola — simplemente no hace nada
```

---

### CONTRATO 2: `handleSelectPerson(personId: string)`

```
QUIÉN LO DISPARA:
  - TimelineView       → click en chip de personaje dentro del EventPanel
  - TimelineView       → click en personaje dentro de la barra LifespanBar
  - ChapterMapPanel    → click en personaje mencionado en el panel de capítulo
  - GenealogyTreePanel → click en "Ver Perfil Completo" de un personaje
  - PersonDetailModal  → click en padre, madre, cónyuge o hijo de un personaje
  - ThemePanel         → click en personaje desde la lista de un tema teológico

QUÉ HACE:
  1. Guarda el personId en el estado targetPersonId de App.jsx
  2. Cambia el activeTab a 'people'
  3. PersonPanel abre automáticamente la ficha de ese personaje

QUÉ NECESITA DEL DATO:
  - El campo `id` de cada objeto en el array `people` del JSON del libro
  - DEBE coincidir EXACTAMENTE con:
      family.father, family.mother, family.spouses[], family.children[]
      key_people_ids[] en narrative_blocks y timeline_events
  - Ejemplo válido: "jesus", "peter", "mary_magdalene", "john_baptist"

CONSECUENCIA SI FALLA:
  - La pantalla cambia a Personajes pero no se abre ninguna ficha
  - Los botones de navegación familiar se muestran pero no hacen nada
```

---

### CONTRATO 3: `onSelectChapter(chapterNumber: number)`

```
QUIÉN LO DISPARA:
  - GenealogyTreePanel → click en "Ver capítulo" desde PersonDetailModal

QUÉ HACE:
  1. Guarda el número en targetChapterNum de App.jsx
  2. Cambia el activeTab a 'chapters'
  3. ChapterMapPanel recibe initialChapter y abre ese capítulo directamente

QUÉ NECESITA DEL DATO:
  - El campo `chapter_number` (o `chapter`) de cada objeto en `chapters_map`
  - DEBE ser un número entero (1, 2, 3... hasta el último capítulo)
  - El hook acepta ambos: item.chapter_number || item.chapter

CONSECUENCIA SI FALLA:
  - ChapterMapPanel abre en el capítulo 1 por defecto sin ningún aviso
```

---

## 0.3 Contratos Internos (dentro de una misma pantalla)

### CONTRATO INTERNO A: Evento → Panel de Evento (EventPanel)

```
DÓNDE:   TimelineView → EventPanel (modal dentro de Timeline)
DISPARO: Click en cualquier bloque de evento en la timeline
DATO:    El objeto completo del evento desde eventsMap.get(id)

CAMPOS QUE RENDERIZA EventPanel:
  event.name                  → título del panel
  event.category              → color del badge
  event.year_am               → año Anno Mundi
  event.summary               → texto descriptivo principal
  event.key_verse.text        → versículo principal
  event.key_verse.reference   → referencia del versículo
  event.key_people[]          → chips de personajes (busca nombre en peopleMap)
  event.location_id           → busca en locationsMap
  event.theological_teaching  → sección de enseñanza
  event.messianic_connection  → sección dorada (se oculta si es null)
  event.cross_references_nt[] → lista de referencias del NT

SI UN CAMPO FALTA: esa sección se oculta (no da error, pero la ficha queda incompleta)
```

---

### CONTRATO INTERNO B: Personaje → PersonDetailModal

```
DÓNDE:   PersonPanel → PersonDetailModal
DISPARO: Click en "Ver Ficha Completa" de un personaje

CAMPOS QUE RENDERIZA PersonDetailModal:
  person.name                     → nombre
  person.name_meaning             → significado del nombre
  person.chronology.birth_am      → año de nacimiento AM
  person.chronology.death_am      → año de muerte AM
  person.chronology.lifespan      → años vividos
  person.family.father            → ID → busca en peopleMap → nombre + botón navegable
  person.family.mother            → ID → busca en peopleMap → nombre + botón navegable
  person.family.spouses[]         → IDs → chips clicables
  person.family.children[]        → IDs → chips clicables
  person.biography.short          → texto corto visible
  person.biography.full           → texto largo (colapsable)
  person.theological_significance → sección teológica
  person.key_verse.text           → versículo clave
  person.event_ids[]              → IDs → lista de eventos del personaje
  person.notable_overlaps[]       → convivencias con otros personajes
  person.cross_references_nt[]    → referencias del NT

NAVEGACIÓN CRUZADA DESDE ESTE MODAL:
  Click en padre/madre/cónyuge/hijo → onSelectPerson(id)
  Click en evento                   → onSelectEvent(id)
  Click en capítulo                 → onSelectChapter(num)
```

---

### CONTRATO INTERNO C: Capítulo → Personajes mencionados

```
DÓNDE:   ChapterMapPanel → chip de personaje en el sidebar
DISPARO: Click en personaje mencionado en el capítulo
DATO:    chapter.key_people[] → array de IDs → busca nombre en peopleMap

SI EL ID NO EXISTE EN peopleMap: el chip se muestra sin nombre y sin acción
```

---

## 0.4 Flujo del Buscador Global

```
COMPONENTE: Header → input de búsqueda → App.jsx → searchAll()
FUNCIÓN:    useGenesisData.js → searchAll(query)

QUÉ BUSCA:
  - timeline_events: campos `name` y `summary`
  - people:          campos `name` y `name_meaning`
  - locations:       campos `name` y `region`

ACCIONES EN LOS RESULTADOS:
  - Click en evento     → handleSelectEvent(event.id) → Timeline
  - Click en personaje  → handleSelectPerson(person.id) → Personajes
  - Click en ubicación  → solo muestra info (sin navegación cross-screen)

CAMPOS MÍNIMOS PARA APARECER EN BÚSQUEDA:
  - Eventos:    `name` (string) + `summary` (string)
  - Personas:   `name` (string) + `name_meaning` (string)
  - Ubicaciones:`name` (string) + `region` (string)
```

---

## 0.5 Cómo Registrar un Libro Nuevo sin Romper Nada

El hook `useGenesisData.js` es el único punto de entrada al cambiar de libro.

**Pasos obligatorios:**

1. Crear `src/data/books/[libro].json` con el schema completo (ver Bloque 1)

2. Importarlo en `useGenesisData.js`:
```javascript
import exodusData from '../data/books/exodus.json';
```

3. Agregarlo al selector de libro en el useMemo:
```javascript
if (bookId === 'exodus') return exodusData;
if (bookId === 'matthew' || bookId === 'mateo') return matthewData;
return genesisData;
```

4. Agregar la opción en `Header.jsx` (línea ~88):
```jsx
<option value="exodus">📖 Éxodo (40 Caps - N Eventos)</option>
```

5. Extender el ternario de capítulos en `Header.jsx` línea 124:
```jsx
// ANTES (solo maneja genesis y matthew):
activeBookId === 'matthew' ? 28 : 50

// DESPUÉS (extender para cada libro nuevo):
activeBookId === 'matthew' ? 28 : activeBookId === 'exodus' ? 40 : 50
```

---

## 0.6 Advertencias de Código Hardcodeado

Estos son los únicos lugares donde hay lógica específica por libro que hay que actualizar manualmente:

| Archivo | Línea | Qué dice | Qué hacer |
|---|---|---|---|
| `Header.jsx` | ~88-91 | Lista de opciones del selector de libro | Agregar `<option>` para el nuevo libro |
| `Header.jsx` | ~124 | Número de capítulos en el label del menú | Extender el ternario |
| `GenealogyTreePanel.jsx` | 25-33 | Lista hardcodeada de IDs de la línea mesiánica | Los IDs del nuevo libro deben coincidir con esta lista, o actualizarla |

---

## 0.7 Tabla Resumen: Qué Pasa Cuando Falta un Campo

| Campo en JSON | Componentes que lo usan | Consecuencia si falta |
|---|---|---|
| `timeline_events[].id` | TimelineView, ChapterMapPanel, ThemePanel, PersonDetailModal | Click no enfoca nada |
| `people[].id` | PersonPanel, PersonDetailModal, EventPanel, ChapterMapPanel, LifespanBar | Ficha no se abre / botones de familia muertos |
| `chapters_map[].chapter_number` | ChapterMapPanel, GenealogyTreePanel | Abre capítulo 1 por defecto |
| `people[].family.father/mother/spouses/children` | PersonDetailModal | Botones existen pero no navegan |
| `timeline_events[].key_people[]` | EventPanel | Chips de personajes vacíos |
| `timeline_events[].location_id` | EventPanel | Sección de ubicación oculta |
| `chapters_map[].key_people[]` | ChapterMapPanel | Lista de personajes del capítulo vacía |
| `people[].event_ids[]` | PersonDetailModal | Lista de eventos del personaje vacía |
| `locations[].name` + `locations[].region` | Buscador global | No aparece en resultados de búsqueda |
| `timeline_events[].summary` | Buscador global | No aparece en resultados de búsqueda |
| `people[].name_meaning` | Buscador global | No aparece en resultados de búsqueda |

---

> **FIN DEL BLOQUE 0**

---

# BLOQUE 0.5 — ESTÁNDARES DE CALIDAD Y COMPLETITUD DE DATOS

## ⚠️ INSTRUCCIÓN CRÍTICA PARA LA IA

**"Completo", "relevante", "importante" y "exhaustivo" NO son instrucciones.** Son palabras sin valor para una IA. Este bloque reemplaza esas palabras con criterios binarios: una condición se cumple o no se cumple. No hay zona gris.

**Antes de entregar cualquier array de datos, la IA DEBE ejecutar la auditoría de cierre de esa sección. Sin excepción.**

---

## 0.5.1 — EVENTOS DE LA LÍNEA DE TIEMPO (`timeline_events`)

### Fuente canónica obligatoria
Recorrer el texto del libro completo, capítulo por capítulo, versículo por versículo, en la versión Reina-Valera 1960.

### Criterio de inclusión — TEST BINARIO
Un nuevo evento DEBE crearse cada vez que ocurre al menos UNA de estas condiciones:

```
CONDICIÓN A → Cambio de ubicación geográfica
  Ejemplo: "Jesús salió de Galilea y fue a Judea" → nuevo evento

CONDICIÓN B → Cambio de interlocutor principal o nuevo personaje entra en escena
  Ejemplo: "Se le acercaron los fariseos diciendo..." → nuevo evento

CONDICIÓN C → Marcador temporal explícito en el texto
  Ejemplos de marcadores: "En aquel tiempo", "Al día siguiente", "Después de esto",
  "Cuando terminó Jesús estos discursos", "En aquellos días"

CONDICIÓN D → Cambio de tema con introducción narrativa formal
  Ejemplo: Inicio de una parábola, inicio de un discurso, inicio de un milagro

CONDICIÓN E → Clímax o resolución narrativa que concluye una escena
  Ejemplo: "Y lo sanó", "Y murió", "Y los fariseos se fueron", "Y él se fue al monte"
```

### NO crear evento si:
```
- Es continuación del mismo diálogo sin cambio de escena ni interlocutor
- Es un versículo de transición de menos de 2 versículos sin acción nueva
```

### Cómo calcular el ancla esperada — PROCESO OBLIGATORIO
```
PASO 1 — Identificar el tipo literario del libro:
  A) Narrativo histórico largo  → Génesis, Éxodo, Josué, Jueces, Samuel, Reyes, Hechos
  B) Evangelio sinóptico        → Mateo, Marcos, Lucas
  C) Evangelio de Juan          → Juan
  D) Epístola doctrinal         → Romanos, Hebreos, Gálatas, Efesios, Colosenses
  E) Epístola breve/práctica    → Santiago, 1 Juan, Judas, Filemón, 1-2 Timoteo
  F) Libro profético            → Isaías, Jeremías, Ezequiel, Daniel, los profetas menores
  G) Libro de sabiduría         → Salmos, Proverbios, Eclesiastés, Job, Cantares
  H) Apocalíptico               → Apocalipsis, secciones de Daniel y Ezequiel

PASO 2 — Calcular el ancla mínima según el tipo:
  A) Narrativo histórico largo: esperado 70-130 eventos
  B) Evangelio sinóptico:       esperado 80-130 eventos
  C) Evangelio de Juan:         esperado 40-60 eventos
  D) Epístola doctrinal:        esperado 20-45 eventos
  E) Epístola breve/práctica:   esperado 5-20 eventos
  F) Libro profético:           esperado 50-100 eventos (varía según extensión)
  G) Libro de sabiduría:        esperado 15-50 eventos
  H) Apocalíptico:              esperado 50-80 eventos

PASO 3 — Aplicar la regla de corte:
  Si el total de eventos creados es menor al 60% del mínimo esperado
  para el tipo → es insuficiente. Revisar capítulo por capítulo.

CALIBRACIÓN DE REFERENCIA (libros ya implementados en esta app):
  Génesis (tipo A) → 82 eventos en el JSON actual (usa como modelo de densidad)
```

### Sistema LOD (Level of Detail) — distribución obligatoria
```
LOD 1 "Hitos": Los 8-15 eventos más estructuralmente decisivos del libro.
  → Un evento es LOD1 si: es un punto de no retorno narrativo (nacimiento,
    muerte, llamado, juicio, revelación central) que divide el libro en secciones.
  → Referencia: Génesis tiene 5 hitos LOD1. Un Evangelio debe tener 8-12.

LOD 2 "Estructurado": 35-55% del total de eventos.
  → Un evento es LOD2 si: tiene un personaje principal identificado,
    ocurre en una ubicación nombrada, y tiene enseñanza teológica documentable.
  → Todos los LOD1 son también LOD2.

LOD 3 "Exhaustivo": El 100% de los eventos (todos los LOD1 + LOD2 + LOD3).
  → Un evento es LOD3 si: califica para entrar pero no alcanza el nivel de
    detalle de LOD2 (puede ser una escena breve, una transición significativa,
    o un sub-evento de otro mayor).
```

### Auditoría obligatoria antes de entregar `timeline_events`
```
PASO 1: Contar el total de eventos creados.
PASO 2: Listar cuántos eventos hay por capítulo.
         → Si algún capítulo tiene 0 eventos en LOD2, es un error. Corrregir.
PASO 3: Contar cuántos eventos hay de cada categoría.
         → Si alguna categoría definida en el código tiene 0 eventos
           asignados, revisar si realmente no aplica o si fue omitida.
PASO 4: Verificar que todos los LOD1 sean <= 15.
         → Si hay más de 15 eventos LOD1, reclasificar los menos críticos a LOD2.
PASO 5: Confirmar que cada evento tiene: id, name, year_am (o equivalent),
         summary, key_verse, category, lod_level, narrative_block_id.
         → Un evento sin alguno de estos campos está incompleto.
```

---

## 0.5.2 — CATEGORÍAS DE EVENTOS (campo `category` en cada evento)

### ⚠️ REGLA ABSOLUTA
Las categorías son valores HARDCODEADOS en el código del componente TimelineView.
La IA NO puede inventar nuevas categorías. SOLO puede usar las que ya existen.

### Categorías válidas (leer del código antes de asignar)
```
Categorías existentes en el código (verificar en TimelineView.jsx si cambian):
  "creation"     → Actos de creación o inicio de algo completamente nuevo
  "judgment"     → Juicio divino, consecuencias del pecado, disciplina
  "sin"          → Acto de desobediencia o fracaso moral documentado
  "covenant"     → Establecimiento o ratificación de un pacto con Dios
  "patriarch"    → Eventos centrales de vida de un personaje principal
  "miracle"      → Acto sobrenatural obrado por Dios o por mandato divino
  "genealogy"    → Registro genealógico o de linaje
  "exile"        → Desplazamiento, huida, deportación o migración forzada
  "restoration"  → Restauración, reconciliación, regreso o sanación
  "messianic"    → Cumplimiento directo de profecía mesiánica o tipo de Cristo

CRITERIO DE ASIGNACIÓN: Asignar la categoría que describe la ACCIÓN PRINCIPAL
del evento, no su contexto. Si un milagro ocurre durante un juicio, la categoría
es "miracle", no "judgment".

Si un libro nuevo requiere una categoría que no existe en esta lista,
NO agregarla al JSON. En cambio: (a) documentarlo como requerimiento de código,
(b) usar la categoría más cercana, (c) notificar al usuario.
```

---

## 0.5.3 — BLOQUES NARRATIVOS (`narrative_blocks`)

### Proceso de identificación — OBLIGATORIO para cualquier libro
```
La estructura de un libro NO es inventada por la IA.
DEBE basarse en el consenso académico evangélico.
Seguir este proceso para cualquier libro, conocido o nuevo:

PASO 1 — Leer el libro completo e identificar marcadores estructurales:
  • Marcadores de cambio de sección: frases de transición, cambios de tiempo,
    cambios de lugar, cambios de tema, resúmenes del autor, cambios de audiencia.
  • Ejemplo Pentateuco: "Estas son las generaciones de..." (Toledot en hebreo)
  • Ejemplo Evangelios: "Cuando Jesús terminó estos discursos..."
  • Ejemplo Epístolas: "Por tanto", "Ahora bien", "En cuanto a..."
  • Ejemplo Apocalipsis: "Vi también...", las series de 7 (sellos, trompetas, copas)

PASO 2 — Verificar contra comentarios evangélicos de referencia:
  Cualquier división que hagas debe poder respaldarse con al menos
  UNO de estos tipos de fuente: comentario exegético, Bible Handbook,
  introducción de estudio bíblico. NO inventar divisiones propias.

PASO 3 — Nombrar cada bloque con un título teológico descriptivo:
  NO: "Sección A", "Parte 1", "Capítulos 1-5"
  SÍ: "El ministerio en Galilea", "La promesa abrahámicas", "El Sermón del Monte"

PASO 4 — Asignar capítulos start/end a cada bloque:
  Verificar que la suma de todos los capítulos = total del libro (sin gaps ni solapamientos)

REGLA UNIVERSAL:
  → Mínimo 5 bloques. Máximo 15 bloques.
  → Todo capítulo del libro DEBE pertenecer a exactamente UN bloque.
  → Cada bloque debe tener narrative_block_id único en snake_case.
```

### Cantidad esperada por tipo de libro
```
A) Narrativo histórico largo:   7-12 bloques
B) Evangelio sinóptico:         7-10 bloques
C) Evangelio de Juan:           5-8 bloques
D) Epístola doctrinal:          4-7 bloques
E) Epístola breve/práctica:     3-5 bloques
F) Libro profético:             5-12 bloques (según extensión)
G) Libro de sabiduría:          4-8 bloques (o por secciones temáticas)
H) Apocalíptico:                6-10 bloques
```

### Auditoría obligatoria
```
Verificar: ¿Los chapters_start y chapters_end de todos los bloques cubren
sin gaps ni solapamientos el rango 1..N donde N = total de capítulos del libro?
Si hay un gap → crear un bloque para esos capítulos faltantes.
Si hay solapamiento → corregir los límites.
```

---

## 0.5.4 — PERSONAJES (`people`)

### Criterio de inclusión — TEST BINARIO
Incluir a una persona si cumple AL MENOS UNA de estas condiciones:

```
CONDICIÓN A: Es nombrada explícitamente en el texto RVR1960 (nombre propio)
CONDICIÓN B: Tiene al menos una línea de diálogo directo en el texto
CONDICIÓN C: Realiza o recibe un milagro documentado en el texto
CONDICIÓN D: Aparece en la genealogía del libro (si existe)
CONDICIÓN E: Es un antagonista nombrado con papel activo en la narrativa
CONDICIÓN F: Es mencionada en más de 3 versículos no consecutivos
```

### NO incluir si:
```
- Es referenciada solo como "un hombre", "una mujer", "alguien" sin nombre
- Es mencionada una sola vez de pasada sin rol en la narrativa
- Es una figura histórica referenciada pero que no aparece en la narrativa
  del libro (ej: mencionar a Moisés en un Evangelio no crea una entrada de Moisés)
  EXCEPCIÓN: Si aparece físicamente en una escena (ej: transfiguración → Moisés aparece)
```

### Cómo calcular el ancla esperada — POR TIPO DE LIBRO
```
PASO 1 — Identificar el tipo literario (mismo criterio que en Sección 0.5.1).

PASO 2 — Aplicar el rango esperado según tipo:
  A) Narrativo histórico largo:  50-90 personajes
  B) Evangelio sinóptico:        40-70 personajes
  C) Evangelio de Juan:          25-45 personajes
  D) Epístola doctrinal:         5-20 personajes
  E) Epístola breve/práctica:    2-15 personajes
  F) Libro profético:            15-50 personajes (varía mucho por libro)
  G) Libro de sabiduría:         5-20 personajes
  H) Apocalíptico:               10-30 personajes

PASO 3 — Aplicar la regla de corte:
  Si el array people tiene menos del 70% del mínimo esperado para el tipo
  → es insuficiente. Revisar capítulo por capítulo buscando nombres propios.

CALIBRACIÓN DE REFERENCIA (libros ya implementados en esta app):
  Génesis (tipo A) → 64 personajes en el JSON actual (usa como modelo)
```

### Auditoría obligatoria antes de entregar `people`
```
PASO 1: Recorrer el libro capítulo por capítulo.
         Por cada nombre propio encontrado, verificar si ya existe en el array.
         Si no existe y cumple alguna condición → agregarlo.

PASO 2: Verificar que los 12 apóstoles estén documentados (para Evangelios).
         → Si falta alguno de los 12, es un error de omisión.

PASO 3: Verificar que cada persona tiene los campos mínimos:
         id, name, name_meaning, category, family (aunque sea vacío),
         biography.short, key_verse, theological_significance.
         → Una persona sin biography.short está incompleta.

PASO 4: Verificar que cada id referenciado en:
         timeline_events[].key_people[]
         narrative_blocks[].key_people_ids[]
         people[].family.father / mother / spouses[] / children[]
         ...exista como entrada real en el array people[].
         → Si un id está referenciado pero no existe como persona, crear la entrada.
```

---

## 0.5.5 — CAPÍTULOS (`chapters_map`)

### Criterio — SIN EXCEPCIONES
```
El array chapters_map DEBE tener exactamente N entradas,
donde N = el número total de capítulos del libro según la Biblia.
Este número es un dato bíblico fijo, no estimado. No se permite redondear.

PROCEDIMIENTO:
  Antes de crear chapters_map, verificar el total de capítulos del libro
  en cualquier Biblia o índice bíblico. Usar ese número exacto.

NO se permite:
  - Dejar capítulos sin entrada
  - Fusionar dos capítulos en una sola entrada
  - Crear entradas con chapter_number duplicado
  - Crear más entradas que capítulos tiene el libro

VERIFICACIÓN FINAL:
  chapters_map.length === total_capítulos_del_libro
  Si no son iguales → error. Corregir antes de continuar.
```

### Campos mínimos por capítulo (todos obligatorios)
```
chapter            → número entero del capítulo (1, 2, 3...) [ÍNDICE PRINCIPAL DE REQUERIMIENTO DE LA UI]
chapter_number     → número entero del capítulo (1, 2, 3...) [ALIAS DE NORMADO PARA COMPATIBILIDAD]
title              → título descriptivo del capítulo (no "Capítulo 1")
summary            → resumen narrativo exegético de 2-4 oraciones de los acontecimientos
key_verse          → { reference: "...", text: "..." } — el versículo más representativo del capítulo
key_people         → array de IDs de personas principales del capítulo (DEBEN existir en el array people[])
key_events         → array de IDs de eventos principales (DEBEN existir en el array timeline_events[])
block_id           → ID del bloque narrativo al que pertenece (DEBE existir en el array narrative_blocks[])
locations          → array de IDs de ubicaciones geográficas involucradas (DEBEN existir en locations[])
greek_terms / hebrew_terms → array de términos clave en Hebreo/Griego con código Strong, versículo, transliteración y exégesis
outline            → array de divisiones del capítulo [{ verses: "vv. 1-15", title: "..." }]
christological_theme / theological_significance → revelación mesiánica, cristología y significancia teológica del capítulo
```

### Auditoría obligatoria
```
Contar entradas en chapters_map.
Si el número no es exactamente igual al total de capítulos del libro → error.
```

---

## 0.5.6 — UBICACIONES (`locations`)

### Criterio de inclusión — TEST BINARIO
```
Incluir una ubicación si:
  CONDICIÓN A: Su nombre geográfico aparece explícitamente en el texto RVR1960
  CONDICIÓN B: Un evento del array timeline_events tiene location_id apuntando a ella

NO incluir:
  - Lugares implícitos no nombrados ("un monte", "el desierto" sin nombre propio)
  EXCEPCIÓN: Si el lugar es teológicamente identificable aunque no nombrado
  (ej: "el monte de la transfiguración" → se documenta como "mount_hermon" con nota)
```

### Cómo calcular el ancla esperada — POR TIPO DE LIBRO
```
PASO 1 — Recorrer el libro capítulo por capítulo anotando cada nombre
          geográfico que aparezca en el texto RVR1960 (ciudad, región, río, mar,
          monte, desierto, nación). Crear una lista antes de escribir el JSON.

PASO 2 — Comparar la lista con el rango esperado por tipo:
  A) Narrativo histórico largo:   15-30 ubicaciones
  B) Evangelio sinóptico:         15-25 ubicaciones
  C) Evangelio de Juan:           10-18 ubicaciones
  D) Epístola doctrinal:          3-10 ubicaciones
  E) Epístola breve/práctica:     1-6 ubicaciones
  F) Libro profético:             20-50 ubicaciones (muy variable)
  G) Libro de sabiduría:          5-15 ubicaciones
  H) Apocalíptico:                10-25 ubicaciones

PASO 3 — Si la lista tiene menos del 70% del mínimo esperado para el tipo
          → revisar capítulos donde hay cero ubicaciones identificadas.

CALIBRACIÓN DE REFERENCIA (libros ya implementados en esta app):
  Génesis (tipo A) → ~22 ubicaciones en el JSON actual
```

### Campos mínimos por ubicación (todos obligatorios)
```
id           → snake_case único
name         → nombre en español
region       → región geográfica más amplia (obligatorio para el buscador global)
type         → "city" | "region" | "mountain" | "river" | "sea" | "desert" | "nation"
description  → descripción de 2-3 oraciones (histórica + bíblica)
modern_equiv → equivalente geográfico moderno (o "Desconocida" si no se puede determinar)
event_ids    → array de IDs de eventos que ocurren aquí
key_verse    → { reference: "...", text: "..." }
```

---

## 0.5.7 — TEMAS TEOLÓGICOS (`themes`)

### Criterio de inclusión — TEST BINARIO
```
Incluir un tema si cumple AMBAS condiciones simultáneamente:
  CONDICIÓN A: Tiene al menos 5 versículos de referencia distribuidos
               en al menos 3 capítulos distintos del libro
  CONDICIÓN B: Puede vincularse a al menos 3 eventos del array timeline_events

NO incluir:
  - Temas que solo aparecen en 1-2 capítulos (son subtemas, no temas del libro)
  - Temas genéricos de "toda la Biblia" que no tienen énfasis particular en este libro
```

### Proceso de descubrimiento de temas — OBLIGATORIO
```
Los temas NO se inventan ni se copian de ninguna lista externa.
DEBEN EMERGER del texto mismo siguiendo este proceso:

PASO 1 — Frecuencia léxica:
  Leer el libro completo e identificar los 30 conceptos/palabras
  más frecuentes (excluyendo artículos, preposiciones y conjunciones).
  Esas palabras frecuentes son candidatos a temas.

PASO 2 — Análisis de discursos y enseñanzas centrales:
  Identificar los discursos, enseñanzas o argumentos principales del libro.
  ¿Qué pregunta responde cada uno? Cada respuesta es un tema candidato.

PASO 3 — Propósito declarado del libro:
  Si el autor explicita el propósito del libro (ej: Juan 20:31, Lc 1:4),
  ese propósito es el tema central obligatorio.

PASO 4 — Aplicar el test binario a cada candidato:
  Incluir solo si cumple AMBAS condiciones (≥5 versículos en ≥3 capítulos
  Y vinculable a ≥3 eventos del array timeline_events).

PASO 5 — Eliminar redundancias:
  Si dos temas candidatos son el mismo concepto con distinto nombre,
  conservar el más específico y descartar el genérico.

PASO 6 — Verificar que no faltan temas universales de los Evangelios:
  Todo libro de los cuatro Evangelios DEBE tener documentados estos tipos de temas
  (los nombres y formulación exacta emergen del texto, no se copian de aquí):
  • Un tema sobre la identidad de Jesús como Mesías
  • Un tema sobre el cumplimiento de las Escrituras del AT
  • Un tema sobre el llamado al discipulado o seguimiento
  • Un tema sobre el Reino (su naturaleza, sus miembros, sus valores)
  Si alguno de estos tipos falta en el resultado → revisar el texto.
```

### Cantidad esperada por tipo de libro
```
A) Narrativo histórico largo:   10-15 temas
B) Evangelio sinóptico:         8-12 temas
C) Evangelio de Juan:           6-10 temas
D) Epístola doctrinal:          8-12 temas
E) Epístola breve/práctica:     4-8 temas
F) Libro profético:             8-15 temas
G) Libro de sabiduría:          10-20 temas
H) Apocalíptico:                6-12 temas

Si el resultado tiene menos del 70% del mínimo esperado → revisar PASO 1 y PASO 2.
```

---

## 0.5.8 — PREGUNTAS TEOLÓGICAS (`questions`)

### Criterio de inclusión
```
Incluir una pregunta si:
  CONDICIÓN A: Es frecuente en contextos de estudio bíblico, apologética
               o catequesis relacionada con este libro específicamente
  CONDICIÓN B: La respuesta puede sostenerse con versículos del libro mismo
               (no requiere solo versículos de otros libros)

Cantidad mínima: 8 preguntas
Cantidad máxima: 20 preguntas

Cada pregunta DEBE tener:
  - short_answer   → respuesta en 2-4 oraciones
  - full_answer    → respuesta completa con argumentos bíblicos (mínimo 150 palabras)
  - key_verse      → versículo principal de respaldo
  - references[]   → al menos 2 referencias bíblicas del mismo libro
```

### Proceso de identificación de preguntas — OBLIGATORIO
```
Las preguntas NO se inventan ni se copian. Emergen del texto y del
contexto de estudio bíblico real. Seguir este proceso:

PASO 1 — Preguntas de introducción al libro (siempre obligatorias, 2-3 preguntas):
  Por cada libro, documentar al menos:
  • Una pregunta sobre autoría y fecha de composición
  • Una pregunta sobre el propósito o audiencia original del libro
  Estas preguntas aplican a CUALQUIER libro bíblico.

PASO 2 — Preguntas doctrinales (3-6 preguntas):
  Leer el libro e identificar: ¿qué verdades doctrinales enseña que son
  cuestionadas, mal entendidas o debatidas en contextos actuales?
  Por cada verdad cuestionable → una pregunta doctrinal.

PASO 3 — Preguntas de dificultad textual (2-4 preguntas):
  Identificar los pasajes del libro que generan preguntas frecuentes por
  ser difíciles, aparentemente contradictorios o de difícil aplicación.
  Por cada pasaje difícil significativo → una pregunta.

PASO 4 — Preguntas de aplicación práctica (2-4 preguntas):
  ¿Qué enseña el libro sobre cómo vivir? ¿Cómo se aplica hoy?
  Una pregunta por cada aplicación práctica central del libro.

PASO 5 — Verificar que cada pregunta cumple el criterio de inclusión:
  CONDICIÓN A: Es frecuente en estudio bíblico, apologética o predicación
  CONDICIÓN B: La respuesta se sostiene con versículos del libro mismo
```

---

## 0.5.9 — PROMESAS MESIÁNICAS (`messianic_promises`)

### Proceso de identificación — PARA CUALQUIER LIBRO
```
PARA LIBROS DEL ANTIGUO TESTAMENTO:

PASO 1 — Promesas directas de Dios:
  Buscar frases donde Dios hace una promesa relacionada con el linaje,
  la redención, o un enviado futuro. Marcadores: "te daré", "de tu simiente",
  "levantaré", "vendrá", "él será".
  Por cada promesa encontrada → una entrada con type: "promise".

PASO 2 — Tipos cristológicos:
  Identificar personas, eventos u objetos que prefiguran a Cristo.
  Un tipo es válido si el NT lo interpreta explícitamente como tal.
  NO incluir tipos por interpretación propia sin respaldo en el NT.
  Por cada tipo con respaldo en el NT → una entrada con type: "type".

PASO 3 — Profecías mesiánicas explícitas:
  Pasajes con lenguaje mesiánico cuyo cumplimiento en Cristo es citado
  en el NT. Por cada profecía → una entrada con type: "prophecy".

PASO 4 — Verificar cumplimiento:
  Cada entrada DEBE tener su referencia de cumplimiento en el NT.
  Si no tiene cumplimiento documentado en el NT → no es una entrada válida.

─────────────────────────────────────────────────────

PARA LIBROS DEL NUEVO TESTAMENTO:

PASO 1 — Citas explícitas del AT (prioridad máxima):
  Buscar fórmulas de cumplimiento en el texto:
  "para que se cumpliese lo dicho por..."
  "como está escrito en..."
  "según las Escrituras"
  "esto es lo que dijo el profeta..."
  Por cada cita explícita → una entrada con type: "fulfillment".

PASO 2 — Títulos mesiánicos aplicados a Jesús:
  Cada vez que el texto aplica a Jesús un título mesiánico reconocido
  (Cristo/Mesías, Hijo de David, Señor, Hijo del Hombre, Cordero de Dios)
  con contexto de cumplimiento → documentarlo como type: "title".

PASO 3 — Alusiones al AT sin cita formal:
  Solo si la alusión es ampliamente reconocida por comentaristas evangélicos.
  Documentar como type: "allusion" con nota explicativa.
  NO documentar alusiones por interpretación propia.

ANCLA ESPERADA POR TIPO DE LIBRO:
  AT — Narrativo histórico largo:  6-20 entradas
  AT — Profético:                  20-50 entradas (alta densidad mesiánica)
  NT — Evangelio sinóptico:        10-25 entradas (citas + alusiones)
  NT — Evangelio de Juan:          5-15 entradas
  NT — Epístola doctrinal:         5-20 entradas
  NT — Apocalipsis:                20-40 entradas
```

---

## 0.5.10 — RESUMEN: AUDITORÍA FINAL CRUZADA

Antes de declarar el JSON de un libro como completo, ejecutar esta verificación:

```
VERIFICACIÓN 1: Integridad de IDs
  Por cada campo que referencia un ID de otra entidad:
  timeline_events[].key_people[]       → debe existir en people[]
  timeline_events[].location_id        → debe existir en locations[]
  timeline_events[].narrative_block_id → debe existir en narrative_blocks[]
  people[].family.father/mother        → debe existir en people[]
  people[].family.children[]           → debe existir en people[]
  people[].event_ids[]                 → debe existir en timeline_events[]
  chapters_map[].narrative_block_id    → debe existir en narrative_blocks[]
  chapters_map[].key_people[]          → debe existir en people[]
  chapters_map[].main_event_ids[]      → debe existir en timeline_events[]

VERIFICACIÓN 2: Cobertura de capítulos
  chapters_map tiene exactamente N entradas (N = total capítulos del libro).

VERIFICACIÓN 3: Cobertura de eventos por capítulo
  Ningún capítulo tiene 0 eventos en timeline_events.

VERIFICACIÓN 4: Categorías válidas
  Cada event.category es uno de los valores válidos del Bloque 0.5.2.
  No hay categorías inventadas o en español libre.

VERIFICACIÓN 5: Campos de búsqueda global
  Cada evento tiene: name (string no vacío) + summary (string no vacío)
  Cada persona tiene: name (string no vacío) + name_meaning (string no vacío)
  Cada ubicación tiene: name (string no vacío) + region (string no vacío)

SI ALGUNA VERIFICACIÓN FALLA → corregir antes de entregar. No es opcional.
```

---

> **FIN DEL BLOQUE 0.5**

---

# BLOQUE 1 — SCHEMA DE DATOS COMPLETO

## ⚠️ INSTRUCCIÓN PARA LA IA

Este bloque documenta el contrato exacto entre el JSON del libro y el código de la aplicación.
La fuente de verdad es `useGenesisData.js`, que es el único punto de entrada de datos.
Cualquier clave no listada aquí es ignorada. Cualquier clave listada aquí que falte en el JSON
produce silencio (no error) o pantalla vacía.

---

## 1.1 — Estructura Top-Level del JSON

El hook `useGenesisData.js` lee exactamente estas 11 claves del JSON. Todas son arrays.
Si una clave falta, el hook la reemplaza con `[]` (array vacío = pantalla en blanco).

```json
{
  "metadata":          { ... },      ← objeto, no array — ver 1.2
  "eras":              [ ... ],      ← bloques visuales de color en timeline (opcional)
  "dispensations":     [ ... ],      ← dispensaciones teológicas (opcional en NT)
  "narrative_blocks":  [ ... ],      ← CRÍTICO — bloques narrativos del filtro timeline
  "timeline_events":   [ ... ],      ← CRÍTICO — todos los eventos de la línea de tiempo
  "people":            [ ... ],      ← CRÍTICO — todos los personajes
  "locations":         [ ... ],      ← CRÍTICO — todas las ubicaciones geográficas
  "covenants":         [ ... ],      ← pactos bíblicos del libro
  "messianic_promises":[ ... ],      ← promesas/cumplimientos mesiánicos
  "themes":            [ ... ],      ← temas teológicos (usa ThemePanel)
  "questions":         [ ... ],      ← preguntas teológicas frecuentes
  "chapters_map":      [ ... ]       ← CRÍTICO — datos por capítulo (usa ChapterMapPanel)
}
```

---

## 1.2 — Schema de `metadata` (obligatorio)

```json
{
  "book_id":           "string — ID único del libro en snake_case, ej: 'exodus', 'matthew'",
  "title":             "string — Nombre completo del libro en español, ej: 'Éxodo'",
  "subtitle":          "string — Descripción breve del libro",
  "testament":         "'old' | 'new'",
  "canonical_order":   "number — Posición en el canon bíblico (Génesis=1, Mateo=40, etc.)",
  "total_chapters":    "number — Total de capítulos del libro (dato fijo bíblico)",
  "total_verses":      "number — Total de versículos del libro (dato fijo bíblico)",
  "chronology_system": "string — Sistema cronológico usado, ej: 'Anno Mundi (AM)' o 'a.C. / d.C.'",
  "am_start":          "number | null — Año AM del inicio del libro (null para libros sin sistema AM claro)",
  "am_end":            "number | null — Año AM del fin del libro",
  "language":          "'es'",
  "bible_version":     "'Reina-Valera 1960'",
  "schema_version":    "'3.0'",
  "description":       "string — Descripción completa del libro (mínimo 100 palabras)",
  "key_themes":        "string[] — Lista de los temas principales (mínimo 6)",
  "key_people_count":  "number — Cantidad de personajes en el array people[]",
  "key_events_count":  "number — Cantidad de eventos en el array timeline_events[]",
  "narrative_structure":"string — Descripción de la estructura narrativa del libro",
  "sources":           "string[] — Fuentes de referencia usadas para la data",
  "last_updated":      "string — Fecha de última actualización, ej: '2026-07'"
}
```

**Campos que el código consume directamente:**
- `metadata.book_id` → usado en el selector de libro del Header
- `metadata.total_chapters` → usado para validar chapters_map
- `metadata.title` → aparece en el Header como nombre del libro activo

---

## 1.3 — Schema de `narrative_blocks[]` (CRÍTICO)

Cada objeto en `narrative_blocks` representa una sección estructural del libro.
El filtro "Bloque Narrativo" de la Timeline los usa directamente.

```json
{
  "id":                    "string — ID único, snake_case, ej: 'nb_sermon_mount'",
  "era_id":                "string | null — ID de la era a la que pertenece (de eras[])",
  "dispensation_id":       "string | null — ID de la dispensación (de dispensations[])",
  "order":                 "number — Número de orden del bloque (1, 2, 3...)",
  "name":                  "string — Nombre completo del bloque narrativo",
  "name_short":            "string — Nombre corto (máx. 2-3 palabras) para etiquetas de UI",
  "chapters_start":        "number — Capítulo donde inicia este bloque",
  "chapters_end":          "number — Capítulo donde termina este bloque",
  "am_start":              "number | null — Año AM de inicio (null para libros NT que no usan AM)",
  "am_end":                "number | null — Año AM de fin",
  "icon":                  "string — Emoji representativo del bloque",
  "color_primary":         "string — Color hexadecimal primario del bloque en la UI",
  "color_secondary":       "string — Color hexadecimal secundario",
  "summary":               "string — Resumen narrativo del bloque (mínimo 100 palabras)",
  "theological_significance": "string — Importancia teológica del bloque (mínimo 80 palabras)",
  "messianic_connection":  "string — Conexión del bloque con Cristo (obligatorio, aunque sea breve)",
  "key_people_ids":        "string[] — IDs de personas principales (deben existir en people[])",
  "key_location_ids":      "string[] — IDs de ubicaciones principales (deben existir en locations[])",
  "key_covenant_ids":      "string[] — IDs de pactos (deben existir en covenants[], puede ser [])",
  "key_theme_ids":         "string[] — IDs de temas (deben existir en themes[], puede ser [])",
  "key_question_ids":      "string[] — IDs de preguntas (deben existir en questions[], puede ser [])",
  "event_ids":             "string[] — IDs de todos los eventos de este bloque (deben existir en timeline_events[])"
}
```

**Campos que el código consume directamente:**
- `narrative_blocks[].id` → key del filtro de bloque narrativo en la Timeline
- `narrative_blocks[].name` → etiqueta del filtro
- `narrative_blocks[].chapters_start` / `chapters_end` → determina qué capítulos pertenecen al bloque
- `narrative_blocks[].event_ids[]` → qué eventos mostrar cuando se filtra por este bloque

**Regla de cobertura:** Los rangos `chapters_start` → `chapters_end` de TODOS los bloques,
unidos, deben cubrir exactamente los capítulos 1..N (total de capítulos del libro).

---

## 1.4 — Schema de `timeline_events[]` (CRÍTICO)

Cada objeto representa un evento en la Línea de Tiempo.
Es el array más denso del JSON — define toda la pantalla de Timeline.

```json
{
  "id":           "string — ID único, snake_case. Ejemplo: 'baptism_jesus', 'sermon_mount'",
  "depth_level":  "1 | 2 | 3 — LOD del evento (1=Hito, 2=Estructurado, 3=Exhaustivo)",
  "parent_id":    "string — ID del narrative_block al que pertenece (debe existir en narrative_blocks[])",
  "name":         "string — Nombre completo del evento (aparece en el EventPanel)",
  "short_name":   "string — Nombre corto para etiquetas de la timeline (máx. 4-5 palabras)",
  "category":     "string — Una de las categorías válidas del Bloque 0.5.2",
  "importance":   "'critical' | 'high' | 'medium' | 'low'",
  "chronology": {
    "approx_year_am":   "number | null — Año AM aproximado del evento",
    "exact_date_note":  "string | null — Descripción textual de la fecha exacta si se conoce",
    "duration_days":    "number | null — Duración del evento en días si aplica",
    "duration_note":    "string — Nota descriptiva de la duración o período"
  },
  "location_id":      "string | null — ID de la ubicación (debe existir en locations[])",
  "chapter_start":    "number — Capítulo donde inicia el evento",
  "verse_start_ref":  "number — Versículo de inicio",
  "chapter_end":      "number — Capítulo donde termina el evento",
  "verse_end_ref":    "number — Versículo final",
  "narrative":        "string — Narración completa del evento (mínimo 150 palabras). NO es el versículo.",
  "historical_context": "string — Contexto histórico-cultural del evento",
  "theological_teaching": "string — Enseñanza teológica principal del evento",
  "messianic_connection": "string | null — Conexión con Cristo o el plan redentor (null si no aplica)",
  "key_people":       "string[] — IDs de personas del evento (deben existir en people[])",
  "covenant_id":      "string | null — ID del pacto relacionado (debe existir en covenants[])",
  "theme_ids":        "string[] — IDs de temas del evento (deben existir en themes[])",
  "question_ids":     "string[] — IDs de preguntas del evento (deben existir en questions[])",
  "references": [
    {
      "book":        "string — Nombre del libro bíblico",
      "chapter":     "number",
      "verse_start": "number",
      "verse_end":   "number"
    }
  ],
  "key_verse": {
    "reference": "string — Ej: 'Génesis 1:1'",
    "text":      "string — Texto completo del versículo en RVR1960"
  },
  "additional_verses": [
    {
      "reference": "string",
      "text":      "string"
    }
  ],
  "cross_references_nt": "string[] — Referencias del NT relacionadas. Ej: ['Juan 1:1', 'Hebreos 1:2']",
  "sub_event_ids":      "string[] — IDs de sub-eventos si los hay (puede ser [])",
  "timeline_display": {
    "label":          "string — Etiqueta de la pastilla en el timeline",
    "icon":           "string — Emoji para el evento",
    "color_category": "string — Debe coincidir con el campo category"
  }
}
```

**Campos CRÍTICOS para el buscador global:**
- `name` (string no vacío)
- El buscador busca en `e.summary || e.narrative` — ambos campos son válidos.
  → El Schema v3.0 usa `narrative`. Schemas anteriores usan `summary`.
  → El hook (`useGenesisData.js`) está configurado para aceptar ambos automáticamente.
  → **Regla para libros nuevos:** Incluir siempre el campo `narrative`. No agregar `summary` por separado.

---

## 1.5 — Schema de `people[]` (CRÍTICO)

```json
{
  "id":          "string — ID único, snake_case. Ej: 'jesus', 'peter', 'mary_magdalene'",
  "name":        "string — Nombre en español",
  "name_meaning": "string — Significado del nombre (hebreo o griego según testamento)",
  "category":    "string — Categoría del personaje. Ver lista de categorías válidas abajo.",
  "family": {
    "father":    "string | null — ID del padre (debe existir en people[])",
    "mother":    "string | null — ID de la madre (debe existir en people[])",
    "spouses":   "string[] — IDs de cónyuges (deben existir en people[])",
    "children":  "string[] — IDs de hijos (deben existir en people[])"
  },
  "biography": {
    "short":  "string — Resumen biográfico de 2-4 oraciones (aparece en la tarjeta de PersonPanel)",
    "full":   "string — Biografía completa (mínimo 200 palabras)"
  },
  "chronology": {
    "birth_am":    "number | null",
    "death_am":    "number | null",
    "lifespan":    "number | null",
    "birth_note":  "string | null — Nota sobre el nacimiento si no hay fecha AM exacta",
    "death_note":  "string | null"
  },
  "theological_significance": "string — Por qué esta persona importa teológicamente",
  "messianic_role":           "string | null — Papel en la línea o plan mesiánico (null si no aplica)",
  "key_verse": {
    "reference": "string",
    "text":      "string — Versículo en RVR1960"
  },
  "event_ids":             "string[] — IDs de eventos donde aparece (deben existir en timeline_events[])",
  "notable_overlaps":      "array | [] — Convivencias con otros personajes (puede ser [])",
  "cross_references_nt":   "string[] — Referencias del NT relacionadas",
  "references": [
    {
      "book": "string", "chapter": "number", "verse_start": "number", "verse_end": "number"
    }
  ]
}
```

**Categorías válidas para `people[].category`:**
```
Para libros del AT:
  "divinity"               → Dios (solo una entrada)
  "first_human"            → Adán, Eva
  "antediluvian_patriarch" → Patriarcas antes del diluvio
  "patriarch"              → Patriarcas post-diluvio
  "early_humanity"         → Personajes de la humanidad temprana

Para libros del NT (Evangelios):
  "messiah"                → Jesucristo
  "apostle"                → Los 12 apóstoles
  "disciple"               → Discípulos no apóstoles
  "prophet"                → Juan el Bautista y otros profetas
  "pharisee"               → Líderes religiosos antagonistas
  "roman"                  → Autoridades romanas
  "herod_dynasty"          → Miembros de la dinastía herodiana
  "woman"                  → Mujeres con rol activo en la narrativa
  "miracle_recipient"      → Receptor de milagro de Jesús
  "historical"             → Figuras históricas mencionadas

REGLA: Si ninguna categoría encaja, usar la más cercana.
NO inventar categorías nuevas sin actualizar el código del filtro.
```

**Campos CRÍTICOS para el buscador global:**
- `name` (string no vacío)
- `name_meaning` (string no vacío) — si falta, la persona no aparece en búsquedas por significado

**Campos CRÍTICOS para navegación:**
- `family.father` / `family.mother` / `family.spouses[]` / `family.children[]`
  → Si un ID aquí no existe en `people[]`, el botón de familia se muestra pero no hace nada.

---

## 1.6 — Schema de `locations[]` (CRÍTICO)

```json
{
  "id":           "string — ID único, snake_case. Ej: 'jerusalem', 'bethlehem', 'jordan_river'",
  "name":         "string — Nombre en español",
  "region":       "string — Región geográfica más amplia (OBLIGATORIO para buscador global)",
  "type":         "'city' | 'region' | 'mountain' | 'river' | 'sea' | 'desert' | 'nation' | 'planet'",
  "description":  "string — Descripción histórica y bíblica (mínimo 2 oraciones)",
  "modern_equiv": "string — Nombre moderno o equivalente actual ('Desconocida' si no se puede determinar)",
  "latitude":     "number | null — Coordenada geográfica (null si no se puede determinar)",
  "longitude":    "number | null",
  "event_ids":    "string[] — IDs de eventos que ocurren en esta ubicación",
  "key_verse": {
    "reference": "string",
    "text":      "string"
  },
  "references":   "array — Referencias bíblicas de la ubicación"
}
```

**Campos CRÍTICOS para el buscador global:**
- `name` (string no vacío)
- `region` (string no vacío) — si falta, la ubicación no aparece en búsquedas por región

---

## 1.7 — Schema de `covenants[]`

```json
{
  "id":           "string — ID único, snake_case. Ej: 'new_covenant'",
  "name":         "string — Nombre del pacto",
  "participants": "string[] — IDs de participantes (deben existir en people[])",
  "description":  "string — Descripción del pacto y sus condiciones",
  "references":   "array — Referencias bíblicas",
  "verses":       "array — Versículos del pacto con {reference, text}"
}
```

**Nota para libros del NT:** Si el libro no contiene el establecimiento formal de un pacto,
este array puede ser muy breve o contener solo el Nuevo Pacto. No forzar entradas vacías.

---

## 1.8 — Schema de `messianic_promises[]`

```json
{
  "id":          "string — ID único, snake_case",
  "title":       "string — Título de la promesa o cumplimiento",
  "type":        "'promise' | 'prophecy' | 'type' | 'fulfillment' | 'allusion' | 'title'",
  "through":     "string[] — IDs de personas a través de quienes pasa (de people[])",
  "description": "string — Descripción de la promesa/cumplimiento",
  "ot_reference":"string | null — Referencia del AT (para entradas de tipo 'fulfillment')",
  "nt_fulfillment":"string | null — Referencia del NT que cumple (para entradas de tipo 'promise')",
  "references":  "array — Referencias bíblicas",
  "verses":      "array — Versículos con {reference, text}"
}
```

---

## 1.9 — Schema de `themes[]`

```json
{
  "id":          "string — ID único, snake_case. Ej: 'theme_kingdom_of_heaven'",
  "name":        "string — Nombre del tema",
  "icon":        "string — Emoji representativo",
  "description": "string — Descripción del tema en el libro (mínimo 80 palabras)",
  "key_verses":  "array — Versículos representativos {reference, text}",
  "event_ids":   "string[] — IDs de eventos donde aparece este tema",
  "people_ids":  "string[] — IDs de personas asociadas al tema",
  "references":  "array — Referencias bíblicas"
}
```

---

## 1.10 — Schema de `questions[]`

```json
{
  "id":           "string — ID único, snake_case. Ej: 'question_virgin_birth'",
  "question":     "string — La pregunta formulada claramente",
  "category":     "string — Categoría temática (libre, para agrupar en la UI)",
  "short_answer": "string — Respuesta breve de 2-4 oraciones",
  "full_answer":  "string — Respuesta completa con argumentos bíblicos (mínimo 150 palabras)",
  "key_verse": {
    "reference": "string",
    "text":      "string"
  },
  "references":   "array — Referencias bíblicas usadas en la respuesta"
}
```

---

## 1.11 — Schema de `chapters_map[]` (CRÍTICO)

Cada entrada representa un capítulo completo del libro.
`ChapterMapPanel.jsx` lo consume directamente.
El hook lo indexa por `item.chapter_number || item.chapter`.

```json
{
  "chapter_number":      "number — Número del capítulo (1, 2, 3...)",
  "title":               "string — Título descriptivo del capítulo (NO 'Capítulo 1')",
  "summary":             "string — Resumen narrativo del capítulo (mínimo 3 oraciones)",
  "christological_theme":"string — Conexión del capítulo con Cristo",
  "key_verse": {
    "reference": "string",
    "text":      "string"
  },
  "narrative_block_id":  "string — ID del bloque narrativo (debe existir en narrative_blocks[])",
  "key_people":          "string[] — IDs de personas principales del capítulo (deben existir en people[])",
  "main_event_ids":      "string[] — IDs de eventos del capítulo (deben existir en timeline_events[])",
  "locations":           "string[] — IDs de ubicaciones del capítulo (deben existir en locations[])",
  "themes":              "string[] — IDs de temas del capítulo (deben existir en themes[])",
  "questions":           "string[] — IDs de preguntas del capítulo (deben existir en questions[])"
}
```

**Regla absoluta:** `chapters_map.length === metadata.total_chapters`

---

## 1.12 — Schema de `dispensations[]`

```json
{
  "id":           "string — ID único, snake_case. Ej: 'disp_grace'",
  "number":       "number — Número secuencial de la dispensación en la historia bíblica",
  "name":         "string — Nombre de la dispensación",
  "chapters_range":"string — Rango de capítulos/libros de la dispensación",
  "in_genesis":   "boolean — Si esta dispensación aparece en Génesis",
  "steward":      "string — Responsable/mayordomos de la dispensación",
  "responsibility":"string — Qué se les pedía",
  "failure":      "string — Cómo fallaron",
  "judgment":     "string — Consecuencia del fracaso",
  "grace":        "string — Respuesta de la gracia divina"
}
```

**Nota:** Para libros que no pertenecen a una dispensación distinta, este array puede contener
solo la dispensación en la que cae el libro. Para NT, normalmente es `disp_grace`.

---

## 1.13 — Schema de `eras[]`

```json
{
  "id":          "string — ID único, snake_case",
  "name":        "string — Nombre de la era",
  "subtitle":    "string — Subtítulo descriptivo",
  "description": "string — Descripción de la era",
  "chapters_start": "number",
  "chapters_end":   "number",
  "am_start":    "number | null",
  "am_end":      "number | null",
  "color_bg":    "string — Color hexadecimal de fondo",
  "color_accent":"string — Color de acento",
  "color_text":  "string — Color de texto",
  "narrative_block_ids": "string[] — IDs de bloques narrativos de esta era"
}
```

---

## 1.14 — Mapa de Dependencias entre Arrays

```
narrative_blocks[].id
    ← referenciado por: timeline_events[].parent_id
    ← referenciado por: chapters_map[].narrative_block_id

people[].id
    ← referenciado por: narrative_blocks[].key_people_ids[]
    ← referenciado por: timeline_events[].key_people[]
    ← referenciado por: people[].family.father/mother/spouses/children
    ← referenciado por: chapters_map[].key_people[]
    ← referenciado por: covenants[].participants[]
    ← referenciado por: themes[].people_ids[]
    ← referenciado por: messianic_promises[].through[]

locations[].id
    ← referenciado por: timeline_events[].location_id
    ← referenciado por: narrative_blocks[].key_location_ids[]
    ← referenciado por: chapters_map[].locations[]

timeline_events[].id
    ← referenciado por: narrative_blocks[].event_ids[]
    ← referenciado por: chapters_map[].main_event_ids[]
    ← referenciado por: people[].event_ids[]
    ← referenciado por: themes[].event_ids[]

themes[].id
    ← referenciado por: timeline_events[].theme_ids[]
    ← referenciado por: narrative_blocks[].key_theme_ids[]
    ← referenciado por: chapters_map[].themes[]

questions[].id
    ← referenciado por: narrative_blocks[].key_question_ids[]
    ← referenciado por: timeline_events[].question_ids[]
    ← referenciado por: chapters_map[].questions[]

covenants[].id
    ← referenciado por: narrative_blocks[].key_covenant_ids[]
    ← referenciado por: timeline_events[].covenant_id

REGLA: Si un ID es referenciado pero no existe como entrada en su array de origen →
el componente recibe null y la sección se muestra vacía o el botón no navega.
```

---

## 1.15 — Orden de Creación Recomendado

Para minimizar referencias rotas, crear los arrays en este orden:

```
1. metadata          → sin dependencias
2. eras              → sin dependencias
3. dispensations     → sin dependencias
4. themes            → sin dependencias (los IDs serán referenciados después)
5. questions         → sin dependencias (los IDs serán referenciados después)
6. covenants         → sin dependencias (los IDs serán referenciados después)
7. locations         → sin dependencias (los IDs serán referenciados después)
8. people            → depende de: otros IDs de people (family)
9. narrative_blocks  → depende de: people, locations, themes, questions, covenants
10. timeline_events  → depende de: narrative_blocks, people, locations, themes, questions, covenants
11. messianic_promises → depende de: people
12. chapters_map     → depende de: narrative_blocks, people, timeline_events, locations, themes, questions
```

---

> **FIN DEL BLOQUE 1**

---

# BLOQUE 2 — REGISTRO EN EL CÓDIGO

## ⚠️ INSTRUCCIÓN PARA LA IA

Este bloque documenta los únicos 4 archivos de código que deben modificarse
para que un libro nuevo funcione en la aplicación. No hay más archivos que tocar.
Toda la demás lógica es genérica y funciona automáticamente con el JSON correcto.

---

## 2.1 — Paso 1: Crear el archivo JSON del libro

```
UBICACIÓN OBLIGATORIA:
  src/data/books/[book_id].json

Donde [book_id] es exactamente el valor de metadata.book_id del JSON.
Ejemplos:
  Éxodo        → src/data/books/exodus.json
  Marcos       → src/data/books/mark.json
  Romanos      → src/data/books/romans.json

REGLA: El nombre del archivo DEBE coincidir con el book_id en el JSON.
Si hay discrepancia, el import en el paso 2 va a fallar.
```

---

## 2.2 — Paso 2: Importar en `useGenesisData.js`

**Archivo:** `src/hooks/useGenesisData.js`

```javascript
// AGREGAR en la sección de imports al principio del archivo:
import exodusData from '../data/books/exodus.json';
// (reemplazar 'exodus' con el book_id real del libro)
```

Luego, en el useMemo que selecciona el libro activo (línea ~10-12):

```javascript
// ANTES (ejemplo con Génesis y Mateo):
const currentData = useMemo(() => {
  return bookId === 'matthew' || bookId === 'mateo' ? matthewData : genesisData;
}, [bookId]);

// DESPUÉS (agregar cada libro nuevo en cascada):
const currentData = useMemo(() => {
  if (bookId === 'matthew' || bookId === 'mateo') return matthewData;
  if (bookId === 'exodus' || bookId === 'exodo')   return exodusData;
  // Agregar una línea por cada libro nuevo aquí
  return genesisData; // siempre el último como fallback
}, [bookId]);
```

**Regla:** El fallback final siempre debe ser `genesisData`.
Si un book_id no está listado, la app carga Génesis silenciosamente.

---

## 2.3 — Paso 3: Agregar la opción en `Header.jsx`

**Archivo:** `src/components/navigation/Header.jsx`

**Dónde:** Buscar el bloque `<select>` con las opciones de libros (línea ~88-91).

```jsx
// AGREGAR una línea <option> para el nuevo libro:
<option value="exodus">📖 Éxodo (40 Caps - N Eventos)</option>

// Donde:
//   value="exodus"  → debe coincidir EXACTAMENTE con el book_id del JSON
//   "40 Caps"      → número real de capítulos del libro
//   "N Eventos"    → completar con metadata.key_events_count del JSON
```

**Convención de emoji por tipo de libro:**
```
📖  → Libros históricos narrativos
✝️  → Evangelios y Nuevo Testamento
📜  → Libros proféticos
📝  → Epístolas
🎶  → Salmos y libros de sabiduría
```

---

## 2.4 — Paso 4: Extender el ternario de capítulos en `Header.jsx`

**Archivo:** `src/components/navigation/Header.jsx`
**Dónde:** Línea ~124 — hay un ternario que calcula el número de capítulos.

```jsx
// ESTADO ACTUAL (ejemplo):
activeBookId === 'matthew' ? 28 : 50

// DESPUÉS DE AGREGAR ÉXODO:
activeBookId === 'matthew' ? 28
  : activeBookId === 'exodus' ? 40
  : 50   // ← Génesis es siempre el fallback final

// PATRÓN GENERAL (agregar un ternario anidado por cada libro):
activeBookId === '[book_id_1]' ? [N_caps_1]
  : activeBookId === '[book_id_2]' ? [N_caps_2]
  : activeBookId === '[book_id_3]' ? [N_caps_3]
  : 50  // fallback Génesis
```

**El valor N** es `metadata.total_chapters` del JSON del libro.
Este es un dato bíblico fijo — no estimar.

---

## 2.5 — Verificación de Registro (ejecutar tras los 4 pasos)

```
VERIFICACIÓN 1: Compilación
  Ejecutar: npm run dev
  Si hay error de import → revisar que el nombre del archivo JSON
  coincide exactamente con el import en useGenesisData.js.

VERIFICACIÓN 2: Selector de libro
  Abrir la app en el navegador.
  El nuevo libro debe aparecer en el dropdown del Header.
  Si no aparece → revisar Paso 3 (la opción <option>).

VERIFICACIÓN 3: Cambio de libro
  Seleccionar el nuevo libro desde el dropdown.
  La URL o el estado debe cambiar al book_id del nuevo libro.
  El Header debe mostrar el título del nuevo libro.
  Si muestra Génesis → revisar Paso 2 (el if en useMemo).

VERIFICACIÓN 4: Línea de Tiempo
  Ir a la pantalla Timeline.
  Deben aparecer eventos del nuevo libro.
  Si está vacía → el array timeline_events[] del JSON está vacío o mal formado.

VERIFICACIÓN 5: Filtro de capítulos
  El selector de capítulos en el Header debe mostrar el número correcto.
  Si muestra "50" para un libro de 28 capítulos → revisar Paso 4.

VERIFICACIÓN 6: Personajes
  Ir a la pantalla Personajes.
  Deben aparecer personajes del nuevo libro.
  Si está vacía → el array people[] del JSON está vacío o mal formado.

VERIFICACIÓN 7: Buscador global
  Escribir el nombre de un personaje o evento del nuevo libro.
  Debe aparecer en los resultados.
  Si no aparece → verificar que los campos name y narrative/summary no están vacíos.

VERIFICACIÓN 8: Navegación cruzada
  En la Timeline, hacer click en un personaje de un evento.
  Debe navegar a la pantalla Personajes y abrir la ficha de ese personaje.
  Si no abre nada → el ID del personaje en key_people[] no existe en people[].
```

---

## 2.6 — Tabla Resumen: 4 Archivos a Modificar

| # | Archivo | Qué agregar | Si falta |
|---|---------|-------------|----------|
| 1 | `src/data/books/[book_id].json` | El JSON completo del libro (nuevo archivo) | Nada funciona |
| 2 | `src/hooks/useGenesisData.js` | Import + línea en el useMemo | La app carga Génesis para cualquier book_id |
| 3 | `src/components/navigation/Header.jsx` | `<option>` en el selector | El libro no aparece en el dropdown |
| 4 | `src/components/navigation/Header.jsx` | Línea en el ternario de capítulos | El contador de capítulos muestra el valor del libro anterior |

**No hay más archivos que tocar.** Todo el resto (Timeline, Personajes, Capítulos, Búsqueda,
Pactos, Temas, Preguntas) es código genérico que se alimenta del JSON automáticamente.

---

> **FIN DEL BLOQUE 2**

---

# BLOQUE 3 — CHECKLIST DE IMPLEMENTACIÓN

## ⚠️ INSTRUCCIÓN CRÍTICA PARA LA IA

Este bloque es la secuencia exacta de trabajo a seguir para implementar cualquier libro nuevo.
Las fases están ordenadas por dependencias: NO saltar fases. NO pasar a la fase siguiente
sin completar la auditoría de la fase actual. NO declarar una fase terminada
si algún ítem de su auditoría falla.

El libro de referencia para comparar estructura y densidad es siempre **Génesis** (`genesis.json`).

---

## FASE 0 — PREPARACIÓN (antes de escribir datos)

Esta fase no produce datos. Produce decisiones necesarias para no errar en las fases siguientes.

```
[ ] 0.1 — Leer este documento completo antes de escribir ningún dato.

[ ] 0.2 — Identificar el tipo literario del libro (ver Bloque 0.5.1, Paso 1):
          Registrar: tipo = _____ (A/B/C/D/E/F/G/H)

[ ] 0.3 — Obtener el total exacto de capítulos del libro (dato bíblico fijo):
          Registrar: total_chapters = _____

[ ] 0.4 — Registrar los rangos cronológicos del libro:
          Registrar: am_start = _____, am_end = _____
          (o bc_ad_start / bc_ad_end para libros NT)

[ ] 0.5 — Calcular el ancla mínima esperada para cada array (ver Bloque 0.5):
          timeline_events mínimo esperado: _____ eventos
          people mínimo esperado:          _____ personajes
          locations mínimo esperado:       _____ ubicaciones
          narrative_blocks esperados:      _____ bloques
          themes esperados:                _____ temas
          questions mínimo:                8 preguntas

[ ] 0.6 — Leer el libro bíblico completo (RVR1960) capítulo por capítulo y producir:
          (a) Lista de todos los nombres propios encontrados → candidatos a people[]
          (b) Lista de todos los nombres geográficos encontrados → candidatos a locations[]
          (c) Lista de todas las unidades narrativas → candidatos a timeline_events[]
          (d) Lista de marcadores estructurales del libro → candidatos a narrative_blocks[]

CRITERIO DE PASO DE FASE 0:
  Las 4 listas del ítem 0.6 deben estar completas.
  Los anclas del ítem 0.5 deben estar calculadas.
  Si alguna lista tiene 0 ítems → la lectura del texto fue incompleta. Repetir.
```

---

## FASE 1 — ARRAYS SIN DEPENDENCIAS

Estos 6 arrays no referencian IDs de otros arrays. Crearlos primero evita referencias rotas.

```
[ ] 1.1 — Crear metadata (ver Bloque 1.2)
          Verificar: book_id en snake_case, sin espacios.
          Verificar: total_chapters = valor exacto de la Biblia.
          Verificar: key_themes[] tiene al menos 6 temas.

[ ] 1.2 — Crear eras[] (ver Bloque 1.13)
          Para libros con una sola era: un único objeto en el array.
          Para libros que abarcan múltiples eras históricas: múltiples objetos.
          Verificar: la suma chapters_start..chapters_end cubre todos los capítulos.

[ ] 1.3 — Crear dispensations[] (ver Bloque 1.12)
          Para NT: normalmente solo disp_grace.
          Para AT: las dispensaciones que se manifiestan en el libro.
          Verificar: cada dispensación tiene steward, responsibility, failure, judgment, grace.

[ ] 1.4 — Crear themes[] (ver Bloque 1.9 + proceso Bloque 0.5.7)
          PROCESO OBLIGATORIO: aplicar los 6 pasos del Bloque 0.5.7. No copiar listas.
          Verificar: cantidad dentro del rango esperado (ítem 0.5).
          Verificar: cada tema cumple AMBAS condiciones del test binario.
          Verificar: cada tema tiene description (mínimo 80 palabras).

[ ] 1.5 — Crear questions[] (ver Bloque 1.10 + proceso Bloque 0.5.8)
          PROCESO OBLIGATORIO: aplicar los 5 pasos del Bloque 0.5.8. No copiar listas.
          Verificar: mínimo 8 preguntas, máximo 20.
          Verificar: cada pregunta tiene short_answer + full_answer (mínimo 150 palabras).

[ ] 1.6 — Crear covenants[] (ver Bloque 1.7)
          Para AT: los pactos explícitamente establecidos en el libro.
          Para NT: el Nuevo Pacto si el libro lo menciona explícitamente.
          Si el libro no establece ningún pacto nuevo: array vacío [].

[ ] 1.7 — Crear locations[] (ver Bloque 1.6 + proceso Bloque 0.5.6)
          PROCESO OBLIGATORIO: usar la lista del ítem 0.6(b) como fuente.
          Verificar: cantidad dentro del rango esperado (ítem 0.5).
          Verificar: cada ubicación tiene name + region (obligatorios para buscador).
          Verificar: cada ubicación tiene description (mínimo 2 oraciones).

CRITERIO DE PASO DE FASE 1:
  Todos los ítems marcados. Todas las verificaciones pasadas.
  Los arrays resultantes NO referencian aún IDs de people[] ni timeline_events[].
```

---

## FASE 2 — PERSONAJES (`people[]`)

Depende de: otros IDs de `people[]` (relaciones familiares).
No depende aún de: `timeline_events[]` (los `event_ids` se completan en Fase 4).

```
[ ] 2.1 — Usar la lista del ítem 0.6(a) como fuente de candidatos.
          Aplicar el test binario de inclusión (ver Bloque 0.5.4).
          Por cada candidato que pasa al menos UNA condición → crear entrada en people[].

[ ] 2.2 — Para cada persona, completar todos los campos del schema (ver Bloque 1.5):
          Verificar: id único en snake_case.
          Verificar: name_meaning (hebreo o griego según testamento) — no dejar vacío.
          Verificar: biography.short (2-4 oraciones).
          Verificar: biography.full (mínimo 200 palabras).
          Verificar: theological_significance (no vacío).
          Verificar: key_verse.text en RVR1960.

[ ] 2.3 — Completar relaciones familiares (family.father, mother, spouses[], children[]):
          Verificar: cada ID referenciado existe como entrada en people[].
          Si un padre/madre no está en people[] → crearlo aunque sea con datos mínimos.

[ ] 2.4 — AUDITORÍA de Fase 2:
          (a) Contar entradas en people[]. ¿Supera el 70% del mínimo esperado?
              Si NO → revisar lista 0.6(a) buscando nombres omitidos.
          (b) Para Evangelios: verificar que los 12 apóstoles están todos.
              Mateo, Pedro, Andrés, Juan, Santiago (hijo de Zebedeo), Felipe,
              Bartolomé, Tomás, Mateo el publicano, Santiago (hijo de Alfeo),
              Tadeo/Judas (hijo de Santiago), Simón el Zelote.
              Si falta alguno → crearlo.
          (c) Verificar que ningún people[].id contiene espacios, mayúsculas o caracteres especiales.
          (d) Verificar que ningún biography.short o name_meaning está vacío.

CRITERIO DE PASO DE FASE 2:
  Todos los ítems de la auditoría pasados.
  Ningún ID de family apunta a una persona que no existe en people[].
```

---

## FASE 3 — BLOQUES NARRATIVOS (`narrative_blocks[]`)

Depende de: `people[]`, `locations[]`, `themes[]`, `questions[]`, `covenants[]`.
No depende aún de: `timeline_events[]` (los `event_ids` se completan en Fase 4).

```
[ ] 3.1 — Usar la lista del ítem 0.6(d) para identificar los bloques.
          Aplicar el proceso de 4 pasos del Bloque 0.5.3. No inventar divisiones.

[ ] 3.2 — Para cada bloque, completar todos los campos del schema (ver Bloque 1.3):
          Verificar: id único en snake_case.
          Verificar: chapters_start y chapters_end son números enteros válidos.
          Verificar: summary (mínimo 100 palabras).
          Verificar: theological_significance (mínimo 80 palabras).
          Verificar: messianic_connection (nunca vacío — siempre hay conexión con Cristo).

[ ] 3.3 — Poblar key_people_ids[], key_location_ids[], key_theme_ids[]:
          Verificar: cada ID en key_people_ids[] existe en people[].
          Verificar: cada ID en key_location_ids[] existe en locations[].
          Verificar: cada ID en key_theme_ids[] existe en themes[].
          Dejar event_ids[] como [] por ahora (se completa en Fase 4).

[ ] 3.4 — AUDITORÍA de Fase 3:
          (a) Unir todos los rangos chapters_start..chapters_end de todos los bloques.
              ¿Cubren sin gap ni solapamiento los capítulos 1..total_chapters?
              Si NO → crear o ajustar bloques hasta cubrir todos.
          (b) ¿La cantidad de bloques está dentro del rango esperado (ítem 0.5)?
              Si NO → revisar si hay bloques que se pueden dividir o fusionar.
          (c) ¿Cada bloque tiene un nombre teológicamente descriptivo (no "Sección A")?
              Si NO → renombrar.

CRITERIO DE PASO DE FASE 3:
  Cobertura completa de capítulos sin gaps.
  Todos los IDs cruzados existen en sus respectivos arrays.
```

---

## FASE 4 — EVENTOS DE LA LÍNEA DE TIEMPO (`timeline_events[]`)

Depende de: `narrative_blocks[]`, `people[]`, `locations[]`, `themes[]`, `questions[]`, `covenants[]`.
Es el array más grande. Dividir el trabajo por bloques narrativos.

```
[ ] 4.1 — Usar la lista del ítem 0.6(c) y el test binario del Bloque 0.5.1.
          Procesar un narrative_block a la vez (de menor a mayor capítulo).

[ ] 4.2 — Para cada evento, completar todos los campos del schema (ver Bloque 1.4):
          Verificar: id único en snake_case (sin espacios ni caracteres especiales).
          Verificar: depth_level correcto (1=Hito, 2=Estructurado, 3=Exhaustivo).
          Verificar: parent_id apunta a un ID existente en narrative_blocks[].
          Verificar: category es uno de los valores válidos del Bloque 0.5.2.
          Verificar: narrative (mínimo 150 palabras).
          Verificar: historical_context (no vacío).
          Verificar: theological_teaching (no vacío).
          Verificar: key_verse.text en RVR1960.
          Verificar: cross_references_nt[] tiene al menos 2 referencias.

[ ] 4.3 — Para cada evento, poblar key_people[], location_id, theme_ids[]:
          Verificar: cada ID en key_people[] existe en people[].
          Verificar: location_id existe en locations[] (o null si no aplica).
          Verificar: cada ID en theme_ids[] existe en themes[].

[ ] 4.4 — Tras crear todos los eventos de un bloque narrativo, actualizar ese bloque:
          narrative_blocks[bloque].event_ids = [lista de todos los IDs de eventos del bloque]

[ ] 4.5 — AUDITORÍA de Fase 4:
          (a) Contar total de eventos. ¿Supera el 60% del mínimo esperado (ítem 0.5)?
              Si NO → releer los capítulos del libro buscando escenas no documentadas.
          (b) Listar eventos por capítulo (usando chapter_start de cada evento).
              ¿Algún capítulo tiene 0 eventos en depth_level 2?
              Si hay capítulos con 0 → revisar esos capítulos del texto.
          (c) Listar eventos por categoría.
              ¿Alguna categoría válida tiene 0 eventos asignados?
              Evaluar si es apropiado para este libro o si hubo omisiones.
          (d) Contar eventos por depth_level.
              ¿Hay entre 8-15 eventos de depth_level 1?
              Si hay más de 15 → reclasificar los menos críticos a depth_level 2.
          (e) Verificar que ningún event.id contiene espacios o mayúsculas.

CRITERIO DE PASO DE FASE 4:
  Total de eventos supera el 60% del mínimo esperado.
  Ningún capítulo con 0 eventos en LOD2.
  Todas las auditorías pasadas.
  Todos los narrative_blocks tienen event_ids[] completado.
```

---

## FASE 5 — PROMESAS MESIÁNICAS (`messianic_promises[]`)

Depende de: `people[]`.

```
[ ] 5.1 — Aplicar el proceso del Bloque 0.5.9 según el testamento del libro.
          AT: buscar promesas directas + tipos + profecías.
          NT: buscar citas explícitas de cumplimiento + títulos mesiánicos.

[ ] 5.2 — Para cada entrada, completar el schema (ver Bloque 1.8):
          Verificar: type es uno de los valores válidos ('promise'|'prophecy'|'type'|'fulfillment'|'allusion'|'title').
          Verificar: through[] solo contiene IDs que existen en people[].
          Verificar: para tipo 'fulfillment': tiene ot_reference (la profecía que cumple).
          Verificar: para tipo 'promise': tiene nt_fulfillment (dónde se cumple en el NT).
          Verificar: cada entrada tiene key_verse con texto RVR1960.

[ ] 5.3 — AUDITORÍA de Fase 5:
          ¿La cantidad de entradas está dentro del rango esperado (Bloque 0.5.9)?
          Para NT: ¿las citas explícitas de cumplimiento del autor están todas documentadas?
          (Buscar 'para que se cumpliese', 'como está escrito', 'según las Escrituras')

CRITERIO DE PASO DE FASE 5:
  Todas las citas explícitas de cumplimiento (para NT) documentadas.
  Todos los IDs de through[] existen en people[].
```

---

## FASE 6 — MAPA DE CAPÍTULOS (`chapters_map[]`)

Depende de: todo lo demás. Es el último array en crearse.

```
[ ] 6.1 — Crear UNA entrada por cada capítulo del libro. Sin excepción.
          Verificar antes de empezar: total_chapters del metadata.
          Crear entradas para capítulos 1, 2, 3, ... hasta total_chapters.

[ ] 6.2 — Para cada capítulo, completar todos los campos del schema (ver Bloque 1.11):
          Verificar: chapter_number es el número entero correcto.
          Verificar: title es descriptivo (no "Capítulo 1").
          Verificar: summary tiene mínimo 3 oraciones.
          Verificar: christological_theme (no vacío).
          Verificar: key_verse.text en RVR1960.
          Verificar: narrative_block_id existe en narrative_blocks[].

[ ] 6.3 — Poblar key_people[], main_event_ids[], locations[], themes[], questions[]:
          Verificar: cada ID en key_people[] existe en people[].
          Verificar: cada ID en main_event_ids[] existe en timeline_events[].
          Verificar: cada ID en locations[] existe en locations[].
          Verificar: cada ID en themes[] existe en themes[].
          Verificar: cada ID en questions[] existe en questions[].

[ ] 6.4 — AUDITORÍA de Fase 6:
          (a) Contar entradas en chapters_map[].
              ¿El total es EXACTAMENTE igual a metadata.total_chapters?
              Si NO → hay capítulos duplicados o faltantes. Corregir.
          (b) ¿Alguna entrada tiene main_event_ids[] vacío?
              Si SÍ → ese capítulo no tiene eventos asignados. Revisar timeline_events[].
          (c) ¿Alguna entrada tiene key_people[] vacío?
              Si SÍ → revisar si ese capítulo realmente no tiene personajes relevantes.

CRITERIO DE PASO DE FASE 6:
  chapters_map.length === metadata.total_chapters (exacto).
  Todos los IDs cruzados verificados.
```

---

## FASE 7 — ACTUALIZAR PEOPLE CON EVENT_IDS

Esta fase retroalimenta `people[]` con los IDs de eventos creados en Fase 4.

```
[ ] 7.1 — Para cada persona en people[]:
          Recorrer timeline_events[] y encontrar todos los eventos donde aparece
          esa persona (donde su ID está en event.key_people[]).
          Actualizar people[persona].event_ids[] con esos IDs de eventos.

[ ] 7.2 — AUDITORÍA de Fase 7:
          ¿Hay personas con event_ids[] vacío que claramente aparecen en eventos?
          Si SÍ → revisar el cruce y actualizar.

CRITERIO DE PASO DE FASE 7:
  Las personas principales tienen event_ids[] no vacíos.
```

---

## FASE 8 — AUDITORÍA FINAL CRUZADA

Ejecutar todas las verificaciones del Bloque 0.5.10 antes de declarar el JSON terminado.

```
[ ] 8.1 — VERIFICACIÓN 1: Integridad de IDs
          Ejecutar mentalmente (o con un script) cada relación de referencia listada en Bloque 0.5.10.
          Para cada ID referenciado: ¿existe la entrada correspondiente en su array?
          Si falla alguna: corregir antes de continuar.

[ ] 8.2 — VERIFICACIÓN 2: Cobertura de capítulos
          chapters_map.length === total_chapters. ¿Exacto? Si no → corregir.

[ ] 8.3 — VERIFICACIÓN 3: Cobertura de eventos por capítulo
          Ningún capítulo tiene 0 eventos en LOD2. ¿Correcto? Si no → agregar eventos.

[ ] 8.4 — VERIFICACIÓN 4: Categorías válidas
          Cada event.category es uno de los valores de la lista del Bloque 0.5.2.
          Si hay categorías no válidas → corregir.

[ ] 8.5 — VERIFICACIÓN 5: Campos de búsqueda global
          Cada evento tiene name (no vacío) + narrative (no vacío).
          Cada persona tiene name (no vacío) + name_meaning (no vacío).
          Cada ubicación tiene name (no vacío) + region (no vacío).
          Si alguno está vacío → completar.

[ ] 8.6 — Verificar que el JSON es sintácticamente válido (sin comas al final de arrays,
          sin comillas mal cerradas, sin caracteres especiales sin escapar).
          Usar un validador de JSON si es posible.

CRITERIO DE PASO DE FASE 8:
  Las 5 verificaciones del Bloque 0.5.10 pasadas sin ningún fallo.
  El JSON es sintácticamente válido.
```

---

## FASE 9 — REGISTRO EN EL CÓDIGO

Seguir exactamente el Bloque 2 de esta guía.

```
[ ] 9.1 — Guardar el JSON en src/data/books/[book_id].json
          Verificar: el nombre del archivo es exactamente metadata.book_id + ".json"

[ ] 9.2 — Agregar el import en useGenesisData.js (Bloque 2.2)
          Verificar: el import usa la ruta relativa correcta '../data/books/[archivo]'

[ ] 9.3 — Agregar la línea al useMemo en useGenesisData.js (Bloque 2.2)
          Verificar: el book_id en el if() coincide exactamente con metadata.book_id

[ ] 9.4 — Agregar <option> en Header.jsx (Bloque 2.3)
          Verificar: el value="" coincide exactamente con metadata.book_id

[ ] 9.5 — Extender el ternario de capítulos en Header.jsx (Bloque 2.4)
          Verificar: el número de capítulos es el total_chapters del JSON

[ ] 9.6 — Ejecutar npm run dev y verificar que compila sin errores.

[ ] 9.7 — Ejecutar las 8 verificaciones del Bloque 2.5 en el navegador.
          Registrar qué verificaciones pasaron y cuáles fallaron.
          Si alguna falla → diagnosticar usando la tabla de consecuencias del Bloque 0.7.

CRITERIO DE PASO DE FASE 9 (= libro implementado correctamente):
  npm run dev compila sin errores.
  Las 8 verificaciones del Bloque 2.5 pasan todas.
  El libro nuevo es funcional en el 100% de las pantallas.
```

---

## Tabla Resumen de Fases

| Fase | Nombre | Arrays creados | Depende de |
|------|--------|----------------|------------|
| 0 | Preparación | — | Texto bíblico |
| 1 | Arrays base | metadata, eras, dispensations, themes, questions, covenants, locations | — |
| 2 | Personajes | people[] | people[] (family) |
| 3 | Estructura narrativa | narrative_blocks[] | people, locations, themes, questions, covenants |
| 4 | Línea de tiempo | timeline_events[] | narrative_blocks, people, locations, themes, questions, covenants |
| 5 | Hilo mesiánico | messianic_promises[] | people |
| 6 | Capítulos | chapters_map[] | todo lo anterior |
| 7 | Retroalimentación | people[].event_ids | timeline_events |
| 8 | Auditoría final | — | todo |
| 9 | Registro código | 4 archivos de código | JSON terminado |

---

> **FIN DEL BLOQUE 3**
>
> **DOCUMENTO COMPLETO.**
> Los Bloques 0 al 3 contienen todo lo necesario para implementar cualquier libro bíblico
> de forma correcta, completa y profesional. Leer en orden. No saltar fases.

