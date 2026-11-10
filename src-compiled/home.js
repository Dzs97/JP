(function(){
const { useMemo: useMemoHome } = React;
function HomeScreen(p) {
  const {
    t,
    stats,
    progress,
    mode,
    setMode,
    categories,
    toggleCat,
    sessionGoal,
    setSessionGoal,
    dueOnly,
    setDueOnly,
    startStudy,
    startWeakReview,
    startMistakeDrill,
    setScreen,
    density,
    levelFocus,
    setLevelFocus,
    setProgress
  } = p;
  const todayKey = window.todayKey();
  const todayCards = progress.dayLog?.[todayKey]?.cards || 0;
  const dailyGoal = progress.dailyGoal || 20;
  const modes = [
    { id: "flashcard", label: "Flashcards", hint: "Flip & self-rate (SRS)", glyph: "\u2399" },
    { id: "quiz", label: "Quiz", hint: "Multiple choice", glyph: "\u2715" },
    { id: "write", label: "Write", hint: "Type the reading", glyph: "\u270E" },
    { id: "listen", label: "Listen", hint: "Audio \u2192 meaning", glyph: "\u266A" },
    { id: "build", label: "Build", hint: "Arrange sentences", glyph: "\u229E" },
    ...window.EXTRA_MODES_META || []
  ];
  const goals = [
    { kind: "cards", value: 10, label: "10 cards" },
    { kind: "cards", value: 20, label: "20 cards" },
    { kind: "cards", value: 40, label: "40 cards" },
    { kind: "due", value: 0, label: "Due only" }
  ];
  const fixedPoolFor = (m) => m === "build" || m === "cloze" ? window.CARD_DATA.sentences : m === "conjugate" ? window.CARD_DATA.verbs || [] : null;
  const applyLevel = (arr) => window.filterByLevel ? window.filterByLevel(arr, levelFocus) : arr;
  const totalInSelection = useMemoHome(() => {
    const fixed = fixedPoolFor(mode);
    if (fixed) return applyLevel(fixed).length;
    return categories.reduce((sum, c) => sum + applyLevel(window.CARD_DATA[c] || []).length, 0);
  }, [categories, mode, levelFocus]);
  const dueInSelection = useMemoHome(() => {
    const fixed = fixedPoolFor(mode);
    const isDueCard = (card) => window.isDue(progress.cardStats[window.cardKey(card)]);
    if (fixed) return applyLevel(fixed).filter(isDueCard).length;
    return categories.reduce((sum, c) => sum + applyLevel(window.CARD_DATA[c] || []).filter(isDueCard).length, 0);
  }, [categories, mode, progress, levelFocus]);
  const user = window.getUser ? window.getUser() : null;
  const goalHit = todayCards >= dailyGoal;
  const daru = window.mascotState ? window.mascotState(progress, todayCards, dailyGoal) : null;
  const streak = window.currentStreak(progress);
  const badgeCount = Object.keys(progress.badges || {}).length;
  const activeMode = modes.find((m) => m.id === mode);
  const deckSize = sessionGoal.kind === "cards" ? Math.min(sessionGoal.value, totalInSelection) : dueInSelection;
  const stat = (label, jp, value, sub, color) => /* @__PURE__ */ React.createElement("div", { className: "stat-row" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: t.text, fontFamily: t.fontUi } }, label, " ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: t.fontJp, color: t.textFaint, fontWeight: 500, marginLeft: 4 } }, jp)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: t.textMuted, marginTop: 2 } }, sub)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: t.fontUi, fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color } }, value));
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", style: { maxWidth: 1080, margin: "0 auto", paddingTop: 32 } }, /* @__PURE__ */ React.createElement(window.MistakeBanner, { t, progress, onDrill: startMistakeDrill }), /* @__PURE__ */ React.createElement("header", { style: { marginBottom: 24 } }, /* @__PURE__ */ React.createElement(window.Eyebrow, { t, accent: true }, (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })), /* @__PURE__ */ React.createElement("h1", { className: "resp-hero-title", style: {
    margin: "8px 0 4px",
    fontFamily: t.fontJp,
    fontWeight: 700,
    letterSpacing: -0.5,
    color: t.text,
    lineHeight: 1.1
  } }, "\u4ECA\u65E5\u306E\u5B66\u7FD2"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 15, color: t.textMuted } }, user ? /* @__PURE__ */ React.createElement(React.Fragment, null, "Welcome back, ", /* @__PURE__ */ React.createElement("b", { style: { color: t.text } }, user), ". ") : null, stats.dueCount > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("b", { style: { color: t.accent } }, stats.dueCount), " cards are due for review.") : "Nothing due right now. A few new cards keeps the streak alive.")), /* @__PURE__ */ React.createElement("section", { className: "resp-grid-12", style: { marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: {
    padding: "26px 28px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    gap: 24,
    alignItems: "center",
    flexWrap: "wrap"
  } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 240, position: "relative", zIndex: 1 } }, daru && window.Mascot ? /* @__PURE__ */ React.createElement(window.Mascot, { t, mood: daru.mood, message: daru.msg, size: 96, bounce: goalHit }) : null, /* @__PURE__ */ React.createElement("div", { style: { margin: "18px 0 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: t.textMuted, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", null, "Daily goal \xB7 \u76EE\u6A19"), /* @__PURE__ */ React.createElement("span", { className: "mono", style: { color: goalHit ? t.success : t.text, fontWeight: 700 } }, todayCards, " / ", dailyGoal)), /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "progressbar",
      "aria-label": "Daily goal",
      "aria-valuemin": 0,
      "aria-valuemax": dailyGoal,
      "aria-valuenow": Math.min(todayCards, dailyGoal),
      style: { height: 8, borderRadius: 999, background: t.progressTrack, overflow: "hidden" }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      height: "100%",
      width: `${Math.min(100, todayCards / dailyGoal * 100)}%`,
      background: goalHit ? t.success : t.accent,
      borderRadius: 999,
      transition: "width 0.6s cubic-bezier(.2,.7,.2,1)"
    } })
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(window.PrimaryButton, { t, onClick: startStudy }, "Start session \u2192"), stats.dueCount > 0 && /* @__PURE__ */ React.createElement(window.SecondaryButton, { t, onClick: () => {
    setDueOnly(true);
    setSessionGoal({ kind: "due", value: 0 });
    startStudy();
  } }, "Review ", stats.dueCount, " due"), stats.weakCount > 0 && /* @__PURE__ */ React.createElement(window.SecondaryButton, { t, onClick: startWeakReview }, "Weak spots (", stats.weakCount, ")"))), /* @__PURE__ */ React.createElement("div", { "aria-hidden": true, className: "resp-hero-kanji", style: {
    position: "absolute",
    fontFamily: t.fontJp,
    fontWeight: 700,
    color: `${t.accent}0F`,
    lineHeight: 1,
    pointerEvents: "none"
  } }, "\u5B66")), /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "22px 24px" } }, /* @__PURE__ */ React.createElement("div", { className: "stat-row", style: { flexDirection: "column", alignItems: "stretch", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: t.text, fontFamily: t.fontUi } }, "Streak ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: t.fontJp, color: t.textFaint, fontWeight: 500, marginLeft: 4 } }, "\u9023\u7D9A")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: t.textMuted, marginTop: 2 } }, "best ", progress.bestStreak || 0, " days")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: t.fontUi, fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color: t.warn } }, streak, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: t.textMuted, letterSpacing: 0, marginLeft: 4 } }, streak === 1 ? "day" : "days"))), window.WeekStrip && /* @__PURE__ */ React.createElement(window.WeekStrip, { t, progress })), stat("Accuracy", "\u6B63\u7B54", `${stats.acc}%`, `${progress.totalAnswered} answers`, t.accent), stat("Mastered", "\u7FD2\u5F97", stats.mastered, `of ${stats.total} cards`, t.success), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn stat-row",
      onClick: () => setScreen("progress"),
      style: { width: "100%", textAlign: "left" },
      "aria-label": `Badges: ${badgeCount} of ${(window.BADGES || []).length} earned. Open progress`
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: t.text, fontFamily: t.fontUi } }, "Badges ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: t.fontJp, color: t.textFaint, fontWeight: 500, marginLeft: 4 } }, "\u5370")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: t.accent, marginTop: 2, fontWeight: 600 } }, "See all \u2192")),
    /* @__PURE__ */ React.createElement("div", { style: { fontFamily: t.fontUi, fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color: t.text } }, badgeCount, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: t.textFaint, fontWeight: 600 } }, "/", (window.BADGES || []).length))
  ))), /* @__PURE__ */ React.createElement("section", { className: "surface-raised", style: { padding: "8px 28px 22px" }, "aria-labelledby": "builder-title" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "18px 0 4px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("h2", { id: "builder-title", style: { margin: 0, fontSize: 20, fontWeight: 700, fontFamily: t.fontUi, letterSpacing: -0.4, color: t.text } }, "Build a session ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: t.fontJp, fontWeight: 500, color: t.textFaint, fontSize: 16, marginLeft: 6 } }, "\u7DF4\u7FD2")), /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 12, color: t.textMuted } }, totalInSelection, " cards \xB7 ", dueInSelection, " due")), /* @__PURE__ */ React.createElement("div", { className: "builder-row" }, /* @__PURE__ */ React.createElement("div", { className: "builder-label" }, "Mode", /* @__PURE__ */ React.createElement("small", null, "\u65B9\u6CD5")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } }, modes.map((m) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: m.id,
      className: "btn chip" + (mode === m.id ? " on" : ""),
      "aria-pressed": mode === m.id,
      onClick: () => setMode(m.id)
    },
    /* @__PURE__ */ React.createElement("span", { className: "chip-glyph", "aria-hidden": "true" }, m.glyph),
    m.label
  ))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: t.textMuted, marginTop: 8 } }, activeMode?.hint))), /* @__PURE__ */ React.createElement("div", { className: "builder-row" }, /* @__PURE__ */ React.createElement("div", { className: "builder-label" }, mode === "build" ? "Sentences" : "Content", /* @__PURE__ */ React.createElement("small", null, "\u5185\u5BB9")), /* @__PURE__ */ React.createElement("div", null, setLevelFocus && /* @__PURE__ */ React.createElement("div", { className: "seg", role: "group", "aria-label": "JLPT level", style: { marginBottom: 10 } }, [{ id: "all", label: "All levels" }, { id: 5, label: "N5" }, { id: 4, label: "N4" }].map((o) => /* @__PURE__ */ React.createElement("button", { key: String(o.id), className: "btn", "aria-pressed": levelFocus === o.id, onClick: () => setLevelFocus(o.id) }, o.label))), fixedPoolFor(mode) ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: t.textMuted, lineHeight: 1.5 } }, mode === "build" && /* @__PURE__ */ React.createElement(React.Fragment, null, "Build mode drills the ", /* @__PURE__ */ React.createElement("b", { style: { color: t.text } }, "sentence bank"), ": arrange words and particles in order."), mode === "cloze" && /* @__PURE__ */ React.createElement(React.Fragment, null, "Cloze drills the ", /* @__PURE__ */ React.createElement("b", { style: { color: t.text } }, "sentence bank"), ": fill the blank with the right particle, ending, or word."), mode === "conjugate" && /* @__PURE__ */ React.createElement(React.Fragment, null, "Conjugate drills the ", /* @__PURE__ */ React.createElement("b", { style: { color: t.text } }, "verb bank"), ": type the \u307E\u3059 form of each verb."), " ", "Categories don't apply here.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } }, window.CATEGORY_META.map((c) => {
    const on = categories.includes(c.id);
    const dueN = window.CARD_DATA[c.id].filter((card) => window.isDue(progress.cardStats[window.cardKey(card)])).length;
    return /* @__PURE__ */ React.createElement("button", { key: c.id, className: "btn chip" + (on ? " on" : ""), "aria-pressed": on, onClick: () => toggleCat(c.id) }, /* @__PURE__ */ React.createElement("span", { className: "chip-glyph", "aria-hidden": "true" }, c.icon), c.label, /* @__PURE__ */ React.createElement("span", { className: "chip-meta" }, window.CARD_DATA[c.id].length, dueN > 0 ? ` \xB7 ${dueN} due` : ""));
  })))), /* @__PURE__ */ React.createElement("div", { className: "builder-row" }, /* @__PURE__ */ React.createElement("div", { className: "builder-label" }, "Length", /* @__PURE__ */ React.createElement("small", null, "\u9577\u3055")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "seg", role: "group", "aria-label": "Session length" }, goals.map((g) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: g.label,
      className: "btn",
      "aria-pressed": sessionGoal.kind === g.kind && sessionGoal.value === g.value,
      onClick: () => setSessionGoal(g)
    },
    g.label
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 12, color: t.textMuted } }, deckSize, " cards \xB7 ~", Math.max(1, Math.round(deckSize * 0.25)), " min"), /* @__PURE__ */ React.createElement(window.PrimaryButton, { t, onClick: startStudy, disabled: deckSize === 0, style: { padding: "11px 22px" } }, "Start ", activeMode?.label?.toLowerCase(), " \u2192"))))), progress.history?.length > 0 && /* @__PURE__ */ React.createElement("section", { style: { marginTop: 28 } }, /* @__PURE__ */ React.createElement(window.Eyebrow, { t }, "Recent sessions \xB7 \u5C65\u6B74"), /* @__PURE__ */ React.createElement("div", { className: "surface", style: { marginTop: 10, padding: "4px 20px" } }, progress.history.slice().reverse().slice(0, 4).map((hst, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "stat-row", style: { alignItems: "center", padding: "12px 0" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: t.text, fontFamily: t.fontUi, textTransform: "capitalize" } }, hst.mode), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 11, color: t.textMuted, marginTop: 2 } }, hst.date, " \xB7 ", hst.cards, " cards \xB7 ", Math.max(1, Math.round(hst.duration / 60)), " min")), /* @__PURE__ */ React.createElement(window.Pill, { t, tone: hst.score >= 80 ? "success" : hst.score >= 60 ? "warn" : "danger", size: "sm" }, hst.score, "%"))))));
}
window.HomeScreen = HomeScreen;
})();
