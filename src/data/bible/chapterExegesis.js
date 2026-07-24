/**
 * Base de datos Exegética y Homilética para los 50 Capítulos de Génesis.
 * Proporciona bosquejos sintácticos, lección doctrinal principal, glosario hebreo y citas al Nuevo Testamento.
 */

export const CHAPTER_EXEGESIS = {
  1: {
    outline: [
      { verses: "vv. 1-2", title: "El Principio Primordial y la Acción del Espíritu (Rúaj Elohim)" },
      { verses: "vv. 3-5", title: "Día 1: La Creación de la Luz y la División del Tiempo" },
      { verses: "vv. 6-8", title: "Día 2: La Expansión Atmosférica (Raqía) y la Separación de Aguas" },
      { verses: "vv. 9-13", title: "Día 3: La Tierra Seca, los Mares y la Vegetación" },
      { verses: "vv. 14-19", title: "Día 4: Las Lumbreras Celestes para Marcar las Estaciones" },
      { verses: "vv. 20-23", title: "Día 5: La Creación de la Vida Marina y las Aves" },
      { verses: "vv. 24-25", title: "Día 6a: Los Animales Terrestres" },
      { verses: "vv. 26-31", title: "Día 6b: La Creación Especial del Hombre a Imagen de Dios (Imago Dei)" }
    ],
    theological_teaching: "Génesis 1 revela la monarquía absoluta de Dios sobre el universo mediante la creación Ex Nihilo. Dios no forma el mundo del caos preexistente sino por la voz todopoderosa de su Logos (la Palabra), estableciendo al ser humano como su representante con dignidad inalienable.",
    hebrew_terms: [
      { hebrew: "בָּרָא", transliteration: "Bará", meaning: "Crear de la nada (utilizado únicamente con Dios)" },
      { hebrew: "תֹּהוּ וָבֹהוּ", transliteration: "Tohu va-Bohu", meaning: "Desordenada y vacía / Caos inicial" },
      { hebrew: "רָקִיעַ", transliteration: "Raqía", meaning: "Firmamento / Expansión celestial" },
      { hebrew: "צֶלֶם", transliteration: "Tselem", meaning: "Imagen / Estatua representativa del Rey" }
    ],
    nt_cross_references: ["Juan 1:1-3", "Colosenses 1:16-17", "Hebreos 11:3", "Apocalipsis 4:11"]
  },

  2: {
    outline: [
      { verses: "vv. 1-3", title: "El Séptimo Día: Santificación del Reposo Divino (Sabbath)" },
      { verses: "vv. 4-7", title: "Formación del Hombre del Polvo (Adamah) y el Aliento Divino (Neshamah)" },
      { verses: "vv. 8-14", title: "El Huerto del Edén y los Cuatro Ríos Primordiales" },
      { verses: "vv. 15-17", title: "El Mandato Moral de Mayordomía y el Árbol del Conocimiento" },
      { verses: "vv. 18-20", title: "La Nombradia de los Animales y la Necesidad de la Ayuda Idónea" },
      { verses: "vv. 21-25", title: "La Creación de la Mujer y la Institución Sagrada del Matrimonio" }
    ],
    theological_teaching: "Establece el diseño antropológico del matrimonio binario monogámico e indisoluble entre un hombre y una mujer, y el marco de responsabilidad moral del hombre bajo la prueba de la obediencia en el Edén.",
    hebrew_terms: [
      { hebrew: "נְשָׁמָה", transliteration: "Neshamah", meaning: "Aliento de vida impertido por Dios" },
      { hebrew: "עֵזֶר כְּנֶגְדּוֹ", transliteration: "Ezer Kenegdo", meaning: "Ayuda idónea / Rescate complementario" }
    ],
    nt_cross_references: ["Mateo 19:4-6", "1 Corintios 11:7-9", "Efesios 5:31-32"]
  },

  3: {
    outline: [
      { verses: "vv. 1-5", title: "La Tentación de la Serpiente y el Ataque a la Palabra de Dios" },
      { verses: "vv. 6-7", title: "La Caída: Transgresión, Conciencia de Desnudez y Vergüenza" },
      { verses: "vv. 8-13", title: "El Interrogatorio Divino: El Miedo y la Evasión de Responsabilidad" },
      { verses: "vv. 14-15", title: "El Juicio a la Serpiente y la Promesa del Protoevangelio" },
      { verses: "vv. 16-19", title: "El Veredicto Divino sobre la Mujer, el Hombre y la Tierra" },
      { verses: "vv. 20-24", title: "Túnicas de Pieles (Primer Sacrificio) y Expulsión del Edén" }
    ],
    theological_teaching: "Génesis 3 es la explicación histórica de la entrada del pecado original y la muerte en el mundo. En medio de la condenación, brilla el Protoevangelio (Génesis 3:15), anunciando la victoria futura de la Simiente de la mujer sobre Satanás.",
    hebrew_terms: [
      { hebrew: "זֶרַע", transliteration: "Zera", meaning: "Simiente / Descendencia prometida" },
      { hebrew: "הָעָרוּם", transliteration: "Ha-Arum", meaning: "Astuto / Sagaz" }
    ],
    nt_cross_references: ["Romanos 5:12-21", "2 Corintios 11:3", "Gálatas 4:4", "Apocalipsis 12:9"]
  },

  4: {
    outline: [
      { verses: "vv. 1-5", title: "Nacimiento de Caín y Abel y las Ofrendas Presentadas a Dios" },
      { verses: "vv. 6-8", title: "La Advertencia Divina a Caín y el Primer Fratricidio de la Historia" },
      { verses: "vv. 9-15", title: "El Clamor de la Sangre de Abel y la Maldición sobre Caín" },
      { verses: "vv. 16-24", title: "La Descendencia de Caín: Desarrollo Cultural y la Jactancia de Lamec" },
      { verses: "vv. 25-26", title: "Nacimiento de Set y el Inicio de la Invocación del Nombre de Jehová" }
    ],
    theological_teaching: "Demuestra la rápida propagación del pecado en la sociedad humana y la separación entre dos líneas: la línea rebelde e impía de Caín frente a la línea de Set que invoca el nombre del Señor.",
    hebrew_terms: [
      { hebrew: "שֵׁת", transliteration: "Shet (Set)", meaning: "Sustituido / Puesto en lugar de Abel" }
    ],
    nt_cross_references: ["Hebreos 11:4", "Hebreos 12:24", "1 Juan 3:12", "Judas 1:11"]
  },

  5: {
    outline: [
      { verses: "vv. 1-5", title: "La Genealogía Antediluviana desde Adán hasta Set" },
      { verses: "vv. 6-20", title: "El Estribillo Mortal 'y Murió' a través de los Patriarcas" },
      { verses: "vv. 21-24", title: "La Excepción Gloriosa: Enoc Camina con Dios y es Traspuesto al Cielo" },
      { verses: "vv. 25-32", title: "Matusalén, Lamec y el Nacimiento de Noé el Consolador" }
    ],
    theological_teaching: "La genealogía de Génesis 5 demuestra la certeza física de la maldición del pecado ('y murió'), pero la trasposición milagrosa de Enoc anticipa la victoria final sobre la muerte y la esperanza de la resurrección.",
    hebrew_terms: [
      { hebrew: "חֲנוֹךְ", transliteration: "Janók (Enoc)", meaning: "Consagrado / Dedicado" }
    ],
    nt_cross_references: ["Lucas 3:36-38", "Hebreos 11:5", "Judas 1:14-15"]
  },

  6: {
    outline: [
      { verses: "vv. 1-4", title: "La Corrupción Moral Promiscuidad de la Era Antediluviana" },
      { verses: "vv. 5-7", title: "El Dolor Santo de Dios ante la Depravación Total del Corazón Humano" },
      { verses: "vv. 8-13", title: "Noé Halla Gracia ante Dios: El Varón Justo en una Generación Perversa" },
      { verses: "vv. 14-22", title: "El Diseño Divino del Arca de Madera de Gofer y las Instrucciones" }
    ],
    theological_teaching: "Revela la depravación total del pecado humano y la gracia inmerecida de Dios. Noé es salvado no por mérito propio sino por la gracia hallada ante los ojos de Jehová.",
    hebrew_terms: [
      { hebrew: "חֵן", transliteration: "Jen", meaning: "Gracia / Favor inmerecido" }
    ],
    nt_cross_references: ["Mateo 24:37-39", "Hebreos 11:7", "1 Pedro 3:20", "2 Pedro 2:5"]
  },

  7: {
    outline: [
      { verses: "vv. 1-5", title: "La Entrada de Noé, su Familia y los Animales en el Arca" },
      { verses: "vv. 6-12", title: "El Ruptura de las Fuentes del Gran Abismo y la Apertura de Cataratas" },
      { verses: "vv. 13-16", title: "Dios Cierra la Puerta del Arca (El Sello Divino de Protección)" },
      { verses: "vv. 17-24", title: "La Prevalencia Absoluta de las Aguas sobre los Montes y el Juicio" }
    ],
    theological_teaching: "El Diluvio es un prototipo del Juicio Final. Dios es el único que juzga la maldad pero también el único que provee una puerta de salvación y la cierra con seguridad.",
    hebrew_terms: [
      { hebrew: "מַבּוּל", transliteration: "Mabbul", meaning: "Diluvio cataclísmico" }
    ],
    nt_cross_references: ["Lucas 17:26-27", "2 Pedro 3:5-7"]
  },

  8: {
    outline: [
      { verses: "vv. 1-5", title: "Dios se Acuerda de Noé: El Viento y el Descenso de las Aguas" },
      { verses: "vv. 6-12", title: "El Envío del Cuervo y la Paloma con la Hoja de Olivo" },
      { verses: "vv. 13-19", title: "La Salida del Arca por Mandato Divino a la Tierra Seca" },
      { verses: "vv. 20-22", title: "El Primer Altar de Noé y la Promesa de Preservación de Estaciones" }
    ],
    theological_teaching: "Demuestra la fidelidad pactual de Dios al 'acordarse' de sus siervos. El sacrificio de olor grato de Noé abre la era de preservación del orden cósmico.",
    hebrew_terms: [
      { hebrew: "זָכַר", transliteration: "Zakar", meaning: "Acordarse con fidelidad pactual" }
    ],
    nt_cross_references: ["Efesios 5:2", "Hebreos 13:15"]
  },

  9: {
    outline: [
      { verses: "vv. 1-7", title: "La Bendición a Noé, Prohibición del Consumo de Sangre y Pena Capital" },
      { verses: "vv. 8-17", title: "Institución del Pacto Noéico y el Arco Iris como Señal Perpetua" },
      { verses: "vv. 18-23", title: "El Incidente de la Embriaguez de Noé y el Pecado de Cam" },
      { verses: "vv. 24-29", title: "La Profecía Patriarcal sobre Canaán, Sem y Jafet" }
    ],
    theological_teaching: "Establece el valor inviolable de la vida humana mediante la institución del gobierno civil y la pena capital (Génesis 9:6), y garantiza la estabilidad de la tierra mediante el Arco Iris.",
    hebrew_terms: [
      { hebrew: "קֶשֶׁת", transliteration: "Qeshet", meaning: "Arco iris / Arco de guerra colgado" }
    ],
    nt_cross_references: ["Hechos 15:20", "Apocalipsis 4:3"]
  },

  10: {
    outline: [
      { verses: "vv. 1-5", title: "Los Descendientes de Jafet y las Islas de las Naciones" },
      { verses: "vv. 6-20", title: "Los Descendientes de Cam y el Vigoroso Imperio de Nimrod" },
      { verses: "vv. 21-32", title: "Los Descendientes de Sem y la División de Peleg" }
    ],
    theological_teaching: "La Tabla de las 70 Naciones demuestra la unidad biológica de toda la raza humana derivando de Noé y el poblamiento providencial del globo.",
    hebrew_terms: [
      { hebrew: "גּוֹיִם", transliteration: "Goyim", meaning: "Naciones / Pueblos" }
    ],
    nt_cross_references: ["Hechos 17:26"]
  },

  11: {
    outline: [
      { verses: "vv. 1-4", title: "La Rebelión Imperial de Babel y la Edificación de la Torre de Orgullo" },
      { verses: "vv. 5-9", title: "La Intervención Divina: Confusión de Lenguas y Dispersión Mundial" },
      { verses: "vv. 10-26", title: "La Genealogía Mesiánica desde Sem hasta Taré" },
      { verses: "vv. 27-32", title: "La Familia de Taré, Abram y Sarai en Ur y su Viaje a Harán" }
    ],
    theological_teaching: "Demuestra la inutilidad del orgullo humano tratando de alcanzar el cielo por sus propios medios. Dios confunde la babel humana para dar paso al llamado del hombre de fe (Abram).",
    hebrew_terms: [
      { hebrew: "בָּבֶל", transliteration: "Babel", meaning: "Confusión" }
    ],
    nt_cross_references: ["Hechos 2:1-11", "Apocalipsis 17:5"]
  },

  12: {
    outline: [
      { verses: "vv. 1-3", title: "El Llamado Soberano a Abram y las Siete Promesas Abrahámicas" },
      { verses: "vv. 4-9", title: "La Obediencia de Abram: Viaje a Canaán y Altares en Siquem y Betel" },
      { verses: "vv. 10-20", title: "La Hambruna, el Descenso a Egipto y la Falta de Fe sobre Sarai" }
    ],
    theological_teaching: "El inicio de la historia patriarcal. La salvación del mundo se canaliza a través del llamado incondicional de Abram: 'en ti serán benditas todas las familias de la tierra'.",
    hebrew_terms: [
      { hebrew: "בְּרָכָה", transliteration: "Berakah", meaning: "Bendición" }
    ],
    nt_cross_references: ["Hechos 7:2-4", "Gálatas 3:8-9", "Hebreos 11:8"]
  },

  15: {
    outline: [
      { verses: "vv. 1-6", title: "La Visión de Abram y la Declaración de Justificación por la Fe (15:6)" },
      { verses: "vv. 7-12", title: "La Preparación de los Animales para la Ceremonia de Cortar el Pacto" },
      { verses: "vv. 13-16", title: "La Profecía de los 400 Años de Opresión en Egipto" },
      { verses: "vv. 17-21", title: "El Horno Humeante y la Antorcha: Ratificación Incondicional del Pacto" }
    ],
    theological_teaching: "Génesis 15:6 es la piedra angular de la Soteriología: 'Creyó Abram a Jehová, y le fue contado por justicia'. Dios ratifica el pacto unilaterally garantizando la heredad de la tierra.",
    hebrew_terms: [
      { hebrew: "אָמַן", transliteration: "Aman", meaning: "Creer / Confiar firmemente" },
      { hebrew: "צְדָקָה", transliteration: "Tsedaqah", meaning: "Justicia declarada" }
    ],
    nt_cross_references: ["Romanos 4:1-5", "Gálatas 3:6", "Santiago 2:23"]
  },

  22: {
    outline: [
      { verses: "vv. 1-3", title: "La Prueba Extrema de Fe: El Mandato Divino de Ofrecer a Isaac en Moriah" },
      { verses: "vv. 4-8", title: "El Viaje de Tres Días y la Pregunta de Isaac: '¿Dónde está el cordero?'" },
      { verses: "vv. 9-14", title: "El Atamiento de Isaac (La Akedáh), el Ángel y Jehová-Jireh" },
      { verses: "vv. 15-19", title: "El Juramento Solemnemente Confirmado a Abraham" },
      { verses: "vv. 20-24", title: "La Genealogía de Nacor y el Anuncio de Rebeca" }
    ],
    theological_teaching: "La cumbre de la tipología mesiánica en el Antiguo Testamento. El único hijo entregado por el padre prefigura el sacrificio del Padre Celestial entregando a Jesucristo en el Calvario.",
    hebrew_terms: [
      { hebrew: "יְהוָה יִרְאֶה", transliteration: "Jehová-Jireh", meaning: "El Señor Proveerá" },
      { hebrew: "עֲקֵידָה", transliteration: "Akedáh", meaning: "Atamiento de Isaac" }
    ],
    nt_cross_references: ["Juan 3:16", "Juan 8:56", "Hebreos 11:17-19", "Santiago 2:21-22"]
  },

  49: {
    outline: [
      { verses: "vv. 1-4", title: "Discurso Final de Jacob: El Juicio sobre Rubén" },
      { verses: "vv. 5-7", title: "El Veredicto Profético sobre Simeón y Leví por la Violencia de Siquem" },
      { verses: "vv. 8-12", title: "La Profecía Mesiánica de Judá: El León y la Venida de Shiloh" },
      { verses: "vv. 13-27", title: "Bendiciones sobre las demás Tribus (Zabulón, Isacar, Dan, José, etc.)" },
      { verses: "vv. 28-33", title: "Instrucciones de Sepultura en la Cueva de Macpela y Muerte de Jacob" }
    ],
    theological_teaching: "Génesis 49:10 contiene la magna profecía del Mesías victorioso viniendo de la tribu de Judá: 'No será quitado el cetro de Judá... hasta que venga Shiloh'.",
    hebrew_terms: [
      { hebrew: "שִׁילֹה", transliteration: "Shiloh", meaning: "Aquel a quien pertenece el reino / El Pacificador" }
    ],
    nt_cross_references: ["Hebreos 7:14", "Apocalipsis 5:5"]
  },

  50: {
    outline: [
      { verses: "vv. 1-6", title: "El Embalsamamiento de Jacob y el Duelo Real en Egipto" },
      { verses: "vv. 7-14", title: "Cortejo Fúnebre Solemne a Canaán y Sepelio en Macpela" },
      { verses: "vv. 15-21", title: "El Temor de los Hermanos y la Gran Declaración Providencial de José" },
      { verses: "vv. 22-26", title: "Los Últimos Días de José, su Profecía de Salida y Muerte en Fe" }
    ],
    theological_teaching: "Cierre grandioso del Génesis. José resume la clave providencial de la historia: 'Dios lo encaminó a bien' (50:20), y muere exigiendo juramento de que sus huesos saldrán hacia la Tierra Prometida.",
    hebrew_terms: [
      { hebrew: "חָשַׁב", transliteration: "Jashab", meaning: "Pensar / Planear / Encaminar" }
    ],
    nt_cross_references: ["Romanos 8:28", "Hebreos 11:22"]
  }
};

/**
 * Generador automático de auxilio exegético para capítulos que aún no poseen entrada completa
 */
export function getChapterExegesisData(chapNum, chapterObj) {
  const custom = CHAPTER_EXEGESIS[chapNum];
  if (custom) return custom;

  // Fallback exegético bien estructurado si el capítulo aún no tiene entrada personalizada
  return {
    outline: [
      { verses: "Parte I", title: `Acontecimientos Principales de Génesis Capítulo ${chapNum}` },
      { verses: "Parte II", title: `Desarrollo de la Narrativa Patriarcal` }
    ],
    theological_teaching: chapterObj?.summary || `Este capítulo forma parte del registro providencial del Génesis, demostrando la fidelidad de Dios con las generaciones patriarcales.`,
    hebrew_terms: [],
    nt_cross_references: ["Hebreos 11:1-40"]
  };
}
