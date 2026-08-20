// The move-effect vocabulary the engine used to ignore: `cooldown`,
// `restore_pp`, `mimic_type`, effect-carried `priority`, `weather_boost`,
// and the `when:` condition string that decides whether any effect fires
// at all. Every test here fails against the engine as it was.
"use strict";
const F = require("./test-battle-fixtures");

module.exports = function (t, assert) {
  const env = F.load();
  const MQ = env.MQ;
  const BE = MQ.BattleEffects;
  const D = MQ.Data;

  // --- extra fixture moves, defined only for this file --------------
  const mv = function (id, o) {
    D.define("moves", id, Object.assign({
      name: id, type: "normal", cat: "phys", power: 0, acc: 100, pp: 20,
      priority: 0, crit: 0, flags: {}, effects: []
    }, o));
  };
  mv("t_cool", {
    name: "Test Reboot", cat: "status", acc: null, pp: 20,
    effects: [{ kind: "heal", who: "self", frac: 0.25 }, { kind: "cooldown", turns: 2 }]
  });
  mv("t_refill", {
    name: "Test Refill", cat: "status", acc: null, pp: 20,
    effects: [{ kind: "restore_pp", who: "self", all: true }]
  });
  mv("t_refill_one", {
    name: "Test Top-Up", cat: "status", acc: null, pp: 20,
    effects: [{ kind: "restore_pp", who: "self", move: "t_tackle", n: 3 }]
  });
  mv("t_borrow", {
    name: "Test Borrowed Face", type: "cyber", cat: "spec", power: 60, pp: 10,
    effects: [{ kind: "mimic_type" }]
  });
  mv("t_rush", {
    name: "Test Rush", power: 40, pp: 20, flags: { contact: true },
    effects: [{ kind: "priority", delta: 3 }]
  });
  mv("t_rain_rush", {
    name: "Test Rain Rush", power: 40, pp: 20,
    effects: [{ kind: "priority", delta: 3, when: "weather.rain" }]
  });
  mv("t_gale", {
    name: "Test Gale", type: "cyber", cat: "spec", power: 70, pp: 15,
    effects: [{ kind: "weather_boost", w: "wind", mult: 1.3 }]
  });
  mv("t_two_clause", {
    name: "Test Two Clause", cat: "status", acc: null, pp: 10,
    effects: [
      { kind: "weather", w: "rain", turns: 5, when: "!weather.rain" },
      { kind: "stage", who: "self", stat: "spe", delta: 1, when: "weather.rain" }
    ]
  });

  // A one-turn harness: build a battle, start it, hand back the pieces.
  function fight(o) {
    o = o || {};
    const me = F.mon(MQ, o.me || "t_norm", o.myLevel || 40, o.myMoves || ["t_tackle"], o.myExtra);
    const foe = F.mon(MQ, o.foe || "t_norm", o.foeLevel || 40, o.foeMoves || ["t_tackle"], o.foeExtra);
    if (o.myAbility !== undefined) me.ability = o.myAbility;
    if (o.foeAbility !== undefined) foe.ability = o.foeAbility;
    const engine = MQ.Battle.create(Object.assign({
      kind: "wild", seed: o.seed === undefined ? 1 : o.seed,
      playerParty: [me].concat(o.bench || []), enemyParty: [foe]
    }, o.opts || {}));
    engine.start();
    return { engine: engine, b: engine.b, me: me, foe: foe };
  }
  function has(b, re) { return b.log.some(function (x) { return x.type === "msg" && re.test(x.text); }); }
  function slotOf(mon, id) {
    for (let i = 0; i < mon.moves.length; i++) if (mon.moves[i].id === id) return mon.moves[i];
    return null;
  }
  // Arrays that come back out of the sandbox belong to another realm,
  // so compare their contents rather than their prototypes.
  function typeList(b, mon) { return (b.typesOf(mon) || []).join(","); }
  function moveOption(engine, id) {
    const o = engine.options();
    for (let i = 0; i < o.moves.length; i++) if (o.moves[i].id === id) return o.moves[i];
    return null;
  }

  // =================================================================
  // 1. `when:` — the condition string on an effect
  // =================================================================
  t("testWhen reads weather, terrain, turn, HP, status and time", function () {
    const a = fight({ myMoves: ["t_tackle"] });
    const b = a.b;
    const ctx = { user: a.me, target: a.foe, move: D.moves.t_tackle };

    assert.strictEqual(BE.testWhen(b, ctx, ""), true, "an empty condition is always true");
    assert.strictEqual(BE.testWhen(b, ctx, undefined), true);

    b.field.weather = null; b.field.terrain = null;
    assert.strictEqual(BE.testWhen(b, ctx, "weather.rain"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "!weather.rain"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "weather.none"), true);
    b.field.weather = "rain";
    assert.strictEqual(BE.testWhen(b, ctx, "weather.rain"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "!weather.rain"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "weather.sun"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "weather == 'rain'"), true);

    b.field.terrain = "silk";
    assert.strictEqual(BE.testWhen(b, ctx, "terrain.silk"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "terrain.salt"), false);

    b.turn = 4;
    assert.strictEqual(BE.testWhen(b, ctx, "turn>3"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "turn>4"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "turn>=4 && weather.rain"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "turn>9 || weather.rain"), true);

    a.me.hp = Math.floor(b.maxHp(a.me) * 0.2);
    assert.strictEqual(BE.testWhen(b, ctx, "self.hpBelow(50)"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "self.hpBelow(10)"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "self.hpAbove(50)"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "foe.hpBelow(50)"), false);
    a.foe.hp = 1;
    assert.strictEqual(BE.testWhen(b, ctx, "foe.hpBelow(50)"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "target.hpBelow(50)"), true);

    assert.strictEqual(BE.testWhen(b, ctx, "target.status"), false);
    a.foe.status = "par";
    assert.strictEqual(BE.testWhen(b, ctx, "target.status"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "target.status.par"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "target.status.brn"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "!target.status"), false);

    assert.strictEqual(BE.testWhen(b, ctx, "self.type.normal"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "self.type.fire"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "move.type == 'normal'"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "kind == 'wild'"), true);

    MQ.Clock.setPhase("night");
    assert.strictEqual(BE.testWhen(b, ctx, "time.night"), true);
    assert.strictEqual(BE.testWhen(b, ctx, "time.day"), false);
    MQ.Clock.setPhase("day");
    assert.strictEqual(BE.testWhen(b, ctx, "time.night"), false);
    assert.strictEqual(BE.testWhen(b, ctx, "time.day"), true);

    // A typo must fail closed rather than silently buff the move.
    assert.strictEqual(BE.testWhen(b, ctx, "weather.rain &&&"), false);
  });

  t("two `when` clauses on one move are mutually exclusive", function () {
    // Dry: only the rain-maker clause fires.
    const dry = fight({ myMoves: ["t_two_clause"], foeMoves: ["t_growl"], seed: 5 });
    dry.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(dry.b.field.weather, "rain", "it brought the rain");
    assert.strictEqual(dry.b.vol(dry.me).stages.spe, 0, "the rain-only clause did NOT also fire");

    // Wet: only the speed clause fires, and the weather timer is not reset.
    const wet = fight({
      myMoves: ["t_two_clause"], foeMoves: ["t_growl"], seed: 5,
      opts: { rules: { weather: "rain", weatherTurns: 2 } }
    });
    wet.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(wet.b.vol(wet.me).stages.spe, 1, "it rode the rain");
    assert.ok(wet.b.field.weatherTurns <= 2, "the rain clause did not re-set the weather");
  });

  t("BRINE_JET's real clauses respect the sky", function () {
    const dry = fight({ me: "t_water", myMoves: ["brine_jet"], foeMoves: ["t_growl"], seed: 11 });
    dry.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(dry.b.field.weather, "rain");
    assert.strictEqual(dry.b.vol(dry.me).stages.spe, 0, "no free speed in the dry");

    const wet = fight({
      me: "t_water", myMoves: ["brine_jet"], foeMoves: ["t_growl"], seed: 11,
      opts: { rules: { weather: "rain", weatherTurns: 3 } }
    });
    wet.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(wet.b.vol(wet.me).stages.spe, 1, "in rain it rides instead");
  });

  t("a `when` on a pre-hit effect is honoured too", function () {
    // FIREBOX_ROAR only has to recharge when it is used in the rain.
    const dry = fight({ me: "t_fire", myMoves: ["firebox_roar"], foeMoves: ["t_growl"], seed: 21 });
    dry.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(dry.b.vol(dry.me).recharge, false, "no recharge in the dry");

    const wet = fight({
      me: "t_fire", myMoves: ["firebox_roar"], foeMoves: ["t_growl"], seed: 21,
      opts: { rules: { weather: "rain", weatherTurns: 5 } }
    });
    wet.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(wet.b.vol(wet.me).recharge, true, "wet coal makes it cough");
  });

  // =================================================================
  // 2. `cooldown`
  // =================================================================
  t("a `cooldown` move locks itself out for N turns", function () {
    // Nothing on either side can faint, so the turn always reaches the
    // end-of-turn tick.
    const a = fight({ myMoves: ["t_cool", "t_growl"], foeMoves: ["t_growl"], myLevel: 60, foeLevel: 60, seed: 31 });
    assert.ok(BE.effects.cooldown, "the engine has a cooldown handler at all");

    a.me.hp = Math.floor(a.b.maxHp(a.me) * 0.4);
    a.engine.choose({ type: "move", index: 0 });            // turn 1: reboot
    // Set to 2 as the move resolves, ticked once at end of turn: one
    // turn of lockout, free again on the turn after — "every other turn".
    assert.strictEqual(a.b.vol(a.me).cooldowns.t_cool, 1);

    // Turn 2: the menu greys it out and the engine refuses it.
    const opt = moveOption(a.engine, "t_cool");
    assert.ok(opt.disabled, "the cooling move is disabled in the menu");
    assert.strictEqual(opt.cooldown, 1, "one more turn to wait");
    assert.strictEqual(a.engine.validate({ type: "move", index: 0 }), "that move cannot be used");
    a.engine.choose({ type: "move", index: 1 });            // turn 2: something else

    // Turn 3: back up.
    assert.strictEqual(a.b.vol(a.me).cooldowns.t_cool, 0);
    assert.ok(!moveOption(a.engine, "t_cool").disabled, "it comes back on the third turn");
    assert.strictEqual(a.engine.validate({ type: "move", index: 0 }), null);
  });

  t("PATCH_TUESDAY really is every other turn", function () {
    const a = fight({ myMoves: ["patch_tuesday", "t_growl"], foeMoves: ["t_growl"], myLevel: 60, foeLevel: 60, seed: 33 });
    a.me.hp = Math.floor(a.b.maxHp(a.me) * 0.3);
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.b.vol(a.me).cooldowns.patch_tuesday, 1, "patched, now reboot required");
    assert.ok(moveOption(a.engine, "patch_tuesday").disabled);
  });

  t("the AI will not pick a move that is still cooling", function () {
    const a = fight({ myMoves: ["t_tackle"], foeMoves: ["t_cool", "t_tackle"], seed: 35 });
    a.b.vol(a.foe).cooldowns.t_cool = 2;
    const opts = MQ.BattleAI.usableMoves(a.b, a.foe);
    assert.strictEqual(opts.map(function (o) { return o.id; }).join(","), "t_tackle");
  });

  // =================================================================
  // 3. `restore_pp`
  // =================================================================
  t("`restore_pp {all}` refills every move but the one that cast it", function () {
    const a = fight({ myMoves: ["t_refill", "t_tackle", "t_growl"], foeMoves: ["t_growl"], seed: 41 });
    assert.ok(BE.effects.restore_pp, "the engine has a restore_pp handler at all");
    slotOf(a.me, "t_tackle").pp = 0;
    slotOf(a.me, "t_growl").pp = 3;
    const refillPp = slotOf(a.me, "t_refill").pp;

    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(slotOf(a.me, "t_tackle").pp, slotOf(a.me, "t_tackle").ppMax);
    assert.strictEqual(slotOf(a.me, "t_growl").pp, slotOf(a.me, "t_growl").ppMax);
    assert.strictEqual(slotOf(a.me, "t_refill").pp, refillPp - 1, "it does not refill itself");
    assert.ok(has(a.b, /reloaded/));
  });

  t("`restore_pp {move, n}` tops up one named move by n", function () {
    const a = fight({ myMoves: ["t_refill_one", "t_tackle"], foeMoves: ["t_growl"], seed: 42 });
    const tackle = slotOf(a.me, "t_tackle");
    tackle.pp = 0;
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(tackle.pp, 3);
  });

  t("Ada's SYSADMIN_REBOOT clears her stages and reloads her PP", function () {
    const a = fight({ foe: "t_norm", foeMoves: ["t_tackle"], myMoves: ["t_tackle"], seed: 43 });
    // Drive it from the enemy's side of the field: build the state by hand.
    const ada = F.mon(MQ, "t_norm", 40, ["sysadmin_reboot", "t_tackle", "t_growl"]);
    const engine = MQ.Battle.create({
      kind: "wild", seed: 44,
      playerParty: [F.mon(MQ, "t_norm", 5, ["t_growl"])], enemyParty: [ada]
    });
    engine.start();
    const b = engine.b;
    slotOf(ada, "t_tackle").pp = 0;
    slotOf(ada, "t_growl").pp = 0;
    BE.addStage(b, ada, "spa", -2, ada, {});
    assert.strictEqual(b.vol(ada).stages.spa, -2);

    BE.runEffect(b, { user: ada, target: b.activesOf(0)[0], move: MQ.Data.moves.sysadmin_reboot },
      MQ.Data.moves.sysadmin_reboot.effects[0]);
    BE.runEffect(b, { user: ada, target: b.activesOf(0)[0], move: MQ.Data.moves.sysadmin_reboot },
      MQ.Data.moves.sysadmin_reboot.effects[1]);
    assert.strictEqual(b.vol(ada).stages.spa, 0, "negative stages wiped");
    assert.strictEqual(slotOf(ada, "t_tackle").pp, slotOf(ada, "t_tackle").ppMax);
    assert.strictEqual(slotOf(ada, "t_growl").pp, slotOf(ada, "t_growl").ppMax);
    assert.ok(a.b, "harness fixture built");
  });

  // =================================================================
  // 4. `mimic_type`
  // =================================================================
  t("`mimic_type` puts the foe's primary type on the user, before the hit", function () {
    const a = fight({ me: "t_norm", myMoves: ["t_borrow"], foe: "t_fire", foeMoves: ["t_growl"], seed: 51 });
    assert.ok(BE.effects.mimic_type, "the engine has a mimic_type handler at all");
    assert.strictEqual(typeList(a.b, a.me), "normal");
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(typeList(a.b, a.me), "fire", "it wore the foe's face");
    assert.strictEqual(a.me.typesMimicked, true);
    assert.ok(has(a.b, /took .* shape/));
  });

  t("the borrowed face is worn for the hit that borrows it", function () {
    // t_borrow is CYBER. Against a CYBER foe the mimic gives the user
    // CYBER typing, so the very same hit picks up STAB.
    D.define("species", "t_cyber", {
      name: "Cybertest", types: ["cyber"], base: { hp: 70, atk: 60, def: 60, spa: 60, spd: 60, spe: 60 },
      catchRate: 120, baseExp: 60, growth: "medium", abilities: [], learnset: [[1, "t_tackle"]], evolutions: []
    });
    const plain = fight({ me: "t_norm", myMoves: ["t_tackle"], foe: "t_cyber", foeMoves: ["t_growl"], seed: 61 });
    const noStab = BE.damage(plain.b, plain.me, plain.foe, D.moves.t_borrow, { power: 60, crit: false, roll: 0.925 }).dmg;

    const a = fight({ me: "t_norm", myMoves: ["t_borrow"], foe: "t_cyber", foeMoves: ["t_growl"], seed: 61 });
    const before = a.foe.hp;
    a.engine.choose({ type: "move", index: 0 });
    const dealt = before - a.foe.hp;
    assert.strictEqual(typeList(a.b, a.me), "cyber");
    assert.ok(dealt > noStab, "the borrowed face already carried STAB: " + dealt + " vs " + noStab);
  });

  t("a borrowed face is dropped on switch-out and at the bell", function () {
    const bench = F.mon(MQ, "t_norm", 40, ["t_tackle"]);
    const a = fight({ me: "t_norm", myMoves: ["t_borrow"], foe: "t_fire", foeMoves: ["t_growl"], seed: 52, bench: [bench] });
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(typeList(a.b, a.me), "fire");
    a.engine.choose({ type: "switch", index: 1 });
    assert.strictEqual(a.me.typesOverride, null, "the face came off on the way out");
    assert.strictEqual(a.me.typesMimicked, false);
  });

  t("the real UNDERSTUDY_MASK borrows a face through Overdrive", function () {
    const me = F.mon(MQ, "t_norm", 40, ["t_tackle"]);
    me.overdriveMove = "understudy_mask";
    const foe = F.mon(MQ, "t_fire", 40, ["t_growl"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 53, playerParty: [me], enemyParty: [foe] });
    engine.start();
    const a = { engine: engine, b: engine.b, me: me, foe: foe };
    a.me.overdrive = 100;
    MQ.Flags.set("overdrive_unlocked", true);
    assert.strictEqual(MQ.Battle.overdriveMove(a.b, a.me).id, "understudy_mask");
    a.engine.choose({ type: "overdrive" });
    assert.strictEqual(typeList(a.b, a.me), "fire");
    // copy_stages, the mask's other clause, still ran.
    assert.ok(a.b.log.some(function (x) { return x.type === "stage" && x.copied; }));
  });

  // =================================================================
  // 5. effect-carried `priority`
  // =================================================================
  t("a `priority` effect moves the user up the bracket", function () {
    // t_iron is base spe 30, t_cat is base spe 110 — the cat always wins
    // the tie unless the rush bracket does its job.
    const slow = fight({ me: "t_iron", myMoves: ["t_tackle"], foe: "t_cat", foeMoves: ["t_tackle"], seed: 71 });
    slow.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(slow.b.firstMover, slow.foe.uid, "without it the fast one leads");

    const rush = fight({ me: "t_iron", myMoves: ["t_rush"], foe: "t_cat", foeMoves: ["t_tackle"], seed: 71 });
    rush.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(rush.b.firstMover, rush.me.uid, "the priority effect struck first");
  });

  t("a `when` on a priority effect gates the bracket", function () {
    const dry = fight({ me: "t_iron", myMoves: ["t_rain_rush"], foe: "t_cat", foeMoves: ["t_tackle"], seed: 72 });
    dry.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(dry.b.firstMover, dry.foe.uid, "no rain, no rush");

    const wet = fight({ me: "t_iron", myMoves: ["t_rain_rush"], foe: "t_cat", foeMoves: ["t_tackle"], seed: 72,
      opts: { rules: { weather: "rain", weatherTurns: 5 } } });
    wet.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(wet.b.firstMover, wet.me.uid, "in the rain it leads");
  });

  t("MEADOW's Zoomies strikes first out of Overdrive", function () {
    const a = fight({ me: "t_cat", myLevel: 30, myMoves: ["t_tackle"], foe: "t_cat", foeLevel: 30,
      foeMoves: ["t_tackle"], seed: 73 });
    // Slow the cat right down so only the +2 bracket can save it.
    a.me.stats.spe = 1;
    a.me.overdrive = 100;
    MQ.Flags.set("overdrive_unlocked", true);
    assert.strictEqual(MQ.Battle.overdriveMove(a.b, a.me).id, "zoomies");
    a.engine.choose({ type: "overdrive" });
    assert.strictEqual(a.b.firstMover, a.me.uid, "Zoomies is +2 and goes first");
  });

  // =================================================================
  // 6. `weather_boost`
  // =================================================================
  t("`weather_boost` multiplies power only in its own weather", function () {
    const a = fight({ myMoves: ["t_gale"], foeMoves: ["t_growl"], seed: 81 });
    assert.strictEqual(BE.scaledPower(a.b, a.me, a.foe, D.moves.t_gale), 70, "no wind, no boost");
    a.b.field.weather = "wind";
    assert.strictEqual(BE.scaledPower(a.b, a.me, a.foe, D.moves.t_gale), 91, "70 × 1.3 in the wind");
    a.b.field.weather = "rain";
    assert.strictEqual(BE.scaledPower(a.b, a.me, a.foe, D.moves.t_gale), 70, "the wrong weather does nothing");
  });

  t("a weather-boosted move actually hits harder in its weather", function () {
    const calm = fight({ myMoves: ["t_gale"], foe: "t_norm", foeLevel: 60, foeMoves: ["t_growl"], seed: 82 });
    const calmBefore = calm.foe.hp;
    calm.engine.choose({ type: "move", index: 0 });
    const calmDmg = calmBefore - calm.foe.hp;

    const windy = fight({ myMoves: ["t_gale"], foe: "t_norm", foeLevel: 60, foeMoves: ["t_growl"], seed: 82,
      opts: { rules: { weather: "wind", weatherTurns: 8 } } });
    const windyBefore = windy.foe.hp;
    windy.engine.choose({ type: "move", index: 0 });
    const windyDmg = windyBefore - windy.foe.hp;
    assert.ok(windyDmg > calmDmg, "wind hit for " + windyDmg + " vs " + calmDmg);
  });

  // =================================================================
  // 7. the bag numbers the engine would fall back on
  // =================================================================
  t("state.js's private item fallback matches js/data/items.js", function () {
    // MQ.Inventory keeps a hard-coded table for the case where
    // js/data/items.js has not loaded, and the battle engine's own
    // itemData() does the same. It had drifted: Elixir healed 120 there
    // and 80 in the real bag, so anything measured against the fallback
    // was measuring an item that does not exist.
    const fs = require("fs");
    const path = require("path");
    // A clean load: this file's fixtures redefine some item ids.
    const real = require("../headless").load().MQ.Data.items;
    const src = fs.readFileSync(path.join(__dirname, "..", "..", "js", "content", "state.js"), "utf8");
    const start = src.indexOf("const FALLBACK = {");
    assert.ok(start > 0, "found the fallback table");
    const body = src.slice(start, src.indexOf("\n  };", start));
    const bad = [];
    body.split("\n").forEach(function (line) {
      const m = /^\s*([a-z0-9_]+):\s*\{(.*)\},?\s*$/.exec(line);
      if (!m) return;
      const id = m[1], def = real[id];
      if (!def) return;                        // fallback-only id, nothing to check
      ["price", "amount"].forEach(function (key) {
        const got = new RegExp(key + ":\\s*(-?[0-9.]+)").exec(m[2]);
        if (!got) return;
        if (typeof def[key] !== "number") return;    // e.g. amount:'full'
        if (Number(got[1]) !== def[key]) bad.push(id + "." + key + " " + got[1] + " vs " + def[key]);
      });
    });
    assert.deepStrictEqual(bad, [], "stale fallback: " + bad.join(", "));
  });

  // =================================================================
  // 8. every kind the data can emit has a handler
  // =================================================================
  t("no move-effect kind in the data is a silent no-op", function () {
    const dead = [];
    Object.keys(D.moves).forEach(function (id) {
      (D.moves[id].effects || []).forEach(function (e) {
        if (!BE.effects[e.kind]) dead.push(id + ":" + e.kind);
      });
    });
    assert.deepStrictEqual(dead, [], "dead effects: " + dead.join(", "));
  });
};
