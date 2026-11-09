(function(){
const { useEffect: useEffectS } = React;
function StudyScreen(p) {
  const { t, mode, card, deck, idx } = p;
  if (!card) return null;
  const progressPct = (idx + 1) / deck.length * 100;
  return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 760, margin: "0 auto", paddingTop: 24 }, className: "resp-main-pad-inner" }, /* @__PURE__ */ React.createElement("div", { style: {
    height: 3,
    background: t.progressTrack,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 28
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    height: "100%",
    width: `${progressPct}%`,
    background: t.accent,
    transition: "width 0.4s cubic-bezier(.2,.7,.2,1)",
    boxShadow: `0 0 10px ${t.accent}80`
  } })), mode === "flashcard" && /* @__PURE__ */ React.createElement(FlashcardMode, { ...p }), mode === "quiz" && /* @__PURE__ */ React.createElement(QuizMode, { ...p }), mode === "write" && /* @__PURE__ */ React.createElement(WriteMode, { ...p }), mode === "listen" && /* @__PURE__ */ React.createElement(ListenMode, { ...p }), mode === "build" && /* @__PURE__ */ React.createElement(BuildMode, { ...p }), window.EXTRA_MODES && window.EXTRA_MODES[mode] && React.createElement(window.EXTRA_MODES[mode], p));
}
function FlashcardMode(p) {
  const { t, card, flipped, setFlipped, next, speakForce, romanjiPosition, showKeyboardHints, progress } = p;
  const stat = progress.cardStats[window.cardKey(card)];
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", key: card.front }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "accent" }, card.type), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, stat && /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 11, color: t.textFaint } }, stat.attempts, " seen \xB7 ", Math.round(stat.correct / stat.attempts * 100), "% \xB7 ", window.formatInterval(stat)), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: (e) => {
        e.stopPropagation();
        speakForce(card.front);
      },
      style: { padding: "6px 10px", background: t.btnGhost, color: t.textMuted, borderRadius: 10, fontSize: 13 }
    },
    "\u266A Play"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flip-card", onClick: () => setFlipped(!flipped), style: { height: "clamp(260px, 50vw, 340px)", marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { className: `flip-inner${flipped ? " flipped" : ""}`, style: { width: "100%", height: "100%" } }, /* @__PURE__ */ React.createElement("div", { className: "flip-face", style: {
    background: t.cardFront,
    border: `1px solid ${t.cardFrontBorder}`,
    boxShadow: t.shadowElevated
  } }, /* @__PURE__ */ React.createElement("div", { className: "jp", style: {
    fontSize: `clamp(${card.front.length > 6 ? 38 : card.front.length > 3 ? 52 : 72}px, ${card.front.length > 6 ? 12 : card.front.length > 3 ? 16 : 22}vw, ${card.front.length > 6 ? 56 : card.front.length > 3 ? 76 : 112}px)`,
    fontWeight: 500,
    color: t.cardFrontChar,
    lineHeight: 1.1,
    letterSpacing: -2
  } }, card.front), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 28, fontSize: 12, color: t.textFaint, fontFamily: t.fontMono, letterSpacing: 1 } }, "TAP TO REVEAL")), /* @__PURE__ */ React.createElement("div", { className: "flip-face flip-back", style: {
    background: t.accent,
    color: t.onAccent,
    boxShadow: `${t.shadowElevated}, 0 0 0 1px ${t.accent}`
  } }, /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: "clamp(22px, 6vw, 34px)", fontWeight: 500, opacity: 0.7, marginBottom: 14 } }, card.front), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "clamp(22px, 6vw, 34px)", fontWeight: 700, letterSpacing: -0.8, fontFamily: t.fontUi, lineHeight: 1.2 } }, card.back), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 15, marginTop: 18, opacity: 0.85, letterSpacing: 0.5 } }, card.romanji), card.note && /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 14,
    padding: "8px 14px",
    maxWidth: 380,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 8
  } }, card.note)))), flipped ? /* @__PURE__ */ React.createElement("div", { className: "fade-up" }, /* @__PURE__ */ React.createElement("div", { className: "resp-rating-4" }, [
    { r: "again", label: "Again", hint: "<10m", color: t.danger },
    { r: "hard", label: "Hard", hint: "1.5d", color: t.warn },
    { r: "good", label: "Good", hint: "3d", color: t.accent },
    { r: "easy", label: "Easy", hint: "7d", color: t.success }
  ].map((b, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: b.r,
      className: "btn",
      onClick: () => next(b.r),
      style: {
        padding: "14px 10px",
        borderRadius: 14,
        background: t.surfaceBg,
        color: b.color,
        border: `1px solid ${b.color}40`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, fontFamily: t.fontUi } }, b.label),
    /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 10, opacity: 0.7 } }, b.hint),
    showKeyboardHints && /* @__PURE__ */ React.createElement("kbd", null, i + 1)
  ))), showKeyboardHints && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontSize: 11, color: t.textFaint, marginTop: 12, fontFamily: t.fontMono } }, /* @__PURE__ */ React.createElement("kbd", null, "Space"), " flip  \xB7  ", /* @__PURE__ */ React.createElement("kbd", null, "1\u20134"), " rate  \xB7  ", /* @__PURE__ */ React.createElement("kbd", null, "R"), " replay audio")) : showKeyboardHints && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontSize: 11, color: t.textFaint, fontFamily: t.fontMono } }, /* @__PURE__ */ React.createElement("kbd", null, "Space"), " to flip  \xB7  ", /* @__PURE__ */ React.createElement("kbd", null, "R"), " replay"));
}
function QuizMode(p) {
  const { t, card, quizOptions, quizSelected, setQuizSelected, next, speakForce } = p;
  const handle = (opt) => {
    if (quizSelected !== null) return;
    setQuizSelected(opt);
    setTimeout(() => next(opt === card.back), 1100);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", key: card.front }, /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "accent", style: { marginBottom: 14 } }, card.type, " \xB7 Choose meaning"), /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "36px 20px", textAlign: "center", marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "jp", style: {
    fontSize: `clamp(${card.front.length > 6 ? 32 : 44}px, ${card.front.length > 6 ? 10 : 14}vw, ${card.front.length > 6 ? 46 : 72}px)`,
    fontWeight: 500,
    color: t.text,
    lineHeight: 1.1,
    letterSpacing: -1.5
  } }, card.front), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: () => speakForce(card.front),
      style: { marginTop: 14, padding: "6px 14px", background: `${t.accent}14`, color: t.accent, borderRadius: 999, fontSize: 12, fontFamily: t.fontMono }
    },
    card.kind === "kana" ? "\u266A" : `\u266A ${card.romanji}`
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, quizOptions.map((opt, i) => {
    const isCorrect = quizSelected !== null && opt === card.back;
    const isWrong = quizSelected === opt && opt !== card.back;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: `opt-btn${isCorrect ? " correct" : ""}${isWrong ? " incorrect" : ""}`,
        onClick: () => handle(opt),
        disabled: quizSelected !== null
      },
      /* @__PURE__ */ React.createElement("span", { className: "mono", style: { color: t.textFaint, marginRight: 10, fontSize: 12 } }, "ABCD"[i]),
      opt
    );
  })));
}
function WriteMode(p) {
  const { t, card, writeInput, setWriteInput, writeResult, setWriteResult, next, speakForce, showKeyboardHints } = p;
  const check = () => {
    const normalized = writeInput.toLowerCase().trim().replace(/[\s\-_]/g, "");
    const expected = (card.romanji || "").toLowerCase().replace(/[\s\-_]/g, "");
    const alts = expected.split("/").map((s) => s.trim());
    const correct = alts.some((a) => normalized === a);
    setWriteResult(correct ? "correct" : "incorrect");
    setTimeout(() => next(correct), 1300);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", key: card.front }, /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "accent", style: { marginBottom: 14 } }, "Type the reading"), /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "36px 20px", textAlign: "center", marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { className: "jp", style: {
    fontSize: `clamp(${card.front.length > 6 ? 32 : 44}px, ${card.front.length > 6 ? 10 : 14}vw, ${card.front.length > 6 ? 46 : 72}px)`,
    fontWeight: 500,
    color: t.text,
    letterSpacing: -1.5,
    lineHeight: 1.1
  } }, card.front), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.textMuted, marginTop: 12 } }, card.back), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: () => speakForce(card.front),
      style: { marginTop: 12, padding: "6px 14px", background: `${t.accent}14`, color: t.accent, borderRadius: 999, fontSize: 12, fontFamily: t.fontMono }
    },
    "\u266A Play audio"
  )), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: writeInput,
      onChange: (e) => {
        setWriteInput(e.target.value);
        setWriteResult(null);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter" && writeInput.trim() && !writeResult) check();
      },
      placeholder: "type romaji...",
      autoFocus: true,
      disabled: writeResult !== null,
      style: {
        width: "100%",
        padding: "16px 18px",
        background: writeResult === "correct" ? t.successBg : writeResult === "incorrect" ? t.dangerBg : t.inputBg,
        color: t.text,
        border: `1px solid ${writeResult === "correct" ? t.successBorder : writeResult === "incorrect" ? t.dangerBorder : t.inputBorder}`,
        borderRadius: 14,
        fontSize: 18,
        fontFamily: t.fontMono,
        outline: "none"
      }
    }
  ), writeResult && /* @__PURE__ */ React.createElement("div", { className: "fade-up", style: {
    marginTop: 14,
    padding: "12px 16px",
    borderRadius: 12,
    background: writeResult === "correct" ? t.successBg : t.dangerBg,
    color: writeResult === "correct" ? t.success : t.danger,
    border: `1px solid ${writeResult === "correct" ? t.successBorder : t.dangerBorder}`,
    fontSize: 14,
    fontFamily: t.fontUi
  } }, writeResult === "correct" ? "\u2713 Correct!" : /* @__PURE__ */ React.createElement(React.Fragment, null, "\u2717 Answer: ", /* @__PURE__ */ React.createElement("b", { className: "mono" }, card.romanji))), !writeResult && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: check,
      disabled: !writeInput.trim(),
      style: {
        marginTop: 12,
        padding: "12px 22px",
        background: t.accent,
        color: t.onAccent,
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: t.fontUi
      }
    },
    "Check ",
    showKeyboardHints && /* @__PURE__ */ React.createElement("kbd", { style: { marginLeft: 8 } }, "\u23CE")
  ));
}
function ListenMode(p) {
  const { t, card, speakForce, listenRevealed, setListenRevealed, listenOptions, listenSelected, setListenSelected, next } = p;
  const handle = (opt) => {
    if (listenSelected !== null) return;
    setListenSelected(opt);
    setTimeout(() => next(opt === card.back), 1100);
  };
  useEffectS(() => {
    const timer = setTimeout(() => speakForce(card.front), 400);
    return () => clearTimeout(timer);
  }, [card.front, speakForce]);
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", key: card.front }, /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "accent", style: { marginBottom: 14 } }, "Listen \xB7 Choose meaning"), /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "40px 28px", textAlign: "center", marginBottom: 20 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: () => speakForce(card.front),
      style: {
        width: 96,
        height: 96,
        borderRadius: "50%",
        margin: "0 auto 18px",
        background: t.accent,
        color: t.onAccent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 38,
        boxShadow: `0 6px 24px ${t.accent}44`
      }
    },
    "\u266A"
  ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: t.textMuted, marginBottom: 12 } }, "Tap to replay"), listenRevealed ? /* @__PURE__ */ React.createElement("div", { className: "fade-up" }, /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: "clamp(28px, 9vw, 42px)", fontWeight: 500, color: t.text, letterSpacing: -1 } }, card.front), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 13, color: t.textFaint, marginTop: 6 } }, card.romanji)) : /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: () => setListenRevealed(true),
      style: {
        fontSize: 12,
        color: t.textMuted,
        fontFamily: t.fontMono,
        padding: "4px 10px",
        background: t.btnGhost,
        borderRadius: 999
      }
    },
    "Show script"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, listenOptions.map((opt, i) => {
    const isCorrect = listenSelected !== null && opt === card.back;
    const isWrong = listenSelected === opt && opt !== card.back;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: `opt-btn${isCorrect ? " correct" : ""}${isWrong ? " incorrect" : ""}`,
        onClick: () => handle(opt),
        disabled: listenSelected !== null
      },
      /* @__PURE__ */ React.createElement("span", { className: "mono", style: { color: t.textFaint, marginRight: 10, fontSize: 12 } }, "ABCD"[i]),
      opt
    );
  })));
}
function BuildMode(p) {
  const { t, card, buildTokens, buildSelected, setBuildSelected, buildResult, setBuildResult, next, speakForce } = p;
  const correctTokens = window.tokenizeSentence(card.front);
  const pick = (tok) => {
    if (buildResult) return;
    if (buildSelected.includes(tok.id)) return;
    setBuildSelected([...buildSelected, tok.id]);
  };
  const unpick = (id) => {
    if (buildResult) return;
    setBuildSelected(buildSelected.filter((x) => x !== id));
  };
  const built = buildSelected.map((id) => buildTokens.find((x) => x.id === id)?.text).join("");
  const expected = correctTokens.join("");
  const done = buildSelected.length === buildTokens.length;
  const check = () => {
    const correct = built === expected;
    setBuildResult(correct ? "correct" : "incorrect");
    setTimeout(() => next(correct), 1500);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", key: card.front }, /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "accent", style: { marginBottom: 14 } }, "Build the sentence"), /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "20px 22px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 10, color: t.textFaint, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" } }, "Target"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 700, color: t.text, fontFamily: t.fontUi } }, card.back), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 12, color: t.textMuted, marginTop: 4 } }, card.romanji)), /* @__PURE__ */ React.createElement("div", { style: {
    minHeight: 80,
    padding: 14,
    background: buildResult === "correct" ? t.successBg : buildResult === "incorrect" ? t.dangerBg : t.surfaceSunken,
    border: `1px dashed ${buildResult === "correct" ? t.successBorder : buildResult === "incorrect" ? t.dangerBorder : t.surfaceBorder}`,
    borderRadius: 14,
    marginBottom: 16,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center"
  } }, buildSelected.length === 0 ? /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint, fontSize: 13, fontStyle: "italic" } }, "Tap tokens below to build the sentence \u2192") : buildSelected.map((id) => {
    const tk = buildTokens.find((x) => x.id === id);
    return /* @__PURE__ */ React.createElement("span", { key: id, className: "token", onClick: () => unpick(id) }, tk.text);
  })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 } }, buildTokens.map((tk) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tk.id,
      className: `token btn${buildSelected.includes(tk.id) ? " placed" : ""}`,
      onClick: () => pick(tk),
      disabled: buildSelected.includes(tk.id) || !!buildResult
    },
    tk.text
  ))), buildResult && /* @__PURE__ */ React.createElement("div", { className: "fade-up", style: {
    padding: "12px 16px",
    marginBottom: 12,
    borderRadius: 12,
    background: buildResult === "correct" ? t.successBg : t.dangerBg,
    color: buildResult === "correct" ? t.success : t.danger,
    border: `1px solid ${buildResult === "correct" ? t.successBorder : t.dangerBorder}`,
    fontSize: 14,
    fontFamily: t.fontUi
  } }, buildResult === "correct" ? "\u2713 Correct!" : /* @__PURE__ */ React.createElement(React.Fragment, null, "\u2717 Expected: ", /* @__PURE__ */ React.createElement("b", { className: "jp" }, expected))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: () => speakForce(card.front),
      style: { padding: "12px 18px", background: t.btnGhost, color: t.textMuted, borderRadius: 14, fontSize: 14, fontFamily: t.fontUi }
    },
    "\u266A Hear target"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: check,
      disabled: !done || !!buildResult,
      style: {
        padding: "12px 22px",
        background: t.accent,
        color: t.onAccent,
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: t.fontUi,
        opacity: !done || !!buildResult ? 0.5 : 1
      }
    },
    "Check answer"
  )));
}
function FinishScreen(p) {
  const { t, score, deck, startStudy, setScreen, sessionStart, courseCtx, backToCourse } = p;
  const pct = deck.length ? Math.round(score.correct / deck.length * 100) : 0;
  const duration = sessionStart ? Math.round((Date.now() - sessionStart) / 1e3) : 0;
  const msg = pct >= 90 ? "\u7D20\u6674\u3089\u3057\u3044 \u2014 Outstanding!" : pct >= 70 ? "\u3088\u304F\u3067\u304D\u307E\u3057\u305F \u2014 Well done!" : pct >= 50 ? "\u304C\u3093\u3070\u3063\u3066 \u2014 Keep going!" : "\u7DF4\u7FD2\u3042\u308B\u306E\u307F \u2014 Practice makes perfect.";
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", style: { maxWidth: 560, margin: "64px auto 0", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: t.fontJp, fontSize: 90, color: `${t.accent}30`, lineHeight: 1, marginBottom: 8 } }, "\u5B8C"), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 36, fontWeight: 800, letterSpacing: -1.2, color: t.text, margin: 0, fontFamily: t.fontUi } }, "Session complete"), /* @__PURE__ */ React.createElement("p", { style: { color: t.textMuted, marginTop: 8, fontFamily: t.fontJp, fontSize: 16 } }, msg), /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: 28, margin: "28px 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 10, color: t.textFaint, letterSpacing: 1.5, textTransform: "uppercase" } }, "Accuracy"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40, fontWeight: 800, color: t.accent, fontFamily: t.fontUi, letterSpacing: -1, lineHeight: 1, marginTop: 6 } }, pct, "%")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 10, color: t.textFaint, letterSpacing: 1.5, textTransform: "uppercase" } }, "Correct"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40, fontWeight: 800, color: t.success, fontFamily: t.fontUi, letterSpacing: -1, lineHeight: 1, marginTop: 6 } }, score.correct, /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint, fontSize: 20 } }, "/", deck.length))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 10, color: t.textFaint, letterSpacing: 1.5, textTransform: "uppercase" } }, "Time"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40, fontWeight: 800, color: t.text, fontFamily: t.fontUi, letterSpacing: -1, lineHeight: 1, marginTop: 6 } }, Math.floor(duration / 60), /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint, fontSize: 20 } }, ":", String(duration % 60).padStart(2, "0"))))), courseCtx && courseCtx.kind === "quiz" && (() => {
    const pass = window.COURSE_PASS_PCT || 70;
    return pct >= pass ? /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18, fontSize: 18, fontWeight: 700, color: t.success, fontFamily: t.fontUi } }, "Lecci\xF3n aprobada \u2713") : /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18, fontSize: 15, color: t.warn, fontFamily: t.fontUi } }, "Te faltan ", pass - pct, " puntos para el ", pass, "%. \xA1Repasa las tarjetas e int\xE9ntalo otra vez!");
  })(), courseCtx ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center" } }, /* @__PURE__ */ React.createElement(window.PrimaryButton, { t, onClick: backToCourse }, "Volver al curso \u2192")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center" } }, /* @__PURE__ */ React.createElement(window.PrimaryButton, { t, onClick: startStudy }, "Another round \u2192"), /* @__PURE__ */ React.createElement(window.SecondaryButton, { t, onClick: () => setScreen("home") }, "Home"), /* @__PURE__ */ React.createElement(window.SecondaryButton, { t, onClick: () => setScreen("progress") }, "View progress")));
}
Object.assign(window, { StudyScreen, FinishScreen });
})();
