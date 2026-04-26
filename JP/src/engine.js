// ═══════════════════════════════════════════════════════════════════════
//  UTILITIES, SRS ENGINE, SENTENCE TOKENIZER, STORAGE SHIM
// ═══════════════════════════════════════════════════════════════════════

const cardKey = (card) => `jp::${card.front}`;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

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
  streakDays: 0, lastStudied: null,
  mistakeQueue: [],   // card fronts that were missed, FIFO
  dailyGoal: 20,
  onboardingDone: false,
});

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

Object.assign(window, {
  cardKey, shuffle, getWrongChoices,
  srsReview, isDue, formatInterval, tokenizeSentence,
  emptyProgress, todayKey, storage,
  DAY_MS,
  forecastDueByDay, pushMistake, clearMistake,
});
