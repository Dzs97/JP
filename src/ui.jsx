// ═══════════════════════════════════════════════════════════════════════
//  Shared UI primitives — GlobalStyles, AppShell, Icon, Pill, StatTile, buttons
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
    /* ───────── App shell: sidebar rail (desktop) / header + tab bar (mobile) ───────── */
    .shell { display: grid; grid-template-columns: 232px minmax(0, 1fr); min-height: 100vh; }
    .rail {
      position: sticky; top: 0; height: 100vh; overflow-y: auto;
      display: flex; flex-direction: column; gap: 22px;
      padding: 22px 14px 18px;
      background: ${t.surfaceSunken};
      border-right: 1px solid ${t.surfaceBorder};
    }
    .rail-brand { display: flex; align-items: center; gap: 12px; padding: 2px 6px; text-align: left; }
    .rail-brand-text { display: flex; flex-direction: column; line-height: 1.15; }
    .rail-brand-text b { font-family: ${t.fontUi}; font-size: 15px; font-weight: 700; color: ${t.text}; letter-spacing: -0.2px; }
    .rail-brand-text small { font-family: ${t.fontMono}; font-size: 11px; color: ${t.textFaint}; letter-spacing: 1px; text-transform: uppercase; }
    .hanko {
      width: 36px; height: 36px; flex-shrink: 0; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: ${t.accent}; color: ${t.onAccent};
      font-family: ${t.fontJp}; font-weight: 700; font-size: 19px;
      box-shadow: inset 0 0 0 2px ${t.onAccent}33;
      transform: rotate(-3deg);
    }
    .rail-nav { display: flex; flex-direction: column; gap: 2px; }
    .rail-link {
      position: relative; display: flex; align-items: center; gap: 12px;
      min-height: 44px; padding: 8px 12px; border-radius: 8px;
      font-family: ${t.fontUi}; font-size: 14px; font-weight: 600; text-align: left;
      color: ${t.textMuted};
    }
    .rail-link:hover { background: ${t.surfaceBg}80; color: ${t.text}; }
    .rail-link.active { background: ${t.surfaceBg}; color: ${t.text}; box-shadow: ${t.shadowCard}; }
    .rail-link.active::before {
      content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 3px;
      border-radius: 0 3px 3px 0; background: ${t.accent};
    }
    .rail-glyph { width: 24px; text-align: center; font-family: ${t.fontJp}; font-size: 18px; font-weight: 600; }
    .rail-link.active .rail-glyph { color: ${t.accent}; }
    .rail-hud { display: flex; flex-direction: column; gap: 10px; padding: 0 6px; }
    .rail-hud-count { font-family: ${t.fontMono}; font-size: 13px; color: ${t.textMuted}; display: flex; gap: 10px; white-space: nowrap; }
    .rail-utils { order: 3; margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
    .rail-utils > .btn { width: 100%; text-align: left; }
    .rail-utils .jq-user-btn, .rail-utils .jq-sync-btn, .rail-utils .jq-furigana-btn,
    .rail-utils .resp-audio-debug-btn { position: static !important; box-shadow: none !important; }
    .rail-actions { order: 4; display: flex; gap: 6px; }
    .icon-btn {
      width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      background: ${t.surfaceBg}; color: ${t.textMuted}; border: 1px solid ${t.surfaceBorder};
    }
    .icon-btn[aria-pressed="true"] { color: ${t.accent}; border-color: ${t.accent}55; }
    .rail-more, .utils-mobile-only { display: none !important; }
    .shell-main { min-width: 0; }

    /* ───────── Chips + segmented controls (home session builder) ───────── */
    .chip {
      display: inline-flex; align-items: center; gap: 8px;
      min-height: 40px; padding: 8px 14px; border-radius: 999px;
      background: ${t.surfaceBg}; color: ${t.textPrimary};
      border: 1px solid ${t.surfaceBorder};
      font-family: ${t.fontUi}; font-size: 13px; font-weight: 600;
    }
    .chip:hover:not(:disabled) { border-color: ${t.surfaceBorderStrong}; }
    .chip.on { background: ${t.accent}; color: ${t.onAccent}; border-color: ${t.accent}; }
    .chip .chip-glyph { font-family: ${t.fontJp}; font-size: 16px; }
    .chip .chip-meta { font-family: ${t.fontMono}; font-size: 11px; opacity: 0.75; }
    .seg { display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: ${t.surfaceSunken}; border: 1px solid ${t.surfaceBorder}; }
    .seg button { min-height: 34px; padding: 4px 12px; border-radius: 8px; font-family: ${t.fontUi}; font-size: 12px; font-weight: 600; color: ${t.textMuted}; }
    .seg button[aria-pressed="true"] { background: ${t.surfaceBg}; color: ${t.text}; box-shadow: ${t.shadowCard}; }
    .builder-row { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 16px; padding: 18px 0; border-top: 1px solid ${t.surfaceBorder}; }
    .builder-row:first-of-type { border-top: 0; }
    .builder-label { font-family: ${t.fontUi}; font-size: 13px; font-weight: 700; color: ${t.text}; padding-top: 10px; }
    .builder-label small { display: block; font-family: ${t.fontJp}; font-weight: 500; font-size: 12px; color: ${t.textFaint}; margin-top: 2px; }
    .stat-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 14px 0; border-top: 1px solid ${t.surfaceBorder}; }
    .stat-row:first-child { border-top: 0; padding-top: 0; }
    .stat-row:last-child { padding-bottom: 0; }
    .resp-main-pad { padding: 0 32px 64px; }
    .resp-hide-mobile { display: initial; }
    .resp-show-mobile { display: none; }
    .resp-hero-kanji { font-size: 220px; right: -20px; bottom: -40px; }
    .resp-hero-title { font-size: 36px; }
    .resp-screen-title { font-size: 36px; }

    /* Phones (< 720px) */
    @media (max-width: 720px) {
      .shell { display: block; }
      .rail {
        position: sticky; top: 0; z-index: 50; height: auto; overflow: visible;
        flex-direction: row; align-items: center; gap: 10px;
        padding: 10px 14px; padding-top: max(10px, env(safe-area-inset-top));
        border-right: 0; border-bottom: 1px solid ${t.surfaceBorder};
      }
      .rail-brand { padding: 0; }
      .rail-nav {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 60;
        flex-direction: row; gap: 0;
        padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px));
        background: ${t.surfaceBg}; border-top: 1px solid ${t.surfaceBorder};
      }
      .rail-link { flex: 1; flex-direction: column; justify-content: center; gap: 2px; padding: 6px 2px; font-size: 11px; text-align: center; }
      .rail-link.active { box-shadow: none; background: transparent; }
      .rail-link.active::before { left: 30%; right: 30%; top: 0; bottom: auto; width: auto; height: 3px; border-radius: 0 0 3px 3px; }
      .rail-hud { flex-direction: row; align-items: center; padding: 0; flex: 1; min-width: 0; }
      .rail-actions { margin-left: auto; }
      .rail-more { display: inline-flex !important; }
      .act-hide-mobile { display: none !important; }
      .utils-mobile-only { display: flex !important; }
      .rail-utils { display: none; }
      .rail-utils.open {
        display: flex; position: fixed; top: 64px; left: 12px; right: 12px; z-index: 70;
        padding: 12px; border-radius: 12px; margin: 0;
        background: ${t.surfaceBg}; border: 1px solid ${t.surfaceBorder}; box-shadow: ${t.shadowFloating};
      }
      .resp-main-pad { padding: 0 14px calc(96px + env(safe-area-inset-bottom, 0px)); }

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

      .builder-row { grid-template-columns: 1fr; gap: 10px; padding: 16px 0; }
      .builder-label { padding-top: 0; }
      .builder-label small { display: inline; margin-left: 6px; }

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
    }

    @media (max-width: 480px) { .rail-brand-text { display: none; } }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }

    /* Very narrow (< 400px): even smaller kanji grid */
    @media (max-width: 400px) {
      .resp-kanji-grid-6 { grid-template-columns: repeat(4, 1fr); }
      .resp-modes-5 { grid-template-columns: 1fr; }
    }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

// ── Icons (inline SVG, stroke = currentColor) ──────────────────────────
const ICON_PATHS = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.35-4.35",
  volume: "M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14",
  mute: "M11 5 6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  close: "M18 6 6 18M6 6l12 12",
  back: "M15 18l-6-6 6-6",
};
function Icon({ name, size = 18, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={name === "more" ? 3 : strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// ── App shell: sidebar on desktop; header + bottom tab bar on phones ────
// `utilities` (user, sync, furigana, audio) live in the sidebar footer, or
// in the "more" sheet on phones, instead of floating over the content.
function AppShell({ t, screen, setScreen, darkMode, setDarkMode, voiceOn, setVoiceOn,
                    score, idx, deck, finished, exitTo = "home", utilities, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const inStudy = screen === "study" && !finished && deck?.length > 0;
  const tabs = [
    { id: "course",   label: "Course",   glyph: "道" },
    { id: "home",     label: "Study",    glyph: "学" },
    { id: "kana",     label: "Kana",     glyph: "あ" },
    { id: "kanji",    label: "Kanji",    glyph: "漢" },
    { id: "grammar",  label: "Grammar",  glyph: "文" },
    { id: "progress", label: "Progress", glyph: "進" },
  ];
  const go = (id) => { setScreen(id); setMenuOpen(false); };
  const voiceLabel = voiceOn ? "Mute audio" : "Unmute audio";
  const themeLabel = darkMode ? "Light mode" : "Dark mode";

  return (
    <div className="shell">
      <aside className="rail">
        <button className="btn rail-brand" onClick={() => go("course")} aria-label="Nihongo Study, course">
          <span className="hanko" aria-hidden="true">日</span>
          <span className="rail-brand-text">
            <b>Nihongo</b>
            <small>{window.getUser ? window.getUser() : "study"} · 学習</small>
          </span>
        </button>

        {inStudy ? (
          <div className="rail-hud">
            <button className="btn" onClick={() => go(exitTo)}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, minHeight: 40, padding: "0 12px",
                borderRadius: 10, background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`,
                color: t.textMuted, fontSize: 13, fontWeight: 600, fontFamily: t.fontUi, alignSelf: "flex-start" }}>
              <Icon name="back" size={16} /> Exit
            </button>
            <div className="rail-hud-count" aria-live="polite">
              <span><b style={{ color: t.accent }}>{idx + 1}</b><span style={{ color: t.textFaint }}> / {deck.length}</span></span>
              <span style={{ color: t.success }} aria-label={`${score.correct} correct`}>✓ {score.correct}</span>
              <span style={{ color: t.danger }} aria-label={`${score.incorrect} wrong`}>✗ {score.incorrect}</span>
            </div>
          </div>
        ) : (
          <nav className="rail-nav" aria-label="Main">
            {tabs.map(tab => {
              const active = screen === tab.id || (tab.id === "home" && screen === "study");
              return (
                <button key={tab.id} className={"btn rail-link" + (active ? " active" : "")}
                  aria-current={active ? "page" : undefined} onClick={() => go(tab.id)}>
                  <span className="rail-glyph" aria-hidden="true">{tab.glyph}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        <div className={"rail-utils" + (menuOpen ? " open" : "")}>
          {utilities}
          <div className="utils-mobile-only" style={{ gap: 8 }}>
            <button className="btn icon-btn" onClick={() => setVoiceOn(!voiceOn)} aria-pressed={voiceOn}
              aria-label={voiceLabel} title={voiceLabel}>
              <Icon name={voiceOn ? "volume" : "mute"} />
            </button>
            <button className="btn icon-btn" onClick={() => setDarkMode(!darkMode)} aria-label={themeLabel} title={themeLabel}>
              <Icon name={darkMode ? "sun" : "moon"} />
            </button>
          </div>
        </div>

        <div className="rail-actions">
          <button className="btn icon-btn" onClick={() => window.openSearch && window.openSearch()}
            aria-label="Search cards and kanji" title="Search cards & kanji (press /)">
            <Icon name="search" />
          </button>
          <button className="btn icon-btn act-hide-mobile" onClick={() => setVoiceOn(!voiceOn)} aria-pressed={voiceOn}
            aria-label={voiceLabel} title={voiceLabel}>
            <Icon name={voiceOn ? "volume" : "mute"} />
          </button>
          <button className="btn icon-btn act-hide-mobile" onClick={() => setDarkMode(!darkMode)}
            aria-label={themeLabel} title={themeLabel}>
            <Icon name={darkMode ? "sun" : "moon"} />
          </button>
          <button className="btn icon-btn rail-more" onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen} aria-label="More settings" title="More settings">
            <Icon name={menuOpen ? "close" : "more"} />
          </button>
        </div>
      </aside>

      <div className="shell-main">{children}</div>
    </div>
  );
}

// ── Small reusable bits ─────────────────────────────────────────────────
function Eyebrow({ t, children, accent }) {
  return (
    <div className="mono" style={{
      fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
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
      <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
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
  GlobalStyles, AppShell, Icon, Eyebrow, Pill, StatTile,
  PrimaryButton, SecondaryButton, RomanjiLabel,
});
