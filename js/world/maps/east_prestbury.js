// =============================================================
// MonsterQuest v2 — PRESTBURY (region east, WORLD-BIBLE §2 K4)
// Rich, quiet, watchful. St Peter's and the Norman chapel, the
// black-and-white Priest's House and its rotating hedge maze, the
// Bridge Hotel over the Bollin, gravel drives, box hedges, and an
// unusual density of cameras that nobody will say they own.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const LEG = B.legend({
    "0": "wall_tudor", "1": "wall_tudor_beam", "2": "wall_render_cream", "3": "roof_tile_red",
    "4": "path_gravel", "5": "hedge_low", "6": "water_river", "7": "shallows", "8": "tree_apple",
    "9": "tree_apple_top", "E": "fence_wire", "Q": "fish_spot", "U": "well", "J": "greenhouse_wall",
    "Y": "greenhouse_door", "!": "greenhouse_bed", "?": "roof_glass", ":": "bridge_rail",
    ";": "gate_wood", "<": "tree_willow", ">": "water_reeds"
  });

  // ---------------------------------------------------------------- town --
  const c = B.canvas(44, 34, ",");
  c.fill("g", 0, 0, 44, 2, "T");
  for (let x = 0; x < 44; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 31, "h");
  c.fill("g", 43, 2, 1, 31, "h");
  c.fill("g", 0, 33, 44, 1, "T");

  // ---- the village street (E-W), pavements and lamps ---------------------
  c.fill("g", 1, 13, 42, 4, "=");
  c.fill("g", 1, 12, 42, 1, "-");
  c.fill("g", 1, 17, 42, 1, "-");
  c.fill("g", 0, 13, 1, 3, "=");   // west exit — the Mottram lanes
  c.fill("g", 43, 14, 1, 3, "=");  // east exit — Bollin Valley lane
  for (let x = 4; x < 42; x += 7) { c.set("g", x, 12, "L"); c.set("g", x + 3, 17, "L"); }
  c.set("g", 13, 17, "O"); c.set("g", 25, 12, "n"); c.set("g", 15, 12, "*");
  c.set("g", 29, 17, "H"); c.set("g", 30, 17, "I"); c.set("g", 6, 17, "u");
  c.set("g", 39, 12, "*");

  // ---- north-east: St Peter's, the Norman chapel, the churchyard ----------
  c.fill("g", 25, 2, 17, 10, ",");
  c.box("g", 25, 2, 17, 10, "w");
  c.fill("g", 26, 3, 15, 8, ",");
  B.house(c, { x: 29, y: 3, w: 10, h: 7, rh: 2, roof: "p", wall: "c", win: "C", door: "d", doorX: 4, over: "^" });
  c.set("g", 33, 2, "p");
  // the little Norman chapel, older and squatter, at the east end
  c.fill("g", 39, 5, 2, 4, "c");
  c.set("g", 40, 5, "C"); c.set("g", 40, 8, "C");
  c.set("g", 39, 8, "d");
  c.scatter("g", "prest-graves", "g", 12, 26, 4, 12, 6, [","]);
  c.fill("g", 33, 10, 1, 2, "_"); c.set("g", 33, 12, "_");
  c.fill("g", 38, 8, 1, 3, "_"); c.set("g", 38, 11, "_"); c.set("g", 38, 12, "_");
  c.set("g", 27, 3, "U");
  c.set("g", 26, 12, "N");
  c.set("g", 30, 11, "i");

  // ---- north-west: the Priest's House, black and white --------------------
  c.fill("g", 1, 2, 24, 10, ".");
  B.house(c, { x: 4, y: 4, w: 12, h: 6, rh: 2, roof: "3", wall: "0", win: "W", door: "@", doorX: 5, over: "^" });
  for (let j = 6; j < 9; j++) { c.set("g", 4, j, "1"); c.set("g", 15, j, "1"); c.set("g", 11, j, "1"); }
  c.set("g", 5, 4, "m"); c.set("g", 14, 4, "m");
  c.fill("g", 4, 10, 12, 1, "4");
  c.fill("g", 9, 10, 1, 2, "4");
  c.set("g", 3, 10, "N");
  c.set("g", 2, 3, "8"); c.set("o", 2, 2, "9");
  c.set("g", 2, 7, "8"); c.set("o", 2, 6, "9");
  c.fill("g", 1, 9, 2, 3, "\"");
  // a lean-to greenhouse against the garden wall
  c.fill("g", 17, 2, 3, 2, "J");
  c.fill("o", 17, 2, 3, 1, "?");
  c.set("g", 18, 4, "Y"); c.set("g", 17, 4, "!"); c.set("g", 19, 4, "!");

  // ---- the box-hedge maze garden, behind a wooden gate --------------------
  c.fill("g", 20, 5, 5, 7, "h");
  c.fill("g", 21, 6, 3, 4, "5");
  c.set("g", 22, 11, ";");
  c.fill("g", 22, 6, 1, 5, ".");
  c.set("g", 24, 4, "N");

  // ---- south terrace: Care centre, the Bridge Hotel, the boutique ---------
  c.fill("g", 1, 18, 42, 5, ".");
  B.house(c, { x: 3, y: 18, w: 10, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 4, 18, "m");
  B.house(c, { x: 16, y: 18, w: 12, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 6, over: "^" });
  c.set("g", 17, 18, "m"); c.set("g", 26, 18, "m");
  B.house(c, { x: 31, y: 18, w: 10, h: 4, rh: 2, roof: "3", wall: "2", win: "W", door: "S", doorX: 4, over: "^" });
  // the back lane behind the terrace, joined to the street at both ends
  c.fill("g", 1, 22, 42, 1, "4");
  c.set("g", 2, 22, "N"); c.set("g", 15, 22, "N"); c.set("g", 30, 22, "N");
  c.fill("g", 1, 18, 1, 4, "4"); c.fill("g", 42, 18, 1, 4, "4");
  c.fill("g", 14, 18, 1, 4, "4"); c.fill("g", 29, 18, 1, 4, "4");
  c.set("g", 1, 12, "L");

  // ---- the gravel drives: two large houses behind box hedges --------------
  c.fill("g", 1, 23, 42, 4, ".");
  const drives = [4, 27];
  for (let i = 0; i < drives.length; i++) {
    const dx = drives[i];
    c.fill("g", dx, 23, 13, 3, "h");
    c.fill("g", dx + 1, 23, 11, 3, "4");
    B.house(c, { x: dx + 3, y: 23, w: 7, h: 3, rh: 1, roof: "3", wall: "2", win: "W", door: "D", doorX: 3, over: "^" });
    c.set("g", dx, 23, "F"); c.set("g", dx + 12, 23, "F");
  }
  // wire fences and the cameras nobody claims
  c.set("g", 18, 24, "E"); c.set("g", 19, 24, "E"); c.set("g", 24, 24, "E");
  c.fill("g", 20, 23, 3, 3, "\"");
  c.set("g", 21, 24, "o");

  // ---- the Bollin along the south, the bridge, the far bank ---------------
  c.fill("g", 1, 27, 42, 3, "6");
  c.fill("g", 1, 26, 42, 1, ".");
  c.fill("g", 1, 30, 42, 3, ".");
  c.fill("g", 7, 27, 2, 3, "7"); c.fill("g", 33, 28, 2, 2, "7");
  c.set("g", 5, 27, ">"); c.set("g", 38, 29, ">");
  c.fill("g", 19, 26, 3, 5, "x");
  c.set("d", 18, 28, ":"); c.set("d", 22, 28, ":");
  c.set("g", 12, 28, "Q"); c.set("g", 30, 28, "Q");
  B.trees(c, "prest-bollin", 18, 1, 30, 42, 3, "<", null, ["."]);
  c.fill("g", 2, 30, 7, 3, "\"");
  c.fill("g", 34, 30, 8, 3, "\"");
  c.set("g", 24, 31, "H"); c.set("g", 16, 31, "I");
  c.set("g", 18, 26, "N");

  W.defineMap("prestbury", {
    name: "Prestbury", region: "east", outdoor: true, music: "town_prestbury", weatherZone: "east",
    ambience: "town", dialogue: "town_prestbury",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 42, y: 15 },
    healPoint: { x: 7, y: 22 },
    landmark: { name: "Prestbury", x: 21, y: 14 },
    encounters: { grass: "prestbury_grass", water: null },
    fishing: "fish_route_macc_bollington",
    warps: [
      { x: 9, y: 9, to: "prestbury_priests_house", tx: 7, ty: 12, dir: "up", kind: "door" },
      { x: 22, y: 11, to: "prestbury_hedge_maze", tx: 14, ty: 24, dir: "up", kind: "door" },
      { x: 39, y: 8, to: "prestbury_chapel", tx: 6, ty: 13, dir: "up", kind: "door" },
      { x: 33, y: 9, to: "prestbury_church", tx: 6, ty: 13, dir: "up", kind: "door" },
      { x: 22, y: 21, to: "prestbury_inn", tx: 6, ty: 11, dir: "up", kind: "door" },
      { x: 10, y: 25, to: "prestbury_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 7, y: 21, to: "prestbury_care", tx: 7, ty: 11, dir: "up", kind: "door" },
      { x: 33, y: 25, to: "prestbury_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 35, y: 21, to: "prestbury_boutique", tx: 6, ty: 9, dir: "up", kind: "door" },
      { x: 0, y: 13, to: "route_prestbury_wilmslow", tx: 44, ty: 15, dir: "left", kind: "edge" },
      { x: 0, y: 14, to: "route_prestbury_wilmslow", tx: 44, ty: 16, dir: "left", kind: "edge" },
      { x: 0, y: 15, to: "route_prestbury_wilmslow", tx: 44, ty: 17, dir: "left", kind: "edge" },
      { x: 43, y: 14, to: "route_macc_prestbury", tx: 44, ty: 12, dir: "right", kind: "edge" },
      { x: 43, y: 15, to: "route_macc_prestbury", tx: 44, ty: 13, dir: "right", kind: "edge" },
      { x: 43, y: 16, to: "route_macc_prestbury", tx: 44, ty: 14, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 3, y: 10, text: ["THE PRIEST'S HOUSE — c.1448.", "Black timber, white plaster, and a burglar alarm fitted in 2019 that nobody has ever heard go off.", "The house does not need it. The house has outlasted worse."] },
      { x: 24, y: 4, text: ["THE HEDGE GARDEN — cut weekly.", "The pattern is never the same twice. The gardener says that is not deliberate, and then looks at his hands."] },
      { x: 26, y: 12, text: ["ST PETER'S, PRESTBURY. Beside it the Norman chapel, older by two hundred years and half the size.", "The chapel is unlocked. It always is. Nobody in this village locks the oldest thing they own."] },
      { x: 2, y: 22, text: ["PRESTBURY CARE CENTRE — free at the point of use, and the point of use is that door."] },
      { x: 15, y: 22, text: ["THE BRIDGE HOTEL — rooms, dinner, and a car park full of number plates you would remember."] },
      { x: 30, y: 22, text: ["BRIDGE STREET BOUTIQUE — held items, fitted properly.", "A card in the window: NO, WE DO NOT DO REFUNDS ON LUCK."] },
      { x: 18, y: 26, text: ["THE BOLLIN — runs clear here and the colour of tea by Wilmslow.", "ANGLING BY PERMIT. Permits from the hotel. The hotel has never issued one."] },
      { x: 27, y: 3, text: ["THE VILLAGE WELL — capped 1908.", "Somebody has dropped a coin in anyway. Somebody always does. The cap has a coin-shaped dent."] }
    ],
    items: [
      { x: 2, y: 31, item: "capsule_mesh", n: 2, flag: "item_prestbury_1" },
      { x: 40, y: 31, item: "cipher_lens", n: 1, hidden: true, flag: "item_prestbury_2" },
      { x: 22, y: 7, item: "tonic", n: 2, flag: "item_prestbury_3" },
      { x: 2, y: 10, item: "apple", n: 3, hidden: true, flag: "item_prestbury_4" },
      { x: 21, y: 24, item: "capsule_basic", n: 2, hidden: true, flag: "item_prestbury_5" }
    ],
    catGaps: [
      { x: 24, y: 24, item: "cat_token_2", n: 1, flag: "catgap_prestbury_1",
        say: "MEADOW slips under the wire, sits directly beneath a camera for a full minute, and comes back with a collar tag that is not hers and not the village's." }
    ],
    restPoints: [{ x: 24, y: 26, flag: "bigboy_sat_prestbury" }],
    npcs: [
      { id: "npc_prestbury_ffion", x: 21, y: 12, dir: "right", sprite: "npc_granny", behaviour: "still", script: "east_prestbury_ffion" },
      { id: "npc_prestbury_penhaligon", x: 30, y: 12, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_prestbury_3", sight: 0, script: "east_prestbury_penhaligon" },
      { id: "npc_prestbury_vance", x: 12, y: 14, dir: "down", sprite: "npc_shadow_it", behaviour: "look", radius: 3, trainer: "tr_prestbury_1", sight: 3 },
      { id: "npc_prestbury_efa", x: 33, y: 22, dir: "up", sprite: "npc_granny", behaviour: "still", trainer: "tr_prestbury_2", sight: 0 },
      { id: "npc_prestbury_security", x: 3, y: 22, dir: "down", sprite: "npc_shadow_it", behaviour: "path", path: [[3, 22], [12, 22], [12, 26], [3, 26]], pathMode: "loop",
        say: ["Private road.", "It is not, actually. It is an adopted highway and you have every right to be on it.",
          "But everybody stops when I say it, so I say it."] },
      { id: "npc_prestbury_gardener", x: 18, y: 11, dir: "right", sprite: "npc_farmer", behaviour: "still", script: "east_prestbury_gardener" },
      { id: "npc_prestbury_kid", x: 26, y: 15, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 4,
        say: ["There are more cameras than people. I counted. Sixty-one cameras.",
          "Forty of them face the road. The other twenty-one face each other. My dad says that's a coincidence.",
          "My dad also says the fridge ordering things is a coincidence."] },
      { id: "npc_prestbury_vicar", x: 33, y: 12, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["The chapel is Norman. The church is Georgian pretending to be older.",
          "Both of them have outlasted every alarm system in this village, and they will outlast the next lot too."] },
      { id: "npc_prestbury_walker", x: 20, y: 26, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[8, 26], [36, 26]], pathMode: "pingpong",
        say: ["Bollin's low. Runs clear through here and comes out at Wilmslow the colour of tea.",
          "That is not the village's fault, before you ask. Everything round here is somebody's fault and none of it is ours."] },
      { id: "npc_prestbury_cat_lady", x: 42, y: 20, dir: "left", sprite: "npc_granny", behaviour: "still", script: "east_prestbury_cat" },
      { id: "npc_prestbury_verger", x: 28, y: 7, dir: "down", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Graves face east so they can see the sunrise. That is the reason given.",
          "The real reason is that somebody in 1310 did it that way and nobody has had the nerve to stop."] }
    ],
    triggers: [
      { x: 22, y: 12, w: 1, h: 1, script: "east_prestbury_maze_hint", once: "prestbury_maze_hint", cond: "!prestbury_maze_hint" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("prestbury_care", W.builtin("care_centre", {
    name: "Prestbury Care Centre", region: "east", dialogue: "town_prestbury", music: "town_prestbury",
    warps: [
      { x: 7, y: 11, to: "prestbury", tx: 21, ty: 23, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "prestbury", tx: 21, ty: 23, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_prestbury_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "machine",
        say: ["Private practice down the road charges. We don't. Sit down."] },
      { id: "npc_prestbury_care_1", x: 11, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Third smart-home this month. The kettle joined something.",
          "I don't know what it joined. Neither does the kettle."] }
    ]
  }));

  W.defineMap("prestbury_boutique", W.builtin("shop", {
    name: "Bridge Street Boutique", region: "east", dialogue: "town_prestbury", music: "town_prestbury",
    shop: "shop_prestbury_boutique",
    warps: [
      { x: 6, y: 9, to: "prestbury", tx: 41, ty: 22, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "prestbury", tx: 41, ty: 22, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_prestbury_boutique", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_prestbury_boutique",
        say: ["Held items. Proper ones. Nothing here has ever been in a bargain bin and neither have I."] },
      { id: "npc_prestbury_boutique_2", x: 10, y: 3, dir: "left", sprite: "npc_dev", behaviour: "still",
        say: ["I'm buying a focus band for a creature that has never once focused.",
          "Hope is a purchase decision."] }
    ],
    items: [{ x: 12, y: 2, item: "focus_band", n: 1, flag: "item_prestbury_boutique_1" }]
  }));

  W.defineMap("prestbury_inn", W.builtin("pub", {
    name: "The Bridge Hotel", region: "east", dialogue: "town_prestbury", music: "town_prestbury",
    warps: [
      { x: 6, y: 11, to: "prestbury", tx: 28, ty: 23, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "prestbury", tx: 28, ty: 23, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_prestbury_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Room over the river. Forty pound, and the water talks all night.",
          "Most people pay extra for that somewhere else."] },
      { id: "npc_prestbury_inn_1", x: 9, y: 6, dir: "left", sprite: "npc_shadow_it", behaviour: "still",
        say: ["Meeting at eleven, meeting at two, and neither of them is on a calendar.",
          "That's not sinister. That's just consultancy."] },
      { id: "npc_prestbury_inn_2", x: 4, y: 8, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["Bloke came in wearing a good coat and asked for tap water in a wine glass.",
          "Barman gave him it. That's Prestbury: nobody argues, everybody remembers."] }
    ]
  }));

  // The Priest's House — timber frame, low beams, Cadoc's tools in the porch
  const ph = B.canvas(16, 14, "_");
  ph.box("g", 0, 0, 16, 14, "#");
  ph.fill("g", 1, 0, 14, 1, "^");
  ph.fill("g", 1, 1, 14, 1, "#");
  ph.fill("g", 3, 1, 2, 1, "W"); ph.fill("g", 11, 1, 2, 1, "W");
  ph.fill("g", 6, 1, 4, 4, "#");
  ph.fill("g", 1, 3, 4, 1, "k"); ph.fill("g", 11, 3, 4, 1, "k");
  ph.fill("g", 2, 6, 3, 1, "t"); ph.set("g", 3, 7, "h");
  ph.fill("g", 11, 6, 3, 1, "t"); ph.set("g", 12, 7, "h");
  ph.fill("g", 6, 6, 4, 3, "r");
  ph.fill("g", 1, 9, 2, 1, "f");
  ph.set("g", 14, 9, "a");
  ph.set("g", 7, 13, "d"); ph.set("g", 8, 13, "d");
  ph.fill("g", 7, 11, 2, 2, "D");
  W.defineMap("prestbury_priests_house", {
    name: "The Priest's House", region: "interior", outdoor: false, music: "town_prestbury",
    ambience: "town", dialogue: "town_prestbury",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_wood_dark",
      "k": "bookcase", "t": "table", "h": "chair", "r": "rug", "f": "fireplace", "a": "stairs",
      "d": "door_wood", "D": "mat_welcome", " ": null
    },
    layers: ph.layers(),
    spawnPoint: { x: 7, y: 12 },
    warps: [
      { x: 7, y: 13, to: "prestbury", tx: 9, ty: 12, dir: "down", kind: "door" },
      { x: 8, y: 13, to: "prestbury", tx: 9, ty: 12, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_prestbury_cadoc", x: 8, y: 9, dir: "down", sprite: "npc_farmer", behaviour: "still", script: "east_prestbury_cadoc" },
      { id: "npc_prestbury_housekeeper", x: 3, y: 6, dir: "right", sprite: "npc_granny", behaviour: "still",
        say: ["Five hundred and seventy-odd years and the floor still isn't level.",
          "Neither's the family. Don't quote me."] }
    ],
    signs: [
      { x: 13, y: 3, text: ["A shelf of parish records.", "Somebody has been through 1642 to 1651 recently. The dust says so."] }
    ],
    items: [{ x: 1, y: 11, item: "billhook_charm", n: 1, hidden: true, flag: "item_prestbury_priests_1" }],
    encounters: { grass: null }
  });

  // The hedge maze — box hedges, rotates weekly, tall grass in the dead ends
  const hm = B.canvas(28, 26, "h");
  hm.fill("g", 1, 1, 26, 24, ".");
  for (let gy = 3; gy < 24; gy += 4) hm.fill("g", 1, gy, 26, 1, "5");
  for (let gx = 4; gx < 26; gx += 5) hm.fill("g", gx, 1, 1, 24, "5");
  // carve the solution: a zig-zag from the south gate to the centre
  hm.fill("g", 13, 20, 2, 5, ".");
  hm.fill("g", 5, 19, 10, 2, ".");
  hm.fill("g", 5, 15, 2, 5, ".");
  hm.fill("g", 5, 15, 16, 2, ".");
  hm.fill("g", 19, 11, 2, 5, ".");
  hm.fill("g", 8, 11, 13, 2, ".");
  hm.fill("g", 8, 6, 2, 6, ".");
  hm.fill("g", 8, 6, 8, 2, ".");
  hm.fill("g", 14, 3, 2, 4, ".");
  hm.fill("g", 12, 2, 6, 2, "_");
  // dead-end pockets with tall grass
  hm.fill("g", 22, 18, 4, 3, "\"");
  hm.fill("g", 2, 5, 3, 4, "\"");
  hm.fill("g", 22, 5, 4, 4, "\"");
  hm.fill("g", 2, 21, 3, 3, "\"");
  hm.set("g", 14, 25, "G");
  hm.set("g", 15, 25, "h");
  hm.set("g", 14, 2, "q");
  hm.set("g", 16, 3, "H");
  W.defineMap("prestbury_hedge_maze", {
    name: "The Hedge Garden", region: "east", outdoor: true, music: "town_prestbury",
    weatherZone: "east", ambience: "town", dialogue: "town_prestbury",
    legend: LEG, layers: hm.layers(),
    spawnPoint: { x: 14, y: 24 },
    landmark: { name: "The Hedge Garden", x: 14, y: 12 },
    encounters: { grass: "prestbury_hedge_maze_grass", water: null },
    warps: [
      { x: 14, y: 25, to: "prestbury", tx: 22, ty: 12, dir: "down", kind: "door" }
    ],
    signs: [
      { x: 14, y: 2, text: ["A stone figure with no face left.", "The plaque says: 'The way in and the way out are the same path walked twice.'",
        "Under it, scratched with a key: 'that is not TRUE and I have been here since NINE'"] }
    ],
    items: [
      { x: 24, y: 19, item: "capsule_basic", n: 3, flag: "item_prestbury_maze_1" },
      { x: 3, y: 6, item: "nerve_tonic", n: 1, flag: "item_prestbury_maze_2" },
      { x: 24, y: 6, item: "collectible_2", n: 1, hidden: true, flag: "item_prestbury_maze_3" },
      { x: 3, y: 22, item: "capsule_mesh", n: 2, hidden: true, flag: "item_prestbury_maze_4" }
    ],
    npcs: [
      { id: "npc_prestbury_maze_lost", x: 20, y: 12, dir: "left", sprite: "npc_tourist", behaviour: "still",
        say: ["I came in at nine. It is now considerably later than nine.",
          "No, I don't want rescuing. I want to have solved it. There's a difference and it's the whole of my personality."] },
      { id: "npc_prestbury_maze_cat", x: 9, y: 7, dir: "down", sprite: "cat_grinkit", behaviour: "wander", radius: 3,
        say: ["A ginger cat sits precisely where the path forks and does not move.", "You go the other way. It looks pleased."] }
    ],
    restPoints: [{ x: 15, y: 3, flag: "bigboy_sat_prestbury_maze" }]
  });

  // The Norman chapel — small, cold, unlocked
  W.defineMap("prestbury_chapel", W.builtin("church", {
    name: "The Norman Chapel", region: "east", dialogue: "town_prestbury", music: "town_prestbury",
    warps: [
      { x: 6, y: 13, to: "prestbury", tx: 36, ty: 12, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "prestbury", tx: 36, ty: 12, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_prestbury_chapel_1", x: 6, y: 4, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Eleven-hundred-and-something. The carving over the door is a beast eating its own tail.",
          "Every generation decides that means something different and every generation is wrong in a new way."] },
      { id: "npc_prestbury_chapel_ghost", x: 2, y: 8, dir: "right", sprite: "npc_ghost_trainer", behaviour: "still", cond: "phase_night",
        say: ["Something Roman-shaped is standing in the aisle at the wrong angle.",
          "It is two hundred miles and fifteen hundred years from where it belongs, and it knows it."] }
    ],
    items: [{ x: 10, y: 11, item: "capsule_night", n: 1, hidden: true, flag: "item_prestbury_chapel_1" }]
  }));

  const homes = [
    { id: "prestbury_house_1", tx: 10, ty: 26, name: "Cheviot House",
      npc: { id: "npc_prestbury_h1", sprite: "npc_granny", say: ["The lawn is done by a man who comes on Wednesdays and says nothing.", "Best conversation I have all week."] } },
    { id: "prestbury_house_2", tx: 33, ty: 26, name: "The Old Vicarage",
      npc: { id: "npc_prestbury_h2", sprite: "npc_dev", say: ["We moved out from town for the quiet.", "It is extremely quiet. I have started to find it quite loud."] } }
  ];
  for (let i = 0; i < homes.length; i++) {
    const hh = homes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: hh.name, region: "east", dialogue: "town_prestbury", music: "town_prestbury",
      warps: [
        { x: 5, y: 9, to: "prestbury", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "prestbury", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" }
      ],
      npcs: [{ id: hh.npc.id, x: 6, y: 3, dir: "down", sprite: hh.npc.sprite, behaviour: "still", say: hh.npc.say }]
    }));
  }

  W.defineMap("prestbury_church", W.builtin("church", {
    name: "St Peter's, Prestbury", region: "east", dialogue: "town_prestbury", music: "town_prestbury",
    warps: [
      { x: 6, y: 13, to: "prestbury", tx: 33, ty: 10, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "prestbury", tx: 33, ty: 10, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_prestbury_church_1", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Register's open at 1642 because a man came in and asked for 1642.",
          "He had the curator's voice and none of the curator's manners. He did not write in the visitors' book."] },
      { id: "npc_prestbury_church_2", x: 10, y: 8, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["I do the flowers. Tuesdays.", "You would be astonished what people say in a church when they think the flowers are furniture."] }
    ],
    items: [{ x: 1, y: 11, item: "salve", n: 2, hidden: true, flag: "item_prestbury_church_2" }]
  }));
})();
