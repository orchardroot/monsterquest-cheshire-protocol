// =============================================================
// MonsterQuest v2 — MQ.BattleEffects
// Move-effect handlers, the 30 abilities, gear hooks, status,
// and every scrap of battle arithmetic. Pure logic: no drawing,
// no timers. The engine (js/battle/engine.js) supplies the
// battle object `b` described in the header comment below.
//
// b = { rng(), turn, field, emit(type,data), msg(text), name(mon),
//       vol(mon), sideOf(mon), sideIndexOf(mon), foesOf(mon),
//       alliesOf(mon), typesOf(mon), moveData(id), maxHp(mon),
//       setWeather(w,turns,setter), setTerrain(t,turns,setter),
//       faint(mon), perk(id), difficulty, isPlayerSide(mon) }
// =============================================================
(function () {
  "use strict";
  const NS = window.MQ;
  const U = NS.U;
  const BE = {};

  // ---- constants -----------------------------------------------
  BE.STATS = ["hp", "atk", "def", "spa", "spd", "spe"];
  BE.STAGE_STATS = ["atk", "def", "spa", "spd", "spe", "acc", "eva"];
  BE.STATUSES = ["psn", "tox", "par", "brn", "slp", "frz"];
  BE.CRIT_ODDS = [1 / 24, 1 / 8, 1 / 2, 1];
  BE.WEATHERS = ["rain", "sun", "fog", "wind", "snow"];
  BE.TERRAINS = ["grass", "wet", "salt", "static", "silk"];

  BE.STATUS_NAME = {
    psn: "poisoned", tox: "badly poisoned", par: "paralysed", brn: "burnt",
    slp: "asleep", frz: "frozen", cnf: "confused"
  };
  BE.STATUS_SHORT = { psn: "PSN", tox: "TOX", par: "PAR", brn: "BRN", slp: "SLP", frz: "FRZ", cnf: "CNF" };
  BE.STATUS_COLOR = {
    psn: "#a040a0", tox: "#7b2d8e", par: "#d8b820", brn: "#e2492f",
    slp: "#7b8ba8", frz: "#6fc7e8", cnf: "#e08840"
  };
  BE.WEATHER_NAME = { rain: "Rain", sun: "Sun", fog: "Fog", wind: "Wind", snow: "Snow" };
  BE.TERRAIN_NAME = { grass: "Grass", wet: "Wet", salt: "Salt", static: "Static", silk: "Silk" };
  BE.STAT_NAME = {
    atk: "Attack", def: "Defence", spa: "Sp. Attack", spd: "Sp. Defence",
    spe: "Speed", acc: "accuracy", eva: "evasiveness", hp: "HP"
  };

  // 20 temperaments (SYSTEMS-SPEC §1). Data may override via MQ.Data.temperaments.
  BE.TEMPERAMENTS = {
    brisk: { up: "spe", down: "def" }, stubborn: { up: "def", down: "spe" },
    sharp: { up: "spa", down: "atk" }, blunt: { up: "atk", down: "spa" },
    wary: { up: "spd", down: "atk" }, bold: { up: "atk", down: "spd" },
    rash: { up: "spa", down: "spd" }, patient: { up: "spd", down: "spe" },
    nosy: { up: "spe", down: "spa" }, gruff: { up: "def", down: "spa" },
    mardy: { up: "atk", down: "def" }, canny: { up: "spa", down: "def" },
    steadfast: { up: "spd", down: "def" }, placid: { up: "def", down: "atk" },
    skittish: { up: "spe", down: "atk" }, sly: { up: "spa", down: "spe" },
    solid: { up: "spd", down: "spa" }, windy: { up: "spe", down: "spd" },
    plain: {}, ordinary: {}, even: {}, fair: {}
  };
  BE.TEMPERAMENT_IDS = Object.keys(BE.TEMPERAMENTS);

  BE.GROWTH = { fast: 0.8, medium: 1, slow: 1.25 };

  // ---- stage multipliers ---------------------------------------
  BE.stageMul = function (n) {
    n = U.clamp(n | 0, -6, 6);
    return n >= 0 ? (2 + n) / 2 : 2 / (2 - n);
  };
  BE.accMul = function (n) {
    n = U.clamp(n | 0, -6, 6);
    return n >= 0 ? (3 + n) / 3 : 3 / (3 - n);
  };

  // ---- level curve ---------------------------------------------
  BE.expForLevel = function (level, growth) {
    const k = BE.GROWTH[growth] || 1;
    return Math.floor(k * level * level * level);
  };
  BE.levelFromExp = function (exp, growth) {
    let l = 1;
    while (l < 100 && exp >= BE.expForLevel(l + 1, growth)) l++;
    return l;
  };

  // ---- stat computation ----------------------------------------
  BE.temperament = function (id) {
    const table = (NS.Data && NS.Data.temperaments) || BE.TEMPERAMENTS;
    return table[id] || BE.TEMPERAMENTS[id] || {};
  };
  BE.temperamentMul = function (id, stat) {
    const t = BE.temperament(id);
    if (t.up === stat) return 1.1;
    if (t.down === stat) return 0.9;
    return 1;
  };
  BE.computeStats = function (base, level, ivs, temperament) {
    ivs = ivs || {};
    const out = {};
    const hpIv = ivs.hp === undefined ? 8 : ivs.hp;
    out.hp = Math.floor((2 * (base.hp || 1) + hpIv) * level / 100) + level + 10;
    const keys = ["atk", "def", "spa", "spd", "spe"];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const iv = ivs[k] === undefined ? 8 : ivs[k];
      const raw = Math.floor((2 * (base[k] || 1) + iv) * level / 100) + 5;
      out[k] = Math.floor(raw * BE.temperamentMul(temperament, k));
    }
    return out;
  };

  // ---- hook plumbing -------------------------------------------
  // Ability and gear hooks share one vocabulary. Every hook is
  // called as fn(b, mon, ctx) and may mutate ctx or return a value.
  BE.abilityOf = function (b, mon) {
    if (!mon || mon.hp <= 0) return null;
    const v = b.vol(mon);
    if (v && v.abilityOff > 0) return null;
    return mon.ability || null;
  };
  BE.abilityImpl = function (id) { return id ? BE.abilities[id] : null; };
  BE.gearOf = function (b, mon) {
    if (!mon || mon.hp <= 0) return null;
    const v = b.vol(mon);
    if (v && v.gearOff) return null;
    return mon.gear || null;
  };
  BE.gearImpl = function (id) { return id ? BE.gear[id] : null; };

  // Fire a hook on a monster's ability then its gear. Returns the
  // last non-undefined return value.
  BE.hook = function (b, mon, name, ctx) {
    if (!mon) return undefined;
    let out;
    const aid = BE.abilityOf(b, mon);
    const a = BE.abilityImpl(aid);
    if (a && a[name]) { const r = a[name](b, mon, ctx); if (r !== undefined) out = r; }
    const gid = BE.gearOf(b, mon);
    const g = BE.gearImpl(gid);
    if (g && g[name]) { const r = g[name](b, mon, ctx); if (r !== undefined) out = r; }
    return out;
  };
  // Multiplicative hook: starts at 1, every implementer multiplies.
  BE.hookMul = function (b, mon, name, ctx) {
    let m = 1;
    if (!mon) return m;
    const a = BE.abilityImpl(BE.abilityOf(b, mon));
    if (a && a[name]) { const r = a[name](b, mon, ctx); if (typeof r === "number") m *= r; }
    const g = BE.gearImpl(BE.gearOf(b, mon));
    if (g && g[name]) { const r = g[name](b, mon, ctx); if (typeof r === "number") m *= r; }
    return m;
  };
  // Veto hook: any implementer returning false blocks.
  BE.hookAllows = function (b, mon, name, ctx) {
    const a = BE.abilityImpl(BE.abilityOf(b, mon));
    if (a && a[name] && a[name](b, mon, ctx) === false) return false;
    const g = BE.gearImpl(BE.gearOf(b, mon));
    if (g && g[name] && g[name](b, mon, ctx) === false) return false;
    return true;
  };

  // Fainted monsters keep no hooks except the ones that fire *because*
  // they fainted (Kernel Panic). This path deliberately ignores the
  // usual hp>0 guard.
  BE.hookFainted = function (b, mon, name, ctx) {
    if (!mon) return;
    const v = b.vol(mon);
    if (!v || v.abilityOff <= 0) {
      const a = BE.abilityImpl(mon.ability);
      if (a && a[name]) a[name](b, mon, ctx);
    }
    const g = BE.gearImpl(mon.gear);
    if (g && g[name]) g[name](b, mon, ctx);
  };

  BE.abilityName = function (id) {
    const d = NS.Data && NS.Data.abilities && NS.Data.abilities[id];
    if (d && d.name) return d.name;
    const local = BE.abilities[id];
    if (local && local.name) return local.name;
    return id ? U.capitalise(String(id).replace(/_/g, " ")) : "";
  };
  BE.itemName = function (id) {
    const d = NS.Data && NS.Data.items && NS.Data.items[id];
    if (d && d.name) return d.name;
    return id ? U.capitalise(String(id).replace(/_/g, " ")) : "";
  };

  // ---- weather / terrain ---------------------------------------
  BE.weatherIgnored = function (b, mon) {
    // Umbrella ignores Rain/Fog on its holder.
    return BE.gearOf(b, mon) === "umbrella";
  };
  BE.weatherPowerMul = function (b, weather, type, atk, def) {
    if (!weather) return 1;
    if (weather === "rain") {
      if (type === "water") return 1.5;
      if (type === "fire") return 0.5;
    } else if (weather === "sun") {
      if (type === "fire") return 1.5;
      if (type === "water") return 0.5;
    } else if (weather === "fog") {
      if (type === "ghost" || type === "cyber") return 1.2;
    } else if (weather === "wind") {
      if (type === "flying") return 1.3;
    } else if (weather === "snow") {
      // NEW (battle snow, seeded from overworld winter weather):
      // scoured stone hits harder, everything wet is dampened.
      if (type === "rock") return 1.2;
      if (type === "water" || type === "fire") return 0.9;
    }
    return 1;
  };
  BE.grounded = function (b, mon) {
    const t = b.typesOf(mon);
    if (t.indexOf("flying") >= 0) return false;
    const v = b.vol(mon);
    if (v && v.semiInvuln === "air") return false;
    return true;
  };
  BE.terrainPowerMul = function (b, terrain, type, atk, def) {
    if (!terrain) return 1;
    if (terrain === "grass" && type === "grass") return 1.3;
    if (terrain === "wet") {
      if (type === "electric" && BE.grounded(b, def)) return 1.3;
      if (type === "fire") return 0.8;
    }
    if (terrain === "salt") {
      if (type === "rock") return 1.3;
      if (type === "water") return 0.9;
    }
    if (terrain === "static" && type === "electric") return 1.3;
    if (terrain === "silk" && type === "bug") return 1.3;
    return 1;
  };

  // ---- effective stats -----------------------------------------
  BE.statOf = function (b, mon, stat, o) {
    o = o || {};
    const v = b.vol(mon);
    let stage = (v && v.stages[stat]) || 0;
    if (o.ignoreNegative && stage < 0) stage = 0;
    if (o.ignorePositive && stage > 0) stage = 0;
    let val = (mon.stats && mon.stats[stat]) || 1;
    val *= BE.stageMul(stage);
    val *= BE.hookMul(b, mon, "onModifyStat", { stat: stat });
    if (stat === "spe") {
      if (mon.status === "par" && BE.abilityOf(b, mon) !== "iron_will") val *= 0.5;
      if (v && v.deferred) val *= 0.5;
    }
    return val;
  };
  BE.effectiveSpeed = function (b, mon) { return BE.statOf(b, mon, "spe"); };

  // ---- accuracy ------------------------------------------------
  BE.accuracyCheck = function (b, atk, def, move, ctx) {
    ctx = ctx || {};
    if (ctx.neverMiss || move.acc === null || move.acc === undefined || move.acc >= 999) return true;
    if (move.overdriveOnly) return true;
    const va = b.vol(atk), vd = b.vol(def);
    if (vd && vd.semiInvuln && !ctx.hitsSemiInvuln) return false;
    let acc = move.acc;
    let accStage = va ? va.stages.acc : 0;
    let evaStage = vd ? vd.stages.eva : 0;
    const fog = b.field.weather === "fog" && !BE.weatherIgnored(b, def);
    if (fog) evaStage = 0; // Fog blinds evasion tricks for everyone
    if (b.perk("perk_adjudicate_zero_trust") && b.isPlayerSide(atk) && evaStage > 0) evaStage = 0;
    let p = acc / 100 * BE.accMul(U.clamp(accStage - evaStage, -6, 6));
    if (b.field.weather === "fog" && !BE.weatherIgnored(b, atk)) {
      const torch = BE.gearOf(b, atk) === "torch";
      const umbrellaSquad = b.perk("perk_escalate_umbrella_discipline") && b.isPlayerSide(atk);
      if (!torch && !umbrellaSquad) p *= 0.75;
    }
    p *= BE.hookMul(b, atk, "onModifyAcc", { move: move, target: def });
    p *= BE.hookMul(b, def, "onModifyFoeAcc", { move: move, user: atk });
    ctx.hitChance = U.clamp(p, 0, 1);
    return b.rng() < ctx.hitChance;
  };

  // ---- crits ---------------------------------------------------
  BE.critStage = function (b, atk, move, ctx) {
    let s = move.crit || 0;
    if (ctx && ctx.critBonus) s += ctx.critBonus;
    if (BE.gearOf(b, atk) === "lucky_coin") s += 1;
    if (b.isPlayerSide(atk) && b.perk("perk_triage_focused")) s += 1;
    const v = b.vol(atk);
    if (v && v.critBoost) s += v.critBoost;
    return U.clamp(s, 0, 3);
  };
  BE.rollCrit = function (b, atk, move, ctx) {
    if (ctx && ctx.critOnly) return true;
    if (move.cat === "status") return false;
    const s = BE.critStage(b, atk, move, ctx);
    return b.rng() < BE.CRIT_ODDS[s];
  };

  // ---- the damage formula (SYSTEMS-SPEC §14) --------------------
  // o = {power, crit, category, roll (0..1 forced), fixedRoll}
  BE.damage = function (b, atk, def, move, o) {
    o = o || {};
    const cat = o.category || move.cat;
    const types = b.typesOf(def);
    let eff = b.typeMult ? b.typeMult(move.type, types) : (NS.Data && NS.Data.typeMultiplier ? NS.Data.typeMultiplier(move.type, types) : 1);
    if (o.typeless) eff = 1;
    const out = { dmg: 0, eff: eff, crit: !!o.crit, immune: false };
    if (eff === 0) { out.immune = true; return out; }
    if (b.isPlayerSide(atk) && b.perk("perk_triage_exploit") && eff > 1) { eff *= 1.1; out.eff = eff; }

    const L = atk.level || 1;
    let P = o.power !== undefined ? o.power : (move.power || 0);
    if (P <= 0) return out;
    P *= BE.hookMul(b, atk, "onModifyPower", { move: move, target: def, category: cat });
    P *= BE.hookMul(b, def, "onModifyIncomingPower", { move: move, user: atk, category: cat });

    const aStat = cat === "phys" ? "atk" : "spa";
    const dStat = cat === "phys" ? "def" : "spd";
    const zeroTrust = b.isPlayerSide(atk) && b.perk("perk_adjudicate_zero_trust");
    const killChain = b.vol(atk).killChainTurn === b.turn;
    const A = BE.statOf(b, atk, aStat, { ignoreNegative: out.crit });
    const D = BE.statOf(b, def, dStat, { ignorePositive: out.crit || zeroTrust || killChain });

    let base = Math.floor(Math.floor(Math.floor(2 * L / 5 + 2) * P * A / Math.max(1, D)) / 50) + 2;
    let dmg = base;

    dmg *= BE.weatherPowerMul(b, BE.weatherFor(b, atk, def), move.type, atk, def);
    dmg *= BE.terrainPowerMul(b, b.field.terrain, move.type, atk, def);
    if (out.crit) dmg *= (b.isPlayerSide(atk) && b.perk("perk_adjudicate_sniper")) ? 2 : 1.5;

    const roll = o.roll !== undefined ? o.roll : (85 + Math.floor(b.rng() * 16)) / 100;
    dmg *= roll;

    const atkTypes = b.typesOf(atk);
    if (atkTypes.indexOf(move.type) >= 0) {
      dmg *= 1.5;
      if (BE.gearOf(b, atk) === "silk_scarf") dmg *= 1.1;
    }
    dmg *= eff;

    if (cat === "phys" && atk.status === "brn" && BE.abilityOf(b, atk) !== "brine_body") {
      dmg *= (BE.gearOf(b, atk) === "silk_wrap") ? 0.75 : 0.5;
    }
    const side = b.sideOf(def);
    if (side.screens && side.screens[cat] > 0 && !out.crit) dmg *= 0.5;

    dmg *= BE.hookMul(b, atk, "onModifyDamageDealt", { move: move, target: def, eff: eff, crit: out.crit, category: cat });
    dmg *= BE.hookMul(b, def, "onModifyDamageTaken", { move: move, user: atk, eff: eff, crit: out.crit, category: cat });

    if (b.isPlayerSide(atk)) {
      if (b.turn === 1 && b.perk("perk_triage_first_strike")) dmg *= 1.1;
      if (b.kind === "boss" && b.perk("perk_triage_big_game")) dmg *= 1.1;
    } else {
      dmg *= BE.DIFF[b.difficulty] ? BE.DIFF[b.difficulty].enemyDamage : 1;
    }
    if (o.mult) dmg *= o.mult;

    out.dmg = Math.max(1, Math.floor(dmg));
    return out;
  };

  // Which weather applies to this exchange (Umbrella ignores it).
  BE.weatherFor = function (b, atk, def) {
    const w = b.field.weather;
    if (!w) return null;
    if (BE.weatherIgnored(b, atk) && (w === "rain" || w === "fog")) return null;
    return w;
  };

  BE.DIFF = {
    story: { enemyLevel: 0.9, aiShift: -1, agentCd: -1, xpShare: 1, bagLimit: Infinity, capture: 1.3, bossOd: 0, enemyDamage: 0.9 },
    normal: { enemyLevel: 1, aiShift: 0, agentCd: 0, xpShare: 0.5, bagLimit: Infinity, capture: 1, bossOd: 25, enemyDamage: 1 },
    hard: { enemyLevel: 1.1, aiShift: 1, agentCd: 2, xpShare: 0.5, bagLimit: 3, capture: 1, bossOd: 50, enemyDamage: 1.1 },
    nightmare: { enemyLevel: 1.2, aiShift: 1, agentCd: 3, xpShare: 0.25, bagLimit: 0, capture: 0.85, bossOd: 75, enemyDamage: 1.2 }
  };

  // ---- damage / heal application --------------------------------
  BE.dealDamage = function (b, mon, amount, o) {
    o = o || {};
    if (mon.hp <= 0) return 0;
    amount = Math.max(o.min === undefined ? 1 : o.min, Math.floor(amount));
    const v = b.vol(mon);
    const max = b.maxHp(mon);
    let target = mon.hp - amount;

    if (target <= 0 && !o.trueDamage) {
      // Endure / Back from the Brink / Focus Band, in that order.
      if (v.endure) {
        target = 1;
        b.msg(b.name(mon) + " braced and endured the hit.");
      } else if (BE.abilityOf(b, mon) === "back_from_the_brink" && v.brinkLeft > 0 && mon.hp >= max / 2) {
        v.brinkLeft--;
        target = 1;
        b.msg(b.name(mon) + " came back from the brink!");
        b.emit("anim", { name: "brink", side: b.sideIndexOf(mon), uid: mon.uid });
        if (b.catTrust("bigboy") >= 3 && mon.species === "bigboy") {
          const back = Math.floor(max * 0.25);
          mon.hp = 1;
          BE.heal(b, mon, back, { quiet: true });
          b.msg(b.name(mon) + " shook it off and sat down heavily.");
          target = mon.hp;
        }
      } else if (BE.gearOf(b, mon) === "focus_band" && b.rng() < 0.1) {
        target = 1;
        b.msg(b.name(mon) + " hung on with its Focus Band!");
      }
    }
    const from = mon.hp;
    mon.hp = U.clamp(target, 0, max);
    const dealt = from - mon.hp;
    if (dealt !== 0) b.emit("hp", { side: b.sideIndexOf(mon), uid: mon.uid, from: from, to: mon.hp, max: max, delta: -dealt, cause: o.cause || "damage" });
    if (mon.hp <= 0) b.faint(mon, o.source, o.move);
    return dealt;
  };
  BE.heal = function (b, mon, amount, o) {
    o = o || {};
    if (mon.hp <= 0 && !o.revive) return 0;
    const max = b.maxHp(mon);
    if (mon.hp >= max) { if (!o.quiet) b.msg(b.name(mon) + " is already in fine fettle."); return 0; }
    const from = mon.hp;
    mon.hp = U.clamp(mon.hp + Math.max(1, Math.floor(amount)), 0, max);
    const gained = mon.hp - from;
    b.emit("hp", { side: b.sideIndexOf(mon), uid: mon.uid, from: from, to: mon.hp, max: max, delta: gained, cause: o.cause || "heal" });
    if (!o.quiet) b.msg(b.name(mon) + " recovered health.");
    return gained;
  };

  // ---- status --------------------------------------------------
  BE.statusImmune = function (b, mon, st) {
    const types = b.typesOf(mon);
    if ((st === "psn" || st === "tox") && (types.indexOf("poison") >= 0)) return "type";
    if (st === "brn" && types.indexOf("fire") >= 0) return "type";
    if (st === "par" && types.indexOf("electric") >= 0) return "type";
    if (st === "frz" && types.indexOf("fire") >= 0) return "type";
    const ab = BE.abilityOf(b, mon);
    if (ab === "brine_body" && st === "brn") return "ability";
    if (ab === "sandbox" && (st === "psn" || st === "tox")) return "ability";
    if (ab === "cold_storage" && (st === "frz" || st === "slp") && mon.hp > b.maxHp(mon) / 2) return "ability";
    if (st === "slp" && b.field.terrain === "static") return "terrain";
    return null;
  };

  BE.applyStatus = function (b, mon, st, source, o) {
    o = o || {};
    if (!mon || mon.hp <= 0) return false;
    const v = b.vol(mon);
    if (st === "cnf") {
      if (v.conf > 0) { if (!o.quiet) b.msg(b.name(mon) + " is already thoroughly confused."); return false; }
      if (source && source !== mon && !BE.hookAllows(b, mon, "onTryStatus", { status: st, source: source })) return false;
      v.conf = U.randInt(2, 5, b.rng);
      if (source && source !== mon && b.isPlayerSide(mon) && b.perk("perk_escalate_containment")) v.conf = Math.max(1, v.conf - 1);
      b.emit("status", { side: b.sideIndexOf(mon), uid: mon.uid, status: "cnf", on: true });
      b.msg(b.name(mon) + " became confused!");
      BE.afterStatus(b, mon, st, source);
      return true;
    }
    if (mon.status) { if (!o.quiet) b.msg(b.name(mon) + " already has a condition."); return false; }
    const imm = BE.statusImmune(b, mon, st);
    if (imm) {
      if (!o.quiet) {
        if (imm === "ability") b.msg(BE.abilityName(BE.abilityOf(b, mon)) + " kept " + b.name(mon) + " clear.");
        else if (imm === "terrain") b.msg("The Static terrain will not let anything sleep.");
        else b.msg("It had no effect on " + b.name(mon) + ".");
      }
      return false;
    }
    if (source && source !== mon && !BE.hookAllows(b, mon, "onTryStatus", { status: st, source: source })) return false;

    mon.status = st;
    mon.statusTurns = 0;
    if (st === "slp") {
      mon.statusTurns = U.randInt(1, 3, b.rng);
      if (source && source !== mon && b.isPlayerSide(mon) && b.perk("perk_escalate_containment")) mon.statusTurns = Math.max(1, mon.statusTurns - 1);
    }
    if (st === "tox") mon.statusTurns = 1;
    b.emit("status", { side: b.sideIndexOf(mon), uid: mon.uid, status: st, on: true });
    b.msg(b.name(mon) + " was " + BE.STATUS_NAME[st] + "!");
    b.emit("anim", { name: "status", side: b.sideIndexOf(mon), uid: mon.uid, status: st });
    BE.afterStatus(b, mon, st, source);
    return true;
  };

  BE.afterStatus = function (b, mon, st, source) {
    BE.hook(b, mon, "onStatusApplied", { status: st, source: source });
    // Perry Flask cures the status the instant it is applied.
    if (BE.gearOf(b, mon) === "perry_flask") {
      BE.cureStatus(b, mon, true);
      b.msg("The Perry Flask fizzed and " + b.name(mon) + " shrugged it off.");
      BE.consumeGear(b, mon);
    } else if (st === "cnf" && BE.gearOf(b, mon) === "toffee") {
      b.vol(mon).conf = 0;
      b.emit("status", { side: b.sideIndexOf(mon), uid: mon.uid, status: "cnf", on: false });
      BE.heal(b, mon, Math.floor(b.maxHp(mon) / 8), { quiet: true });
      b.msg("Everton Toffee sorted " + b.name(mon) + " right out.");
      BE.consumeGear(b, mon);
    }
  };

  BE.cureStatus = function (b, mon, alsoConfusion) {
    let did = false;
    if (mon.status) {
      b.emit("status", { side: b.sideIndexOf(mon), uid: mon.uid, status: mon.status, on: false });
      mon.status = null; mon.statusTurns = 0; did = true;
    }
    if (alsoConfusion) {
      const v = b.vol(mon);
      if (v.conf > 0) { v.conf = 0; b.emit("status", { side: b.sideIndexOf(mon), uid: mon.uid, status: "cnf", on: false }); did = true; }
    }
    return did;
  };

  BE.consumeGear = function (b, mon) {
    const id = mon.gear;
    if (!id) return;
    mon.gear = null;
    b.emit("item", { side: b.sideIndexOf(mon), uid: mon.uid, item: id, consumed: true });
  };

  // ---- stat stages ---------------------------------------------
  BE.addStage = function (b, mon, stat, delta, source, o) {
    o = o || {};
    if (!mon || mon.hp <= 0 || !delta) return 0;
    const v = b.vol(mon);
    const foeSourced = source && source !== mon && b.sideIndexOf(source) !== b.sideIndexOf(mon);
    if (delta < 0 && foeSourced) {
      if (BE.abilityOf(b, mon) === "iron_will") {
        b.msg(BE.abilityName("iron_will") + " means " + b.name(mon) + " is not for turning.");
        return 0;
      }
      if (!BE.hookAllows(b, mon, "onTryStage", { stat: stat, delta: delta, source: source })) return 0;
      if (b.isPlayerSide(mon) && b.perk("perk_escalate_steady")) delta = Math.ceil(delta / 2);
    }
    const before = v.stages[stat] || 0;
    const after = U.clamp(before + delta, -6, 6);
    if (after === before) {
      if (!o.quiet) b.msg(b.name(mon) + "'s " + BE.STAT_NAME[stat] + (delta > 0 ? " will not go any higher." : " will not go any lower."));
      return 0;
    }
    v.stages[stat] = after;
    const applied = after - before;
    b.emit("stage", { side: b.sideIndexOf(mon), uid: mon.uid, stat: stat, delta: applied, value: after });
    if (!o.quiet) {
      const words = applied >= 2 ? " rose sharply!" : applied === 1 ? " rose!" : applied === -1 ? " fell." : " fell sharply.";
      b.msg(b.name(mon) + "'s " + BE.STAT_NAME[stat] + words);
    }
    BE.hook(b, mon, "onStageChange", { stat: stat, delta: applied, source: source });
    return applied;
  };
  BE.clearStages = function (b, mon, only) {
    const v = b.vol(mon);
    let did = false;
    for (let i = 0; i < BE.STAGE_STATS.length; i++) {
      const k = BE.STAGE_STATS[i];
      if (only === "negative" && v.stages[k] >= 0) continue;
      if (only === "positive" && v.stages[k] <= 0) continue;
      if (v.stages[k] !== 0) { v.stages[k] = 0; did = true; }
    }
    if (did) b.emit("stage", { side: b.sideIndexOf(mon), uid: mon.uid, reset: true });
    return did;
  };
  BE.highestAttackStat = function (b, mon) {
    return BE.statOf(b, mon, "atk") >= BE.statOf(b, mon, "spa") ? "atk" : "spa";
  };

  // ---- overdrive -----------------------------------------------
  BE.OD = { hitTaken: 8, superTaken: 12, dealt: 6, allyFaint: 15, ko: 20 };
  BE.gainOverdrive = function (b, mon, amount, reason) {
    if (!mon || mon.hp <= 0 || !amount) return;
    if (!b.overdriveActive(mon)) return;
    if (BE.gearOf(b, mon) === "kevlar_waistcoat") return;
    if (b.isPlayerSide(mon) && b.perk("perk_triage_overclocker")) amount *= 1.25;
    const before = mon.overdrive || 0;
    mon.overdrive = U.clamp(Math.round(before + amount), 0, 100);
    if (mon.overdrive !== before) {
      b.emit("overdrive", { side: b.sideIndexOf(mon), uid: mon.uid, value: mon.overdrive, from: before, reason: reason || "" });
      if (before < 100 && mon.overdrive >= 100) {
        b.emit("anim", { name: "overdrive_ready", side: b.sideIndexOf(mon), uid: mon.uid });
        b.msg(b.name(mon) + "'s OVERDRIVE is ready!");
      }
    }
  };

  // =============================================================
  // THE 30 ABILITIES (ROSTER §3 / SYSTEMS-SPEC §2)
  // =============================================================
  BE.abilities = {
    back_from_the_brink: {
      name: "Back from the Brink",
      onEnter: function (b, mon) {
        const v = b.vol(mon);
        if (v.brinkLeft === undefined) v.brinkLeft = (b.isPlayerSide(mon) && b.perk("perk_escalate_fail_safe_protocol")) ? 2 : 1;
      }
    },
    slipstream: {
      name: "Slipstream",
      onEnter: function (b, mon) {
        const n = (b.isPlayerSide(mon) && b.perk("perk_escalate_quiet_cat")) ? 2 : 1;
        BE.addStage(b, mon, "spe", n, mon);
      }
    },
    silk_weave: {
      name: "Silk Weave",
      onHitTaken: function (b, mon, c) {
        if (c.move && c.move.flags && c.move.flags.contact && c.user && b.rng() < 0.3) {
          BE.addStage(b, c.user, "spe", -1, mon);
        }
      }
    },
    brine_body: {
      name: "Brine Body",
      onEndTurn: function (b, mon) {
        if (b.field.weather === "rain" && !BE.weatherIgnored(b, mon)) BE.heal(b, mon, Math.floor(b.maxHp(mon) / 16), { quiet: true, cause: "ability" });
      }
    },
    salt_crust: {
      name: "Salt Crust",
      onModifyDamageTaken: function (b, mon, c) {
        if (b.field.terrain === "wet") return 1;
        if (c.move && (c.move.type === "rock" || c.move.type === "ground")) return 0.75;
        return 1;
      }
    },
    firebox: {
      name: "Firebox",
      onModifyDamageDealt: function (b, mon, c) {
        if (c.move && c.move.type === "fire" && mon.hp <= b.maxHp(mon) / 3) return 1.5;
        return 1;
      }
    },
    overclock: {
      name: "Overclock",
      onModifyDamageDealt: function (b, mon, c) { return (c.move && c.move.type === "cyber") ? 1.3 : 1; },
      onAfterHit: function (b, mon, c) {
        if (c.move && c.move.type === "cyber" && c.damage > 0) {
          b.msg(b.name(mon) + " is running hot.");
          BE.dealDamage(b, mon, Math.floor(b.maxHp(mon) / 16), { cause: "ability" });
        }
      }
    },
    sandbox: {
      name: "Sandbox",
      onModifyDamageTaken: function (b, mon, c) { return (c.move && c.move.type === "poison") ? 0.5 : 1; }
    },
    rootkit: {
      name: "Rootkit",
      onEnter: function (b, mon) {
        const foes = b.foesOf(mon);
        for (let i = 0; i < foes.length; i++) {
          const v = b.vol(foes[i]);
          v.abilityOff = 3;
          b.msg(b.name(foes[i]) + "'s ability was suppressed by Rootkit.");
        }
      }
    },
    honeypot: {
      name: "Honeypot",
      onTargetedByStatus: function (b, mon, c) {
        if (!c.user || c.user === mon) return true;
        const stat = BE.highestAttackStat(b, c.user);
        b.msg(b.name(mon) + " was a honeypot — the move went nowhere.");
        BE.addStage(b, c.user, stat, -1, mon);
        return false;
      }
    },
    proxy_fog: { name: "Proxy Fog", onEnter: function (b, mon) { b.setWeather("fog", 4, mon); } },
    rain_caller: { name: "Rain Caller", onEnter: function (b, mon) { b.setWeather("rain", 5, mon); } },
    ridge_wind: { name: "Ridge Wind", onEnter: function (b, mon) { b.setWeather("wind", 4, mon); } },
    damp_squib: {
      name: "Damp Squib",
      onModifyDamageTaken: function (b, mon, c) {
        if (b.field.weather === "rain" && c.move && c.move.type === "fire") return 0.5;
        return 1;
      }
    },
    thick_fleece: {
      name: "Thick Fleece",
      onModifyDamageTaken: function (b, mon, c) { return c.category === "spec" ? 0.9 : 1; },
      onChip: function (b, mon, c) { if (c.source === "weather") return false; }
    },
    iron_will: { name: "Iron Will", onTryFlinch: function () { return false; } },
    nightshift: {
      name: "Nightshift",
      onModifyPriority: function (b, mon, c) {
        if (c.move && c.move.cat === "status" && b.isNight()) return 1;
        return 0;
      }
    },
    cheshire_grin: {
      name: "Cheshire Grin",
      onAfterHit: function (b, mon, c) {
        if (c.damage > 0 && c.target && c.target.hp > 0 && b.rng() < 0.25) {
          b.msg("The grin lingered.");
          BE.applyStatus(b, c.target, "cnf", mon, { quiet: true });
        }
      }
    },
    deep_roots: {
      name: "Deep Roots",
      onTryForceSwitch: function () { return false; },
      onEndTurn: function (b, mon) {
        if (b.field.terrain === "grass") BE.heal(b, mon, Math.floor(b.maxHp(mon) / 8), { quiet: true, cause: "ability" });
      }
    },
    static_charge: {
      name: "Static Charge",
      onHitTaken: function (b, mon, c) {
        if (c.move && c.move.flags && c.move.flags.contact && c.user && b.rng() < 0.3) BE.applyStatus(b, c.user, "par", mon, {});
      }
    },
    signal_jammer: {
      name: "Signal Jammer",
      onFoeCharge: function (b, mon, c) { return b.rng() < 0.3 ? false : true; }
    },
    scavenger: {
      name: "Scavenger",
      onKO: function (b, mon) { BE.heal(b, mon, Math.floor(b.maxHp(mon) / 4), { cause: "ability" }); }
    },
    wetlander: {
      name: "Wetlander",
      onModifyStat: function (b, mon, c) { return (c.stat === "spe" && b.field.weather === "rain") ? 1.5 : 1; }
    },
    sun_trap: {
      name: "Sun Trap",
      onModifyStat: function (b, mon, c) { return (c.stat === "spa" && b.field.weather === "sun") ? 1.5 : 1; }
    },
    cold_storage: { name: "Cold Storage" },
    payload: {
      name: "Payload",
      onEnter: function (b, mon) { b.vol(mon).payloadSpent = false; },
      // Pure: the damage hook only reads. onAfterHit spends the charge so
      // the AI can preview damage without burning it.
      onModifyDamageDealt: function (b, mon, c) {
        return (!b.vol(mon).payloadSpent && c.move && c.move.power > 0) ? 1.5 : 1;
      },
      onAfterHit: function (b, mon, c) {
        if (c.move && c.move.power > 0 && !c.preview) b.vol(mon).payloadSpent = true;
      }
    },
    fail_safe: {
      name: "Fail-Safe",
      onHpChanged: function (b, mon) {
        const v = b.vol(mon);
        if (!v.failSafeUsed && mon.hp > 0 && mon.hp < b.maxHp(mon) / 4) {
          v.failSafeUsed = true;
          b.msg(b.name(mon) + "'s Fail-Safe kicked in.");
          BE.addStage(b, mon, "def", 2, mon);
          BE.addStage(b, mon, "spd", 2, mon);
        }
      }
    },
    loud_bell: {
      name: "Loud Bell",
      onModifyDamageDealt: function (b, mon, c) { return (c.move && c.move.flags && c.move.flags.sound) ? 1.3 : 1; },
      onTryHit: function (b, mon, c) {
        if (c.move && c.move.flags && c.move.flags.sound) { b.msg(b.name(mon) + " is deaf to that sort of thing."); return false; }
        return true;
      }
    },
    stonemason: {
      name: "Stonemason",
      onModifyDamageDealt: function (b, mon, c) { return (c.move && c.move.type === "rock") ? 1.2 : 1; },
      onModifyAcc: function (b, mon, c) {
        if (c.move && c.move.type === "rock" && b.field.weather === "wind") return 99;
        return 1;
      }
    },
    kernel_panic: {
      name: "Kernel Panic",
      onFaint: function (b, mon, c) {
        if (c && c.killer && c.move && c.move.id) {
          const slot = b.moveSlot(c.killer, c.move.id);
          if (slot && slot.pp > 0) {
            slot.pp = 0;
            b.emit("pp", { side: b.sideIndexOf(c.killer), uid: c.killer.uid, move: c.move.id, pp: 0 });
            b.msg("Kernel panic — " + b.plainName(c.killer) + "'s " + c.move.name + " lost all its PP.");
          }
        }
      }
    }
  };

  // =============================================================
  // GEAR (SYSTEMS-SPEC §3 / ROSTER §4.3–4.4)
  // =============================================================
  function typeBoost(type, mult) {
    return { onModifyDamageDealt: function (b, mon, c) { return (c.move && c.move.type === type) ? mult : 1; } };
  }
  BE.gear = {
    silk_scarf: {},                                  // handled inside BE.damage (STAB)
    brine_charm: typeBoost("water", 1.2),
    ember_coal: typeBoost("fire", 1.2),
    copper_coil: typeBoost("electric", 1.2),
    cipher_lens: typeBoost("psychic", 1.2),
    patch_cable: typeBoost("cyber", 1.2),
    firebox_charm: typeBoost("fire", 1.1),
    beacon_ember: { onModifyDamageDealt: function (b, mon, c) { return (c.move && c.move.type === "fire" && b.isNight()) ? 1.2 : 1; } },
    hide_plate: { onModifyDamageTaken: function (b, mon, c) { return (c.move && c.move.type === "rock") ? 0.75 : 1; } },
    silk_wrap: {},                                   // handled in burn chip + burn damage cut
    walkers_boots: {
      onModifyStat: function (b, mon, c) { return c.stat === "spe" ? 1.5 : 1; },
      onEnter: function (b, mon) { b.vol(mon).choiceLock = null; },
      onAfterMoveChosen: function (b, mon, c) { const v = b.vol(mon); if (!v.choiceLock) v.choiceLock = c.moveId; }
    },
    heavy_anvil: { onModifyStat: function (b, mon, c) { return c.stat === "atk" ? 1.3 : c.stat === "spe" ? 0.5 : 1; } },
    kevlar_waistcoat: { onModifyDamageTaken: function () { return 0.9; } },
    rail_pass: {},                                   // switch priority, read by the engine
    lucky_coin: {},                                  // crit stage, read by BE.critStage
    focus_band: {},                                  // survival roll, read by BE.dealDamage
    toxic_sachet: {
      onHitTaken: function (b, mon, c) {
        if (c.move && c.move.flags && c.move.flags.contact && c.user && b.rng() < 0.3) BE.applyStatus(b, c.user, "psn", mon, {});
      }
    },
    rusty_nail: {
      onHitTaken: function (b, mon, c) {
        if (c.move && c.move.flags && c.move.flags.contact && c.user && c.user.hp > 0) {
          b.msg(b.name(c.user) + " caught itself on the Rusty Nail.");
          BE.dealDamage(b, c.user, Math.floor(b.maxHp(c.user) / 8), { cause: "gear" });
        }
      }
    },
    umbrella: {},                                    // read by BE.weatherIgnored
    weathervane: {},                                 // read by b.setWeather
    ledger: {},                                      // XP, read by the engine
    cat_bell: {
      onEnter: function (b, mon) { if (b.kind === "wild" && b.isPlayerSide(mon)) BE.addStage(b, mon, "eva", 1, mon); }
    },
    warm_blanket: {
      onEndTurn: function (b, mon) {
        const v = b.vol(mon);
        if (!v.blanketUsed && (mon.status === "frz" || mon.status === "slp")) {
          v.blanketUsed = true;
          BE.cureStatus(b, mon, false);
          b.msg("The Warm Blanket brought " + b.name(mon) + " round.");
        }
      }
    },
    torch: {},                                       // read by BE.accuracyCheck
    damson: {
      onHpChanged: function (b, mon) {
        if (mon.hp > 0 && mon.hp <= b.maxHp(mon) / 2) {
          BE.heal(b, mon, Math.floor(b.maxHp(mon) / 4), { quiet: true });
          b.msg(b.name(mon) + " ate its Damson.");
          BE.consumeGear(b, mon);
        }
      }
    },
    perry_flask: {},                                 // handled in BE.afterStatus
    elm_sap: {
      onHpChanged: function (b, mon) {
        if (mon.hp > 0 && mon.hp <= b.maxHp(mon) / 4) {
          const stat = BE.highestAttackStat(b, mon);
          b.msg(b.name(mon) + " took a swig of Elm Sap.");
          BE.addStage(b, mon, stat, 1, mon);
          BE.consumeGear(b, mon);
        }
      }
    },
    salt_lick: {
      onPpEmpty: function (b, mon, c) {
        if (c.slot) {
          c.slot.pp = Math.min(c.slot.ppMax, 10);
          b.emit("pp", { side: b.sideIndexOf(mon), uid: mon.uid, move: c.slot.id, pp: c.slot.pp });
          b.msg(b.name(mon) + " licked the Salt Lick and found 10 more PP.");
          BE.consumeGear(b, mon);
        }
      }
    },
    toffee: {}                                       // handled in BE.afterStatus
  };
  // The eight leaders' Anchor items: their type ×1.2 plus immunity to
  // the badge's house-rule weather/terrain (SYSTEMS-SPEC §3, ROSTER §4.3).
  BE.ANCHORS = {
    anchor_packet: { type: "electric", terrain: "static" },
    anchor_cipher: { type: "psychic", weather: "fog" },
    anchor_bear: { type: "normal", terrain: null },
    anchor_kernel: { type: "fire", weather: "sun" },
    anchor_token: { type: "water", weather: "rain" },
    anchor_daemon: { type: "rock", terrain: "salt" },
    anchor_proxy: { type: "poison", weather: "fog" },
    anchor_admin: { type: "cyber", terrain: null }
  };
  Object.keys(BE.ANCHORS).forEach(function (id) {
    const a = BE.ANCHORS[id];
    BE.gear[id] = {
      onModifyDamageDealt: function (b, mon, c) { return (c.move && c.move.type === a.type) ? 1.2 : 1; },
      onChip: function (b, mon, c) { if (a.weather && c.source === "weather") return false; },
      onModifyIncomingPower: function (b, mon, c) {
        if (a.terrain && b.field.terrain === a.terrain) return 1 / Math.max(0.01, BE.terrainPowerMul(b, a.terrain, c.move ? c.move.type : "", null, mon));
        return 1;
      }
    };
  });


  // =============================================================
  // EFFECT CONDITIONS — the `when:` string (SYSTEMS-SPEC §4)
  // =============================================================
  // Any effect object may carry `when: "<expression>"`. The effect is
  // skipped entirely unless the expression is true at the moment it
  // would fire, which is how one move can carry two mutually exclusive
  // clauses (Brine Jet: make rain if it is not raining, otherwise ride
  // it) without both going off at once.
  //
  // GRAMMAR. Exactly MQ.Flags' expression syntax — the same tokenizer
  // and parser, so no new language: identifiers, dotted paths,
  // `name(args)` calls, numbers, 'quoted strings', `!`, `&&`, `||`,
  // parentheses, `+ -`, and the comparisons `== != > >= < <=`.
  // Identifiers resolve against the BATTLE first and fall through to
  // the story flag store only if nothing here claims them:
  //
  //   weather                  weather id ("rain"|"sun"|"fog"|"wind"|"snow") or "" for none
  //   weather.<kind>           true while that weather is up   ("!weather.rain")
  //   weather.none             true when the sky is clear
  //   terrain, terrain.<kind>, terrain.none      as above for terrain
  //   time.<dawn|day|dusk|night>                 the game-clock phase
  //   turn                     battle turn, 1-based            ("turn>3")
  //   kind                     'wild' | 'trainer' | 'boss' | 'arena'
  //   first                    true when the user is moving first this turn
  //   move.type, move.cat      the move being used
  //   self / user              the acting monster    ┐ each of these takes
  //   target                   the effect's subject  ├ the sub-paths below
  //   foe                      the opposing monster  ┘
  //     .hp                    current HP as a percentage 0-100
  //     .hpBelow(pct)          true when hp% is strictly below pct  ("self.hpBelow(33)")
  //     .hpAbove(pct)
  //     .level
  //     .status                true when statused at all           ("target.status")
  //     .status.<psn|tox|par|brn|slp|frz|cnf>    that specific one
  //     .type.<type>           true when the monster has that type
  //     .fainted
  //
  // A missing/empty condition is true. A malformed one is false and
  // warns once through MQ.warn — a typo must not silently buff a move.
  function whenMon(b, ctx, which) {
    if (which === "self" || which === "user") return ctx.user || null;
    if (which === "target") return ctx.target || ctx.user || null;
    // "foe" is the opponent of the acting monster, which is usually but
    // not always the effect's target (self-targeted clauses on an
    // attacking move still want to ask about the thing they just hit).
    if (ctx.target && ctx.user && ctx.target !== ctx.user) return ctx.target;
    if (b.foesOf && ctx.user) return b.foesOf(ctx.user)[0] || null;
    return null;
  }
  function whenNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function whenMonField(b, mon, rest, args) {
    if (!mon) return false;
    const dot = rest.indexOf(".");
    const head = dot >= 0 ? rest.slice(0, dot) : rest;
    const tail = dot >= 0 ? rest.slice(dot + 1) : "";
    const max = (b.maxHp ? b.maxHp(mon) : mon.stats && mon.stats.hp) || 1;
    const pct = (mon.hp / max) * 100;
    switch (head) {
      case "": return mon.hp > 0;
      case "hp": return pct;
      case "hpBelow": return pct < whenNum(args && args[0]);
      case "hpAbove": return pct > whenNum(args && args[0]);
      case "level": return mon.level || 0;
      case "fainted": return mon.hp <= 0;
      case "status": {
        const conf = b.vol ? (b.vol(mon).conf || 0) > 0 : false;
        if (!tail) return !!mon.status || conf;
        if (tail === "cnf") return conf;
        return mon.status === tail;
      }
      case "type": return (b.typesOf ? b.typesOf(mon) : mon.types || []).indexOf(tail) >= 0;
    }
    return false;
  }
  function whenIdent(b, ctx, name, args) {
    const dot = name.indexOf(".");
    const head = dot >= 0 ? name.slice(0, dot) : name;
    const rest = dot >= 0 ? name.slice(dot + 1) : "";
    switch (head) {
      case "weather": {
        const w = (b.field && b.field.weather) || "";
        if (!rest) return w;
        if (rest === "none") return !w;
        return w === rest;
      }
      case "terrain": {
        const t = (b.field && b.field.terrain) || "";
        if (!rest) return t;
        if (rest === "none") return !t;
        return t === rest;
      }
      case "time": {
        const phase = NS.Clock ? NS.Clock.phase : null;
        if (!rest) return phase || "";
        if (phase) return phase === rest;
        if (rest === "night") return b.isNight ? !!b.isNight() : false;
        if (rest === "day") return b.isNight ? !b.isNight() : true;
        return false;
      }
      case "turn": return b.turn || 0;
      case "kind": return b.kind || "";
      case "first": return !!ctx.userMovedFirst;
      case "move": {
        if (!ctx.move) return false;
        if (rest === "type") return ctx.move.type || "";
        if (rest === "cat" || rest === "category") return ctx.move.cat || "";
        if (rest === "power") return ctx.move.power || 0;
        return false;
      }
      case "self": case "user": case "target": case "foe":
        return whenMonField(b, whenMon(b, ctx, head), rest, args);
      case "true": return true;
      case "false": return false;
    }
    // Not a battle identifier — let the story flags answer.
    if (NS.Flags) {
      const r = NS.Flags.resolvers && NS.Flags.resolvers[head];
      if (r) return r(rest, args);
      const v = NS.Flags.store ? NS.Flags.store[name] : undefined;
      return v === undefined ? false : v;
    }
    return false;
  }
  function whenNorm(v) { return v === undefined || v === null ? false : v; }
  function whenEval(b, ctx, n) {
    switch (n.k) {
      case "lit": return n.v;
      case "id": return whenIdent(b, ctx, n.name, null);
      case "call": return whenIdent(b, ctx, n.name, n.args);
      case "not": return !whenEval(b, ctx, n.a);
      case "and": return whenEval(b, ctx, n.a) ? !!whenEval(b, ctx, n.b) : false;
      case "or": return whenEval(b, ctx, n.a) ? true : !!whenEval(b, ctx, n.b);
      case "sum": {
        const a = +whenNorm(whenEval(b, ctx, n.a)) || 0, c = +whenNorm(whenEval(b, ctx, n.b)) || 0;
        return n.op === "+" ? a + c : a - c;
      }
      case "cmp": {
        let a = whenNorm(whenEval(b, ctx, n.a)), c = whenNorm(whenEval(b, ctx, n.b));
        if (typeof a === "number" && typeof c !== "number") c = c === true ? 1 : c === false ? 0 : (isNaN(+c) ? c : +c);
        if (typeof c === "number" && typeof a !== "number") a = a === true ? 1 : a === false ? 0 : (isNaN(+a) ? a : +a);
        switch (n.op) {
          case "==": return a === c;
          case "!=": return a !== c;
          case ">=": return a >= c;
          case "<=": return a <= c;
          case ">": return a > c;
          case "<": return a < c;
        }
        return false;
      }
    }
    return false;
  }
  // testWhen(b, ctx, expr) → boolean. ctx is the move context
  // {user, target, move, userMovedFirst}; only `user` is really needed.
  BE.testWhen = function (b, ctx, expr) {
    if (expr === undefined || expr === null || expr === "" || expr === true) return true;
    if (expr === false) return false;
    if (typeof expr === "function") return !!expr(b, ctx || {});
    if (!NS.Flags || !NS.Flags.compile) return true;   // no parser loaded: never silently drop an effect
    let ast;
    try { ast = NS.Flags.compile(String(expr)); }
    catch (err) { NS.warn && NS.warn("battle: unparseable when \"" + expr + "\" — " + (err && err.message)); return false; }
    try { return !!whenEval(b, ctx || {}, ast); }
    catch (err) { NS.warn && NS.warn("battle: when \"" + expr + "\" blew up — " + (err && err.message)); return false; }
  };
  // Does this effect apply right now? (chance is rolled separately.)
  BE.effectApplies = function (b, ctx, e) {
    return !e || e.when === undefined ? true : BE.testWhen(b, ctx, e.when);
  };

  // =============================================================
  // MOVE EFFECT HANDLERS (SYSTEMS-SPEC §4)
  // Each handler is fn(b, ctx, e) where
  //   ctx = {user, target, move, damage, hits, missed, category, result}
  //   e   = the effect object from move.effects
  // Handlers run after the hit resolves (or immediately for status
  // moves). Aliases from ENGINE-ARCHITECTURE §4 are wired at the end.
  // =============================================================
  function whoOf(b, ctx, e) {
    return (e.who === "self" || e.target === "self") ? ctx.user : (ctx.target || ctx.user);
  }
  function fracOf(e) {
    if (e.frac !== undefined) return e.frac;
    if (e.pct !== undefined) return e.pct / 100;
    if (e.amount !== undefined && e.amount < 1) return e.amount;
    return 0.5;
  }
  BE.effects = {
    damage: function () { /* implicit — the engine deals it */ },

    status: function (b, ctx, e) {
      const t = whoOf(b, ctx, e);
      if (!t || t.hp <= 0) return;
      BE.applyStatus(b, t, e.status, ctx.user, {});
    },
    confuse: function (b, ctx, e) {
      const t = whoOf(b, ctx, e);
      if (t && t.hp > 0) BE.applyStatus(b, t, "cnf", ctx.user, {});
    },

    stage: function (b, ctx, e) {
      const t = whoOf(b, ctx, e);
      if (!t || t.hp <= 0) return;
      BE.addStage(b, t, e.stat, e.delta === undefined ? 1 : e.delta, ctx.user, {});
    },

    heal: function (b, ctx, e) {
      const t = whoOf(b, ctx, e) || ctx.user;
      if (t.hp <= 0) return;
      BE.heal(b, t, Math.floor(b.maxHp(t) * fracOf(e)));
    },

    drain: function (b, ctx, e) {
      if (!ctx.damage) return;
      const amt = Math.max(1, Math.floor(ctx.damage * fracOf(e)));
      b.msg(b.name(ctx.user) + " drained the difference.");
      BE.heal(b, ctx.user, amt, { quiet: true, cause: "drain" });
    },

    recoil: function (b, ctx, e) {
      if (!ctx.damage) return;
      let frac = fracOf(e);
      if (b.isPlayerSide(ctx.user) && b.perk("perk_triage_deep_cuts")) frac *= 0.5;
      const amt = Math.max(1, Math.floor(ctx.damage * frac));
      b.msg(b.name(ctx.user) + " is hurt by the recoil.");
      BE.dealDamage(b, ctx.user, amt, { cause: "recoil" });
    },

    multihit: function () { /* resolved by the engine before hits */ },

    flinch: function (b, ctx, e) {
      const t = ctx.target;
      if (!t || t.hp <= 0 || !ctx.userMovedFirst) return;
      if (BE.hookAllows(b, t, "onTryFlinch", { user: ctx.user }) === false) return;
      const v = b.vol(t);
      if (!v.moved) { v.flinch = true; }
    },

    protect: function (b, ctx) {
      const v = b.vol(ctx.user);
      const chance = 1 / Math.pow(2, v.protectRow || 0);
      if (b.rng() < chance) {
        v.protect = true;
        v.protectRow = (v.protectRow || 0) + 1;
        b.msg(b.name(ctx.user) + " braced behind cover!");
      } else {
        v.protectRow = 0;
        b.msg("But it failed — cover does not hold forever.");
        ctx.failed = true;
      }
    },

    endure: function (b, ctx) {
      b.vol(ctx.user).endure = true;
      b.msg(b.name(ctx.user) + " dug in to endure the next hit.");
    },

    charge: function () { /* resolved by the engine before the hit */ },
    recharge: function (b, ctx, e) {
      if (e.ifWeather && b.field.weather !== e.ifWeather) return;
      b.vol(ctx.user).recharge = true;
    },

    weather: function (b, ctx, e) {
      const w = e.w || e.weather;
      if (e.ifNot && b.field.weather === e.ifNot) return;
      b.setWeather(w, e.turns || 5, ctx.user);
    },
    terrain: function (b, ctx, e) {
      const t = e.tr || e.terrain;
      b.setTerrain(t, e.turns || 5, ctx.user);
    },

    fixed: function (b, ctx, e) {
      const t = whoOf(b, ctx, e);
      if (!t || t.hp <= 0) return;
      const amount = e.amount === "level" ? ctx.user.level : (e.amount || 40);
      const eff = b.typeMult ? b.typeMult(ctx.move.type, b.typesOf(t)) : (NS.Data && NS.Data.typeMultiplier ? NS.Data.typeMultiplier(ctx.move.type, b.typesOf(t)) : 1);
      if (eff === 0) { b.msg("It has no effect on " + b.name(t) + "."); return; }
      ctx.damage = (ctx.damage || 0) + BE.dealDamage(b, t, amount, { cause: "fixed", source: ctx.user, move: ctx.move });
    },
    levelDamage: function (b, ctx, e) { BE.effects.fixed(b, ctx, { amount: "level", who: e.who }); },

    ohko: function (b, ctx) {
      const t = ctx.target;
      if (!t || t.hp <= 0) return;
      if (t.level > ctx.user.level) { b.msg("It failed — " + b.name(t) + " is simply too senior."); ctx.failed = true; return; }
      const acc = (30 + ctx.user.level - t.level) / 100;
      if (b.rng() < acc) {
        b.msg("It's a one-hit knockout!");
        ctx.damage = (ctx.damage || 0) + BE.dealDamage(b, t, b.maxHp(t) * 2, { cause: "ohko", source: ctx.user, move: ctx.move, trueDamage: false });
      } else {
        b.msg(b.name(ctx.user) + "'s attack missed.");
        ctx.failed = true;
      }
    },

    crit_only: function () { /* read before the hit */ },
    never_miss: function () { /* read before the hit */ },
    high_crit: function () { /* read before the hit */ },
    weight: function () { /* read before the hit */ },
    hp_scaled: function () { /* read before the hit */ },

    force_switch: function (b, ctx) {
      const t = ctx.target;
      if (!t || t.hp <= 0) return;
      if (BE.hookAllows(b, t, "onTryForceSwitch", { user: ctx.user }) === false) {
        b.msg(b.name(t) + " is rooted to the spot.");
        return;
      }
      ctx.forceSwitch = t;
    },

    trap: function (b, ctx, e) {
      const t = ctx.target;
      if (!t || t.hp <= 0) return;
      const v = b.vol(t);
      if (v.trapped > 0) return;
      let turns = e.turns;
      if (turns && turns.length === 2) turns = U.randInt(turns[0], turns[1], b.rng);
      v.trapped = turns || 4;
      v.trapper = ctx.user.uid;
      b.msg(b.name(t) + " can no longer get away!");
    },

    // NOTE: SYSTEMS-SPEC writes `screen {kind:phys|spec}`, but `kind` is
    // already the effect-type field. We read `screen`/`what` instead.
    screen: function (b, ctx, e) {
      const side = b.sideOf(ctx.user);
      const k = e.screen || e.what || e.category || "phys";
      side.screens[k] = e.turns || 5;
      b.emit("field", { side: b.sideIndexOf(ctx.user), screen: k, turns: side.screens[k] });
      b.msg("A " + (k === "phys" ? "physical" : "special") + " screen went up.");
    },

    cleanse: function (b, ctx, e) {
      const t = whoOf(b, ctx, e) || ctx.user;
      let did = BE.cureStatus(b, t, true);
      if (e.stages !== false) did = BE.clearStages(b, t, e.only || "negative") || did;
      b.msg(did ? b.name(t) + " shook itself clean." : "There was nothing to clean up.");
    },

    counter: function (b, ctx, e) {
      const v = b.vol(ctx.user);
      const kind = e.what || e.category || "phys";
      const rec = v.lastHitBy;
      if (!rec || rec.category !== kind || !rec.damage || rec.turn !== b.turn) { b.msg("But there was nothing to answer."); ctx.failed = true; return; }
      const t = b.byUid(rec.uid);
      if (!t || t.hp <= 0) { ctx.failed = true; return; }
      b.msg(b.name(ctx.user) + " returned it with interest!");
      ctx.damage = (ctx.damage || 0) + BE.dealDamage(b, t, rec.damage * (e.mult || 2), { cause: "counter", source: ctx.user, move: ctx.move });
    },

    overdrive: function (b, ctx, e) {
      const t = whoOf(b, ctx, e) || ctx.user;
      BE.gainOverdrive(b, t, e.gain || e.amount || 10, "move");
    },

    agent: function (b, ctx, e) {
      // Scripted bosses only: fire an agent-style effect from the foe side.
      b.bossAgent(ctx.user, e);
    },

    swap_stats: function (b, ctx, e) {
      const u = ctx.user, t = ctx.target;
      if (!t) return;
      const a = e.a || "atk", c = e.b || "def";
      const tmp = u.stats[a]; u.stats[a] = u.stats[c]; u.stats[c] = tmp;
      b.msg(b.name(u) + " rearranged itself.");
    },

    copy_stages: function (b, ctx) {
      const u = ctx.user, t = ctx.target;
      if (!t) return;
      const vu = b.vol(u), vt = b.vol(t);
      for (let i = 0; i < BE.STAGE_STATS.length; i++) vu.stages[BE.STAGE_STATS[i]] = vt.stages[BE.STAGE_STATS[i]];
      b.emit("stage", { side: b.sideIndexOf(u), uid: u.uid, copied: true });
      b.msg(b.name(u) + " wore " + b.name(t) + "'s face.");
    },

    sleep_talk: function (b, ctx) {
      if (ctx.user.status !== "slp") { b.msg("But it failed — you have to be asleep first."); ctx.failed = true; return; }
      const usable = (ctx.user.moves || []).filter(function (m) { return m.id !== ctx.move.id; });
      if (!usable.length) { ctx.failed = true; return; }
      ctx.sleepTalk = U.pick(usable, b.rng);
    },

    rest: function (b, ctx) {
      const u = ctx.user;
      if (u.hp >= b.maxHp(u) && !u.status) { b.msg("But it failed — nothing to sleep off."); ctx.failed = true; return; }
      BE.cureStatus(b, u, true);
      BE.heal(b, u, b.maxHp(u), { quiet: true });
      u.status = "slp"; u.statusTurns = 2;
      b.emit("status", { side: b.sideIndexOf(u), uid: u.uid, status: "slp", on: true });
      b.msg(b.name(u) + " put its head down and slept it off.");
    },

    taunt: function (b, ctx, e) {
      const t = ctx.target;
      if (!t || t.hp <= 0) return;
      b.vol(t).taunt = e.turns || 3;
      b.msg(b.name(t) + " will not stand for status moves now.");
    },

    pp_drain: function (b, ctx, e) {
      const t = ctx.target;
      if (!t || t.hp <= 0) return;
      const v = b.vol(t);
      const id = v.lastMove;
      const slot = id ? b.moveSlot(t, id) : (t.moves && t.moves[0]);
      if (!slot) return;
      slot.pp = Math.max(0, slot.pp - (e.n || 1));
      b.emit("pp", { side: b.sideIndexOf(t), uid: t.uid, move: slot.id, pp: slot.pp });
      b.msg(b.name(t) + " lost PP on " + (b.moveData(slot.id).name || slot.id) + ".");
    },

    disable: function (b, ctx, e) {
      const t = ctx.target;
      if (!t || t.hp <= 0) return;
      const v = b.vol(t);
      const id = e.move || v.lastMove;
      if (!id) return;
      v.disabled[id] = e.turns || 2;
      b.msg(b.name(t) + "'s " + (b.moveData(id).name || id) + " was disabled.");
    },

    // `cooldown {turns}` — the move cannot be used again for N turns
    // (Patch Tuesday: "usable every other turn"). The counter lives on
    // the user's volatile state and ticks down at end of turn, so
    // turns:2 means "used this turn, blocked next turn, free again the
    // turn after". Switching out clears it with the rest of the volatiles.
    cooldown: function (b, ctx, e) {
      const u = ctx.user;
      const id = (e.move || (ctx.move && ctx.move.id));
      if (!u || !id) return;
      const v = b.vol(u);
      v.cooldowns[id] = Math.max(v.cooldowns[id] || 0, e.turns || 2);
      b.emit("cooldown", { side: b.sideIndexOf(u), uid: u.uid, move: id, turns: v.cooldowns[id] });
    },

    // `restore_pp {all}` / `{move}` / `{n}` — put PP back on the
    // target's moves (Ada's Sysadmin's Reboot restores the lot).
    // Without `all` it refills the move named in `move`, else the last
    // move the target used, else its emptiest slot.
    restore_pp: function (b, ctx, e) {
      const t = whoOf(b, ctx, e) || ctx.user;
      if (!t) return;
      const list = t.moves || [];
      if (!list.length) return;
      const amount = e.n || e.amount || 0;    // 0 = fill to the brim
      const refill = function (slot) {
        if (!slot) return 0;
        const max = slot.ppMax === undefined ? slot.pp : slot.ppMax;
        const before = slot.pp;
        slot.pp = amount ? Math.min(max, slot.pp + amount) : max;
        if (slot.pp === before) return 0;
        b.emit("pp", { side: b.sideIndexOf(t), uid: t.uid, move: slot.id, pp: slot.pp, max: max });
        return slot.pp - before;
      };
      let gained = 0;
      if (e.all || e.which === "all") {
        // Never refill the move that is doing the restoring — Ada's
        // Reboot is a 1-PP "once", not a perpetual motion machine.
        for (let i = 0; i < list.length; i++) {
          if (t === ctx.user && ctx.move && list[i].id === ctx.move.id) continue;
          gained += refill(list[i]);
        }
      } else {
        let slot = null;
        if (e.move) slot = b.moveSlot(t, e.move);
        if (!slot) {
          const last = b.vol(t).lastMove;
          if (last) slot = b.moveSlot(t, last);
        }
        if (!slot) {
          for (let i = 0; i < list.length; i++) {
            const max = list[i].ppMax === undefined ? list[i].pp : list[i].ppMax;
            if (!slot || (list[i].pp / Math.max(1, max)) < (slot.pp / Math.max(1, slot.ppMax || slot.pp))) slot = list[i];
          }
        }
        gained = refill(slot);
      }
      if (gained > 0) b.msg(b.name(t) + " came back up with everything reloaded.");
      else { b.msg("There was nothing left to restore."); ctx.failed = true; }
    },

    // `mimic_type` — the user takes on the primary type of the thing it
    // is looking at (Borrowed Face). SYSTEMS-SPEC calls this a *type*
    // change on the user, not a move-type change: it is stored as the
    // per-battle `mon.typesOverride` that changeForm also uses (see the
    // battle report), so it drives STAB, the defensive chart and the
    // type shown in the HUD until the wearer leaves the field. The
    // engine applies it BEFORE the hit lands, so Borrowed Face itself is
    // already thrown from behind the borrowed face.
    mimic_type: function (b, ctx, e) {
      const u = ctx.user;
      const src = (e.from === "self") ? ctx.user : (ctx.target || ctx.user);
      if (!u || !src || src === u) { b.msg("But there was no face to borrow."); ctx.failed = true; return; }
      const want = (b.typesOf(src) || [])[0];
      if (!want) return;
      const have = b.typesOf(u) || [];
      if (have.length === 1 && have[0] === want) return;    // already wearing it
      u.typesOverride = [want];
      u.typesMimicked = true;
      b.emit("types", { side: b.sideIndexOf(u), uid: u.uid, types: b.typesOf(u), mimic: true });
      b.msg(b.name(u) + " took " + b.name(src) + "'s shape — it is " + want.toUpperCase() + " now.");
    },

    // Read before the turn runs, in the engine's priority bracket.
    priority: function () { /* see engine actionBracket() */ },
    // Read before the hit, in BE.scaledPower().
    weather_boost: function () { /* see BE.scaledPower */ }
  };
  // ENGINE-ARCHITECTURE §4 spelt some of these differently.
  BE.effects.multi = BE.effects.multihit;
  BE.effects.cure = BE.effects.cleanse;
  BE.effects.leech = BE.effects.drain;

  BE.runEffect = function (b, ctx, e) {
    if (!e || !e.kind) return;
    if (!BE.effectApplies(b, ctx, e)) return;
    const chance = e.chance === undefined ? 100 : e.chance;
    if (chance < 100 && b.rng() * 100 >= chance) return;
    const fn = BE.effects[e.kind];
    if (fn) fn(b, ctx, e);
    else NS.warn && NS.warn("battle: unknown effect kind '" + e.kind + "'");
  };

  // ---- power modifiers read before the hit ----------------------
  BE.scaledPower = function (b, user, target, move) {
    let p = move.power || 0;
    const list = move.effects || [];
    const ctx = { user: user, target: target, move: move };
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!BE.effectApplies(b, ctx, e)) continue;
      if (e.kind === "hp_scaled" || e.kind === "weight") {
        if (e.mode === "foeHpFrac") p = Math.max(1, Math.floor(p * (target.hp / b.maxHp(target))));
        else if (e.mode === "userHpFracInverse") p = Math.max(1, Math.floor(p * (2 - user.hp / b.maxHp(user))));
        else p = Math.max(1, Math.floor(p * (1 + (1 - target.hp / b.maxHp(target)))));
      } else if (e.kind === "weather_boost") {
        // `weather_boost {w, mult}` — Packet Storm's "×1.3 in Wind".
        // The user's own Umbrella-style weather immunity switches it off.
        const w = e.w || e.weather;
        if (b.field.weather === w && !BE.weatherIgnored(b, user)) p = Math.max(1, Math.floor(p * (e.mult || 1.3)));
      } else if (e.kind === "terrain_boost") {
        const tr = e.tr || e.terrain;
        if (b.field.terrain === tr) p = Math.max(1, Math.floor(p * (e.mult || 1.3)));
      }
    }
    // Legacy shorthand kept for moves that carry the flag rather than the effect.
    if (move.windBoost && b.field.weather === "wind" && !BE.weatherIgnored(b, user)) p = Math.floor(p * 1.3);
    return p;
  };
  // moveFlag(move, kind[, b, ctx]) — the first effect of that kind.
  // Pass the battle and a move context and conditional effects that do
  // not currently apply are skipped, exactly as runEffect skips them.
  BE.moveFlag = function (move, kind, b, ctx) {
    const list = move.effects || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].kind !== kind) continue;
      if (b && !BE.effectApplies(b, ctx || { user: null, move: move }, list[i])) continue;
      return list[i];
    }
    return null;
  };

  // =============================================================
  // CAPTURE (SYSTEMS-SPEC §11)
  // =============================================================
  BE.CAPSULES = {
    capsule_basic: { bonus: 1 },
    capsule_mesh: { bonus: 1.5 },
    capsule_kernel: { bonus: 2 },
    capsule_root: { bonus: 255, guaranteed: true },
    capsule_net: { bonus: 1, when: function (b, mon) { const t = b.typesOf(mon); return (t.indexOf("cyber") >= 0 || t.indexOf("bug") >= 0) ? 3 : 1; } },
    capsule_night: { bonus: 1, when: function (b) { return b.isNight() ? 3 : 1; } },
    capsule_brine: { bonus: 1, when: function (b, mon) { return (b.typesOf(mon).indexOf("water") >= 0 || b.field.weather === "rain") ? 3 : 1; } },
    capsule_quick: { bonus: 1, when: function (b) { return b.turn <= 1 ? 4 : 1; } },
    capsule_friend: { bonus: 1, friendship: 150 },
    capsule_heavy: { bonus: 1, when: function (b, mon) { const base = b.baseStats(mon); return 1 + U.clamp((base.hp || 50) / 100, 0.2, 2.5); } }
  };
  BE.capsuleBonus = function (b, mon, capsuleId) {
    const c = BE.CAPSULES[capsuleId];
    if (!c) {
      const item = NS.Data && NS.Data.items && NS.Data.items[capsuleId];
      return (item && item.catchBonus) || 1;
    }
    let v = c.when ? c.when(b, mon) : c.bonus;
    if (c.guaranteed) return 255;
    if (b.perk("perk_adjudicate_soft_touch")) v += 0.2;
    return v;
  };
  // Returns {a, shakes, success, critical}
  BE.capture = function (b, mon, capsuleId, o) {
    o = o || {};
    const c = BE.CAPSULES[capsuleId] || {};
    const M = b.maxHp(mon), H = Math.max(1, mon.hp);
    const rate = b.catchRate(mon);
    const capsule = BE.capsuleBonus(b, mon, capsuleId);
    let statusBonus = 1;
    if (mon.status === "slp" || mon.status === "frz") statusBonus = 2.5;
    else if (mon.status) statusBonus = 1.5;
    const tl = b.trainerLevel();
    const trainerBonus = 1 + Math.min(0.30, tl * 0.01);
    const diff = (BE.DIFF[b.difficulty] || BE.DIFF.normal).capture;
    const timing = o.timing === undefined ? 1.1 : o.timing;

    let a = (3 * M - 2 * H) * rate * capsule * statusBonus * trainerBonus * diff * timing / (3 * M);
    if (c.guaranteed) a = 255;
    a = Math.min(1, a / 255);

    const out = { a: a, shakes: 0, success: false, critical: false, capsule: capsuleId };
    if (c.guaranteed) { out.shakes = 4; out.success = true; return out; }
    // Critical capture: one shake, straight in, when the odds are lavish.
    if (a > 0.6 && b.rng() < Math.min(0.35, (a - 0.6) * 0.8)) {
      out.critical = true;
      if (b.rng() < a) { out.shakes = 1; out.success = true; return out; }
      out.shakes = 0; return out;
    }
    for (let i = 0; i < 4; i++) {
      if (b.rng() < a) out.shakes++;
      else return out;
    }
    out.success = true;
    return out;
  };

  // =============================================================
  // XP (SYSTEMS-SPEC §12)
  // =============================================================
  BE.baseXp = function (b, foe, o) {
    o = o || {};
    const baseExp = b.baseExp(foe);
    let n = Math.floor(baseExp * foe.level / 5);
    if (o.kind === "trainer" || o.kind === "arena") n = Math.floor(n * 1.5);
    else if (o.kind === "boss") n = Math.floor(n * 2);
    return Math.max(1, n);
  };
  BE.xpFor = function (b, gainer, foe, o) {
    o = o || {};
    let n = BE.baseXp(b, foe, o);
    if (!o.participant) {
      let share = (BE.DIFF[b.difficulty] || BE.DIFF.normal).xpShare;
      if (b.perk("perk_adjudicate_wide_share")) share = Math.max(share, 0.75);
      n = Math.floor(n * share);
    }
    if (BE.gearOf(b, gainer) === "ledger" || gainer.gear === "ledger") n = Math.floor(n * 1.5);
    if (gainer.traded || gainer.gifted) n = Math.floor(n * 1.2);
    if (gainer.level >= foe.level + 10) {
      n = Math.floor(n * (2 * foe.level + 10) / (foe.level + gainer.level + 10));
    }
    return Math.max(1, n);
  };

  NS.BattleEffects = BE;
})();
