// =============================================================
// MonsterQuest v2 — MQ.Battle (rules engine, no rendering)
//
//   MQ.Battle.start(opts) -> Promise<result>
//   MQ.Battle.create(opts) -> engine   (headless / scriptable)
//   MQ.Battle.autoResolve(opts) -> result  (cat scraps, sims)
//
// The engine is a pure state machine that emits an ordered event
// log. MQ.BattleScene renders that log and feeds actions back in
// via engine.choose(action). Nothing here touches a canvas.
//
// Event kinds emitted (ENGINE-ARCHITECTURE §6 plus extras the
// scene needs): msg hp anim stage switch faint catch menu end
// weather terrain overdrive agent status pp item field turn xp
// levelup learn evolve phase reveal flee payout intro guard
// cooldown crit effectiveness.
// =============================================================
(function () {
  "use strict";
  const NS = window.MQ;
  const U = NS.U;
  const BE = NS.BattleEffects;
  const AI = NS.BattleAI;
  const Battle = {};

  // -------------------------------------------------------------
  // Data adapters. The data workstream owns species/moves/items;
  // until they land (or when a boss invents a move) we degrade to
  // sensible generics rather than throwing.
  // -------------------------------------------------------------
  const GENERIC_SPECIES = {
    name: "Unknown", types: ["normal"], base: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
    catchRate: 120, baseExp: 60, growth: "medium", abilities: [], learnset: [], evolutions: []
  };
  function speciesOf(id) {
    const s = NS.Data && NS.Data.species && NS.Data.species[id];
    return s || GENERIC_SPECIES;
  }
  // Overdrive signatures (ROSTER §2.15) as a fallback only — if
  // data/moves.js defines them, its version always wins.
  const OD_FALLBACK = {
    od_normal: { name: "Treacle Rush", type: "normal", cat: "phys", power: 130, effects: [{ kind: "stage", who: "self", stat: "spe", delta: 1 }] },
    od_fire: { name: "Mill Blaze", type: "fire", cat: "spec", power: 130, effects: [{ kind: "status", status: "brn", chance: 30 }] },
    od_water: { name: "Weaver Flood", type: "water", cat: "spec", power: 130, effects: [{ kind: "weather", w: "rain", turns: 5 }] },
    od_grass: { name: "Hedgerow Wall", type: "grass", cat: "phys", power: 120, effects: [{ kind: "heal", who: "self", frac: 0.25 }] },
    od_electric: { name: "Pylon Overload", type: "electric", cat: "spec", power: 130, effects: [{ kind: "status", status: "par", chance: 30 }] },
    od_flying: { name: "Gale Force", type: "flying", cat: "phys", power: 130, effects: [{ kind: "weather", w: "wind", turns: 4 }] },
    od_bug: { name: "Swarm Season", type: "bug", cat: "phys", power: 40, effects: [{ kind: "multihit", min: 3, max: 3 }, { kind: "stage", who: "foe", stat: "spe", delta: -1 }] },
    od_poison: { name: "Fume Cupboard", type: "poison", cat: "spec", power: 120, effects: [{ kind: "status", status: "tox", chance: 50 }] },
    od_rock: { name: "Kerridge Fall", type: "rock", cat: "phys", power: 130, effects: [{ kind: "flinch", chance: 30 }] },
    od_ground: { name: "Subsidence Quake", type: "ground", cat: "phys", power: 130, effects: [{ kind: "terrain", tr: "salt", turns: 5 }] },
    od_psychic: { name: "Cranford Rumour", type: "psychic", cat: "spec", power: 130, effects: [{ kind: "stage", who: "foe", stat: "spd", delta: -1 }] },
    od_ghost: { name: "Grave Bell", type: "ghost", cat: "spec", power: 130, effects: [{ kind: "status", status: "cnf", chance: 30 }] },
    od_cyber: { name: "Root Shell", type: "cyber", cat: "spec", power: 130, effects: [{ kind: "pp_drain", n: 2 }] },
    zoomies: { name: "Zoomies", type: "normal", cat: "phys", power: 40, priority: 2, effects: [{ kind: "multihit", min: 3, max: 3 }, { kind: "stage", who: "self", stat: "spe", delta: 1 }] },
    brink_roar: { name: "Brink Roar", type: "normal", cat: "status", power: 0, effects: [{ kind: "heal", who: "self", frac: 0.5 }, { kind: "stage", who: "self", stat: "def", delta: 1 }, { kind: "stage", who: "self", stat: "spd", delta: 1 }, { kind: "stage", who: "foe", stat: "atk", delta: -1 }] },
    jacquard_weave: { name: "Jacquard Weave", type: "bug", cat: "spec", power: 130, effects: [{ kind: "terrain", tr: "silk", turns: 5 }, { kind: "stage", who: "foe", stat: "spe", delta: -1 }] },
    brine_tide: { name: "Brine Tide", type: "water", cat: "spec", power: 130, effects: [{ kind: "weather", w: "rain", turns: 8 }, { kind: "stage", who: "self", stat: "spd", delta: 1 }] },
    firebox_overload: { name: "Firebox Overload", type: "fire", cat: "spec", power: 140, effects: [{ kind: "status", status: "brn", chance: 30 }, { kind: "stage", who: "self", stat: "spe", delta: -1 }] },
    grin_remains: { name: "The Grin Remains", type: "ghost", cat: "status", power: 0, effects: [{ kind: "heal", who: "self", frac: 0.5 }, { kind: "stage", who: "self", stat: "eva", delta: 2 }, { kind: "status", status: "cnf", who: "foe" }] },
    knights_waking: { name: "Knights Waking", type: "psychic", cat: "spec", power: 150, effects: [{ kind: "status", status: "slp", chance: 30 }] },
    salt_cathedral: { name: "Salt Cathedral", type: "rock", cat: "phys", power: 150, effects: [{ kind: "terrain", tr: "salt", turns: 5 }, { kind: "stage", who: "self", stat: "def", delta: 1 }] },
    ridge_storm: { name: "Ridge Storm", type: "electric", cat: "spec", power: 140, effects: [{ kind: "weather", w: "wind", turns: 8 }, { kind: "status", status: "par", chance: 20 }] },
    static_scream: { name: "Static Scream", type: "cyber", cat: "spec", power: 140, flags: { sound: true }, effects: [{ kind: "status", status: "cnf", chance: 30 }, { kind: "pp_drain", n: 1 }] },
    bruin_maul: { name: "Beartown Maul", type: "normal", cat: "phys", power: 140, effects: [{ kind: "flinch", chance: 30 }, { kind: "stage", who: "self", stat: "def", delta: -1 }] },
    understudy_mask: { name: "Borrowed Face", type: "cyber", cat: "spec", power: 120, effects: [{ kind: "copy_stages" }] },
    oracle_escalate: { name: "Escalate", type: "cyber", cat: "status", power: 0, effects: [{ kind: "agent", jam: 3 }, { kind: "heal", who: "self", frac: 0.3 }, { kind: "stage", who: "self", stat: "spa", delta: 1 }] }
  };
  const moveCache = {};
  function moveData(id) {
    if (!id) return STRUGGLE;
    const d = NS.Data && NS.Data.moves && NS.Data.moves[id];
    if (d) { if (!d.id) d.id = id; return d; }
    if (moveCache[id]) return moveCache[id];
    let m;
    if (OD_FALLBACK[id]) {
      m = U.merge({ acc: null, pp: 0, priority: 0, crit: 0, flags: {}, overdriveOnly: true, target: "foe", anim: "blast" }, OD_FALLBACK[id]);
    } else {
      m = { name: U.capitalise(String(id).replace(/_/g, " ")), type: "normal", cat: "phys", power: 50, acc: 100, pp: 15, priority: 0, crit: 0, flags: { contact: true }, effects: [], anim: "slash" };
    }
    m.id = id;
    if (!m.flags) m.flags = {};
    if (!m.effects) m.effects = [];
    moveCache[id] = m;
    return m;
  }
  const STRUGGLE = {
    id: "last_ditch", name: "Last Ditch", type: "normal", cat: "phys", power: 40, acc: 100, pp: 1, priority: 0,
    crit: 0, flags: { contact: true }, typeless: true, effects: [{ kind: "recoil", frac: 0.25 }],
    desc: "Out of options and out of patience.", anim: "slash"
  };

  function itemData(id) {
    const d = NS.Data && NS.Data.items && NS.Data.items[id];
    if (d) return d;
    return { id: id, name: BE.itemName(id), kind: /^capsule_/.test(id) ? "capsule" : "heal", amount: 20 };
  }

  // -------------------------------------------------------------
  // Monster construction (delegates to MQ.Data.makeMonster when the
  // data workstream provides it; this is the fallback).
  // -------------------------------------------------------------
  let uidSeq = 1;
  Battle.makeMonster = function (speciesId, level, opts) {
    if (NS.Data && NS.Data.makeMonster) return NS.Data.makeMonster(speciesId, level, opts);
    opts = opts || {};
    const rnd = opts.rng || Math.random;
    const sp = speciesOf(speciesId);
    level = U.clamp(level || 5, 1, 100);
    const floorIv = opts.ivFloor || 0;
    const ivs = opts.ivs || {};
    for (let i = 0; i < BE.STATS.length; i++) {
      const k = BE.STATS[i];
      if (ivs[k] === undefined) ivs[k] = U.randInt(floorIv, 15, rnd);
    }
    const temperament = opts.temperament || U.pick(BE.TEMPERAMENT_IDS, rnd);
    const stats = BE.computeStats(sp.base || GENERIC_SPECIES.base, level, ivs, temperament);
    const moves = [];
    if (opts.moves) {
      for (let i = 0; i < opts.moves.length && i < 4; i++) {
        const md = moveData(opts.moves[i]);
        moves.push({ id: opts.moves[i], pp: md.pp || 15, ppMax: md.pp || 15 });
      }
    } else {
      const ls = sp.learnset || [];
      const learnt = [];
      for (let i = 0; i < ls.length; i++) if (ls[i][0] <= level) learnt.push(ls[i][1]);
      const tail = learnt.slice(-4);
      for (let i = 0; i < tail.length; i++) {
        const md = moveData(tail[i]);
        moves.push({ id: tail[i], pp: md.pp || 15, ppMax: md.pp || 15 });
      }
    }
    if (!moves.length) moves.push({ id: "last_ditch", pp: 1, ppMax: 1 });
    const abilities = sp.abilities || [];
    const ability = opts.ability || (abilities.length ? (abilities.length > 1 && rnd() < 0.2 ? abilities[1] : abilities[0]) : null);
    return {
      uid: (opts.uid || ("m" + (uidSeq++))), species: speciesId,
      nickname: opts.nickname || sp.name || U.capitalise(String(speciesId)),
      level: level, exp: BE.expForLevel(level, sp.growth || "medium"),
      hp: stats.hp, stats: stats, ivs: ivs, temperament: temperament,
      ability: ability, gear: opts.gear || null,
      friendship: opts.friendship === undefined ? 70 : opts.friendship,
      status: null, statusTurns: 0, moves: moves, overdrive: 0,
      metAt: opts.metAt || null, shiny: !!opts.shiny, ribbons: []
    };
  };

  // -------------------------------------------------------------
  // Battle state
  // -------------------------------------------------------------
  function newVol() {
    return {
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 },
      conf: 0, trapped: 0, trapper: null, flinch: false, protect: false, protectRow: 0,
      charging: null, chargeMoveId: null, recharge: false, choiceLock: null,
      taunt: 0, disabled: {}, cooldowns: {}, lastMove: null, lastHitBy: null, moved: false,
      abilityOff: 0, brinkLeft: undefined, failSafeUsed: false, payloadSpent: false,
      blanketUsed: false, endure: false, semiInvuln: null, turnsIn: 0,
      critBoost: 0, guard: false, deferred: false, killChainTurn: -1,
      dodgeOnce: false, immuneTurns: 0, gearOff: false, revealed: false,
      firstDamaging: true
    };
  }

  function makeSide(index, o) {
    return {
      index: index, isPlayer: index === 0, party: o.party || [], activeUids: [],
      trainer: o.trainer || null, ai: o.ai || "random", screens: { phys: 0, spec: 0 },
      itemsUsed: 0, memory: {}, agentCooldowns: {}, slots: o.slots || 1,
      reboots: 0, sentOut: []
    };
  }

  function createState(opts) {
    opts = opts || {};
    const rules = U.defaults(opts.rules || {}, {
      canRun: opts.kind === "wild" || opts.kind === undefined,
      canCatch: opts.kind === "wild",
      expShare: true, doubles: false, noItems: false, oneAgent: false,
      overdriveCarry: false, weather: null, terrain: null
    });
    const difficulty = opts.difficulty || (NS.Settings && NS.Settings.difficulty) || "normal";
    const seed = opts.seed === undefined ? (Date.now() ^ Math.floor(Math.random() * 1e9)) : opts.seed;

    const b = {
      opts: opts,
      kind: opts.kind || "wild",
      rules: rules,
      difficulty: difficulty,
      diff: BE.DIFF[difficulty] || BE.DIFF.normal,
      seed: seed,
      rng: U.rng(seed),
      turn: 0,
      over: false,
      log: [],
      vols: {},
      field: { weather: rules.weather || null, weatherTurns: 0, weatherSetter: null, terrain: rules.terrain || null, terrainTurns: 0, terrainSetter: null },
      sides: [],
      participants: {},
      pending: [],
      expGained: 0, moneyGained: 0,
      result: null,
      autoPlayer: !!opts.auto,
      escort: opts.escort || null,
      boss: null, bossPhase: 0, bossPhasesFired: {},
      agentsJammed: 0, agentsSilent: false,
      caught: null, fled: false
    };
    if (b.field.weather) b.field.weatherTurns = rules.weatherTurns || 8;
    if (b.field.terrain) b.field.terrainTurns = rules.terrainTurns || 5;

    const playerParty = (opts.playerParty || (NS.Party && NS.Party.list) || []).filter(function (m) { return !!m; });
    b.sides.push(makeSide(0, { party: playerParty, ai: opts.playerAi || "smart", slots: rules.doubles ? 2 : 1, trainer: null }));
    const enemyAi = AI.shiftTier((opts.trainer && opts.trainer.ai) || (b.kind === "wild" ? "random" : "greedy"), difficulty);
    b.sides.push(makeSide(1, {
      party: opts.enemyParty || [], trainer: opts.trainer || null,
      ai: (b.kind === "boss" || (opts.trainer && opts.trainer.boss)) ? "smart" : enemyAi,
      slots: rules.doubles ? 2 : 1
    }));
    if (opts.trainer && opts.trainer.boss) {
      b.boss = opts.trainer.boss;
      b.kind = "boss";
      if (b.boss.jamAgents) b.agentsJammed = b.boss.jamAgents;
      if (b.boss.arenaWeather) { b.field.weather = b.boss.arenaWeather; b.field.weatherTurns = 999; }
      if (b.boss.arenaTerrain) { b.field.terrain = b.boss.arenaTerrain; b.field.terrainTurns = 999; }
      if (b.boss.cannotCatch) b.rules.canCatch = false;
      if (!b.rules.canRun) b.rules.canRun = false;
    }
    return b;
  }

  // -------------------------------------------------------------
  // Battle helper API (used by effects.js, ai.js and the scene)
  // -------------------------------------------------------------
  function attachApi(b) {
    b.emit = function (type, data) {
      const ev = data || {};
      ev.type = type;
      b.log.push(ev);
      return ev;
    };
    b.msg = function (text) { return b.emit("msg", { text: text }); };
    b.vol = function (mon) {
      let v = b.vols[mon.uid];
      if (!v) v = b.vols[mon.uid] = newVol();
      return v;
    };
    b.sideIndexOf = function (mon) {
      for (let i = 0; i < b.sides.length; i++) if (b.sides[i].party.indexOf(mon) >= 0) return i;
      return 0;
    };
    b.sideOf = function (mon) { return b.sides[b.sideIndexOf(mon)]; };
    b.isPlayerSide = function (mon) { return b.sideIndexOf(mon) === 0; };
    b.activesOf = function (sideIndex) {
      const s = b.sides[sideIndex];
      const out = [];
      for (let i = 0; i < s.activeUids.length; i++) {
        const m = b.byUid(s.activeUids[i]);
        if (m) out.push(m);
      }
      return out;
    };
    b.foesOf = function (mon) {
      return b.activesOf(1 - b.sideIndexOf(mon)).filter(function (m) { return m.hp > 0; });
    };
    b.alliesOf = function (mon) {
      return b.activesOf(b.sideIndexOf(mon)).filter(function (m) { return m.hp > 0 && m !== mon; });
    };
    b.byUid = function (uid) {
      for (let s = 0; s < b.sides.length; s++) {
        const p = b.sides[s].party;
        for (let i = 0; i < p.length; i++) if (p[i] && p[i].uid === uid) return p[i];
      }
      return null;
    };
    b.species = function (mon) { return speciesOf(mon.species); };
    b.baseStats = function (mon) { return b.species(mon).base || GENERIC_SPECIES.base; };
    b.baseExp = function (mon) { return b.species(mon).baseExp || 60; };
    b.catchRate = function (mon) { return b.species(mon).catchRate || 120; };
    b.growth = function (mon) { return b.species(mon).growth || "medium"; };
    b.typesOf = function (mon) {
      if (mon.typesOverride) return mon.typesOverride;
      return b.species(mon).types || ["normal"];
    };
    b.maxHp = function (mon) { return (mon.stats && mon.stats.hp) || 1; };
    // Party monsters made by content-core carry nickname:null and expect the
    // species name to stand in, so every display path goes through here.
    b.plainName = function (mon) {
      if (!mon) return "It";
      return mon.nickname || b.species(mon).name || U.capitalise(String(mon.species));
    };
    b.name = function (mon) {
      if (!mon) return "It";
      const base = b.plainName(mon);
      return b.isPlayerSide(mon) ? base : ((b.kind === "wild" ? "The wild " : "The foe's ") + base);
    };
    b.moveData = moveData;
    b.itemData = itemData;
    b.struggle = function () { return STRUGGLE; };
    b.moveSlot = function (mon, id) {
      const list = mon.moves || [];
      for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    };
    b.isNight = function () {
      if (NS.Clock && NS.Clock.isNight) return NS.Clock.isNight();
      return false;
    };
    b.perk = function (id) {
      const T = NS.Trainer;
      if (T && T.perks) {
        if (T.perks.has && T.perks.has(id)) return true;
        if (T.perks.indexOf && T.perks.indexOf(id) >= 0) return true;
      }
      if (NS.Flags && NS.Flags.get) return !!NS.Flags.get(id);
      return false;
    };
    b.trainerLevel = function () {
      const T = NS.Trainer;
      if (T && typeof T.level === "number") return T.level;
      if (NS.Flags && NS.Flags.get) return Number(NS.Flags.get("trainer_level")) || 1;
      return 1;
    };
    b.catTrust = function (which) {
      if (NS.Cats && NS.Cats.trust && NS.Cats.trust[which] !== undefined) return NS.Cats.trust[which];
      if (NS.Flags && NS.Flags.get) return Number(NS.Flags.get("trust_" + which)) || 0;
      return 0;
    };
    // The meter is hidden and inert before Badge 1 (SYSTEMS-SPEC §7);
    // on the enemy side only greedy/smart trainers and bosses build it.
    b.overdriveActive = function (mon) {
      if (b.rules.overdriveOff) return false;
      if (b.isPlayerSide(mon)) {
        if (b.opts.overdrive === true) return true;
        if (NS.Flags && NS.Flags.get) return !!NS.Flags.get("overdrive_unlocked");
        return true;
      }
      if (b.kind === "boss") return true;
      return b.sides[1].ai !== "random";
    };
    b.setWeather = function (w, turns, setter) {
      if (!w) return;
      if (w === "fog" && b.field.weather === "rain" && b.field.weatherTurns > 0) {
        b.msg("The rain will not let the fog settle.");
        return;
      }
      if (setter && BE.gearOf(b, setter) === "weathervane") turns = 8;
      b.field.weather = w;
      b.field.weatherTurns = turns || 5;
      b.field.weatherSetter = setter ? setter.uid : null;
      b.emit("weather", { weather: w, turns: b.field.weatherTurns });
      b.msg(WEATHER_MSG[w] || ("The weather turned to " + w + "."));
      const all = b.activesOf(0).concat(b.activesOf(1));
      for (let i = 0; i < all.length; i++) BE.hook(b, all[i], "onWeatherSet", { weather: w });
    };
    b.setTerrain = function (t, turns, setter) {
      if (!t) return;
      b.field.terrain = t;
      b.field.terrainTurns = turns || 5;
      b.field.terrainSetter = setter ? setter.uid : null;
      b.emit("terrain", { terrain: t, turns: b.field.terrainTurns });
      b.msg(TERRAIN_MSG[t] || ("The ground turned " + t + "."));
      if (t === "salt") {
        const all = b.activesOf(0).concat(b.activesOf(1));
        for (let i = 0; i < all.length; i++) {
          if (all[i].status === "psn" || all[i].status === "tox") {
            BE.cureStatus(b, all[i], false);
            b.msg("The salt drew the poison out of " + b.name(all[i]) + ".");
          }
        }
      }
    };
    b.aiHealItem = function (side) {
      if (b.rules.noItems) return null;
      const t = side.trainer;
      if (!t || !t.items || !t.items.length) return null;
      for (let i = 0; i < t.items.length; i++) {
        const it = itemData(t.items[i]);
        if (it.kind === "heal") return t.items[i];
      }
      return null;
    };
    b.faint = function (mon, source, move) {
      if (!mon || mon._fainted) return;
      mon._fainted = true;
      mon.hp = 0;
      const v = b.vol(mon);
      v.charging = false; v.chargeMoveId = null; v.semiInvuln = null; v.trapped = 0;
      b.emit("faint", { side: b.sideIndexOf(mon), uid: mon.uid, name: b.plainName(mon), species: mon.species });
      b.msg(b.name(mon) + " keeled over.");
      BE.hookFainted(b, mon, "onFaint", { killer: source, move: move });
      if (source && source.hp > 0) {
        BE.hook(b, source, "onKO", { victim: mon });
        if (b.isPlayerSide(source) && b.perk("perk_triage_kill_chain")) {
          b.vol(source).killChainTurn = b.turn;
          BE.addStage(b, source, BE.highestAttackStat(b, source), 1, source, {});
        }
      }
    };
    b.bossAgent = function (user, e) {
      if (e.jam) {
        b.agentsJammed = Math.max(b.agentsJammed, e.jam);
        b.emit("agent", { jammed: b.agentsJammed, by: user ? user.uid : null });
        b.msg("Your agents have gone quiet. Something is holding the line open.");
      }
      const foes = b.foesOf(user);
      for (let i = 0; i < foes.length; i++) {
        BE.addStage(b, foes[i], "spe", -2, user, {});
        b.emit("reveal", { side: b.sideIndexOf(foes[i]), uid: foes[i].uid, by: "boss" });
      }
    };
  }

  const WEATHER_MSG = {
    rain: "Rain came in off the moss, as it does.",
    sun: "The sun came out. Nobody could quite believe it.",
    fog: "Fog rolled in, thick as a bad excuse.",
    wind: "A ridge wind got up and started shoving.",
    snow: "Snow started, fine and mean."
  };
  const TERRAIN_MSG = {
    grass: "The ground went thick with grass.",
    wet: "The ground went sodden underfoot.",
    salt: "Salt crusted the ground.",
    static: "The ground began to hum and prickle.",
    silk: "Silk laced itself across the ground."
  };

  Battle.speciesOf = speciesOf;
  Battle.moveData = moveData;
  Battle.STRUGGLE = STRUGGLE;
  Battle._createState = createState;
  Battle._attachApi = attachApi;
  Battle._newVol = newVol;
  Battle.WEATHER_MSG = WEATHER_MSG;
  Battle.TERRAIN_MSG = TERRAIN_MSG;
  NS.Battle = Battle;
  NS.Battle.STUB = false;

  // =============================================================
  // Switching in / out
  // =============================================================
  function switchIn(b, sideIndex, slot, partyIndex, o) {
    o = o || {};
    const side = b.sides[sideIndex];
    const mon = side.party[partyIndex];
    if (!mon) return null;
    b.vols[mon.uid] = newVol();
    mon._fainted = mon.hp <= 0;
    side.activeUids[slot] = mon.uid;
    if (side.sentOut.indexOf(mon.uid) < 0) side.sentOut.push(mon.uid);
    if (sideIndex === 0) b.participants[mon.uid] = true;
    if (!b.rules.overdriveCarry) mon.overdrive = mon.overdrive || 0;

    b.emit("switch", {
      side: sideIndex, slot: slot, uid: mon.uid, partyIndex: partyIndex,
      name: b.plainName(mon), species: mon.species, level: mon.level,
      hp: mon.hp, max: b.maxHp(mon), status: mon.status, overdrive: mon.overdrive || 0,
      types: b.typesOf(mon), first: !!o.first
    });
    if (o.first) {
      if (sideIndex === 1) {
        if (b.kind === "wild") b.msg("A wild " + b.plainName(mon) + " blocked the path!");
        else b.msg((side.trainer ? side.trainer.name : "The challenger") + " sent out " + b.plainName(mon) + "!");
      } else {
        b.msg("Go on then, " + b.plainName(mon) + "!");
      }
    } else {
      b.msg(sideIndex === 0 ? ("Come back! " + b.plainName(mon) + ", you're up!") : ((side.trainer ? side.trainer.name : "The foe") + " sent out " + b.plainName(mon) + "!"));
    }

    const v = b.vol(mon);
    if (sideIndex === 0 && b.perk("perk_escalate_second_wind")) BE.heal(b, mon, Math.floor(b.maxHp(mon) / 16), { quiet: true, cause: "perk" });
    if (b.field.terrain === "salt" && (mon.status === "psn" || mon.status === "tox")) {
      BE.cureStatus(b, mon, false);
      b.msg("The salt drew the poison out of " + b.name(mon) + ".");
    }
    if (mon.species === "meadow" && b.catTrust("meadow") >= 3 && !b.meadowDodged) v.dodgeOnce = true;
    if (sideIndex === 1 && b.house) houseOnEnemyEnter(b, mon);
    if (b.kind === "wild" && sideIndex === 0 && b.perk("perk_triage_ambush") && b.turn <= 1) BE.addStage(b, mon, "spe", 1, mon, {});
    BE.hook(b, mon, "onEnter", {});
    return mon;
  }

  function switchOut(b, mon) {
    if (!mon) return;
    BE.hook(b, mon, "onSwitchOut", {});
    const v = b.vol(mon);
    v.choiceLock = null;
    dropMimic(mon);
    b.vols[mon.uid] = newVol();
  }

  // `mimic_type` (Borrowed Face) writes the per-battle typesOverride
  // that changeForm also uses. Only ever undo the one the move set:
  // a boss form's override has to survive.
  function dropMimic(mon) {
    if (mon && mon.typesMimicked) { mon.typesOverride = null; mon.typesMimicked = false; }
  }

  // =============================================================
  // Move execution
  // =============================================================
  function chooseTargets(b, user, move, act) {
    if (move.target === "self") return [user];
    if (move.target === "field") return [];
    if (act && act.target) {
      const t = b.byUid(act.target);
      if (t && t.hp > 0) return [t];
    }
    const foes = b.foesOf(user);
    if (!foes.length) return [];
    if (move.target === "all_foes" || move.spread) return foes;
    return [foes[0]];
  }

  function multiHitCount(b, move) {
    const e = BE.moveFlag(move, "multihit") || BE.moveFlag(move, "multi");
    if (!e) return 1;
    const min = e.min || 2, max = e.max || 5;
    if (min === max) return min;
    const r = b.rng();
    if (min === 2 && max === 5) return r < 0.375 ? 2 : r < 0.75 ? 3 : r < 0.875 ? 4 : 5;
    return U.randInt(min, max, b.rng);
  }

  function effectivenessLine(eff) {
    if (eff === 0) return null;
    if (eff >= 4) return "It's devastatingly effective!";
    if (eff > 1) return "It's super effective!";
    if (eff > 0 && eff <= 0.25) return "It barely registers...";
    if (eff < 1) return "It's not very effective...";
    return null;
  }

  function preMoveChecks(b, user, move) {
    const v = b.vol(user);
    if (v.recharge) {
      v.recharge = false;
      b.msg(b.name(user) + " has to catch its breath.");
      return false;
    }
    if (v.flinch) {
      v.flinch = false;
      b.msg(b.name(user) + " flinched and lost the moment.");
      return false;
    }
    if (user.status === "slp") {
      if (user.statusTurns > 0) user.statusTurns--;
      if (user.statusTurns <= 0) {
        BE.cureStatus(b, user, false);
        b.msg(b.name(user) + " woke up.");
      } else {
        b.msg(b.name(user) + " is fast asleep.");
        if (BE.moveFlag(move, "sleep_talk")) return true;
        return false;
      }
    }
    if (user.status === "frz") {
      if (b.rng() < 0.2 && b.field.weather !== "snow") {
        BE.cureStatus(b, user, false);
        b.msg(b.name(user) + " thawed out.");
      } else {
        b.msg(b.name(user) + " is frozen solid.");
        return false;
      }
    }
    if (BE.hookAllows(b, user, "onBeforeMove", { move: move }) === false) return false;
    if (v.conf > 0) {
      v.conf--;
      if (v.conf <= 0) {
        b.emit("status", { side: b.sideIndexOf(user), uid: user.uid, status: "cnf", on: false });
        b.msg(b.name(user) + " snapped out of its confusion.");
      } else {
        b.msg(b.name(user) + " is confused...");
        if (b.rng() < 1 / 3) {
          const r = BE.damage(b, user, user, { type: "normal", cat: "phys", power: 40, id: "confusion", name: "confusion", flags: {} }, { power: 40, typeless: true, crit: false });
          b.msg("It hurt itself in its confusion!");
          b.emit("anim", { name: "hit", side: b.sideIndexOf(user), uid: user.uid });
          BE.dealDamage(b, user, r.dmg, { cause: "confusion" });
          return false;
        }
      }
    }
    if (user.status === "par" && b.rng() < 0.25) {
      b.msg(b.name(user) + " is fully paralysed.");
      return false;
    }
    return true;
  }

  function* useMove(b, user, act) {
    const v = b.vol(user);
    let slot = null, move;
    if (act.type === "struggle") {
      move = STRUGGLE;
    } else if (act.type === "overdrive") {
      move = overdriveMove(b, user);
    } else {
      slot = (user.moves || [])[act.index];
      if (!slot) { move = STRUGGLE; }
      else move = moveData(v.chargeMoveId || slot.id);
    }
    if (v.chargeMoveId) move = moveData(v.chargeMoveId);

    // A move on cooldown cannot be used again yet (Patch Tuesday).
    if (act.type === "move" && slot && v.cooldowns[move.id] > 0) {
      b.msg(move.name + " has not come back up yet.");
      v.moved = true;
      return;
    }

    if (!preMoveChecks(b, user, move)) { v.moved = true; return; }

    // Sleep Talk picks a different move entirely.
    if (BE.moveFlag(move, "sleep_talk") && user.status === "slp") {
      const alt = (user.moves || []).filter(function (m) { return m.id !== move.id; });
      if (alt.length) move = moveData(U.pick(alt, b.rng).id);
    }

    // ---- charge turn -------------------------------------------
    const charge = BE.moveFlag(move, "charge");
    if (charge && !v.charging) {
      const windInstant = b.field.weather === "wind";
      const foes = b.foesOf(user);
      let jammed = false;
      for (let i = 0; i < foes.length; i++) {
        if (BE.hookAllows(b, foes[i], "onFoeCharge", { move: move, user: user }) === false) jammed = true;
      }
      if (jammed) {
        b.msg(b.name(user) + "'s move never got off the ground — jammed.");
        if (slot) spendPp(b, user, slot);
        v.moved = true;
        return;
      }
      if (!windInstant) {
        v.charging = true;
        v.chargeMoveId = move.id;
        if (charge.semiInvuln) v.semiInvuln = charge.semiInvuln === true ? "air" : charge.semiInvuln;
        b.msg(move.chargeText || (b.name(user) + " is winding up " + move.name + "..."));
        b.emit("anim", { name: "charge", side: b.sideIndexOf(user), uid: user.uid, move: move.id });
        if (slot) spendPp(b, user, slot);
        v.moved = true;
        return;
      }
      b.msg("The wind carried it straight through!");
    }
    if (v.charging) { v.charging = false; v.chargeMoveId = null; v.semiInvuln = null; }
    else if (slot) spendPp(b, user, slot);

    if (BE.gearOf(b, user) === "walkers_boots") BE.hook(b, user, "onAfterMoveChosen", { moveId: move.id });

    v.lastMove = move.id;
    v.moved = true;
    b.emit("anim", { name: "use", side: b.sideIndexOf(user), uid: user.uid, move: move.id });
    b.msg(b.name(user) + " used " + move.name + "!");
    if (act.type === "overdrive") {
      b.emit("anim", { name: "overdrive_fire", side: b.sideIndexOf(user), uid: user.uid });
      user.overdrive = 0;
      b.emit("overdrive", { side: b.sideIndexOf(user), uid: user.uid, value: 0, reason: "spent" });
    }

    const targets = chooseTargets(b, user, move, act);
    const ctx = {
      user: user, move: move, target: targets[0] || null, damage: 0, hits: 0,
      category: move.cat, userMovedFirst: b.firstMover === user.uid, failed: false
    };

    // `mimic_type` lands before the hit so the borrowed typing is
    // already the user's when this very move's damage is worked out.
    const mimic = BE.moveFlag(move, "mimic_type", b, ctx);
    if (mimic && targets.length) { ctx.target = targets[0]; BE.runEffect(b, ctx, mimic); }

    if (move.cat === "status" && targets.length && targets[0] !== user) {
      // Honeypot turns a status move back on its user.
      if (BE.hookAllows(b, targets[0], "onTargetedByStatus", { user: user, move: move }) === false) { yield* afterMove(b, ctx); return; }
    }

    if (!targets.length && move.target !== "field" && move.target !== "self") {
      b.msg("But there was nobody to aim at.");
      yield* afterMove(b, ctx);
      return;
    }

    for (let ti = 0; ti < targets.length; ti++) {
      const target = targets[ti];
      ctx.target = target;
      if (target.hp <= 0) continue;
      const tv = b.vol(target);

      // Silk terrain: priority moves fail against grounded targets.
      if (b.field.terrain === "silk" && (move.priority || 0) > 0 && BE.grounded(b, target) && target !== user) {
        b.msg("The silk snagged the rush — it failed.");
        continue;
      }
      // Protect.
      if (tv.protect && target !== user && !move.overdriveOnly && (!move.flags || move.flags.protect_ok !== false)) {
        b.msg(b.name(target) + " held its cover.");
        b.emit("anim", { name: "protect", side: b.sideIndexOf(target), uid: target.uid });
        continue;
      }
      // Sound immunity etc.
      if (BE.hookAllows(b, target, "onTryHit", { move: move, user: user }) === false) continue;
      // MEADOW's trust-3 dodge.
      if (tv.dodgeOnce && move.cat !== "status" && target !== user) {
        tv.dodgeOnce = false;
        b.meadowDodged = true;
        b.msg(b.name(target) + " was simply not there any more.");
        b.emit("anim", { name: "dodge", side: b.sideIndexOf(target), uid: target.uid });
        continue;
      }

      const critOnly = !!BE.moveFlag(move, "crit_only");
      const neverMiss = !!BE.moveFlag(move, "never_miss");
      const high = BE.moveFlag(move, "high_crit");
      const accCtx = { neverMiss: neverMiss, hitsSemiInvuln: !!move.hitsSemiInvuln };
      if (move.cat !== "status" || move.acc) {
        if (!BE.accuracyCheck(b, user, target, move, accCtx)) {
          b.msg(b.name(user) + "'s attack missed " + (targets.length > 1 ? b.name(target) : "") + ".");
          b.emit("anim", { name: "miss", side: b.sideIndexOf(target), uid: target.uid });
          continue;
        }
      }

      if (move.cat === "status" || !move.power) {
        ctx.hits++;
        continue;
      }

      const hits = multiHitCount(b, move);
      let lastEff = 1, anyCrit = false, immune = false;
      for (let h = 0; h < hits; h++) {
        if (target.hp <= 0 || user.hp <= 0) break;
        const crit = critOnly || BE.rollCrit(b, user, move, { critBonus: high ? (high.stage || 1) : 0, critOnly: critOnly });
        const power = BE.scaledPower(b, user, target, move);
        const r = BE.damage(b, user, target, move, { power: power, crit: crit, typeless: !!move.typeless });
        lastEff = r.eff;
        if (r.immune) { immune = true; break; }
        if (crit) anyCrit = true;
        let dmg = r.dmg;
        if (tv.guard) dmg = Math.max(1, Math.floor(dmg * 0.5));
        if (tv.immuneTurns > 0) { b.msg("It glanced off — " + b.name(target) + " is untouchable just now."); break; }

        b.emit("anim", { name: move.anim || "hit", side: b.sideIndexOf(target), uid: target.uid, move: move.id, eff: r.eff, crit: crit, hitIndex: h });
        const dealt = BE.dealDamage(b, target, dmg, { cause: "move", source: user, move: move });
        ctx.damage += dealt;
        ctx.hits++;
        tv.lastHitBy = { uid: user.uid, damage: dealt, category: move.cat, turn: b.turn, move: move.id };

        if (crit) b.emit("crit", { side: b.sideIndexOf(target), uid: target.uid });
        BE.hook(b, target, "onHpChanged", {});
        BE.hook(b, target, "onHitTaken", { move: move, user: user, damage: dealt, category: move.cat });
        BE.hook(b, user, "onAfterHit", { move: move, target: target, damage: dealt, category: move.cat });

        // House rule: the leader's contact hits carry a condition.
        if (b.house && b.house.contactStatus && b.sideIndexOf(user) === 1 && move.flags && move.flags.contact) {
          const cs = b.house.contactStatus;
          if (b.rng() * 100 < (cs.chance === undefined ? 20 : cs.chance)) BE.applyStatus(b, target, cs.status, user, { quiet: true });
        }
        // House rule: agents come back the moment you land something super-effective.
        if (b.jamUntilSuper && b.sideIndexOf(user) === 0 && r.eff > 1) {
          b.jamUntilSuper = false;
          b.agentsJammed = 0;
          b.emit("agent", { jammed: 0 });
          b.msg("That got through. Your agents are back.");
        }
        // Freeze thaws on a fire hit.
        if (move.type === "fire" && target.status === "frz") {
          BE.cureStatus(b, target, false);
          b.msg("The heat thawed " + b.name(target) + ".");
        }
        // Overdrive meter.
        BE.gainOverdrive(b, user, BE.OD.dealt, "dealt");
        BE.gainOverdrive(b, target, r.eff > 1 ? BE.OD.superTaken : BE.OD.hitTaken, "taken");
        if (target.hp <= 0) break;
      }
      if (immune) { b.msg("It has no effect on " + b.name(target) + "."); continue; }
      if (anyCrit) b.msg("A critical hit!");
      const line = effectivenessLine(lastEff);
      if (line) { b.emit("effectiveness", { eff: lastEff }); b.msg(line); }
      if (hits > 1 && ctx.hits > 1) b.msg("Hit " + ctx.hits + " times!");
    }

    yield* afterMove(b, ctx);
  }

  function* afterMove(b, ctx) {
    const move = ctx.move, user = ctx.user;
    const effects = move.effects || [];
    // Every `when:` is judged against the field as the move LANDED, not
    // as each clause leaves it — otherwise Brine Jet's "make rain if it
    // is not raining" clause immediately satisfies its own "ride the
    // rain" sibling and both go off.
    const gate = [];
    for (let g = 0; g < effects.length; g++) gate[g] = BE.effectApplies(b, ctx, effects[g]);
    for (let i = 0; i < effects.length; i++) {
      if (!gate[i]) continue;
      if (user.hp <= 0 && effects[i].kind !== "recoil") break;
      const e = effects[i];
      if (e.kind === "multihit" || e.kind === "multi" || e.kind === "charge" || e.kind === "crit_only" ||
        e.kind === "never_miss" || e.kind === "high_crit" || e.kind === "weight" || e.kind === "hp_scaled" ||
        e.kind === "damage" ||
        // resolved before the hit / before the turn instead
        e.kind === "mimic_type" || e.kind === "priority" || e.kind === "weather_boost" ||
        e.kind === "terrain_boost") continue;
      // Damage-dependent effects need a landed hit.
      if ((e.kind === "drain" || e.kind === "recoil" || e.kind === "leech") && !ctx.damage) continue;
      if (move.power && !ctx.hits && e.kind !== "protect" && e.kind !== "endure") continue;
      BE.runEffect(b, ctx, e, { whenChecked: true });
    }
    if (ctx.forceSwitch) yield* doForceSwitch(b, ctx.forceSwitch);
    if (BE.moveFlag(move, "recharge")) { /* handled by the recharge effect */ }
  }

  function spendPp(b, mon, slot) {
    if (!slot) return;
    slot.pp = Math.max(0, slot.pp - 1);
    b.emit("pp", { side: b.sideIndexOf(mon), uid: mon.uid, move: slot.id, pp: slot.pp, max: slot.ppMax });
    if (slot.pp === 0) BE.hook(b, mon, "onPpEmpty", { slot: slot });
  }

  function overdriveMove(b, mon) {
    const sp = b.species(mon);
    let id = mon.overdriveMove || sp.overdrive;
    if (!id) {
      const t = b.typesOf(mon)[0] || "normal";
      id = "od_" + t;
    }
    const m = moveData(id);
    const copy = U.merge({}, m);
    copy.overdriveOnly = true;
    copy.acc = null;
    copy.id = id;
    if (!copy.flags) copy.flags = {};
    copy.flags.protect_ok = false;
    return copy;
  }
  Battle.overdriveMove = overdriveMove;

  function* doForceSwitch(b, target) {
    const side = b.sideOf(target);
    if (b.kind === "wild" && side.index === 1) {
      b.msg("The wild " + b.plainName(target) + " bolted.");
      b.fled = true;
      b.over = true;
      b.outcome = "run";
      return;
    }
    const avail = [];
    for (let i = 0; i < side.party.length; i++) {
      const m = side.party[i];
      if (m && m.hp > 0 && side.activeUids.indexOf(m.uid) < 0) avail.push(i);
    }
    if (!avail.length) return;
    const slot = side.activeUids.indexOf(target.uid);
    const pick = U.pick(avail, b.rng);
    switchOut(b, target);
    b.msg(b.name(target) + " was dragged out of the fight!");
    switchIn(b, side.index, slot, pick, {});
  }

  // =============================================================
  // Agent Trio (SYSTEMS-SPEC §6)
  // =============================================================
  const AGENTS = {
    sleet: { id: "sleet", name: "SLEET", flag: "agent_sleet", cd: 4, perk: "perk_triage_sharp_triage", cut: 1, sfx: "agent_sleet", blurb: "Triage: read the room." },
    vigil: { id: "vigil", name: "VIGIL", flag: "agent_vigil", cd: 5, perk: "perk_escalate_escalation", cut: 1, sfx: "agent_vigil", blurb: "Escalation: patch it up." },
    arbiter: { id: "arbiter", name: "ARBITER", flag: "agent_arbiter", cd: 6, perk: "perk_adjudicate_iron_bell", cut: 2, sfx: "agent_arbiter", blurb: "Adjudication: everybody back to zero." },
    pippin: { id: "pippin", name: "PIPPIN", flag: "agent_pippin", cd: 6, perk: null, cut: 0, sfx: "agent_pippin", blurb: "Defer: it can wait." }
  };
  Battle.AGENTS = AGENTS;

  function agentUnlocked(b, id) {
    const a = AGENTS[id];
    if (!a) return false;
    if (b.opts.agents) return b.opts.agents.indexOf(id) >= 0;
    if (NS.Flags && NS.Flags.get) return !!NS.Flags.get(a.flag);
    return false;
  }
  function agentCooldown(b, id) {
    const a = AGENTS[id];
    let cd = a.cd;
    if (a.perk && b.perk(a.perk)) cd -= a.cut;
    cd += (b.diff.agentCd || 0);
    return Math.max(1, cd);
  }
  function agentsSilenced(b) {
    const hardened = NS.Flags && NS.Flags.get && NS.Flags.get("agents_hardened");
    if (hardened) return false;
    if (b.agentsSilent) return true;
    if (NS.Flags && NS.Flags.get && NS.Flags.get("agents_silent")) return true;
    return false;
  }
  Battle.agentAvailable = function (b, id) {
    if (!agentUnlocked(b, id)) return { ok: false, why: "locked" };
    if (agentsSilenced(b)) return { ok: false, why: "silent" };
    if (b.agentsJammed > 0) return { ok: false, why: "jammed" };
    if (b.rules.oneAgent && b.sides[0].agentUses > 0) return { ok: false, why: "arena" };
    const left = b.sides[0].agentCooldowns[id] || 0;
    if (left > 0) return { ok: false, why: "cooldown", turns: left };
    return { ok: true };
  };
  Battle.agentList = function (b) {
    const out = [];
    const ids = ["sleet", "vigil", "arbiter", "pippin"];
    for (let i = 0; i < ids.length; i++) {
      if (!agentUnlocked(b, ids[i])) continue;
      const st = Battle.agentAvailable(b, ids[i]);
      out.push({ id: ids[i], name: AGENTS[ids[i]].name, blurb: AGENTS[ids[i]].blurb, ok: st.ok, why: st.why, turns: st.turns || 0, cd: agentCooldown(b, ids[i]) });
    }
    return out;
  };

  // ARBITER above trainer level 20 is a free action: it fires and the
  // player still gets a move. The engine handles that at choose-time.
  Battle.agentIsFree = function (b, id) {
    return id === "arbiter" && b.trainerLevel() >= 20;
  };

  function runAgent(b, id, user) {
    const side = b.sides[0];
    const tl = b.trainerLevel();
    side.agentCooldowns[id] = agentCooldown(b, id);
    side.agentUses = (side.agentUses || 0) + 1;
    b.emit("agent", { id: id, name: AGENTS[id].name, cooldown: side.agentCooldowns[id], sfx: AGENTS[id].sfx });
    const foes = b.foesOf(user);

    if (id === "sleet") {
      b.msg("SLEET: triaging. Hold still.");
      for (let i = 0; i < foes.length; i++) {
        const f = foes[i];
        b.vol(f).revealed = true;
        b.emit("reveal", {
          side: 1, uid: f.uid, moves: (f.moves || []).map(function (m) { return m.id; }),
          ability: f.ability, gear: f.gear, hpNumbers: tl >= 15
        });
        const names = (f.moves || []).map(function (m) { return moveData(m.id).name; }).join(", ");
        b.msg(b.plainName(f) + ": " + (names || "no moves on file") + ". Ability " + (BE.abilityName(f.ability) || "unknown") + ".");
        BE.addStage(b, f, "spe", -2, user, {});
        if (tl >= 30) BE.addStage(b, f, "acc", -1, user, {});
      }
      if (tl >= 15) b.revealHp = true;
    } else if (id === "vigil") {
      const frac = b.perk("perk_escalate_escalation") ? (tl >= 15 ? 0.7 : 0.5) : (tl >= 15 ? 0.6 : 0.4);
      b.msg("VIGIL: escalating. Have you eaten today?");
      BE.cureStatus(b, user, tl >= 30);
      BE.heal(b, user, Math.floor(b.maxHp(user) * frac));
      if (tl >= 30) BE.clearStages(b, user, "negative");
    } else if (id === "arbiter") {
      b.msg("ARBITER: adjudicating. Everything back to how it was.");
      const all = b.activesOf(0).concat(b.activesOf(1));
      for (let i = 0; i < all.length; i++) BE.clearStages(b, all[i]);
      if (b.field.weather) { b.field.weather = null; b.field.weatherTurns = 0; b.emit("weather", { weather: null }); }
      if (b.field.terrain) { b.field.terrain = null; b.field.terrainTurns = 0; b.emit("terrain", { terrain: null }); }
      b.msg("The field was cleared.");
      if (tl >= 35) for (let i = 0; i < foes.length; i++) { b.vol(foes[i]).taunt = 1; }
    } else if (id === "pippin") {
      b.msg("PIPPIN: deferred. It can wait.");
      for (let i = 0; i < foes.length; i++) {
        b.vol(foes[i]).deferred = true;
        if (tl >= 40) BE.addStage(b, foes[i], "spe", -1, user, {});
      }
    }
  }

  // =============================================================
  // Bag items in battle
  // =============================================================
  function haveItem(id) {
    if (NS.Inventory && NS.Inventory.count) return NS.Inventory.count(id) > 0;
    return true;
  }
  function takeItem(id) {
    if (NS.Inventory && NS.Inventory.remove) NS.Inventory.remove(id, 1);
  }

  function useItem(b, id, target, o) {
    o = o || {};
    const it = itemData(id);
    const side = b.sides[0];
    side.itemsUsed++;
    if (!o.aiSide) takeItem(id);
    b.emit("item", { side: o.aiSide ? 1 : 0, item: id, name: it.name, uid: target ? target.uid : null });
    b.msg((o.aiSide ? (b.sides[1].trainer ? b.sides[1].trainer.name : "The foe") : "You") + " used the " + it.name + ".");

    if (it.kind === "heal" || it.kind === "cure" || it.kind === "consumable" || it.kind === "brew") {
      if (id === "revive_salts") {
        if (target && target.hp <= 0) {
          target.hp = Math.floor(b.maxHp(target) / 2);
          target._fainted = false;
          b.emit("hp", { side: b.sideIndexOf(target), uid: target.uid, from: 0, to: target.hp, max: b.maxHp(target), delta: target.hp, cause: "revive" });
          adjustFriendship(b, target, -10);
          b.msg(b.plainName(target) + " came round, and did not thank you for it.");
        }
        return true;
      }
      if (id === "full_restore" && target) {
        BE.cureStatus(b, target, true);
        BE.heal(b, target, b.maxHp(target), { quiet: true });
        b.msg(b.plainName(target) + " is right as rain.");
        return true;
      }
      if (it.amount && target) {
        let amt = it.amount;
        if (b.perk("perk_escalate_patch")) amt = Math.floor(amt * 1.25);
        BE.heal(b, target, amt);
        return true;
      }
      if (it.cures && target) {
        if (it.cures.indexOf("all") >= 0 || id === "panacea") BE.cureStatus(b, target, true);
        else for (let i = 0; i < it.cures.length; i++) if (target.status === it.cures[i]) BE.cureStatus(b, target, false);
        b.msg(b.plainName(target) + " is feeling better.");
        return true;
      }
    }
    // Weather jars, tonics and the odd bit of kit.
    if (id === "rain_jar") { b.setWeather("rain", 5, target); return true; }
    if (id === "sun_lamp") { b.setWeather("sun", 5, target); return true; }
    if (id === "fog_machine") { b.setWeather("fog", 5, target); return true; }
    if (id === "wind_whistle") { b.setWeather("wind", 5, target); return true; }
    if (/^tonic_/.test(id)) { BE.addStage(b, target, id.slice(6), 1, target, {}); return true; }
    if (id === "x_ray_card") {
      const foes = b.foesOf(target || b.activesOf(0)[0]);
      for (let i = 0; i < foes.length; i++) {
        b.vol(foes[i]).revealed = true;
        b.emit("reveal", { side: 1, uid: foes[i].uid, moves: (foes[i].moves || []).map(function (m) { return m.id; }), ability: foes[i].ability, gear: foes[i].gear });
      }
      b.msg("The card printed out everything you wanted to know.");
      return true;
    }
    if (id === "boombox") {
      if (b.kind === "wild") { b.msg("The Boombox did its worst. The wild one left."); b.fled = true; b.over = true; b.outcome = "run"; }
      else b.msg("It made a terrible noise and achieved nothing.");
      return true;
    }
    if (id === "music_box") {
      b.noFlee = 3;
      b.msg("The Music Box started up. Nothing wild is walking away from that.");
      return true;
    }
    if (it.kind === "cure" && target) { BE.cureStatus(b, target, true); return true; }
    b.msg("Nothing happened.");
    return false;
  }

  // =============================================================
  // Capture
  // =============================================================
  function* tryCatch(b, capsuleId, timing) {
    const foe = b.activesOf(1)[0];
    if (!foe) return false;
    takeItem(capsuleId);
    b.emit("anim", { name: "throw", side: 1, uid: foe.uid, capsule: capsuleId });
    b.msg("You lobbed a " + BE.itemName(capsuleId) + ".");
    const res = BE.capture(b, foe, capsuleId, { timing: timing });
    b.emit("catch", { uid: foe.uid, shakes: res.shakes, success: res.success, critical: res.critical, capsule: capsuleId, a: res.a });
    if (res.critical) b.msg("The capsule barely wobbled.");
    if (res.success) {
      b.msg("Gotcha! " + b.plainName(foe) + " was caught.");
      const c = BE.CAPSULES[capsuleId];
      if (c && c.friendship) foe.friendship = c.friendship;
      foe.metAt = { map: (NS.Overworld && NS.Overworld.state && NS.Overworld.state.map) || null, level: foe.level, ts: Date.now() };
      b.caught = foe;
      b.over = true;
      b.outcome = "catch";
      return true;
    }
    const lines = ["Not even close.", "So close! One more shake.", "It shook twice and thought better of it.", "Argh — it broke free at the last moment."];
    b.msg(lines[U.clamp(res.shakes, 0, 3)]);
    return false;
  }

  // =============================================================
  // Running away
  // =============================================================
  function tryRun(b, mon) {
    if (!b.rules.canRun) { b.msg("There is no walking away from this one."); return false; }
    if (b.noFlee > 0 && b.kind === "wild") { b.msg("Something is holding you here."); return false; }
    const v = b.vol(mon);
    if (v.trapped > 0) { b.msg("You cannot get away!"); return false; }
    const foe = b.activesOf(1)[0];
    b.runAttempts = (b.runAttempts || 0) + 1;
    if (b.kind !== "wild") { b.msg("You cannot run from a trainer with a point to prove."); return false; }
    const mine = BE.effectiveSpeed(b, mon), theirs = foe ? BE.effectiveSpeed(b, foe) : 1;
    const chance = U.clamp(0.5 + 0.35 * (mine / Math.max(1, theirs) - 1) + 0.12 * b.runAttempts, 0.15, 0.97);
    if (b.rng() < chance) {
      b.msg("You got away safely.");
      b.emit("flee", { ok: true });
      b.fled = true; b.over = true; b.outcome = "run";
      return true;
    }
    b.msg("You couldn't get away!");
    b.emit("flee", { ok: false });
    return false;
  }

  // =============================================================
  // Friendship, XP and levels
  // =============================================================
  function adjustFriendship(b, mon, delta) {
    if (!b.isPlayerSide(mon)) return;
    if (delta > 0) {
      if (BE.gearOf(b, mon) === "cat_bell" || mon.gear === "cat_bell") delta *= 2;
      if (b.perk("perk_escalate_bond")) delta = Math.round(delta * 1.5);
    }
    mon.friendship = U.clamp((mon.friendship || 70) + delta, 0, 255);
  }

  function recomputeStats(b, mon) {
    const sp = b.species(mon);
    const before = mon.stats.hp;
    mon.stats = BE.computeStats(sp.base || GENERIC_SPECIES.base, mon.level, mon.ivs, mon.temperament);
    const gain = mon.stats.hp - before;
    if (gain > 0 && mon.hp > 0) mon.hp += gain;
    mon.hp = U.clamp(mon.hp, 0, mon.stats.hp);
  }

  function grantXp(b, mon, amount) {
    if (mon.level >= 100) return;
    mon.exp = (mon.exp || 0) + amount;
    b.emit("xp", { side: 0, uid: mon.uid, amount: amount, exp: mon.exp, level: mon.level });
    b.msg(b.plainName(mon) + " gained " + amount + " XP.");
    const growth = b.growth(mon);
    while (mon.level < 100 && mon.exp >= BE.expForLevel(mon.level + 1, growth)) {
      mon.level++;
      recomputeStats(b, mon);
      adjustFriendship(b, mon, 1);
      b.emit("levelup", { side: 0, uid: mon.uid, level: mon.level, stats: mon.stats, max: b.maxHp(mon), hp: mon.hp });
      b.msg(b.plainName(mon) + " reached level " + mon.level + "!");
      const sp = b.species(mon);
      const ls = sp.learnset || [];
      for (let i = 0; i < ls.length; i++) {
        if (ls[i][0] !== mon.level) continue;
        const moveId = ls[i][1];
        if (b.moveSlot(mon, moveId)) continue;
        const md = moveData(moveId);
        if ((mon.moves || []).length < 4) {
          mon.moves.push({ id: moveId, pp: md.pp || 15, ppMax: md.pp || 15 });
          b.emit("learn", { side: 0, uid: mon.uid, move: moveId, name: md.name, auto: true });
          b.msg(b.plainName(mon) + " learnt " + md.name + "!");
        } else {
          b.pending.push({ kind: "learn", uid: mon.uid, move: moveId });
          b.emit("learn", { side: 0, uid: mon.uid, move: moveId, name: md.name, auto: false });
        }
      }
      queueEvolution(b, mon);
    }
  }

  function queueEvolution(b, mon) {
    const sp = b.species(mon);
    const evos = sp.evolutions || [];
    for (let i = 0; i < evos.length; i++) {
      const e = evos[i];
      let ok = false;
      if (e.method === "level" && mon.level >= (e.level || e.at || 999)) ok = true;
      else if (e.method === "friendship" && (mon.friendship || 0) >= (e.min || 200)) {
        ok = !e.time || (e.time === "night" ? b.isNight() : !b.isNight());
      } else if (e.method === "weather" && b.field.weather === e.weather && mon.level >= (e.level || e.at || 1)) ok = true;
      else if (e.method === "move" && b.moveSlot(mon, e.move || e.knows)) ok = true;
      else if (e.method === "time" && mon.level >= (e.level || e.at || 1)) ok = (e.phase || e.time) === "night" ? b.isNight() : !b.isNight();
      if (ok) {
        const already = b.pending.some(function (p) { return p.kind === "evolve" && p.uid === mon.uid; });
        if (!already) b.pending.push({ kind: "evolve", uid: mon.uid, to: e.to, from: mon.species });
        return;
      }
    }
  }

  function awardXp(b, foe) {
    const side = b.sides[0];
    const kindForXp = b.kind === "boss" ? "boss" : (b.kind === "wild" ? "wild" : "trainer");
    for (let i = 0; i < side.party.length; i++) {
      const m = side.party[i];
      if (!m || m.hp <= 0) continue;
      const participant = !!b.participants[m.uid];
      if (!participant && !b.rules.expShare) continue;
      const n = BE.xpFor(b, m, foe, { kind: kindForXp, participant: participant });
      b.expGained += n;
      grantXp(b, m, n);
    }
  }

  function trainerXp(b, n) {
    if (NS.Trainer && NS.Trainer.addXp) NS.Trainer.addXp(n);
    else if (NS.Flags && NS.Flags.add) NS.Flags.add("trainer_xp", n);
  }

  // =============================================================
  // Boss phases (SYSTEMS-SPEC §9)
  // =============================================================
  function* checkBossPhases(b) {
    if (!b.boss || !b.boss.phases) return;
    const enemy = b.sides[1];
    const mon = b.activesOf(1)[0];
    if (!mon) return;
    const frac = mon.hp / b.maxHp(mon);
    const phases = b.boss.phases;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      if (b.bossPhasesFired[i]) continue;
      const threshold = p.hpFrac !== undefined ? p.hpFrac : p.atHp;
      const byTurn = p.turn !== undefined && b.turn >= p.turn;
      if (!byTurn && !(threshold !== undefined && frac <= threshold)) continue;
      if (p.skipIf && NS.Flags && NS.Flags.get && NS.Flags.get(p.skipIf)) { b.bossPhasesFired[i] = true; continue; }
      b.bossPhasesFired[i] = true;
      b.bossPhase = i + 1;
      b.emit("phase", { index: i + 1, total: phases.length, uid: mon.uid, hpFrac: frac });
      if (p.immune) b.vol(mon).immuneTurns = p.immune;
      if (p.events) yield* runBossEvents(b, mon, p.events);
      if (p.script) {
        const gen = (NS.Story && NS.Story.bossScripts && NS.Story.bossScripts[p.script]) ||
          (NS.Story && NS.Story.npcScripts && NS.Story.npcScripts[p.script]);
        if (gen && NS.Script && NS.Script.run) {
          yield { type: "await", promise: NS.Script.run(gen, { battle: b, boss: mon, phase: i + 1 }, { nested: true }) };
        }
      }
    }
  }

  function* runBossEvents(b, mon, events) {
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (e.say) b.msg(e.say);
      if (e.setWeather) b.setWeather(e.setWeather, e.turns || 8, mon);
      if (e.setTerrain) b.setTerrain(e.setTerrain, e.turns || 8, mon);
      if (e.healSelf) {
        let frac = e.healSelf;
        const cap = b.perk("perk_adjudicate_phase_break") ? 0.15 : 0.30;
        frac = Math.min(frac, cap);
        BE.heal(b, mon, Math.floor(b.maxHp(mon) * frac));
      }
      if (e.boostSelf) {
        const keys = Object.keys(e.boostSelf);
        for (let k = 0; k < keys.length; k++) BE.addStage(b, mon, keys[k], e.boostSelf[keys[k]], mon, {});
      }
      if (e.summonAdd) {
        const add = Battle.makeMonster(e.summonAdd.species, e.summonAdd.level || mon.level, { rng: b.rng });
        b.sides[1].party.push(add);
        const slot = b.sides[1].activeUids.length;
        b.sides[1].slots = Math.max(b.sides[1].slots, slot + 1);
        switchIn(b, 1, slot, b.sides[1].party.length - 1, {});
        b.msg("A second one stepped up.");
      }
      if (e.changeForm) {
        const keep = e.changeForm.keepHp !== false;
        const oldMax = b.maxHp(mon);
        const ratio = mon.hp / oldMax;
        mon.species = e.changeForm.speciesId || e.changeForm.species;
        mon.typesOverride = null;
        recomputeStats(b, mon);
        mon.hp = keep ? Math.max(1, Math.round(b.maxHp(mon) * ratio)) : b.maxHp(mon);
        b.emit("switch", { side: 1, slot: 0, uid: mon.uid, species: mon.species, name: b.plainName(mon), level: mon.level, hp: mon.hp, max: b.maxHp(mon), status: mon.status, overdrive: mon.overdrive || 0, types: b.typesOf(mon), form: true });
        b.msg(b.plainName(mon) + " wore a different shape.");
      }
      if (e.disableMove) {
        b.vol(mon).disabled[e.disableMove] = e.turns || 2;
        const foes = b.foesOf(mon);
        for (let f = 0; f < foes.length; f++) b.vol(foes[f]).disabled[e.disableMove] = e.turns || 2;
        b.msg(moveData(e.disableMove).name + " stopped working.");
      }
      if (e.jamAgents) { b.agentsJammed = e.jamAgents; b.emit("agent", { jammed: e.jamAgents }); b.msg("Your agents have gone quiet."); }
      if (e.silenceAgents) {
        const hardened = NS.Flags && NS.Flags.get && NS.Flags.get("agents_hardened");
        if (!hardened) { b.agentsSilent = true; b.emit("agent", { silent: true }); b.msg("The agents have stopped talking altogether."); }
        else b.msg("SLEET: still here. Try harder.");
      }
      if (e.rewriteChart) {
        b.chartOverride = b.chartOverride || {};
        const row = b.chartOverride[e.rewriteChart.atk] || (b.chartOverride[e.rewriteChart.atk] = {});
        row[e.rewriteChart.def] = e.rewriteChart.mult;
        b.emit("field", { chart: e.rewriteChart });
        b.msg("The rules of the matchup were rewritten on the whiteboard.");
      }
      if (e.forceOverdrive) { mon.overdrive = 100; b.emit("overdrive", { side: 1, uid: mon.uid, value: 100, reason: "boss" }); }
    }
  }

  // =============================================================
  // End of turn
  // =============================================================
  function* endOfTurn(b) {
    const order = turnOrderMons(b);
    for (let i = 0; i < order.length; i++) {
      const mon = order[i];
      if (!mon || mon.hp <= 0) continue;
      const v = b.vol(mon);
      const max = b.maxHp(mon);

      // Weather.
      const w = b.field.weather;
      if (w && !BE.weatherIgnored(b, mon)) {
        const types = b.typesOf(mon);
        if (w === "wind" && types.indexOf("bug") >= 0 && BE.hookAllows(b, mon, "onChip", { source: "weather" }) !== false) {
          b.msg("The wind buffets " + b.name(mon) + ".");
          BE.dealDamage(b, mon, Math.floor(max / 16), { cause: "weather" });
        } else if (w === "snow" && types.indexOf("rock") < 0 && types.indexOf("ground") < 0 && BE.hookAllows(b, mon, "onChip", { source: "weather" }) !== false) {
          b.msg("The snow bites at " + b.name(mon) + ".");
          BE.dealDamage(b, mon, Math.floor(max / 16), { cause: "weather" });
        } else if (w === "sun" && mon.status === "frz") {
          BE.cureStatus(b, mon, false);
          b.msg("The sun thawed " + b.name(mon) + ".");
        }
      }
      if (mon.hp <= 0) continue;

      // Terrain.
      if (b.field.terrain === "grass" && BE.grounded(b, mon) && BE.abilityOf(b, mon) !== "deep_roots") {
        BE.heal(b, mon, Math.floor(max / 16), { quiet: true, cause: "terrain" });
      }

      // Status chip.
      if (mon.status === "brn") {
        let chip = Math.floor(max / 16);
        if (BE.gearOf(b, mon) === "silk_wrap") chip = Math.floor(chip / 2);
        b.msg(b.name(mon) + " is hurt by its burn.");
        BE.dealDamage(b, mon, chip, { cause: "status" });
      } else if (mon.status === "psn") {
        b.msg(b.name(mon) + " is hurt by poison.");
        BE.dealDamage(b, mon, Math.floor(max / 8), { cause: "status" });
      } else if (mon.status === "tox") {
        mon.statusTurns = (mon.statusTurns || 1);
        b.msg(b.name(mon) + " is hurt badly by poison.");
        BE.dealDamage(b, mon, Math.floor(max * mon.statusTurns / 16), { cause: "status" });
        mon.statusTurns = Math.min(15, mon.statusTurns + 1);
      }
      if (mon.hp <= 0) continue;

      // Trap chip.
      if (v.trapped > 0) {
        v.trapped--;
        if (v.trapped <= 0) b.msg(b.name(mon) + " is free again.");
        else {
          b.msg(b.name(mon) + " is caught fast.");
          BE.dealDamage(b, mon, Math.floor(max / 8), { cause: "trap" });
        }
      }
      if (mon.hp <= 0) continue;
      BE.hook(b, mon, "onEndTurn", {});
      BE.hook(b, mon, "onHpChanged", {});
    }

    // Field counters.
    if (b.field.weatherTurns > 0 && b.field.weatherTurns < 999) {
      b.field.weatherTurns--;
      if (b.field.weatherTurns <= 0) {
        b.msg(BE.WEATHER_NAME[b.field.weather] + " eased off.");
        b.field.weather = null;
        b.emit("weather", { weather: null });
      }
    }
    if (b.field.terrainTurns > 0 && b.field.terrainTurns < 999) {
      b.field.terrainTurns--;
      if (b.field.terrainTurns <= 0) {
        b.msg("The ground went back to normal.");
        b.field.terrain = null;
        b.emit("terrain", { terrain: null });
      }
    }
    for (let s = 0; s < 2; s++) {
      const side = b.sides[s];
      const keys = ["phys", "spec"];
      for (let k = 0; k < keys.length; k++) {
        if (side.screens[keys[k]] > 0) {
          side.screens[keys[k]]--;
          if (side.screens[keys[k]] === 0) b.emit("field", { side: s, screen: keys[k], turns: 0 });
        }
      }
      const cds = Object.keys(side.agentCooldowns);
      for (let c = 0; c < cds.length; c++) {
        if (side.agentCooldowns[cds[c]] > 0) {
          side.agentCooldowns[cds[c]]--;
          b.emit("cooldown", { agent: cds[c], turns: side.agentCooldowns[cds[c]] });
        }
      }
    }
    if (b.agentsJammed > 0) {
      b.agentsJammed--;
      if (b.agentsJammed === 0) { b.emit("agent", { jammed: 0 }); b.msg("Your agents are back."); }
    }
    if (b.noFlee > 0) b.noFlee--;

    // Per-turn volatile reset.
    const all = b.sides[0].party.concat(b.sides[1].party);
    for (let i = 0; i < all.length; i++) {
      const v = b.vols[all[i].uid];
      if (!v) continue;
      if (!v.protectHeld) v.protect = false;
      v.guard = false;
      v.endure = false;
      v.moved = false;
      v.flinch = false;
      v.deferred = false;
      if (v.immuneTurns > 0) v.immuneTurns--;
      if (v.abilityOff > 0) v.abilityOff--;
      if (v.taunt > 0) v.taunt--;
      const dk = Object.keys(v.disabled);
      for (let d = 0; d < dk.length; d++) { if (v.disabled[dk[d]] > 0) v.disabled[dk[d]]--; }
      const ck = Object.keys(v.cooldowns);
      for (let c = 0; c < ck.length; c++) { if (v.cooldowns[ck[c]] > 0) v.cooldowns[ck[c]]--; }
      v.turnsIn++;
    }
  }

  function turnOrderMons(b) {
    const list = b.activesOf(0).concat(b.activesOf(1));
    list.sort(function (a, c) { return BE.effectiveSpeed(b, c) - BE.effectiveSpeed(b, a); });
    return list;
  }

  // =============================================================
  // Faints and replacements
  // =============================================================
  function* handleFaints(b) {
    for (let s = 0; s < 2; s++) {
      const side = b.sides[s];
      for (let slot = 0; slot < side.activeUids.length; slot++) {
        const mon = b.byUid(side.activeUids[slot]);
        if (!mon || mon.hp > 0 || mon._faintHandled) continue;
        mon._faintHandled = true;
        if (s === 1) {
          awardXp(b, mon);
          const alliesUp = b.activesOf(0).filter(function (m) { return m.hp > 0; });
          for (let i = 0; i < alliesUp.length; i++) BE.gainOverdrive(b, alliesUp[i], BE.OD.ko, "ko");
        } else {
          adjustFriendship(b, mon, -5);
          const allies = b.activesOf(0).filter(function (m) { return m.hp > 0; });
          for (let i = 0; i < allies.length; i++) BE.gainOverdrive(b, allies[i], BE.OD.allyFaint, "ally-faint");
          if (b.perk("perk_escalate_incident_commander")) {
            for (let i = 0; i < b.sides[0].party.length; i++) {
              const m = b.sides[0].party[i];
              if (m && m.hp > 0) { BE.addStage(b, m, "def", 1, m, { quiet: true }); BE.addStage(b, m, "spd", 1, m, { quiet: true }); }
            }
            b.msg("Incident Commander: the rest of the party closed ranks.");
          }
        }
        const avail = [];
        for (let i = 0; i < side.party.length; i++) {
          const m = side.party[i];
          if (m && m.hp > 0 && side.activeUids.indexOf(m.uid) < 0) avail.push(i);
        }
        if (!avail.length) { side.activeUids[slot] = null; continue; }
        if (s === 0 && !b.autoPlayer) {
          b.emit("menu", { kind: "switch", side: 0, slot: slot, forced: true, options: avail });
          const pick = yield { type: "switch", side: 0, slot: slot, forced: true, options: avail };
          switchIn(b, 0, slot, pick, {});
        } else {
          const foe = b.activesOf(1 - s)[0];
          const pick = s === 0 ? AI.chooseSwitchIn(b, side, foe) : AI.chooseSwitchIn(b, side, b.activesOf(0)[0]);
          switchIn(b, s, slot, pick >= 0 ? pick : avail[0], {});
        }
      }
    }
  }

  function sideAlive(b, s) {
    const p = b.sides[s].party;
    for (let i = 0; i < p.length; i++) if (p[i] && p[i].hp > 0) return true;
    return false;
  }

  // =============================================================
  // Action ordering and execution
  // =============================================================
  function actionBracket(b, act, mon) {
    if (act.type === "run") return 8;
    if (act.type === "item") return 7;
    if (act.type === "agent") return 7;
    if (act.type === "capsule") return 7;
    if (act.type === "switch") return BE.gearOf(b, mon) === "rail_pass" ? 7 : 6;
    if (act.type === "guard") return 5;
    let move;
    if (act.type === "overdrive") move = overdriveMove(b, mon);
    else if (act.type === "struggle") move = STRUGGLE;
    else {
      const slot = (mon.moves || [])[act.index];
      const v = b.vol(mon);
      move = moveData(v.chargeMoveId || (slot && slot.id));
    }
    let pri = move.priority || 0;
    // `priority {delta}` as a move EFFECT (MEADOW's Zoomies), which may
    // carry a `when:` of its own — evaluated here so the bracket is
    // right before anybody acts.
    const pe = BE.moveFlag(move, "priority", b, { user: mon, move: move, target: (b.foesOf(mon) || [])[0] || null });
    if (pe) pri += (pe.delta === undefined ? 1 : pe.delta);
    const a = BE.abilityImpl(BE.abilityOf(b, mon));
    if (a && a.onModifyPriority) { const r = a.onModifyPriority(b, mon, { move: move }); if (typeof r === "number") pri += r; }
    const v2 = b.vol(mon);
    if (v2.quickDrawUsed !== true && b.isPlayerSide(mon) && b.perk("perk_triage_quick_draw") && !b.quickDrawSpent) {
      b.quickDrawSpent = true; v2.quickDrawUsed = true; pri += 1;
    }
    if (v2.deferred) pri -= 1;
    return pri;
  }

  function sortActions(b, queue) {
    for (let i = 0; i < queue.length; i++) {
      queue[i].bracket = actionBracket(b, queue[i].action, queue[i].mon);
      queue[i].speed = BE.effectiveSpeed(b, queue[i].mon);
      queue[i].tempBias = BE.temperament(queue[i].mon.temperament).up === "spe" ? 1 : (BE.temperament(queue[i].mon.temperament).down === "spe" ? -1 : 0);
      queue[i].coin = b.rng();
    }
    queue.sort(function (a, c) {
      if (c.bracket !== a.bracket) return c.bracket - a.bracket;
      if (Math.abs(c.speed - a.speed) > 1e-9) return c.speed - a.speed;
      if (c.tempBias !== a.tempBias) return c.tempBias - a.tempBias;   // keen-eyed types edge it
      return c.coin - a.coin;
    });
    return queue;
  }

  function* execAction(b, entry) {
    const mon = entry.mon, act = entry.action;
    if (!mon || mon.hp <= 0) return;
    const side = b.sides[entry.side];
    if (act.type === "switch") {
      const target = side.party[act.index];
      if (!target || target.hp <= 0) return;
      switchOut(b, mon);
      const slot = side.activeUids.indexOf(mon.uid);
      if (entry.side === 0 && !b.perk("perk_escalate_isolation")) { /* the free hit is simply the turn cost */ }
      switchIn(b, entry.side, slot < 0 ? 0 : slot, act.index, {});
      return;
    }
    if (act.type === "item") { useItem(b, act.id, act.target ? b.byUid(act.target) : mon, { aiSide: entry.side === 1 }); return; }
    if (act.type === "capsule") { yield* tryCatch(b, act.id, act.timing); return; }
    if (act.type === "run") { tryRun(b, mon); return; }
    if (act.type === "guard") {
      b.vol(mon).guard = true;
      b.emit("guard", { side: 0, uid: mon.uid });
      b.msg("You put yourself between them. " + b.plainName(mon) + " braced.");
      BE.gainOverdrive(b, mon, 10, "guard");
      return;
    }
    if (act.type === "agent") { runAgent(b, act.id, mon); return; }
    if (act.type === "overdrive" || act.type === "move" || act.type === "struggle") {
      if (entry.side === 1) {
        const md = act.type === "move" ? moveData(((mon.moves || [])[act.index] || {}).id) : null;
        if (md) AI.remember(b, b.sides[0], md, md.cat);
      } else {
        const md = act.type === "move" ? moveData(((mon.moves || [])[act.index] || {}).id) : null;
        AI.remember(b, b.sides[1], md, md ? md.cat : null);
      }
      yield* useMove(b, mon, act);
      if (b.boss) yield* checkBossPhases(b);
      return;
    }
  }

  // =============================================================
  // Gym house rules (SYSTEMS-SPEC §9). Data shape (NEW, trainer.house):
  //   { weather, terrain, permanent, screens:'phys'|'spec',
  //     reboot:true, contactStatus:{status,chance},
  //     jamAgent:{id,turns}, jamUntilSuper:true, note:'door sign text' }
  // =============================================================
  function applyHouseRules(b) {
    const t = b.sides[1].trainer;
    if (!t || !t.house) return;
    const h = t.house;
    b.house = h;
    if (h.note) b.msg("The gym door says: " + h.note);
    if (h.weather) { b.setWeather(h.weather, h.permanent ? 999 : (h.turns || 5), null); if (h.permanent) b.field.weatherTurns = 999; }
    if (h.terrain) { b.setTerrain(h.terrain, h.permanent ? 999 : (h.turns || 5), null); if (h.permanent) b.field.terrainTurns = 999; }
    if (h.reboot) b.sides[1].rebootLeft = 1;
    if (h.jamAgent) {
      b.sides[0].agentCooldowns[h.jamAgent.id] = h.jamAgent.turns || 3;
      b.emit("cooldown", { agent: h.jamAgent.id, turns: h.jamAgent.turns || 3, house: true });
      b.msg("This arena will not let " + (AGENTS[h.jamAgent.id] ? AGENTS[h.jamAgent.id].name : h.jamAgent.id) + " through.");
    }
    if (h.jamUntilSuper) {
      b.agentsJammed = 999;
      b.jamUntilSuper = true;
      b.emit("agent", { jammed: 999, untilSuper: true });
      b.msg("Every agent is jammed. Land something they cannot resist and they will be back.");
    }
  }
  // The house `screens` rule re-applies to each of the leader's monsters.
  function houseOnEnemyEnter(b, mon) {
    const h = b.house;
    if (!h) return;
    if (h.screens) {
      b.sides[1].screens[h.screens] = 5;
      b.emit("field", { side: 1, screen: h.screens, turns: 5 });
      b.msg("House rules: " + (h.screens === "phys" ? "a physical" : "a special") + " screen is already up.");
    }
  }
  // Ada's Sysadmin's Reboot: a free +3-priority action, once per battle.
  function maybeReboot(b) {
    const side = b.sides[1];
    if (!side.rebootLeft) return;
    const mon = b.activesOf(1)[0];
    if (!mon || mon.hp <= 0) return;
    const v = b.vol(mon);
    let bad = 0, dry = 0;
    for (let i = 0; i < BE.STAGE_STATS.length; i++) if (v.stages[BE.STAGE_STATS[i]] < 0) bad++;
    const moves = mon.moves || [];
    for (let i = 0; i < moves.length; i++) if (moves[i].pp <= 0) dry++;
    if (bad < 2 && dry < 2) return;
    side.rebootLeft = 0;
    b.msg("Sysadmin's Reboot. Everything back to how she left it.");
    BE.clearStages(b, mon, "negative");
    for (let i = 0; i < moves.length; i++) {
      moves[i].pp = moves[i].ppMax;
      b.emit("pp", { side: 1, uid: mon.uid, move: moves[i].id, pp: moves[i].pp, max: moves[i].ppMax });
    }
  }

  // =============================================================
  // The main flow
  // =============================================================
  function* flow(b) {
    b.emit("intro", {
      kind: b.kind, trainer: b.sides[1].trainer ? { id: b.sides[1].trainer.id, name: b.sides[1].trainer.name, cls: b.sides[1].trainer.cls, sprite: b.sides[1].trainer.sprite } : null,
      doubles: !!b.rules.doubles, weather: b.field.weather, terrain: b.field.terrain,
      music: b.opts.music || (b.kind === "boss" ? "battle_boss" : b.sides[1].trainer ? (b.sides[1].trainer.leader ? "battle_gym" : "battle_trainer") : "battle_wild"),
      canRun: b.rules.canRun, canCatch: b.rules.canCatch, escort: !!b.escort, difficulty: b.difficulty,
      bossPhases: b.boss && b.boss.phases ? b.boss.phases.length : 0,
      house: b.sides[1].trainer && b.sides[1].trainer.house ? b.sides[1].trainer.house : null
    });
    if (b.sides[1].trainer && b.sides[1].trainer.intro) {
      const intro = b.sides[1].trainer.intro;
      for (let i = 0; i < intro.length; i++) b.msg(intro[i]);
    }
    applyHouseRules(b);

    // Send out.
    const slots0 = Math.min(b.sides[0].slots, b.sides[0].party.filter(function (m) { return m.hp > 0; }).length) || 1;
    const slots1 = Math.min(b.sides[1].slots, b.sides[1].party.length) || 1;
    for (let i = 0; i < slots1; i++) {
      const idx = firstHealthy(b.sides[1], i);
      if (idx >= 0) switchIn(b, 1, i, idx, { first: true });
    }
    for (let i = 0; i < slots0; i++) {
      const idx = firstHealthy(b.sides[0], i);
      if (idx >= 0) switchIn(b, 0, i, idx, { first: true });
    }
    if (b.boss && b.boss.overdriveStart !== undefined) {
      const boss = b.activesOf(1)[0];
      if (boss) { boss.overdrive = b.boss.overdriveStart || b.diff.bossOd; b.emit("overdrive", { side: 1, uid: boss.uid, value: boss.overdrive, reason: "boss" }); }
    } else if (b.kind === "boss") {
      const boss = b.activesOf(1)[0];
      if (boss) { boss.overdrive = b.diff.bossOd; b.emit("overdrive", { side: 1, uid: boss.uid, value: boss.overdrive, reason: "boss" }); }
    }
    if (b.signalAgitation || (b.opts.signal && b.opts.signal > 0.6)) {
      const foes = b.activesOf(1);
      for (let i = 0; i < foes.length; i++) BE.gainOverdrive(b, foes[i], 10, "signal");
    }
    if (b.boss) yield* checkBossPhases(b);

    let guard = 0;
    while (!b.over && guard++ < 500) {
      b.turn++;
      b.emit("turn", { n: b.turn, weather: b.field.weather, terrain: b.field.terrain });
      maybeReboot(b);

      const queue = [];
      // Player side chooses.
      for (let slot = 0; slot < b.sides[0].activeUids.length; slot++) {
        const mon = b.byUid(b.sides[0].activeUids[slot]);
        if (!mon || mon.hp <= 0) continue;
        let act;
        if (b.autoPlayer) act = AI.choose(b, mon, { tier: b.sides[0].ai });
        else {
          b.emit("menu", { kind: "action", side: 0, slot: slot, uid: mon.uid, turn: b.turn });
          act = yield { type: "action", side: 0, slot: slot, uid: mon.uid };
          // A free ARBITER fires immediately and the player picks again.
          while (act && act.type === "agent" && Battle.agentIsFree(b, act.id)) {
            runAgent(b, act.id, mon);
            b.emit("menu", { kind: "action", side: 0, slot: slot, uid: mon.uid, turn: b.turn, afterAgent: true });
            act = yield { type: "action", side: 0, slot: slot, uid: mon.uid };
          }
        }
        if (!act) continue;
        // Instant actions that end the battle outright resolve in the queue.
        queue.push({ side: 0, slot: slot, mon: mon, action: act });
      }
      if (b.over) break;
      // Enemy side chooses.
      for (let slot = 0; slot < b.sides[1].activeUids.length; slot++) {
        const mon = b.byUid(b.sides[1].activeUids[slot]);
        if (!mon || mon.hp <= 0) continue;
        const act = AI.choose(b, mon, { tier: b.sides[1].ai });
        queue.push({ side: 1, slot: slot, mon: mon, action: act });
      }

      sortActions(b, queue);
      if (queue.length) b.firstMover = queue[0].mon.uid;
      b.emit("order", { order: queue.map(function (q) { return { uid: q.mon.uid, side: q.side, bracket: q.bracket }; }) });

      for (let i = 0; i < queue.length && !b.over; i++) {
        const entry = queue[i];
        if (!entry.mon || entry.mon.hp <= 0) continue;
        yield* execAction(b, entry);
        yield* handleFaints(b);
        if (!sideAlive(b, 0) || !sideAlive(b, 1)) { b.over = true; break; }
      }
      if (b.over) break;

      yield* endOfTurn(b);
      yield* handleFaints(b);
      if (!sideAlive(b, 0) || !sideAlive(b, 1)) b.over = true;
      if (b.boss) yield* checkBossPhases(b);
    }

    yield* finish(b);
  }

  // First party member that can fight and is not already on the field.
  function firstHealthy(side) {
    for (let i = 0; i < side.party.length; i++) {
      const m = side.party[i];
      if (!m || m.hp <= 0) continue;
      if (side.activeUids.indexOf(m.uid) >= 0) continue;
      return i;
    }
    return -1;
  }

  function* finish(b) {
    let outcome = b.outcome;
    if (!outcome) outcome = sideAlive(b, 1) ? (sideAlive(b, 0) ? "run" : "lose") : "win";
    b.outcome = outcome;

    if (outcome === "win") {
      const t = b.sides[1].trainer;
      if (t) {
        if (t.lose) for (let i = 0; i < t.lose.length; i++) b.msg(t.lose[i]);
        let payout = t.payout;
        if (!payout) {
          let top = 0;
          for (let i = 0; i < b.sides[1].party.length; i++) top = Math.max(top, b.sides[1].party[i].level);
          payout = top * (t.leader ? 120 : 60);
        }
        const tier = rematchTier(b, t);
        if (tier) payout = Math.floor(payout * (1 + tier * 0.25));
        if (b.perk("perk_adjudicate_ledger_keeper")) payout = Math.floor(payout * 1.25);
        b.moneyGained = payout;
        b.emit("payout", { money: payout, trainer: t.id || null, tier: tier });
        b.msg("You collected " + (U.fmtMoney ? U.fmtMoney(payout) : payout + " credits") + ".");
        if (NS.Inventory && NS.Inventory.addMoney) NS.Inventory.addMoney(payout);
        else if (NS.Inventory && NS.Inventory.money !== undefined) NS.Inventory.money += payout;
        trainerXp(b, t.leader ? 25 : 5);
        // Gym / gear friendship bump.
        if (t.leader) {
          for (let i = 0; i < b.sides[0].party.length; i++) if (b.sides[0].party[i]) adjustFriendship(b, b.sides[0].party[i], 3);
        }
      } else {
        trainerXp(b, 1);
      }
      b.msg(b.kind === "wild" ? "The wild one had enough and left." : "That's that, then.");
    } else if (outcome === "lose") {
      const t = b.sides[1].trainer;
      if (t && t.win) for (let i = 0; i < t.win.length; i++) b.msg(t.win[i]);
      b.msg("You are out of monsters. Time to regroup.");
    } else if (outcome === "catch") {
      trainerXp(b, 2);
      awardXp(b, b.caught);
    }

    const result = {
      outcome: outcome,
      won: outcome === "win" || outcome === "catch",
      fled: outcome === "run",
      lost: outcome === "lose",
      caught: b.caught || null,
      expGained: b.expGained,
      moneyGained: b.moneyGained,
      turns: b.turn,
      pending: b.pending,
      participants: Object.keys(b.participants),
      seed: b.seed,
      difficulty: b.difficulty,
      kind: b.kind,
      trainerId: b.sides[1].trainer ? b.sides[1].trainer.id : null
    };
    b.result = result;
    // Tidy the volatile bookkeeping off the live party objects.
    const all = b.sides[0].party.concat(b.sides[1].party);
    for (let i = 0; i < all.length; i++) { if (all[i]) { delete all[i]._faintHandled; delete all[i]._fainted; dropMimic(all[i]); all[i].overdrive = b.rules.overdriveCarry ? all[i].overdrive : 0; } }
    b.emit("end", { result: result });
    return result;
  }

  function rematchTier(b, t) {
    if (!t || !t.id) return 0;
    if (NS.Flags && NS.Flags.get) return Number(NS.Flags.get("rematch_" + t.id)) || 0;
    return 0;
  }

  // =============================================================
  // Engine wrapper — the object the scene (or a test) drives
  // =============================================================
  Battle.create = function (opts) {
    const b = createState(opts);
    attachApi(b);
    // Per-battle type-chart override (Mo's `rewriteChart` boss event).
    b.typeMult = function (atkType, defTypes) {
      let m = NS.Data && NS.Data.typeMultiplier ? NS.Data.typeMultiplier(atkType, defTypes) : 1;
      if (b.chartOverride && b.chartOverride[atkType]) {
        const row = b.chartOverride[atkType];
        for (let i = 0; i < defTypes.length; i++) {
          if (row[defTypes[i]] !== undefined) {
            const base = (NS.Data && NS.Data.typeChart && NS.Data.typeChart[atkType] && NS.Data.typeChart[atkType][defTypes[i]]);
            m = m / (base === undefined ? 1 : base) * row[defTypes[i]];
          }
        }
      }
      return m;
    };

    const gen = flow(b);
    const engine = {
      b: b, state: b, log: b.log, cursor: 0,
      request: null, done: false, result: null, waiting: false,
      onEvents: null
    };

    function pump(input) {
      let r;
      for (;;) {
        try { r = gen.next(input); }
        catch (e) {
          NS.warn && NS.warn("battle: engine threw — " + (e && e.message));
          b.msg("Something went wrong in the engine. Calling it a draw.");
          b.result = { outcome: "run", won: false, fled: true, caught: null, expGained: 0, moneyGained: 0, turns: b.turn, pending: [], error: String(e && e.message) };
          b.emit("end", { result: b.result });
          engine.done = true; engine.result = b.result; engine.request = null;
          if (engine.onEvents) engine.onEvents();
          return;
        }
        input = undefined;
        if (r.done) {
          engine.done = true;
          engine.result = b.result;
          engine.request = null;
          if (engine.onEvents) engine.onEvents();
          return;
        }
        const val = r.value;
        if (!val) continue;
        if (val.type === "await" && val.promise && val.promise.then) {
          engine.waiting = true;
          val.promise.then(function (v) { engine.waiting = false; pump(v); }, function () { engine.waiting = false; pump(); });
          if (engine.onEvents) engine.onEvents();
          return;
        }
        if (val.type === "action" || val.type === "switch") {
          engine.request = val;
          if (engine.onEvents) engine.onEvents();
          return;
        }
      }
    }

    engine.start = function () { if (!engine.started) { engine.started = true; pump(); } return engine; };
    engine.drain = function () {
      const out = b.log.slice(engine.cursor);
      engine.cursor = b.log.length;
      return out;
    };
    engine.peek = function () { return b.log.slice(engine.cursor); };

    // What may the player do right now?
    engine.options = function () {
      const req = engine.request;
      if (!req) return null;
      const side = b.sides[0];
      const mon = req.uid ? b.byUid(req.uid) : b.byUid(side.activeUids[req.slot]);
      if (req.type === "switch") {
        return { kind: "switch", forced: true, slot: req.slot, party: side.party, options: req.options };
      }
      const v = mon ? b.vol(mon) : null;
      const moves = [];
      if (mon) {
        const list = mon.moves || [];
        for (let i = 0; i < list.length; i++) {
          const md = moveData(list[i].id);
          const cooling = v.cooldowns[list[i].id] > 0 ? v.cooldowns[list[i].id] : 0;
          const disabled = list[i].pp <= 0 || (v.disabled[list[i].id] > 0) || cooling > 0 ||
            (v.choiceLock && v.choiceLock !== list[i].id) || (v.taunt > 0 && md.cat === "status");
          moves.push({ index: i, id: list[i].id, name: md.name, type: md.type, cat: md.cat, pp: list[i].pp, ppMax: list[i].ppMax, power: md.power, acc: md.acc, disabled: !!disabled, cooldown: cooling, desc: md.desc });
        }
      }
      const switches = [];
      for (let i = 0; i < side.party.length; i++) {
        const m = side.party[i];
        if (!m) continue;
        switches.push({ index: i, uid: m.uid, name: b.plainName(m), level: m.level, hp: m.hp, max: b.maxHp(m), status: m.status, species: m.species, active: side.activeUids.indexOf(m.uid) >= 0, ok: m.hp > 0 && side.activeUids.indexOf(m.uid) < 0 && !(v && v.trapped > 0) });
      }
      return {
        kind: "action", slot: req.slot, mon: mon, moves: moves, switches: switches,
        canRun: b.rules.canRun && b.kind === "wild" && !(v && v.trapped > 0),
        canCatch: b.rules.canCatch && !b.rules.noItems,
        canItems: !b.rules.noItems && (b.kind === "wild" || side.itemsUsed < (b.diff.bagLimit === undefined ? Infinity : b.diff.bagLimit)),
        canGuard: !!b.escort,
        agents: Battle.agentList(b),
        overdrive: mon && mon.overdrive >= 100 && b.overdriveActive(mon) && BE.gearOf(b, mon) !== "kevlar_waistcoat",
        overdriveMove: mon ? overdriveMove(b, mon) : null,
        trapped: !!(v && v.trapped > 0)
      };
    };

    engine.validate = function (action) {
      const req = engine.request;
      if (!req) return "not waiting for an action";
      if (req.type === "switch") {
        const i = typeof action === "number" ? action : (action && action.index);
        const side = b.sides[0];
        if (typeof i !== "number" || !side.party[i] || side.party[i].hp <= 0) return "that one cannot fight";
        if (side.activeUids.indexOf(side.party[i].uid) >= 0) return "already out";
        return null;
      }
      const o = engine.options();
      if (!action || !action.type) return "no action";
      switch (action.type) {
        case "move": {
          const m = o.moves[action.index];
          if (!m) return "no such move";
          if (m.disabled) return "that move cannot be used";
          return null;
        }
        case "struggle": return null;
        case "switch": {
          const s = o.switches[action.index];
          if (!s || !s.ok) return "cannot switch to that";
          return null;
        }
        case "item": return o.canItems && haveItem(action.id) ? null : "no item";
        case "capsule": return o.canCatch && haveItem(action.id) ? null : "cannot catch here";
        case "run": return o.canRun ? null : "cannot run";
        case "guard": return o.canGuard ? null : "no escort to guard";
        case "overdrive": return o.overdrive ? null : "Overdrive is not ready";
        case "agent": {
          const st = Battle.agentAvailable(b, action.id);
          return st.ok ? null : ("agent unavailable: " + st.why);
        }
        default: return "unknown action";
      }
    };

    engine.choose = function (action) {
      if (engine.done || !engine.request) return { error: "not waiting" };
      const err = engine.validate(action);
      if (err) return { error: err };
      const req = engine.request;
      engine.request = null;
      if (req.type === "switch") pump(typeof action === "number" ? action : action.index);
      else pump(action);
      return { ok: true };
    };

    // Convenience for scripts/tests: pick for the player with the AI.
    engine.autoChoose = function () {
      const req = engine.request;
      if (!req) return null;
      const side = b.sides[0];
      if (req.type === "switch") {
        const pick = AI.chooseSwitchIn(b, side, b.activesOf(1)[0]);
        return engine.choose(pick >= 0 ? pick : req.options[0]);
      }
      const mon = b.byUid(req.uid || side.activeUids[req.slot]);
      let act = AI.choose(b, mon, { tier: side.ai || "greedy" });
      if (engine.validate(act)) act = { type: "move", index: 0 };
      if (engine.validate(act)) act = { type: "struggle" };
      return engine.choose(act);
    };

    return engine;
  };

  // Run an engine to completion with the AI playing both sides.
  Battle.autoRun = function (engine, cap) {
    engine.start();
    let guard = 0;
    while (!engine.done && guard++ < (cap || 4000)) {
      if (engine.waiting) break;
      if (!engine.request) break;
      engine.autoChoose();
    }
    return engine.result;
  };

  Battle.autoResolve = function (opts) {
    const o = U.merge({}, opts || {});
    o.auto = true;
    const engine = Battle.create(o);
    return Battle.autoRun(engine);
  };

  // -------------------------------------------------------------
  // MQ.Battle.start(opts) -> Promise<result>   (ENGINE §6)
  // -------------------------------------------------------------
  Battle.start = function (opts) {
    opts = opts || {};
    if (!opts.playerParty && NS.Party && NS.Party.list) opts.playerParty = NS.Party.list;
    const party = opts.playerParty || [];
    const alive = party.filter(function (m) { return m && m.hp > 0; });
    if (!alive.length) {
      // A party that exists but is wiped is a genuine loss. No party at all
      // means the caller (a script, usually) has nothing to fight with — we
      // wave it through rather than derailing the cutscene.
      const wiped = party.length > 0;
      return Promise.resolve({
        outcome: wiped ? "lose" : "win", won: !wiped, lost: wiped, fled: false, caught: null,
        expGained: 0, moneyGained: 0, turns: 0, pending: [], reason: wiped ? "party wiped" : "no party"
      });
    }
    if (!(opts.enemyParty && opts.enemyParty.length)) {
      if (opts.trainer && opts.trainer.party) {
        opts.enemyParty = buildTrainerParty(opts.trainer, opts.difficulty);
      } else if (opts.species) {
        opts.enemyParty = [Battle.makeMonster(opts.species, opts.level || 5, {})];
      }
    }
    if (!(opts.enemyParty && opts.enemyParty.length)) {
      return Promise.resolve({ outcome: "win", won: true, lost: false, fled: false, caught: null, expGained: 0, moneyGained: 0, turns: 0, pending: [], reason: "no foe" });
    }
    const engine = Battle.create(opts);
    Battle.current = engine;
    const headless = NS.HEADLESS || (typeof window !== "undefined" && window.__MQ_HEADLESS);
    if (opts.auto || headless || !NS.Scenes || !NS.BattleScene) {
      return Promise.resolve(Battle.autoRun(engine)).then(function (r) { Battle.current = null; return r; });
    }
    return NS.Scenes.pushP(NS.BattleScene, { engine: engine, opts: opts }).then(function (r) {
      Battle.current = null;
      return r || engine.result || { outcome: "run", won: false, fled: true, expGained: 0, moneyGained: 0, turns: 0, pending: [] };
    });
  };

  // Build an enemy party from trainer data, honouring difficulty and
  // the rematch ladder (SIDE-CONTENT §2.3 / SYSTEMS-SPEC §9).
  function buildTrainerParty(trainer, difficulty) {
    const diff = BE.DIFF[difficulty || "normal"] || BE.DIFF.normal;
    let list = trainer.party || [];
    let tier = 0;
    if (NS.Flags && NS.Flags.get && trainer.id) tier = Number(NS.Flags.get("rematch_" + trainer.id)) || 0;
    if (tier > 0 && trainer.rematch && trainer.rematch.party) list = trainer.rematch.party.slice(0, Math.min(6, 1 + tier));
    const out = [];
    for (let i = 0; i < list.length && i < 6; i++) {
      const spec = list[i];
      const lvl = U.clamp(Math.round((spec.level || 5) * diff.enemyLevel) + tier * 5, 1, 100);
      const mon = Battle.makeMonster(spec.species, lvl, {
        moves: spec.moves, gear: (tier >= 3 || !trainer.rematch) ? spec.gear : null,
        ability: spec.ability, ivFloor: tier >= 3 ? 10 : 0, nickname: spec.nickname
      });
      out.push(mon);
    }
    return out;
  }
  Battle.buildTrainerParty = buildTrainerParty;
  Battle.itemDataOf = itemData;
  Battle.switchIn = switchIn;
  Battle.useItem = useItem;
  Battle.grantXp = grantXp;
  Battle.adjustFriendship = adjustFriendship;
  Battle.recomputeStats = recomputeStats;
})();
