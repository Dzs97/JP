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

  return (
    <div className="fade-up" style={{ maxWidth: 1080, margin: "0 auto", paddingTop: 32 }}>

      {/* Mistake queue banner */}
      <window.MistakeBanner t={t} progress={progress} onDrill={startMistakeDrill} />

      {/* Hero row: greeting + quick stats */}
      <section className="resp-grid-12" style={{ marginBottom: 32 }}>
        <div className="surface-raised" style={{ padding: "28px 32px", position: "relative", overflow: "hidden" }}>
          <window.Eyebrow t={t} accent>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</window.Eyebrow>
          <h1 className="resp-hero-title" style={{
            margin: "10px 0 6px",
            fontFamily: t.fontUi, fontWeight: 800,
            letterSpacing: -1.2, color: t.text, lineHeight: 1.05,
          }}>
            今日の学習 <span style={{ color: t.textFaint, fontWeight: 400, fontFamily: t.fontUi }}>/ Today's study</span>
          </h1>
          <p style={{ fontSize: 14, color: t.textMuted, margin: 0, maxWidth: 420 }}>
            {stats.dueCount > 0
              ? <>You have <b style={{ color: t.accent }}>{stats.dueCount}</b> cards due for review. Spaced repetition keeps recall strong.</>
              : "No reviews due right now. A short new-card session keeps momentum."}
          </p>

          {/* Daily goal ring */}
          {window.DailyGoalRing && (
            <div style={{ position: "absolute", top: 24, right: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: t.textFaint }}>
                  today
                </div>
                <div style={{ fontSize: 11, color: todayCards >= dailyGoal ? t.success : t.textMuted, fontFamily: t.fontUi, fontWeight: 600 }}>
                  {todayCards >= dailyGoal ? "goal hit ✓" : `${dailyGoal - todayCards} to go`}
                </div>
              </div>
              <window.DailyGoalRing t={t} today={todayCards} goal={dailyGoal} />
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <window.PrimaryButton t={t} onClick={startStudy}>
              Start session →
            </window.PrimaryButton>
            {stats.dueCount > 0 && (
              <window.SecondaryButton t={t} onClick={() => { setDueOnly(true); setSessionGoal({ kind: "due", value: 0 }); startStudy(); }}>
                Review {stats.dueCount} due
              </window.SecondaryButton>
            )}
            {stats.weakCount > 0 && (
              <window.SecondaryButton t={t} onClick={startWeakReview}>
                Weak-spot drill ({stats.weakCount})
              </window.SecondaryButton>
            )}
          </div>

          {/* decorative kanji */}
          <div aria-hidden className="resp-hero-kanji" style={{
            position: "absolute",
            fontFamily: t.fontJp, fontWeight: 900,
            color: `${t.accent}0D`, letterSpacing: -10, lineHeight: 1, pointerEvents: "none",
          }}>学</div>
        </div>

        <div className="resp-stats-22">
          <window.StatTile t={t} label="Streak" value={progress.streakDays || 0} sub="consecutive days" tone="warn" />
          <window.StatTile t={t} label="Accuracy" value={`${stats.acc}%`} sub={`${progress.totalAnswered} answers`} />
          <window.StatTile t={t} label="Mastered" value={stats.mastered} sub={`of ${stats.total} cards`} tone="success" />
          <window.StatTile t={t} label="Due" value={stats.dueCount} sub="ready to review" />
        </div>
      </section>

      {/* Mode picker */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <window.Eyebrow t={t}>01 · Mode</window.Eyebrow>
            <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, fontFamily: t.fontUi, letterSpacing: -0.4, color: t.text }}>
              How do you want to practice?
            </h2>
          </div>
          <span style={{ fontSize: 12, color: t.textFaint, fontFamily: t.fontMono }}>
            {modes.find(m => m.id === mode)?.hint}
          </span>
        </div>
        <div className="resp-modes-5">
          {modes.map(m => {
            const active = mode === m.id;
            return (
              <button key={m.id} className="btn" onClick={() => setMode(m.id)}
                style={{
                  padding: "18px 14px",
                  background: active ? t.surfaceBg : t.surfaceSunken,
                  border: `1px solid ${active ? t.accent : t.surfaceBorder}`,
                  borderRadius: 16,
                  textAlign: "left",
                  boxShadow: active ? `0 0 0 3px ${t.accent}14, ${t.shadowCard}` : "none",
                  position: "relative",
                }}>
                <div style={{
                  fontFamily: t.fontJp, fontSize: 22, color: active ? t.accent : t.textMuted, marginBottom: 10,
                  fontWeight: 500,
                }}>
                  {m.glyph}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: t.fontUi }}>{m.label}</div>
                <div style={{ fontSize: 11, color: t.textFaint, marginTop: 2 }}>{m.hint}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Categories + session length in 2-col */}
      <section className="resp-grid-21">

        {/* Categories */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <window.Eyebrow t={t}>02 · Content</window.Eyebrow>
              <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, fontFamily: t.fontUi, letterSpacing: -0.4, color: t.text }}>
                {mode === "build" ? "Sentence bank" : "Categories"}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {setLevelFocus && (
                <div style={{ display: "flex", gap: 2, background: t.surfaceSunken, padding: 3, borderRadius: 8 }}>
                  {[{ id: "all", label: "All" }, { id: 5, label: "N5" }, { id: 4, label: "N4" }].map(o => {
                    const on = levelFocus === o.id;
                    return (
                      <button key={String(o.id)} className="btn" onClick={() => setLevelFocus(o.id)}
                        style={{
                          padding: "4px 10px", borderRadius: 6,
                          background: on ? t.surfaceBg : "transparent",
                          color: on ? t.text : t.textMuted,
                          fontSize: 11, fontWeight: 600, fontFamily: t.fontUi,
                          boxShadow: on ? t.shadowCard : "none",
                        }}>{o.label}</button>
                    );
                  })}
                </div>
              )}
              <span style={{ fontSize: 12, color: t.textFaint, fontFamily: t.fontMono }}>
                {totalInSelection} cards · {dueInSelection} due
              </span>
            </div>
          </div>

          {fixedPoolFor(mode) ? (
            <div className="surface" style={{ padding: 18, fontSize: 13, color: t.textMuted }}>
              {mode === "build" && <>Build mode drills the <b style={{ color: t.text }}>sentence bank</b> — arrange tokens (words + particles) in order.</>}
              {mode === "cloze" && <>Cloze drills the <b style={{ color: t.text }}>sentence bank</b> — fill the blank with the right particle, ending, or word.</>}
              {mode === "conjugate" && <>Conjugate drills the <b style={{ color: t.text }}>verb bank</b> — type the ます form of each dictionary-form verb.</>}
              <div style={{ marginTop: 6, fontSize: 12, color: t.textFaint }}>Categories don't apply here.</div>
            </div>
          ) : (
            <div className="resp-cats-2">
              {window.CATEGORY_META.map(c => {
                const on = categories.includes(c.id);
                const dueN = window.CARD_DATA[c.id].filter(card => window.isDue(progress.cardStats[window.cardKey(card)])).length;
                return (
                  <button key={c.id} className="btn" onClick={() => toggleCat(c.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px",
                      background: on ? t.surfaceBg : t.surfaceSunken,
                      border: `1px solid ${on ? t.accent : t.surfaceBorder}`,
                      borderRadius: 12, textAlign: "left",
                      boxShadow: on ? `0 0 0 2px ${t.accent}14` : "none",
                    }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: on ? t.accent : t.btnGhost,
                      color: on ? t.onAccent : t.textMuted,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: t.fontJp, fontSize: 17, fontWeight: 700,
                    }}>
                      {c.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.text, fontFamily: t.fontUi }}>{c.label}</div>
                      <div className="mono" style={{ fontSize: 10, color: t.textFaint, marginTop: 1 }}>
                        {c.count} cards {dueN > 0 && <span style={{ color: t.accent }}>· {dueN} due</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Session length */}
        <div>
          <window.Eyebrow t={t}>03 · Session</window.Eyebrow>
          <h2 style={{ margin: "4px 0 14px", fontSize: 20, fontWeight: 700, fontFamily: t.fontUi, letterSpacing: -0.4, color: t.text }}>
            Length
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }} className="resp-cats-2">
            {goals.map(g => {
              const active = sessionGoal.kind === g.kind && sessionGoal.value === g.value;
              return (
                <button key={g.label} className="btn" onClick={() => setSessionGoal(g)}
                  style={{
                    padding: "14px 12px",
                    background: active ? t.accent : t.surfaceSunken,
                    color: active ? t.onAccent : t.text,
                    border: `1px solid ${active ? t.accent : t.surfaceBorder}`,
                    borderRadius: 12,
                    fontSize: 14, fontWeight: 700, fontFamily: t.fontUi,
                  }}>
                  {g.label}
                </button>
              );
            })}
          </div>

          <div className="surface" style={{ padding: 14, fontSize: 12, color: t.textMuted }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>Mode</span>
              <b style={{ color: t.text, fontFamily: t.fontUi }}>{modes.find(m => m.id === mode)?.label}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>Deck size</span>
              <b className="mono" style={{ color: t.text }}>
                {sessionGoal.kind === "cards" ? Math.min(sessionGoal.value, totalInSelection) : dueInSelection}
              </b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Est. time</span>
              <b className="mono" style={{ color: t.text }}>
                ~{Math.max(1, Math.round((sessionGoal.kind === "cards" ? Math.min(sessionGoal.value, totalInSelection) : dueInSelection) * 0.25))} min
              </b>
            </div>
          </div>
        </div>
      </section>

      {/* Recent sessions */}
      {progress.history?.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <window.Eyebrow t={t}>Recent sessions</window.Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginTop: 10 }}>
            {progress.history.slice().reverse().slice(0, 4).map((h, i) => (
              <div key={i} className="surface" style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: t.textMuted, fontFamily: t.fontUi, textTransform: "capitalize" }}>{h.mode}</span>
                  <window.Pill t={t} tone={h.score >= 80 ? "success" : h.score >= 60 ? "warn" : "danger"} size="sm">{h.score}%</window.Pill>
                </div>
                <div style={{ fontSize: 11, color: t.textFaint, fontFamily: t.fontMono }}>
                  {h.date} · {h.cards}c · {Math.round(h.duration / 60)}m
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

window.HomeScreen = HomeScreen;
