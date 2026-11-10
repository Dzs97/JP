// ═══════════════════════════════════════════════════════════════════════
//  UTILITIES, SRS ENGINE, SENTENCE TOKENIZER, STORAGE SHIM
// ═══════════════════════════════════════════════════════════════════════

// Grammar cards get their own namespace: grammar か must not share stats with kana か.
const cardKey = (card) => card.type === "Grammar" ? `jp::grammar::${card.front}` : `jp::${card.front}`;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getWrongChoices = (correct, pool, n = 3) =>
  shuffle(pool.filter(c => c.back !== correct.back)).slice(0, n).map(c => c.back);

// ── SRS (SM-2 inspired) ────────────────────────────────────────────────
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

function srsReview(stat, rating) {
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
    s.due = Date.now() + 10 * 60 * 1000;
    return s;
  }

  s.correct += 1;
  s.reps += 1;

  if (s.reps === 1) {
    s.interval = rating === "easy" ? 3 : rating === "hard" ? 0.5 : 1;
  } else if (s.reps === 2) {
    s.interval = rating === "easy" ? 7 : rating === "hard" ? 1.5 : 3;
  } else {
    const mult = rating === "easy" ? s.ease * 1.3
               : rating === "hard" ? 1.2
               : s.ease;
    s.interval = Math.max(1, s.interval * mult);
  }
  if (rating === "hard") s.ease = Math.max(MIN_EASE, s.ease - 0.15);
  if (rating === "easy") s.ease = s.ease + 0.15;
  s.due = Date.now() + s.interval * DAY_MS;
  return s;
}

const isDue = (stat) => !stat || !stat.due || stat.due <= Date.now();

function formatInterval(stat) {
  if (!stat || !stat.interval) return "new";
  if (stat.interval < 1) return `${Math.round(stat.interval * 24)}h`;
  if (stat.interval < 30) return `${Math.round(stat.interval)}d`;
  return `${Math.round(stat.interval / 30)}mo`;
}

// ── Sentence tokenizer for Build mode ──────────────────────────────────
function tokenizeSentence(sentence) {
  const endings = [
    "でいます", "でいる", "ています", "ている",
    "ください", "ました", "ません",
    "たい", "です", "ます",
  ];
  const particles = ["は","が","を","に","で","と","も","の","から","まで","へ","か","ね","よ"];
  const particlesByLen = [...particles].sort((a, b) => b.length - a.length);
  const sentenceEnders = ["か", "ね", "よ"];

  const peelEnding = (c) => {
    for (const e of endings) {
      if (c.endsWith(e) && c.length > e.length) return [c.slice(0, c.length - e.length), e];
    }
    return null;
  };
  const peelSentenceEnder = (c) => {
    for (const p of sentenceEnders) {
      if (c.endsWith(p) && c.length > p.length) return [c.slice(0, c.length - p.length), p];
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
    const enderPeeled = peelSentenceEnder(c);
    if (enderPeeled) return [...tokenize(enderPeeled[0]), enderPeeled[1]];
    const peeled = peelEnding(c);
    if (peeled) return [...tokenize(peeled[0]), peeled[1]];
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
  return tokenize(sentence).filter(x => x && x.trim().length > 0);
}

// ── Progress default ────────────────────────────────────────────────────
const emptyProgress = () => ({
  totalCorrect: 0, totalAnswered: 0, sessions: 0,
  cardStats: {},
  history: [],
  dayLog: {},
  streakDays: 0, lastStudied: null, bestStreak: 0,
  badges: {},          // badge id → time earned (rewards.js)
  mistakeQueue: [],   // card fronts that were missed, FIFO
  dailyGoal: 20,
  onboardingDone: false,
  course: { lessons: {}, days: {} }, // guided course (course.jsx)
});

// Backfill missing fields onto loaded progress so older save shapes still work.
function migrateProgress(p) {
  if (!p) return emptyProgress();
  const base = emptyProgress();
  const cardStats = { ...(p.cardStats || {}) };
  // Copy grammar stats from the old shared `jp::<front>` key to the new grammar key.
  for (const c of (typeof window !== "undefined" && window.CARD_DATA?.grammar) || []) {
    const k = cardKey(c), old = `jp::${c.front}`;
    if (!cardStats[k] && cardStats[old]) cardStats[k] = cardStats[old];
  }
  return {
    ...base,
    ...p,
    cardStats,
    dayLog: { ...base.dayLog, ...(p.dayLog || {}) },
    history: Array.isArray(p.history) ? p.history : [],
    mistakeQueue: Array.isArray(p.mistakeQueue) ? p.mistakeQueue : [],
    badges: { ...(p.badges || {}) },
    bestStreak: Math.max(p.bestStreak || 0, p.streakDays || 0),
    course: {
      lessons: { ...((p.course && p.course.lessons) || {}) },
      days: { ...((p.course && p.course.days) || {}) },
    },
  };
}

// Combine two copies of the same person's progress (e.g. two devices that both
// studied offline) so neither loses work. `newer` supplies settings like dailyGoal.
// shortcut: counts take the max per day/card instead of adding, so two devices
// studying the same day offline undercount that day; exact sums would need per-device logs.
function mergeProgress(a, b, newerIsA) {
  a = migrateProgress(a); b = migrateProgress(b);
  // A reset or import is a deliberate fresh start: the later one wins outright.
  if ((a.resetAt || 0) !== (b.resetAt || 0)) return (a.resetAt || 0) > (b.resetAt || 0) ? a : b;
  const [newer, older] = newerIsA ? [a, b] : [b, a];
  const out = { ...older, ...newer };
  const union = (x, y, choose) => {
    const r = { ...x };
    for (const k in y) r[k] = k in r ? choose(r[k], y[k]) : y[k];
    return r;
  };
  for (const k of ["totalAnswered", "totalCorrect", "sessions", "bestStreak"]) out[k] = Math.max(a[k] || 0, b[k] || 0);
  out.cardStats = union(older.cardStats, newer.cardStats, (x, y) =>
    (y.attempts || 0) > (x.attempts || 0) || ((y.attempts || 0) === (x.attempts || 0) && (y.lastSeen || 0) >= (x.lastSeen || 0)) ? y : x);
  out.dayLog = union(older.dayLog, newer.dayLog, (x, y) => ((y.cards || 0) >= (x.cards || 0) ? y : x));
  out.badges = union(a.badges, b.badges, (x, y) => Math.min(x, y));
  const seen = new Set();
  out.history = [...older.history, ...newer.history]
    .filter((h) => { const k = JSON.stringify(h); return seen.has(k) ? false : seen.add(k); })
    .slice(-50);
  // Streak: whichever copy studied most recently, then the longer run.
  const day = (p) => (p.lastStudied ? new Date(p.lastStudied).getTime() : 0);
  const s = day(a) !== day(b) ? (day(a) > day(b) ? a : b) : ((a.streakDays || 0) >= (b.streakDays || 0) ? a : b);
  out.streakDays = s.streakDays; out.lastStudied = s.lastStudied;
  out.course = {
    lessons: union(older.course.lessons, newer.course.lessons, (x, y) => ({
      ...x, ...y,
      best: Math.max(x.best || 0, y.best || 0),
      passed: !!(x.passed || y.passed),
      passedAt: x.passedAt && y.passedAt ? Math.min(x.passedAt, y.passedAt) : (x.passedAt || y.passedAt || null),
      learnedAt: x.learnedAt || y.learnedAt || null,
    })),
    days: union(older.course.days, newer.course.days, (x, y) => {
      const r = { ...x };
      for (const k in y) r[k] = r[k] || y[k];
      return r;
    }),
  };
  return out;
}

// A card counts as mastered once it's been seen twice with ≥80% correct.
const isMastered = (s) => !!s && s.attempts >= 2 && s.correct / s.attempts >= 0.8;

// The stored streak only counts while it's unbroken: last study today or yesterday.
function currentStreak(p) {
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const alive = p.lastStudied === new Date().toDateString() || p.lastStudied === yd.toDateString();
  return alive ? (p.streakDays || 0) : 0;
}

// Any study today (a card answer or a course step) keeps the streak going. Mutates p.
function markStudied(p) {
  const todayStr = new Date().toDateString();
  if (p.lastStudied === todayStr) return;
  const yd = new Date(); yd.setDate(yd.getDate() - 1); // calendar day, safe across DST changes
  p.streakDays = p.lastStudied === yd.toDateString() ? (p.streakDays || 0) + 1 : 1;
  p.lastStudied = todayStr;
  p.bestStreak = Math.max(p.bestStreak || 0, p.streakDays);
}

// ── SRS forecast: count of cards due on each of the next N days ────────
function forecastDueByDay(cardStats, days = 14) {
  const now = Date.now();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() + i * DAY_MS);
    return { date: d, count: 0 };
  });
  Object.values(cardStats || {}).forEach(s => {
    if (!s.due) return;
    const diffDays = Math.floor((s.due - today.getTime()) / DAY_MS);
    if (diffDays < 0) buckets[0].count += 1; // overdue rolls into today
    else if (diffDays < days) buckets[diffDays].count += 1;
  });
  return buckets;
}

function pushMistake(progress, cardFront) {
  const q = progress.mistakeQueue || [];
  const filtered = q.filter(x => x !== cardFront);
  const next = [cardFront, ...filtered].slice(0, 50);
  return { ...progress, mistakeQueue: next };
}
function clearMistake(progress, cardFront) {
  return { ...progress, mistakeQueue: (progress.mistakeQueue || []).filter(x => x !== cardFront) };
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

// ── Users: each one gets their own progress, prefs and sync ID ─────────
const USERS = ["Diego", "Mariana"];
const getUser = () => {
  try { const u = localStorage.getItem("jp-user"); return USERS.includes(u) ? u : USERS[0]; }
  catch { return USERS[0]; }
};
// The first user keeps the original un-suffixed keys, so existing progress stays theirs.
const userKey = (base) => getUser() === USERS[0] ? base : `${base}:${getUser().toLowerCase()}`;
const switchUser = (name) => {
  try { localStorage.setItem("jp-user", name); } catch {}
  location.reload(); // every module reads its keys on load, so a reload is the simplest clean switch
};

// ── localStorage shim that mimics window.storage API ───────────────────
const storage = {
  get: async (key) => {
    try { const v = localStorage.getItem(key); return v ? { value: v } : null; }
    catch { return null; }
  },
  set: async (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  },
};

// ── Verb conjugation (ます-form only — the most-drilled N5 pattern) ────
function conjugateMasu(verb) {
  if (!verb || verb.type !== "Verb") return null;
  const { front, romanji, group } = verb;

  // Irregulars
  if (group === "irregular") {
    if (front === "する") return { kanji: "します", romanji: "shimasu" };
    if (front === "来る") return { kanji: "来ます", romanji: "kimasu" };
    if (front.endsWith("する")) {
      return {
        kanji: front.slice(0, -2) + "します",
        romanji: romanji.replace(/suru$/, "shimasu"),
      };
    }
  }

  // Ichidan (-eru / -iru ending verbs that drop る)
  if (group === "ichidan") {
    return {
      kanji: front.slice(0, -1) + "ます",
      romanji: romanji.replace(/ru$/, "masu"),
    };
  }

  // Godan + godan-iku
  const kanaMap = { "う":"い","く":"き","ぐ":"ぎ","す":"し","つ":"ち","ぬ":"に","ぶ":"び","む":"み","る":"り" };
  const last = front.slice(-1);
  const newK = front.slice(0, -1) + (kanaMap[last] || last) + "ます";

  // romanji last syllable → -i + masu (tsu→chi, mu→mi, ku→ki, etc.)
  const syllableMap = { "tsu":"chi", "ku":"ki", "gu":"gi", "su":"shi", "nu":"ni", "bu":"bi", "mu":"mi", "ru":"ri", "u":"i" };
  let newR = romanji;
  const m = romanji.match(/(tsu|ku|gu|su|nu|bu|mu|ru|u)$/);
  if (m) newR = romanji.slice(0, -m[0].length) + syllableMap[m[0]] + "masu";
  return { kanji: newK, romanji: newR };
}

// ── Cloze: pick one token in a sentence to blank out, plus distractors ──
function makeClozeFromSentence(card, allCards) {
  const tokens = tokenizeSentence(card.front);
  if (tokens.length < 2) return null;
  // Prefer particles & verb-endings; otherwise random non-edge token
  const particles = new Set(["は","が","を","に","で","と","も","の","から","まで","へ","か","ね","よ"]);
  const endings = new Set(["です","ます","ません","ました","たい","ください","ている","ています","でいる","でいます"]);
  const preferredIdx = tokens
    .map((t, i) => (particles.has(t) || endings.has(t)) ? i : -1)
    .filter((i) => i >= 0);
  const candidates = preferredIdx.length ? preferredIdx : tokens.map((_, i) => i);
  const blankIdx = candidates[Math.floor(Math.random() * candidates.length)];
  const answer = tokens[blankIdx];

  // Build distractors from same-type pool
  const isParticle = particles.has(answer);
  const isEnding = endings.has(answer);
  let pool;
  if (isParticle) pool = [...particles];
  else if (isEnding) pool = [...endings];
  else pool = (allCards || []).map((c) => c.front).filter((s) => s.length <= 4);
  const distractors = shuffle(pool.filter((x) => x !== answer)).slice(0, 3);
  const options = shuffle([answer, ...distractors]);

  return { tokens, blankIdx, answer, options };
}

Object.assign(window, {
  cardKey, shuffle, getWrongChoices,
  srsReview, isDue, formatInterval, tokenizeSentence,
  emptyProgress, todayKey, storage,
  DAY_MS,
  forecastDueByDay, pushMistake, clearMistake,
  conjugateMasu, makeClozeFromSentence,
  migrateProgress, mergeProgress, isMastered, currentStreak, markStudied,
  USERS, getUser, userKey, switchUser,
});
