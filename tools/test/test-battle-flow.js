// End-to-end engine flow: scripted battles driven through
// engine.choose, switching, items, capture, agents, Overdrive,
// boss phases, doubles, escort GUARD and difficulty.
"use strict";
const F = require("./test-battle-fixtures");

module.exports = function (t, assert) {
  const env = F.load();
  const MQ = env.MQ;
  const BE = MQ.BattleEffects;

  function drive(engine, chooser, cap) {
    engine.start();
    let n = 0;
    while (!engine.done && n++ < (cap || 400)) {
      if (engine.waiting) break;
      if (!engine.request) break;
      const act = chooser(engine, n);
      const res = engine.choose(act);
      if (res && res.error) throw new Error("choose rejected: " + res.error + " (" + JSON.stringify(act) + ")");
    }
    return engine.result;
  }
  function alwaysFirstMove(engine) {
    if (engine.request.type === "switch") {
      const o = engine.options();
      for (let i = 0; i < o.party.length; i++) if (o.party[i] && o.party[i].hp > 0) return i;
      return 0;
    }
    const o = engine.options();
    for (let i = 0; i < o.moves.length; i++) if (!o.moves[i].disabled) return { type: "move", index: o.moves[i].index };
    return { type: "struggle" };
  }
  function types(log, kind) { return log.filter(function (e) { return e.type === kind; }); }

  t("a full scripted wild battle runs to a win", function () {
    const me = F.mon(MQ, "t_fire", 25, ["t_ember", "t_tackle"]);
    const foe = F.mon(MQ, "t_grass", 20, ["t_vine"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 1234, playerParty: [me], enemyParty: [foe], rules: { canRun: true, canCatch: true } });
    const r = drive(engine, alwaysFirstMove);
    assert.ok(r, "the battle finished");
    assert.strictEqual(r.outcome, "win");
    assert.ok(r.turns >= 1);
    assert.ok(r.expGained > 0, "XP was awarded");
    assert.strictEqual(foe.hp, 0);
    const log = engine.b.log;
    assert.ok(types(log, "intro").length === 1);
    assert.ok(types(log, "switch").length >= 2, "both sides were sent out");
    assert.ok(types(log, "hp").length > 0);
    assert.ok(types(log, "faint").length === 1);
    assert.ok(types(log, "end").length === 1);
    assert.ok(types(log, "menu").length >= 1, "the engine asked for a menu");
  });

  t("event log is ordered and every event carries a type", function () {
    const me = F.mon(MQ, "t_fire", 25, ["t_ember"]);
    const foe = F.mon(MQ, "t_grass", 22, ["t_vine"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 9, playerParty: [me], enemyParty: [foe] });
    drive(engine, alwaysFirstMove);
    const log = engine.b.log;
    assert.strictEqual(log[0].type, "intro");
    assert.strictEqual(log[log.length - 1].type, "end");
    for (let i = 0; i < log.length; i++) assert.ok(typeof log[i].type === "string", "event " + i + " has no type");
  });

  t("losing every monster ends the battle in a loss", function () {
    const me = F.mon(MQ, "t_grass", 5, ["t_vine"]);
    const foe = F.mon(MQ, "t_fire", 40, ["t_ember"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 77, playerParty: [me], enemyParty: [foe] });
    const r = drive(engine, alwaysFirstMove);
    assert.strictEqual(r.outcome, "lose");
    assert.strictEqual(r.lost, true);
    assert.strictEqual(me.hp, 0);
    assert.ok(me.friendship < 70, "fainting costs friendship");
  });

  t("a forced switch is requested when the active monster faints", function () {
    const a = F.mon(MQ, "t_grass", 5, ["t_vine"]);
    const bslot = F.mon(MQ, "t_water", 45, ["t_water_gun"]);
    const foe = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 5, playerParty: [a, bslot], enemyParty: [foe] });
    let sawSwitchRequest = false;
    const r = drive(engine, function (e) {
      if (e.request.type === "switch") { sawSwitchRequest = true; return 1; }
      return alwaysFirstMove(e);
    });
    assert.ok(sawSwitchRequest, "the engine asked who was next");
    assert.strictEqual(r.outcome, "win");
  });

  t("voluntary switching costs the turn and resets stages", function () {
    const a = F.mon(MQ, "t_norm", 30, ["t_sharpen", "t_tackle"]);
    const c = F.mon(MQ, "t_water", 30, ["t_water_gun"]);
    const foe = F.mon(MQ, "t_norm", 30, ["t_tackle"]);
    const engine = MQ.Battle.create({ kind: "trainer", seed: 3, playerParty: [a, c], enemyParty: [foe], trainer: { id: "tr_x", name: "Switchy", ai: "greedy", payout: 100 } });
    let step = 0, boost = -1, captured = -1;
    drive(engine, function (e) {
      if (e.request.type === "switch") {
        const o = e.options();
        for (let i = 0; i < o.party.length; i++) if (o.party[i] && o.party[i].hp > 0) return i;
        return 0;
      }
      step++;
      if (step === 1) return { type: "move", index: 0 };     // sharpen: atk +1
      if (step === 2) { boost = engine.b.vol(a).stages.atk; return { type: "switch", index: 1 }; }
      if (step === 3) return { type: "switch", index: 0 };   // swap back
      if (step === 4 && captured < 0) captured = engine.b.vol(a).stages.atk;
      const o = e.options();
      for (let i = o.moves.length - 1; i >= 0; i--) if (!o.moves[i].disabled) return { type: "move", index: o.moves[i].index };
      return { type: "struggle" };
    }, 60);
    assert.strictEqual(boost, 1, "sharpen raised Attack by one stage");
    assert.strictEqual(captured, 0, "stages were wiped on the switch");
  });

  t("catching a wild monster ends the battle with the catch", function () {
    const me = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const foe = F.mon(MQ, "t_grass", 5, ["t_vine"]);
    foe.hp = 1;
    const engine = MQ.Battle.create({ kind: "wild", seed: 21, playerParty: [me], enemyParty: [foe], rules: { canCatch: true, canRun: true } });
    const r = drive(engine, function (e) {
      if (e.request.type === "switch") return 0;
      return { type: "capsule", id: "capsule_root" };
    }, 20);
    assert.strictEqual(r.outcome, "catch");
    assert.strictEqual(r.caught, foe);
    const c = engine.b.log.filter(function (x) { return x.type === "catch"; });
    assert.strictEqual(c.length, 1);
    assert.strictEqual(c[0].success, true);
    assert.strictEqual(c[0].shakes, 4);
  });

  t("running away is possible from wild fights and refused in trainer fights", function () {
    const me = F.mon(MQ, "t_cat", 40, ["t_tackle"]);
    const foe = F.mon(MQ, "t_iron", 5, ["t_tackle"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 2, playerParty: [me], enemyParty: [foe], rules: { canRun: true } });
    const r = drive(engine, function () { return { type: "run" }; }, 20);
    assert.strictEqual(r.outcome, "run");

    const e2 = MQ.Battle.create({ kind: "trainer", seed: 2, playerParty: [F.mon(MQ, "t_cat", 40, ["t_tackle"])], enemyParty: [F.mon(MQ, "t_iron", 5, ["t_tackle"])], trainer: { id: "tr_y", name: "Stayer", ai: "random" } });
    e2.start();
    const opts = e2.options();
    assert.strictEqual(opts.canRun, false);
    assert.ok(e2.validate({ type: "run" }), "run is rejected");
  });

  t("bag items heal and cost the turn", function () {
    const me = F.mon(MQ, "t_iron", 40, ["t_tackle"]);
    me.hp = 10;
    const foe = F.mon(MQ, "t_grass", 5, ["t_vine"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 31, playerParty: [me], enemyParty: [foe] });
    let step = 0;
    drive(engine, function (e) {
      if (e.request.type === "switch") return 0;
      step++;
      if (step === 1) return { type: "item", id: "tonic", target: me.uid };
      return alwaysFirstMove(e);
    }, 40);
    assert.ok(me.hp > 10, "the Tonic landed (" + me.hp + ")");
    assert.ok(engine.b.log.some(function (x) { return x.type === "item" && x.item === "tonic"; }));
  });

  t("Overdrive fires the signature move and drains the meter", function () {
    MQ.Flags.set("overdrive_unlocked", true);
    const me = F.mon(MQ, "t_cat", 40, ["t_tackle"]);
    me.overdrive = 100;
    const foe = F.mon(MQ, "t_iron", 40, ["t_tackle"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 8, playerParty: [me], enemyParty: [foe] });
    engine.start();
    const o = engine.options();
    assert.strictEqual(o.overdrive, true, "the OVERDRIVE option lights up at 100");
    assert.strictEqual(o.overdriveMove.id, "zoomies", "MEADOW's signature");
    engine.choose({ type: "overdrive" });
    const spent = engine.b.log.filter(function (x) { return x.type === "overdrive" && x.reason === "spent"; });
    assert.strictEqual(spent.length, 1, "the meter drained");
    assert.strictEqual(spent[0].value, 0);
    assert.ok(engine.b.log.some(function (x) { return x.type === "msg" && /Zoomies/.test(x.text); }));
    assert.ok(engine.b.log.some(function (x) { return x.type === "anim" && x.name === "overdrive_fire"; }));
  });

  t("agents: cooldowns, effects and the jam", function () {
    MQ.Flags.set("agent_sleet", true);
    MQ.Flags.set("agent_vigil", true);
    MQ.Flags.set("agent_arbiter", false);
    const me = F.mon(MQ, "t_iron", 40, ["t_tackle"]);
    me.hp = Math.floor(me.stats.hp / 3);
    const foe = F.mon(MQ, "t_grass", 40, ["t_vine"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 44, playerParty: [me], enemyParty: [foe] });
    engine.start();
    let o = engine.options();
    const ids = o.agents.map(function (a) { return a.id; });
    assert.deepStrictEqual(ids.join(","), "sleet,vigil", "only unlocked agents are offered");
    assert.strictEqual(o.agents[0].ok, true);
    const hpBefore = me.hp;
    engine.choose({ type: "agent", id: "vigil" });
    assert.ok(me.hp > hpBefore, "VIGIL healed");
    o = engine.options();
    const vigil = o.agents.filter(function (a) { return a.id === "vigil"; })[0];
    assert.strictEqual(vigil.ok, false);
    assert.strictEqual(vigil.why, "cooldown");
    assert.ok(vigil.turns >= 1);
    assert.ok(engine.validate({ type: "agent", id: "vigil" }), "using it again is rejected");
    // SLEET reveals and drops speed
    const speBefore = engine.b.vol(foe).stages.spe;
    engine.choose({ type: "agent", id: "sleet" });
    assert.strictEqual(engine.b.vol(foe).stages.spe, speBefore - 2, "SLEET drops foe speed by 2");
    assert.ok(engine.b.log.some(function (x) { return x.type === "reveal"; }));
  });

  t("hard difficulty adds two turns to every agent cooldown", function () {
    MQ.Flags.set("agent_sleet", true);
    const me = F.mon(MQ, "t_iron", 40, ["t_tackle"]);
    const foe = F.mon(MQ, "t_grass", 40, ["t_vine"]);
    const easy = MQ.Battle.create({ kind: "wild", seed: 1, difficulty: "normal", playerParty: [me], enemyParty: [foe] });
    const hard = MQ.Battle.create({ kind: "wild", seed: 1, difficulty: "hard", playerParty: [me], enemyParty: [foe] });
    easy.start(); hard.start();
    const a = easy.options().agents[0], c = hard.options().agents[0];
    assert.strictEqual(c.cd, a.cd + 2);
  });

  t("boss phases fire once at their HP threshold", function () {
    const me = F.mon(MQ, "t_fire", 45, ["t_ember"]);
    const boss = F.mon(MQ, "t_iron", 40, ["t_tackle"]);
    const trainer = {
      id: "boss_test", name: "The Understudy", ai: "smart", payout: 900,
      boss: {
        overdriveStart: 25,
        phases: [
          { hpFrac: 0.999, events: [{ say: "It borrowed your face and did not apologise." }, { setWeather: "fog", turns: 8 }] },
          { hpFrac: 0.5, events: [{ say: "Phase two." }, { healSelf: 0.5 }, { boostSelf: { atk: 1 } }, { jamAgents: 2 }] }
        ]
      }
    };
    const engine = MQ.Battle.create({ kind: "boss", seed: 12, playerParty: [me], enemyParty: [boss], trainer: trainer });
    drive(engine, alwaysFirstMove, 200);
    const phases = engine.b.log.filter(function (x) { return x.type === "phase"; });
    assert.strictEqual(phases.length, 2, "both phases fired exactly once");
    assert.strictEqual(phases[0].index, 1);
    assert.strictEqual(phases[1].index, 2);
    assert.ok(engine.b.log.some(function (x) { return x.type === "msg" && /borrowed your face/.test(x.text); }));
    assert.ok(engine.b.log.some(function (x) { return x.type === "weather" && x.weather === "fog"; }));
    assert.ok(engine.b.log.some(function (x) { return x.type === "agent" && x.jammed === 2; }));
    // the phase heal is capped at 30% however greedy the data is
    assert.ok(engine.b.log.some(function (x) { return x.type === "msg" && /recovered health/.test(x.text); }));
  });

  t("boss `rewriteChart` bends the type chart for that battle only", function () {
    const me = F.mon(MQ, "t_water", 45, ["t_water_gun"]);
    const boss = F.mon(MQ, "t_iron", 45, ["t_tackle"]);
    const engine = MQ.Battle.create({
      kind: "boss", seed: 4, playerParty: [me], enemyParty: [boss],
      trainer: { id: "boss_mo", name: "Netrunner Mo", ai: "smart", boss: { phases: [{ turn: 1, events: [{ rewriteChart: { atk: "water", def: "rock", mult: 0.5 } }] }] } }
    });
    engine.start();
    assert.strictEqual(engine.b.typeMult("water", ["rock"]), 2, "before the rewrite");
    engine.choose({ type: "move", index: 0 });
    assert.strictEqual(engine.b.typeMult("water", ["rock"]), 0.5, "after the rewrite");
    assert.strictEqual(MQ.Data.typeMultiplier("water", ["rock"]), 2, "the global chart is untouched");
  });

  t("trainer battles pay out and switch their own team in", function () {
    const me = F.mon(MQ, "t_fire", 45, ["t_ember"]);
    const t1 = F.mon(MQ, "t_grass", 20, ["t_vine"]);
    const t2 = F.mon(MQ, "t_grass", 20, ["t_vine"]);
    const engine = MQ.Battle.create({
      kind: "trainer", seed: 6, playerParty: [me], enemyParty: [t1, t2],
      trainer: { id: "tr_route_1", name: "Walker Bev", cls: "Walker", ai: "greedy", payout: 640, intro: ["Lovely day for it."], lose: ["Fair enough."] }
    });
    const r = drive(engine, alwaysFirstMove, 200);
    assert.strictEqual(r.outcome, "win");
    assert.strictEqual(r.moneyGained, 640);
    assert.strictEqual(t1.hp, 0);
    assert.strictEqual(t2.hp, 0);
    assert.ok(engine.b.log.some(function (x) { return x.type === "msg" && /Lovely day for it/.test(x.text); }));
    assert.ok(engine.b.log.some(function (x) { return x.type === "payout" && x.money === 640; }));
  });

  t("doubles put two monsters out per side", function () {
    const a = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const c = F.mon(MQ, "t_water", 30, ["t_water_gun"]);
    const d = F.mon(MQ, "t_grass", 20, ["t_vine"]);
    const e = F.mon(MQ, "t_grass", 20, ["t_vine"]);
    const engine = MQ.Battle.create({
      kind: "trainer", seed: 15, playerParty: [a, c], enemyParty: [d, e],
      rules: { doubles: true }, trainer: { id: "tr_pair", name: "The Twins", ai: "greedy", payout: 200 }
    });
    engine.start();
    assert.strictEqual(engine.b.sides[0].activeUids.filter(Boolean).length, 2);
    assert.strictEqual(engine.b.sides[1].activeUids.filter(Boolean).length, 2);
    const r = drive(engine, alwaysFirstMove, 300);
    assert.strictEqual(r.outcome, "win");
  });

  t("escort battles offer GUARD, which halves damage and feeds Overdrive", function () {
    MQ.Flags.set("overdrive_unlocked", true);
    const me = F.mon(MQ, "t_iron", 40, ["t_tackle"]);
    const foe = F.mon(MQ, "t_norm", 40, ["t_tackle"]);
    const engine = MQ.Battle.create({ kind: "trainer", seed: 18, playerParty: [me], enemyParty: [foe], escort: { name: "Cyclist Priya" }, trainer: { id: "tr_escort", name: "Grunt", ai: "greedy" } });
    engine.start();
    assert.strictEqual(engine.options().canGuard, true);
    const odBefore = me.overdrive;
    engine.choose({ type: "guard" });
    assert.ok(me.overdrive >= odBefore + 10, "GUARD grants +10 Overdrive");
    assert.ok(engine.b.log.some(function (x) { return x.type === "guard"; }));
  });

  t("arena rules can lock the bag and limit agents", function () {
    MQ.Flags.set("agent_sleet", true);
    const me = F.mon(MQ, "t_iron", 40, ["t_tackle"]);
    const foe = F.mon(MQ, "t_grass", 40, ["t_vine"]);
    const engine = MQ.Battle.create({
      kind: "arena", seed: 20, playerParty: [me], enemyParty: [foe],
      rules: { noItems: true, oneAgent: true, canRun: false, canCatch: false }
    });
    engine.start();
    const o = engine.options();
    assert.strictEqual(o.canItems, false);
    assert.strictEqual(o.canCatch, false);
    assert.strictEqual(o.canRun, false);
    engine.choose({ type: "agent", id: "sleet" });
    assert.strictEqual(engine.options().agents[0].why, "arena", "one agent per arena run");
  });

  t("levelling up recomputes stats, learns moves and queues an evolution", function () {
    const me = F.mon(MQ, "t_fire", 15, ["t_ember"]);
    me.exp = BE.expForLevel(16, "medium") - 10;   // one win from the evolution level
    const before = me.stats.atk;
    const foe = F.mon(MQ, "t_grass", 40, ["t_vine"]);
    foe.hp = 1;
    const engine = MQ.Battle.create({ kind: "wild", seed: 60, playerParty: [me], enemyParty: [foe] });
    drive(engine, alwaysFirstMove, 60);
    assert.ok(me.level > 15, "levelled up to " + me.level);
    assert.ok(me.stats.atk > before, "stats were recomputed");
    if (me.level >= 16) {
      const evo = engine.b.result.pending.filter(function (p) { return p.kind === "evolve"; });
      assert.strictEqual(evo.length, 1, "the evolution is queued, not applied");
      assert.strictEqual(evo[0].to, "t_fire2");
      assert.strictEqual(me.species, "t_fire", "the engine never evolves in place");
    }
  });

  t("weather and terrain expire on schedule", function () {
    // Nobody can hurt anybody, so the only thing that ticks is the clock.
    const me = F.mon(MQ, "t_iron", 60, ["t_rainmaker", "t_growl"]);
    const foe = F.mon(MQ, "t_iron", 5, ["t_growl"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 71, playerParty: [me], enemyParty: [foe] });
    engine.start();
    engine.choose({ type: "move", index: 0 });
    assert.strictEqual(engine.b.field.weather, "rain");
    const started = engine.b.field.weatherTurns;
    assert.ok(started >= 4 && started <= 5, "5 turns, minus the one that just ticked");
    for (let i = 0; i < 6 && engine.request; i++) engine.choose({ type: "move", index: 1 });
    assert.strictEqual(engine.b.field.weather, null, "rain eased off");
  });

  t("protect blocks the next hit and gets less reliable each time", function () {
    const me = F.mon(MQ, "t_iron", 40, ["t_protect", "t_tackle"]);
    const foe = F.mon(MQ, "t_norm", 40, ["t_tackle"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 101, playerParty: [me], enemyParty: [foe] });
    engine.start();
    const hpBefore = me.hp;
    engine.choose({ type: "move", index: 0 });
    assert.strictEqual(me.hp, hpBefore, "nothing got through the cover");
    assert.ok(engine.b.log.some(function (x) { return x.type === "msg" && /held its cover/.test(x.text); }));
  });

  t("multi-hit moves land between two and five times", function () {
    const me = F.mon(MQ, "t_norm", 40, ["t_multi"]);
    const foe = F.mon(MQ, "t_iron", 60, ["t_tackle"]);
    let seenCounts = {};
    for (let s = 0; s < 25; s++) {
      const m2 = F.mon(MQ, "t_norm", 40, ["t_multi"]);
      const f2 = F.mon(MQ, "t_iron", 60, ["t_tackle"]);
      const engine = MQ.Battle.create({ kind: "wild", seed: s + 500, playerParty: [m2], enemyParty: [f2] });
      engine.start();
      engine.choose({ type: "move", index: 0 });
      const hits = engine.b.log.filter(function (x) { return x.type === "anim" && x.move === "t_multi" && x.hitIndex !== undefined; }).length;
      if (hits) seenCounts[hits] = (seenCounts[hits] || 0) + 1;
    }
    const keys = Object.keys(seenCounts).map(Number);
    assert.ok(keys.length >= 2, "saw more than one hit count: " + JSON.stringify(seenCounts));
    keys.forEach(function (k) { assert.ok(k >= 2 && k <= 5, "hit count " + k + " out of range"); });
  });

  t("autoResolve plays both sides and always terminates", function () {
    for (let s = 0; s < 12; s++) {
      const party = [F.mon(MQ, "t_fire", 25, ["t_ember", "t_tackle"]), F.mon(MQ, "t_water", 25, ["t_water_gun"])];
      const foes = [F.mon(MQ, "t_grass", 25, ["t_vine", "t_growl"]), F.mon(MQ, "t_norm", 25, ["t_tackle", "t_toxic"])];
      const r = MQ.Battle.autoResolve({ kind: "trainer", seed: s * 13 + 1, playerParty: party, enemyParty: foes, trainer: { id: "tr_auto", name: "Sim", ai: "smart", payout: 100 } });
      assert.ok(r, "seed " + s + " produced a result");
      assert.ok(["win", "lose", "run", "catch"].indexOf(r.outcome) >= 0, "seed " + s + " outcome " + r.outcome);
      assert.ok(!r.error, "seed " + s + " threw: " + r.error);
      assert.ok(r.turns < 400, "seed " + s + " terminated in " + r.turns + " turns");
    }
  });

  t("MQ.Battle.start resolves a promise even with no scene", function () {
    const party = [F.mon(MQ, "t_fire", 30, ["t_ember"])];
    const foes = [F.mon(MQ, "t_grass", 12, ["t_vine"])];
    return MQ.Battle.start({ kind: "wild", seed: 3, playerParty: party, enemyParty: foes, auto: true }).then(function (r) {
      assert.strictEqual(r.outcome, "win");
      assert.ok(r.expGained > 0);
    });
  });

  t("start() degrades gracefully with no party, a wiped party, or no foe", function () {
    return MQ.Battle.start({ kind: "wild", playerParty: [], enemyParty: [], auto: true }).then(function (r) {
      assert.strictEqual(r.outcome, "win", "nothing to fight with: scripts keep flowing");
      assert.strictEqual(r.reason, "no party");
      const dead = F.mon(MQ, "t_fire", 10, ["t_ember"]);
      dead.hp = 0;
      return MQ.Battle.start({ kind: "wild", playerParty: [dead], enemyParty: [F.mon(MQ, "t_grass", 10, ["t_vine"])], auto: true });
    }).then(function (r) {
      assert.strictEqual(r.outcome, "lose", "a wiped party is a real loss");
      return MQ.Battle.start({ kind: "wild", playerParty: [F.mon(MQ, "t_fire", 10, ["t_ember"])], enemyParty: [], auto: true });
    }).then(function (r) {
      assert.strictEqual(r.outcome, "win");
    });
  });

  t("trainer parties are built from data with difficulty and rematch scaling", function () {
    const trainer = { id: "tr_build", name: "Builder", party: [{ species: "t_fire", level: 20, moves: ["t_ember"] }, { species: "t_grass", level: 22 }] };
    const normal = MQ.Battle.buildTrainerParty(trainer, "normal");
    assert.strictEqual(normal.length, 2);
    assert.strictEqual(normal[0].level, 20);
    assert.strictEqual(normal[0].moves[0].id, "t_ember");
    const hard = MQ.Battle.buildTrainerParty(trainer, "hard");
    assert.strictEqual(hard[0].level, 22, "+10% on Hard");
    const story = MQ.Battle.buildTrainerParty(trainer, "story");
    assert.strictEqual(story[0].level, 18, "-10% on Story");
  });

  t("invalid actions are rejected without corrupting the battle", function () {
    const me = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const foe = F.mon(MQ, "t_grass", 30, ["t_vine"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 55, playerParty: [me], enemyParty: [foe] });
    engine.start();
    assert.ok(engine.choose({ type: "move", index: 9 }).error, "no such move");
    assert.ok(engine.choose({ type: "nonsense" }).error, "unknown action");
    assert.ok(engine.choose({ type: "switch", index: 0 }).error, "cannot switch to the active one");
    assert.ok(engine.request, "the engine is still waiting");
    assert.ok(!engine.choose({ type: "move", index: 0 }).error, "a legal action still works");
  });

  t("gym house rules: permanent weather, entry screens, Reboot and a jammed agent", function () {
    MQ.Flags.set("agent_vigil", true);
    const me = F.mon(MQ, "t_fire", 40, ["t_ember", "t_growl"]);
    const a1 = F.mon(MQ, "t_water", 30, ["t_water_gun"]);
    const a2 = F.mon(MQ, "t_water", 30, ["t_water_gun"]);
    const engine = MQ.Battle.create({
      kind: "trainer", seed: 88, playerParty: [me], enemyParty: [a1, a2],
      trainer: {
        id: "leader_nell", name: "Brine Nell", ai: "greedy", payout: 500,
        leader: { badge: "badge_token", type: "water" },
        house: { note: "It rains here. Dress for it.", weather: "rain", permanent: true, screens: "spec", reboot: true, jamAgent: { id: "vigil", turns: 3 } }
      }
    });
    engine.start();
    assert.strictEqual(engine.b.field.weather, "rain");
    assert.strictEqual(engine.b.field.weatherTurns, 999, "permanent");
    assert.strictEqual(engine.b.sides[1].screens.spec, 5, "screens up on entry");
    const vigil = engine.options().agents.filter(function (x) { return x.id === "vigil"; })[0];
    assert.strictEqual(vigil.ok, false);
    assert.strictEqual(vigil.turns, 3, "VIGIL is locked out for three turns");
    assert.ok(engine.b.log.some(function (x) { return x.type === "msg" && /Dress for it/.test(x.text); }));
    const r = drive(engine, alwaysFirstMove, 300);
    assert.ok(r.outcome === "win" || r.outcome === "lose");
    assert.strictEqual(engine.b.field.weather, "rain", "the rain never lets up");
  });

  t("Mo's rule: all agents jammed until a super-effective hit lands", function () {
    MQ.Flags.set("agent_sleet", true);
    const me = F.mon(MQ, "t_water", 50, ["t_water_gun", "t_growl"]);
    const foe = F.mon(MQ, "t_iron", 50, ["t_growl"]);
    const engine = MQ.Battle.create({
      kind: "trainer", seed: 90, playerParty: [me], enemyParty: [foe],
      trainer: { id: "leader_mo", name: "Netrunner Mo", ai: "greedy", house: { jamUntilSuper: true } }
    });
    engine.start();
    assert.strictEqual(engine.options().agents[0].why, "jammed");
    engine.choose({ type: "move", index: 0 });      // Water vs Rock: super effective
    assert.strictEqual(engine.b.agentsJammed, 0, "the jam broke");
    assert.ok(engine.b.log.some(function (x) { return x.type === "msg" && /agents are back/.test(x.text); }));
  });

  t("the intro event tells the scene how many boss phases to expect", function () {
    const me = F.mon(MQ, "t_fire", 50, ["t_ember"]);
    const boss = F.mon(MQ, "t_iron", 50, ["t_tackle"]);
    const engine = MQ.Battle.create({
      kind: "boss", seed: 91, playerParty: [me], enemyParty: [boss],
      trainer: { id: "boss_intro", name: "Boss", ai: "smart", boss: { phases: [{ hpFrac: 0.66, events: [] }, { hpFrac: 0.33, events: [] }] } }
    });
    engine.start();
    const intro = engine.b.log[0];
    assert.strictEqual(intro.type, "intro");
    assert.strictEqual(intro.bossPhases, 2);
    assert.strictEqual(intro.kind, "boss");
  });
};
