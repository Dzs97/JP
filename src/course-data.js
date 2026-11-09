// ═══════════════════════════════════════════════════════════════════════
//  CURSO GUIADO (en español) — fases, lecciones, tarjetas y recursos
//  JS plano. Depende de window.HIRAGANA_ROWS / KATAKANA_ROWS (data.js).
//  Exporta: COURSE_PHASES, COURSE_LESSONS, COURSE_LISTENING,
//           COURSE_DAILY_STEPS, COURSE_PASS_PCT, COURSE_CARDS,
//           distractorPoolFor(card)
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const COURSE_PASS_PCT = 70;

  // ── Helpers para crear tarjetas ────────────────────────────────────────
  const mk = (kind, type) => (front, back, romanji, note) => {
    const c = { front, back, romanji, type, kind, course: true };
    if (note) c.note = note;
    return c;
  };
  const w = mk("word", "Palabra");
  const p = mk("phrase", "Expresión");
  const s = mk("sentence", "Oración");

  const EXCLUDED_KANA = new Set(["ぢ", "づ", "ヂ", "ヅ"]);
  const NOTES_KANA = {
    "を": "Se pronuncia «o». Solo se usa como partícula.",
    "ヲ": "Se pronuncia «o». Casi nunca se usa en katakana.",
    "ん": "Una «n» que forma sílaba por sí sola.",
    "ン": "Una «n» que forma sílaba por sí sola.",
    "し": "Suena «shi», como «shh» + i.",
    "シ": "Suena «shi». Sus rayitas son más horizontales que las de ツ.",
    "ツ": "Suena «tsu». Sus rayitas van hacia abajo, a diferencia de シ.",
    "ち": "Suena «chi», como en «chile».",
    "つ": "Suena «tsu», como en «tsunami».",
    "ふ": "Entre «fu» y «ju»: soplando suave, sin morder el labio.",
    "ら": "La r japonesa es suave, como en «pero». Nunca es rr.",
    "じ": "Suena como «yi» suave (inglés «jeep»), no como la jota española.",
    "ジ": "Suena como «yi» suave (inglés «jeep»), no como la jota española.",
  };

  // Genera tarjetas de kana a partir de las filas de data.js
  function kanaFrom(rows, consonants, type) {
    const out = [];
    (rows || []).forEach((r) => {
      if (!consonants.includes(r.consonant)) return;
      r.chars.forEach((ch, i) => {
        if (!ch || EXCLUDED_KANA.has(ch)) return;
        out.push({
          front: ch, back: r.sounds[i], romanji: r.sounds[i],
          type, kind: "kana", course: true,
          ...(NOTES_KANA[ch] ? { note: NOTES_KANA[ch] } : {}),
        });
      });
    });
    return out;
  }
  const H = (cons) => kanaFrom(window.HIRAGANA_ROWS, cons, "Hiragana");
  const K = (cons) => kanaFrom(window.KATAKANA_ROWS, cons, "Katakana");
  const kana = (type) => (front, sound, note) => {
    const c = { front, back: sound, romanji: sound, type, kind: "kana", course: true };
    if (note) c.note = note;
    return c;
  };
  const hk = kana("Hiragana");
  const kk = kana("Katakana");

  // ── Fases ──────────────────────────────────────────────────────────────
  const COURSE_PHASES = [
    { id: 1, title: "Hiragana", jp: "ひらがな",
      desc: "El silabario básico. Con él puedes escribir cualquier palabra japonesa." },
    { id: 2, title: "Katakana", jp: "カタカナ",
      desc: "El silabario de las palabras extranjeras: café, taxi, México…" },
    { id: 3, title: "Bases de N5", jp: "文法の基礎",
      desc: "Gramática y vocabulario esenciales para presentarte y conversar." },
  ];

  // ── Lecciones ──────────────────────────────────────────────────────────
  const COURSE_LESSONS = [
    // ════════════ FASE 1 · HIRAGANA ════════════
    {
      id: "L01", phase: 1, title: "Las 5 vocales", jp: "あいうえお",
      intro: [
        "El japonés se escribe con tres sistemas: hiragana, katakana y kanji. Empezamos por hiragana, porque con él puedes escribir cualquier palabra.",
        "Buena noticia: las vocales suenan exactamente como en español. あ es «a», い es «i», う es «u», え es «e» y お es «o». Nada de las vocales raras del inglés.",
        "La única diferencia: la う se dice con los labios casi relajados, sin redondearlos tanto como en español.",
      ],
      tip: "Escribe cada vocal 5 veces mientras la dices en voz alta. Mano y voz juntas se recuerdan mejor.",
      cards: H(["–"]),
    },
    {
      id: "L02", phase: 1, title: "Filas K y S", jp: "かさ",
      intro: [
        "Casi todo hiragana es consonante + vocal. La fila K es か き く け こ (ka, ki, ku, ke, ko): la k siempre suena como en «casa», nunca como «s».",
        "La fila S es さ し す せ そ. Ojo con し: se dice «shi», no «si».",
        "Ya puedes leer tus primeras palabras: あか (rojo), いえ (casa), すし y あさ (la mañana).",
      ],
      tip: "き tiene dos rayas como una llave (key). さ y き se parecen: さ tiene solo una raya horizontal.",
      cards: [
        ...H(["k", "s"]),
        w("あか", "rojo", "aka"),
        w("いえ", "casa", "ie"),
        w("すし", "sushi", "sushi"),
        w("あさ", "la mañana (temprano)", "asa"),
      ],
    },
    {
      id: "L03", phase: 1, title: "Filas T y N", jp: "たな",
      intro: [
        "La fila T es た ち つ て と. Dos son irregulares: ち se dice «chi» (como en «chile») y つ se dice «tsu» (como en «tsunami»).",
        "La fila N es な に ぬ ね の, sin sorpresas: na, ni, nu, ne, no.",
        "Palabras nuevas: いぬ (perro), ねこ (gato), くち (boca) y なつ (verano).",
      ],
      tip: "ぬ y め se parecen: ぬ tiene un rulito al final. ね y れ también: ね termina en rulito.",
      cards: [
        ...H(["t", "n"]),
        w("いぬ", "perro", "inu"),
        w("ねこ", "gato", "neko"),
        w("くち", "boca", "kuchi"),
        w("なつ", "verano", "natsu"),
      ],
    },
    {
      id: "L04", phase: 1, title: "Filas H y M", jp: "はま",
      intro: [
        "La fila H es は ひ ふ へ ほ. La h japonesa SÍ suena: es como una jota muy suave, una exhalación. ふ se dice entre «fu» y «ju», soplando sin morder el labio.",
        "Importante: cuando は funciona como partícula (marca el tema) se lee «wa». Lo verás en こんにちは y en わたしは.",
        "La fila M es ま み む め も. Palabras: はな (flor), みみ (oreja), ほし (estrella), さかな (pescado).",
      ],
      tip: "ま y ほ se parecen: ほ tiene una raya vertical extra a la izquierda.",
      cards: [
        ...H(["h", "m"]),
        w("はな", "flor", "hana"),
        w("みみ", "oreja", "mimi"),
        w("ほし", "estrella", "hoshi"),
        w("さかな", "pescado", "sakana"),
      ],
    },
    {
      id: "L05", phase: 1, title: "Y, R, W y ん", jp: "やらわん",
      intro: [
        "La fila Y solo tiene tres: や ゆ よ (ya, yu, yo).",
        "La fila R es ら り る れ ろ. La r japonesa es siempre suave, como en «pero» o «cara». Nunca es rr. A veces suena casi como una l: es normal.",
        "わ es «wa». を también se pronuncia «o» y solo se usa como partícula de objeto. ん es una n que forma sílaba sola: ほん (libro) son dos sílabas, ho-n.",
        "Palabras: やま (montaña), よる (noche), ほん (libro), わたし (yo).",
      ],
      tip: "Con esta lección ya conoces los 46 hiragana básicos. ¡Felicidades!",
      cards: [
        ...H(["y", "r", "w", "n*"]),
        w("やま", "montaña", "yama"),
        w("よる", "noche", "yoru"),
        w("ほん", "libro", "hon"),
        w("わたし", "yo", "watashi"),
      ],
    },
    {
      id: "L06", phase: 1, title: "Dakuten y handakuten", jp: "がぱ",
      intro: [
        "Dos rayitas (゛, dakuten) hacen el sonido más «sonoro»: か→が (ga), さ→ざ (za), た→だ (da), は→ば (ba).",
        "Un circulito (゜, handakuten) solo va con la fila H y la convierte en P: は→ぱ (pa).",
        "Ojo: が siempre suena «ga», y ぎ suena «gui» (como en «guitarra»), nunca «ji». じ suena como «yi» suave, no como nuestra jota.",
        "Palabras: ごはん (arroz o comida), かぞく (familia), でんわ (teléfono), えんぴつ (lápiz).",
      ],
      tip: "No memorices los nuevos como letras aparte: piensa «el que ya conozco + rayitas».",
      cards: [
        ...H(["g", "z", "d", "b", "p"]),
        w("ごはん", "arroz / comida", "gohan"),
        w("かぞく", "familia", "kazoku"),
        w("でんわ", "teléfono", "denwa"),
        w("えんぴつ", "lápiz", "enpitsu"),
      ],
    },
    {
      id: "L07", phase: 1, title: "Combinaciones, っ y vocales largas", jp: "きゃ・っ・ー",
      intro: [
        "Un kana de la columna «i» + や/ゆ/よ pequeños forma una sola sílaba: き+ゃ = きゃ (kya), し+ゅ = しゅ (shu), ち+ょ = ちょ (cho). Son 15 combinaciones básicas.",
        "Una つ pequeña (っ) no se pronuncia: es una pausa breve que duplica la consonante siguiente. きって es «kit-te», con un pequeño corte, como si contuvieras el aire.",
        "Las vocales largas duran el doble y cambian el significado: おばさん (tía) y おばあさん (abuela). En hiragana se alargan con otra vocal: おかあさん, がっこう (la «ou» se dice «oo»).",
        "Palabras: きって (estampilla), がっこう (escuela), でんしゃ (tren), おかあさん (mamá), りょこう (viaje).",
      ],
      tip: "Aplaude cada sílaba: が-っ-こ-う son cuatro tiempos, aunque suene «gakkoo».",
      cards: [
        hk("きゃ", "kya"), hk("きゅ", "kyu"), hk("きょ", "kyo"),
        hk("しゃ", "sha"), hk("しゅ", "shu"), hk("しょ", "sho"),
        hk("ちゃ", "cha"), hk("ちゅ", "chu"), hk("ちょ", "cho"),
        hk("にゃ", "nya"), hk("にゅ", "nyu"), hk("にょ", "nyo"),
        hk("ひゃ", "hya"), hk("ひゅ", "hyu"), hk("ひょ", "hyo"),
        w("きって", "estampilla (timbre postal)", "kitte"),
        w("がっこう", "escuela", "gakkou"),
        w("でんしゃ", "tren", "densha"),
        w("おかあさん", "mamá", "okaasan"),
        w("りょこう", "viaje", "ryokou"),
      ],
    },
    {
      id: "L08", phase: 1, title: "Saludos", jp: "あいさつ",
      intro: [
        "Los saludos son frases hechas: apréndelas completas, como bloque, sin analizarlas.",
        "En こんにちは y こんばんは la última は se lee «wa», porque es la partícula de tema.",
        "すみません sirve para casi todo: disculpar, pedir permiso, llamar al mesero o agradecer cuando alguien se tomó una molestia.",
      ],
      tip: "Usa いただきます antes de cada comida esta semana. Es la forma más fácil de practicar todos los días.",
      cards: [
        p("おはようございます", "buenos días (formal)", "ohayou gozaimasu"),
        p("こんにちは", "hola / buenas tardes", "konnichiwa", "La は final se lee «wa»."),
        p("こんばんは", "buenas noches (al llegar)", "konbanwa", "La は final se lee «wa»."),
        p("おやすみなさい", "buenas noches (al irse a dormir)", "oyasuminasai"),
        p("さようなら", "adiós", "sayounara"),
        p("ありがとうございます", "muchas gracias", "arigatou gozaimasu"),
        p("すみません", "disculpe / perdón", "sumimasen"),
        p("はい", "sí", "hai"),
        p("いいえ", "no", "iie"),
        p("はじめまして", "mucho gusto (al conocer a alguien)", "hajimemashite"),
        p("よろしくおねがいします", "encantado; cuento con usted", "yoroshiku onegaishimasu"),
        p("いただきます", "¡provecho! (antes de comer)", "itadakimasu"),
        p("ごちそうさまでした", "gracias por la comida (al terminar)", "gochisousama deshita"),
      ],
    },

    // ════════════ FASE 2 · KATAKANA ════════════
    {
      id: "L09", phase: 2, title: "ア, カ y サ", jp: "アカサ",
      intro: [
        "Katakana tiene los mismos sonidos que hiragana, pero con trazos más rectos y angulosos. Se usa sobre todo para palabras extranjeras, nombres y onomatopeyas.",
        "Varios se parecen a su versión en hiragana: カ/か, キ/き, セ/せ. Aprovecha ese parecido.",
        "Palabras: アイス (helado) y ココア (chocolate caliente).",
      ],
      tip: "Lee los letreros y menús en katakana: casi siempre es una palabra que ya conoces en inglés o español.",
      cards: [
        ...K(["–", "k", "s"]),
        w("アイス", "helado", "aisu"),
        w("ココア", "chocolate caliente", "kokoa"),
      ],
    },
    {
      id: "L10", phase: 2, title: "タ, ナ, ハ y マ", jp: "タナハマ",
      intro: [
        "Cuidado con dos pares que confunden a todos: シ (shi) y ツ (tsu); ソ (so) y ン (n).",
        "En シ y ン los trazos se escriben de abajo hacia arriba, más horizontales. En ツ y ソ caen de arriba hacia abajo, más verticales.",
        "Palabras: トマト (tomate), テニス (tenis), ハム (jamón), ネクタイ (corbata).",
      ],
      tip: "ヘ y へ son prácticamente iguales en los dos silabarios. ¡Uno gratis!",
      cards: [
        ...K(["t", "n", "h", "m"]),
        w("トマト", "tomate (jitomate)", "tomato"),
        w("テニス", "tenis", "tenisu"),
        w("ハム", "jamón", "hamu"),
        w("ネクタイ", "corbata", "nekutai"),
      ],
    },
    {
      id: "L11", phase: 2, title: "ヤ, ラ, ワ y ン", jp: "ヤラワン",
      intro: [
        "Como en hiragana: ヤ ユ ヨ, ラ リ ル レ ロ (r suave, nunca rr), ワ y ン.",
        "Como el japonés casi no tiene consonantes sueltas, las palabras extranjeras se adaptan agregando vocales: hotel → ホテル (hoteru).",
        "Palabras: ホテル (hotel), カメラ (cámara), メロン (melón), ワイン (vino).",
      ],
      tip: "Practica diciendo tu ciudad o tu comida favorita «a la japonesa».",
      cards: [
        ...K(["y", "r", "w", "n*"]),
        w("ホテル", "hotel", "hoteru"),
        w("カメラ", "cámara", "kamera"),
        w("メロン", "melón", "meron"),
        w("ワイン", "vino", "wain"),
      ],
    },
    {
      id: "L12", phase: 2, title: "Dakuten en katakana", jp: "ガパ",
      intro: [
        "Las rayitas y el circulito funcionan igual que en hiragana: カ→ガ, サ→ザ, タ→ダ, ハ→バ y ハ→パ.",
        "Las combinaciones también: シャ, チュ, ジョ… se forman con ャ, ュ, ョ pequeños.",
        "Palabras: バス (autobús), ペン (pluma), パン (pan), ドア (puerta).",
      ],
      tip: "パン viene del portugués «pão». ¡Muchas palabras llegaron con los comerciantes portugueses!",
      cards: [
        ...K(["g", "z", "d", "b", "p"]),
        w("バス", "autobús", "basu"),
        w("ペン", "pluma (bolígrafo)", "pen"),
        w("パン", "pan", "pan"),
        w("ドア", "puerta", "doa"),
      ],
    },
    {
      id: "L13", phase: 2, title: "ー, ッ y sonidos extranjeros", jp: "ー・ッ・ファ",
      intro: [
        "En katakana las vocales largas se marcan con una raya: ー. コーヒー es «koo-hii».",
        "La ッ pequeña funciona igual que っ: una pausa breve. ベッド es «bed-do».",
        "Para sonidos que el japonés no tenía se usan vocales pequeñas: ファ (fa), ティ (ti), ディ (di), フィ (fi), チェ (che), ジェ (je). Así se escribe パーティー (fiesta).",
        "Palabras: コーヒー, ケーキ, ラーメン, タクシー, ベッド, シャツ, パーティー, メキシコ, テレビ.",
      ],
      tip: "¿Cómo se escribe tu nombre? ディエゴ = Di-e-go. Busca el tuyo y escríbelo en katakana.",
      cards: [
        kk("ファ", "fa"), kk("フィ", "fi"), kk("フェ", "fe"), kk("フォ", "fo"),
        kk("ティ", "ti"), kk("ディ", "di"), kk("チェ", "che"), kk("ジェ", "je"),
        w("コーヒー", "café", "koohii"),
        w("ケーキ", "pastel", "keeki"),
        w("ラーメン", "ramen", "raamen"),
        w("タクシー", "taxi", "takushii"),
        w("ベッド", "cama", "beddo"),
        w("シャツ", "camisa", "shatsu"),
        w("パーティー", "fiesta", "paatii"),
        w("メキシコ", "México", "mekishiko"),
        w("テレビ", "televisión", "terebi"),
      ],
    },

    // ════════════ FASE 3 · BASES DE N5 ════════════
    {
      id: "L14", phase: 3, title: "A は B です", jp: "〜は〜です",
      intro: [
        "La oración más básica del japonés: A は B です = «A es B». わたしは学生です = «Yo soy estudiante».",
        "は (se lee «wa») marca el tema: «en cuanto a A…». です al final es el «ser/estar» cortés.",
        "En japonés no hay artículos (el, un) ni plural obligatorio. Y el sujeto se omite mucho: si ya se sabe que hablas de ti, basta con 学生です.",
        "さん se agrega al nombre de otras personas (como «Sr./Sra.»), nunca al tuyo.",
      ],
      tip: "Empiezan los kanji. Debajo de cada palabra verás su lectura en hiragana: léela siempre en voz alta.",
      cards: [
        w("学生", "estudiante", "gakusei", "がくせい"),
        w("先生", "maestro / profesor", "sensei", "せんせい"),
        w("会社員", "empleado de oficina", "kaishain", "かいしゃいん"),
        w("日本人", "japonés (persona)", "nihonjin", "にほんじん"),
        w("メキシコ人", "mexicano (persona)", "mekishikojin", "メキシコじん"),
        s("わたしはディエゴです。", "Yo soy Diego.", "watashi wa diego desu"),
        s("わたしは学生です。", "Yo soy estudiante.", "watashi wa gakusei desu", "わたしはがくせいです。"),
        s("田中さんは先生です。", "El señor Tanaka es maestro.", "tanaka-san wa sensei desu", "たなかさんはせんせいです。"),
        s("わたしはメキシコ人です。", "Soy mexicano.", "watashi wa mekishikojin desu", "わたしはメキシコじんです。"),
      ],
    },
    {
      id: "L15", phase: 3, title: "Negación, preguntas y «también»", jp: "じゃありません・か・も",
      intro: [
        "Para negar, cambia です por じゃありません: 医者じゃありません = «No soy médico».",
        "Para preguntar, agrega か al final: 日本人ですか = «¿Es japonés?». No hace falta invertir el orden ni usar signos; la か ya es el signo de interrogación.",
        "も significa «también» y reemplaza a は: マリアさんも学生です = «María también es estudiante».",
      ],
      tip: "Para responder, はい = sí, いいえ = no. Y いいえ, ちがいます = «no, no es así».",
      cards: [
        w("医者", "médico", "isha", "いしゃ"),
        w("エンジニア", "ingeniero", "enjinia"),
        w("アメリカ人", "estadounidense (persona)", "amerikajin", "アメリカじん"),
        s("わたしは医者じゃありません。", "No soy médico.", "watashi wa isha ja arimasen", "わたしはいしゃじゃありません。"),
        s("田中さんは日本人ですか。", "¿El señor Tanaka es japonés?", "tanaka-san wa nihonjin desu ka", "たなかさんはにほんじんですか。"),
        s("はい、日本人です。", "Sí, es japonés.", "hai, nihonjin desu", "はい、にほんじんです。"),
        s("マリアさんも学生です。", "María también es estudiante.", "maria-san mo gakusei desu", "マリアさんもがくせいです。"),
        s("ジョンさんはエンジニアじゃありません。", "John no es ingeniero.", "jon-san wa enjinia ja arimasen"),
      ],
    },
    {
      id: "L16", phase: 3, title: "Esto, eso, aquello y の", jp: "これ・それ・あれ・の",
      intro: [
        "これ = esto (cerca de mí), それ = eso (cerca de ti), あれ = aquello (lejos de los dos). Funcionan solos: これはかばんです.",
        "Si van antes de un sustantivo cambian a この, その, あの: この時計 = «este reloj».",
        "の une dos sustantivos, casi siempre como «de»: わたしのかさ = «mi paraguas» (el paraguas de mí). ¡Ojo, el orden es al revés que en español! 田中さんの車 = «el coche del señor Tanaka».",
      ],
      tip: "Señala objetos de tu casa y di これは〜です con las palabras que ya sabes.",
      cards: [
        w("これ", "esto", "kore"),
        w("それ", "eso", "sore"),
        w("あれ", "aquello", "are"),
        w("この", "este / esta (+ sustantivo)", "kono"),
        w("かばん", "bolsa / mochila", "kaban"),
        w("かさ", "paraguas", "kasa"),
        w("時計", "reloj", "tokei", "とけい"),
        w("車", "coche / carro", "kuruma", "くるま"),
        s("これはかばんです。", "Esto es una bolsa.", "kore wa kaban desu"),
        s("それはわたしのかさです。", "Eso es mi paraguas.", "sore wa watashi no kasa desu"),
        s("あれは田中さんの車です。", "Aquel es el coche del señor Tanaka.", "are wa tanaka-san no kuruma desu", "あれはたなかさんのくるまです。"),
        s("この時計はわたしのです。", "Este reloj es mío.", "kono tokei wa watashi no desu", "このとけいはわたしのです。"),
      ],
    },
    {
      id: "L17", phase: 3, title: "Números y precios", jp: "いくら",
      intro: [
        "Del 1 al 10: いち, に, さん, よん, ご, ろく, なな, はち, きゅう, じゅう. El 4 y el 7 tienen dos lecturas (し/よん, しち/なな); usa よん y なな, que evitan confusiones.",
        "Los números se arman como bloques: 11 = じゅういち (10+1), 20 = にじゅう (2×10), 300 = さんびゃく. 百 = 100 y 千 = 1,000.",
        "Para comprar: これはいくらですか = «¿Cuánto cuesta esto?». Y para pedir: 〜をください = «deme…, por favor». を se pronuncia «o».",
      ],
      tip: "Cuenta en japonés cada vez que subas escaleras o laves los platos.",
      cards: [
        w("一", "uno (1)", "ichi", "いち"),
        w("二", "dos (2)", "ni", "に"),
        w("三", "tres (3)", "san", "さん"),
        w("四", "cuatro (4)", "yon", "よん / し"),
        w("五", "cinco (5)", "go", "ご"),
        w("六", "seis (6)", "roku", "ろく"),
        w("七", "siete (7)", "nana", "なな / しち"),
        w("八", "ocho (8)", "hachi", "はち"),
        w("九", "nueve (9)", "kyuu", "きゅう / く"),
        w("十", "diez (10)", "juu", "じゅう"),
        w("百", "cien (100)", "hyaku", "ひゃく"),
        w("千", "mil (1,000)", "sen", "せん"),
        w("円", "yen (moneda)", "en", "えん"),
        w("いくら", "¿cuánto cuesta?", "ikura"),
        s("これはいくらですか。", "¿Cuánto cuesta esto?", "kore wa ikura desu ka"),
        s("三百円です。", "Son 300 yenes.", "sanbyaku en desu", "さんびゃくえんです。"),
        s("コーヒーをください。", "Un café, por favor.", "koohii o kudasai"),
        s("このケーキをください。", "Deme este pastel, por favor.", "kono keeki o kudasai"),
      ],
    },
    {
      id: "L18", phase: 3, title: "La hora y los días", jp: "なんじ・ようび",
      intro: [
        "Para la hora agrega 時 (じ): 三時 = las tres. «Y media» es 半 (はん): 三時半. ¿Qué hora es? = 今、何時ですか.",
        "Ojo con tres horas irregulares: 四時 es よじ, 七時 es しちじ y 九時 es くじ.",
        "Los días terminan en 曜日 (ようび): 月曜日 (lunes) … 日曜日 (domingo). Cada uno lleva un elemento: luna, fuego, agua, árbol, oro, tierra y sol.",
      ],
      tip: "Cada mañana di en voz alta qué día es: 今日は〜曜日です.",
      cards: [
        w("今", "ahora", "ima", "いま"),
        w("何時", "¿qué hora?", "nanji", "なんじ"),
        w("半", "y media", "han", "はん"),
        w("今日", "hoy", "kyou", "きょう"),
        w("明日", "mañana (el día siguiente)", "ashita", "あした"),
        w("昨日", "ayer", "kinou", "きのう"),
        w("休み", "descanso / día libre", "yasumi", "やすみ"),
        w("月曜日", "lunes", "getsuyoubi", "げつようび"),
        w("火曜日", "martes", "kayoubi", "かようび"),
        w("水曜日", "miércoles", "suiyoubi", "すいようび"),
        w("木曜日", "jueves", "mokuyoubi", "もくようび"),
        w("金曜日", "viernes", "kin'youbi", "きんようび"),
        w("土曜日", "sábado", "doyoubi", "どようび"),
        w("日曜日", "domingo", "nichiyoubi", "にちようび"),
        s("今、何時ですか。", "¿Qué hora es?", "ima, nanji desu ka", "いま、なんじですか。"),
        s("三時半です。", "Son las tres y media.", "sanji han desu", "さんじはんです。"),
        s("今日は月曜日です。", "Hoy es lunes.", "kyou wa getsuyoubi desu", "きょうはげつようびです。"),
        s("明日は休みです。", "Mañana es mi día libre.", "ashita wa yasumi desu", "あしたはやすみです。"),
      ],
    },
    {
      id: "L19", phase: 3, title: "Verbos en ます: を, に, へ", jp: "〜ます",
      intro: [
        "La forma ます es la forma cortés de los verbos y sirve para presente y futuro: 食べます = «como» o «comeré».",
        "El verbo va SIEMPRE al final de la oración. わたしはすしを食べます = «yo sushi como».",
        "を (se lee «o») marca el objeto: すしを食べます. へ (se lee «e») marca la dirección: 日本へ行きます. に marca el momento o el destino: 七時に帰ります = «regreso a las siete».",
      ],
      tip: "Repite: を se lee «o», へ se lee «e», は se lee «wa». Son las tres partículas «tramposas».",
      cards: [
        w("食べます", "comer", "tabemasu", "たべます"),
        w("飲みます", "beber / tomar", "nomimasu", "のみます"),
        w("行きます", "ir", "ikimasu", "いきます"),
        w("来ます", "venir", "kimasu", "きます"),
        w("帰ります", "regresar (a casa)", "kaerimasu", "かえります"),
        w("見ます", "ver / mirar", "mimasu", "みます"),
        w("毎日", "todos los días", "mainichi", "まいにち"),
        s("わたしはすしを食べます。", "Yo como sushi.", "watashi wa sushi o tabemasu", "わたしはすしをたべます。"),
        s("毎日コーヒーを飲みます。", "Tomo café todos los días.", "mainichi koohii o nomimasu", "まいにちコーヒーをのみます。"),
        s("日本へ行きます。", "Voy a ir a Japón.", "nihon e ikimasu", "にほんへいきます。"),
        s("七時にうちへ帰ります。", "Regreso a casa a las siete.", "shichiji ni uchi e kaerimasu", "しちじにうちへかえります。"),
        s("テレビを見ます。", "Veo la televisión.", "terebi o mimasu", "テレビをみます。"),
      ],
    },
    {
      id: "L20", phase: 3, title: "Negativo y pasado", jp: "ません・ました",
      intro: [
        "Con la forma ます solo cambias la terminación: 食べます (como) → 食べません (no como) → 食べました (comí) → 食べませんでした (no comí).",
        "No hay más tiempos verbales que aprender aquí: el japonés solo distingue pasado y no-pasado.",
        "します (hacer) se pega a muchos sustantivos: 勉強します = estudiar, 仕事します = trabajar.",
      ],
      tip: "Cada noche di tres cosas que hiciste hoy con 〜ました.",
      cards: [
        w("勉強します", "estudiar", "benkyou shimasu", "べんきょうします"),
        w("起きます", "levantarse / despertar", "okimasu", "おきます"),
        w("寝ます", "dormir / acostarse", "nemasu", "ねます"),
        w("先週", "la semana pasada", "senshuu", "せんしゅう"),
        w("映画", "película", "eiga", "えいが"),
        w("日本語", "idioma japonés", "nihongo", "にほんご"),
        s("お酒を飲みません。", "No tomo alcohol.", "osake o nomimasen", "おさけをのみません。"),
        s("昨日、日本語を勉強しました。", "Ayer estudié japonés.", "kinou, nihongo o benkyou shimashita", "きのう、にほんごをべんきょうしました。"),
        s("先週、映画を見ませんでした。", "La semana pasada no vi películas.", "senshuu, eiga o mimasen deshita", "せんしゅう、えいがをみませんでした。"),
        s("六時に起きました。", "Me levanté a las seis.", "rokuji ni okimashita", "ろくじにおきました。"),
      ],
    },
    {
      id: "L21", phase: 3, title: "で y と", jp: "で・と",
      intro: [
        "で marca DÓNDE ocurre una acción: レストランで食べます = «como en un restaurante». También marca el MEDIO: バスで行きます = «voy en autobús».",
        "と significa «con» (una persona): 友だちと行きます = «voy con un amigo». Entre sustantivos significa «y»: パンとコーヒー.",
        "Diferencia clave: に es el destino o el lugar donde algo está; で es el lugar donde algo pasa.",
      ],
      tip: "Describe tu trayecto diario: 〜で会社へ行きます.",
      cards: [
        w("駅", "estación de tren", "eki", "えき"),
        w("レストラン", "restaurante", "resutoran"),
        w("図書館", "biblioteca", "toshokan", "としょかん"),
        w("友だち", "amigo / amiga", "tomodachi", "ともだち"),
        w("一人で", "solo (sin compañía)", "hitori de", "ひとりで"),
        s("レストランで晩ごはんを食べます。", "Ceno en un restaurante.", "resutoran de bangohan o tabemasu", "レストランでばんごはんをたべます。"),
        s("友だちと図書館へ行きます。", "Voy a la biblioteca con un amigo.", "tomodachi to toshokan e ikimasu", "ともだちととしょかんへいきます。"),
        s("バスで駅へ行きます。", "Voy a la estación en autobús.", "basu de eki e ikimasu", "バスでえきへいきます。"),
        s("一人で映画を見ました。", "Vi una película solo.", "hitori de eiga o mimashita", "ひとりでえいがをみました。"),
      ],
    },
    {
      id: "L22", phase: 3, title: "Adjetivos い", jp: "〜い",
      intro: [
        "Los adjetivos い terminan en い y se conjugan solos, como si fueran verbos.",
        "Negativo: cambia la い final por くない: 高い → 高くない (no es caro). Pasado: い → かった: 高かった (era caro).",
        "La gran excepción es いい (bueno): se conjuga desde よい → よくない, よかった. Nunca «いくない».",
        "Para ser cortés agrega です: おいしいです, 高くないです, 暑かったです.",
      ],
      tip: "En el pasado el です no cambia: es 暑かったです, no «暑いでした».",
      cards: [
        w("高い", "caro / alto", "takai", "たかい"),
        w("安い", "barato", "yasui", "やすい"),
        w("おいしい", "rico / sabroso", "oishii"),
        w("大きい", "grande", "ookii", "おおきい"),
        w("小さい", "pequeño", "chiisai", "ちいさい"),
        w("暑い", "caluroso (clima)", "atsui", "あつい"),
        w("いい", "bueno", "ii", "Irregular: よくない, よかった."),
        s("このラーメンはおいしいです。", "Este ramen está muy rico.", "kono raamen wa oishii desu"),
        s("このカメラは高くないです。", "Esta cámara no es cara.", "kono kamera wa takakunai desu", "このカメラはたかくないです。"),
        s("昨日は暑かったです。", "Ayer hizo calor.", "kinou wa atsukatta desu", "きのうはあつかったです。"),
        s("天気はよかったです。", "El clima estuvo bueno.", "tenki wa yokatta desu", "てんきはよかったです。"),
      ],
    },
    {
      id: "L23", phase: 3, title: "Adjetivos な y 〜が好き", jp: "〜な・すき",
      intro: [
        "Los adjetivos な se comportan como sustantivos: 静かです, 静かじゃありません. Antes de un sustantivo llevan な: 静かな町 = «un pueblo tranquilo».",
        "Trampa: きれい (bonito, limpio) termina en い pero es adjetivo な: きれいな花.",
        "好き (gustar) es adjetivo な. Lo que te gusta se marca con が: わたしはすしが好きです = «me gusta el sushi». Igual con 嫌い (no gustar).",
      ],
      tip: "Haz una lista de 5 cosas que te gustan y 5 que no, con 〜が好きです / 〜が好きじゃありません.",
      cards: [
        w("好き", "que gusta / favorito", "suki", "すき"),
        w("嫌い", "que no gusta / odiado", "kirai", "きらい"),
        w("静か", "tranquilo / silencioso", "shizuka", "しずか"),
        w("きれい", "bonito / limpio", "kirei", "Adjetivo な aunque termina en い."),
        w("元気", "sano / con energía", "genki", "げんき"),
        w("有名", "famoso", "yuumei", "ゆうめい"),
        w("町", "pueblo / ciudad", "machi", "まち"),
        s("わたしはすしが好きです。", "Me gusta el sushi.", "watashi wa sushi ga suki desu", "わたしはすしがすきです。"),
        s("この町は静かです。", "Este pueblo es tranquilo.", "kono machi wa shizuka desu", "このまちはしずかです。"),
        s("きれいな花ですね。", "Qué flor tan bonita, ¿verdad?", "kirei na hana desu ne", "きれいなはなですね。"),
        s("ラーメンはあまり好きじゃありません。", "No me gusta mucho el ramen.", "raamen wa amari suki ja arimasen", "ラーメンはあまりすきじゃありません。"),
      ],
    },
    {
      id: "L24", phase: 3, title: "あります, います y posiciones", jp: "ある・いる",
      intro: [
        "Para decir «hay» o «está» el japonés usa dos verbos: あります para cosas y plantas, います para personas y animales.",
        "Estructura: [lugar] に [cosa] が あります. 机の上に本があります = «sobre el escritorio hay un libro».",
        "Las posiciones se dicen con の: 机の上 (sobre el escritorio), テーブルの下 (debajo de la mesa), かばんの中 (dentro de la bolsa), 駅の前 (frente a la estación).",
      ],
      tip: "¿Se mueve solo? います. ¿No se mueve? あります.",
      cards: [
        w("あります", "hay / estar (cosas)", "arimasu"),
        w("います", "hay / estar (personas, animales)", "imasu"),
        w("上", "arriba / encima", "ue", "うえ"),
        w("下", "abajo / debajo", "shita", "した"),
        w("中", "dentro", "naka", "なか"),
        w("前", "delante / enfrente", "mae", "まえ"),
        w("後ろ", "detrás", "ushiro", "うしろ"),
        w("隣", "al lado", "tonari", "となり"),
        w("机", "escritorio", "tsukue", "つくえ"),
        s("机の上に本があります。", "Hay un libro sobre el escritorio.", "tsukue no ue ni hon ga arimasu", "つくえのうえにほんがあります。"),
        s("犬はテーブルの下にいます。", "El perro está debajo de la mesa.", "inu wa teeburu no shita ni imasu", "いぬはテーブルのしたにいます。"),
        s("かばんの中に何がありますか。", "¿Qué hay dentro de la bolsa?", "kaban no naka ni nani ga arimasu ka", "かばんのなかになにがありますか。"),
        s("駅の前に銀行があります。", "Hay un banco frente a la estación.", "eki no mae ni ginkou ga arimasu", "えきのまえにぎんこうがあります。"),
      ],
    },
    {
      id: "L25", phase: 3, title: "Querer: たい, ほしい y お願いします", jp: "〜たい・ほしい",
      intro: [
        "«Quiero HACER algo»: quita ます y pon たい. 行きます → 行きたいです = «quiero ir». Se conjuga como adjetivo い: 行きたくないです.",
        "«Quiero TENER algo»: [cosa] が ほしいです. 新しいパソコンがほしいです.",
        "Para pedir algo en una tienda o restaurante: [cosa] を お願いします. Es un poco más suave que をください.",
      ],
      tip: "Evita preguntar a un superior 〜たいですか: suena muy directo. Con amigos está bien.",
      cards: [
        w("〜たい", "querer (hacer algo)", "~tai"),
        w("ほしい", "querer (tener algo)", "hoshii"),
        w("お願いします", "por favor (al pedir algo)", "onegaishimasu", "おねがいします"),
        w("新しい", "nuevo", "atarashii", "あたらしい"),
        w("パソコン", "computadora", "pasokon"),
        w("何", "qué", "nani / nan", "なに / なん"),
        s("日本へ行きたいです。", "Quiero ir a Japón.", "nihon e ikitai desu", "にほんへいきたいです。"),
        s("新しいパソコンがほしいです。", "Quiero una computadora nueva.", "atarashii pasokon ga hoshii desu", "あたらしいパソコンがほしいです。"),
        s("水をお願いします。", "Agua, por favor.", "mizu o onegaishimasu", "みずをおねがいします。"),
        s("何を食べたいですか。", "¿Qué quieres comer?", "nani o tabetai desu ka", "なにをたべたいですか。"),
      ],
    },
    {
      id: "L26", phase: 3, title: "La forma て", jp: "〜て",
      intro: [
        "La forma て sirve para pedir (〜てください), para acciones en curso (〜ています) y para unir oraciones.",
        "Verbos que terminan en «-eru/-iru» del grupo 2 (食べます, 見ます): quita ます y pon て → 食べて, 見て.",
        "Grupo 1, según la sílaba antes de ます: い・ち・り → って (待ちます → 待って); み・び・に → んで (読みます → 読んで); き → いて (書きます → 書いて); ぎ → いで; し → して (話します → 話して). Excepción: 行きます → 行って.",
        "Irregulares: します → して, 来ます → 来て.",
      ],
      tip: "Canta las reglas: «i-chi-ri tte, mi-bi-ni nde, ki ite, gi ide, shi shite». Funciona.",
      cards: [
        w("待ちます", "esperar", "machimasu", "まちます → まって"),
        w("書きます", "escribir", "kakimasu", "かきます → かいて"),
        w("話します", "hablar", "hanashimasu", "はなします → はなして"),
        w("読みます", "leer", "yomimasu", "よみます → よんで"),
        w("住みます", "vivir (en un lugar)", "sumimasu", "すみます → すんで"),
        w("ゆっくり", "despacio", "yukkuri"),
        w("もう一度", "otra vez", "mou ichido", "もういちど"),
        s("ちょっと待ってください。", "Espere un momento, por favor.", "chotto matte kudasai", "ちょっとまってください。"),
        s("もう一度言ってください。", "Repítalo, por favor.", "mou ichido itte kudasai", "もういちどいってください。"),
        s("ゆっくり話してください。", "Hable despacio, por favor.", "yukkuri hanashite kudasai", "ゆっくりはなしてください。"),
        s("今、日本語を勉強しています。", "Ahora estoy estudiando japonés.", "ima, nihongo o benkyou shite imasu", "いま、にほんごをべんきょうしています。"),
        s("メキシコシティに住んでいます。", "Vivo en la Ciudad de México.", "mekishiko shiti ni sunde imasu", "メキシコシティにすんでいます。"),
      ],
    },
    {
      id: "L27", phase: 3, title: "Invitar y rechazar con amabilidad", jp: "〜ませんか・〜ましょう",
      intro: [
        "Para invitar se usa la forma negativa como pregunta: 映画を見ませんか = «¿no quieres ver una película?». Suena más amable que preguntar directo.",
        "Para aceptar o proponer: 〜ましょう = «hagámoslo». 見ましょう = «veámosla».",
        "En Japón casi nunca se dice «no» directo. Se rechaza con ちょっと… (un poco…) y se deja la frase sin terminar: 週末はちょっと… = «el fin de semana es que…». El otro entiende.",
      ],
      tip: "Si te dicen ちょっと…, no insistas: es un «no» educado.",
      cards: [
        w("いっしょに", "juntos", "issho ni"),
        w("週末", "fin de semana", "shuumatsu", "しゅうまつ"),
        w("ちょっと…", "es que… (rechazo amable)", "chotto…"),
        p("いいですね", "¡qué buena idea!", "ii desu ne"),
        p("ざんねんです", "qué lástima", "zannen desu"),
        p("また今度", "a la próxima", "mata kondo", "またこんど"),
        s("いっしょに映画を見ませんか。", "¿Vemos una película juntos?", "issho ni eiga o mimasen ka", "いっしょにえいがをみませんか。"),
        s("いいですね。見ましょう。", "¡Buena idea! Veámosla.", "ii desu ne. mimashou", "いいですね。みましょう。"),
        s("週末はちょっと…。", "El fin de semana es que… (no puedo).", "shuumatsu wa chotto…", "しゅうまつはちょっと…。"),
        s("少し休みましょう。", "Descansemos un poco.", "sukoshi yasumimashou", "すこしやすみましょう。"),
      ],
    },
    {
      id: "L28", phase: 3, title: "Tu presentación personal", jp: "じこしょうかい",
      intro: [
        "La presentación personal (自己紹介, じこしょうかい) tiene una fórmula fija: はじめまして → tu nombre → de dónde eres → a qué te dedicas → どうぞよろしくお願いします.",
        "〜から来ました = «vengo de…». 仕事は〜です = «mi trabajo es…». 趣味は〜です = «mi pasatiempo es…».",
        "Ensáyala en voz alta hasta decirla de corrido y sin leer. ¡Es la frase que más vas a usar en Japón!",
      ],
      tip: "Grábate diciendo tu presentación completa y compárala con el audio ▶ de cada oración.",
      cards: [
        w("仕事", "trabajo", "shigoto", "しごと"),
        w("リクルーター", "reclutador", "rikuruutaa"),
        w("趣味", "pasatiempo", "shumi", "しゅみ"),
        w("下手", "malo para algo", "heta", "へた"),
        w("〜から", "desde / de (origen)", "~kara"),
        s("はじめまして。", "Mucho gusto.", "hajimemashite"),
        s("ディエゴです。", "Soy Diego.", "diego desu"),
        s("メキシコから来ました。", "Vengo de México.", "mekishiko kara kimashita", "メキシコからきました。"),
        s("仕事はリクルーターです。", "Trabajo como reclutador.", "shigoto wa rikuruutaa desu", "しごとはリクルーターです。"),
        s("趣味は日本語の勉強です。", "Mi pasatiempo es estudiar japonés.", "shumi wa nihongo no benkyou desu", "しゅみはにほんごのべんきょうです。"),
        s("日本語はまだ下手です。", "Mi japonés todavía no es bueno.", "nihongo wa mada heta desu", "にほんごはまだへたです。"),
        s("どうぞよろしくお願いします。", "Encantado de conocerle.", "douzo yoroshiku onegaishimasu", "どうぞよろしくおねがいします。"),
      ],
    },
  ];

  // Marca cada tarjeta con su lección
  COURSE_LESSONS.forEach((L) => { L.cards = L.cards.map((c) => ({ ...c, lesson: L.id })); });
  const COURSE_CARDS = COURSE_LESSONS.flatMap((L) => L.cards);

  // ── Recursos de escucha por fase ───────────────────────────────────────
  const COURSE_LISTENING = {
    1: [{ label: "Tofugu · Aprende hiragana (con audio)", url: "https://www.tofugu.com/japanese/learn-hiragana/" }],
    2: [{ label: "Tofugu · Aprende katakana (con audio)", url: "https://tofugu.com/japanese/learn-katakana" }],
    3: [
      { label: "CI Japanese · videos de input comprensible", url: "https://cijapanese.com/" },
      { label: "Podcast: Nihongo con Teppei for Beginners", url: "https://podcasts.apple.com/podcast/id1471500012" },
    ],
  };

  // ── Plan diario (~60 min) ──────────────────────────────────────────────
  const COURSE_DAILY_STEPS = [
    { id: "review", n: 1, title: "Repaso",        min: 15, desc: "Las tarjetas del curso que tocan hoy." },
    { id: "lesson", n: 2, title: "Lección nueva", min: 20, desc: "Tarjetas y examen de la siguiente lección." },
    { id: "listen", n: 3, title: "Escucha",       min: 15, desc: "Entrena el oído con lo que ya viste." },
    { id: "speak",  n: 4, title: "Habla",         min: 10, desc: "Shadowing: escucha y repite en voz alta." },
  ];

  // ── Distractores para quiz / listen ────────────────────────────────────
  const groupOf = (c) => (c.kind === "kana" ? "kana" : c.kind === "sentence" ? "sentence" : "word");
  const poolCache = {};
  function distractorPoolFor(card) {
    if (!card || !card.course) return window.ALL_CARDS;
    const g = groupOf(card);
    if (!poolCache[g]) {
      const seen = new Set();
      poolCache[g] = COURSE_CARDS.filter((c) => {
        if (groupOf(c) !== g || seen.has(c.back)) return false;
        seen.add(c.back);
        return true;
      });
    }
    return poolCache[g];
  }

  Object.assign(window, {
    COURSE_PHASES, COURSE_LESSONS, COURSE_LISTENING, COURSE_DAILY_STEPS,
    COURSE_PASS_PCT, COURSE_CARDS, distractorPoolFor,
  });
})();
