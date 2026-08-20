// =============================================================
// MonsterQuest v2 — wild encounter tables for the NORTH-WEST region
// (Delamere, Tarporley, Beeston, Frodsham, Runcorn, Daresbury,
//  THE STACK, Lymm, Warrington, Chester, the Zoo, Ellesmere Port,
//  Ince Marshes and Parkgate) — Chapters 8-12 and the post-game.
// Ids per DESIGN-INDEX §9: <mapid>_<zone>[_night|_rain|_fog], fish_<mapid>.
// Species/level bands per ROSTER §9. Owned by region-northwest.
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
  // alias(id, of) — sub-maps that share their parent's table (ROSTER §9).
  function alias(id, of) {
    const src = D.encounters[of];
    D.define("encounters", id, { zone: src.zone, rate: src.rate, table: src.table, aliasOf: of });
  }
  const G = "grass", W = "water", C = "cave";
  const rare = { rare: true }, dusk = { time: ["dusk"] }, dawn = { time: ["dawn"] };
  const com = { tier: "common" }, unc = { tier: "uncommon" }, rar = { tier: "rare", rare: true },
    leg = { tier: "legendary", rare: true };

  // =====================================================================
  // CHAPTER 8 — Delamere, Tarporley, Beeston (Lv 33-37)
  // =====================================================================
  t("delamere_forest_grass", G, 0.12, [
    ["mossling", 33, 36, 30], ["oakling", 33, 36, 26], ["groveguard", 34, 37, 16],
    ["hornhound", 33, 36, 14], ["lampyr", 34, 37, 8, dusk], ["mossbear", 35, 37, 6, rare]
  ]);
  t("delamere_forest_grass_night", G, 0.15, [
    ["lampyr", 33, 37, 30], ["owlume", 33, 37, 22], ["mossbear", 34, 37, 18],
    ["strigyx", 35, 37, 14], ["drownwood", 35, 37, 10, rare], ["mistwisp", 33, 36, 6]
  ]);
  t("delamere_forest_grass_fog", G, 0.14, [
    ["proxling", 34, 37, 34], ["mistwisp", 33, 37, 26], ["mossling", 33, 36, 22], ["drownwood", 35, 37, 18, rare]
  ]);
  t("delamere_forest_water", W, 0.10, [
    ["otterkin", 33, 36, 36], ["lutrarch", 34, 37, 26], ["bogleap", 33, 36, 22], ["drownwood", 35, 37, 16, rare]
  ]);
  t("fish_delamere_forest", W, 1, [
    ["puddlish", 30, 36, 32, com], ["perchip", 32, 37, 26, com],
    ["piketide", 34, 38, 24, unc], ["lutrarch", 34, 39, 12, unc], ["torrentide", 36, 40, 6, rar]
  ]);
  alias("delamere_blakemere_grass", "delamere_forest_grass");
  alias("delamere_blakemere_water", "delamere_forest_water");
  alias("fish_delamere_blakemere", "fish_delamere_forest");
  alias("delamere_eddisbury_grass", "delamere_forest_grass");
  t("delamere_old_pale_grass", G, 0.13, [
    ["groveguard", 34, 37, 28], ["falconet", 34, 37, 24], ["hornhound", 34, 37, 20],
    ["moorcock", 34, 37, 16], ["gargoylet", 35, 37, 12, rare]
  ]);
  t("delamere_night_glade_grass", G, 0.20, [
    ["drownwood", 35, 38, 28, rare], ["lampyr", 34, 38, 26], ["owlume", 34, 38, 20],
    ["timberwraith", 36, 39, 14, rare], ["mossbear", 35, 38, 12]
  ]);

  t("route_frodsham_delamere_grass", G, 0.12, [
    ["gargoylet", 34, 38, 28], ["falconet", 34, 38, 26], ["mossling", 34, 37, 22],
    ["cuprabug", 34, 37, 16], ["peregrint", 36, 39, 8, rare]
  ]);
  t("route_frodsham_delamere_grass_night", G, 0.13, [
    ["gloamite", 34, 38, 32], ["owlume", 34, 38, 26], ["mistwisp", 34, 38, 24], ["gargoylet", 35, 38, 18]
  ]);
  t("route_delamere_tarporley_grass", G, 0.12, [
    ["falconet", 34, 38, 30], ["groveguard", 34, 38, 24], ["hornhound", 34, 38, 22],
    ["sheepwire", 34, 37, 16], ["thornarch", 36, 39, 8, rare]
  ]);
  t("route_delamere_winsford_grass", G, 0.11, [
    ["mossling", 33, 37, 28], ["oakling", 33, 37, 24], ["keystone", 33, 37, 20],
    ["sparkrail", 34, 38, 18], ["cryssal", 33, 37, 10]
  ]);
  t("tarporley_grass", G, 0.07, [
    ["hornhound", 34, 37, 34], ["prickpip", 33, 36, 26], ["bramblehog", 34, 37, 22], ["quillet", 34, 37, 18]
  ]);
  t("route_tarporley_beeston_water", W, 0.11, [
    ["mallardier", 34, 38, 32], ["otterkin", 34, 38, 26], ["crabbex", 34, 38, 22], ["torrentide", 36, 39, 20]
  ]);
  t("route_tarporley_beeston_grass", G, 0.11, [
    ["hornhound", 34, 38, 28], ["falconet", 34, 38, 24], ["curdli", 34, 38, 22],
    ["bramblehog", 34, 38, 18], ["gargoylet", 35, 39, 8]
  ]);
  t("fish_route_tarporley_beeston", W, 1, [
    ["perchip", 32, 38, 34, com], ["puddlish", 32, 38, 24, com],
    ["piketide", 35, 40, 24, unc], ["torrentide", 36, 41, 12, rar], ["volteel", 36, 42, 6, rar]
  ]);

  t("beeston_castle_grass", G, 0.13, [
    ["gargoylet", 35, 39, 30], ["falconet", 35, 39, 24], ["peregrint", 36, 40, 16],
    ["mossbear", 35, 39, 16], ["gloamite", 35, 39, 14]
  ]);
  t("beeston_castle_grass_wind", G, 0.15, [
    ["peregrint", 36, 40, 32], ["curlewind", 36, 40, 26], ["gargoylet", 36, 40, 24], ["galewing", 35, 39, 18]
  ]);
  t("beeston_castle_well_cave", C, 0.16, [
    ["gloamite", 35, 39, 32], ["gargoylet", 35, 39, 24], ["cuprabug", 35, 39, 22],
    ["gloamguard", 37, 41, 12, rare], ["squeakwing", 35, 39, 10]
  ]);
  alias("beeston_castle_keep_cave", "beeston_castle_well_cave");
  t("beeston_castle_summit_grass", G, 0.16, [
    ["peregrint", 37, 41, 34], ["gargoylet", 37, 41, 26], ["grotesquire", 39, 43, 14, rare],
    ["galewing", 36, 40, 26]
  ]);
  t("peckforton_castle_grass", G, 0.11, [
    ["falconet", 35, 39, 32], ["peregrint", 36, 40, 22], ["hornhound", 35, 39, 20],
    ["grotesquire", 38, 42, 10, rare], ["mossling", 35, 38, 16]
  ]);

  // =====================================================================
  // CHAPTER 9 — Frodsham, Runcorn, Daresbury, THE STACK (Lv 36-41)
  // =====================================================================
  t("route_runcorn_frodsham_grass", G, 0.13, [
    ["egrette", 36, 40, 30], ["curlewind", 36, 40, 24], ["bogleap", 36, 39, 18],
    ["turbinix", 37, 41, 16], ["sheepwire", 36, 39, 12]
  ]);
  t("route_runcorn_frodsham_grass_night", G, 0.14, [
    ["mistwisp", 36, 40, 32], ["egrette", 36, 40, 24], ["phantasmal", 37, 41, 22],
    ["beaconflare", 38, 42, 6, { rare: true, cond: "beacon_lit_frodsham_hill" }], ["turbinix", 37, 41, 16]
  ]);
  t("route_runcorn_frodsham_grass_rain", G, 0.14, [
    ["egrette", 36, 40, 34], ["bogleap", 36, 40, 26], ["turbinix", 37, 41, 24], ["curlewind", 36, 40, 16]
  ]);
  t("route_runcorn_frodsham_water", W, 0.10, [
    ["egrette", 36, 40, 34], ["bogleap", 36, 40, 30], ["otterkin", 36, 40, 22], ["sludgeon", 38, 42, 14, rare]
  ]);
  t("frodsham_grass", G, 0.07, [
    ["falconet", 36, 39, 32], ["curlewind", 36, 39, 24], ["prickpip", 35, 38, 22], ["egrette", 36, 39, 22]
  ]);
  t("frodsham_hill_grass", G, 0.13, [
    ["falconet", 36, 40, 30], ["peregrint", 37, 41, 20], ["gargoylet", 36, 40, 24], ["moorcock", 36, 40, 26]
  ]);
  t("frodsham_hill_grass_night", G, 0.14, [
    ["owlume", 36, 40, 30], ["strigyx", 37, 41, 22], ["gloamite", 36, 40, 24], ["mistwisp", 36, 40, 24]
  ]);
  t("frodsham_marsh_grass", G, 0.14, [
    ["egrette", 36, 41, 30], ["curlewind", 36, 41, 24], ["turbinix", 37, 41, 22],
    ["ebbwraith", 39, 43, 8, { rare: true, time: ["dusk"] }], ["bogleap", 36, 40, 16]
  ]);
  t("frodsham_marsh_water", W, 0.12, [
    ["egrette", 36, 41, 34], ["bogleap", 36, 41, 26], ["sludgeon", 38, 43, 16, rare], ["volteel", 37, 42, 24]
  ]);

  t("runcorn_grass", G, 0.09, [
    ["smogling", 37, 41, 34], ["proxling", 37, 41, 24], ["botnetle", 37, 41, 20],
    ["peepcam", 37, 41, 14], ["chlorodon", 39, 42, 8, rare]
  ]);
  t("runcorn_grass_fog", G, 0.14, [
    ["proxling", 37, 41, 36], ["puppetacct", 37, 41, 26], ["smogling", 37, 41, 22], ["chlorodon", 39, 43, 16, rare]
  ]);
  t("fish_runcorn", W, 1, [
    ["volteel", 36, 42, 32, com], ["torrentide", 36, 42, 26, unc],
    ["piketide", 37, 42, 22, unc], ["sludgeon", 39, 44, 14, rar], ["salmoneer", 42, 48, 6, leg]
  ]);
  t("runcorn_water", W, 0.09, [
    ["volteel", 37, 41, 34], ["sludgeon", 39, 43, 16, rare], ["mallardier", 37, 41, 26], ["krabbaron", 37, 41, 24]
  ]);
  t("runcorn_silver_jubilee_bridge_grass", G, 0.08, [
    ["proxling", 37, 41, 34], ["droneling", 38, 42, 26], ["botnetle", 37, 41, 24], ["peepcam", 37, 41, 16]
  ]);
  t("runcorn_mersey_gateway_grass", G, 0.10, [
    ["proxling", 38, 42, 30], ["puppetacct", 38, 42, 26], ["wormhack", 38, 42, 22],
    ["trojanox", 39, 43, 14, rare], ["droneling", 38, 42, 8]
  ]);
  t("runcorn_halton_castle_grass", G, 0.12, [
    ["gargoylet", 37, 41, 30], ["grotesquire", 40, 44, 10, rare], ["falconet", 37, 41, 26],
    ["smogling", 37, 41, 20], ["legionet", 38, 42, 14, { time: ["night"] }]
  ]);
  t("runcorn_norton_priory_grass", G, 0.11, [
    ["mossling", 37, 40, 28], ["gargoylet", 37, 41, 24], ["phantasmal", 38, 42, 20],
    ["oakling", 37, 40, 18], ["mirrorling", 39, 43, 10, rare]
  ]);

  t("daresbury_grass", G, 0.10, [
    ["quarkling", 37, 41, 32], ["grinkit", 37, 41, 22], ["sparkit", 37, 40, 22],
    ["mirrorling", 39, 43, 12, rare], ["hadronaut", 40, 44, 12, rare]
  ]);
  t("daresbury_grass_night", G, 0.12, [
    ["mirrorling", 38, 43, 28, rare], ["grinkit", 37, 42, 26], ["quarkling", 37, 42, 24],
    ["strigyx", 38, 42, 22]
  ]);
  t("route_warrington_daresbury_grass_fog", G, 0.16, [
    ["proxling", 37, 41, 32], ["puppetacct", 37, 41, 26], ["botnetle", 37, 41, 22], ["quarkling", 38, 42, 20]
  ]);
  t("route_warrington_daresbury_grass", G, 0.11, [
    ["sheepwire", 37, 41, 30], ["otterkin", 37, 41, 24], ["quillet", 37, 41, 22], ["bargemog", 38, 42, 24]
  ]);
  alias("route_daresbury_runcorn_grass_fog", "route_warrington_daresbury_grass_fog");
  alias("route_daresbury_runcorn_grass", "route_warrington_daresbury_grass");
  t("route_daresbury_runcorn_water", W, 0.09, [
    ["bargemog", 38, 42, 34], ["mallardier", 37, 41, 30], ["krabbaron", 38, 42, 22], ["volteel", 38, 42, 14]
  ]);

  t("stack_hall_1_cave", C, 0.16, [
    ["trojanox", 38, 42, 26], ["botnetle", 38, 42, 24], ["wormhack", 38, 42, 22],
    ["droneling", 38, 42, 16], ["teramite", 39, 43, 8], ["firewaul", 40, 44, 4, rare]
  ]);
  for (let i = 2; i <= 8; i++) alias("stack_hall_" + i + "_cave", "stack_hall_1_cave");
  alias("stack_lobby_cave", "stack_hall_1_cave");
  t("stack_breaker_room_cave", C, 0.08, [
    ["wormhack", 39, 43, 34], ["trojanox", 39, 43, 26], ["firewaul", 41, 45, 12, rare], ["teramite", 39, 43, 28]
  ]);
  // post-game: the cold tier
  t("stack_cold_f1_cave", C, 0.17, [
    ["trojanox", 55, 62, 22], ["wormhack", 55, 62, 22], ["teramite", 56, 63, 20],
    ["firewaul", 58, 65, 14], ["datadrake", 58, 65, 12], ["amoslurk", 60, 66, 10, rare]
  ]);
  for (let i = 2; i <= 5; i++) alias("stack_cold_f" + i + "_cave", "stack_cold_f1_cave");

  // =====================================================================
  // CHAPTER 10 — Lymm, Warrington (Lv 40-45)
  // =====================================================================
  t("lymm_grass", G, 0.08, [
    ["bargemog", 40, 44, 30], ["otterkin", 40, 44, 26], ["quillet", 40, 43, 22], ["grinkit", 40, 44, 14]
  ]);
  t("lymm_dam_water", W, 0.12, [
    ["bellmere", 40, 44, 26], ["piketide", 40, 44, 28], ["otterkin", 40, 44, 24], ["volteel", 41, 45, 22]
  ]);
  t("lymm_dam_water_night", W, 0.14, [
    ["volteel", 40, 45, 34], ["piketide", 40, 45, 28], ["bellmere", 41, 45, 22], ["ladymere", 42, 46, 10, rare]
  ]);
  t("lymm_dam_grass", G, 0.10, [
    ["otterkin", 40, 44, 30], ["quillet", 40, 44, 24], ["strigyx", 41, 45, 20], ["bargemog", 40, 44, 26]
  ]);
  t("fish_lymm_dam", W, 1, [
    ["perchip", 38, 44, 28, com], ["piketide", 40, 45, 26, unc], ["bellmere", 41, 46, 20, unc],
    ["volteel", 41, 46, 18, rar], ["salmoneer", 46, 52, 8, leg]
  ]);
  t("route_lymm_warrington_water", W, 0.11, [
    ["bargemog", 40, 44, 34], ["mallardier", 40, 44, 26], ["krabbaron", 41, 45, 24], ["volteel", 41, 45, 16]
  ]);
  t("route_lymm_warrington_grass", G, 0.11, [
    ["botnetle", 40, 44, 28], ["peepcam", 40, 44, 24], ["sheepwire", 40, 43, 22],
    ["bargemog", 40, 44, 18], ["droneling", 41, 45, 8]
  ]);
  t("warrington_grass", G, 0.09, [
    ["peepcam", 41, 45, 28], ["panoptix", 42, 46, 18], ["botnetle", 41, 45, 24],
    ["droneling", 41, 45, 20], ["datadrake", 43, 47, 10, rare]
  ]);
  t("warrington_grass_night", G, 0.10, [
    ["panoptix", 42, 46, 30], ["peepcam", 41, 46, 24], ["grinkit", 41, 45, 20],
    ["datadrake", 43, 48, 14, rare], ["phantasmal", 42, 46, 12]
  ]);
  t("warrington_water", W, 0.09, [
    ["krabbaron", 41, 45, 34], ["bargemog", 41, 45, 28], ["volteel", 41, 45, 24], ["sludgeon", 43, 47, 14, rare]
  ]);

  // =====================================================================
  // CHAPTER 12 — Chester (Lv 48-56)
  // =====================================================================
  t("route_tarporley_chester_grass", G, 0.11, [
    ["falconet", 44, 48, 28], ["hornhound", 44, 48, 24], ["sheepwire", 44, 47, 22],
    ["groveguard", 44, 48, 18], ["peregrint", 46, 50, 8, rare]
  ]);
  t("route_tarporley_chester_water", W, 0.09, [
    ["mallardier", 44, 48, 34], ["otterkin", 44, 48, 28], ["bargemog", 45, 49, 22], ["piketide", 45, 49, 16]
  ]);
  t("chester_grass", G, 0.06, [
    ["grinkit", 48, 52, 30], ["gargoylet", 48, 52, 26], ["peepcam", 48, 52, 22], ["quillet", 48, 51, 22]
  ]);
  t("chester_walls_grass", G, 0.10, [
    ["gargoylet", 48, 53, 32], ["grotesquire", 50, 55, 14, rare], ["falconet", 48, 52, 26], ["grinkit", 48, 52, 28]
  ]);
  t("chester_walls_grass_night", G, 0.14, [
    ["legionet", 48, 54, 32], ["centurigeist", 50, 56, 16, rare], ["gargoylet", 48, 54, 24],
    ["grotesquire", 51, 56, 12, rare], ["phantasmal", 48, 54, 16]
  ]);
  t("chester_amphitheatre_grass_night", G, 0.16, [
    ["legionet", 49, 55, 36], ["centurigeist", 51, 57, 22, rare], ["phantasmal", 49, 55, 24], ["grinkit", 49, 54, 18]
  ]);
  alias("chester_amphitheatre_grass", "chester_walls_grass");
  t("chester_roodee_grass", G, 0.09, [
    ["stagwire", 48, 53, 28], ["sheepwire", 48, 52, 26], ["quillet", 48, 52, 24], ["grinkit", 48, 53, 22]
  ]);
  t("chester_edgars_field_grass", G, 0.11, [
    ["legionet", 48, 53, 28], ["mirrorling", 50, 55, 14, rare], ["gargoylet", 48, 53, 26],
    ["oakling", 48, 52, 20], ["groveguard", 49, 54, 12]
  ]);
  t("chester_groves_water", W, 0.10, [
    ["salmoneer", 48, 55, 16, rare], ["piketide", 48, 54, 30], ["volteel", 48, 54, 28], ["otterkin", 48, 53, 26]
  ]);
  t("fish_chester_groves", W, 1, [
    ["perchip", 46, 54, 22, com], ["piketide", 48, 55, 26, unc], ["volteel", 48, 55, 22, unc],
    ["torrentide", 49, 56, 16, rar], ["salmoneer", 50, 58, 14, leg]
  ]);
  alias("fish_chester", "fish_chester_groves");

  // =====================================================================
  // POST-GAME — the Zoo, the Port, the marshes, Parkgate (Lv 55-70)
  // =====================================================================
  t("route_chester_zoo_water", W, 0.11, [
    ["bargemog", 50, 56, 34], ["krabbaron", 50, 56, 28], ["mallardier", 50, 56, 24], ["volteel", 51, 57, 14]
  ]);
  t("route_chester_zoo_grass", G, 0.10, [
    ["quillet", 50, 55, 30], ["sheepwire", 50, 55, 24], ["grinkit", 50, 56, 22], ["botnetle", 51, 56, 24]
  ]);
  alias("route_zoo_ellesmere_water", "route_chester_zoo_water");
  alias("route_zoo_ellesmere_grass", "route_chester_zoo_grass");
  t("chester_zoo_grass", G, 0.11, [
    ["pengwyn", 55, 60, 26, rare], ["girafflor", 55, 60, 24, rare], ["pandember", 55, 60, 24, rare],
    ["grinkit", 55, 59, 16], ["quillet", 55, 59, 10]
  ]);
  t("chester_zoo_water", W, 0.12, [
    ["pengwyn", 55, 60, 40, rare], ["krabbaron", 55, 60, 32], ["volteel", 55, 60, 28]
  ]);
  t("ellesmere_port_grass", G, 0.10, [
    ["flarestack", 55, 60, 26], ["botnetle", 55, 60, 24], ["bargemog", 55, 60, 26], ["krabbaron", 55, 60, 24]
  ]);
  t("ellesmere_port_water", W, 0.11, [
    ["bargemog", 55, 60, 32], ["krabbaron", 55, 60, 28], ["sludgeon", 57, 62, 18, rare], ["volteel", 55, 60, 22]
  ]);
  t("fish_ellesmere_port", W, 1, [
    ["volteel", 52, 60, 30, com], ["piketide", 52, 60, 24, unc], ["krabbaron", 54, 61, 22, unc],
    ["sludgeon", 56, 63, 18, rar], ["salmoneer", 58, 66, 6, leg]
  ]);
  t("route_ellesmere_parkgate_grass", G, 0.13, [
    ["egrette", 55, 62, 30], ["curlewind", 55, 62, 26], ["crabbex", 55, 62, 24],
    ["ebbwraith", 58, 64, 12, { rare: true, time: ["dusk"] }], ["turbinix", 56, 62, 8]
  ]);
  t("parkgate_grass", G, 0.13, [
    ["egrette", 55, 62, 28], ["curlewind", 55, 62, 26], ["crabbex", 55, 62, 22],
    ["ebbwraith", 58, 64, 16, { rare: true, time: ["dusk"] }], ["salmoneer", 57, 63, 8, rare]
  ]);
  t("parkgate_grass_night", G, 0.14, [
    ["ebbwraith", 58, 65, 30, rare], ["egrette", 55, 62, 24], ["phantasmal", 56, 63, 24], ["strigyx", 56, 63, 22]
  ]);
  t("fish_parkgate", W, 1, [
    ["crabbex", 52, 60, 30, com], ["volteel", 54, 61, 24, unc], ["salmoneer", 56, 64, 20, rar],
    ["sludgeon", 56, 64, 16, rar], ["ebbwraith", 58, 66, 10, leg]
  ]);
  t("route_ellesmere_ince_grass_fog", G, 0.16, [
    ["proxling", 58, 64, 28], ["puppetacct", 58, 64, 24], ["turbinix", 58, 64, 22],
    ["egrette", 58, 64, 16], ["teramite", 59, 66, 10]
  ]);
  alias("route_ellesmere_ince_grass", "route_ellesmere_parkgate_grass");
  t("ince_marshes_grass_fog", G, 0.17, [
    ["proxling", 58, 66, 26], ["puppetacct", 58, 66, 22], ["turbinix", 58, 66, 20],
    ["egrette", 58, 66, 18], ["teramite", 60, 67, 14], ["shardmind", 62, 68, 4, rare]
  ]);
  t("ince_marshes_grass", G, 0.14, [
    ["egrette", 58, 66, 30], ["curlewind", 58, 66, 26], ["turbinix", 58, 66, 24], ["flarestack", 59, 66, 20]
  ]);
  t("ince_marshes_water", W, 0.12, [
    ["egrette", 58, 66, 30], ["sludgeon", 60, 68, 22, rare], ["volteel", 58, 66, 26], ["krabbaron", 58, 66, 22]
  ]);
  t("ince_intake_grass_fog", G, 0.18, [
    ["teramite", 60, 68, 28], ["wormhack", 60, 68, 24], ["turbinix", 60, 68, 22],
    ["shardmind", 62, 70, 14, rare], ["datadrake", 62, 69, 12]
  ]);
  alias("ince_intake_grass", "ince_marshes_grass");
  alias("route_ince_frodsham_grass_fog", "ince_marshes_grass_fog");
  t("route_ince_frodsham_grass", G, 0.13, [
    ["egrette", 57, 64, 30], ["curlewind", 57, 64, 26], ["turbinix", 57, 64, 24], ["ebbwraith", 60, 66, 10, rare]
  ]);
})();
