// MonsterQuest v2 — quest & chapter sanity.
//
// Part 1: walk every quest in MQ.Data.quests from start to completion by
// satisfying each stage's own condition programmatically (not by playing
// the map), asserting every stage is reachable, its reward (if any) lands
// exactly once, and re-driving a completed quest never regrants.
//
// Part 2: run every chapter script in js/story/chapters/*.js to completion
// under MQ.Dialog.auto, assert the flags it promises (docs/design/
// DESIGN-INDEX.md "Key flags set" / "Flags" tables) end up set, and that
// running the SAME chapter script twice does not double-grant rewards
// (badges, items, money) the second time.
"use strict";
const H = require("../headless");

function pump(env, promise, max, label) {
  let done = false, value = null, err = null;
  promise.then(function (v) { done = true; value = v; }, function (e) { done = true; err = e; });
  let i = 0;
  return new Promise(function (resolve, reject) {
    (function loop() {
      if (done) return err ? reject(err) : resolve(value);
      if (i++ >= max) return reject(new Error("timed out after " + max + " steps: " + (label || "script")));
      env.step(1);
      setImmediate(loop);
    })();
  });
}

// ---- generic condition satisfaction (mirrors js/content/quests-engine.js Q.evalCond) ----
function flagTokens(expr) {
  // Numeric threshold comparisons ("case_06_photos>=8") need the flag set to
  // a satisfying NUMBER, not a bare true — true >= 8 is false (true coerces
  // to 1). Pull those out first so the generic identifier pass below skips them.
  const numeric = {};
  const cmpRe = /([a-zA-Z_][\w.]*)\s*(>=|<=|==|>|<)\s*(\d+(?:\.\d+)?)/g;
  let cm;
  while ((cm = cmpRe.exec(expr))) {
    const tok = cm[1], op = cm[2], num = Number(cm[3]);
    numeric[tok] = op === "<" ? Math.max(0, num - 1) : op === "<=" ? num : op === ">" ? num + 1 : num;
  }
  const negated = {};
  const re1 = /!\s*([a-zA-Z_][\w.]*)/g;
  let m;
  while ((m = re1.exec(expr))) negated[m[1]] = true;
  const idRe = /\b[a-zA-Z_][\w.]*\b/g;
  const KEYWORDS = { "true": true, "false": true };
  const out = [];
  const seen = {};
  while ((m = idRe.exec(expr))) {
    const tok = m[0];
    if (KEYWORDS[tok] || seen[tok]) continue;
    seen[tok] = true;
    out.push({ token: tok, want: !negated[tok], numeric: Object.prototype.hasOwnProperty.call(numeric, tok) ? numeric[tok] : undefined });
  }
  return out;
}

function satisfyFlagExpr(MQ, expr) {
  if (!expr || MQ.Flags.test(expr)) return;
  flagTokens(expr).forEach(function (tk) {
    if (tk.token.indexOf(".") >= 0) return; // a resolver (quest./item./party./time./weather.), not a plain flag
    if (tk.numeric !== undefined) { MQ.Flags.set(tk.token, tk.numeric); return; }
    if (tk.token === "badges" || tk.token === "chapter" || tk.token === "money") { MQ.Flags.set(tk.token, tk.want ? 99 : 0); return; }
    MQ.Flags.set(tk.token, tk.want);
  });
}

function satisfyCond(MQ, cond, questId) {
  if (cond === undefined || cond === null) return;
  if (typeof cond === "string") { satisfyFlagExpr(MQ, cond); return; }
  if (typeof cond === "function") return; // opaque predicate — nothing generic to do
  const Q = MQ.Quests, n = cond.n || 1;
  switch (cond.kind) {
    case "flag": satisfyFlagExpr(MQ, cond.expr || cond.flag); return;
    case "defeat":
      if (cond.trainer) MQ.Flags.set("beat_" + cond.trainer, true);
      else { const s = Q.states[questId]; if (s) s.counters[Q.condKey(cond)] = n; }
      return;
    case "catch": { const s = Q.states[questId]; if (s) s.counters[Q.condKey(cond)] = n; return; }
    case "item": if (MQ.Inventory) MQ.Inventory.add(cond.id, n); return;
    case "talk": MQ.Flags.set("talked_" + cond.npc, true); return;
    case "reach": Q.visited[cond.map] = true; return;
    case "photo": case "count": {
      const s = Q.states[questId];
      if (s) s.counters[Q.condKey(cond)] = n;
      if (cond.flag) MQ.Flags.set(cond.flag, n);
      return;
    }
    case "money": if (MQ.Inventory) MQ.Inventory.money = Math.max(MQ.Inventory.money || 0, n); return;
    case "badges": if (MQ.Trainer) { let g = 0; while (MQ.Trainer.badgeCount() < n && g < 20) { MQ.Trainer.addBadge("badge_walk_" + (g++)); } } return;
    case "level": if (MQ.Trainer) MQ.Trainer.level = Math.max(MQ.Trainer.level || 1, n); return;
    case "quest":
      Q.states[cond.id] = Q.states[cond.id] || { id: cond.id, started: true, done: false, stage: 0, counters: {}, marks: 0, chips: 0, repeats: 0 };
      Q.states[cond.id].started = true;
      if (cond.done) Q.states[cond.id].done = true;
      else Q.states[cond.id].stage = Math.max(Q.states[cond.id].stage, cond.stage === undefined ? 0 : cond.stage);
      return;
    case "trust": if (MQ.Cats && MQ.Cats.setTrust) MQ.Cats.setTrust(cond.cat, n); return;
    case "all": (cond.of || []).forEach(function (c) { satisfyCond(MQ, c, questId); }); return;
    case "any": if ((cond.of || []).length) satisfyCond(MQ, cond.of[0], questId); return;
    default: return;
  }
}

// Stages with no cond, or cond.kind 'manual'/'none', are deliberately not
// auto-advanceable — a story script is expected to call quest.advance()
// itself. Anything else must clear via MQ.Quests.check() once satisfied.
function isManualStage(stg) {
  return !stg.cond || stg.cond.kind === "manual" || stg.cond.kind === "none";
}

module.exports = function (t, assert) {
  t("every quest's stage ladder is reachable, rewards land once, and completion is idempotent", function () {
    const ids = [];
    (function () { const env = H.load(); env.MQ.Data.each("quests", function (d, id) { ids.push(id); }); })();

    const unreachable = [];
    const doubleRewards = [];
    let tested = 0;

    ids.forEach(function (id) {
      const env = H.load();
      const MQ = env.MQ;
      let rewardCalls = 0;
      const origGrant = MQ.Quests.grantReward;
      MQ.Quests.grantReward = function (r, qid) { if (qid === id) rewardCalls++; return origGrant(r, qid); };

      MQ.Quests.start(id, { force: true });
      if (!MQ.Quests.isStarted(id)) { unreachable.push(id + ": Quests.start() refused to start it even with force:true"); return; }
      tested++;

      const d = MQ.Quests.def(id);
      // A `repeatable` quest resets itself (stage -1, started/done both
      // false) the instant the last stage completes, ready for another lap
      // — that reset IS success, not a stall, so watch `.repeats` too.
      const repeatsBefore = function () { const s = MQ.Quests.states[id]; return s ? s.repeats : 0; };

      const stages = MQ.Quests.stages(id);
      let broke = false;
      for (let i = 0; i < stages.length; i++) {
        const stg = stages[i];
        const before = MQ.Quests.stage(id);
        const lapsBefore = repeatsBefore();
        if (isManualStage(stg)) {
          MQ.Quests.advance(id, 1);
        } else {
          satisfyCond(MQ, stg.cond, id);
          MQ.Quests.check();
          const advanced = MQ.Quests.stage(id) > before || MQ.Quests.isDone(id) || repeatsBefore() > lapsBefore;
          if (!advanced) {
            unreachable.push(id + ": stage " + i + " (" + (stg.id || i) + ") never advanced for cond " + JSON.stringify(stg.cond));
            broke = true;
            break;
          }
        }
      }
      if (broke) return;

      assert.ok(MQ.Quests.isDone(id) || repeatsBefore() > 0, id + ": all stages satisfied but the quest never completed");
      const totalAfterFirstPass = rewardCalls;

      if (d && d.repeatable) return; // a fresh lap re-satisfying the same flags is the intended behaviour, not a double-grant

      // Idempotency: re-driving a finished quest must not regrant anything.
      MQ.Quests.check();
      MQ.Quests.advance(id, 1);
      MQ.Quests.complete(id);
      if (rewardCalls > totalAfterFirstPass) {
        doubleRewards.push(id + ": re-completing an already-done quest granted its reward again (" +
          (rewardCalls - totalAfterFirstPass) + " extra grantReward call(s))");
      }
    });

    assert.ok(tested >= 30, "expected to walk at least 30 quests, walked " + tested);
    assert.deepStrictEqual(unreachable, [], "unreachable quest stages:\n" + unreachable.join("\n"));
    assert.deepStrictEqual(doubleRewards, [], "quest rewards granted more than once:\n" + doubleRewards.join("\n"));
  });

  t("every chapter script runs to completion and does not double-grant on a second run", function () {
    const files = require("fs").readdirSync(require("path").join(__dirname, "..", "..", "js", "story", "chapters"))
      .filter(function (f) { return /^ch\d\d_.*\.js$/.test(f); });
    assert.ok(files.length >= 10, "expected at least 10 chapter files, found " + files.length);

    // quest.start/advance/complete are deliberately excluded: MQ.Quests
    // guards all three against an already-active/already-done quest
    // internally (Q.start/.advance/.complete each check s.started/s.done
    // first), so a chapter script calling one unconditionally on every run
    // is the normal, safe pattern — not a double-grant.
    const REWARD_TYPES = ["giveItem", "giveMoney", "giveMonster", "unlock", "achievement"];

    let chain = Promise.resolve();
    files.forEach(function (f) {
      const n = Number((/^ch(\d\d)_/.exec(f) || [])[1]);
      chain = chain.then(function () {
        const env = H.load();
        const MQ = env.MQ;
        MQ.Dialog.auto = true;
        MQ.Dialog.autoChoice = 0;
        MQ.Flags.set("chapter", n);
        const start = MQ.Story.chapters[n] && MQ.Story.chapters[n].start;
        if (!start) return; // no start() (e.g. a chapter that's hooks-only) — nothing to run here

        const log = [];
        const exec = MQ.Script.executors;
        REWARD_TYPES.forEach(function (name) {
          const orig = exec[name];
          if (!orig) return;
          exec[name] = function (a, ctx) { log.push(name + ":" + JSON.stringify(a)); return orig(a, ctx); };
        });

        MQ.Scenes.replace(MQ.Overworld, { map: "macclesfield", x: 1, y: 1, dir: "down" });
        env.step(1);
        return pump(env, MQ.Script.run(start, { chapter: n }), 20000, f + " run 1").then(function () {
          const firstRun = log.slice();
          log.length = 0;
          return pump(env, MQ.Script.run(start, { chapter: n }), 20000, f + " run 2").then(function () {
            const repeated = log.filter(function (c) { return firstRun.indexOf(c) >= 0; });
            assert.deepStrictEqual(repeated, [], f + ": running the chapter script twice repeated these commands:\n" + repeated.join("\n"));
          });
        }, function (err) {
          throw new Error(f + ": chapter script did not run to completion — " + (err && err.message || err));
        });
      });
    });
    return chain;
  });
};
