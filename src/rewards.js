// ═══════════════════════════════════════════════════════════════════════
//  Rewards: badges, the week streak strip, and Daru the daruma mascot.
//  A daruma gets one eye painted when you set a goal and the second when
//  you reach it — Daru does the same with your daily goal.
//  Plain JS (no build step). Earned badges live in progress.badges, so they
//  sync with the rest of progress and never disappear once earned.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const h = React.createElement;

  // ── Badges ──────────────────────────────────────────────────────────
  const answered = (p) => p.totalAnswered || 0;
  const mastered = (p) => Object.values(p.cardStats || {}).filter(window.isMastered).length;
  const lessonsPassed = (p) => Object.values((p.course && p.course.lessons) || {}).filter((L) => L.passed).length;
  const goalDays = (p) => Object.values(p.dayLog || {}).filter((d) => d.cards >= (p.dailyGoal || 20)).length;
  const best = (p) => p.bestStreak || 0;

  const BADGES = [
    { id: "first-card",   glyph: "初", name: "First step",     desc: "Answer your first card",        test: (p) => answered(p) >= 1 },
    { id: "answers-100",  glyph: "百", name: "Hundred",        desc: "Answer 100 cards",              test: (p) => answered(p) >= 100 },
    { id: "answers-1000", glyph: "千", name: "Thousand",       desc: "Answer 1,000 cards",            test: (p) => answered(p) >= 1000 },
    { id: "goal-1",       glyph: "的", name: "On target",      desc: "Hit your daily goal",           test: (p) => goalDays(p) >= 1 },
    { id: "goal-10",      glyph: "励", name: "Diligent",       desc: "Hit your daily goal on 10 days", test: (p) => goalDays(p) >= 10 },
    { id: "streak-3",     glyph: "三", name: "Three in a row", desc: "Study 3 days in a row",         test: (p) => best(p) >= 3 },
    { id: "streak-7",     glyph: "週", name: "Full week",      desc: "Study 7 days in a row",         test: (p) => best(p) >= 7 },
    { id: "streak-30",    glyph: "月", name: "Full month",     desc: "Study 30 days in a row",        test: (p) => best(p) >= 30 },
    { id: "mastered-1",   glyph: "覚", name: "It stuck",       desc: "Master your first card",        test: (p) => mastered(p) >= 1 },
    { id: "mastered-50",  glyph: "達", name: "Fifty strong",   desc: "Master 50 cards",               test: (p) => mastered(p) >= 50 },
    { id: "perfect",      glyph: "完", name: "Flawless",       desc: "Score 100% in a session of 5+ cards",
      test: (p) => (p.history || []).some((s) => s.score === 100 && s.cards >= 5) },
    { id: "lesson-1",     glyph: "道", name: "On the path",    desc: "Pass your first course lesson", test: (p) => lessonsPassed(p) >= 1 },
    { id: "lesson-10",    glyph: "段", name: "Ten lessons",    desc: "Pass 10 course lessons",        test: (p) => lessonsPassed(p) >= 10 },
  ];

  // Adds newly earned badges to p.badges (mutates p) and returns their ids.
  function awardBadges(p) {
    p.badges = { ...(p.badges || {}) };
    const fresh = BADGES.filter((b) => !p.badges[b.id] && b.test(p));
    fresh.forEach((b) => { p.badges[b.id] = Date.now(); });
    return fresh.map((b) => b.id);
  }

  // ── Mascot mood from today's progress ───────────────────────────────
  function mascotState(p, todayCards, goal) {
    const streak = window.currentStreak(p);
    if (todayCards >= goal) return { mood: "full", msg: "Both eyes painted. Goal reached! よくできました" };
    if (todayCards > 0) return { mood: "half", msg: `One eye down. ${goal - todayCards} more cards to paint the other.` };
    if (streak > 0) return { mood: "blank", msg: `Your ${streak}-day streak is waiting. 今日も頑張ろう!` };
    return { mood: "blank", msg: "Paint my eyes: hit today's goal. 頑張ろう!" };
  }

  // ── Daru, the daruma ────────────────────────────────────────────────
  // mood: "blank" (no eyes painted), "half" (one), "full" (both, smiling)
  function Daruma({ t, mood = "blank", size = 96, bounce = false }) {
    const ink = "#1C1A17", gold = "#D4A23A", face = "#FBF3E6";
    const eye = (cx, painted) => h("g", { key: cx },
      h("circle", { cx, cy: 50, r: 7.5, fill: "#FFFFFF", stroke: ink, strokeWidth: 1.6 }),
      painted && h("circle", { cx, cy: 50, r: 5, fill: ink }));
    const happy = mood === "full";
    return h("svg", {
      width: size, height: size * 1.12, viewBox: "0 0 100 112", role: "img",
      "aria-label": `Daru the daruma, ${mood === "full" ? "both eyes painted" : mood === "half" ? "one eye painted" : "eyes not painted yet"}`,
      className: "daru" + (bounce ? " daru-bounce" : ""), style: { display: "block", overflow: "visible" },
    },
      h("ellipse", { cx: 50, cy: 108, rx: 34, ry: 4, fill: "#000", opacity: 0.08 }),
      h("path", { d: "M50 6C80 6 96 34 96 64c0 28-20 44-46 44S4 92 4 64C4 34 20 6 50 6Z", fill: t.accent }),
      h("ellipse", { cx: 30, cy: 24, rx: 9, ry: 4, fill: "#FFFFFF", opacity: 0.18, transform: "rotate(-30 30 24)" }),
      h("ellipse", { cx: 50, cy: 53, rx: 28, ry: 24, fill: face }),
      h("path", { d: "M29 39q8-7 17-1M54 38q9-6 17 1", stroke: ink, strokeWidth: 3.5, fill: "none", strokeLinecap: "round" }),
      // Tradition: the daruma's own left eye (viewer's right) is painted first.
      eye(39, mood === "full"),
      eye(61, mood !== "blank"),
      h("path", { d: "M37 65q6.5-5 13 0q6.5-5 13 0", stroke: gold, strokeWidth: 3, fill: "none", strokeLinecap: "round" }),
      h("path", { d: happy ? "M43 69q7 7 14 0" : "M45 70h10", stroke: ink, strokeWidth: 2, fill: "none", strokeLinecap: "round" }),
      happy && h("circle", { cx: 32, cy: 62, r: 4, fill: t.accent, opacity: 0.25 }),
      happy && h("circle", { cx: 68, cy: 62, r: 4, fill: t.accent, opacity: 0.25 }),
      h("path", { d: "M22 82q28 10 56 0", stroke: gold, strokeWidth: 2, fill: "none", strokeLinecap: "round" }),
      h("text", { x: 50, y: 101, textAnchor: "middle", fontSize: 16, fontWeight: 700, fill: gold,
        fontFamily: "'Shippori Mincho', 'Noto Serif JP', serif" }, "学")
    );
  }

  // Daru + speech bubble.
  function Mascot({ t, mood, message, size = 92, bounce }) {
    return h("div", { style: { display: "flex", alignItems: "center", gap: 14 } },
      h(Daruma, { t, mood, size, bounce }),
      message && h("div", {
        className: "daru-bubble",
        style: {
          position: "relative", padding: "10px 14px", borderRadius: 12, maxWidth: 280,
          background: t.surfaceSunken, border: `1px solid ${t.surfaceBorder}`,
          fontSize: 14, lineHeight: 1.45, color: t.text, fontFamily: t.fontBody,
          "--bubble-bg": t.surfaceSunken, "--bubble-bd": t.surfaceBorder,
        },
      }, message)
    );
  }

  // ── Streak: last 7 days as dots ─────────────────────────────────────
  function WeekStrip({ t, progress }) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ key, label: d.toLocaleDateString("en-US", { weekday: "narrow" }), done: (progress.dayLog?.[key]?.cards || 0) > 0, today: i === 0 });
    }
    return h("div", { style: { display: "flex", gap: 6 }, role: "list", "aria-label": "Study days this week" },
      days.map((d) => h("div", { key: d.key, role: "listitem", "aria-label": `${d.key}: ${d.done ? "studied" : "no study"}`,
        style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 } },
        h("div", { style: {
          width: 22, height: 22, borderRadius: 999,
          background: d.done ? t.accent : "transparent",
          border: `2px solid ${d.done ? t.accent : d.today ? t.textFaint : t.surfaceBorderStrong}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: t.onAccent, fontSize: 11, fontWeight: 800,
        } }, d.done ? "✓" : ""),
        h("span", { style: { fontSize: 10, color: d.today ? t.text : t.textFaint, fontFamily: t.fontMono, fontWeight: d.today ? 700 : 400 } }, d.label)
      ))
    );
  }

  // ── Badge seals ─────────────────────────────────────────────────────
  function BadgeSeal({ t, badge, earned, size = 56 }) {
    return h("div", {
      title: `${badge.name}: ${badge.desc}`,
      style: {
        width: size, height: size, borderRadius: size * 0.18, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: "rotate(-3deg)",
        background: earned ? t.accent : "transparent",
        color: earned ? t.onAccent : t.textDisabled,
        border: earned ? "none" : `2px dashed ${t.surfaceBorderStrong}`,
        boxShadow: earned ? `inset 0 0 0 3px ${t.onAccent}33` : "none",
        fontFamily: t.fontJp, fontWeight: 700, fontSize: size * 0.46,
      },
    }, badge.glyph);
  }

  function BadgeGrid({ t, progress, only }) {
    const earned = progress.badges || {};
    const list = only ? BADGES.filter((b) => only.includes(b.id)) : BADGES;
    return h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 } },
      list.map((b) => {
        const on = !!earned[b.id];
        return h("div", { key: b.id, className: "surface", style: { padding: 12, display: "flex", gap: 12, alignItems: "center", opacity: on ? 1 : 0.85 } },
          h(BadgeSeal, { t, badge: b, earned: on, size: 44 }),
          h("div", { style: { minWidth: 0 } },
            h("div", { style: { fontSize: 13, fontWeight: 700, color: on ? t.text : t.textMuted, fontFamily: t.fontUi } }, b.name),
            h("div", { style: { fontSize: 11, color: t.textMuted, lineHeight: 1.35 } },
              on ? `Earned ${new Date(earned[b.id]).toLocaleDateString()}` : b.desc))
        );
      })
    );
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes daruBounce { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-8deg) } 75% { transform: rotate(8deg) } }
    .daru { transform-origin: 50% 95%; }
    .daru-bounce { animation: daruBounce 0.9s ease-in-out 2; }
    .daru-bubble::before {
      content: ""; position: absolute; left: -7px; top: 50%; width: 12px; height: 12px;
      background: var(--bubble-bg); border-left: 1px solid var(--bubble-bd); border-bottom: 1px solid var(--bubble-bd);
      transform: translateY(-50%) rotate(45deg);
    }
  `;
  document.head.appendChild(style);

  Object.assign(window, { BADGES, awardBadges, mascotState, Daruma, Mascot, WeekStrip, BadgeSeal, BadgeGrid });
})();
