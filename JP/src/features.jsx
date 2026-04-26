// ═══════════════════════════════════════════════════════════════════════
//  NEW SCREENS — Kanji browser, Mistake queue, SRS forecast, Onboarding
//  NEW MODES — Conjugation drill, Cloze, Speed round
//  These compose into the existing App via window.* exports.
// ═══════════════════════════════════════════════════════════════════════
const { useState: useS2, useMemo: useM2, useEffect: useE2 } = React;

// ── Kanji screen ────────────────────────────────────────────────────────
function KanjiScreen(p) {
  const { t, speakForce } = p;
  const [selected, setSelected] = useS2(null);
  const [filter, setFilter] = useS2("");

  const list = useM2(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return window.KANJI_DATA;
    return window.KANJI_DATA.filter(k =>
      k.char.includes(f) ||
      k.meaning.toLowerCase().includes(f) ||
      k.on.some(r => r.toLowerCase().includes(f)) ||
      k.kun.some(r => r.toLowerCase().includes(f))
    );
  }, [filter]);

  const cur = selected || list[0];

  return (
    <div className="fade-up" style={{ maxWidth: 1080, margin: "0 auto", paddingTop: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <window.Eyebrow t={t} accent>Kanji · 漢字</window.Eyebrow>
        <h1 className="resp-screen-title" style={{ fontWeight: 800, letterSpacing: -1.2, color: t.text, margin: "6px 0", fontFamily: t.fontUi }}>
          {window.KANJI_DATA.length} essential characters
        </h1>
        <p style={{ color: t.textMuted, fontSize: 14, margin: 0 }}>
          Tap any character for readings (on'yomi / kun'yomi), meaning, and example compounds.
        </p>
      </div>

      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter by character, meaning, or reading..."
        style={{
          width: "100%", padding: "12px 16px",
          background: t.inputBg, color: t.text,
          border: `1px solid ${t.inputBorder}`,
          borderRadius: 12, fontSize: 14, marginBottom: 16, outline: "none",
          fontFamily: t.fontUi,
        }}
      />

      <div className="resp-grid-kanji">
        {/* Grid */}
        <div className="surface-raised" style={{ padding: 14, maxHeight: 560, overflow: "auto" }}>
          <div className="resp-kanji-grid-6">
            {list.map(k => {
              const on = cur?.char === k.char;
              return (
                <button key={k.char} className="btn" onClick={() => setSelected(k)}
                  style={{
                    aspectRatio: "1", borderRadius: 10,
                    background: on ? t.accent : "transparent",
                    color: on ? t.onAccent : t.text,
                    fontFamily: t.fontJp, fontSize: 26, fontWeight: 500,
                    border: on ? "none" : `1px solid ${t.surfaceBorder}`,
                    transition: "transform 0.12s ease",
                  }}>
                  {k.char}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        {cur && (
          <div className="surface-raised" style={{ padding: "24px 20px" }} key={cur.char}>
            <div className="fade-up resp-kanji-detail">
              <div style={{
                width: 140, height: 140, flexShrink: 0,
                background: t.surfaceSunken, borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${t.surfaceBorder}`,
              }}>
                <div className="jp" style={{ fontSize: 96, fontWeight: 500, color: t.text, lineHeight: 1 }}>
                  {cur.char}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <window.Pill t={t} tone="accent" size="sm" style={{ marginBottom: 6 }}>{cur.strokes} strokes</window.Pill>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.text, fontFamily: t.fontUi, letterSpacing: -0.4, marginTop: 6, textTransform: "capitalize" }}>
                  {cur.meaning}
                </div>
                <button className="btn" onClick={() => speakForce(cur.char)}
                  style={{ marginTop: 10, padding: "6px 12px", background: `${t.accent}14`, color: t.accent, borderRadius: 999, fontSize: 12, fontFamily: t.fontMono }}>
                  ♪ Play
                </button>
              </div>
            </div>

            <div className="resp-kanji-readings">
              <div style={{ padding: "10px 14px", background: t.surfaceSunken, borderRadius: 10 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 }}>On'yomi (音読み)</div>
                <div className="jp" style={{ fontSize: 17, color: t.text, fontWeight: 500 }}>
                  {cur.on.length ? cur.on.join("・") : <span style={{ color: t.textFaint }}>—</span>}
                </div>
              </div>
              <div style={{ padding: "10px 14px", background: t.surfaceSunken, borderRadius: 10 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 }}>Kun'yomi (訓読み)</div>
                <div className="jp" style={{ fontSize: 17, color: t.text, fontWeight: 500 }}>
                  {cur.kun.length ? cur.kun.join("・") : <span style={{ color: t.textFaint }}>—</span>}
                </div>
              </div>
            </div>

            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 8 }}>Examples</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cur.examples.map((ex, i) => (
                  <button key={i} className="btn" onClick={() => speakForce(ex.w)}
                    style={{
                      display: "flex", alignItems: "baseline", gap: 14, padding: "10px 14px",
                      background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10,
                      textAlign: "left",
                    }}>
                    <span className="jp" style={{ fontSize: 22, color: t.text, fontWeight: 500, minWidth: 70 }}>{ex.w}</span>
                    <span className="mono" style={{ fontSize: 12, color: t.textMuted, minWidth: 90 }}>{ex.r}</span>
                    <span style={{ fontSize: 13, color: t.textMuted, flex: 1 }}>{ex.m}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SRS forecast panel (used inside ProgressScreen alongside heatmap) ──
function ForecastStrip({ t, progress }) {
  const forecast = useM2(() => window.forecastDueByDay(progress.cardStats, 14), [progress]);
  const max = Math.max(1, ...forecast.map(f => f.count));
  return (
    <div className="surface-raised" style={{ padding: "20px 22px", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: t.textFaint, fontWeight: 600 }}>SRS forecast · next 14 days</div>
          <div style={{ fontSize: 14, color: t.text, marginTop: 4, fontFamily: t.fontUi, fontWeight: 600 }}>
            {forecast.reduce((s, f) => s + f.count, 0)} reviews scheduled
          </div>
        </div>
      </div>
      <div className="resp-forecast-14">
        {forecast.map((f, i) => {
          const h = (f.count / max) * 100;
          const isToday = i === 0;
          return (
            <div key={i} title={`${f.date.toLocaleDateString()}: ${f.count} cards`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "end", width: "100%" }}>
                <div style={{
                  width: "100%", height: `${Math.max(h, f.count ? 6 : 2)}%`,
                  background: isToday ? t.accent : f.count ? `${t.accent}66` : t.progressTrack,
                  borderRadius: 4,
                  transition: "height 0.4s",
                }} />
              </div>
              <div className="mono" style={{ fontSize: 9, color: isToday ? t.accent : t.textFaint, fontWeight: isToday ? 700 : 400 }}>
                {isToday ? "TODAY" : f.date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Data management: import/export progress ────────────────────────────
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
      setProgress(parsed);
      setStatus({ ok: true, msg: "Progress imported." });
    } catch (err) {
      setStatus({ ok: false, msg: "Import failed. Not a valid progress file." });
    }
  };
  const reset = () => {
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    setProgress(window.emptyProgress());
    setStatus({ ok: true, msg: "Progress reset." });
  };
  return (
    <div className="surface-raised" style={{ padding: "20px 22px" }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: t.textFaint, fontWeight: 600, marginBottom: 10 }}>
        Data
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn" onClick={exportData}
          style={{ padding: "10px 16px", background: t.btnGhost, color: t.text, borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi, border: `1px solid ${t.btnGhostBorder}` }}>
          ↓ Export JSON
        </button>
        <label className="btn" style={{
          padding: "10px 16px", background: t.btnGhost, color: t.text, borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi, border: `1px solid ${t.btnGhostBorder}`, cursor: "pointer",
        }}>
          ↑ Import JSON
          <input type="file" accept="application/json" onChange={importData} style={{ display: "none" }} />
        </label>
        <button className="btn" onClick={reset}
          style={{ padding: "10px 16px", background: t.dangerBg, color: t.danger, borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi, border: `1px solid ${t.dangerBorder}` }}>
          Reset progress
        </button>
      </div>
      {status && (
        <div className="fade-up" style={{
          marginTop: 10, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontFamily: t.fontMono,
          background: status.ok ? t.successBg : t.dangerBg,
          color: status.ok ? t.success : t.danger,
          border: `1px solid ${status.ok ? t.successBorder : t.dangerBorder}`,
        }}>
          {status.msg}
        </div>
      )}
    </div>
  );
}

// ── Mistake queue widget (for Home) ────────────────────────────────────
function MistakeBanner({ t, progress, onDrill }) {
  const q = progress.mistakeQueue || [];
  if (q.length === 0) return null;
  return (
    <div className="surface-raised fade-up" style={{
      padding: "14px 18px", marginBottom: 20,
      display: "flex", alignItems: "center", gap: 16,
      background: `linear-gradient(90deg, ${t.accent}0D, ${t.surfaceBg})`,
      borderLeft: `3px solid ${t.accent}`,
    }}>
      <div style={{ fontFamily: t.fontJp, fontSize: 32, color: t.accent, fontWeight: 500 }}>復</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: t.fontUi }}>
          {q.length} mistake{q.length === 1 ? "" : "s"} queued
        </div>
        <div style={{ fontSize: 12, color: t.textMuted }}>
          Recently missed cards — drill them while they're still wobbly.
        </div>
      </div>
      <button className="btn" onClick={onDrill}
        style={{ padding: "10px 18px", background: t.accent, color: t.onAccent, borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: t.fontUi }}>
        Drill mistakes →
      </button>
    </div>
  );
}

// ── Hiragana Write mode — typing in romaji with live kana preview ──────
function HiraganaWriteInput({ t, value, setValue, disabled, result }) {
  const preview = window.romajiToKana(value);
  const color = result === "correct" ? t.successBorder
              : result === "incorrect" ? t.dangerBorder
              : t.inputBorder;
  return (
    <div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="type romaji, see hiragana..."
        autoFocus
        disabled={disabled}
        style={{
          width: "100%", padding: "14px 18px",
          background: result === "correct" ? t.successBg : result === "incorrect" ? t.dangerBg : t.inputBg,
          color: t.text,
          border: `1px solid ${color}`,
          borderRadius: 14, fontSize: 15, fontFamily: t.fontMono,
          outline: "none", marginBottom: 8,
        }}
      />
      <div style={{
        padding: "14px 18px",
        background: t.surfaceSunken, border: `1px dashed ${t.surfaceBorder}`,
        borderRadius: 14, minHeight: 52,
        fontFamily: "'Noto Sans JP', sans-serif", fontSize: 24, fontWeight: 500,
        color: preview ? t.text : t.textFaint,
      }}>
        {preview || <span style={{ fontSize: 13, fontStyle: "italic", fontFamily: "inherit" }}>→ kana preview</span>}
      </div>
    </div>
  );
}

Object.assign(window, {
  KanjiScreen, ForecastStrip, DataPanel, MistakeBanner, HiraganaWriteInput,
});

// ── Audio debug panel (floating bottom-left) ──────────────────────────
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

  const jaVoices = allVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith("ja"));
  const curVoice = voiceRef.current;

  const pickVoice = (name) => {
    const v = allVoices.find(x => x.name === name);
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
    return (
      <button className="btn resp-audio-debug-btn" onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 20, left: 20, zIndex: 100,
          padding: "8px 14px", borderRadius: 999,
          background: voiceState.hasJapanese ? t.btnGhost : t.dangerBg,
          color: voiceState.hasJapanese ? t.textMuted : t.danger,
          border: `1px solid ${voiceState.hasJapanese ? t.btnGhostBorder : t.dangerBorder}`,
          fontSize: 11, fontFamily: t.fontMono, fontWeight: 600,
          letterSpacing: 0.5, textTransform: "uppercase",
        }}>
        ♪ Audio {voiceState.hasJapanese ? "debug" : "issue"}
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, left: 20, zIndex: 100,
      width: 420, padding: 18,
      background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 16, boxShadow: t.shadowFloating,
      maxHeight: "70vh", overflow: "auto",
    }} className="resp-audio-debug">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: t.fontUi, letterSpacing: -0.3 }}>Audio debug</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase" }}>
            Test speech synthesis
          </div>
        </div>
        <button className="btn" onClick={() => setOpen(false)}
          style={{ width: 26, height: 26, borderRadius: 6, background: t.btnGhost, color: t.textMuted, fontSize: 14 }}>×</button>
      </div>

      {/* Status grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12, fontSize: 11, fontFamily: t.fontMono }}>
        <div style={{ padding: "6px 10px", background: t.surfaceSunken, borderRadius: 6 }}>
          <span style={{ color: t.textFaint }}>synth:</span>{" "}
          <span style={{ color: window.speechSynthesis ? t.success : t.danger, fontWeight: 600 }}>
            {window.speechSynthesis ? "available" : "MISSING"}
          </span>
        </div>
        <div style={{ padding: "6px 10px", background: t.surfaceSunken, borderRadius: 6 }}>
          <span style={{ color: t.textFaint }}>voices:</span>{" "}
          <span style={{ color: t.text, fontWeight: 600 }}>{allVoices.length}</span>
        </div>
        <div style={{ padding: "6px 10px", background: t.surfaceSunken, borderRadius: 6 }}>
          <span style={{ color: t.textFaint }}>JP voices:</span>{" "}
          <span style={{ color: jaVoices.length ? t.success : t.danger, fontWeight: 600 }}>{jaVoices.length}</span>
        </div>
        <div style={{ padding: "6px 10px", background: t.surfaceSunken, borderRadius: 6 }}>
          <span style={{ color: t.textFaint }}>unlocked:</span>{" "}
          <span style={{ color: voiceState.needsUnlock ? t.warn : t.success, fontWeight: 600 }}>
            {voiceState.needsUnlock ? "no" : "yes"}
          </span>
        </div>
      </div>

      {/* Picked voice */}
      <div style={{ padding: "10px 12px", background: t.surfaceSunken, borderRadius: 8, marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 4 }}>
          Current voice
        </div>
        <div style={{ fontSize: 12, color: curVoice ? t.text : t.textFaint, fontFamily: t.fontMono }}>
          {curVoice ? `${curVoice.name} (${curVoice.lang})` : "— none picked —"}
        </div>
      </div>

      {/* Voice picker */}
      {jaVoices.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 }}>
            Pick JP voice
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {jaVoices.map(v => {
              const on = curVoice?.name === v.name;
              return (
                <button key={v.name} className="btn" onClick={() => pickVoice(v.name)}
                  style={{
                    padding: "8px 12px", borderRadius: 8, textAlign: "left",
                    background: on ? t.accent : t.btnGhost,
                    color: on ? t.onAccent : t.text,
                    border: `1px solid ${on ? t.accent : t.btnGhostBorder}`,
                    fontSize: 11, fontFamily: t.fontMono,
                  }}>
                  {v.name} <span style={{ opacity: 0.7 }}>· {v.lang}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Test buttons */}
      <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 }}>
        Test speech
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {["こんにちは", "ありがとう", "水", "hello"].map(txt => (
          <button key={txt} className="btn" onClick={() => testUtterance(txt)}
            style={{
              padding: "8px 12px", borderRadius: 8,
              background: t.accent, color: t.onAccent,
              fontSize: 12, fontFamily: t.fontJp, fontWeight: 500,
            }}>
            ♪ {txt}
          </button>
        ))}
      </div>

      {/* Log */}
      <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 }}>
        Log
      </div>
      <div style={{
        padding: "8px 10px", background: "#0a0a0a", color: "#9ae6b4",
        borderRadius: 6, fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
        maxHeight: 140, overflow: "auto", lineHeight: 1.6,
      }}>
        {speechLog.length === 0 ? (
          <div style={{ opacity: 0.5 }}>— no events yet —</div>
        ) : speechLog.map((e, i) => (
          <div key={i}>
            <span style={{ opacity: 0.5 }}>{e.t}</span> {e.msg}
          </div>
        ))}
      </div>

      {/* Platform hints */}
      {!jaVoices.length && (
        <div style={{
          marginTop: 12, padding: "10px 12px", borderRadius: 8,
          background: t.dangerBg, color: t.danger, border: `1px solid ${t.dangerBorder}`,
          fontSize: 11, lineHeight: 1.5,
        }}>
          <strong>No Japanese voice installed.</strong><br />
          <span style={{ opacity: 0.9 }}>
            • macOS: System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → install "Kyoko" or "Otoya"<br />
            • Windows: Settings → Time & Language → Language → Add Japanese<br />
            • Or try Chrome / Edge — they ship cloud voices
          </span>
        </div>
      )}
    </div>
  );
}

window.AudioDebug = AudioDebug;