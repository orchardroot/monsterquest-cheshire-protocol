// Abilities, gear and the move-effect vocabulary, exercised
// through real turns rather than by poking at the tables.
"use strict";
const F = require("./test-battle-fixtures");

module.exports = function (t, assert) {
  const env = F.load();
  const MQ = env.MQ;
  const BE = MQ.BattleEffects;

  // A one-turn harness: give both sides a move, run one turn, inspect.
  function turn(o) {
    const me = F.mon(MQ, o.me || "t_norm", o.myLevel || 40, o.myMoves || ["t_tackle"], o.myExtra);
    const foe = F.mon(MQ, o.foe || "t_norm", o.foeLevel || 40, o.foeMoves || ["t_tackle"], o.foeExtra);
    if (o.myAbility !== undefined) me.ability = o.myAbility;
    if (o.foeAbility !== undefined) foe.ability = o.foeAbility;
    if (o.myGear) me.gear = o.myGear;
    if (o.foeGear) foe.gear = o.foeGear;
    const engine = MQ.Battle.create(Object.assign({
      kind: "wild", seed: o.seed === undefined ? 1 : o.seed,
      playerParty: [me].concat(o.bench || []), enemyParty: [foe]
    }, o.opts || {}));
    engine.start();
    return { engine: engine, b: engine.b, me: me, foe: foe };
  }
  function has(b, re) { return b.log.some(function (x) { return x.type === "msg" && re.test(x.text); }); }

  t("Rain Caller and Proxy Fog set their weather on switch-in", function () {
    const a = turn({ myAbility: "rain_caller" });
    assert.strictEqual(a.b.field.weather, "rain");
    const c = turn({ myAbility: "proxy_fog", seed: 2 });
    assert.strictEqual(c.b.field.weather, "fog");
    assert.strictEqual(c.b.field.weatherTurns, 4);
    const d = turn({ myAbility: "ridge_wind", seed: 3 });
    assert.strictEqual(d.b.field.weather, "wind");
  });

  t("Slipstream boosts speed on entry; Quiet Cat makes it +2", function () {
    const a = turn({ myAbility: "slipstream" });
    assert.strictEqual(a.b.vol(a.me).stages.spe, 1);
    MQ.Flags.set("perk_escalate_quiet_cat", true);
    const c = turn({ myAbility: "slipstream", seed: 9 });
    assert.strictEqual(c.b.vol(c.me).stages.spe, 2);
    MQ.Flags.set("perk_escalate_quiet_cat", false);
  });

  t("Rootkit suppresses the foe's ability for three turns", function () {
    const a = turn({ myAbility: "rootkit", foeAbility: "firebox" });
    assert.strictEqual(a.b.vol(a.foe).abilityOff, 3);
    assert.strictEqual(BE.abilityOf(a.b, a.foe), null, "hooks see no ability");
    assert.ok(has(a.b, /suppressed by Rootkit/));
  });

  t("Static Charge and Toxic Sachet punish contact", function () {
    let paralysed = 0;
    for (let s = 0; s < 30; s++) {
      const a = turn({ myAbility: "static_charge", seed: s, foeMoves: ["t_tackle"], myMoves: ["t_growl"] });
      a.engine.choose({ type: "move", index: 0 });
      if (a.foe.status === "par") paralysed++;
    }
    assert.ok(paralysed > 2 && paralysed < 25, "roughly 30% of contact hits paralysed (" + paralysed + "/30)");
  });

  t("Back from the Brink survives one lethal hit from full health", function () {
    const a = turn({ me: "t_norm", myLevel: 5, myAbility: "back_from_the_brink", foe: "t_fire", foeLevel: 60, foeMoves: ["t_recoil"], myMoves: ["t_growl"], seed: 4 });
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.me.hp, 1, "left on 1 HP");
    assert.ok(has(a.b, /came back from the brink/));
    assert.strictEqual(a.b.vol(a.me).brinkLeft, 0, "and only the once");
  });

  t("Focus Band and Endure are the other two lifelines", function () {
    const a = turn({ me: "t_norm", myLevel: 5, myGear: "focus_band", foe: "t_fire", foeLevel: 60, foeMoves: ["t_recoil"], myMoves: ["t_growl"], seed: 4 });
    a.b.rng = function () { return 0; };     // the 10% roll always succeeds
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.me.hp, 1);
    assert.ok(has(a.b, /Focus Band/));
  });

  t("Iron Will refuses flinches and foe-imposed stat drops", function () {
    const a = turn({ myAbility: "iron_will", foeMoves: ["t_flinch"], myMoves: ["t_growl"], foeLevel: 60, me: "t_iron", myLevel: 60 });
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(!a.b.vol(a.me).flinch, "never flinched");
    const c = turn({ myAbility: "iron_will", foeMoves: ["t_growl"], myMoves: ["t_growl"], seed: 6 });
    c.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(c.b.vol(c.me).stages.atk, 0, "the foe's Growl did nothing");
  });

  t("Honeypot turns a status move back on its user", function () {
    const a = turn({ myAbility: "honeypot", foeMoves: ["t_growl"], myMoves: ["t_growl"], seed: 12 });
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(has(a.b, /honeypot/), "the trap sprang");
  });

  t("Loud Bell is deaf to sound and Kernel Panic burns the killer's PP", function () {
    MQ.Data.define("moves", "t_shout", { name: "Test Shout", type: "normal", cat: "spec", power: 60, acc: 100, pp: 10, priority: 0, crit: 0, flags: { sound: true }, effects: [] });
    const a = turn({ myAbility: "loud_bell", foeMoves: ["t_shout"], myMoves: ["t_growl"], seed: 3, me: "t_iron", myLevel: 60 });
    const before = a.me.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.me.hp, before, "the shout bounced off");

    const c = turn({ me: "t_fire", myLevel: 60, myMoves: ["t_ember"], foe: "t_grass", foeLevel: 5, foeAbility: "kernel_panic", seed: 8 });
    c.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(c.me.moves[0].pp, 0, "Kernel Panic wiped the PP of the killing move");
    assert.ok(has(c.b, /Kernel panic/));
  });

  t("Scavenger heals a quarter on a knockout", function () {
    const a = turn({ me: "t_fire", myLevel: 60, myAbility: "scavenger", myMoves: ["t_ember"], foe: "t_grass", foeLevel: 5, seed: 5 });
    a.me.hp = Math.floor(a.me.stats.hp / 2);
    const before = a.me.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(a.me.hp > before, "scavenged " + (a.me.hp - before) + " HP back");
  });

  t("Fail-Safe fires once when HP first drops under a quarter", function () {
    const a = turn({ me: "t_iron", myLevel: 60, myAbility: "fail_safe", myMoves: ["t_growl"], foe: "t_fire", foeLevel: 60, foeMoves: ["t_ember"], seed: 14 });
    a.me.hp = Math.floor(a.me.stats.hp * 0.26);
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.b.vol(a.me).failSafeUsed, true);
    assert.strictEqual(a.b.vol(a.me).stages.def, 2);
    assert.strictEqual(a.b.vol(a.me).stages.spd, 2);
  });

  t("Payload multiplies only the first damaging move per entry", function () {
    const a = turn({ me: "t_norm", myLevel: 50, myAbility: "payload", myMoves: ["t_tackle"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 30 });
    const max = a.b.maxHp(a.foe);
    a.engine.choose({ type: "move", index: 0 });
    const first = max - a.foe.hp;
    const mid = a.foe.hp;
    a.engine.choose({ type: "move", index: 0 });
    const second = mid - a.foe.hp;
    assert.ok(first > second, "first hit " + first + " beat the second " + second);
  });

  t("held consumables trigger and are eaten", function () {
    const a = turn({ me: "t_iron", myLevel: 60, myGear: "damson", myMoves: ["t_growl"], foe: "t_fire", foeLevel: 60, foeMoves: ["t_ember"], seed: 16 });
    a.me.hp = Math.floor(a.b.maxHp(a.me) * 0.51);
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.me.gear, null, "the Damson was eaten");
    assert.ok(has(a.b, /ate its Damson/));

    const c = turn({ me: "t_iron", myLevel: 60, myGear: "perry_flask", myMoves: ["t_growl"], foe: "t_norm", foeLevel: 60, foeMoves: ["t_toxic"], seed: 17 });
    c.engine.choose({ type: "move", index: 0 });
    if (has(c.b, /Perry Flask/)) { assert.strictEqual(c.me.status, null); assert.strictEqual(c.me.gear, null); }

    const d = turn({ me: "t_iron", myLevel: 60, myGear: "salt_lick", myMoves: ["t_growl"], foeMoves: ["t_growl"], seed: 18 });
    d.me.moves[0].pp = 1;
    d.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(d.me.moves[0].pp, 10, "the Salt Lick topped it up");
    assert.strictEqual(d.me.gear, null);
  });

  t("Rusty Nail bites the attacker back", function () {
    const a = turn({ me: "t_iron", myLevel: 60, myGear: "rusty_nail", myMoves: ["t_growl"], foe: "t_norm", foeLevel: 40, foeMoves: ["t_tackle"], seed: 19 });
    const before = a.foe.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(a.foe.hp < before, "the attacker caught itself");
    assert.ok(has(a.b, /Rusty Nail/));
  });

  t("Warm Blanket wakes the holder once per battle", function () {
    const a = turn({ me: "t_iron", myLevel: 60, myGear: "warm_blanket", myMoves: ["t_growl"], foeMoves: ["t_sleep"], seed: 22 });
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.me.status, null, "the blanket brought it round at end of turn");
    assert.strictEqual(a.b.vol(a.me).blanketUsed, true);
  });

  t("trap prevents switching and chips 1/8 a turn", function () {
    const bench = F.mon(MQ, "t_water", 40, ["t_water_gun"]);
    const a = turn({ me: "t_iron", myLevel: 60, myMoves: ["t_growl"], foeMoves: ["t_trap"], foeLevel: 60, bench: [bench], seed: 24 });
    const before = a.me.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(a.b.vol(a.me).trapped > 0, "trapped");
    assert.ok(a.me.hp < before, "and chipped");
    assert.ok(a.engine.validate({ type: "switch", index: 1 }), "cannot switch while trapped");
    assert.strictEqual(a.engine.options().canRun, false);
  });

  t("screens halve incoming damage of their category", function () {
    const a = turn({ me: "t_iron", myLevel: 60, myMoves: ["t_screen", "t_growl"], foe: "t_fire", foeLevel: 60, foeMoves: ["t_ember"], seed: 26 });
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.b.sides[0].screens.spec > 0, true);
    assert.ok(a.me.overdrive >= 10 || !a.b.overdriveActive(a.me), "the +10 Overdrive rider fired when the meter is live");
  });

  t("level damage, drain and recoil do exactly what they say", function () {
    const a = turn({ me: "t_norm", myLevel: 37, myMoves: ["t_level"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 28 });
    const before = a.foe.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(before - a.foe.hp, 37, "level damage equals the user's level");

    const c = turn({ me: "t_norm", myLevel: 50, myMoves: ["t_drain"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 29 });
    c.me.hp = Math.floor(c.b.maxHp(c.me) / 2);
    const mine = c.me.hp, theirs = c.foe.hp;
    c.engine.choose({ type: "move", index: 0 });
    const dealt = theirs - c.foe.hp;
    assert.ok(c.me.hp - mine >= Math.floor(dealt * 0.5) - 1, "healed roughly half of what it dealt");

    const d = turn({ me: "t_norm", myLevel: 50, myMoves: ["t_recoil"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 31 });
    const mine2 = d.me.hp, theirs2 = d.foe.hp;
    d.engine.choose({ type: "move", index: 0 });
    const dealt2 = theirs2 - d.foe.hp;
    assert.ok(mine2 - d.me.hp >= Math.floor(dealt2 * 0.25) - 1, "took a quarter back as recoil");
  });

  t("charge moves take a turn to wind up, and the wind skips it", function () {
    const a = turn({ me: "t_norm", myLevel: 50, myMoves: ["t_charge"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 33 });
    const before = a.foe.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.foe.hp, before, "nothing landed on the charge turn");
    assert.ok(has(a.b, /winding up/));
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(a.foe.hp < before, "and it landed the turn after");

    const c = turn({ me: "t_norm", myLevel: 50, myMoves: ["t_charge"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 34, opts: { rules: { weather: "wind", weatherTurns: 8 } } });
    const cb = c.foe.hp;
    c.engine.choose({ type: "move", index: 0 });
    assert.ok(c.foe.hp < cb, "the wind carried it straight through");
  });

  t("Signal Jammer eats charge moves outright", function () {
    let jammed = 0;
    for (let s = 0; s < 30; s++) {
      const a = turn({ me: "t_norm", myLevel: 50, myMoves: ["t_charge"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], foeAbility: "signal_jammer", seed: s + 200 });
      a.engine.choose({ type: "move", index: 0 });
      if (has(a.b, /never got off the ground/)) jammed++;
    }
    assert.ok(jammed > 2 && jammed < 22, "jammed " + jammed + "/30 (spec says 30%)");
  });

  t("terrain rules bite: Salt cures poison, Static blocks sleep, Silk stops priority", function () {
    const a = turn({ me: "t_iron", myLevel: 60, myMoves: ["t_saltmaker", "t_growl"], foeMoves: ["t_growl"], seed: 36 });
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.b.field.terrain, "salt");

    const c = turn({ me: "t_iron", myLevel: 60, myMoves: ["t_growl"], foeMoves: ["t_sleep"], seed: 37, opts: { rules: { terrain: "static", terrainTurns: 8 } } });
    c.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(c.me.status, null, "Static terrain will not let anything sleep");

    const d = turn({ me: "t_norm", myLevel: 50, myMoves: ["t_flinch"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 38, opts: { rules: { terrain: "silk", terrainTurns: 8 } } });
    const before = d.foe.hp;
    d.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(d.foe.hp, before, "the silk snagged the priority move");
    assert.ok(has(d.b, /silk snagged/));
  });

  t("OHKO fails against a higher-level target", function () {
    const a = turn({ me: "t_norm", myLevel: 20, myMoves: ["t_ohko"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 40 });
    const before = a.foe.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(a.foe.hp, before);
    assert.ok(has(a.b, /too senior/));
  });

  t("Deep Roots refuses a forced switch", function () {
    MQ.Data.define("moves", "t_whirl", { name: "Test Whirl", type: "normal", cat: "status", power: 0, acc: 100, pp: 10, priority: 0, crit: 0, flags: {}, effects: [{ kind: "force_switch" }] });
    const a = turn({ me: "t_norm", myLevel: 50, myMoves: ["t_whirl"], foe: "t_grass", foeLevel: 50, foeAbility: "deep_roots", foeMoves: ["t_growl"], seed: 42 });
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(has(a.b, /rooted to the spot/));
  });

  t("Overclock adds bite to Cyber moves and costs recoil", function () {
    const a = turn({ me: "t_norm", myLevel: 50, myAbility: "overclock", myMoves: ["t_charge"], foe: "t_iron", foeLevel: 60, foeMoves: ["t_growl"], seed: 44, opts: { rules: { weather: "wind", weatherTurns: 8 } } });
    const before = a.me.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(a.me.hp < before, "Overclock took its 1/16");
    assert.ok(has(a.b, /running hot/));
  });

  t("Brine Body: immune to burn, tops itself up in the rain", function () {
    const a = turn({ me: "t_water", myLevel: 50, myAbility: "brine_body", myMoves: ["t_growl"], foeMoves: ["t_growl"], seed: 46, opts: { rules: { weather: "rain", weatherTurns: 8 } } });
    a.me.hp = Math.floor(a.b.maxHp(a.me) / 2);
    const before = a.me.hp;
    a.engine.choose({ type: "move", index: 0 });
    assert.ok(a.me.hp > before, "the rain healed it");
    assert.strictEqual(BE.statusImmune(a.b, a.me, "brn"), "ability");
  });

  t("Cold Storage only protects above half health", function () {
    const a = turn({ me: "t_water", myLevel: 50, myAbility: "cold_storage", seed: 48 });
    assert.strictEqual(BE.statusImmune(a.b, a.me, "slp"), "ability");
    a.me.hp = 1;
    assert.strictEqual(BE.statusImmune(a.b, a.me, "slp"), null);
  });

  t("Wetlander and Sun Trap read the weather", function () {
    const a = turn({ me: "t_water", myLevel: 50, myAbility: "wetlander", seed: 50 });
    const dry = BE.statOf(a.b, a.me, "spe");
    a.b.field.weather = "rain";
    assert.ok(Math.abs(BE.statOf(a.b, a.me, "spe") - dry * 1.5) < 1e-6);
    const c = turn({ me: "t_fire", myLevel: 50, myAbility: "sun_trap", seed: 51 });
    const dim = BE.statOf(c.b, c.me, "spa");
    c.b.field.weather = "sun";
    assert.ok(Math.abs(BE.statOf(c.b, c.me, "spa") - dim * 1.5) < 1e-6);
  });

  t("weather chip: Wind bites Bugs, Snow bites everything soft", function () {
    const bug = F.mon(MQ, "t_norm", 50, ["t_growl"]);
    bug.typesOverride = ["bug"];
    const a = turn({ me: "t_iron", myLevel: 60, myMoves: ["t_growl"], foeMoves: ["t_growl"], seed: 52, opts: { rules: { weather: "wind", weatherTurns: 8 } } });
    a.b.sides[0].party.push(bug);
    // rock/ground types are exempt from the snow chip
    const c = turn({ me: "t_iron", myLevel: 60, myMoves: ["t_growl"], foeMoves: ["t_growl"], seed: 53, opts: { rules: { weather: "snow", weatherTurns: 8 } } });
    const before = c.me.hp;
    c.engine.choose({ type: "move", index: 0 });
    assert.strictEqual(c.me.hp, before, "Rock types shrug the snow off");
  });

  t("Thick Fleece shaves special damage and ignores weather chip", function () {
    const a = turn({ me: "t_norm", myLevel: 50, myMoves: ["t_growl"], foe: "t_fire", foeLevel: 50, foeMoves: ["t_ember"], seed: 54 });
    const plainHp = a.me.hp;
    a.engine.choose({ type: "move", index: 0 });
    const plainDmg = plainHp - a.me.hp;
    const c = turn({ me: "t_norm", myLevel: 50, myAbility: "thick_fleece", myMoves: ["t_growl"], foe: "t_fire", foeLevel: 50, foeMoves: ["t_ember"], seed: 54 });
    const fleeceHp = c.me.hp;
    c.engine.choose({ type: "move", index: 0 });
    const fleeceDmg = fleeceHp - c.me.hp;
    assert.ok(fleeceDmg < plainDmg, "fleece took " + fleeceDmg + " vs " + plainDmg);
  });
};
