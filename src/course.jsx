// ═══════════════════════════════════════════════════════════════════════
//  Curso guiado — pantalla «Curso» (Hoy / Todas las lecciones / lección)
//  Progreso en progress.course = { lessons: {...}, days: {...} }
// ═══════════════════════════════════════════════════════════════════════
const { useState: useStateC, useMemo: useMemoC } = React;

const COURSE_KEEP_DAYS = 120;
const emptyDay = () => ({ review: false, lesson: false, listen: false, speak: false });

// Remembers which view was open, so «Volver al curso» lands where you left off.
const courseViewMemo = { tab: "today", lessonId: null };

// ── Progress writer (called from app.jsx next() at session end) ─────────
function courseRecord(up, ctx, pct) {
  if (!up || !ctx) return up;
  const c = up.course && typeof up.course === "object" ? up.course : {};
  c.lessons = c.lessons || {};
  c.days = c.days || {};
  const today = window.todayKey();
  const day = { ...emptyDay(), ...(c.days[today] || {}) };
  const now = Date.now();
  const pass = window.COURSE_PASS_PCT || 70;

  if (ctx.kind === "review") day.review = true;
  if (ctx.kind === "listen") day.listen = true;
  if (ctx.lesson && (ctx.kind === "learn" || ctx.kind === "quiz")) {
    const L = { best: 0, last: null, passed: false, passedAt: null, learnedAt: null, ...(c.lessons[ctx.lesson] || {}) };
    if (ctx.kind === "learn") L.learnedAt = now;
    if (ctx.kind === "quiz") {
      L.last = pct;
      L.best = Math.max(L.best || 0, pct);
      if (pct >= pass && !L.passed) {
        L.passed = true;
        L.passedAt = now;
        day.lesson = ctx.lesson; // a new lesson was passed today
      }
    }
    c.lessons[ctx.lesson] = L;
  }
  c.days[today] = day;

  // Keep only the most recent N days
  const keys = Object.keys(c.days).sort();
  if (keys.length > COURSE_KEEP_DAYS) keys.slice(0, keys.length - COURSE_KEEP_DAYS).forEach(k => { delete c.days[k]; });
  up.course = c;
  return up;
}

// ── Derived helpers ──────────────────────────────────────────────────────
function courseState(progress) {
  const lessons = window.COURSE_LESSONS || [];
  const course = progress.course || { lessons: {}, days: {} };
  const lp = course.lessons || {};
  const days = course.days || {};
  const today = window.todayKey();
  const day = { ...emptyDay(), ...(days[today] || {}) };

  const passedIds = lessons.filter(L => lp[L.id]?.passed).map(L => L.id);
  const nextLesson = lessons.find(L => !lp[L.id]?.passed) || null;
  const lastPassed = [...lessons].reverse().find(L => lp[L.id]?.passed) || null;
  const passedToday = day.lesson ? lessons.find(L => L.id === day.lesson) : null;

  // Cards "seen" = cards of lessons you've started that already have SRS stats
  const started = new Set(Object.keys(lp));
  const seenMap = new Map();
  lessons.forEach(L => {
    if (!started.has(L.id)) return;
    L.cards.forEach(c => {
      if (!seenMap.has(c.front) && progress.cardStats[window.cardKey(c)]) seenMap.set(c.front, c);
    });
  });
  const seen = [...seenMap.values()];
  const due = seen
    .filter(c => window.isDue(progress.cardStats[window.cardKey(c)]))
    .sort((a, b) => (progress.cardStats[window.cardKey(a)]?.due || 0) - (progress.cardStats[window.cardKey(b)]?.due || 0))
    .slice(0, 60);

  // Streak: consecutive days with at least one step done (today counts if any).
  const anyDone = (d) => d && (d.review || d.lesson || d.listen || d.speak);
  let streak = 0;
  const cur = new Date(); cur.setHours(12, 0, 0, 0);
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
    const by = (k) => speakLesson.cards.filter(c => c.kind === k);
    speakCards = by("sentence");
    if (!speakCards.length) speakCards = by("phrase");
    if (!speakCards.length) speakCards = by("word");
    speakCards = speakCards.slice(0, 8);
  }

  const steps = {
    review: day.review || due.length === 0,
    lesson: !!day.lesson,
    listen: !!day.listen,
    speak: !!day.speak,
  };
  const doneCount = Object.values(steps).filter(Boolean).length;
  const currentPhase = (nextLesson || lastPassed || lessons[0])?.phase || 1;

  return { lessons, lp, day, passedIds, nextLesson, lastPassed, passedToday, seen, due,
    streak, speakLesson, speakCards, steps, doneCount, currentPhase };
}

// ── Small UI pieces ──────────────────────────────────────────────────────
function CheckDot({ t, done, onClick }) {
  return (
    <button className="btn" onClick={onClick} disabled={!onClick} aria-label={done ? "Hecho" : "Pendiente"}
      style={{
        width: 28, height: 28, flexShrink: 0, borderRadius: 999,
        background: done ? t.success : "transparent",
        border: `2px solid ${done ? t.success : t.surfaceBorderStrong}`,
        color: t.onAccent || "#fff", fontSize: 15, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: 1, cursor: onClick ? "pointer" : "default",
      }}>
      {done ? "✓" : ""}
    </button>
  );
}

function PlayBtn({ t, onClick }) {
  return (
    <button className="btn" onClick={onClick} aria-label="Escuchar"
      style={{
        width: 34, height: 34, flexShrink: 0, borderRadius: 999,
        background: `${t.accent}14`, color: t.accent, fontSize: 13,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>▶</button>
  );
}

function Bar({ t, value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: 6, background: t.progressTrack, borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: t.accent, borderRadius: 999, transition: "width .4s" }} />
    </div>
  );
}

function StepCard({ t, n, title, min, done, onToggle, children }) {
  return (
    <div className="surface-raised" style={{ padding: "16px 16px 18px", display: "flex", gap: 14, alignItems: "flex-start", minWidth: 0 }}>
      <CheckDot t={t} done={done} onClick={onToggle} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span className="mono" style={{ fontSize: 11, color: t.textFaint }}>{n}</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: t.text, fontFamily: t.fontUi }}>{title}</span>
          <span className="mono" style={{ fontSize: 11, color: t.textFaint }}>{min} min</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SmallBtn({ t, onClick, disabled, primary, children }) {
  return (
    <button className="btn" onClick={onClick} disabled={disabled}
      style={{
        padding: "9px 14px", borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: t.fontUi,
        background: primary ? t.accent : t.btnGhost, color: primary ? t.onAccent : t.text,
        border: primary ? "none" : `1px solid ${t.btnGhostBorder}`,
      }}>
      {children}
    </button>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────
function CourseScreen(p) {
  const { t, progress, setProgress, startCourseDeck, speakForce } = p;
  const [tab, setTabState] = useStateC(courseViewMemo.tab);
  const [lessonId, setLessonIdState] = useStateC(courseViewMemo.lessonId);
  const setTab = (v) => { courseViewMemo.tab = v; setTabState(v); };
  const openLesson = (id) => {
    courseViewMemo.lessonId = id; setLessonIdState(id);
    try { window.scrollTo(0, 0); } catch (_) {}
  };

  const st = useMemoC(() => courseState(progress), [progress]);
  if (!window.COURSE_LESSONS) return null;

  const setDayFlag = (field, value) => {
    const up = JSON.parse(JSON.stringify(progress));
    up.course = up.course || { lessons: {}, days: {} };
    up.course.days = up.course.days || {};
    const k = window.todayKey();
    up.course.days[k] = { ...emptyDay(), ...(up.course.days[k] || {}), [field]: value };
    setProgress(up);
  };

  const lesson = lessonId ? st.lessons.find(L => L.id === lessonId) : null;
  if (lesson) {
    return <LessonView t={t} lesson={lesson} st={st} speakForce={speakForce}
      startCourseDeck={startCourseDeck} onBack={() => openLesson(null)} openLesson={openLesson} />;
  }

  const wrap = { maxWidth: 760, margin: "0 auto", paddingTop: 24, minWidth: 0 };

  return (
    <div className="fade-up" style={wrap}>
      {/* Inner tabs */}
      <div style={{ display: "flex", gap: 4, background: t.surfaceSunken, padding: 4, borderRadius: 12, marginBottom: 20, width: "fit-content", maxWidth: "100%" }}>
        {[{ id: "today", label: "Hoy" }, { id: "all", label: "Todas las lecciones" }].map(x => (
          <button key={x.id} className="btn" onClick={() => setTab(x.id)}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi,
              background: tab === x.id ? t.surfaceBg : "transparent",
              color: tab === x.id ? t.text : t.textMuted,
              boxShadow: tab === x.id ? t.shadowCard : "none",
            }}>{x.label}</button>
        ))}
      </div>

      {tab === "today"
        ? <TodayView t={t} st={st} progress={progress} startCourseDeck={startCourseDeck}
            speakForce={speakForce} setDayFlag={setDayFlag} openLesson={openLesson} />
        : <AllLessonsView t={t} st={st} openLesson={openLesson} />}
    </div>
  );
}

// ── «Hoy» ────────────────────────────────────────────────────────────────
function TodayView({ t, st, startCourseDeck, speakForce, setDayFlag, openLesson }) {
  const dateStr = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const phase = (window.COURSE_PHASES || []).find(ph => ph.id === st.currentPhase);
  const phaseLessons = st.lessons.filter(L => L.phase === st.currentPhase);
  const phasePassed = phaseLessons.filter(L => st.lp[L.id]?.passed).length;
  const links = (window.COURSE_LISTENING || {})[st.currentPhase] || [];
  const stepMeta = Object.fromEntries((window.COURSE_DAILY_STEPS || []).map(s => [s.id, s]));
  const M = (id, k, d) => (stepMeta[id] && stepMeta[id][k]) || d;
  const nl = st.nextLesson;

  const startReview = () => {
    if (!st.due.length) return;
    startCourseDeck(st.due, "flashcard", { kind: "review" });
  };
  const startListen = () => {
    if (!st.seen.length) return;
    startCourseDeck(window.shuffle(st.seen).slice(0, 15), "listen", { kind: "listen" });
  };

  return (
    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
      {/* Header */}
      <div className="surface-raised" style={{ padding: "20px 18px" }}>
        <div className="mono" style={{ fontSize: 11, color: t.textFaint, letterSpacing: 1, textTransform: "uppercase" }}>{dateStr}</div>
        <h1 className="resp-screen-title" style={{ margin: "6px 0 4px", fontWeight: 800, letterSpacing: -1, color: t.text, fontFamily: t.fontUi }}>
          Tu plan de hoy
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 14, color: t.textMuted, marginBottom: 16 }}>
          <span>≈60 min · <b style={{ color: t.text }}>{st.doneCount} de 4</b> pasos listos</span>
          <span style={{
            padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: t.streakBg, color: t.streakText, border: `1px solid ${t.streakBorder}`,
          }}>🔥 {st.streak} {st.streak === 1 ? "día" : "días"} de racha</span>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: t.textMuted, marginBottom: 5 }}>
              <span>Fase {st.currentPhase} · {phase?.title} <span className="jp">{phase?.jp}</span></span>
              <span className="mono">{phasePassed}/{phaseLessons.length}</span>
            </div>
            <Bar t={t} value={phasePassed} max={phaseLessons.length} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: t.textMuted, marginBottom: 5 }}>
              <span>Lecciones aprobadas</span>
              <span className="mono">{st.passedIds.length}/{st.lessons.length}</span>
            </div>
            <Bar t={t} value={st.passedIds.length} max={st.lessons.length} />
          </div>
        </div>
      </div>

      {/* 1 · Repaso */}
      <StepCard t={t} n="1" title={M("review", "title", "Repaso")} min={M("review", "min", 15)} done={st.steps.review}>
        {st.due.length ? (
          <>
            <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 10 }}>
              Tienes <b style={{ color: t.text }}>{st.due.length}</b> tarjeta{st.due.length === 1 ? "" : "s"} para repasar hoy.
            </div>
            <SmallBtn t={t} primary onClick={startReview}>Empezar repaso →</SmallBtn>
          </>
        ) : (
          <div style={{ fontSize: 14, color: t.textMuted }}>
            {st.seen.length ? "No hay repasos pendientes. ¡Vas al día!" : "Aún no hay tarjetas para repasar. Empieza con la lección de hoy."}
          </div>
        )}
      </StepCard>

      {/* 2 · Lección nueva */}
      <StepCard t={t} n="2" title={M("lesson", "title", "Lección nueva")} min={M("lesson", "min", 20)} done={st.steps.lesson}>
        {st.passedToday ? (
          <>
            <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 10 }}>
              Hoy aprobaste <b style={{ color: t.text }}>{st.passedToday.id} · {st.passedToday.title}</b> 🎉
              {nl && <> Te sugerimos no adelantar la siguiente: mañana el repaso pesará más.</>}
            </div>
            {nl && <SmallBtn t={t} onClick={() => openLesson(nl.id)}>Ver {nl.id} de todos modos</SmallBtn>}
          </>
        ) : nl ? (
          <>
            <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 10 }}>
              <b style={{ color: t.text }}>{nl.id} · {nl.title}</b> <span className="jp">{nl.jp}</span>
              <div style={{ marginTop: 4 }}>Tarjetas y luego examen. Apruebas con {window.COURSE_PASS_PCT}% o más.</div>
            </div>
            <SmallBtn t={t} primary onClick={() => openLesson(nl.id)}>Abrir lección →</SmallBtn>
          </>
        ) : (
          <div style={{ fontSize: 14, color: t.textMuted }}>¡Terminaste las 28 lecciones! Sigue con el repaso diario y la escucha.</div>
        )}
      </StepCard>

      {/* 3 · Escucha */}
      <StepCard t={t} n="3" title={M("listen", "title", "Escucha")} min={M("listen", "min", 15)} done={st.steps.listen}
        onToggle={() => setDayFlag("listen", !st.steps.listen)}>
        <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 10 }}>
          Escucha y elige el significado. Luego sigue con un recurso de la fase.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <SmallBtn t={t} primary onClick={startListen} disabled={!st.seen.length}>♪ Escuchar 15</SmallBtn>
        </div>
        {!st.seen.length && <div style={{ fontSize: 12, color: t.textFaint, marginBottom: 10 }}>Se activa cuando hayas visto tarjetas del curso.</div>}
        <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
          {links.map(l => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: t.accent, textDecoration: "none", overflowWrap: "anywhere" }}>
              ↗ {l.label}
            </a>
          ))}
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: t.textMuted, cursor: "pointer" }}>
          <input type="checkbox" checked={st.steps.listen} onChange={e => setDayFlag("listen", e.target.checked)} />
          Ya escuché 15 minutos hoy
        </label>
      </StepCard>

      {/* 4 · Habla */}
      <StepCard t={t} n="4" title={M("speak", "title", "Habla")} min={M("speak", "min", 10)} done={st.steps.speak}
        onToggle={() => setDayFlag("speak", !st.steps.speak)}>
        <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 10 }}>
          Shadowing: toca ▶, escucha y repite en voz alta al mismo ritmo. 3 veces cada una.
          {st.speakLesson && <span style={{ color: t.textFaint }}> ({st.speakLesson.id} · {st.speakLesson.title})</span>}
        </div>
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          {st.speakCards.map(c => (
            <div key={c.front} style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
              <PlayBtn t={t} onClick={() => speakForce(c.front)} />
              <div style={{ minWidth: 0 }}>
                <div className="jp" style={{ fontSize: 17, color: t.text, overflowWrap: "anywhere" }}>{c.front}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>{c.back} · <span className="mono">{c.romanji}</span></div>
              </div>
            </div>
          ))}
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: t.textMuted, cursor: "pointer" }}>
          <input type="checkbox" checked={st.steps.speak} onChange={e => setDayFlag("speak", e.target.checked)} />
          Ya practiqué en voz alta hoy
        </label>
      </StepCard>
    </div>
  );
}

// ── «Todas las lecciones» ───────────────────────────────────────────────
function AllLessonsView({ t, st, openLesson }) {
  return (
    <div style={{ display: "grid", gap: 22, minWidth: 0 }}>
      {(window.COURSE_PHASES || []).map(ph => {
        const ls = st.lessons.filter(L => L.phase === ph.id);
        const passed = ls.filter(L => st.lp[L.id]?.passed).length;
        return (
          <div key={ph.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.text, fontFamily: t.fontUi }}>
                Fase {ph.id} · {ph.title} <span className="jp" style={{ fontWeight: 500, color: t.textMuted, fontSize: 15 }}>{ph.jp}</span>
              </div>
              <span className="mono" style={{ fontSize: 12, color: t.textFaint }}>{passed}/{ls.length}</span>
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 10 }}>{ph.desc}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {ls.map(L => {
                const r = st.lp[L.id];
                const isNext = st.nextLesson && st.nextLesson.id === L.id;
                return (
                  <button key={L.id} className="btn surface" onClick={() => openLesson(L.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", textAlign: "left",
                      border: `1px solid ${isNext ? t.accent : t.surfaceBorder}`, minWidth: 0, width: "100%",
                    }}>
                    <span className="mono" style={{ fontSize: 12, color: t.textFaint, width: 30, flexShrink: 0 }}>{L.id}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: t.text, fontFamily: t.fontUi }}>{L.title}</span>
                      <span className="jp" style={{ display: "block", fontSize: 13, color: t.textMuted, overflowWrap: "anywhere" }}>{L.jp}</span>
                    </span>
                    {r?.passed
                      ? <window.Pill t={t} tone="success" size="sm">✓ {r.best}%</window.Pill>
                      : isNext
                        ? <window.Pill t={t} tone="accent" size="sm">Siguiente</window.Pill>
                        : r?.best ? <window.Pill t={t} tone="warn" size="sm">{r.best}%</window.Pill> : null}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Vista de lección ────────────────────────────────────────────────────
function LessonView({ t, lesson, st, speakForce, startCourseDeck, onBack, openLesson }) {
  const r = st.lp[lesson.id];
  const pass = window.COURSE_PASS_PCT || 70;
  const i = st.lessons.findIndex(L => L.id === lesson.id);
  const prev = st.lessons[i - 1];
  const nextL = st.lessons[i + 1];
  const phase = (window.COURSE_PHASES || []).find(ph => ph.id === lesson.phase);

  return (
    <div className="fade-up" style={{ maxWidth: 760, margin: "0 auto", paddingTop: 24, minWidth: 0 }}>
      <button className="btn" onClick={onBack}
        style={{ padding: "7px 12px", borderRadius: 10, background: t.btnGhost, color: t.textMuted, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi, marginBottom: 16 }}>
        ← Curso
      </button>

      <div className="mono" style={{ fontSize: 11, color: t.textFaint, letterSpacing: 1, textTransform: "uppercase" }}>
        {lesson.id} · Fase {lesson.phase} · {phase?.title}
      </div>
      <h1 className="resp-screen-title" style={{ margin: "6px 0 2px", fontWeight: 800, letterSpacing: -1, color: t.text, fontFamily: t.fontUi }}>
        {lesson.title}
      </h1>
      <div className="jp" style={{ fontSize: 22, color: t.accent, marginBottom: 14 }}>{lesson.jp}</div>

      {r?.passed
        ? <window.Pill t={t} tone="success" style={{ marginBottom: 16 }}>Aprobada ✓ · mejor {r.best}%</window.Pill>
        : r?.best ? <window.Pill t={t} tone="warn" style={{ marginBottom: 16 }}>Mejor intento {r.best}% · necesitas {pass}%</window.Pill> : null}

      <div className="surface-raised" style={{ padding: "18px 18px", marginBottom: 14 }}>
        {lesson.intro.map((para, k) => (
          <p key={k} style={{ margin: k ? "12px 0 0" : 0, fontSize: 15, lineHeight: 1.6, color: t.textPrimary }}>{para}</p>
        ))}
      </div>

      {lesson.tip && (
        <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 18,
          background: `${t.accent}10`, border: `1px solid ${t.accent}33`, fontSize: 14, color: t.text, lineHeight: 1.5 }}>
          💡 <b>Consejo:</b> {lesson.tip}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
        <window.PrimaryButton t={t} style={{ padding: "13px 22px" }}
          onClick={() => startCourseDeck(window.shuffle(lesson.cards), "flashcard", { kind: "learn", lesson: lesson.id })}>
          1 · Tarjetas
        </window.PrimaryButton>
        <window.SecondaryButton t={t}
          onClick={() => startCourseDeck(window.shuffle(lesson.cards), "quiz", { kind: "quiz", lesson: lesson.id })}>
          2 · Examen
        </window.SecondaryButton>
      </div>

      <div className="mono" style={{ fontSize: 11, color: t.textFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
        {lesson.cards.length} tarjetas
      </div>
      <div className="surface" style={{ marginBottom: 22, overflow: "hidden" }}>
        {lesson.cards.map((c, k) => (
          <div key={c.front} style={{
            display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", minWidth: 0,
            borderTop: k ? `1px solid ${t.surfaceBorder}` : "none",
          }}>
            <PlayBtn t={t} onClick={() => speakForce(c.front)} />
            {c.kind !== "sentence" && (
              <div className="jp" style={{
                fontSize: 22, color: t.text, flexShrink: 0, maxWidth: "45%",
                overflowWrap: "anywhere", minWidth: c.kind === "kana" ? 44 : 0,
              }}>{c.front}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {c.kind === "sentence" && <div className="jp" style={{ fontSize: 17, color: t.text, overflowWrap: "anywhere" }}>{c.front}</div>}
              <div style={{ fontSize: 14, color: c.kind === "sentence" ? t.textMuted : t.text }}>
                {c.kind === "kana" ? <span className="mono">{c.romanji}</span> : c.back}
              </div>
              {c.kind !== "kana" && <div className="mono" style={{ fontSize: 12, color: t.textFaint }}>{c.romanji}</div>}
              {c.note && <div className="jp" style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{c.note}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        {prev ? <SmallBtn t={t} onClick={() => openLesson(prev.id)}>← {prev.id}</SmallBtn> : <span />}
        {nextL && <SmallBtn t={t} onClick={() => openLesson(nextL.id)}>{nextL.id} →</SmallBtn>}
      </div>
    </div>
  );
}

Object.assign(window, { CourseScreen, courseRecord });
