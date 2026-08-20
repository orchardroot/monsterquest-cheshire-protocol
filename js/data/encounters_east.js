// =============================================================
// MonsterQuest v2 — wild encounter tables for the EAST region
// (Macclesfield, Bollington, Prestbury, Poynton, Lyme, Tegg's Nose,
//  Wilmslow, Styal, Lindow Moss, Alderley Edge, the Edge Caverns).
// Ids per DESIGN-INDEX §9: <mapid>_<zone>[_night|_rain|_fog], fish_<mapid>.
// Species/level bands per ROSTER §9. Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  // t(id, zone, rate, rows) — a row is [species, min, max, w, extra?]
  function t(id, zone, rate, rows) {
    const table = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const row = { species: r[0], min: r[1], max: r[2], w: r[3] };
      if (r[4]) { const k = Object.keys(r[4]); for (let j = 0; j < k.length; j++) row[k[j]] = r[4][k[j]]; }
      table.push(row);
    }
    D.define("encounters", id, { zone: zone, rate: rate, table: table });
  }
  const G = "grass", W = "water", C = "cave";
  const dusk = { time: ["dusk"] }, night = { time: ["night"] }, rare = { rare: true };

  // ---- Chapter 1 belt: Macclesfield, the canal, Bollington ---------------
  t("macclesfield_grass", G, 0.07, [
    ["flitchick", 3, 5, 34], ["sootling", 3, 5, 26], ["nibbit", 3, 5, 22], ["bobbinet", 4, 6, 12], ["sparkit", 4, 6, 6, rare]
  ]);
  t("macclesfield_grass_night", G, 0.08, [
    ["flitmoth", 3, 6, 40], ["nibbit", 3, 6, 26], ["sootling", 4, 6, 18], ["webshade", 5, 7, 10], ["spindrake", 5, 8, 6, rare]
  ]);
  t("fish_macclesfield", W, 1, [
    ["puddlish", 4, 7, 40, { tier: "common" }], ["towpaddle", 4, 8, 26, { tier: "common" }],
    ["perchip", 6, 9, 22, { tier: "uncommon" }], ["torrentide", 8, 12, 8, { tier: "rare", rare: true }]
  ]);

  t("route_macc_bollington_grass", G, 0.12, [
    ["nibbit", 3, 6, 26], ["towpaddle", 3, 6, 22], ["flitchick", 3, 6, 18],
    ["mistlop", 4, 6, 14], ["sootling", 4, 6, 12], ["sparkit", 4, 6, 8]
  ]);
  t("route_macc_bollington_grass_night", G, 0.14, [
    ["flitmoth", 3, 7, 32], ["nibbit", 3, 7, 24], ["bollinmoth", 6, 8, 14],
    ["webshade", 5, 7, 14], ["mistwisp", 6, 8, 10], ["spindrake", 6, 8, 6, rare]
  ]);
  t("route_macc_bollington_grass_rain", G, 0.13, [
    ["towpaddle", 4, 7, 34], ["puddlish", 4, 7, 26], ["nibbit", 3, 6, 22], ["heronet", 6, 8, 18]
  ]);
  t("route_macc_bollington_water", W, 0.10, [
    ["towpaddle", 4, 7, 44], ["puddlish", 4, 7, 34], ["heronet", 6, 8, 22]
  ]);
  t("fish_route_macc_bollington", W, 1, [
    ["puddlish", 4, 8, 44, { tier: "common" }], ["towpaddle", 4, 8, 20, { tier: "common" }],
    ["perchip", 5, 9, 26, { tier: "uncommon" }], ["torrentide", 8, 12, 10, { tier: "rare", rare: true }]
  ]);
  t("route_macc_bollington_island_grass", G, 0.12, [
    ["spindrake", 6, 9, 30, rare], ["bobbinet", 5, 8, 26], ["flitmoth", 5, 8, 24], ["nibbit", 4, 7, 20]
  ]);

  t("bollington_grass", G, 0.07, [
    ["flitchick", 4, 6, 32], ["mistlop", 4, 6, 26], ["sootling", 4, 6, 22], ["sparkit", 4, 6, 14], ["nancylith", 6, 8, 6, rare]
  ]);
  t("kerridge_hill_grass", G, 0.13, [
    ["mistlop", 4, 7, 28], ["grousel", 5, 8, 24], ["galewing", 6, 8, 14],
    ["mistewe", 5, 8, 16], ["flitchick", 4, 7, 12], ["nancylith", 6, 9, 6, rare]
  ]);
  t("kerridge_hill_grass_night", G, 0.14, [
    ["flitmoth", 5, 8, 32], ["mistlop", 5, 8, 24], ["nancylith", 6, 9, 16, rare],
    ["mistwisp", 6, 9, 16], ["webshade", 6, 9, 12]
  ]);
  t("kerridge_hill_grass_wind", G, 0.15, [
    ["galewing", 6, 9, 34], ["grousel", 5, 8, 30], ["mistewe", 5, 8, 22], ["nancylith", 7, 9, 14, rare]
  ]);

  t("route_bollington_poynton_grass", G, 0.12, [
    ["mistlop", 4, 7, 28], ["flitchick", 4, 7, 22], ["grousel", 5, 8, 18],
    ["nibbit", 4, 7, 16], ["mistewe", 5, 8, 10], ["keystone", 6, 8, 6, rare]
  ]);
  t("route_bollington_poynton_grass_night", G, 0.13, [
    ["flitmoth", 4, 8, 34], ["mistlop", 4, 8, 28], ["sootling", 5, 8, 20], ["nancylith", 6, 9, 10, dusk], ["webshade", 6, 8, 8]
  ]);
  t("route_bollington_poynton_tunnel_cave", C, 0.16, [
    ["squeakwing", 6, 9, 34], ["sootling", 5, 8, 26], ["webshade", 6, 9, 22], ["peepcam", 7, 9, 12], ["gloamite", 8, 10, 6, rare]
  ]);

  t("poynton_grass", G, 0.08, [
    ["pitpony", 4, 7, 34], ["flitchick", 4, 7, 24], ["sparkit", 4, 7, 20], ["nibbit", 4, 7, 16], ["peepcam", 6, 8, 6, rare]
  ]);
  t("poynton_water", W, 0.10, [
    ["puddlish", 4, 8, 46], ["towpaddle", 4, 8, 32], ["heronet", 6, 9, 22]
  ]);
  t("fish_poynton", W, 1, [
    ["puddlish", 4, 8, 46, { tier: "common" }], ["perchip", 5, 9, 30, { tier: "uncommon" }],
    ["torrentide", 8, 12, 16, { tier: "rare", rare: true }], ["piketide", 12, 16, 8, { tier: "legendary", rare: true }]
  ]);
  t("poynton_pit_adit_cave", C, 0.17, [
    ["pitpony", 5, 8, 30], ["squeakwing", 6, 9, 26], ["sootling", 5, 8, 22], ["cuprabug", 7, 9, 14], ["gloamite", 8, 10, 8, rare]
  ]);

  t("route_poynton_lyme_grass", G, 0.12, [
    ["grousel", 5, 8, 26], ["mistewe", 5, 8, 22], ["mistlop", 5, 8, 18],
    ["galewing", 6, 9, 14], ["piphart", 6, 9, 12], ["harrowlop", 7, 9, 8]
  ]);
  t("route_poynton_lyme_grass_rain", G, 0.13, [
    ["mistewe", 5, 8, 34], ["heronet", 6, 9, 24], ["grousel", 5, 8, 24], ["sheepwire", 7, 9, 18]
  ]);
  t("route_poynton_lyme_grass_wind", G, 0.14, [
    ["galewing", 6, 9, 34], ["grousel", 5, 8, 28], ["mistewe", 5, 8, 24], ["moorcock", 8, 10, 14]
  ]);

  t("lyme_park_grass", G, 0.12, [
    ["piphart", 6, 9, 30], ["grousel", 6, 9, 20], ["mistewe", 6, 9, 18],
    ["galewing", 7, 9, 14], ["moorcock", 8, 10, 10], ["stagwire", 9, 11, 8, rare]
  ]);
  t("lyme_park_water", W, 0.10, [
    ["puddlish", 6, 9, 44], ["towpaddle", 6, 9, 32], ["heronet", 7, 10, 24]
  ]);
  t("fish_lyme_park", W, 1, [
    ["puddlish", 6, 10, 42, { tier: "common" }], ["perchip", 7, 11, 30, { tier: "uncommon" }],
    ["torrentide", 9, 13, 18, { tier: "rare", rare: true }], ["piketide", 13, 17, 10, { tier: "legendary", rare: true }]
  ]);
  t("lyme_park_bowstones_grass", G, 0.13, [
    ["mistewe", 6, 9, 28], ["grousel", 6, 9, 24], ["harrowlop", 8, 10, 18],
    ["galewing", 7, 10, 16], ["keystone", 8, 11, 8], ["nancylith", 8, 11, 6, rare]
  ]);
  t("lyme_park_cage_cave", C, 0.16, [
    ["gloamite", 8, 11, 30], ["squeakwing", 7, 10, 26], ["mistwisp", 8, 11, 22], ["cuprabug", 8, 11, 16], ["peatkin", 9, 12, 6, rare]
  ]);

  t("route_macc_prestbury_grass", G, 0.12, [
    ["heronet", 5, 8, 24], ["nibbit", 4, 7, 22], ["flitchick", 4, 7, 18],
    ["prickpip", 5, 8, 16], ["sootling", 4, 7, 12], ["bobbinet", 6, 8, 8]
  ]);
  t("route_macc_prestbury_grass_night", G, 0.13, [
    ["flitmoth", 5, 8, 32], ["bollinmoth", 7, 9, 20], ["mistwisp", 6, 9, 20], ["spindrake", 6, 9, 14, rare], ["webshade", 6, 9, 14]
  ]);
  t("route_macc_prestbury_grass_rain", G, 0.14, [
    ["heronet", 5, 9, 34], ["towpaddle", 5, 8, 26], ["puddlish", 5, 8, 24], ["otterkin", 8, 10, 16]
  ]);
  t("route_macc_prestbury_water", W, 0.11, [
    ["towpaddle", 5, 8, 36], ["puddlish", 5, 8, 30], ["heronet", 6, 9, 22], ["otterkin", 8, 10, 12]
  ]);

  t("prestbury_grass", G, 0.07, [
    ["sparkit", 4, 7, 34], ["flitchick", 4, 7, 24], ["prickpip", 5, 8, 20], ["peepcam", 6, 8, 16], ["fulgurcat", 9, 11, 6, rare]
  ]);
  t("prestbury_hedge_maze_grass", G, 0.14, [
    ["prickpip", 5, 8, 30], ["bobbinet", 6, 9, 24], ["sparkit", 5, 8, 22], ["peepcam", 7, 9, 16], ["bramblehog", 9, 11, 8, rare]
  ]);

  t("route_prestbury_wilmslow_grass", G, 0.12, [
    ["prickpip", 5, 8, 26], ["sparkit", 5, 8, 22], ["flitchick", 5, 8, 18],
    ["piphart", 6, 9, 16], ["pitpony", 6, 9, 12], ["peepcam", 7, 10, 6]
  ]);
  t("route_prestbury_wilmslow_grass_fog", G, 0.14, [
    ["peepcam", 7, 10, 34], ["puppetacct", 8, 11, 26], ["prickpip", 6, 9, 24], ["sparkit", 6, 9, 16]
  ]);

  t("route_macc_teggs_grass", G, 0.13, [
    ["mistlop", 5, 8, 26], ["grousel", 6, 9, 22], ["sootling", 5, 8, 18],
    ["mistewe", 6, 9, 16], ["harrowlop", 8, 11, 12], ["nancylith", 8, 11, 6, rare]
  ]);
  t("teggs_nose_grass", G, 0.14, [
    ["moorcock", 12, 16, 24], ["harrowlop", 12, 16, 22], ["galewing", 12, 16, 20],
    ["nancylith", 13, 17, 16], ["runestane", 14, 18, 12], ["gargoylet", 15, 19, 6, rare]
  ]);
  t("teggs_nose_grass_night", G, 0.15, [
    ["mistwisp", 13, 17, 30], ["owlume", 13, 17, 24], ["nancylith", 13, 17, 20], ["gargoylet", 15, 19, 14], ["strigyx", 17, 20, 6, rare]
  ]);
  t("teggs_nose_quarry_cave", C, 0.17, [
    ["nancylith", 13, 17, 28], ["cuprabug", 12, 16, 24], ["gloamite", 13, 17, 20],
    ["runestane", 14, 18, 16], ["verdigrit", 16, 19, 8], ["gargoylet", 16, 19, 6, rare]
  ]);
  t("shutlingsloe_grass", G, 0.14, [
    ["galewing", 14, 18, 30], ["moorcock", 14, 18, 26], ["mistewe", 13, 17, 20], ["harrowlop", 14, 18, 16], ["gargoylet", 16, 20, 8, rare]
  ]);
  t("teggs_nose_water", W, 0.11, [
    ["heronet", 12, 16, 38], ["herowing", 15, 18, 26], ["puddlish", 12, 16, 22], ["torrentide", 15, 18, 14]
  ]);

  // ---- Chapter 2 belt: Wilmslow, Styal, Lindow, Alderley ------------------
  t("wilmslow_grass", G, 0.07, [
    ["sparkit", 8, 11, 30], ["flitchick", 8, 11, 24], ["botling", 9, 12, 20], ["peepcam", 9, 12, 18], ["fulgurcat", 12, 14, 8, rare]
  ]);
  t("route_wilmslow_styal_grass", G, 0.12, [
    ["sheepwire", 8, 11, 24], ["heronet", 8, 11, 22], ["flitchick", 8, 11, 18],
    ["sparkit", 8, 11, 16], ["botling", 9, 12, 12], ["puddlish", 8, 11, 8]
  ]);
  t("route_wilmslow_styal_water", W, 0.11, [
    ["heronet", 8, 12, 36], ["puddlish", 8, 12, 30], ["otterkin", 10, 13, 20], ["towpaddle", 8, 12, 14]
  ]);
  t("fish_route_wilmslow_styal", W, 1, [
    ["perchip", 8, 12, 40, { tier: "common" }], ["puddlish", 8, 12, 26, { tier: "common" }],
    ["torrentide", 10, 14, 24, { tier: "uncommon" }], ["piketide", 13, 17, 10, { tier: "rare", rare: true }]
  ]);

  t("styal_grass", G, 0.12, [
    ["sluiceling", 8, 12, 26], ["botling", 8, 12, 24], ["sheepwire", 8, 12, 20],
    ["sootling", 8, 12, 16], ["heronet", 9, 12, 14]
  ]);
  t("styal_grass_night", G, 0.14, [
    ["webshade", 9, 13, 32], ["sluiceling", 9, 13, 24], ["mistwisp", 10, 13, 20], ["botling", 9, 13, 16], ["widowisp", 13, 15, 8, rare]
  ]);
  t("styal_water", W, 0.12, [
    ["sluiceling", 9, 12, 38], ["heronet", 9, 12, 28], ["otterkin", 10, 13, 22], ["millrace", 13, 15, 12, rare]
  ]);
  t("fish_styal", W, 1, [
    ["perchip", 9, 13, 40, { tier: "common" }], ["torrentide", 10, 14, 28, { tier: "uncommon" }],
    ["otterkin", 11, 15, 20, { tier: "uncommon" }], ["piketide", 14, 18, 12, { tier: "rare", rare: true }]
  ]);

  t("route_wilmslow_lindow_grass", G, 0.13, [
    ["bogleap", 9, 12, 30], ["mistwisp", 9, 12, 24], ["sheepwire", 9, 12, 22], ["peatkin", 10, 13, 16], ["puppetacct", 10, 13, 8]
  ]);
  t("lindow_moss_grass", G, 0.15, [
    ["mistwisp", 9, 13, 26], ["bogleap", 9, 13, 24], ["peatkin", 10, 13, 20],
    ["sheepwire", 9, 13, 16], ["puppetacct", 10, 13, 14]
  ]);
  t("lindow_moss_grass_night", G, 0.17, [
    ["mistwisp", 10, 14, 34], ["peatkin", 10, 14, 26], ["bogleap", 10, 14, 20], ["phantasmal", 13, 15, 12, rare], ["toadlore", 13, 15, 8, rare]
  ]);
  t("lindow_moss_grass_fog", G, 0.18, [
    ["puppetacct", 10, 14, 40], ["proxling", 11, 14, 26], ["mistwisp", 10, 14, 24], ["peatkin", 11, 14, 10]
  ]);
  t("lindow_moss_water", W, 0.14, [
    ["bogleap", 10, 14, 38], ["towpaddle", 10, 14, 26], ["puddlish", 10, 14, 22], ["toadlore", 13, 15, 14, rare]
  ]);
  t("fish_lindow_moss", W, 1, [
    ["bogleap", 10, 14, 42, { tier: "common" }], ["puddlish", 10, 14, 24, { tier: "common" }],
    ["toadlore", 13, 16, 22, { tier: "uncommon" }], ["phantasmal", 14, 18, 12, { tier: "ghost", rare: true, time: ["night"] }]
  ]);
  t("lindow_moss_deep_grass", G, 0.18, [
    ["peatkin", 12, 15, 30], ["mistwisp", 12, 15, 26], ["phantasmal", 13, 16, 20], ["bogleap", 12, 15, 16], ["lindowan", 15, 17, 8, rare]
  ]);

  t("route_wilmslow_alderley_grass", G, 0.12, [
    ["prickpip", 9, 13, 26], ["cuprabug", 10, 13, 22], ["mistlop", 9, 13, 18],
    ["sparkit", 9, 13, 16], ["owlume", 11, 14, 12, dusk], ["squeakwing", 10, 13, 10]
  ]);
  t("route_wilmslow_alderley_grass_night", G, 0.14, [
    ["owlume", 11, 14, 34], ["mistwisp", 11, 14, 24], ["squeakwing", 10, 14, 22], ["webshade", 10, 14, 14], ["strigyx", 15, 17, 6, rare]
  ]);

  t("alderley_edge_grass", G, 0.12, [
    ["cuprabug", 10, 13, 28], ["squeakwing", 10, 13, 24], ["prickpip", 10, 13, 20],
    ["owlume", 11, 14, 16], ["sparkit", 10, 13, 12]
  ]);
  t("alderley_edge_grass_night", G, 0.14, [
    ["owlume", 11, 14, 30], ["squeakwing", 11, 14, 26], ["mistwisp", 11, 14, 22], ["gloamite", 12, 15, 14], ["strigyx", 15, 17, 8, rare]
  ]);
  t("alderley_edge_caverns_b1_cave", C, 0.16, [
    ["cuprabug", 10, 14, 32], ["squeakwing", 10, 14, 28], ["gloamite", 11, 14, 22],
    ["peepcam", 11, 14, 10], ["verdigrit", 13, 16, 8, rare]
  ]);
  t("alderley_edge_caverns_b2_cave", C, 0.16, [
    ["gloamite", 12, 15, 30], ["cuprabug", 12, 15, 26], ["squeakwing", 12, 15, 24], ["shriekwing", 15, 17, 12], ["verdigrit", 15, 17, 8, rare]
  ]);
  t("alderley_edge_caverns_b2_water", W, 0.14, [
    ["crabbex", 30, 36, 34], ["otterkin", 30, 36, 26], ["gloamite", 30, 36, 22], ["bellmere", 32, 36, 8, rare]
  ]);
  t("alderley_edge_caverns_b3_cave", C, 0.16, [
    ["gloamguard", 55, 62, 26], ["dolmenor", 55, 62, 20], ["mowstane", 55, 62, 18],
    ["timberwraith", 55, 62, 16], ["strigyx", 56, 63, 14], ["gloamite", 55, 60, 6]
  ]);
  t("alderley_edge_caverns_slide_cave", C, 0.10, [
    ["gloamite", 11, 14, 40], ["cuprabug", 11, 14, 34], ["squeakwing", 11, 14, 26]
  ]);
  t("fish_alderley_edge", W, 1, [
    ["puddlish", 10, 14, 40, { tier: "common" }], ["perchip", 11, 15, 30, { tier: "uncommon" }],
    ["torrentide", 12, 16, 20, { tier: "rare", rare: true }], ["bellmere", 16, 20, 10, { tier: "legendary", rare: true }]
  ]);

  // ---- variants and fishing the first pass left thin ---------------------
  t("prestbury_grass_night", G, 0.08, [
    ["peepcam", 6, 9, 30], ["flitmoth", 5, 8, 26], ["sparkit", 5, 8, 20], ["webshade", 6, 9, 16], ["fulgurcat", 9, 12, 8, rare]
  ]);
  t("fish_prestbury", W, 1, [
    ["puddlish", 5, 9, 42, { tier: "common" }], ["perchip", 6, 10, 30, { tier: "uncommon" }],
    ["torrentide", 8, 12, 18, { tier: "rare", rare: true }], ["otterkin", 9, 13, 10, { tier: "rare", rare: true }]
  ]);
  t("poynton_grass_night", G, 0.09, [
    ["flitmoth", 5, 8, 32], ["pitpony", 5, 8, 24], ["squeakwing", 6, 9, 20], ["webshade", 6, 9, 16], ["peepcam", 7, 10, 8, rare]
  ]);
  t("lyme_park_grass_night", G, 0.13, [
    ["owlume", 8, 11, 28], ["mistwisp", 8, 11, 24], ["piphart", 7, 10, 22], ["harrowlop", 8, 11, 18], ["stagwire", 10, 12, 8, rare]
  ]);
  t("lyme_park_grass_wind", G, 0.14, [
    ["galewing", 8, 11, 34], ["grousel", 7, 10, 26], ["mistewe", 7, 10, 24], ["moorcock", 9, 12, 16]
  ]);
  t("fish_teggs_nose", W, 1, [
    ["perchip", 12, 16, 38, { tier: "common" }], ["puddlish", 12, 16, 24, { tier: "common" }],
    ["torrentide", 14, 18, 26, { tier: "uncommon" }], ["piketide", 16, 20, 12, { tier: "rare", rare: true }]
  ]);
  t("shutlingsloe_grass_wind", G, 0.16, [
    ["galewing", 15, 19, 40], ["moorcock", 15, 19, 28], ["harrowlop", 15, 19, 20], ["gargoylet", 17, 20, 12, rare]
  ]);
  t("styal_water_night", W, 0.13, [
    ["sluiceling", 10, 14, 34], ["otterkin", 11, 14, 26], ["mistwisp", 11, 14, 24], ["millrace", 14, 16, 16, rare]
  ]);
  t("wilmslow_grass_night", G, 0.08, [
    ["flitmoth", 8, 12, 30], ["peepcam", 9, 12, 26], ["webshade", 9, 12, 22], ["puppetacct", 10, 13, 14], ["fulgurcat", 12, 15, 8, rare]
  ]);
  t("fish_wilmslow", W, 1, [
    ["perchip", 8, 12, 40, { tier: "common" }], ["puddlish", 8, 12, 28, { tier: "common" }],
    ["torrentide", 10, 14, 22, { tier: "uncommon" }], ["otterkin", 11, 15, 10, { tier: "rare", rare: true }]
  ]);
  t("prestbury_hedge_maze_grass_night", G, 0.15, [
    ["webshade", 6, 9, 32], ["bobbinet", 6, 9, 26], ["flitmoth", 6, 9, 22], ["bramblehog", 9, 12, 12, rare], ["spindrake", 7, 10, 8, rare]
  ]);
  t("teggs_nose_grass_wind", G, 0.16, [
    ["galewing", 13, 17, 36], ["moorcock", 13, 17, 26], ["harrowlop", 13, 17, 22], ["nancylith", 14, 18, 16]
  ]);
  t("alderley_edge_caverns_b1_water", W, 0.12, [
    ["gloamite", 11, 15, 40], ["cuprabug", 11, 15, 30], ["otterkin", 12, 15, 20], ["verdigrit", 14, 17, 10, rare]
  ]);
})();
