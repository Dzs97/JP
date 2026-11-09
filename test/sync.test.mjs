// Self-check for sync conflict handling and progress migration. Run: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const store = {};
const win = {
  addEventListener() {}, dispatchEvent() {},
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  },
  document: { addEventListener() {}, hidden: false },
  React: { createElement() {}, Fragment: {} },
  EventTarget, CustomEvent, crypto, setTimeout, clearTimeout, console,
  // Sync is always on now, so its timers fire during the test; answer like an empty server.
  fetch: async () => ({ ok: true, json: async () => ({ value: null, updatedAt: 0 }) }),
};
win.window = win;
vm.createContext(win);
for (const f of ["src/data.js", "src/engine.js", "src/extras-sync.js"]) {
  vm.runInContext(readFileSync(f, "utf8"), win, { filename: f });
}
const { pick } = win.kvSync;

// Offline study on this device (saved at t=300) must not be overwritten by an
// older remote copy (t=200) — this used to pull because the last *push* was t=100.
assert.equal(pick(300, { value: "{}", updatedAt: 200 }), "push");
assert.equal(pick(100, { value: "{}", updatedAt: 200 }), "pull");
assert.equal(pick(200, { value: "{}", updatedAt: 200 }), "none");
assert.equal(pick(0, { value: null, updatedAt: 0 }), "push");
assert.equal(pick(999, { value: "{}", updatedAt: 1 }, true), "pull");

// Saving progress stamps the local timestamp, even before any upload.
await win.storage.set("jp-study-progress", "{}");
assert.ok(Number(store["jp-sync-local-ts"]) > 0);

// Grammar か and kana か get separate keys; old shared stats carry over to grammar.
const kana = win.CARD_DATA.alphabet.find((c) => c.front === "か");
const gram = win.CARD_DATA.grammar.find((c) => c.front === "か");
assert.notEqual(win.cardKey(kana), win.cardKey(gram));
const migrated = win.migrateProgress({ cardStats: { "jp::か": { reps: 3 } } });
assert.equal(migrated.cardStats[win.cardKey(gram)].reps, 3);
assert.equal(migrated.cardStats[win.cardKey(kana)].reps, 3);

// An old export with only cardStats still gets dayLog/history (import crash fix).
const old = win.migrateProgress({ cardStats: {} });
assert.ok(old.dayLog && Array.isArray(old.history) && Array.isArray(old.mistakeQueue));

// Shuffle keeps every element.
assert.deepEqual([...win.shuffle([1, 2, 3, 4, 5])].sort(), [1, 2, 3, 4, 5]);

// Users: Diego keeps the original keys; Mariana's are separate.
assert.equal(win.userKey("jp-study-progress"), "jp-study-progress");
store["jp-user"] = "Mariana";
assert.equal(win.userKey("jp-study-progress"), "jp-study-progress:mariana");
assert.equal(win.kvSync.getId(), "nihongo-mariana");
store["jp-user"] = "Someone";
assert.equal(win.getUser(), "Diego");
delete store["jp-user"];
assert.equal(win.kvSync.getId(), "nihongo-diego");
assert.match(win.kvSync.getId(), /^[A-Za-z0-9_-]{8,64}$/); // must pass the server's ID check

console.log("✓ sync + migration + user checks passed");
