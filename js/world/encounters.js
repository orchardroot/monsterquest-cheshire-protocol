// =============================================================
// MonsterQuest v2 — MQ.Encounters: zone-based wild encounter rolls
// Tables come from MQ.Data.encounters (`<mapid>_<zone>[_night|_rain|_fog]`,
// ROSTER §9). Time of day swaps the table, rain/fog overlay it, the SIGNAL
// METER leans the weights towards rare rows, repel/lure bend the rate, and
// chain fishing rewards patience.
// Owned by: world workstream.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const E = {};

  E.BASE_RATE = 0.11;          // per step in an encounter zone
  E.GRACE_STEPS = 3;           // quiet steps after a battle
  E.MAX_CHAIN = 30;

  E.state = {
    steps: 0, sinceEncounter: 0, grace: 0,
    repel: 0, lure: 0, lureMult: 1.6,
    chain: 0, chainSpecies: null, chainMap: null,
    lastTable: null, lured: false
  };

  // ---- helpers -----------------------------------------------------------
  function tables() { return (MQ.Data && MQ.Data.encounters) || {}; }
  E.has = function (id) { return !!(id && tables()[id]); };
  E.get = function (id) { return (id && tables()[id]) || null; };

  E.phase = function () { return (MQ.Clock && MQ.Clock.phase) || "day"; };
  E.weather = function (map) {
    if (!MQ.Clock) return "clear";
    return MQ.Clock.weatherOf(map && map.weatherZone ? map.weatherZone : undefined) || "clear";
  };

  // SIGNAL METER, 0..1 (STORY-BIBLE §6). Content owns MQ.Signal; until it
  // lands the story flags drive it: the meter exists from Ch.4, dies with the
  // plug, and never quite returns to zero under Custody.
  E.signalLevel = function () {
    if (MQ.Signal && typeof MQ.Signal.level === "number") return U.clamp(MQ.Signal.level, 0, 1);
    if (!MQ.Flags.get("signal_meter")) return 0;
    if (MQ.Flags.get("plug_pulled")) {
      const c = MQ.Flags.get("choice_plug");
      return c === "quarantine" ? 0.12 : c === "custody" ? 0.25 : 0;
    }
    const days = MQ.Flags.get("cutover_days");
    const n = typeof days === "number" ? days : (days === "t0" ? 0 : days === "t3" ? 3 : 38);
    if (days === "stopped") return 0.15;
    return U.clamp(1 - n / 38, 0.15, 1);
  };

  // Which table id applies here and now?
  E.tableId = function (map, zone) {
    if (!map) return null;
    let base = map.encounters && map.encounters[zone];
    if (!base && map.encounterParent) {
      const p = MQ.World.get(map.encounterParent);
      base = p && p.encounters && p.encounters[zone];
    }
    if (!base) return null;
    const t = tables();
    const phase = E.phase();
    const weather = E.weather(map);
    // night replaces the base table between 20:00 and 06:00
    if ((phase === "night") && t[base + "_night"]) return base + "_night";
    // rain/fog overlay: half the time the weather variant wins
    if (weather === "rain" && t[base + "_rain"] && Math.random() < 0.5) return base + "_rain";
    if (weather === "fog" && t[base + "_fog"] && Math.random() < 0.5) return base + "_fog";
    return t[base] ? base : null;
  };

  E.rateFor = function (map, zone) {
    const id = E.tableId(map, zone);
    const tbl = E.get(id);
    let rate = (tbl && typeof tbl.rate === "number") ? tbl.rate : E.BASE_RATE;
    if (zone === "cave") rate *= 1.15;
    if (zone === "water") rate *= 0.9;
    const st = E.state;
    if (st.lure > 0) rate *= st.lureMult;
    rate *= 1 + E.signalLevel() * 0.35;
    if (MQ.Trainer && MQ.Trainer.perks && MQ.Trainer.perks.has && MQ.Trainer.perks.has("perk_triage_trailblazer")) rate *= 0.9;
    return U.clamp(rate, 0, 0.6);
  };

  // Row filters: time-of-day and weather tags on individual rows.
  function rowAllowed(row, phase, weather) {
    if (row.time && row.time.indexOf(phase) < 0) return false;
    if (row.weather && row.weather.indexOf(weather) < 0) return false;
    if (row.cond && !MQ.Flags.test(row.cond)) return false;
    if (row.flag && !MQ.Flags.get(row.flag)) return false;
    return true;
  }

  // Weight a row, leaning rare with the SIGNAL METER and the fishing chain.
  function weightOf(row, signal, chainBoost) {
    let w = row.w === undefined ? 10 : row.w;
    const rare = row.rare || w <= 8;
    if (rare) w *= 1 + signal * 1.8 + chainBoost;
    else w *= 1 - signal * 0.15;
    return Math.max(0.01, w);
  }

  // Pick one row from a table (allocation-light: reuses module arrays).
  const pickRows = [], pickWeights = [];
  E.pickRow = function (tbl, opts) {
    opts = opts || {};
    if (!tbl || !tbl.table || !tbl.table.length) return null;
    const phase = opts.phase || E.phase();
    const weather = opts.weather || "clear";
    const signal = opts.signal === undefined ? E.signalLevel() : opts.signal;
    const chainBoost = opts.chainBoost || 0;
    pickRows.length = 0; pickWeights.length = 0;
    let total = 0;
    for (let i = 0; i < tbl.table.length; i++) {
      const row = tbl.table[i];
      if (!rowAllowed(row, phase, weather)) continue;
      if (opts.tier && row.tier && opts.tiers && opts.tiers.indexOf(row.tier) < 0) continue;
      if (opts.tiers && row.tier && opts.tiers.indexOf(row.tier) < 0) continue;
      const w = weightOf(row, signal, chainBoost);
      pickRows.push(row); pickWeights.push(w); total += w;
    }
    if (!pickRows.length) return null;
    let r = (opts.rnd || Math.random)() * total;
    for (let i = 0; i < pickRows.length; i++) { r -= pickWeights[i]; if (r <= 0) return pickRows[i]; }
    return pickRows[pickRows.length - 1];
  };

  function levelOf(row, rnd) {
    const lo = row.min === undefined ? 3 : row.min;
    const hi = row.max === undefined ? lo : row.max;
    return U.randInt(lo, hi, rnd);
  }

  // Build a result (and a live monster instance if the data team's factory exists).
  E.makeResult = function (row, tableId, map, extra) {
    const level = levelOf(row);
    const signal = E.signalLevel();
    const res = {
      species: row.species, level: level, table: tableId, map: map && map.id,
      rare: !!(row.rare || (row.w !== undefined && row.w <= 8)),
      agitated: signal > 0.6, signal: signal,
      shiny: Math.random() < (1 / 1024) * (1 + signal),
      lured: E.state.lure > 0
    };
    if (extra) { const ks = Object.keys(extra); for (let i = 0; i < ks.length; i++) res[ks[i]] = extra[ks[i]]; }
    if (MQ.Data && MQ.Data.makeMonster) {
      try { res.monster = MQ.Data.makeMonster(row.species, level, { shiny: res.shiny, metAt: { map: res.map, level: level } }); }
      catch (err) { MQ.warn("[Encounters] makeMonster failed for " + row.species, err); }
    }
    return res;
  };

  // ---- the per-step roll --------------------------------------------------
  // Called by MQ.Overworld each time the player enters a new tile.
  E.step = function (map, x, y, opts) {
    opts = opts || {};
    const st = E.state;
    st.steps++;
    st.sinceEncounter++;
    if (st.repel > 0) st.repel--;
    if (st.lure > 0) st.lure--;
    if (st.grace > 0) { st.grace--; return null; }
    if (opts.disabled || MQ.Flags.get("no_encounters")) return null;
    const zone = MQ.World.zoneAt(map, x, y);
    if (!zone || zone === "water") return null;         // water is fished or boated, not walked
    return E.rollZone(map, zone, opts);
  };

  E.rollZone = function (map, zone, opts) {
    opts = opts || {};
    const st = E.state;
    const id = E.tableId(map, zone);
    const tbl = E.get(id);
    if (!tbl) return null;
    if (st.repel > 0 && !opts.force) return null;
    const rate = opts.rate === undefined ? E.rateFor(map, zone) : opts.rate;
    if (!opts.force && Math.random() >= rate) return null;
    const row = E.pickRow(tbl, { weather: E.weather(map), phase: E.phase() });
    if (!row) return null;
    st.sinceEncounter = 0;
    st.grace = E.GRACE_STEPS;
    st.lastTable = id;
    const res = E.makeResult(row, id, map, { zone: zone });
    MQ.Events.emit("encounter", res);
    return res;
  };

  // Force an encounter (scripted ambushes, SIGNAL shimmer spots).
  E.force = function (map, zone, opts) {
    opts = opts || {}; opts.force = true;
    return E.rollZone(map, zone || "grass", opts);
  };

  // ---- repel / lure -------------------------------------------------------
  E.repel = function (steps) { E.state.repel = Math.max(E.state.repel, steps || 100); MQ.Events.emit("repel", { steps: E.state.repel }); return E.state.repel; };
  E.lure = function (steps, mult) { E.state.lure = Math.max(E.state.lure, steps || 100); if (mult) E.state.lureMult = mult; return E.state.lure; };
  E.clearRepel = function () { E.state.repel = 0; };
  E.afterBattle = function () { E.state.grace = E.GRACE_STEPS; };

  // ---- inspection (Tracker perk, BIGBOY's nose) ---------------------------
  // Returns the rows that can appear on this tile right now, with percentages.
  E.preview = function (map, x, y) {
    const zone = MQ.World.zoneAt(map, x, y);
    if (!zone) return null;
    const id = E.tableId(map, zone);
    const tbl = E.get(id);
    if (!tbl) return null;
    const phase = E.phase(), weather = E.weather(map), signal = E.signalLevel();
    const rows = [];
    let total = 0;
    for (let i = 0; i < tbl.table.length; i++) {
      const row = tbl.table[i];
      if (!rowAllowed(row, phase, weather)) continue;
      const w = weightOf(row, signal, 0);
      rows.push({ species: row.species, min: row.min, max: row.max, w: w });
      total += w;
    }
    for (let i = 0; i < rows.length; i++) rows[i].pct = Math.round(rows[i].w / total * 100);
    rows.sort(function (a, b) { return b.w - a.w; });
    return { zone: zone, table: id, rate: E.rateFor(map, zone), rows: rows, signal: signal };
  };

  // ---- fishing ------------------------------------------------------------
  E.RODS = {
    bamboo: { tiers: ["common", "uncommon"], name: "Bamboo Rod" },
    weighted: { tiers: ["common", "uncommon", "rare"], name: "Weighted Rod" },
    carbon: { tiers: ["common", "uncommon", "rare", "legendary"], name: "Carbon Rod" },
    elm: { tiers: ["common", "uncommon", "rare", "legendary", "ghost"], name: "Elm-handled Rod" }
  };
  E.rodTier = function () {
    if (MQ.Fishing && MQ.Fishing.rod) return MQ.Fishing.rod;
    const n = MQ.Flags.get("fish_rod_tier") || 0;
    return ["bamboo", "bamboo", "weighted", "carbon", "elm"][U.clamp(n, 0, 4)];
  };

  E.fishTableId = function (map) {
    const id = map.fishing || ("fish_" + map.id);
    return E.has(id) ? id : null;
  };

  // Chain fishing: reeling the same species in a row leans the table rare.
  E.fish = function (map, x, y, opts) {
    opts = opts || {};
    const id = E.fishTableId(map);
    const tbl = E.get(id);
    if (!tbl) return null;
    const st = E.state;
    const rod = opts.rod || E.rodTier();
    const rodDef = E.RODS[rod] || E.RODS.bamboo;
    let tiers = rodDef.tiers;
    const phase = E.phase();
    if (tiers.indexOf("legendary") >= 0 && phase !== "dawn" && phase !== "dusk") tiers = tiers.filter(function (t) { return t !== "legendary"; });
    if (tiers.indexOf("ghost") >= 0 && !(phase === "night" && (MQ.Flags.get("item_ghost_lens") || (MQ.Inventory && MQ.Inventory.count && MQ.Inventory.count("ghost_lens"))))) {
      tiers = tiers.filter(function (t) { return t !== "ghost"; });
    }
    if (st.chainMap !== map.id) { st.chain = 0; st.chainSpecies = null; st.chainMap = map.id; }
    const chainBoost = Math.min(1.5, st.chain * 0.06);
    const row = E.pickRow(tbl, { tiers: tiers, weather: E.weather(map), phase: phase, chainBoost: chainBoost });
    if (!row) return null;
    if (row.species === st.chainSpecies) st.chain = Math.min(E.MAX_CHAIN, st.chain + 1);
    else { st.chain = 1; st.chainSpecies = row.species; }
    const res = E.makeResult(row, id, map, { zone: "water", fishing: true, rod: rod, chain: st.chain, tier: row.tier || "common" });
    MQ.Events.emit("encounter", res);
    return res;
  };
  E.breakChain = function () { E.state.chain = 0; E.state.chainSpecies = null; };

  // ---- save ---------------------------------------------------------------
  E.saveKey = "encounters";
  E.saveProvider = {
    save: function () {
      const st = E.state;
      return { steps: st.steps, repel: st.repel, lure: st.lure, chain: st.chain, chainSpecies: st.chainSpecies, chainMap: st.chainMap };
    },
    load: function (o) {
      const st = E.state;
      st.steps = 0; st.repel = 0; st.lure = 0; st.chain = 0; st.chainSpecies = null; st.chainMap = null; st.grace = 0;
      if (!o) return;
      st.steps = o.steps || 0; st.repel = o.repel || 0; st.lure = o.lure || 0;
      st.chain = o.chain || 0; st.chainSpecies = o.chainSpecies || null; st.chainMap = o.chainMap || null;
    }
  };

  // A battle ending gives you a few quiet steps; a fainted party doesn't get jumped.
  MQ.Events.on("battle:end", function () { E.afterBattle(); });

  MQ.Encounters = E;
})();
