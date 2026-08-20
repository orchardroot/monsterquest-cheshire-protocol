// MonsterQuest v2 — balance workstream: the invariants the numbers in
// js/data/{species,moves,items}.js are held to.
//
// Everything here was measured first with `node tools/sim.js` (headless
// seeded battles through MQ.Battle.autoResolve) and only then written
// down. The bands are deliberately wider than the measured values so a
// bit of drift is allowed — they exist to catch a *change of kind*, not
// to freeze the numbers.
//
//   node tools/sim.js all      # the report these bands come from
"use strict";
const SIM = require("../sim");

module.exports = function (t, assert) {
  const env = SIM.load();
  const D = env.MQ.Data;

  // Expected power: what a move lands on average, accuracy and
  // multi-hit included. The single number a move budget can be
  // written against.
  function expectedPower(m) {
    if (m.cat === "status") return 0;
    let ep = m.power * (m.acc === null ? 100 : m.acc) / 100;
    m.effects.forEach(function (e) { if (e.kind === "multihit") ep *= (e.min + e.max) / 2; });
    return ep;
  }
  const moveIds = Object.keys(D.moves);
  const speciesIds = Object.keys(D.species);

  // =================================================================
  // 1. Move budget
  // =================================================================
  t("no ordinary move is above the expected-power ceiling", function () {
    const over = [];
    moveIds.forEach(function (id) {
      const m = D.moves[id];
      if (m.cat === "status" || m.overdriveOnly) return;
      const ep = expectedPower(m);
      if (ep > 100) over.push(id + " EP " + ep.toFixed(1));
      if (m.power > 120) over.push(id + " power " + m.power);
    });
    assert.deepStrictEqual(over, [], "over budget: " + over.join(", "));
  });

  t("moves with generous PP stay under 80 expected power", function () {
    const over = [];
    moveIds.forEach(function (id) {
      const m = D.moves[id];
      if (m.cat === "status" || m.overdriveOnly) return;
      if (m.pp >= 15 && expectedPower(m) > 80) over.push(id + " pp " + m.pp + " EP " + expectedPower(m).toFixed(1));
    });
    assert.deepStrictEqual(over, [], "cheap and strong: " + over.join(", "));
  });

  t("priority moves are not also heavy hitters", function () {
    const over = [];
    moveIds.forEach(function (id) {
      const m = D.moves[id];
      if (m.cat === "status" || m.overdriveOnly) return;
      if (m.priority > 0 && m.power > 50) over.push(id + " pri " + m.priority + " power " + m.power);
    });
    assert.deepStrictEqual(over, [], "priority outliers: " + over.join(", "));
  });

  t("every damaging move is worth the turn it costs", function () {
    const bad = [];
    moveIds.forEach(function (id) {
      const m = D.moves[id];
      if (m.cat === "status" || m.overdriveOnly) return;
      if (m.power > 0 && m.power < 18) bad.push(id + " power " + m.power);
      if (m.acc !== null && m.acc < 70) bad.push(id + " acc " + m.acc);
      if (m.pp < 5 || m.pp > 40) bad.push(id + " pp " + m.pp);
    });
    assert.deepStrictEqual(bad, [], "unusable: " + bad.join(", "));
  });

  t("Overdrive signatures are the only moves allowed to break the budget", function () {
    const bad = [];
    moveIds.forEach(function (id) {
      const m = D.moves[id];
      if (!m.overdriveOnly) return;
      if (m.acc !== null) bad.push(id + " should never miss");
      if (m.pp !== 0) bad.push(id + " should cost meter, not PP");
      if (m.power > 160) bad.push(id + " power " + m.power);
    });
    assert.deepStrictEqual(bad, [], bad.join(", "));
  });

  t("every move effect is one the battle engine implements", function () {
    // A `weather_boost` on PACKET_STORM and a `priority` effect on
    // ZOOMIES were both silent no-ops; both are gone. These three are
    // SYSTEMS-SPEC §4 vocabulary the engine has not landed a handler for
    // yet — they are recorded here so a NEW hole fails the build.
    const KNOWN_GAPS = { cooldown: "patch_tuesday", restore_pp: "sysadmin_reboot", mimic_type: "understudy_mask" };
    const BE = env.MQ.BattleEffects;
    const bad = [];
    moveIds.forEach(function (id) {
      D.moves[id].effects.forEach(function (e) {
        if (BE.effects[e.kind]) return;
        if (KNOWN_GAPS[e.kind] === id) return;
        bad.push(id + ":" + e.kind);
      });
    });
    assert.deepStrictEqual(bad, [], "dead effects: " + bad.join(", "));
    // and no move may be nothing BUT a dead effect
    Object.keys(KNOWN_GAPS).forEach(function (kind) {
      const m = D.moves[KNOWN_GAPS[kind]];
      const live = m.effects.filter(function (e) { return !!BE.effects[e.kind]; });
      assert.ok(m.power > 0 || live.length, KNOWN_GAPS[kind] + " does nothing at all");
    });
  });

  t("a big self-heal cannot be spammed into a stalemate", function () {
    const bad = [];
    moveIds.forEach(function (id) {
      const m = D.moves[id];
      if (m.overdriveOnly) return;
      let frac = 0;
      m.effects.forEach(function (e) {
        if ((e.kind === "heal" || e.kind === "rest") && (e.who || "self") === "self") frac = Math.max(frac, e.frac || 0);
      });
      if (frac >= 0.5 && m.pp > 8) bad.push(id + " heals " + Math.round(frac * 100) + "% on " + m.pp + " PP");
      if (frac >= 0.75) bad.push(id + " heals " + Math.round(frac * 100) + "%");
    });
    assert.deepStrictEqual(bad, [], bad.join("; "));
  });

  // =================================================================
  // 2. Species stat budget
  // =================================================================
  t("every species' BST sits inside its tier band", function () {
    const bad = [];
    speciesIds.forEach(function (id) {
      const s = D.species[id];
      if (s.dexHidden) return;
      const evolving = !!(s.evolutions && s.evolutions.length);
      const band = (evolving ? SIM.TIER_BAND_EVOLVING : SIM.TIER_BAND)[s.tier];
      if (!band) return;
      if (s.bst < band[0] || s.bst > band[1]) {
        bad.push(id + " " + s.tier + (evolving ? "(evolving)" : "") + " " + s.bst + " vs " + band.join("-"));
      }
    });
    assert.deepStrictEqual(bad, [], bad.join("; "));
  });

  t("an evolution is always a real step up", function () {
    const bad = [];
    speciesIds.forEach(function (id) {
      const s = D.species[id];
      (s.evolutions || []).forEach(function (e) {
        const to = D.species[e.to];
        assert.ok(to, id + " evolves into unknown " + e.to);
        if (to.bst - s.bst < 45) bad.push(id + " → " + e.to + " only +" + (to.bst - s.bst));
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("; "));
  });

  t("the three starter lines are within reach of each other", function () {
    const lines = [["silkin", "spindrake", "loomoth"], ["brinewt", "saltander", "halosaur"], ["kindlin", "stokerel", "furnacore"]];
    for (let stage = 0; stage < 3; stage++) {
      const bsts = lines.map(function (l) { return D.species[l[stage]].bst; });
      // SILKIN's line carries +30 over the other two on purpose: bug/grass
      // is 4x weak to Fire and to Flying, which are the two commonest
      // attacking types in the Chapter 1 tables.
      const spread = Math.max.apply(null, bsts) - Math.min.apply(null, bsts);
      assert.ok(spread <= 35, "starter stage " + (stage + 1) + " BST spread " + spread + " (" + bsts.join("/") + ")");
      if (stage > 0) {
        lines.forEach(function (l) {
          assert.ok(D.species[l[stage]].bst > D.species[l[stage - 1]].bst + 60, l[stage] + " is barely an upgrade");
        });
      }
    }
  });

  // =================================================================
  // 3. Learnsets — D.movesAtLevel() hands the engine the last four
  //    moves learnt, so the shape of a learnset is a balance number.
  // =================================================================
  function loadout(s, lvl) {
    return D.movesAtLevel(s, lvl).map(function (id) { return D.moves[id]; }).filter(Boolean);
  }
  function attacks(mv) { return mv.filter(function (m) { return m.cat !== "status" && m.power > 0; }); }

  t("every species can attack by level 5", function () {
    const bad = [];
    speciesIds.forEach(function (id) {
      if (!attacks(loadout(D.species[id], 5)).length) bad.push(id);
    });
    assert.deepStrictEqual(bad, [], "no attacking move at level 5: " + bad.join(", "));
  });

  t("no species is ever left with nothing to hit with", function () {
    const bad = [];
    speciesIds.forEach(function (id) {
      const s = D.species[id];
      // an evolving species is only expected to hold up a little past
      // the level it evolves at
      let cap = 60;
      (s.evolutions || []).forEach(function (e) { if (e.level) cap = Math.min(cap, e.level + 10); });
      for (let lvl = 5; lvl <= Math.min(55, cap); lvl += 5) {
        if (!attacks(loadout(s, lvl)).length) bad.push(id + "@" + lvl);
      }
    });
    assert.deepStrictEqual(bad, [], "struggling: " + bad.join(", "));
  });

  t("every species keeps a same-type attack from level 15", function () {
    const bad = [];
    speciesIds.forEach(function (id) {
      const s = D.species[id];
      let cap = 60;
      (s.evolutions || []).forEach(function (e) { if (e.level) cap = Math.min(cap, e.level + 10); });
      for (let lvl = 15; lvl <= Math.min(55, cap); lvl += 5) {
        const stab = attacks(loadout(s, lvl)).filter(function (m) { return s.types.indexOf(m.type) >= 0; });
        if (!stab.length) bad.push(id + "@" + lvl);
      }
    });
    assert.deepStrictEqual(bad, [], "no STAB: " + bad.join(", "));
  });

  t("a full loadout is two thirds attacks or better", function () {
    // one attack out of four is a monster that cannot fight; allow it
    // only for the two story cats, whose kits are deliberately support.
    const bad = [];
    speciesIds.forEach(function (id) {
      const s = D.species[id];
      if (s.rarity === "unique") return;
      let cap = 60;
      (s.evolutions || []).forEach(function (e) { if (e.level) cap = Math.min(cap, e.level + 10); });
      for (let lvl = 10; lvl <= Math.min(55, cap); lvl += 5) {
        const mv = loadout(s, lvl);
        if (mv.length >= 4 && attacks(mv).length < 2) bad.push(id + "@" + lvl);
      }
    });
    assert.deepStrictEqual(bad, [], "status-locked: " + bad.join(", "));
  });

  t("a learnset never stalls for more than fifteen levels", function () {
    const bad = [];
    speciesIds.forEach(function (id) {
      const ls = D.species[id].learnset;
      for (let i = 1; i < ls.length; i++) {
        if (ls[i][0] <= 45 && ls[i][0] - ls[i - 1][0] > 15) bad.push(id + " " + ls[i - 1][0] + "→" + ls[i][0]);
      }
    });
    assert.deepStrictEqual(bad, [], "dead stretches: " + bad.join(", "));
  });

  // =================================================================
  // 4. Type-chart pressure. The chart itself belongs to js/data/types.js
  //    (not ours); what we control is the power on each type's moves,
  //    so pressure = expected multiplier over the live dex × top-3
  //    expected power. Normal is exempt: it buys zero weaknesses with
  //    zero super-effectiveness, on purpose.
  // =================================================================
  t("no type is strictly dominant", function () {
    const rows = SIM.typePressure().filter(function (r) { return r.type !== "normal"; });
    rows.sort(function (a, b) { return b.pressure - a.pressure; });
    const top = rows[0], bottom = rows[rows.length - 1];
    assert.ok(top.pressure <= 1.45, top.type + " pressure " + top.pressure.toFixed(3));
    assert.ok(top.pressure / bottom.pressure <= 1.6,
      "pressure ratio " + (top.pressure / bottom.pressure).toFixed(2) + " (" + top.type + " vs " + bottom.type + ")");
    // and nobody is best at both ends of the chart at once
    rows.forEach(function (r) {
      assert.ok(!(r.pressure > 1.3 && r.defWeak <= 1 && r.defRes >= 4),
        r.type + " is dominant on offence and defence at once");
    });
  });

  // =================================================================
  // 5. Simulated battles. Seeded, so these numbers are reproducible.
  // =================================================================
  const STARTERS = ["silkin", "brinewt", "kindlin"];

  t("a level-matched wild fight lasts three to six turns", function () {
    const tables = SIM.eastTables().filter(function (tid) { return !/^fish_/.test(tid); });
    const seen = {}, results = [];
    STARTERS.forEach(function (st) {
      const agg = SIM.Stats();
      tables.forEach(function (tid) {
        SIM.tableMatchups(tid).forEach(function (m) {
          if (seen[st + "|" + m.species]) return;
          seen[st + "|" + m.species] = 1;
          const s = SIM.simulate({
            label: st, n: 6,
            player: [{ species: st, level: m.level }],
            enemy: [{ species: m.species, level: m.level }],
            seed: 7000
          });
          agg.n += s.n;
          agg.wins += Math.round(s.winRate * s.n);
          agg.turns.push(s.avgTurns);
          agg.hits.push(s.avgDmgPerHit);
          agg.oneShots += Math.round(s.oneShotRate * s.n);
          agg.decided += Math.round(s.decidedRate * s.n);
        });
      });
      results.push(SIM.summarise(st, agg));
    });
    results.forEach(function (r) {
      assert.ok(r.avgTurns >= 3 && r.avgTurns <= 6, r.label + " wild fights average " + r.avgTurns.toFixed(1) + " turns");
      assert.ok(r.oneShotRate <= 0.15, r.label + " is one-shot or one-shots in " + (r.oneShotRate * 100).toFixed(0) + "% of level-matched fights");
      assert.ok(r.avgDmgPerHit >= 0.15 && r.avgDmgPerHit <= 0.4,
        r.label + " damage per hit " + (r.avgDmgPerHit * 100).toFixed(0) + "% of the bar");
    });
    // no starter is a materially different difficulty setting
    const wins = results.map(function (r) { return r.winRate; });
    wins.forEach(function (w, i) {
      assert.ok(w >= 0.45 && w <= 0.85, results[i].label + " wins " + (w * 100).toFixed(0) + "% of level-matched wilds");
    });
    assert.ok(Math.max.apply(null, wins) - Math.min.apply(null, wins) <= 0.25,
      "starter win-rate spread " + wins.map(function (w) { return (w * 100).toFixed(0) + "%"; }).join("/"));
  });

  t("the early east trainers are a speed bump, not a wall", function () {
    const early = Object.keys(D.trainers).filter(function (k) {
      return /^tr_(macclesfield|route_macc|bollington|kerridge)/.test(k);
    }).sort();
    assert.ok(early.length >= 5, "found " + early.length + " early east trainers");
    const agg = SIM.Stats();
    early.forEach(function (tid) {
      const lvl = Math.round(SIM.mean(D.trainers[tid].party.map(function (p) { return p.level; })));
      const s = SIM.simulate({
        label: tid, n: 6,
        player: [{ species: "silkin", level: lvl }, { species: "meadow", level: lvl - 1 }, { species: "bigboy", level: lvl - 1 }],
        trainerId: tid, seed: 8000
      });
      agg.n += s.n;
      agg.wins += Math.round(s.winRate * s.n);
      agg.turns.push(s.avgTurns);
    });
    const r = SIM.summarise("early east", agg);
    assert.ok(r.winRate >= 0.8, "a level-matched party of three wins only " + (r.winRate * 100).toFixed(0) + "% of route fights");
    assert.ok(r.avgTurns >= 4 && r.avgTurns <= 16, "route trainer fights average " + r.avgTurns.toFixed(1) + " turns");
  });

  t("Sysadmin Ada takes 8-15 turns and is losable under-levelled", function () {
    const t0 = D.trainers.leader_ada;
    const ace = Math.max.apply(null, t0.party.map(function (p) { return p.level; }));
    const party = function (lvl) {
      return [
        { species: "spindrake", level: lvl }, { species: "gnawlord", level: lvl - 1 },
        { species: "galewing", level: lvl - 1 }, { species: "meadow", level: lvl - 2 }
      ];
    };
    const under = SIM.simulate({ label: "under", n: 40, player: party(ace - 2), trainerId: "leader_ada", seed: 4200 });
    const level = SIM.simulate({ label: "level", n: 40, player: party(ace), trainerId: "leader_ada", seed: 4200 });
    const over = SIM.simulate({ label: "over", n: 20, player: party(ace + 2), trainerId: "leader_ada", seed: 4200 });

    assert.ok(under.winRate >= 0.15 && under.winRate <= 0.7,
      "at ace-2 the player wins " + (under.winRate * 100).toFixed(0) + "% — should be a real fight, not a wall or a walk");
    assert.ok(level.winRate >= 0.7, "at the ace's level the player wins only " + (level.winRate * 100).toFixed(0) + "%");
    assert.ok(over.winRate >= 0.9, "over-levelled the gym should be a formality, got " + (over.winRate * 100).toFixed(0) + "%");
    [under, level].forEach(function (r) {
      assert.ok(r.avgTurns >= 8 && r.avgTurns <= 15, "gym fight ran " + r.avgTurns.toFixed(1) + " turns (" + r.label + ")");
    });
  });

  // =================================================================
  // 6. Items
  // =================================================================
  t("healing does not out-pace damage", function () {
    const rows = SIM.CHAPTER_LEVEL.map(function (lvl, i) {
      const tier = i + 1 <= 2 ? "low" : (i + 1 <= 6 ? "mid" : "high");
      const hps = [];
      speciesIds.forEach(function (k) {
        const sp = D.species[k];
        if (sp.dexHidden || sp.tier !== tier) return;
        hps.push(D.statsAtLevel(sp, lvl, { hp: 8, atk: 8, def: 8, spa: 8, spd: 8, spe: 8 }, "plain").hp);
      });
      hps.sort(function (a, b) { return a - b; });
      const probe = { low: ["nibbit", "flitchick", "sootling", "mistlop"], mid: ["gnawlord", "galewing", "spindrake", "saltander"], high: ["loomoth", "halosaur", "furnacore", "bigboy"] }[tier];
      let frac = 0;
      for (let j = 0; j < probe.length; j++) {
        frac += SIM.simulate({
          label: "", n: 4,
          player: [{ species: probe[j], level: lvl }],
          enemy: [{ species: probe[(j + 1) % probe.length], level: lvl }],
          seed: 5500 + i * 10 + j
        }).avgDmgPerHit;
      }
      const hp = hps[Math.floor(hps.length / 2)] || 1;
      return { ch: i + 1, level: lvl, hp: hp, dmgPerHit: Math.max(1, Math.round(frac / probe.length * hp)) };
    });
    const bad = [];
    SIM.healAudit(rows).forEach(function (h) {
      if (h.hits > 3.2) bad.push(h.id + " undoes " + h.hits.toFixed(1) + " hits at ch" + h.ch);
      if (h.barPct > 1.05) bad.push(h.id + " restores " + Math.round(h.barPct * 100) + "% of a ch" + h.ch + " bar");
    });
    assert.deepStrictEqual(bad, [], bad.join("; "));
  });

  t("no piece of gear either trivialises a battle or does nothing", function () {
    const bad = [];
    Object.keys(D.items).forEach(function (id) {
      const it = D.items[id];
      if (it.kind !== "gear" || !it.gearEffect) return;
      const g = it.gearEffect;
      if (g.mult === undefined) return;
      // out-of-battle gear (XP, friendship) is not on this budget
      if (g.kind === "exp" || g.kind === "friendship") return;
      if (g.kind === "stab") { if (g.mult > 1.25) bad.push(id + " stab ×" + g.mult); return; }
      if (g.mult >= 1.6 && !g.also && !g.lockMove) bad.push(id + " ×" + g.mult + " with no drawback");
      if (g.mult > 1 && g.mult < 1.15) bad.push(id + " ×" + g.mult + " is not worth a gear slot");
      if (g.mult < 1 && g.mult < 0.5) bad.push(id + " ×" + g.mult + " is a cliff, not a trade");
    });
    assert.deepStrictEqual(bad, [], bad.join("; "));
  });

  t("capsules and cures stay on their price ladder", function () {
    const caps = D.itemsOfKind("capsule").filter(function (c) { return c.price > 0; });
    caps.forEach(function (c) {
      assert.ok(c.catchBonus >= 1 && c.catchBonus <= 4, c.name + " catch bonus " + c.catchBonus);
      assert.ok(c.price >= 200 && c.price <= 1500, c.name + " costs " + c.price);
    });
    // the guaranteed capsule must never be purchasable
    assert.strictEqual(D.items.capsule_root.price, 0);
    D.itemsOfKind("heal").forEach(function (h) {
      if (typeof h.amount !== "number") return;
      assert.ok(h.price >= h.amount * 6, h.name + " is too cheap for what it restores (" + h.price + " for " + h.amount + ")");
    });
  });
};
