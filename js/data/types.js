// =============================================================
// MonsterQuest v2 — js/data/types.js  (data workstream)
// MQ.Data.types, MQ.Data.typeChart, MQ.Data.typeMultiplier
// 13 types: normal fire water grass electric flying bug poison
// rock ground psychic ghost cyber   (SYSTEMS-SPEC preamble)
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  // chart[attacker][defender] = multiplier (missing = 1)
  const CHART = {
    normal:   { ghost: 0, rock: 0.5 },
    fire:     { grass: 2, bug: 2, fire: 0.5, water: 0.5, rock: 0.5 },
    water:    { fire: 2, rock: 2, ground: 2, cyber: 2, water: 0.5, grass: 0.5 },
    grass:    { water: 2, rock: 2, ground: 2, fire: 0.5, grass: 0.5, bug: 0.5, poison: 0.5, flying: 0.5 },
    electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5, ground: 0 },
    flying:   { grass: 2, bug: 2, electric: 0.5, rock: 0.5 },
    bug:      { grass: 2, psychic: 2, fire: 0.5, flying: 0.5, poison: 0.5, ghost: 0.5 },
    poison:   { grass: 2, poison: 0.5, rock: 0.5, ground: 0.5, ghost: 0.5 },
    rock:     { fire: 2, flying: 2, bug: 2, ground: 0.5 },
    ground:   { fire: 2, electric: 2, poison: 2, rock: 2, cyber: 2, flying: 0, grass: 0.5, bug: 0.5 },
    psychic:  { poison: 2, psychic: 0.5, cyber: 0.5 },
    ghost:    { ghost: 2, psychic: 2, normal: 0 },
    cyber:    { psychic: 2, electric: 2, ground: 0.5, rock: 0.5, cyber: 0.5 }
  };

  const COLORS = {
    normal: "#a8a878", fire: "#e2492f", water: "#5b8fd6", grass: "#6fb04a", electric: "#e8c22a", flying: "#9c8fdc",
    bug: "#9aab25", poison: "#9a46a0", rock: "#b09a45", ground: "#cfb069", psychic: "#e05a86", ghost: "#6a5490", cyber: "#1fb2a0"
  };
  const NAMES = {
    normal: "Normal", fire: "Fire", water: "Water", grass: "Grass", electric: "Electric", flying: "Flying",
    bug: "Bug", poison: "Poison", rock: "Rock", ground: "Ground", psychic: "Psychic", ghost: "Ghost", cyber: "Cyber"
  };
  // Three-letter chips for the UI (MQ.UI.typeChip may use these).
  const SHORT = {
    normal: "NRM", fire: "FIR", water: "WTR", grass: "GRS", electric: "ELC", flying: "FLY",
    bug: "BUG", poison: "PSN", rock: "RCK", ground: "GRD", psychic: "PSY", ghost: "GHO", cyber: "CYB"
  };

  const ORDER = ["normal", "fire", "water", "grass", "electric", "flying", "bug", "poison", "rock", "ground", "psychic", "ghost", "cyber"];

  for (let i = 0; i < ORDER.length; i++) {
    const id = ORDER[i];
    D.define("types", id, { name: NAMES[id], short: SHORT[id], color: COLORS[id], chart: CHART[id], index: i });
  }

  D.typeChart = CHART;
  D.typeIds = ORDER.slice();
  D.typeOrder = ORDER.slice();

  D.typeName = function (id) { return NAMES[id] || String(id); };
  D.typeColor = function (id) { return COLORS[id] || "#888"; };

  // chart[attacker][defender]; defTypes is an array of 1-2 type ids.
  D.typeMultiplier = function (atkType, defTypes) {
    const row = CHART[atkType];
    if (!row || !defTypes) return 1;
    let m = 1;
    for (let i = 0; i < defTypes.length; i++) { const v = row[defTypes[i]]; if (v !== undefined) m *= v; }
    return m;
  };
  D.typeVs = function (atkType, defType) { const row = CHART[atkType]; const v = row ? row[defType] : undefined; return v === undefined ? 1 : v; };

  // Player-facing effectiveness line (British English, dry).
  D.effectivenessText = function (mult) {
    if (mult === 0) return "It does nothing at all.";
    if (mult >= 4) return "It's devastatingly effective!";
    if (mult >= 2) return "It's super effective!";
    if (mult <= 0.25) return "It barely registers.";
    if (mult <= 0.5) return "It's not very effective.";
    return "";
  };
  D.effectivenessLabel = function (mult) {
    if (mult === 0) return "immune";
    if (mult > 1) return "strong";
    if (mult < 1) return "weak";
    return "neutral";
  };

  // Defensive summary for the dex: which attacking types hit these defTypes for what.
  D.typeMatchups = function (defTypes) {
    const out = { x4: [], x2: [], x05: [], x025: [], x0: [] };
    for (let i = 0; i < ORDER.length; i++) {
      const m = D.typeMultiplier(ORDER[i], defTypes);
      if (m === 0) out.x0.push(ORDER[i]);
      else if (m >= 4) out.x4.push(ORDER[i]);
      else if (m >= 2) out.x2.push(ORDER[i]);
      else if (m <= 0.25) out.x025.push(ORDER[i]);
      else if (m <= 0.5) out.x05.push(ORDER[i]);
    }
    return out;
  };

  // ---- validation -------------------------------------------------
  // Pairs the design intends to read as a clean two-way rivalry: if A>B
  // then B should resist or be neutral-down against A. Listed explicitly
  // so an accidental edit to the chart is caught rather than argued about.
  const RECIPROCAL = [
    ["fire", "water"], ["fire", "rock"], ["water", "grass"], ["grass", "poison"],
    ["electric", "ground"], ["flying", "rock"], ["bug", "fire"], ["bug", "flying"],
    ["ground", "grass"], ["psychic", "cyber"], ["cyber", "ground"]
  ];

  D.validators.push(function (err) {
    const seenNames = {};
    D.each("types", function (t, id) {
      if (!t.color) err("types/" + id + ": missing colour");
      if (!t.name) err("types/" + id + ": missing name");
      if (seenNames[t.name]) err("types/" + id + ": duplicate display name '" + t.name + "'");
      seenNames[t.name] = true;
      const ks = Object.keys(t.chart || {});
      for (let i = 0; i < ks.length; i++) {
        if (!D.types[ks[i]]) err("types/" + id + ": chart references unknown type '" + ks[i] + "'");
        const v = t.chart[ks[i]];
        if ([0, 0.5, 1, 2].indexOf(v) < 0) err("types/" + id + " vs " + ks[i] + ": multiplier " + v + " is not 0/0.5/1/2");
      }
    });
    if (D.count("types") !== 13) err("types: expected 13 types, found " + D.count("types"));
    for (let i = 0; i < ORDER.length; i++) if (!D.types[ORDER[i]]) err("types: missing canonical type '" + ORDER[i] + "'");
    // symmetry where intended
    for (let i = 0; i < RECIPROCAL.length; i++) {
      const a = RECIPROCAL[i][0], b = RECIPROCAL[i][1];
      const ab = D.typeVs(a, b), ba = D.typeVs(b, a);
      if (!(ab > 1 && ba <= 1) && !(ba > 1 && ab <= 1)) {
        err("types: intended rivalry " + a + "/" + b + " is not asymmetric (" + ab + " / " + ba + ")");
      }
    }
    // every type except Normal must be able to hit something for 2x
    for (let i = 0; i < ORDER.length; i++) {
      if (ORDER[i] === "normal") continue;   // Normal is deliberately flat: no 2x, no weakness of its own
      const row = CHART[ORDER[i]];
      let best = 1;
      const ks = Object.keys(row);
      for (let j = 0; j < ks.length; j++) if (row[ks[j]] > best) best = row[ks[j]];
      if (best < 2) err("types/" + ORDER[i] + ": has no super-effective matchup");
    }
  });
})();
