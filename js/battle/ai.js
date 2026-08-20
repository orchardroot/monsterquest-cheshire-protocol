// =============================================================
// MonsterQuest v2 — MQ.BattleAI
// Three tiers (SYSTEMS-SPEC §10): random, greedy, smart.
// Deterministic under a seeded b.rng(); no side effects on the
// battle state beyond the AI's own per-side memory.
// =============================================================
(function () {
  "use strict";
  const NS = window.MQ;
  const U = NS.U;
  const BE = NS.BattleEffects;
  const AI = {};

  AI.TIERS = ["random", "greedy", "smart"];

  AI.shiftTier = function (tier, difficulty) {
    const d = BE.DIFF[difficulty] || BE.DIFF.normal;
    if (difficulty === "nightmare") return "smart";
    let i = AI.TIERS.indexOf(tier);
    if (i < 0) i = 0;
    i = U.clamp(i + (d.aiShift || 0), 0, 2);
    return AI.TIERS[i];
  };

  // ---- helpers --------------------------------------------------
  function usableMoves(b, mon) {
    const out = [];
    const list = mon.moves || [];
    const v = b.vol(mon);
    for (let i = 0; i < list.length; i++) {
      const slot = list[i];
      if (!slot || !slot.id) continue;
      if (slot.pp <= 0) continue;
      if (v.disabled[slot.id] > 0) continue;
      if (v.cooldowns && v.cooldowns[slot.id] > 0) continue;
      if (v.choiceLock && v.choiceLock !== slot.id) continue;
      const md = b.moveData(slot.id);
      if (v.taunt > 0 && md.cat === "status") continue;
      out.push({ index: i, id: slot.id, move: md, slot: slot });
    }
    if (!out.length && list.length) {
      // Everything is spent: flail with the first slot (the engine
      // turns this into a Struggle-style typeless smack).
      out.push({ index: -1, id: null, move: b.struggle(), slot: null, struggle: true });
    }
    return out;
  }

  // Expected damage, no RNG, no side effects (preview:true).
  AI.previewDamage = function (b, user, target, move) {
    if (!move || move.cat === "status" || !move.power) return 0;
    const power = BE.scaledPower(b, user, target, move);
    const r = BE.damage(b, user, target, move, { power: power, roll: 0.925, crit: false, preview: true });
    let dmg = r.dmg;
    const mh = BE.moveFlag(move, "multihit") || BE.moveFlag(move, "multi");
    if (mh) dmg *= (mh.min === mh.max) ? mh.min : 3;
    return dmg;
  };
  AI.hitChance = function (b, user, target, move) {
    if (move.acc === null || move.acc === undefined || move.acc >= 999 || move.overdriveOnly) return 1;
    const ctx = {};
    // Reuse the real accuracy maths without consuming randomness.
    const saved = b.rng;
    let p = 1;
    b.rng = function () { return 2; };            // always "misses" → fills ctx.hitChance
    try { BE.accuracyCheck(b, user, target, move, ctx); p = ctx.hitChance === undefined ? move.acc / 100 : ctx.hitChance; }
    finally { b.rng = saved; }
    return U.clamp(p, 0, 1);
  };

  function typeRisk(b, mon, foe) {
    // How badly does `foe` threaten `mon`? Max type multiplier over the foe's moves.
    let worst = 1;
    const list = foe.moves || [];
    for (let i = 0; i < list.length; i++) {
      const md = b.moveData(list[i].id);
      if (!md || md.cat === "status") continue;
      const m = b.typeMult ? b.typeMult(md.type, b.typesOf(mon)) : (NS.Data && NS.Data.typeMultiplier ? NS.Data.typeMultiplier(md.type, b.typesOf(mon)) : 1);
      if (m > worst) worst = m;
    }
    return worst;
  }

  function benchResist(b, side, foe) {
    let best = null, bestScore = 0;
    for (let i = 0; i < side.party.length; i++) {
      const m = side.party[i];
      if (!m || m.hp <= 0 || side.activeUids.indexOf(m.uid) >= 0) continue;
      const risk = typeRisk(b, m, foe);
      const punch = AI.previewDamage(b, m, foe, bestMoveOf(b, m, foe));
      const score = (2 - Math.min(2, risk)) * 40 + punch / Math.max(1, b.maxHp(foe)) * 60;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    return { index: best, score: bestScore };
  }

  function bestMoveOf(b, mon, foe) {
    const opts = usableMoves(b, mon);
    let best = null, bestD = -1;
    for (let i = 0; i < opts.length; i++) {
      const d = AI.previewDamage(b, mon, foe, opts[i].move);
      if (d > bestD) { bestD = d; best = opts[i].move; }
    }
    return best;
  }

  // ---- scoring ---------------------------------------------------
  AI.scoreMove = function (b, mon, foe, opt, tier, mem) {
    const move = opt.move;
    const maxFoe = b.maxHp(foe);
    const hit = AI.hitChance(b, mon, foe, move);
    let score = 0;

    if (move.cat !== "status" && move.power) {
      const dmg = AI.previewDamage(b, mon, foe, move);
      score = (dmg / Math.max(1, maxFoe)) * 100 * hit;
      if (dmg >= foe.hp) score += 30;
      if (move.priority > 0 && foe.hp <= maxFoe * 0.25) score += 15;   // finish the wounded
    } else {
      // Status / support moves.
      const effects = move.effects || [];
      for (let i = 0; i < effects.length; i++) {
        const e = effects[i];
        if (e.kind === "status" && !foe.status && b.turn <= 2) score += 15;
        else if (e.kind === "status" && foe.status) score -= 20;
        else if (e.kind === "stage" && (e.who === "self" || e.target === "self") && e.delta > 0) {
          score += (mon.hp > b.maxHp(mon) * 0.6) ? 10 : -5;
        } else if (e.kind === "stage" && e.delta < 0) score += 8;
        else if (e.kind === "heal") score += mon.hp < b.maxHp(mon) * 0.5 ? 22 : -15;
        else if (e.kind === "screen") score += b.sideOf(mon).screens[e.screen || e.what || "phys"] > 0 ? -10 : 12;
        else if (e.kind === "protect") score += 4;
        else if (e.kind === "weather" || e.kind === "terrain") score += 6;
        else if (e.kind === "overdrive") score += 6;
        else if (e.kind === "trap") score += 10;
        else score += 4;
      }
      score *= hit;
    }

    if (tier === "smart") {
      // Protect the turn the player's Overdrive is full.
      if (BE.moveFlag(move, "protect") && foe.overdrive >= 100) score += 45;
      // Weather/terrain that the rest of the team wants.
      const w = BE.moveFlag(move, "weather");
      if (w && b.field.weather !== (w.w || w.weather)) score += 8;
      // A counter needs the memory of a physical hit.
      const cn = BE.moveFlag(move, "counter");
      if (cn && mem && mem.lastFoeCategory === (cn.what || cn.category || "phys")) score += 25;
      // Do not waste a charge move on a foe about to switch out or die.
      if (BE.moveFlag(move, "charge") && foe.hp < b.maxHp(foe) * 0.25) score -= 20;
      if (move.cat === "status" && mon.hp < b.maxHp(mon) * 0.2) score -= 15;
    }
    return score;
  };

  // ---- the main entry point --------------------------------------
  // Returns an action object identical in shape to the player's.
  AI.choose = function (b, mon, o) {
    o = o || {};
    const side = b.sideOf(mon);
    const tier = o.tier || side.ai || "random";
    const foes = b.foesOf(mon);
    const foe = o.target || foes[0];
    const mem = side.memory || (side.memory = {});
    if (!foe) return { type: "move", index: 0 };

    const opts = usableMoves(b, mon);
    if (tier === "random") {
      const pick = U.pick(opts, b.rng);
      return pick.struggle ? { type: "struggle" } : { type: "move", index: pick.index, target: foe.uid };
    }

    // --- items (greedy and smart) -------------------------------
    if (side.trainer && side.itemsUsed < 2 && mon.hp < b.maxHp(mon) * 0.25 && b.aiHealItem(side)) {
      const item = b.aiHealItem(side);
      return { type: "item", id: item, target: mon.uid, ai: true };
    }

    // --- overdrive ------------------------------------------------
    if (mon.overdrive >= 100 && b.overdriveActive(mon)) {
      const savingIt = tier === "smart" && foe.hp <= b.maxHp(foe) * 0.5;
      if (!savingIt) return { type: "overdrive", target: foe.uid };
    }

    // --- switching (smart only) -----------------------------------
    if (tier === "smart" && side.trainer && !b.vol(mon).trapped) {
      const risk = typeRisk(b, mon, foe);
      if (risk >= 2) {
        const alt = benchResist(b, side, foe);
        if (alt.index !== null && b.rng() < 0.4) return { type: "switch", index: alt.index };
      }
    }

    // --- moves ----------------------------------------------------
    let scored = [];
    for (let i = 0; i < opts.length; i++) {
      scored.push({ opt: opts[i], score: AI.scoreMove(b, mon, foe, opts[i], tier, mem) });
    }
    scored.sort(function (a, c) { return c.score - a.score; });
    let chosen = scored[0];
    if (scored.length > 1 && b.rng() < 0.2) chosen = scored[1];
    if (!chosen) return { type: "struggle" };
    if (chosen.opt.struggle) return { type: "struggle" };
    return { type: "move", index: chosen.opt.index, target: foe.uid };
  };

  // Which bench monster does the AI send in after a faint?
  AI.chooseSwitchIn = function (b, side, foe) {
    const tier = side.ai || "random";
    const avail = [];
    for (let i = 0; i < side.party.length; i++) {
      const m = side.party[i];
      if (m && m.hp > 0 && side.activeUids.indexOf(m.uid) < 0) avail.push(i);
    }
    if (!avail.length) return -1;
    if (tier === "random" || !foe) return U.pick(avail, b.rng);
    let best = avail[0], bestScore = -Infinity;
    for (let i = 0; i < avail.length; i++) {
      const m = side.party[avail[i]];
      const punch = AI.previewDamage(b, m, foe, bestMoveOf(b, m, foe));
      const risk = typeRisk(b, m, foe);
      const score = punch / Math.max(1, b.maxHp(foe)) * 100 - risk * 20 + (m.hp / b.maxHp(m)) * 20;
      if (score > bestScore) { bestScore = score; best = avail[i]; }
    }
    return best;
  };

  // Remember what the player just did (smart tier's one-turn memory).
  AI.remember = function (b, side, move, category) {
    const mem = side.memory || (side.memory = {});
    mem.lastFoeMove = move ? move.id : null;
    mem.lastFoeCategory = category;
    mem.lastFoeTurn = b.turn;
  };

  AI.usableMoves = usableMoves;
  NS.BattleAI = AI;
})();
