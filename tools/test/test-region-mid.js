// MonsterQuest v2 — region-mid: every map loads, is walkable, and joins up.
"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ, W = MQ.World;

  const TOWNS = ["knutsford", "tatton_park", "rostherne_mere", "holmes_chapel", "jodrell_bank",
    "congleton", "bosley_cloud", "little_moreton_hall", "mow_cop", "sandbach", "crewe"];
  const ROUTES = ["route_alderley_knutsford", "route_tatton_rostherne", "route_knutsford_holmes",
    "route_holmes_jodrell", "route_holmes_congleton", "route_congleton_moreton",
    "route_moreton_mowcop", "route_congleton_sandbach", "route_sandbach_crewe"];
  const GYMS = ["knutsford_gym", "knutsford_gym_floor", "congleton_gym", "congleton_gym_floor",
    "crewe_gym", "crewe_gym_floor"];
  // DESIGN-INDEX §5a: the sub-maps this region is responsible for.
  const SITES = ["knutsford_gaskell_tower", "knutsford_penny_farthing_museum", "knutsford_bookshop",
    "knutsford_quiz_room", "knutsford_station", "tatton_park_hall", "tatton_park_old_hall",
    "tatton_park_census_tent", "tatton_park_japanese_garden", "rostherne_church",
    "holmes_chapel_signal_box", "holmes_chapel_bakery", "holmes_chapel_station",
    "jodrell_bank_visitor_centre", "jodrell_bank_control_room", "jodrell_bank_tower", "jodrell_bank_dish",
    "congleton_town_hall", "congleton_station", "little_moreton_hall_interior", "mow_cop_castle",
    "sandbach_old_hall", "sandbach_post", "crewe_station", "crewe_works", "crewe_heritage_centre",
    "crewe_railcard_office", "crewe_nantwich_road"];
  const CARE = ["knutsford_care", "holmes_chapel_care", "congleton_care", "sandbach_care", "crewe_care"];
  const ALL = TOWNS.concat(ROUTES, GYMS, SITES, CARE);

  const midIds = W.ids().filter(function (id) { const m = W.get(id); return m && m.owner === "mid"; });

  t("the world and all data validate with zero problems", function () {
    const errs = W.validate();
    assert.strictEqual(errs.length, 0, errs.join("\n"));
    const de = MQ.Data.validate();
    assert.strictEqual(de.length, 0, de.join("\n"));
  });

  t("every canonical region-mid map exists and the towns are properly sized", function () {
    const missing = ALL.filter(function (id) { return !W.has(id); });
    assert.strictEqual(missing.length, 0, "missing maps: " + missing.join(", "));
    TOWNS.forEach(function (id) {
      const m = W.get(id);
      assert.ok(m.width >= 32 && m.width <= 64, id + " width " + m.width);
      assert.ok(m.height >= 28 && m.height <= 48, id + " height " + m.height);
      assert.ok(m.landmark, id + " has no landmark");
      assert.ok(m.spawnPoint, id + " has no spawnPoint");
      assert.ok(m.outdoor, id + " should be outdoor");
    });
    ROUTES.forEach(function (id) {
      const m = W.get(id);
      assert.ok(m.width * m.height >= 600, id + " is too small to be a route");
    });
    assert.ok(midIds.length >= 80, "region-mid ships " + midIds.length + " maps");
  });

  t("regions, music, dialogue and encounter zones are wired for every mid map", function () {
    const REGIONS = { bollin: 1, dane: 1, south: 1 };
    midIds.forEach(function (id) {
      const m = W.get(id);
      assert.ok(REGIONS[m.region], id + ": region '" + m.region + "' is not one of this workstream's");
      assert.ok(m.music && MQ.Songs && (MQ.Songs[m.music] || MQ.Songs.has && MQ.Songs.has(m.music)),
        id + ": unknown song " + m.music);
      assert.ok(m.dialogue && MQ.Data.dialogue[m.dialogue], id + ": unknown dialogue pool " + m.dialogue);
    });
  });

  function approachable(m, x, y) {
    if (!W.inBounds(m, x, y)) return false;
    if (!W.isSolid(m, x, y)) return true;
    return !W.isSolid(m, x + 1, y) || !W.isSolid(m, x - 1, y) ||
      !W.isSolid(m, x, y + 1) || !W.isSolid(m, x, y - 1);
  }

  t("spawn points, heal points, NPCs, rest points and pickups stand somewhere usable", function () {
    midIds.forEach(function (id) {
      const m = W.get(id);
      if (m.spawnPoint) assert.ok(!W.isSolid(m, m.spawnPoint.x, m.spawnPoint.y), id + ": spawnPoint is solid");
      if (m.healPoint) assert.ok(!W.isSolid(m, m.healPoint.x, m.healPoint.y), id + ": healPoint is solid");
      (m.npcs || []).forEach(function (n) {
        assert.ok(W.inBounds(m, n.x, n.y), id + ": npc " + n.id + " out of bounds");
        assert.ok(approachable(m, n.x, n.y), id + ": npc " + n.id + " is walled in at (" + n.x + "," + n.y + ")");
        if (n.trainer) assert.ok(!W.isSolid(m, n.x, n.y), id + ": trainer npc " + n.id + " stands in scenery");
        (n.path || []).forEach(function (p) {
          assert.ok(!W.isSolid(m, p[0], p[1]), id + ": npc " + n.id + " path point (" + p[0] + "," + p[1] + ") is solid");
        });
      });
      (m.restPoints || []).forEach(function (r) {
        assert.ok(approachable(m, r.x, r.y), id + ": restPoint (" + r.x + "," + r.y + ") is walled in");
      });
      (m.items || []).forEach(function (it) {
        assert.ok(approachable(m, it.x, it.y), id + ": item " + it.item + " (" + it.x + "," + it.y + ") is walled in");
      });
      (m.signs || []).forEach(function (s) {
        assert.ok(W.isSolid(m, s.x, s.y) || W.interactAt(m, s.x, s.y),
          id + ": sign at (" + s.x + "," + s.y + ") is on open ground — nothing to read");
        assert.ok(approachable(m, s.x, s.y), id + ": sign at (" + s.x + "," + s.y + ") cannot be stood next to");
      });
    });
  });

  // Flood fill from the spawn point with every traversal ability granted, so
  // ability-gated pockets count as reachable but scenery does not.
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
  function near(seen, x, y) {
    return !!(seen[x + "," + y] || seen[(x + 1) + "," + y] || seen[(x - 1) + "," + y] ||
      seen[x + "," + (y + 1)] || seen[x + "," + (y - 1)]);
  }

  t("every warp is reachable on foot from the map's spawn point", function () {
    const bad = [];
    midIds.forEach(function (id) {
      const m = W.get(id);
      const seen = reach(m);
      (m.warps || []).forEach(function (w) {
        if (!near(seen, w.x, w.y)) bad.push(id + " -> " + w.to + " at (" + w.x + "," + w.y + ")");
      });
    });
    assert.strictEqual(bad.length, 0, "unreachable warps:\n" + bad.join("\n"));
  });

  t("every sign, pickup, cat gap and trigger is reachable on foot too", function () {
    const bad = [];
    midIds.forEach(function (id) {
      const m = W.get(id);
      const seen = reach(m);
      (m.signs || []).forEach(function (s) { if (!near(seen, s.x, s.y)) bad.push(id + " sign (" + s.x + "," + s.y + ")"); });
      (m.items || []).forEach(function (i) { if (!near(seen, i.x, i.y)) bad.push(id + " item " + i.item); });
      (m.catGaps || []).forEach(function (c) { if (!near(seen, c.x, c.y)) bad.push(id + " catGap (" + c.x + "," + c.y + ")"); });
      (m.npcs || []).forEach(function (n) { if (!near(seen, n.x, n.y)) bad.push(id + " npc " + n.id); });
      (m.triggers || []).forEach(function (tr) {
        let ok = false;
        for (let y = tr.y; y < tr.y + (tr.h || 1); y++) for (let x = tr.x; x < tr.x + (tr.w || 1); x++) if (seen[x + "," + y]) ok = true;
        if (!ok) bad.push(id + " trigger " + tr.script);
      });
    });
    assert.strictEqual(bad.length, 0, "unreachable content:\n" + bad.join("\n"));
  });

  t("every warp lands somewhere walkable, round-trips, and never lands on another warp", function () {
    const bad = [];
    midIds.forEach(function (id) {
      const m = W.get(id);
      (m.warps || []).forEach(function (w) {
        const tm = W.get(w.to);
        if (!tm) { bad.push(id + ": no map " + w.to); return; }
        if (W.isSolid(tm, w.tx, w.ty)) bad.push(id + " -> " + w.to + " lands on solid (" + w.tx + "," + w.ty + ")");
        const back = (tm.warps || []).some(function (v) { return v.to === id; });
        if (!back) bad.push(id + " -> " + w.to + " is one-way (no return warp)");
        const onWarp = (tm.warps || []).some(function (v) { return v.x === w.tx && v.y === w.ty && v.to === id; });
        if (onWarp) bad.push(id + " -> " + w.to + " lands on the return warp itself (" + w.tx + "," + w.ty + ")");
      });
    });
    assert.strictEqual(bad.length, 0, bad.join("\n"));
  });

  t("the east<->mid seam is joined in both directions", function () {
    const links = [
      ["alderley_edge", "route_alderley_knutsford"],
      ["route_alderley_knutsford", "alderley_edge"],
      ["teggs_nose", "bosley_cloud"],
      ["bosley_cloud", "teggs_nose"]
    ];
    links.forEach(function (pair) {
      const m = W.get(pair[0]);
      assert.ok(m, "missing map " + pair[0]);
      const found = (m.warps || []).some(function (w) { return w.to === pair[1]; });
      assert.ok(found, pair[0] + " has no exit to " + pair[1]);
    });
    // ...and region-east's own exits are untouched.
    const teggs = W.get("teggs_nose");
    assert.ok((teggs.warps || []).some(function (w) { return w.to === "shutlingsloe"; }), "east's Shutlingsloe exit survived");
    const alderley = W.get("alderley_edge");
    assert.ok((alderley.warps || []).some(function (w) { return w.to === "route_wilmslow_alderley"; }), "east's Sandhills exit survived");
  });

  t("every mid town has the interiors a town is supposed to have", function () {
    [["knutsford", ["care", "mart", "inn", "gym", "station"]],
     ["holmes_chapel", ["care", "mart", "inn", "station"]],
     ["congleton", ["care", "mart", "inn", "gym", "station"]],
     ["sandbach", ["care", "mart", "inn", "post"]],
     ["crewe", ["care", "mart", "inn", "gym", "station"]]].forEach(function (row) {
      row[1].forEach(function (kind) {
        assert.ok(W.has(row[0] + "_" + kind), "missing " + row[0] + "_" + kind);
      });
    });
  });

  t("encounter tables, fishing spots and trainers all resolve, and the bands fit the chapters", function () {
    const D = MQ.Data;
    const BANDS = { knutsford: [12, 19], tatton_park: [12, 20], rostherne_mere: [13, 21],
      holmes_chapel: [15, 22], jodrell_bank: [16, 23], congleton: [16, 24], sandbach: [20, 28], crewe: [21, 29] };
    midIds.forEach(function (id) {
      const m = W.get(id);
      if (m.encounters) Object.keys(m.encounters).forEach(function (z) {
        const tid = m.encounters[z];
        if (tid) assert.ok(D.encounters[tid], id + ": missing encounter table " + tid);
      });
      if (m.fishing) assert.ok(D.encounters[m.fishing], id + ": missing fishing table " + m.fishing);
      (m.npcs || []).forEach(function (n) {
        if (n.trainer) assert.ok(D.trainers[n.trainer], id + ": missing trainer " + n.trainer);
        if (n.shop) assert.ok(typeof n.shop === "string", id + ": bad shop id on " + n.id);
      });
      const band = BANDS[id];
      if (band && m.encounters && m.encounters.grass) {
        const tbl = D.encounters[m.encounters.grass];
        tbl.table.forEach(function (r) {
          assert.ok(r.min >= band[0] && r.max <= band[1], id + ": " + r.species + " " + r.min + "-" + r.max + " outside " + band.join("-"));
          assert.ok(D.species[r.species], id + ": unknown species " + r.species);
        });
      }
    });
  });

  t("the three gyms, the rival and the region's bosses are defined with their house rules", function () {
    const D = MQ.Data;
    const leaders = { leader_gaskell: ["badge_cipher", "psychic", "tm_cranford_whisper", 20],
      leader_otis: ["badge_bear", "ground", "tm_bear_hug", 24],
      leader_di: ["badge_kernel", "fire", "tm_firebox_roar", 28] };
    Object.keys(leaders).forEach(function (id) {
      const tr = D.trainers[id];
      assert.ok(tr, "missing " + id);
      const l = leaders[id];
      assert.strictEqual(tr.leader.badge, l[0]);
      assert.strictEqual(tr.leader.type, l[1]);
      assert.strictEqual(tr.leader.tm, l[2]);
      assert.ok(tr.house, id + " has no house rule");
      assert.ok(tr.house.note, id + "'s house rule is not written on the door");
      assert.ok(tr.boss && tr.boss.phases.length >= 3, id + " needs three boss phases");
      assert.strictEqual(tr.party[tr.party.length - 1].level, l[3], id + "'s ace level");
      assert.ok(tr.rematch, id + " has no rematch ladder");
      tr.party.forEach(function (p) { assert.ok(D.species[p.species], id + ": unknown species " + p.species); });
    });
    ["vex_2", "vex_3", "twelve_k", "boss_apt"].forEach(function (id) {
      assert.ok(D.trainers[id], "missing " + id);
      D.trainers[id].party.forEach(function (p) { assert.ok(D.species[p.species], id + ": unknown species " + p.species); });
    });
    assert.ok(D.trainers.boss_apt.boss.phases.length >= 3, "the APT needs a scripted lap");
    // ~45 trainers was the brief; count what this workstream actually registered.
    const mine = Object.keys(D.trainers).filter(function (id) {
      const tr = D.trainers[id];
      return ["leader_gaskell", "leader_otis", "leader_di", "vex_2", "vex_3", "twelve_k", "boss_apt"].indexOf(id) >= 0 ||
        /^tr_(knutsford|tatton_park|rostherne_mere|holmes_chapel|jodrell_bank|congleton|bosley_cloud|little_moreton_hall|mow_cop|sandbach|crewe|route_alderley_knutsford|route_knutsford_holmes|route_holmes_jodrell|route_holmes_congleton|route_congleton_moreton|route_congleton_sandbach|route_sandbach_crewe)/.test(id) && !!tr;
    });
    assert.ok(mine.length >= 45, "region-mid registers " + mine.length + " trainers");
  });

  t("the region's quests are defined and every flag expression parses", function () {
    const D = MQ.Data;
    ["main_03_picnic_blankets", "main_04_the_dish_goes_dark", "main_05_puppets_on_the_line",
      "case_06_deer_census_part_two", "case_08_the_gaskell_draft", "case_09_penny_farthing_rally",
      "case_10_bear_of_congleton", "case_11_signal_box", "case_12_saxon_crosses_cipher",
      "case_13_bounty_fenced_goods", "case_15_timetable_tangle", "case_16_stokers_rematch_ladder"
    ].forEach(function (id) {
      const q = D.quests[id];
      assert.ok(q, "missing quest " + id);
      assert.ok(q.stages.length >= 1, id + " has no stages");
      q.stages.forEach(function (s) {
        assert.ok(s.id && s.text, id + " stage missing id/text");
        if (s.cond && s.cond.kind === "flag") MQ.Flags.parse(s.cond.expr);
      });
    });
  });

  t("the region carries its share of pickups, signs, cat gaps and rest points", function () {
    let items = 0, signs = 0, npcs = 0, gaps = 0, rests = 0, tiles = 0;
    midIds.forEach(function (id) {
      const m = W.get(id);
      items += (m.items || []).length;
      signs += (m.signs || []).length;
      npcs += (m.npcs || []).length;
      gaps += (m.catGaps || []).length;
      rests += (m.restPoints || []).length;
      tiles += m.width * m.height;
    });
    assert.ok(items >= 70, "pickups: " + items);
    assert.ok(signs >= 50, "signs: " + signs);
    assert.ok(npcs >= 130, "npcs: " + npcs);
    assert.ok(gaps >= 8, "cat gaps: " + gaps);
    assert.ok(rests >= 6, "rest points: " + rests);
    assert.ok(tiles >= 40000, "tiles: " + tiles);
    assert.ok(MQ.Flags.get("meadow_sat_tatton") === undefined, "rest flags are not pre-set");
    const tatton = W.get("tatton_park");
    assert.ok((tatton.restPoints || []).some(function (r) { return r.flag === "meadow_sat_tatton"; }),
      "DESIGN-INDEX: meadow_sat_tatton lives at Tatton");
  });

  t("the Jodrell dish dungeon is a climb: grounds -> control room -> tower -> bowl", function () {
    const chain = [["jodrell_bank", "jodrell_bank_control_room"],
      ["jodrell_bank_control_room", "jodrell_bank_tower"],
      ["jodrell_bank_tower", "jodrell_bank_dish"]];
    chain.forEach(function (pair) {
      const m = W.get(pair[0]);
      const w = (m.warps || []).filter(function (v) { return v.to === pair[1]; });
      assert.ok(w.length, pair[0] + " does not lead to " + pair[1]);
    });
    const gate = W.get("jodrell_bank").warps.filter(function (w) { return w.to === "jodrell_bank_control_room"; });
    gate.forEach(function (w) { assert.strictEqual(w.cond, "jodrell_open", "the interior is gated on jodrell_open"); });
    assert.strictEqual(MQ.Data.encounters.jodrell_bank_tower_cave.table[0].min >= 44, true, "the Ch.11 levels are banded for Ch.11");
  });
};
