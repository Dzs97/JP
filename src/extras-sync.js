// ═══════════════════════════════════════════════════════════════════════
//  Cross-device sync via Vercel KV (/api/sync).
//  Strategy: each install gets a "sync ID" stored in localStorage. Progress
//  is mirrored to KV after every save (debounced) and pulled on startup +
//  on tab focus. Last-write-wins by updatedAt. Plain-JS, no build step.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const h = React.createElement;
  const { useState, useEffect, useRef } = React;

  const SYNC_ID_KEY = "jp-sync-id";
  const LOCAL_TS_KEY = "jp-sync-local-ts";
  const ENDPOINT = "/api/sync";

  // ── Sync ID helpers ─────────────────────────────────────────────────
  function newId() {
    // 22-char URL-safe random ID (≈132 bits of entropy)
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    let s = "";
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
    for (const b of arr) s += alpha[b % alpha.length];
    return s.slice(0, 22);
  }
  function getId() {
    try { return localStorage.getItem(SYNC_ID_KEY); } catch (_) { return null; }
  }
  function setId(id) {
    try {
      if (id) localStorage.setItem(SYNC_ID_KEY, id);
      else localStorage.removeItem(SYNC_ID_KEY);
    } catch (_) {}
  }
  function getLocalTs() {
    try { return Number(localStorage.getItem(LOCAL_TS_KEY)) || 0; } catch (_) { return 0; }
  }
  function setLocalTs(ts) {
    try { localStorage.setItem(LOCAL_TS_KEY, String(ts)); } catch (_) {}
  }

  // ── Status bus (so the UI can react) ───────────────────────────────
  // status: "off" | "idle" | "pushing" | "pulling" | "ok" | "error"
  const bus = new EventTarget();
  let _status = getId() ? "idle" : "off";
  let _lastError = null;
  let _lastSyncedAt = 0;
  function setStatus(s, err) {
    _status = s;
    _lastError = err || null;
    if (s === "ok") _lastSyncedAt = Date.now();
    bus.dispatchEvent(new CustomEvent("change"));
  }
  function getStatus() { return { status: _status, error: _lastError, lastSyncedAt: _lastSyncedAt }; }

  // ── API calls ───────────────────────────────────────────────────────
  async function apiGet(id) {
    const r = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, { method: "GET" });
    if (!r.ok) throw new Error(`GET ${r.status}`);
    return r.json();
  }
  async function apiPost(id, value, updatedAt) {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, value, updatedAt }),
    });
    if (!r.ok) throw new Error(`POST ${r.status}`);
    return r.json();
  }

  // ── Push (debounced) ────────────────────────────────────────────────
  let pushTimer = 0;
  let pendingValue = null;
  function schedulePush(value) {
    if (!getId()) return;
    pendingValue = value;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(doPush, 1200);
  }
  async function doPush() {
    const id = getId();
    if (!id || pendingValue == null) return;
    const value = pendingValue; pendingValue = null;
    const ts = Date.now();
    setStatus("pushing");
    try {
      await apiPost(id, value, ts);
      setLocalTs(ts);
      setStatus("ok");
    } catch (e) {
      console.warn("KV push failed:", e);
      setStatus("error", e.message);
    }
  }

  // ── Pull (on demand or on focus) ────────────────────────────────────
  async function doPull({ force = false } = {}) {
    const id = getId();
    if (!id) return null;
    setStatus("pulling");
    try {
      const remote = await apiGet(id);
      const localTs = getLocalTs();
      if (!remote.value) {
        // Remote empty — push our local state if we have any
        const cur = await readLocalProgressString();
        if (cur) schedulePush(cur);
        setStatus("ok");
        return null;
      }
      if (force || remote.updatedAt > localTs) {
        // Remote is newer (or forced) — overwrite local
        try { localStorage.setItem("jp-study-progress", remote.value); } catch (_) {}
        setLocalTs(remote.updatedAt);
        setStatus("ok");
        // Tell the app to reload progress from storage
        window.dispatchEvent(new CustomEvent("jp-progress-pulled", { detail: remote.value }));
        return remote.value;
      }
      setStatus("ok");
      return null;
    } catch (e) {
      console.warn("KV pull failed:", e);
      setStatus("error", e.message);
      return null;
    }
  }
  async function readLocalProgressString() {
    try { return localStorage.getItem("jp-study-progress"); } catch (_) { return null; }
  }

  // ── Hook into window.storage so every progress save mirrors to KV ──
  function installStorageHook() {
    if (!window.storage || window.storage.__kvHooked) return;
    const origSet = window.storage.set.bind(window.storage);
    window.storage.set = async function (key, value) {
      const r = await origSet(key, value);
      if (key === "jp-study-progress" && getId() && typeof value === "string") {
        schedulePush(value);
      }
      return r;
    };
    window.storage.__kvHooked = true;
  }
  installStorageHook();

  // Pull on focus
  window.addEventListener("focus", () => { if (getId()) doPull(); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && getId()) doPull();
  });

  // Initial pull as soon as the doc loads
  if (getId()) {
    // Small delay so app.jsx's initial localStorage read fires first.
    setTimeout(() => doPull(), 400);
  }

  // ── UI: floating chip + expand panel ───────────────────────────────
  function SyncChip({ t }) {
    const [st, setSt] = useState(getStatus());
    const [open, setOpen] = useState(false);
    useEffect(() => {
      const h = () => setSt(getStatus());
      bus.addEventListener("change", h);
      return () => bus.removeEventListener("change", h);
    }, []);

    const label = {
      off: "sync off",
      idle: "sync ready",
      pushing: "pushing…",
      pulling: "pulling…",
      ok: "synced ✓",
      error: "sync error",
    }[st.status] || st.status;

    const tone =
      st.status === "ok" ? t.success :
      st.status === "error" ? t.danger :
      st.status === "off" ? t.textFaint :
      t.accent;

    return h(React.Fragment, null,
      h("button", {
        className: "btn jq-sync-btn",
        onClick: () => setOpen((o) => !o),
        title: label,
        style: {
          padding: "8px 14px", borderRadius: 999,
          background: t.btnGhost, color: tone,
          border: `1px solid ${tone}40`,
          fontSize: 11, fontFamily: t.fontMono, fontWeight: 600,
          letterSpacing: 0.5, textTransform: "uppercase",
          boxShadow: t.shadowCard,
        },
      },
        st.status === "pushing" || st.status === "pulling" ? "↻ " : "☁ ",
        label
      ),
      open && h(SyncPanel, { t, status: st, onClose: () => setOpen(false) })
    );
  }

  function SyncPanel({ t, status, onClose }) {
    const [id, setIdState] = useState(getId() || "");
    const [pasteId, setPasteId] = useState("");
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef(null);

    const enable = () => {
      const nid = newId();
      setId(nid); setIdState(nid); setStatus("idle");
      // Push current state immediately
      readLocalProgressString().then((s) => { if (s) schedulePush(s); });
    };

    const disable = () => {
      if (!confirm("Disable sync? Your local progress stays. To resync this device later you'll need this Sync ID — copy it now if you might want to come back."))
        return;
      setId(null); setIdState(""); setStatus("off");
    };

    const useExisting = async () => {
      const v = pasteId.trim();
      if (!/^[A-Za-z0-9_-]{8,64}$/.test(v)) { alert("That doesn't look like a valid Sync ID."); return; }
      if (!confirm("Pull progress from that Sync ID? This will OVERWRITE this device's progress.")) return;
      setBusy(true);
      try {
        setId(v); setIdState(v);
        await doPull({ force: true });
      } finally { setBusy(false); }
    };

    const copy = async () => {
      try { await navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500); }
      catch (_) { inputRef.current?.select(); }
    };

    const syncNow = async () => {
      setBusy(true);
      try {
        const s = await readLocalProgressString();
        if (s) await new Promise((res) => { pendingValue = s; doPush().then(res); });
        await doPull();
      } finally { setBusy(false); }
    };

    return h("div", {
      className: "surface-raised jq-sync-panel fade-up",
      onClick: (e) => e.stopPropagation(),
      style: { background: t.surfaceBg, border: `1px solid ${t.surfaceBorder}`, boxShadow: t.shadowFloating },
    },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } },
        h("div", null,
          h("div", { style: { fontSize: 14, fontWeight: 700, color: t.text, fontFamily: t.fontUi, letterSpacing: -0.2 } }, "Cross-device sync"),
          h("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase" } }, "Vercel KV")
        ),
        h("button", { className: "btn", onClick: onClose,
          style: { width: 24, height: 24, borderRadius: 6, background: t.btnGhost, color: t.textMuted, fontSize: 13 } }, "×")
      ),

      h("div", {
        style: { padding: "8px 10px", borderRadius: 8, background: t.surfaceSunken, marginBottom: 12,
          fontSize: 11, color: status.status === "error" ? t.danger : t.textMuted, fontFamily: t.fontMono },
      },
        "status: ",
        h("b", { style: { color: status.status === "ok" ? t.success : status.status === "error" ? t.danger : t.accent } },
          status.status),
        status.lastSyncedAt > 0 && status.status === "ok" &&
          h("span", { style: { color: t.textFaint, marginLeft: 8 } },
            "· last " + Math.max(1, Math.round((Date.now() - status.lastSyncedAt) / 1000)) + "s ago"),
        status.error && h("div", { style: { marginTop: 4, color: t.danger } }, status.error)
      ),

      !id && h("div", null,
        h("p", { style: { fontSize: 12, color: t.textMuted, margin: "0 0 12px", lineHeight: 1.5 } },
          "Get a Sync ID for this device, or paste an existing one to pull progress from another device."),
        h("button", { className: "btn", onClick: enable,
          style: { width: "100%", padding: "11px 16px", background: t.accent, color: t.onAccent,
            borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: t.fontUi, marginBottom: 10 } },
          "Create new Sync ID"),
        h("div", { style: { display: "flex", gap: 6 } },
          h("input", {
            placeholder: "paste existing Sync ID…", value: pasteId,
            onChange: (e) => setPasteId(e.target.value),
            style: { flex: 1, padding: "10px 12px", background: t.inputBg, color: t.text,
              border: `1px solid ${t.inputBorder}`, borderRadius: 10, fontSize: 12, fontFamily: t.fontMono, outline: "none" },
          }),
          h("button", { className: "btn", onClick: useExisting, disabled: busy,
            style: { padding: "10px 14px", background: t.btnGhost, color: t.text, border: `1px solid ${t.btnGhostBorder}`,
              borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: t.fontUi } }, "Use")
        )
      ),

      id && h("div", null,
        h("div", { className: "mono", style: { fontSize: 9, letterSpacing: 1.5, color: t.textFaint, textTransform: "uppercase", marginBottom: 6 } },
          "Your Sync ID — paste on other devices"),
        h("div", { style: { display: "flex", gap: 6, marginBottom: 12 } },
          h("input", {
            ref: inputRef, value: id, readOnly: true,
            onClick: (e) => e.target.select(),
            style: { flex: 1, padding: "10px 12px", background: t.inputBg, color: t.text,
              border: `1px solid ${t.inputBorder}`, borderRadius: 10,
              fontSize: 12, fontFamily: t.fontMono, outline: "none", letterSpacing: 0.5 },
          }),
          h("button", { className: "btn", onClick: copy,
            style: { padding: "10px 14px", background: copied ? t.success : t.btnGhost, color: copied ? t.onAccent : t.text,
              border: `1px solid ${copied ? t.success : t.btnGhostBorder}`,
              borderRadius: 10, fontSize: 11, fontWeight: 600, fontFamily: t.fontMono } },
            copied ? "✓" : "copy")
        ),
        h("div", { style: { display: "flex", gap: 6 } },
          h("button", { className: "btn", onClick: syncNow, disabled: busy,
            style: { flex: 1, padding: "10px 12px", background: t.accent, color: t.onAccent,
              borderRadius: 10, fontSize: 12, fontWeight: 700, fontFamily: t.fontUi } }, "Sync now"),
          h("button", { className: "btn", onClick: disable,
            style: { padding: "10px 12px", background: t.dangerBg, color: t.danger, border: `1px solid ${t.dangerBorder}`,
              borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: t.fontUi } }, "Disable")
        ),
        h("p", { style: { fontSize: 10, color: t.textFaint, margin: "12px 0 0", lineHeight: 1.5 } },
          "Treat the Sync ID like a password — anyone with it can read or overwrite your progress.")
      )
    );
  }

  window.SyncChip = SyncChip;
  window.kvSync = { getId, setId, doPull, doPush, schedulePush, getStatus };
})();
