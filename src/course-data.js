// ═══════════════════════════════════════════════════════════════════════
//  GUIDED COURSE — phases, lessons, cards and listening resources
//  Plain JS. Depends on window.HIRAGANA_ROWS / KATAKANA_ROWS (data.js).
//  Exports: COURSE_PHASES, COURSE_LESSONS, COURSE_LISTENING,
//           COURSE_DAILY_STEPS, COURSE_PASS_PCT, COURSE_CARDS,
//           distractorPoolFor(card)
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const COURSE_PASS_PCT = 70;

  // ── Card helpers ───────────────────────────────────────────────────────
  const mk = (kind, type) => (front, back, romanji, note) => {
    const c = { front, back, romanji, type, kind, course: true };
    if (note) c.note = note;
    return c;
  };
  const w = mk("word", "Word");
  const p = mk("phrase", "Phrase");
  const s = mk("sentence", "Sentence");

  const EXCLUDED_KANA = new Set(["ぢ", "づ", "ヂ", "ヅ"]);
  const NOTES_KANA = {
    "を": "Pronounced “o”. Only used as a particle.",
    "ヲ": "Pronounced “o”. Almost never used in katakana.",
    "ん": "An “n” that is a syllable on its own.",
    "ン": "An “n” that is a syllable on its own.",
    "し": "Sounds like “shi”, as in “she”.",
    "シ": "Sounds like “shi”. Its strokes are flatter than those of ツ.",
    "ツ": "Sounds like “tsu”. Its strokes fall downward, unlike シ.",
    "ち": "Sounds like “chi”, as in “cheese”.",
    "つ": "Sounds like “tsu”, as in “tsunami”.",
    "ふ": "Between “fu” and “hu”: blow softly, without biting your lip.",
    "ら": "The Japanese r is a soft tap, like the Spanish “pero”. Never rolled.",
    "じ": "Sounds like “ji” in “jeep”.",
    "ジ": "Sounds like “ji” in “jeep”.",
  };

  // Builds kana cards from the rows in data.js
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

  // ── Phases ─────────────────────────────────────────────────────────────
  const COURSE_PHASES = [
    { id: 1, title: "Hiragana", jp: "ひらがな",
      desc: "The basic syllabary. With it you can write any Japanese word." },
    { id: 2, title: "Katakana", jp: "カタカナ",
      desc: "The syllabary for foreign words: coffee, taxi, Mexico…" },
    { id: 3, title: "N5 basics", jp: "文法の基礎",
      desc: "Essential grammar and vocabulary to introduce yourself and hold a conversation." },
  ];

  // ── Lessons ────────────────────────────────────────────────────────────
  const COURSE_LESSONS = [
    // ════════════ PHASE 1 · HIRAGANA ════════════
    {
      id: "L01", phase: 1, title: "The 5 vowels", jp: "あいうえお",
      intro: [
        "Japanese uses three writing systems: hiragana, katakana and kanji. We start with hiragana, because you can write any word with it.",
        "Good news: the vowels sound exactly like Spanish vowels. あ is “a”, い is “i”, う is “u”, え is “e” and お is “o”. Short and clean, none of the gliding English vowels.",
        "The only difference: う is said with relaxed lips, not as rounded as the Spanish “u”.",
      ],
      tip: "Write each vowel 5 times while saying it out loud. Hand and voice together stick better.",
      cards: H(["–"]),
    },
    {
      id: "L02", phase: 1, title: "K and S rows", jp: "かさ",
      intro: [
        "Almost all hiragana are consonant + vowel. The K row is か き く け こ (ka, ki, ku, ke, ko): the k is always hard, as in “kite”.",
        "The S row is さ し す せ そ. Watch out for し: it's “shi”, not “si”.",
        "You can already read your first words: あか (red), いえ (house), すし (sushi) and あさ (morning).",
      ],
      tip: "き has two bars, like a key. さ and き look alike: さ has only one horizontal bar.",
      cards: [
        ...H(["k", "s"]),
        w("あか", "red", "aka"),
        w("いえ", "house", "ie"),
        w("すし", "sushi", "sushi"),
        w("あさ", "morning", "asa"),
      ],
    },
    {
      id: "L03", phase: 1, title: "T and N rows", jp: "たな",
      intro: [
        "The T row is た ち つ て と. Two are irregular: ち is “chi” (as in “cheese”) and つ is “tsu” (as in “tsunami”).",
        "The N row is な に ぬ ね の, no surprises: na, ni, nu, ne, no.",
        "New words: いぬ (dog), ねこ (cat), くち (mouth) and なつ (summer).",
      ],
      tip: "ぬ and め look alike: ぬ has a little loop at the end. Same with ね and れ: ね ends in a loop.",
      cards: [
        ...H(["t", "n"]),
        w("いぬ", "dog", "inu"),
        w("ねこ", "cat", "neko"),
        w("くち", "mouth", "kuchi"),
        w("なつ", "summer", "natsu"),
      ],
    },
    {
      id: "L04", phase: 1, title: "H and M rows", jp: "はま",
      intro: [
        "The H row is は ひ ふ へ ほ. The h is a soft breath, like the English “h”. ふ is between “fu” and “hu”: blow softly without biting your lip.",
        "Important: when は is used as a particle (marking the topic) it's read “wa”. You'll see it in こんにちは and わたしは.",
        "The M row is ま み む め も. Words: はな (flower), みみ (ear), ほし (star), さかな (fish).",
      ],
      tip: "ま and ほ look alike: ほ has an extra vertical stroke on the left.",
      cards: [
        ...H(["h", "m"]),
        w("はな", "flower", "hana"),
        w("みみ", "ear", "mimi"),
        w("ほし", "star", "hoshi"),
        w("さかな", "fish", "sakana"),
      ],
    },
    {
      id: "L05", phase: 1, title: "Y, R, W and ん", jp: "やらわん",
      intro: [
        "The Y row has only three: や ゆ よ (ya, yu, yo).",
        "The R row is ら り る れ ろ. The Japanese r is always a soft tap, like the Spanish “pero” or “cara”. Never a rolled rr. Sometimes it sounds almost like an l: that's normal.",
        "わ is “wa”. を is also pronounced “o” and is only used as the object particle. ん is an n that forms its own syllable: ほん (book) is two beats, ho-n.",
        "Words: やま (mountain), よる (night), ほん (book), わたし (I, me).",
      ],
      tip: "With this lesson you know all 46 basic hiragana. Congratulations!",
      cards: [
        ...H(["y", "r", "w", "n*"]),
        w("やま", "mountain", "yama"),
        w("よる", "night", "yoru"),
        w("ほん", "book", "hon"),
        w("わたし", "I / me", "watashi"),
      ],
    },
    {
      id: "L06", phase: 1, title: "Dakuten and handakuten", jp: "がぱ",
      intro: [
        "Two little marks (゛, dakuten) make the sound “voiced”: か→が (ga), さ→ざ (za), た→だ (da), は→ば (ba).",
        "A small circle (゜, handakuten) only goes on the H row and turns it into P: は→ぱ (pa).",
        "Note: が is always a hard “ga”, and ぎ is “gi” as in “gift”, never “ji”. じ sounds like “ji” in “jeep”.",
        "Words: ごはん (rice / meal), かぞく (family), でんわ (phone), えんぴつ (pencil).",
      ],
      tip: "Don't memorize these as new letters: think “the one I already know + marks”.",
      cards: [
        ...H(["g", "z", "d", "b", "p"]),
        w("ごはん", "rice / meal", "gohan"),
        w("かぞく", "family", "kazoku"),
        w("でんわ", "phone", "denwa"),
        w("えんぴつ", "pencil", "enpitsu"),
      ],
    },
    {
      id: "L07", phase: 1, title: "Combinations, っ and long vowels", jp: "きゃ・っ・ー",
      intro: [
        "A kana from the “i” column + a small や/ゆ/よ makes a single syllable: き+ゃ = きゃ (kya), し+ゅ = しゅ (shu), ち+ょ = ちょ (cho). There are 15 basic combinations.",
        "A small つ (っ) isn't pronounced: it's a short pause that doubles the next consonant. きって is “kit-te”, with a tiny stop, as if holding your breath.",
        "Long vowels last twice as long and change the meaning: おばさん (aunt) vs. おばあさん (grandmother). In hiragana you lengthen them with another vowel: おかあさん, がっこう (“ou” is said “oo”).",
        "Words: きって (stamp), がっこう (school), でんしゃ (train), おかあさん (mom), りょこう (trip).",
      ],
      tip: "Clap each beat: が-っ-こ-う is four beats, even though it sounds like “gakkoo”.",
      cards: [
        hk("きゃ", "kya"), hk("きゅ", "kyu"), hk("きょ", "kyo"),
        hk("しゃ", "sha"), hk("しゅ", "shu"), hk("しょ", "sho"),
        hk("ちゃ", "cha"), hk("ちゅ", "chu"), hk("ちょ", "cho"),
        hk("にゃ", "nya"), hk("にゅ", "nyu"), hk("にょ", "nyo"),
        hk("ひゃ", "hya"), hk("ひゅ", "hyu"), hk("ひょ", "hyo"),
        w("きって", "postage stamp", "kitte"),
        w("がっこう", "school", "gakkou"),
        w("でんしゃ", "train", "densha"),
        w("おかあさん", "mom", "okaasan"),
        w("りょこう", "trip / travel", "ryokou"),
      ],
    },
    {
      id: "L08", phase: 1, title: "Greetings", jp: "あいさつ",
      intro: [
        "Greetings are set phrases: learn them whole, as a block, without analyzing them.",
        "In こんにちは and こんばんは the final は is read “wa”, because it's the topic particle.",
        "すみません works for almost everything: apologizing, asking permission, calling the waiter, or thanking someone who went out of their way.",
      ],
      tip: "Say いただきます before every meal this week. It's the easiest way to practice every day.",
      cards: [
        p("おはようございます", "good morning (polite)", "ohayou gozaimasu"),
        p("こんにちは", "hello / good afternoon", "konnichiwa", "The final は is read “wa”."),
        p("こんばんは", "good evening", "konbanwa", "The final は is read “wa”."),
        p("おやすみなさい", "good night (before bed)", "oyasuminasai"),
        p("さようなら", "goodbye", "sayounara"),
        p("ありがとうございます", "thank you very much", "arigatou gozaimasu"),
        p("すみません", "excuse me / sorry", "sumimasen"),
        p("はい", "yes", "hai"),
        p("いいえ", "no", "iie"),
        p("はじめまして", "nice to meet you (first time)", "hajimemashite"),
        p("よろしくおねがいします", "pleased to meet you; I'm in your care", "yoroshiku onegaishimasu"),
        p("いただきます", "let's eat (before a meal)", "itadakimasu"),
        p("ごちそうさまでした", "thanks for the meal (after eating)", "gochisousama deshita"),
      ],
    },

    // ════════════ PHASE 2 · KATAKANA ════════════
    {
      id: "L09", phase: 2, title: "ア, カ and サ", jp: "アカサ",
      intro: [
        "Katakana has the same sounds as hiragana, but with straighter, more angular strokes. It's used mostly for foreign words, names and sound effects.",
        "Several look like their hiragana version: カ/か, キ/き, セ/せ. Use that resemblance.",
        "Words: アイス (ice cream) and ココア (hot chocolate).",
      ],
      tip: "Read signs and menus in katakana: it's almost always a word you already know in English or Spanish.",
      cards: [
        ...K(["–", "k", "s"]),
        w("アイス", "ice cream", "aisu"),
        w("ココア", "hot chocolate", "kokoa"),
      ],
    },
    {
      id: "L10", phase: 2, title: "タ, ナ, ハ and マ", jp: "タナハマ",
      intro: [
        "Watch out for two pairs that confuse everyone: シ (shi) vs. ツ (tsu), and ソ (so) vs. ン (n).",
        "In シ and ン the strokes go from bottom to top and are flatter. In ツ and ソ they fall from top to bottom and are more vertical.",
        "Words: トマト (tomato), テニス (tennis), ハム (ham), ネクタイ (necktie).",
      ],
      tip: "ヘ and へ are practically identical in both syllabaries. A free one!",
      cards: [
        ...K(["t", "n", "h", "m"]),
        w("トマト", "tomato", "tomato"),
        w("テニス", "tennis", "tenisu"),
        w("ハム", "ham", "hamu"),
        w("ネクタイ", "necktie", "nekutai"),
      ],
    },
    {
      id: "L11", phase: 2, title: "ヤ, ラ, ワ and ン", jp: "ヤラワン",
      intro: [
        "Same as hiragana: ヤ ユ ヨ, ラ リ ル レ ロ (soft tap r, never rolled), ワ and ン.",
        "Since Japanese has almost no standalone consonants, foreign words get extra vowels: hotel → ホテル (hoteru).",
        "Words: ホテル (hotel), カメラ (camera), メロン (melon), ワイン (wine).",
      ],
      tip: "Practice saying your city or favorite food “the Japanese way”.",
      cards: [
        ...K(["y", "r", "w", "n*"]),
        w("ホテル", "hotel", "hoteru"),
        w("カメラ", "camera", "kamera"),
        w("メロン", "melon", "meron"),
        w("ワイン", "wine", "wain"),
      ],
    },
    {
      id: "L12", phase: 2, title: "Dakuten in katakana", jp: "ガパ",
      intro: [
        "The marks and the circle work exactly like in hiragana: カ→ガ, サ→ザ, タ→ダ, ハ→バ and ハ→パ.",
        "Combinations too: シャ, チュ, ジョ… are made with small ャ, ュ, ョ.",
        "Words: バス (bus), ペン (pen), パン (bread), ドア (door).",
      ],
      tip: "パン comes from Portuguese “pão”. Many words arrived with Portuguese traders!",
      cards: [
        ...K(["g", "z", "d", "b", "p"]),
        w("バス", "bus", "basu"),
        w("ペン", "pen", "pen"),
        w("パン", "bread", "pan"),
        w("ドア", "door", "doa"),
      ],
    },
    {
      id: "L13", phase: 2, title: "ー, ッ and foreign sounds", jp: "ー・ッ・ファ",
      intro: [
        "In katakana long vowels are marked with a dash: ー. コーヒー is “koo-hii”.",
        "A small ッ works just like っ: a short pause. ベッド is “bed-do”.",
        "For sounds Japanese didn't have, small vowels are used: ファ (fa), ティ (ti), ディ (di), フィ (fi), チェ (che), ジェ (je). That's how パーティー (party) is written.",
        "Words: コーヒー, ケーキ, ラーメン, タクシー, ベッド, シャツ, パーティー, メキシコ, テレビ.",
      ],
      tip: "How is your name written? ディエゴ = Di-e-go. Look up yours and write it in katakana.",
      cards: [
        kk("ファ", "fa"), kk("フィ", "fi"), kk("フェ", "fe"), kk("フォ", "fo"),
        kk("ティ", "ti"), kk("ディ", "di"), kk("チェ", "che"), kk("ジェ", "je"),
        w("コーヒー", "coffee", "koohii"),
        w("ケーキ", "cake", "keeki"),
        w("ラーメン", "ramen", "raamen"),
        w("タクシー", "taxi", "takushii"),
        w("ベッド", "bed", "beddo"),
        w("シャツ", "shirt", "shatsu"),
        w("パーティー", "party", "paatii"),
        w("メキシコ", "Mexico", "mekishiko"),
        w("テレビ", "TV", "terebi"),
      ],
    },

    // ════════════ PHASE 3 · N5 BASICS ════════════
    {
      id: "L14", phase: 3, title: "A は B です", jp: "〜は〜です",
      intro: [
        "The most basic Japanese sentence: A は B です = “A is B”. わたしは学生です = “I am a student”.",
        "は (read “wa”) marks the topic: “as for A…”. です at the end is the polite “to be”.",
        "Japanese has no articles (a, the) and no required plural. And the subject is often dropped: if it's clear you're talking about yourself, 学生です is enough.",
        "さん is added to other people's names (like “Mr./Ms.”), never to your own.",
      ],
      tip: "Kanji start here. Under each word you'll see its reading in hiragana: always read it out loud.",
      cards: [
        w("学生", "student", "gakusei", "がくせい"),
        w("先生", "teacher", "sensei", "せんせい"),
        w("会社員", "office worker", "kaishain", "かいしゃいん"),
        w("日本人", "Japanese (person)", "nihonjin", "にほんじん"),
        w("メキシコ人", "Mexican (person)", "mekishikojin", "メキシコじん"),
        s("わたしはディエゴです。", "I am Diego.", "watashi wa diego desu"),
        s("わたしは学生です。", "I am a student.", "watashi wa gakusei desu", "わたしはがくせいです。"),
        s("田中さんは先生です。", "Mr. Tanaka is a teacher.", "tanaka-san wa sensei desu", "たなかさんはせんせいです。"),
        s("わたしはメキシコ人です。", "I am Mexican.", "watashi wa mekishikojin desu", "わたしはメキシコじんです。"),
      ],
    },
    {
      id: "L15", phase: 3, title: "Negatives, questions and “also”", jp: "じゃありません・か・も",
      intro: [
        "To make it negative, change です to じゃありません: 医者じゃありません = “I'm not a doctor”.",
        "To ask a question, add か at the end: 日本人ですか = “Is he Japanese?”. No need to change the word order; か is the question mark.",
        "も means “also” and replaces は: マリアさんも学生です = “María is also a student”.",
      ],
      tip: "To answer: はい = yes, いいえ = no. And いいえ、ちがいます = “no, that's not right”.",
      cards: [
        w("医者", "doctor", "isha", "いしゃ"),
        w("エンジニア", "engineer", "enjinia"),
        w("アメリカ人", "American (person)", "amerikajin", "アメリカじん"),
        s("わたしは医者じゃありません。", "I am not a doctor.", "watashi wa isha ja arimasen", "わたしはいしゃじゃありません。"),
        s("田中さんは日本人ですか。", "Is Mr. Tanaka Japanese?", "tanaka-san wa nihonjin desu ka", "たなかさんはにほんじんですか。"),
        s("はい、日本人です。", "Yes, he is Japanese.", "hai, nihonjin desu", "はい、にほんじんです。"),
        s("マリアさんも学生です。", "María is also a student.", "maria-san mo gakusei desu", "マリアさんもがくせいです。"),
        s("ジョンさんはエンジニアじゃありません。", "John is not an engineer.", "jon-san wa enjinia ja arimasen"),
      ],
    },
    {
      id: "L16", phase: 3, title: "This, that, that over there and の", jp: "これ・それ・あれ・の",
      intro: [
        "これ = this (near me), それ = that (near you), あれ = that over there (far from both). They stand alone: これはかばんです.",
        "Before a noun they change to この, その, あの: この時計 = “this watch”.",
        "の links two nouns, usually like “'s” or “of”: わたしのかさ = “my umbrella”. 田中さんの車 = “Mr. Tanaka's car”. Same order as English “'s”.",
      ],
      tip: "Point at things around your home and say これは〜です with the words you know.",
      cards: [
        w("これ", "this (one)", "kore"),
        w("それ", "that (one, near you)", "sore"),
        w("あれ", "that (one) over there", "are"),
        w("この", "this (+ noun)", "kono"),
        w("かばん", "bag", "kaban"),
        w("かさ", "umbrella", "kasa"),
        w("時計", "watch / clock", "tokei", "とけい"),
        w("車", "car", "kuruma", "くるま"),
        s("これはかばんです。", "This is a bag.", "kore wa kaban desu"),
        s("それはわたしのかさです。", "That is my umbrella.", "sore wa watashi no kasa desu"),
        s("あれは田中さんの車です。", "That over there is Mr. Tanaka's car.", "are wa tanaka-san no kuruma desu", "あれはたなかさんのくるまです。"),
        s("この時計はわたしのです。", "This watch is mine.", "kono tokei wa watashi no desu", "このとけいはわたしのです。"),
      ],
    },
    {
      id: "L17", phase: 3, title: "Numbers and prices", jp: "いくら",
      intro: [
        "From 1 to 10: いち, に, さん, よん, ご, ろく, なな, はち, きゅう, じゅう. 4 and 7 have two readings (し/よん, しち/なな); use よん and なな, which avoid confusion.",
        "Numbers are built like blocks: 11 = じゅういち (10+1), 20 = にじゅう (2×10), 300 = さんびゃく. 百 = 100 and 千 = 1,000.",
        "To shop: これはいくらですか = “How much is this?”. To order: 〜をください = “…, please”. を is pronounced “o”.",
      ],
      tip: "Count in Japanese whenever you climb stairs or wash the dishes.",
      cards: [
        w("一", "one (1)", "ichi", "いち"),
        w("二", "two (2)", "ni", "に"),
        w("三", "three (3)", "san", "さん"),
        w("四", "four (4)", "yon", "よん / し"),
        w("五", "five (5)", "go", "ご"),
        w("六", "six (6)", "roku", "ろく"),
        w("七", "seven (7)", "nana", "なな / しち"),
        w("八", "eight (8)", "hachi", "はち"),
        w("九", "nine (9)", "kyuu", "きゅう / く"),
        w("十", "ten (10)", "juu", "じゅう"),
        w("百", "hundred (100)", "hyaku", "ひゃく"),
        w("千", "thousand (1,000)", "sen", "せん"),
        w("円", "yen (currency)", "en", "えん"),
        w("いくら", "how much?", "ikura"),
        s("これはいくらですか。", "How much is this?", "kore wa ikura desu ka"),
        s("三百円です。", "It's 300 yen.", "sanbyaku en desu", "さんびゃくえんです。"),
        s("コーヒーをください。", "A coffee, please.", "koohii o kudasai"),
        s("このケーキをください。", "This cake, please.", "kono keeki o kudasai"),
      ],
    },
    {
      id: "L18", phase: 3, title: "Time and days of the week", jp: "なんじ・ようび",
      intro: [
        "For the time add 時 (じ): 三時 = three o'clock. “Half past” is 半 (はん): 三時半. What time is it? = 今、何時ですか.",
        "Watch out for three irregular hours: 四時 is よじ, 七時 is しちじ and 九時 is くじ.",
        "Days end in 曜日 (ようび): 月曜日 (Monday) … 日曜日 (Sunday). Each carries an element: moon, fire, water, wood, gold, earth and sun.",
      ],
      tip: "Every morning say out loud what day it is: 今日は〜曜日です.",
      cards: [
        w("今", "now", "ima", "いま"),
        w("何時", "what time?", "nanji", "なんじ"),
        w("半", "half past", "han", "はん"),
        w("今日", "today", "kyou", "きょう"),
        w("明日", "tomorrow", "ashita", "あした"),
        w("昨日", "yesterday", "kinou", "きのう"),
        w("休み", "day off / break", "yasumi", "やすみ"),
        w("月曜日", "Monday", "getsuyoubi", "げつようび"),
        w("火曜日", "Tuesday", "kayoubi", "かようび"),
        w("水曜日", "Wednesday", "suiyoubi", "すいようび"),
        w("木曜日", "Thursday", "mokuyoubi", "もくようび"),
        w("金曜日", "Friday", "kin'youbi", "きんようび"),
        w("土曜日", "Saturday", "doyoubi", "どようび"),
        w("日曜日", "Sunday", "nichiyoubi", "にちようび"),
        s("今、何時ですか。", "What time is it now?", "ima, nanji desu ka", "いま、なんじですか。"),
        s("三時半です。", "It's half past three.", "sanji han desu", "さんじはんです。"),
        s("今日は月曜日です。", "Today is Monday.", "kyou wa getsuyoubi desu", "きょうはげつようびです。"),
        s("明日は休みです。", "Tomorrow is my day off.", "ashita wa yasumi desu", "あしたはやすみです。"),
      ],
    },
    {
      id: "L19", phase: 3, title: "ます verbs: を, に, へ", jp: "〜ます",
      intro: [
        "The ます form is the polite form of verbs and covers present and future: 食べます = “I eat” or “I will eat”.",
        "The verb ALWAYS goes at the end of the sentence. わたしはすしを食べます = “I sushi eat”.",
        "を (read “o”) marks the object: すしを食べます. へ (read “e”) marks direction: 日本へ行きます. に marks a time or destination: 七時に帰ります = “I go home at seven”.",
      ],
      tip: "Repeat: を is read “o”, へ is read “e”, は is read “wa”. They're the three “trick” particles.",
      cards: [
        w("食べます", "to eat", "tabemasu", "たべます"),
        w("飲みます", "to drink", "nomimasu", "のみます"),
        w("行きます", "to go", "ikimasu", "いきます"),
        w("来ます", "to come", "kimasu", "きます"),
        w("帰ります", "to go home / return", "kaerimasu", "かえります"),
        w("見ます", "to see / watch", "mimasu", "みます"),
        w("毎日", "every day", "mainichi", "まいにち"),
        s("わたしはすしを食べます。", "I eat sushi.", "watashi wa sushi o tabemasu", "わたしはすしをたべます。"),
        s("毎日コーヒーを飲みます。", "I drink coffee every day.", "mainichi koohii o nomimasu", "まいにちコーヒーをのみます。"),
        s("日本へ行きます。", "I'm going to Japan.", "nihon e ikimasu", "にほんへいきます。"),
        s("七時にうちへ帰ります。", "I go home at seven.", "shichiji ni uchi e kaerimasu", "しちじにうちへかえります。"),
        s("テレビを見ます。", "I watch TV.", "terebi o mimasu", "テレビをみます。"),
      ],
    },
    {
      id: "L20", phase: 3, title: "Negative and past", jp: "ません・ました",
      intro: [
        "With the ます form you only change the ending: 食べます (I eat) → 食べません (I don't eat) → 食べました (I ate) → 食べませんでした (I didn't eat).",
        "There are no other tenses to learn here: Japanese only distinguishes past and non-past.",
        "します (to do) attaches to many nouns: 勉強します = to study, 仕事します = to work.",
      ],
      tip: "Every night say three things you did today using 〜ました.",
      cards: [
        w("勉強します", "to study", "benkyou shimasu", "べんきょうします"),
        w("起きます", "to wake up / get up", "okimasu", "おきます"),
        w("寝ます", "to sleep / go to bed", "nemasu", "ねます"),
        w("先週", "last week", "senshuu", "せんしゅう"),
        w("映画", "movie", "eiga", "えいが"),
        w("日本語", "Japanese (language)", "nihongo", "にほんご"),
        s("お酒を飲みません。", "I don't drink alcohol.", "osake o nomimasen", "おさけをのみません。"),
        s("昨日、日本語を勉強しました。", "Yesterday I studied Japanese.", "kinou, nihongo o benkyou shimashita", "きのう、にほんごをべんきょうしました。"),
        s("先週、映画を見ませんでした。", "I didn't watch any movies last week.", "senshuu, eiga o mimasen deshita", "せんしゅう、えいがをみませんでした。"),
        s("六時に起きました。", "I got up at six.", "rokuji ni okimashita", "ろくじにおきました。"),
      ],
    },
    {
      id: "L21", phase: 3, title: "で and と", jp: "で・と",
      intro: [
        "で marks WHERE an action happens: レストランで食べます = “I eat at a restaurant”. It also marks the MEANS: バスで行きます = “I go by bus”.",
        "と means “with” (a person): 友だちと行きます = “I go with a friend”. Between nouns it means “and”: パンとコーヒー.",
        "Key difference: に is the destination or where something exists; で is where something happens.",
      ],
      tip: "Describe your daily commute: 〜で会社へ行きます.",
      cards: [
        w("駅", "train station", "eki", "えき"),
        w("レストラン", "restaurant", "resutoran"),
        w("図書館", "library", "toshokan", "としょかん"),
        w("友だち", "friend", "tomodachi", "ともだち"),
        w("一人で", "alone / by myself", "hitori de", "ひとりで"),
        s("レストランで晩ごはんを食べます。", "I have dinner at a restaurant.", "resutoran de bangohan o tabemasu", "レストランでばんごはんをたべます。"),
        s("友だちと図書館へ行きます。", "I go to the library with a friend.", "tomodachi to toshokan e ikimasu", "ともだちととしょかんへいきます。"),
        s("バスで駅へ行きます。", "I go to the station by bus.", "basu de eki e ikimasu", "バスでえきへいきます。"),
        s("一人で映画を見ました。", "I watched a movie by myself.", "hitori de eiga o mimashita", "ひとりでえいがをみました。"),
      ],
    },
    {
      id: "L22", phase: 3, title: "い adjectives", jp: "〜い",
      intro: [
        "い adjectives end in い and conjugate on their own, as if they were verbs.",
        "Negative: change the final い to くない: 高い → 高くない (not expensive). Past: い → かった: 高かった (was expensive).",
        "The big exception is いい (good): it conjugates from よい → よくない, よかった. Never “いくない”.",
        "To be polite add です: おいしいです, 高くないです, 暑かったです.",
      ],
      tip: "In the past tense です doesn't change: it's 暑かったです, not “暑いでした”.",
      cards: [
        w("高い", "expensive / tall", "takai", "たかい"),
        w("安い", "cheap", "yasui", "やすい"),
        w("おいしい", "delicious", "oishii"),
        w("大きい", "big", "ookii", "おおきい"),
        w("小さい", "small", "chiisai", "ちいさい"),
        w("暑い", "hot (weather)", "atsui", "あつい"),
        w("いい", "good", "ii", "Irregular: よくない, よかった."),
        s("このラーメンはおいしいです。", "This ramen is delicious.", "kono raamen wa oishii desu"),
        s("このカメラは高くないです。", "This camera isn't expensive.", "kono kamera wa takakunai desu", "このカメラはたかくないです。"),
        s("昨日は暑かったです。", "It was hot yesterday.", "kinou wa atsukatta desu", "きのうはあつかったです。"),
        s("天気はよかったです。", "The weather was good.", "tenki wa yokatta desu", "てんきはよかったです。"),
      ],
    },
    {
      id: "L23", phase: 3, title: "な adjectives and 〜が好き", jp: "〜な・すき",
      intro: [
        "な adjectives behave like nouns: 静かです, 静かじゃありません. Before a noun they take な: 静かな町 = “a quiet town”.",
        "Trap: きれい (pretty, clean) ends in い but is a な adjective: きれいな花.",
        "好き (to like) is a な adjective. What you like is marked with が: わたしはすしが好きです = “I like sushi”. Same with 嫌い (to dislike).",
      ],
      tip: "Make a list of 5 things you like and 5 you don't, with 〜が好きです / 〜が好きじゃありません.",
      cards: [
        w("好き", "liked / favorite", "suki", "すき"),
        w("嫌い", "disliked", "kirai", "きらい"),
        w("静か", "quiet", "shizuka", "しずか"),
        w("きれい", "pretty / clean", "kirei", "A な adjective even though it ends in い."),
        w("元気", "healthy / energetic", "genki", "げんき"),
        w("有名", "famous", "yuumei", "ゆうめい"),
        w("町", "town", "machi", "まち"),
        s("わたしはすしが好きです。", "I like sushi.", "watashi wa sushi ga suki desu", "わたしはすしがすきです。"),
        s("この町は静かです。", "This town is quiet.", "kono machi wa shizuka desu", "このまちはしずかです。"),
        s("きれいな花ですね。", "What a pretty flower.", "kirei na hana desu ne", "きれいなはなですね。"),
        s("ラーメンはあまり好きじゃありません。", "I don't really like ramen.", "raamen wa amari suki ja arimasen", "ラーメンはあまりすきじゃありません。"),
      ],
    },
    {
      id: "L24", phase: 3, title: "あります, います and positions", jp: "ある・いる",
      intro: [
        "To say “there is” or “is (located)” Japanese uses two verbs: あります for things and plants, います for people and animals.",
        "Pattern: [place] に [thing] が あります. 机の上に本があります = “there's a book on the desk”.",
        "Positions use の: 机の上 (on the desk), テーブルの下 (under the table), かばんの中 (inside the bag), 駅の前 (in front of the station).",
      ],
      tip: "Does it move on its own? います. Doesn't move? あります.",
      cards: [
        w("あります", "there is / to be (things)", "arimasu"),
        w("います", "there is / to be (people, animals)", "imasu"),
        w("上", "on / above", "ue", "うえ"),
        w("下", "under / below", "shita", "した"),
        w("中", "inside", "naka", "なか"),
        w("前", "in front", "mae", "まえ"),
        w("後ろ", "behind", "ushiro", "うしろ"),
        w("隣", "next to", "tonari", "となり"),
        w("机", "desk", "tsukue", "つくえ"),
        s("机の上に本があります。", "There's a book on the desk.", "tsukue no ue ni hon ga arimasu", "つくえのうえにほんがあります。"),
        s("犬はテーブルの下にいます。", "The dog is under the table.", "inu wa teeburu no shita ni imasu", "いぬはテーブルのしたにいます。"),
        s("かばんの中に何がありますか。", "What's inside the bag?", "kaban no naka ni nani ga arimasu ka", "かばんのなかになにがありますか。"),
        s("駅の前に銀行があります。", "There's a bank in front of the station.", "eki no mae ni ginkou ga arimasu", "えきのまえにぎんこうがあります。"),
      ],
    },
    {
      id: "L25", phase: 3, title: "Wanting: たい, ほしい and お願いします", jp: "〜たい・ほしい",
      intro: [
        "“I want to DO something”: drop ます and add たい. 行きます → 行きたいです = “I want to go”. It conjugates like an い adjective: 行きたくないです.",
        "“I want to HAVE something”: [thing] が ほしいです. 新しいパソコンがほしいです.",
        "To ask for something in a shop or restaurant: [thing] を お願いします. It's a bit softer than をください.",
      ],
      tip: "Avoid asking a superior 〜たいですか: it sounds too direct. With friends it's fine.",
      cards: [
        w("〜たい", "want to (do)", "~tai"),
        w("ほしい", "want (to have)", "hoshii"),
        w("お願いします", "please (when asking for something)", "onegaishimasu", "おねがいします"),
        w("新しい", "new", "atarashii", "あたらしい"),
        w("パソコン", "computer", "pasokon"),
        w("何", "what", "nani / nan", "なに / なん"),
        s("日本へ行きたいです。", "I want to go to Japan.", "nihon e ikitai desu", "にほんへいきたいです。"),
        s("新しいパソコンがほしいです。", "I want a new computer.", "atarashii pasokon ga hoshii desu", "あたらしいパソコンがほしいです。"),
        s("水をお願いします。", "Water, please.", "mizu o onegaishimasu", "みずをおねがいします。"),
        s("何を食べたいですか。", "What do you want to eat?", "nani o tabetai desu ka", "なにをたべたいですか。"),
      ],
    },
    {
      id: "L26", phase: 3, title: "The て form", jp: "〜て",
      intro: [
        "The て form is used for requests (〜てください), ongoing actions (〜ています) and linking sentences.",
        "Group 2 verbs ending in “-eru/-iru” (食べます, 見ます): drop ます and add て → 食べて, 見て.",
        "Group 1, based on the syllable before ます: い・ち・り → って (待ちます → 待って); み・び・に → んで (読みます → 読んで); き → いて (書きます → 書いて); ぎ → いで; し → して (話します → 話して). Exception: 行きます → 行って.",
        "Irregular: します → して, 来ます → 来て.",
      ],
      tip: "Sing the rules: “i-chi-ri tte, mi-bi-ni nde, ki ite, gi ide, shi shite”. It works.",
      cards: [
        w("待ちます", "to wait", "machimasu", "まちます → まって"),
        w("書きます", "to write", "kakimasu", "かきます → かいて"),
        w("話します", "to speak", "hanashimasu", "はなします → はなして"),
        w("読みます", "to read", "yomimasu", "よみます → よんで"),
        w("住みます", "to live (somewhere)", "sumimasu", "すみます → すんで"),
        w("ゆっくり", "slowly", "yukkuri"),
        w("もう一度", "once more", "mou ichido", "もういちど"),
        s("ちょっと待ってください。", "Please wait a moment.", "chotto matte kudasai", "ちょっとまってください。"),
        s("もう一度言ってください。", "Please say that again.", "mou ichido itte kudasai", "もういちどいってください。"),
        s("ゆっくり話してください。", "Please speak slowly.", "yukkuri hanashite kudasai", "ゆっくりはなしてください。"),
        s("今、日本語を勉強しています。", "I'm studying Japanese right now.", "ima, nihongo o benkyou shite imasu", "いま、にほんごをべんきょうしています。"),
        s("メキシコシティに住んでいます。", "I live in Mexico City.", "mekishiko shiti ni sunde imasu", "メキシコシティにすんでいます。"),
      ],
    },
    {
      id: "L27", phase: 3, title: "Inviting and declining politely", jp: "〜ませんか・〜ましょう",
      intro: [
        "To invite, use the negative form as a question: 映画を見ませんか = “Won't you watch a movie (with me)?”. It sounds softer than asking directly.",
        "To accept or suggest: 〜ましょう = “let's”. 見ましょう = “let's watch it”.",
        "In Japan people rarely say “no” directly. You decline with ちょっと… (a little…) and leave the sentence unfinished: 週末はちょっと… = “the weekend is a bit…”. The other person understands.",
      ],
      tip: "If someone says ちょっと…, don't insist: it's a polite “no”.",
      cards: [
        w("いっしょに", "together", "issho ni"),
        w("週末", "weekend", "shuumatsu", "しゅうまつ"),
        w("ちょっと…", "it's a bit… (polite refusal)", "chotto…"),
        p("いいですね", "sounds good!", "ii desu ne"),
        p("ざんねんです", "that's a shame", "zannen desu"),
        p("また今度", "maybe next time", "mata kondo", "またこんど"),
        s("いっしょに映画を見ませんか。", "Would you like to watch a movie together?", "issho ni eiga o mimasen ka", "いっしょにえいがをみませんか。"),
        s("いいですね。見ましょう。", "Sounds good! Let's watch it.", "ii desu ne. mimashou", "いいですね。みましょう。"),
        s("週末はちょっと…。", "The weekend is a bit… (I can't).", "shuumatsu wa chotto…", "しゅうまつはちょっと…。"),
        s("少し休みましょう。", "Let's take a short break.", "sukoshi yasumimashou", "すこしやすみましょう。"),
      ],
    },
    {
      id: "L28", phase: 3, title: "Your self-introduction", jp: "じこしょうかい",
      intro: [
        "A self-introduction (自己紹介, じこしょうかい) follows a fixed formula: はじめまして → your name → where you're from → what you do → どうぞよろしくお願いします.",
        "〜から来ました = “I'm from… (I came from…)”. 仕事は〜です = “my job is…”. 趣味は〜です = “my hobby is…”.",
        "Rehearse it out loud until you can say it smoothly without reading. It's the phrase you'll use most in Japan!",
      ],
      tip: "Record yourself saying the full introduction and compare it with the ▶ audio of each sentence.",
      cards: [
        w("仕事", "job / work", "shigoto", "しごと"),
        w("リクルーター", "recruiter", "rikuruutaa"),
        w("趣味", "hobby", "shumi", "しゅみ"),
        w("下手", "bad at (something)", "heta", "へた"),
        w("〜から", "from (origin)", "~kara"),
        s("はじめまして。", "Nice to meet you.", "hajimemashite"),
        s("ディエゴです。", "I'm Diego.", "diego desu"),
        s("メキシコから来ました。", "I'm from Mexico.", "mekishiko kara kimashita", "メキシコからきました。"),
        s("仕事はリクルーターです。", "I work as a recruiter.", "shigoto wa rikuruutaa desu", "しごとはリクルーターです。"),
        s("趣味は日本語の勉強です。", "My hobby is studying Japanese.", "shumi wa nihongo no benkyou desu", "しゅみはにほんごのべんきょうです。"),
        s("日本語はまだ下手です。", "My Japanese still isn't very good.", "nihongo wa mada heta desu", "にほんごはまだへたです。"),
        s("どうぞよろしくお願いします。", "Pleased to meet you.", "douzo yoroshiku onegaishimasu", "どうぞよろしくおねがいします。"),
      ],
    },
  ];

  // Tag each card with its lesson
  COURSE_LESSONS.forEach((L) => { L.cards = L.cards.map((c) => ({ ...c, lesson: L.id })); });
  const COURSE_CARDS = COURSE_LESSONS.flatMap((L) => L.cards);

  // ── Listening resources per phase ──────────────────────────────────────
  const COURSE_LISTENING = {
    1: [{ label: "Tofugu · Learn hiragana (with audio)", url: "https://www.tofugu.com/japanese/learn-hiragana/" }],
    2: [{ label: "Tofugu · Learn katakana (with audio)", url: "https://tofugu.com/japanese/learn-katakana" }],
    3: [
      { label: "CI Japanese · comprehensible input videos", url: "https://cijapanese.com/" },
      { label: "Podcast: Nihongo con Teppei for Beginners", url: "https://podcasts.apple.com/podcast/id1471500012" },
    ],
  };

  // ── Daily plan (~60 min) ───────────────────────────────────────────────
  const COURSE_DAILY_STEPS = [
    { id: "review", n: 1, title: "Review",     min: 15, desc: "The course cards due today." },
    { id: "lesson", n: 2, title: "New lesson", min: 20, desc: "Cards and exam for the next lesson." },
    { id: "listen", n: 3, title: "Listening",  min: 15, desc: "Train your ear with what you've seen." },
    { id: "speak",  n: 4, title: "Speaking",   min: 10, desc: "Shadowing: listen and repeat out loud." },
  ];

  // ── Distractors for quiz / listen ──────────────────────────────────────
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
