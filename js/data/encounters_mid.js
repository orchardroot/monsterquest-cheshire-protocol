// =============================================================
// MonsterQuest v2 — wild encounter tables for the MID region
// (Knutsford, Tatton, Rostherne, Holmes Chapel, Jodrell Bank,
//  Congleton, the Cloud, Little Moreton, Mow Cop, Sandbach, Crewe).
// Ids per DESIGN-INDEX §9: <mapid>_<zone>[_night|_rain|_fog], fish_<mapid>.
// Species and level bands per ROSTER §9. Owned by region-mid.
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
  const rare = { rare: true }, dusk = { time: ["dusk"] }, dawn = { time: ["dawn"] };
  const cmn = { tier: "common" }, unc = { tier: "uncommon" }, rre = { tier: "rare", rare: true }, leg = { tier: "legendary", rare: true };

  // ================= Chapter 3 — the Bollin heath and the parkland ========
  // R8 Chelford Heath & Radnor Mere: gorse, hedgehogs, and an inkwell sprite
  // that has wandered out of the Gaskell tower and regrets it.
  t("route_alderley_knutsford_grass", G, 0.12, [
    ["prickpip", 12, 15, 28], ["sheepwire", 12, 15, 20], ["bramblehog", 13, 16, 16],
    ["quillet", 13, 16, 14], ["piphart", 13, 16, 12], ["owlume", 14, 16, 10, dusk]
  ]);
  t("route_alderley_knutsford_grass_night", G, 0.14, [
    ["mistwisp", 13, 16, 32], ["owlume", 13, 16, 26], ["prickpip", 12, 16, 20],
    ["webshade", 13, 16, 14], ["bellmere", 14, 17, 8, rare]
  ]);
  t("route_alderley_knutsford_grass_rain", G, 0.13, [
    ["sheepwire", 12, 16, 34], ["heronet", 13, 16, 26], ["prickpip", 12, 16, 24], ["bramblehog", 13, 17, 16]
  ]);
  t("route_alderley_knutsford_water", W, 0.10, [
    ["perchip", 13, 16, 40], ["heronet", 13, 16, 30], ["towpaddle", 12, 15, 30]
  ]);
  t("fish_route_alderley_knutsford", W, 1, [
    ["puddlish", 12, 16, 38, cmn], ["perchip", 13, 17, 32, unc],
    ["piketide", 16, 20, 20, unc], ["torrentide", 16, 21, 10, rre]
  ]);

  // Knutsford: the Heath, which is a common in the legal sense and a car
  // park in every other sense. Quillets nest in the tower and come down.
  t("knutsford_grass", G, 0.06, [
    ["quillet", 13, 16, 40], ["prickpip", 13, 16, 26], ["curdli", 13, 16, 20], ["sheepwire", 13, 16, 14]
  ]);
  t("knutsford_grass_night", G, 0.07, [
    ["quillet", 14, 17, 34], ["mistwisp", 14, 17, 30], ["owlume", 14, 17, 24], ["scriptorix", 17, 19, 12, rare]
  ]);

  // Tatton Park: the deer, the mere, the swans that own the Knutsford gate.
  t("tatton_park_grass", G, 0.11, [
    ["piphart", 13, 17, 30], ["stagwire", 15, 18, 16], ["swanling", 13, 17, 16],
    ["quillet", 13, 17, 14], ["sheepwire", 13, 17, 14], ["ramvolt", 15, 18, 10]
  ]);
  t("tatton_park_grass_rain", G, 0.12, [
    ["stagwire", 15, 18, 34], ["heronet", 14, 17, 26], ["swanling", 13, 17, 24], ["piphart", 13, 17, 16]
  ]);
  t("tatton_park_grass_night", G, 0.12, [
    ["manorwraith", 16, 19, 14, rare], ["mistwisp", 14, 18, 30], ["owlume", 14, 18, 28], ["piphart", 13, 17, 28]
  ]);
  t("tatton_park_water", W, 0.10, [
    ["swanling", 13, 17, 34], ["perchip", 13, 17, 30], ["piketide", 16, 19, 20], ["heronet", 14, 17, 16]
  ]);
  t("fish_tatton_park", W, 1, [
    ["perchip", 13, 18, 36, cmn], ["puddlish", 13, 17, 24, cmn],
    ["piketide", 16, 21, 26, unc], ["torrentide", 17, 22, 14, rre]
  ]);

  // The Rostherne lane, and the mere itself: deepest in Cheshire, and the
  // only water in the county with a bell in it.
  t("route_tatton_rostherne_grass", G, 0.12, [
    ["piphart", 14, 17, 28], ["prickpip", 13, 17, 24], ["heronet", 14, 18, 20],
    ["swanling", 14, 18, 16], ["quillet", 14, 18, 12]
  ]);
  t("rostherne_mere_grass", G, 0.10, [
    ["heronet", 14, 18, 32], ["swanling", 14, 18, 26], ["quillet", 14, 18, 22], ["owlume", 15, 18, 20, dusk]
  ]);
  t("rostherne_mere_water", W, 0.13, [
    ["swanling", 14, 18, 32], ["piketide", 16, 20, 26], ["dishlet", 16, 19, 24], ["bellmere", 16, 20, 18, rare]
  ]);
  t("rostherne_mere_water_night", W, 0.15, [
    ["bellmere", 16, 20, 34, rare], ["piketide", 16, 20, 28], ["mistwisp", 15, 19, 22], ["swanling", 14, 18, 16]
  ]);
  t("fish_rostherne_mere", W, 1, [
    ["perchip", 14, 18, 30, cmn], ["piketide", 17, 22, 30, unc],
    ["bellmere", 18, 23, 22, rre], ["torrentide", 18, 23, 18, rre]
  ]);

  // ================= Chapter 4 — the Dane, the dish, Beartown ============
  // R9 Ollerton & Goostrey lanes: farm country, a level crossing, and the
  // first sheep in Cheshire to have opinions about the sky.
  t("route_knutsford_holmes_grass", G, 0.12, [
    ["sheepwire", 14, 18, 28], ["ramvolt", 15, 18, 22], ["piphart", 14, 18, 18],
    ["quillet", 14, 18, 16], ["curdli", 15, 18, 16]
  ]);
  t("route_knutsford_holmes_grass_night", G, 0.13, [
    ["mistwisp", 15, 19, 30], ["owlume", 15, 19, 26], ["sparkrail", 16, 19, 24], ["sheepwire", 14, 18, 20]
  ]);
  t("route_knutsford_holmes_grass_rain", G, 0.13, [
    ["sheepwire", 14, 18, 36], ["ramvolt", 15, 19, 28], ["heronet", 15, 19, 22], ["otterkin", 16, 19, 14]
  ]);

  t("holmes_chapel_grass", G, 0.06, [
    ["keystone", 16, 19, 32], ["curdli", 15, 19, 26], ["sparkrail", 16, 19, 22], ["quillet", 15, 19, 20]
  ]);
  t("holmes_chapel_grass_night", G, 0.09, [
    ["poltergrid", 18, 21, 12, rare], ["sparkrail", 17, 21, 34], ["keystone", 17, 20, 30], ["mistwisp", 16, 20, 24]
  ]);

  // R10 Twemlow meadows: twenty-three arches, one keystone sprite per arch,
  // and a river that takes the meadow back whenever it rains.
  t("route_holmes_jodrell_grass", G, 0.13, [
    ["keystone", 16, 20, 30], ["heronet", 16, 20, 22], ["otterkin", 17, 20, 18],
    ["quillet", 16, 20, 16], ["dishlet", 18, 21, 14]
  ]);
  t("route_holmes_jodrell_grass_rain", G, 0.14, [
    ["otterkin", 17, 20, 32], ["heronet", 16, 20, 30], ["keystone", 16, 20, 24], ["towpaddle", 16, 19, 14]
  ]);
  t("route_holmes_jodrell_grass_night", G, 0.14, [
    ["sparkrail", 17, 20, 32], ["mistwisp", 16, 20, 26], ["owlume", 17, 20, 24], ["poltergrid", 19, 22, 8, rare]
  ]);
  t("route_holmes_jodrell_water", W, 0.11, [
    ["otterkin", 17, 20, 40], ["heronet", 16, 20, 32], ["perchip", 16, 20, 28]
  ]);
  t("fish_route_holmes_jodrell", W, 1, [
    ["puddlish", 16, 20, 34, cmn], ["perchip", 16, 21, 30, cmn],
    ["otterkin", 18, 22, 22, unc], ["torrentide", 19, 24, 14, rre]
  ]);

  // Jodrell Bank: the arboretum grounds. Small dishes that turn to face
  // whatever the big one is facing, which this month is not the sky.
  t("jodrell_bank_grass", G, 0.12, [
    ["dishlet", 17, 21, 34], ["quillet", 17, 21, 22], ["piphart", 17, 21, 20], ["oakling", 18, 21, 14], ["keystone", 17, 21, 10]
  ]);
  t("jodrell_bank_grass_night", G, 0.14, [
    ["pulsaris", 19, 22, 14, rare], ["dishlet", 18, 22, 34], ["owlume", 18, 22, 28], ["mistwisp", 18, 22, 24]
  ]);
  t("jodrell_bank_grass_fog", G, 0.14, [
    ["dishlet", 18, 22, 32], ["proxling", 18, 22, 26], ["puppetacct", 18, 22, 24], ["pulsaris", 19, 22, 18, rare]
  ]);
  // The tower, the control room and the bowl — Ch.11 levels, shared table.
  t("jodrell_bank_tower_cave", C, 0.14, [
    ["dishlet", 44, 47, 22], ["parabolus", 45, 50, 22], ["teramite", 44, 48, 20],
    ["wormhack", 44, 48, 18], ["shardmind", 45, 49, 12], ["pulsaris", 45, 49, 6, rare]
  ]);

  // R11 Brereton Heath & Astbury Mere: two lakes, otters, and a birdhide.
  t("route_holmes_congleton_grass", G, 0.13, [
    ["otterkin", 16, 20, 26], ["prickpip", 16, 20, 22], ["bramblehog", 17, 20, 20],
    ["swanling", 17, 20, 18], ["tudorling", 18, 21, 14]
  ]);
  t("route_holmes_congleton_grass_night", G, 0.14, [
    ["mistwisp", 17, 21, 30], ["owlume", 17, 21, 28], ["tudorling", 18, 21, 24], ["bellmere", 18, 22, 10, rare]
  ]);
  t("route_holmes_congleton_water", W, 0.12, [
    ["otterkin", 17, 21, 34], ["swanling", 17, 21, 28], ["perchip", 16, 20, 24], ["piketide", 18, 21, 14]
  ]);
  t("fish_route_holmes_congleton", W, 1, [
    ["perchip", 17, 21, 34, cmn], ["puddlish", 16, 20, 26, cmn],
    ["piketide", 19, 23, 26, unc], ["otterkin", 19, 23, 14, rre]
  ]);

  t("congleton_grass", G, 0.07, [
    ["cubbin", 18, 21, 22], ["otterkin", 18, 21, 24], ["prickpip", 17, 21, 22],
    ["curdli", 17, 21, 20], ["belfrit", 19, 22, 12]
  ]);
  t("congleton_grass_night", G, 0.08, [
    ["mistwisp", 18, 22, 30], ["cubbin", 18, 22, 24], ["owlume", 18, 22, 24], ["tudorling", 19, 22, 22]
  ]);

  // Bosley Cloud: the grit edge. The bear that left town is up here.
  t("bosley_cloud_grass", G, 0.14, [
    ["runestane", 19, 23, 26], ["moorcock", 19, 23, 24], ["harrowlop", 19, 23, 20],
    ["galewing", 20, 23, 18], ["bruinhall", 22, 24, 6, rare]
  ]);
  t("bosley_cloud_grass_fog", G, 0.16, [
    ["runestane", 20, 23, 34], ["mistwisp", 19, 23, 28], ["harrowlop", 19, 23, 22], ["dolmenor", 22, 24, 8, rare]
  ]);
  t("bosley_cloud_grass_night", G, 0.15, [
    ["mistwisp", 20, 23, 30], ["runestane", 20, 23, 26], ["owlume", 19, 23, 24], ["mowstane", 22, 24, 10, rare]
  ]);

  // R12 Biddulph Valley Way, the Hall's moat garden, and the folly ridge.
  t("route_congleton_moreton_grass", G, 0.13, [
    ["tudorling", 19, 23, 26], ["keystone", 19, 23, 24], ["prickpip", 19, 22, 22], ["sparkrail", 20, 23, 18], ["bramblehog", 19, 23, 10]
  ]);
  t("route_congleton_moreton_grass_night", G, 0.14, [
    ["sparkrail", 20, 23, 30], ["tudorling", 20, 23, 28], ["mistwisp", 19, 23, 26], ["owlume", 19, 23, 16]
  ]);
  t("little_moreton_hall_grass", G, 0.12, [
    ["tudorling", 20, 23, 40], ["prickpip", 19, 23, 24], ["otterkin", 19, 23, 20], ["quillet", 19, 23, 16]
  ]);
  t("little_moreton_hall_grass_night", G, 0.15, [
    ["tudorling", 20, 24, 36], ["timberwraith", 23, 25, 10, rare], ["mistwisp", 20, 24, 30], ["manorwraith", 22, 24, 12, rare]
  ]);
  t("little_moreton_hall_water", W, 0.09, [
    ["otterkin", 19, 23, 44], ["towpaddle", 19, 22, 32], ["perchip", 19, 23, 24]
  ]);
  t("route_moreton_mowcop_grass", G, 0.14, [
    ["runestane", 20, 24, 28], ["keystone", 20, 24, 24], ["moorcock", 20, 24, 22], ["harrowlop", 20, 24, 16], ["gargoylet", 22, 24, 10]
  ]);
  t("mow_cop_grass", G, 0.15, [
    ["runestane", 20, 24, 30], ["moorcock", 20, 24, 26], ["gargoylet", 21, 24, 22], ["galewing", 21, 24, 16], ["mowstane", 23, 25, 6, rare]
  ]);
  t("mow_cop_grass_night", G, 0.16, [
    ["mowstane", 22, 25, 18, rare], ["mistwisp", 21, 24, 30], ["gargoylet", 21, 24, 26], ["runestane", 21, 24, 26]
  ]);

  // ================= Chapter 5 — crosses, cheese and rail ================
  // R13 Wheelock canal & Rode Heath: lock flight, boats, ducks with agendas.
  t("route_congleton_sandbach_grass", G, 0.13, [
    ["belfrit", 21, 25, 26], ["curdli", 21, 25, 24], ["towpaddle", 21, 24, 22],
    ["mallardier", 22, 25, 18], ["rottling", 22, 25, 10]
  ]);
  t("route_congleton_sandbach_grass_night", G, 0.14, [
    ["mistwisp", 22, 25, 30], ["belfrit", 22, 25, 26], ["sparkrail", 22, 25, 24], ["phantasmal", 23, 25, 12, rare]
  ]);
  t("route_congleton_sandbach_water", W, 0.12, [
    ["towpaddle", 21, 25, 32], ["mallardier", 22, 25, 28], ["crabbex", 22, 25, 22], ["perchip", 21, 25, 18]
  ]);
  t("fish_route_congleton_sandbach", W, 1, [
    ["puddlish", 21, 25, 32, cmn], ["perchip", 21, 25, 28, cmn],
    ["piketide", 22, 26, 26, unc], ["torrentide", 23, 27, 14, rre]
  ]);

  t("sandbach_grass", G, 0.07, [
    ["belfrit", 21, 25, 32], ["curdli", 21, 25, 28], ["quillet", 21, 25, 20], ["rottling", 22, 25, 20]
  ]);
  t("sandbach_grass_night", G, 0.09, [
    ["belfrit", 22, 26, 30], ["crossbell", 25, 27, 8, rare], ["mistwisp", 22, 26, 30], ["rottling", 22, 26, 26]
  ]);
  t("sandbach_grass_fog", G, 0.10, [
    ["belfrit", 22, 26, 30], ["proxling", 22, 26, 26], ["puppetacct", 22, 26, 24], ["crossbell", 25, 27, 10, rare]
  ]);

  // R14 Elworth cut: the embankment beside the West Coast Main Line.
  t("route_sandbach_crewe_grass", G, 0.13, [
    ["chuglet", 22, 26, 28], ["sleeperk", 22, 26, 24], ["keystone", 22, 26, 20],
    ["sparkrail", 23, 26, 18], ["curdli", 22, 25, 10]
  ]);
  t("route_sandbach_crewe_grass_night", G, 0.15, [
    ["sparkrail", 22, 26, 36], ["chuglet", 22, 26, 26], ["poltergrid", 24, 26, 10, rare], ["sleeperk", 22, 26, 20], ["mistwisp", 22, 26, 8]
  ]);
  t("route_sandbach_crewe_water", W, 0.10, [
    ["towpaddle", 22, 25, 40], ["mallardier", 22, 26, 34], ["crabbex", 22, 26, 26]
  ]);

  // Crewe: Queen's Park's lake, and the Works sheds, which are a dungeon
  // that smells of hot oil and has never once been quiet.
  t("crewe_grass", G, 0.06, [
    ["chuglet", 22, 26, 32], ["curdli", 22, 25, 24], ["sparkrail", 23, 26, 24], ["sleeperk", 22, 26, 20]
  ]);
  t("crewe_queens_park_water", W, 0.11, [
    ["mallardier", 22, 26, 34], ["swanling", 22, 26, 28], ["perchip", 22, 26, 24], ["piketide", 24, 27, 14]
  ]);
  t("fish_crewe_queens_park", W, 1, [
    ["puddlish", 22, 26, 34, cmn], ["perchip", 22, 27, 30, cmn],
    ["piketide", 24, 28, 24, unc], ["volteel", 25, 29, 12, rre]
  ]);
  t("crewe_works_cave", C, 0.15, [
    ["chuglet", 23, 27, 28], ["shunterra", 24, 27, 22], ["bricklum", 23, 27, 22],
    ["sleeperk", 23, 27, 20], ["sparkrail", 24, 27, 8]
  ]);
  t("crewe_works_cave_night", C, 0.16, [
    ["sparkrail", 24, 27, 30], ["shunterra", 24, 27, 26], ["bricklum", 24, 27, 22], ["poltergrid", 25, 28, 12, rare], ["chuglet", 23, 27, 10]
  ]);
  // The station itself, once the fog is in it: puppets, logging in and out.
  t("crewe_station_grass_fog", G, 0.18, [
    ["puppetacct", 22, 26, 34], ["proxling", 22, 26, 28], ["botling", 22, 26, 22], ["botnetle", 23, 26, 16]
  ]);
})();
