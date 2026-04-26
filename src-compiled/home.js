(function(){
// ═══════════════════════════════════════════════════════════════════════
//  Home / Config screen
// ═══════════════════════════════════════════════════════════════════════
const {
  useMemo: useMemoHome
} = React;
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
    density
  } = p;
  const modes = [{
    id: "flashcard",
    label: "Flashcards",
    hint: "Flip & self-rate (SRS)",
    glyph: "⎙"
  }, {
    id: "quiz",
    label: "Quiz",
    hint: "Multiple choice",
    glyph: "✕"
  }, {
    id: "write",
    label: "Write",
    hint: "Type the reading",
    glyph: "✎"
  }, {
    id: "listen",
    label: "Listen",
    hint: "Audio → meaning",
    glyph: "♪"
  }, {
    id: "build",
    label: "Build",
    hint: "Arrange sentences",
    glyph: "⊞"
  }];
  const goals = [{
    kind: "cards",
    value: 10,
    label: "10 cards"
  }, {
    kind: "cards",
    value: 20,
    label: "20 cards"
  }, {
    kind: "cards",
    value: 40,
    label: "40 cards"
  }, {
    kind: "due",
    value: 0,
    label: "Due only"
  }];
  const totalInSelection = useMemoHome(() => {
    if (mode === "build") return window.CARD_DATA.sentences.length;
    return categories.reduce((sum, c) => sum + (window.CARD_DATA[c]?.length || 0), 0);
  }, [categories, mode]);
  const dueInSelection = useMemoHome(() => {
    if (mode === "build") {
      return window.CARD_DATA.sentences.filter(c => window.isDue(progress.cardStats[window.cardKey(c)])).length;
    }
    return categories.reduce((sum, c) => sum + (window.CARD_DATA[c]?.filter(card => window.isDue(progress.cardStats[window.cardKey(card)])).length || 0), 0);
  }, [categories, mode, progress]);
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-up",
    style: {
      maxWidth: 1080,
      margin: "0 auto",
      paddingTop: 32
    }
  }, /*#__PURE__*/React.createElement(window.MistakeBanner, {
    t: t,
    progress: progress,
    onDrill: startMistakeDrill
  }), /*#__PURE__*/React.createElement("section", {
    className: "resp-grid-12",
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "surface-raised",
    style: {
      padding: "28px 32px",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t,
    accent: true
  }, new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  })), /*#__PURE__*/React.createElement("h1", {
    className: "resp-hero-title",
    style: {
      margin: "10px 0 6px",
      fontFamily: t.fontUi,
      fontWeight: 800,
      letterSpacing: -1.2,
      color: t.text,
      lineHeight: 1.05
    }
  }, "\u4ECA\u65E5\u306E\u5B66\u7FD2 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.textFaint,
      fontWeight: 400,
      fontFamily: t.fontUi
    }
  }, "/ Today's study")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: t.textMuted,
      margin: 0,
      maxWidth: 420
    }
  }, stats.dueCount > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, "You have ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: t.accent
    }
  }, stats.dueCount), " cards due for review. Spaced repetition keeps recall strong.") : "No reviews due right now. A short new-card session keeps momentum."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 22,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(window.PrimaryButton, {
    t: t,
    onClick: startStudy
  }, "Start session \u2192"), stats.dueCount > 0 && /*#__PURE__*/React.createElement(window.SecondaryButton, {
    t: t,
    onClick: () => {
      setDueOnly(true);
      setSessionGoal({
        kind: "due",
        value: 0
      });
      startStudy();
    }
  }, "Review ", stats.dueCount, " due"), stats.weakCount > 0 && /*#__PURE__*/React.createElement(window.SecondaryButton, {
    t: t,
    onClick: startWeakReview
  }, "Weak-spot drill (", stats.weakCount, ")")), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    className: "resp-hero-kanji",
    style: {
      position: "absolute",
      fontFamily: t.fontJp,
      fontWeight: 900,
      color: `${t.accent}0D`,
      letterSpacing: -10,
      lineHeight: 1,
      pointerEvents: "none"
    }
  }, "\u5B66")), /*#__PURE__*/React.createElement("div", {
    className: "resp-stats-22"
  }, /*#__PURE__*/React.createElement(window.StatTile, {
    t: t,
    label: "Streak",
    value: progress.streakDays || 0,
    sub: "consecutive days",
    tone: "warn"
  }), /*#__PURE__*/React.createElement(window.StatTile, {
    t: t,
    label: "Accuracy",
    value: `${stats.acc}%`,
    sub: `${progress.totalAnswered} answers`
  }), /*#__PURE__*/React.createElement(window.StatTile, {
    t: t,
    label: "Mastered",
    value: stats.mastered,
    sub: `of ${stats.total} cards`,
    tone: "success"
  }), /*#__PURE__*/React.createElement(window.StatTile, {
    t: t,
    label: "Due",
    value: stats.dueCount,
    sub: "ready to review"
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t
  }, "01 \xB7 Mode"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 0",
      fontSize: 20,
      fontWeight: 700,
      fontFamily: t.fontUi,
      letterSpacing: -0.4,
      color: t.text
    }
  }, "How do you want to practice?")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: t.textFaint,
      fontFamily: t.fontMono
    }
  }, modes.find(m => m.id === mode)?.hint)), /*#__PURE__*/React.createElement("div", {
    className: "resp-modes-5"
  }, modes.map(m => {
    const active = mode === m.id;
    return /*#__PURE__*/React.createElement("button", {
      key: m.id,
      className: "btn",
      onClick: () => setMode(m.id),
      style: {
        padding: "18px 14px",
        background: active ? t.surfaceBg : t.surfaceSunken,
        border: `1px solid ${active ? t.accent : t.surfaceBorder}`,
        borderRadius: 16,
        textAlign: "left",
        boxShadow: active ? `0 0 0 3px ${t.accent}14, ${t.shadowCard}` : "none",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: t.fontJp,
        fontSize: 22,
        color: active ? t.accent : t.textMuted,
        marginBottom: 10,
        fontWeight: 500
      }
    }, m.glyph), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: t.text,
        fontFamily: t.fontUi
      }
    }, m.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: t.textFaint,
        marginTop: 2
      }
    }, m.hint));
  }))), /*#__PURE__*/React.createElement("section", {
    className: "resp-grid-21"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t
  }, "02 \xB7 Content"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 0",
      fontSize: 20,
      fontWeight: 700,
      fontFamily: t.fontUi,
      letterSpacing: -0.4,
      color: t.text
    }
  }, mode === "build" ? "Sentence bank" : "Categories")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: t.textFaint,
      fontFamily: t.fontMono
    }
  }, totalInSelection, " cards \xB7 ", dueInSelection, " due")), mode === "build" ? /*#__PURE__*/React.createElement("div", {
    className: "surface",
    style: {
      padding: 18,
      fontSize: 13,
      color: t.textMuted
    }
  }, "Build mode drills the ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: t.text
    }
  }, "sentence bank"), " \u2014 arrange tokens (words + particles) in order. Categories don't apply here.") : /*#__PURE__*/React.createElement("div", {
    className: "resp-cats-2"
  }, window.CATEGORY_META.map(c => {
    const on = categories.includes(c.id);
    const dueN = window.CARD_DATA[c.id].filter(card => window.isDue(progress.cardStats[window.cardKey(card)])).length;
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      className: "btn",
      onClick: () => toggleCat(c.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        background: on ? t.surfaceBg : t.surfaceSunken,
        border: `1px solid ${on ? t.accent : t.surfaceBorder}`,
        borderRadius: 12,
        textAlign: "left",
        boxShadow: on ? `0 0 0 2px ${t.accent}14` : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: on ? t.accent : t.btnGhost,
        color: on ? t.onAccent : t.textMuted,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: t.fontJp,
        fontSize: 17,
        fontWeight: 700
      }
    }, c.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: t.text,
        fontFamily: t.fontUi
      }
    }, c.label), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 10,
        color: t.textFaint,
        marginTop: 1
      }
    }, c.count, " cards ", dueN > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: t.accent
      }
    }, "\xB7 ", dueN, " due"))));
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t
  }, "03 \xB7 Session"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 14px",
      fontSize: 20,
      fontWeight: 700,
      fontFamily: t.fontUi,
      letterSpacing: -0.4,
      color: t.text
    }
  }, "Length"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
      marginBottom: 14
    },
    className: "resp-cats-2"
  }, goals.map(g => {
    const active = sessionGoal.kind === g.kind && sessionGoal.value === g.value;
    return /*#__PURE__*/React.createElement("button", {
      key: g.label,
      className: "btn",
      onClick: () => setSessionGoal(g),
      style: {
        padding: "14px 12px",
        background: active ? t.accent : t.surfaceSunken,
        color: active ? t.onAccent : t.text,
        border: `1px solid ${active ? t.accent : t.surfaceBorder}`,
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: t.fontUi
      }
    }, g.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "surface",
    style: {
      padding: 14,
      fontSize: 12,
      color: t.textMuted
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "Mode"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: t.text,
      fontFamily: t.fontUi
    }
  }, modes.find(m => m.id === mode)?.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "Deck size"), /*#__PURE__*/React.createElement("b", {
    className: "mono",
    style: {
      color: t.text
    }
  }, sessionGoal.kind === "cards" ? Math.min(sessionGoal.value, totalInSelection) : dueInSelection)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Est. time"), /*#__PURE__*/React.createElement("b", {
    className: "mono",
    style: {
      color: t.text
    }
  }, "~", Math.max(1, Math.round((sessionGoal.kind === "cards" ? Math.min(sessionGoal.value, totalInSelection) : dueInSelection) * 0.25)), " min"))))), progress.history?.length > 0 && /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(window.Eyebrow, {
    t: t
  }, "Recent sessions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 10,
      marginTop: 10
    }
  }, progress.history.slice().reverse().slice(0, 4).map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "surface",
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: t.textMuted,
      fontFamily: t.fontUi,
      textTransform: "capitalize"
    }
  }, h.mode), /*#__PURE__*/React.createElement(window.Pill, {
    t: t,
    tone: h.score >= 80 ? "success" : h.score >= 60 ? "warn" : "danger",
    size: "sm"
  }, h.score, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: t.textFaint,
      fontFamily: t.fontMono
    }
  }, h.date, " \xB7 ", h.cards, "c \xB7 ", Math.round(h.duration / 60), "m"))))));
}
window.HomeScreen = HomeScreen;
})();