// ═══════════════════════════════════════════════════════════════════════
//  Quick-wins bundle:
//    1. JLPT tagging for vocab/verbs/adjectives
//    2. Onboarding modal (first launch)
//    3. Daily-goal ring
//    4. Furigana overlay (DOM-observer; no edits to mode components)
//    5. "/" global card search
//  Plain JS — no JSX build step required.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const h = React.createElement;
  const { useState, useEffect, useMemo, useRef } = React;

  // ─── 1. JLPT tagging ────────────────────────────────────────────────
  // Default everything to N5 (the app's target level), then bump known
  // N4 vocab. Mutates the in-memory CARD_DATA / ALL_CARDS.
  const N4_FRONTS = new Set([
    // verbs that historically sit on the N4 line
    "勉強する", "覚える", "忘れる", "開ける", "閉める", "走る", "歩く",
    "起きる", "寝る", "持つ", "待つ", "使う", "作る", "会う",
    // adjectives
    "便利", "不便", "親切", "大切", "大変", "賑やか", "綺麗",
    "忙しい", "暇", "有名", "重い", "軽い", "強い", "弱い",
    "辛い", "甘い", "おいしい", "まずい",
    // vocab
    "音楽", "映画", "図書館", "郵便局", "空港", "ホテル",
  ]);
  function tagJlpt() {
    if (!window.CARD_DATA) return;
    for (const cards of Object.values(window.CARD_DATA)) {
      if (!Array.isArray(cards)) continue;
      for (const c of cards) {
        if (c.jlpt) continue;
        c.jlpt = N4_FRONTS.has(c.front) ? 4 : 5;
      }
    }
    if (Array.isArray(window.ALL_CARDS)) {
      for (const c of window.ALL_CARDS) {
        if (!c.jlpt) c.jlpt = N4_FRONTS.has(c.front) ? 4 : 5;
      }
    }
  }
  tagJlpt();

  // Helper exposed so deck-builder can filter by JLPT level focus.
  window.filterByLevel = function (cards, levelFocus) {
    if (!levelFocus || levelFocus === "all") return cards;
    return cards.filter((c) => c.jlpt === levelFocus);
  };

  // ─── 2. Onboarding modal ────────────────────────────────────────────
  function OnboardingModal({ t, progress, onDone }) {
    const [step, setStep] = useState(0);
    const [goal, setGoal] = useState(progress.dailyGoal || 20);
    const [level, setLevel] = useState("all");

    const finish = () => onDone({ dailyGoal: goal, levelFocus: level });

    return h("div", {
      style: {
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      },
    },
      h("div", {
        className: "fade-up",
        style: {
          background: t.surfaceBg, color: t.text,
          borderRadius: 24, padding: "36px 32px",
          maxWidth: 460, width: "100%",
          border: `1px solid ${t.surfaceBorder}`, boxShadow: t.shadowFloating,
        },
      },
        h("div", { style: { fontFamily: t.fontJp, fontSize: 64, color: t.accent, textAlign: "center", lineHeight: 1, marginBottom: 4, fontWeight: 700 } }, step === 0 ? "始" : "目"),
        h("h2", { style: { margin: 0, textAlign: "center", fontFamily: t.fontUi, fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: -0.6 } },
          step === 0 ? "ようこそ — Welcome" : "Set your daily goal"
        ),
        h("p", { style: { textAlign: "center", color: t.textMuted, fontSize: 13, margin: "10px 0 22px", lineHeight: 1.5 } },
          step === 0
            ? "Two quick choices — daily goal and level focus — then you're in."
            : "How many cards do you want to study each day? You can change this later."
        ),

        step === 0 && h("div", null,
          h("div", { className: "mono", style: { fontSize: 10, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 8 } }, "Daily goal"),
          h("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 18 } },
            [10, 20, 30, 50].map((g) =>
              h("button", {
                key: g, className: "btn", onClick: () => setGoal(g),
                style: {
                  padding: "12px 8px", borderRadius: 10,
                  background: goal === g ? t.accent : t.surfaceSunken,
                  color: goal === g ? t.onAccent : t.text,
                  border: `1px solid ${goal === g ? t.accent : t.surfaceBorder}`,
                  fontSize: 14, fontWeight: 700, fontFamily: t.fontUi,
                },
              }, g)
            )
          ),
          h("div", { className: "mono", style: { fontSize: 10, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 8 } }, "Level focus"),
          h("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 24 } },
            [{ id: "all", label: "Both" }, { id: 5, label: "N5 only" }, { id: 4, label: "N4 only" }].map((o) =>
              h("button", {
                key: String(o.id), className: "btn", onClick: () => setLevel(o.id),
                style: {
                  padding: "12px 8px", borderRadius: 10,
                  background: level === o.id ? t.accent : t.surfaceSunken,
                  color: level === o.id ? t.onAccent : t.text,
                  border: `1px solid ${level === o.id ? t.accent : t.surfaceBorder}`,
                  fontSize: 13, fontWeight: 700, fontFamily: t.fontUi,
                },
              }, o.label)
            )
          ),
          h("button", {
            className: "btn", onClick: finish,
            style: {
              width: "100%", padding: "14px 18px",
              background: t.accent, color: t.onAccent,
              borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: t.fontUi,
              boxShadow: `0 6px 22px ${t.accent}44`,
            },
          }, "始めましょう · Let's go →"),
          h("button", {
            className: "btn", onClick: finish,
            style: {
              width: "100%", marginTop: 8, padding: "8px",
              background: "transparent", color: t.textFaint,
              fontSize: 11, fontFamily: t.fontMono,
            },
          }, "skip onboarding")
        )
      ));
  }
  window.OnboardingModal = OnboardingModal;

  // ─── 3. Daily-goal ring ─────────────────────────────────────────────
  function DailyGoalRing({ t, today, goal, size = 72 }) {
    const safeGoal = goal > 0 ? goal : 20;
    const pct = Math.min(1, today / safeGoal);
    const R = size / 2 - 6;
    const C = 2 * Math.PI * R;
    const stroke = pct >= 1 ? t.success : t.accent;
    return h("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, style: { display: "block" } },
      h("circle", { cx: size / 2, cy: size / 2, r: R, fill: "none", stroke: t.progressTrack, strokeWidth: 6 }),
      h("circle", {
        cx: size / 2, cy: size / 2, r: R, fill: "none",
        stroke, strokeWidth: 6, strokeLinecap: "round",
        strokeDasharray: C, strokeDashoffset: C * (1 - pct),
        transform: `rotate(-90 ${size / 2} ${size / 2})`,
        style: { transition: "stroke-dashoffset 0.6s cubic-bezier(.2,.7,.2,1)" },
      }),
      h("text", {
        x: size / 2, y: size / 2 + 5,
        textAnchor: "middle", fontSize: 18, fontWeight: 800,
        fill: t.text, fontFamily: "Inter, sans-serif",
      }, today),
      h("text", {
        x: size / 2, y: size / 2 + 19,
        textAnchor: "middle", fontSize: 9,
        fill: t.textFaint, fontFamily: "Inter, sans-serif",
      }, "/ " + safeGoal)
    );
  }
  window.DailyGoalRing = DailyGoalRing;

  // ─── 4. Furigana overlay via DOM observer ───────────────────────────
  // Builds a front→reading index from all cards, then on every DOM mutation
  // tags `.jp` elements whose text matches a card front with data-reading.
  // CSS at the bottom of this file renders that as a small line above.
  const FRONT_INDEX = {};
  function buildFrontIndex() {
    const add = (front, romanji) => {
      if (!front || !romanji) return;
      const r = romanji.split(/[\/ ]/)[0].trim();
      if (!r) return;
      const kana = window.romajiToKana ? window.romajiToKana(r) : r;
      if (kana && kana !== front) FRONT_INDEX[front] = kana;
    };
    (window.ALL_CARDS || []).forEach((c) => add(c.front, c.romanji));
  }
  buildFrontIndex();

  function applyFurigana() {
    document.querySelectorAll(".jp").forEach((el) => {
      if (el.querySelector(".jp")) return; // skip containers, only leaf JP text
      const txt = (el.textContent || "").trim();
      if (!txt) return;
      const reading = FRONT_INDEX[txt];
      if (reading) {
        if (el.getAttribute("data-reading") !== reading) {
          el.setAttribute("data-reading", reading);
        }
      } else if (el.hasAttribute("data-reading")) {
        el.removeAttribute("data-reading");
      }
    });
  }
  let raf = 0;
  const scheduleFurigana = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; applyFurigana(); });
  };
  const obs = new MutationObserver(scheduleFurigana);
  // Defer initial observe until #root has been mounted
  const startObserver = () => {
    const root = document.getElementById("root");
    if (!root) { setTimeout(startObserver, 100); return; }
    obs.observe(root, { childList: true, subtree: true, characterData: true });
    scheduleFurigana();
  };
  startObserver();

  // CSS rules for furigana display, search overlay, sync chip, and mobile
  const css = `
    body.furigana-on .jp[data-reading]::before {
      content: attr(data-reading);
      display: block;
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 0.36em;
      font-weight: 400;
      color: var(--furigana-color, #888);
      letter-spacing: 0.05em;
      line-height: 1;
      margin-bottom: 4px;
      opacity: 0.85;
    }
    body.dark .jp[data-reading]::before { color: #aaa; }
    .jq-search-backdrop {
      position: fixed; inset: 0; z-index: 180;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      display: flex; align-items: flex-start; justify-content: center;
      padding: 80px 20px 20px;
    }

    /* Mobile (< 720px): re-stack floating chrome so nothing overlaps */
    @media (max-width: 720px) {
      .jq-search-backdrop { padding: 40px 12px 12px !important; }
    }
  `;
  const styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  // ─── 5. "/" global card search ──────────────────────────────────────
  function SearchOverlay({ t, setScreen, setKanaSection }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "/" && !open) {
          const tag = (e.target?.tagName || "").toUpperCase();
          if (tag === "INPUT" || tag === "TEXTAREA") return;
          e.preventDefault();
          setOpen(true);
          setQ("");
        }
        if (e.key === "Escape" && open) { setOpen(false); }
      };
      const onOpenEvent = () => { setOpen(true); setQ(""); };
      window.addEventListener("keydown", onKey);
      window.addEventListener("jp-open-search", onOpenEvent);
      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("jp-open-search", onOpenEvent);
      };
    }, [open]);

    useEffect(() => {
      if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    const results = useMemo(() => {
      if (!open || !q.trim()) return [];
      const needle = q.toLowerCase().trim();
      const out = [];
      (window.ALL_CARDS || []).forEach((c) => {
        if (
          c.front.includes(q) ||
          (c.back || "").toLowerCase().includes(needle) ||
          (c.romanji || "").toLowerCase().includes(needle)
        ) out.push({ kind: "card", ...c });
      });
      (window.KANJI_DATA || []).forEach((k) => {
        if (
          k.char.includes(q) ||
          k.meaning.toLowerCase().includes(needle) ||
          k.on.some((r) => r.toLowerCase().includes(needle)) ||
          k.kun.some((r) => r.toLowerCase().includes(needle))
        ) out.push({ kind: "kanji", ...k });
      });
      return out.slice(0, 30);
    }, [q, open]);

    if (!open) return null;

    return h("div", { className: "jq-search-backdrop", onClick: () => setOpen(false) },
      h("div", {
        className: "fade-up",
        onClick: (e) => e.stopPropagation(),
        style: {
          background: t.surfaceBg, color: t.text,
          borderRadius: 18, width: "100%", maxWidth: 620,
          border: `1px solid ${t.surfaceBorder}`, boxShadow: t.shadowFloating,
          overflow: "hidden", display: "flex", flexDirection: "column",
          maxHeight: "75vh",
        },
      },
        h("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: `1px solid ${t.surfaceBorder}` } },
          h("span", { className: "mono", style: { color: t.accent, fontSize: 13 } }, "/"),
          h("input", {
            ref: inputRef, value: q, onChange: (e) => setQ(e.target.value),
            placeholder: "Search cards & kanji — meaning, romaji, or kana…",
            style: {
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: t.text, fontSize: 16, fontFamily: t.fontUi,
            },
          }),
          h("button", {
            className: "btn", onClick: () => setOpen(false),
            style: { padding: "4px 10px", color: t.textFaint, background: t.btnGhost, borderRadius: 8, fontSize: 11, fontFamily: t.fontMono },
          }, "esc")
        ),
        h("div", { style: { overflowY: "auto", padding: q.trim() ? 0 : "32px 20px" } },
          !q.trim() && h("div", { style: { textAlign: "center", color: t.textFaint, fontSize: 12 } },
            "Type to search across ", h("b", { style: { color: t.textMuted } }, (window.ALL_CARDS || []).length), " cards and ", h("b", { style: { color: t.textMuted } }, (window.KANJI_DATA || []).length), " kanji.",
            h("div", { style: { marginTop: 8, fontFamily: t.fontMono, fontSize: 10 } }, "Tip: press / anywhere to open this.")
          ),
          q.trim() && results.length === 0 && h("div", { style: { padding: "32px 20px", textAlign: "center", color: t.textFaint, fontSize: 13 } }, "No matches."),
          results.map((r, i) =>
            r.kind === "card"
              ? h("button", {
                  key: "c" + i, className: "btn",
                  onClick: () => { setOpen(false); },
                  style: {
                    width: "100%", display: "flex", alignItems: "baseline", gap: 14,
                    padding: "12px 18px", textAlign: "left",
                    borderBottom: `1px solid ${t.surfaceBorder}`,
                  },
                },
                  h("span", { className: "jp", style: { fontSize: 22, color: t.text, fontWeight: 500, minWidth: 90 } }, r.front),
                  h("span", { className: "mono", style: { fontSize: 11, color: t.textFaint, minWidth: 90 } }, r.romanji),
                  h("span", { style: { fontSize: 13, color: t.textMuted, flex: 1 } }, r.back),
                  h("span", { style: { fontSize: 10, color: t.accent, fontFamily: t.fontMono } }, r.type)
                )
              : h("button", {
                  key: "k" + i, className: "btn",
                  onClick: () => { setOpen(false); setScreen && setScreen("kanji"); },
                  style: {
                    width: "100%", display: "flex", alignItems: "baseline", gap: 14,
                    padding: "12px 18px", textAlign: "left",
                    borderBottom: `1px solid ${t.surfaceBorder}`,
                  },
                },
                  h("span", { className: "jp", style: { fontSize: 26, color: t.accent, fontWeight: 500, minWidth: 50 } }, r.char),
                  h("span", { style: { fontSize: 13, color: t.text, flex: 1, textTransform: "capitalize" } }, r.meaning),
                  h("span", { style: { fontSize: 10, color: t.success, fontFamily: t.fontMono } }, "N" + r.jlpt, " · kanji")
                )
          )
        ),
        h("div", { style: { padding: "8px 14px", borderTop: `1px solid ${t.surfaceBorder}`, display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textFaint, fontFamily: t.fontMono } },
          h("span", null, results.length, " result", results.length === 1 ? "" : "s"),
          h("span", null, "esc to close")
        )
      ));
  }
  window.SearchOverlay = SearchOverlay;
  window.openSearch = () => window.dispatchEvent(new CustomEvent("jp-open-search"));

  // ─── Furigana floating toggle button ────────────────────────────────
  // Mounted from app.jsx via window.FuriganaToggle component, but we also
  // expose a simple imperative toggle so the toggle button can sit anywhere.
  window.toggleFurigana = (force) => {
    const has = document.body.classList.contains("furigana-on");
    const next = typeof force === "boolean" ? force : !has;
    document.body.classList.toggle("furigana-on", next);
    try { localStorage.setItem("jp-furigana", next ? "1" : "0"); } catch (_) {}
    return next;
  };
  // Restore on load
  try {
    if (localStorage.getItem("jp-furigana") === "1") {
      document.body.classList.add("furigana-on");
    }
  } catch (_) {}

  function FuriganaToggle({ t }) {
    const [on, setOn] = useState(() => document.body.classList.contains("furigana-on"));
    const toggle = () => {
      const next = window.toggleFurigana();
      setOn(next);
    };
    return h("button", {
      className: "btn jq-furigana-btn",
      onClick: toggle,
      title: on ? "Hide furigana readings" : "Show furigana readings",
      style: {
        padding: "6px 12px", borderRadius: 999,
        background: on ? t.accent : t.btnGhost,
        color: on ? t.onAccent : t.textMuted,
        border: `1px solid ${on ? t.accent : t.btnGhostBorder}`,
        fontSize: 12, fontFamily: t.fontJp, fontWeight: 600,
        boxShadow: on ? `0 4px 14px ${t.accent}40` : "none",
      },
    }, "ふ ", h("span", { style: { fontSize: 10, marginLeft: 4, fontFamily: t.fontMono, opacity: 0.8 } }, on ? "on" : "off"));
  }
  window.FuriganaToggle = FuriganaToggle;
})();
