// STUB — owned by data. Foundation seed: 13 types incl. Cyber, full chart
// ported from the old data.js TYPE_CHART. Data workstream may extend.
// =============================================================
// MonsterQuest v2 — MQ.Data.types, typeChart, typeMultiplier
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
    normal: "#a8a878", fire: "#f08030", water: "#6890f0", grass: "#78c850", electric: "#f8d030", flying: "#a890f0",
    bug: "#a8b820", poison: "#a040a0", rock: "#b8a038", ground: "#e0c068", psychic: "#f85888", ghost: "#705898", cyber: "#20b898"
  };
  const NAMES = { normal: "Normal", fire: "Fire", water: "Water", grass: "Grass", electric: "Electric", flying: "Flying", bug: "Bug", poison: "Poison", rock: "Rock", ground: "Ground", psychic: "Psychic", ghost: "Ghost", cyber: "Cyber" };

  const ids = Object.keys(CHART);
  for (let i = 0; i < ids.length; i++) {
    D.define("types", ids[i], { name: NAMES[ids[i]], color: COLORS[ids[i]], chart: CHART[ids[i]] });
  }
  D.typeChart = CHART;
  D.typeIds = ids;
  D.typeMultiplier = function (atkType, defTypes) {
    const row = CHART[atkType];
    if (!row || !defTypes) return 1;
    let m = 1;
    for (let i = 0; i < defTypes.length; i++) { const v = row[defTypes[i]]; if (v !== undefined) m *= v; }
    return m;
  };
  D.validators.push(function (err) {
    D.each("types", function (t, id) {
      const ks = Object.keys(t.chart || {});
      for (let i = 0; i < ks.length; i++) if (!D.types[ks[i]]) err("types/" + id + ": chart references unknown type '" + ks[i] + "'");
      if (!t.color) err("types/" + id + ": missing color");
    });
  });
})();
