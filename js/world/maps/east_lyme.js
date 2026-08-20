// =============================================================
// MonsterQuest v2 — LYME PARK & THE CAGE (region east, WORLD-BIBLE §2 M2)
// Deer park on the Peak fringe: the great house and its lake, the Cage
// on the ridge, bracken and gritstone, the Bowstones out on the moor,
// and a herd that has been standing the wrong way round for a week.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const LEG = B.legend({
    "0": "grass_moor", "1": "moor_heather", "2": "moor_path", "3": "moor_stone", "4": "rock_moor",
    "5": "boulder", "6": "cliff_face", "7": "cliff_top", "8": "cliff_climb", "9": "crag",
    "E": "cave_entrance", "Q": "fish_spot", "U": "water", "J": "water_edge", "Y": "path_gravel",
    "!": "tree_pine", "?": "tree_pine_top", ":": "wall_stone_grit", ";": "gate_wood",
    "<": "bridge_wood", ">": "ledge_down", "[": "log", "]": "stump", "{": "berry_bush",
    "}": "fence_stone", "|": "castle_tower", "$": "picnic_table"
  });

  // ---------------------------------------------------------------- park --
  const c = B.canvas(52, 38, "0");
  c.fill("g", 0, 0, 52, 2, "!");
  for (let x = 0; x < 52; x++) c.set("o", x, 0, "?");
  c.fill("g", 0, 2, 1, 35, "}");
  c.fill("g", 51, 2, 1, 35, "}");
  c.fill("g", 0, 37, 52, 1, "}");
  c.fill("g", 26, 36, 2, 2, "Y");   // the south lodge gate — Gritstone Trail
  c.set("g", 25, 37, ";"); c.set("g", 28, 37, ";");
  c.fill("g", 50, 5, 2, 3, "2");    // the moor gate to the Bowstones

  // ---- the drive up from the lodge ---------------------------------------
  c.fill("g", 26, 18, 2, 19, "Y");
  c.snake("g", "lyme-drive", "Y", 26, 18, 4, "v", 2, 0.5);
  c.fill("g", 16, 14, 23, 4, "Y");
  c.fill("g", 25, 14, 4, 4, "Y");

  // ---- the great house ----------------------------------------------------
  B.house(c, { x: 17, y: 5, w: 19, h: 9, rh: 3, roof: "R", wall: ":", win: "W", door: "D", doorX: 9, over: "^" });
  c.set("g", 18, 5, "m"); c.set("g", 22, 5, "m"); c.set("g", 30, 5, "m"); c.set("g", 34, 5, "m");
  c.set("g", 26, 5, "q");
  c.fill("g", 16, 4, 21, 1, ":");
  c.set("g", 16, 14, "N");
  // the formal garden and the orangery to the west of the forecourt
  c.fill("g", 6, 5, 10, 9, ".");
  c.box("g", 6, 5, 10, 9, "h");
  c.fill("g", 8, 7, 6, 5, "_");
  c.set("g", 11, 9, "/");
  c.set("g", 8, 7, "l"); c.set("g", 13, 11, "o"); c.set("g", 9, 11, "'");
  c.set("g", 11, 13, ";");
  c.fill("g", 10, 14, 3, 1, "Y");
  c.set("g", 5, 8, "N");
  // the stable yard east of the house
  c.fill("g", 38, 5, 11, 9, ",");
  c.box("g", 38, 5, 11, 9, ":");
  c.fill("g", 39, 6, 9, 7, "=");
  B.house(c, { x: 40, y: 6, w: 7, h: 4, rh: 1, roof: "R", wall: ":", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 43, 13, ";");
  c.fill("g", 42, 14, 3, 1, "Y");
  c.set("g", 40, 12, "A"); c.set("o", 40, 11, "a");
  c.set("g", 37, 8, "N");

  // ---- the lake in front of the house -------------------------------------
  c.fill("g", 7, 19, 18, 9, "U");
  c.fill("g", 6, 19, 1, 9, "J"); c.fill("g", 25, 19, 1, 9, "J");
  c.fill("g", 7, 28, 18, 1, "J");
  c.fill("g", 7, 18, 18, 1, "J");
  c.fill("g", 11, 18, 3, 1, "<");
  c.set("g", 12, 19, "<"); c.set("g", 12, 20, "<");
  c.set("g", 12, 21, "Q"); c.set("g", 20, 24, "Q"); c.set("g", 9, 26, "Q");
  c.fill("g", 2, 18, 5, 11, ".");
  c.fill("g", 2, 29, 24, 2, ".");
  c.fill("g", 10, 15, 5, 3, ".");
  c.fill("g", 11, 15, 1, 3, "_");
  c.set("g", 4, 22, "$"); c.set("g", 22, 30, "$");
  c.set("g", 6, 18, "N");

  // ---- the Cage on its knoll, east above the park -------------------------
  c.fill("g", 38, 18, 12, 12, "7");
  c.fill("g", 39, 19, 10, 10, "0");
  c.fill("g", 41, 21, 6, 6, "4");
  c.fill("g", 42, 22, 4, 4, "|");
  c.set("g", 43, 26, "D"); c.set("g", 44, 26, "|");
  c.fill("g", 43, 27, 1, 3, "2");
  c.fill("g", 40, 29, 8, 1, "2");
  c.fill("g", 38, 30, 12, 1, "2");
  c.set("g", 41, 31, "N");
  c.set("g", 47, 24, "8");
  c.set("g", 39, 25, "5"); c.set("g", 48, 27, "5");
  c.set("g", 41, 30, "N");
  // the way up to the Cage from the drive
  c.fill("g", 30, 30, 20, 1, "2");
  c.fill("g", 29, 30, 1, 1, "2");
  c.fill("g", 28, 26, 1, 5, "2");
  c.fill("g", 28, 26, 4, 1, "2");
  c.set("g", 31, 25, "2"); c.set("g", 31, 24, "2");
  c.fill("g", 31, 22, 1, 3, "2");
  c.fill("g", 31, 22, 8, 1, "2");
  c.set("g", 38, 22, "2");
  // the secret under the Cage — a shaft behind a fallen slab
  c.set("g", 47, 21, "E");
  c.set("g", 47, 22, "0");

  // ---- bracken, deer lawns, gritstone and the moor edges ------------------
  c.fill("g", 2, 2, 3, 12, "1");
  c.fill("g", 44, 15, 7, 2, "1");
  c.fill("g", 2, 32, 22, 4, "1");
  c.fill("g", 32, 32, 18, 4, "1");
  c.fill("g", 26, 32, 5, 4, "0");
  c.fill("g", 33, 15, 5, 2, "0");
  c.fill("g", 4, 16, 6, 2, "1");
  c.set("g", 3, 6, "3"); c.set("g", 48, 33, "3");
  c.set("g", 8, 34, "4"); c.set("g", 20, 33, "4"); c.set("g", 36, 34, "4");
  c.set("g", 15, 35, "["); c.set("g", 41, 33, "]"); c.set("g", 6, 33, "{");
  B.trees(c, "lyme-oaks", 26, 2, 30, 48, 6, "T", "y", ["1", "0"]);
  B.trees(c, "lyme-pines", 14, 40, 32, 10, 5, "!", "?", ["1"]);
  c.fill("g", 26, 33, 2, 1, "Y");
  c.fill("g", 26, 31, 2, 5, "Y");
  c.set("g", 25, 34, "N");
  c.fill("g", 2, 30, 24, 1, ".");
  c.fill("g", 2, 31, 24, 1, "0");
  c.fill("g", 24, 30, 2, 1, "Y");
  c.fill("g", 24, 31, 2, 1, "Y");
  c.set("g", 25, 30, "Y"); c.set("g", 25, 31, "Y");

  W.defineMap("lyme_park", {
    name: "Lyme Park", region: "east", outdoor: true, music: "town_bollington", weatherZone: "east",
    ambience: "moor", dialogue: "town_lyme_park",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 26, y: 36 },
    landmark: { name: "Lyme Park", x: 26, y: 16 },
    encounters: { grass: "lyme_park_grass", water: "lyme_park_water" },
    fishing: "fish_lyme_park",
    warps: [
      { x: 26, y: 13, to: "lyme_park_house", tx: 14, ty: 20, dir: "up", kind: "door" },
      { x: 43, y: 9, to: "lyme_park_stables", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 43, y: 26, to: "lyme_park_cage", tx: 8, ty: 16, dir: "up", kind: "door" },
      { x: 47, y: 21, to: "lyme_park_cage_cave", tx: 12, ty: 22, dir: "up", kind: "cave" },
      { x: 51, y: 6, to: "lyme_park_bowstones", tx: 1, ty: 14, dir: "right", kind: "edge" },
      { x: 26, y: 37, to: "route_poynton_lyme", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 27, y: 37, to: "route_poynton_lyme", tx: 16, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 16, y: 14, text: ["LYME — the house, the park, the moor above it.",
        "Please do not approach the deer. The deer have not read this."] },
      { x: 5, y: 8, text: ["THE ORANGERY", "Warm, damp, and full of things that should not survive a Cheshire winter and do."] },
      { x: 37, y: 8, text: ["STABLE YARD — cafe, courtyard, and the estate office.",
        "A notice: 'STAG COUNT WEDNESDAY. VOLUNTEERS WELCOME. BINOCULARS SUPPLIED. OPINIONS NOT.'"] },
      { x: 6, y: 18, text: ["THE LAKE — deep, cold, and reflecting a house that has been showing off since 1570."] },
      { x: 41, y: 31, text: ["THE CAGE — a hunting tower, built so that ladies could watch the chase without the mud.",
        "It has no lighting, no supply, and no meter. It has been lit every night for eleven nights."] },
      { x: 25, y: 34, text: ["LYME PARK. GRITSTONE TRAIL SOUTH TO POYNTON.",
        "Under it, freshly scratched: 'the deer all face south-west now. count them. COUNT THEM.'"] }
    ],
    items: [
      { x: 3, y: 12, item: "capsule_mesh", n: 2, flag: "item_lyme_1" },
      { x: 46, y: 16, item: "walkers_boots", n: 1, hidden: true, flag: "item_lyme_2" },
      { x: 4, y: 34, item: "elixir", n: 1, hidden: true, flag: "item_lyme_3" },
      { x: 20, y: 30, item: "tonic", n: 2, flag: "item_lyme_4" },
      { x: 48, y: 33, item: "collectible_4", n: 1, hidden: true, flag: "item_lyme_5" }
    ],
    catGaps: [
      { x: 6, y: 13, item: "cat_token_4", n: 1, flag: "catgap_lyme_1",
        say: "MEADOW is through the garden hedge before you can say her name. She returns carrying a brass tag stamped LYME 1904, and is unbearable about it." }
    ],
    restPoints: [{ x: 22, y: 31, flag: "bigboy_sat_lyme" }],
    npcs: [
      { id: "npc_lyme_hesketh", x: 30, y: 31, dir: "down", sprite: "npc_ranger", behaviour: "still", trainer: "tr_lyme_park_1", sight: 0, script: "east_lyme_hesketh" },
      { id: "npc_lyme_hale", x: 8, y: 30, dir: "right", sprite: "npc_granny", behaviour: "still", trainer: "tr_lyme_park_2", sight: 3 },
      { id: "npc_lyme_stag_1", x: 14, y: 33, dir: "left", sprite: "deer", behaviour: "wander", radius: 4, script: "east_lyme_stag" },
      { id: "npc_lyme_stag_2", x: 38, y: 34, dir: "left", sprite: "deer", behaviour: "wander", radius: 4,
        say: ["A hind lifts her head, looks south-west, and does not look away.", "Whatever she is listening to, it is not you."] },
      { id: "npc_lyme_stag_3", x: 9, y: 16, dir: "left", sprite: "deer", behaviour: "wander", radius: 3,
        say: ["It does not startle. That is the wrong thing about it. Deer startle. This one has decided not to."] },
      { id: "npc_lyme_volunteer", x: 33, y: 16, dir: "down", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Two hundred and six last Wednesday. Two hundred and six the Wednesday before.",
          "Two hundred and six is not a herd. Two hundred and six is a setting."] },
      { id: "npc_lyme_gardener", x: 12, y: 12, dir: "up", sprite: "npc_farmer", behaviour: "still",
        say: ["Everything in this garden is a foreign plant kept alive by a Cheshire man with a boiler.",
          "That is not a metaphor. I have been told it is a metaphor. It is a boiler."] },
      { id: "npc_lyme_cafe", x: 41, y: 11, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_lyme_stables",
        say: ["Tea, cake, and a bag of things for the walk. The scones are the reason people come and the house knows it."] },
      { id: "npc_lyme_kid", x: 29, y: 15, dir: "left", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["The Cage is haunted. That's what they say.", "It isn't haunted. It's LIT. There's a difference and nobody will listen to me."] },
      { id: "npc_lyme_caver", x: 46, y: 22, dir: "right", sprite: "npc_caver", behaviour: "still",
        say: ["Slab shifted in the frost and there's a hole under the Cage that nobody surveyed.",
          "Nobody surveyed it because nobody knew. Which is the good kind of hole."] },
      { id: "npc_lyme_walker", x: 26, y: 34, dir: "up", sprite: "npc_walker", behaviour: "path", path: [[26, 34], [26, 30], [26, 20]], pathMode: "pingpong",
        say: ["Trail runs Disley to Kidsgrove, thirty-five miles, and this is the best of it.",
          "Then it's Tegg's Nose and the Cloud and your knees write to your solicitor."] }
    ],
    triggers: [
      { x: 26, y: 31, w: 2, h: 1, script: "east_lyme_deer_turn", once: "lyme_deer_turn", cond: "!lyme_deer_turn" }
    ]
  });

  // ---------------------------------------------------- the great house ----
  const h = B.canvas(28, 22, "_");
  h.box("g", 0, 0, 28, 22, "#");
  h.fill("g", 1, 0, 26, 1, "^");
  h.fill("g", 1, 1, 26, 1, "#");
  for (let x = 3; x < 25; x += 5) h.fill("g", x, 1, 2, 1, "W");
  h.fill("g", 9, 3, 10, 8, "r");
  h.fill("g", 2, 3, 5, 1, "P"); h.fill("g", 21, 3, 5, 1, "P");
  h.fill("g", 2, 6, 4, 1, "k"); h.fill("g", 22, 6, 4, 1, "k");
  h.fill("g", 2, 9, 4, 1, "k"); h.fill("g", 22, 9, 4, 1, "k");
  h.fill("g", 12, 4, 4, 3, "t");
  h.fill("g", 11, 12, 6, 1, "s");
  h.fill("g", 3, 13, 5, 1, "b"); h.fill("g", 20, 13, 5, 1, "b");
  h.fill("g", 2, 16, 3, 3, "f");
  h.fill("g", 23, 16, 3, 3, "n");
  h.set("g", 13, 21, "d"); h.set("g", 14, 21, "d");
  h.fill("g", 13, 19, 2, 2, "M");
  h.set("g", 6, 20, "a"); h.set("g", 21, 20, "a");
  W.defineMap("lyme_park_house", {
    name: "Lyme House", region: "interior", outdoor: false, music: "town_bollington",
    ambience: "town", dialogue: "town_lyme_park",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_tile_check",
      "r": "floor_carpet", "P": "painting", "k": "bookcase", "t": "table", "s": "counter",
      "b": "chair", "f": "fireplace", "n": "piano", "a": "stairs", "d": "door_wood",
      "M": "mat_welcome", " ": null
    },
    layers: h.layers(),
    spawnPoint: { x: 14, y: 20 },
    warps: [
      { x: 13, y: 21, to: "lyme_park", tx: 26, ty: 14, dir: "down", kind: "door" },
      { x: 14, y: 21, to: "lyme_park", tx: 27, ty: 14, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_lyme_house_guide", x: 14, y: 12, dir: "down", sprite: "npc_historian", behaviour: "still", script: "east_lyme_guide" },
      { id: "npc_lyme_house_1", x: 4, y: 4, dir: "down", sprite: "npc_tourist", behaviour: "wander", radius: 2,
        say: ["Four hundred and fifty years of one family deciding what the front of a building should look like.",
          "They changed their minds twice. You can see both."] },
      { id: "npc_lyme_house_2", x: 22, y: 17, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["The piano's tuned every March by a man from Buxton who will not accept payment.",
          "He says the house pays him by staying up."] }
    ],
    signs: [
      { x: 3, y: 3, text: ["A portrait of a man in a good coat with a very small dog.",
        "The label says the dog outlived him by two years and is buried closer to the house."] },
      { x: 24, y: 3, text: ["THE LYME CALEPINE MISSAL — a book so old the case has its own weather.",
        "The card says 'do not photograph'. Somebody has photographed it. The flash mark is still on the vellum."] }
    ],
    items: [{ x: 26, y: 20, item: "cipher_lens", n: 1, hidden: true, flag: "item_lyme_house_1" }],
    encounters: { grass: null }
  });

  W.defineMap("lyme_park_stables", W.builtin("shop", {
    name: "Lyme Stable Yard", region: "east", dialogue: "town_lyme_park", music: "town_bollington",
    shop: "shop_lyme_stables",
    warps: [
      { x: 6, y: 9, to: "lyme_park", tx: 43, ty: 10, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "lyme_park", tx: 43, ty: 10, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_lyme_stable_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_lyme_stables",
        say: ["Boots, flasks, and a map that is wrong about one path on purpose so we can tell who copied it."] },
      { id: "npc_lyme_stable_1", x: 10, y: 3, dir: "left", sprite: "npc_ranger", behaviour: "still",
        say: ["Collar came off a stag last week. Estate never fitted it. It had a SIM in it.",
          "A SIM. In a deer. I put it in an envelope and I have not decided who to give it to."] }
    ],
    items: [{ x: 12, y: 2, item: "walkers_boots", n: 1, flag: "item_lyme_stables_1" }]
  }));

  // ---- the Cage: a hollow tower, four floors of nothing, one lit window ----
  const cg = B.canvas(18, 18, "_");
  cg.box("g", 0, 0, 18, 18, "#");
  cg.fill("g", 1, 0, 16, 1, "^");
  cg.fill("g", 1, 1, 16, 1, "#");
  cg.fill("g", 4, 1, 2, 1, "W"); cg.fill("g", 12, 1, 2, 1, "W");
  cg.fill("g", 3, 3, 12, 10, ".");
  cg.box("g", 3, 3, 12, 10, "#");
  cg.fill("g", 4, 4, 10, 8, "_");
  cg.set("g", 8, 12, "d"); cg.set("g", 9, 12, "d");
  cg.set("g", 4, 4, "a"); cg.set("g", 13, 4, "b");
  cg.fill("g", 7, 6, 4, 3, "m");
  cg.set("g", 8, 17, "d"); cg.set("g", 9, 17, "d");
  cg.fill("g", 8, 15, 2, 2, "M");
  cg.set("g", 2, 15, "P"); cg.set("g", 15, 15, "P");
  W.defineMap("lyme_park_cage", {
    name: "The Cage", region: "interior", outdoor: false, music: "town_bollington",
    ambience: "moor", dialogue: "town_lyme_park",
    legend: {
      "#": "wall_stone_grit", "^": "wall_interior_top", "W": "window_lit", "_": "floor_stone",
      ".": "floor_stone", "m": "machine", "a": "stairs", "b": "shelf", "P": "painting",
      "d": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: cg.layers(),
    spawnPoint: { x: 8, y: 16 },
    warps: [
      { x: 8, y: 17, to: "lyme_park", tx: 43, ty: 27, dir: "down", kind: "door" },
      { x: 9, y: 17, to: "lyme_park", tx: 43, ty: 27, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_lyme_cage_ranger", x: 6, y: 10, dir: "up", sprite: "npc_ranger", behaviour: "still", script: "east_lyme_cage" }
    ],
    signs: [
      { x: 9, y: 8, text: ["A grey box bolted to the tower's inner wall, humming.",
        "No manufacturer. No asset tag. One aerial, pointed south-west, and a light that goes green every ninety seconds.",
        "Under it somebody has stuck a Post-it: 'ESTATE DID NOT FIT THIS'."] },
      { x: 2, y: 15, text: ["A photograph of the Cage in 1911, lit up for a coronation.", "It is the last time anybody paid for the light."] }
    ],
    items: [{ x: 13, y: 11, item: "copper_coil", n: 1, hidden: true, flag: "item_lyme_cage_1" }],
    encounters: { grass: null }
  });

  // ---- under the Cage: a surveyed-by-nobody chamber ------------------------
  const cc = B.canvas(24, 24, "#");
  cc.fill("g", 2, 2, 20, 20, ",");
  cc.fill("g", 4, 4, 16, 16, ".");
  cc.fill("g", 10, 18, 4, 6, "_");
  cc.set("g", 12, 23, "E");
  cc.fill("g", 8, 8, 8, 6, "~");
  cc.fill("g", 8, 14, 8, 1, "s");
  cc.fill("g", 8, 7, 8, 1, "s");
  cc.set("g", 6, 6, "c"); cc.set("g", 17, 6, "c"); cc.set("g", 6, 17, "c");
  cc.set("g", 5, 11, "o"); cc.set("g", 18, 12, "o");
  cc.set("g", 19, 19, "z"); cc.set("g", 5, 19, "z");
  cc.set("g", 12, 16, "N");
  cc.fill("g", 4, 15, 3, 4, ",");
  W.defineMap("lyme_park_cage_cave", {
    name: "Under the Cage", region: "interior", outdoor: false, music: "town_bollington",
    ambience: "cave", dialogue: "town_lyme_park",
    legend: B.caveLegend({}),
    layers: cc.layers(),
    spawnPoint: { x: 12, y: 22 },
    landmark: { name: "Under the Cage", x: 12, y: 11 },
    encounters: { cave: "lyme_park_cage_cave", grass: null },
    warps: [{ x: 12, y: 23, to: "lyme_park", tx: 47, ty: 22, dir: "down", kind: "cave" }],
    signs: [
      { x: 12, y: 16, text: ["A survey peg, iron, hammered in and left.",
        "The number stamped on it belongs to a survey that was never filed, by a company that was dissolved in 1974.",
        "Somebody was down here. Somebody decided not to say."] }
    ],
    items: [
      { x: 5, y: 5, item: "elixir", n: 1, flag: "item_lyme_cave_1" },
      { x: 18, y: 18, item: "capsule_kernel", n: 2, hidden: true, flag: "item_lyme_cave_2" },
      { x: 19, y: 5, item: "collectible_5", n: 1, hidden: true, flag: "item_lyme_cave_3" }
    ],
    npcs: []
  });

  // ---- the Bowstones: Anglo-Saxon shafts and a man who lives near them -----
  const bs = B.canvas(34, 28, "0");
  bs.fill("g", 0, 0, 34, 1, "4"); bs.fill("g", 0, 27, 34, 1, "4");
  bs.fill("g", 0, 1, 1, 26, "4"); bs.fill("g", 33, 1, 1, 26, "4");
  bs.fill("g", 0, 13, 1, 3, "2");
  bs.fill("g", 1, 13, 32, 2, "2");
  bs.snake("g", "bow-track", "2", 1, 14, 31, "h", 1, 0.4);
  bs.fill("g", 3, 3, 9, 8, "1");
  bs.fill("g", 20, 3, 11, 7, "1");
  bs.fill("g", 4, 18, 10, 7, "1");
  bs.fill("g", 21, 18, 10, 7, "1");
  bs.fill("g", 14, 8, 7, 6, ";");
  bs.fill("g", 15, 9, 5, 4, "0");
  bs.set("g", 16, 10, "3"); bs.set("g", 18, 10, "3");
  bs.set("g", 17, 12, "2"); bs.set("g", 17, 13, "2");
  bs.fill("g", 24, 20, 6, 4, "}");
  bs.fill("g", 25, 21, 4, 2, ".");
  B.house(bs, { x: 25, y: 20, w: 5, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: "^" });
  bs.set("g", 27, 23, "2"); bs.set("g", 27, 24, "2"); bs.fill("g", 27, 15, 1, 9, "2");
  bs.set("g", 8, 6, "5"); bs.set("g", 26, 6, "5"); bs.set("g", 11, 22, "5");
  bs.set("g", 13, 16, "4"); bs.set("g", 22, 16, "4");
  bs.set("g", 2, 13, "S"); bs.set("g", 31, 15, "S");
  B.trees(bs, "bow-thorn", 10, 2, 16, 30, 10, "T", "y", ["1"]);
  W.defineMap("lyme_park_bowstones", {
    name: "The Bowstones", region: "east", outdoor: true, music: "town_bollington",
    weatherZone: "east", ambience: "moor", dialogue: "town_lyme_park",
    legend: B.merge(LEG, { "S": "sign_post", "R": "roof_slate", "#": "wall_stone_grit" }),
    layers: bs.layers(),
    spawnPoint: { x: 1, y: 14 },
    landmark: { name: "The Bowstones", x: 17, y: 11 },
    encounters: { grass: "lyme_park_bowstones_grass", water: null },
    warps: [
      { x: 0, y: 13, to: "lyme_park", tx: 50, ty: 6, dir: "left", kind: "edge" },
      { x: 0, y: 14, to: "lyme_park", tx: 50, ty: 6, dir: "left", kind: "edge" },
      { x: 0, y: 15, to: "lyme_park", tx: 50, ty: 7, dir: "left", kind: "edge" },
      { x: 27, y: 22, to: "lyme_park_bowstone_hut", tx: 5, ty: 8, dir: "up", kind: "door" }
    ],
    signs: [
      { x: 2, y: 13, text: ["BOWSTONES — two Anglo-Saxon cross shafts, standing where somebody put them.",
        "Nobody agrees why. The plaque lists four theories and dislikes all of them."] },
      { x: 31, y: 15, text: ["MOOR ROAD. NO VEHICLES. NO FIRES. NO EXCUSES.",
        "Wind speed today: enough."] }
    ],
    items: [
      { x: 5, y: 5, item: "capsule_basic", n: 3, flag: "item_bowstones_1" },
      { x: 29, y: 5, item: "wind_whistle", n: 1, hidden: true, flag: "item_bowstones_2" },
      { x: 11, y: 24, item: "elixir", n: 1, hidden: true, flag: "item_bowstones_3" }
    ],
    npcs: [
      { id: "npc_bowstones_old", x: 17, y: 14, dir: "up", sprite: "npc_historian", behaviour: "still", script: "east_bowstones_old" },
      { id: "npc_bowstones_runner", x: 22, y: 14, dir: "left", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_lyme_park_bowstones_1", sight: 4 },
      { id: "npc_bowstones_sheep", x: 8, y: 20, dir: "down", sprite: "sheep", behaviour: "wander", radius: 3,
        say: ["The sheep are all facing the same way. All of them.", "There is no wind to explain it. There has been no wind since Tuesday."] }
    ],
    triggers: [
      { x: 17, y: 12, w: 1, h: 1, script: "east_bowstones_rubbing", once: "bowstones_rubbing", cond: "!bowstones_rubbing" }
    ],
    restPoints: [{ x: 15, y: 12, flag: "bigboy_sat_bowstones" }]
  });

  W.defineMap("lyme_park_bowstone_hut", W.builtin("house_small", {
    name: "The Bowstone Hut", region: "east", dialogue: "town_lyme_park", music: "town_bollington",
    warps: [
      { x: 5, y: 9, to: "lyme_park_bowstones", tx: 27, ty: 23, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "lyme_park_bowstones", tx: 27, ty: 23, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_bowstone_hut_1", x: 6, y: 3, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Forty-one years up here. Two rooms, one stove, and a view that owes me nothing.",
          "People ask if I get lonely. I get visited by weather. It is not the same but it is not nothing."] }
    ],
    items: [{ x: 1, y: 3, item: "warm_blanket", n: 1, hidden: true, flag: "item_bowstone_hut_1" }]
  }));
})();
