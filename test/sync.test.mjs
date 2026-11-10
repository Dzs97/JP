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
  document: { addEventListener() {}, hidden: false, createElement: () => ({}), head: { appendChild() {} } },
  React: { createElement() {}, Fragment: {} },
  EventTarget, CustomEvent, crypto, setTimeout, clearTimeout, console,
  // Sync is always on now, so its timers fire during the test; answer like an empty server.
  fetch: async () => ({ ok: true, json: async () => ({ value: null, updatedAt: 0 }) }),
};
win.window = win;
vm.createContext(win);
for (const f of ["src/data.js", "src/engine.js", "src/extras-sync.js", "src/rewards.js"]) {
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

// First contact keeps the copy with more answers, whatever the timestamps say.
const prog = (n) => JSON.stringify({ totalAnswered: n });
assert.equal(pick(0, { value: prog(0), updatedAt: 999 }, false, true, prog(120)), "push"); // empty cloud can't wipe local
assert.equal(pick(999, { value: prog(80), updatedAt: 1 }, false, true, prog(0)), "pull");  // fresh install takes the cloud
assert.equal(pick(0, { value: prog(5), updatedAt: 1 }, false, true, null), "pull");        // nothing local
assert.equal(pick(0, { value: prog(5), updatedAt: 1 }, false, true, prog(5)), "pull");     // tie: take the cloud

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
assert.equal(win.kvSync.getId(), "nihongo-main"); // the record main already syncs to
assert.match(win.kvSync.getId(), /^[A-Za-z0-9_-]{8,64}$/); // must pass the server's ID check

// Streak only counts while unbroken; best streak survives a break.
const dayStr = (ago) => { const d = new Date(); d.setDate(d.getDate() - ago); return d.toDateString(); };
assert.equal(win.currentStreak({ streakDays: 4, lastStudied: dayStr(0) }), 4);
assert.equal(win.currentStreak({ streakDays: 4, lastStudied: dayStr(1) }), 4);
assert.equal(win.currentStreak({ streakDays: 4, lastStudied: dayStr(2) }), 0);
assert.equal(win.migrateProgress({ streakDays: 6 }).bestStreak, 6);
const sp = { streakDays: 4, lastStudied: dayStr(1), bestStreak: 4 };
win.markStudied(sp); win.markStudied(sp);           // a course step or answer today extends once
assert.equal(sp.streakDays, 5); assert.equal(sp.bestStreak, 5);
const broken = { streakDays: 9, lastStudied: dayStr(3), bestStreak: 9 };
win.markStudied(broken);
assert.equal(broken.streakDays, 1); assert.equal(broken.bestStreak, 9);

// Badges: awarded once, kept forever, returned only when new.
const p = win.migrateProgress({ totalAnswered: 120, bestStreak: 3,
  cardStats: { a: { attempts: 3, correct: 3 } }, history: [{ score: 100, cards: 10 }] });
const fresh = win.awardBadges(p);
assert.deepEqual([...fresh].sort(), ["answers-100", "first-card", "mastered-1", "perfect", "streak-3"]);
assert.equal(win.awardBadges(p).length, 0);         // nothing new the second time
p.history = [];                                      // history is capped; earned badges must stay
assert.ok(p.badges.perfect);

// Merge: two devices studied offline; both keep their work.
const phone = { totalAnswered: 30, dailyGoal: 20, cardStats: { a: { attempts: 5, lastSeen: 5 } },
  dayLog: { "2026-11-08": { cards: 30 } }, badges: { "first-card": 100 }, streakDays: 3, lastStudied: dayStr(0),
  history: [{ date: "x", score: 90 }], course: { lessons: { L1: { passed: true, passedAt: 7, best: 80 } }, days: { d: { speak: true } } } };
const laptop = { totalAnswered: 25, dailyGoal: 30, cardStats: { a: { attempts: 2 }, b: { attempts: 1 } },
  dayLog: { "2026-11-09": { cards: 12 } }, badges: { "first-card": 50, perfect: 60 }, streakDays: 2, lastStudied: dayStr(1),
  history: [{ date: "x", score: 90 }, { date: "y", score: 100 }], course: { lessons: { L1: { best: 95 } }, days: { d: { listen: true } } } };
const m = win.mergeProgress(phone, laptop, false);
assert.equal(m.totalAnswered, 30);
assert.equal(m.cardStats.a.attempts, 5); assert.ok(m.cardStats.b);
assert.equal(m.dayLog["2026-11-08"].cards, 30); assert.equal(m.dayLog["2026-11-09"].cards, 12);
assert.equal(m.badges["first-card"], 50); assert.ok(m.badges.perfect);
assert.equal(m.history.length, 2);                   // shared entry not duplicated
assert.equal(m.streakDays, 3);                        // most recent study wins
assert.equal(m.dailyGoal, 30);                        // settings come from the newer copy
assert.ok(m.course.lessons.L1.passed); assert.equal(m.course.lessons.L1.best, 95);
assert.ok(m.course.days.d.speak && m.course.days.d.listen);
assert.equal(JSON.stringify(win.mergeProgress(m, m, true)), JSON.stringify(win.mergeProgress(m, m, false))); // stable
// A reset on one device wins over the other's old progress.
assert.equal(win.mergeProgress({ ...win.emptyProgress(), resetAt: 9 }, phone, false).totalAnswered, 0);

// End to end: a pull with differing copies merges locally and pushes the result.
await new Promise((r) => setTimeout(r, 500));        // let the start-up pull finish first
store["jp-sync-joined"] = "1";
store["jp-study-progress"] = JSON.stringify(phone);
store["jp-sync-local-ts"] = "100";
const posts = [];
win.fetch = async (url, opts) => {
  if (opts && opts.method === "POST") { posts.push(JSON.parse(opts.body)); return { ok: true, json: async () => ({}) }; }
  return { ok: true, json: async () => ({ value: JSON.stringify(laptop), updatedAt: 200 }) };
};
await win.kvSync.doPull();
const local = JSON.parse(store["jp-study-progress"]);
assert.equal(local.totalAnswered, 30); assert.ok(local.cardStats.b && local.badges.perfect);
await new Promise((r) => setTimeout(r, 3000));       // debounced push (start-up pull may restart it)
assert.equal(posts.length, 1); assert.equal(JSON.parse(posts[0].value).cardStats.a.attempts, 5);

console.log("✓ sync + migration + user + rewards checks passed");
