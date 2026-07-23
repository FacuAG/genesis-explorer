# BIBLE EXPLORER — GUIA MAESTRA DEL PROYECTO
Documento de referencia para agentes IA y desarrolladores
Version 1.0 - Julio 2026

INSTRUCCION PARA CUALQUIER IA QUE LEA ESTE ARCHIVO:
Este documento es la fuente de verdad del proyecto. Antes de escribir una sola linea de codigo o dato, lee este archivo completo. Contiene las decisiones de arquitectura, el estado del proyecto, los prompts exactos para cada etapa, y las reglas de trabajo. No improvises ni cambies decisiones ya tomadas sin justificacion documentada.

=======================================================================
## 1. VISION Y OBJETIVO FINAL DEL PROYECTO
=======================================================================

Una herramienta web interactiva de estudio biblico basada en una linea de tiempo multi-nivel. El usuario puede explorar cualquier libro de la Biblia navegando desde una vista macro de miles de anios hasta el detalle de un versiculo especifico, el perfil de un personaje, sus relaciones familiares, los pactos de Dios, el contexto historico y las preguntas teologicas.

EL PRINCIPIO CENTRAL: "Como Google Maps para la Biblia"
- NIVEL 0 — Satelite    → Grandes dispensaciones / eras historicas
- NIVEL 1 — Region      → Bloques narrativos del libro
- NIVEL 2 — Ciudad      → Eventos principales (~100 por libro)
- NIVEL 3 — Barrio      → Escenas especificas con versiculos
- NIVEL 4 — Calle       → Detalles: personajes, pactos, contexto, preguntas

FUNCIONALIDADES CORE (prioritarias):
- Linea de tiempo interactiva con zoom real de eje temporal (vis-timeline)
- 5 niveles de profundidad con visibilidad progresiva
- Panel de detalle de eventos (narrativa, versiculos, contexto historico, ensenanza teologica)
- Panel de perfil de personajes (biografia, relaciones, arco narrativo, convivencias)
- Filtros por categoria de evento
- Bandas de dispensaciones como fondo de la timeline
- Linea mesianica dorada cruzando toda la timeline
- Busqueda de eventos y personas

FUNCIONALIDADES EXTENDIDAS (fases futuras):
- Vista de arbol genealogico separada
- Modo lectura: pasaje biblico completo del evento
- Estadisticas visuales (barras de vida de patriarcas)
- Exportar/imprimir segmento de la timeline
- Compartir un evento con link directo (URL con parametros)
- Soporte multi-libro
- Sin estado de usuario (no hay login en esta version)

=======================================================================
## 2. DECISIONES DE ARQUITECTURA — FIJAS
=======================================================================

2.1 UN JSON POR LIBRO — CONFIRMADO
Cada libro de la Biblia es un universo de datos independiente.
- Cada libro se carga solo cuando el usuario lo selecciona (lazy loading)
- Es mas facil de mantener, corregir y enriquecer
- El schema es identico para todos los libros

Estructura de archivos de datos:
src/data/
├── index.json              ← Indice de todos los libros
└── books/
    ├── genesis.json        ← Libro 1 (en desarrollo)
    ├── exodus.json         ← Libro 2 (futuro)
    └── [libro].json        ← Mismo schema siempre

2.2 VIS-TIMELINE COMO MOTOR — CONFIRMADO
- Licencia: MIT / Apache 2.0 — 100% gratuita y open-source
- Capacidades: zoom de eje temporal real, grupos, tooltips, rangos de tiempo
- NPM: npm install vis-timeline (AUN NO INSTALADA)

2.3 SIN BACKEND — CONFIRMADO
Todo es estatico: JSON + React. No hay API, no hay servidor, no hay autenticacion.

2.4 MODO OSCURO PREDETERMINADO — CONFIRMADO
index.css se extiende, NO se reemplaza.

2.5 CRONOLOGIA ANNO MUNDI (AM) — CONFIRMADO
Todos los anios en Anno Mundi. NO usar AC/DC/BCE/CE.

=======================================================================
## 3. STACK TECNOLOGICO
=======================================================================

- React 19.x — Framework UI
- Vite 8.x — Bundler
- JavaScript (JSX) — ES2022, SIN TypeScript
- CSS Vanilla — SIN Tailwind
- vis-timeline (latest) — Motor de timeline interactiva (aun no instalada)
- ESLint 10.x — Linting

COMANDOS:
- npm run dev      → Desarrollo
- npm run build    → Build produccion
- npm run lint     → ESLint
- npm install vis-timeline  → Instalar libreria

=======================================================================
## 4. ESTRUCTURA DE ARCHIVOS DEL PROYECTO
=======================================================================

genesis-explorer/
├── PROYECTO_GUIA.md                 ← ESTE ARCHIVO
├── .agents/
│   └── AGENTS.md
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── Timeline/
│   │   │   ├── Timeline.jsx              ← Motor vis-timeline
│   │   │   ├── Timeline.css
│   │   │   ├── TimelineControls.jsx      ← Barra de zoom/navegacion/filtros
│   │   │   ├── TimelineControls.css
│   │   │   └── ZoomLevelIndicator.jsx
│   │   ├── EventPanel/
│   │   │   ├── EventPanel.jsx            ← Panel lateral de evento
│   │   │   ├── EventPanel.css
│   │   │   ├── VerseBlock.jsx
│   │   │   ├── PeopleChips.jsx
│   │   │   └── SubEventsButton.jsx
│   │   ├── PersonPanel/
│   │   │   ├── PersonPanel.jsx
│   │   │   ├── PersonPanel.css
│   │   │   └── LifespanBar.jsx
│   │   ├── CovenantPanel/
│   │   │   ├── CovenantPanel.jsx
│   │   │   └── CovenantPanel.css
│   │   ├── QuestionPanel/
│   │   │   ├── QuestionPanel.jsx
│   │   │   └── QuestionPanel.css
│   │   └── Layout/
│   │       ├── Header.jsx
│   │       ├── Header.css
│   │       └── AppLayout.jsx
│   ├── hooks/
│   │   ├── useTimeline.js
│   │   ├── useZoomLevel.js
│   │   ├── useEventSelection.js
│   │   └── useFilters.js
│   ├── utils/
│   │   ├── timelineAdapter.js
│   │   ├── depthFilter.js
│   │   ├── colorMap.js
│   │   └── dataHelpers.js
│   ├── data/
│   │   ├── index.json
│   │   └── books/
│   │       └── genesis.json       ← EN DESARROLLO
│   ├── App.jsx
│   ├── App.css
│   ├── index.css                  ← SOLO EXTENDER
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js


=======================================================================
## 5. SCHEMA COMPLETO DE DATOS JSON
=======================================================================

5.1 RAIZ DEL JSON DE UN LIBRO:
{
  "metadata": {},
  "eras": [],
  "dispensations": [],
  "narrative_blocks": [],
  "timeline_events": [],
  "people": [],
  "relationships": [],
  "locations": [],
  "covenants": [],
  "messianic_promises": [],
  "themes": [],
  "questions": [],
  "chapters_map": [],
  "notable_overlaps": []
}

5.2 SCHEMA: metadata
{
  "book_id": "genesis",
  "title": "Genesis",
  "subtitle": "El libro de los comienzos",
  "testament": "old",
  "total_chapters": 50,
  "chronology_system": "Anno Mundi (AM)",
  "am_start": 0,
  "am_end": 2369,
  "language": "es",
  "bible_version": "Reina-Valera 1960",
  "schema_version": "3.0",
  "description": "...",
  "key_themes": ["creacion", "pecado", "promesa", "pacto", "fe", "providencia"],
  "sources": ["Biblia Reina-Valera 1960", "Mateo 1", "Lucas 3"],
  "last_updated": "2026-07"
}

5.3 SCHEMA: eras
{
  "id": "era_primordial",
  "name": "Historia Primordial",
  "subtitle": "Los origenes de la humanidad entera",
  "description": "...",
  "chapters_start": 1, "chapters_end": 11,
  "am_start": 0, "am_end": 2083,
  "color_bg": "#3d1a52", "color_text": "#e8d5ff",
  "narrative_block_ids": ["nb_creation", "nb_fall", "nb_noah", "nb_babel_nations"]
}

5.4 SCHEMA: narrative_blocks (NIVEL 1 de zoom)
{
  "id": "nb_noah",
  "era_id": "era_primordial",
  "name": "Noe y el Diluvio",
  "subtitle": "Juicio, preservacion y nueva alianza",
  "toledot_reference": "Genesis 6:9",
  "toledot_text": "Estas son las generaciones de Noe",
  "chapters_start": 6, "chapters_end": 9,
  "am_start": 1556, "am_end": 1657,
  "icon": "🌊", "color": "#1a4a6b",
  "summary": "...",
  "theological_significance": "...",
  "dispensation_id": "disp_conscience",
  "key_people": ["noah", "shem", "ham", "japheth"],
  "key_locations": ["global_flood", "ararat"],
  "key_covenants": ["noahic_covenant"],
  "messianic_connection": "...",
  "event_ids": ["sons_of_god", "humanity_corruption", "god_speaks_noah", "..."],
  "key_questions": ["question_flood_global"],
  "themes": ["theme_judgment", "theme_mercy", "theme_salvation"]
}

5.5 SCHEMA: timeline_events — TODOS LOS CAMPOS SON OBLIGATORIOS
{
  "id": "flood_start",
  "depth_level": 2,
  "parent_id": "nb_noah",
  "name": "El Diluvio Comienza",
  "short_name": "Inicio del Diluvio",
  "category": "judgment",
  "importance": "critical",
  "chronology": {
    "approx_year_am": 1656,
    "exact_date_note": "Anio 600 de Noe, Mes 2, Dia 17",
    "duration_days": 370,
    "duration_note": "40 dias de lluvia + 150 dias de aguas + recesion"
  },
  "location_id": "global_flood",
  "chapter_start": 7, "verse_start_ref": 11,
  "chapter_end": 7, "verse_end_ref": 24,
  "narrative": "Texto narrativo de 3+ oraciones...",
  "historical_context": "Contexto historico-cultural de la epoca...",
  "theological_teaching": "Ensenanza teologica del evento...",
  "messianic_connection": "Conexion mesianica o null",
  "key_people": ["noah", "shem", "ham", "japheth"],
  "covenant_id": null,
  "theme_ids": ["theme_judgment", "theme_mercy"],
  "question_ids": ["question_flood_global"],
  "references": [{"book": "Genesis", "chapter": 7, "verse_start": 11, "verse_end": 24}],
  "key_verse": {"reference": "Genesis 7:11-12", "text": "Texto RV1960..."},
  "additional_verses": [{"reference": "Genesis 7:19", "text": "Texto RV1960..."}],
  "cross_references_nt": ["Mateo 24:37-39", "Hebreos 11:7"],
  "sub_event_ids": ["flood_rain_40days", "ark_rests_ararat"],
  "timeline_display": {"label": "Diluvio", "icon": "🌊", "color_category": "judgment"}
}

depth_level VALUES:
- 0: Era/Dispensacion (nunca en timeline_events, son los fondos)
- 1: Bloque narrativo (nunca en timeline_events, son los grupos)
- 2: Evento principal (80% de los eventos van aqui)
- 3: Escena especifica (sub-eventos dentro de eventos principales)
- 4: Detalle maximo (versiculos individuales, dialogos)

importance VALUES: "critical" | "high" | "medium" | "low"
category VALUES: "creation" | "judgment" | "sin" | "covenant" | "patriarch" | "miracle" | "genealogy" | "exile" | "restoration" | "messianic"

5.6 SCHEMA: people — TODOS LOS CAMPOS OBLIGATORIOS PARA PRIORIDAD ALTA
{
  "id": "noah",
  "name": "Noe",
  "name_meaning": "Descanso / Alivio",
  "name_origin": "Hebreo: Nóah",
  "category": "flood_survivor",
  "importance": "critical",
  "chronology": {
    "birth_am": 1056, "death_am": 2006, "lifespan": 950,
    "notable_age": "Tenia 600 anios cuando comenzo el diluvio",
    "first_mention": {"chapter": 5, "verse": 29},
    "last_mention": {"chapter": 9, "verse": 29}
  },
  "family": {
    "father": "lamech", "mother": null, "spouse": "wife_noah",
    "children": ["shem", "ham", "japheth"],
    "generation_from_adam": 10
  },
  "biography": {
    "short": "Unico hombre justo de su generacion...",
    "full": "Texto biografico completo de 3-5 parrafos y minimo 300 palabras para personajes criticos..."
  },
  "character_arc": "Hombre justo → Constructor → Padre de humanidad → Agricultor",
  "personality_traits": ["justo", "integro", "obediente"],
  "theological_significance": "...",
  "event_ids": ["humanity_corruption", "god_speaks_noah", "flood_start", "noahic_covenant"],
  "references": [{"book": "Genesis", "chapter": 6, "verse_start": 9, "verse_end": 9}],
  "key_verse": {"reference": "Genesis 6:9", "text": "Noe, varon justo, era perfecto en sus generaciones..."},
  "cross_references_nt": ["Hebreos 11:7", "2 Pedro 2:5"],
  "notable_overlaps": [
    {"with_person_id": "methuselah", "years_together": 600, "note": "..."},
    {"with_person_id": "lamech", "years_together": 595, "note": "..."}
  ]
}

5.7 SCHEMA: covenants
{
  "id": "noahic_covenant",
  "name": "Pacto de Noe",
  "subtitle": "El Pacto del Arco Iris",
  "type": "unconditional",
  "participants": ["god", "noah", "all_creation"],
  "event_id": "noahic_covenant",
  "am_year": 1657,
  "sign": "El arco iris en las nubes",
  "promises_from_god": ["Nunca mas diluvio universal", "..."],
  "obligations_for_man": ["No comer sangre", "No asesinar"],
  "theological_significance": "...",
  "references": [{"book": "Genesis", "chapter": 9, "verse_start": 8, "verse_end": 17}],
  "key_verse": {"reference": "Genesis 9:13", "text": "..."},
  "messianic_connection": "..."
}

5.8 SCHEMA: themes
{
  "id": "theme_judgment",
  "name": "Juicio Divino",
  "icon": "⚖️",
  "color": "#c0392b",
  "description": "...",
  "event_ids": ["fall_judgment", "cain_curse", "flood_start", "babel_tower_judgment"],
  "verse_summary": {"reference": "Genesis 6:7", "text": "..."}
}

5.9 SCHEMA: questions
{
  "id": "question_flood_global",
  "title": "¿Fue global o local el diluvio de Noe?",
  "category": "historical",
  "difficulty": "intermediate",
  "related_event_ids": ["flood_start"],
  "related_people_ids": ["noah"],
  "short_answer": "...",
  "full_answer": "Respuesta completa con argumentos biblicos e historicos...",
  "references": [{"book": "Genesis", "chapter": 7, "verse_start": 17, "verse_end": 24}],
  "key_verse": {"reference": "Genesis 7:19", "text": "..."}
}

5.10 SCHEMA: locations
{
  "id": "eden",
  "name": "Eden",
  "type": "region",
  "modern_equivalent": "Mesopotamia / Golfo Persico (probable)",
  "description": "...",
  "coordinates_approx": {"lat": 31.0, "lon": 47.0},
  "event_ids": ["creation_adam_eve", "fall_sin", "fall_expulsion"],
  "references": [{"book": "Genesis", "chapter": 2, "verse_start": 8, "verse_end": 14}],
  "key_verse": {"reference": "Genesis 2:8", "text": "..."},
  "historical_note": "..."
}

5.11 SCHEMA: chapters_map (una entrada por cada capitulo del libro)
{
  "chapter": 6,
  "title": "La corrupcion y el llamado a Noe",
  "narrative_block_id": "nb_noah",
  "am_period": "AM ~1550-1656",
  "verse_count": 22,
  "main_event_ids": ["sons_of_god", "humanity_corruption", "god_speaks_noah"],
  "summary": "...",
  "key_verse": {"reference": "Genesis 6:8", "text": "..."}
}

5.12 SCHEMA: index.json (raiz de src/data/)
{
  "version": "1.0",
  "books": [
    {
      "id": "genesis", "title": "Genesis", "testament": "old",
      "order": 1, "status": "in_progress", "chapters": 50,
      "am_start": 0, "am_end": 2369,
      "file": "books/genesis.json"
    },
    {
      "id": "exodus", "title": "Exodo", "testament": "old",
      "order": 2, "status": "pending", "chapters": 40,
      "am_start": 2433, "am_end": 2554,
      "file": "books/exodus.json"
    }
  ]
}


=======================================================================
## 6. INVENTARIO DE LIBROS Y ESTADO
=======================================================================

Libro       | Caps | Estado        | Prioridad
------------|------|---------------|----------
Genesis     | 50   | EN DESARROLLO | 1
Exodo       | 40   | PENDIENTE     | 2
Mateo       | 28   | PENDIENTE     | 3
Apocalipsis | 22   | PENDIENTE     | 4

Estados: PENDIENTE / EN DESARROLLO / COMPLETADO

=======================================================================
## 7. INVENTARIO DE CONTENIDO — GENESIS (TARGET: 101 EVENTOS)
=======================================================================

BLOQUE 1 — La Creacion (Gen. 1-2) — 8 eventos | depth_level: 2
IDs: creation_day1, creation_day2, creation_day3, creation_day4,
     creation_day5, creation_day6, creation_adam_eve, creation_sabbath
Referencias: Gen. 1:1-5, 1:6-8, 1:9-13, 1:14-19, 1:20-23, 1:24-31, 2:7-22, 2:1-3

BLOQUE 2 — La Caida (Gen. 3-5) — 11 eventos
IDs: eden_garden (dep 3), fall_temptation (dep 2), fall_sin (dep 3),
     fall_judgment (dep 2), fall_expulsion (dep 3), cain_abel_offering (dep 2),
     cain_kills_abel (dep 2), cain_curse (dep 3), seth_birth (dep 2),
     antediluvian_genealogy (dep 2), enoch_translation (dep 2)
Referencias: Gen. 2:8-17, 3:1-6, 3:6-7, 3:8-24, 3:22-24, 4:1-5, 4:6-8, 4:9-16, 4:25-26, cap.5, 5:21-24

BLOQUE 3 — Noe y el Diluvio (Gen. 6-9) — 13 eventos
IDs: sons_of_god (dep 3), humanity_corruption (dep 2), god_speaks_noah (dep 2),
     ark_construction (dep 3), animals_enter_ark (dep 3), flood_start (dep 2),
     flood_40days_rain (dep 3), flood_waters_recede (dep 3), ark_rests_ararat (dep 3),
     noah_sends_birds (dep 3), noah_leaves_ark (dep 2), noahic_covenant (dep 2),
     noah_vineyard_sin (dep 2)
CRONOLOGIA EXACTA:
- flood_start: AM 1656 — "Anio 600 de Noe, Mes 2, Dia 17" — Gen 7:11
- flood_end: AM 1657 — "Anio 601 de Noe, Mes 2, Dia 27" — Gen 8:14
- Duracion diluvio: 370 dias total

BLOQUE 4 — Babel y las Naciones (Gen. 10-11) — 5 eventos
IDs: table_of_nations (dep 2), babel_tower_construction (dep 2),
     babel_tower_judgment (dep 2), babel_dispersion (dep 3), shem_genealogy (dep 2)
CRONOLOGIA: babel_tower_judgment: AM 1757 (epoca de Peleg, Gen. 10:25)

BLOQUE 5 — Ciclo de Abraham (Gen. 12-25) — 23 eventos
IDs: terah_moves, abraham_call, abraham_canaan, abraham_egypt, lot_separation,
     lot_rescue, melchizedek, abrahamic_covenant, hagar_ishmael,
     covenant_circumcision, heavenly_visitors, sodom_intercession, sodom_destruction,
     lot_daughters, abraham_abimelech, isaac_birth, hagar_expelled, well_beersheba,
     binding_of_isaac, sarah_death_burial, rebekah_marriage, abraham_death,
     ishmael_genealogy
CRONOLOGIA EXACTA:
- terah_moves: AM ~2083 (Tare muere AM 2083, Gen. 11:32)
- abraham_call: AM 2083 (Abraham tiene 75 anios, Gen. 12:4; nacio AM 2008)
- abrahamic_covenant: AM 2083+ (Gen. 15) — Abraham 75-85 anios
- covenant_circumcision: AM 2107 (Abraham 99 anios, Gen. 17:1)
- isaac_birth: AM 2108 (Abraham 100 anios, Gen. 21:5)
- sarah_death_burial: AM 2145 (Sara 127 anios, Gen. 23:1)
- abraham_death: AM 2183 (175 anios, Gen. 25:7)
ESPECIALES: binding_of_isaac y melchizedek tienen messianic_connection muy rica.

BLOQUE 6 — Ciclo de Isaac (Gen. 25-26) — 5 eventos
IDs: jacob_esau_birth, esau_sells_birthright, isaac_philistines,
     covenant_abimelech_isaac, esau_wives
- jacob_esau_birth: AM 2168 (Isaac 60 anios, Gen. 25:26)

BLOQUE 7 — Ciclo de Jacob (Gen. 27-36) — 18 eventos
IDs: jacob_steals_blessing, jacob_flees, jacob_bethel_dream, jacob_meets_rachel,
     jacob_laban_agreement, jacob_laban_deception, jacob_children_birth,
     jacob_laban_flocks, jacob_flees_laban, laban_pursues_jacob, jacob_angels,
     jacob_wrestles_god, jacob_esau_reconcile, dinah_incident, jacob_returns_bethel,
     rachel_death, isaac_death, esau_descendants
ESPECIAL: jacob_wrestles_god → Jacob recibe nombre Israel. importance="critical".

BLOQUE 8 — Ciclo de Jose (Gen. 37-50) — 18 eventos
IDs: joseph_dream, joseph_sold_slavery, judah_tamar, joseph_potiphar,
     joseph_imprisoned, joseph_interprets_dreams_prison, pharaoh_dreams,
     joseph_interprets_pharaoh, joseph_prime_minister, brothers_first_visit,
     brothers_second_visit, joseph_reveals_himself, israel_descends_egypt,
     jacob_blesses_ephraim_manasseh, jacob_blesses_twelve_sons,
     jacob_death_burial, joseph_forgives_brothers, joseph_death
CRONOLOGIA EXACTA:
- joseph_dream: AM ~2276 (Jose 17 anios, Gen. 37:2)
- joseph_prime_minister: AM ~2289 (Jose 30 anios, Gen. 41:46)
- israel_descends_egypt: AM 2298 (Jacob 130 anios, Gen. 47:9)
- jacob_death: AM 2315 (Jacob 147 anios, Gen. 47:28)
- joseph_death: AM 2369 (Jose 110 anios, Gen. 50:26)
ESPECIALES: judah_tamar (linea mesianica) y jacob_blesses_twelve_sons (Gen. 49:10) son importance="critical".

PERSONAJES CON PERFIL COMPLETO (prioridad alta):
adam, eve, cain, abel, seth, enoch, methuselah, noah, shem, ham, japheth,
abraham, sarah, lot, isaac, rebekah, jacob, leah, rachel, joseph, judah

CONVIVENCIAS NOTABLES (notable_overlaps) — datos exactos:
- Adam + Methuselah: 243 anios (Matusalén nace AM 687, Adam muere AM 930)
- Adam + Lamech: 56 anios (Lamec nace AM 874, Adam muere AM 930)
- Methuselah + Noah: 600 anios (Matusalén muere AM 1656 = anio del diluvio)
- Noah + Abraham: casi 0 (Noe muere AM 2006, Abraham nace AM 2008 — 2 anios de diferencia)
- Shem + Abraham: 150 anios (Sem muere AM 2158, Abraham nace AM 2008)
- Shem + Isaac: 50 anios (Sem muere AM 2158, Isaac nace AM 2108)
- Eber + Jacob: 19 anios (Heber muere AM 2187, Jacob nace AM 2168)

PACTOS A DOCUMENTAR:
creation_covenant, eden_covenant, proto_gospel (Gen. 3:15 — EL PRIMER EVANGELIO),
noahic_covenant, abrahamic_covenant, circumcision_covenant

PREGUNTAS TEOLOGICAS A DOCUMENTAR:
question_cain_wife, question_sons_of_god, question_nephilim,
question_long_lifespans, question_flood_global, question_eden_location,
question_god_repented, question_days_creation, question_abraham_sacrifice,
question_jacob_wrestling, question_judah_scepter

UBICACIONES A DOCUMENTAR:
eden, global_flood, ararat, babel, ur, haran, canaan, bethel, hebron, egypt,
beersheba, shechem, mamre, sodom, gomorrah, beer_lahai_roi, moriah,
paddan_aram, peniel, dothan, goshen


=======================================================================
## 8. ESPECIFICACIONES DE UI/UX
=======================================================================

LAYOUT GENERAL:
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Genesis ▼ | Filtros | Buscar                │
├─────────────────────────────────────────────────────────────┤
│  CONTROLES: [←][→] Anio AM: 1656 [Nivel: ██░░░] [+][-][Ir] │
├──────────────────────────────────────┬──────────────────────┤
│  AREA DE TIMELINE (vis-timeline)     │  PANEL LATERAL       │
│                                      │  (slide-in 380px)    │
│  ████ Inocencia ████ Conciencia ████ │                      │
│  ══ Linea mesianica dorada ══════════ │  EventPanel /        │
│  [Creacion] [Caida] [Diluvio]...     │  PersonPanel /       │
│  (zoom revela sub-eventos)           │  CovenantPanel       │
│                                      │                      │
├──────────────────────────────────────┴──────────────────────┤
│  FILTROS: [🌿Creacion][🔥Juicio][✨Pacto][👤Patriarca]...   │
└─────────────────────────────────────────────────────────────┘

COLORES POR CATEGORIA:
- creation:    #2d6a4f (verde)         icono: 🌿
- judgment:    #c0392b (rojo)          icono: 🔥
- sin:         #7d3c98 (violeta osc.)  icono: 💀
- covenant:    #d4ac0d (dorado)        icono: ✨
- patriarch:   #2980b9 (azul)          icono: 👤
- miracle:     #8e44ad (violeta)       icono: ✦
- genealogy:   #7f8c8d (gris)          icono: 🌳
- exile:       #6c5ce7 (indigo)        icono: →
- restoration: #00b894 (turquesa)      icono: 🌈
- messianic:   #f39c12 (dorado)        icono: ✡️

COLORES DE DISPENSACIONES (bandas de fondo):
- Inocencia:        rgba(45, 106, 79, 0.12)
- Conciencia:       rgba(192, 57, 43, 0.10)
- Gobierno Humano:  rgba(41, 128, 185, 0.10)
- Promesa:          rgba(212, 172, 13, 0.10)

NIVELES DE ZOOM (ventana visible en anios AM):
- Nivel 0: > 2500 anios visible → solo dispensaciones/eras
- Nivel 1: 500-2500 anios → bloques narrativos
- Nivel 2: 100-500 anios → eventos principales
- Nivel 3: 20-100 anios → escenas especificas
- Nivel 4: < 20 anios → maximo detalle

=======================================================================
## 9. ESPECIFICACIONES TECNICAS DE COMPONENTES
=======================================================================

useZoomLevel.js:
const ZOOM_BREAKPOINTS = {
  0: 2500, // mas de 2500 anios visible
  1: 500,  // 500-2500 anios
  2: 100,  // 100-500 anios
  3: 20,   // 20-100 anios
  4: 0,    // menos de 20 anios
};

timelineAdapter.js — funcion principal:
export function adaptToVisTimeline(bookData, depthLevels) {
  // groups: narrative_blocks → filas de vis-timeline
  // items: timeline_events filtrados por depthLevels
  // cada item: { id, group, content, start, end, className, title, data }
  // start/end son anios AM como numeros directamente
  // retorna { items: [], groups: [] }
}

colorMap.js — estructura:
{
  creation: { color: "#2d6a4f", icon: "🌿", label: "Creacion" },
  judgment:  { color: "#c0392b", icon: "🔥", label: "Juicio" },
  ...
}

PANEL LATERAL — COMPORTAMIENTO:
- Solo un panel visible a la vez
- Tipos: EventPanel | PersonPanel | CovenantPanel | QuestionPanel
- Animacion: slide-in desde derecha, 0.3s ease-out
- Ancho: 380px desktop / 100% mobile
- Se cierra con X o clic fuera


=======================================================================
## 10. PROMPTS DE TRABAJO POR FASE — DATOS
=======================================================================

COMO USAR ESTOS PROMPTS:
1. Copia el contenido del PROMPT completo
2. Pegalo al inicio de una nueva conversacion con la IA
3. La IA debe comenzar leyendo ESTE archivo antes de ejecutar cualquier tarea
4. Actualiza el REGISTRO DE PROGRESO (Seccion 14) al completar cada tarea

---
PROMPT D-01: CREAR ESTRUCTURA BASE DEL GENESIS.JSON
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en la raiz del proyecto en c:\Users\fgarea\Documents\genesis-explorer\

Tu tarea es crear src/data/books/genesis.json con la nueva estructura completa, comenzando SOLO por estas 4 secciones (sin eventos ni personas aun):
1. metadata — ver Schema 5.2 de PROYECTO_GUIA.md
2. eras — 2 eras: Historia Primordial (caps 1-11, AM 0-2083) e Historia Patriarcal (caps 12-50, AM 2008-2369)
3. dispensations — 4 dispensaciones del Genesis con referencias biblicas completas
4. narrative_blocks — 10 bloques narrativos (ver Seccion 7 para IDs y nombres exactos)

Los 10 bloques son: nb_creation, nb_fall, nb_noah, nb_babel_nations, nb_abraham, nb_isaac, nb_jacob, nb_joseph, nb_genealogies, nb_messianic_thread.

Sigue exactamente los schemas de la Seccion 5 de PROYECTO_GUIA.md.
Guarda en src/data/books/genesis.json (crear directorio books/ si no existe).
Crea tambien src/data/index.json con la Seccion 5.12.
Valida que el JSON es sintacticamente correcto.
Ejecuta npm run dev para verificar que compila sin errores."

---
PROMPT D-02: EVENTOS BLOQUES 1 Y 2 (CREACION Y CAIDA)
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Verifica que ya existe src/data/books/genesis.json con la estructura base (D-01 completado).

Agrega al array 'timeline_events' los siguientes 19 eventos:

BLOQUE 1 — Creacion (8 eventos):
creation_day1 (Gen 1:1-5), creation_day2 (Gen 1:6-8), creation_day3 (Gen 1:9-13),
creation_day4 (Gen 1:14-19), creation_day5 (Gen 1:20-23), creation_day6 (Gen 1:24-31),
creation_adam_eve (Gen 2:7,21-22), creation_sabbath (Gen 2:1-3)

BLOQUE 2 — La Caida (11 eventos):
eden_garden (Gen 2:8-17), fall_temptation (Gen 3:1-6), fall_sin (Gen 3:6-7),
fall_judgment (Gen 3:8-24), fall_expulsion (Gen 3:22-24), cain_abel_offering (Gen 4:1-5),
cain_kills_abel (Gen 4:6-8), cain_curse (Gen 4:9-16), seth_birth (Gen 4:25-26),
antediluvian_genealogy (Gen 5), enoch_translation (Gen 5:21-24)

Para CADA evento, completar TODOS los campos del Schema 5.5 de PROYECTO_GUIA.md.
Los versiculos deben ser de la Biblia Reina-Valera 1960 en espanol.
Anos en Anno Mundi (AM).

NOTAS ESPECIALES:
- fall_judgment (Gen 3:8-24) contiene el Protevangelio en Gen 3:15 — la primera promesa mesianica de toda la Biblia. Su campo messianic_connection debe ser muy rico y detallado.
- enoch_translation: nacio AM 622, murio AM 987 (365 anios). Unico trasladado por Dios sin morir. importance='critical'.
- Para los eventos de creacion, usar approx_year_am: 0 y agregar duration_note especificando el dia.

Valida el JSON. Ejecuta npm run dev."

---
PROMPT D-03: EVENTOS BLOQUE 3 (NOE Y EL DILUVIO)
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Verifica que genesis.json ya tiene los eventos de los Bloques 1 y 2 (D-02 completado).

Agrega al array 'timeline_events' los 13 eventos del BLOQUE 3 — Noe y el Diluvio:
sons_of_god (Gen 6:1-4), humanity_corruption (Gen 6:5-8), god_speaks_noah (Gen 6:9-22),
ark_construction (Gen 6:14-22), animals_enter_ark (Gen 7:1-16), flood_start (Gen 7:11-12),
flood_40days_rain (Gen 7:17-24), flood_waters_recede (Gen 8:1-14),
ark_rests_ararat (Gen 8:4), noah_sends_birds (Gen 8:6-12),
noah_leaves_ark (Gen 8:13-19), noahic_covenant (Gen 9:1-17),
noah_vineyard_sin (Gen 9:20-27)

DATOS CRONOLOGICOS EXACTOS (obligatorios):
- flood_start: approx_year_am=1656, exact_date_note='Anio 600 de Noe, Mes 2, Dia 17'
- flood_end (flood_waters_recede): approx_year_am=1657, exact_date_note='Anio 601 de Noe, Mes 2, Dia 27'
- Diluvio completo: 370 dias
- Aguas sobre la tierra: 150 dias antes de reposar en Ararat

PROFUNDIDADES:
- depth_level=2: humanity_corruption, god_speaks_noah, flood_start, noah_leaves_ark, noahic_covenant, noah_vineyard_sin
- depth_level=3: sons_of_god, ark_construction, animals_enter_ark, flood_40days_rain, flood_waters_recede, ark_rests_ararat, noah_sends_birds

MESSIANIC_CONNECTION ESPECIAL:
El arca como tipo de Cristo: hay UNA sola puerta (Gen 6:16) como Cristo es la unica puerta (Juan 10:9). Dentro del arca = salvados. Noe es tipo de Cristo como preservador de los suyos.
Documentar esto en noahic_covenant y en la figura de Noe.

Valida JSON. npm run dev."

---
PROMPT D-04: EVENTOS BLOQUES 4 Y 5 (BABEL Y ABRAHAM)
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Agrega los eventos de:
BLOQUE 4 — Babel y Naciones (5 eventos):
table_of_nations (Gen 10), babel_tower_construction (Gen 11:1-4),
babel_tower_judgment (Gen 11:5-9), babel_dispersion (Gen 11:9),
shem_genealogy (Gen 11:10-32)

BLOQUE 5 — Ciclo de Abraham (23 eventos):
terah_moves (Gen 11:31), abraham_call (Gen 12:1-3), abraham_canaan (Gen 12:4-9),
abraham_egypt (Gen 12:10-20), lot_separation (Gen 13), lot_rescue (Gen 14:1-16),
melchizedek (Gen 14:17-24), abrahamic_covenant (Gen 15), hagar_ishmael (Gen 16),
covenant_circumcision (Gen 17), heavenly_visitors (Gen 18:1-15),
sodom_intercession (Gen 18:16-33), sodom_destruction (Gen 19:1-29),
lot_daughters (Gen 19:30-38), abraham_abimelech (Gen 20), isaac_birth (Gen 21:1-7),
hagar_expelled (Gen 21:8-21), well_beersheba (Gen 21:22-34),
binding_of_isaac (Gen 22:1-19), sarah_death_burial (Gen 23),
rebekah_marriage (Gen 24), abraham_death (Gen 25:1-11),
ishmael_genealogy (Gen 25:12-18)

CRONOLOGIA EXACTA:
- babel_tower_judgment: AM 1757
- terah_moves: AM 2083 (Tare muere en Haran, Gen 11:32)
- abraham_call: AM 2083 (Abraham 75 anios, Gen 12:4; nacio AM 2008)
- abrahamic_covenant: AM ~2090 (Gen 15)
- covenant_circumcision: AM 2107 (Abraham 99 anios, Gen 17:1)
- isaac_birth: AM 2108 (Abraham 100 anios, Gen 21:5)
- sarah_death_burial: AM 2145 (Sara 127 anios, Gen 23:1)
- abraham_death: AM 2183 (175 anios, Gen 25:7)

EVENTOS CON MESSIANIC_CONNECTION MUY RICA (documentar en detalle):
1. binding_of_isaac (Gen 22): tipo mas claro del sacrificio de Cristo en el AT.
   El padre ofrece al hijo unico. El hijo carga la lena (tipo la cruz). Dios provee el sustituto.
   Nombre del lugar: 'Jehova proveera' (Jehova-Jireh).
   Cross-refs NT: Juan 3:16, Romanos 8:32, Hebreos 11:17-19.
2. melchizedek (Gen 14:17-24): Sacerdote-rey de Salem, tipo de Cristo.
   Cross-refs: Salmo 110:4, Hebreos 5:6, Hebreos 7.
3. abrahamic_covenant (Gen 15): Promesa de tierra, descendencia innumerable, bendicion universal.
   Las estrellas como simbolo. Dios mismo pasa entre los animales (Gen 15:17).

Versiculos RV1960. Valida JSON. npm run dev."

---
PROMPT D-05: EVENTOS BLOQUES 6, 7 Y 8 (ISAAC, JACOB Y JOSE)
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Agrega los eventos de:
BLOQUE 6 — Ciclo de Isaac (5 eventos):
jacob_esau_birth (Gen 25:19-26), esau_sells_birthright (Gen 25:27-34),
isaac_philistines (Gen 26:1-22), covenant_abimelech_isaac (Gen 26:23-33), esau_wives (Gen 26:34-35)

BLOQUE 7 — Ciclo de Jacob (18 eventos):
jacob_steals_blessing (Gen 27), jacob_flees (Gen 27:41-45),
jacob_bethel_dream (Gen 28), jacob_meets_rachel (Gen 29:1-14),
jacob_laban_agreement (Gen 29:15-20), jacob_laban_deception (Gen 29:21-30),
jacob_children_birth (Gen 29:31-30:24), jacob_laban_flocks (Gen 30:25-43),
jacob_flees_laban (Gen 31:1-21), laban_pursues_jacob (Gen 31:22-55),
jacob_angels (Gen 32:1-2), jacob_wrestles_god (Gen 32:22-32),
jacob_esau_reconcile (Gen 33), dinah_incident (Gen 34),
jacob_returns_bethel (Gen 35:1-15), rachel_death (Gen 35:16-20),
isaac_death (Gen 35:27-29), esau_descendants (Gen 36)

BLOQUE 8 — Ciclo de Jose (18 eventos):
joseph_dream (Gen 37:1-11), joseph_sold_slavery (Gen 37:12-36),
judah_tamar (Gen 38), joseph_potiphar (Gen 39:1-18),
joseph_imprisoned (Gen 39:19-23), joseph_interprets_dreams_prison (Gen 40),
pharaoh_dreams (Gen 41:1-24), joseph_interprets_pharaoh (Gen 41:25-36),
joseph_prime_minister (Gen 41:37-57), brothers_first_visit (Gen 42),
brothers_second_visit (Gen 43-44), joseph_reveals_himself (Gen 45),
israel_descends_egypt (Gen 46-47), jacob_blesses_ephraim_manasseh (Gen 48),
jacob_blesses_twelve_sons (Gen 49), jacob_death_burial (Gen 49:28-50:14),
joseph_forgives_brothers (Gen 50:15-21), joseph_death (Gen 50:22-26)

CRONOLOGIA EXACTA:
- jacob_esau_birth: AM 2168 (Isaac 60 anios, Gen 25:26)
- joseph_dream: AM ~2276 (Jose 17 anios, Gen 37:2)
- joseph_prime_minister: AM ~2289 (Jose 30 anios, Gen 41:46)
- israel_descends_egypt: AM 2298 (Jacob 130 anios, Gen 47:9)
- jacob_death: AM 2315 (Jacob 147 anios, Gen 47:28)
- joseph_death: AM 2369 (Jose 110 anios, Gen 50:26)

ESPECIALES DE MAXIMA IMPORTANCIA (importance='critical'):
1. jacob_wrestles_god (Gen 32:22-32): Jacob lucha con Dios y recibe el nombre 'Israel'.
   Teologia: representacion de la lucha espiritual y la rendicion ante Dios.
   Messianic_connection: anticipa al Mesias que viene a su pueblo a luchar y vencer.
2. judah_tamar (Gen 38): CRUCIAL para linea mesianica.
   De la union de Juda y Tamar nace FARES (Perez).
   Linea directa: Judá → Fares → Hesron → Ram → Aminadab → Naason → Salmon → Booz → Obed → Isai → David → ... → Jesucristo (Mateo 1:3).
   Documentar esto extensamente en messianic_connection.
3. jacob_blesses_twelve_sons (Gen 49): La bendicion de Juda en 49:10:
   'No sera quitado el cetro de Juda, Ni el legislador de entre sus pies, Hasta que venga Siloh; Y a el se congregaran los pueblos.'
   Es una profecia mesianica directa de David y Cristo.

Al finalizar, contar el total de eventos en el array. Debe haber exactamente 101 entradas.
Valida JSON. npm run dev."

---
PROMPT D-06: PERSONAJES PRINCIPALES (21 PERFILES COMPLETOS)
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Crea el array 'people' en genesis.json con perfiles COMPLETOS de estos 21 personajes:
adam, eve, cain, abel, seth, enoch, methuselah, noah, shem, ham, japheth,
abraham, sarah, lot, isaac, rebekah, jacob, leah, rachel, joseph, judah

Para CADA personaje, completar TODOS los campos del Schema 5.6 de PROYECTO_GUIA.md.
La biography.full debe tener MINIMO 300 palabras para personajes con importance='critical'
(adam, eve, noah, abraham, sarah, isaac, jacob, joseph, judah).

DATOS DE CONVIVENCIAS NOTABLES (usar en notable_overlaps):
- Adam + Methuselah: 243 anios juntos
- Adam + Lamech: 56 anios
- Methuselah + Noah: 600 anios (Matusalen muere AM 1656 = anio del diluvio)
- Noah + Abraham: 2 anios de diferencia (Noe muere AM 2006, Abraham nace AM 2008)
- Shem + Abraham: 150 anios
- Shem + Isaac: 50 anios
- Eber + Jacob: 19 anios

ESPECIAL PARA JUDAH:
Documentar en theological_significance como Juda recibe la promesa del Mesias en Gen 49:10.
Linea directa: Juda → Fares → Hesron → Ram → Aminadab → Naason → Salmon → Booz → Obed → Isai → David → Solomon → ... → Jesucristo.
Esta es la razon por la que Juda es el antecesor real de Jesucristo segun Mateo 1.

Versiculos RV1960. Valida JSON. npm run dev."

---
PROMPT D-07: PERSONAJES SECUNDARIOS, PACTOS, TEMAS, PREGUNTAS
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

PARTE 1 — Personajes secundarios (perfil basico, sin biography.full extensa):
Agregar a 'people': lamech, arphaxad, shelah, eber, peleg, nahor, terah, hagar, ishmael,
bilhah, zilpah, reuben, simeon, levi, dan, naphtali, gad, asher, issachar, zebulun, benjamin,
melchizedek, potiphar, pharaoh_of_joseph, david, jesus.
Campos minimos: id, name, name_meaning, category, importance, chronology (lo conocido),
family, biography.short, theological_significance, event_ids, key_verse.

PARTE 2 — Pactos (array 'covenants') — 6 pactos completos con Schema 5.7:
- creation_covenant: mandato cultural Gen 1:28 (ser fructiferos, llenar la tierra, dominarla)
- eden_covenant: Gen 2:15-17 (no comer del arbol del conocimiento)
- proto_gospel: Gen 3:15 (la simiente de la mujer herira la cabeza de la serpiente). ES EL PRIMER EVANGELIO DE TODA LA BIBLIA.
- noahic_covenant: Gen 9:1-17 (arco iris)
- abrahamic_covenant: Gen 12:1-3 y 15 (tierra, descendencia innumerable, bendicion universal)
- circumcision_covenant: Gen 17 (senal fisica del pacto abrahámico)

PARTE 3 — Temas (array 'themes') — crear con Schema 5.8:
theme_creation, theme_sin, theme_judgment, theme_mercy, theme_salvation,
theme_faith, theme_covenant, theme_messianic_promise, theme_providence,
theme_election, theme_new_creation, theme_imago_dei

PARTE 4 — Preguntas teologicas (array 'questions') — crear con Schema 5.9:
question_cain_wife, question_sons_of_god, question_nephilim, question_long_lifespans,
question_flood_global, question_eden_location, question_god_repented, question_days_creation,
question_abraham_sacrifice, question_jacob_wrestling, question_judah_scepter
Las respuestas (full_answer) deben ser sustanciales con argumentos biblicos.

Valida JSON. npm run dev."

---
PROMPT D-08: LOCATIONS, CHAPTERS_MAP Y NOTABLE_OVERLAPS
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

PARTE 1 — Ubicaciones (array 'locations') con Schema 5.10:
eden, global_flood, ararat, babel, ur, haran, canaan, bethel, hebron, egypt,
beersheba, shechem, mamre, sodom, gomorrah, beer_lahai_roi, moriah,
paddan_aram, peniel, dothan, goshen.

PARTE 2 — Mapa de capitulos (array 'chapters_map') con Schema 5.11:
Una entrada por CADA uno de los 50 capitulos del Genesis.
Conteo de versiculos: cap.1=31, cap.2=25, cap.3=24, cap.4=26, cap.5=32, cap.6=22,
cap.7=24, cap.8=22, cap.9=29, cap.10=32, cap.11=32, cap.12=20, cap.13=18, cap.14=24,
cap.15=21, cap.16=16, cap.17=27, cap.18=33, cap.19=38, cap.20=18, cap.21=34, cap.22=24,
cap.23=20, cap.24=67, cap.25=34, cap.26=35, cap.27=46, cap.28=22, cap.29=35, cap.30=43,
cap.31=55, cap.32=32, cap.33=20, cap.34=31, cap.35=29, cap.36=43, cap.37=36, cap.38=30,
cap.39=23, cap.40=23, cap.41=57, cap.42=38, cap.43=34, cap.44=34, cap.45=28, cap.46=34,
cap.47=31, cap.48=22, cap.49=33, cap.50=26.

PARTE 3 — Convivencias (array 'notable_overlaps'):
Incluir las 7 convivencias conocidas + calcular 5 adicionales con los datos AM disponibles.
Cada entrada: { from, to, years_overlap, description }

Valida JSON. npm run dev."

---
PROMPT D-09: VALIDACION FINAL DEL GENESIS.JSON
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Realiza una auditoria completa de src/data/books/genesis.json:

1. CONTEO: Verifica que timeline_events tiene exactamente 101 entradas. Listar los faltantes si los hay.
2. INTEGRIDAD DE IDs: Para cada campo que referencia un ID (parent_id, key_people[], covenant_id, theme_ids[], question_ids[], location_id, event_ids[]), verificar que ese ID existe en su array correspondiente.
3. CAMPOS VACIOS: Buscar eventos con narrative, theological_teaching o historical_context vacios o de menos de 50 caracteres. Listarlos y completarlos.
4. CRONOLOGIA: Verificar que los approx_year_am son coherentes entre si y con los datos de PROYECTO_GUIA.md.
5. SINTAXIS JSON: Verificar que el archivo es JSON valido.
6. VERSICULOS: Todos los key_verse deben tener 'reference' y 'text' no vacios.

Reportar todos los problemas. Corregirlos todos.
Ejecutar npm run dev y confirmar que compila sin errores."


=======================================================================
## 11. PROMPTS DE TRABAJO POR FASE — INTERFAZ
=======================================================================

---
PROMPT I-01: SETUP — VIS-TIMELINE Y ESTRUCTURA DE COMPONENTES
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Tu tarea de setup inicial:
1. Ejecuta: npm install vis-timeline
2. Crea la estructura de carpetas de src/components/ segun la Seccion 4 de PROYECTO_GUIA.md
3. Crea cada archivo de componente como esqueleto (export default con div placeholder)
4. Crea hooks/ y utils/ con sus archivos vacios con export basico
5. Ejecuta npm run dev y verificar que compila sin errores

No implementes logica todavia. Solo la estructura y los archivos."

---
PROMPT I-02: UTILITIES Y HOOKS BASE
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Implementa completamente:

src/utils/colorMap.js:
- Objeto COLOR_MAP con colores e iconos por categoria (ver Seccion 8 para valores exactos)
- Cada entrada: { color, icon, label }
- Exportar DISPENSATION_COLORS con colores de las 4 dispensaciones

src/utils/dataHelpers.js:
- getPersonById(data, id)
- getEventById(data, id)
- getBlockById(data, id)
- getCovenantById(data, id)
- getQuestionById(data, id)
- searchPeople(data, query) — busca en name y biography.short
- searchEvents(data, query) — busca en name y narrative
- getPersonEvents(data, personId) — eventos donde aparece la persona
- getPeopleByEventId(data, eventId) — personajes de un evento

src/utils/depthFilter.js:
- filterByDepth(events, depthLevels[])
- filterByCategory(events, categories[])

src/utils/timelineAdapter.js:
- adaptToVisTimeline(bookData, depthLevels) → {items:[], groups:[]}
- groups = narrative_blocks (filas)
- items = timeline_events filtrados por depthLevels
- item: { id, group, content, start, end, className, title, data }
- start/end = anios AM como numeros

src/hooks/useZoomLevel.js:
- Recibe windowSizeInYears
- Retorna nivel 0-4 segun ZOOM_BREAKPOINTS de Seccion 9

src/hooks/useEventSelection.js:
- Estado: selectedId, panelType ('event'|'person'|'covenant'|'question'|null)
- Expone: selectEvent(id), selectPerson(id), selectCovenant(id), closePanel()

src/hooks/useFilters.js:
- Estado: activeCategories[], searchQuery
- Expone: toggleCategory(cat), setSearch(query), isActive(cat), clearFilters()

Verificar npm run dev."

---
PROMPT I-03: COMPONENTE TIMELINE PRINCIPAL
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Implementa src/components/Timeline/Timeline.jsx usando vis-timeline.

Importar: import { Timeline as VisTimeline, DataSet } from 'vis-timeline/standalone'

Props del componente: { bookData, activeDepthLevels, activeCategories, onSelectEvent, onSelectPerson }

Requerimientos:
1. Instanciar vis-timeline con useRef y useEffect en el contenedor DOM
2. La timeline debe mostrar:
   a. Eje horizontal de tiempo en anios AM (0 a 2500)
   b. Grupos = narrative_blocks como filas horizontales
   c. Eventos filtrados por activeDepthLevels y activeCategories
   d. Background items por dispensacion (color de fondo semitransparente)
   e. Rango dorado para la linea mesianica (AM 0 a AM 2369, clase 'messianic-line')
3. Clic en item → onSelectEvent(eventId)
4. Cambio de zoom → calcular nivel con useZoomLevel → actualizar activeDepthLevels

En Timeline.css:
- Altura del contenedor: calc(100vh - 140px)
- Clases .event-creation, .event-judgment, .event-covenant, etc. con colores de Seccion 8
- Clase .messianic-line con border dorado y fondo dorado muy suave

Integrar Timeline en App.jsx con los datos de genesis.json.
Verificar que npm run dev funciona y la timeline es visible."

---
PROMPT I-04: EVENTPANEL Y SUBCOMPONENTES
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Implementa src/components/EventPanel/EventPanel.jsx.

Props: { event, bookData, onSelectPerson, onSelectCovenant, onSelectQuestion, onZoomToEvent, onClose }

Estructura visual del panel (de arriba a abajo):
1. HEADER: badge categoria (color+icono) + nombre evento + boton X
2. META: anio AM + referencia biblica (Gen X:Y-Z) + ubicacion si existe
3. VERSICULO CLAVE: componente VerseBlock con key_verse
4. RESUMEN: campo 'narrative'
5. CONTEXTO HISTORICO (colapsable): campo 'historical_context'
6. ENSENANZA TEOLOGICA (colapsable): campo 'theological_teaching'
7. CONEXION MESIANICA (si messianic_connection no es null): bloque especial dorado con icono mesianico
8. PERSONAS: chips de key_people — clic → onSelectPerson(id)
9. PACTO (si covenant_id existe): chip dorado — clic → onSelectCovenant(id)
10. REFERENCIAS NT: lista de cross_references_nt
11. PREGUNTAS RELACIONADAS: chips — clic → onSelectQuestion(id)
12. BOTON sub-eventos (si sub_event_ids.length > 0): 'Ver sub-eventos (N)' → onZoomToEvent(event.id)
13. VERSICULOS ADICIONALES: additional_verses como VerseBlocks secundarios

VerseBlock.jsx:
- Texto del versiculo entre comillas tipograficas grandes
- Referencia en monospace, color dorado, small
- Fondo con gradiente sutil del color de categoria al 5% opacidad

PeopleChips.jsx:
- Chip: circulo con inicial + nombre
- Hover: borde del color de categoria

Animacion: slide-in desde derecha, 0.3s ease-out. Ancho 380px desktop, 100% mobile.
Verificar que el panel abre al hacer clic en un evento de la timeline."

---
PROMPT I-05: PERSONPANEL Y LIFESPANBAR
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Implementa src/components/PersonPanel/PersonPanel.jsx.

Props: { person, bookData, onSelectEvent, onSelectPerson, onFocusPersonOnTimeline, onClose }

Estructura visual del panel:
1. HEADER: avatar circular con iniciales + nombre + significado del nombre entre parentesis + X
2. BARRA DE VIDA (LifespanBar.jsx): ver especificacion abajo
3. DATOS: Nacimiento AM / Muerte AM / Anios vividos / Generacion desde Adan
4. VERSICULO CLAVE: VerseBlock con key_verse del personaje
5. FAMILIA: Padre(s) + conyuge(s) + hijos como chips clicables → onSelectPerson(id)
6. ARCO NARRATIVO: character_arc en italica
7. CARACTERISTICAS: personality_traits como tags
8. SIGNIFICADO TEOLOGICO: theological_significance
9. BIOGRAFIA CORTA: biography.short
10. BIOGRAFIA COMPLETA (colapsable): biography.full
11. EVENTOS: event_ids como chips → onSelectEvent(id)
12. CONVIVENCIAS NOTABLES: notable_overlaps con anios y descripcion
13. REFERENCIAS NT: cross_references_nt
14. BOTON 'Ver en la timeline': onFocusPersonOnTimeline(person.id)

LifespanBar.jsx:
- Barra horizontal: represent AM 0 a AM 2369
- Segmento de vida: rectangulo proporcional de color, desde birth_am hasta death_am
- Dots sobre la barra: un punto por cada evento del personaje en su posicion AM exacta
- Hover en dot: tooltip con nombre del evento
- Etiquetas de birth_am y death_am en los extremos del segmento
- Animacion de entrada: width 0 → ancho real en 0.5s ease-out

Verificar que funciona la navegacion entre perfiles."

---
PROMPT I-06: TIMELINECONTROLS Y FILTROS
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Implementa src/components/Timeline/TimelineControls.jsx.

BARRA SUPERIOR:
1. Botones ZOOM: [−] y [+]
2. Botones NAVEGACION: [←] y [→]
3. INDICADOR DE NIVEL: etiqueta del nivel actual + 5 puntos (activo mas grande)
4. ANO AM: badge con el anio AM del centro de la ventana, en tiempo real
5. IR A: dropdown con: Inicio (AM 0), Diluvio (AM 1656), Abraham (AM 2008), Jose (AM 2259)
6. RESETEAR: boton vista completa

FILTROS (barra inferior a la timeline):
7. CHIPS por categoria: uno por cada categoria con color e icono. Toggle al clic.
8. BUSCADOR: input que filtra en tiempo real. Dropdown de resultados con eventos y personas.

Responsive: desktop una fila, mobile scroll horizontal en filtros.
Integrar con useFilters y useZoomLevel.
Verificar que todos los controles afectan la timeline."

---
PROMPT I-07: DISENO VISUAL PREMIUM
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

La funcionalidad ya existe. Implementa el diseno visual premium.

1. Agrega en index.html:
<link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' rel='stylesheet'>

2. Agrega en index.css (sin quitar nada existente) estas variables:
--font-primary: 'Inter', system-ui, sans-serif;
--bg-deep: #0d0e14;
--bg-panel: rgba(22, 24, 32, 0.97);
--glass-bg: rgba(255,255,255,0.03);
--glass-border: rgba(255,255,255,0.08);
--gold: #f39c12;
--gold-light: #f5c842;
--color-creation: #2d6a4f;
--color-judgment: #c0392b;
--color-sin: #7d3c98;
--color-covenant: #d4ac0d;
--color-patriarch: #2980b9;
--color-miracle: #8e44ad;
--color-genealogy: #7f8c8d;
--color-exile: #6c5ce7;
--color-restoration: #00b894;
--color-messianic: #f39c12;

3. HEADER: glassmorphism (background rgba(13,14,20,0.9), backdrop-filter blur(20px))
   Logo con gradiente violeta-dorado: background: linear-gradient(135deg, #c084fc, #f39c12);
   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
   Altura 60px, sticky top.

4. PANELES: fondo rgba(22,24,32,0.97) + backdrop-filter blur(20px)
   Borde izquierdo: 3px solid [color de la categoria del evento]
   Shadow: -8px 0 30px rgba(0,0,0,0.5)
   Scrollbar fino y oscuro.

5. VERSE BLOCK: comillas tipograficas grandes (font-size 80px, opacity 0.1) como fondo decorativo
   Texto italic, line-height 1.6. Referencia: monospace, gold, 0.75rem.

6. ITEMS DE TIMELINE: border-radius 8px, padding 4px 8px, icono + texto
   Hover: transform translateY(-2px) + box-shadow
   Selected: box-shadow 0 0 0 2px [color categoria]

7. CHIPS: border-radius 20px, fondo rgba del color al 15%, borde al 30%
   Hover: borde mas brillante

8. MICRO-ANIMACIONES:
   Panel slide-in: transform translateX(100%) → translateX(0) en 0.3s ease-out
   Items fade-in al aparecer al hacer zoom: opacity 0 → 1 en 0.2s
   Hover en todos los interactivos: transition 0.15s ease

9. FONDO GENERAL: background var(--bg-deep)
   Gradiente radial: radial-gradient(ellipse at 50% 0%, rgba(170,59,255,0.03), transparent 70%)

Verificar en 1280px y 768px. npm run dev."

---
PROMPT I-08: FUNCIONALIDADES EXTENDIDAS
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Implementa las 4 funcionalidades extendidas:

1. MODO LECTURA DE PASAJE:
- Boton 'Leer pasaje completo' en EventPanel
- Modal full-screen: titulo + referencia + texto del pasaje completo
- Versiculos numerados, tipografia serif, max-width 680px centrado
- Fondo oscuro semitransparente, scroll vertical, cerrar con X o Escape

2. ESTADISTICAS VISUALES (nueva seccion):
- Accesible desde el Header
- a. Barras horizontales de vida de patriarcas en escala AM (Adan → Jose)
- b. Tabla de notable_overlaps con descripcion
- c. Comparativa de lifespans (Matusalen: 969 anios vs promedio actual ~80)
- Solo CSS y divs. Sin librerias de charts.

3. COMPARTIR CON LINK:
- Al abrir un evento: actualizar URL con ?event=flood_start
- Al cargar la app con ese parametro: auto-seleccionar y centrar ese evento
- Al cerrar panel: limpiar el parametro URL
- Usar history.pushState() sin routing adicional

4. EXPORTAR / IMPRIMIR:
- Boton 'Exportar' en TimelineControls
- Aplicar estilos CSS @media print:
  - Ocultar controles y header
  - Mostrar timeline en ancho completo
  - Si hay panel abierto, mostrarlo al lado derecho
  - Llamar window.print()

Verificar cada funcionalidad. npm run dev."


=======================================================================
## 12. PROMPTS PARA INCORPORAR NUEVOS LIBROS
=======================================================================

---
PROMPT NL-01: CREAR ESTRUCTURA BASE DE UN NUEVO LIBRO
---
(Reemplazar [LIBRO], [NOMBRE], [N], [AM_START], [AM_END] con los valores del libro)

Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Tu tarea es crear src/data/books/[LIBRO].json para el libro de [NOMBRE].

El libro tiene [N] capitulos. Cubre el periodo AM [AM_START] a AM [AM_END].

Sigue EXACTAMENTE el mismo schema que genesis.json (Secciones 5.1 a 5.12 de PROYECTO_GUIA.md).

Crea solo estas secciones iniciales (sin eventos ni personas):
1. metadata adaptado para este libro
2. eras del periodo cubierto
3. dispensations activas en este periodo
4. narrative_blocks: los grandes bloques del libro

Para los narrative_blocks, identifica:
- Si es Pentateuco: usa la estructura de toledot (marcadores 'estas son las generaciones de...')
- Para cualquier libro: los grandes giros narrativos y cambios de protagonista

Actualiza src/data/index.json agregando el nuevo libro con status='in_progress'.
Verifica npm run dev."

---
PROMPT NL-02: TEMPLATE PARA DOCUMENTAR EVENTOS DE CUALQUIER LIBRO
---
Instruccion a copiar y pegar:

"Lee el archivo PROYECTO_GUIA.md en c:\Users\fgarea\Documents\genesis-explorer\

Agrega los eventos al array 'timeline_events' de src/data/books/[LIBRO].json.

Bloque a documentar: [NOMBRE DEL BLOQUE] — [N] eventos.

Eventos:
[IDS Y REFERENCIAS DEL BLOQUE]

Para CADA evento, completar TODOS los campos del Schema 5.5 de PROYECTO_GUIA.md:
- id, depth_level, parent_id, name, short_name, category, importance
- chronology: approx_year_am, exact_date_note (si existe), duration_days, duration_note
- location_id, chapter_start, verse_start_ref, chapter_end, verse_end_ref
- narrative: MINIMO 3 oraciones descriptivas
- historical_context: contexto historico-cultural del periodo
- theological_teaching: ensenanza teologica del evento
- messianic_connection: conexion con la promesa mesianica, o null
- key_people, covenant_id, theme_ids, question_ids
- references, key_verse, additional_verses, cross_references_nt
- sub_event_ids, timeline_display

REGLAS:
- Versiculos en Reina-Valera 1960 en espanol
- Anos en Anno Mundi (AM)
- depth_level 2 = eventos principales, depth_level 3 = escenas especificas
- Valida JSON. npm run dev."

=======================================================================
## 13. REGLAS DEL PROYECTO
=======================================================================

ABSOLUTAS (no negociables):
1. Leer PROYECTO_GUIA.md ANTES de cualquier tarea
2. Un JSON por libro. NUNCA mezclar libros en un mismo archivo
3. El schema es FIJO. No inventar campos sin documentarlos aqui
4. Versiculos en Reina-Valera 1960 en espanol
5. Anos en Anno Mundi (AM). NUNCA AC/DC/BCE/CE
6. IDs en ingles, snake_case
7. No borrar datos del genesis.json sin motivo documentado
8. index.css: SOLO extender. NUNCA reemplazar variables existentes
9. JSX + JavaScript puro. Sin TypeScript. Sin Tailwind
10. npm run dev debe funcionar SIEMPRE antes de dar una tarea por terminada
11. No instalar librerias adicionales sin aprobacion del usuario
12. DESARROLLO POR SUB-BLOQUES EXHAUSTIVOS: Priorizar la máxima profundidad, precisión teológica y completitud sobre la velocidad. Cada tarea se dividirá en sub-etapas precisas y verificables, garantizando información completa y profesional sin omitir ni resumir contenido relevante. El objetivo es la producción de contenido de nivel académico/editorial, no un desarrollo rápido.

PALABRAS CLAVE DE FLUJO:
- "Analizar" → Solo analisis. No modificar archivos. Esperar confirmacion.
- "Debate" → Solo discutir opciones. No ejecutar cambios hasta aprobacion.
- Cualquier otra instruccion → Implementar, verificar con npm run dev, reportar.

CONVENCION DE IDs:
- Era:             era_[nombre]          ejemplo: era_primordial
- Bloque:          nb_[nombre]           ejemplo: nb_noah
- Evento:          [nombre]              ejemplo: flood_start
- Persona:         [nombre]              ejemplo: noah
- Pacto:           [nombre]_covenant     ejemplo: noahic_covenant
- Dispensacion:    disp_[nombre]         ejemplo: disp_promise
- Pregunta:        question_[nombre]     ejemplo: question_flood_global
- Tema:            theme_[nombre]        ejemplo: theme_judgment
- Ubicacion:       [nombre]              ejemplo: eden, babel
- Relacion:        rel_[numero]          ejemplo: rel_1

=======================================================================
## 14. REGISTRO DE PROGRESO
=======================================================================

ACTUALIZAR ESTA SECCION CON CADA TAREA COMPLETADA.
Marcar como: PENDIENTE | EN PROGRESO | COMPLETADO | Error-en-revision

FASE DATOS — GENESIS:
D-01 Estructura base JSON                                   COMPLETADO
D-02.1 Eventos Bloque 1 (La Creacion: 8 eventos)            COMPLETADO
D-02.2 Eventos Bloque 2 (La Caida y Set: 11 eventos)        COMPLETADO
D-03 Eventos Bloque 3 (Noe y Diluvio: 13 eventos)          COMPLETADO
D-04 Eventos Bloques 4-5 (Babel y Abraham: 28 eventos)     COMPLETADO
D-05 Eventos Bloques 6-7-8 (Isaac, Jacob y José: 22 ev)    COMPLETADO
D-06 Personajes principales (21 perfiles completos)         COMPLETADO
D-07 Personajes secundarios + pactos + temas + preguntas   COMPLETADO
D-08 Locations + chapters_map + notable_overlaps           COMPLETADO
D-09 Validacion final del genesis.json                     PENDIENTE

FASE INTERFAZ:
I-01 Setup vis-timeline + estructura de componentes        PENDIENTE
I-02 Utils y hooks base                                    PENDIENTE
I-03 Componente Timeline principal                         PENDIENTE
I-04 EventPanel y subcomponentes                           PENDIENTE
I-05 PersonPanel y LifespanBar                             PENDIENTE
I-06 TimelineControls y filtros                            PENDIENTE 
I-07 Diseno visual premium                                 PENDIENTE
I-08 Funcionalidades extendidas                            PENDIENTE

ESTADO GLOBAL: 
- Datos Genesis: 88% (8/9 tareas principales completadas)
- Interfaz: 0% (0/8 tareas)
- Libros: 1 en desarrollo (Genesis)

NOTAS DE SESIONES ANTERIORES:
- 2026-07-23: Se completó la Tarea D-04 (Babel y el Ciclo de Abraham) agregando 28 eventos exhaustivos (5 de Babel/Naciones + 23 de Abraham).
- 2026-07-23: Se completó la Tarea D-05 (Isaac, Jacob y José) agregando 22 eventos exhaustivos (6 de Isaac + 8 de Jacob + 8 de José). Total acumulado en genesis.json: 82 eventos completos abarcando los 50 capítulos del Génesis según el estándar Schema 3.0 (D-01 a D-05 completados).
- 2026-07-23: Se completó la Tarea D-06 (Personajes Principales) poblando los 21 perfiles bíblicos exhaustivos divididos en 3 sub-fases (D-06.1, D-06.2, D-06.3) siguiendo estrictamente el estándar Schema 3.0.
- 2026-07-23: Se completó la Tarea D-07 poblando 12 personajes secundarios clave (llegando a 33 personas), 5 pactos bíblicos (`covenants`), 7 promesas mesiánicas (`messianic_promises`), 8 temas teológicos (`themes`) y 8 preguntas teológicas frecuentes (`questions`).
- 2026-07-23: Se completó la Tarea D-08 poblando 15 ubicaciones geográficas (`locations`), el mapeo estructurado de los 50 capítulos (`chapters_map`) y la matriz de convivencias patriarcales reales (`notable_overlaps`).





