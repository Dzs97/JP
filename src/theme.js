// ═══════════════════════════════════════════════════════════════════════
//  THEME — Washi & Sumi
//  Warm paper surfaces, sumi-ink text, vermilion (shu) hanko accent.
//  Dark mode is "sumi night": ink-black paper, warm off-white text.
//  Muted/faint text, accent and warn are tuned for ≥4.5:1 on appBg and sunken panels.
// ═══════════════════════════════════════════════════════════════════════

const THEME_TOKENS = {
  light: {
    // Surfaces — washi paper
    appBg: "#F4EEE3",
    surfaceBg: "#FBF8F2",
    surfaceSunken: "#EDE5D6",
    raisedBg: "#FFFDF8",
    surfaceBorder: "#E0D6C4",
    surfaceBorderStrong: "#CDBFA8",
    // Text — sumi ink
    text: "#1C1A17",
    textPrimary: "#2B2723",
    textMuted: "#5E564C",
    textFaint: "#685E50",
    textDisabled: "#B5AA98",
    // Buttons
    btnGhost: "#EDE5D6",
    btnGhostText: "#5E564C",
    btnGhostBorder: "#E0D6C4",
    // Inputs
    inputBg: "#FBF8F2",
    inputBorder: "#CDBFA8",
    // Progress
    progressTrack: "#E6DCCB",
    tabInactive: "#EDE5D6",
    tabInactiveText: "#6E6456",
    separatorText: "#B5AA98",
    // Card faces
    cardFront: "#FFFDF8",
    cardFrontBorder: "#E0D6C4",
    cardFrontChar: "#1C1A17",
    // Streak tag
    streakBg: "#FBE9DF",
    streakBorder: "#EDB69C",
    streakText: "#A2401F",
    // Shadows — warm, low, paper-like
    shadowCard: "0 1px 0 rgba(60, 40, 20, 0.04), 0 2px 10px rgba(60, 40, 20, 0.06)",
    shadowElevated: "0 1px 0 rgba(60, 40, 20, 0.05), 0 6px 18px rgba(60, 40, 20, 0.10)",
    shadowFloating: "0 12px 32px rgba(40, 25, 10, 0.16)",
    // Heatmap — vermilion ramp on paper
    heatmap: ["#EDE5D6", "#F2C9B8", "#E3907A", "#C8553D", "#8E2A17"],
    // Semantic colors
    success: "#2F7D4F",        // moss
    successBg: "rgba(47, 125, 79, 0.10)",
    successBorder: "rgba(47, 125, 79, 0.30)",
    danger: "#B3261E",
    dangerBg: "rgba(179, 38, 30, 0.08)",
    dangerBorder: "rgba(179, 38, 30, 0.28)",
    warn: "#9C5418",
    warnBg: "rgba(183, 98, 27, 0.10)",
    warnBorder: "rgba(183, 98, 27, 0.30)",
    info: "#2E6F9E",           // ai (indigo dye)
  },
  dark: {
    appBg: "#14120F",
    surfaceBg: "#1C1915",
    surfaceSunken: "#24201B",
    raisedBg: "#24201B",
    surfaceBorder: "#332D26",
    surfaceBorderStrong: "#463E34",
    text: "#F3ECE0",
    textPrimary: "#E6DDCE",
    textMuted: "#B4A895",
    textFaint: "#968A77",
    textDisabled: "#5E5547",
    btnGhost: "#24201B",
    btnGhostText: "#B4A895",
    btnGhostBorder: "#332D26",
    inputBg: "#24201B",
    inputBorder: "#463E34",
    progressTrack: "#332D26",
    tabInactive: "#24201B",
    tabInactiveText: "#9A8E7B",
    separatorText: "#5E5547",
    cardFront: "#24201B",
    cardFrontBorder: "#332D26",
    cardFrontChar: "#F3ECE0",
    streakBg: "rgba(232, 112, 90, 0.14)",
    streakBorder: "rgba(232, 112, 90, 0.35)",
    streakText: "#F2B49C",
    shadowCard: "0 1px 0 rgba(0, 0, 0, 0.3), 0 2px 10px rgba(0, 0, 0, 0.3)",
    shadowElevated: "0 6px 18px rgba(0, 0, 0, 0.45)",
    shadowFloating: "0 12px 32px rgba(0, 0, 0, 0.55)",
    heatmap: ["#24201B", "#4A2519", "#7A3623", "#B84A30", "#E8705A"],
    success: "#7FCF9C",
    successBg: "rgba(127, 207, 156, 0.14)",
    successBorder: "rgba(127, 207, 156, 0.38)",
    danger: "#FF8A80",
    dangerBg: "rgba(255, 138, 128, 0.14)",
    dangerBorder: "rgba(255, 138, 128, 0.38)",
    warn: "#F2B26B",
    warnBg: "rgba(242, 178, 107, 0.14)",
    warnBorder: "rgba(242, 178, 107, 0.38)",
    info: "#8CC4EA",
  },
};

// Accent presets. `dark` is used in dark mode where the base color would be
// too dim to read as text (accent doubles as a text color across the app).
const ACCENT_PRESETS = {
  shu:     { name: "Shu",     color: "#B53923", onAccent: "#FFFFFF", dark: "#E8705A", onAccentDark: "#1C1A17" },
  crimson: { name: "Crimson", color: "#C0392B", onAccent: "#FFFFFF", dark: "#E86A5C", onAccentDark: "#1C1A17" },
  sumi:    { name: "Sumi",    color: "#2B2723", onAccent: "#FFFFFF", dark: "#E6DDCE", onAccentDark: "#1C1A17" },
  matcha:  { name: "Matcha",  color: "#4E7A3A", onAccent: "#FFFFFF", dark: "#9CC985", onAccentDark: "#1C1A17" },
  ai:      { name: "Ai",      color: "#2E5C8A", onAccent: "#FFFFFF", dark: "#8CB8E6", onAccentDark: "#1C1A17" },
  sakura:  { name: "Sakura",  color: "#B4466F", onAccent: "#FFFFFF", dark: "#F09AB8", onAccentDark: "#1C1A17" },
};

// Font presets — Mincho for Japanese by default (brush-like, calm),
// Sans for maximum legibility, Serif as a middle ground.
const FONT_PRESETS = {
  brush: { name: "Mincho", body: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
                            jp:   "'Shippori Mincho', 'Noto Serif JP', 'Hiragino Mincho ProN', serif",
                            ui:   "'Inter', 'Noto Sans JP', system-ui, sans-serif" },
  serif: { name: "Serif",  body: "'Noto Sans JP', sans-serif",
                            jp:   "'Noto Serif JP', 'Hiragino Mincho ProN', serif",
                            ui:   "'Inter', system-ui, sans-serif" },
  sans:  { name: "Sans",   body: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
                            jp:   "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
                            ui:   "'Inter', 'Noto Sans JP', system-ui, sans-serif" },
};

const buildTheme = (opts) => {
  const { darkMode, accent, fonts } = opts;
  const base = darkMode ? THEME_TOKENS.dark : THEME_TOKENS.light;
  const a = ACCENT_PRESETS[accent] || ACCENT_PRESETS.shu;
  const f = FONT_PRESETS[fonts] || FONT_PRESETS.brush;
  const color = darkMode ? a.dark : a.color;
  return {
    ...base,
    color,       // brand accent
    accent: color,
    onAccent: darkMode ? a.onAccentDark : a.onAccent,
    fontUi: f.ui,
    fontBody: f.body,
    fontJp: f.jp,
    fontMono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
  };
};

Object.assign(window, { buildTheme, ACCENT_PRESETS, FONT_PRESETS });
