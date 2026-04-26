(function(){
// ═══════════════════════════════════════════════════════════════════════
//  Progress + Kana + Grammar screens + Tweaks panel
// ═══════════════════════════════════════════════════════════════════════
const {
  useMemo: useMemoP,
  useEffect: useEffectP
} = React;

// ── Progress screen ─────────────────────────────────────────────────────
function ProgressScreen(p) {
  const {
    t,
    progress,
    stats
  } = p;

  // Build 12-week heatmap (84 days)
  const heatmap = useMemoP(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today.getTime() - i * window.DAY_MS);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const log = progress.dayLog?.[key];
      days.push({
        key,
        date: d,
        count: log?.cards || 0,
        correct: log?.correct || 0
      });
    }
    return days;
  }, [progress]);
  const maxDay = Math.max(1, ...heatmap.map(d => d.count));
  const heatLevel = n => {
    if (n === 0) return 0;
    const r = n / maxDay;
    if (r > 0.75) return 4;
    if (r > 0.5) return 3;
    if (r > 0.25) return 2;
    return 1;
  };

  // Category mastery
  const catMastery = window.CATEGORY_META.map(c => {
    const cards = window.CARD_DATA[c.id];
    const seen = cards.filter(card => progress.cardStats[window.cardKey(card)]).length;
    const mastered = cards.filter(card => {
      const s = progress.cardStats[window.cardKey(card)];
      return s && s.attempts >= 2 && s.correct / s.attempts >= 0.8;
    }).length;
    return {
      ...c,
      seen,
      mastered,
      total: cards.length
    };
  });

  // Weak cards
  const weakCards = window.ALL_CARDS.map(c => ({
    c,
    s: progress.cardStats[window.cardKey(c)]
  })).filter(({
    s
  }) => s && s.attempts >= 2 && s.correct / s.attempts < 0.7).sort((a, b) => a.s.correct / a.s.attempts - b.s.correct / b.s.attempts).slice(0, 8);
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-up",
    style: {
      maxWidth: 1080,
      margin: "0 auto",
      paddingTop: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t,
    accent: true
  }, "Progress \xB7 \u9032\u6357"), /*#__PURE__*/React.createElement("h1", {
    className: "resp-screen-title",
    style: {
      fontWeight: 800,
      letterSpacing: -1.2,
      color: t.text,
      margin: "6px 0 6px",
      fontFamily: t.fontUi
    }
  }, "Study analytics"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: t.textMuted,
      fontSize: 14,
      margin: 0
    }
  }, progress.sessions, " sessions \xB7 ", progress.totalAnswered, " answers \xB7 ", stats.acc, "% accuracy")), /*#__PURE__*/React.createElement("div", {
    className: "resp-stats-4",
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(window.StatTile, {
    t: t,
    label: "Streak",
    value: `${progress.streakDays || 0} days`,
    sub: "longest active",
    tone: "warn"
  }), /*#__PURE__*/React.createElement(window.StatTile, {
    t: t,
    label: "Accuracy",
    value: `${stats.acc}%`,
    sub: `${progress.totalCorrect} / ${progress.totalAnswered}`
  }), /*#__PURE__*/React.createElement(window.StatTile, {
    t: t,
    label: "Mastered",
    value: `${stats.mastered}`,
    sub: `of ${stats.total} (${Math.round(stats.mastered / stats.total * 100)}%)`,
    tone: "success"
  }), /*#__PURE__*/React.createElement(window.StatTile, {
    t: t,
    label: "Sessions",
    value: progress.sessions,
    sub: "all-time"
  })), /*#__PURE__*/React.createElement(window.ForecastStrip, {
    t: t,
    progress: progress
  }), /*#__PURE__*/React.createElement("div", {
    className: "surface-raised",
    style: {
      padding: "20px 22px",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t
  }, "Activity \xB7 last 12 weeks"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: t.text,
      marginTop: 4,
      fontFamily: t.fontUi,
      fontWeight: 600
    }
  }, heatmap.reduce((s, d) => s + d.count, 0), " cards studied")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 10,
      color: t.textFaint,
      fontFamily: t.fontMono
    }
  }, "less", t.heatmap.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 11,
      height: 11,
      borderRadius: 3,
      background: c
    }
  })), "more")), /*#__PURE__*/React.createElement("div", {
    className: "resp-heat-12"
  }, Array.from({
    length: 12
  }).map((_, weekI) => /*#__PURE__*/React.createElement("div", {
    key: weekI,
    style: {
      display: "grid",
      gridTemplateRows: "repeat(7, 1fr)",
      gap: 3
    }
  }, Array.from({
    length: 7
  }).map((_, dayI) => {
    const idx = weekI * 7 + dayI;
    const d = heatmap[idx];
    if (!d) return /*#__PURE__*/React.createElement("div", {
      key: dayI
    });
    const lvl = heatLevel(d.count);
    return /*#__PURE__*/React.createElement("div", {
      key: dayI,
      className: "heat-cell",
      title: `${d.key} · ${d.count} cards${d.count > 0 ? ` · ${Math.round(d.correct / d.count * 100)}%` : ""}`,
      style: {
        aspectRatio: "1",
        background: t.heatmap[lvl]
      }
    });
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "resp-grid-11",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "surface-raised",
    style: {
      padding: "20px 22px"
    }
  }, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t
  }, "Category mastery"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, catMastery.map(c => {
    const pct = Math.round(c.mastered / c.total * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: c.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "jp",
      style: {
        color: t.accent,
        fontSize: 14,
        width: 16
      }
    }, c.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: t.text,
        fontFamily: t.fontUi,
        fontWeight: 600
      }
    }, c.label)), /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        color: t.textMuted
      }
    }, c.mastered, "/", c.total)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 5,
        background: t.progressTrack,
        borderRadius: 3,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        width: `${pct}%`,
        background: pct >= 75 ? t.success : pct >= 30 ? t.accent : `${t.accent}99`,
        transition: "width 0.6s cubic-bezier(.2,.7,.2,1)"
      }
    })));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "surface-raised",
    style: {
      padding: "20px 22px"
    }
  }, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t
  }, "Weak spots"), weakCards.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      padding: "24px 0",
      textAlign: "center",
      fontSize: 13,
      color: t.textFaint,
      fontStyle: "italic"
    }
  }, "No weak cards yet. Study a few sessions to identify them.") : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, weakCards.map(({
    c,
    s
  }, i) => {
    const accCard = Math.round(s.correct / s.attempts * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        background: t.surfaceSunken,
        borderRadius: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "jp",
      style: {
        fontSize: 22,
        color: t.text,
        fontWeight: 500,
        minWidth: 52
      }
    }, c.front), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: t.textMuted,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, c.back), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 10,
        color: t.textFaint
      }
    }, c.romanji, " \xB7 ", s.attempts, " tries")), /*#__PURE__*/React.createElement(window.Pill, {
      t: t,
      tone: "danger",
      size: "sm"
    }, accCard, "%"));
  })))), progress.history?.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "surface-raised",
    style: {
      padding: "20px 22px",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t
  }, "Recent sessions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
      gap: 10
    }
  }, progress.history.slice().reverse().slice(0, 8).map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: "10px 12px",
      background: t.surfaceSunken,
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: t.textMuted,
      textTransform: "capitalize",
      fontFamily: t.fontUi,
      fontWeight: 600
    }
  }, h.mode), /*#__PURE__*/React.createElement(window.Pill, {
    t: t,
    tone: h.score >= 80 ? "success" : h.score >= 60 ? "warn" : "danger",
    size: "sm"
  }, h.score, "%")), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: t.textFaint,
      marginTop: 4
    }
  }, h.date, " \xB7 ", h.cards, "c \xB7 ", Math.round(h.duration / 60), "m"))))), /*#__PURE__*/React.createElement(window.DataPanel, {
    t: t,
    progress: progress,
    setProgress: p.setProgress
  }));
}

// ── Kana reference + quiz ──────────────────────────────────────────────
function KanaScreen(p) {
  const {
    t,
    kanaSection,
    setKanaSection,
    speakForce,
    kanaQuizPool,
    setKanaQuizPool,
    kanaQuizIdx,
    setKanaQuizIdx,
    kanaQuizSelected,
    setKanaQuizSelected,
    kanaQuizScore,
    setKanaQuizScore,
    kanaQuizDone,
    setKanaQuizDone
  } = p;
  const sections = [{
    id: "hiragana",
    label: "Hiragana",
    jp: "ひらがな",
    rows: window.HIRAGANA_ROWS
  }, {
    id: "katakana",
    label: "Katakana",
    jp: "カタカナ",
    rows: window.KATAKANA_ROWS
  }, {
    id: "quiz",
    label: "Quiz",
    jp: "テスト",
    rows: null
  }];
  const active = sections.find(s => s.id === kanaSection) || sections[0];
  const startKanaQuiz = which => {
    const pool = which === "hiragana" ? window.HIRAGANA_QUIZ_POOL : which === "katakana" ? window.KATAKANA_QUIZ_POOL : [...window.HIRAGANA_QUIZ_POOL, ...window.KATAKANA_QUIZ_POOL];
    setKanaQuizPool(window.shuffle(pool).slice(0, 20));
    setKanaQuizIdx(0);
    setKanaQuizSelected(null);
    setKanaQuizScore({
      correct: 0,
      incorrect: 0
    });
    setKanaQuizDone(false);
    setKanaSection("quiz");
  };
  const curQuiz = kanaQuizPool[kanaQuizIdx];
  const quizOpts = useMemoP(() => {
    if (!curQuiz) return [];
    const allPool = [...window.HIRAGANA_QUIZ_POOL, ...window.KATAKANA_QUIZ_POOL];
    const wrongs = window.shuffle(allPool.filter(x => x.romanji !== curQuiz.romanji)).slice(0, 3).map(x => x.romanji);
    return window.shuffle([curQuiz.romanji, ...wrongs]);
  }, [curQuiz]);
  const pickKana = opt => {
    if (kanaQuizSelected !== null) return;
    setKanaQuizSelected(opt);
    const right = opt === curQuiz.romanji;
    setKanaQuizScore({
      correct: kanaQuizScore.correct + (right ? 1 : 0),
      incorrect: kanaQuizScore.incorrect + (right ? 0 : 1)
    });
    setTimeout(() => {
      if (kanaQuizIdx + 1 >= kanaQuizPool.length) setKanaQuizDone(true);else {
        setKanaQuizIdx(i => i + 1);
        setKanaQuizSelected(null);
      }
    }, 900);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-up",
    style: {
      maxWidth: 1080,
      margin: "0 auto",
      paddingTop: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t,
    accent: true
  }, "Kana reference"), /*#__PURE__*/React.createElement("h1", {
    className: "resp-screen-title",
    style: {
      fontWeight: 800,
      letterSpacing: -1.2,
      color: t.text,
      margin: "6px 0",
      fontFamily: t.fontUi
    }
  }, "\u304B\u306A \xB7 The Japanese scripts"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: t.textMuted,
      fontSize: 14,
      margin: 0
    }
  }, "Hiragana (native) and Katakana (foreign words) share 46 base sounds plus voiced marks. Tap any cell to hear it.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 22,
      background: t.surfaceSunken,
      padding: 4,
      borderRadius: 12,
      width: "fit-content",
      maxWidth: "100%",
      overflowX: "auto"
    }
  }, sections.map(s => {
    const on = kanaSection === s.id;
    return /*#__PURE__*/React.createElement("button", {
      key: s.id,
      className: "btn",
      onClick: () => setKanaSection(s.id),
      style: {
        padding: "8px 18px",
        borderRadius: 8,
        background: on ? t.surfaceBg : "transparent",
        color: on ? t.text : t.textMuted,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: t.fontUi,
        boxShadow: on ? t.shadowCard : "none",
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, s.label, /*#__PURE__*/React.createElement("span", {
      className: "jp",
      style: {
        fontSize: 13,
        color: on ? t.accent : t.textFaint,
        fontWeight: 500
      }
    }, s.jp));
  })), (kanaSection === "hiragana" || kanaSection === "katakana") && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "surface-raised",
    style: {
      padding: "20px 22px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "resp-kana-table"
  }, /*#__PURE__*/React.createElement("div", null), ["a", "i", "u", "e", "o"].map(v => /*#__PURE__*/React.createElement("div", {
    key: v,
    className: "mono",
    style: {
      fontSize: 11,
      color: t.textFaint,
      textAlign: "center",
      paddingBottom: 6,
      letterSpacing: 1,
      textTransform: "uppercase"
    }
  }, v)), active.rows.map((row, ri) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: ri
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: t.textFaint,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      letterSpacing: 1
    }
  }, row.consonant), row.chars.map((ch, ci) => ch ? /*#__PURE__*/React.createElement("button", {
    key: ci,
    className: "btn kcell",
    onClick: () => speakForce(ch)
  }, /*#__PURE__*/React.createElement("div", {
    className: "jp",
    style: {
      fontSize: 28,
      color: t.text,
      fontWeight: 500,
      lineHeight: 1.2
    }
  }, ch), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: t.textFaint,
      marginTop: 1,
      letterSpacing: 0.5
    }
  }, row.sounds[ci])) : /*#__PURE__*/React.createElement("div", {
    key: ci
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(window.PrimaryButton, {
    t: t,
    onClick: () => startKanaQuiz(kanaSection)
  }, "Quiz this set \u2192"), /*#__PURE__*/React.createElement(window.SecondaryButton, {
    t: t,
    onClick: () => startKanaQuiz("both")
  }, "Quiz both scripts"))), kanaSection === "quiz" && (kanaQuizPool.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "surface",
    style: {
      padding: 40,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: t.textMuted,
      marginBottom: 16
    }
  }, "Pick a script to drill:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(window.PrimaryButton, {
    t: t,
    onClick: () => startKanaQuiz("hiragana")
  }, "Hiragana"), /*#__PURE__*/React.createElement(window.SecondaryButton, {
    t: t,
    onClick: () => startKanaQuiz("katakana")
  }, "Katakana"), /*#__PURE__*/React.createElement(window.SecondaryButton, {
    t: t,
    onClick: () => startKanaQuiz("both")
  }, "Both"))) : kanaQuizDone ? /*#__PURE__*/React.createElement("div", {
    className: "fade-up surface-raised",
    style: {
      padding: 36,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "jp",
    style: {
      fontSize: 56,
      color: `${t.accent}40`,
      lineHeight: 1
    }
  }, "\u5B8C"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      color: t.text,
      margin: "12px 0 6px",
      fontFamily: t.fontUi,
      letterSpacing: -0.6
    }
  }, "Kana quiz complete"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48,
      fontWeight: 800,
      color: t.accent,
      letterSpacing: -1.5,
      fontFamily: t.fontUi,
      marginTop: 16
    }
  }, kanaQuizScore.correct, /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.textFaint,
      fontSize: 24
    }
  }, "/", kanaQuizPool.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "center",
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(window.PrimaryButton, {
    t: t,
    onClick: () => {
      setKanaQuizPool([]);
      setKanaQuizDone(false);
    }
  }, "Again"), /*#__PURE__*/React.createElement(window.SecondaryButton, {
    t: t,
    onClick: () => setKanaSection("hiragana")
  }, "Back to chart"))) : curQuiz && /*#__PURE__*/React.createElement("div", {
    className: "fade-up",
    style: {
      maxWidth: 560,
      margin: "0 auto"
    },
    key: kanaQuizIdx
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(window.Pill, {
    t: t,
    tone: "accent"
  }, kanaQuizIdx + 1, " / ", kanaQuizPool.length), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: t.textMuted
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.success
    }
  }, "\u2713 ", kanaQuizScore.correct), " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.danger
    }
  }, "\u2717 ", kanaQuizScore.incorrect))), /*#__PURE__*/React.createElement("div", {
    className: "surface-raised",
    style: {
      padding: "56px 28px",
      textAlign: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "jp",
    style: {
      fontSize: 140,
      color: t.text,
      fontWeight: 500,
      lineHeight: 1
    }
  }, curQuiz.char)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, quizOpts.map((opt, i) => {
    const isCorrect = kanaQuizSelected !== null && opt === curQuiz.romanji;
    const isWrong = kanaQuizSelected === opt && opt !== curQuiz.romanji;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      className: `opt-btn${isCorrect ? " correct" : ""}${isWrong ? " incorrect" : ""}`,
      onClick: () => pickKana(opt),
      disabled: kanaQuizSelected !== null,
      style: {
        fontFamily: t.fontMono,
        fontSize: 16,
        textAlign: "center"
      }
    }, opt);
  })))));
}

// ── Grammar reference ──────────────────────────────────────────────────
function GrammarScreen(p) {
  const {
    t,
    speakForce
  } = p;
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-up",
    style: {
      maxWidth: 1080,
      margin: "0 auto",
      paddingTop: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t,
    accent: true
  }, "Grammar"), /*#__PURE__*/React.createElement("h1", {
    className: "resp-screen-title",
    style: {
      fontWeight: 800,
      letterSpacing: -1.2,
      color: t.text,
      margin: "6px 0",
      fontFamily: t.fontUi
    }
  }, "Particles & endings"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: t.textMuted,
      fontSize: 14,
      margin: 0
    }
  }, "The connective tissue of Japanese sentences. Hover for pronunciation notes.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 10
    }
  }, window.CARD_DATA.grammar.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "surface-raised",
    style: {
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "jp",
    onClick: () => speakForce(g.front),
    style: {
      fontSize: 30,
      color: t.accent,
      fontWeight: 500,
      cursor: "pointer"
    }
  }, g.front), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: t.textFaint,
      letterSpacing: 0.5
    }
  }, g.romanji)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: t.text,
      fontWeight: 600,
      fontFamily: t.fontUi,
      marginBottom: 4
    }
  }, g.back), g.note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: t.textMuted,
      lineHeight: 1.45
    }
  }, g.note)))));
}

// ── Tweaks panel ───────────────────────────────────────────────────────
function TweaksPanel({
  t,
  darkMode,
  setDarkMode,
  accent,
  setAccent,
  fonts,
  setFonts,
  romanjiPosition,
  setRomanjiPosition,
  density,
  setDensity,
  showKeyboardHints,
  setShowKeyboardHints,
  onClose
}) {
  const Section = ({
    label,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      letterSpacing: 1.5,
      color: t.textFaint,
      textTransform: "uppercase",
      fontWeight: 600,
      marginBottom: 8
    }
  }, label), children);
  const ChipRow = ({
    value,
    setValue,
    options
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flexWrap: "wrap"
    }
  }, options.map(o => {
    const on = value === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      className: "btn",
      onClick: () => setValue(o.id),
      style: {
        padding: "6px 12px",
        borderRadius: 8,
        background: on ? t.accent : t.btnGhost,
        color: on ? t.onAccent : t.text,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: t.fontUi,
        border: `1px solid ${on ? t.accent : t.btnGhostBorder}`
      }
    }, o.label);
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 100,
      width: 300,
      padding: 18,
      background: t.surfaceBg,
      border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 16,
      boxShadow: t.shadowFloating,
      maxHeight: "80vh",
      overflowY: "auto"
    },
    className: "resp-tweaks-panel"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: t.text,
      fontFamily: t.fontUi,
      letterSpacing: -0.3
    }
  }, "Tweaks"), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      letterSpacing: 1.5,
      color: t.textFaint,
      textTransform: "uppercase"
    }
  }, "Live preview")), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClose,
    style: {
      width: 26,
      height: 26,
      borderRadius: 6,
      background: t.btnGhost,
      color: t.textMuted,
      fontSize: 14
    }
  }, "\xD7")), /*#__PURE__*/React.createElement(Section, {
    label: "Accent"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 6
    }
  }, Object.entries(window.ACCENT_PRESETS).map(([id, a]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: "btn",
    onClick: () => setAccent(id),
    title: a.name,
    style: {
      aspectRatio: "1",
      background: a.color,
      borderRadius: 10,
      border: accent === id ? `2px solid ${t.text}` : `2px solid transparent`,
      boxShadow: accent === id ? `0 0 0 2px ${t.surfaceBg} inset, 0 0 0 3px ${a.color}` : "none"
    }
  })))), /*#__PURE__*/React.createElement(Section, {
    label: "Typeface"
  }, /*#__PURE__*/React.createElement(ChipRow, {
    value: fonts,
    setValue: setFonts,
    options: [{
      id: "sans",
      label: "Sans"
    }, {
      id: "serif",
      label: "Serif"
    }, {
      id: "brush",
      label: "Brush"
    }]
  })), /*#__PURE__*/React.createElement(Section, {
    label: "Romaji position"
  }, /*#__PURE__*/React.createElement(ChipRow, {
    value: romanjiPosition,
    setValue: setRomanjiPosition,
    options: [{
      id: "below",
      label: "Below"
    }, {
      id: "inline",
      label: "Inline"
    }, {
      id: "hidden",
      label: "Hidden"
    }]
  })), /*#__PURE__*/React.createElement(Section, {
    label: "Density"
  }, /*#__PURE__*/React.createElement(ChipRow, {
    value: density,
    setValue: setDensity,
    options: [{
      id: "comfortable",
      label: "Comfortable"
    }, {
      id: "dense",
      label: "Dense"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      paddingTop: 6,
      borderTop: `1px solid ${t.surfaceBorder}`
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 13,
      color: t.text,
      fontFamily: t.fontUi,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Dark mode"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: darkMode,
    onChange: e => setDarkMode(e.target.checked),
    style: {
      accentColor: t.accent
    }
  })), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 13,
      color: t.text,
      fontFamily: t.fontUi,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Keyboard hints"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showKeyboardHints,
    onChange: e => setShowKeyboardHints(e.target.checked),
    style: {
      accentColor: t.accent
    }
  }))));
}
Object.assign(window, {
  ProgressScreen,
  KanaScreen,
  GrammarScreen,
  TweaksPanel
});
})();