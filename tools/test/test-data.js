// MonsterQuest v2 — data workstream: registries, formulas, validators.
"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const D = MQ.Data;

  // ---- registries -------------------------------------------------
  t("all data registries are populated", function () {
    assert.strictEqual(D.count("types"), 13, "13 types");
    assert.ok(D.count("moves") >= 165, "moves: " + D.count("moves"));
    assert.strictEqual(D.count("abilities"), 30, "30 abilities");
    assert.ok(D.count("items") >= 140, "items: " + D.count("items"));
    assert.strictEqual(D.dexCount, 171, "171 dex entries");
    assert.ok(D.count("species") > D.dexCount, "boss forms are registered but dex-hidden");
    assert.ok(D.chatterLineCount() >= 300, "dialogue lines: " + D.chatterLineCount());
  });

  t("MQ.Data.validate reports no problems from data files", function () {
    const errors = D.validate().filter(function (e) { return e.indexOf("map ") !== 0; });
    assert.strictEqual(errors.length, 0, errors.join("\n"));
  });

  t("defining the same id twice in a kind is recorded as a collision and fails validate()", function () {
    const before = D.collisions.length;
    D.define("trainers", "test_dup_trainer", { name: "First" });
    D.define("trainers", "test_dup_trainer", { name: "Second" });
    assert.strictEqual(D.collisions.length, before + 1);
    assert.strictEqual(D.collisions[D.collisions.length - 1], "trainers/test_dup_trainer");
    const errors = D.validate();
    assert.ok(errors.some(function (e) { return e.indexOf("test_dup_trainer") >= 0; }), "validate() reports the duplicate");
    // an explicit __override does not count as a collision (used by fixtures/overrides)
    const beforeOverride = D.collisions.length;
    D.define("trainers", "test_dup_trainer", { name: "Third", __override: true });
    assert.strictEqual(D.collisions.length, beforeOverride, "__override is not a collision");
  });

  t("dex numbering is complete and contiguous", function () {
    const seen = {};
    D.each("species", function (s) { if (!s.dexHidden) seen[s.num] = s.id; });
    for (let n = 1; n <= 171; n++) assert.ok(seen[n], "missing dex number " + n);
    assert.strictEqual(D.dexOrder.length, 171);
    assert.strictEqual(D.dexOrder[0], "silkin");
    assert.strictEqual(D.speciesByNum(11).id, "nibbit");
  });

  // ---- types ------------------------------------------------------
  t("type chart maths", function () {
    assert.strictEqual(D.typeMultiplier("fire", ["grass"]), 2);
    assert.strictEqual(D.typeMultiplier("fire", ["grass", "bug"]), 4);
    assert.strictEqual(D.typeMultiplier("normal", ["ghost"]), 0);
    assert.strictEqual(D.typeMultiplier("electric", ["ground"]), 0);
    assert.strictEqual(D.typeMultiplier("water", ["cyber"]), 2);
    assert.strictEqual(D.typeMultiplier("cyber", ["psychic"]), 2);
    assert.strictEqual(D.typeMultiplier("grass", ["fire", "flying"]), 0.25);
    assert.strictEqual(D.typeMultiplier("normal", ["normal"]), 1);
    assert.strictEqual(D.effectivenessLabel(2), "strong");
    assert.strictEqual(D.effectivenessLabel(0), "immune");
    const m = D.typeMatchups(["bug", "grass"]);
    assert.ok(m.x4.indexOf("fire") >= 0, "bug/grass takes x4 from fire");
  });

  // ---- moves ------------------------------------------------------
  t("move table shape and never-miss convention", function () {
    const tackle = D.moves.tackle;
    assert.strictEqual(tackle.cat, "phys");
    assert.strictEqual(tackle.flags.contact, true);
    assert.strictEqual(D.moveAcc(tackle), 100);
    assert.strictEqual(D.moves.rune_read.acc, null, "never-miss stores acc null");
    assert.strictEqual(D.moveAcc("rune_read"), 999, "…and reports 999");
    assert.strictEqual(D.moves.quick_dash.priority, 1);
    assert.strictEqual(D.moves.white_nancy_stand.priority, 4);
    assert.strictEqual(D.moves.salt_grind.crit, 1, "high_crit sets the crit stage");
    assert.strictEqual(D.moves.growl.target, "foe");
    assert.strictEqual(D.moves.harden.target, "self");
    assert.strictEqual(D.moves.mere_mist.target, "field");
  });

  t("effect objects carry both frac and pct, who and target", function () {
    const heal = D.moveEffect("regrow", "heal");
    assert.strictEqual(heal.frac, 0.5);
    assert.strictEqual(heal.pct, 50);
    assert.strictEqual(heal.who, "self");
    assert.strictEqual(heal.target, "self");
    const stage = D.moveEffect("growl", "stage");
    assert.strictEqual(stage.stat, "atk");
    assert.strictEqual(stage.delta, -1);
    assert.strictEqual(stage.who, "foe");
    assert.strictEqual(stage.target, "foe");
    const mh = D.moveEffect("brute_force", "multihit");
    assert.strictEqual(mh.min, 2);
    assert.strictEqual(mh.max, 5);
  });

  t("overdrive signatures exist for every species and never appear in learnsets", function () {
    const od = D.overdriveMoves();
    assert.ok(od.length >= 25, "25 signatures, found " + od.length);
    od.forEach(function (m) {
      assert.strictEqual(m.pp, 0, m.id + " must have no PP");
      assert.strictEqual(m.acc, null, m.id + " must never miss");
      assert.strictEqual(m.flags.protect_ok, false, m.id + " must ignore protect");
    });
    D.each("species", function (s, id) {
      const sig = D.moves[s.overdrive];
      assert.ok(sig && sig.overdriveOnly, id + " has a bad signature");
      s.learnset.forEach(function (e) {
        assert.ok(!D.moves[e[1]].overdriveOnly, id + " learnset contains " + e[1]);
      });
    });
    assert.strictEqual(D.species.meadow.overdrive, "zoomies");
    assert.strictEqual(D.species.loomoth.overdrive, "jacquard_weave");
  });

  t("every gym Skill Card teaches a real move", function () {
    const gym = ["tm_live_rail", "tm_cranford_whisper", "tm_bear_hug", "tm_firebox_roar",
      "tm_brine_jet", "tm_salt_grind", "tm_proxy_cloud", "tm_zero_day"];
    gym.forEach(function (id) {
      const it = D.items[id];
      assert.ok(it, "missing " + id);
      assert.strictEqual(it.kind, "tm");
      assert.ok(D.moves[it.teaches], id + " teaches unknown move");
      assert.strictEqual(it.price, 0, "gym cards are not sold");
      assert.ok(it.leader, id + " should name its leader");
    });
  });

  // ---- abilities --------------------------------------------------
  t("abilities declare impl keys equal to their ids", function () {
    D.each("abilities", function (a, id) {
      assert.strictEqual(a.impl, id);
      assert.ok(a.hooks.length > 0, id + " has no hooks");
      assert.ok(a.desc.length > 10, id + " has no description");
    });
    assert.strictEqual(D.abilities.slipstream.params.stat, "spe");
    assert.strictEqual(D.abilities.back_from_the_brink.params.minHpFrac, 0.5);
    assert.strictEqual(D.abilitiesWithHook("onSwitchIn").length > 3, true);
  });

  t("every species ability exists and ROSTER assignments hold", function () {
    D.each("species", function (s, id) {
      s.abilities.forEach(function (a) { assert.ok(D.abilities[a], id + ": unknown ability " + a); });
    });
    assert.strictEqual(D.species.meadow.abilities[0], "slipstream");
    assert.strictEqual(D.species.silkin.abilities[0], "silk_weave");
    assert.strictEqual(D.species.brinewt.abilities[0], "brine_body");
    assert.strictEqual(D.species.kindlin.abilities[0], "firebox");
    assert.strictEqual(D.species.grinmalkin.abilities[0], "cheshire_grin");
    assert.strictEqual(D.species.zephyrion.abilities[0], "ridge_wind");
    assert.strictEqual(D.species.gloamguard.hiddenAbility, "back_from_the_brink");
  });

  // ---- items ------------------------------------------------------
  t("items: kinds, cures and Skill Cards resolve", function () {
    assert.strictEqual(D.items.salve.amount, 20);
    assert.strictEqual(D.items.full_restore.amount, "full");
    assert.ok(D.itemCures("antidote", "tox"));
    assert.ok(!D.itemCures("antidote", "brn"));
    assert.strictEqual(D.items.capsule_kernel.catchBonus, 2);
    assert.strictEqual(D.items.capsule_root.guaranteed, true);
    assert.strictEqual(D.items.silk_scarf.gearEffect.mult, 1.1);
    assert.strictEqual(D.tmForMove("zero_day").id, "tm_zero_day");
    assert.strictEqual(D.items.middlewood_bike.unlocks, "bike");
    assert.strictEqual(D.itemSellPrice("tonic"), 300);
    assert.strictEqual(D.itemSellPrice("capsule_root"), 0);
    assert.strictEqual(D.itemsOfKind("rod").length, 4);
    assert.strictEqual(D.itemsOfKind("brew").length, 9);
    assert.ok(D.trinkets().length >= 7, "trinkets: " + D.trinkets().length);
  });

  t("every leader anchor exists", function () {
    ["packet", "cipher", "bear", "kernel", "token", "daemon", "proxy", "admin"].forEach(function (b) {
      const it = D.items["anchor_" + b];
      assert.ok(it, "missing anchor_" + b);
      assert.strictEqual(it.gearEffect.mult, 1.2);
    });
  });

  // ---- dialogue ---------------------------------------------------
  t("chatter filters by phase and weather", function () {
    const night = D.chatterLines({ archetype: "kid", phase: "night", weather: "clear" });
    const day = D.chatterLines({ archetype: "kid", phase: "day", weather: "clear" });
    const nightTexts = night.map(function (l) { return l.text; });
    const dayTexts = day.map(function (l) { return l.text; });
    assert.ok(nightTexts.some(function (x) { return x.indexOf("mill lights") >= 0; }), "night line present at night");
    assert.ok(!dayTexts.some(function (x) { return x.indexOf("mill lights") >= 0; }), "night line absent by day");
    const foggy = D.chatterLines({ archetype: "stuffer", weather: "fog", phase: "day" });
    assert.ok(foggy.some(function (l) { return l.text.indexOf("Fog's good for business") >= 0; }));
  });

  t("chatter is deterministic per seed and always returns a string", function () {
    const a = D.chatter({ town: "chester", archetype: "publican", seed: "abc", phase: "day", weather: "clear" });
    const b = D.chatter({ town: "chester", archetype: "publican", seed: "abc", phase: "day", weather: "clear" });
    assert.strictEqual(a, b);
    assert.strictEqual(typeof a, "string");
    assert.ok(a.length > 5);
    assert.ok(D.archetypes().length >= 10, "at least ten archetypes");
    assert.ok(D.chatterTowns().length >= 30, "at least thirty towns");
    ["kid", "granny", "walker", "sysadmin", "cultist", "stuffer", "farmer", "fisher", "station", "publican"].forEach(function (k) {
      assert.ok(D.dialogue["arch_" + k], "missing archetype pool " + k);
    });
  });

  t("chapter-gated lines stay hidden early", function () {
    const early = D.chatterLines({ archetype: "sysadmin", chapter: 1, phase: "day", weather: "clear" });
    const late = D.chatterLines({ archetype: "sysadmin", chapter: 10, phase: "day", weather: "clear" });
    assert.ok(late.length > early.length, "late chapters unlock more chatter");
  });
};
