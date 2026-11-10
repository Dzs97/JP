(function(){
const { useState: useS2, useMemo: useM2, useEffect: useE2 } = React;
function KanjiScreen(p) {
  const { t, speakForce } = p;
  const [selected, setSelected] = useS2(null);
  const [filter, setFilter] = useS2("");
  const [level, setLevel] = useS2("all");
  const list = useM2(() => {
    const f = filter.trim().toLowerCase();
    let base = window.KANJI_DATA;
    if (level !== "all") base = base.filter((k) => k.jlpt === level);
    if (!f) return base;
    return base.filter(
      (k) => k.char.includes(f) || k.meaning.toLowerCase().includes(f) || k.on.some((r) => r.toLowerCase().includes(f)) || k.kun.some((r) => r.toLowerCase().includes(f))
    );
  }, [filter, level]);
  const cur = selected && list.some((k) => k.char === selected.char) ? selected : list[0];
  return /* @__PURE__ */ React.createElement("div", { className: "fade-up", style: { maxWidth: 1080, margin: "0 auto", paddingTop: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 24 } }, /* @__PURE__ */ React.createElement(window.Eyebrow, { t, accent: true }, "Kanji \xB7 \u6F22\u5B57"), /* @__PURE__ */ React.createElement("h1", { className: "resp-screen-title", style: { fontWeight: 800, letterSpacing: -1.2, color: t.text, margin: "6px 0", fontFamily: t.fontUi } }, window.KANJI_DATA.length, " essential characters"), /* @__PURE__ */ React.createElement("p", { style: { color: t.textMuted, fontSize: 14, margin: 0 } }, "Tap any character for readings (on'yomi / kun'yomi), meaning, and example compounds.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: filter,
      onChange: (e) => setFilter(e.target.value),
      placeholder: "Filter by character, meaning, or reading...",
      style: {
        flex: "1 1 220px",
        padding: "12px 16px",
        background: t.inputBg,
        color: t.text,
        border: `1px solid ${t.inputBorder}`,
        borderRadius: 12,
        fontSize: 14,
        outline: "none",
        fontFamily: t.fontUi
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, background: t.surfaceSunken, padding: 4, borderRadius: 10 } }, [{ id: "all", label: "All" }, { id: 5, label: "N5" }, { id: 4, label: "N4" }].map((o) => {
    const on = level === o.id;
    const count = o.id === "all" ? window.KANJI_DATA.length : window.KANJI_BY_LEVEL[o.id]?.length || 0;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: String(o.id),
        className: "btn",
        onClick: () => setLevel(o.id),
        style: {
          padding: "8px 14px",
          borderRadius: 8,
          background: on ? t.surfaceBg : "transparent",
          color: on ? t.text : t.textMuted,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: t.fontUi,
          boxShadow: on ? t.shadowCard : "none",
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      o.label,
      /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 10, color: on ? t.accent : t.textFaint } }, count)
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: "resp-grid-kanji" }, /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: 14, maxHeight: 560, overflow: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "resp-kanji-grid-6" }, list.map((k) => {
    const on = cur?.char === k.char;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: k.char,
        className: "btn",
        onClick: () => setSelected(k),
        style: {
          aspectRatio: "1",
          borderRadius: 10,
          background: on ? t.accent : "transparent",
          color: on ? t.onAccent : t.text,
          fontFamily: t.fontJp,
          fontSize: 26,
          fontWeight: 500,
          border: on ? "none" : `1px solid ${t.surfaceBorder}`,
          transition: "transform 0.12s ease"
        }
      },
      k.char
    );
  }))), cur && /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "24px 20px" }, key: cur.char }, /* @__PURE__ */ React.createElement("div", { className: "fade-up resp-kanji-detail" }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 140,
    height: 140,
    flexShrink: 0,
    background: t.surfaceSunken,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${t.surfaceBorder}`
  } }, /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: 96, fontWeight: 500, color: t.text, lineHeight: 1 } }, cur.char)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "accent", size: "sm" }, cur.strokes, " strokes"), cur.jlpt && /* @__PURE__ */ React.createElement(window.Pill, { t, tone: "success", size: "sm" }, "N", cur.jlpt)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, fontWeight: 800, color: t.text, fontFamily: t.fontUi, letterSpacing: -0.4, marginTop: 6, textTransform: "capitalize" } }, cur.meaning), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: () => speakForce(cur.char),
      style: { marginTop: 10, padding: "6px 12px", background: `${t.accent}14`, color: t.accent, borderRadius: 999, fontSize: 12, fontFamily: t.fontMono }
    },
    "\u266A Play"
  ))), /* @__PURE__ */ React.createElement("div", { className: "resp-kanji-readings" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px", background: t.surfaceSunken, borderRadius: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 } }, "On'yomi (\u97F3\u8AAD\u307F)"), /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: 17, color: t.text, fontWeight: 500 } }, cur.on.length ? cur.on.join("\u30FB") : /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint } }, "\u2014"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px", background: t.surfaceSunken, borderRadius: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 } }, "Kun'yomi (\u8A13\u8AAD\u307F)"), /* @__PURE__ */ React.createElement("div", { className: "jp", style: { fontSize: 17, color: t.text, fontWeight: 500 } }, cur.kun.length ? cur.kun.join("\u30FB") : /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint } }, "\u2014")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 8 } }, "Examples"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, cur.examples.map((ex, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      className: "btn",
      onClick: () => speakForce(ex.w),
      style: {
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        padding: "10px 14px",
        background: t.surfaceBg,
        border: `1px solid ${t.surfaceBorder}`,
        borderRadius: 10,
        textAlign: "left"
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "jp", style: { fontSize: 22, color: t.text, fontWeight: 500, minWidth: 70 } }, ex.w),
    /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 12, color: t.textMuted, minWidth: 90 } }, ex.r),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: t.textMuted, flex: 1 } }, ex.m)
  )))))));
}
function ForecastStrip({ t, progress }) {
  const forecast = useM2(() => window.forecastDueByDay(progress.cardStats, 14), [progress]);
  const max = Math.max(1, ...forecast.map((f) => f.count));
  return /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "20px 22px", marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: t.textFaint, fontWeight: 600 } }, "SRS forecast \xB7 next 14 days"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: t.text, marginTop: 4, fontFamily: t.fontUi, fontWeight: 600 } }, forecast.reduce((s, f) => s + f.count, 0), " reviews scheduled"))), /* @__PURE__ */ React.createElement("div", { className: "resp-forecast-14" }, forecast.map((f, i) => {
    const h = f.count / max * 100;
    const isToday = i === 0;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        title: `${f.date.toLocaleDateString()}: ${f.count} cards`,
        style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }
      },
      /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "end", width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: "100%",
        height: `${Math.max(h, f.count ? 6 : 2)}%`,
        background: isToday ? t.accent : f.count ? `${t.accent}66` : t.progressTrack,
        borderRadius: 4,
        transition: "height 0.4s"
      } })),
      /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, color: isToday ? t.accent : t.textFaint, fontWeight: isToday ? 700 : 400 } }, isToday ? "TODAY" : f.date.getDate())
    );
  })));
}
function DataPanel({ t, progress, setProgress }) {
  const [status, setStatus] = useS2(null);
  const exportData = () => {
    const data = JSON.stringify(progress, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nihongo-progress-${window.todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.cardStats) throw new Error("Invalid file");
      setProgress({ ...window.migrateProgress(parsed), resetAt: Date.now() });
      setStatus({ ok: true, msg: "Progress imported." });
    } catch (err) {
      setStatus({ ok: false, msg: "Import failed. Not a valid progress file." });
    }
  };
  const reset = () => {
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    setProgress({ ...window.emptyProgress(), resetAt: Date.now() });
    setStatus({ ok: true, msg: "Progress reset." });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "surface-raised", style: { padding: "20px 22px" } }, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: t.textFaint, fontWeight: 600, marginBottom: 10 } }, "Data"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: exportData,
      style: { padding: "10px 16px", background: t.btnGhost, color: t.text, borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi, border: `1px solid ${t.btnGhostBorder}` }
    },
    "\u2193 Export JSON"
  ), /* @__PURE__ */ React.createElement("label", { className: "btn", style: {
    padding: "10px 16px",
    background: t.btnGhost,
    color: t.text,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: t.fontUi,
    border: `1px solid ${t.btnGhostBorder}`,
    cursor: "pointer"
  } }, "\u2191 Import JSON", /* @__PURE__ */ React.createElement("input", { type: "file", accept: "application/json", onChange: importData, style: { display: "none" } })), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: reset,
      style: { padding: "10px 16px", background: t.dangerBg, color: t.danger, borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi, border: `1px solid ${t.dangerBorder}` }
    },
    "Reset progress"
  )), status && /* @__PURE__ */ React.createElement("div", { className: "fade-up", style: {
    marginTop: 10,
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: t.fontMono,
    background: status.ok ? t.successBg : t.dangerBg,
    color: status.ok ? t.success : t.danger,
    border: `1px solid ${status.ok ? t.successBorder : t.dangerBorder}`
  } }, status.msg));
}
function MistakeBanner({ t, progress, onDrill }) {
  const q = progress.mistakeQueue || [];
  if (q.length === 0) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "surface-raised fade-up", style: {
    padding: "14px 18px",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: `linear-gradient(90deg, ${t.accent}0D, ${t.surfaceBg})`,
    borderLeft: `3px solid ${t.accent}`
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: t.fontJp, fontSize: 32, color: t.accent, fontWeight: 500 } }, "\u5FA9"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: t.text, fontFamily: t.fontUi } }, q.length, " mistake", q.length === 1 ? "" : "s", " queued"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: t.textMuted } }, "Recently missed cards \u2014 drill them while they're still wobbly.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: onDrill,
      style: { padding: "10px 18px", background: t.accent, color: t.onAccent, borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: t.fontUi }
    },
    "Drill mistakes \u2192"
  ));
}
function HiraganaWriteInput({ t, value, setValue, disabled, result }) {
  const preview = window.romajiToKana(value);
  const color = result === "correct" ? t.successBorder : result === "incorrect" ? t.dangerBorder : t.inputBorder;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
    "input",
    {
      value,
      onChange: (e) => setValue(e.target.value),
      placeholder: "type romaji, see hiragana...",
      autoFocus: true,
      disabled,
      style: {
        width: "100%",
        padding: "14px 18px",
        background: result === "correct" ? t.successBg : result === "incorrect" ? t.dangerBg : t.inputBg,
        color: t.text,
        border: `1px solid ${color}`,
        borderRadius: 14,
        fontSize: 15,
        fontFamily: t.fontMono,
        outline: "none",
        marginBottom: 8
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: {
    padding: "14px 18px",
    background: t.surfaceSunken,
    border: `1px dashed ${t.surfaceBorder}`,
    borderRadius: 14,
    minHeight: 52,
    fontFamily: "'Noto Sans JP', sans-serif",
    fontSize: 24,
    fontWeight: 500,
    color: preview ? t.text : t.textFaint
  } }, preview || /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontStyle: "italic", fontFamily: "inherit" } }, "\u2192 kana preview")));
}
Object.assign(window, {
  KanjiScreen,
  ForecastStrip,
  DataPanel,
  MistakeBanner,
  HiraganaWriteInput
});
function AudioDebug({ t, voiceState, voiceRef, speechLog, doSpeak }) {
  const [open, setOpen] = useS2(false);
  const [allVoices, setAllVoices] = useS2([]);
  const [selectedVoiceName, setSelectedVoiceName] = useS2(null);
  useE2(() => {
    if (!open || !window.speechSynthesis) return;
    const refresh = () => setAllVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener?.("voiceschanged", refresh);
    const poll = setInterval(refresh, 500);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", refresh);
      clearInterval(poll);
    };
  }, [open]);
  const jaVoices = allVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("ja"));
  const curVoice = voiceRef.current;
  const pickVoice = (name) => {
    const v = allVoices.find((x) => x.name === name);
    if (v) {
      voiceRef.current = v;
      setSelectedVoiceName(name);
    }
  };
  const testUtterance = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.85;
    u.volume = 1;
    if (voiceRef.current) u.voice = voiceRef.current;
    window.speechSynthesis.speak(u);
  };
  if (!open) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn resp-audio-debug-btn",
        onClick: () => setOpen(true),
        style: {
          position: "fixed",
          bottom: 20,
          left: 20,
          zIndex: 100,
          padding: "8px 14px",
          borderRadius: 999,
          background: voiceState.hasJapanese ? t.btnGhost : t.dangerBg,
          color: voiceState.hasJapanese ? t.textMuted : t.danger,
          border: `1px solid ${voiceState.hasJapanese ? t.btnGhostBorder : t.dangerBorder}`,
          fontSize: 11,
          fontFamily: t.fontMono,
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: "uppercase"
        }
      },
      "\u266A Audio ",
      voiceState.hasJapanese ? "debug" : "issue"
    );
  }
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    bottom: 20,
    left: 20,
    zIndex: 100,
    width: 420,
    padding: 18,
    background: t.surfaceBg,
    border: `1px solid ${t.surfaceBorder}`,
    borderRadius: 16,
    boxShadow: t.shadowFloating,
    maxHeight: "70vh",
    overflow: "auto"
  }, className: "resp-audio-debug" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: t.text, fontFamily: t.fontUi, letterSpacing: -0.3 } }, "Audio debug"), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase" } }, "Test speech synthesis")), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      onClick: () => setOpen(false),
      style: { width: 26, height: 26, borderRadius: 6, background: t.btnGhost, color: t.textMuted, fontSize: 14 }
    },
    "\xD7"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12, fontSize: 11, fontFamily: t.fontMono } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 10px", background: t.surfaceSunken, borderRadius: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint } }, "synth:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: window.speechSynthesis ? t.success : t.danger, fontWeight: 600 } }, window.speechSynthesis ? "available" : "MISSING")), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 10px", background: t.surfaceSunken, borderRadius: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint } }, "voices:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: t.text, fontWeight: 600 } }, allVoices.length)), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 10px", background: t.surfaceSunken, borderRadius: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint } }, "JP voices:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: jaVoices.length ? t.success : t.danger, fontWeight: 600 } }, jaVoices.length)), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 10px", background: t.surfaceSunken, borderRadius: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: t.textFaint } }, "unlocked:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: voiceState.needsUnlock ? t.warn : t.success, fontWeight: 600 } }, voiceState.needsUnlock ? "no" : "yes"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px", background: t.surfaceSunken, borderRadius: 8, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 4 } }, "Current voice"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: curVoice ? t.text : t.textFaint, fontFamily: t.fontMono } }, curVoice ? `${curVoice.name} (${curVoice.lang})` : "\u2014 none picked \u2014")), jaVoices.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 } }, "Pick JP voice"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, jaVoices.map((v) => {
    const on = curVoice?.name === v.name;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: v.name,
        className: "btn",
        onClick: () => pickVoice(v.name),
        style: {
          padding: "8px 12px",
          borderRadius: 8,
          textAlign: "left",
          background: on ? t.accent : t.btnGhost,
          color: on ? t.onAccent : t.text,
          border: `1px solid ${on ? t.accent : t.btnGhostBorder}`,
          fontSize: 11,
          fontFamily: t.fontMono
        }
      },
      v.name,
      " ",
      /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.7 } }, "\xB7 ", v.lang)
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 } }, "Test speech"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 } }, ["\u3053\u3093\u306B\u3061\u306F", "\u3042\u308A\u304C\u3068\u3046", "\u6C34", "hello"].map((txt) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: txt,
      className: "btn",
      onClick: () => testUtterance(txt),
      style: {
        padding: "8px 12px",
        borderRadius: 8,
        background: t.accent,
        color: t.onAccent,
        fontSize: 12,
        fontFamily: t.fontJp,
        fontWeight: 500
      }
    },
    "\u266A ",
    txt
  ))), /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 } }, "Log"), /* @__PURE__ */ React.createElement("div", { style: {
    padding: "8px 10px",
    background: "#0a0a0a",
    color: "#9ae6b4",
    borderRadius: 6,
    fontSize: 10,
    fontFamily: "'JetBrains Mono', monospace",
    maxHeight: 140,
    overflow: "auto",
    lineHeight: 1.6
  } }, speechLog.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { opacity: 0.5 } }, "\u2014 no events yet \u2014") : speechLog.map((e, i) => /* @__PURE__ */ React.createElement("div", { key: i }, /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.5 } }, e.t), " ", e.msg))), !jaVoices.length && /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 8,
    background: t.dangerBg,
    color: t.danger,
    border: `1px solid ${t.dangerBorder}`,
    fontSize: 11,
    lineHeight: 1.5
  } }, /* @__PURE__ */ React.createElement("strong", null, "No Japanese voice installed."), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.9 } }, '\u2022 macOS: System Settings \u2192 Accessibility \u2192 Spoken Content \u2192 System Voice \u2192 Manage Voices \u2192 install "Kyoko" or "Otoya"', /* @__PURE__ */ React.createElement("br", null), "\u2022 Windows: Settings \u2192 Time & Language \u2192 Language \u2192 Add Japanese", /* @__PURE__ */ React.createElement("br", null), "\u2022 Or try Chrome / Edge \u2014 they ship cloud voices")));
}
window.AudioDebug = AudioDebug;
})();
