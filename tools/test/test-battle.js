// Battle maths: damage formula, stages, crits, weather/terrain,
// status, capture and XP. All deterministic.
"use strict";
const F = require("./test-battle-fixtures");

module.exports = function (t, assert) {
  const env = F.load();
  const MQ = env.MQ;
  const BE = MQ.BattleEffects;

  t("stage multipliers follow SYSTEMS-SPEC §14", function () {
    assert.strictEqual(BE.stageMul(0), 1);
    assert.strictEqual(BE.stageMul(1), 1.5);
    assert.strictEqual(BE.stageMul(2), 2);
    assert.strictEqual(BE.stageMul(6), 4);
    assert.strictEqual(BE.stageMul(-1), 2 / 3);
    assert.strictEqual(BE.stageMul(-2), 0.5);
    assert.strictEqual(BE.stageMul(-6), 0.25);
    assert.strictEqual(BE.stageMul(9), BE.stageMul(6), "clamped at ±6");
    // accuracy / evasion use the 3/(3+n) family
    assert.strictEqual(BE.accMul(0), 1);
    assert.strictEqual(BE.accMul(1), 4 / 3);
    assert.strictEqual(BE.accMul(3), 2);
    assert.strictEqual(BE.accMul(-3), 0.5);
  });

  t("stat formula matches the spec", function () {
    const ivs = { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 };
    const base = { hp: 60, atk: 70, def: 50, spa: 80, spd: 55, spe: 65 };
    const s = BE.computeStats(base, 50, ivs, "plain");
    assert.strictEqual(s.hp, Math.floor((2 * 60 + 15) * 50 / 100) + 50 + 10);
    assert.strictEqual(s.atk, Math.floor(Math.floor((2 * 70 + 15) * 50 / 100) + 5));
    // temperament ±10%
    const brisk = BE.computeStats(base, 50, ivs, "brisk");
    assert.strictEqual(brisk.spe, Math.floor((Math.floor((2 * 65 + 15) * 50 / 100) + 5) * 1.1));
    assert.strictEqual(brisk.def, Math.floor((Math.floor((2 * 50 + 15) * 50 / 100) + 5) * 0.9));
  });

  t("damage formula reproduces the spec pipeline exactly", function () {
    const b = F.bench(MQ);
    const atk = F.mon(MQ, "t_fire", 50, ["t_ember"]);
    const def = F.mon(MQ, "t_grass", 50, ["t_vine"]);
    b.sides[0].party = [atk]; b.sides[1].party = [def];
    b.sides[0].activeUids = [atk.uid]; b.sides[1].activeUids = [def.uid];
    const move = MQ.Data.moves.t_ember;

    const r = BE.damage(b, atk, def, move, { roll: 1, crit: false });
    // independent reimplementation
    const L = 50, P = 60, A = atk.stats.spa, D = def.stats.spd;
    let base = Math.floor(Math.floor(Math.floor(2 * L / 5 + 2) * P * A / D) / 50) + 2;
    let expect = base * 1 * 1 * 1 /*roll*/ * 1.5 /*STAB fire*/ * 2 /*fire vs grass*/;
    assert.strictEqual(r.dmg, Math.max(1, Math.floor(expect)));
    assert.strictEqual(r.eff, 2);

    // crit is ×1.5 on top
    const c = BE.damage(b, atk, def, move, { roll: 1, crit: true });
    assert.strictEqual(c.dmg, Math.max(1, Math.floor(expect * 1.5)));

    // roll range 85..100
    const lo = BE.damage(b, atk, def, move, { roll: 0.85, crit: false });
    assert.ok(lo.dmg < r.dmg, "min roll deals less than max roll");
    assert.ok(lo.dmg >= Math.floor(r.dmg * 0.8), "min roll is within 85% of max");
  });

  t("STAB, Silk Scarf, weather and terrain stack multiplicatively", function () {
    const b = F.bench(MQ);
    const atk = F.mon(MQ, "t_water", 50, ["t_water_gun"]);
    const def = F.mon(MQ, "t_norm", 50, ["t_tackle"]);
    b.sides[0].party = [atk]; b.sides[1].party = [def];
    b.sides[0].activeUids = [atk.uid]; b.sides[1].activeUids = [def.uid];
    const move = MQ.Data.moves.t_water_gun;
    const plain = BE.damage(b, atk, def, move, { roll: 1 }).dmg;
    b.field.weather = "rain";
    const rain = BE.damage(b, atk, def, move, { roll: 1 }).dmg;
    assert.ok(rain > plain * 1.4 && rain <= plain * 1.6, "rain is roughly ×1.5 on Water");
    b.field.weather = "sun";
    const sun = BE.damage(b, atk, def, move, { roll: 1 }).dmg;
    assert.ok(sun < plain, "sun halves Water");
    b.field.weather = null;
    atk.gear = "silk_scarf";
    const scarf = BE.damage(b, atk, def, move, { roll: 1 }).dmg;
    assert.ok(scarf > plain, "Silk Scarf adds ×1.1 to STAB");
    atk.gear = null;
    b.field.terrain = "wet";
    const wet = BE.damage(b, atk, def, move, { roll: 1 }).dmg;
    assert.strictEqual(wet, plain, "Wet does not boost Water");
  });

  t("type immunity yields zero and stages shift damage", function () {
    const b = F.bench(MQ);
    const atk = F.mon(MQ, "t_norm", 40, ["t_tackle"]);
    const ghost = MQ.Battle.makeMonster("t_norm", 40, { ivs: { hp: 8, atk: 8, def: 8, spa: 8, spd: 8, spe: 8 }, temperament: "plain", moves: ["t_tackle"] });
    ghost.typesOverride = ["ghost"];
    b.sides[0].party = [atk]; b.sides[1].party = [ghost];
    b.sides[0].activeUids = [atk.uid]; b.sides[1].activeUids = [ghost.uid];
    const r = BE.damage(b, atk, ghost, MQ.Data.moves.t_tackle, { roll: 1 });
    assert.strictEqual(r.immune, true);
    assert.strictEqual(r.dmg, 0);

    ghost.typesOverride = ["normal"];
    const flat = BE.damage(b, atk, ghost, MQ.Data.moves.t_tackle, { roll: 1 }).dmg;
    BE.addStage(b, atk, "atk", 2, atk, { quiet: true });
    const boosted = BE.damage(b, atk, ghost, MQ.Data.moves.t_tackle, { roll: 1 }).dmg;
    assert.ok(boosted > flat * 1.8, "+2 atk roughly doubles damage");
    // a crit ignores the attacker's negative stages
    BE.addStage(b, atk, "atk", -6, atk, { quiet: true });
    const dropped = BE.damage(b, atk, ghost, MQ.Data.moves.t_tackle, { roll: 1 }).dmg;
    const critted = BE.damage(b, atk, ghost, MQ.Data.moves.t_tackle, { roll: 1, crit: true }).dmg;
    assert.ok(critted > dropped * 2, "crit ignores the attacker's -4 stage");
  });

  t("crit odds table and crit stage sources", function () {
    const odds = [1 / 24, 1 / 8, 1 / 2, 1];
    for (let i = 0; i < odds.length; i++) assert.strictEqual(BE.CRIT_ODDS[i], odds[i]);
    const b = F.bench(MQ);
    const m = F.mon(MQ, "t_fire", 20, ["t_ember"]);
    b.sides[0].party = [m]; b.sides[0].activeUids = [m.uid];
    assert.strictEqual(BE.critStage(b, m, { crit: 0 }, {}), 0);
    assert.strictEqual(BE.critStage(b, m, { crit: 2 }, {}), 2);
    m.gear = "lucky_coin";
    assert.strictEqual(BE.critStage(b, m, { crit: 1 }, {}), 2, "Lucky Coin adds a stage");
    assert.strictEqual(BE.critStage(b, m, { crit: 3 }, { critBonus: 3 }), 3, "clamped at 3");
  });

  t("accuracy uses acc-eva stages and Fog", function () {
    const b = F.bench(MQ);
    const a = F.mon(MQ, "t_norm", 30, ["t_tackle"]);
    const d = F.mon(MQ, "t_norm", 30, ["t_tackle"]);
    b.sides[0].party = [a]; b.sides[1].party = [d];
    b.sides[0].activeUids = [a.uid]; b.sides[1].activeUids = [d.uid];
    const move = MQ.Data.moves.t_toxic;   // acc 90
    const ctx = {};
    b.rng = function () { return 2; };     // force a miss so ctx.hitChance is filled
    BE.accuracyCheck(b, a, d, move, ctx);
    assert.ok(Math.abs(ctx.hitChance - 0.9) < 1e-9);
    BE.addStage(b, d, "eva", 2, d, { quiet: true });
    const ctx2 = {};
    BE.accuracyCheck(b, a, d, move, ctx2);
    assert.ok(Math.abs(ctx2.hitChance - 0.9 * (3 / 5)) < 1e-9, "evasion +2 gives 3/5");
    // Fog ignores evasion but costs 25% accuracy
    b.field.weather = "fog";
    const ctx3 = {};
    BE.accuracyCheck(b, a, d, move, ctx3);
    assert.ok(Math.abs(ctx3.hitChance - 0.9 * 0.75) < 1e-9, "fog: evasion ignored, -25%");
    // Torch ignores the fog penalty
    a.gear = "torch";
    const ctx4 = {};
    BE.accuracyCheck(b, a, d, move, ctx4);
    assert.ok(Math.abs(ctx4.hitChance - 0.9) < 1e-9);
    // acc 999 never misses
    b.rng = function () { return 0.999999; };
    assert.strictEqual(BE.accuracyCheck(b, a, d, { acc: 999 }, {}), true);
  });

  t("status: immunities, durations and chip damage", function () {
    const b = F.bench(MQ);
    const fire = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const norm = F.mon(MQ, "t_norm", 30, ["t_tackle"]);
    b.sides[0].party = [fire, norm]; b.sides[1].party = [];
    b.sides[0].activeUids = [fire.uid];

    assert.strictEqual(BE.applyStatus(b, fire, "brn", norm, {}), false, "Fire types cannot burn");
    assert.strictEqual(BE.applyStatus(b, norm, "brn", fire, {}), true);
    assert.strictEqual(norm.status, "brn");
    assert.strictEqual(BE.applyStatus(b, norm, "psn", fire, {}), false, "one status at a time");

    // Static terrain blocks sleep
    const w = F.mon(MQ, "t_water", 30, ["t_tackle"]);
    b.sides[0].party.push(w);
    b.field.terrain = "static";
    assert.strictEqual(BE.applyStatus(b, w, "slp", fire, {}), false);
    b.field.terrain = null;
    assert.strictEqual(BE.applyStatus(b, w, "slp", fire, {}), true);
    assert.ok(w.statusTurns >= 1 && w.statusTurns <= 3, "sleep lasts 1-3 turns");

    // Confusion lasts 2-5
    const c = F.mon(MQ, "t_norm", 30, ["t_tackle"]);
    b.sides[0].party.push(c);
    assert.strictEqual(BE.applyStatus(b, c, "cnf", fire, {}), true);
    const conf = b.vol(c).conf;
    assert.ok(conf >= 2 && conf <= 5);
    // Iron Will blocks foe-caused stat drops (the source must be a foe)
    const iron = F.mon(MQ, "t_iron", 30, ["t_tackle"]);
    b.sides[1].party.push(iron);
    b.sides[1].activeUids = [iron.uid];
    assert.strictEqual(BE.addStage(b, iron, "atk", -1, fire, {}), 0);
    assert.strictEqual(BE.addStage(b, iron, "atk", 1, iron, {}), 1, "own boosts still work");
  });

  t("Toxic escalates n/16 and Burn halves physical damage", function () {
    const b = F.bench(MQ);
    const a = F.mon(MQ, "t_norm", 50, ["t_tackle"]);
    const d = F.mon(MQ, "t_norm", 50, ["t_tackle"]);
    b.sides[0].party = [a]; b.sides[1].party = [d];
    b.sides[0].activeUids = [a.uid]; b.sides[1].activeUids = [d.uid];
    const clean = BE.damage(b, a, d, MQ.Data.moves.t_tackle, { roll: 1 }).dmg;
    a.status = "brn";
    const burnt = BE.damage(b, a, d, MQ.Data.moves.t_tackle, { roll: 1 }).dmg;
    assert.ok(Math.abs(burnt - Math.floor(clean * 0.5)) <= 1, "burn halves physical");
    // Special is untouched
    const sa = F.mon(MQ, "t_fire", 50, ["t_ember"]);
    b.sides[0].party.push(sa);
    const spec1 = BE.damage(b, sa, d, MQ.Data.moves.t_ember, { roll: 1 }).dmg;
    sa.status = "brn";
    const spec2 = BE.damage(b, sa, d, MQ.Data.moves.t_ember, { roll: 1 }).dmg;
    assert.strictEqual(spec1, spec2, "burn does not touch special damage");
  });

  t("capture formula matches SYSTEMS-SPEC §11", function () {
    const b = F.bench(MQ);
    const foe = F.mon(MQ, "t_grass", 10, ["t_vine"]);
    b.sides[1].party = [foe]; b.sides[1].activeUids = [foe.uid];
    b.rng = function () { return 0; };   // every shake passes
    const M = foe.stats.hp;
    foe.hp = M;
    const res = BE.capture(b, foe, "capsule_basic", { timing: 1 });
    const expectA = Math.min(1, ((3 * M - 2 * M) * 150 * 1 * 1 * 1.01 * 1 * 1 / (3 * M)) / 255);
    assert.ok(Math.abs(res.a - expectA) < 1e-6, "a matches the formula (" + res.a + " vs " + expectA + ")");
    // Wounded and asleep is far better
    foe.hp = 1; foe.status = "slp";
    const res2 = BE.capture(b, foe, "capsule_kernel", { timing: 1 });
    assert.ok(res2.a > res.a * 4, "1 HP + sleep + Kernel capsule is a big jump");
    // Root capsule is a certainty
    const res3 = BE.capture(b, foe, "capsule_root", {});
    assert.strictEqual(res3.success, true);
    assert.strictEqual(res3.shakes, 4);
    // Four failed shakes when the odds are nil
    b.rng = function () { return 0.999999; };
    foe.hp = M; foe.status = null;
    const res4 = BE.capture(b, foe, "capsule_basic", { timing: 1 });
    assert.strictEqual(res4.success, false);
    assert.strictEqual(res4.shakes, 0);
  });

  t("capsule tiers apply their situational multipliers", function () {
    const b = F.bench(MQ);
    const foe = F.mon(MQ, "t_water", 10, ["t_tackle"]);
    b.sides[1].party = [foe]; b.sides[1].activeUids = [foe.uid];
    assert.strictEqual(BE.capsuleBonus(b, foe, "capsule_basic"), 1);
    assert.strictEqual(BE.capsuleBonus(b, foe, "capsule_mesh"), 1.5);
    assert.strictEqual(BE.capsuleBonus(b, foe, "capsule_kernel"), 2);
    assert.strictEqual(BE.capsuleBonus(b, foe, "capsule_brine"), 3, "Water foe");
    b.turn = 1;
    assert.strictEqual(BE.capsuleBonus(b, foe, "capsule_quick"), 4);
    b.turn = 3;
    assert.strictEqual(BE.capsuleBonus(b, foe, "capsule_quick"), 1);
  });

  t("XP: participants, share, Ledger and the over-levelling brake", function () {
    const b = F.bench(MQ);
    const foe = F.mon(MQ, "t_grass", 20, ["t_vine"]);
    const me = F.mon(MQ, "t_fire", 20, ["t_ember"]);
    b.sides[0].party = [me]; b.sides[1].party = [foe];
    const base = Math.floor(60 * 20 / 5);
    assert.strictEqual(BE.baseXp(b, foe, { kind: "wild" }), base);
    assert.strictEqual(BE.baseXp(b, foe, { kind: "trainer" }), Math.floor(base * 1.5));
    assert.strictEqual(BE.baseXp(b, foe, { kind: "boss" }), base * 2);
    assert.strictEqual(BE.xpFor(b, me, foe, { kind: "wild", participant: true }), base);
    assert.strictEqual(BE.xpFor(b, me, foe, { kind: "wild", participant: false }), Math.floor(base * 0.5));
    me.gear = "ledger";
    assert.strictEqual(BE.xpFor(b, me, foe, { kind: "wild", participant: true }), Math.floor(base * 1.5));
    me.gear = null;
    const over = F.mon(MQ, "t_fire", 40, ["t_ember"]);
    b.sides[0].party.push(over);
    const scaled = BE.xpFor(b, over, foe, { kind: "wild", participant: true });
    assert.ok(scaled < base, "over-levelled monsters earn less");
  });

  t("level curve growth groups", function () {
    assert.strictEqual(BE.expForLevel(10, "medium"), 1000);
    assert.strictEqual(BE.expForLevel(10, "fast"), 800);
    assert.strictEqual(BE.expForLevel(10, "slow"), 1250);
    assert.strictEqual(BE.levelFromExp(999, "medium"), 9);
    assert.strictEqual(BE.levelFromExp(1000, "medium"), 10);
  });

  t("difficulty table matches SYSTEMS-SPEC §13", function () {
    assert.strictEqual(BE.DIFF.story.enemyLevel, 0.9);
    assert.strictEqual(BE.DIFF.hard.enemyLevel, 1.1);
    assert.strictEqual(BE.DIFF.nightmare.enemyLevel, 1.2);
    assert.strictEqual(BE.DIFF.normal.xpShare, 0.5);
    assert.strictEqual(BE.DIFF.nightmare.xpShare, 0.25);
    assert.strictEqual(BE.DIFF.hard.agentCd, 2);
    assert.strictEqual(BE.DIFF.nightmare.bossOd, 75);
  });

  t("all 30 abilities and every SYSTEMS-SPEC effect kind are implemented", function () {
    const wanted = ["back_from_the_brink", "slipstream", "silk_weave", "brine_body", "salt_crust", "firebox",
      "overclock", "sandbox", "rootkit", "honeypot", "proxy_fog", "rain_caller", "ridge_wind", "damp_squib",
      "thick_fleece", "iron_will", "nightshift", "cheshire_grin", "deep_roots", "static_charge", "signal_jammer",
      "scavenger", "wetlander", "sun_trap", "cold_storage", "payload", "fail_safe", "loud_bell", "stonemason", "kernel_panic"];
    assert.strictEqual(wanted.length, 30);
    wanted.forEach(function (id) { assert.ok(BE.abilities[id], "missing ability " + id); });

    const kinds = ["damage", "status", "stage", "heal", "drain", "recoil", "multihit", "flinch", "protect",
      "charge", "recharge", "weather", "terrain", "fixed", "ohko", "crit_only", "never_miss", "high_crit",
      "weight", "hp_scaled", "force_switch", "trap", "screen", "cleanse", "counter", "overdrive", "agent",
      "swap_stats", "copy_stages", "sleep_talk", "rest", "endure", "taunt", "pp_drain",
      "multi", "cure", "leech", "confuse", "levelDamage"];
    kinds.forEach(function (k) { assert.ok(typeof BE.effects[k] === "function", "missing effect kind " + k); });

    const gear = ["silk_scarf", "brine_charm", "ember_coal", "copper_coil", "cipher_lens", "patch_cable",
      "walkers_boots", "heavy_anvil", "kevlar_waistcoat", "rail_pass", "lucky_coin", "focus_band",
      "toxic_sachet", "rusty_nail", "umbrella", "weathervane", "ledger", "cat_bell", "warm_blanket", "torch",
      "damson", "perry_flask", "elm_sap", "salt_lick", "toffee"];
    assert.strictEqual(gear.length, 25);
    gear.forEach(function (id) { assert.ok(BE.gear[id], "missing gear " + id); });
    ["anchor_packet", "anchor_cipher", "anchor_bear", "anchor_kernel", "anchor_token", "anchor_daemon", "anchor_proxy", "anchor_admin"]
      .forEach(function (id) { assert.ok(BE.gear[id], "missing anchor " + id); });
  });

  t("gear stat modifiers apply through statOf", function () {
    const b = F.bench(MQ);
    const m = F.mon(MQ, "t_norm", 50, ["t_tackle"]);
    b.sides[0].party = [m]; b.sides[0].activeUids = [m.uid];
    const baseAtk = BE.statOf(b, m, "atk");
    const baseSpe = BE.statOf(b, m, "spe");
    m.gear = "heavy_anvil";
    assert.ok(Math.abs(BE.statOf(b, m, "atk") - baseAtk * 1.3) < 1e-6);
    assert.ok(Math.abs(BE.statOf(b, m, "spe") - baseSpe * 0.5) < 1e-6);
    m.gear = "walkers_boots";
    assert.ok(Math.abs(BE.statOf(b, m, "spe") - baseSpe * 1.5) < 1e-6);
    m.gear = null;
    m.status = "par";
    assert.ok(Math.abs(BE.statOf(b, m, "spe") - baseSpe * 0.5) < 1e-6, "paralysis halves speed");
  });

  t("Overdrive gains follow §7 and cap at 100", function () {
    const b = F.bench(MQ);
    const m = F.mon(MQ, "t_norm", 30, ["t_tackle"]);
    b.sides[0].party = [m]; b.sides[0].activeUids = [m.uid];
    b.overdriveActive = function () { return true; };
    assert.strictEqual(BE.OD.hitTaken, 8);
    assert.strictEqual(BE.OD.superTaken, 12);
    assert.strictEqual(BE.OD.dealt, 6);
    assert.strictEqual(BE.OD.allyFaint, 15);
    assert.strictEqual(BE.OD.ko, 20);
    BE.gainOverdrive(b, m, 30, "test");
    assert.strictEqual(m.overdrive, 30);
    BE.gainOverdrive(b, m, 200, "test");
    assert.strictEqual(m.overdrive, 100);
    m.overdrive = 0;
    m.gear = "kevlar_waistcoat";
    BE.gainOverdrive(b, m, 50, "test");
    assert.strictEqual(m.overdrive, 0, "Kevlar Waistcoat disables Overdrive");
  });
};
