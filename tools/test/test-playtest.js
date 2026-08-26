// Playtest regressions: the loss → respawn loop, driven through the real
// overworld with tools/playtest.js rather than by poking one subsystem.
//
// Two bugs reported from the tablet, both in this file:
//   * lose a battle and you do not come round anywhere sensible (or at all);
//   * with every monster fainted, battles keep starting — the "nothing to
//     fight with but fights keep coming" loop.
"use strict";
const PT = require("../playtest");

const LOSS_IDS = ["battle-with-wiped-party", "no-respawn-after-loss", "wiped-freewalk", "softlock", "unhandled-rejection"];

function bad(s) { return s.violations.filter(function (v) { return LOSS_IDS.indexOf(v.id) >= 0; }).map(function (v) { return v.id + "@" + v.frame + ": " + v.detail; }); }

// A route-ish map with a real grass table and no heal point of its own.
function grassMapWithoutKettle(MQ) {
  const ids = MQ.World.ids().slice().sort();
  const pick = function (pred) {
    for (let i = 0; i < ids.length; i++) {
      const m = MQ.World.get(ids[i]);
      if (!pred(ids[i], m)) continue;
      if (!m.encounters || !m.encounters.grass || !MQ.Data.encounters[m.encounters.grass] || m.healPoint) continue;
      for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
        if (MQ.World.zoneAt(m, x, y) === "grass" && !MQ.World.blocked(m, x, y, null) && !MQ.World.warpAt(m, x, y)) return { id: ids[i], x: x, y: y };
      }
    }
    return null;
  };
  return pick(function (id) { return /route/.test(id); }) || pick(function () { return true; });
}

function isGrass(s) { return function (x, y, map) { return s.MQ.World.zoneAt(map, x, y) === "grass"; }; }

// Wander between grass tiles until something interrupts (a battle) or we
// run out of steps. Resolves the number of tiles walked.
async function wanderGrass(s, tiles) {
  let n = 0;
  while (n < tiles) {
    const here = s.tile();
    const g = s.nearestTile(function (x, y, map) { return isGrass(s)(x, y, map) && (x !== here.x || y !== here.y); });
    if (!g) throw new Error("no grass reachable from " + here.x + "," + here.y + " on " + s.mapId());
    const r = await s.walkTo(g.x, g.y);
    n++;
    if (r.interrupted) return n;
    if (!r.reached) throw new Error("could not reach grass: " + r.reason);
  }
  return n;
}

async function dropIntoGrass(s) {
  const spot = grassMapWithoutKettle(s.MQ);
  if (!spot) throw new Error("no grass map without a heal point in the world");
  await s.MQ.Overworld.warp(spot.id, spot.x, spot.y, "down", { fade: false });
  await s.settle(600);
  s.MQ.Overworld.state.respawn = null;                 // no kettle visited yet
  s.MQ.Encounters.rateFor = function () { return 1; };  // every grass step rolls
  return spot;
}

module.exports = function (t, assert) {
  t("losing a wild battle before any care centre puts you somewhere walkable, healed, and the encounters stop", async function () {
    const s = await PT.boot({ quick: true, seed: 11 });
    try {
      const spot = await dropIntoGrass(s);
      s.rig({ partyHp: 1, enemyLevel: 60 });            // this fight is lost
      await wanderGrass(s, 40);
      await s.settle(1500);
      assert.ok(s.battles.length >= 1, "a wild battle happened on " + spot.id);
      assert.strictEqual(s.battles[0].outcome, "lose", "and it was lost");
      assert.deepStrictEqual(bad(s), [], "the loss ended at a kettle");
      assert.strictEqual(s.alive(), s.party().length, "everyone is back on their feet");
      const t0 = s.tile();
      assert.ok(s.walkable(t0.x, t0.y), "respawned on a walkable tile of " + s.mapId() + " (" + t0.x + "," + t0.y + ")");
      const m = s.map();
      assert.ok(m.healPoint || s.mapId() === s.MQ.Story.START.map || s.MQ.Overworld.state.respawn, "came round somewhere with a kettle, not " + s.mapId());
      // and walking on from there is a normal game, not a loop of instant losses
      s.rig(null);
      const before = s.battles.length;
      await dropIntoGrass(s);
      await wanderGrass(s, 12);
      await s.settle(1500);
      assert.deepStrictEqual(bad(s), [], "no battle started with a wiped party afterwards (" + (s.battles.length - before) + " more battles)");
    } finally { s.close(); }
  });

  t("losing a scripted story battle still ends at a kettle once the script is done", async function () {
    const s = await PT.boot({ quick: true, seed: 12 });
    try {
      const MQ = s.MQ;
      MQ.Overworld.state.respawn = null;
      s.rig({ partyHp: 1, enemyLevel: 60 });
      let scriptResult = null, scriptDone = false;
      MQ.Script.run(function* (ctx) {
        const r = yield ctx.S.battle({ kind: "trainer", trainer: "vex_1" });
        scriptResult = r;
        yield ctx.S.say(["Bar's on the floor and you're under it."], { name: "VEX" });
      }, {}).then(function () { scriptDone = true; }, function (e) { throw e; });
      // the script needs frames to play its dialogue, so pump rather than await it
      await s.until(function () { return scriptDone; }, 900, "the script (battle + a line) to finish");
      await s.settle(1500);
      assert.ok(scriptResult.lost, "the script saw the loss");
      assert.deepStrictEqual(bad(s), [], "the scripted loss ended at a kettle");
      assert.strictEqual(s.alive(), s.party().length, "everyone healed after the script");
    } finally { s.close(); }
  });

  t("a wiped party is never pulled into a wild battle or a trainer challenge", async function () {
    const s = await PT.boot({ quick: true, seed: 13 });
    try {
      await dropIntoGrass(s);
      s.party().forEach(function (m) { m.hp = 0; });     // the state the loop leaves you in
      await wanderGrass(s, 30);
      await s.settle(1500);
      const started = s.battles.filter(function (b) { return b.alive === 0; });
      assert.strictEqual(started.length, 0, "no battle began with nobody to fight (" + started.length + " did)");
      // (wiped-freewalk fires the instant we zero the HP by hand; that is the
      // setup, not the game — what matters is what the game does next)
      const worse = bad(s).filter(function (v) { return v.indexOf("wiped-freewalk") !== 0; });
      assert.deepStrictEqual(worse, [], "the game noticed and recovered instead");
      assert.strictEqual(s.alive(), s.party().length, "the party was healed");
    } finally { s.close(); }
  });

  t("recover() with no kettle visited and no heal point here still lands you somewhere walkable", async function () {
    const s = await PT.boot({ quick: true, seed: 14 });
    try {
      const MQ = s.MQ;
      await dropIntoGrass(s);
      const from = s.mapId();
      s.party().forEach(function (m) { m.hp = 0; });
      let done = false;
      MQ.Overworld.recover().then(function () { done = true; });
      await s.until(function () { return done; }, 900, "recover() (a fade and a line) to finish");
      await s.settle(1500);
      const t0 = s.tile();
      assert.ok(s.walkable(t0.x, t0.y), "walkable tile on " + s.mapId());
      assert.ok(s.map().healPoint || s.mapId() === MQ.Story.START.map, "somewhere with a kettle (was " + from + ", now " + s.mapId() + ")");
      assert.strictEqual(s.alive(), s.party().length, "healed");
    } finally { s.close(); }
  });
};
