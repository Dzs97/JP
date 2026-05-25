// ═══════════════════════════════════════════════════════════════════════
//  Extra study modes — Conjugate, Cloze, Speed
//  Plain JS (React.createElement) so it ships without a JSX build step.
//  Registers components on window.EXTRA_MODES; StudyScreen dispatches.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const h = React.createElement;
  const { useState, useEffect, useMemo, useRef } = React;

  // ── Conjugate mode ────────────────────────────────────────────────────
  // Show a dictionary-form verb, ask the user to type its ます form (romaji).
  function ConjugateMode(p) {
    const { t, card, next, speakForce } = p;
    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);

    const target = useMemo(() => window.conjugateMasu(card), [card]);

    // Reset on card change
    useEffect(() => { setInput(""); setResult(null); }, [card.front]);

    if (!target) {
      // Not a verb (or unsupported group) — skip
      useEffect(() => { const id = setTimeout(() => next(true), 50); return () => clearTimeout(id); }, []);
      return h("div", { className: "fade-up", style: { textAlign: "center", padding: 40, color: t.textMuted } },
        "skipping — not a verb");
    }

    const check = () => {
      const normalized = input.toLowerCase().trim().replace(/[\s\-_]/g, "");
      const correct = normalized === target.romanji.toLowerCase();
      setResult(correct ? "correct" : "incorrect");
      setTimeout(() => next(correct), 1300);
    };

    return h("div", { className: "fade-up", key: card.front },
      h(window.Pill, { t, tone: "accent", style: { marginBottom: 14 } }, "Conjugate · ます form"),
      h("div", { className: "surface-raised", style: { padding: "36px 20px", textAlign: "center", marginBottom: 20 } },
        h("div", { className: "mono", style: { fontSize: 10, color: t.textFaint, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" } }, "Dictionary form"),
        h("div", { className: "jp", style: { fontSize: "clamp(36px, 11vw, 64px)", fontWeight: 500, color: t.text, letterSpacing: -1.2, lineHeight: 1.1 } }, card.front),
        h("div", { className: "mono", style: { fontSize: 13, color: t.textMuted, marginTop: 8 } }, card.romanji, " · ", card.back),
        h("div", { style: { marginTop: 18, fontSize: 13, color: t.textMuted } },
          "→ type the ", h("b", { style: { color: t.text } }, "ます"), " form (romaji)"),
        h("button", { className: "btn", onClick: () => speakForce(target.kanji),
          style: { marginTop: 12, padding: "6px 14px", background: `${t.accent}14`, color: t.accent, borderRadius: 999, fontSize: 12, fontFamily: t.fontMono } },
          "♪ hear answer")
      ),
      h("input", {
        value: input,
        onChange: (e) => { setInput(e.target.value); setResult(null); },
        onKeyDown: (e) => { if (e.key === "Enter" && input.trim() && !result) check(); },
        placeholder: "e.g. tabemasu",
        autoFocus: true,
        disabled: result !== null,
        style: {
          width: "100%", padding: "16px 18px",
          background: result === "correct" ? t.successBg : result === "incorrect" ? t.dangerBg : t.inputBg,
          color: t.text,
          border: `1px solid ${result === "correct" ? t.successBorder : result === "incorrect" ? t.dangerBorder : t.inputBorder}`,
          borderRadius: 14, fontSize: 18, fontFamily: t.fontMono, outline: "none",
        },
      }),
      result && h("div", { className: "fade-up",
        style: {
          marginTop: 14, padding: "12px 16px", borderRadius: 12,
          background: result === "correct" ? t.successBg : t.dangerBg,
          color: result === "correct" ? t.success : t.danger,
          border: `1px solid ${result === "correct" ? t.successBorder : t.dangerBorder}`,
          fontSize: 14, fontFamily: t.fontUi,
        }},
        result === "correct"
          ? h(React.Fragment, null, "✓ ", h("b", { className: "jp" }, target.kanji), " (", h("span", { className: "mono" }, target.romanji), ")")
          : h(React.Fragment, null, "✗ ", h("b", { className: "jp" }, target.kanji), " · ", h("span", { className: "mono" }, target.romanji))
      ),
      !result && h("button", { className: "btn", onClick: check, disabled: !input.trim(),
        style: { marginTop: 12, padding: "12px 22px", background: t.accent, color: t.onAccent,
          borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: t.fontUi } },
        "Check")
    );
  }

  // ── Cloze mode ────────────────────────────────────────────────────────
  // Show a sentence with one token blanked, present multiple-choice fillers.
  function ClozeMode(p) {
    const { t, card, next, speakForce } = p;
    const [selected, setSelected] = useState(null);

    const cloze = useMemo(() => window.makeClozeFromSentence(card, window.ALL_CARDS), [card.front]);

    useEffect(() => { setSelected(null); }, [card.front]);

    if (!cloze) {
      useEffect(() => { const id = setTimeout(() => next(true), 50); return () => clearTimeout(id); }, []);
      return h("div", { style: { textAlign: "center", padding: 40, color: t.textMuted } }, "skipping — sentence too short");
    }

    const handle = (opt) => {
      if (selected !== null) return;
      setSelected(opt);
      setTimeout(() => next(opt === cloze.answer), 1100);
    };

    return h("div", { className: "fade-up", key: card.front },
      h(window.Pill, { t, tone: "accent", style: { marginBottom: 14 } }, "Cloze · fill the blank"),
      h("div", { className: "surface-raised", style: { padding: "32px 20px", textAlign: "center", marginBottom: 16 } },
        h("div", { className: "jp", style: { fontSize: "clamp(22px, 6vw, 32px)", fontWeight: 500, color: t.text, letterSpacing: -0.6, lineHeight: 1.5 } },
          cloze.tokens.map((tok, i) =>
            i === cloze.blankIdx
              ? h("span", { key: i, style: {
                  display: "inline-block", minWidth: 60, padding: "0 10px",
                  background: selected ? (selected === cloze.answer ? t.successBg : t.dangerBg) : `${t.accent}1f`,
                  color: selected ? (selected === cloze.answer ? t.success : t.danger) : t.accent,
                  borderRadius: 8, margin: "0 2px",
                } }, selected || "＿＿")
              : h("span", { key: i }, tok)
          )
        ),
        h("div", { className: "mono", style: { fontSize: 12, color: t.textMuted, marginTop: 12 } }, card.back),
        h("button", { className: "btn", onClick: () => speakForce(card.front),
          style: { marginTop: 10, padding: "6px 14px", background: `${t.accent}14`, color: t.accent, borderRadius: 999, fontSize: 12, fontFamily: t.fontMono } },
          "♪ hear full sentence")
      ),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 } },
        cloze.options.map((opt, i) => {
          const isCorrect = selected !== null && opt === cloze.answer;
          const isWrong = selected === opt && opt !== cloze.answer;
          return h("button", {
            key: i,
            className: `opt-btn${isCorrect ? " correct" : ""}${isWrong ? " incorrect" : ""}`,
            onClick: () => handle(opt),
            disabled: selected !== null,
            style: { fontFamily: t.fontJp, fontSize: 22, textAlign: "center", padding: "14px 8px", fontWeight: 500 },
          }, opt);
        }))
    );
  }

  // ── Speed mode ────────────────────────────────────────────────────────
  // Quiz with a per-card countdown. If you run out, it counts as wrong.
  const SPEED_PER_CARD_SECONDS = 10;
  function SpeedMode(p) {
    const { t, card, quizOptions, quizSelected, setQuizSelected, next, speakForce } = p;
    const [remaining, setRemaining] = useState(SPEED_PER_CARD_SECONDS);
    const tickRef = useRef(null);

    useEffect(() => {
      setRemaining(SPEED_PER_CARD_SECONDS);
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(tickRef.current);
            // time up — count as wrong unless already answered
            if (quizSelected === null) {
              setQuizSelected("__timeout__");
              setTimeout(() => next(false), 600);
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
      return () => clearInterval(tickRef.current);
    }, [card.front]);

    const handle = (opt) => {
      if (quizSelected !== null) return;
      clearInterval(tickRef.current);
      setQuizSelected(opt);
      setTimeout(() => next(opt === card.back), 700);
    };

    const pct = (remaining / SPEED_PER_CARD_SECONDS) * 100;
    const barColor = remaining > 4 ? t.success : remaining > 2 ? t.warn : t.danger;

    return h("div", { className: "fade-up", key: card.front },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
        h(window.Pill, { t, tone: "accent" }, "Speed · ", SPEED_PER_CARD_SECONDS, "s per card"),
        h("span", { className: "mono", style: { fontSize: 22, fontWeight: 700, color: barColor, fontFamily: t.fontMono } },
          remaining, "s")
      ),
      h("div", { style: { height: 4, background: t.progressTrack, borderRadius: 2, overflow: "hidden", marginBottom: 16 } },
        h("div", { style: { height: "100%", width: `${pct}%`, background: barColor, transition: "width 1s linear" } })
      ),
      h("div", { className: "surface-raised", style: { padding: "32px 20px", textAlign: "center", marginBottom: 16 } },
        h("div", { className: "jp", style: {
          fontSize: `clamp(${card.front.length > 6 ? 32 : 44}px, ${card.front.length > 6 ? 10 : 14}vw, ${card.front.length > 6 ? 46 : 72}px)`,
          fontWeight: 500, color: t.text, lineHeight: 1.1, letterSpacing: -1.5,
        }}, card.front),
        h("button", { className: "btn", onClick: () => speakForce(card.front),
          style: { marginTop: 12, padding: "6px 14px", background: `${t.accent}14`, color: t.accent, borderRadius: 999, fontSize: 12, fontFamily: t.fontMono } },
          "♪")
      ),
      h("div", { style: { display: "grid", gap: 8 } },
        (quizOptions || []).map((opt, i) => {
          const isCorrect = quizSelected !== null && quizSelected !== "__timeout__" && opt === card.back;
          const isWrong = quizSelected === opt && opt !== card.back;
          const showTimeout = quizSelected === "__timeout__" && opt === card.back;
          return h("button", {
            key: i,
            className: `opt-btn${isCorrect || showTimeout ? " correct" : ""}${isWrong ? " incorrect" : ""}`,
            onClick: () => handle(opt),
            disabled: quizSelected !== null,
          },
            h("span", { className: "mono", style: { color: t.textFaint, marginRight: 10, fontSize: 12 } }, "ABCD"[i]),
            opt);
        }))
    );
  }

  window.EXTRA_MODES = {
    conjugate: ConjugateMode,
    cloze: ClozeMode,
    speed: SpeedMode,
  };

  window.EXTRA_MODES_META = [
    { id: "conjugate", label: "Conjugate", hint: "Verb → ます form", glyph: "活" },
    { id: "cloze",     label: "Cloze",     hint: "Fill the blank",   glyph: "空" },
    { id: "speed",     label: "Speed",     hint: "10s per card",      glyph: "速" },
  ];
})();
