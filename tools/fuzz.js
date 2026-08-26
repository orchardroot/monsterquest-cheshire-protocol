// =============================================================
// MonsterQuest v2 — tools/fuzz.js
//
// A monkey with a seed. Boots the real game (tools/playtest.js), then
// plays it badly for thousands of frames: random walking, random A/B,
// the pause menu, doors, and — with --hostile — every battle rigged so
// it is lost, which is how you find out what the game does when you
// are out of monsters. Every frame the playtest invariants are checked;
// the first violation stops the run and prints enough to replay it.
//
//   node tools/fuzz.js [--runs=8] [--steps=1500] [--seed=1] [--hostile]
//                      [--ui] [--difficulty=normal] [--full] [--no-roam]
//                      [--keep-going] [--verbose] [--out=fuzz-out]
//
//   --steps     actions per run (each action is 1..40 frames)
//   --hostile   party at 1 HP and a level-60 foe in every fight; grass
//               rolls an encounter every step
//   --ui        drive the real BattleScene with input instead of autoRun
//   --full      boot through the real title screen and the opening
//               (default is the story's quick hand-off)
//   --no-roam   stay on foot; by default 3% of actions drop the player on
//               a random map's spawn point so every region gets walked
//   --keep-going  do not stop a run at its first violation
//
// Same seed + same flags = same run. Violations are also written as JSON
// to --out (default fuzz-out/, git-ignored) for a closer look.
// =============================================================
"use strict";
const fs = require("fs");
const path = require("path");
const PT = require("./playtest");

const args = {};
process.argv.slice(2).forEach(function (a) { const m = /^--([^=]+)=(.*)$/.exec(a); if (m) args[m[1]] = m[2]; else if (a.slice(0, 2) === "--") args[a.slice(2)] = true; });
const RUNS = Number(args.runs) || 8;
const STEPS = Number(args.steps) || 1500;
const SEED0 = Number(args.seed) || 1;
const OUT = path.resolve(process.cwd(), args.out || "fuzz-out");

const DIRS = ["up", "down", "left", "right"];

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function irange(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

async function oneRun(seed) {
  const s = await PT.boot({
    seed: seed, quick: !args.full, ui: !!args.ui, difficulty: args.difficulty || "normal",
    renderEvery: 20, driven: true, verbose: !!args.verbose
  });
  const MQ = s.MQ, rng = s.rng;
  const maps = {};
  maps[s.mapId()] = true;
  if (args.hostile) {
    s.rig({ partyHp: 1, enemyLevel: 60 });
    MQ.Encounters.rateFor = function () { return 1; };
  }
  let stopped = null;
  for (let i = 0; i < STEPS; i++) {
    const top = s.topId();
    const r = rng();
    try {
      if (top === "battle") {
        // the real BattleScene (--ui): mostly A, sometimes move the cursor, rarely back out
        if (r < 0.8) await s.press("a"); else if (r < 0.9) await s.press("down"); else await s.press("b");
      } else if (top !== "overworld") {
        // some menu: poke it, then try to leave
        if (r < 0.3) await s.press(pick(rng, DIRS)); else if (r < 0.5) await s.press("a"); else await s.press("b");
      } else if (r < 0.5) {
        await s.hold(pick(rng, DIRS), irange(rng, 4, 40));
      } else if (r < 0.62) {
        await s.press("a");
      } else if (r < 0.7) {
        await s.press("b");
      } else if (r < 0.76) {
        await s.press("start");
        if (rng() < 0.5) { await s.press("down", irange(rng, 0, 4)); await s.press("a"); await s.pump(5); }
        await s.press("b", 3);
      } else if (r < 0.79 && !args["no-roam"]) {
        // roam: drop onto a random map's spawn point, the way rail and
        // beacons do — random walking from the flat never reaches Chester
        const ids = MQ.World.ids();
        const id = ids[Math.floor(rng() * ids.length)];
        s.note("roam " + id);
        await MQ.Overworld.warpTo(id, { fade: false });
        await s.settle(600).catch(function () {});
      } else if (r < 0.9) {
        // walk to a random tile in reach (BFS keeps it honest)
        const t = s.tile();
        const goal = s.nearestTile(function (x, y) { return Math.abs(x - t.x) + Math.abs(y - t.y) >= irange(rng, 3, 10) && rng() < 0.3; });
        if (goal) await s.walkTo(goal.x, goal.y, { settle: 900 }); else await s.hold(pick(rng, DIRS), 10);
      } else if (r < 0.96) {
        // through the nearest door or edge: explore
        const map = s.map();
        const goal = s.nearestTile(function (x, y) { const w = MQ.World.warpAt(map, x, y); return !!(w && w.kind !== "look"); });
        if (goal) await s.walkTo(goal.x, goal.y, { settle: 900 }); else await s.pump(10);
      } else {
        await s.pump(irange(rng, 10, 60));
      }
    } catch (e) {
      s.violate("driver-error", e && e.stack ? e.stack : String(e));
    }
    if (s.mapId()) maps[s.mapId()] = true;
    if (s.violations.length && !args["keep-going"]) { stopped = i; break; }
  }
  const summary = {
    seed: seed, frames: s.frame, actions: stopped === null ? STEPS : stopped + 1, maps: Object.keys(maps),
    battles: s.battles.length,
    outcomes: s.battles.reduce(function (o, b) { o[b.outcome || "?"] = (o[b.outcome || "?"] || 0) + 1; return o; }, {}),
    warnings: s.warnings.length, violations: s.violations, finalState: s.state()
  };
  s.close();
  return summary;
}

(async function () {
  let failed = 0;
  console.log("fuzz: " + RUNS + " runs x " + STEPS + " actions, seed " + SEED0 + (args.hostile ? ", hostile" : "") + (args.ui ? ", real battle UI" : "") + (args.full ? ", full boot" : ""));
  for (let i = 0; i < RUNS; i++) {
    const seed = SEED0 + i;
    let sum;
    try { sum = await oneRun(seed); }
    catch (e) { failed++; console.log("seed " + seed + ": CRASH " + (e && e.stack || e)); continue; }
    const line = "seed " + seed + ": " + sum.frames + " frames, " + sum.maps.length + " maps, " + sum.battles + " battles " + JSON.stringify(sum.outcomes) + ", " + sum.warnings + " warnings";
    if (!sum.violations.length) { console.log(line + " — ok"); continue; }
    failed++;
    console.log(line + " — " + sum.violations.length + " VIOLATION" + (sum.violations.length > 1 ? "S" : ""));
    sum.violations.forEach(function (v) {
      console.log("  " + v.id + " @frame " + v.frame + ": " + v.detail);
      console.log("    state: " + JSON.stringify(v.state));
      console.log("    last actions: " + v.actions.join("  "));
    });
    try {
      fs.mkdirSync(OUT, { recursive: true });
      const f = path.join(OUT, "seed-" + seed + (args.hostile ? "-hostile" : "") + (args.ui ? "-ui" : "") + ".json");
      fs.writeFileSync(f, JSON.stringify(sum, null, 2));
      console.log("    written " + path.relative(process.cwd(), f));
    } catch (e) { console.log("    (could not write report: " + e.message + ")"); }
  }
  console.log(failed ? failed + " of " + RUNS + " runs had violations" : "all " + RUNS + " runs clean");
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error(e && e.stack || e); process.exit(2); });
