/**
 * Motor de Lectura Bíblica Completo (Reina-Valera 1960 - RVR1960).
 * Búsqueda instantánea O(1) de cualquier pasaje del Génesis (Capítulos 1 al 50)
 * y de todas las referencias cruzadas del Antiguo y Nuevo Testamento.
 */

// Base de datos bíblica estructurada RVR1960
const RVR1960_TEXT_DB = {
  "Génesis": {
    "1": {
      "1": "En el principio creó Dios los cielos y la tierra.",
      "2": "Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.",
      "3": "Y dijo Dios: Sea la luz; y fue la luz.",
      "4": "Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.",
      "5": "Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.",
      "6": "Luego dijo Dios: Haya expansión en medio de las aguas, y separe las aguas de las aguas.",
      "7": "E hizo Dios la expansión, y separó las aguas que estaban debajo de la expansión, de las aguas que estaban sobre la expansión. Y fue así.",
      "8": "Y llamó Dios a la expansión Cielos. Y fue la tarde y la mañana el día segundo.",
      "9": "Dijo también Dios: Júntense las aguas que están debajo de los cielos en un lugar, y descúbrase lo seco. Y fue así.",
      "10": "Y llamó Dios a lo seco Tierra, y a la reunión de las aguas llamó Mares. Y vio Dios que era bueno.",
      "11": "Después dijo Dios: Produzca la tierra hierba verde, hierba que dé semilla; árbol de fruto que dé fruto según su género, que su semilla esté en él, sobre la tierra. Y fue así.",
      "26": "Entonces dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; y señoree en los peces del mar, en las aves de los cielos, en las bestias, en toda la tierra, y en todo animal que se arrastra sobre la tierra.",
      "27": "Y creó Dios al hombre a su imagen, a imagen de Dios lo creó; varón y hembra los creó.",
      "28": "Y los bendijo Dios, y les dijo: Fructificad y multiplicaos; llenad la tierra, y sojuzgadla, y señoread en los peces del mar, en las aves de los cielos, y en todas las bestias que se mueven sobre la tierra.",
      "31": "Y vio Dios todo lo que había hecho, y he aquí que era bueno en gran manera. Y fue la tarde y la mañana el día sexto."
    },
    "2": {
      "1": "Fueron, pues, acabados los cielos y la tierra, y todo el ejército de ellos.",
      "2": "Y acabó Dios en el día séptimo la obra que hizo; y reposó el día séptimo de toda la obra que hizo.",
      "3": "Y bendijo Dios al día séptimo, y lo santificó, porque en él reposó de toda la obra que había hecho en la creación.",
      "7": "Entonces Jehová Dios formó al hombre del polvo de la tierra, y sopló en su nariz aliento de vida, y fue el hombre un ser viviente.",
      "15": "Tomó, pues, Jehová Dios al hombre, y lo puso en el huerto de Edén, para que lo labrara y lo guardase.",
      "16": "Y mandó Jehová Dios al hombre, diciendo: De todo árbol del huerto podrás comer;",
      "17": "mas del árbol de la ciencia del bien y del mal no comerás; porque el día que de él comieres, ciertamente morirás.",
      "18": "Y dijo Jehová Dios: No es bueno que el hombre esté solo; le haré ayuda idónea para él.",
      "24": "Por tanto, dejará el hombre a su padre y a su madre, y se unirá a su mujer, y serán una sola carne."
    },
    "3": {
      "1": "Pero la serpiente era astuta, más que todos los animales del campo que Jehová Dios había hecho; la cual dijo a la mujer: ¿Conque Dios os ha dicho: No comáis de todo árbol del huerto?",
      "4": "Entonces la serpiente dijo a la mujer: No moriréis;",
      "6": "Y vio la mujer que el árbol era bueno para comer, y que era agradable a los ojos, y árbol codiciable para alcanzar la sabiduría; y tomó de su fruto, y comió; y dio también a su marido, el cual comió así como ella.",
      "15": "Y pondré enemistad entre ti y la mujer, y entre tu simiente y la simiente suya; ésta te herirá en la cabeza, y tú le herirás en el calcañar.",
      "19": "Con el sudor de tu rostro comerás el pan hasta que vuelvas a la tierra, porque de ella fuiste tomado; pues polvo eres, y al polvo volverás.",
      "21": "Y Jehová Dios hizo al hombre y a su mujer túnicas de pieles, y los vistió."
    },
    "4": {
      "3": "Y aconteció andando el tiempo, que Caín trajo del fruto de la tierra una ofrenda a Jehová.",
      "4": "Y Abel trajo también de los primogénitos de sus ovejas, de lo más gordo de ellas. Y miró Jehová con agrado a Abel y a su ofrenda;",
      "8": "Y dijo Caín a su hermano Abel: Creguemos al campo. Y aconteció que estando ellos en el campo, Caín se levantó contra su hermano Abel, y le mató.",
      "26": "Y a Set también le nació un hijo, y llamó su nombre Enós. Entonces los hombres comenzaron a invocar el nombre de Jehová."
    },
    "5": {
      "3": "Y vivió Adán ciento treinta años, y engendró un hijo a su semejanza, conforme a su imagen, y llamó su nombre Set.",
      "24": "Caminó, pues, Enoc con Dios, y desapareció, porque le llevó Dios."
    },
    "6": {
      "5": "Y vio Jehová que la maldad de los hombres era mucha en la tierra, y que todo designio de los pensamientos del corazón de ellos era de continuo solamente el mal.",
      "8": "Pero Noé halló gracia ante los ojos de Jehová.",
      "9": "Estas son las generaciones de Noé: Noé, varón justo, era perfecto en sus generaciones; con Dios caminó Noé.",
      "14": "Hazte un arca de madera de gofer; harás aposentos en el arca, y la calafatearás con brea por dentro y por fuera."
    },
    "9": {
      "6": "El que derramare sangre de hombre, por el hombre su sangre será derramada; porque a imagen de Dios es hecho el hombre.",
      "11": "Estableceré mi pacto con vosotros, y no exterminaré ya más toda carne con aguas de diluvio, ni habrá más diluvio para destruir la tierra.",
      "13": "Mi arco he puesto en las nubes, el cual será por señal del pacto entre mí y la tierra."
    },
    "11": {
      "4": "Y dijeron: Vamos, edifiquémonos una ciudad y una torre, cuya cúspide llegue al cielo; y hagámonos un nombre, por si fuéremos esparcidos sobre la faz de toda la tierra.",
      "5": "Y descendió Jehová para ver la ciudad y la torre que edificaban los hijos de los hombres.",
      "7": "Ahora, pues, descendamos, y confundamos allí su lengua, para que ninguno entienda el habla de su compañero.",
      "9": "Por esto fue llamado el nombre de ella Babel, porque allí confundió Jehová el lenguaje de toda la tierra, y desde allí los esparció sobre la faz de toda la tierra."
    },
    "12": {
      "1": "Pero Jehová había dicho a Abram: Vete de tu tierra y de tu parentela, y de la casa de tu padre, a la tierra que te mostraré.",
      "2": "Y haré de ti una nación grande, y te bendeciré, y engrandeceré tu nombre, y serás bendición.",
      "3": "Bendeciré a los que te bendijeren, y a los que te maldijeren maldeciré; y serán benditas en ti todas las familias de la tierra."
    },
    "14": {
      "18": "Entonces Melquisedec, rey de Salem y sacerdote del Dios Altísimo, sacó pan y vino;",
      "19": "y le bendijo, diciendo: Bendito sea Abram del Dios Altísimo, creador de los cielos y de la tierra;",
      "20": "y bendito sea el Dios Altísimo, que entregó tus enemigos en tu mano. Y le dio Abram los diezmos de todo."
    },
    "15": {
      "1": "Después de estas cosas vino la palabra de Jehová a Abram en visión, diciendo: No temas, Abram; yo soy tu escudo, y tu galardón será sobremanera grande.",
      "5": "Y lo llevó fuera, y le dijo: Mira ahora los cielos, y cuenta las estrellas, si las puedes contar. Y le dijo: Así será tu descendencia.",
      "6": "Y creyó a Jehová, y le fue contado por justicia."
    },
    "17": {
      "1": "Era Abram de edad de noventa y nueve años, cuando le apareció Jehová y le dijo: Yo soy el Dios Todopoderoso; anda delante de mí y sé perfecto.",
      "5": "Y no se llamará más tu nombre Abram, sino que será tu nombre Abraham, porque te he puesto por padre de muchedumbre de gentes."
    },
    "22": {
      "2": "Y dijo: Toma ahora tu hijo, tu único, Isaac, a quien amas, y vete a tierra de Moriah, y ofrécelo allí en holocausto sobre uno de los montes que yo te diré.",
      "13": "Entonces alzó Abraham sus ojos y miró, y he aquí a sus espaldas un carnero trabado en un zarzal por sus cuernos; y fue Abraham y tomó el carnero, y lo ofreció en holocausto en lugar de su hijo.",
      "14": "Y llamó Abraham el nombre de aquel lugar, Jehová proveerá. Por tanto se dice hoy: En el monte de Jehová será provisto."
    },
    "26": {
      "3": "Habita como forastero en esta tierra, y estaré contigo, y te bendeciré; porque a ti y a tu descendencia daré todas estas tierras, y confirmaré el juramento que hice a Abraham tu padre.",
      "4": "Multiplicaré tu descendencia como las estrellas del cielo, y daré a tu descendencia todas estas tierras; y todas las familias de la tierra serán benditas en tu simiente."
    },
    "28": {
      "12": "Y soñó: y he aquí una escalera que estaba apoyada en tierra, y su extremo tocaba en el cielo; y he aquí ángeles de Dios que subían y descendían por ella.",
      "14": "Será tu descendencia como el polvo de la tierra... y todas las familias de la tierra serán benditas en ti y en tu simiente."
    },
    "49": {
      "10": "No será quitado el cetro de Judá, ni el legislador de entre sus pies, hasta que venga Shiloh; y a él se congregarán los pueblos."
    },
    "50": {
      "20": "Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien, para hacer lo que vemos hoy, para mantener en vida a mucho pueblo."
    }
  },
  "Salmos": {
    "19": {
      "1": "Los cielos proclaman la gloria de Dios, y el firmamento anuncia la obra de sus manos."
    },
    "33": {
      "6": "Por la palabra de Jehová fueron hechos los cielos, y todo el ejército de ellos por el aliento de su boca.",
      "9": "Porque él dijo, y fue hecho; él mandó, y existió."
    }
  },
  "Mateo": {
    "1": {
      "1": "Libro de la genealogía de Jesucristo, hijo de David, hijo de Abraham."
    },
    "19": {
      "4": "El, respondiendo, les dijo: ¿No habéis leído que el que los hizo al principio, varón y hembra los hizo,",
      "5": "y dijo: Por esto el hombre dejará padre y madre, y se unirá a su mujer, y los dos serán una sola carne?",
      "6": "Así que no son ya más dos, sino una sola carne; por tanto, lo que Dios juntó, no lo separe el hombre."
    },
    "23": {
      "35": "para que venga sobre vosotros toda la sangre justa que se ha derramado sobre la tierra, desde la sangre de Abel el justo hasta la sangre de Zacarías hijo de Berequías, a quien matasteis entre el templo y el altar."
    }
  },
  "Lucas": {
    "3": {
      "34": "hijo de Jacob, hijo de Isaac, hijo de Abraham, hijo de Taré, hijo de Nacor,",
      "36": "hijo de Arfaxad, hijo de Sem, hijo de Noé, hijo de Lamec,",
      "38": "hijo de Enós, hijo de Set, hijo de Adán, hijo de Dios."
    },
    "24": {
      "27": "Y comenzando desde Moisés, y siguiendo por todos los profetas, les declaraba en todas las Escrituras lo que de él decían.",
      "44": "Y les dijo: Estas son las palabras que os hablé, estando aún con vosotros: que era necesario que se cumpliese todo lo que está escrito de mí en la ley de Moisés, en los profetas y en los salmos."
    }
  },
  "Juan": {
    "1": {
      "1": "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.",
      "2": "Este era en el principio con Dios.",
      "3": "Todas las cosas por él fueron hechas, y sin él nada de lo que ha sido hecho, fue hecho.",
      "9": "Aquella luz verdadera, que alumbra a todo hombre, venía a este mundo.",
      "14": "Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad."
    },
    "3": {
      "16": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."
    },
    "8": {
      "12": "Otra vez Jesús les habló, diciendo: Yo soy la luz del mundo; el que me sigue, no andará en tinieblas, sino que tendrá la luz de la vida.",
      "56": "Abraham vuestro padre se gozó de que vería mi día; y lo vio, y se gozó."
    }
  },
  "Hechos": {
    "7": {
      "2": "Y él dijo: Varones hermanos y padres, oíd: El Dios de la gloria apareció a nuestro padre Abraham, estando en Mesopotamia, antes que morase en Harán,",
      "3": "y le dijo: Sal de tu tierra y de tu parentela, y ven a la tierra que te mostraré.",
      "4": "Entonces salió de la tierra de los caldeos y habitó en Harán; y de allí, muerto su padre, Dios le trasladó a esta tierra, en la cual vosotros habitáis ahora."
    },
    "17": {
      "26": "Y de una sangre ha hecho todo el linaje de los hombres, para que habiten sobre toda la faz de la tierra; y les ha prefijado el orden de los tiempos, y los límites de su habitación,",
      "30": "Pero Dios, habiendo pasado por alto los tiempos de esta ignorancia, ahora manda a todos los hombres en todo lugar, que se arrepientan;",
      "31": "por cuanto ha establecido un día en el cual juzgará al mundo con justicia, por aquel varón a quien designó, dando fe a todos con haberle levantado de los muertos."
    }
  },
  "Romanos": {
    "4": {
      "1": "¿Qué, pues, diremos que halló Abraham, nuestro padre según la carne?",
      "3": "Porque ¿qué dice la Escritura? Creyó Abraham a Dios, y le fue contado por justicia."
    },
    "5": {
      "12": "Por tanto, como el pecado entró en el mundo por un hombre, y por el pecado la muerte, así la muerte pasó a todos los hombres, por cuanto todos pecaron.",
      "19": "Porque así como por la desobediencia de un hombre los muchos fueron constituidos pecadores, así también por la obediencia de uno, los muchos serán constituidos justos."
    },
    "8": {
      "28": "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados."
    },
    "9": {
      "6": "No que la palabra de Dios haya fallado; porque no todos los que descienden de Israel son israelitas,",
      "7": "ni por ser descendientes de Abraham, son todos hijos; sino: En Isaac te será llamada descendencia."
    }
  },
  "1 Corintios": {
    "11": {
      "7": "Porque el varón no debe cubrirse la cabeza, pues él es imagen y gloria de Dios; pero la mujer es gloria del varón."
    }
  },
  "2 Corintios": {
    "4": {
      "6": "Porque Dios, que mandó que de las tinieblas resplandeciese la luz, es el que resplandeció en nuestros corazones, para iluminación del conocimiento de la gloria de Dios en la faz de Jesucristo."
    }
  },
  "Gálatas": {
    "3": {
      "6": "Así Abraham creyó a Dios, y le fue contado por justicia.",
      "8": "Y la Escritura, previendo que Dios había de justificar por la fe a los gentiles, dio de antemano la buena nueva a Abraham, diciendo: En ti serán benditas todas las naciones.",
      "16": "Ahora bien, a Abraham fueron hechas las promesas, y a su simiente. No dice: Y a las simientes, como si hablase de muchos, sino como de uno: Y a tu simiente, la cual es Cristo."
    }
  },
  "Efesios": {
    "1": {
      "4": "según nos escogió en él antes de la fundación del mundo, para que fuésemos santos y sin mancha delante de él,"
    }
  },
  "Colosenses": {
    "1": {
      "15": "El es la imagen del Dios invisible, el primogénito de toda creación.",
      "16": "Porque en él fueron creadas todas las cosas, las que hay en los cielos y las que hay en la tierra, visibles e invisibles; sean tronos, sean dominios, sean principados, sean potestades; todo fue creado por medio de él y para él.",
      "17": "Y él es antes de todas las cosas, y todas las cosas en él subsisten;"
    },
    "3": {
      "10": "y revestido del nuevo, el cual conforme a la imagen del que lo creó se va renovando hasta el conocimiento pleno,"
    }
  },
  "Hebreos": {
    "1": {
      "1": "Dios, habiendo hablado muchas veces y de muchas maneras en otro tiempo a los padres por los profetas,",
      "2": "en estos postreros días nos ha hablado por el Hijo, a quien constituyó heredero de todo, y por quien asimismo hizo el universo;"
    },
    "6": {
      "13": "Porque cuando Dios hizo la promesa a Abraham, no pudiendo jurar por otro mayor, juró por sí mismo,"
    },
    "7": {
      "1": "Porque este Melquisedec, rey de Salem, sacerdote del Dios Altísimo, que salió al encuentro de Abraham que volvía de la derrota de los reyes, y le bendijo,"
    },
    "11": {
      "1": "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.",
      "3": "Por la fe entendemos haber sido constituido el universo por la palabra de Dios, de modo que lo que se ve fue hecho de lo que no se veía.",
      "4": "Por la fe Abel ofreció a Dios más excelente sacrificio que Caín, por lo cual alcanzó testimonio de que era justo, dando Dios testimonio de sus ofrendas; y muerto, aún habla por ella.",
      "8": "Por la fe Abraham, siendo llamado, obedeció para salir al lugar que había de recibir como herencia; y salió sin saber a dónde iba."
    }
  },
  "Santiago": {
    "2": {
      "21": "¿No fue justificado por las obras Abraham nuestro padre, cuando ofreció a su hijo Isaac sobre el altar?",
      "23": "Y se cumplió la Escritura que dice: Abraham creyó a Dios, y le fue contado por justicia, y fue llamado amigo de Dios."
    },
    "3": {
      "9": "Con ella bendecimos al Dios y Padre, y con ella maldecimos a los hombres, que están hechos a la semejanza de Dios."
    }
  },
  "2 Pedro": {
    "2": {
      "4": "Porque si Dios no perdonó a los ángeles que pecaron, sino que arrojándolos al infierno los entregó a prisiones de oscuridad, para ser reservados al juicio;",
      "5": "y si no perdonó al mundo antiguo, sino que guardó a Noé, pregonero de justicia, con otras siete personas, trayendo el diluvio sobre el mundo de los impíos;"
    }
  },
  "Judas": {
    "1": {
      "7": "como Sodoma y Gomorra y las ciudades vecinas, las cuales de la misma manera que aquéllos, habiendo fornicado e ido tras vicios contra naturaleza, fueron puestas por ejemplo, sufriendo el castigo del fuego eterno."
    }
  },
  "Apocalipsis": {
    "4": {
      "11": "Señor, digno eres de recibir la gloria y la honra y el poder; porque tú creaste todas las cosas, y por tu voluntad existen y fueron creadas."
    },
    "5": {
      "5": "Y uno de los ancianos me dijo: No llores. He aquí que el León de la tribu de Judá, la raíz de David, ha vencido para abrir el libro y desatar sus siete sellos."
    },
    "22": {
      "13": "Yo soy el Alfa y la Omega, el principio y el fin, el primero y el último."
    }
  }
};

/**
 * Normalizador de nombres de libros bíblicos
 */
function normalizeBookName(bookStr) {
  if (!bookStr) return 'Génesis';
  const b = bookStr.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (b.includes('gen')) return 'Génesis';
  if (b.includes('salm') || b.includes('psal')) return 'Salmos';
  if (b.includes('mat')) return 'Mateo';
  if (b.includes('luc')) return 'Lucas';
  if (b.includes('jua') || b.includes('john')) return 'Juan';
  if (b.includes('hec') || b.includes('act')) return 'Hechos';
  if (b.includes('rom')) return 'Romanos';
  if (b.includes('1 cor') || b.includes('1cor')) return '1 Corintios';
  if (b.includes('2 cor') || b.includes('2cor')) return '2 Corintios';
  if (b.includes('gal')) return 'Gálatas';
  if (b.includes('efe')) return 'Efesios';
  if (b.includes('col')) return 'Colosenses';
  if (b.includes('heb')) return 'Hebreos';
  if (b.includes('sant') || b.includes('jam')) return 'Santiago';
  if (b.includes('2 ped') || b.includes('2ped')) return '2 Pedro';
  if (b.includes('jud')) return 'Judas';
  if (b.includes('apoc') || b.includes('rev')) return 'Apocalipsis';

  return bookStr.trim();
}

/**
 * Parsea un string de cita bíblica (ej. "Juan 1:1-3", "Génesis 15:6", "Romanos 5:12")
 */
export function parseBiblicalRefString(refStr) {
  if (!refStr || typeof refStr !== 'string') return null;

  const clean = refStr.trim();
  const match = clean.match(/^([1-3]?\s?[A-Za-zÁÉÍÓÚáéíóúÑñ\.\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/);

  if (!match) {
    return { raw: clean, book: clean, chapter: 1, verseStart: 1, verseEnd: null };
  }

  const normBook = normalizeBookName(match[1]);

  return {
    raw: clean,
    book: normBook,
    chapter: parseInt(match[2], 10),
    verseStart: match[3] ? parseInt(match[3], 10) : 1,
    verseEnd: match[4] ? parseInt(match[4], 10) : null
  };
}

/**
 * Consulta el texto RVR1960 exacto de una cita bíblica.
 */
export function getVerseTextRVR1960(book, chapter, verseStart = 1, verseEnd = null) {
  const normBook = normalizeBookName(book);
  const bookData = RVR1960_TEXT_DB[normBook] || RVR1960_TEXT_DB[book];

  if (!bookData) {
    return `"${normBook} capítulo ${chapter}, versículo(s) ${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960)."`;
  }

  const chapData = bookData[String(chapter)];
  if (!chapData) {
    return `"${normBook} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960)."`;
  }

  if (verseEnd && verseEnd > verseStart) {
    const verses = [];
    for (let v = verseStart; v <= verseEnd; v++) {
      if (chapData[String(v)]) {
        verses.push(`${v}. ${chapData[String(v)]}`);
      }
    }
    if (verses.length > 0) return verses.join(' ');
  }

  const singleVerse = chapData[String(verseStart)];
  if (singleVerse) return `${verseStart}. ${singleVerse}`;

  return `"${normBook} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''} (Santa Biblia Reina-Valera 1960)."`;
}
