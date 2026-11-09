// ═══════════════════════════════════════════════════════════════════════
//  Cross-device sync via Vercel KV (/api/sync).
//  Strategy: each user (Diego, Mariana) has a fixed sync ID from their name.
//  shortcut: IDs are public, so anyone with the site URL can read or overwrite
//  a user's progress; add a shared passphrase if the URL ever spreads. Progress
//  is mirrored to KV after every save (debounced) and pulled on startup +
//  on tab focus. Last-write-wins by updatedAt, where the local timestamp is
//  the time of the last local *save* (not upload), so unsynced offline study
//  is never overwritten by an older remote copy. Plain-JS, no build step.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const h = React.createElement;
  const { useState, useEffect } = React;

  const PROGRESS_KEY = window.userKey("jp-study-progress");
  const LOCAL_TS_KEY = window.userKey("jp-sync-local-ts");
  // Set after this device's first successful contact with the server for this user.
  const JOINED_KEY = window.userKey("jp-sync-joined");
  const ENDPOINT = "/api/sync";

  // The first user (Diego) keeps the shared record main already syncs to, so
  // progress uploaded before users existed stays his; others get their own.
  const getId = () => window.getUser() === window.USERS[0] ? "nihongo-main" : `nihongo-${window.getUser().toLowerCase()}`;
  const isJoined = () => { try { return localStorage.getItem(JOINED_KEY) === "1"; } catch (_) { return false; } };
  const setJoined = () => { try { localStorage.setItem(JOINED_KEY, "1"); } catch (_) {} };
  function getLocalTs() {
    try { return Number(localStorage.getItem(LOCAL_TS_KEY)) || 0; } catch (_) { return 0; }
  }
  function setLocalTs(ts) {
    try { localStorage.setItem(LOCAL_TS_KEY, String(ts)); } catch (_) {}
  }

  // ── Status bus (so the UI can react) ───────────────────────────────
  // status: "off" | "idle" | "pushing" | "pulling" | "ok" | "error"
  const bus = new EventTarget();
  let _status = "idle";
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

  // Decide what a pull should do. Pure, so it can be tested.
  const answered = (json) => { try { return JSON.parse(json).totalAnswered || 0; } catch (_) { return 0; } };
  function pick(localTs, remote, force, firstContact, localValue) {
    if (!remote || !remote.value) return "push";
    if (force) return "pull";
    // First contact on this device: keep whichever copy has more study in it, so
    // an empty cloud record can't wipe real local progress (and vice versa).
    if (firstContact) return answered(localValue) > answered(remote.value) ? "push" : "pull";
    if (remote.updatedAt > localTs) return "pull";
    if (localTs > remote.updatedAt) return "push";
    return "none";
  }

  // ── Push (debounced) ────────────────────────────────────────────────
  let pushTimer = 0;
  let pendingValue = null;
  function schedulePush(value) {
    pendingValue = value;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(doPush, 1200);
  }
  async function doPush() {
    const id = getId();
    if (pendingValue == null) return;
    const value = pendingValue; pendingValue = null;
    const ts = getLocalTs() || Date.now();
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
    setStatus("pulling");
    try {
      const remote = await apiGet(id);
      const firstContact = !isJoined();
      const cur = await readLocalProgressString();
      const action = pick(getLocalTs(), remote, force, firstContact, cur);
      setJoined();
      if (action === "push") {
        // Remote empty, older, or (first contact) has less study — push local state.
        // Stamp now so other devices see this upload as newer than what they have.
        if (cur) { if (firstContact) setLocalTs(Date.now()); schedulePush(cur); }
        setStatus("ok");
        return null;
      }
      if (action === "pull") {
        // Remote is newer (or forced) — overwrite local
        try { localStorage.setItem(PROGRESS_KEY, remote.value); } catch (_) {}
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
    try { return localStorage.getItem(PROGRESS_KEY); } catch (_) { return null; }
  }

  // ── Hook into window.storage so every progress save mirrors to KV ──
  function installStorageHook() {
    if (!window.storage || window.storage.__kvHooked) return;
    const origSet = window.storage.set.bind(window.storage);
    window.storage.set = async function (key, value) {
      const r = await origSet(key, value);
      if (key === PROGRESS_KEY && typeof value === "string") {
        setLocalTs(Date.now()); // stamp the save, so a pull can't overwrite it with older remote data
        schedulePush(value);
      }
      return r;
    };
    window.storage.__kvHooked = true;
  }
  installStorageHook();

  // Pull on focus
  window.addEventListener("focus", () => doPull());
  document.addEventListener("visibilitychange", () => { if (!document.hidden) doPull(); });

  // Initial pull; small delay so app.jsx's initial localStorage read fires first.
  setTimeout(() => doPull(), 400);

  // ── UI: floating chip; tap to sync now ─────────────────────────────
  function SyncChip({ t }) {
    const [st, setSt] = useState(getStatus());
    useEffect(() => {
      const h = () => setSt(getStatus());
      bus.addEventListener("change", h);
      return () => bus.removeEventListener("change", h);
    }, []);

    const label = {
      idle: "sync ready",
      pushing: "pushing…",
      pulling: "pulling…",
      ok: "synced ✓",
      error: "sync error",
    }[st.status] || st.status;

    const tone = st.status === "ok" ? t.success : st.status === "error" ? t.danger : t.accent;

    const syncNow = async () => {
      const s = await readLocalProgressString();
      if (s) { pendingValue = s; await doPush(); }
      await doPull();
    };

    return h("button", {
      className: "btn jq-sync-btn",
      onClick: syncNow,
      title: st.error ? `${label}: ${st.error} (tap to retry)` : `${label} (tap to sync now)`,
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
    );
  }

  // ── User switcher chip ──────────────────────────────────────────────
  function UserChip({ t }) {
    const cur = window.getUser();
    const other = window.USERS.find((u) => u !== cur);
    return h("button", {
      className: "btn jq-user-btn",
      onClick: () => window.switchUser(other),
      title: `Switch to ${other}`,
      "aria-label": `Studying as ${cur}. Switch to ${other}`,
      style: {
        padding: "8px 14px", borderRadius: 999,
        background: t.btnGhost, color: t.text,
        border: `1px solid ${t.btnGhostBorder}`,
        fontSize: 11, fontFamily: t.fontMono, fontWeight: 600,
        letterSpacing: 0.5, textTransform: "uppercase",
        boxShadow: t.shadowCard,
      },
    }, "👤 ", cur, " ⇄");
  }

  window.SyncChip = SyncChip;
  window.UserChip = UserChip;
  window.kvSync = { getId, doPull, doPush, schedulePush, getStatus, pick };
})();
