// =============================================================
// MonsterQuest v2 — tools/sim.js  (balance workstream)
//
// Headless battle simulator. Loads the game with tools/headless.js and
// runs N seeded battles through MQ.Battle.autoResolve (or the identical
// create+autoRun pair when we need the engine's event log), then reports:
//
//   win rate · average turns · average damage per hit (as % of the
//   target's max HP) · how often a battle is decided by a single move.
//
// Usage
//   node tools/sim.js wild <tableId> [--party=spec] [--n=200] [--seed=1]
//   node tools/sim.js trainer <trainerId> --party=spec [--n=200]
//   node tools/sim.js duel --a=spec --b=spec [--n=200]
//   node tools/sim.js starters [--n=120]       starter lines vs east tables
//   node tools/sim.js gym [--id=leader_ada] [--from=12] [--to=18]
//   node tools/sim.js types                    type-chart pressure
//   node tools/sim.js moves                    power/acc/PP budget outliers
//   node tools/sim.js species                  BST tier bands + learnsets
//   node tools/sim.js items                    heal pacing vs measured dmg
//   node tools/sim.js all
//
// Party spec: "silkin:12,nibbit:10"  (level optional, defaults --level).
// Everything is seeded: same flags in, same numbers out.
// =============================================================
"use strict";
const H = require("./headless");

// -------------------------------------------------------------
// environment (one load, reused by every command)
// -------------------------------------------------------------
let ENV = null;
function env() {
  if (!ENV) ENV = H.load();
  return ENV;
}
function D() { return env().MQ.Data; }

// -------------------------------------------------------------
// party building
// -------------------------------------------------------------
function parseParty(spec, defLevel) {
  const out = [];
  String(spec || "").split(",").forEach(function (part) {
    part = part.trim();
    if (!part) return;
    const bits = part.split(":");
    out.push({ species: bits[0], level: Number(bits[1]) || defLevel || 5 });
  });
  return out;
}

// Deterministic monster: same (seed, slot) always yields the same roll.
function buildParty(list, seed, opts) {
  opts = opts || {};
  const MQ = env().MQ;
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    const mon = MQ.Data.makeMonster(e.species, e.level, {
      rnd: MQ.U.rng(seed + "|" + i + "|" + e.species),
      ivFloor: opts.ivFloor === undefined ? 6 : opts.ivFloor,
      temperament: opts.temperament || "plain",
      moves: e.moves || null,
      gear: e.gear || opts.gear || null,
      shiny: false
    });
    if (mon) out.push(mon);
  }
  return out;
}

// -------------------------------------------------------------
// one battle → { result, log }
// autoResolve(opts) is exactly create()+autoRun(); we spell it out only
// when the caller wants the event log for per-hit statistics.
// -------------------------------------------------------------
function runBattle(opts, wantLog) {
  const MQ = env().MQ;
  if (!wantLog) return { result: MQ.Battle.autoResolve(opts), log: null };
  const o = {};
  Object.keys(opts).forEach(function (k) { o[k] = opts[k]; });
  o.auto = true;
  const engine = MQ.Battle.create(o);
  const result = MQ.Battle.autoRun(engine);
  return { result: result, log: engine.b.log };
}

// -------------------------------------------------------------
// aggregate metrics over N battles
// -------------------------------------------------------------
function Stats() {
  return {
    n: 0, wins: 0, losses: 0, other: 0,
    turns: [], hits: [], oneShots: 0, decided: 0, misses: 0, swings: 0,
    playerHpLeft: []
  };
}

function measure(st, run, playerPool) {
  st.n++;
  const r = run.result;
  if (r.won) st.wins++; else if (r.lost) st.losses++; else st.other++;
  st.turns.push(r.turns);
  if (!run.log) return;
  let oneShot = false, decided = false;
  for (let i = 0; i < run.log.length; i++) {
    const ev = run.log[i];
    if (ev.type !== "hp" || ev.cause !== "move") continue;
    const dmg = -ev.delta;
    if (dmg <= 0) continue;
    const frac = dmg / Math.max(1, ev.max);
    st.hits.push(frac);
    // one-shot: a full bar removed by a single hit
    if (ev.from === ev.max && ev.to === 0) oneShot = true;
    // decided by a single move: one hit took 60%+ of the target's bar
    if (frac >= 0.6) decided = true;
  }
  if (oneShot) st.oneShots++;
  if (decided) st.decided++;
  if (playerPool) st.playerHpLeft.push(playerPool);
}

function mean(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
function pct(x) { return (x * 100).toFixed(1) + "%"; }
function f1(x) { return x.toFixed(1); }

function summarise(label, st) {
  return {
    label: label,
    n: st.n,
    winRate: st.n ? st.wins / st.n : 0,
    lossRate: st.n ? st.losses / st.n : 0,
    avgTurns: mean(st.turns),
    avgDmgPerHit: mean(st.hits),
    hits: st.hits.length,
    oneShotRate: st.n ? st.oneShots / st.n : 0,
    decidedRate: st.n ? st.decided / st.n : 0
  };
}

function line(s) {
  return [
    pad(s.label, 42),
    "win " + pad(pct(s.winRate), 7),
    "turns " + pad(f1(s.avgTurns), 6),
    "dmg/hit " + pad(pct(s.avgDmgPerHit), 7),
    "1-shot " + pad(pct(s.oneShotRate), 7),
    "decided " + pct(s.decidedRate)
  ].join(" ");
}
function pad(s, n) { s = String(s); while (s.length < n) s += " "; return s; }

// -------------------------------------------------------------
// public: run a matchup N times
// -------------------------------------------------------------
// spec: { label, player:[{species,level}], enemy:[...] | trainerId,
//         n, seed, kind, difficulty, rules }
function simulate(spec) {
  const MQ = env().MQ;
  const n = spec.n || 200;
  const seed0 = spec.seed === undefined ? 1 : spec.seed;
  const st = Stats();
  for (let i = 0; i < n; i++) {
    const s = seed0 + i;
    const opts = {
      seed: s,
      kind: spec.kind || (spec.trainerId ? "trainer" : "wild"),
      difficulty: spec.difficulty || "normal",
      playerParty: buildParty(spec.player, "p" + s, spec.playerOpts),
      rules: spec.rules || { canRun: false, canCatch: false }
    };
    if (spec.trainerId) {
      const t = MQ.Data.trainers[spec.trainerId];
      if (!t) throw new Error("unknown trainer " + spec.trainerId);
      const td = {}; Object.keys(t).forEach(function (k) { td[k] = t[k]; }); td.id = spec.trainerId;
      opts.trainer = td;
      opts.enemyParty = buildParty(td.party.map(function (e) {
        return { species: e.species, level: e.level, moves: e.moves, gear: e.gear };
      }), "e" + s, spec.enemyOpts);
    } else {
      opts.enemyParty = buildParty(spec.enemy, "e" + s, spec.enemyOpts);
    }
    measure(st, runBattle(opts, true));
  }
  return summarise(spec.label || "sim", st);
}

// -------------------------------------------------------------
// encounter table helpers
// -------------------------------------------------------------
function tableRows(id) {
  const t = D().encounters[id];
  if (!t) throw new Error("unknown encounter table " + id);
  return t.table;
}
function tableAvgLevel(id) {
  const rows = tableRows(id);
  let w = 0, s = 0;
  rows.forEach(function (r) { w += r.w; s += r.w * (r.min + r.max) / 2; });
  return w ? s / w : 5;
}
// Every distinct species in a table, each fought at its own mid level.
function tableMatchups(id) {
  const rows = tableRows(id);
  const out = [];
  rows.forEach(function (r) {
    out.push({ species: r.species, level: Math.round((r.min + r.max) / 2), w: r.w });
  });
  return out;
}
function eastTables() {
  const all = Object.keys(D().encounters).sort();
  // the east file owns these prefixes (DESIGN-INDEX §4/§5)
  const pre = /^(macclesfield|route_macc|bollington|kerridge|prestbury|poynton|lyme|teggs|route_bollington|route_prestbury|route_poynton|fish_macclesfield|fish_route_macc|fish_bollington)/;
  return all.filter(function (k) { return pre.test(k); });
}

// -------------------------------------------------------------
// COMMAND: starters vs the east wild tables + early trainers
// -------------------------------------------------------------
const STARTERS = ["silkin", "brinewt", "kindlin"];
const STARTER_LINE = { silkin: ["silkin", "spindrake", "loomoth"], brinewt: ["brinewt", "saltander", "halosaur"], kindlin: ["kindlin", "stokerel", "furnacore"] };

function cmdStarters(args) {
  const n = Number(args.n) || 60;
  const out = [];
  console.log("\n== starters vs east wild encounters (level-matched, 1-v-1) ==");
  const tables = eastTables().filter(function (t) { return !/^fish_/.test(t); });
  STARTERS.forEach(function (st) {
    const agg = Stats();
    tables.forEach(function (tid) {
      const lvl = Math.round(tableAvgLevel(tid));
      tableMatchups(tid).forEach(function (m) {
        const s = simulate({
          label: st + " vs " + m.species, n: Math.max(6, Math.round(n / 8)),
          player: [{ species: st, level: m.level }], enemy: [{ species: m.species, level: m.level }],
          seed: 7000 + tid.length * 13
        });
        agg.n += s.n; agg.wins += Math.round(s.winRate * s.n);
        agg.turns.push(s.avgTurns); agg.hits.push(s.avgDmgPerHit);
        agg.oneShots += Math.round(s.oneShotRate * s.n);
        agg.decided += Math.round(s.decidedRate * s.n);
      });
      void lvl;
    });
    const s = summarise(st + " (all east wilds)", agg);
    out.push(s);
    console.log("  " + line(s));
  });

  console.log("\n== starters vs early east trainers (full party of the line) ==");
  const early = Object.keys(D().trainers).filter(function (k) {
    return /^tr_(macclesfield|route_macc|bollington|kerridge)/.test(k);
  }).sort();
  STARTERS.forEach(function (st) {
    const agg = Stats();
    early.forEach(function (tid) {
      const t = D().trainers[tid];
      const lvl = Math.round(mean(t.party.map(function (p) { return p.level; })));
      // Ch.1 expects a party of three: starter + MEADOW + BIGBOY.
      const s = simulate({
        label: st + " vs " + tid, n: Math.max(6, Math.round(n / 6)),
        player: [{ species: st, level: lvl }, { species: "meadow", level: Math.max(2, lvl - 1) },
          { species: "bigboy", level: Math.max(2, lvl - 1) }],
        trainerId: tid, seed: 8000
      });
      agg.n += s.n; agg.wins += Math.round(s.winRate * s.n);
      agg.turns.push(s.avgTurns); agg.hits.push(s.avgDmgPerHit);
      agg.oneShots += Math.round(s.oneShotRate * s.n);
      agg.decided += Math.round(s.decidedRate * s.n);
    });
    const s = summarise(st + " (early trainers, party of 3)", agg);
    out.push(s);
    console.log("  " + line(s));
  });
  return out;
}

// -------------------------------------------------------------
// COMMAND: evolution step-up — does each stage feel like a step up?
// -------------------------------------------------------------
function cmdEvo(args) {
  console.log("\n== evolution step-up (stage N vs stage N+1, both at the evo level) ==");
  const sp = D().species;
  const rows = [];
  Object.keys(sp).forEach(function (id) {
    const s = sp[id];
    if (!s.evolutions || !s.evolutions.length) return;
    s.evolutions.forEach(function (e) {
      const to = sp[e.to];
      if (!to) return;
      const lvl = Math.max(10, e.level || 20);
      const r = simulate({
        label: id + " → " + e.to, n: Number(args.n) || 40,
        player: [{ species: e.to, level: lvl }], enemy: [{ species: id, level: lvl }],
        seed: 9100
      });
      r.gain = to.bst - s.bst;
      rows.push(r);
    });
  });
  rows.sort(function (a, b) { return a.winRate - b.winRate; });
  rows.slice(0, 14).forEach(function (r) { console.log("  weakest  " + line(r) + "  BST+" + r.gain); });
  console.log("  ...");
  rows.slice(-4).forEach(function (r) { console.log("  strongest " + line(r) + "  BST+" + r.gain); });
  return rows;
}

// -------------------------------------------------------------
// COMMAND: gym leader level sweep
// -------------------------------------------------------------
function cmdGym(args) {
  const id = args.id || "leader_ada";
  const t = D().trainers[id];
  if (!t) throw new Error("unknown trainer " + id);
  const ace = Math.max.apply(null, t.party.map(function (p) { return p.level; }));
  const from = Number(args.from) || ace - 5;
  const to = Number(args.to) || ace + 1;
  const n = Number(args.n) || 60;
  console.log("\n== " + id + " (ace " + ace + ") vs a level-appropriate party ==");
  const out = [];
  for (let lvl = from; lvl <= to; lvl++) {
    const party = (args.party ? parseParty(args.party, lvl) : [
      { species: "spindrake", level: lvl }, { species: "gnawlord", level: lvl - 1 },
      { species: "galewing", level: lvl - 1 }, { species: "meadow", level: lvl - 2 }
    ]).map(function (p) { return { species: p.species, level: Math.max(2, p.level) }; });
    const s = simulate({ label: id + " @ party lvl " + lvl, n: n, player: party, trainerId: id, seed: 4200 });
    out.push(s);
    console.log("  " + line(s));
  }
  return out;
}

// -------------------------------------------------------------
// COMMAND: type-chart pressure
// -------------------------------------------------------------
// For each attacking type: how much of the actual dex it hits for 2x+,
// how much resists it, and — the other half of the story — how much of
// the dex hits *it* super-effectively.
function typePressure() {
  const d = D();
  const list = Object.keys(d.species).map(function (k) { return d.species[k]; })
    .filter(function (s) { return !s.dexHidden; });
  const rows = [];
  d.typeIds.forEach(function (atk) {
    let se = 0, res = 0, imm = 0;
    list.forEach(function (s) {
      const m = d.typeMultiplier(atk, s.types);
      if (m === 0) imm++; else if (m > 1) se++; else if (m < 1) res++;
    });
    // defensive: how many attacking types hit a mono-<atk> mon for 2x
    let weak = 0, resists = 0;
    d.typeIds.forEach(function (other) {
      const m = d.typeMultiplier(other, [atk]);
      if (m > 1) weak++; else if (m < 1) resists++;
    });
    // What a same-level attacker of this type actually expects to land:
    // the chart is not ours to edit, but the power on the type's moves
    // is, so pressure is measured as reach x punch.
    const eps = [];
    Object.keys(d.moves).forEach(function (id) {
      const m = d.moves[id];
      if (m.type !== atk || m.cat === "status" || m.overdriveOnly) return;
      let ep = m.power * (m.acc === null ? 100 : m.acc) / 100;
      m.effects.forEach(function (e) { if (e.kind === "multihit") ep *= (e.min + e.max) / 2; });
      eps.push(ep);
    });
    eps.sort(function (a, b) { return b - a; });
    // the top three are what a trained monster of the type actually
    // carries; the median is dragged about by starter-tier filler.
    const top = eps.slice(0, 3);
    const medEP = top.length ? top.reduce(function (a, b) { return a + b; }, 0) / top.length : 0;
    // expected multiplier a random dex target takes from this type
    let expMult = 0;
    list.forEach(function (s) { expMult += d.typeMultiplier(atk, s.types); });
    expMult /= list.length;
    rows.push({
      type: atk,
      offSE: se / list.length, offRes: (res + imm) / list.length,
      defWeak: weak, defRes: resists, medEP: medEP, expMult: expMult,
      pressure: expMult * medEP / 80,
      score: se / list.length - (res + imm) / list.length + (resists - weak) * 0.02
    });
  });
  return rows;
}
function cmdTypes() {
  console.log("\n== type-chart pressure (offensive coverage over the live dex) ==");
  const rows = typePressure().sort(function (a, b) { return b.score - a.score; });
  rows.forEach(function (r) {
    console.log("  " + pad(r.type, 10) + "SE " + pad(pct(r.offSE), 7) + "resisted " + pad(pct(r.offRes), 7) +
      "avg-mult " + pad(r.expMult.toFixed(2), 6) + "top3-EP " + pad(r.medEP.toFixed(0), 5) +
      "pressure " + pad(r.pressure.toFixed(3), 8) + "def: weak-to " + pad(r.defWeak, 3) + "resists " + r.defRes);
  });
  const byP = rows.slice().sort(function (a, b) { return b.pressure - a.pressure; });
  const best = byP[0], worst = byP[byP.length - 1];
  console.log("  chart-only spread " + (rows[0].score - rows[rows.length - 1].score).toFixed(3));
  console.log("  pressure spread   " + (best.pressure - worst.pressure).toFixed(3) +
    "  (" + best.type + " " + best.pressure.toFixed(2) + " → " + worst.type + " " + worst.pressure.toFixed(2) +
    ", ratio " + (best.pressure / worst.pressure).toFixed(2) + ")");
  return rows;
}

// -------------------------------------------------------------
// COMMAND: move budget outliers
// -------------------------------------------------------------
// Budget: expected power (power × acc/100) for a damaging move, plus a
// PP allowance. Signature/Overdrive moves are exempt from the ceiling
// but are still listed.
function moveBudget() {
  const d = D();
  const out = [];
  Object.keys(d.moves).forEach(function (id) {
    const m = d.moves[id];
    if (m.cat === "status") return;
    const acc = m.acc === null ? 100 : m.acc;
    let ep = m.power * acc / 100;
    // multihit multiplies the real output
    m.effects.forEach(function (e) {
      if (e.kind === "multihit") ep *= (e.min + e.max) / 2;
    });
    out.push({
      id: id, name: m.name, power: m.power, acc: m.acc, pp: m.pp, pri: m.priority,
      od: !!m.overdriveOnly, ep: ep,
      drawback: m.effects.some(function (e) { return e.kind === "recharge" || e.kind === "charge" || e.kind === "recoil"; }),
      self: m.effects.some(function (e) { return e.kind === "stage" && e.who === "self" && e.delta < 0; })
    });
  });
  return out;
}
function cmdMoves() {
  console.log("\n== move budget: expected power (power × acc), non-Overdrive ==");
  const rows = moveBudget().filter(function (r) { return !r.od; }).sort(function (a, b) { return b.ep - a.ep; });
  rows.slice(0, 16).forEach(function (r) {
    console.log("  " + pad(r.name, 24) + "pow " + pad(r.power, 5) + "acc " + pad(r.acc === null ? "—" : r.acc, 5) +
      "pp " + pad(r.pp, 4) + "pri " + pad(r.pri, 3) + "EP " + pad(r.ep.toFixed(1), 7) +
      (r.drawback ? "[drawback]" : "") + (r.self ? "[self-debuff]" : ""));
  });
  console.log("\n== priority moves with too much on them ==");
  moveBudget().filter(function (r) { return !r.od && r.pri > 0 && r.power >= 60; })
    .forEach(function (r) { console.log("  " + pad(r.name, 24) + "pow " + r.power + " pri " + r.pri); });
  console.log("\n== high expected power on generous PP (>= 15 PP, EP >= 80) ==");
  rows.filter(function (r) { return r.pp >= 15 && r.ep >= 80; })
    .forEach(function (r) { console.log("  " + pad(r.name, 24) + "pow " + r.power + " acc " + r.acc + " pp " + r.pp + " EP " + r.ep.toFixed(1)); });
  return rows;
}

// -------------------------------------------------------------
// COMMAND: species BST bands + learnset audit
// -------------------------------------------------------------
// Band per tier. Species that can still evolve are held to the tighter
// band: a first stage should not out-stat the player's own mid stage.
const TIER_BAND = { low: [200, 400], mid: [340, 530], high: [430, 620], legendary: [560, 850] };
const TIER_BAND_EVOLVING = { low: [200, 365], mid: [340, 480], high: [430, 600], legendary: [560, 850] };
function cmdSpecies() {
  const d = D();
  console.log("\n== BST outside its tier band ==");
  const bad = [];
  Object.keys(d.species).forEach(function (id) {
    const s = d.species[id];
    if (s.dexHidden) return;
    const evolves = !!(s.evolutions && s.evolutions.length);
    const band = (evolves ? TIER_BAND_EVOLVING : TIER_BAND)[s.tier];
    if (!band) return;
    if (s.bst < band[0] || s.bst > band[1]) bad.push(id + " (" + s.tier + " " + s.bst + " vs " + band.join("-") + ")");
  });
  console.log(bad.length ? "  " + bad.join("\n  ") : "  none");

  console.log("\n== species with no usable attacking move by level 5 ==");
  const noAtk = [];
  Object.keys(d.species).forEach(function (id) {
    const s = d.species[id];
    const mv = d.movesAtLevel(s, 5);
    const has = mv.some(function (m) { return d.moves[m] && d.moves[m].cat !== "status" && d.moves[m].power > 0; });
    if (!has) noAtk.push(id + " [" + mv.join(",") + "]");
  });
  console.log(noAtk.length ? "  " + noAtk.join("\n  ") : "  none");

  console.log("\n== species whose level-30 loadout has no STAB attack ==");
  const noStab = [];
  Object.keys(d.species).forEach(function (id) {
    const s = d.species[id];
    const mv = d.movesAtLevel(s, 30);
    const has = mv.some(function (m) {
      const mm = d.moves[m];
      return mm && mm.cat !== "status" && mm.power > 0 && s.types.indexOf(mm.type) >= 0;
    });
    if (!has) noStab.push(id + " [" + s.types.join("/") + ": " + mv.join(",") + "]");
  });
  console.log(noStab.length ? "  " + noStab.slice(0, 30).join("\n  ") + (noStab.length > 30 ? "\n  ...+" + (noStab.length - 30) : "") : "  none");

  console.log("\n== evolutions that are not a real step up (BST gain < 45) ==");
  const flat = [];
  Object.keys(d.species).forEach(function (id) {
    const s = d.species[id];
    (s.evolutions || []).forEach(function (e) {
      const to = d.species[e.to];
      if (to && to.bst - s.bst < 45) flat.push(id + " → " + e.to + " (+" + (to.bst - s.bst) + ")");
    });
  });
  console.log(flat.length ? "  " + flat.join("\n  ") : "  none");
  return { bad: bad, noAtk: noAtk, noStab: noStab, flat: flat };
}

// -------------------------------------------------------------
// COMMAND: healing items vs measured damage
// -------------------------------------------------------------
// Chapter bands from DESIGN-INDEX §1 / SYSTEMS-SPEC §15.
const CHAPTER_LEVEL = [6, 11, 16, 20, 24, 28, 32, 35, 39, 43, 47, 52];
function cmdItems(args) {
  const d = D();
  console.log("\n== healing items vs a chapter's typical bulk and damage ==");
  const n = Number(args.n) || 24;
  // A party mon's tier moves with the chapter: low stages early, the
  // fully evolved things from the middle of the game on.
  const tierFor = function (ch) { return ch <= 2 ? "low" : (ch <= 6 ? "mid" : "high"); };
  const rows = [];
  CHAPTER_LEVEL.forEach(function (lvl, i) {
    const tier = tierFor(i + 1);
    const hps = [];
    Object.keys(d.species).forEach(function (k) {
      const sp = d.species[k];
      if (sp.dexHidden || sp.tier !== tier) return;
      hps.push(d.statsAtLevel(sp, lvl, { hp: 8, atk: 8, def: 8, spa: 8, spd: 8, spe: 8 }, "plain").hp);
    });
    hps.sort(function (a, b) { return a - b; });
    const hp = hps[Math.floor(hps.length / 2)] || 1;
    const probe = { low: ["nibbit", "flitchick", "sootling", "mistlop"], mid: ["gnawlord", "galewing", "spindrake", "saltander"], high: ["loomoth", "halosaur", "furnacore", "bigboy"] }[tier];
    let frac = 0;
    for (let j = 0; j < probe.length; j++) {
      frac += simulate({
        label: "ch" + (i + 1), n: n,
        player: [{ species: probe[j], level: lvl }],
        enemy: [{ species: probe[(j + 1) % probe.length], level: lvl }],
        seed: 5500 + i * 10 + j
      }).avgDmgPerHit;
    }
    const s = { avgDmgPerHit: frac / probe.length };
    const dmg = s.avgDmgPerHit * hp;
    rows.push({ ch: i + 1, level: lvl, hp: Math.round(hp), dmgPerHit: Math.round(dmg) });
    console.log("  ch" + pad(i + 1, 3) + "lvl " + pad(lvl, 4) + "typical maxHP " + pad(Math.round(hp), 5) +
      "dmg/hit " + pad(Math.round(dmg), 5) + "(" + pct(s.avgDmgPerHit) + " of bar)");
  });
  console.log("\n  heal item value where it first becomes affordable:");
  healAudit(rows).forEach(function (h) {
    console.log("    " + pad(h.name, 12) + "+" + pad(h.amount, 5) + "buyable ch" + pad(h.ch, 4) +
      pad(Math.round(h.barPct * 100) + "% of bar", 14) + h.hits.toFixed(1) + " hits of damage undone");
  });
  console.log("\n== gear multipliers, sorted ==");
  Object.keys(d.items).forEach(function (id) {
    const it = d.items[id];
    if (it.kind !== "gear" || !it.gearEffect) return;
    const g = it.gearEffect;
    if (g.mult !== undefined && g.mult >= 1.35) console.log("  strong " + pad(it.name, 26) + JSON.stringify(g));
    if (g.mult !== undefined && g.mult > 1 && g.mult < 1.1) console.log("  weak   " + pad(it.name, 26) + JSON.stringify(g));
  });
  return rows;
}

// price -> the chapter a player can comfortably buy the thing
// (money curve, SYSTEMS-SPEC §15: gear 800-3000, one piece per chapter
// from Ch.3).
function chapterAffordable(price) {
  if (price <= 250) return 1;
  if (price <= 400) return 2;
  if (price <= 700) return 4;
  if (price <= 1100) return 5;
  if (price <= 1600) return 6;
  if (price <= 2200) return 8;
  return 10;
}
// rows: [{ch, level, hp, dmgPerHit}] from cmdItems
function healAudit(rows) {
  const d = D();
  const out = [];
  Object.keys(d.items).forEach(function (id) {
    const it = d.items[id];
    if (it.kind !== "heal" || typeof it.amount !== "number") return;
    const ch = chapterAffordable(it.price || 0);
    const r = rows[Math.min(rows.length - 1, ch - 1)];
    out.push({
      id: id, name: it.name, amount: it.amount, price: it.price, ch: ch,
      barPct: it.amount / r.hp, hits: it.amount / Math.max(1, r.dmgPerHit)
    });
  });
  out.sort(function (a, b) { return a.amount - b.amount; });
  return out;
}

// -------------------------------------------------------------
// COMMAND: single matchups
// -------------------------------------------------------------
function cmdWild(args, rest) {
  const tid = rest[0];
  const lvl = Number(args.level) || Math.round(tableAvgLevel(tid));
  const player = args.party ? parseParty(args.party, lvl) : null;
  console.log("\n== wild table " + tid + " (avg level " + lvl + ") ==");
  const out = [];
  tableMatchups(tid).forEach(function (m) {
    const s = simulate({
      label: (player ? args.party : m.species + "-mirror") + " vs " + m.species + ":" + m.level,
      n: Number(args.n) || 60,
      player: player || [{ species: STARTERS[0], level: m.level }],
      enemy: [{ species: m.species, level: m.level }],
      seed: Number(args.seed) || 1
    });
    out.push(s);
    console.log("  " + line(s));
  });
  return out;
}
function cmdTrainer(args, rest) {
  const tid = rest[0];
  const t = D().trainers[tid];
  const lvl = Number(args.level) || Math.round(mean(t.party.map(function (p) { return p.level; })));
  const s = simulate({
    label: tid, n: Number(args.n) || 100,
    player: parseParty(args.party || "spindrake,gnawlord,galewing", lvl),
    trainerId: tid, seed: Number(args.seed) || 1
  });
  console.log("  " + line(s));
  return s;
}
function cmdDuel(args) {
  const lvl = Number(args.level) || 20;
  const s = simulate({
    label: args.a + " vs " + args.b, n: Number(args.n) || 200,
    player: parseParty(args.a, lvl), enemy: parseParty(args.b, lvl),
    seed: Number(args.seed) || 1
  });
  console.log("  " + line(s));
  return s;
}

// -------------------------------------------------------------
// CLI
// -------------------------------------------------------------
function parseArgs(argv) {
  const args = {}, rest = [];
  argv.forEach(function (a) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    if (m) args[m[1]] = m[2] === undefined ? true : m[2];
    else rest.push(a);
  });
  return { args: args, rest: rest };
}

const COMMANDS = {
  wild: cmdWild, trainer: cmdTrainer, duel: cmdDuel, starters: cmdStarters,
  evo: cmdEvo, gym: cmdGym, types: cmdTypes, moves: cmdMoves,
  species: cmdSpecies, items: cmdItems,
  all: function (args) {
    cmdStarters(args); cmdGym(args); cmdTypes(); cmdMoves(); cmdSpecies(); cmdItems(args); cmdEvo(args);
  }
};

module.exports = {
  load: env, simulate: simulate, buildParty: buildParty, parseParty: parseParty,
  runBattle: runBattle, summarise: summarise, Stats: Stats, measure: measure,
  typePressure: typePressure, moveBudget: moveBudget,
  TIER_BAND: TIER_BAND, TIER_BAND_EVOLVING: TIER_BAND_EVOLVING,
  eastTables: eastTables, healAudit: healAudit, chapterAffordable: chapterAffordable,
  CHAPTER_LEVEL: CHAPTER_LEVEL, tableMatchups: tableMatchups, tableAvgLevel: tableAvgLevel,
  mean: mean
};

if (require.main === module) {
  const p = parseArgs(process.argv.slice(2));
  const cmd = p.rest.shift() || "all";
  const fn = COMMANDS[cmd];
  if (!fn) {
    console.error("unknown command '" + cmd + "'. try: " + Object.keys(COMMANDS).join(", "));
    process.exit(1);
  }
  fn(p.args, p.rest);
}
