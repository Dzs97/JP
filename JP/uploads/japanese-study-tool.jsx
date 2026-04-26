import React, { useState, useEffect, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════
//  日本語  JAPANESE LANGUAGE STUDY TOOL
//  Single-file React app — flashcards, SRS, listening, sentence building,
//  grammar, analytics, and more.
// ═══════════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────────
//  CARD DATA — expanded Japanese decks
// ──────────────────────────────────────────────────────────────────────

const CARD_DATA = {
  alphabet: [
    { front: "あ", back: "a", romanji: "a", type: "Hiragana" },
    { front: "い", back: "i", romanji: "i", type: "Hiragana" },
    { front: "う", back: "u", romanji: "u", type: "Hiragana" },
    { front: "え", back: "e", romanji: "e", type: "Hiragana" },
    { front: "お", back: "o", romanji: "o", type: "Hiragana" },
    { front: "か", back: "ka", romanji: "ka", type: "Hiragana" },
    { front: "き", back: "ki", romanji: "ki", type: "Hiragana" },
    { front: "く", back: "ku", romanji: "ku", type: "Hiragana" },
    { front: "け", back: "ke", romanji: "ke", type: "Hiragana" },
    { front: "こ", back: "ko", romanji: "ko", type: "Hiragana" },
  ],

  vocabulary: [
    { front: "水", back: "water", romanji: "mizu", type: "Vocab" },
    { front: "食べる", back: "to eat", romanji: "taberu", type: "Vocab" },
    { front: "行く", back: "to go", romanji: "iku", type: "Vocab" },
    { front: "大きい", back: "big", romanji: "ookii", type: "Vocab" },
    { front: "小さい", back: "small", romanji: "chiisai", type: "Vocab" },
    { front: "友達", back: "friend", romanji: "tomodachi", type: "Vocab" },
    { front: "学校", back: "school", romanji: "gakkou", type: "Vocab" },
    { front: "電車", back: "train", romanji: "densha", type: "Vocab" },
    { front: "猫", back: "cat", romanji: "neko", type: "Vocab" },
    { front: "犬", back: "dog", romanji: "inu", type: "Vocab" },
    { front: "食べ物", back: "food", romanji: "tabemono", type: "Vocab" },
    { front: "飲み物", back: "drink / beverage", romanji: "nomimono", type: "Vocab" },
    { front: "お茶", back: "tea", romanji: "ocha", type: "Vocab" },
    { front: "ご飯", back: "rice / meal", romanji: "gohan", type: "Vocab" },
    { front: "魚", back: "fish", romanji: "sakana", type: "Vocab" },
    { front: "肉", back: "meat", romanji: "niku", type: "Vocab" },
    { front: "野菜", back: "vegetables", romanji: "yasai", type: "Vocab" },
    { front: "家", back: "house / home", romanji: "ie / uchi", type: "Vocab" },
    { front: "部屋", back: "room", romanji: "heya", type: "Vocab" },
    { front: "駅", back: "train station", romanji: "eki", type: "Vocab" },
    { front: "病院", back: "hospital", romanji: "byouin", type: "Vocab" },
    { front: "薬", back: "medicine", romanji: "kusuri", type: "Vocab" },
    { front: "仕事", back: "work / job", romanji: "shigoto", type: "Vocab" },
    { front: "会社", back: "company / office", romanji: "kaisha", type: "Vocab" },
    { front: "時間", back: "time", romanji: "jikan", type: "Vocab" },
    { front: "今日", back: "today", romanji: "kyou", type: "Vocab" },
    { front: "明日", back: "tomorrow", romanji: "ashita", type: "Vocab" },
    { front: "昨日", back: "yesterday", romanji: "kinou", type: "Vocab" },
    { front: "天気", back: "weather", romanji: "tenki", type: "Vocab" },
    { front: "暑い", back: "hot", romanji: "atsui", type: "Vocab" },
    { front: "寒い", back: "cold", romanji: "samui", type: "Vocab" },
    { front: "新しい", back: "new", romanji: "atarashii", type: "Vocab" },
    { front: "古い", back: "old", romanji: "furui", type: "Vocab" },
    { front: "高い", back: "expensive / tall", romanji: "takai", type: "Vocab" },
    { front: "安い", back: "cheap", romanji: "yasui", type: "Vocab" },
    { front: "好き", back: "like / fond of", romanji: "suki", type: "Vocab" },
    { front: "嫌い", back: "dislike", romanji: "kirai", type: "Vocab" },
    { front: "楽しい", back: "fun / enjoyable", romanji: "tanoshii", type: "Vocab" },
    { front: "難しい", back: "difficult", romanji: "muzukashii", type: "Vocab" },
    { front: "簡単", back: "easy / simple", romanji: "kantan", type: "Vocab" },
  ],

  phrases: [
    { front: "ありがとうございます", back: "Thank you very much", romanji: "arigatou gozaimasu", type: "Phrase" },
    { front: "すみません", back: "Excuse me / Sorry", romanji: "sumimasen", type: "Phrase" },
    { front: "はじめまして", back: "Nice to meet you", romanji: "hajimemashite", type: "Phrase" },
    { front: "おはようございます", back: "Good morning", romanji: "ohayou gozaimasu", type: "Phrase" },
    { front: "こんにちは", back: "Hello / Good afternoon", romanji: "konnichiwa", type: "Phrase" },
    { front: "さようなら", back: "Goodbye", romanji: "sayounara", type: "Phrase" },
    { front: "わかりません", back: "I don't understand", romanji: "wakarimasen", type: "Phrase" },
    { front: "もう一度お願いします", back: "Please say it again", romanji: "mou ichido onegaishimasu", type: "Phrase" },
    { front: "こんばんは", back: "Good evening", romanji: "konbanwa", type: "Phrase" },
    { front: "おやすみなさい", back: "Good night", romanji: "oyasumi nasai", type: "Phrase" },
    { front: "お元気ですか？", back: "How are you?", romanji: "ogenki desu ka?", type: "Phrase" },
    { front: "元気です", back: "I'm fine / doing well", romanji: "genki desu", type: "Phrase" },
    { front: "お名前は何ですか？", back: "What is your name?", romanji: "onamae wa nan desu ka?", type: "Phrase" },
    { front: "私の名前は〜です", back: "My name is ~", romanji: "watashi no namae wa ~ desu", type: "Phrase" },
    { front: "日本語を勉強しています", back: "I am studying Japanese", romanji: "nihongo wo benkyou shite imasu", type: "Phrase" },
    { front: "〜はどこですか？", back: "Where is ~?", romanji: "~ wa doko desu ka?", type: "Phrase" },
    { front: "いくらですか？", back: "How much is it?", romanji: "ikura desu ka?", type: "Phrase" },
    { front: "これをください", back: "Please give me this", romanji: "kore wo kudasai", type: "Phrase" },
    { front: "大丈夫ですか？", back: "Are you okay?", romanji: "daijoubu desu ka?", type: "Phrase" },
    { front: "大丈夫です", back: "I'm okay / It's fine", romanji: "daijoubu desu", type: "Phrase" },
    { front: "お腹が空きました", back: "I'm hungry", romanji: "onaka ga sukimashita", type: "Phrase" },
    { front: "喉が渇きました", back: "I'm thirsty", romanji: "nodo ga kawakimashita", type: "Phrase" },
    { front: "トイレはどこですか？", back: "Where is the bathroom?", romanji: "toire wa doko desu ka?", type: "Phrase" },
    { front: "助けてください", back: "Please help me", romanji: "tasukete kudasai", type: "Phrase" },
  ],

  numbers: [
    { front: "一", back: "1 (one)", romanji: "ichi", type: "Number" },
    { front: "二", back: "2 (two)", romanji: "ni", type: "Number" },
    { front: "三", back: "3 (three)", romanji: "san", type: "Number" },
    { front: "四", back: "4 (four)", romanji: "shi / yon", type: "Number" },
    { front: "五", back: "5 (five)", romanji: "go", type: "Number" },
    { front: "六", back: "6 (six)", romanji: "roku", type: "Number" },
    { front: "七", back: "7 (seven)", romanji: "shichi / nana", type: "Number" },
    { front: "八", back: "8 (eight)", romanji: "hachi", type: "Number" },
    { front: "九", back: "9 (nine)", romanji: "ku / kyuu", type: "Number" },
    { front: "十", back: "10 (ten)", romanji: "juu", type: "Number" },
    { front: "十一", back: "11 (eleven)", romanji: "juuichi", type: "Number" },
    { front: "十二", back: "12 (twelve)", romanji: "juuni", type: "Number" },
    { front: "十三", back: "13 (thirteen)", romanji: "juusan", type: "Number" },
    { front: "十四", back: "14 (fourteen)", romanji: "juushi / juuyon", type: "Number" },
    { front: "十五", back: "15 (fifteen)", romanji: "juugo", type: "Number" },
    { front: "十六", back: "16 (sixteen)", romanji: "juuroku", type: "Number" },
    { front: "十七", back: "17 (seventeen)", romanji: "juushichi / juunana", type: "Number" },
    { front: "十八", back: "18 (eighteen)", romanji: "juuhachi", type: "Number" },
    { front: "十九", back: "19 (nineteen)", romanji: "juuku / juukyuu", type: "Number" },
    { front: "二十", back: "20 (twenty)", romanji: "nijuu", type: "Number" },
    { front: "三十", back: "30 (thirty)", romanji: "sanjuu", type: "Number" },
    { front: "四十", back: "40 (forty)", romanji: "yonjuu", type: "Number" },
    { front: "五十", back: "50 (fifty)", romanji: "gojuu", type: "Number" },
    { front: "六十", back: "60 (sixty)", romanji: "rokujuu", type: "Number" },
    { front: "七十", back: "70 (seventy)", romanji: "nanajuu", type: "Number" },
    { front: "八十", back: "80 (eighty)", romanji: "hachijuu", type: "Number" },
    { front: "九十", back: "90 (ninety)", romanji: "kyuujuu", type: "Number" },
    { front: "百", back: "100 (one hundred)", romanji: "hyaku", type: "Number" },
  ],

  // ── NEW: Body parts ──────────────────────────────────────────────
  body: [
    { front: "頭", back: "head", romanji: "atama", type: "Body" },
    { front: "顔", back: "face", romanji: "kao", type: "Body" },
    { front: "目", back: "eye", romanji: "me", type: "Body" },
    { front: "耳", back: "ear", romanji: "mimi", type: "Body" },
    { front: "鼻", back: "nose", romanji: "hana", type: "Body" },
    { front: "口", back: "mouth", romanji: "kuchi", type: "Body" },
    { front: "歯", back: "tooth", romanji: "ha", type: "Body" },
    { front: "手", back: "hand", romanji: "te", type: "Body" },
    { front: "指", back: "finger", romanji: "yubi", type: "Body" },
    { front: "足", back: "foot / leg", romanji: "ashi", type: "Body" },
    { front: "首", back: "neck", romanji: "kubi", type: "Body" },
    { front: "肩", back: "shoulder", romanji: "kata", type: "Body" },
    { front: "背中", back: "back", romanji: "senaka", type: "Body" },
    { front: "お腹", back: "stomach / belly", romanji: "onaka", type: "Body" },
    { front: "心臓", back: "heart", romanji: "shinzou", type: "Body" },
  ],

  // ── NEW: Family ──────────────────────────────────────────────────
  family: [
    { front: "家族", back: "family", romanji: "kazoku", type: "Family" },
    { front: "お父さん", back: "father (someone else's)", romanji: "otousan", type: "Family" },
    { front: "お母さん", back: "mother (someone else's)", romanji: "okaasan", type: "Family" },
    { front: "父", back: "my father", romanji: "chichi", type: "Family" },
    { front: "母", back: "my mother", romanji: "haha", type: "Family" },
    { front: "兄", back: "older brother (my)", romanji: "ani", type: "Family" },
    { front: "姉", back: "older sister (my)", romanji: "ane", type: "Family" },
    { front: "弟", back: "younger brother", romanji: "otouto", type: "Family" },
    { front: "妹", back: "younger sister", romanji: "imouto", type: "Family" },
    { front: "祖父", back: "grandfather", romanji: "sofu", type: "Family" },
    { front: "祖母", back: "grandmother", romanji: "sobo", type: "Family" },
    { front: "息子", back: "son", romanji: "musuko", type: "Family" },
    { front: "娘", back: "daughter", romanji: "musume", type: "Family" },
    { front: "夫", back: "husband", romanji: "otto", type: "Family" },
    { front: "妻", back: "wife", romanji: "tsuma", type: "Family" },
    { front: "子供", back: "child / children", romanji: "kodomo", type: "Family" },
  ],

  // ── NEW: Colors ──────────────────────────────────────────────────
  colors: [
    { front: "赤", back: "red", romanji: "aka", type: "Color" },
    { front: "青", back: "blue", romanji: "ao", type: "Color" },
    { front: "黄色", back: "yellow", romanji: "kiiro", type: "Color" },
    { front: "緑", back: "green", romanji: "midori", type: "Color" },
    { front: "白", back: "white", romanji: "shiro", type: "Color" },
    { front: "黒", back: "black", romanji: "kuro", type: "Color" },
    { front: "茶色", back: "brown", romanji: "chairo", type: "Color" },
    { front: "紫", back: "purple", romanji: "murasaki", type: "Color" },
    { front: "ピンク", back: "pink", romanji: "pinku", type: "Color" },
    { front: "オレンジ", back: "orange", romanji: "orenji", type: "Color" },
    { front: "灰色", back: "grey", romanji: "haiiro", type: "Color" },
    { front: "金色", back: "gold", romanji: "kin'iro", type: "Color" },
    { front: "銀色", back: "silver", romanji: "gin'iro", type: "Color" },
  ],

  // ── NEW: Days, months, time ──────────────────────────────────────
  time: [
    { front: "月曜日", back: "Monday", romanji: "getsuyoubi", type: "Time" },
    { front: "火曜日", back: "Tuesday", romanji: "kayoubi", type: "Time" },
    { front: "水曜日", back: "Wednesday", romanji: "suiyoubi", type: "Time" },
    { front: "木曜日", back: "Thursday", romanji: "mokuyoubi", type: "Time" },
    { front: "金曜日", back: "Friday", romanji: "kinyoubi", type: "Time" },
    { front: "土曜日", back: "Saturday", romanji: "doyoubi", type: "Time" },
    { front: "日曜日", back: "Sunday", romanji: "nichiyoubi", type: "Time" },
    { front: "一月", back: "January", romanji: "ichigatsu", type: "Time" },
    { front: "二月", back: "February", romanji: "nigatsu", type: "Time" },
    { front: "三月", back: "March", romanji: "sangatsu", type: "Time" },
    { front: "四月", back: "April", romanji: "shigatsu", type: "Time" },
    { front: "五月", back: "May", romanji: "gogatsu", type: "Time" },
    { front: "六月", back: "June", romanji: "rokugatsu", type: "Time" },
    { front: "朝", back: "morning", romanji: "asa", type: "Time" },
    { front: "昼", back: "noon / daytime", romanji: "hiru", type: "Time" },
    { front: "夜", back: "night", romanji: "yoru", type: "Time" },
    { front: "今", back: "now", romanji: "ima", type: "Time" },
    { front: "週末", back: "weekend", romanji: "shuumatsu", type: "Time" },
    { front: "来週", back: "next week", romanji: "raishuu", type: "Time" },
    { front: "先週", back: "last week", romanji: "senshuu", type: "Time" },
  ],

  // ── NEW: Grammar — particles, endings, conjugations ──────────────
  grammar: [
    { front: "は", back: "topic marker (wa)", romanji: "wa", type: "Grammar", note: "Marks the topic. Pronounced 'wa' not 'ha'." },
    { front: "が", back: "subject marker", romanji: "ga", type: "Grammar", note: "Marks the grammatical subject, often new info." },
    { front: "を", back: "object marker (wo/o)", romanji: "o", type: "Grammar", note: "Marks the direct object of a verb." },
    { front: "に", back: "direction / time / target", romanji: "ni", type: "Grammar", note: "Destination, indirect object, or specific time." },
    { front: "で", back: "location of action / means", romanji: "de", type: "Grammar", note: "Where action happens, or by what means." },
    { front: "と", back: "with / and (list)", romanji: "to", type: "Grammar", note: "Accompaniment or exhaustive listing." },
    { front: "も", back: "also / too", romanji: "mo", type: "Grammar", note: "Replaces は/が/を to mean 'also'." },
    { front: "の", back: "possessive / linking", romanji: "no", type: "Grammar", note: "Like English 's. Noun の Noun = modifier." },
    { front: "から", back: "from / because", romanji: "kara", type: "Grammar", note: "Starting point (time/place) or reason." },
    { front: "まで", back: "until / as far as", romanji: "made", type: "Grammar", note: "Endpoint of time or place." },
    { front: "か", back: "question marker", romanji: "ka", type: "Grammar", note: "Turns a sentence into a question." },
    { front: "ね", back: "sentence-end (agreement)", romanji: "ne", type: "Grammar", note: "Seeks agreement, like 'right?'" },
    { front: "よ", back: "sentence-end (assertion)", romanji: "yo", type: "Grammar", note: "Emphasizes new info for listener." },
    { front: "です", back: "polite copula (is/am/are)", romanji: "desu", type: "Grammar", note: "Polite 'to be'. Attaches to nouns/na-adj." },
    { front: "ます", back: "polite verb ending", romanji: "masu", type: "Grammar", note: "Attaches to verb stems for politeness." },
    { front: "ません", back: "polite negative", romanji: "masen", type: "Grammar", note: "Negative form of ます." },
    { front: "ました", back: "polite past", romanji: "mashita", type: "Grammar", note: "Past form of ます." },
    { front: "ている", back: "progressive / state", romanji: "te iru", type: "Grammar", note: "'Is doing' or ongoing state." },
    { front: "たい", back: "want to (verb)", romanji: "tai", type: "Grammar", note: "Attach to verb stem: 食べたい = want to eat." },
    { front: "ください", back: "please (give/do)", romanji: "kudasai", type: "Grammar", note: "Polite request. Follows て-form or noun + を." },
  ],

  // ── NEW: Sentences (reuses familiar vocab) ───────────────────────
  sentences: [
    { front: "私は学生です", back: "I am a student", romanji: "watashi wa gakusei desu", type: "Sentence" },
    { front: "水を飲みます", back: "I drink water", romanji: "mizu wo nomimasu", type: "Sentence" },
    { front: "猫が好きです", back: "I like cats", romanji: "neko ga suki desu", type: "Sentence" },
    { front: "今日は暑いです", back: "Today is hot", romanji: "kyou wa atsui desu", type: "Sentence" },
    { front: "学校へ行きます", back: "I go to school", romanji: "gakkou e ikimasu", type: "Sentence" },
    { front: "友達と食べます", back: "I eat with a friend", romanji: "tomodachi to tabemasu", type: "Sentence" },
    { front: "本を読んでいます", back: "I am reading a book", romanji: "hon wo yonde imasu", type: "Sentence" },
    { front: "日本語は難しいです", back: "Japanese is difficult", romanji: "nihongo wa muzukashii desu", type: "Sentence" },
    { front: "明日も勉強します", back: "I will study tomorrow too", romanji: "ashita mo benkyou shimasu", type: "Sentence" },
    { front: "これは私の本です", back: "This is my book", romanji: "kore wa watashi no hon desu", type: "Sentence" },
    { front: "お茶を飲みたいです", back: "I want to drink tea", romanji: "ocha wo nomitai desu", type: "Sentence" },
    { front: "駅はどこですか", back: "Where is the station?", romanji: "eki wa doko desu ka", type: "Sentence" },
    { front: "新しい家に住んでいます", back: "I live in a new house", romanji: "atarashii ie ni sunde imasu", type: "Sentence" },
    { front: "犬と公園で遊びます", back: "I play with the dog at the park", romanji: "inu to kouen de asobimasu", type: "Sentence" },
    { front: "朝ご飯を食べました", back: "I ate breakfast", romanji: "asagohan wo tabemashita", type: "Sentence" },
    { front: "日本に行きたいです", back: "I want to go to Japan", romanji: "nihon ni ikitai desu", type: "Sentence" },
    { front: "私の名前は田中です", back: "My name is Tanaka", romanji: "watashi no namae wa tanaka desu", type: "Sentence" },
    { front: "少し日本語を話します", back: "I speak a little Japanese", romanji: "sukoshi nihongo wo hanashimasu", type: "Sentence" },
  ],
};

// ── Category metadata (order + labels + icons) ───────────────────────
const CATEGORY_META = [
  { id: "alphabet",   label: "Alphabet",   icon: "あ",  count: CARD_DATA.alphabet.length },
  { id: "vocabulary", label: "Vocabulary", icon: "語",  count: CARD_DATA.vocabulary.length },
  { id: "phrases",    label: "Phrases",    icon: "文",  count: CARD_DATA.phrases.length },
  { id: "numbers",    label: "Numbers",    icon: "数",  count: CARD_DATA.numbers.length },
  { id: "body",       label: "Body",       icon: "体",  count: CARD_DATA.body.length },
  { id: "family",     label: "Family",     icon: "家",  count: CARD_DATA.family.length },
  { id: "colors",     label: "Colors",     icon: "色",  count: CARD_DATA.colors.length },
  { id: "time",       label: "Time",       icon: "時",  count: CARD_DATA.time.length },
  { id: "grammar",    label: "Grammar",    icon: "助",  count: CARD_DATA.grammar.length },
  { id: "sentences",  label: "Sentences",  icon: "章",  count: CARD_DATA.sentences.length },
];

const ALL_CARDS = Object.values(CARD_DATA).flat();
const cardKey = (card) => `jp::${card.front}`;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getDeck = (cats) => {
  let cards = [];
  cats.forEach(c => { if (CARD_DATA[c]) cards = [...cards, ...CARD_DATA[c]]; });
  return shuffle(cards);
};

const getWrongChoices = (correct, pool, n = 3) =>
  shuffle(pool.filter(c => c.back !== correct.back)).slice(0, n).map(c => c.back);

// ──────────────────────────────────────────────────────────────────────
//  HIRAGANA & KATAKANA reference data
// ──────────────────────────────────────────────────────────────────────

const HIRAGANA_ROWS = [
  { consonant: "–",  chars: ["あ","い","う","え","お"], sounds: ["a","i","u","e","o"] },
  { consonant: "k",  chars: ["か","き","く","け","こ"], sounds: ["ka","ki","ku","ke","ko"] },
  { consonant: "s",  chars: ["さ","し","す","せ","そ"], sounds: ["sa","shi","su","se","so"] },
  { consonant: "t",  chars: ["た","ち","つ","て","と"], sounds: ["ta","chi","tsu","te","to"] },
  { consonant: "n",  chars: ["な","に","ぬ","ね","の"], sounds: ["na","ni","nu","ne","no"] },
  { consonant: "h",  chars: ["は","ひ","ふ","へ","ほ"], sounds: ["ha","hi","fu","he","ho"] },
  { consonant: "m",  chars: ["ま","み","む","め","も"], sounds: ["ma","mi","mu","me","mo"] },
  { consonant: "y",  chars: ["や",null,"ゆ",null,"よ"], sounds: ["ya",null,"yu",null,"yo"] },
  { consonant: "r",  chars: ["ら","り","る","れ","ろ"], sounds: ["ra","ri","ru","re","ro"] },
  { consonant: "w",  chars: ["わ",null,null,null,"を"], sounds: ["wa",null,null,null,"wo"] },
  { consonant: "n*", chars: ["ん",null,null,null,null], sounds: ["n",null,null,null,null] },
  { consonant: "g",  chars: ["が","ぎ","ぐ","げ","ご"], sounds: ["ga","gi","gu","ge","go"] },
  { consonant: "z",  chars: ["ざ","じ","ず","ぜ","ぞ"], sounds: ["za","ji","zu","ze","zo"] },
  { consonant: "d",  chars: ["だ","ぢ","づ","で","ど"], sounds: ["da","di","du","de","do"] },
  { consonant: "b",  chars: ["ば","び","ぶ","べ","ぼ"], sounds: ["ba","bi","bu","be","bo"] },
  { consonant: "p",  chars: ["ぱ","ぴ","ぷ","ぺ","ぽ"], sounds: ["pa","pi","pu","pe","po"] },
];

const KATAKANA_ROWS = [
  { consonant: "–",  chars: ["ア","イ","ウ","エ","オ"], sounds: ["a","i","u","e","o"] },
  { consonant: "k",  chars: ["カ","キ","ク","ケ","コ"], sounds: ["ka","ki","ku","ke","ko"] },
  { consonant: "s",  chars: ["サ","シ","ス","セ","ソ"], sounds: ["sa","shi","su","se","so"] },
  { consonant: "t",  chars: ["タ","チ","ツ","テ","ト"], sounds: ["ta","chi","tsu","te","to"] },
  { consonant: "n",  chars: ["ナ","ニ","ヌ","ネ","ノ"], sounds: ["na","ni","nu","ne","no"] },
  { consonant: "h",  chars: ["ハ","ヒ","フ","ヘ","ホ"], sounds: ["ha","hi","fu","he","ho"] },
  { consonant: "m",  chars: ["マ","ミ","ム","メ","モ"], sounds: ["ma","mi","mu","me","mo"] },
  { consonant: "y",  chars: ["ヤ",null,"ユ",null,"ヨ"], sounds: ["ya",null,"yu",null,"yo"] },
  { consonant: "r",  chars: ["ラ","リ","ル","レ","ロ"], sounds: ["ra","ri","ru","re","ro"] },
  { consonant: "w",  chars: ["ワ",null,null,null,"ヲ"], sounds: ["wa",null,null,null,"wo"] },
  { consonant: "n*", chars: ["ン",null,null,null,null], sounds: ["n",null,null,null,null] },
  { consonant: "g",  chars: ["ガ","ギ","グ","ゲ","ゴ"], sounds: ["ga","gi","gu","ge","go"] },
  { consonant: "z",  chars: ["ザ","ジ","ズ","ゼ","ゾ"], sounds: ["za","ji","zu","ze","zo"] },
  { consonant: "d",  chars: ["ダ","ヂ","ヅ","デ","ド"], sounds: ["da","di","du","de","do"] },
  { consonant: "b",  chars: ["バ","ビ","ブ","ベ","ボ"], sounds: ["ba","bi","bu","be","bo"] },
  { consonant: "p",  chars: ["パ","ピ","プ","ペ","ポ"], sounds: ["pa","pi","pu","pe","po"] },
];

const HIRAGANA_QUIZ_POOL = HIRAGANA_ROWS.flatMap(r =>
  r.chars.map((ch, i) => ch ? { char: ch, romanji: r.sounds[i], row: r.consonant } : null).filter(Boolean)
);
const KATAKANA_QUIZ_POOL = KATAKANA_ROWS.flatMap(r =>
  r.chars.map((ch, i) => ch ? { char: ch, romanji: r.sounds[i], row: r.consonant } : null).filter(Boolean)
);

// ──────────────────────────────────────────────────────────────────────
//  THEME — warm paper / deep charcoal, Japanese crimson accent
// ──────────────────────────────────────────────────────────────────────

const THEME_BASE = { label: "日本語", sub: "Japanese", color: "#c0392b", accent: "#c0392b" };

const THEME_TOKENS = {
  light: {
    appBg: "#f7f3ee", surfaceBg: "#ffffff", surfaceBorder: "rgba(0,0,0,0.08)",
    raisedBg: "#ede8e1", text: "#1c1410", textMuted: "rgba(0,0,0,0.45)",
    textFaint: "rgba(0,0,0,0.25)", btnGhost: "rgba(0,0,0,0.06)",
    btnGhostText: "rgba(0,0,0,0.5)", btnGhostBorder: "rgba(0,0,0,0.12)",
    tabInactive: "rgba(0,0,0,0.06)", tabInactiveText: "rgba(0,0,0,0.4)",
    inputBg: "rgba(0,0,0,0.04)", inputBorder: "rgba(0,0,0,0.15)",
    progressTrack: "rgba(0,0,0,0.08)", cardFront: "#ffffff",
    cardFrontBorder: "rgba(0,0,0,0.08)", cardFrontChar: "#1c1410",
    separatorText: "rgba(0,0,0,0.2)", streakBg: "rgba(217,119,6,0.1)",
    streakBorder: "rgba(217,119,6,0.3)", streakText: "#b45309",
    heatmap: ["#ece6df", "#f5cfc9", "#e89084", "#d05040", "#8b1810"],
  },
  dark: {
    appBg: "#0f0f0f", surfaceBg: "#1a1a1a", surfaceBorder: "rgba(255,255,255,0.08)",
    raisedBg: "#242424", text: "#f0ece6", textMuted: "rgba(255,255,255,0.45)",
    textFaint: "rgba(255,255,255,0.22)", btnGhost: "rgba(255,255,255,0.07)",
    btnGhostText: "rgba(255,255,255,0.5)", btnGhostBorder: "rgba(255,255,255,0.12)",
    tabInactive: "rgba(255,255,255,0.07)", tabInactiveText: "rgba(255,255,255,0.38)",
    inputBg: "rgba(255,255,255,0.06)", inputBorder: "rgba(255,255,255,0.14)",
    progressTrack: "rgba(255,255,255,0.08)", cardFront: "#1e1e1e",
    cardFrontBorder: "rgba(255,255,255,0.1)", cardFrontChar: "#f0ece6",
    separatorText: "rgba(255,255,255,0.2)", streakBg: "rgba(245,158,11,0.12)",
    streakBorder: "rgba(245,158,11,0.3)", streakText: "#fbbf24",
    heatmap: ["#1f1f1f", "#4a1f1b", "#7a2a24", "#b03a2e", "#e74c3c"],
  },
};

const buildTheme = (darkMode) => ({ ...THEME_BASE, ...(darkMode ? THEME_TOKENS.dark : THEME_TOKENS.light) });

// ──────────────────────────────────────────────────────────────────────
//  SRS ENGINE — SM-2 inspired, 4-button (Again/Hard/Good/Easy)
//  cardStats shape per card:
//    { correct, attempts, ease, interval, reps, due, lastSeen, lapses, ratings: [] }
// ──────────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

/** Update a single card stat object given a rating. */
function srsReview(stat, rating) {
  // rating: "again" (0) | "hard" (1) | "good" (2) | "easy" (3)
  const s = stat ? { ...stat } : {
    correct: 0, attempts: 0, ease: DEFAULT_EASE, interval: 0,
    reps: 0, due: Date.now(), lastSeen: 0, lapses: 0, ratings: [],
  };
  s.attempts += 1;
  s.lastSeen = Date.now();
  s.ratings = [...(s.ratings || []).slice(-9), rating];

  if (rating === "again") {
    s.lapses += 1;
    s.reps = 0;
    s.interval = 0;
    s.ease = Math.max(MIN_EASE, s.ease - 0.2);
    s.due = Date.now() + 10 * 60 * 1000; // 10 minutes
    return s;
  }

  s.correct += 1;
  s.reps += 1;

  // First two successful reps use fixed small intervals
  if (s.reps === 1) {
    s.interval = rating === "easy" ? 3 : rating === "hard" ? 0.5 : 1; // days
  } else if (s.reps === 2) {
    s.interval = rating === "easy" ? 7 : rating === "hard" ? 1.5 : 3;
  } else {
    const mult = rating === "easy" ? s.ease * 1.3
               : rating === "hard" ? 1.2
               : s.ease;
    s.interval = Math.max(1, s.interval * mult);
  }

  // Ease adjustment
  if (rating === "hard") s.ease = Math.max(MIN_EASE, s.ease - 0.15);
  if (rating === "easy") s.ease = s.ease + 0.15;

  s.due = Date.now() + s.interval * DAY_MS;
  return s;
}

/** Is this card due for review? */
const isDue = (stat) => !stat || !stat.due || stat.due <= Date.now();

/** Format interval in human terms (e.g. "2d", "1.5d", "10m"). */
function formatInterval(stat) {
  if (!stat || !stat.interval) return "new";
  if (stat.interval < 1) return `${Math.round(stat.interval * 24)}h`;
  if (stat.interval < 30) return `${Math.round(stat.interval)}d`;
  return `${Math.round(stat.interval / 30)}mo`;
}

// ──────────────────────────────────────────────────────────────────────
//  PROGRESS SHAPE
// ──────────────────────────────────────────────────────────────────────

const emptyProgress = () => ({
  totalCorrect: 0, totalAnswered: 0, sessions: 0,
  cardStats: {}, // keyed by cardKey → srs stat
  history: [],   // { date, score, cards, mode, duration }
  dayLog: {},    // "YYYY-MM-DD" → { cards, correct }
  streakDays: 0, lastStudied: null,
});

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

// ══════════════════════════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════════════════════════

export default function App() {
  // ── Navigation / display ────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(false);
  const [screen, setScreen] = useState("home"); // home | study | progress | kana
  const [kanaSection, setKanaSection] = useState("hiragana");
  const [kanaQuizPool, setKanaQuizPool] = useState([]);
  const [kanaQuizIdx, setKanaQuizIdx] = useState(0);
  const [kanaQuizSelected, setKanaQuizSelected] = useState(null);
  const [kanaQuizScore, setKanaQuizScore] = useState({ correct: 0, incorrect: 0 });
  const [kanaQuizDone, setKanaQuizDone] = useState(false);

  // ── Study configuration ─────────────────────────────────────────────
  const [mode, setMode] = useState("flashcard"); // flashcard | quiz | write | listen | build
  const [categories, setCategories] = useState(["vocabulary", "phrases"]);
  const [sessionGoal, setSessionGoal] = useState({ kind: "cards", value: 20 }); // kind: cards|minutes|due
  const [dueOnly, setDueOnly] = useState(false);

  // ── Study runtime ───────────────────────────────────────────────────
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizSelected, setQuizSelected] = useState(null);
  const [writeInput, setWriteInput] = useState("");
  const [writeResult, setWriteResult] = useState(null);
  const [listenRevealed, setListenRevealed] = useState(false);
  const [listenOptions, setListenOptions] = useState([]);
  const [listenSelected, setListenSelected] = useState(null);
  const [buildTokens, setBuildTokens] = useState([]);    // available
  const [buildSelected, setBuildSelected] = useState([]); // chosen in order
  const [buildResult, setBuildResult] = useState(null);
  const [sessionStart, setSessionStart] = useState(null);
  const [finished, setFinished] = useState(false);

  // ── UI preferences ──────────────────────────────────────────────────
  const [showRomanji, setShowRomanji] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);

  // ── Persistence ─────────────────────────────────────────────────────
  const [progress, setProgress] = useState(emptyProgress());

  const t = useMemo(() => buildTheme(darkMode), [darkMode]);
  const card = deck[idx];
  const jf = "'Noto Serif JP', serif";

  // ── Persistence — load on mount, save on change ─────────────────────
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("jp-study-progress");
        if (r?.value) setProgress(JSON.parse(r.value));
      } catch (_) {}
      try {
        const p = await window.storage.get("jp-study-prefs");
        if (p?.value) {
          const parsed = JSON.parse(p.value);
          if (typeof parsed.darkMode === "boolean") setDarkMode(parsed.darkMode);
          if (typeof parsed.showRomanji === "boolean") setShowRomanji(parsed.showRomanji);
          if (typeof parsed.voiceOn === "boolean") setVoiceOn(parsed.voiceOn);
          if (Array.isArray(parsed.categories) && parsed.categories.length) setCategories(parsed.categories);
          if (parsed.mode) setMode(parsed.mode);
          if (parsed.sessionGoal) setSessionGoal(parsed.sessionGoal);
        }
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await window.storage.set("jp-study-prefs", JSON.stringify({
          darkMode, showRomanji, voiceOn, categories, mode, sessionGoal,
        }));
      } catch (_) {}
    })();
  }, [darkMode, showRomanji, voiceOn, categories, mode, sessionGoal]);

  const saveProgress = useCallback(async (p) => {
    try { await window.storage.set("jp-study-progress", JSON.stringify(p)); } catch (_) {}
    setProgress(p);
  }, []);

  // ── Speech (Web Speech API) ─────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!voiceOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ja-JP";
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const native = voices.find(v => v.lang.startsWith("ja"));
    if (native) utt.voice = native;
    window.speechSynthesis.speak(utt);
  }, [voiceOn]);

  const speakForce = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ja-JP";
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const native = voices.find(v => v.lang.startsWith("ja"));
    if (native) utt.voice = native;
    window.speechSynthesis.speak(utt);
  }, []);

  // ── Deck building with SRS awareness ────────────────────────────────
  const buildSessionDeck = useCallback(() => {
    let pool = [];
    categories.forEach(c => { if (CARD_DATA[c]) pool = [...pool, ...CARD_DATA[c]]; });

    // Build mode needs sentences — swap to sentences if picked and not included
    if (mode === "build") {
      pool = CARD_DATA.sentences.slice();
    }

    let ordered;
    if (dueOnly || sessionGoal.kind === "due") {
      // due cards first, oldest due first; then new cards
      const due = pool.filter(c => isDue(progress.cardStats[cardKey(c)]))
                      .sort((a, b) => (progress.cardStats[cardKey(a)]?.due || 0) - (progress.cardStats[cardKey(b)]?.due || 0));
      const rest = pool.filter(c => !isDue(progress.cardStats[cardKey(c)]));
      ordered = [...due, ...shuffle(rest)];
    } else {
      ordered = shuffle(pool);
    }

    const limit = sessionGoal.kind === "cards" ? sessionGoal.value : ordered.length;
    return ordered.slice(0, Math.min(limit, ordered.length));
  }, [categories, mode, dueOnly, sessionGoal, progress]);

  const startStudy = useCallback(() => {
    const d = buildSessionDeck();
    if (d.length === 0) return;
    setDeck(d);
    setIdx(0); setFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setQuizSelected(null); setWriteInput(""); setWriteResult(null);
    setListenRevealed(false); setListenSelected(null);
    setBuildSelected([]); setBuildResult(null);
    setFinished(false);
    setSessionStart(Date.now());
    setScreen("study");
  }, [buildSessionDeck]);

  const startWeakReview = useCallback(() => {
    const weakCards = ALL_CARDS
      .map(c => ({ c, s: progress.cardStats[cardKey(c)] }))
      .filter(({ s }) => s && s.attempts >= 2 && s.correct / s.attempts < 0.7)
      .sort((a, b) => (a.s.correct / a.s.attempts) - (b.s.correct / b.s.attempts))
      .slice(0, 20)
      .map(({ c }) => c);
    if (weakCards.length === 0) return;
    setDeck(shuffle(weakCards));
    setIdx(0); setFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setQuizSelected(null); setWriteInput(""); setWriteResult(null);
    setListenRevealed(false); setListenSelected(null);
    setBuildSelected([]); setBuildResult(null);
    setFinished(false);
    setSessionStart(Date.now());
    setScreen("study");
  }, [progress]);

  // ── Quiz options, listen options, build tokens — reset on card change
  useEffect(() => {
    if (!card || screen !== "study") return;
    if (mode === "quiz") {
      setQuizOptions(shuffle([card.back, ...getWrongChoices(card, ALL_CARDS)]));
      setQuizSelected(null);
    }
    if (mode === "listen") {
      setListenOptions(shuffle([card.back, ...getWrongChoices(card, ALL_CARDS)]));
      setListenSelected(null);
      setListenRevealed(false);
    }
    if (mode === "build") {
      // Tokenize sentence into study-friendly chunks.
      // Strategy: recursively peel trailing endings (です/ます/でいます/etc.), then
      // split on the leftmost particle, then recurse on the left remainder.
      // This keeps です/でいます atomic even when followed by か (question particle).
      const sentence = card.front;
      const endings = [
        "でいます", "でいる", "ています", "ている",
        "ください", "ました", "ません",
        "たい", "です", "ます",
      ];
      const particles = ["は","が","を","に","で","と","も","の","から","まで","へ","か","ね","よ"];
      // Sort particles by length descending so multi-char particles (から/まで) win
      const particlesByLen = [...particles].sort((a, b) => b.length - a.length);

      const peelEnding = (c) => {
        for (const e of endings) {
          if (c.endsWith(e) && c.length > e.length) {
            return [c.slice(0, c.length - e.length), e];
          }
        }
        return null;
      };

      // Sentence-ending particles (か/ね/よ) attach to the end and should be peeled
      // before the rest of the sentence is tokenized, so that どこですか resolves
      // to どこ | です | か rather than どこ | で | す | か.
      const sentenceEnders = ["か", "ね", "よ"];
      const peelSentenceEnder = (c) => {
        for (const p of sentenceEnders) {
          if (c.endsWith(p) && c.length > p.length) {
            return [c.slice(0, c.length - p.length), p];
          }
        }
        return null;
      };

      const findFirstParticle = (c) => {
        let best = null;
        for (const p of particlesByLen) {
          const i = c.indexOf(p);
          if (i === -1) continue;
          if (best === null || i < best.i) best = { i, p };
        }
        return best;
      };

      const tokenize = (c) => {
        if (!c) return [];
        if (c.length <= 1) return [c];
        // First try peeling a sentence-ender (か/ね/よ) so endings can then match
        const enderPeeled = peelSentenceEnder(c);
        if (enderPeeled) {
          return [...tokenize(enderPeeled[0]), enderPeeled[1]];
        }
        // Then try peeling a trailing verb/copula ending
        const peeled = peelEnding(c);
        if (peeled) {
          return [...tokenize(peeled[0]), peeled[1]];
        }
        // Otherwise split on first particle
        const fp = findFirstParticle(c);
        if (!fp) return [c];
        const before = c.slice(0, fp.i);
        const after = c.slice(fp.i + fp.p.length);
        const parts = [];
        if (before) parts.push(...tokenize(before));
        parts.push(fp.p);
        if (after) parts.push(...tokenize(after));
        return parts;
      };

      const chunks = tokenize(sentence).filter(x => x && x.trim().length > 0);
      const withIds = chunks.map((text, i) => ({ id: i, text }));
      setBuildTokens(shuffle(withIds));
      setBuildSelected([]);
      setBuildResult(null);
    }
  }, [idx, mode, deck, screen]);

  // ── Auto-speak card on change (study screen only) ───────────────────
  useEffect(() => {
    if (!card || screen !== "study" || !voiceOn) return;
    const timer = setTimeout(() => speak(card.front), 300);
    return () => clearTimeout(timer);
  }, [idx, screen, voiceOn, card, speak]);

  // ── Keyboard shortcuts during study ─────────────────────────────────
  useEffect(() => {
    if (screen !== "study" || finished) return;
    const h = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (mode === "flashcard") {
        if (e.key === " ") { e.preventDefault(); setFlipped(f => !f); }
        if (flipped && e.key === "1") next("again");
        if (flipped && e.key === "2") next("hard");
        if (flipped && e.key === "3") next("good");
        if (flipped && e.key === "4") next("easy");
      }
      if (e.key === "r" || e.key === "R") speakForce(card?.front);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  // ── Advance deck and write SRS progress ─────────────────────────────
  const next = useCallback((rating) => {
    // rating: "again"|"hard"|"good"|"easy" OR boolean (true=good, false=again) for legacy modes
    let r = rating;
    if (typeof rating === "boolean") r = rating ? "good" : "again";

    const wasCorrect = r !== "again";
    const ns = {
      correct: score.correct + (wasCorrect ? 1 : 0),
      incorrect: score.incorrect + (wasCorrect ? 0 : 1),
    };
    setScore(ns);

    // Update progress
    const up = JSON.parse(JSON.stringify(progress));
    const key = cardKey(card);
    up.cardStats[key] = srsReview(up.cardStats[key], r);
    up.totalAnswered += 1;
    up.totalCorrect += wasCorrect ? 1 : 0;

    // Day log
    const today = todayKey();
    if (!up.dayLog[today]) up.dayLog[today] = { cards: 0, correct: 0 };
    up.dayLog[today].cards += 1;
    up.dayLog[today].correct += wasCorrect ? 1 : 0;

    if (idx + 1 >= deck.length) {
      const pct = Math.round((ns.correct / deck.length) * 100);
      const duration = sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0;
      up.sessions += 1;
      up.history.push({
        date: new Date().toLocaleDateString(),
        score: pct, cards: deck.length, mode, duration,
      });
      if (up.history.length > 50) up.history = up.history.slice(-50);
      // Streak
      const todayStr = new Date().toDateString();
      if (up.lastStudied !== todayStr) {
        const y = new Date(Date.now() - DAY_MS).toDateString();
        up.streakDays = up.lastStudied === y ? (up.streakDays || 0) + 1 : 1;
        up.lastStudied = todayStr;
      }
      saveProgress(up);
      setFinished(true);
    } else {
      saveProgress(up);
      setIdx(i => i + 1);
      setFlipped(false);
      setQuizSelected(null); setWriteInput(""); setWriteResult(null);
      setListenRevealed(false); setListenSelected(null);
      setBuildSelected([]); setBuildResult(null);
    }
  }, [idx, deck, card, score, progress, mode, sessionStart, saveProgress]);

  // ── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const acc = progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0;
    const mastered = ALL_CARDS.filter(c => {
      const s = progress.cardStats[cardKey(c)];
      return s && s.attempts >= 2 && s.correct / s.attempts >= 0.8;
    }).length;
    const dueCount = ALL_CARDS.filter(c => {
      const s = progress.cardStats[cardKey(c)];
      return s && isDue(s);
    }).length;
    const weakCount = ALL_CARDS.filter(c => {
      const s = progress.cardStats[cardKey(c)];
      return s && s.attempts >= 2 && s.correct / s.attempts < 0.7;
    }).length;
    return { acc, mastered, total: ALL_CARDS.length, dueCount, weakCount, sessions: progress.sessions, history: progress.history };
  }, [progress]);

  const toggleCat = (cat) => setCategories(prev =>
    prev.includes(cat) ? (prev.length > 1 ? prev.filter(c => c !== cat) : prev) : [...prev, cat]
  );

  // ── Shared CSS ──────────────────────────────────────────────────────
  const fonts = `@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&display=swap');`;

  const appStyle = {
    minHeight: "100vh", background: t.appBg,
    fontFamily: "'Georgia', serif", color: t.text,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "20px",
    transition: "background 0.35s ease, color 0.35s ease",
  };

  const baseCSS = `${fonts}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${t.appBg}; }
    .btn { cursor: pointer; border: none; transition: all 0.18s ease; background: none; font-family: inherit; }
    .btn:hover:not(:disabled) { filter: brightness(0.96); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .fade-up { animation: fadeUp 0.3s ease both; }
  `;

  const DarkToggle = () => (
    <button className="btn" onClick={() => setDarkMode(d => !d)}
      title={darkMode ? "Light mode" : "Dark mode"}
      style={{ fontSize: 16, opacity: 0.85, padding: "4px 8px" }}>
      {darkMode ? "☀︎" : "☾"}
    </button>
  );

  // ══════════════════════════════════════════════════════════════════
  //  HOME SCREEN
  // ══════════════════════════════════════════════════════════════════
  if (screen === "home") {
    const deckPreview = buildSessionDeck();
    const estDue = ALL_CARDS.filter(c => {
      if (!categories.some(cat => CARD_DATA[cat]?.includes(c))) return false;
      const s = progress.cardStats[cardKey(c)];
      return s && isDue(s);
    }).length;

    return (
      <div style={appStyle}>
        <style>{baseCSS + `
          .cat-pill { border-radius: 24px; padding: 8px 14px; font-size: 12px; cursor: pointer; transition: all 0.2s; border: 1.5px solid; font-family: 'DM Mono', monospace; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px; }
          .mode-card { border-radius: 14px; padding: 14px 16px; cursor: pointer; transition: all 0.2s; border: 1.5px solid; text-align: left; width: 100%; }
          .mode-card:hover { transform: translateY(-1px); }
          .goal-chip { border-radius: 10px; padding: 7px 12px; font-size: 12px; cursor: pointer; transition: all 0.18s; border: 1.5px solid; font-family: 'DM Mono', monospace; }
        `}</style>

        <div style={{ maxWidth: 540, width: "100%" }} className="fade-up">
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
            <DarkToggle />
          </div>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: t.textMuted, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
              Japanese Study Tool
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, lineHeight: 1, marginBottom: 6, color: t.color }}>
              日本語
            </h1>
            <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 14 }}>
              Flashcards · Quiz · Listen · Write · Build
            </p>
            <button className="btn" onClick={() => setScreen("kana")}
              style={{ background: t.color, color: "#fff", padding: "7px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: `0 2px 10px ${t.color}44` }}>
              かなカナ Hiragana &amp; Katakana →
            </button>
          </div>

          {/* Progress preview & streak */}
          {progress.sessions > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <div onClick={() => setScreen("progress")} style={{ flex: 1, background: t.surfaceBg, border: `1px solid ${t.color}33`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Progress</span>
                  <span style={{ fontSize: 11, color: t.color, fontFamily: "'DM Mono', monospace" }}>View →</span>
                </div>
                <div style={{ height: 4, background: t.progressTrack, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0}%`, background: t.color, borderRadius: 2, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>
                  {stats.mastered}/{stats.total} mastered · {stats.acc}%
                </div>
              </div>
              {stats.dueCount > 0 && (
                <div onClick={() => { setSessionGoal({ kind: "due", value: 0 }); setDueOnly(true); setTimeout(() => startStudy(), 0); }}
                  style={{ flex: 1, background: t.surfaceBg, border: `1px solid ${t.color}33`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Due today</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: t.color, fontFamily: "'DM Mono', monospace" }}>{stats.dueCount}</span>
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>
                    {stats.weakCount > 0 ? (
                      <button className="btn" onClick={(e) => { e.stopPropagation(); startWeakReview(); }} style={{ color: t.color, textDecoration: "underline", fontSize: 11 }}>
                        Review {stats.weakCount} weak →
                      </button>
                    ) : (
                      <span>tap to review due cards</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {progress.streakDays > 0 && (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: t.streakBg, border: `1px solid ${t.streakBorder}`, borderRadius: 20, padding: "5px 14px" }}>
                <span>🔥</span>
                <span style={{ fontSize: 12, color: t.streakText, fontFamily: "'DM Mono', monospace" }}>{progress.streakDays} day streak</span>
              </div>
            </div>
          )}

          {/* Topics */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: t.textFaint, marginBottom: 10, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Topics</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {CATEGORY_META.map(({ id, label, icon, count }) => {
                const active = categories.includes(id);
                return (
                  <button key={id} className="cat-pill btn" onClick={() => toggleCat(id)}
                    style={{
                      background: active ? `${t.color}18` : "transparent",
                      color: active ? t.color : t.textMuted,
                      borderColor: active ? t.color : t.surfaceBorder,
                    }}>
                    <span style={{ fontFamily: jf, fontSize: 13, fontWeight: 700 }}>{icon}</span>
                    <span>{label}</span>
                    <span style={{ opacity: 0.6, fontSize: 10 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: t.textFaint, marginBottom: 10, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Study Mode</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["flashcard", "Flashcards", "Tap to reveal", "🃏"],
                ["quiz",      "Multiple Choice", "Pick the answer", "🎯"],
                ["write",     "Write It", "Type translation", "✍️"],
                ["listen",    "Listen", "Audio-only recall", "🎧"],
                ["build",     "Build Sentence", "Arrange tokens", "🧩"],
              ].map(([m, title, desc, icon]) => (
                <button key={m} className="mode-card btn" onClick={() => setMode(m)}
                  style={{
                    background: mode === m ? `${t.color}12` : t.surfaceBg,
                    borderColor: mode === m ? t.color : t.surfaceBorder,
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: mode === m ? t.color : t.raisedBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: mode === m ? t.color : t.text }}>{title}</div>
                      <div style={{ fontSize: 10, color: t.textMuted }}>{desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {mode === "build" && (
              <div style={{ marginTop: 8, fontSize: 11, color: t.textMuted, fontStyle: "italic", textAlign: "center" }}>
                Build mode uses the Sentences deck automatically.
              </div>
            )}
          </div>

          {/* Session goal */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: t.textFaint, marginBottom: 10, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Session Goal</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { kind: "cards", value: 10, label: "10 cards" },
                { kind: "cards", value: 20, label: "20 cards" },
                { kind: "cards", value: 40, label: "40 cards" },
                { kind: "due",   value: 0,  label: `Due only${estDue > 0 ? ` (${estDue})` : ""}` },
              ].map(g => {
                const active = sessionGoal.kind === g.kind && sessionGoal.value === g.value;
                return (
                  <button key={g.label} className="goal-chip btn" onClick={() => setSessionGoal({ kind: g.kind, value: g.value })}
                    style={{
                      background: active ? t.color : "transparent",
                      color: active ? "#fff" : t.textMuted,
                      borderColor: active ? t.color : t.surfaceBorder,
                    }}>
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Romanji + voice toggles */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 22, fontSize: 12, color: t.textMuted }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <span>Show romanji</span>
              <div onClick={() => setShowRomanji(v => !v)} style={{ width: 38, height: 20, borderRadius: 10, background: showRomanji ? t.color : t.progressTrack, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 2, left: showRomanji ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <span>Voice</span>
              <div onClick={() => setVoiceOn(v => !v)} style={{ width: 38, height: 20, borderRadius: 10, background: voiceOn ? t.color : t.progressTrack, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 2, left: voiceOn ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
            </label>
          </div>

          {/* Primary actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn" onClick={startStudy} disabled={deckPreview.length === 0}
              style={{ background: t.color, color: "#fff", padding: "14px 36px", borderRadius: 50, fontSize: 15, fontWeight: 700, letterSpacing: 0.5, boxShadow: `0 4px 24px ${t.color}44`, fontFamily: "'Playfair Display', serif" }}>
              Start · {deckPreview.length} cards →
            </button>
            <button className="btn" onClick={() => setScreen("progress")}
              style={{ background: t.surfaceBg, color: t.textMuted, padding: "14px 16px", borderRadius: 50, fontSize: 16, border: `1px solid ${t.surfaceBorder}` }}
              title="Progress">📊</button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>
            Press <kbd style={{ background: t.btnGhost, padding: "1px 5px", borderRadius: 3 }}>space</kbd> to flip · <kbd style={{ background: t.btnGhost, padding: "1px 5px", borderRadius: 3 }}>1–4</kbd> to rate · <kbd style={{ background: t.btnGhost, padding: "1px 5px", borderRadius: 3 }}>r</kbd> to replay
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  PROGRESS / ANALYTICS SCREEN
  // ══════════════════════════════════════════════════════════════════
  if (screen === "progress") {
    // Build 12-week heatmap data
    const today = new Date();
    const weeks = 12;
    const days = weeks * 7;
    const heatData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const log = progress.dayLog[key];
      heatData.push({ date: d, key, cards: log?.cards || 0, correct: log?.correct || 0 });
    }

    // Heat intensity buckets
    const maxCards = Math.max(1, ...heatData.map(d => d.cards));
    const heatColor = (n) => {
      if (n === 0) return t.heatmap[0];
      if (n < maxCards * 0.25) return t.heatmap[1];
      if (n < maxCards * 0.5) return t.heatmap[2];
      if (n < maxCards * 0.75) return t.heatmap[3];
      return t.heatmap[4];
    };

    // Per-category mastery
    const catMastery = CATEGORY_META.map(cat => {
      const cards = CARD_DATA[cat.id];
      const mastered = cards.filter(c => {
        const s = progress.cardStats[cardKey(c)];
        return s && s.attempts >= 2 && s.correct / s.attempts >= 0.8;
      }).length;
      const seen = cards.filter(c => progress.cardStats[cardKey(c)]).length;
      return { ...cat, mastered, seen, total: cards.length };
    });

    // Weak cards
    const weakCards = ALL_CARDS
      .map(c => ({ c, s: progress.cardStats[cardKey(c)] }))
      .filter(({ s }) => s && s.attempts >= 2 && s.correct / s.attempts < 0.7)
      .sort((a, b) => (a.s.correct / a.s.attempts) - (b.s.correct / b.s.attempts))
      .slice(0, 8);

    // Score trend (last 14 sessions)
    const trend = progress.history.slice(-14);
    const maxChartH = 60;

    return (
      <div style={{ ...appStyle, justifyContent: "flex-start", paddingTop: 28 }}>
        <style>{baseCSS + `
          .heat-cell { border-radius: 3px; transition: transform 0.15s; cursor: pointer; }
          .heat-cell:hover { transform: scale(1.4); z-index: 1; }
        `}</style>

        <div style={{ maxWidth: 560, width: "100%" }} className="fade-up">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <button className="btn" onClick={() => setScreen("home")}
              style={{ background: t.btnGhost, color: t.btnGhostText, padding: "6px 14px", borderRadius: 20, fontSize: 12, border: `1px solid ${t.btnGhostBorder}` }}>← Back</button>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900 }}>Progress</h2>
            <DarkToggle />
          </div>

          {/* Stat tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
            {[
              ["🔥", progress.streakDays || 0, "Streak"],
              [`${stats.acc}%`, null, "Accuracy"],
              [`${stats.mastered}`, null, "Mastered"],
              [stats.sessions, null, "Sessions"],
            ].map(([val, , label]) => (
              <div key={label} style={{ background: t.surfaceBg, borderRadius: 14, padding: "14px 8px", textAlign: "center", border: `1px solid ${t.surfaceBorder}` }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: t.color, fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{val}</div>
                <div style={{ fontSize: 9, color: t.textFaint, marginTop: 6, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div style={{ background: t.surfaceBg, borderRadius: 14, padding: "16px 20px", marginBottom: 14, border: `1px solid ${t.surfaceBorder}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Study Activity</span>
              <span style={{ fontSize: 10, color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>last {weeks} weeks</span>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {/* Build weekly columns */}
              {Array.from({ length: weeks }).map((_, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {Array.from({ length: 7 }).map((_, di) => {
                    const i = wi * 7 + di;
                    const d = heatData[i];
                    if (!d) return <div key={di} style={{ width: 13, height: 13 }} />;
                    const label = `${d.date.toLocaleDateString()} · ${d.cards} cards${d.cards > 0 ? `, ${Math.round((d.correct / d.cards) * 100)}%` : ""}`;
                    return (
                      <div key={di} className="heat-cell"
                        title={label}
                        style={{ width: 13, height: 13, background: heatColor(d.cards) }} />
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 10, fontSize: 10, color: t.textFaint }}>
              <span style={{ fontFamily: "'DM Mono', monospace" }}>less</span>
              {t.heatmap.map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
              ))}
              <span style={{ fontFamily: "'DM Mono', monospace" }}>more</span>
            </div>
          </div>

          {/* Score trend */}
          {trend.length >= 2 && (
            <div style={{ background: t.surfaceBg, borderRadius: 14, padding: "16px 20px", marginBottom: 14, border: `1px solid ${t.surfaceBorder}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Score Trend</span>
                <span style={{ fontSize: 10, color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>last {trend.length} sessions</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: maxChartH + 18, position: "relative" }}>
                {/* 50% reference line */}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: maxChartH / 2 + 18, height: 1, background: t.textFaint, opacity: 0.3 }} />
                {trend.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div title={`${h.date} · ${h.mode}`}
                      style={{
                        width: "100%", borderRadius: "3px 3px 0 0",
                        height: `${Math.max(4, (h.score / 100) * maxChartH)}px`,
                        background: i === trend.length - 1 ? t.color : h.score >= 80 ? "#2ecc71" : h.score >= 50 ? "#f1c40f" : "#e74c3c",
                        opacity: i === trend.length - 1 ? 1 : 0.55,
                        transition: "height 0.5s ease",
                      }} />
                    <div style={{ fontSize: 9, color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>{h.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-category mastery */}
          <div style={{ background: t.surfaceBg, borderRadius: 14, padding: "16px 20px", marginBottom: 14, border: `1px solid ${t.surfaceBorder}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Mastery by Category</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {catMastery.map(cm => (
                <div key={cm.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: jf, color: t.color, fontSize: 14, fontWeight: 700 }}>{cm.icon}</span>
                      <span>{cm.label}</span>
                    </span>
                    <span style={{ color: t.textMuted, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                      {cm.mastered}/{cm.total}
                    </span>
                  </div>
                  <div style={{ height: 5, background: t.progressTrack, borderRadius: 3, overflow: "hidden", position: "relative" }}>
                    {/* Seen bar (lighter) */}
                    <div style={{ height: "100%", width: `${(cm.seen / cm.total) * 100}%`, background: `${t.color}44`, borderRadius: 3, position: "absolute", left: 0, top: 0 }} />
                    {/* Mastered bar (solid) */}
                    <div style={{ height: "100%", width: `${(cm.mastered / cm.total) * 100}%`, background: t.color, borderRadius: 3, position: "absolute", left: 0, top: 0, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: t.textFaint, marginTop: 10, fontFamily: "'DM Mono', monospace" }}>
              solid = mastered · faded = seen
            </div>
          </div>

          {/* Weak cards */}
          {weakCards.length > 0 && (
            <div style={{ background: t.surfaceBg, borderRadius: 14, padding: "16px 20px", marginBottom: 14, border: `1px solid ${t.surfaceBorder}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Weak Cards</span>
                <button className="btn" onClick={startWeakReview}
                  style={{ color: t.color, fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                  Review all →
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {weakCards.map(({ c, s }) => {
                  const rate = Math.round((s.correct / s.attempts) * 100);
                  return (
                    <div key={cardKey(c)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: t.raisedBg, borderRadius: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                        <span style={{ fontFamily: jf, fontSize: 20, fontWeight: 700, color: t.color, flexShrink: 0 }}>{c.front}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.back}</div>
                          <div style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>
                            {c.romanji} · {s.correct}/{s.attempts} · next {formatInterval(s)}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#e74c3c", fontFamily: "'DM Mono', monospace", flexShrink: 0, marginLeft: 10 }}>{rate}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent sessions */}
          <div style={{ background: t.surfaceBg, borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: `1px solid ${t.surfaceBorder}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Recent Sessions</div>
            {progress.history.length === 0 ? (
              <div style={{ color: t.textFaint, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No sessions yet — start studying!</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[...progress.history].reverse().slice(0, 6).map((h, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: t.raisedBg, borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: h.score >= 80 ? "rgba(46,204,113,0.15)" : h.score >= 50 ? "rgba(241,196,15,0.15)" : "rgba(231,76,60,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                        {h.score >= 80 ? "🌟" : h.score >= 50 ? "💪" : "📖"}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{h.cards} cards · {h.mode}{h.duration ? ` · ${Math.round(h.duration / 60)}m` : ""}</div>
                        <div style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>{h.date}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'DM Mono', monospace", color: h.score >= 80 ? "#2ecc71" : h.score >= 50 ? "#e6a817" : "#e74c3c" }}>{h.score}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn" onClick={startStudy}
            style={{ width: "100%", background: t.color, color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, boxShadow: `0 4px 20px ${t.color}44`, fontFamily: "'Playfair Display', serif" }}>
            Study Now →
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  KANA REFERENCE SCREEN (Hiragana / Katakana / Quiz)
  // ══════════════════════════════════════════════════════════════════
  if (screen === "kana") {
    const startKanaQuiz = (pool) => {
      const p = shuffle([...pool]);
      setKanaQuizPool(p);
      setKanaQuizIdx(0);
      setKanaQuizSelected(null);
      setKanaQuizScore({ correct: 0, incorrect: 0 });
      setKanaQuizDone(false);
      setKanaSection("quiz");
      if (p[0]) setTimeout(() => speakForce(p[0].char), 400);
    };

    const kanaNext = (wasCorrect) => {
      const ns = {
        correct: kanaQuizScore.correct + (wasCorrect ? 1 : 0),
        incorrect: kanaQuizScore.incorrect + (wasCorrect ? 0 : 1),
      };
      setKanaQuizScore(ns);
      if (kanaQuizIdx + 1 >= kanaQuizPool.length) {
        setKanaQuizDone(true);
      } else {
        const ni = kanaQuizIdx + 1;
        setKanaQuizIdx(ni);
        setKanaQuizSelected(null);
        if (kanaQuizPool[ni]) setTimeout(() => speakForce(kanaQuizPool[ni].char), 300);
      }
    };

    const qCard = kanaQuizPool[kanaQuizIdx];
    const getKanaOpts = (c, pool) => {
      const others = pool.filter(x => x.romanji !== c.romanji);
      return shuffle([c.romanji, ...shuffle(others).slice(0, 3).map(x => x.romanji)]);
    };

    const rows = kanaSection === "hiragana" ? HIRAGANA_ROWS
               : kanaSection === "katakana" ? KATAKANA_ROWS
               : null;

    return (
      <div style={{ ...appStyle, justifyContent: "flex-start", paddingTop: 28 }}>
        <style>{baseCSS + `
          .ktab { border-radius: 10px; padding: 9px 16px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; font-family: 'DM Mono', monospace; }
          .kcell { cursor: pointer; padding: 5px 2px; text-align: center; border-radius: 6px; transition: background 0.15s; }
          .kcell:hover { background: ${t.color}18; }
          .qopt { width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 15px; cursor: pointer; border: 1.5px solid; text-align: left; transition: all 0.18s; background: none; font-family: 'DM Mono', monospace; }
          .qopt:hover:not(:disabled) { transform: translateX(2px); }
        `}</style>

        <div style={{ maxWidth: 560, width: "100%" }} className="fade-up">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button className="btn" onClick={() => { setKanaSection("hiragana"); setKanaQuizPool([]); setScreen("home"); }}
              style={{ background: t.btnGhost, color: t.btnGhostText, padding: "6px 14px", borderRadius: 20, fontSize: 12, border: `1px solid ${t.btnGhostBorder}` }}>← Back</button>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900 }}>
              <span style={{ color: t.color }}>かな</span> <span style={{ color: t.textMuted, fontSize: 16 }}>/</span> <span style={{ color: t.color }}>カナ</span>
            </h2>
            <DarkToggle />
          </div>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18, background: t.btnGhost, borderRadius: 12, padding: 4 }}>
            {[["hiragana", "Hiragana"], ["katakana", "Katakana"], ["quiz", "Quiz"]].map(([id, label]) => {
              const active = kanaSection === id;
              return (
                <button key={id} className="ktab" onClick={() => {
                  if (id === "quiz") return;
                  setKanaSection(id);
                }}
                  style={{
                    flex: 1,
                    background: active ? t.color : "transparent",
                    color: active ? "#fff" : t.tabInactiveText,
                    boxShadow: active ? `0 2px 10px ${t.color}44` : "none",
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Reference grid (hiragana / katakana) */}
          {rows && (
            <>
              <div style={{ background: t.surfaceBg, borderRadius: 14, padding: "14px 12px", border: `1px solid ${t.surfaceBorder}`, marginBottom: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "30px repeat(5, 1fr)", gap: 3, alignItems: "center" }}>
                  <div />
                  {["a","i","u","e","o"].map(v => (
                    <div key={v} style={{ textAlign: "center", fontSize: 10, color: t.textFaint, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>{v}</div>
                  ))}
                  {rows.map((row, ri) => (
                    <React.Fragment key={ri}>
                      <div style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace", textAlign: "center" }}>{row.consonant}</div>
                      {row.chars.map((ch, ci) => (
                        ch ? (
                          <div key={ci} className="kcell"
                            onClick={() => speakForce(ch)}
                            title={row.sounds[ci]}>
                            <div style={{ fontFamily: jf, fontSize: 22, fontWeight: 700, color: t.color }}>{ch}</div>
                            <div style={{ fontSize: 9, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>{row.sounds[ci]}</div>
                          </div>
                        ) : <div key={ci} />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 10, color: t.textFaint, textAlign: "center", marginBottom: 18, fontFamily: "'DM Mono', monospace" }}>
                tap any character to hear it
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn" onClick={() => startKanaQuiz(kanaSection === "hiragana" ? HIRAGANA_QUIZ_POOL : KATAKANA_QUIZ_POOL)}
                  style={{ background: t.color, color: "#fff", padding: "10px 20px", borderRadius: 30, fontSize: 13, fontWeight: 700 }}>
                  Quiz this chart →
                </button>
              </div>
            </>
          )}

          {/* Quiz */}
          {kanaSection === "quiz" && (
            <div>
              {kanaQuizDone ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>
                    {Math.round((kanaQuizScore.correct / kanaQuizPool.length) * 100) >= 80 ? "🎉" : "💪"}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Quiz Complete</div>
                  <div style={{ color: t.textMuted, marginBottom: 22, fontSize: 13 }}>{kanaQuizPool.length} characters</div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 22 }}>
                    {[
                      ["Correct", kanaQuizScore.correct, "#27ae60"],
                      ["Wrong", kanaQuizScore.incorrect, "#c0392b"],
                      ["Score", `${Math.round((kanaQuizScore.correct / kanaQuizPool.length) * 100)}%`, t.color],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{ background: t.surfaceBg, borderRadius: 12, padding: "12px 16px", minWidth: 75, border: `1px solid ${t.surfaceBorder}` }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'DM Mono', monospace" }}>{val}</div>
                        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button className="btn" onClick={() => startKanaQuiz(kanaQuizPool)}
                      style={{ background: t.color, color: "#fff", padding: "10px 22px", borderRadius: 30, fontSize: 13, fontWeight: 700 }}>Try Again</button>
                    <button className="btn" onClick={() => { setKanaQuizPool([]); setKanaSection("hiragana"); }}
                      style={{ background: t.surfaceBg, color: t.text, padding: "10px 22px", borderRadius: 30, fontSize: 13, fontWeight: 700, border: `1px solid ${t.surfaceBorder}` }}>Back</button>
                  </div>
                </div>
              ) : qCard ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>
                      <span style={{ color: t.color, fontWeight: 700 }}>{kanaQuizIdx + 1}</span> / {kanaQuizPool.length}
                    </div>
                    <div style={{ display: "flex", gap: 10, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                      <span style={{ color: "#27ae60" }}>✓ {kanaQuizScore.correct}</span>
                      <span style={{ color: "#c0392b" }}>✗ {kanaQuizScore.incorrect}</span>
                    </div>
                  </div>
                  <div style={{ height: 3, background: t.progressTrack, borderRadius: 2, marginBottom: 22, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(kanaQuizIdx / kanaQuizPool.length) * 100}%`, background: t.color, borderRadius: 2, transition: "width 0.3s ease" }} />
                  </div>
                  <div style={{ background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 18, padding: "44px 28px", textAlign: "center", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: 80, fontFamily: jf, color: t.color, lineHeight: 1 }}>{qCard.char}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                    <button className="btn" onClick={() => speakForce(qCard.char)}
                      style={{ background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 20, padding: "5px 14px", fontSize: 13, color: t.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                      🔊 <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>replay</span>
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {getKanaOpts(qCard, kanaQuizPool).map(opt => {
                      const sel = kanaQuizSelected === opt;
                      const isCorr = opt === qCard.romanji;
                      let bg = t.surfaceBg, color = t.text, border = `1.5px solid ${t.surfaceBorder}`;
                      if (kanaQuizSelected) {
                        if (isCorr) { bg = "rgba(46,204,113,0.1)"; color = "#27ae60"; border = "1.5px solid rgba(46,204,113,0.4)"; }
                        else if (sel) { bg = "rgba(231,76,60,0.1)"; color = "#c0392b"; border = "1.5px solid rgba(231,76,60,0.4)"; }
                      }
                      return (
                        <button key={opt} className="qopt" disabled={!!kanaQuizSelected}
                          onClick={() => { setKanaQuizSelected(opt); setTimeout(() => kanaNext(opt === qCard.romanji), 750); }}
                          style={{ background: bg, color, border }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  SESSION COMPLETE
  // ══════════════════════════════════════════════════════════════════
  if (finished) {
    const total = score.correct + score.incorrect;
    const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;
    const duration = sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0;
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;

    return (
      <div style={appStyle}>
        <style>{baseCSS}</style>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }} className="fade-up">
          <div style={{ fontSize: 56, marginBottom: 14 }}>{pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚"}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 8 }}>Session Complete</h2>
          <div style={{ color: t.textMuted, marginBottom: 24, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
            {deck.length} cards · {mode} · {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
            {[
              ["Correct", score.correct, "#2ecc71"],
              ["Wrong", score.incorrect, "#e74c3c"],
              ["Score", `${pct}%`, t.color],
            ].map(([label, val, color]) => (
              <div key={label} style={{ background: t.surfaceBg, borderRadius: 12, padding: "14px 16px", minWidth: 80, border: `1px solid ${t.surfaceBorder}` }}>
                <div style={{ fontSize: 24, fontWeight: 900, color, fontFamily: "'DM Mono', monospace" }}>{val}</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn" onClick={startStudy}
              style={{ background: t.color, color: "#fff", padding: "11px 22px", borderRadius: 30, fontSize: 13, fontWeight: 700 }}>Study Again</button>
            <button className="btn" onClick={() => setScreen("progress")}
              style={{ background: t.surfaceBg, color: t.text, padding: "11px 22px", borderRadius: 30, fontSize: 13, fontWeight: 700, border: `1px solid ${t.surfaceBorder}` }}>📊 Progress</button>
            <button className="btn" onClick={() => setScreen("home")}
              style={{ background: "transparent", color: t.textMuted, padding: "11px 22px", borderRadius: 30, fontSize: 13, border: `1px solid ${t.surfaceBorder}` }}>Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  STUDY SCREEN — 5 modes (flashcard, quiz, write, listen, build)
  // ══════════════════════════════════════════════════════════════════
  // SRS rating buttons (4-way Anki-style)
  const RatingButtons = () => {
    const stat = progress.cardStats[cardKey(card)];
    const preview = (r) => formatInterval(srsReview(stat, r));
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          ["again", "Again", "#c0392b", "1"],
          ["hard",  "Hard",  "#e67e22", "2"],
          ["good",  "Good",  "#27ae60", "3"],
          ["easy",  "Easy",  "#2980b9", "4"],
        ].map(([r, label, color, key]) => (
          <button key={r} className="btn" onClick={() => next(r)}
            style={{
              background: `${color}14`, color,
              border: `1.5px solid ${color}66`,
              padding: "10px 4px", borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              display: "flex", flexDirection: "column", gap: 2, alignItems: "center",
              fontFamily: "inherit",
            }}>
            <div>{label}</div>
            <div style={{ fontSize: 9, opacity: 0.75, fontFamily: "'DM Mono', monospace", fontWeight: 400 }}>
              {preview(r)} <span style={{ opacity: 0.5 }}>· {key}</span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={appStyle}>
      <style>{baseCSS + `
        .flip-card { perspective: 1000px; cursor: pointer; }
        .flip-inner { transition: transform 0.45s; transform-style: preserve-3d; position: relative; }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; position: absolute; top:0; left:0; width:100%; height:100%; border-radius: 18px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 28px; text-align: center; }
        .flip-back { transform: rotateY(180deg); }
        .opt-btn { width:100%; padding: 12px 16px; border-radius: 12px; font-size: 15px; cursor:pointer; transition: all 0.18s; text-align:left; font-family: 'Georgia', serif; }
        .opt-btn:hover:not(:disabled) { transform: translateX(3px); }
        .token { display: inline-block; padding: 8px 12px; border-radius: 8px; background: ${t.surfaceBg}; border: 1.5px solid ${t.surfaceBorder}; font-family: ${jf}; font-size: 18px; cursor: pointer; transition: all 0.15s; user-select: none; }
        .token:hover:not(.placed):not(:disabled) { transform: translateY(-2px); background: ${t.color}18; border-color: ${t.color}; }
        .token.placed { opacity: 0.3; cursor: default; }
        input:focus { outline: 2px solid ${t.color}; outline-offset: 0; }
      `}</style>

      <div style={{ maxWidth: 490, width: "100%" }} className="fade-up">
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button className="btn" onClick={() => setScreen("home")}
            style={{ background: t.btnGhost, color: t.btnGhostText, padding: "5px 12px", borderRadius: 20, fontSize: 12, border: `1px solid ${t.btnGhostBorder}` }}>← Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: t.textMuted }}>
              <span style={{ color: t.color, fontWeight: 700 }}>{idx + 1}</span> / {deck.length}
            </div>
            <button className="btn" onClick={() => setVoiceOn(v => !v)} title={voiceOn ? "Mute" : "Unmute"}
              style={{ fontSize: 16, opacity: voiceOn ? 1 : 0.35, padding: "2px 4px" }}>
              {voiceOn ? "🔊" : "🔇"}
            </button>
            <DarkToggle />
          </div>
          <div style={{ display: "flex", gap: 8, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
            <span style={{ color: "#2ecc71" }}>✓ {score.correct}</span>
            <span style={{ color: "#e74c3c" }}>✗ {score.incorrect}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: t.progressTrack, borderRadius: 2, marginBottom: 22, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(idx / deck.length) * 100}%`, background: t.color, borderRadius: 2, transition: "width 0.4s ease" }} />
        </div>

        {/* Type badge + SRS info */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ background: `${t.color}15`, color: t.color, padding: "3px 12px", borderRadius: 20, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
            {card?.type}
          </span>
          {card && progress.cardStats[cardKey(card)] && (
            <span style={{ fontSize: 10, color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>
              seen {progress.cardStats[cardKey(card)].attempts}× · next {formatInterval(progress.cardStats[cardKey(card)])}
            </span>
          )}
        </div>

        {/* ═══════ FLASHCARD MODE ═══════ */}
        {mode === "flashcard" && card && (
          <>
            <div className="flip-card" style={{ height: 220, marginBottom: 12 }} onClick={() => setFlipped(f => !f)}>
              <div className={`flip-inner ${flipped ? "flipped" : ""}`} style={{ height: 220 }}>
                <div className="flip-face" style={{ background: t.cardFront, border: `1px solid ${t.cardFrontBorder}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: card.front.length > 10 ? 32 : 60, fontFamily: jf, color: t.cardFrontChar, lineHeight: 1.3 }}>{card.front}</div>
                  {showRomanji && <div style={{ fontSize: 13, color: t.textMuted, fontFamily: "'DM Mono', monospace", marginTop: 12 }}>{card.romanji}</div>}
                  <div style={{ marginTop: 18, fontSize: 11, color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>tap or press space to reveal</div>
                </div>
                <div className="flip-face flip-back" style={{ background: t.color, border: `1px solid ${t.color}` }}>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#fff", marginBottom: 8 }}>{card.back}</div>
                  {showRomanji && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Mono', monospace" }}>{card.romanji}</div>}
                  {card.note && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 12, padding: "0 14px", fontStyle: "italic", lineHeight: 1.4 }}>
                      {card.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <button className="btn" onClick={(e) => { e.stopPropagation(); speakForce(card.front); }}
                style={{ background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 20, padding: "5px 14px", fontSize: 13, color: t.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                🔊 <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>replay</span>
              </button>
            </div>
            {flipped && <RatingButtons />}
            {!flipped && (
              <div style={{ textAlign: "center", fontSize: 11, color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>
                reveal the answer to rate
              </div>
            )}
          </>
        )}

        {/* ═══════ QUIZ MODE ═══════ */}
        {mode === "quiz" && card && (
          <>
            <div style={{ background: t.cardFront, border: `1px solid ${t.cardFrontBorder}`, borderRadius: 18, padding: "32px 24px", textAlign: "center", marginBottom: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: card.front.length > 10 ? 28 : 52, fontFamily: jf, color: t.cardFrontChar, lineHeight: 1.3 }}>{card.front}</div>
              {showRomanji && <div style={{ fontSize: 13, color: t.textMuted, fontFamily: "'DM Mono', monospace", marginTop: 10 }}>{card.romanji}</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <button className="btn" onClick={() => speakForce(card.front)}
                style={{ background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 20, padding: "5px 14px", fontSize: 13, color: t.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                🔊 <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>replay</span>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quizOptions.map(opt => {
                const sel = quizSelected === opt;
                const isCorr = opt === card.back;
                let bg = t.surfaceBg, color = t.text, border = `1.5px solid ${t.surfaceBorder}`;
                if (quizSelected) {
                  if (isCorr) { bg = "rgba(46,204,113,0.1)"; color = "#27ae60"; border = "1.5px solid rgba(46,204,113,0.4)"; }
                  else if (sel) { bg = "rgba(231,76,60,0.1)"; color = "#c0392b"; border = "1.5px solid rgba(231,76,60,0.4)"; }
                }
                return (
                  <button key={opt} className="opt-btn" disabled={!!quizSelected}
                    onClick={() => { setQuizSelected(opt); setTimeout(() => next(opt === card.back ? "good" : "again"), 750); }}
                    style={{ background: bg, color, border }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ═══════ WRITE MODE ═══════ */}
        {mode === "write" && card && (
          <>
            <div style={{ background: t.cardFront, border: `1px solid ${t.cardFrontBorder}`, borderRadius: 18, padding: "32px 24px", textAlign: "center", marginBottom: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: card.front.length > 10 ? 28 : 52, fontFamily: jf, color: t.cardFrontChar, lineHeight: 1.3 }}>{card.front}</div>
              {showRomanji && <div style={{ fontSize: 13, color: t.textMuted, fontFamily: "'DM Mono', monospace", marginTop: 10 }}>{card.romanji}</div>}
              <div style={{ fontSize: 11, color: t.textFaint, marginTop: 12, fontFamily: "'DM Mono', monospace" }}>Type the English meaning</div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <button className="btn" onClick={() => speakForce(card.front)}
                style={{ background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 20, padding: "5px 14px", fontSize: 13, color: t.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                🔊 <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>replay</span>
              </button>
            </div>
            <input type="text" value={writeInput}
              onChange={(e) => { setWriteInput(e.target.value); setWriteResult(null); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && writeInput.trim() && !writeResult) {
                  const input = writeInput.trim().toLowerCase();
                  const target = card.back.toLowerCase();
                  const targetFirst = target.split(/[\s\/\(,]/)[0].trim();
                  const ok = input.includes(targetFirst) || target.includes(input);
                  setWriteResult(ok ? "correct" : "incorrect");
                  setTimeout(() => next(ok ? "good" : "again"), 900);
                }
              }}
              placeholder="Type translation, press Enter…"
              disabled={!!writeResult}
              autoFocus
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                background: writeResult === "correct" ? "rgba(46,204,113,0.08)"
                          : writeResult === "incorrect" ? "rgba(231,76,60,0.08)"
                          : t.inputBg,
                border: `1.5px solid ${writeResult === "correct" ? "rgba(46,204,113,0.4)"
                                     : writeResult === "incorrect" ? "rgba(231,76,60,0.4)"
                                     : t.inputBorder}`,
                color: t.text, fontSize: 15, fontFamily: "'Georgia', serif",
                transition: "border-color 0.2s, background 0.2s",
              }} />
            {writeResult && (
              <div style={{ marginTop: 10, textAlign: "center", fontSize: 14, color: writeResult === "correct" ? "#27ae60" : "#c0392b" }}>
                {writeResult === "correct" ? "✓ Correct!" : `✗ Answer: "${card.back}"`}
              </div>
            )}
          </>
        )}

        {/* ═══════ LISTEN MODE ═══════ */}
        {mode === "listen" && card && (
          <>
            <div style={{ background: t.cardFront, border: `1px solid ${t.cardFrontBorder}`, borderRadius: 18, padding: "48px 24px", textAlign: "center", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 11, color: t.textFaint, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>
                Listen carefully
              </div>
              <button className="btn" onClick={() => speakForce(card.front)}
                style={{ background: t.color, color: "#fff", width: 72, height: 72, borderRadius: "50%", fontSize: 28, boxShadow: `0 4px 20px ${t.color}66`, marginBottom: 14 }}>
                🔊
              </button>
              <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>
                tap to hear · press <kbd style={{ background: t.btnGhost, padding: "1px 4px", borderRadius: 3 }}>r</kbd> to replay
              </div>
              {listenRevealed && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${t.surfaceBorder}` }}>
                  <div style={{ fontSize: 32, fontFamily: jf, color: t.cardFrontChar }}>{card.front}</div>
                  {showRomanji && <div style={{ fontSize: 12, color: t.textMuted, fontFamily: "'DM Mono', monospace", marginTop: 6 }}>{card.romanji}</div>}
                </div>
              )}
            </div>
            {!listenRevealed && (
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <button className="btn" onClick={() => setListenRevealed(true)}
                  style={{ background: "transparent", color: t.textMuted, fontSize: 11, padding: "4px 12px", fontFamily: "'DM Mono', monospace", border: `1px solid ${t.surfaceBorder}`, borderRadius: 20 }}>
                  show characters
                </button>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {listenOptions.map(opt => {
                const sel = listenSelected === opt;
                const isCorr = opt === card.back;
                let bg = t.surfaceBg, color = t.text, border = `1.5px solid ${t.surfaceBorder}`;
                if (listenSelected) {
                  if (isCorr) { bg = "rgba(46,204,113,0.1)"; color = "#27ae60"; border = "1.5px solid rgba(46,204,113,0.4)"; }
                  else if (sel) { bg = "rgba(231,76,60,0.1)"; color = "#c0392b"; border = "1.5px solid rgba(231,76,60,0.4)"; }
                }
                return (
                  <button key={opt} className="opt-btn" disabled={!!listenSelected}
                    onClick={() => { setListenSelected(opt); setTimeout(() => next(opt === card.back ? "good" : "again"), 900); }}
                    style={{ background: bg, color, border }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ═══════ BUILD SENTENCE MODE ═══════ */}
        {mode === "build" && card && (
          <>
            <div style={{ background: t.cardFront, border: `1px solid ${t.cardFrontBorder}`, borderRadius: 18, padding: "24px 20px", textAlign: "center", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 11, color: t.textFaint, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
                Arrange this in Japanese
              </div>
              <div style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: t.color, fontStyle: "italic" }}>
                "{card.back}"
              </div>
              {showRomanji && (
                <div style={{ fontSize: 12, color: t.textMuted, fontFamily: "'DM Mono', monospace", marginTop: 8 }}>
                  hint: {card.romanji}
                </div>
              )}
            </div>

            {/* Build area */}
            <div style={{
              minHeight: 60,
              background: buildResult === "correct" ? "rgba(46,204,113,0.08)"
                        : buildResult === "incorrect" ? "rgba(231,76,60,0.08)"
                        : t.inputBg,
              border: `1.5px dashed ${buildResult === "correct" ? "rgba(46,204,113,0.4)"
                                    : buildResult === "incorrect" ? "rgba(231,76,60,0.4)"
                                    : t.inputBorder}`,
              borderRadius: 12, padding: "14px 12px", marginBottom: 14,
              display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
              transition: "all 0.2s",
            }}>
              {buildSelected.length === 0 && (
                <div style={{ color: t.textFaint, fontSize: 12, fontFamily: "'DM Mono', monospace", margin: "0 auto" }}>
                  tap tokens below to build the sentence
                </div>
              )}
              {buildSelected.map((tok, i) => (
                <button key={`${tok.id}-${i}`} className="token" disabled={!!buildResult}
                  onClick={() => {
                    if (buildResult) return;
                    setBuildSelected(prev => prev.filter((_, j) => j !== i));
                  }}
                  style={{ fontSize: 16 }}>
                  {tok.text}
                </button>
              ))}
            </div>

            {/* Token pool */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 14, minHeight: 40 }}>
              {buildTokens.map(tok => {
                const used = buildSelected.some(s => s.id === tok.id);
                return (
                  <button key={tok.id}
                    className={`token ${used ? "placed" : ""}`}
                    disabled={used || !!buildResult}
                    onClick={() => {
                      if (used || buildResult) return;
                      setBuildSelected(prev => [...prev, tok]);
                    }}>
                    {tok.text}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            {!buildResult && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => setBuildSelected([])}
                  disabled={buildSelected.length === 0}
                  style={{ flex: 1, background: t.surfaceBg, color: t.textMuted, padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1px solid ${t.surfaceBorder}` }}>
                  Clear
                </button>
                <button className="btn"
                  disabled={buildSelected.length === 0}
                  onClick={() => {
                    const assembled = buildSelected.map(s => s.text).join("");
                    const target = card.front;
                    const ok = assembled === target;
                    setBuildResult(ok ? "correct" : "incorrect");
                    setTimeout(() => next(ok ? "good" : "again"), 1400);
                  }}
                  style={{ flex: 2, background: t.color, color: "#fff", padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                  Check
                </button>
              </div>
            )}
            {buildResult && (
              <div style={{ textAlign: "center", fontSize: 14, color: buildResult === "correct" ? "#27ae60" : "#c0392b", fontFamily: "'Playfair Display', serif" }}>
                {buildResult === "correct" ? "✓ 正解！" : `✗ Answer: ${card.front}`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
