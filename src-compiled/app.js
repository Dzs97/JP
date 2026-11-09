(function(){
const { useState, useEffect, useCallback, useMemo, useRef } = React;
function App() {
  const TWEAKS = (
    /*EDITMODE-BEGIN*/
    {
      "darkMode": false,
      "accent": "shu",
      "fonts": "brush",
      "romanjiPosition": "below",
      "density": "comfortable",
      "showKeyboardHints": true
    }
  );
  const [darkMode, setDarkMode] = useState(TWEAKS.darkMode);
  const [accent, setAccent] = useState(TWEAKS.accent);
  const [fonts, setFonts] = useState(TWEAKS.fonts);
  const [romanjiPosition, setRomanjiPosition] = useState(TWEAKS.romanjiPosition);
  const [density, setDensity] = useState(TWEAKS.density);
  const [showKeyboardHints, setShowKeyboardHints] = useState(TWEAKS.showKeyboardHints);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaksAvailable, setTweaksAvailable] = useState(false);
  const [screen, setScreen] = useState("course");
  const [kanaSection, setKanaSection] = useState("hiragana");
  const [kanaQuizPool, setKanaQuizPool] = useState([]);
  const [kanaQuizIdx, setKanaQuizIdx] = useState(0);
  const [kanaQuizSelected, setKanaQuizSelected] = useState(null);
  const [kanaQuizScore, setKanaQuizScore] = useState({ correct: 0, incorrect: 0 });
  const [kanaQuizDone, setKanaQuizDone] = useState(false);
  const [mode, setMode] = useState("flashcard");
  const [categories, setCategories] = useState(["vocabulary", "phrases"]);
  const [sessionGoal, setSessionGoal] = useState({ kind: "cards", value: 20 });
  const [dueOnly, setDueOnly] = useState(false);
  const [levelFocus, setLevelFocus] = useState("all");
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
  const [buildTokens, setBuildTokens] = useState([]);
  const [buildSelected, setBuildSelected] = useState([]);
  const [buildResult, setBuildResult] = useState(null);
  const [sessionStart, setSessionStart] = useState(null);
  const [finished, setFinished] = useState(false);
  const [courseCtx, setCourseCtx] = useState(null);
  const activeMode = courseCtx ? courseCtx.mode : mode;
  const [showRomanji, setShowRomanji] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [progress, setProgress] = useState(window.emptyProgress());
  const t = useMemo(() => window.buildTheme({ darkMode, accent, fonts }), [darkMode, accent, fonts]);
  const card = deck[idx];
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(window.userKey("jp-study-progress"));
        if (r?.value) setProgress(window.migrateProgress(JSON.parse(r.value)));
      } catch (_) {
      }
      try {
        const p = await window.storage.get(window.userKey("jp-study-prefs"));
        if (p?.value) {
          const parsed = JSON.parse(p.value);
          if (typeof parsed.darkMode === "boolean") setDarkMode(parsed.darkMode);
          if (typeof parsed.showRomanji === "boolean") setShowRomanji(parsed.showRomanji);
          if (typeof parsed.voiceOn === "boolean") setVoiceOn(parsed.voiceOn);
          if (Array.isArray(parsed.categories) && parsed.categories.length) setCategories(parsed.categories);
          if (parsed.mode) setMode(parsed.mode);
          if (parsed.sessionGoal) setSessionGoal(parsed.sessionGoal);
          if (parsed.levelFocus !== void 0) setLevelFocus(parsed.levelFocus);
        }
      } catch (_) {
      }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        await window.storage.set(window.userKey("jp-study-prefs"), JSON.stringify({
          darkMode,
          showRomanji,
          voiceOn,
          categories,
          mode,
          sessionGoal,
          levelFocus
        }));
      } catch (_) {
      }
    })();
  }, [darkMode, showRomanji, voiceOn, categories, mode, sessionGoal, levelFocus]);
  const saveProgress = useCallback(async (p) => {
    try {
      await window.storage.set(window.userKey("jp-study-progress"), JSON.stringify(p));
    } catch (_) {
    }
    setProgress(p);
  }, []);
  useEffect(() => {
    const onPull = (e) => {
      try {
        const v = e?.detail;
        if (!v) return;
        const parsed = window.migrateProgress ? window.migrateProgress(JSON.parse(v)) : JSON.parse(v);
        setProgress(parsed);
      } catch (_) {
      }
    };
    window.addEventListener("jp-progress-pulled", onPull);
    return () => window.removeEventListener("jp-progress-pulled", onPull);
  }, []);
  useEffect(() => {
    const handler = (e) => {
      const msg = e.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "__activate_edit_mode") setTweaksOpen(true);
      if (msg.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    try {
      window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    } catch (_) {
    }
    setTweaksAvailable(true);
    return () => window.removeEventListener("message", handler);
  }, []);
  const persistTweak = useCallback((key, value) => {
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: value } }, "*");
    } catch (_) {
    }
  }, []);
  const [voiceState, setVoiceState] = useState({
    ready: false,
    // speechSynthesis has fired at least once / voices loaded
    hasJapanese: true,
    // becomes false if we know none are available
    needsUnlock: true,
    // true until first user gesture primes audio
    warnDismissed: false
  });
  const voiceRef = useRef(null);
  useEffect(() => {
    if (!window.speechSynthesis) {
      setVoiceState((s) => ({ ...s, ready: true, hasJapanese: false }));
      return;
    }
    const check = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return false;
      const ja = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("ja"));
      voiceRef.current = ja || null;
      setVoiceState((s) => ({ ...s, ready: true, hasJapanese: !!ja }));
      return true;
    };
    if (check()) return;
    window.speechSynthesis.onvoiceschanged = check;
    const poll = setInterval(() => {
      if (check()) clearInterval(poll);
    }, 200);
    const stop = setTimeout(() => {
      clearInterval(poll);
      setVoiceState((s) => s.ready ? s : { ...s, ready: true });
    }, 3e3);
    return () => {
      clearInterval(poll);
      clearTimeout(stop);
    };
  }, []);
  useEffect(() => {
    if (!voiceState.needsUnlock) return;
    const unlock = () => {
      try {
        const u = new SpeechSynthesisUtterance("");
        u.volume = 0;
        window.speechSynthesis.speak(u);
      } catch (_) {
      }
      setVoiceState((s) => ({ ...s, needsUnlock: false }));
    };
    const opts = { once: true, passive: true };
    window.addEventListener("click", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [voiceState.needsUnlock]);
  const [speechLog, setSpeechLog] = useState([]);
  const logSpeech = useCallback((msg) => {
    setSpeechLog((l) => [...l.slice(-9), { t: (/* @__PURE__ */ new Date()).toLocaleTimeString(), msg }]);
  }, []);
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const id = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 1e4);
    return () => clearInterval(id);
  }, []);
  const doSpeak = useCallback((text) => {
    if (!text) {
      logSpeech("(empty text)");
      return;
    }
    if (!window.speechSynthesis) {
      logSpeech("speechSynthesis unavailable");
      return;
    }
    try {
      const synth = window.speechSynthesis;
      if (synth.paused) {
        synth.resume();
        logSpeech("resumed (was paused)");
      }
      synth.cancel();
      setTimeout(() => {
        try {
          synth.resume();
          const utt = new SpeechSynthesisUtterance(text);
          utt.lang = "ja-JP";
          utt.rate = 0.85;
          utt.volume = 1;
          utt.pitch = 1;
          if (voiceRef.current) {
            utt.voice = voiceRef.current;
            logSpeech(`speak "${text}" via ${voiceRef.current.name}`);
          } else {
            logSpeech(`speak "${text}" (no JP voice, lang=ja-JP)`);
          }
          utt.onstart = () => logSpeech(`\u25B6 start "${text}"`);
          utt.onend = () => logSpeech(`\u2713 end "${text}"`);
          utt.onerror = (e) => logSpeech(`\u2717 error: ${e.error || "unknown"}`);
          synth.speak(utt);
          setTimeout(() => {
            if (synth.paused) synth.resume();
          }, 100);
        } catch (e) {
          logSpeech(`inner exception: ${e.message}`);
        }
      }, 60);
    } catch (e) {
      logSpeech(`exception: ${e.message}`);
    }
  }, [logSpeech]);
  const speak = useCallback((text) => {
    if (!voiceOn) return;
    doSpeak(text);
  }, [voiceOn, doSpeak]);
  const speakForce = useCallback((text) => {
    doSpeak(text);
  }, [doSpeak]);
  const buildSessionDeck = useCallback(() => {
    let pool = [];
    categories.forEach((c) => {
      if (window.CARD_DATA[c]) pool = [...pool, ...window.CARD_DATA[c]];
    });
    if (mode === "build" || mode === "cloze") pool = window.CARD_DATA.sentences.slice();
    if (mode === "conjugate") pool = (window.CARD_DATA.verbs || []).slice();
    if (window.filterByLevel) pool = window.filterByLevel(pool, levelFocus);
    let ordered;
    if (dueOnly || sessionGoal.kind === "due") {
      const due = pool.filter((c) => window.isDue(progress.cardStats[window.cardKey(c)])).sort((a, b) => (progress.cardStats[window.cardKey(a)]?.due || 0) - (progress.cardStats[window.cardKey(b)]?.due || 0));
      const rest = pool.filter((c) => !window.isDue(progress.cardStats[window.cardKey(c)]));
      ordered = [...due, ...window.shuffle(rest)];
    } else {
      ordered = window.shuffle(pool);
    }
    const limit = sessionGoal.kind === "cards" ? sessionGoal.value : ordered.length;
    return ordered.slice(0, Math.min(limit, ordered.length));
  }, [categories, mode, dueOnly, sessionGoal, progress, levelFocus]);
  const startStudy = useCallback(() => {
    const d = buildSessionDeck();
    if (d.length === 0) return;
    setDeck(d);
    setIdx(0);
    setFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setQuizSelected(null);
    setWriteInput("");
    setWriteResult(null);
    setListenRevealed(false);
    setListenSelected(null);
    setBuildSelected([]);
    setBuildResult(null);
    setFinished(false);
    setCourseCtx(null);
    setSessionStart(Date.now());
    setScreen("study");
  }, [buildSessionDeck]);
  const startMistakeDrill = useCallback(() => {
    const fronts = progress.mistakeQueue || [];
    if (!fronts.length) return;
    const byFront = {};
    window.ALL_CARDS.forEach((c) => {
      byFront[c.front] = c;
    });
    const cards = fronts.map((f) => byFront[f]).filter(Boolean);
    if (!cards.length) return;
    setDeck(window.shuffle(cards));
    setIdx(0);
    setFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setQuizSelected(null);
    setWriteInput("");
    setWriteResult(null);
    setListenRevealed(false);
    setListenSelected(null);
    setBuildSelected([]);
    setBuildResult(null);
    setFinished(false);
    setCourseCtx(null);
    setSessionStart(Date.now());
    setScreen("study");
  }, [progress]);
  const startWeakReview = useCallback(() => {
    const weakCards = window.ALL_CARDS.map((c) => ({ c, s: progress.cardStats[window.cardKey(c)] })).filter(({ s }) => s && s.attempts >= 2 && s.correct / s.attempts < 0.7).sort((a, b) => a.s.correct / a.s.attempts - b.s.correct / b.s.attempts).slice(0, 20).map(({ c }) => c);
    if (weakCards.length === 0) return;
    setDeck(window.shuffle(weakCards));
    setIdx(0);
    setFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setQuizSelected(null);
    setWriteInput("");
    setWriteResult(null);
    setListenRevealed(false);
    setListenSelected(null);
    setBuildSelected([]);
    setBuildResult(null);
    setFinished(false);
    setCourseCtx(null);
    setSessionStart(Date.now());
    setScreen("study");
  }, [progress]);
  const startCourseDeck = useCallback((cards, deckMode, ctx) => {
    if (!cards || cards.length === 0) return;
    setDeck(cards);
    setIdx(0);
    setFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setQuizSelected(null);
    setWriteInput("");
    setWriteResult(null);
    setListenRevealed(false);
    setListenSelected(null);
    setBuildSelected([]);
    setBuildResult(null);
    setFinished(false);
    setCourseCtx({ ...ctx || {}, mode: deckMode });
    setSessionStart(Date.now());
    setScreen("study");
  }, []);
  const backToCourse = useCallback(() => {
    setFinished(false);
    setCourseCtx(null);
    setScreen("course");
  }, []);
  useEffect(() => {
    if (screen !== "study") {
      setFinished(false);
      setCourseCtx(null);
    }
  }, [screen]);
  useEffect(() => {
    if (!card || screen !== "study") return;
    const pool = window.distractorPoolFor ? window.distractorPoolFor(card) : window.ALL_CARDS;
    if (activeMode === "quiz" || activeMode === "speed") {
      setQuizOptions(window.shuffle([card.back, ...window.getWrongChoices(card, pool)]));
      setQuizSelected(null);
    }
    if (activeMode === "listen") {
      setListenOptions(window.shuffle([card.back, ...window.getWrongChoices(card, pool)]));
      setListenSelected(null);
      setListenRevealed(false);
    }
    if (activeMode === "build") {
      const chunks = window.tokenizeSentence(card.front);
      setBuildTokens(window.shuffle(chunks.map((text, i) => ({ id: i, text }))));
      setBuildSelected([]);
      setBuildResult(null);
    }
  }, [idx, activeMode, deck, screen]);
  useEffect(() => {
    if (!card || screen !== "study" || !voiceOn) return;
    if (activeMode === "quiz" && card.kind === "kana") return;
    const timer = setTimeout(() => speak(card.front), 300);
    return () => clearTimeout(timer);
  }, [idx, screen, voiceOn, card, speak, activeMode]);
  const next = useCallback((rating) => {
    let r = rating;
    if (typeof rating === "boolean") r = rating ? "good" : "again";
    const wasCorrect = r !== "again";
    const ns = {
      correct: score.correct + (wasCorrect ? 1 : 0),
      incorrect: score.incorrect + (wasCorrect ? 0 : 1)
    };
    setScore(ns);
    const up = JSON.parse(JSON.stringify(progress));
    const key = window.cardKey(card);
    up.cardStats[key] = window.srsReview(up.cardStats[key], r);
    up.totalAnswered += 1;
    up.totalCorrect += wasCorrect ? 1 : 0;
    const today = window.todayKey();
    if (!up.dayLog[today]) up.dayLog[today] = { cards: 0, correct: 0 };
    up.dayLog[today].cards += 1;
    up.dayLog[today].correct += wasCorrect ? 1 : 0;
    if (!wasCorrect) {
      const q = up.mistakeQueue || [];
      up.mistakeQueue = [card.front, ...q.filter((x) => x !== card.front)].slice(0, 50);
    } else if (r === "easy" || r === "good") {
      up.mistakeQueue = (up.mistakeQueue || []).filter((x) => x !== card.front);
    }
    if (idx + 1 >= deck.length) {
      const pct = Math.round(ns.correct / deck.length * 100);
      const duration = sessionStart ? Math.round((Date.now() - sessionStart) / 1e3) : 0;
      up.sessions += 1;
      up.history.push({
        date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
        score: pct,
        cards: deck.length,
        mode: activeMode,
        duration
      });
      if (up.history.length > 50) up.history = up.history.slice(-50);
      const todayStr = (/* @__PURE__ */ new Date()).toDateString();
      if (up.lastStudied !== todayStr) {
        const yd = /* @__PURE__ */ new Date();
        yd.setDate(yd.getDate() - 1);
        const y = yd.toDateString();
        up.streakDays = up.lastStudied === y ? (up.streakDays || 0) + 1 : 1;
        up.lastStudied = todayStr;
      }
      if (courseCtx && window.courseRecord) window.courseRecord(up, courseCtx, pct);
      saveProgress(up);
      setFinished(true);
    } else {
      saveProgress(up);
      setIdx((i) => i + 1);
      setFlipped(false);
      setQuizSelected(null);
      setWriteInput("");
      setWriteResult(null);
      setListenRevealed(false);
      setListenSelected(null);
      setBuildSelected([]);
      setBuildResult(null);
    }
  }, [idx, deck, card, score, progress, activeMode, courseCtx, sessionStart, saveProgress]);
  useEffect(() => {
    if (screen !== "study" || finished) return;
    const h = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (activeMode === "flashcard") {
        if (e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
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
  const stats = useMemo(() => {
    const acc = progress.totalAnswered > 0 ? Math.round(progress.totalCorrect / progress.totalAnswered * 100) : 0;
    const mastered = window.ALL_CARDS.filter((c) => {
      const s = progress.cardStats[window.cardKey(c)];
      return s && s.attempts >= 2 && s.correct / s.attempts >= 0.8;
    }).length;
    const dueCount = window.ALL_CARDS.filter((c) => {
      const s = progress.cardStats[window.cardKey(c)];
      return s && window.isDue(s);
    }).length;
    const weakCount = window.ALL_CARDS.filter((c) => {
      const s = progress.cardStats[window.cardKey(c)];
      return s && s.attempts >= 2 && s.correct / s.attempts < 0.7;
    }).length;
    return {
      acc,
      mastered,
      total: window.ALL_CARDS.length,
      dueCount,
      weakCount,
      sessions: progress.sessions,
      history: progress.history
    };
  }, [progress]);
  const toggleCat = (cat) => setCategories(
    (prev) => prev.includes(cat) ? prev.length > 1 ? prev.filter((c) => c !== cat) : prev : [...prev, cat]
  );
  const screenProps = {
    t,
    density,
    romanjiPosition,
    showKeyboardHints,
    screen,
    setScreen,
    mode: activeMode,
    setMode,
    startCourseDeck,
    backToCourse,
    courseCtx,
    categories,
    setCategories,
    toggleCat,
    sessionGoal,
    setSessionGoal,
    dueOnly,
    setDueOnly,
    deck,
    setDeck,
    idx,
    setIdx,
    flipped,
    setFlipped,
    score,
    setScore,
    quizOptions,
    quizSelected,
    setQuizSelected,
    writeInput,
    setWriteInput,
    writeResult,
    setWriteResult,
    listenRevealed,
    setListenRevealed,
    listenOptions,
    listenSelected,
    setListenSelected,
    buildTokens,
    buildSelected,
    setBuildSelected,
    buildResult,
    setBuildResult,
    sessionStart,
    finished,
    showRomanji,
    setShowRomanji,
    voiceOn,
    setVoiceOn,
    darkMode,
    setDarkMode,
    progress,
    stats,
    card,
    speak,
    speakForce,
    startStudy,
    startWeakReview,
    startMistakeDrill,
    buildSessionDeck,
    next,
    setProgress: saveProgress,
    kanaSection,
    setKanaSection,
    kanaQuizPool,
    setKanaQuizPool,
    kanaQuizIdx,
    setKanaQuizIdx,
    kanaQuizSelected,
    setKanaQuizSelected,
    kanaQuizScore,
    setKanaQuizScore,
    kanaQuizDone,
    setKanaQuizDone,
    levelFocus,
    setLevelFocus
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    minHeight: "100vh",
    background: t.appBg,
    color: t.textPrimary,
    fontFamily: t.fontBody,
    transition: "background 0.3s ease, color 0.3s ease"
  } }, /* @__PURE__ */ React.createElement(window.GlobalStyles, { t }), /* @__PURE__ */ React.createElement(
    window.AppShell,
    {
      t,
      screen,
      setScreen,
      darkMode,
      setDarkMode,
      voiceOn,
      setVoiceOn,
      score,
      idx,
      deck,
      finished,
      exitTo: courseCtx ? "course" : "home",
      utilities: /* @__PURE__ */ React.createElement(React.Fragment, null, window.UserChip && /* @__PURE__ */ React.createElement(window.UserChip, { t }), window.SyncChip && /* @__PURE__ */ React.createElement(window.SyncChip, { t }), window.FuriganaToggle && /* @__PURE__ */ React.createElement(window.FuriganaToggle, { t }), /* @__PURE__ */ React.createElement(window.AudioDebug, { t, voiceState, voiceRef, speechLog, doSpeak }))
    },
    /* @__PURE__ */ React.createElement("main", { className: "resp-main-pad" }, voiceState.ready && !voiceState.hasJapanese && !voiceState.warnDismissed && /* @__PURE__ */ React.createElement("div", { style: {
      maxWidth: 1080,
      margin: "16px auto 0",
      padding: "12px 16px",
      background: t.dangerBg,
      border: `1px solid ${t.dangerBorder}`,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      gap: 12
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: t.fontJp, fontSize: 22, color: t.danger } }, "\u97F3"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 13, color: t.danger } }, /* @__PURE__ */ React.createElement("strong", null, "No Japanese voice installed."), " Your browser can't pronounce cards. On macOS/iOS: System Settings \u2192 Accessibility \u2192 Spoken Content \u2192 add Kyoko or Otoya. On Windows: Settings \u2192 Time & Language \u2192 Language \u2192 add Japanese. Firefox on desktop has no built-in voices \u2014 try Chrome or Safari."), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn",
        onClick: () => setVoiceState((s) => ({ ...s, warnDismissed: true })),
        style: { padding: "6px 10px", background: "transparent", color: t.danger, fontSize: 12, fontFamily: t.fontUi }
      },
      "Dismiss"
    )), voiceState.needsUnlock && voiceState.hasJapanese && /* @__PURE__ */ React.createElement("div", { style: {
      position: "fixed",
      left: "50%",
      bottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
      transform: "translateX(-50%)",
      width: "calc(100% - 32px)",
      maxWidth: 420,
      zIndex: 40,
      pointerEvents: "none",
      padding: "10px 14px",
      background: t.surfaceBg,
      boxShadow: t.shadowFloating,
      border: `1px solid ${t.accent}40`,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 12,
      color: t.text
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: t.fontJp, fontSize: 18, color: t.accent } }, "\u266A"), /* @__PURE__ */ React.createElement("span", null, "Tap anywhere to enable audio playback.")), screen === "course" && !finished && window.CourseScreen && /* @__PURE__ */ React.createElement(window.CourseScreen, { ...screenProps }), screen === "home" && !finished && /* @__PURE__ */ React.createElement(window.HomeScreen, { ...screenProps }), screen === "study" && !finished && /* @__PURE__ */ React.createElement(window.StudyScreen, { ...screenProps }), screen === "progress" && /* @__PURE__ */ React.createElement(window.ProgressScreen, { ...screenProps }), screen === "kana" && /* @__PURE__ */ React.createElement(window.KanaScreen, { ...screenProps }), screen === "kanji" && /* @__PURE__ */ React.createElement(window.KanjiScreen, { ...screenProps }), screen === "grammar" && /* @__PURE__ */ React.createElement(window.GrammarScreen, { ...screenProps }), finished && /* @__PURE__ */ React.createElement(window.FinishScreen, { ...screenProps }))
  ), tweaksAvailable && tweaksOpen && /* @__PURE__ */ React.createElement(
    window.TweaksPanel,
    {
      t,
      darkMode,
      setDarkMode: (v) => {
        setDarkMode(v);
        persistTweak("darkMode", v);
      },
      accent,
      setAccent: (v) => {
        setAccent(v);
        persistTweak("accent", v);
      },
      fonts,
      setFonts: (v) => {
        setFonts(v);
        persistTweak("fonts", v);
      },
      romanjiPosition,
      setRomanjiPosition: (v) => {
        setRomanjiPosition(v);
        persistTweak("romanjiPosition", v);
      },
      density,
      setDensity: (v) => {
        setDensity(v);
        persistTweak("density", v);
      },
      showKeyboardHints,
      setShowKeyboardHints: (v) => {
        setShowKeyboardHints(v);
        persistTweak("showKeyboardHints", v);
      },
      onClose: () => setTweaksOpen(false)
    }
  ), window.SearchOverlay && /* @__PURE__ */ React.createElement(window.SearchOverlay, { t, setScreen }), window.OnboardingModal && !progress.onboardingDone && /* @__PURE__ */ React.createElement(
    window.OnboardingModal,
    {
      t,
      progress,
      onDone: (picks) => {
        const up = {
          ...progress,
          onboardingDone: true,
          dailyGoal: picks.dailyGoal ?? progress.dailyGoal ?? 20
        };
        saveProgress(up);
        if (picks.levelFocus !== void 0) setLevelFocus(picks.levelFocus);
      }
    }
  ));
}
window.App = App;
})();
