// Shared fixtures for the battle tests. Exported as a no-op test
// registrar so tools/test/run.js can require it harmlessly, with the
// helpers hung off the function.
"use strict";
const H = require("../headless");

function noTests() { }

noTests.load = function () {
  const env = H.load();
  const MQ = env.MQ;
  const D = MQ.Data;

  // --- species -------------------------------------------------
  D.define("species", "t_fire", { name: "Firetest", types: ["fire"], base: { hp: 60, atk: 70, def: 50, spa: 80, spd: 55, spe: 65 }, catchRate: 120, baseExp: 64, growth: "medium", abilities: ["firebox"], learnset: [[1, "t_tackle"], [5, "t_ember"]], evolutions: [{ to: "t_fire2", method: "level", level: 16 }] });
  D.define("species", "t_fire2", { name: "Firetest II", types: ["fire"], base: { hp: 80, atk: 90, def: 70, spa: 100, spd: 75, spe: 85 }, catchRate: 60, baseExp: 120, growth: "medium", abilities: ["firebox"], learnset: [], evolutions: [] });
  D.define("species", "t_grass", { name: "Grasstest", types: ["grass"], base: { hp: 65, atk: 60, def: 60, spa: 50, spd: 60, spe: 50 }, catchRate: 150, baseExp: 60, growth: "medium", abilities: ["deep_roots"], learnset: [[1, "t_vine"]], evolutions: [] });
  D.define("species", "t_water", { name: "Watertest", types: ["water"], base: { hp: 70, atk: 55, def: 65, spa: 70, spd: 70, spe: 55 }, catchRate: 130, baseExp: 62, growth: "medium", abilities: ["brine_body"], learnset: [[1, "t_tackle"]], evolutions: [] });
  D.define("species", "t_norm", { name: "Normtest", types: ["normal"], base: { hp: 75, atk: 65, def: 60, spa: 55, spd: 60, spe: 60 }, catchRate: 200, baseExp: 58, growth: "medium", abilities: [], learnset: [[1, "t_tackle"]], evolutions: [] });
  D.define("species", "t_iron", { name: "Irontest", types: ["rock"], base: { hp: 80, atk: 80, def: 90, spa: 40, spd: 60, spe: 30 }, catchRate: 90, baseExp: 70, growth: "slow", abilities: ["iron_will"], learnset: [[1, "t_tackle"]], evolutions: [] });
  D.define("species", "t_cat", { name: "Meadow", types: ["normal"], base: { hp: 55, atk: 60, def: 45, spa: 45, spd: 50, spe: 110 }, catchRate: 0, baseExp: 70, growth: "medium", abilities: ["slipstream"], learnset: [[1, "t_tackle"]], evolutions: [], overdrive: "zoomies" });

  // --- moves ---------------------------------------------------
  const mv = function (id, o) { D.define("moves", id, Object.assign({ name: id, type: "normal", cat: "phys", power: 0, acc: 100, pp: 20, priority: 0, crit: 0, flags: {}, effects: [] }, o)); };
  mv("t_tackle", { name: "Test Tackle", type: "normal", cat: "phys", power: 40, pp: 35, flags: { contact: true } });
  mv("t_ember", { name: "Test Ember", type: "fire", cat: "spec", power: 60, pp: 25, effects: [{ kind: "status", status: "brn", chance: 10 }] });
  mv("t_vine", { name: "Test Vine", type: "grass", cat: "phys", power: 45, pp: 25, flags: { contact: true } });
  mv("t_water_gun", { name: "Test Jet", type: "water", cat: "spec", power: 60, pp: 25 });
  mv("t_toxic", { name: "Test Toxic", type: "poison", cat: "status", power: 0, acc: 90, pp: 10, effects: [{ kind: "status", status: "tox" }] });
  mv("t_sleep", { name: "Test Lullaby", type: "normal", cat: "status", power: 0, acc: 100, pp: 10, effects: [{ kind: "status", status: "slp" }] });
  mv("t_growl", { name: "Test Growl", type: "normal", cat: "status", power: 0, acc: 100, pp: 40, effects: [{ kind: "stage", who: "foe", stat: "atk", delta: -1 }] });
  mv("t_sharpen", { name: "Test Sharpen", type: "normal", cat: "status", power: 0, acc: null, pp: 30, effects: [{ kind: "stage", who: "self", stat: "atk", delta: 1 }] });
  mv("t_multi", { name: "Test Flurry", type: "bug", cat: "phys", power: 25, pp: 15, flags: { contact: true }, effects: [{ kind: "multihit", min: 2, max: 5 }] });
  mv("t_protect", { name: "Test Cover", type: "normal", cat: "status", power: 0, acc: null, pp: 10, priority: 4, effects: [{ kind: "protect" }] });
  mv("t_ohko", { name: "Test Guillotine", type: "normal", cat: "status", power: 0, acc: null, pp: 5, effects: [{ kind: "ohko" }] });
  mv("t_drain", { name: "Test Drain", type: "grass", cat: "phys", power: 50, pp: 15, flags: { contact: true }, effects: [{ kind: "drain", frac: 0.5 }] });
  mv("t_recoil", { name: "Test Charge", type: "normal", cat: "phys", power: 90, pp: 15, flags: { contact: true }, effects: [{ kind: "recoil", frac: 0.25 }] });
  mv("t_level", { name: "Test Seismic", type: "normal", cat: "status", power: 0, acc: 100, pp: 10, effects: [{ kind: "fixed", amount: "level" }] });
  mv("t_rainmaker", { name: "Test Downpour", type: "water", cat: "status", power: 0, acc: null, pp: 5, effects: [{ kind: "weather", w: "rain", turns: 5 }] });
  mv("t_saltmaker", { name: "Test Saltfall", type: "rock", cat: "status", power: 0, acc: null, pp: 5, effects: [{ kind: "terrain", tr: "salt", turns: 5 }] });
  mv("t_charge", { name: "Test Windup", type: "cyber", cat: "spec", power: 110, acc: 100, pp: 5, effects: [{ kind: "charge", turns: 1 }] });
  mv("t_screen", { name: "Test Screen", type: "cyber", cat: "status", power: 0, acc: null, pp: 15, effects: [{ kind: "screen", screen: "spec", turns: 5 }, { kind: "overdrive", gain: 10 }] });
  mv("t_trap", { name: "Test Snare", type: "cyber", cat: "status", power: 0, acc: 100, pp: 10, effects: [{ kind: "trap", turns: 4 }] });
  mv("t_flinch", { name: "Test Bonk", type: "normal", cat: "phys", power: 30, pp: 20, priority: 1, flags: { contact: true }, effects: [{ kind: "flinch", chance: 100 }] });

  // --- items ---------------------------------------------------
  const it = function (id, o) { D.define("items", id, Object.assign({ name: id, price: 0, kind: "heal", usableInBattle: true }, o)); };
  it("salve", { name: "Salve", kind: "heal", amount: 20 });
  it("tonic", { name: "Tonic", kind: "heal", amount: 60 });
  it("panacea", { name: "Panacea", kind: "cure", cures: ["all"] });
  it("capsule_basic", { name: "Capsule", kind: "capsule", catchBonus: 1 });
  it("capsule_kernel", { name: "Kernel Capsule", kind: "capsule", catchBonus: 2 });
  it("silk_scarf", { name: "Silk Scarf", kind: "gear" });
  it("lucky_coin", { name: "Lucky Coin", kind: "gear" });
  it("heavy_anvil", { name: "Heavy Anvil", kind: "gear" });
  it("rain_jar", { name: "Rain Jar", kind: "consumable" });

  // --- abilities (declaration only; impl lives in effects.js) ---
  const ab = function (id, name) { D.define("abilities", id, { name: name, desc: "", impl: id }); };
  Object.keys(MQ.BattleEffects.abilities).forEach(function (id) { ab(id, MQ.BattleEffects.abilities[id].name || id); });

  return env;
};

// Even IVs and a neutral temperament so every number is reproducible.
noTests.mon = function (MQ, species, level, moves, extra) {
  const o = Object.assign({
    ivs: { hp: 8, atk: 8, def: 8, spa: 8, spd: 8, spe: 8 },
    temperament: "plain", moves: moves
  }, extra || {});
  return MQ.Battle.makeMonster(species, level, o);
};

// Build a battle state without running the flow, for unit maths.
noTests.bench = function (MQ, opts) {
  const b = MQ.Battle._createState(Object.assign({ kind: "wild", seed: 1 }, opts || {}));
  MQ.Battle._attachApi(b);
  b.typeMult = function (a, d) { return MQ.Data.typeMultiplier(a, d); };
  b.sides[0].activeUids = [];
  b.sides[1].activeUids = [];
  return b;
};

module.exports = noTests;
