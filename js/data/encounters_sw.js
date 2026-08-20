// =============================================================
// MonsterQuest v2 — wild encounter tables for the SOUTH-WEST:
// Nantwich and the brine lido, Hack Green, Y Berllan and Aberaeron,
// Middlewich, Winsford and the Flashes, Northwich, the Salt Mine,
// Anderton, Marbury and Great Budworth, plus every connecting route.
// Ids per DESIGN-INDEX §9: <mapid>_<zone>[_night|_rain|_fog|_dawn],
// fishing tables fish_<mapid>. Species and bands per ROSTER §9.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  // t(id, zone, rate, rows) — a row is [species, min, max, w, extra?]
  function build(rows) {
    const table = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const row = { species: r[0], min: r[1], max: r[2], w: r[3] };
      if (r[4]) { const k = Object.keys(r[4]); for (let j = 0; j < k.length; j++) row[k[j]] = r[4][k[j]]; }
      table.push(row);
    }
    return table;
  }
  function t(id, zone, rate, rows) { D.define("encounters", id, { zone: zone, rate: rate, table: build(rows) }); }
  // Border routes are shared with region-mid / region-nw: first one in wins.
  function tShared(id, zone, rate, rows) { if (!D.has("encounters", id)) t(id, zone, rate, rows); }

  const G = "grass", W = "water", C = "cave";
  const rare = { rare: true };
  const night = { time: ["night"] }, dusk = { time: ["dusk"] }, dawn = { time: ["dawn"] };
  const com = { tier: "common" }, unc = { tier: "uncommon" }, rar = { tier: "rare", rare: true };
  const leg = { tier: "legendary", rare: true }, gho = { tier: "ghost", rare: true, time: ["night"] };

  // =====================================================================
  // CHAPTER 6 — Nantwich, Hack Green, Y Berllan (Lv 25-30)
  // =====================================================================
  tShared("route_crewe_nantwich_grass", G, 0.12, [
    ["curdli", 23, 26, 28], ["sheepwire", 23, 27, 24], ["ramvolt", 24, 27, 18],
    ["rottling", 23, 26, 16], ["keystone", 24, 27, 10], ["cheshwheel", 25, 27, 4, rare]
  ]);
  tShared("route_crewe_nantwich_grass_night", G, 0.13, [
    ["mistwisp", 23, 27, 34], ["phantasmal", 25, 27, 20, rare], ["gloamite", 24, 27, 26], ["rottling", 23, 26, 20]
  ]);

  t("nantwich_grass", G, 0.08, [
    ["brinelet", 25, 28, 32], ["saltling", 25, 28, 26], ["curdli", 25, 28, 20],
    ["sheepwire", 25, 28, 14], ["panscald", 27, 29, 8, rare]
  ]);
  t("nantwich_grass_night", G, 0.09, [
    ["mistwisp", 25, 29, 34], ["gloamite", 26, 29, 26], ["brinelet", 25, 28, 22], ["phantasmal", 27, 30, 18, rare]
  ]);
  t("nantwich_water", W, 0.10, [
    ["brinelet", 25, 29, 40], ["crabbex", 26, 29, 30], ["mallardier", 25, 28, 20], ["volteel", 27, 30, 10, rare]
  ]);
  t("fish_nantwich", W, 1, [
    ["puddlish", 25, 28, 34, com], ["crabbex", 26, 29, 26, com],
    ["perchip", 26, 30, 24, unc], ["volteel", 28, 31, 12, rar], ["torrentide", 28, 32, 4, leg]
  ]);
  t("nantwich_brine_lido_water", W, 0.14, [
    ["brinelet", 25, 29, 38], ["saltling", 25, 29, 28], ["crabbex", 26, 29, 20], ["saltmaid", 28, 30, 8, rare], ["panscald", 27, 30, 6, rare]
  ]);
  t("fish_nantwich_brine_lido", W, 1, [
    ["brinelet", 25, 29, 40, com], ["saltling", 25, 29, 24, com],
    ["crabbex", 26, 30, 22, unc], ["volteel", 28, 32, 10, rar], ["saltmaid", 29, 32, 4, leg]
  ]);
  t("nantwich_acton_field_grass", G, 0.11, [
    ["rottling", 25, 28, 32], ["curdli", 25, 28, 26], ["sheepwire", 25, 28, 22], ["keystone", 26, 29, 20]
  ]);
  t("nantwich_acton_field_grass_night", G, 0.16, [
    ["phantasmal", 26, 30, 34, rare], ["mistwisp", 26, 30, 30], ["gloamite", 26, 30, 24], ["poltergrid", 28, 31, 12, rare]
  ]);

  t("route_nantwich_hackgreen_grass", G, 0.12, [
    ["sheepwire", 26, 29, 30], ["curdli", 26, 29, 22], ["rottling", 26, 29, 20],
    ["saltling", 26, 29, 16], ["virling", 27, 30, 12]
  ]);
  t("route_nantwich_hackgreen_grass_fog", G, 0.15, [
    ["proxling", 27, 31, 34], ["puppetacct", 27, 31, 30], ["virling", 27, 30, 22], ["mistwisp", 27, 30, 14]
  ]);
  t("hack_green_grass", G, 0.09, [
    ["sheepwire", 27, 30, 34], ["rottling", 27, 30, 26], ["virling", 27, 30, 24], ["botling", 27, 30, 16]
  ]);
  // The bunker is a side dungeon that opens after Ch.6 and is tuned for Ch.9+.
  t("hack_green_b1_cave", C, 0.13, [
    ["puppetacct", 40, 44, 30], ["wormhack", 41, 45, 24], ["gloamite", 40, 44, 20],
    ["trojanox", 42, 46, 14, rare], ["teramite", 43, 46, 12, rare]
  ]);
  t("hack_green_b2_cave", C, 0.14, [
    ["wormhack", 41, 45, 28], ["teramite", 42, 46, 24], ["puppetacct", 41, 45, 22],
    ["trojanox", 43, 46, 16, rare], ["botnetle", 41, 45, 10]
  ]);

  // ---- Y Berllan, Ceredigion ---------------------------------------------
  // Nothing spawns in the orchard until the drive is read: see the map's
  // `encounters` block, which the Ch.6 script swaps in at `orchard_open`.
  t("y_berllan_grass", G, 0.10, [
    ["perrypip", 26, 30, 36], ["prickpip", 26, 30, 24], ["rottling", 26, 30, 18],
    ["mulchmaw", 27, 31, 16], ["ceffylwen", 30, 32, 6, rare]
  ]);
  t("y_berllan_grass_night", G, 0.11, [
    ["owlume", 27, 31, 34], ["mistwisp", 27, 31, 26], ["perrypip", 26, 30, 22], ["strigyx", 29, 32, 18, rare]
  ]);
  t("y_berllan_pond_water", W, 0.12, [
    ["puddlish", 26, 30, 40], ["torrentide", 27, 31, 26], ["brithyll", 29, 32, 16, rare], ["mallardier", 26, 30, 18]
  ]);
  t("fish_y_berllan_pond", W, 1, [
    ["puddlish", 26, 30, 40, com], ["mallardier", 26, 30, 18, com],
    ["torrentide", 27, 32, 26, unc], ["brithyll", 29, 33, 12, rar], ["salmoneer", 30, 34, 4, leg]
  ]);
  t("y_berllan_coed_grass", G, 0.12, [
    ["perryarch", 28, 32, 30], ["oakling", 28, 32, 26], ["owlume", 28, 32, 22],
    ["mulchmaw", 28, 32, 16], ["derwydd", 31, 34, 6, rare]
  ]);
  t("y_berllan_coed_grass_night", G, 0.14, [
    ["owlume", 28, 32, 34], ["strigyx", 29, 33, 26], ["mistwisp", 28, 32, 24], ["derwydd", 31, 34, 8, rare]
  ]);
  t("y_berllan_aberaeron_lane_grass", G, 0.11, [
    ["perrypip", 27, 31, 30], ["prickpip", 27, 31, 24], ["mallardier", 27, 31, 20],
    ["owlume", 28, 32, 16], ["curlewind", 29, 32, 10]
  ]);
  t("aberaeron_water", W, 0.10, [
    ["mallardier", 28, 32, 34], ["crabbex", 28, 32, 28], ["torrentide", 29, 32, 22], ["egrette", 30, 33, 12]
  ]);
  t("fish_aberaeron", W, 1, [
    ["torrentide", 28, 32, 34, com], ["crabbex", 28, 32, 24, com],
    ["piketide", 29, 33, 24, unc], ["salmoneer", 31, 35, 12, rar], ["brithyll", 30, 34, 6, leg]
  ]);

  // =====================================================================
  // CHAPTER 7 — Middlewich, Winsford, Northwich, the mine, Anderton (29-34)
  // =====================================================================
  t("route_nantwich_winsford_grass", G, 0.12, [
    ["brinelet", 25, 29, 30], ["saltling", 25, 29, 26], ["sheepwire", 25, 29, 22],
    ["mallardier", 26, 30, 14], ["cryssal", 28, 30, 8]
  ]);
  t("route_nantwich_winsford_water", W, 0.11, [
    ["crabbex", 25, 30, 34], ["otterkin", 26, 30, 26], ["volteel", 27, 30, 20],
    ["torrentide", 26, 30, 14], ["panscald", 28, 31, 6, rare]
  ]);
  t("route_nantwich_winsford_grass_rain", G, 0.14, [
    ["volteel", 26, 30, 30], ["otterkin", 26, 30, 26], ["brinelet", 25, 29, 24], ["mallardier", 26, 30, 20]
  ]);
  t("fish_route_nantwich_winsford", W, 1, [
    ["crabbex", 25, 30, 36, com], ["puddlish", 25, 29, 22, com],
    ["torrentide", 26, 31, 24, unc], ["volteel", 28, 32, 12, rar], ["panscald", 29, 33, 6, leg]
  ]);

  tShared("route_sandbach_middlewich_grass", G, 0.12, [
    ["saltling", 27, 31, 32], ["cryssal", 28, 31, 24], ["keystone", 27, 31, 20],
    ["bitmite", 28, 31, 16], ["curdli", 27, 30, 8]
  ]);
  tShared("route_sandbach_middlewich_water", W, 0.10, [
    ["mallardier", 27, 31, 36], ["crabbex", 28, 31, 30], ["otterkin", 28, 31, 22], ["bargemog", 29, 32, 12, rare]
  ]);

  t("middlewich_grass", G, 0.07, [
    ["saltling", 28, 31, 32], ["cryssal", 28, 32, 24], ["keystone", 28, 31, 22], ["bitmite", 29, 32, 22]
  ]);
  t("middlewich_grass_night", G, 0.09, [
    ["mistwisp", 28, 32, 32], ["phantasmal", 29, 32, 24, rare], ["chordle", 30, 33, 10, rare], ["gloamite", 28, 32, 34]
  ]);
  t("middlewich_water", W, 0.10, [
    ["bargemog", 29, 32, 30], ["mallardier", 28, 32, 28], ["crabbex", 28, 32, 26], ["krabbaron", 30, 33, 16, rare]
  ]);
  t("fish_middlewich", W, 1, [
    ["puddlish", 28, 32, 30, com], ["crabbex", 28, 32, 26, com],
    ["piketide", 29, 33, 24, unc], ["volteel", 30, 34, 14, rar], ["bargemog", 31, 34, 6, leg]
  ]);

  t("route_middlewich_winsford_grass", G, 0.13, [
    ["saltling", 28, 32, 30], ["cryssal", 29, 32, 24], ["flashfin", 29, 32, 20],
    ["sheepwire", 28, 32, 16], ["subsidon", 32, 34, 6, rare]
  ]);
  t("route_middlewich_winsford_water", W, 0.12, [
    ["flashfin", 29, 33, 36], ["crabbex", 29, 33, 26], ["mallardier", 28, 32, 22], ["phishfin", 30, 33, 16]
  ]);
  t("route_middlewich_winsford_grass_fog", G, 0.15, [
    ["proxling", 30, 34, 30], ["puppetacct", 30, 34, 26], ["bitmite", 29, 33, 24], ["mistwisp", 29, 33, 20]
  ]);
  tShared("route_sandbach_middlewich_grass_night", G, 0.13, [
    ["mistwisp", 28, 32, 34], ["gloamite", 28, 32, 28], ["phantasmal", 29, 32, 20, rare], ["saltling", 27, 31, 18]
  ]);

  t("winsford_grass", G, 0.09, [
    ["saltling", 29, 33, 30], ["cryssal", 29, 33, 26], ["flashfin", 29, 33, 22],
    ["bitmite", 30, 33, 14], ["panscald", 31, 34, 8, rare]
  ]);
  t("winsford_water", W, 0.12, [
    ["flashfin", 29, 33, 36], ["crabbex", 29, 33, 24], ["phishfin", 30, 33, 22], ["subsidon", 32, 34, 10, rare], ["volteel", 30, 34, 8]
  ]);
  t("fish_winsford", W, 1, [
    ["flashfin", 28, 33, 34, unc], ["puddlish", 28, 32, 20, com],
    ["phishfin", 29, 33, 22, unc], ["volteel", 30, 34, 14, rar], ["subsidon", 31, 35, 10, { tier: "legendary", rare: true, time: ["dawn"] }]
  ]);
  t("winsford_deepstore_cave", C, 0.12, [
    ["bitmite", 28, 33, 34], ["virling", 29, 33, 24], ["cryssal", 29, 33, 22], ["teramite", 32, 34, 10, rare], ["wormhack", 31, 34, 10]
  ]);
  t("route_middlewich_northwich_grass", G, 0.12, [
    ["saltling", 28, 33, 30], ["cryssal", 29, 33, 24], ["sheepwire", 28, 32, 22],
    ["flashfin", 29, 33, 16], ["pillarnaut", 31, 34, 8]
  ]);
  t("route_middlewich_northwich_grass_rain", G, 0.14, [
    ["flashfin", 29, 33, 32], ["mallardier", 28, 32, 26], ["saltling", 28, 33, 24], ["volteel", 30, 33, 18]
  ]);
  t("route_winsford_northwich_grass", G, 0.12, [
    ["saltling", 28, 33, 28], ["cryssal", 29, 33, 24], ["mossling", 29, 33, 20],
    ["otterkin", 29, 33, 18], ["salberg", 32, 34, 10, rare]
  ]);
  t("route_winsford_northwich_water", W, 0.12, [
    ["crabbex", 28, 33, 34], ["mallardier", 28, 33, 26], ["otterkin", 29, 33, 22], ["torrentide", 29, 33, 18]
  ]);
  t("fish_route_winsford_northwich", W, 1, [
    ["crabbex", 28, 33, 34, com], ["puddlish", 28, 32, 20, com],
    ["piketide", 29, 34, 24, unc], ["volteel", 30, 34, 16, rar], ["salmoneer", 32, 36, 6, leg]
  ]);

  t("northwich_grass", G, 0.08, [
    ["saltling", 29, 33, 32], ["cryssal", 29, 33, 26], ["brinelet", 29, 33, 20], ["panscald", 30, 34, 14], ["pillarnaut", 32, 34, 8]
  ]);
  t("northwich_grass_night", G, 0.10, [
    ["gloamite", 29, 34, 32], ["mistwisp", 29, 34, 26], ["phantasmal", 30, 34, 20, rare], ["saltling", 29, 33, 22]
  ]);
  t("northwich_water", W, 0.11, [
    ["crabbex", 29, 34, 32], ["mallardier", 29, 33, 26], ["volteel", 30, 34, 22], ["krabbaron", 31, 34, 14, rare]
  ]);
  t("fish_northwich", W, 1, [
    ["crabbex", 29, 34, 32, com], ["flashfin", 29, 33, 22, com],
    ["salberg", 31, 35, 20, unc], ["volteel", 31, 35, 16, rar], ["subsidon", 32, 36, 6, leg]
  ]);

  // ---- The Salt Mine ------------------------------------------------------
  t("salt_mine_cage_cave", C, 0.08, [
    ["saltling", 30, 33, 40], ["cryssal", 30, 34, 30], ["pillarnaut", 31, 34, 20], ["bitmite", 30, 33, 10]
  ]);
  t("salt_mine_galleries_cave", C, 0.12, [
    ["saltling", 30, 34, 30], ["cryssal", 30, 34, 26], ["pillarnaut", 31, 34, 22],
    ["bitmite", 30, 34, 14], ["salberg", 32, 34, 8, rare]
  ]);
  t("salt_mine_deepstore_cold_cave", C, 0.12, [
    ["bitmite", 30, 34, 32], ["virling", 30, 34, 24], ["teramite", 32, 34, 16, rare],
    ["cryssal", 30, 34, 20], ["wormhack", 31, 34, 8]
  ]);
  t("salt_mine_back_stair_cave", C, 0.10, [
    ["saltling", 30, 34, 36], ["cryssal", 30, 34, 28], ["pillarnaut", 31, 34, 24], ["gloamite", 30, 34, 12]
  ]);
  t("salt_mine_sinkhole_cave", C, 0.12, [
    ["bitmite", 29, 33, 32], ["cryssal", 29, 33, 28], ["virling", 30, 33, 22], ["teramite", 31, 34, 10, rare], ["pillarnaut", 31, 34, 8]
  ]);
  t("salt_mine_marston_b1_cave", C, 0.14, [
    ["virling", 30, 34, 30], ["wormhack", 31, 34, 24], ["bitmite", 30, 34, 20],
    ["pillarnaut", 31, 34, 18], ["trojanox", 32, 34, 8, rare]
  ]);
  t("salt_mine_marston_b2_cave", C, 0.14, [
    ["pillarnaut", 31, 34, 30], ["salberg", 32, 34, 24, rare], ["cryssal", 30, 34, 26], ["saltling", 30, 34, 20]
  ]);
  t("salt_mine_marston_b2_water", W, 0.13, [
    ["crabbex", 30, 34, 34], ["salberg", 32, 34, 26, rare], ["brinelet", 30, 34, 28], ["krabbaron", 32, 34, 12]
  ]);
  t("salt_mine_marston_b3_cave", C, 0.15, [
    ["pillarnaut", 55, 62, 28], ["salberg", 56, 64, 24], ["trojanox", 56, 63, 20],
    ["teramite", 57, 64, 18], ["terrataur", 62, 66, 4, rare]
  ]);

  // ---- Anderton, Marbury, Great Budworth ---------------------------------
  t("route_northwich_anderton_grass", G, 0.11, [
    ["saltling", 30, 34, 28], ["bargemog", 30, 34, 24], ["mossling", 30, 34, 22], ["owlume", 31, 34, 16], ["krabbaron", 32, 34, 10, rare]
  ]);
  t("route_northwich_anderton_water", W, 0.12, [
    ["krabbaron", 30, 34, 32], ["crabbex", 30, 34, 26], ["mallardier", 30, 34, 24], ["bargemog", 31, 34, 18, rare]
  ]);
  t("anderton_grass", G, 0.08, [
    ["bargemog", 30, 34, 32], ["saltling", 30, 34, 24], ["owlume", 31, 34, 22], ["krabbaron", 31, 34, 22]
  ]);
  t("anderton_water", W, 0.12, [
    ["krabbaron", 30, 34, 34], ["mallardier", 30, 34, 26], ["crabbex", 30, 34, 24], ["bargemog", 31, 34, 16, rare]
  ]);
  t("fish_anderton", W, 1, [
    ["crabbex", 30, 34, 30, com], ["mallardier", 30, 34, 20, com],
    ["krabbaron", 31, 35, 26, unc], ["piketide", 31, 35, 16, rar], ["ladymere", 32, 36, 8, gho]
  ]);
  t("marbury_park_grass", G, 0.12, [
    ["owlume", 30, 34, 34], ["mossling", 30, 34, 26], ["strigyx", 31, 34, 22], ["oakling", 30, 34, 18]
  ]);
  t("marbury_park_grass_night", G, 0.15, [
    ["strigyx", 30, 34, 32], ["owlume", 30, 34, 28], ["mistwisp", 30, 34, 24], ["ladymere", 32, 35, 10, rare]
  ]);
  t("route_anderton_budworth_grass", G, 0.12, [
    ["owlume", 30, 34, 30], ["mossling", 30, 34, 26], ["oakling", 30, 34, 22], ["strigyx", 31, 34, 14], ["bargemog", 31, 34, 8]
  ]);
  t("route_anderton_budworth_grass_night", G, 0.14, [
    ["strigyx", 31, 35, 34], ["owlume", 30, 34, 30], ["mistwisp", 30, 34, 24], ["ladymere", 32, 35, 8, rare]
  ]);
  t("great_budworth_grass", G, 0.07, [
    ["owlume", 30, 34, 30], ["curdli", 30, 34, 26], ["oakling", 30, 34, 24], ["belfrit", 31, 34, 20]
  ]);
  t("route_budworth_lymm_grass", G, 0.12, [
    ["mossling", 31, 35, 28], ["owlume", 31, 35, 24], ["otterkin", 31, 35, 22],
    ["bargemog", 31, 35, 18], ["oakling", 31, 35, 8]
  ]);
  t("route_budworth_lymm_grass_night", G, 0.14, [
    ["strigyx", 31, 35, 32], ["owlume", 31, 35, 28], ["mistwisp", 31, 35, 24], ["bargemog", 31, 35, 16]
  ]);
  t("route_budworth_lymm_water", W, 0.11, [
    ["bargemog", 31, 35, 32], ["mallardier", 31, 35, 28], ["otterkin", 31, 35, 24], ["krabbaron", 32, 35, 16]
  ]);
})();
