// MonsterQuest v2 — region-south-west: every map loads, is walkable,
// and joins up. Nantwich to Aberaeron, and a hundred and fifty metres
// of salt mine underneath the middle of it.
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("../headless");
const ROOT = path.resolve(__dirname, "..", "..");

// This workstream's files are not in gen-index.js's contract order yet
// (see the report's NEEDS), so the tests build the script list themselves:
// index.html's order, with our data/story files slotted in beside their
// east counterparts and our maps after the other map files.
function scriptList() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const re = /<script\s+src="([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  function exists(f) { return fs.existsSync(path.join(ROOT, f)); }
  function after(marker, files) {
    let i = out.indexOf(marker);
    if (i < 0) i = out.length - 1;
    const add = files.filter(function (f) { return exists(f) && out.indexOf(f) < 0; });
    out.splice.apply(out, [i + 1, 0].concat(add));
  }
  after("js/data/encounters_east.js", ["js/data/encounters_sw.js"]);
  after("js/data/trainers_east.js", ["js/data/trainers_sw.js"]);
  after("js/data/quests_east.js", ["js/data/quests_sw.js"]);
  after("js/story/npcs_east.js", ["js/story/npcs_sw.js"]);
  const maps = fs.readdirSync(path.join(ROOT, "js/world/maps"))
    .filter(function (f) { return /^sw.*\.js$/.test(f); }).sort()
    .map(function (f) { return "js/world/maps/" + f; });
  const lastMap = out.filter(function (f) { return f.indexOf("js/world/maps/") === 0; }).pop();
  if (lastMap) after(lastMap, maps);
  const chs = fs.readdirSync(path.join(ROOT, "js/story/chapters"))
    .filter(function (f) { return /^ch0[67].*\.js$/.test(f); }).sort()
    .map(function (f) { return "js/story/chapters/" + f; });
  const lastCh = out.filter(function (f) { return f.indexOf("js/story/chapters/") === 0; }).pop();
  if (lastCh) after(lastCh, chs);
  return out;
}
module.exports.scriptList = scriptList;

module.exports = function (t, assert) {
  const env = H.load({ files: scriptList() });
  const MQ = env.MQ, W = MQ.World;

  const TOWNS = ["nantwich", "middlewich", "winsford", "northwich", "great_budworth", "y_berllan", "aberaeron"];
  const SITES = [
    "nantwich_brine_lido", "nantwich_acton_field", "nantwich_cheese_ground", "nantwich_gym",
    "nantwich_gym_deep_end", "hack_green", "hack_green_b1", "hack_green_b2", "hack_green_ops",
    "middlewich_big_lock", "middlewich_festival_field", "winsford_headgear", "winsford_deepstore",
    "northwich_gym", "northwich_weaver_hall", "northwich_lion_salt_works", "northwich_market",
    "anderton", "anderton_lift_lower", "anderton_lift_upper", "anderton_narrowboat",
    "anderton_lift_office", "marbury_park",
    "y_berllan_halt", "y_berllan_farmhouse", "y_berllan_shed", "y_berllan_cellar",
    "y_berllan_pond", "y_berllan_coed", "y_berllan_aberaeron_lane"
  ];
  const MINE = [
    "salt_mine_cage", "salt_mine_galleries", "salt_mine_deepstore_cold", "salt_mine_sinkhole",
    "salt_mine_marston_b1", "salt_mine_marston_b2", "salt_mine_marston_b3", "salt_mine_back_stair"
  ];
  const ROUTES = [
    "route_nantwich_winsford", "route_nantwich_hackgreen", "route_middlewich_winsford",
    "route_middlewich_northwich", "route_winsford_northwich", "route_northwich_anderton",
    "route_anderton_budworth", "route_budworth_lymm", "route_crewe_nantwich", "route_sandbach_middlewich"
  ];
  const ALL = TOWNS.concat(SITES, MINE, ROUTES);

  // Every map this workstream owns, by region tag or by dialogue pool.
  const REGIONS = { south: 1, salt: 1, wales: 1 };
  const POOLS = {
    town_nantwich: 1, town_middlewich: 1, town_winsford: 1, town_northwich: 1,
    town_anderton: 1, town_great_budworth: 1, town_y_berllan: 1
  };
  const swIds = W.ids().filter(function (id) {
    const m = W.get(id);
    if (!m) return false;
    if (REGIONS[m.region]) return true;
    return !!(m.dialogue && POOLS[m.dialogue]);
  });

  t("the world validates with zero problems", function () {
    const errs = W.validate();
    assert.strictEqual(errs.length, 0, errs.join("\n"));
    const derrs = MQ.Data.validate();
    assert.strictEqual(derrs.length, 0, derrs.join("\n"));
  });

  t("every region-south-west map exists and has sane dimensions", function () {
    const missing = ALL.filter(function (id) { return !W.has(id); });
    assert.deepStrictEqual(missing, [], "missing maps: " + missing.join(", "));
    TOWNS.forEach(function (id) {
      const m = W.get(id);
      assert.ok(m.width >= 30 && m.width <= 64, id + " width " + m.width);
      assert.ok(m.height >= 24 && m.height <= 48, id + " height " + m.height);
      assert.ok(m.landmark, id + " has no landmark");
      assert.ok(m.spawnPoint, id + " has no spawnPoint");
      assert.ok(m.healPoint, id + " has no healPoint");
    });
    ROUTES.forEach(function (id) {
      const m = W.get(id);
      assert.ok(m.width * m.height >= 700, id + " is too small to be a route");
    });
    assert.ok(swIds.length >= 90, "region-south-west ships " + swIds.length + " maps");
  });

  // A counter, a bench or a market stall is solid on purpose; the clerk
  // stands behind it. What must never happen is a thing you cannot stand
  // next to, or a thing you cannot walk to at all.
  function approachable(m, x, y) {
    if (!W.inBounds(m, x, y)) return false;
    if (!W.isSolid(m, x, y)) return true;
    return !W.isSolid(m, x + 1, y) || !W.isSolid(m, x - 1, y) ||
      !W.isSolid(m, x, y + 1) || !W.isSolid(m, x, y - 1);
  }
  // Flood fill from the spawn with every traversal ability granted, so
  // ability-gated pockets count as reachable.
  const ALL_ABIL = { has: function () { return true; } };
  function reach(m) {
    const seen = {};
    const sp = W.spawnOf(m);
    const q = [[sp.x, sp.y]];
    seen[sp.x + "," + sp.y] = true;
    while (q.length) {
      const p = q.pop();
      const nb = [[p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]];
      for (let i = 0; i < 4; i++) {
        const x = nb[i][0], y = nb[i][1], k = x + "," + y;
        if (seen[k] || !W.inBounds(m, x, y)) continue;
        if (W.blocked(m, x, y, ALL_ABIL)) continue;
        seen[k] = true; q.push([x, y]);
      }
    }
    return seen;
  }
  function near(seen, x, y) {
    return !!(seen[x + "," + y] || seen[(x + 1) + "," + y] || seen[(x - 1) + "," + y] ||
      seen[x + "," + (y + 1)] || seen[x + "," + (y - 1)]);
  }

  t("spawn points, heal points, NPCs and rest points stand on ground you can use", function () {
    const bad = [];
    swIds.forEach(function (id) {
      const m = W.get(id);
      if (m.spawnPoint && W.isSolid(m, m.spawnPoint.x, m.spawnPoint.y)) bad.push(id + ": spawnPoint is solid");
      if (m.healPoint && !approachable(m, m.healPoint.x, m.healPoint.y)) bad.push(id + ": healPoint is walled in");
      (m.npcs || []).forEach(function (n) {
        if (!W.inBounds(m, n.x, n.y)) bad.push(id + ": npc " + n.id + " out of bounds");
        else if (!approachable(m, n.x, n.y)) bad.push(id + ": npc " + n.id + " walled in at (" + n.x + "," + n.y + ")");
        if (n.trainer && W.isSolid(m, n.x, n.y)) bad.push(id + ": trainer npc " + n.id + " stands in scenery");
      });
      (m.restPoints || []).forEach(function (r) {
        if (!approachable(m, r.x, r.y)) bad.push(id + ": restPoint (" + r.x + "," + r.y + ") is walled in");
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  t("every sign and pickup can be walked to and read", function () {
    const bad = [];
    swIds.forEach(function (id) {
      const m = W.get(id);
      const seen = reach(m);
      (m.signs || []).forEach(function (s) {
        if (!(W.isSolid(m, s.x, s.y) || W.interactAt(m, s.x, s.y))) bad.push(id + ": sign (" + s.x + "," + s.y + ") on open ground");
        if (!near(seen, s.x, s.y)) bad.push(id + ": sign (" + s.x + "," + s.y + ") unreachable");
      });
      (m.items || []).forEach(function (it) {
        if (!near(seen, it.x, it.y)) bad.push(id + ": item " + it.item + " (" + it.x + "," + it.y + ") unreachable");
      });
      (m.catGaps || []).forEach(function (g) {
        if (!near(seen, g.x, g.y)) bad.push(id + ": catGap (" + g.x + "," + g.y + ") unreachable");
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  t("every warp is reachable on foot from the map's spawn point", function () {
    const bad = [];
    swIds.forEach(function (id) {
      const m = W.get(id);
      const seen = reach(m);
      (m.warps || []).forEach(function (w) {
        if (!near(seen, w.x, w.y)) bad.push(id + " → " + w.to + " at (" + w.x + "," + w.y + ")");
      });
    });
    assert.deepStrictEqual(bad, [], "unreachable warps:\n" + bad.join("\n"));
  });

  t("every warp lands somewhere walkable, and every door leads back", function () {
    const bad = [];
    swIds.forEach(function (id) {
      const m = W.get(id);
      (m.warps || []).forEach(function (w) {
        const tm = W.get(w.to);
        if (!tm) { bad.push(id + ": no map " + w.to); return; }
        if (!W.inBounds(tm, w.tx, w.ty)) bad.push(id + " → " + w.to + " lands out of bounds");
        else if (W.isSolid(tm, w.tx, w.ty)) bad.push(id + " → " + w.to + " lands on solid (" + w.tx + "," + w.ty + ")");
        if (!m.cutscene && !(tm.warps || []).some(function (v) { return v.to === id; })) {
          bad.push(id + " → " + w.to + " is one-way");
        }
      });
    });
    assert.deepStrictEqual(bad, [], bad.join("\n"));
  });

  t("the region joins up: Nantwich to Aberaeron, and down to depth three", function () {
    // Walk the map graph from Nantwich with everything unlocked.
    const seen = {}; const q = ["nantwich"];
    seen.nantwich = true;
    while (q.length) {
      const id = q.pop();
      const m = W.get(id);
      if (!m) continue;
      (m.warps || []).forEach(function (w) { if (!seen[w.to] && W.has(w.to)) { seen[w.to] = true; q.push(w.to); } });
    }
    ["nantwich_brine_lido", "nantwich_gym_deep_end", "hack_green_ops", "middlewich", "winsford",
      "salt_mine_galleries", "salt_mine_marston_b2", "salt_mine_marston_b3", "northwich",
      "northwich_gym", "anderton", "anderton_lift_upper", "marbury_park", "great_budworth"
    ].forEach(function (id) { assert.ok(seen[id], id + " is not reachable from Nantwich"); });
    // Wales is reached by rail, not on foot: check it is internally whole.
    const w = {}; const wq = ["y_berllan_halt"];
    w.y_berllan_halt = true;
    while (wq.length) {
      const id = wq.pop();
      const m = W.get(id);
      (m.warps || []).forEach(function (v) { if (!w[v.to] && W.has(v.to)) { w[v.to] = true; wq.push(v.to); } });
    }
    ["y_berllan", "y_berllan_shed", "y_berllan_cellar", "y_berllan_farmhouse", "y_berllan_coed",
      "y_berllan_pond", "aberaeron"].forEach(function (id) { assert.ok(w[id], id + " is cut off from the halt"); });
  });

  t("encounter tables, fishing spots and trainers all resolve", function () {
    const D = MQ.Data;
    swIds.forEach(function (id) {
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
    // and every species in our tables exists
    const bad = [];
    ["nantwich_grass", "salt_mine_marston_b2_water", "y_berllan_coed_grass", "fish_winsford"].forEach(function (tid) {
      const tab = D.encounters[tid];
      assert.ok(tab, "table " + tid);
      tab.table.forEach(function (r) { if (!D.species[r.species]) bad.push(tid + ": " + r.species); });
    });
    assert.deepStrictEqual(bad, []);
  });

  t("the two gym leaders carry house rules, boss phases and a badge payload", function () {
    const D = MQ.Data;
    [["leader_nell", "badge_token", "water", "tm_brine_jet", "nantwich"],
      ["leader_jack", "badge_daemon", "rock", "tm_salt_grind", "northwich"]].forEach(function (row) {
      const t2 = D.trainers[row[0]];
      assert.ok(t2, row[0] + " is not defined");
      assert.strictEqual(t2.leader.badge, row[1]);
      assert.strictEqual(t2.leader.type, row[2]);
      assert.strictEqual(t2.leader.tm, row[3]);
      assert.strictEqual(t2.leader.town, row[4]);
      assert.ok(t2.house && t2.house.note, row[0] + " has no house rule");
      assert.ok(t2.boss && t2.boss.phases.length >= 3, row[0] + " needs three boss phases");
      assert.ok(t2.party.length >= 5, row[0] + " should field five");
      assert.ok(t2.rematch, row[0] + " has no rematch ladder");
      assert.ok(D.items[row[3]], row[3] + " is not a real Skill Card");
    });
    assert.ok(D.trainers.boss_terrataur.boss.phases.length >= 3);
    assert.ok(D.trainers.boss_kellan.boss.arenaWeather === "rain");
    assert.ok(D.trainers.boss_hack_green_ops.boss.phases.length === 3);
  });

  t("the region ships enough content to be worth walking", function () {
    const D = MQ.Data;
    const trainers = Object.keys(D.trainers).filter(function (id) {
      const d = D.trainers[id];
      return /^(tr_(nantwich|middlewich|winsford|northwich|anderton|marbury|great_budworth|hack_green|salt_mine|y_berllan|aberaeron|route_(crewe_nantwich|nantwich|middlewich|winsford|northwich|anderton|budworth|sandbach_middlewich)))/.test(id) ||
        ["leader_nell", "leader_jack", "boss_kellan", "boss_terrataur", "boss_hack_green_ops", "boss_understudy_middlewich", "vex_3"].indexOf(id) >= 0 || !!d.__sw;
    });
    assert.ok(trainers.length >= 45, "region-south-west ships " + trainers.length + " trainers");
    let npcs = 0, signs = 0, items = 0, gaps = 0, rests = 0, placements = 0;
    swIds.forEach(function (id) {
      const m = W.get(id);
      npcs += (m.npcs || []).length;
      signs += (m.signs || []).length;
      items += (m.items || []).length;
      gaps += (m.catGaps || []).length;
      rests += (m.restPoints || []).length;
      (m.npcs || []).forEach(function (n) { if (n.trainer) placements++; });
    });
    assert.ok(npcs >= 120, "only " + npcs + " NPCs");
    assert.ok(signs >= 60, "only " + signs + " signs");
    assert.ok(items >= 60, "only " + items + " pickups");
    assert.ok(gaps >= 4, "only " + gaps + " cat gaps");
    assert.ok(rests >= 8, "only " + rests + " rest points");
    assert.ok(placements >= 45, "only " + placements + " trainer placements");
    const tables = Object.keys(MQ.Data.encounters).filter(function (id) {
      return /^(nantwich|middlewich|winsford|northwich|anderton|marbury|great_budworth|hack_green|salt_mine|y_berllan|aberaeron|fish_(nantwich|middlewich|winsford|northwich|anderton|y_berllan|aberaeron|route_(nantwich|winsford)))/.test(id);
    });
    assert.ok(tables.length >= 35, "only " + tables.length + " encounter tables");
    const quests = ["main_06_brine_and_perry", "main_07_salt", "case_14_deepfake_vicar",
      "case_17_brine_of_nantwich", "case_18_nantwich_ram", "case_19_middlewich_salt_roads",
      "case_20_winsford_flashes", "case_21_whistle_test", "case_22_lift_logic",
      "case_25_weaver_hall_ghost", "case_30_elm_press"];
    quests.forEach(function (id) {
      const q = MQ.Data.quests[id];
      assert.ok(q, id + " is not defined");
      assert.ok(q.stages.length >= 2, id + " needs stages");
      assert.ok(q.summary, id + " needs a summary");
    });
  });
};
module.exports.scriptList = scriptList;
