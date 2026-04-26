// ═══════════════════════════════════════════════════════════════════════
//  THEME — Need DS base + Japanese crimson accent
//  Semantic tokens: white/gray surfaces, near-black ink, blue-gray halo
//  shadows, 12/16/24 radii. Crimson accent kept for the JP study vibe.
// ═══════════════════════════════════════════════════════════════════════

const THEME_TOKENS = {
  light: {
    // Surfaces
    appBg: "#F9F9FA",          // --base-secondary
    surfaceBg: "#FFFFFF",       // --base-primary, cards
    surfaceSunken: "#F2F2F5",   // --base-tertiary
    raisedBg: "#FFFFFF",
    surfaceBorder: "#EAEAEB",   // --gray-150
    surfaceBorderStrong: "#DDDDDF", // --gray-200
    // Text
    text: "#111212",            // --contents-strong
    textPrimary: "#2A2B2D",     // --contents-primary
    textMuted: "#5B5D62",       // --contents-secondary
    textFaint: "#8E8F95",       // --contents-tertiary
    textDisabled: "#C2C3C6",    // --contents-disabled
    // Buttons
    btnGhost: "#F2F2F5",
    btnGhostText: "#5B5D62",
    btnGhostBorder: "#EAEAEB",
    // Inputs
    inputBg: "#F9F9FA",
    inputBorder: "#DDDDDF",
    // Progress
    progressTrack: "#EAEAEB",
    tabInactive: "#F2F2F5",
    tabInactiveText: "#74767C",
    separatorText: "#C2C3C6",
    // Card faces
    cardFront: "#FFFFFF",
    cardFrontBorder: "#EAEAEB",
    cardFrontChar: "#111212",
    // Streak tag
    streakBg: "#FFF5F0",
    streakBorder: "#FFC4A4",
    streakText: "#B85B31",
    // Shadows — blue-gray halo
    shadowCard: "0 0 8px 0 rgba(34, 62, 119, 0.08)",
    shadowElevated: "0 0 8px 0 rgba(34, 62, 119, 0.14)",
    shadowFloating: "0 0 16px 0 rgba(34, 62, 119, 0.12)",
    // Heatmap (crimson ramp tuned for light)
    heatmap: ["#F2F2F5", "#F5CFC9", "#E89084", "#D05040", "#8B1810"],
    // Semantic colors
    success: "#12BF6E",         // leaf-1100
    successBg: "rgba(18, 191, 110, 0.10)",
    successBorder: "rgba(18, 191, 110, 0.30)",
    danger: "#F50000",
    dangerBg: "rgba(245, 0, 0, 0.08)",
    dangerBorder: "rgba(245, 0, 0, 0.25)",
    warn: "#E17949",
    warnBg: "rgba(225, 121, 73, 0.10)",
    warnBorder: "rgba(225, 121, 73, 0.30)",
    info: "#47CBFF",
  },
  dark: {
    appBg: "#0B0B0D",
    surfaceBg: "#151517",
    surfaceSunken: "#1E1E22",
    raisedBg: "#1E1E22",
    surfaceBorder: "#2A2B2D",
    surfaceBorderStrong: "#3A3B3F",
    text: "#F9F9FA",
    textPrimary: "#EAEAEB",
    textMuted: "#A8A9AE",
    textFaint: "#74767C",
    textDisabled: "#5B5D62",
    btnGhost: "#1E1E22",
    btnGhostText: "#A8A9AE",
    btnGhostBorder: "#2A2B2D",
    inputBg: "#1E1E22",
    inputBorder: "#3A3B3F",
    progressTrack: "#2A2B2D",
    tabInactive: "#1E1E22",
    tabInactiveText: "#8E8F95",
    separatorText: "#5B5D62",
    cardFront: "#1E1E22",
    cardFrontBorder: "#2A2B2D",
    cardFrontChar: "#F9F9FA",
    streakBg: "rgba(255, 157, 104, 0.12)",
    streakBorder: "rgba(255, 157, 104, 0.30)",
    streakText: "#FFC4A4",
    shadowCard: "0 0 8px 0 rgba(0, 0, 0, 0.35)",
    shadowElevated: "0 0 8px 0 rgba(0, 0, 0, 0.45)",
    shadowFloating: "0 0 16px 0 rgba(0, 0, 0, 0.5)",
    heatmap: ["#1E1E22", "#4A1F1B", "#7A2A24", "#B03A2E", "#E74C3C"],
    success: "#38E094",
    successBg: "rgba(56, 224, 148, 0.14)",
    successBorder: "rgba(56, 224, 148, 0.40)",
    danger: "#FF6B6B",
    dangerBg: "rgba(255, 107, 107, 0.14)",
    dangerBorder: "rgba(255, 107, 107, 0.40)",
    warn: "#FFC4A4",
    warnBg: "rgba(255, 196, 164, 0.14)",
    warnBorder: "rgba(255, 196, 164, 0.40)",
    info: "#91E0FF",
  },
};

// Accent presets — crimson by default (Japanese-feeling),
// plus the Need leaf and a couple extras.
const ACCENT_PRESETS = {
  crimson: { name: "Crimson", color: "#C0392B", onAccent: "#FFFFFF" },
  sumi:    { name: "Sumi",    color: "#2A2B2D", onAccent: "#FFFFFF" },
  leaf:    { name: "Leaf",    color: "#12BF6E", onAccent: "#FFFFFF" },
  indigo:  { name: "Indigo",  color: "#4F46E5", onAccent: "#FFFFFF" },
  sakura:  { name: "Sakura",  color: "#E879A4", onAccent: "#FFFFFF" },
};

// Font presets — Noto Sans JP default (balanced, readable),
// Noto Serif JP for editorial, Shippori Mincho for brush/display.
const FONT_PRESETS = {
  sans:  { name: "Sans",   body: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
                            jp:   "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
                            ui:   "'Inter', 'Noto Sans JP', system-ui, sans-serif" },
  serif: { name: "Serif",  body: "'Noto Sans JP', sans-serif",
                            jp:   "'Noto Serif JP', 'Hiragino Mincho ProN', serif",
                            ui:   "'Inter', system-ui, sans-serif" },
  brush: { name: "Brush",  body: "'Noto Sans JP', sans-serif",
                            jp:   "'Shippori Mincho', 'Noto Serif JP', serif",
                            ui:   "'Inter', system-ui, sans-serif" },
};

const buildTheme = (opts) => {
  const { darkMode, accent, fonts } = opts;
  const base = darkMode ? THEME_TOKENS.dark : THEME_TOKENS.light;
  const a = ACCENT_PRESETS[accent] || ACCENT_PRESETS.crimson;
  const f = FONT_PRESETS[fonts] || FONT_PRESETS.sans;
  return {
    ...base,
    color: a.color,       // brand accent
    accent: a.color,
    onAccent: a.onAccent,
    fontUi: f.ui,
    fontBody: f.body,
    fontJp: f.jp,
    fontMono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
  };
};

Object.assign(window, { buildTheme, ACCENT_PRESETS, FONT_PRESETS });
