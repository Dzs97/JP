(function(){
const { useState: useStateC, useMemo: useMemoC } = React;
const COURSE_KEEP_DAYS = 120;
const emptyDay = () => ({ review: false, lesson: false, listen: false, speak: false });
const courseViewMemo = { tab: "today", lessonId: null };
function courseRecord(up, ctx, pct) {
  if (!up || !ctx) return up;
  const c = up.course && typeof up.course === "object" ? up.course : {};
  c.lessons = c.lessons || {};
  c.days = c.days || {};
  const today = window.todayKey();
  const day = { ...emptyDay(), ...c.days[today] || {} };
  const now = Date.now();
  const pass = window.COURSE_PASS_PCT || 70;
  if (ctx.kind === "review") day.review = true;
  if (ctx.kind === "listen") day.listen = true;
  if (ctx.lesson && (ctx.kind === "learn" || ctx.kind === "quiz")) {
    const L = { best: 0, last: null, passed: false, passedAt: null, learnedAt: null, ...c.lessons[ctx.lesson] || {} };
    if (ctx.kind === "learn") L.learnedAt = now;
    if (ctx.kind === "quiz") {
      L.last = pct;
      L.best = Math.max(L.best || 0, pct);
      if (pct >= pass && !L.passed) {
        L.passed = true;
        L.passedAt = now;
        day.lesson = ctx.lesson;
      }
    }
    c.lessons[ctx.lesson] = L;
  }
  c.days[today] = day;
  const keys = Object.keys(c.days).sort();
  if (keys.length > COURSE_KEEP_DAYS) keys.slice(0, keys.length - COURSE_KEEP_DAYS).forEach((k) => {
    delete c.days[k];
  });
  up.course = c;
  return up;
}
function courseState(progress) {
  const lessons = window.COURSE_LESSONS || [];
  const course = progress.course || { lessons: {}, days: {} };
  const lp = course.lessons || {};
  const days = course.days || {};
  const today = window.todayKey();
  const day = { ...emptyDay(), ...days[today] || {} };
  const passedIds = lessons.filter((L) => lp[L.id]?.passed).map((L) => L.id);
  const nextLesson = lessons.find((L) => !lp[L.id]?.passed) || null;
  const lastPassed = [...lessons].reverse().find((L) => lp[L.id]?.passed) || null;
  const passedToday = day.lesson ? lessons.find((L) => L.id === day.lesson) : null;
  const started = new Set(Object.keys(lp));
  const seenMap = /* @__PURE__ */ new Map();
  lessons.forEach((L) => {
    if (!started.has(L.id)) return;
    L.cards.forEach((c) => {
      if (!seenMap.has(c.front) && progress.cardStats[window.cardKey(c)]) seenMap.set(c.front, c);
    });
  });
  const seen = [...seenMap.values()];
  const due = seen.filter((c) => window.isDue(progress.cardStats[window.cardKey(c)])).sort((a, b) => (progress.cardStats[window.cardKey(a)]?.due || 0) - (progress.cardStats[window.cardKey(b)]?.due || 0)).slice(0, 60);
  const anyDone = (d) => d && (d.review || d.lesson || d.listen || d.speak);
  let streak = 0;
  const cur = /* @__PURE__ */ new Date();
  cur.setHours(12, 0, 0, 0);
  if (!anyDone(days[today])) cur.setDate(cur.getDate() - 1);
  for (let i = 0; i < COURSE_KEEP_DAYS; i++) {
    const k = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    if (!anyDone(days[k])) break;
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  const speakLesson = passedToday || lastPassed || nextLesson || lessons[0];
  let speakCards = [];
  if (speakLesson) {
    const by = (k) => speakLesson.cards.filter((c) => c.kind === k);
    speakCards = by("sentence");
    if (!speakCards.length) speakCards = by("phrase");
    if (!speakCards.length) speakCards = by("word");
    speakCards = speakCards.slice(0, 8);
  }
  const steps = {
    review: day.review || due.length === 0,
    lesson: !!day.lesson,
    listen: !!day.listen,
    speak: !!day.speak
  };
  const doneCount = Object.values(steps).filter(Boolean).length;
  const currentPhase = (nextLesson || lastPassed || lessons[0])?.phase || 1;
  return {
    lessons,
    lp,
    day,
    passedIds,
    nextLesson,
    lastPassed,
    passedToday,
    seen,
    due,
    streak,
    speakLesson,
    speakCards,
    steps,
    doneCount,
    currentPhase
  };
}
function CheckDot({ t, done, onClick }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick,
      disabled: !onClick,
      "aria-label": done ? "Done" : "Pending",
      style: {
        width: 28,
        height: 28,
        flexShrink: 0,
        borderRadius: 999,
        background: done ? t.success : "transparent",
        border: `2px solid ${done ? t.success : t.surfaceBorderStrong}`,
        color: t.onAccent || "#fff",
        fontSize: 15,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 1,
        cursor: onClick ? "pointer" : "default"
      }
    },
    done ? "\u2713" : ""
  );
}
function PlayBtn({ t, onClick }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick,
      "aria-label": "Play",
      style: {
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: 999,
        background: `${t.accent}14`,
        color: t.accent,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    },
    "\u25B6"
  );
}
function Bar({ t, value, max }) {
  const pct = max ? Math.round(value / max * 100) : 0;
  return /* @__PURE__ */ React.createElement("div", { style: { height: 6, background: t.progressTrack, borderRadius: 999, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${pct}%`, height: "100%", background: t.accent, borderRadius: 999, transition: "width .4s" } }));
}
function StepCard({ t, n, title, min, done, onToggle, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "16px 16px 18px", display: "flex", gap: 14, alignItems: "flex-start", minWidth: 0 } }, /* @__PURE__ */ React.createElement(CheckDot, { t, done, onClick: onToggle }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 11, color: t.textFaint } }, n), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17, fontWeight: 700, color: t.text, fontFamily: t.fontUi } }, title), /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 11, color: t.textFaint } }, min, " min")), children));
}
function SmallBtn({ t, onClick, disabled, primary, children }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick,
      disabled,
      style: {
        padding: "9px 14px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: t.fontUi,
        background: primary ? t.accent : t.btnGhost,
        color: primary ? t.onAccent : t.text,
        border: primary ? "none" : `1px solid ${t.btnGhostBorder}`
      }
    },
    children
  );
}
function CourseScreen(p) {
  const { t, progress, setProgress, startCourseDeck, speakForce } = p;
  const [tab, setTabState] = useStateC(courseViewMemo.tab);
  const [lessonId, setLessonIdState] = useStateC(courseViewMemo.lessonId);
  const setTab = (v) => {
    courseViewMemo.tab = v;
    setTabState(v);
  };
  const openLesson = (id) => {
    courseViewMemo.lessonId = id;
    setLessonIdState(id);
    try {
      window.scrollTo(0, 0);
    } catch (_) {
    }
  };
  const st = useMemoC(() => courseState(progress), [progress]);
  if (!window.COURSE_LESSONS) return null;
  const setDayFlag = (field, value) => {
    const up = JSON.parse(JSON.stringify(progress));
    up.course = up.course || { lessons: {}, days: {} };
    up.course.days = up.course.days || {};
    const k = window.todayKey();
    up.course.days[k] = { ...emptyDay(), ...up.course.days[k] || {}, [field]: value };
    setProgress(up);
  };
  const lesson = lessonId ? st.lessons.find((L) => L.id === lessonId) : null;
  if (lesson) {
    return /* @__PURE__ */ React.createElement(
      LessonView,
      {
        t,
        lesson,
        st,
        speakForce,
        startCourseDeck,
        onBack: () => openLesson(null),
        openLesson
      }
    );
  }
  const wrap = { maxWidth: 760, margin: "0 auto", paddingTop: 24, minWidth: 0 };
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", style: wrap }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, background: t.surfaceSunken, padding: 4, borderRadius: 12, marginBottom: 20, width: "fit-content", maxWidth: "100%" } }, [{ id: "today", label: "Today" }, { id: "all", label: "All lessons" }].map((x) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: x.id,
      className: "btn",
      onClick: () => setTab(x.id),
      style: {
        padding: "7px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: t.fontUi,
        background: tab === x.id ? t.surfaceBg : "transparent",
        color: tab === x.id ? t.text : t.textMuted,
        boxShadow: tab === x.id ? t.shadowCard : "none"
      }
    },
    x.label
  ))), tab === "today" ? /* @__PURE__ */ React.createElement(
    TodayView,
    {
      t,
      st,
      progress,
      startCourseDeck,
      speakForce,
      setDayFlag,
      openLesson
    }
  ) : /* @__PURE__ */ React.createElement(AllLessonsView, { t, st, openLesson }));
}
function TodayView({ t, st, startCourseDeck, speakForce, setDayFlag, openLesson }) {
  const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
  const phase = (window.COURSE_PHASES || []).find((ph) => ph.id === st.currentPhase);
  const phaseLessons = st.lessons.filter((L) => L.phase === st.currentPhase);
  const phasePassed = phaseLessons.filter((L) => st.lp[L.id]?.passed).length;
  const links = (window.COURSE_LISTENING || {})[st.currentPhase] || [];
  const stepMeta = Object.fromEntries((window.COURSE_DAILY_STEPS || []).map((s) => [s.id, s]));
  const M = (id, k, d) => stepMeta[id] && stepMeta[id][k] || d;
  const nl = st.nextLesson;
  const startReview = () => {
    if (!st.due.length) return;
    startCourseDeck(st.due, "flashcard", { kind: "review" });
  };
  const startListen = () => {
    if (!st.seen.length) return;
    startCourseDeck(window.shuffle(st.seen).slice(0, 15), "listen", { kind: "listen" });
  };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 14, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "20px 18px" } }, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 11, color: t.textFaint, letterSpacing: 1, textTransform: "uppercase" } }, dateStr), /* @__PURE__ */ React.createElement("h1", { className: "resp-screen-title", style: { margin: "6px 0 4px", fontWeight: 800, letterSpacing: -1, color: t.text, fontFamily: t.fontUi } }, "Your plan for today"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 14, color: t.textMuted, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("span", null, "\u224860 min \xB7 ", /* @__PURE__ */ React.createElement("b", { style: { color: t.text } }, st.doneCount, " of 4"), " steps done"), /* @__PURE__ */ React.createElement("span", { style: {
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: t.streakBg,
    color: t.streakText,
    border: `1px solid ${t.streakBorder}`
  } }, "\u{1F525} ", st.streak, "-day streak")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: t.textMuted, marginBottom: 5 } }, /* @__PURE__ */ React.createElement("span", null, "Phase ", st.currentPhase, " \xB7 ", phase?.title, " ", /* @__PURE__ */ React.createElement("span", { className: "jp" }, phase?.jp)), /* @__PURE__ */ React.createElement("span", { className: "mono" }, phasePassed, "/", phaseLessons.length)), /* @__PURE__ */ React.createElement(Bar, { t, value: phasePassed, max: phaseLessons.length })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: t.textMuted, marginBottom: 5 } }, /* @__PURE__ */ React.createElement("span", null, "Lessons passed"), /* @__PURE__ */ React.createElement("span", { className: "mono" }, st.passedIds.length, "/", st.lessons.length)), /* @__PURE__ */ React.createElement(Bar, { t, value: st.passedIds.length, max: st.lessons.length })))), /* @__PURE__ */ React.createElement(StepCard, { t, n: "1", title: M("review", "title", "Review"), min: M("review", "min", 15), done: st.steps.review }, st.due.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.textMuted, marginBottom: 10 } }, "You have ", /* @__PURE__ */ React.createElement("b", { style: { color: t.text } }, st.due.length), " card", st.due.length === 1 ? "" : "s", " to review today."), /* @__PURE__ */ React.createElement(SmallBtn, { t, primary: true, onClick: startReview }, "Start review \u2192")) : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.textMuted } }, st.seen.length ? "No reviews due. You're all caught up!" : "No cards to review yet. Start with today's lesson.")), /* @__PURE__ */ React.createElement(StepCard, { t, n: "2", title: M("lesson", "title", "New lesson"), min: M("lesson", "min", 20), done: st.steps.lesson }, st.passedToday ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.textMuted, marginBottom: 10 } }, "You passed ", /* @__PURE__ */ React.createElement("b", { style: { color: t.text } }, st.passedToday.id, " \xB7 ", st.passedToday.title), " today \u{1F389}", nl && /* @__PURE__ */ React.createElement(React.Fragment, null, " We suggest not starting the next one: tomorrow's review will be heavier.")), nl && /* @__PURE__ */ React.createElement(SmallBtn, { t, onClick: () => openLesson(nl.id) }, "Open ", nl.id, " anyway")) : nl ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.textMuted, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("b", { style: { color: t.text } }, nl.id, " \xB7 ", nl.title), " ", /* @__PURE__ */ React.createElement("span", { className: "jp" }, nl.jp), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4 } }, "Cards, then the exam. You pass with ", window.COURSE_PASS_PCT, "% or more.")), /* @__PURE__ */ React.createElement(SmallBtn, { t, primary: true, onClick: () => openLesson(nl.id) }, "Open lesson \u2192")) : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.textMuted } }, "You finished all 28 lessons! Keep up the daily review and listening.")), /* @__PURE__ */ React.createElement(
    StepCard,
    {
      t,
      n: "3",
      title: M("listen", "title", "Listening"),
      min: M("listen", "min", 15),
      done: st.steps.listen,
      onToggle: () => setDayFlag("listen", !st.steps.listen)
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.textMuted, marginBottom: 10 } }, "Listen and pick the meaning. Then continue with a resource for this phase."),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 } }, /* @__PURE__ */ React.createElement(SmallBtn, { t, primary: true, onClick: startListen, disabled: !st.seen.length }, "\u266A Listen 15")),
    !st.seen.length && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: t.textFaint, marginBottom: 10 } }, "Unlocks once you've seen some course cards."),
    /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 6, marginBottom: 10 } }, links.map((l) => /* @__PURE__ */ React.createElement(
      "a",
      {
        key: l.url,
        href: l.url,
        target: "_blank",
        rel: "noopener noreferrer",
        style: { fontSize: 13, color: t.accent, textDecoration: "none", overflowWrap: "anywhere" }
      },
      "\u2197 ",
      l.label
    ))),
    /* @__PURE__ */ React.createElement("label", { style: { display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: t.textMuted, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: st.steps.listen, onChange: (e) => setDayFlag("listen", e.target.checked) }), "I listened for 15 minutes today")
  ), /* @__PURE__ */ React.createElement(
    StepCard,
    {
      t,
      n: "4",
      title: M("speak", "title", "Speaking"),
      min: M("speak", "min", 10),
      done: st.steps.speak,
      onToggle: () => setDayFlag("speak", !st.steps.speak)
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.textMuted, marginBottom: 10 } }, "Shadowing: tap \u25B6, listen and repeat out loud at the same pace. 3 times each.", st.speakLesson && /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint } }, " (", st.speakLesson.id, " \xB7 ", st.speakLesson.title, ")")),
    /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8, marginBottom: 12 } }, st.speakCards.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.front, style: { display: "flex", gap: 10, alignItems: "center", minWidth: 0 } }, /* @__PURE__ */ React.createElement(PlayBtn, { t, onClick: () => speakForce(c.front) }), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: 17, color: t.text, overflowWrap: "anywhere" } }, c.front), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: t.textMuted } }, c.back, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: "mono" }, c.romanji)))))),
    /* @__PURE__ */ React.createElement("label", { style: { display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: t.textMuted, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: st.steps.speak, onChange: (e) => setDayFlag("speak", e.target.checked) }), "I practiced out loud today")
  ));
}
function AllLessonsView({ t, st, openLesson }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 22, minWidth: 0 } }, (window.COURSE_PHASES || []).map((ph) => {
    const ls = st.lessons.filter((L) => L.phase === ph.id);
    const passed = ls.filter((L) => st.lp[L.id]?.passed).length;
    return /* @__PURE__ */ React.createElement("div", { key: ph.id }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: t.text, fontFamily: t.fontUi } }, "Phase ", ph.id, " \xB7 ", ph.title, " ", /* @__PURE__ */ React.createElement("span", { className: "jp", style: { fontWeight: 500, color: t.textMuted, fontSize: 15 } }, ph.jp)), /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 12, color: t.textFaint } }, passed, "/", ls.length)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: t.textMuted, marginBottom: 10 } }, ph.desc), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, ls.map((L) => {
      const r = st.lp[L.id];
      const isNext = st.nextLesson && st.nextLesson.id === L.id;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: L.id,
          className: "btn surface",
          onClick: () => openLesson(L.id),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            textAlign: "left",
            border: `1px solid ${isNext ? t.accent : t.surfaceBorder}`,
            minWidth: 0,
            width: "100%"
          }
        },
        /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 12, color: t.textFaint, width: 30, flexShrink: 0 } }, L.id),
        /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 15, fontWeight: 600, color: t.text, fontFamily: t.fontUi } }, L.title), /* @__PURE__ */ React.createElement("span", { className: "jp", style: { display: "block", fontSize: 13, color: t.textMuted, overflowWrap: "anywhere" } }, L.jp)),
        r?.passed ? /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "success", size: "sm" }, "\u2713 ", r.best, "%") : isNext ? /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "accent", size: "sm" }, "Next") : r?.best ? /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "warn", size: "sm" }, r.best, "%") : null
      );
    })));
  }));
}
function LessonView({ t, lesson, st, speakForce, startCourseDeck, onBack, openLesson }) {
  const r = st.lp[lesson.id];
  const pass = window.COURSE_PASS_PCT || 70;
  const i = st.lessons.findIndex((L) => L.id === lesson.id);
  const prev = st.lessons[i - 1];
  const nextL = st.lessons[i + 1];
  const phase = (window.COURSE_PHASES || []).find((ph) => ph.id === lesson.phase);
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", style: { maxWidth: 760, margin: "0 auto", paddingTop: 24, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: onBack,
      style: { padding: "7px 12px", borderRadius: 10, background: t.btnGhost, color: t.textMuted, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi, marginBottom: 16 }
    },
    "\u2190 Course"
  ), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 11, color: t.textFaint, letterSpacing: 1, textTransform: "uppercase" } }, lesson.id, " \xB7 Phase ", lesson.phase, " \xB7 ", phase?.title), /* @__PURE__ */ React.createElement("h1", { className: "resp-screen-title", style: { margin: "6px 0 2px", fontWeight: 800, letterSpacing: -1, color: t.text, fontFamily: t.fontUi } }, lesson.title), /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: 22, color: t.accent, marginBottom: 14 } }, lesson.jp), r?.passed ? /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "success", style: { marginBottom: 16 } }, "Passed \u2713 \xB7 best ", r.best, "%") : r?.best ? /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "warn", style: { marginBottom: 16 } }, "Best attempt ", r.best, "% \xB7 you need ", pass, "%") : null, /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "18px 18px", marginBottom: 14 } }, lesson.intro.map((para, k) => /* @__PURE__ */ React.createElement("p", { key: k, style: { margin: k ? "12px 0 0" : 0, fontSize: 15, lineHeight: 1.6, color: t.textPrimary } }, para))), lesson.tip && /* @__PURE__ */ React.createElement("div", { style: {
    padding: "12px 16px",
    borderRadius: 12,
    marginBottom: 18,
    background: `${t.accent}10`,
    border: `1px solid ${t.accent}33`,
    fontSize: 14,
    color: t.text,
    lineHeight: 1.5
  } }, "\u{1F4A1} ", /* @__PURE__ */ React.createElement("b", null, "Tip:"), " ", lesson.tip), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 } }, /* @__PURE__ */ React.createElement(
    window.PrimaryButton,
    {
      t,
      style: { padding: "13px 22px" },
      onClick: () => startCourseDeck(window.shuffle(lesson.cards), "flashcard", { kind: "learn", lesson: lesson.id })
    },
    "1 \xB7 Cards"
  ), /* @__PURE__ */ React.createElement(
    window.SecondaryButton,
    {
      t,
      onClick: () => startCourseDeck(window.shuffle(lesson.cards), "quiz", { kind: "quiz", lesson: lesson.id })
    },
    "2 \xB7 Exam"
  )), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 11, color: t.textFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 } }, lesson.cards.length, " cards"), /* @__PURE__ */ React.createElement("div", { className: "surface", style: { marginBottom: 22, overflow: "hidden" } }, lesson.cards.map((c, k) => /* @__PURE__ */ React.createElement("div", { key: c.front, style: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "10px 14px",
    minWidth: 0,
    borderTop: k ? `1px solid ${t.surfaceBorder}` : "none"
  } }, /* @__PURE__ */ React.createElement(PlayBtn, { t, onClick: () => speakForce(c.front) }), c.kind !== "sentence" && /* @__PURE__ */ React.createElement("div", { className: "jp", style: {
    fontSize: 22,
    color: t.text,
    flexShrink: 0,
    maxWidth: "45%",
    overflowWrap: "anywhere",
    minWidth: c.kind === "kana" ? 44 : 0
  } }, c.front), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, c.kind === "sentence" && /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: 17, color: t.text, overflowWrap: "anywhere" } }, c.front), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: c.kind === "sentence" ? t.textMuted : t.text } }, c.kind === "kana" ? /* @__PURE__ */ React.createElement("span", { className: "mono" }, c.romanji) : c.back), c.kind !== "kana" && /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 12, color: t.textFaint } }, c.romanji), c.note && /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: 12, color: t.textMuted, marginTop: 2 } }, c.note))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" } }, prev ? /* @__PURE__ */ React.createElement(SmallBtn, { t, onClick: () => openLesson(prev.id) }, "\u2190 ", prev.id) : /* @__PURE__ */ React.createElement("span", null), nextL && /* @__PURE__ */ React.createElement(SmallBtn, { t, onClick: () => openLesson(nextL.id) }, nextL.id, " \u2192")));
}
Object.assign(window, { CourseScreen, courseRecord });
})();
