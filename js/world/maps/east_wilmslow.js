// =============================================================
// MonsterQuest v2 — WILMSLOW (region east, WORLD-BIBLE §2 J3)
// Gym 1: Sysadmin Ada, Electric, PACKET. Glass café strip, pale
// sandstone St Bartholomew's, the station, Turing's house on Adlington
// Road, and a town where every single Wi-Fi hotspot has the same name.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const LEG = B.legend({
    "0": "door_gym", "1": "wall_glass", "2": "wall_render_cream", "3": "wall_stone_sandstone",
    "4": "path_gravel", "5": "roof_glass", "6": "water_river", "7": "shallows", "8": "hedge_low",
    "9": "bollard", "E": "zebra", "Q": "fish_spot", "U": "road_line", "J": "bunting",
    "Y": "terminal", "!": "picnic_table", "?": "tree_apple", ":": "tree_apple_top",
    ";": "gate_wood", "<": "bridge_wood", ">": "radio_mast", "[": "log", "]": "rail_track_h",
    "{": "berry_bush", "}": "fence_stone", "|": "cable_duct", "$": "roof_tile_red"
  });

  // ---------------------------------------------------------------- town --
  const c = B.canvas(52, 38, ".");
  c.fill("g", 0, 0, 52, 2, "T");
  for (let x = 0; x < 52; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 35, "T");
  c.fill("g", 51, 2, 1, 35, "T");
  c.fill("g", 0, 37, 52, 1, "T");
  c.fill("g", 25, 0, 3, 2, "_");   // north — The Carrs
  c.fill("o", 25, 0, 3, 1, " ");
  c.fill("g", 51, 19, 1, 3, "r");  // east — Mottram lanes
  c.fill("g", 0, 23, 1, 3, "r");   // west — the Lindow approach
  c.fill("g", 17, 37, 3, 1, "r");  // south — Alderley Road

  // ---- the roads ----------------------------------------------------------
  c.fill("g", 1, 19, 50, 3, "r");
  c.fill("g", 1, 20, 50, 1, "U");
  c.fill("g", 1, 18, 50, 1, "-");
  c.fill("g", 1, 22, 50, 1, "-");
  c.fill("g", 1, 23, 14, 3, "r");
  c.fill("g", 1, 24, 14, 1, "U");
  c.fill("g", 8, 21, 3, 3, "r");
  c.fill("g", 17, 22, 3, 16, "r");
  c.fill("g", 18, 25, 1, 12, "U");
  c.fill("g", 1, 32, 50, 1, "_");
  c.fill("g", 16, 18, 1, 5, "-"); c.fill("g", 20, 18, 1, 5, "-");
  c.fill("g", 12, 19, 1, 3, "E"); c.fill("g", 40, 19, 1, 3, "E");
  c.fill("g", 17, 26, 3, 1, "E");
  for (let x = 3; x < 50; x += 7) { c.set("g", x, 18, "L"); c.set("g", x + 3, 22, "L"); }
  c.set("g", 6, 22, "O"); c.set("g", 24, 18, "n"); c.set("g", 44, 22, "u");
  c.set("g", 29, 18, "H"); c.set("g", 30, 18, "I"); c.set("g", 34, 22, "]");
  c.set("g", 9, 18, "9"); c.set("g", 46, 18, "9");
  c.fill("o", 26, 18, 9, 1, "J");

  // ---- north-west: Adlington Road and Turing's house ---------------------
  c.fill("g", 1, 2, 21, 16, ",");
  B.house(c, { x: 4, y: 4, w: 9, h: 5, rh: 2, roof: "R", wall: "2", win: "W", door: "D", doorX: 4, over: "^" });
  c.set("g", 5, 4, "m");
  c.fill("g", 8, 9, 1, 9, "_");
  c.fill("g", 2, 9, 12, 1, "8");
  c.set("g", 8, 9, "_");
  c.set("g", 3, 10, "?"); c.set("o", 3, 9, ":");
  c.set("g", 12, 11, "?"); c.set("o", 12, 10, ":");
  c.set("g", 7, 9, "N");
  c.fill("g", 2, 12, 6, 5, "\"");
  c.fill("g", 10, 13, 5, 4, "\"");
  B.trees(c, "wilm-adlington", 12, 1, 10, 20, 8, "B", "b", [",", "\""]);

  // ---- the park path down from The Carrs ---------------------------------
  c.fill("g", 22, 2, 8, 16, ".");
  c.fill("g", 25, 2, 3, 16, "_");
  c.fill("g", 22, 3, 3, 6, "\"");
  c.fill("g", 28, 10, 2, 6, "\"");
  c.set("g", 24, 12, "H"); c.set("g", 28, 6, "!");
  B.trees(c, "wilm-carrs", 14, 21, 2, 9, 16, "A", null, ["."]);
  c.set("g", 24, 4, "N");

  // ---- north-east: St Bartholomew's in pale sandstone --------------------
  c.fill("g", 31, 2, 20, 16, ",");
  c.box("g", 32, 2, 17, 11, "w");
  c.fill("g", 33, 3, 15, 9, ",");
  B.house(c, { x: 35, y: 3, w: 10, h: 8, rh: 3, roof: "p", wall: "3", win: "C", door: "d", doorX: 4, over: "^" });
  c.set("g", 38, 2, "p");
  c.scatter("g", "wilm-graves", "g", 14, 33, 4, 14, 7, [","]);
  c.fill("g", 39, 11, 1, 2, "_");
  c.set("g", 39, 13, "_"); c.fill("g", 39, 13, 1, 5, "_");
  c.set("g", 40, 13, "N");
  // the station and its platform, east of the church
  B.house(c, { x: 44, y: 13, w: 7, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  c.fill("g", 44, 11, 7, 1, "]");
  c.fill("g", 44, 12, 7, 1, "=");
  c.set("g", 42, 15, "N");
  c.fill("g", 43, 13, 1, 5, "_");
  c.set("g", 50, 8, ">");

  // ---- the shopfronts along the north side of the road -------------------
  B.house(c, { x: 2, y: 14, w: 10, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 1, 17, "%");
  B.house(c, { x: 13, y: 14, w: 8, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  B.house(c, { x: 31, y: 14, w: 8, h: 4, rh: 2, roof: "R", wall: "1", win: "W", door: "S", doorX: 4, over: "^" });
  c.fill("o", 31, 14, 8, 1, "5");
  c.set("g", 30, 17, "%"); c.set("g", 39, 17, "%");

  // ---- south of the road: the gym, the Care centre, the inn --------------
  c.fill("g", 1, 23, 50, 9, ".");
  c.fill("g", 1, 23, 14, 3, "r");
  c.fill("g", 1, 24, 14, 1, "U");
  c.fill("g", 17, 22, 3, 16, "r");
  c.fill("g", 18, 25, 1, 8, "U");
  c.fill("g", 1, 32, 50, 1, "_");
  B.house(c, { x: 2, y: 27, w: 11, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 5, over: "^" });
  c.set("g", 1, 31, "N");
  // the gym: dark brick, glass front, a mast on the roof and a yellow door
  B.house(c, { x: 27, y: 24, w: 15, h: 8, rh: 3, roof: "R", wall: "X", win: "W", door: "0", doorX: 7, over: "^" });
  c.fill("g", 28, 26, 13, 1, "1");
  c.set("g", 28, 24, ">"); c.set("g", 40, 24, ">");
  c.set("g", 26, 31, "N");
  c.fill("g", 33, 32, 3, 1, "_");
  B.house(c, { x: 44, y: 27, w: 7, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 45, 27, "m");
  c.set("g", 43, 31, "N");
  c.fill("g", 21, 26, 5, 6, "8");
  c.fill("g", 22, 27, 3, 4, ".");
  c.set("g", 23, 32, ";"); c.set("g", 23, 31, ".");
  c.set("g", 23, 28, "l"); c.set("g", 24, 30, "o");
  c.fill("g", 1, 26, 1, 6, "_");
  c.fill("g", 14, 26, 2, 6, "\"");
  c.set("g", 2, 32, "N");

  // ---- the southern fringe: rough ground out towards the Edge -----------
  c.fill("g", 1, 33, 50, 4, ",");
  c.fill("g", 2, 33, 14, 4, "\"");
  c.fill("g", 22, 34, 12, 3, "\"");
  c.fill("g", 38, 33, 12, 4, "\"");
  B.trees(c, "wilm-south", 20, 1, 33, 50, 4, "T", "y", [",", "\""]);
  c.fill("g", 17, 33, 3, 5, "r");
  c.fill("g", 18, 33, 1, 4, "U");
  c.set("g", 16, 34, "N");
  c.set("g", 36, 35, "{"); c.set("g", 20, 36, "[");

  W.defineMap("wilmslow", {
    name: "Wilmslow", region: "bollin", outdoor: true, music: "town_wilmslow", weatherZone: "bollin",
    ambience: "town", dialogue: "town_wilmslow",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 50, y: 20 },
    healPoint: { x: 7, y: 32 },
    landmark: { name: "Wilmslow", x: 25, y: 20 },
    encounters: { grass: "wilmslow_grass", water: null },
    fishing: "fish_wilmslow",
    warps: [
      { x: 8, y: 8, to: "wilmslow_turing_house", tx: 7, ty: 12, dir: "up", kind: "door" },
      { x: 6, y: 17, to: "wilmslow_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 16, y: 17, to: "wilmslow_post", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 35, y: 17, to: "wilmslow_cafe", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 39, y: 10, to: "wilmslow_church", tx: 6, ty: 13, dir: "up", kind: "door" },
      { x: 47, y: 17, to: "wilmslow_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 7, y: 31, to: "wilmslow_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 34, y: 31, to: "wilmslow_gym", tx: 15, ty: 30, dir: "up", kind: "door" },
      { x: 47, y: 31, to: "wilmslow_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 25, y: 0, to: "route_wilmslow_styal", tx: 14, ty: 32, dir: "up", kind: "edge" },
      { x: 26, y: 0, to: "route_wilmslow_styal", tx: 15, ty: 32, dir: "up", kind: "edge" },
      { x: 27, y: 0, to: "route_wilmslow_styal", tx: 16, ty: 32, dir: "up", kind: "edge" },
      { x: 51, y: 19, to: "route_prestbury_wilmslow", tx: 44, ty: 15, dir: "right", kind: "edge" },
      { x: 51, y: 20, to: "route_prestbury_wilmslow", tx: 44, ty: 16, dir: "right", kind: "edge" },
      { x: 51, y: 21, to: "route_prestbury_wilmslow", tx: 44, ty: 17, dir: "right", kind: "edge" },
      { x: 0, y: 23, to: "route_wilmslow_lindow", tx: 28, ty: 9, dir: "left", kind: "edge" },
      { x: 0, y: 24, to: "route_wilmslow_lindow", tx: 28, ty: 10, dir: "left", kind: "edge" },
      { x: 0, y: 25, to: "route_wilmslow_lindow", tx: 28, ty: 11, dir: "left", kind: "edge" },
      { x: 17, y: 37, to: "route_wilmslow_alderley", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 18, y: 37, to: "route_wilmslow_alderley", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 19, y: 37, to: "route_wilmslow_alderley", tx: 17, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 7, y: 9, text: ["ADLINGTON ROAD", "A blue plaque on the gatepost. A name, two dates, and nothing at all about the middle.",
        "Somebody keeps leaving apples on the wall. The council keeps removing them. They keep coming back."] },
      { x: 24, y: 4, text: ["THE CARRS — riverside park, half a mile north.", "STEPPING STONES USUALLY UNDER WATER. Take the bridge and take the hint."] },
      { x: 40, y: 13, text: ["ST BARTHOLOMEW'S, WILMSLOW.", "Pale sandstone, patient, and older than every idea anyone in this town has had."] },
      { x: 42, y: 15, text: ["WILMSLOW STATION — Manchester 18 minutes, Crewe 22, London two hours and a sandwich."] },
      { x: 26, y: 31, text: ["WILMSLOW GYM — Sysadmin Ada.", "TERRAIN IS STATIC AND STAYS STATIC. HOUSE RULE. NO, IT IS NOT NEGOTIABLE.",
        "Under it, in marker: 'she means it, the door means it, the RACKS mean it'"] },
      { x: 2, y: 32, text: ["WILMSLOW CARE CENTRE — twenty-four hours. It has to be. This is a commuter town."] },
      { x: 43, y: 31, text: ["THE COACH & FOUR — rooms, food, and the only place in Wilmslow with no Wi-Fi.",
        "The landlord calls that a feature. Lately people have started agreeing with him."] },
      { x: 16, y: 34, text: ["ALDERLEY EDGE 2 MILES.", "Somebody has written under it: 'and then straight down'."] }
    ],
    items: [
      { x: 3, y: 13, item: "turings_apple", n: 1, hidden: true, flag: "item_wilmslow_1" },
      { x: 23, y: 5, item: "capsule_mesh", n: 3, flag: "item_wilmslow_2" },
      { x: 15, y: 28, item: "copper_coil", n: 1, hidden: true, flag: "item_wilmslow_3" },
      { x: 4, y: 35, item: "patch_cable", n: 1, hidden: true, flag: "item_wilmslow_4" },
      { x: 45, y: 34, item: "elixir", n: 1, flag: "item_wilmslow_5" },
      { x: 24, y: 29, item: "tonic", n: 2, flag: "item_wilmslow_6" }
    ],
    catGaps: [
      { x: 21, y: 28, item: "cat_token_6", n: 1, flag: "catgap_wilmslow_1",
        say: "MEADOW slides through the box hedge into somebody's immaculate garden, walks the whole length of it on the flower bed, and returns with a look of complete moral clarity." }
    ],
    restPoints: [{ x: 29, y: 19, flag: "bigboy_sat_wilmslow" }],
    npcs: [
      { id: "npc_wilmslow_ines", x: 33, y: 19, dir: "left", sprite: "npc_dev", behaviour: "look", radius: 3, trainer: "tr_wilmslow_1", sight: 3 },
      { id: "npc_wilmslow_osk", x: 12, y: 24, dir: "up", sprite: "npc_dev", behaviour: "look", radius: 3, trainer: "tr_wilmslow_2", sight: 3 },
      { id: "npc_wilmslow_neighbour", x: 9, y: 10, dir: "down", sprite: "npc_granny", behaviour: "still", trainer: "tr_wilmslow_3", sight: 0, script: "east_wilmslow_neighbour" },
      { id: "npc_wilmslow_bill", x: 4, y: 24, dir: "right", sprite: "npc_historian", behaviour: "still", script: "east_wilmslow_bill" },
      { id: "npc_wilmslow_hotspot", x: 26, y: 22, dir: "down", sprite: "npc_dev", behaviour: "still", script: "east_wilmslow_hotspot" },
      { id: "npc_wilmslow_barista", x: 36, y: 18, dir: "down", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Flat white, oat, and could you please stop asking me for the Wi-Fi password.",
          "There isn't one. There's never been one. Everybody's phone connects anyway and I have stopped asking why."] },
      { id: "npc_wilmslow_commuter", x: 46, y: 19, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[46, 19], [46, 22], [40, 22]], pathMode: "pingpong",
        say: ["Eighteen minutes to Piccadilly. I have done it four thousand times.",
          "I could do it asleep. Some mornings I demonstrably have."] },
      { id: "npc_wilmslow_kid", x: 26, y: 12, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 4,
        say: ["There's an apple on the wall on Adlington Road every morning.", "Nobody's ever seen who. I've tried getting up at five. It's already there at five."] },
      { id: "npc_wilmslow_verger", x: 36, y: 12, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["The sandstone comes from the Edge. Every church round here is a piece of that hill, moved.",
          "Which makes the hill a quarry and a legend at the same time, and it manages both."] },
      { id: "npc_wilmslow_stuffer", x: 43, y: 34, dir: "up", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_route_prestbury_wilmslow_3", sight: 4, cond: "!vex_battle_1" },
      { id: "npc_wilmslow_gym_door", x: 33, y: 32, dir: "up", sprite: "npc_sysadmin", behaviour: "still", script: "east_wilmslow_gym_door" },
      { id: "npc_wilmslow_rhi", x: 43, y: 34, dir: "left", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_wilmslow_4", sight: 4 },
      { id: "npc_wilmslow_rambler", x: 20, y: 34, dir: "down", sprite: "npc_walker", behaviour: "still",
        say: ["Two miles to the Edge and you can see it from here on a clear day: a line of trees on a lip of red rock.",
          "People go up there for the view. People come back down talking about the well."] }
    ],
    triggers: [
      { x: 25, y: 22, w: 3, h: 1, script: "east_wilmslow_arrival", once: "wilmslow_arrival", cond: "!wilmslow_arrival" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("wilmslow_care", W.builtin("care_centre", {
    name: "Wilmslow Care Centre", region: "bollin", dialogue: "town_wilmslow", music: "town_wilmslow",
    warps: [
      { x: 7, y: 11, to: "wilmslow", tx: 7, ty: 32, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "wilmslow", tx: 7, ty: 32, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wilmslow_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "machine",
        say: ["Straight in. Ada sends us four a day and she never apologises and they're always fine."] },
      { id: "npc_wilmslow_care_1", x: 11, y: 5, dir: "left", sprite: "npc_dev", behaviour: "still",
        say: ["Electric types and a static floor. That's the gym. Everything you bring in leaves a bit slower.",
          "Bring something that doesn't mind being earthed."] }
    ]
  }));

  W.defineMap("wilmslow_mart", W.builtin("shop", {
    name: "Wilmslow Mart", region: "bollin", dialogue: "town_wilmslow", music: "town_wilmslow",
    shop: "shop_wilmslow",
    warps: [
      { x: 6, y: 9, to: "wilmslow", tx: 6, ty: 18, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "wilmslow", tx: 6, ty: 18, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wilmslow_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_wilmslow",
        say: ["Insulating gear's on the end. Everyone buys it the day after they meet Ada, never the day before."] }
    ],
    items: [{ x: 12, y: 2, item: "kevlar_waistcoat", n: 1, flag: "item_wilmslow_mart_1" }]
  }));

  W.defineMap("wilmslow_cafe", W.builtin("shop", {
    name: "The Grove Café", region: "bollin", dialogue: "town_wilmslow", music: "town_wilmslow",
    shop: "shop_wilmslow_cafe",
    warps: [
      { x: 6, y: 9, to: "wilmslow", tx: 35, ty: 18, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "wilmslow", tx: 35, ty: 18, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wilmslow_cafe_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_wilmslow_cafe",
        say: ["Cake, brews and berries for the road. The brews are somebody's grandmother's and the cake is mine."] },
      { id: "npc_wilmslow_cafe_1", x: 10, y: 3, dir: "left", sprite: "npc_dev", behaviour: "still", script: "east_wilmslow_cafe_dev" }
    ],
    items: [{ x: 12, y: 2, item: "brew_hedgerow_cordial", n: 2, flag: "item_wilmslow_cafe_1" }]
  }));

  W.defineMap("wilmslow_inn", W.builtin("pub", {
    name: "The Coach & Four", region: "bollin", dialogue: "town_wilmslow", music: "town_wilmslow",
    warps: [
      { x: 6, y: 11, to: "wilmslow", tx: 47, ty: 32, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "wilmslow", tx: 47, ty: 32, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wilmslow_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["No Wi-Fi. No router. Nothing in this building that talks to anything outside this building.",
          "Started as stubbornness. Turned into a selling point. Might turn into something else yet."] },
      { id: "npc_wilmslow_inn_1", x: 9, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Everyone's phone finds a network in here. In a building with no network.",
          "The landlord's stopped laughing about it."] }
    ]
  }));

  W.defineMap("wilmslow_station", W.builtin("station", {
    name: "Wilmslow Station", region: "bollin", dialogue: "town_wilmslow", music: "town_wilmslow",
    station: { name: "Wilmslow" },
    warps: [
      { x: 8, y: 11, to: "wilmslow", tx: 47, ty: 18, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "wilmslow", tx: 47, ty: 18, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wilmslow_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train", script: "east_wilmslow_railcard" },
      { id: "npc_wilmslow_platform", x: 11, y: 6, dir: "left", sprite: "npc_dev", behaviour: "still",
        say: ["Four platforms and the board's showing the same four minutes it showed yesterday.",
          "The trains are on time. It's the clock that's stuck. I find that worse."] }
    ],
    signs: [{ x: 8, y: 1, text: ["DEPARTURES", "MANCHESTER PICCADILLY 18 min", "CREWE 22 min", "The seconds column has not moved since you came in."] }]
  }));

  W.defineMap("wilmslow_church", W.builtin("church", {
    name: "St Bartholomew's", region: "bollin", dialogue: "town_wilmslow", music: "town_wilmslow",
    warps: [
      { x: 6, y: 13, to: "wilmslow", tx: 39, ty: 11, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "wilmslow", tx: 39, ty: 11, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wilmslow_church_1", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["We buried a man from the bog. Two thousand years dead and they gave him a service anyway.",
          "Somebody said that was daft. I said he'd been kept for two thousand years by something that didn't ask his permission either."] }
    ],
    items: [{ x: 1, y: 11, item: "capsule_night", n: 2, hidden: true, flag: "item_wilmslow_church_1" }]
  }));

  // Turing's house — a quiet villa with a garage nobody talks about
  W.defineMap("wilmslow_turing_house", W.builtin("house_large", {
    name: "The House on Adlington Road", region: "bollin", dialogue: "town_wilmslow", music: "town_wilmslow",
    warps: [
      { x: 7, y: 13, to: "wilmslow", tx: 8, ty: 9, dir: "down", kind: "door" },
      { x: 8, y: 13, to: "wilmslow", tx: 8, ty: 9, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_turing_owner", x: 10, y: 4, dir: "down", sprite: "npc_granny", behaviour: "still", script: "east_turing_house" },
      { id: "npc_turing_cat", x: 10, y: 9, dir: "left", sprite: "cat", behaviour: "wander", radius: 2,
        say: ["A tabby occupies the exact centre of the hall and declines to be part of anyone's story."] }
    ],
    signs: [
      { x: 15, y: 11, text: ["A door to a small back room. The owner keeps it shut.",
        "'People want to stand in it,' she says. 'I've decided they can't. He'd have hated the queue.'"] }
    ],
    items: [{ x: 1, y: 3, item: "apple", n: 2, hidden: true, flag: "item_turing_house_1" }]
  }));

  // The post office — Nino's first letter
  const po = B.canvas(14, 10, "_");
  po.box("g", 0, 0, 14, 10, "#");
  po.fill("g", 1, 0, 12, 1, "^");
  po.fill("g", 1, 1, 12, 1, "#");
  po.fill("g", 3, 1, 2, 1, "W"); po.fill("g", 9, 1, 2, 1, "W");
  po.fill("g", 1, 4, 5, 1, "C");
  po.fill("g", 8, 4, 5, 1, "C");
  po.fill("g", 1, 6, 3, 1, "s");
  po.fill("g", 10, 6, 3, 1, "s");
  po.set("g", 6, 9, "d"); po.set("g", 7, 9, "d");
  po.fill("g", 6, 7, 2, 2, "M");
  W.defineMap("wilmslow_post", {
    name: "Wilmslow Post Office", region: "bollin", outdoor: false, music: "town_wilmslow",
    ambience: "town", dialogue: "town_wilmslow",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_tile",
      "C": "counter", "s": "shelf", "d": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: po.layers(),
    spawnPoint: { x: 6, y: 8 },
    warps: [
      { x: 6, y: 9, to: "wilmslow", tx: 16, ty: 18, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "wilmslow", tx: 16, ty: 18, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wilmslow_postmaster", x: 3, y: 3, dir: "down", sprite: "npc_shopkeep", behaviour: "still", script: "east_wilmslow_post" },
      { id: "npc_wilmslow_post_1", x: 11, y: 7, dir: "up", sprite: "npc_granny", behaviour: "still",
        say: ["Nobody writes letters. Then somebody does and the whole counter stops to look at the stamps."] }
    ],
    signs: [{ x: 12, y: 4, text: ["POSTE RESTANTE — held mail collected in person, with ID.", "One item is held. It has been held a while."] }],
    encounters: { grass: null }
  });

  // ---------------------------------------------------------------- gym ---
  // A rack room. Three patch panels, cable ducts for walls, and a door at the
  // back that will not open until the racks agree with each other.
  const g = B.canvas(32, 32, "_");
  g.box("g", 0, 0, 32, 32, "#");
  g.fill("g", 1, 0, 30, 1, "^");
  g.fill("g", 1, 1, 30, 1, "#");
  g.fill("g", 1, 2, 30, 28, "_");
  // rack rows: three aisles with a duct spine between them
  for (let r = 0; r < 3; r++) {
    const y = 5 + r * 7;
    g.fill("g", 3, y, 11, 1, "R");
    g.fill("g", 18, y, 11, 1, "R");
    g.fill("g", 3, y + 2, 11, 1, "R");
    g.fill("g", 18, y + 2, 11, 1, "R");
  }
  g.fill("g", 15, 3, 2, 24, "|");
  g.fill("g", 15, 9, 2, 1, "_");
  g.fill("g", 15, 16, 2, 1, "_");
  g.fill("g", 15, 23, 2, 1, "_");
  // the three patch panels at the head of each aisle
  g.set("g", 2, 6, "P"); g.set("g", 29, 13, "P"); g.set("g", 2, 20, "P");
  // the leader's door at the back, and the mat you stand on to be told no
  g.fill("g", 13, 2, 6, 1, "0");
  g.fill("g", 14, 3, 4, 1, "M");
  // floor markings, static warning, spares
  g.fill("g", 5, 28, 22, 1, "S");
  g.set("g", 4, 3, "T"); g.set("g", 27, 3, "T");
  g.set("g", 4, 26, "T"); g.set("g", 27, 26, "T");
  g.set("g", 9, 30, "d"); g.set("g", 10, 30, "d");
  g.fill("g", 9, 28, 2, 1, "M");
  g.set("g", 20, 29, "C"); g.set("g", 24, 29, "C");
  g.set("g", 12, 30, "N");
  W.defineMap("wilmslow_gym", {
    name: "Wilmslow Gym — the Rack Room", region: "bollin", outdoor: false, music: "town_wilmslow",
    ambience: "industrial", dialogue: "town_wilmslow",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "_": "floor_gym", "R": "server_rack",
      "|": "cable_duct", "P": "machine", "0": "door_locked", "M": "mat_welcome", "S": "floor_carpet",
      "T": "terminal", "C": "crate", "d": "door_gym", "N": "sign", " ": null
    },
    layers: g.layers(),
    spawnPoint: { x: 9, y: 29 },
    landmark: { name: "Wilmslow Gym", x: 16, y: 16 },
    warps: [
      { x: 9, y: 30, to: "wilmslow", tx: 34, ty: 32, dir: "down", kind: "door" },
      { x: 10, y: 30, to: "wilmslow", tx: 34, ty: 32, dir: "down", kind: "door" },
      { x: 15, y: 2, to: "wilmslow_gym_floor", tx: 11, ty: 20, dir: "up", kind: "door", cond: "gym1_patched" },
      { x: 16, y: 2, to: "wilmslow_gym_floor", tx: 12, ty: 20, dir: "up", kind: "door", cond: "gym1_patched" }
    ],
    signs: [
      { x: 12, y: 30, text: ["WILMSLOW GYM — THE RACK ROOM",
        "Three panels. Blue to blue, amber to amber, and the earth bond goes LAST or you will learn something you cannot unlearn.",
        "Patch all three and the back door releases. Ada does not open doors for people. Doors open for correct work."] },
      { x: 4, y: 3, text: ["A terminal, logged in as somebody who has gone for a sandwich.",
        "The screen says: UPTIME 1,104 DAYS. Under it, hand-written on tape: 'DO NOT BE THE REASON THIS RESETS.'"] },
      { x: 27, y: 26, text: ["A wall of asset tags going back nineteen years.",
        "Every one has a date it went in and a date it came out. Three of them have no second date."] }
    ],
    items: [
      { x: 30, y: 29, item: "patch_cable", n: 1, hidden: true, flag: "item_wilmslow_gym_1" },
      { x: 1, y: 29, item: "elixir", n: 1, hidden: true, flag: "item_wilmslow_gym_2" }
    ],
    npcs: [
      { id: "npc_gym_ollie", x: 8, y: 8, dir: "down", sprite: "npc_sysadmin", behaviour: "look", radius: 3, trainer: "tr_wilmslow_gym_1", sight: 3 },
      { id: "npc_gym_freya", x: 23, y: 15, dir: "left", sprite: "npc_sysadmin", behaviour: "look", radius: 3, trainer: "tr_wilmslow_gym_2", sight: 3 },
      { id: "npc_gym_marek", x: 8, y: 22, dir: "up", sprite: "npc_sysadmin", behaviour: "look", radius: 3, trainer: "tr_wilmslow_gym_3", sight: 3 },
      { id: "npc_gym_panel_1", x: 3, y: 6, dir: "left", sprite: "npc_sysadmin", behaviour: "still", script: "east_gym1_panel_1" },
      { id: "npc_gym_panel_2", x: 28, y: 13, dir: "right", sprite: "npc_sysadmin", behaviour: "still", script: "east_gym1_panel_2" },
      { id: "npc_gym_panel_3", x: 3, y: 20, dir: "left", sprite: "npc_sysadmin", behaviour: "still", script: "east_gym1_panel_3" }
    ],
    triggers: [
      { x: 14, y: 3, w: 4, h: 1, script: "east_gym1_door", cond: "!gym1_patched" }
    ],
    encounters: { grass: null }
  });

  // Ada's floor: a raised platform, a static mat, and one chair she never uses
  const gf = B.canvas(24, 22, "_");
  gf.box("g", 0, 0, 24, 22, "#");
  gf.fill("g", 1, 0, 22, 1, "^");
  gf.fill("g", 1, 1, 22, 1, "#");
  gf.fill("g", 6, 4, 12, 12, "S");
  gf.fill("g", 8, 6, 8, 8, "_");
  gf.fill("g", 2, 3, 3, 1, "R"); gf.fill("g", 19, 3, 3, 1, "R");
  gf.fill("g", 2, 17, 3, 1, "R"); gf.fill("g", 19, 17, 3, 1, "R");
  gf.set("g", 11, 3, "A"); gf.set("g", 12, 3, "A");
  gf.set("g", 2, 10, "T"); gf.set("g", 21, 10, "T");
  gf.set("g", 11, 21, "d"); gf.set("g", 12, 21, "d");
  gf.fill("g", 11, 19, 2, 2, "M");
  gf.set("g", 4, 19, "C"); gf.set("g", 19, 19, "C");
  W.defineMap("wilmslow_gym_floor", {
    name: "Wilmslow Gym", region: "bollin", outdoor: false, music: "town_wilmslow",
    ambience: "industrial", dialogue: "town_wilmslow",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "_": "floor_gym", "S": "floor_carpet",
      "R": "server_rack", "A": "gym_badge_stand", "T": "terminal", "C": "crate",
      "d": "door_gym", "M": "mat_welcome", " ": null
    },
    layers: gf.layers(),
    spawnPoint: { x: 11, y: 20 },
    warps: [
      { x: 11, y: 21, to: "wilmslow_gym", tx: 15, ty: 3, dir: "down", kind: "door" },
      { x: 12, y: 21, to: "wilmslow_gym", tx: 16, ty: 3, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wilmslow_ada", x: 11, y: 5, dir: "down", sprite: "ada", behaviour: "still", script: "east_gym1_ada" }
    ],
    signs: [
      { x: 11, y: 3, text: ["THE PACKET BADGE STAND.", "Nine badges have left this stand this year. Ada has written every name down and none of them on the wall."] }
    ],
    encounters: { grass: null }
  });
})();
