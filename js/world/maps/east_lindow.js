// =============================================================
// MonsterQuest v2 — LINDOW MOSS (region east, WORLD-BIBLE §2 I3)
// Peat bog west of Wilmslow. Boardwalks that sink, black pools, dead
// birch, and — in Ch.2 — the Credential Stuffers' data lake: pallets of
// racks standing in water, dumping "preserved" credentials into peat
// because peat keeps things. The deep bog beyond needs Waders.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const LEG = B.legend({
    "0": "grass_moor", "1": "moor_bog", "2": "moor_path", "3": "marsh", "4": "marsh_pool",
    "5": "boardwalk", "6": "water_deep", "7": "water_edge", "8": "moor_heather", "9": "rock_moor",
    "E": "tree_dead", "Q": "fish_spot", "U": "crate", "J": "barrel", "Y": "server_rack",
    "!": "cable_duct", "?": "tree_willow", ":": "log", ";": "gate_wood", "<": "bridge_wood",
    ">": "stump", "[": "hay_bale", "]": "sack", "{": "berry_bush", "}": "fence_wire",
    "|": "mine_prop", "$": "water_reeds"
  });

  // ---------------------------------------------------------------- moss --
  const c = B.canvas(48, 36, "3");
  c.fill("g", 0, 0, 48, 2, "1");
  c.fill("g", 0, 2, 1, 33, "1");
  c.fill("g", 47, 2, 1, 33, "1");
  c.fill("g", 0, 35, 48, 1, "1");
  c.fill("g", 46, 19, 2, 3, "2");   // east — the boardwalk approach from Wilmslow

  // ---- the main boardwalk and its branches --------------------------------
  c.fill("g", 8, 20, 38, 1, "5");
  c.fill("g", 8, 19, 38, 1, "5");
  c.snake("g", "lindow-walk", "5", 8, 21, 30, "h", 1, 0.3);
  c.fill("g", 30, 8, 2, 12, "5");
  c.fill("g", 30, 8, 10, 2, "5");
  c.fill("g", 18, 21, 2, 10, "5");
  c.fill("g", 12, 29, 8, 2, "5");
  c.fill("g", 8, 12, 2, 8, "5");
  c.fill("g", 8, 12, 9, 2, "5");
  c.fill("g", 38, 21, 2, 8, "5");
  c.fill("g", 38, 28, 7, 2, "5");
  // sunk sections: the boardwalk gives out and you wade
  c.fill("g", 24, 19, 3, 2, "3");
  c.fill("g", 30, 14, 2, 2, "3");
  c.fill("g", 18, 25, 2, 2, "3");

  // ---- peat cuttings, stacks and the abandoned plant -----------------------
  c.fill("g", 33, 2, 13, 9, "1");
  c.fill("g", 34, 3, 11, 7, "0");
  for (let i = 0; i < 4; i++) c.fill("g", 35 + i * 3, 4, 2, 5, "[");
  c.fill("g", 40, 10, 6, 1, "0");
  c.fill("g", 39, 9, 1, 2, "0");
  c.set("g", 44, 5, "|"); c.set("g", 45, 8, "J");
  c.fill("g", 40, 11, 1, 8, "0");
  c.set("g", 41, 12, "N");

  // ---- black pools, dead birch and reeds ----------------------------------
  c.fill("g", 2, 3, 5, 6, "4");
  c.fill("g", 21, 4, 7, 5, "4");
  c.fill("g", 42, 24, 4, 6, "4");
  c.fill("g", 3, 24, 4, 4, "4");
  c.fill("g", 24, 31, 8, 3, "4");
  c.set("g", 22, 9, "$"); c.set("g", 6, 9, "$"); c.set("g", 43, 30, "$");
  c.set("g", 20, 6, "Q"); c.set("g", 44, 26, "Q"); c.set("g", 5, 26, "Q");
  B.trees(c, "lindow-dead", 30, 2, 2, 44, 32, "E", null, ["3"]);
  B.trees(c, "lindow-willow", 10, 2, 24, 20, 10, "?", null, ["3"]);
  c.set("g", 12, 16, ":"); c.set("g", 35, 24, ">"); c.set("g", 26, 26, "{");
  c.fill("g", 2, 32, 20, 3, "1");
  c.fill("g", 33, 32, 13, 3, "1");
  c.fill("g", 12, 31, 8, 1, "0");

  // ---- the data lake: pallets, racks, cable and a lot of water ------------
  c.fill("g", 3, 12, 14, 6, "6");
  c.fill("g", 3, 11, 14, 1, "7");
  c.fill("g", 3, 18, 14, 1, "7");
  c.fill("g", 2, 12, 1, 6, "7");
  c.fill("g", 10, 12, 2, 6, "5");
  c.fill("g", 4, 14, 12, 1, "5");
  c.fill("g", 4, 13, 3, 1, "Y"); c.fill("g", 13, 13, 3, 1, "Y");
  c.fill("g", 4, 16, 3, 1, "Y"); c.fill("g", 13, 16, 3, 1, "Y");
  c.set("g", 8, 13, "U"); c.set("g", 8, 16, "U"); c.set("g", 12, 12, "J");
  c.fill("g", 6, 15, 8, 1, "!");
  c.fill("g", 10, 15, 2, 1, "5");
  c.set("g", 9, 14, "N");
  c.fill("g", 8, 18, 2, 2, "5");
  c.fill("g", 9, 12, 1, 6, "6");

  // ---- the way into the deep bog -----------------------------------------
  c.fill("g", 2, 21, 6, 3, "3");
  c.set("g", 1, 22, ";");
  c.set("g", 2, 22, "3");
  c.set("g", 3, 21, "}"); c.set("g", 3, 23, "}");
  c.set("g", 4, 20, "N");
  c.fill("g", 6, 21, 2, 1, "5");

  W.defineMap("lindow_moss", {
    name: "Lindow Moss", region: "bollin", outdoor: true, music: "town_alderley", weatherZone: "bollin",
    ambience: "moor", dialogue: "town_lindow_moss",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 46, y: 20 },
    landmark: { name: "Lindow Moss", x: 24, y: 20 },
    encounters: { grass: "lindow_moss_grass", water: "lindow_moss_water" },
    fishing: "fish_lindow_moss",
    warps: [
      { x: 47, y: 19, to: "route_wilmslow_lindow", tx: 1, ty: 9, dir: "right", kind: "edge" },
      { x: 47, y: 20, to: "route_wilmslow_lindow", tx: 1, ty: 10, dir: "right", kind: "edge" },
      { x: 47, y: 21, to: "route_wilmslow_lindow", tx: 1, ty: 11, dir: "right", kind: "edge" },
      { x: 1, y: 22, to: "lindow_moss_deep", tx: 38, ty: 15, dir: "left", kind: "edge", cond: "waders" }
    ],
    signs: [
      { x: 9, y: 14, text: ["A laminated card cable-tied to a rack, out here, in a bog.",
        "'PRESERVED SET 04 — DO NOT DRAIN. PEAT KEEPS THINGS.'",
        "Under it, a smaller sticker: a lanyard logo you last saw on somebody at a train station."] },
      { x: 41, y: 12, text: ["PEAT EXTRACTION CEASED. SITE UNDER RESTORATION.",
        "The stacks are still here. So is the machinery. Restoration is a word that has been doing a lot of work."] },
      { x: 4, y: 20, text: ["BEYOND THIS POINT THE MOSS IS NOT LAND AND IS NOT WATER.",
        "It has kept a man for two thousand years and it is not sorry.",
        "DO NOT ENTER WITHOUT PROPER GEAR."] }
    ],
    items: [
      { x: 44, y: 4, item: "capsule_night", n: 3, flag: "item_lindow_1" },
      { x: 8, y: 10, item: "elixir", n: 1, hidden: true, flag: "item_lindow_2" },
      { x: 14, y: 30, item: "toxic_sachet", n: 1, hidden: true, flag: "item_lindow_3" },
      { x: 39, y: 27, item: "capsule_net", n: 2, flag: "item_lindow_4" },
      { x: 8, y: 13, item: "cipher_chip", n: 1, hidden: true, flag: "item_lindow_5" },
      { x: 12, y: 31, item: "collectible_6", n: 1, hidden: true, flag: "item_lindow_6" }
    ],
    catGaps: [
      { x: 3, y: 21, item: "cat_token_8", n: 1, flag: "catgap_lindow_1",
        say: "MEADOW crosses the wire and walks out onto the moss with her tail up, on peat that will not hold you. She comes back with a fragment of something woven, and very, very old." }
    ],
    restPoints: [{ x: 34, y: 20, flag: "bigboy_sat_lindow" }],
    npcs: [
      { id: "npc_lindow_bill", x: 42, y: 20, dir: "left", sprite: "npc_historian", behaviour: "still", script: "east_lindow_bill" },
      { id: "npc_lindow_stuffer_1", x: 11, y: 17, dir: "down", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_lindow_moss_1", sight: 4 },
      { id: "npc_lindow_stuffer_2", x: 10, y: 12, dir: "up", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_lindow_moss_2", sight: 4 },
      { id: "npc_lindow_stuffer_3", x: 30, y: 9, dir: "right", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_lindow_moss_3", sight: 4 },
      { id: "npc_lindow_twelvek", x: 8, y: 19, dir: "up", sprite: "twelve_k", behaviour: "still", script: "east_lindow_twelvek", cond: "lindow_lake_seen" },
      { id: "npc_lindow_cutter", x: 40, y: 12, dir: "down", sprite: "npc_farmer", behaviour: "still", script: "east_lindow_cutter" },
      { id: "npc_lindow_warden", x: 18, y: 23, dir: "down", sprite: "npc_ranger", behaviour: "still", trainer: "tr_lindow_moss_4", sight: 0, script: "east_lindow_warden" },
      { id: "npc_lindow_stuffer_4", x: 19, y: 29, dir: "left", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_lindow_moss_5", sight: 4 },
      { id: "npc_lindow_birder", x: 39, y: 24, dir: "left", sprite: "npc_birder", behaviour: "still",
        say: ["Snipe, curlew, and one thing at night that is not a bird and does not care that I know it.",
          "I've got twenty years of tapes. The last fortnight is a different tape."] },
      { id: "npc_lindow_walker", x: 24, y: 20, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[24, 20], [36, 20]], pathMode: "pingpong",
        say: ["Boardwalk sinks a bit every year and every year somebody adds a plank on top.",
          "There's nine layers under your feet. That's not maintenance, that's archaeology in progress."] },
      { id: "npc_lindow_wisp", x: 26, y: 30, dir: "up", sprite: "npc_ghost_trainer", behaviour: "wander", radius: 3, cond: "phase_night",
        say: ["A light, out over the peat, at about the height of a lantern held by somebody walking.",
          "It keeps pace with you. It keeps a polite distance. It is not a lantern."] }
    ],
    triggers: [
      { x: 10, y: 19, w: 2, h: 1, script: "east_lindow_lake", once: "lindow_lake_seen", cond: "!lindow_lake_seen" }
    ]
  });

  // ------------------------------------------------- the deep bog ---------
  const d = B.canvas(40, 30, "3");
  d.fill("g", 0, 0, 40, 2, "1");
  d.fill("g", 0, 2, 1, 27, "1");
  d.fill("g", 39, 2, 1, 27, "1");
  d.fill("g", 0, 29, 40, 1, "1");
  d.fill("g", 37, 14, 3, 3, "3");
  d.fill("g", 2, 4, 8, 6, "4");
  d.fill("g", 26, 4, 9, 7, "4");
  d.fill("g", 4, 21, 10, 6, "4");
  d.fill("g", 24, 22, 11, 5, "4");
  d.fill("g", 14, 12, 12, 7, "1");
  d.fill("g", 15, 13, 10, 5, "0");
  d.fill("g", 19, 11, 2, 2, "0");
  d.fill("g", 19, 18, 2, 3, "0");
  d.fill("g", 16, 15, 8, 1, "2");
  d.set("g", 20, 15, "3");
  d.fill("g", 12, 14, 3, 2, "3");
  d.fill("g", 25, 14, 3, 2, "3");
  B.trees(d, "deep-dead", 26, 2, 2, 36, 26, "E", null, ["3"]);
  d.set("g", 8, 15, "$"); d.set("g", 31, 17, "$");
  d.set("g", 6, 12, "Q"); d.set("g", 33, 8, "Q");
  d.set("g", 18, 13, "N");
  d.set("g", 22, 17, ":"); d.set("g", 16, 18, ">");
  d.fill("g", 2, 14, 10, 2, "3");
  d.fill("g", 28, 14, 9, 2, "3");
  W.defineMap("lindow_moss_deep", {
    name: "The Deep Moss", region: "bollin", outdoor: true, music: "town_alderley",
    weatherZone: "bollin", ambience: "moor", dialogue: "town_lindow_moss",
    legend: LEG, layers: d.layers(),
    spawnPoint: { x: 38, y: 15 },
    landmark: { name: "The Deep Moss", x: 20, y: 15 },
    encounters: { grass: "lindow_moss_deep_grass", water: "lindow_moss_water" },
    fishing: "fish_lindow_moss",
    warps: [
      { x: 39, y: 14, to: "lindow_moss", tx: 2, ty: 22, dir: "right", kind: "edge" },
      { x: 39, y: 15, to: "lindow_moss", tx: 2, ty: 22, dir: "right", kind: "edge" },
      { x: 39, y: 16, to: "lindow_moss", tx: 2, ty: 22, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 18, y: 13, text: ["A marker post. No words. Somebody has tied a strip of woven cloth to it.",
        "The cloth is not old. The knot is."] }
    ],
    items: [
      { x: 3, y: 12, item: "panacea", n: 1, hidden: true, flag: "item_lindow_deep_1" },
      { x: 35, y: 13, item: "capsule_night", n: 3, flag: "item_lindow_deep_2" },
      { x: 22, y: 18, item: "ghost_lens", n: 1, hidden: true, flag: "item_lindow_deep_3" }
    ],
    npcs: [
      { id: "npc_lindow_preserved", x: 20, y: 14, dir: "down", sprite: "npc_ghost_trainer", behaviour: "still",
        trainer: "boss_preserved_one", sight: 0, script: "east_lindow_preserved" }
    ],
    restPoints: [{ x: 19, y: 19, flag: "bigboy_sat_lindow_deep" }]
  });
})();
