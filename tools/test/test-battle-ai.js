// MQ.BattleAI: tiers, determinism under a seeded RNG, and the
// specific behaviours SYSTEMS-SPEC §10 asks for.
"use strict";
const F = require("./test-battle-fixtures");

module.exports = function (t, assert) {
  const env = F.load();
  const MQ = env.MQ;
  const AI = MQ.BattleAI;
  const BE = MQ.BattleEffects;

  function arena(playerSpec, foeSpec, tier, seed, foeMoves, myMoves) {
    const me = F.mon(MQ, playerSpec, 30, myMoves || ["t_tackle"]);
    const foe = F.mon(MQ, foeSpec, 30, foeMoves || ["t_tackle"]);
    const b = F.bench(MQ, { seed: seed === undefined ? 5 : seed });
    b.sides[0].party = [me]; b.sides[1].party = [foe];
    b.sides[0].activeUids = [me.uid]; b.sides[1].activeUids = [foe.uid];
    b.sides[1].ai = tier;
    b.turn = 1;
    return { b: b, me: me, foe: foe };
  }

  t("tier shifting honours difficulty", function () {
    assert.strictEqual(AI.shiftTier("greedy", "normal"), "greedy");
    assert.strictEqual(AI.shiftTier("greedy", "hard"), "smart");
    assert.strictEqual(AI.shiftTier("greedy", "story"), "random");
    assert.strictEqual(AI.shiftTier("random", "story"), "random", "clamped at the bottom");
    assert.strictEqual(AI.shiftTier("random", "nightmare"), "smart", "nightmare makes everyone smart");
  });

  t("decisions are deterministic under a seeded RNG", function () {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const a = arena("t_grass", "t_fire", "greedy", 4242, ["t_tackle", "t_ember", "t_growl"]);
      const act = AI.choose(a.b, a.foe, { tier: "greedy" });
      runs.push(act.type + ":" + act.index);
    }
    assert.strictEqual(runs[0], runs[1]);
    assert.strictEqual(runs[1], runs[2]);
    // A different seed is allowed to differ, but must still be a legal action
    const other = arena("t_grass", "t_fire", "greedy", 99, ["t_tackle", "t_ember", "t_growl"]);
    const act = AI.choose(other.b, other.foe, { tier: "greedy" });
    assert.ok(act.type === "move" || act.type === "switch" || act.type === "overdrive");
  });

  t("greedy picks the type advantage far more often than not", function () {
    let strong = 0;
    for (let s = 0; s < 40; s++) {
      const a = arena("t_grass", "t_fire", "greedy", s, ["t_tackle", "t_ember"]);
      const act = AI.choose(a.b, a.foe, { tier: "greedy" });
      if (act.type === "move" && a.foe.moves[act.index].id === "t_ember") strong++;
    }
    assert.ok(strong >= 30, "greedy chose Fire vs Grass " + strong + "/40 times (20% second-best is expected)");
  });

  t("random only picks moves that still have PP", function () {
    const a = arena("t_grass", "t_norm", "random", 11, ["t_tackle", "t_growl"]);
    a.foe.moves[0].pp = 0;
    for (let i = 0; i < 20; i++) {
      const act = AI.choose(a.b, a.foe, { tier: "random" });
      assert.strictEqual(act.type === "move" ? a.foe.moves[act.index].id : "t_growl", "t_growl");
    }
  });

  t("everything spent falls back to a last-ditch swing", function () {
    const a = arena("t_grass", "t_norm", "greedy", 3, ["t_tackle"]);
    a.foe.moves[0].pp = 0;
    const act = AI.choose(a.b, a.foe, { tier: "greedy" });
    assert.strictEqual(act.type, "struggle");
  });

  t("smart switches out of a bad matchup, greedy never does", function () {
    function trial(tier) {
      let switched = 0;
      for (let s = 0; s < 40; s++) {
        const me = F.mon(MQ, "t_fire", 30, ["t_ember"]);
        const foe = F.mon(MQ, "t_grass", 30, ["t_vine"]);
        const bench = F.mon(MQ, "t_water", 30, ["t_water_gun"]);
        const b = F.bench(MQ, { seed: s * 17 + 1 });
        b.sides[0].party = [me]; b.sides[1].party = [foe, bench];
        b.sides[0].activeUids = [me.uid]; b.sides[1].activeUids = [foe.uid];
        b.sides[1].ai = tier;
        b.sides[1].trainer = { name: "Test", id: "tr_t" };
        b.turn = 2;
        const act = AI.choose(b, foe, { tier: tier });
        if (act.type === "switch") switched++;
      }
      return switched;
    }
    const smart = trial("smart"), greedy = trial("greedy");
    assert.strictEqual(greedy, 0, "greedy never switches");
    assert.ok(smart > 5 && smart < 35, "smart switches sometimes (" + smart + "/40, weighted 40%)");
  });

  t("smart spends Overdrive on a healthy target, not on a finished one", function () {
    // SYSTEMS-SPEC §10: smart "saves Overdrive for when the player's
    // active mon HP > 50%" — i.e. it will not waste 100 meter finishing
    // something already on its last legs.
    MQ.Flags.set("overdrive_unlocked", true);
    const a = arena("t_grass", "t_fire", "smart", 21, ["t_ember"]);
    a.foe.overdrive = 100;
    a.me.hp = a.me.stats.hp;
    const fired = AI.choose(a.b, a.foe, { tier: "smart" });
    assert.strictEqual(fired.type, "overdrive", "fires at a healthy target");
    a.me.hp = Math.floor(a.me.stats.hp * 0.3);
    const held = AI.choose(a.b, a.foe, { tier: "smart" });
    assert.notStrictEqual(held.type, "overdrive", "holds it once the target is nearly down");
    // greedy has no such scruples
    const g = arena("t_grass", "t_fire", "greedy", 21, ["t_ember"]);
    g.foe.overdrive = 100;
    g.me.hp = Math.floor(g.me.stats.hp * 0.3);
    assert.strictEqual(AI.choose(g.b, g.foe, { tier: "greedy" }).type, "overdrive");
  });

  t("greedy reaches for a heal when it is nearly out", function () {
    const a = arena("t_grass", "t_fire", "greedy", 8, ["t_ember"]);
    a.b.sides[1].trainer = { name: "Test", id: "tr_t", items: ["tonic"] };
    a.foe.hp = Math.max(1, Math.floor(a.foe.stats.hp * 0.15));
    const act = AI.choose(a.b, a.foe, { tier: "greedy" });
    assert.strictEqual(act.type, "item");
    assert.strictEqual(act.id, "tonic");
  });

  t("damage preview does not consume RNG or burn ability charges", function () {
    const me = F.mon(MQ, "t_norm", 30, ["t_tackle"]);
    const foe = F.mon(MQ, "t_norm", 30, ["t_tackle"]);
    foe.ability = "payload";
    const b = F.bench(MQ, { seed: 77 });
    b.sides[0].party = [me]; b.sides[1].party = [foe];
    b.sides[0].activeUids = [me.uid]; b.sides[1].activeUids = [foe.uid];
    b.vol(foe).payloadSpent = false;
    const d1 = AI.previewDamage(b, foe, me, MQ.Data.moves.t_tackle);
    const d2 = AI.previewDamage(b, foe, me, MQ.Data.moves.t_tackle);
    assert.strictEqual(d1, d2, "preview is stable");
    assert.strictEqual(b.vol(foe).payloadSpent, false, "Payload is not spent by a preview");
    // hitChance never advances the battle RNG either
    const before = b.rng();
    const b2 = F.bench(MQ, { seed: 77 });
    b2.sides[0].party = [me]; b2.sides[1].party = [foe];
    b2.sides[0].activeUids = [me.uid]; b2.sides[1].activeUids = [foe.uid];
    AI.hitChance(b2, foe, me, MQ.Data.moves.t_tackle);
    assert.strictEqual(b2.rng(), before, "hitChance restored the RNG");
  });

  t("switch-in choice prefers a resist with a punch", function () {
    const foe = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const bad = F.mon(MQ, "t_grass", 30, ["t_vine"]);
    const good = F.mon(MQ, "t_water", 30, ["t_water_gun"]);
    const b = F.bench(MQ, { seed: 3 });
    b.sides[0].party = [bad, good]; b.sides[1].party = [foe];
    b.sides[0].activeUids = []; b.sides[1].activeUids = [foe.uid];
    b.sides[0].ai = "smart";
    const idx = AI.chooseSwitchIn(b, b.sides[0], foe);
    assert.strictEqual(idx, 1, "sends the Water type in against Fire");
  });
};
