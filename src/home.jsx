// ═══════════════════════════════════════════════════════════════════════
//  Home / Config screen
// ═══════════════════════════════════════════════════════════════════════
const { useMemo: useMemoHome } = React;

function HomeScreen(p) {
  const { t, stats, progress, mode, setMode, categories, toggleCat, sessionGoal, setSessionGoal,
          dueOnly, setDueOnly, startStudy, startWeakReview, startMistakeDrill, setScreen, density,
          levelFocus, setLevelFocus, setProgress } = p;

  const todayKey = window.todayKey();
  const todayCards = progress.dayLog?.[todayKey]?.cards || 0;
  const dailyGoal = progress.dailyGoal || 20;

  const modes = [
    { id: "flashcard", label: "Flashcards", hint: "Flip & self-rate (SRS)", glyph: "⎙" },
    { id: "quiz",      label: "Quiz",       hint: "Multiple choice",       glyph: "✕" },
    { id: "write",     label: "Write",      hint: "Type the reading",      glyph: "✎" },
    { id: "listen",    label: "Listen",     hint: "Audio → meaning",       glyph: "♪" },
    { id: "build",     label: "Build",      hint: "Arrange sentences",     glyph: "⊞" },
    ...(window.EXTRA_MODES_META || []),
  ];

  const goals = [
    { kind: "cards", value: 10, label: "10 cards" },
    { kind: "cards", value: 20, label: "20 cards" },
    { kind: "cards", value: 40, label: "40 cards" },
    { kind: "due",   value: 0,  label: "Due only" },
  ];

  const fixedPoolFor = (m) =>
    m === "build" || m === "cloze" ? window.CARD_DATA.sentences :
    m === "conjugate"               ? (window.CARD_DATA.verbs || []) :
    null;

  const applyLevel = (arr) => (window.filterByLevel ? window.filterByLevel(arr, levelFocus) : arr);

  const totalInSelection = useMemoHome(() => {
    const fixed = fixedPoolFor(mode);
    if (fixed) return applyLevel(fixed).length;
    return categories.reduce((sum, c) => sum + applyLevel(window.CARD_DATA[c] || []).length, 0);
  }, [categories, mode, levelFocus]);

  const dueInSelection = useMemoHome(() => {
    const fixed = fixedPoolFor(mode);
    const isDueCard = (card) => window.isDue(progress.cardStats[window.cardKey(card)]);
    if (fixed) return applyLevel(fixed).filter(isDueCard).length;
    return categories.reduce((sum, c) =>
      sum + applyLevel(window.CARD_DATA[c] || []).filter(isDueCard).length, 0);
  }, [categories, mode, progress, levelFocus]);

  const user = window.getUser ? window.getUser() : null;
  const goalHit = todayCards >= dailyGoal;
  const activeMode = modes.find(m => m.id === mode);
  const deckSize = sessionGoal.kind === "cards" ? Math.min(sessionGoal.value, totalInSelection) : dueInSelection;
  const stat = (label, jp, value, sub, color) => (
    <div className="stat-row">
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: t.fontUi }}>
          {label} <span style={{ fontFamily: t.fontJp, color: t.textFaint, fontWeight: 500, marginLeft: 4 }}>{jp}</span>
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ fontFamily: t.fontUi, fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color }}>{value}</div>
    </div>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 1080, margin: "0 auto", paddingTop: 32 }}>

      <window.MistakeBanner t={t} progress={progress} onDrill={startMistakeDrill} />

      {/* Page heading */}
      <header style={{ marginBottom: 24 }}>
        <window.Eyebrow t={t} accent>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</window.Eyebrow>
        <h1 className="resp-hero-title" style={{
          margin: "8px 0 4px", fontFamily: t.fontJp, fontWeight: 700,
          letterSpacing: -0.5, color: t.text, lineHeight: 1.1,
        }}>
          今日の学習
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: t.textMuted }}>
          {user ? <>Welcome back, <b style={{ color: t.text }}>{user}</b>. </> : null}
          {stats.dueCount > 0
            ? <><b style={{ color: t.accent }}>{stats.dueCount}</b> cards are due for review.</>
            : "Nothing due right now. A few new cards keeps the streak alive."}
        </p>
      </header>

      {/* Today + stats */}
      <section className="resp-grid-12" style={{ marginBottom: 24 }}>
        <div className="surface-raised" style={{ padding: "26px 28px", position: "relative", overflow: "hidden",
          display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          {window.DailyGoalRing && <window.DailyGoalRing t={t} today={todayCards} goal={dailyGoal} size={112} />}
          <div style={{ flex: 1, minWidth: 200, position: "relative", zIndex: 1 }}>
            <window.Eyebrow t={t}>Daily goal · 目標</window.Eyebrow>
            <div style={{ margin: "6px 0 16px", fontSize: 20, fontWeight: 700, fontFamily: t.fontUi, color: goalHit ? t.success : t.text, letterSpacing: -0.3 }}>
              {goalHit ? "Goal reached. お疲れさま！" : `${dailyGoal - todayCards} cards to go today`}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <window.PrimaryButton t={t} onClick={startStudy}>Start session →</window.PrimaryButton>
              {stats.dueCount > 0 && (
                <window.SecondaryButton t={t} onClick={() => { setDueOnly(true); setSessionGoal({ kind: "due", value: 0 }); startStudy(); }}>
                  Review {stats.dueCount} due
                </window.SecondaryButton>
              )}
              {stats.weakCount > 0 && (
                <window.SecondaryButton t={t} onClick={startWeakReview}>
                  Weak spots ({stats.weakCount})
                </window.SecondaryButton>
              )}
            </div>
          </div>
          <div aria-hidden className="resp-hero-kanji" style={{
            position: "absolute", fontFamily: t.fontJp, fontWeight: 700,
            color: `${t.accent}0F`, lineHeight: 1, pointerEvents: "none",
          }}>学</div>
        </div>

        <div className="surface-raised" style={{ padding: "22px 24px" }}>
          {stat("Streak", "連続", progress.streakDays || 0, "days in a row", t.warn)}
          {stat("Accuracy", "正答", `${stats.acc}%`, `${progress.totalAnswered} answers`, t.accent)}
          {stat("Mastered", "習得", stats.mastered, `of ${stats.total} cards`, t.success)}
          {stat("Due", "復習", stats.dueCount, "ready to review", t.text)}
        </div>
      </section>

      {/* Session builder */}
      <section className="surface-raised" style={{ padding: "8px 28px 22px" }} aria-labelledby="builder-title">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "18px 0 4px", flexWrap: "wrap" }}>
          <h2 id="builder-title" style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: t.fontUi, letterSpacing: -0.4, color: t.text }}>
            Build a session <span style={{ fontFamily: t.fontJp, fontWeight: 500, color: t.textFaint, fontSize: 16, marginLeft: 6 }}>練習</span>
          </h2>
          <span className="mono" style={{ fontSize: 12, color: t.textMuted }}>
            {totalInSelection} cards · {dueInSelection} due
          </span>
        </div>

        <div className="builder-row">
          <div className="builder-label">Mode<small>方法</small></div>
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {modes.map(m => (
                <button key={m.id} className={"btn chip" + (mode === m.id ? " on" : "")}
                  aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
                  <span className="chip-glyph" aria-hidden="true">{m.glyph}</span>{m.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 8 }}>{activeMode?.hint}</div>
          </div>
        </div>

        <div className="builder-row">
          <div className="builder-label">{mode === "build" ? "Sentences" : "Content"}<small>内容</small></div>
          <div>
            {setLevelFocus && (
              <div className="seg" role="group" aria-label="JLPT level" style={{ marginBottom: 10 }}>
                {[{ id: "all", label: "All levels" }, { id: 5, label: "N5" }, { id: 4, label: "N4" }].map(o => (
                  <button key={String(o.id)} className="btn" aria-pressed={levelFocus === o.id} onClick={() => setLevelFocus(o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            {fixedPoolFor(mode) ? (
              <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
                {mode === "build" && <>Build mode drills the <b style={{ color: t.text }}>sentence bank</b>: arrange words and particles in order.</>}
                {mode === "cloze" && <>Cloze drills the <b style={{ color: t.text }}>sentence bank</b>: fill the blank with the right particle, ending, or word.</>}
                {mode === "conjugate" && <>Conjugate drills the <b style={{ color: t.text }}>verb bank</b>: type the ます form of each verb.</>}
                {" "}Categories don't apply here.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {window.CATEGORY_META.map(c => {
                  const on = categories.includes(c.id);
                  const dueN = window.CARD_DATA[c.id].filter(card => window.isDue(progress.cardStats[window.cardKey(card)])).length;
                  return (
                    <button key={c.id} className={"btn chip" + (on ? " on" : "")} aria-pressed={on} onClick={() => toggleCat(c.id)}>
                      <span className="chip-glyph" aria-hidden="true">{c.icon}</span>
                      {c.label}
                      <span className="chip-meta">{window.CARD_DATA[c.id].length}{dueN > 0 ? ` · ${dueN} due` : ""}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="builder-row">
          <div className="builder-label">Length<small>長さ</small></div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div className="seg" role="group" aria-label="Session length">
              {goals.map(g => (
                <button key={g.label} className="btn" aria-pressed={sessionGoal.kind === g.kind && sessionGoal.value === g.value}
                  onClick={() => setSessionGoal(g)}>{g.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 12, color: t.textMuted }}>
                {deckSize} cards · ~{Math.max(1, Math.round(deckSize * 0.25))} min
              </span>
              <window.PrimaryButton t={t} onClick={startStudy} disabled={deckSize === 0} style={{ padding: "11px 22px" }}>
                Start {activeMode?.label?.toLowerCase()} →
              </window.PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* Recent sessions */}
      {progress.history?.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <window.Eyebrow t={t}>Recent sessions · 履歴</window.Eyebrow>
          <div className="surface" style={{ marginTop: 10, padding: "4px 20px" }}>
            {progress.history.slice().reverse().slice(0, 4).map((hst, i) => (
              <div key={i} className="stat-row" style={{ alignItems: "center", padding: "12px 0" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: t.fontUi, textTransform: "capitalize" }}>{hst.mode}</div>
                  <div className="mono" style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                    {hst.date} · {hst.cards} cards · {Math.max(1, Math.round(hst.duration / 60))} min
                  </div>
                </div>
                <window.Pill t={t} tone={hst.score >= 80 ? "success" : hst.score >= 60 ? "warn" : "danger"} size="sm">{hst.score}%</window.Pill>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

window.HomeScreen = HomeScreen;
