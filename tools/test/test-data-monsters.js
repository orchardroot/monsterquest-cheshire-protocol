// MonsterQuest v2 — data workstream: stat/XP formulas, monster instances,
// levelling, evolution and capture maths (SYSTEMS-SPEC §1, §11, §12).
"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const D = MQ.Data;

  // ---- level curve ------------------------------------------------
  t("expForLevel follows the three growth groups", function () {
    assert.strictEqual(D.expForLevel("fast", 1), 0);
    assert.strictEqual(D.expForLevel("medium", 1), 0);
    assert.strictEqual(D.expForLevel("medium", 10), 1000);
    assert.strictEqual(D.expForLevel("fast", 10), 800);
    assert.strictEqual(D.expForLevel("slow", 10), 1250);
    assert.strictEqual(D.expForLevel("medium", 100), 1000000);
    for (let L = 2; L <= 100; L++) {
      assert.ok(D.expForLevel("medium", L) > D.expForLevel("medium", L - 1), "monotonic at " + L);
    }
  });

  t("levelForExp inverts expForLevel", function () {
    ["fast", "medium", "slow"].forEach(function (g) {
      for (let L = 1; L <= 100; L += 7) {
        assert.strictEqual(D.levelForExp(g, D.expForLevel(g, L)), L, g + " @ " + L);
        if (L > 1) assert.strictEqual(D.levelForExp(g, D.expForLevel(g, L) - 1), L - 1, g + " just below " + L);
      }
    });
    assert.strictEqual(D.expToNext("medium", 9, 900), 1000 - 900);
  });

  t("expYield scales by battle kind and blunts over-levelling", function () {
    const wild = D.expYield("nibbit", 10, 10, {});
    const trainer = D.expYield("nibbit", 10, 10, { kind: "trainer" });
    const boss = D.expYield("nibbit", 10, 10, { kind: "boss" });
    assert.ok(trainer > wild && boss > trainer, wild + "/" + trainer + "/" + boss);
    const level = D.expYield("nibbit", 10, 10, {});
    const over = D.expYield("nibbit", 10, 40, {});
    assert.ok(over < level, "over-levelling is penalised");
    const share = D.expYield("nibbit", 10, 10, { share: true });
    assert.ok(share < wild, "non-participants get less");
    assert.ok(D.expYield("nibbit", 10, 10, { ledger: true }) > wild, "Ledger gives more");
  });

  // ---- stat formula -----------------------------------------------
  t("statsAtLevel matches the SYSTEMS-SPEC formula exactly", function () {
    const sp = D.species.halosaur;
    const ivs = { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 };
    const L = 50;
    const stats = D.statsAtLevel(sp, L, ivs, "plain");
    const core = function (B) { return Math.floor((2 * B + 15) * L / 100); };
    assert.strictEqual(stats.hp, core(sp.base.hp) + L + 10);
    assert.strictEqual(stats.atk, Math.floor(core(sp.base.atk) + 5));
    assert.strictEqual(stats.spe, Math.floor(core(sp.base.spe) + 5));
    // level 1 with zero traits
    const zero = D.statsAtLevel(sp, 1, { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, "plain");
    assert.strictEqual(zero.hp, Math.floor(2 * sp.base.hp / 100) + 11);
  });

  t("temperaments apply 1.1 / 0.9 and never touch HP", function () {
    assert.strictEqual(D.temperaments.length, 22, "22 temperaments incl. 4 neutral");
    assert.strictEqual(D.temperamentMult("brisk", "spe"), 1.1);
    assert.strictEqual(D.temperamentMult("brisk", "def"), 0.9);
    assert.strictEqual(D.temperamentMult("brisk", "atk"), 1);
    assert.strictEqual(D.temperamentMult("plain", "spe"), 1);
    assert.strictEqual(D.temperamentMult("brisk", "hp"), 1, "HP is never modified");
    const sp = D.species.furnacore;
    const ivs = { hp: 8, atk: 8, def: 8, spa: 8, spd: 8, spe: 8 };
    const neutral = D.statsAtLevel(sp, 50, ivs, "plain");
    const brisk = D.statsAtLevel(sp, 50, ivs, "brisk");
    assert.strictEqual(brisk.hp, neutral.hp);
    assert.ok(brisk.spe > neutral.spe);
    assert.ok(brisk.def < neutral.def);
    let neutrals = 0;
    D.temperaments.forEach(function (x) { if (!x.up && !x.down) neutrals++; });
    assert.strictEqual(neutrals, 4);
  });

  // ---- monster instances ------------------------------------------
  t("makeMonster produces a complete instance", function () {
    const m = D.makeMonster("spindrake", 20, { seed: "test-1" });
    assert.strictEqual(m.species, "spindrake");
    assert.strictEqual(m.level, 20);
    assert.strictEqual(m.hp, m.stats.hp);
    assert.strictEqual(m.status, null);
    assert.strictEqual(m.overdrive, 0);
    assert.strictEqual(m.friendship, 70);
    assert.ok(m.uid, "has a uid");
    assert.ok(m.moves.length >= 1 && m.moves.length <= 4);
    m.moves.forEach(function (mv) {
      assert.ok(D.moves[mv.id], "unknown move " + mv.id);
      assert.strictEqual(mv.pp, mv.ppMax);
      assert.strictEqual(mv.pp, D.moves[mv.id].pp);
    });
    D.statKeys.forEach(function (k) {
      assert.ok(m.ivs[k] >= 0 && m.ivs[k] <= 15, "trait " + k + " in range");
    });
    assert.ok(D.temperament(m.temperament).name, "valid temperament");
    assert.ok(D.species.spindrake.abilities.indexOf(m.ability) >= 0);
    assert.strictEqual(m.exp, D.expForLevel(D.species.spindrake.growth, 20));
  });

  t("makeMonster is deterministic for a given seed", function () {
    const a = D.makeMonster("nibbit", 7, { seed: "same" });
    const b = D.makeMonster("nibbit", 7, { seed: "same" });
    assert.deepStrictEqual(JSON.stringify(a.ivs), JSON.stringify(b.ivs));
    assert.strictEqual(a.temperament, b.temperament);
    assert.notStrictEqual(a.uid, b.uid, "uids are still unique");
  });

  t("trait floors: gifts roll 8+, legendaries roll 10+", function () {
    for (let i = 0; i < 40; i++) {
      const gift = D.makeMonster("silkin", 5, { gift: true, seed: "gift" + i });
      D.statKeys.forEach(function (k) { assert.ok(gift.ivs[k] >= 8, "gift trait floor"); });
      assert.strictEqual(gift.friendship, 120, "gifts start friendlier");
      const leg = D.makeMonster("zephyrion", 50, { seed: "leg" + i });
      D.statKeys.forEach(function (k) { assert.ok(leg.ivs[k] >= 10, "legendary trait floor"); });
    }
  });

  t("opts override traits, temperament, ability, moves and gear", function () {
    const m = D.makeMonster("furnacore", 40, {
      ivs: 15, temperament: "blunt", ability: "firebox", gear: "ember_coal",
      moves: ["ember", "boiler_burst"], shiny: true, nickname: "Bertha"
    });
    assert.strictEqual(m.ivs.atk, 15);
    assert.strictEqual(m.temperament, "blunt");
    assert.strictEqual(m.gear, "ember_coal");
    assert.strictEqual(m.shiny, true);
    assert.strictEqual(D.monName(m), "Bertha");
    assert.strictEqual(m.moves.length, 2);
    assert.strictEqual(m.moves[0].id, "ember");
  });

  t("traitWords describes standout traits without numbers", function () {
    const good = D.makeMonster("meadow", 10, { ivs: 15, temperament: "plain" });
    const words = D.traitWords(good);
    assert.ok(words.length >= 1);
    words.forEach(function (w) { assert.ok(!/\d/.test(w), "no numbers in '" + w + "'"); });
  });

  // ---- moves by level ---------------------------------------------
  t("movesAtLevel returns the four most recent learnset moves", function () {
    D.each("species", function (s, id) {
      const at1 = D.movesAtLevel(id, 1);
      assert.ok(at1.length >= 1, id + " knows nothing at level 1");
      const at100 = D.movesAtLevel(id, 100);
      assert.ok(at100.length <= 4, id + " returns more than four moves");
      at100.forEach(function (mv) { assert.ok(D.moves[mv], id + ": bad move " + mv); });
    });
    const sil = D.species.silkin;
    const early = D.movesAtLevel("silkin", sil.learnset[0][0]);
    assert.strictEqual(early[0], sil.learnset[0][1]);
  });

  t("learnableAt and canLearn agree with the learnset and Skill Cards", function () {
    const sp = D.species.furnacore;
    const lv = sp.learnset[5][0];
    const learned = D.learnableAt("furnacore", lv);
    assert.ok(learned.indexOf(sp.learnset[5][1]) >= 0);
    assert.ok(D.canLearn("furnacore", sp.learnset[0][1]));
    assert.ok(sp.tms.length >= 5, "at least five Skill Cards");
    assert.ok(D.canLearn("furnacore", sp.tms[0]));
    assert.ok(!D.canLearn("furnacore", "not_a_move"));
  });

  t("levelUp raises stats, exp and friendship and reports new moves", function () {
    const m = D.makeMonster("brinewt", 9, { ivs: 10, temperament: "plain" });
    const hpBefore = m.stats.hp;
    const res = D.levelUp(m);
    assert.strictEqual(m.level, 10);
    assert.ok(m.stats.hp > hpBefore);
    assert.strictEqual(m.friendship, 71);
    assert.ok(typeof res.learned.length === "number", "learned is a list");
    assert.ok(m.exp >= D.expForLevel(D.species.brinewt.growth, 10));
  });

  // ---- evolution --------------------------------------------------
  t("canEvolve handles every evolution method", function () {
    // level
    const s1 = D.makeMonster("silkin", 15);
    assert.strictEqual(D.canEvolve(s1, {}), null);
    s1.level = 16;
    assert.strictEqual(D.canEvolve(s1, {}).to, "spindrake");
    // item
    const b = D.makeMonster("bramblehog", 30);
    assert.strictEqual(D.canEvolve(b, {}), null);
    assert.strictEqual(D.canEvolve(b, { item: "billhook_charm" }).to, "thornarch");
    // friendship + time
    const g = D.makeMonster("grinkit", 30, { friendship: 199 });
    assert.strictEqual(D.canEvolve(g, { time: "night" }), null, "needs 200 friendship");
    g.friendship = 210;
    assert.strictEqual(D.canEvolve(g, { time: "day" }), null, "night only");
    assert.strictEqual(D.canEvolve(g, { time: "night" }).to, "grinmalkin");
    // location
    const c = D.makeMonster("crabbex", 30);
    assert.strictEqual(D.canEvolve(c, { map: "nantwich" }), null);
    assert.strictEqual(D.canEvolve(c, { map: "anderton" }).to, "krabbaron");
    const d = D.makeMonster("dishlet", 30);
    assert.strictEqual(D.canEvolve(d, { map: "jodrell_bank" }).to, "parabolus");
    const p = D.makeMonster("perrypip", 30);
    assert.strictEqual(D.canEvolve(p, { map: "y_berllan" }).to, "perryarch");
    const gl = D.makeMonster("gloamite", 30);
    assert.strictEqual(D.canEvolve(gl, { map: "alderley_edge_caverns_b3" }).to, "gloamguard");
  });

  t("evolve preserves traits, temperament, friendship and gear", function () {
    const m = D.makeMonster("saltander", 34, { ivs: 12, temperament: "gruff", gear: "brine_charm", friendship: 180 });
    m.hp = Math.floor(m.stats.hp / 2);
    const ivsBefore = JSON.stringify(m.ivs);
    const res = D.evolve(m, "halosaur");
    assert.strictEqual(res.to, "halosaur");
    assert.strictEqual(m.species, "halosaur");
    assert.strictEqual(JSON.stringify(m.ivs), ivsBefore);
    assert.strictEqual(m.temperament, "gruff");
    assert.strictEqual(m.gear, "brine_charm");
    assert.strictEqual(m.friendship, 180);
    assert.ok(m.hp > 0 && m.hp <= m.stats.hp, "HP scaled into the new frame");
    assert.strictEqual(D.overdriveMoveFor(m), "brine_tide", "signature follows the line");
    assert.ok(D.species.halosaur.abilities.indexOf(m.ability) >= 0);
  });

  t("evolution graph is acyclic and every target exists", function () {
    D.each("species", function (s, id) {
      s.evolutions.forEach(function (e) {
        assert.ok(D.species[e.to], id + " -> unknown " + e.to);
        assert.notStrictEqual(e.to, id, id + " evolves into itself");
        const target = D.species[e.to];
        (target.evolutions || []).forEach(function (e2) {
          assert.notStrictEqual(e2.to, id, "cycle between " + id + " and " + e.to);
        });
      });
    });
    const chain = D.evolutionChain("spindrake");
    assert.strictEqual(chain.join(">"), "silkin>spindrake>loomoth");
    assert.strictEqual(D.preEvolutionOf("loomoth"), "spindrake");
    assert.strictEqual(D.preEvolutionOf("silkin"), null);
  });

  t("evolved forms are stronger than what they came from", function () {
    D.each("species", function (s, id) {
      s.evolutions.forEach(function (e) {
        const to = D.species[e.to];
        assert.ok(to.bst > s.bst, id + " (" + s.bst + ") -> " + e.to + " (" + to.bst + ")");
      });
    });
  });

  // ---- capture ----------------------------------------------------
  t("catchChance rises as HP falls and with status", function () {
    const m = D.makeMonster("gloamguard", 40, { ivs: 0, temperament: "plain" });
    const full = D.catchChance(m, {});
    m.hp = 1;
    const hurt = D.catchChance(m, {});
    assert.ok(hurt > full, "weakened is easier: " + full + " -> " + hurt);
    m.status = "slp";
    const asleep = D.catchChance(m, {});
    assert.ok(asleep > hurt, "sleep helps most");
    m.status = "par";
    const para = D.catchChance(m, {});
    assert.ok(para > hurt && para < asleep, "paralysis helps, but less than sleep");
    m.status = null;
    assert.ok(D.catchChance(m, { capsuleBonus: 2 }) > hurt, "better capsules help");
    assert.ok(D.catchChance(m, { capsuleBonus: 255 }) <= 255, "chance is capped");
    const leg = D.makeMonster("terrataur", 60);
    assert.ok(D.catchChance(leg, {}) < D.catchChance(D.makeMonster("nibbit", 60), {}), "legendaries resist");
  });

  // ---- generator params & dex -------------------------------------
  t("art generator params and dex entries are usable", function () {
    D.each("species", function (s, id) {
      assert.ok(s.gen.body, id + ": no body");
      assert.ok(s.gen.feats.length >= 1, id + ": no features");
      assert.strictEqual(s.gen.palette.length, 4, id + ": palette must be 4 colours");
      assert.ok(s.gen.size > 0.2 && s.gen.size < 2, id + ": size " + s.gen.size);
      assert.ok(s.dex.text.length >= 40, id + ": dex text too short");
      assert.ok(s.dex.genus.length > 2, id + ": no genus");
      assert.ok(s.dex.height > 0, id + ": no height");
      assert.ok(s.cry.base > 0 && s.cry.len > 0, id + ": bad cry");
    });
    assert.strictEqual(D.species.silkin.gen.paletteId, "silk");
  });

  t("habitat and type lookups return sensible sets", function () {
    assert.ok(D.speciesOfType("cyber").length >= 20, "Cyber is ~15% of the dex");
    assert.ok(D.speciesByHabitat("salt").length >= 5);
    assert.ok(D.speciesOfType("bug").length >= 10);
    D.each("species", function (s, id) {
      assert.ok(s.bst >= 200, id + " bst " + s.bst);
      assert.ok(s.catchRate >= 1 && s.catchRate <= 255, id + " catchRate");
    });
  });
};
