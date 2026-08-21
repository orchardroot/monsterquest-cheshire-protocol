// MonsterQuest v2 — repeat-interaction harness.
//
// For every map in MQ.World, and every NPC/sign/trigger/item on it, this
// runs the real interaction pipeline (MQ.Interact.press for npcs/signs/
// items; the same dispatch MQ.Overworld's tile-enter handler uses for
// triggers) to completion under MQ.Dialog.auto, a second time, and a third
// time, on the SAME game state (so a script's own flag checks see exactly
// what a player revisiting it would see). It then asserts the whole
// "repeat interaction" contract:
//
//  (a) a one-off scripted event (sets a story flag / gives an item / starts
//      a battle or quest) must not repeat its first-time reward commands —
//      the second run must either fire none of them, or the entity must be
//      gated off entirely (no longer reachable);
//  (b) a repeatable chatter NPC may repeat, but must not sit on an ungated
//      giveItem/giveMonster/giveMoney/quest.start/quest.advance/battle/
//      unlock/achievement command;
//  (c) no interaction may end with the player frozen (MQ.Overworld.locked()
//      true with no script running) or a dialogue box still open;
//  (d) a beaten trainer must not re-fight, and a one-time item pickup must
//      not re-give.
//
// A story-gated entity (its `cond` needs flags a fresh visit wouldn't have)
// is deliberately reached anyway: the harness bypasses `cond` so it can
// exercise the script's OWN idempotency, but always respects `once` (the
// mechanism that is supposed to make an entity stop being reachable) and,
// for items, the pickup flag — those are exactly the gates under test.
"use strict";
const H = require("../headless");

const REWARD_TYPES = ["giveItem", "giveMoney", "giveMonster", "questStart", "questAdvance", "questComplete", "battle", "unlock", "achievement"];
const MAX_STEPS = 1500;

function instrument(MQ) {
  const rewardLog = [], flagLog = [];
  const exec = MQ.Script.executors;
  REWARD_TYPES.forEach(function (name) {
    const orig = exec[name];
    if (!orig) return;
    exec[name] = function (a, ctx) { rewardLog.push({ type: name, args: a }); return orig(a, ctx); };
  });
  const origSetFlag = exec.setFlag;
  exec.setFlag = function (a, ctx) { flagLog.push({ id: a[0], val: a[1] }); return origSetFlag(a, ctx); };
  const transcript = [];
  const origSay = MQ.Dialog.say;
  MQ.Dialog.say = function (pages, opts) {
    const text = Array.isArray(pages) ? pages.join(" / ") : String(pages);
    transcript.push((opts && opts.name ? opts.name + ": " : "") + text);
    return origSay(pages, opts);
  };
  return { rewardLog: rewardLog, flagLog: flagLog, transcript: transcript };
}

// Pumps until the interaction promise (if any) settles AND the world is
// idle again. If something pushed a scene MQ.Interact never expects a
// headless caller to drive (a shop, a minigame, a box…) and nothing else is
// moving things forward, nudge it with a 'b' press — same as a player
// backing out — so a stray UI scene doesn't read as a hang.
function pumpToIdle(env, MQ, p) {
  let settled = !p || typeof p.then !== "function";
  let perr = null;
  if (!settled) p.then(function () { settled = true; }, function (e) { settled = true; perr = e; });
  let i = 0;
  return new Promise(function (resolve, reject) {
    (function loop() {
      const top = MQ.Scenes.top();
      const idle = settled && !MQ.Script.busy() && !MQ.Dialog.isOpen() && !MQ.Overworld.busy() && top === MQ.Overworld;
      if (idle) return perr ? reject(perr) : resolve();
      if (i++ >= MAX_STEPS) {
        return reject(new Error("timed out after " + MAX_STEPS + " steps (settled=" + settled + " scriptBusy=" + MQ.Script.busy() +
          " dialogOpen=" + MQ.Dialog.isOpen() + " owBusy=" + MQ.Overworld.busy() + " top=" + (top && (top.id || "?")) + ")"));
      }
      if (top !== MQ.Overworld) MQ.Input.inject("b");
      env.step(1);
      setImmediate(loop);
    })();
  });
}

function approachTile(MQ, map, ex, ey) {
  const W = MQ.World;
  const opts = [
    { x: ex, y: ey + 1, dir: "up" }, { x: ex, y: ey - 1, dir: "down" },
    { x: ex + 1, y: ey, dir: "left" }, { x: ex - 1, y: ey, dir: "right" }
  ];
  for (let i = 0; i < opts.length; i++) {
    const o = opts[i];
    if (W.inBounds(map, o.x, o.y) && !W.isSolid(map, o.x, o.y)) return o;
  }
  return { x: ex, y: ey, dir: "down" };
}

// npc / sign / item: the real MQ.Interact.press pipeline, facing the tile.
function runPress(env, MQ, map, ex, ey) {
  const app = approachTile(MQ, map, ex, ey);
  MQ.Overworld.place(app.x, app.y, app.dir);
  const world = { map: map, player: MQ.Overworld.player, npcAt: MQ.Overworld.npcAt };
  const p = MQ.Interact.press(world);
  const reached = p !== null;
  return pumpToIdle(env, MQ, p).then(function () { return reached; });
}

// triggers fire on tile-enter, not on facing+press: mirror Overworld's own
// dispatch (js/world/overworld.js onTileEnter). `cond` is bypassed only on
// the first (reachability) attempt — later attempts re-check it for real,
// so a trigger that gates itself on its own flag is correctly seen as
// "gated off" rather than flagged as a false repeat.
function runTrigger(env, MQ, map, tr, bypassCond) {
  if (tr.kind === "interact") return Promise.resolve(false);
  if (tr.once && MQ.Flags.get(tr.once)) return Promise.resolve(false);
  if (!bypassCond && tr.cond && !MQ.Flags.test(tr.cond)) return Promise.resolve(false);
  const scripts = (MQ.Story && (MQ.Story.npcScripts || MQ.Story.scripts)) || {};
  const fn = scripts[tr.script] || (MQ.Story.scripts && MQ.Story.scripts[tr.script]);
  if (!fn) return Promise.resolve(false);
  if (tr.once) MQ.Flags.set(tr.once, true);
  const p = MQ.Script.run(fn, { map: map, player: MQ.Overworld.player, trigger: tr, S: MQ.Script.cmds });
  return pumpToIdle(env, MQ, p).then(function () { return true; });
}

module.exports = function (t, assert) {
  t("no map/npc/sign/trigger/item loops a one-off event or leaves the player stuck", function () {
    const state = {};
    function boot() {
      state.env = H.load();
      state.MQ = state.env.MQ;
      state.inst = instrument(state.MQ);
      state.MQ.Dialog.auto = true;
      state.MQ.Dialog.autoChoice = 0;
      // Late-chapter baseline: a lot of quests/npcs gate on `chapter >= N`
      // (MQ.Quests' `opens` clause, story cond checks). A fresh new-game
      // flag set makes that gate permanently fail, so `quest.start` silently
      // no-ops every single visit — a harness artefact, not a real repeat
      // (by the time a player can physically reach these maps the chapter
      // flag is already there). Bypassing npc/trigger `cond` doesn't reach
      // this because it's inside MQ.Quests' own logic, not the entity's.
      state.MQ.Flags.set("chapter", 12);
    }
    boot();
    const W0 = state.MQ.World;
    const violations = [];
    const notes = [];
    let skipped = 0;

    const mapIds = W0.ids().filter(function (id) { const m = W0.get(id); return m && m.legend; });

    function testOne(mapId, kind, entId, label, doAttempt) {
      // doAttempt(map) is called with the LIVE state (env/MQ may be a freshly
      // rebooted instance if a previous entity hung) — it must look everything
      // up through state, never close over a stale MQ/env.
      return function () {
        const env = state.env, MQ = state.MQ, inst = state.inst, W = MQ.World;
        const map = W.get(mapId);
        MQ.Scenes.replace(MQ.Overworld, { map: mapId, x: map.spawnPoint ? map.spawnPoint.x : 1, y: map.spawnPoint ? map.spawnPoint.y : 1, dir: "down" });
        env.step(1);
        const base = MQ.Save.snapshot();
        const runs = [];
        let chain = Promise.resolve();
        for (let r = 0; r < 3; r++) {
          chain = chain.then(function () {
            inst.rewardLog.length = 0; inst.flagLog.length = 0; inst.transcript.length = 0;
            return doAttempt(env, MQ, map, r).then(function (reached) {
              const lockedStuck = MQ.Overworld.locked() && !MQ.Script.busy();
              const dialogOpen = MQ.Dialog.isOpen();
              runs.push({
                reached: reached,
                text: inst.transcript.join(" || "),
                rewards: inst.rewardLog.slice(),
                flags: inst.flagLog.slice(),
                lockedStuck: lockedStuck,
                dialogOpen: dialogOpen
              });
            }, function (err) {
              runs.push({ reached: true, text: "", rewards: [], flags: [], error: String(err && err.message || err) });
            });
          });
        }
        return chain.then(function () {
          const hung = runs.some(function (r) { return r.error; });
          if (hung) {
            // don't trust global engine state (Script.running / Overworld's
            // busy counter) after a timeout — reboot clean before the next
            // entity so one hang can't cascade into thousands of false ones.
            boot();
          } else {
            MQ.Save.apply(base);
          }
          const r1 = runs[0], r2 = runs[1], r3 = runs[2];
          const where = mapId + " / " + kind + " " + entId + (label ? " (" + label + ")" : "");

          function report(v) { violations.push(v); console.log("  VIOLATION " + v); }
          [r1, r2, r3].forEach(function (r, idx) {
            if (r.error) report(where + ": run " + (idx + 1) + " errored/timed out — " + r.error);
            else if (r.lockedStuck) report(where + ": run " + (idx + 1) + " ended frozen (Overworld.locked() with no script running)");
            else if (r.dialogOpen) report(where + ": run " + (idx + 1) + " ended with a dialogue box still open");
          });
          if (r1.error || r2.error) return;

          function sig(list) { return list.map(function (c) { return c.type + ":" + JSON.stringify(c.args); }).sort().join("|"); }
          const r1Reward = sig(r1.rewards), r2Reward = sig(r2.rewards), r3Reward = sig(r3.rewards);

          if (r1.rewards.length && r1.reached) {
            // one-off scripted event: run 2 must not repeat ANY reward command from run 1
            const repeatedIn2 = r2.rewards.filter(function (c) { return r1.rewards.some(function (o) { return o.type === c.type && JSON.stringify(o.args) === JSON.stringify(c.args); }); });
            if (r2.reached && repeatedIn2.length) {
              report(where + ": one-off reward repeats on 2nd visit — " + repeatedIn2.map(function (c) { return c.type; }).join(",") + " — text: \"" + r2.text + "\"");
            } else if (r3.reached) {
              const repeatedIn3 = r3.rewards.filter(function (c) { return r1.rewards.some(function (o) { return o.type === c.type && JSON.stringify(o.args) === JSON.stringify(c.args); }); });
              if (repeatedIn3.length) report(where + ": one-off reward repeats on 3rd visit — " + repeatedIn3.map(function (c) { return c.type; }).join(",") + " — text: \"" + r3.text + "\"");
            }
          }
          if (kind === "npc" && r1.reached && r2.reached && r1.text && r1.text === r2.text && r1.rewards.length === 0 && r1.flags.length === 0) {
            // pure chatter repeating verbatim word-for-word every visit is allowed
            // (that's the "repeatable chatter" case) — only flag it if it ALSO
            // never varies across all three runs AND the map has more than one
            // chatter line available would be nice to check, but we can't know
            // the pool size here, so this branch intentionally records nothing.
          }
          notes.push(where + ": r1=[" + r1Reward + "] r2=[" + r2Reward + "] r3=[" + r3Reward + "]");
        });
      };
    }

    // Build the full list of per-entity checks, then run them one at a time
    // (each returns a function so tests execute sequentially, not all at once).
    // Shops and other tile/npc "kind" handlers (machines, minigames, the box…)
    // push a UI scene a headless caller can't browse and aren't story events
    // anyway — out of scope for this audit, skipped rather than faked.
    const checks = [];
    mapIds.forEach(function (mapId) {
      const m = W0.get(mapId);
      (m.npcs || []).forEach(function (n) {
        if (n.shop || n.kind) { skipped++; return; }
        checks.push(testOne(mapId, "npc", n.id, n.trainer ? "trainer:" + n.trainer : (n.script || "say"), function (env, MQ, map, r) {
          const ent = MQ.Overworld.getNpc(n.id);
          if (!ent) return Promise.resolve(false);
          // bypass `cond` only to reach it the first time (external prerequisite
          // flags we haven't simulated); later runs see the REAL cond, so an
          // entity that gates itself correctly (cond references its own flag)
          // reads as "gated off", not a false repeat.
          if (r === 0) { ent._origCond = ent.cond; ent.cond = null; }
          else if (ent._origCond !== undefined) ent.cond = ent._origCond;
          return runPress(env, MQ, map, ent.x, ent.y);
        }));
      });
      (m.triggers || []).forEach(function (tr, i) {
        checks.push(testOne(mapId, "trigger", tr.script || ("#" + i), tr.x + "," + tr.y, function (env, MQ, map, r) {
          return runTrigger(env, MQ, map, tr, r === 0);
        }));
      });
      (m.items || []).forEach(function (it, i) {
        checks.push(testOne(mapId, "item", it.item + "@" + it.x + "," + it.y, "", function (env, MQ, map) {
          if (MQ.Flags.get(it.flag)) return Promise.resolve(false); // already picked up — correctly gated
          return runPress(env, MQ, map, it.x, it.y);
        }));
      });
      (m.signs || []).forEach(function (s, i) {
        checks.push(testOne(mapId, "sign", (s.x + "," + s.y), "", function (env, MQ, map) {
          return runPress(env, MQ, map, s.x, s.y);
        }));
      });
    });

    console.log("  [npc-loops] " + checks.length + " entities queued across " + mapIds.length + " maps (" + skipped + " skipped)");
    let chain = Promise.resolve();
    checks.forEach(function (fn, idx) {
      chain = chain.then(function () {
        if (idx % 200 === 0) console.log("  [npc-loops] " + idx + "/" + checks.length + "…");
        return fn();
      });
    });
    return chain.then(function () {
      console.log("  [npc-loops] " + checks.length + " entities tested (" + skipped + " shop/machine npcs skipped), " +
        violations.length + " violations, across " + mapIds.length + " maps.");
      if (violations.length) {
        assert.fail(violations.length + " repeat-interaction violations across " + checks.length + " entities:\n" + violations.join("\n"));
      }
    });
  });
};
