// ═══════════════════════════════════════════════════════════════════════
//  Shared UI primitives — GlobalStyles, TopBar, Card, Pill, Chip, Badge
// ═══════════════════════════════════════════════════════════════════════
const { useState, useEffect, useCallback, useMemo } = React;

function GlobalStyles({ t }) {
  const css = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body, #root { margin: 0; padding: 0; min-height: 100%; background: ${t.appBg}; }
    body { font-family: ${t.fontBody}; color: ${t.textPrimary}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    button { font-family: inherit; }
    input, textarea { font-family: inherit; }
    kbd {
      font-family: ${t.fontMono};
      font-size: 11px;
      background: ${t.btnGhost};
      color: ${t.textMuted};
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid ${t.btnGhostBorder};
    }
    .btn {
      cursor: pointer; border: none; background: none; padding: 0;
      transition: background 0.18s ease, color 0.18s ease, transform 0.12s ease, border-color 0.18s ease;
    }
    .btn:hover:not(:disabled) { filter: brightness(0.97); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; border-radius: 8px; }
    .jp { font-family: ${t.fontJp}; }
    .mono { font-family: ${t.fontMono}; }
    .ui { font-family: ${t.fontUi}; }

    .surface { background: ${t.surfaceBg}; border: 1px solid ${t.surfaceBorder}; border-radius: 12px; }
    .surface-raised { background: ${t.surfaceBg}; border: 1px solid ${t.surfaceBorder}; border-radius: 12px; box-shadow: ${t.shadowCard}; }
    .surface-sunken { background: ${t.surfaceSunken}; border-radius: 12px; }

    .flip-card { perspective: 1200px; cursor: pointer; }
    .flip-inner { transition: transform 0.5s cubic-bezier(.2,.7,.2,1); transform-style: preserve-3d; position: relative; }
    .flip-inner.flipped { transform: rotateY(180deg); }
    .flip-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; position: absolute; inset: 0; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px; text-align: center; }
    .flip-back { transform: rotateY(180deg); }

    .token {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 10px 14px; border-radius: 12px;
      background: ${t.surfaceBg}; border: 1px solid ${t.surfaceBorder};
      font-family: ${t.fontJp}; font-size: 20px; font-weight: 500;
      color: ${t.text};
      cursor: pointer; user-select: none;
      transition: transform 0.12s ease, background 0.18s, border-color 0.18s;
    }
    .token:hover:not(.placed):not(:disabled) { transform: translateY(-2px); background: ${t.accent}14; border-color: ${t.accent}; }
    .token.placed { opacity: 0.32; cursor: default; }

    .opt-btn {
      width: 100%; padding: 14px 16px; border-radius: 12px;
      font-size: 15px; text-align: left;
      background: ${t.surfaceBg}; color: ${t.text};
      border: 1px solid ${t.surfaceBorder};
      cursor: pointer; transition: all 0.18s;
      font-family: ${t.fontBody};
    }
    .opt-btn:hover:not(:disabled) { background: ${t.surfaceSunken}; border-color: ${t.surfaceBorderStrong}; }
    .opt-btn.correct { background: ${t.successBg}; color: ${t.success}; border-color: ${t.successBorder}; }
    .opt-btn.incorrect { background: ${t.dangerBg}; color: ${t.danger}; border-color: ${t.dangerBorder}; }

    .heat-cell { border-radius: 3px; transition: transform 0.15s; cursor: pointer; }
    .heat-cell:hover { transform: scale(1.5); z-index: 1; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .fade-up { animation: fadeUp 0.32s cubic-bezier(.2,.7,.2,1) both; }

    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

    .kcell { cursor: pointer; padding: 6px 2px; text-align: center; border-radius: 8px; transition: background 0.15s; }
    .kcell:hover { background: ${t.accent}14; }

    /* scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${t.surfaceBorderStrong}; border-radius: 4px; }

    /* ───────── Responsive helpers ───────── */
    .resp-grid-12 { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
    .resp-grid-21 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; }
    .resp-grid-11 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .resp-grid-kanji { display: grid; grid-template-columns: 1fr 1.4fr; gap: 20px; }
    .resp-stats-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .resp-stats-22 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .resp-modes-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
    .resp-cats-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .resp-heat-12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; }
    .resp-forecast-14 { display: grid; grid-template-columns: repeat(14, 1fr); gap: 4px; align-items: end; height: 100px; }
    .resp-kanji-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
    .resp-kanji-detail { display: flex; gap: 20px; margin-bottom: 22px; }
    .resp-kanji-readings { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
    .resp-kana-table { display: grid; grid-template-columns: 40px repeat(5, 1fr); gap: 4px; }
    .resp-rating-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .resp-finish-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .resp-topbar-inner {
      max-width: 1080px; margin: 0 auto; padding: 14px 20px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .resp-tabs { display: flex; gap: 4px; background: ${t.surfaceSunken}; padding: 4px; border-radius: 12px; }
    .resp-main-pad { padding: 0 20px 80px; }
    .resp-hide-mobile { display: initial; }
    .resp-show-mobile { display: none; }
    .resp-hero-kanji { font-size: 220px; right: -20px; bottom: -40px; }
    .resp-hero-title { font-size: 36px; }
    .resp-screen-title { font-size: 36px; }

    /* Phones (< 720px) */
    @media (max-width: 720px) {
      .resp-main-pad { padding: 0 14px 80px; }

      .resp-grid-12, .resp-grid-21, .resp-grid-11, .resp-grid-kanji {
        grid-template-columns: 1fr; gap: 16px;
      }
      .resp-stats-4 { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .resp-stats-22 { gap: 8px; }
      .resp-modes-5 { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .resp-cats-2 { grid-template-columns: 1fr; }
      .resp-kanji-grid-6 { grid-template-columns: repeat(5, 1fr); }
      .resp-kanji-detail { flex-direction: column; gap: 14px; }
      .resp-kanji-readings { grid-template-columns: 1fr; gap: 8px; }
      .resp-kana-table { grid-template-columns: 28px repeat(5, 1fr); gap: 2px; }
      .resp-rating-4 { grid-template-columns: repeat(2, 1fr); }
      .resp-finish-3 { grid-template-columns: repeat(3, 1fr); gap: 8px; }

      .resp-topbar-inner { padding: 10px 14px; gap: 10px; flex-wrap: wrap; }
      .resp-tabs {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        flex-wrap: nowrap;
        order: 3;
      }
      .resp-tabs::-webkit-scrollbar { display: none; }
      .resp-tabs button { flex-shrink: 0; }

      .resp-hide-mobile { display: none !important; }
      .resp-show-mobile { display: initial; }

      .resp-hero-title { font-size: 26px !important; letter-spacing: -0.8px !important; }
      .resp-screen-title { font-size: 26px !important; letter-spacing: -0.6px !important; }
      .resp-hero-kanji { font-size: 140px !important; right: -10px !important; bottom: -20px !important; }

      .flip-face { padding: 18px !important; border-radius: 14px !important; }

      /* iOS input zoom fix: at least 16px */
      input, textarea, select { font-size: 16px !important; }

      /* Heatmap shrink */
      .resp-heat-12 { gap: 2px; }
      .resp-forecast-14 { gap: 2px; height: 80px; }

      /* Tweaks panel full-width on mobile */
      .resp-tweaks-panel {
        left: 10px !important; right: 10px !important; bottom: 10px !important;
        width: auto !important;
      }
      .resp-audio-debug {
        left: 10px !important; right: 10px !important; bottom: 10px !important;
        width: auto !important;
      }
      .resp-audio-debug-btn { bottom: 12px !important; left: 12px !important; }
    }

    /* Very narrow (< 400px): even smaller kanji grid */
    @media (max-width: 400px) {
      .resp-kanji-grid-6 { grid-template-columns: repeat(4, 1fr); }
      .resp-modes-5 { grid-template-columns: 1fr; }
    }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

// ── Top bar ─────────────────────────────────────────────────────────────
function TopBar({ t, screen, setScreen, darkMode, setDarkMode, voiceOn, setVoiceOn, score, idx, deck, finished }) {
  const inStudy = screen === "study" && !finished && deck?.length > 0;
  const tabs = [
    { id: "home",     label: "Study" },
    { id: "kana",     label: "Kana" },
    { id: "kanji",    label: "Kanji" },
    { id: "grammar",  label: "Grammar" },
    { id: "progress", label: "Progress" },
  ];
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: `${t.appBg}F0`,
      backdropFilter: "saturate(1.1) blur(10px)",
      WebkitBackdropFilter: "saturate(1.1) blur(10px)",
      borderBottom: `1px solid ${t.surfaceBorder}`,
    }}>
      <div className="resp-topbar-inner">
        {/* Wordmark */}
        <button className="btn" onClick={() => setScreen("home")}
          style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: t.accent, color: t.onAccent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: t.fontJp, fontWeight: 700, fontSize: 17,
            boxShadow: t.shadowCard,
          }}>日</div>
          <div style={{ textAlign: "left", lineHeight: 1.1 }} className="resp-hide-mobile">
            <div style={{ fontFamily: t.fontUi, fontWeight: 700, fontSize: 15, color: t.text, letterSpacing: -0.2 }}>Nihongo</div>
            <div className="mono" style={{ fontSize: 10, color: t.textFaint, letterSpacing: 1 }}>STUDY · 学習</div>
          </div>
        </button>

        {/* Tabs */}
        {!inStudy && (
          <nav className="resp-tabs">
            {tabs.map(tab => {
              const active = screen === tab.id || (tab.id === "home" && screen === "study");
              return (
                <button key={tab.id} className="btn" onClick={() => setScreen(tab.id)}
                  style={{
                    padding: "7px 14px", borderRadius: 8,
                    fontSize: 13, fontWeight: 600,
                    fontFamily: t.fontUi,
                    background: active ? t.surfaceBg : "transparent",
                    color: active ? t.text : t.textMuted,
                    boxShadow: active ? t.shadowCard : "none",
                  }}>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Study HUD */}
        {inStudy && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => setScreen("home")}
              style={{ padding: "7px 12px", borderRadius: 10, background: t.btnGhost, color: t.textMuted, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi }}>
              ← Exit
            </button>
            <div className="mono" style={{ fontSize: 13, color: t.textMuted }}>
              <span style={{ color: t.accent, fontWeight: 700 }}>{idx + 1}</span>
              <span style={{ color: t.textFaint }}> / {deck.length}</span>
            </div>
            <div style={{ display: "flex", gap: 8, fontFamily: t.fontMono, fontSize: 13 }}>
              <span style={{ color: t.success }}>✓ {score.correct}</span>
              <span style={{ color: t.danger }}>✗ {score.incorrect}</span>
            </div>
          </div>
        )}

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="btn" onClick={() => window.openSearch && window.openSearch()}
            title="Search cards & kanji (press /)"
            aria-label="Search"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: t.btnGhost, color: t.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15,
            }}>
            🔍
          </button>
          <button className="btn" onClick={() => setVoiceOn(!voiceOn)}
            title={voiceOn ? "Mute" : "Unmute"}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: voiceOn ? `${t.accent}14` : t.btnGhost,
              color: voiceOn ? t.accent : t.textFaint,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15,
            }}>
            {voiceOn ? "🔊" : "🔇"}
          </button>
          <button className="btn" onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Light mode" : "Dark mode"}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: t.btnGhost, color: t.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15,
            }}>
            {darkMode ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Small reusable bits ─────────────────────────────────────────────────
function Eyebrow({ t, children, accent }) {
  return (
    <div className="mono" style={{
      fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
      color: accent ? t.accent : t.textFaint,
      fontWeight: 600,
    }}>
      {children}
    </div>
  );
}

function Pill({ t, children, tone = "default", size = "md", style }) {
  const tones = {
    default: { bg: t.btnGhost, fg: t.textMuted, bd: t.btnGhostBorder },
    accent:  { bg: `${t.accent}14`, fg: t.accent, bd: `${t.accent}40` },
    success: { bg: t.successBg, fg: t.success, bd: t.successBorder },
    warn:    { bg: t.warnBg, fg: t.warn, bd: t.warnBorder },
    danger:  { bg: t.dangerBg, fg: t.danger, bd: t.dangerBorder },
  }[tone];
  const sizes = { sm: { p: "3px 8px", fs: 10 }, md: { p: "4px 10px", fs: 11 } }[size];
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: sizes.p, borderRadius: 999,
      background: tones.bg, color: tones.fg,
      border: `1px solid ${tones.bd}`,
      fontSize: sizes.fs, fontWeight: 600, letterSpacing: 0.5,
      textTransform: "uppercase",
      ...style,
    }}>
      {children}
    </span>
  );
}

function StatTile({ t, label, value, sub, tone = "accent" }) {
  const toneColor = tone === "success" ? t.success : tone === "warn" ? t.warn : t.accent;
  return (
    <div className="surface-raised" style={{ padding: "16px 18px" }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 30, fontWeight: 800, lineHeight: 1,
        color: toneColor, letterSpacing: -1,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function PrimaryButton({ t, onClick, disabled, children, style }) {
  return (
    <button className="btn" onClick={onClick} disabled={disabled}
      style={{
        background: t.accent, color: t.onAccent,
        padding: "14px 28px", borderRadius: 16,
        fontSize: 15, fontWeight: 700,
        fontFamily: t.fontUi, letterSpacing: -0.2,
        boxShadow: `0 4px 20px ${t.accent}33`,
        ...style,
      }}>
      {children}
    </button>
  );
}

function SecondaryButton({ t, onClick, children, style }) {
  return (
    <button className="btn" onClick={onClick}
      style={{
        background: t.btnGhost, color: t.text,
        padding: "13px 22px", borderRadius: 16,
        fontSize: 14, fontWeight: 600,
        fontFamily: t.fontUi,
        border: `1px solid ${t.btnGhostBorder}`,
        ...style,
      }}>
      {children}
    </button>
  );
}

function RomanjiLabel({ t, text, position, onClick }) {
  if (position === "hidden" || !text) return null;
  return (
    <div className="mono" onClick={onClick} style={{
      fontSize: 13, color: t.textMuted, letterSpacing: 0.5, userSelect: "text",
    }}>
      {text}
    </div>
  );
}

Object.assign(window, {
  GlobalStyles, TopBar, Eyebrow, Pill, StatTile,
  PrimaryButton, SecondaryButton, RomanjiLabel,
});
