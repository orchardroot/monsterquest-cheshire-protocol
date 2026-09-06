// =============================================================
// MonsterQuest v2 — NORTHWICH (region salt, Ch.7, Gym 6)
// The town that sank. They pumped the brine out from underneath it,
// the streets went down, and rather than move, Northwich learned to
// build timber-framed houses on jacks so they could be lifted and
// levelled again. Foreman Jack measures everything in subsidence.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const TOWN = B.salt({
    "#": "wall_tudor", "X": "wall_tudor_beam", "V": "wall_render_white", "M": "chimney_mill",
    "%": "shop_awning", "&": "bunting", "q": "picnic_table", "v": "window_lit"
  });

  const c = B.canvas(54, 42, ".");
  c.fill("g", 0, 0, 54, 1, "T"); c.fill("g", 0, 41, 54, 1, "T");
  c.fill("g", 0, 1, 1, 40, "T"); c.fill("g", 53, 1, 1, 40, "T");
  for (let x = 0; x < 54; x++) c.set("o", x, 0, "y");

  // ---- the Weaver, and the two swing bridges -----------------------------
  c.fill("g", 1, 20, 52, 4, "!");
  c.fill("g", 1, 19, 52, 1, "t"); c.fill("g", 1, 24, 52, 1, "t");
  c.fill("g", 14, 19, 3, 6, "x");
  c.fill("g", 38, 19, 3, 6, "x");
  c.set("g", 13, 21, "e"); c.set("g", 17, 22, "e");
  c.set("g", 8, 24, "Q"); c.set("g", 30, 19, "Q"); c.set("g", 46, 24, "Q");
  c.set("g", 22, 21, "8"); c.set("g", 26, 22, "8");

  // ---- streets: Witton Street north of the river, London Road south ------
  c.fill("g", 1, 12, 52, 3, "=");
  c.fill("g", 1, 11, 52, 1, "-"); c.fill("g", 1, 15, 52, 1, "-");
  c.fill("g", 1, 30, 52, 3, "=");
  c.fill("g", 1, 29, 52, 1, "-"); c.fill("g", 1, 33, 52, 1, "-");
  c.fill("g", 14, 15, 3, 4, "=");
  c.fill("g", 14, 25, 3, 5, "=");
  c.fill("g", 38, 15, 3, 4, "=");
  c.fill("g", 38, 25, 3, 5, "=");
  c.fill("g", 30, 0, 3, 12, "=");
  c.fill("o", 30, 0, 3, 1, " ");
  c.fill("g", 24, 33, 3, 9, "=");
  c.fill("g", 0, 26, 4, 3, "=");
  c.fill("g", 4, 26, 1, 4, "=");

  // ---- north of the river: the black-and-white town on its jacks ---------
  B.timberRow(c, 3, 6, 10, { h: 5, doors: [4], chimneys: [1, 8] });
  B.timberRow(c, 16, 6, 11, { h: 5, doors: [3, 8], chimneys: [1, 9] });
  B.timberRow(c, 34, 6, 10, { h: 5, doors: [4], chimneys: [1, 8] });
  c.fill("g", 3, 2, 46, 3, ",");
  c.set("g", 2, 9, "L"); c.set("g", 28, 9, "L"); c.set("g", 46, 9, "L");
  c.set("g", 15, 11, "n"); c.set("g", 33, 15, "O"); c.set("g", 21, 15, "j");
  c.set("g", 8, 15, "H"); c.set("g", 9, 15, "I");
  // the market place, north-east
  c.fill("g", 46, 2, 7, 9, "_");
  for (let i = 0; i < 3; i++) { c.fill("g", 47, 3 + i * 3, 3, 1, "A"); c.fill("o", 47, 2 + i * 3, 3, 1, "a"); }
  c.set("g", 51, 6, "L");
  c.set("g", 45, 6, "N");
  c.txt("o", 46, 1, "&&&&&&&");
  // the gym: a plain shed with a salt-crust floor
  B.house(c, { x: 5, y: 16, w: 4, h: 3, rh: 1, roof: "R", wall: "V", win: "W", door: "D", doorX: 1, over: "^" });
  c.set("g", 4, 18, "N");
  // Weaver Hall, on the south bank hill
  B.house(c, { x: 44, y: 15, w: 8, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  c.set("g", 43, 18, "N");

  // ---- south of the river: care, mart, inn, station, Lion Salt Works -----
  B.house(c, { x: 4, y: 25, w: 4, h: 4, rh: 1, roof: "R", wall: "V", win: "W", door: "S", doorX: 1, over: "^" });
  B.house(c, { x: 18, y: 25, w: 9, h: 4, rh: 2, roof: "R", wall: "V", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 17, 28, "N");
  B.house(c, { x: 42, y: 25, w: 9, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "@", doorX: 4, over: "^", chimney: 1 });
  c.set("g", 41, 28, "N");
  B.house(c, { x: 6, y: 34, w: 7, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  c.set("g", 5, 37, "P");
  B.railLine(c, 2, 40, 14, { track: "U", plat: "E", edge: "e" });
  // the Lion Salt Works, south-east
  c.fill("g", 34, 34, 18, 7, ",");
  c.fill("g", 33, 34, 1, 7, "|"); c.fill("g", 34, 33, 18, 1, "|");
  c.fill("g", 40, 33, 3, 1, "J");
  B.saltPans(c, 36, 37, 3, {});
  B.house(c, { x: 45, y: 35, w: 6, h: 4, rh: 1, roof: "R", wall: "V", win: "v", door: "D", doorX: 2, over: "^" });
  c.set("g", 46, 35, "M");
  c.set("g", 44, 38, "N");
  c.set("g", 35, 35, "4");
  // houses and green bits
  B.house(c, { x: 16, y: 35, w: 8, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.fill("g", 15, 39, 10, 1, "-");
  c.fill("g", 27, 35, 5, 5, "\"");
  c.fill("g", 2, 2, 1, 3, "\"");
  c.fill("g", 49, 20, 4, 3, "\"");
  B.trees(c, "nw-fringe", 14, 26, 2, 20, 3, "T", "y", [","]);
  c.set("g", 30, 26, "q"); c.set("g", 12, 21, "8");
  c.set("g", 50, 12, "u"); c.set("g", 49, 11, "J");

  W.defineMap("northwich", {
    name: "Northwich", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "town", dialogue: "town_northwich", shop: "shop_northwich",
    legend: TOWN, layers: c.layers(),
    spawnPoint: { x: 31, y: 13 },
    healPoint: { x: 5, y: 30 },
    landmark: { name: "Northwich", x: 26, y: 22 },
    encounters: { grass: "northwich_grass", water: "northwich_water" },
    fishing: "fish_northwich",
    warps: [
      { x: 5, y: 28, to: "northwich_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 22, y: 28, to: "northwich_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 46, y: 28, to: "northwich_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 9, y: 37, to: "northwich_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 6, y: 18, to: "northwich_gym", tx: 13, ty: 25, dir: "up", kind: "door" },
      { x: 47, y: 18, to: "northwich_weaver_hall", tx: 12, ty: 20, dir: "up", kind: "door" },
      { x: 47, y: 38, to: "northwich_lion_salt_works", tx: 12, ty: 20, dir: "up", kind: "door" },
      { x: 49, y: 11, to: "northwich_market", tx: 16, ty: 23, dir: "up", kind: "gate" },
      { x: 7, y: 10, to: "northwich_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 19, y: 10, to: "northwich_house_2", tx: 7, ty: 12, dir: "up", kind: "door" },
      { x: 19, y: 38, to: "northwich_house_3", tx: 5, ty: 8, dir: "up", kind: "door" },
      // edges
      { x: 30, y: 0, to: "route_northwich_anderton", tx: 14, ty: 32, dir: "up", kind: "edge" },
      { x: 31, y: 0, to: "route_northwich_anderton", tx: 15, ty: 32, dir: "up", kind: "edge" },
      { x: 32, y: 0, to: "route_northwich_anderton", tx: 16, ty: 32, dir: "up", kind: "edge" },
      { x: 24, y: 41, to: "route_middlewich_northwich", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 25, y: 41, to: "route_middlewich_northwich", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 26, y: 41, to: "route_middlewich_northwich", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 0, y: 26, to: "route_winsford_northwich", tx: 14, ty: 1, dir: "left", kind: "edge" },
      { x: 0, y: 27, to: "route_winsford_northwich", tx: 15, ty: 1, dir: "left", kind: "edge" },
      { x: 0, y: 28, to: "route_winsford_northwich", tx: 16, ty: 1, dir: "left", kind: "edge" }
    ],
    signs: [
      { x: 4, y: 18, text: ["NORTHWICH GYM — LEADER: JACK.", "HOUSE RULE: THE FLOOR IS SALT CRUST. IT IS AN OPINION, NOT A PROMISE.",
        "Chalked underneath, and rubbed out at nine every morning: the safe path."] },
      { x: 43, y: 18, text: ["WEAVER HALL MUSEUM (formerly the workhouse).", "Salt, subsidence, and a hundred and forty years of people the county would rather not think about.",
        "Closing at four. The back stair is not part of the tour."] },
      { x: 44, y: 38, text: ["LION SALT WORKS — open-pan salt, 1894 to 1986.", "Skim, rake, dry, ship. Same four verbs for ninety-two years.",
        "It is the best building in Cheshire and people from Northwich will fight you about this."] },
      { x: 17, y: 28, text: ["NORTHWICH MART — salt licks, heavy capsules, and a spirit level, because you will want one."] },
      { x: 41, y: 28, text: ["THE SALT BARGE. The floor slopes four inches to the north and they have made a feature of it: the bar drains."] },
      { x: 45, y: 6, text: ["NORTHWICH MARKET — Tuesdays, Fridays, Saturdays.", "LOST PROPERTY: one vicar's voice. Enquire within. (Somebody thought they were being funny.)"] },
      { x: 15, y: 11, text: ["THE BLACK AND WHITE TOWN.", "These houses are on jacks. When the ground goes, we lift them and level them and carry on.",
        "That is not a metaphor. There are men in this town whose entire trade is lifting a house four inches."] }
    ],
    items: [
      { x: 3, y: 3, item: "salt_crystal", n: 3, flag: "item_northwich_1" },
      { x: 29, y: 37, item: "capsule_kernel", n: 3, flag: "item_northwich_2" },
      { x: 51, y: 21, item: "collectible_20", n: 1, hidden: true, flag: "item_northwich_3" },
      { x: 35, y: 3, item: "tonic_def", n: 2, hidden: true, flag: "item_northwich_4" }
    ],
    catGaps: [
      { x: 33, y: 37, item: "salt_lick", n: 3, flag: "catgap_northwich_1",
        say: "MEADOW goes under the salt-works fence, walks the rim of a pan that has been cold for forty years, and comes back tasting of 1894." }
    ],
    restPoints: [{ x: 30, y: 27, flag: "meadow_sat_northwich" }],
    npcs: [
      { id: "npc_northwich_sal", x: 44, y: 32, dir: "down", sprite: "npc_saltworker", behaviour: "still", trainer: "tr_northwich_1", sight: 0, script: "sw_northwich_sal" },
      { id: "npc_northwich_dafydd", x: 15, y: 25, dir: "down", sprite: "npc_signaller", behaviour: "still", trainer: "tr_northwich_2", sight: 0, script: "sw_bridge_keeper" },
      { id: "npc_northwich_mari", x: 45, y: 20, dir: "down", sprite: "npc_historian", behaviour: "still", script: "sw_mari" },
      { id: "npc_northwich_jack_street", x: 10, y: 16, dir: "down", sprite: "jack", behaviour: "still", script: "sw_jack_street", cond: "!badge_daemon" },
      { id: "npc_northwich_walker", x: 20, y: 13, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[8, 13], [44, 13]], pathMode: "pingpong",
        say: ["Street's a different shape than it was in June. Nobody moved anything. The ground did."] },
      { id: "npc_northwich_granny", x: 27, y: 15, dir: "up", sprite: "npc_granny", behaviour: "still",
        say: ["They lifted my house in 1961 with me in it. I was making a cake. The cake was fine.",
          "It came out four inches higher than it went in and so did I."] },
      { id: "npc_northwich_kid", x: 33, y: 27, dir: "left", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["When the mine turns over you can feel it in your teeth before you feel it in the floor."] },
      { id: "npc_northwich_dev", x: 40, y: 31, dir: "up", sprite: "npc_dev", behaviour: "wander", radius: 2,
        say: ["I work for a company that rents cold storage. I have never been asked what we store.",
          "I have also never asked. That's the arrangement."] },
      { id: "npc_northwich_nurse", x: 7, y: 31, dir: "down", sprite: "npc_nurse", behaviour: "still",
        say: ["Salt in every cut. Salt in the tea if you're not careful. Salt is not a mineral here, it's a landlord."] },
      { id: "npc_northwich_boater", x: 24, y: 24, dir: "right", sprite: "npc_boater", behaviour: "path", path: [[18, 24], [36, 24]], pathMode: "pingpong",
        say: ["Swing bridge opens for the boats and shuts for the buses and everyone accepts this."] }
    ],
    triggers: [
      { x: 30, y: 10, w: 3, h: 1, script: "sw_northwich_arrival", once: "northwich_arrival", cond: "!northwich_arrival && chapter >= 7", kind: "step" }
    ]
  });

  // ================= GYM 6 — the salt-crust floor ==========================
  // The floor is salt crust. Some of it holds. Jack chalks the safe path
  // every morning and rubs it out at nine, so you find it the way he did:
  // by walking it and being wrong.
  const GY = {
    "#": "wall_interior", "^": "wall_interior_top", "_": "floor_stone", "0": "salt_flat",
    "1": "salt_crust", "3": "salt_pile", "W": "window", "d": "door_gym", "m": "mat_welcome",
    "S": "gym_statue", "A": "gym_badge_stand", "N": "sign", "L": "lamp", "H": "bench",
    "r": "floor_carpet", "[": "crate", "2": "salt_pan", " ": null
  };
  const g6 = B.canvas(28, 28, "1");
  g6.box("g", 0, 0, 28, 28, "#");
  g6.fill("g", 1, 0, 26, 1, "^");
  g6.fill("g", 1, 22, 26, 5, "_");
  g6.set("g", 13, 27, "d"); g6.set("g", 14, 27, "d");
  g6.set("g", 13, 26, "m"); g6.set("g", 14, 26, "m");
  g6.set("g", 4, 24, "H"); g6.set("g", 23, 24, "H");
  g6.set("g", 10, 23, "N");
  g6.set("g", 2, 22, "["); g6.set("g", 25, 22, "3");
  // the safe path: a switchback of firm salt flat through the crust
  const path = [[13, 21], [14, 21], [13, 20], [13, 19], [12, 19], [11, 19], [10, 19], [9, 19], [9, 18], [9, 17],
    [10, 17], [11, 17], [12, 17], [13, 17], [14, 17], [15, 17], [16, 17], [17, 17], [18, 17], [18, 16], [18, 15],
    [17, 15], [16, 15], [15, 15], [14, 15], [13, 15], [12, 15], [11, 15], [10, 15], [9, 15], [8, 15], [7, 15],
    [6, 15], [6, 14], [6, 13], [6, 12], [7, 12], [8, 12], [9, 12], [10, 12], [11, 12], [12, 12], [13, 12],
    [14, 12], [15, 12], [16, 12], [17, 12], [18, 12], [19, 12], [20, 12], [21, 12], [21, 11], [21, 10],
    [20, 10], [19, 10], [18, 10], [17, 10], [16, 10], [15, 10], [14, 10], [13, 10], [12, 10], [11, 10],
    [10, 10], [9, 10], [8, 10], [8, 9], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
    [13, 7], [13, 6], [14, 6], [14, 5], [13, 5], [13, 4], [14, 4], [13, 3], [14, 3]];
  g6.dots("g", path, "0");
  g6.fill("g", 11, 2, 6, 2, "r");
  g6.set("g", 13, 1, "A");
  g6.set("g", 5, 2, "S"); g6.set("g", 22, 2, "S");
  g6.set("g", 2, 12, "L"); g6.set("g", 25, 12, "L");
  g6.fill("g", 2, 5, 3, 3, "2"); g6.fill("g", 23, 18, 3, 3, "2");

  W.defineMap("northwich_gym", {
    name: "Northwich Gym", region: "interior", outdoor: false, music: "battle_gym",
    ambience: "industrial", dialogue: "town_northwich", weatherZone: null,
    legend: GY, layers: g6.layers(),
    spawnPoint: { x: 13, y: 25 },
    landmark: { name: "Northwich Gym", x: 13, y: 12 },
    encounters: { grass: null, cave: null },
    warps: [
      { x: 13, y: 27, to: "northwich", tx: 6, ty: 19, dir: "down", kind: "door" },
      { x: 14, y: 27, to: "northwich", tx: 6, ty: 19, dir: "down", kind: "door" }
    ],
    signs: [{ x: 10, y: 23, text: ["NORTHWICH GYM. LEADER: FOREMAN JACK.",
      "THE FLOOR IS SALT CRUST. The pale ground holds. The rest is a promise nobody made.",
      "Jack chalks the safe path every morning and rubs it out at nine, because he found it the hard way and so should you.",
      "HOUSE RULE: SALT TERRAIN, PERMANENTLY. He adds his sixth at forty per cent. He has told everybody. Nobody plans for it."] }],
    npcs: [
      { id: "npc_northwich_gym_non", x: 9, y: 19, dir: "right", sprite: "npc_miner", behaviour: "look", radius: 4, trainer: "tr_northwich_gym_1", sight: 4 },
      { id: "npc_northwich_gym_iestyn", x: 18, y: 12, dir: "down", sprite: "npc_saltworker", behaviour: "look", radius: 4, trainer: "tr_northwich_gym_2", sight: 4 },
      { id: "npc_northwich_gym_alaw", x: 10, y: 8, dir: "up", sprite: "npc_miner", behaviour: "look", radius: 4, trainer: "tr_northwich_gym_3", sight: 4 },
      { id: "npc_northwich_jack", x: 13, y: 4, dir: "down", sprite: "jack", behaviour: "still", script: "sw_jack" }
    ]
  });

  // ------------------------------------------------- Weaver Hall Museum ---
  const WH = {
    "#": "wall_interior", "^": "wall_interior_top", "_": "floor_wood", "g": "floor_tile",
    "W": "window", "D": "door_wood", "d": "door_stairs_down", "m": "mat_welcome",
    "k": "bookcase", "s": "shelf", "i": "painting", "t": "table", "c": "chair", "p": "plant_pot",
    "N": "sign", "l": "clock_wall", "L": "lamp", "K": "mine_cart", "3": "salt_pile", "2": "salt_pan",
    "C": "counter", "H": "bench", "@": "door_locked", " ": null
  };
  const wh = B.canvas(26, 22, "_");
  wh.box("g", 0, 0, 26, 22, "#");
  wh.fill("g", 1, 0, 24, 1, "^");
  wh.fill("g", 1, 1, 24, 1, "W");
  wh.fill("g", 2, 3, 22, 14, "g");
  wh.fill("g", 3, 4, 6, 2, "2"); wh.fill("g", 17, 4, 6, 2, "3");
  wh.set("g", 12, 5, "K");
  wh.fill("g", 3, 9, 5, 1, "k"); wh.fill("g", 18, 9, 5, 1, "k");
  wh.fill("g", 3, 13, 5, 1, "s"); wh.fill("g", 18, 13, 5, 1, "s");
  wh.set("g", 6, 7, "i"); wh.set("g", 19, 7, "i"); wh.set("g", 12, 3, "N");
  wh.set("g", 12, 11, "t"); wh.set("g", 12, 12, "c");
  wh.fill("g", 1, 18, 24, 3, "_");
  wh.fill("g", 4, 18, 4, 1, "C");
  wh.set("g", 12, 21, "D"); wh.set("g", 13, 21, "D");
  wh.set("g", 12, 20, "m"); wh.set("g", 13, 20, "m");
  wh.set("g", 20, 19, "H"); wh.set("g", 2, 20, "p");
  wh.set("g", 24, 10, "d");
  wh.set("g", 23, 17, "N");
  wh.set("g", 1, 10, "L"); wh.set("g", 12, 1, "l");

  W.defineMap("northwich_weaver_hall", {
    name: "Weaver Hall Museum", region: "interior", outdoor: false, music: "town_northwich",
    ambience: "town", dialogue: "town_northwich", weatherZone: null,
    legend: WH, layers: wh.layers(),
    spawnPoint: { x: 12, y: 20 },
    landmark: { name: "Weaver Hall", x: 12, y: 10 },
    encounters: { grass: null, cave: null },
    warps: [
      { x: 12, y: 21, to: "northwich", tx: 47, ty: 19, dir: "down", kind: "door" },
      { x: 13, y: 21, to: "northwich", tx: 47, ty: 19, dir: "down", kind: "door" },
      { x: 24, y: 10, to: "salt_mine_back_stair", tx: 10, ty: 24, dir: "down", kind: "stairs", cond: "mine_descended || quest.case_25_weaver_hall_ghost >= 1" }
    ],
    signs: [
      { x: 12, y: 3, text: ["THE SALT GALLERY.", "An open pan, a rake, a barrow, and a photograph of eleven men who each lost about a stone a summer to the heat."] },
      { x: 23, y: 17, text: ["STAFF ONLY — BACK STAIR.", "Under it, in pencil, in a curator's hand: 'and it is NOT a fire exit, it is a mine, and something comes up it'."] }
    ],
    items: [{ x: 2, y: 5, item: "collectible_21", n: 1, hidden: true, flag: "item_northwich_weaver_hall_1" }],
    npcs: [
      { id: "npc_northwich_hall_mari", x: 6, y: 19, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_northwich_3", sight: 0, script: "sw_mari_museum" },
      { id: "npc_northwich_hall_visitor", x: 18, y: 11, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Workhouse until 1930. Museum since. The rooms are the same rooms.",
          "They've put the salt in the room where the women slept, and nobody has ever said anything about it."] }
    ],
    triggers: [
      { x: 22, y: 10, w: 2, h: 1, script: "sw_weaver_hall_stair", cond: "!mine_descended", kind: "step" }
    ]
  });

  // --------------------------------------------------- Lion Salt Works ---
  const LS = {
    "#": "wall_interior", "^": "wall_interior_top", "_": "floor_wood", "g": "floor_stone",
    "W": "window", "D": "door_wood", "m": "mat_welcome", "2": "salt_pan", "3": "salt_pile",
    "4": "salt_works_pipe", "5": "brine_pump", "M": "machine", "N": "sign", "L": "lamp",
    "[": "crate", "]": "barrel", "}": "sack", "H": "bench", "s": "shelf", " ": null
  };
  const ls = B.canvas(26, 22, "g");
  ls.box("g", 0, 0, 26, 22, "#");
  ls.fill("g", 1, 0, 24, 1, "^");
  ls.fill("g", 1, 1, 24, 1, "W");
  ls.fill("g", 3, 4, 8, 4, "2"); ls.fill("g", 15, 4, 8, 4, "2");
  ls.fill("g", 3, 3, 8, 1, "4"); ls.fill("g", 15, 3, 8, 1, "4");
  ls.fill("g", 3, 12, 6, 3, "3"); ls.fill("g", 17, 12, 6, 3, "]");
  ls.set("g", 12, 6, "5"); ls.set("g", 12, 13, "M");
  ls.fill("g", 1, 17, 24, 4, "_");
  ls.set("g", 12, 21, "D"); ls.set("g", 13, 21, "D");
  ls.set("g", 12, 20, "m"); ls.set("g", 13, 20, "m");
  ls.set("g", 4, 18, "H"); ls.set("g", 21, 18, "s");
  ls.set("g", 10, 18, "N");
  ls.set("g", 1, 10, "L"); ls.set("g", 24, 10, "L");
  ls.set("g", 2, 16, "["); ls.set("g", 23, 16, "}");

  W.defineMap("northwich_lion_salt_works", {
    name: "Lion Salt Works", region: "interior", outdoor: false, music: "town_northwich",
    ambience: "industrial", dialogue: "town_northwich", weatherZone: null,
    legend: LS, layers: ls.layers(),
    spawnPoint: { x: 12, y: 20 },
    landmark: { name: "Lion Salt Works", x: 12, y: 10 },
    encounters: { grass: null },
    warps: [
      { x: 12, y: 21, to: "northwich", tx: 47, ty: 39, dir: "down", kind: "door" },
      { x: 13, y: 21, to: "northwich", tx: 47, ty: 39, dir: "down", kind: "door" }
    ],
    signs: [{ x: 10, y: 18, text: ["OPEN-PAN SALT: SKIM, RAKE, DRY, SHIP.",
      "The pan is heated from below and the salt grows on the surface in crystals the size of a fingernail.",
      "There is no machine in this building that could not be fixed with a hammer. That is not nostalgia; it is the actual maintenance schedule."] }],
    items: [
      { x: 2, y: 3, item: "salt_crystal", n: 4, flag: "item_northwich_lion_salt_works_1" },
      { x: 24, y: 15, item: "salt_lick", n: 2, hidden: true, flag: "item_northwich_lion_salt_works_2" }
    ],
    npcs: [
      { id: "npc_northwich_lsw_sal", x: 12, y: 16, dir: "down", sprite: "npc_saltworker", behaviour: "still", script: "sw_sal_works" },
      { id: "npc_northwich_lsw_guide", x: 18, y: 18, dir: "left", sprite: "npc_historian", behaviour: "still",
        say: ["Ninety-two years, then 1986, then nothing, then a grant.", "It smells exactly the way it always smelled. That was the hardest part of the restoration and nobody costed it."] }
    ]
  });

  // ---------------------------------------------------- the market ------
  const MK = B.canvas(34, 26, "_");
  B.frame(MK, "h", 1);
  MK.fill("g", 1, 1, 32, 24, "_");
  for (let i = 0; i < 4; i++) { MK.fill("g", 4 + i * 7, 5, 4, 2, "A"); MK.fill("o", 4 + i * 7, 4, 4, 1, "a"); }
  for (let i = 0; i < 4; i++) { MK.fill("g", 4 + i * 7, 12, 4, 2, "A"); MK.fill("o", 4 + i * 7, 11, 4, 1, "a"); }
  MK.fill("g", 2, 18, 30, 1, "-");
  MK.set("g", 16, 24, "J"); MK.set("g", 17, 24, "J");
  MK.set("g", 16, 17, "N");
  MK.set("g", 3, 21, "H"); MK.set("g", 29, 21, "I");
  MK.set("g", 8, 21, "q"); MK.set("g", 24, 21, "q");
  MK.txt("o", 4, 2, "&&&&&&&&&&&&&&&&&&&&&&&&&&");

  W.defineMap("northwich_market", {
    name: "Northwich Market", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "town", dialogue: "town_northwich", shop: "shop_northwich",
    legend: TOWN, layers: MK.layers(),
    spawnPoint: { x: 16, y: 23 },
    landmark: { name: "Northwich Market", x: 16, y: 10 },
    encounters: { grass: null },
    warps: [
      { x: 16, y: 25, to: "northwich", tx: 49, ty: 12, dir: "down", kind: "gate" },
      { x: 17, y: 25, to: "northwich", tx: 49, ty: 12, dir: "down", kind: "gate" }
    ],
    signs: [{ x: 16, y: 17, text: ["NORTHWICH MARKET — Tuesday, Friday, Saturday.",
      "STALL 14 IS VACANT. The last tenant sold phone cases and left in March owing rent and an explanation."] }],
    items: [{ x: 31, y: 3, item: "oats", n: 3, hidden: true, flag: "item_northwich_market_1" }],
    npcs: [
      { id: "npc_northwich_market_grunt", x: 16, y: 8, dir: "down", sprite: "npc_amos", behaviour: "still", trainer: "tr_northwich_4", sight: 0, script: "sw_market_grunt" },
      { id: "npc_northwich_market_marge", x: 6, y: 8, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_northwich",
        say: ["Salt licks, salt crystals, salt in a novelty grinder shaped like a lion. Guess which sells."] },
      { id: "npc_northwich_market_2", x: 26, y: 15, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["Bloke on stall fourteen rang my sister sounding exactly like the vicar of Great Budworth.",
          "My sister has known that vicar for thirty years and she nearly sent him money."] }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("northwich_care", W.builtin("care_centre", {
    name: "Northwich Care Centre", dialogue: "town_northwich", music: "town_northwich",
    warps: [{ x: 7, y: 11, to: "northwich", tx: 5, ty: 29, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "northwich", tx: 5, ty: 29, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_northwich_care_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still",
      say: ["The floor in here slopes. All the trolleys go to the north wall on their own.", "We've stopped fighting it. We park them there."] }]
  }));
  W.defineMap("northwich_mart", W.builtin("shop", {
    name: "Northwich Mart", dialogue: "town_northwich", music: "town_northwich", shop: "shop_northwich",
    warps: [{ x: 6, y: 9, to: "northwich", tx: 22, ty: 29, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "northwich", tx: 22, ty: 29, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_northwich_mart_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_northwich",
      say: ["Salt Lick's the one you want for Jack. Restores PP on the first move that runs dry, and everything of his takes a long time to fall over."] }]
  }));
  W.defineMap("northwich_inn", W.builtin("pub", {
    name: "The Salt Barge", dialogue: "town_northwich", music: "town_northwich",
    warps: [{ x: 6, y: 11, to: "northwich", tx: 46, ty: 29, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "northwich", tx: 46, ty: 29, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_northwich_inn_landlord", x: 2, y: 2, dir: "down", sprite: "npc_boater", behaviour: "still",
      say: ["Bar drains to the north because the floor does. We put a grate in and called it a design choice."] }]
  }));
  W.defineMap("northwich_station", W.builtin("station", {
    name: "Northwich Station", dialogue: "town_northwich", music: "town_crewe", station: { name: "Northwich" },
    warps: [{ x: 8, y: 11, to: "northwich", tx: 9, ty: 38, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "northwich", tx: 9, ty: 38, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_northwich_station_guard", x: 6, y: 3, dir: "down", sprite: "npc_signaller", behaviour: "still",
      say: ["Mid-Cheshire line. Chester one way, Manchester the other, and Northwich in the middle going gently downwards."] }]
  }));
  const hdoors = [[7, 10], [19, 10], [19, 38]];
  for (let i = 1; i <= 3; i++) {
    W.defineMap("northwich_house_" + i, W.builtin(i === 2 ? "house_large" : "house_small", {
      name: "Northwich House", dialogue: "town_northwich", music: "town_northwich",
      warps: i === 2
        ? [{ x: 7, y: 13, to: "northwich", tx: hdoors[1][0], ty: hdoors[1][1] + 1, dir: "down", kind: "door" },
          { x: 8, y: 13, to: "northwich", tx: hdoors[1][0], ty: hdoors[1][1] + 1, dir: "down", kind: "door" }]
        : [{ x: 5, y: 9, to: "northwich", tx: hdoors[i - 1][0], ty: hdoors[i - 1][1] + 1, dir: "down", kind: "door" },
          { x: 6, y: 9, to: "northwich", tx: hdoors[i - 1][0], ty: hdoors[i - 1][1] + 1, dir: "down", kind: "door" }],
      npcs: [{ id: "npc_northwich_house" + i, x: 3, y: 4, dir: "down", sprite: i === 1 ? "npc_granny" : "npc_walker", behaviour: "still",
        say: [[
          "There's a jack under this house. There's a jack under most of this street.",
          "When the ground goes, a man comes with a spirit level and an opinion and we all go up four inches."
        ], [
          "The tilt's back. It comes back every March and every September and the insurers have a word for it that isn't 'the mine'."
        ], [
          "I felt it turn over on Tuesday. Not the ground. The thing under the ground.",
          "The cat felt it first. The cat always feels it first."
        ]][i - 1] }]
    }));
  }
})();
