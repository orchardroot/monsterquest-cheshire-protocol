// MonsterQuest v2 — region-east: every map loads, is walkable, and joins up.
"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ, W = MQ.World;

  // Every map this workstream owns, grouped so a missing one is obvious.
  const TOWNS = [
    "macclesfield", "bollington", "kerridge_hill", "prestbury", "poynton", "lyme_park",
    "teggs_nose", "wilmslow", "styal", "lindow_moss", "alderley_edge"
  ];
  const ROUTES = [
    "route_macc_bollington", "route_macc_bollington_island", "route_bollington_poynton",
    "route_bollington_poynton_tunnel", "route_poynton_lyme", "route_macc_prestbury",
    "route_prestbury_wilmslow", "route_macc_teggs", "route_wilmslow_styal",
    "route_wilmslow_lindow", "route_wilmslow_alderley"
  ];
  const SITES = [
    "prestbury_hedge_maze", "poynton_pit_adit", "lyme_park_bowstones", "lyme_park_cage_cave",
    "teggs_nose_quarry", "shutlingsloe", "lindow_moss_deep", "alderley_edge_caverns_b1",
    "alderley_edge_caverns_b2", "alderley_edge_caverns_b3", "alderley_edge_caverns_slide"
  ];
  const GYM = ["wilmslow_gym"];
  const ALL = TOWNS.concat(ROUTES, SITES, GYM);

  function east(map) {
    return map.dialogue && String(map.dialogue).indexOf("town_") === 0 &&
      ["macclesfield", "bollington", "prestbury", "poynton", "lyme_park", "teggs_nose",
        "wilmslow", "styal", "lindow_moss", "alderley_edge"].indexOf(map.dialogue.slice(5)) >= 0;
  }
  // Every map whose id starts with an east node name — the set the tests walk.
  const PREFIX = TOWNS.concat(["route_macc", "route_bollington", "route_poynton", "route_prestbury",
    "route_wilmslow", "shutlingsloe"]);
  function isEast(id) {
    for (let i = 0; i < PREFIX.length; i++) if (id === PREFIX[i] || id.indexOf(PREFIX[i] + "_") === 0) return true;
    return false;
  }
  const eastIds = W.ids().filter(isEast);

  t("world validates with zero problems", function () {
    const errs = W.validate();
    assert.strictEqual(errs.length, 0, errs.join("\n"));
    assert.strictEqual(MQ.Data.validate().length, 0, MQ.Data.validate().join("\n"));
  });

  t("every region-east map exists and has sane dimensions", function () {
    const missing = ALL.filter(function (id) { return !W.has(id); });
    assert.deepStrictEqual(missing, [], "missing maps: " + missing.join(", "));
    TOWNS.forEach(function (id) {
      const m = W.get(id);
      assert.ok(m.width >= 30 && m.width <= 64, id + " width " + m.width);
      assert.ok(m.height >= 26 && m.height <= 48, id + " height " + m.height);
      assert.ok(m.landmark, id + " has no landmark");
      assert.ok(m.spawnPoint, id + " has no spawnPoint");
    });
    assert.ok(eastIds.length >= 80, "region-east ships " + eastIds.length + " maps");
  });

  // Counters, benches and market stalls are solid on purpose: the clerk stands
  // behind one and you talk across it. What must never happen is a thing the
  // player cannot stand next to.
  function approachable(m, x, y) {
    if (!W.inBounds(m, x, y)) return false;
    if (!W.isSolid(m, x, y)) return true;
    return !W.isSolid(m, x + 1, y) || !W.isSolid(m, x - 1, y) ||
      !W.isSolid(m, x, y + 1) || !W.isSolid(m, x, y - 1);
  }

  t("spawn points, heal points and NPCs stand on walkable ground", function () {
    eastIds.forEach(function (id) {
      const m = W.get(id);
      if (m.spawnPoint) assert.ok(!W.isSolid(m, m.spawnPoint.x, m.spawnPoint.y), id + ": spawnPoint is solid");
      if (m.healPoint) assert.ok(!W.isSolid(m, m.healPoint.x, m.healPoint.y), id + ": healPoint is solid");
      (m.npcs || []).forEach(function (n) {
        assert.ok(W.inBounds(m, n.x, n.y), id + ": npc " + n.id + " out of bounds");
        assert.ok(approachable(m, n.x, n.y), id + ": npc " + n.id + " is walled in at (" + n.x + "," + n.y + ")");
        // a trainer has to be able to walk up to you, so they may not stand in scenery
        if (n.trainer) assert.ok(!W.isSolid(m, n.x, n.y), id + ": trainer npc " + n.id + " stands in scenery (" + n.x + "," + n.y + ")");
      });
      (m.restPoints || []).forEach(function (r) {
        assert.ok(approachable(m, r.x, r.y), id + ": restPoint (" + r.x + "," + r.y + ") is walled in");
      });
      (m.items || []).forEach(function (it) {
        assert.ok(approachable(m, it.x, it.y), id + ": item " + it.item + " (" + it.x + "," + it.y + ") is walled in");
      });
    });
  });

  t("signs sit on tiles the player can actually read", function () {
    eastIds.forEach(function (id) {
      const m = W.get(id);
      (m.signs || []).forEach(function (s) {
        // A sign entry beats the tile handler, but the player still has to be
        // able to FACE it: the tile must be something you stand next to.
        assert.ok(W.isSolid(m, s.x, s.y) || W.interactAt(m, s.x, s.y),
          id + ": sign at (" + s.x + "," + s.y + ") is on open ground — nothing to read");
        assert.ok(approachable(m, s.x, s.y), id + ": sign at (" + s.x + "," + s.y + ") cannot be stood next to");
      });
    });
  });

  // Flood fill from the spawn point over walkable tiles (all abilities granted,
  // so ability-gated pockets count as reachable) and require every warp to be
  // standing in it — an unreachable door is a dead end the player can see.
  function reach(m) {
    const seen = {};
    const sp = W.spawnOf(m);
    const q = [[sp.x, sp.y]];
    seen[sp.x + "," + sp.y] = true;
    const abil = { has: function () { return true; } };
    while (q.length) {
      const p = q.pop();
      const nb = [[p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]];
      for (let i = 0; i < 4; i++) {
        const x = nb[i][0], y = nb[i][1], k = x + "," + y;
        if (seen[k] || !W.inBounds(m, x, y)) continue;
        if (W.blocked(m, x, y, abil)) continue;
        seen[k] = true; q.push([x, y]);
      }
    }
    return seen;
  }

  t("every warp is reachable on foot from the map's spawn point", function () {
    const bad = [];
    eastIds.forEach(function (id) {
      const m = W.get(id);
      const seen = reach(m);
      (m.warps || []).forEach(function (w) {
        const on = seen[w.x + "," + w.y];
        const near = on || seen[(w.x + 1) + "," + w.y] || seen[(w.x - 1) + "," + w.y] ||
          seen[w.x + "," + (w.y + 1)] || seen[w.x + "," + (w.y - 1)];
        if (!near) bad.push(id + " → " + w.to + " at (" + w.x + "," + w.y + ")");
      });
    });
    assert.deepStrictEqual(bad, [], "unreachable warps:\n" + bad.join("\n"));
  });

  t("every warp lands somewhere walkable, and edges round-trip", function () {
    const bad = [];
    eastIds.forEach(function (id) {
      const m = W.get(id);
      (m.warps || []).forEach(function (w) {
        const tm = W.get(w.to);
        if (!tm) { bad.push(id + ": no map " + w.to); return; }
        if (W.isSolid(tm, w.tx, w.ty)) bad.push(id + " → " + w.to + " lands on solid (" + w.tx + "," + w.ty + ")");
        // the destination must offer a way back to this map
        const back = (tm.warps || []).some(function (v) { return v.to === id; });
        if (!back) bad.push(id + " → " + w.to + " is one-way (no return warp)");
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  t("encounter tables, trainers and fishing spots all resolve", function () {
    const D = MQ.Data;
    eastIds.forEach(function (id) {
      const m = W.get(id);
      if (m.encounters) Object.keys(m.encounters).forEach(function (z) {
        const tid = m.encounters[z];
        if (tid) assert.ok(D.encounters[tid], id + ": missing encounter table " + tid);
      });
      if (m.fishing) assert.ok(D.encounters[m.fishing], id + ": missing fishing table " + m.fishing);
      (m.npcs || []).forEach(function (n) {
        if (n.trainer) assert.ok(D.trainers[n.trainer], id + ": missing trainer " + n.trainer);
      });
    });
  });
};
