// ═══════════════════════════════════════════════════════════════════════
//  Verb conjugation engine + pitch-accent helpers + furigana parsing
// ═══════════════════════════════════════════════════════════════════════

// ── Pitch accent mark: ꜜ after high-to-low drop ───────────────────────
// Minimal database: [word, kanjiOrKana, accentPos] (0 = heiban/flat)
const PITCH_DB = {
  "はし_chopsticks": 2, "はし_bridge": 1, "はし_edge": 0,
  "あめ_rain": 1, "あめ_candy": 0,
  "かみ_paper": 2, "かみ_god": 1, "かみ_hair": 2,
  "いま": 1, "つくえ": 0, "がっこう": 0, "せんせい": 3,
  "ねこ": 1, "いぬ": 2, "ほん": 1, "みず": 2, "くるま": 0,
  "たべる": 2, "のむ": 1, "みる": 1, "いく": 0, "くる": 1,
  "おおきい": 3, "ちいさい": 3, "あかい": 0, "あおい": 2,
};

// Return array of syllable "beats" with {mora, high} for visual pitch marks.
function getPitchPattern(kana, accent) {
  if (accent === undefined || accent === null) return null;
  // Split into moras (rough — treat small-tsu and yoon as part of previous)
  const moras = [];
  for (let i = 0; i < kana.length; i++) {
    const ch = kana[i];
    const next = kana[i + 1];
    if (next && "ゃゅょぁぃぅぇぉャュョァィゥェォ".includes(next)) {
      moras.push(ch + next); i++;
    } else moras.push(ch);
  }
  if (accent === 0) {
    // Heiban: first low, rest high, no drop
    return moras.map((m, i) => ({ mora: m, high: i !== 0 }));
  }
  // Atamadaka / Nakadaka / Odaka
  return moras.map((m, i) => {
    if (accent === 1) return { mora: m, high: i === 0 };
    if (i === 0) return { mora: m, high: false };
    if (i < accent) return { mora: m, high: true };
    return { mora: m, high: false };
  });
}

// ── Verb conjugation ─────────────────────────────────────────────────
const GODAN_STEM_MAP = {
  // Convert u-ending verb to i-stem
  "う":"い","く":"き","ぐ":"ぎ","す":"し","つ":"ち","ぬ":"に",
  "ぶ":"び","む":"み","る":"り",
};
const GODAN_TE_MAP = {
  "う":"って","つ":"って","る":"って","く":"いて","ぐ":"いで",
  "す":"して","ぬ":"んで","ぶ":"んで","む":"んで",
};
const GODAN_TA_MAP = {
  "う":"った","つ":"った","る":"った","く":"いた","ぐ":"いだ",
  "す":"した","ぬ":"んだ","ぶ":"んだ","む":"んだ",
};
const GODAN_A_MAP = {
  "う":"わ","く":"か","ぐ":"が","す":"さ","つ":"た","ぬ":"な",
  "ぶ":"ば","む":"ま","る":"ら",
};

function conjugate(verb, group, form) {
  const dict = verb;
  const last = dict.slice(-1);
  const stem = dict.slice(0, -1);

  const godan = group === "godan" || group === "godan-iku";
  const ichidan = group === "ichidan";
  const irregular = group === "irregular";

  if (form === "dict") return dict;

  if (irregular) {
    if (dict === "する") return {
      masu: "します", masen: "しません", mashita: "しました",
      te: "して", ta: "した", nai: "しない", past: "した", neg: "しない",
    }[form] || dict;
    if (dict === "来る") return {
      masu: "来ます", masen: "来ません", mashita: "来ました",
      te: "来て", ta: "来た", nai: "来ない", past: "来た", neg: "来ない",
    }[form] || dict;
    if (dict.endsWith("する")) {
      const root = dict.slice(0, -2);
      return {
        masu: root + "します", masen: root + "しません", mashita: root + "しました",
        te: root + "して", ta: root + "した", nai: root + "しない",
        past: root + "した", neg: root + "しない",
      }[form] || dict;
    }
  }

  if (ichidan) {
    const base = stem; // drop る
    return {
      masu: base + "ます", masen: base + "ません", mashita: base + "ました",
      te: base + "て", ta: base + "た", nai: base + "ない",
      past: base + "た", neg: base + "ない",
    }[form] || dict;
  }

  if (godan) {
    const iStem = stem + (GODAN_STEM_MAP[last] || last);
    // iku is irregular for te/ta
    const teForm = dict === "行く" || group === "godan-iku"
      ? stem + "って"
      : stem + (GODAN_TE_MAP[last] || "て");
    const taForm = dict === "行く" || group === "godan-iku"
      ? stem + "った"
      : stem + (GODAN_TA_MAP[last] || "た");
    const naiForm = (dict === "ある") ? "ない" : stem + (GODAN_A_MAP[last] || "ら") + "ない";

    return {
      masu: iStem + "ます", masen: iStem + "ません", mashita: iStem + "ました",
      te: teForm, ta: taForm, nai: naiForm,
      past: taForm, neg: naiForm,
    }[form] || dict;
  }
  return dict;
}

const CONJ_FORMS = [
  { id: "masu",    label: "〜ます",    hint: "polite present" },
  { id: "masen",   label: "〜ません",   hint: "polite negative" },
  { id: "mashita", label: "〜ました",   hint: "polite past" },
  { id: "te",      label: "〜て",      hint: "te-form (connector)" },
  { id: "ta",      label: "〜た",      hint: "plain past" },
  { id: "nai",     label: "〜ない",     hint: "plain negative" },
];

// ── Furigana parser ──────────────────────────────────────────────────
// Very simple: if card has .furigana field like "食[た]べる" or a pre-parsed
// array, use it. Otherwise just render bare text.
function parseFurigana(s) {
  if (!s) return [];
  // Format: "食[た]べる 本[ほん]" — bracket follows its base kanji/run
  const re = /([一-龠々ヵヶ]+)\[([^\]]+)\]|([^一-龠々ヵヶ\[\]]+)/g;
  const parts = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m[1]) parts.push({ kanji: m[1], ruby: m[2] });
    else if (m[3]) parts.push({ plain: m[3] });
  }
  return parts;
}

window.PITCH_DB = PITCH_DB;
window.getPitchPattern = getPitchPattern;
window.conjugate = conjugate;
window.CONJ_FORMS = CONJ_FORMS;
window.parseFurigana = parseFurigana;
