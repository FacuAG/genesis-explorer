# BIBLE EXPLORER — GUÍA DE IMPLEMENTACIÓN PARA NUEVOS LIBROS (SCHEMA 3.0)

Este documento es el **manual de procedimiento estandarizado** para crear, poblar, validar e integrar la base de datos de **cualquier libro adicional de las Sagradas Escrituras** (ej. *Éxodo*, *Levítico*, *Mateo*, *Hechos*, etc.) en la plataforma **Bible Explorer**.

---

## 📌 Principios Fundamentales

1. **Un JSON por Libro (`src/data/books/[book_id].json`)**:
   Cada libro se mantiene en un archivo JSON independiente que se carga de forma diferida (*lazy loading*) solo cuando el usuario selecciona el libro en la interfaz.

2. **Cumplimiento Estricto de Schema 3.0**:
   Todos los libros deben seguir exactamente el mismo esquema de 12 capas para garantizar que los componentes de la interfaz de usuario (Timeline, Paneles, Árbol Genealógico, Mapas y Filtros) funcionen sin modificaciones.

3. **Desarrollo por Sub-bloques Exhaustivos**:
   No se deben resumir ni omitir datos. Cada evento, personaje y concepto debe poblarse con profundidad académica y precisión exegética.

4. **Persistencia de IDs Globales**:
   Los personajes o lugares que aparecen en múltiples libros (ej. `abraham`, `moses`, `david`, `jesus`, `egypt`, `jerusalem`) **deben reutilizar el mismo ID exacto en snake_case** en todos los archivos JSON para permitir conexiones transversales.

---

## 📁 Estructura de Archivos y Registro

```
genesis-explorer/
├── src/
│   └── data/
│       ├── index.json               # Índice de libros disponibles en la app
│       └── books/
│           ├── genesis.json         # Libro 1: Génesis (v3.0)
│           ├── exodus.json          # Libro 2: Éxodo (Futuro)
│           └── [book_id].json       # Cualquier libro futuro
```

### Registro del Libro en `src/data/index.json`
Cuando un nuevo libro es finalizado, se registra en la lista global:
```json
{
  "books": [
    {
      "id": "genesis",
      "name": "Génesis",
      "testament": "old",
      "category": "pentateuch",
      "chapters": 50,
      "dataPath": "/data/books/genesis.json"
    },
    {
      "id": "exodus",
      "name": "Éxodo",
      "testament": "old",
      "category": "pentateuch",
      "chapters": 40,
      "dataPath": "/data/books/exodus.json"
    }
  ]
}
```

---

## 📋 Metodología Paso a Paso en 9 Sub-etapas (D-01 a D-09)

Al trabajar en un nuevo libro, se deben seguir ordenadamente las siguientes **9 etapas de trabajo**:

### **Etapa 1: Setup Inicial del JSON (`D-01`)**
Crear `src/data/books/[book_id].json` con la cabecera `book_info` y los arreglos vacíos de las 12 capas:
- `book_info`, `eras`, `narrative_blocks`, `timeline_events`, `people`, `relationships`, `locations`, `covenants`, `messianic_promises`, `themes`, `questions`, `chapters_map`, `notable_overlaps`.

### **Etapa 2: Estructura Narrativa y Eras (`D-02.1`)**
Definir en `eras` y `narrative_blocks` los grandes períodos del libro.
*Ejemplo para Éxodo:*
- **Era**: `era_exodus` (Período del Éxodo y la Ley).
- **Bloques**: `nb_egypt_slavery` (Caps. 1-2), `nb_plagues` (Caps. 3-11), `nb_red_sea` (Caps. 12-15), `nb_wilderness` (Caps. 16-18), `nb_sinai_law` (Caps. 19-24), `nb_tabernacle` (Caps. 25-40).

### **Etapa 3: Población de Eventos por Bloques (`D-02.2` a `D-05`)**
Dividir los capítulos del libro en eventos cronológicos exhaustivos. Cada evento en `timeline_events` debe incluir:
```json
{
  "id": "plague_first_blood",
  "name": "La Primera Plaga: El Agua Convertida en Sangre",
  "category": "judgment",
  "year_am": 2513,
  "era_id": "era_exodus",
  "block_id": "nb_plagues",
  "location_id": "egypt",
  "key_people": ["moses", "aaron", "pharaoh_exodus"],
  "scriptural_reference": {
    "book": "Éxodo",
    "chapter": 7,
    "verse_start": 14,
    "verse_end": 25
  },
  "key_verse": {
    "reference": "Éxodo 7:17",
    "text": "Así ha dicho Jehová: En esto conocerás que yo soy Jehová: he aquí, yo golpearé con la vara que tengo en mi mano el agua que está en el río, y se convertirá en sangre."
  },
  "summary": "Moisés y Aarón golpean el Nilo con la vara en presencia de Faraón...",
  "theological_teaching": "Juicio divino sobre las deidades egipcias (Hapi y el Nilo) demostrando la soberanía única de Jehová.",
  "sub_event_ids": []
}
```

### **Etapa 4: Perfiles de Personajes Principales (`D-06`)**
Poblar en `people` los personajes principales del libro con biografías exhaustivas de 300+ palabras, significado de su nombre, carácter, significancia teológica y referencias al Nuevo Testamento.

### **Etapa 5: Personajes Secundarios (`D-07.1`)**
Agregar personajes secundarios y figuras clave que interactúan en la historia del libro.

### **Etapa 6: Pactos y Promesas Mesiánicas (`D-07.2`)**
- **Pactos (`covenants`)**: Registrar los pactos establecidos en el libro (ej. Pacto Mosaico/Sinaítico en Éxodo 19-24).
- **Promesas Mesiánicas (`messianic_promises`)**: Registrar las profecías y prefiguraciones del Mesías (ej. El Cordero Pascual, El Maná del Cielo, La Roca Herida).

### **Etapa 7: Temas y Preguntas Teológicas (`D-07.3`)**
- **Temas (`themes`)**: Definir los 6 a 10 pilares teológicos del libro.
- **Preguntas (`questions`)**: Exégesis rigurosa de las 6 a 10 preguntas más frecuentes del libro.

### **Etapa 8: Ubicaciones, Capítulos y Convivencias (`D-08`)**
- **`locations`**: Poblar las ciudades y geografías clave del libro con coordenadas e historia.
- **`chapters_map`**: Mapear cada uno de los capítulos del libro (del Capítulo 1 al N).
- **`notable_overlaps`**: Matriz de convivencias contemporáneas entre personajes del libro.

### **Etapa 9: Auditoría Automatizada de Integridad (`D-09`)**
Correr el script de auditoría PowerShell/C# para verificar:
1. Sintaxis JSON 100% válida.
2. Cero IDs huérfanos (todos los `key_people`, `location_id`, `associated_event_ids` deben existir en sus respectivos arreglos).

---

## ⚙️ Script de Auditoría Estándar (PowerShell)

Para validar cualquier libro `[book_id].json`, se puede ejecutar el script de auditoría ubicado en `scratch/audit_all.ps1` ajustando la ruta del archivo.

---

## 🏷️ Convenciones de IDs (snake_case)

- **Eras**: `era_[nombre]` (ej. `era_exodus`, `era_monarchy`, `era_gospels`)
- **Bloques Narrativos**: `nb_[nombre]` (ej. `nb_plagues`, `nb_sinai_law`)
- **Eventos**: `[nombre]` (ej. `red_sea_crossing`, `golden_calf_sin`)
- **Personajes**: `[nombre]` (ej. `moses`, `aaron`, `joshua`)
- **Pactos**: `[nombre]_covenant` (ej. `mosaic_covenant`)
- **Promesas Mesiánicas**: `[nombre]` (ej. `paschal_lamb_typology`)
- **Temas**: `theme_[nombre]` (ej. `theme_redemption`, `theme_holiness`)
- **Preguntas**: `question_[nombre]` (ej. `question_pharaoh_hardened_heart`)
- **Ubicaciones**: `[nombre]` (ej. `mount_sinai`, `red_sea`)

---

## 🌟 Los 5 Pilares Estándar de la Sala de Estudio por Capítulo

Todos los libros de la suite deben enriquecer la experiencia de lectura implementando las 5 capacidades exegéticas estandarizadas:

1. **✝️ Revelación Mesiánica & Cristológica**:
   - Todo capítulo debe incluir `christological_theme` en su objeto de datos y versículos con lazo tipológico al Nuevo Testamento.
2. **📜 Glosario & Léxico Interlineal con Subíndices en Versículos**:
   - Todo capítulo debe incluir de 5 a 10 entradas en `hebrew_terms` (Antiguo Testamento) o `greek_terms` (Nuevo Testamento) con el esquema estandarizado:
     ```json
     {
       "hebrew": "בָּרָא",
       "transliteration": "Bará",
       "strong": "H1254",
       "target_verse": 1,
       "target_word": "crió",
       "meaning": "Crear de la nada (Ex-Nihilo, atributo exclusivo de Dios)"
     }
     ```
   - Esto activa automáticamente las llamadas interlineales clicables `[🔤 Bará]` en los versículos y la ventana modal con código Strong.
3. **📍 Geografía y Contexto de Ubicaciones**:
   - Mapear las ubicaciones mencionadas en el capítulo hacia el registro de `locations`.
4. **📝 Cuaderno de Notas Personales**:
   - Soporte automático de notas por versículo persistidas en `localStorage` (`[book]_notes_ch_[chap]`).
5. **🎧 Lectura de Voz y Audio Sintético (TTS)**:
   - Integración nativa con `window.speechSynthesis` y resalte visual síncrono del versículo hablado.

---

## ✅ Resumen para Desarrolladores o IAs Futuras

Cuando un usuario solicite **"Agregar el libro de X"**:
1. Consultar este archivo `GUIA_NUEVO_LIBRO.md`.
2. Crear `src/data/books/X.json`.
3. Ejecutar de forma metódica las 9 etapas (**D-01 a D-09**).
4. Correr la auditoría de integridad.
5. Registrar el libro en `src/data/index.json`.
