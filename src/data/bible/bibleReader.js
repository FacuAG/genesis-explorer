/**
 * Motor de Lectura Bíblica y Consulta de Versículos (Reina-Valera 1960).
 * Proporciona búsqueda rápida O(1) de pasajes del Génesis y referencias del Nuevo Testamento.
 */

// Base de datos integrada de pasajes bíblicos RVR1960 frecuentes y clave del Antiguo y Nuevo Testamento
const RVR1960_TEXT_DB = {
  "Génesis": {
    "1": {
      "1": "En el principio creó Dios los cielos y la tierra.",
      "2": "Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.",
      "3": "Y dijo Dios: Sea la luz; y fue la luz.",
      "4": "Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.",
      "5": "Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.",
      "26": "Entonces dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; y señoree en los peces del mar, en las aves de los cielos, en las bestias, en toda la tierra, y en todo animal que se arrastra sobre la tierra.",
      "27": "Y creó Dios al hombre a su imagen, a imagen de Dios lo creó; varón y hembra los creó.",
      "28": "Y los bendijo Dios, y les dijo: Fructificad y multiplicaos; llenad la tierra, y sojuzgadla, y señoread en los peces del mar, en las aves de los cielos, y en todas las bestias que se mueven sobre la tierra."
    },
    "2": {
      "7": "Entonces Jehová Dios formó al hombre del polvo de la tierra, y sopló en su nariz aliento de vida, y fue el hombre un ser viviente.",
      "15": "Tomó, pues, Jehová Dios al hombre, y lo puso en el huerto de Edén, para que lo labrara y lo guardase.",
      "16": "Y mandó Jehová Dios al hombre, diciendo: De todo árbol del huerto podrás comer;",
      "17": "mas del árbol de la ciencia del bien y del mal no comerás; porque el día que de él comieres, ciertamente morirás.",
      "24": "Por tanto, dejará el hombre a su padre y a su madre, y se unirá a su mujer, y serán una sola carne."
    },
    "3": {
      "15": "Y pondré enemistad entre ti y la mujer, y entre tu simiente y la simiente suya; ésta te herirá en la cabeza, y tú le herirás en el calcañar.",
      "19": "Con el sudor de tu rostro comerás el pan hasta que vuelvas a la tierra, porque de ella fuiste tomado; pues polvo eres, y al polvo volverás."
    },
    "9": {
      "6": "El que derramare sangre de hombre, por el hombre su sangre será derramada; porque a imagen de Dios es hecho el hombre.",
      "11": "Estableceré mi pacto con vosotros, y no exterminaré ya más toda carne con aguas de diluvio, ni habrá más diluvio para destruir la tierra.",
      "13": "Mi arco he puesto en las nubes, el cual será por señal del pacto entre mí y la tierra."
    },
    "12": {
      "1": "Pero Jehová había dicho a Abram: Vete de tu tierra y de tu parentela, y de la casa de tu padre, a la tierra que te mostraré.",
      "2": "Y haré de ti una nación grande, y te bendeciré, y engrandeceré tu nombre, y serás bendición.",
      "3": "Bendeciré a los que te bendijeren, y a los que te maldijeren maldeciré; y serán benditas en ti todas las familias de la tierra."
    },
    "15": {
      "6": "Y creyó a Jehová, y le fue contado por justicia."
    },
    "49": {
      "10": "No será quitado el cetro de Judá, ni el legislador de entre sus pies, hasta que venga Shiloh; y a él se congregarán los pueblos."
    },
    "50": {
      "20": "Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien, para hacer lo que vemos hoy, para mantener en vida a mucho pueblo."
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
  "Romanos": {
    "4": {
      "3": "Porque ¿qué dice la Escritura? Creyó Abraham a Dios, y le fue contado por justicia."
    },
    "5": {
      "12": "Por tanto, como el pecado entró en el mundo por un hombre, y por el pecado la muerte, así la muerte pasó a todos los hombres, por cuanto todos pecaron.",
      "19": "Porque así como por la desobediencia de un hombre los muchos fueron constituidos pecadores, así también por la obediencia de uno, los muchos serán constituidos justos."
    },
    "8": {
      "28": "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados."
    }
  },
  "Gálatas": {
    "3": {
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
      "16": "Porque en él fueron creadas todas las cosas, las que hay en los cielos y las que hay en la tierra, visibles e invisibles; sean tronos, sean dominios, sean principados, sean potestades; todo fue creado por medio de él y para él.",
      "17": "Y él es antes de todas las cosas, y todas las cosas en él subsisten;"
    }
  },
  "Hebreos": {
    "1": {
      "1": "Dios, habiendo hablado muchas veces y de muchas maneras en otro tiempo a los padres por los profetas,",
      "2": "en estos postreros días nos ha hablado por el Hijo, a quien constituyó heredero de todo, y por quien asimismo hizo el universo;"
    },
    "11": {
      "1": "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.",
      "3": "Por la fe entendemos haber sido constituido el universo por la palabra de Dios, de modo que lo que se ve fue hecho de lo que no se veía.",
      "4": "Por la fe Abel ofreció a Dios más excelente sacrificio que Caín, por lo cual alcanzó testimonio de que era justo, dando Dios testimonio de sus ofrendas; y muerto, aún habla por ella.",
      "8": "Por la fe Abraham, siendo llamado, obedeció para salir al lugar que había de recibir como herencia; y salió sin saber a dónde iba."
    }
  },
  "Apocalipsis": {
    "4": {
      "11": "Señor, digno eres de recibir la gloria y la honra y el poder; porque tú creaste todas las cosas, y por tu voluntad existen y fueron creadas."
    },
    "22": {
      "13": "Yo soy el Alfa y la Omega, el principio y el fin, el primero y el último."
    }
  }
};

/**
 * Parsea un string de cita bíblica (ej. "Juan 1:1-3", "Génesis 15:6", "Romanos 5:12")
 * y devuelve un objeto estructurado.
 */
export function parseBiblicalRefString(refStr) {
  if (!refStr || typeof refStr !== 'string') return null;

  const clean = refStr.trim();
  // Regex para emparejar: "[Nombre Libro] [Capítulo]:[VersículoInicio]-[VersículoFin]"
  const match = clean.match(/^([1-3]?\s?[A-Za-zÁÉÍÓÚáéíóúÑñ]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/);
  
  if (!match) {
    return { raw: clean, book: clean, chapter: 1, verseStart: 1, verseEnd: null };
  }

  return {
    raw: clean,
    book: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verseStart: match[3] ? parseInt(match[3], 10) : 1,
    verseEnd: match[4] ? parseInt(match[4], 10) : null
  };
}

/**
 * Consulta el texto RVR1960 exacto de una cita bíblica.
 */
export function getVerseTextRVR1960(book, chapter, verseStart = 1, verseEnd = null) {
  const bookData = RVR1960_TEXT_DB[book];
  if (!bookData) return null;

  const chapData = bookData[String(chapter)];
  if (!chapData) return null;

  if (verseEnd && verseEnd > verseStart) {
    const verses = [];
    for (let v = verseStart; v <= verseEnd; v++) {
      if (chapData[String(v)]) {
        verses.push(`${v}. ${chapData[String(v)]}`);
      }
    }
    return verses.length > 0 ? verses.join(' ') : null;
  }

  const singleVerse = chapData[String(verseStart)];
  return singleVerse ? `${verseStart}. ${singleVerse}` : null;
}
