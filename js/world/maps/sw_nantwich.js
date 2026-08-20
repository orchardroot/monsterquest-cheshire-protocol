// =============================================================
// MonsterQuest v2 — NANTWICH (region south, Ch.6, Gym 5)
// Brine, timber and cheese. Ten days of fire in 1583 and a queen who
// paid for the rebuild, which is why every gable is black and white
// and has a date carved on it. St Mary's in the middle, Welsh Row
// going out west, the Weaver along the bottom, and two hundred feet
// under all of it, water saltier than the sea.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  // Nantwich is timber-framed: '#' is a plaster panel, 'X' the black beam.
  const TOWN = B.salt({
    "#": "wall_tudor", "X": "wall_tudor_beam", "V": "wall_render_white", "v": "window_lit",
    "%": "shop_awning", "&": "bunting", "Z": "brine_pump", "M": "chimney"
  });

  // ---------------------------------------------------------------- town --
  const c = B.canvas(56, 44, ".");
  c.fill("g", 0, 0, 56, 2, "T");
  for (let x = 0; x < 56; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 42, "T");
  c.fill("g", 55, 2, 1, 42, "T");
  c.fill("g", 0, 43, 56, 1, "T");

  // ---- the streets --------------------------------------------------------
  // High Street / Hospital Street: the spine, west gate to east gate
  c.fill("g", 1, 25, 54, 3, "=");
  c.fill("g", 2, 24, 53, 1, "-");
  c.fill("g", 2, 28, 53, 1, "-");
  // Welsh Row, going out to the north-west
  c.fill("g", 2, 11, 22, 3, "=");
  c.fill("g", 2, 10, 22, 1, "-");
  c.fill("g", 2, 14, 22, 1, "-");
  // Pillory Street: the square down to the High Street
  c.fill("g", 22, 14, 2, 11, "=");
  // Beam Street: the church down to the High Street
  c.fill("g", 40, 23, 2, 2, "=");
  // Welsh Row meets the square
  c.fill("g", 16, 14, 8, 3, "=");

  // north opening — the Weaver Valley road to Winsford
  c.fill("g", 26, 0, 4, 12, "=");
  c.fill("o", 26, 0, 4, 1, " ");
  // east opening — Willaston and Wybunbury, back towards Crewe
  c.fill("g", 50, 25, 6, 3, "=");
  // south opening — the Hack Green lane
  c.fill("g", 18, 28, 3, 16, "+");
  // west opening — Acton and the battlefield
  c.fill("g", 0, 25, 3, 3, "=");

  // ---- the square and St Mary's ------------------------------------------
  c.fill("g", 8, 16, 14, 8, "_");
  for (let i = 0; i < 3; i++) { c.fill("g", 10 + i * 4, 18, 3, 1, "A"); c.fill("o", 10 + i * 4, 17, 3, 1, "a"); }
  for (let i = 0; i < 3; i++) { c.fill("g", 10 + i * 4, 22, 3, 1, "A"); c.fill("o", 10 + i * 4, 21, 3, 1, "a"); }
  c.set("g", 15, 20, "/");
  c.set("g", 8, 20, "L"); c.set("g", 21, 16, "L"); c.set("g", 9, 23, "H"); c.set("g", 12, 23, "I");
  c.set("g", 7, 19, "N");
  c.txt("o", 9, 15, "&&&&&&");

  // St Mary's, in its churchyard
  c.box("g", 30, 12, 18, 12, "w");
  c.fill("g", 31, 13, 16, 10, ",");
  B.house(c, { x: 34, y: 13, w: 11, h: 8, rh: 3, roof: "p", wall: "c", win: "C", door: "d", doorX: 5 });
  c.set("g", 39, 12, "p");
  B.speckle(c, "g", "graves", "g", 14, 31, 13, 16, 10, [","]);
  c.set("g", 38, 23, "d"); c.set("g", 39, 23, "d");
  c.fill("g", 38, 21, 2, 3, "_");
  c.set("g", 33, 22, "i");
  c.set("g", 29, 18, "N");

  // ---- north of Welsh Row: the timber terraces ---------------------------
  B.timberRow(c, 3, 5, 9, { h: 5, doors: [2, 6], chimneys: [1, 7] });
  B.timberRow(c, 14, 5, 9, { h: 5, doors: [4], chimneys: [1, 7] });
  c.set("g", 2, 9, "L"); c.set("g", 13, 9, "L");
  c.fill("g", 3, 15, 3, 8, "\"");
  c.set("g", 4, 17, "l");

  // Care centre and mart, west end of the High Street
  B.house(c, { x: 3, y: 30, w: 11, h: 5, rh: 2, roof: "R", wall: "V", win: "W", door: "S", doorX: 5, over: "^" });
  c.set("g", 2, 33, "N");
  B.house(c, { x: 3, y: 20, w: 4, h: 4, rh: 2, roof: "R", wall: "V", win: "W", door: "S", doorX: 1, over: "^" });

  // The Crown, and Churche's Mansion at the far east of Hospital Street
  B.house(c, { x: 24, y: 30, w: 12, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "@", doorX: 5, over: "^", chimney: 1, chimneyCh: "M" });
  c.set("g", 23, 33, "N");
  B.timberRow(c, 44, 30, 10, { h: 6, doors: [4], chimneys: [1, 8], beam: "X", wall: "#" });
  c.set("g", 43, 34, "N");
  c.fill("g", 43, 36, 12, 1, "-");
  c.set("g", 49, 36, "*");

  // The gym: swimming lanes and lock gates, behind a plain frontage
  B.house(c, { x: 24, y: 17, w: 4, h: 4, rh: 1, roof: "R", wall: "V", win: "W", door: "D", doorX: 1, over: "^" });
  c.set("g", 28, 20, "N");

  // The station, east end
  B.house(c, { x: 48, y: 18, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  c.set("g", 48, 22, "P");
  c.fill("g", 47, 23, 8, 1, "-");

  // ---- the brine pool and the lido gate, north-east ----------------------
  c.fill("g", 44, 3, 9, 7, ",");
  c.fill("g", 46, 4, 5, 4, "6");
  c.set("g", 45, 6, "Z"); c.set("g", 51, 6, "Z");
  c.fill("g", 43, 3, 1, 7, "F"); c.fill("g", 53, 3, 1, 7, "F");
  c.fill("g", 44, 2, 10, 1, "F"); c.fill("g", 44, 10, 4, 1, "F"); c.fill("g", 50, 10, 4, 1, "F");
  c.fill("g", 48, 10, 2, 1, "G");
  c.fill("g", 48, 11, 2, 6, "+");
  c.set("g", 47, 12, "N");

  // ---- the cheese ground, north-west -------------------------------------
  c.fill("g", 6, 2, 14, 2, "\"");
  c.set("g", 12, 4, "J"); c.set("g", 13, 4, "J");
  c.fill("g", 12, 4, 2, 1, "J");
  c.fill("g", 11, 3, 4, 1, "f");
  c.set("g", 10, 4, "f"); c.set("g", 15, 4, "f");
  c.set("g", 16, 4, "N");

  // ---- the Weaver, along the south --------------------------------------
  B.canal(c, 2, 36, 53, "h", { width: 3, tow: "t", water: "!", far: "t" });
  c.fill("g", 2, 41, 53, 2, ",");
  c.fill("g", 18, 36, 3, 5, "x");
  c.set("g", 8, 37, "Q"); c.set("g", 34, 39, "Q");
  c.fill("g", 26, 41, 8, 2, "\"");
  B.trees(c, "weaver", 16, 3, 41, 50, 2, "T", "y", [","]);
  c.fill("g", 4, 31, 1, 5, "+");
  c.fill("g", 4, 36, 1, 1, "t");
  // riverside cottages
  B.house(c, { x: 36, y: 31, w: 8, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.fill("g", 36, 35, 8, 1, "-");
  c.set("g", 44, 35, "L");

  // rough corners and pockets
  c.fill("g", 50, 12, 4, 6, "\"");
  c.set("g", 52, 15, "z");
  c.fill("g", 6, 41, 6, 2, "\"");
  c.fill("g", 30, 4, 8, 6, "\"");
  B.trees(c, "north-fringe", 10, 31, 3, 6, 7, "B", "b", ["."]);
  c.fill("g", 22, 4, 3, 6, "\"");

  W.defineMap("nantwich", {
    name: "Nantwich", region: "south", outdoor: true, music: "town_nantwich", weatherZone: "south",
    ambience: "town", dialogue: "town_nantwich", shop: "shop_nantwich",
    legend: TOWN, layers: c.layers(),
    spawnPoint: { x: 33, y: 26 },
    healPoint: { x: 8, y: 35 },
    landmark: { name: "Nantwich", x: 28, y: 26 },
    encounters: { grass: "nantwich_grass", water: "nantwich_water" },
    fishing: "fish_nantwich",
    warps: [
      { x: 8, y: 35, to: "nantwich_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 4, y: 24, to: "nantwich_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 29, y: 35, to: "nantwich_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 25, y: 21, to: "nantwich_gym", tx: 12, ty: 24, dir: "up", kind: "door" },
      { x: 51, y: 22, to: "nantwich_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 39, y: 21, to: "nantwich_church", tx: 6, ty: 12, dir: "up", kind: "door" },
      { x: 48, y: 35, to: "nantwich_churches_mansion", tx: 9, ty: 12, dir: "up", kind: "door" },
      { x: 5, y: 9, to: "nantwich_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 9, y: 9, to: "nantwich_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 18, y: 9, to: "nantwich_house_3", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 39, y: 35, to: "nantwich_house_4", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 48, y: 10, to: "nantwich_brine_lido", tx: 20, ty: 32, dir: "up", kind: "gate" },
      { x: 49, y: 10, to: "nantwich_brine_lido", tx: 21, ty: 32, dir: "up", kind: "gate" },
      { x: 12, y: 4, to: "nantwich_cheese_ground", tx: 18, ty: 26, dir: "up", kind: "gate" },
      { x: 13, y: 4, to: "nantwich_cheese_ground", tx: 19, ty: 26, dir: "up", kind: "gate" },
      // edges
      { x: 26, y: 0, to: "route_nantwich_winsford", tx: 12, ty: 51, dir: "up", kind: "edge" },
      { x: 27, y: 0, to: "route_nantwich_winsford", tx: 13, ty: 51, dir: "up", kind: "edge" },
      { x: 28, y: 0, to: "route_nantwich_winsford", tx: 14, ty: 51, dir: "up", kind: "edge" },
      { x: 29, y: 0, to: "route_nantwich_winsford", tx: 14, ty: 51, dir: "up", kind: "edge" },
      { x: 18, y: 43, to: "route_nantwich_hackgreen", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 19, y: 43, to: "route_nantwich_hackgreen", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 20, y: 43, to: "route_nantwich_hackgreen", tx: 17, ty: 1, dir: "down", kind: "edge" },
      { x: 0, y: 25, to: "nantwich_acton_field", tx: 41, ty: 12, dir: "left", kind: "edge" },
      { x: 0, y: 26, to: "nantwich_acton_field", tx: 41, ty: 13, dir: "left", kind: "edge" },
      { x: 0, y: 27, to: "nantwich_acton_field", tx: 41, ty: 14, dir: "left", kind: "edge" }
    ].concat(B.linkWarp([], 55, 26, "route_crewe_nantwich", "right", { x: 3, y: 14 })),
    signs: [
      { x: 7, y: 19, text: ["NANTWICH SQUARE", "Market Thursdays and Saturdays.", "Ten days it burned in 1583. The Queen paid for the rebuild and the town has never quite stopped mentioning it."] },
      { x: 29, y: 18, text: ["ST MARY'S — the Cathedral of South Cheshire, if you ask anyone from here.", "Fourteenth century. Octagonal tower. Misericords carved by someone with a sense of humour and no supervisor."] },
      { x: 28, y: 20, text: ["NANTWICH BATHS & GYM — Leader: NELL", "HOUSE RULE: it rains in here. It has always rained in here.", "Underneath, in a different hand: 'Bring a towel and a better plan.'"] },
      { x: 2, y: 33, text: ["CARE CENTRE", "Brine baths on request. VIGIL asks, every single time, whether you have eaten."] },
      { x: 23, y: 33, text: ["THE CROWN — rebuilt 1585, and it says so above the door in letters a foot high."] },
      { x: 43, y: 34, text: ["CHURCHE'S MANSION, 1577.", "Survived the fire because it was outside the walls, which is the only recorded advantage of living out of town."] },
      { x: 47, y: 12, text: ["NANTWICH BRINE POOL — open-air, warmed, and the same water they've pumped since the Romans.", "NO PETTING THE SALTLINGS. (Somebody has crossed out NO.)"] },
      { x: 16, y: 4, text: ["NANTWICH CHEESE SHOW — this way.", "Judging from ten. Do not touch the truckles. Do not lean on the truckles. Do not LOOK at the truckles like that."] },
      { x: 48, y: 22, text: ["NANTWICH STATION", "Crewe, and then anywhere. The Cambrian line goes west from Crewe and keeps going until it hits the sea."] }
    ],
    items: [
      { x: 52, y: 15, item: "capsule_brine", n: 3, flag: "item_nantwich_1" },
      { x: 8, y: 42, item: "tonic", n: 2, flag: "item_nantwich_2" },
      { x: 32, y: 42, item: "salt_lick", n: 1, hidden: true, flag: "item_nantwich_3" },
      { x: 23, y: 6, item: "cream", n: 2, hidden: true, flag: "item_nantwich_4" },
      { x: 34, y: 6, item: "brine_charm", n: 1, hidden: true, flag: "item_nantwich_5" }
    ],
    catGaps: [
      { x: 43, y: 6, item: "collectible_16", n: 1, flag: "catgap_nantwich_1",
        say: "MEADOW goes under the pool railings, walks the whole length of the tiled edge without getting wet, and comes back with a key on a float." }
    ],
    restPoints: [{ x: 9, y: 23, flag: "bigboy_sat_nantwich" }],
    npcs: [
      { id: "npc_nantwich_huw", x: 11, y: 19, dir: "down", sprite: "npc_shopkeep", behaviour: "still", trainer: "tr_nantwich_1", sight: 0, script: "sw_nantwich_huw" },
      { id: "npc_nantwich_alys", x: 34, y: 24, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_nantwich_2", sight: 0, script: "sw_nantwich_alys" },
      { id: "npc_nantwich_meirion", x: 8, y: 36, dir: "down", sprite: "npc_fisher", behaviour: "still", trainer: "tr_nantwich_3", sight: 3 },
      { id: "npc_nantwich_ceri", x: 49, y: 13, dir: "down", sprite: "npc_saltworker", behaviour: "look", radius: 3, trainer: "tr_nantwich_4", sight: 3 },
      { id: "npc_nantwich_owain", x: 48, y: 15, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3, trainer: "tr_nantwich_5", sight: 0,
        say: ["There's a key at the bottom of the deep end. Nobody's got it up yet.", "I've tried eleven times. I keep floating."] },
      { id: "npc_nantwich_bethan", x: 6, y: 30, dir: "right", sprite: "npc_farmer", behaviour: "still", script: "sw_nantwich_bethan" },
      { id: "npc_nantwich_wyn", x: 49, y: 12, dir: "down", sprite: "npc_saltworker", behaviour: "still", script: "sw_nantwich_wyn" },
      { id: "npc_nantwich_vicar", x: 39, y: 22, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["The tower's octagonal. Nobody knows why. My theory is that somebody in 1380 fancied a change and nobody stopped him.", "That is how most of Cheshire happened."] },
      { id: "npc_nantwich_walker", x: 14, y: 26, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[14, 26], [40, 26], [40, 27], [14, 27]], pathMode: "loop",
        say: ["Everything black and white in this town went up in 1583 and came back by 1585.", "Two years. Try getting a shed through planning in two."] },
      { id: "npc_nantwich_granny", x: 13, y: 23, dir: "up", sprite: "npc_granny", behaviour: "still",
        say: ["I swam in that pool the day it opened and I have swum in it every week since, apart from the war.", "The salt gets into everything. My hair, my knees, my opinion of Crewe."] },
      { id: "npc_nantwich_boater", x: 12, y: 36, dir: "right", sprite: "npc_boater", behaviour: "path", path: [[6, 36], [30, 36]], pathMode: "pingpong",
        say: ["Weaver's slow through town. It's got nowhere to be until Winsford and neither have I."] },
      { id: "npc_nantwich_dev", x: 46, y: 26, dir: "left", sprite: "npc_dev", behaviour: "wander", radius: 2,
        say: ["I moved out of Crewe for the quiet and now the pool pumps talk to each other at 3am.", "Not loudly. Just... in turn."] },
      { id: "npc_nantwich_stall_1", x: 15, y: 18, dir: "down", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Nantwich cheese. Crumbly, salty, and the only thing this town agrees about."] },
      { id: "npc_nantwich_stall_2", x: 19, y: 22, dir: "down", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Barley, oats, sloes and whatever the hedges gave up this week.", "If you're going brewing in Wales you'll want the barley. Everybody does."], shop: "shop_nantwich_market" },
      { id: "npc_nantwich_kid2", x: 25, y: 27, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["A man in a white robe has been standing at the lido gate for two days telling everyone the water is clean.", "The water IS clean. That's what's weird about it."] },
      { id: "npc_nantwich_nurse", x: 10, y: 29, dir: "down", sprite: "npc_nurse", behaviour: "still",
        say: ["Brine bath before you go west. It's free, it's warm, and you look like a man who has been sleeping on trains."] }
    ],
    triggers: [
      { x: 30, y: 24, w: 6, h: 1, script: "sw_nantwich_arrival", once: "nantwich_arrival", cond: "!nantwich_arrival", kind: "step" },
      { x: 48, y: 11, w: 2, h: 1, script: "sw_lido_gate", cond: "!lido_battle_done && badge_kernel", kind: "step" }
    ]
  });

  // ------------------------------------------------------- the brine lido --
  // Fifty yards of warm brine, open to the sky, in a town that has never
  // once thought this was remarkable.
  const L = B.canvas(42, 36, ",");
  B.frame(L, "T", 1);
  for (let x = 0; x < 42; x++) L.set("o", x, 0, "y");
  L.fill("g", 1, 1, 40, 34, ",");
  L.fill("g", 2, 2, 38, 32, "_");
  // the pool
  L.fill("g", 6, 6, 30, 16, "6");
  L.box("g", 5, 5, 32, 18, "F");
  L.fill("g", 5, 22, 4, 1, "F"); L.fill("g", 13, 22, 24, 1, "F");
  L.fill("g", 9, 22, 4, 1, "_");
  // lane ropes drawn as deco
  for (let i = 0; i < 30; i += 2) { L.set("d", 6 + i, 10, "|"); L.set("d", 6 + i, 14, "|"); L.set("d", 6 + i, 18, "|"); }
  // deep end, the diving steps and the poolside
  L.fill("g", 33, 7, 3, 14, "?");
  L.set("g", 4, 8, "s"); L.set("g", 4, 12, "s");
  L.fill("g", 2, 24, 38, 2, "_");
  for (let i = 0; i < 6; i++) L.set("g", 6 + i * 5, 25, "H");
  L.fill("g", 2, 27, 38, 6, ",");
  L.fill("g", 18, 30, 6, 4, "_");
  L.set("g", 3, 29, "N"); L.set("g", 38, 29, "N");
  L.fill("g", 2, 3, 2, 18, "\"");
  L.fill("g", 38, 3, 2, 18, "\"");
  L.set("g", 39, 30, "Z"); L.set("g", 2, 30, "Z");
  L.set("g", 12, 28, "L"); L.set("g", 30, 28, "L");
  L.set("g", 26, 30, "I"); L.set("g", 15, 31, "H");
  L.set("g", 20, 34, "G"); L.set("g", 21, 34, "G");
  L.txt("o", 16, 26, "&&&&&&&&");

  W.defineMap("nantwich_brine_lido", {
    name: "Nantwich Brine Pool", region: "south", outdoor: true, music: "town_nantwich", weatherZone: "south",
    ambience: "water", dialogue: "town_nantwich",
    legend: TOWN, layers: L.layers(),
    spawnPoint: { x: 20, y: 32 },
    healPoint: { x: 20, y: 30 },
    landmark: { name: "The Brine Pool", x: 20, y: 14 },
    encounters: { water: "nantwich_brine_lido_water", grass: null },
    fishing: "fish_nantwich_brine_lido",
    warps: [
      { x: 20, y: 34, to: "nantwich", tx: 48, ty: 11, dir: "down", kind: "gate" },
      { x: 21, y: 34, to: "nantwich", tx: 49, ty: 11, dir: "down", kind: "gate" }
    ],
    signs: [
      { x: 3, y: 29, text: ["NANTWICH BRINE POOL", "Fifty yards. Naturally saline. Heated by us, not by the county.", "MEDICAL NOTE: the salt will find every cut you had forgotten about. This is considered a feature."] },
      { x: 38, y: 29, text: ["LIDO RULES", "1. No running. 2. No diving in the shallow end. 3. No baptising.", "Rule 3 was added on Tuesday."] }
    ],
    items: [
      { x: 3, y: 33, item: "brine_sample", n: 3, flag: "item_nantwich_brine_lido_1" },
      { x: 38, y: 33, item: "tonic_spd", n: 2, hidden: true, flag: "item_nantwich_brine_lido_2" }
    ],
    npcs: [
      { id: "npc_nantwich_lido_wyn", x: 20, y: 28, dir: "down", sprite: "npc_saltworker", behaviour: "still", script: "sw_lido_wyn" },
      { id: "npc_nantwich_lido_kellan", x: 20, y: 24, dir: "down", sprite: "kellan", behaviour: "still", script: "sw_lido_kellan", cond: "!lido_battle_done && badge_kernel" },
      { id: "npc_nantwich_lido_kellan_after", x: 34, y: 28, dir: "left", sprite: "kellan", behaviour: "still", script: "sw_lido_kellan_after", cond: "lido_battle_done && !kellan_handed_in && !kellan_walked" },
      { id: "npc_nantwich_lido_ffion", x: 12, y: 25, dir: "down", sprite: "npc_cultist", behaviour: "still", trainer: "tr_nantwich_brine_lido_1", sight: 3, cond: "!lido_battle_done" },
      { id: "npc_nantwich_lido_osian", x: 28, y: 25, dir: "down", sprite: "npc_cultist", behaviour: "still", trainer: "tr_nantwich_brine_lido_2", sight: 3, cond: "!lido_battle_done" },
      { id: "npc_nantwich_lido_swimmer", x: 8, y: 24, dir: "down", sprite: "npc_granny", behaviour: "still",
        say: ["Eighty-one lengths. I do eighty-one because I'm eighty-one and it seemed tidy.", "The steam does something to your chest. In a good way. Mostly."] },
      { id: "npc_nantwich_lido_lifeguard", x: 32, y: 25, dir: "left", sprite: "npc_fisher", behaviour: "still", script: "sw_lido_angler" }
    ],
    triggers: [
      { x: 18, y: 27, w: 6, h: 1, script: "sw_lido_scene", once: "lido_scene_seen", cond: "!lido_battle_done && badge_kernel", kind: "step" }
    ]
  });

  // ------------------------------------------------------ Acton and 1644 --
  const A = B.canvas(44, 30, ".");
  B.frame(A, "T", 1);
  for (let x = 0; x < 44; x++) A.set("o", x, 0, "y");
  A.fill("g", 1, 11, 42, 4, "+");
  A.fill("g", 2, 2, 40, 8, "\"");
  A.fill("g", 2, 16, 40, 12, "\"");
  A.fill("g", 6, 4, 8, 4, ".");
  A.fill("g", 24, 18, 12, 6, ".");
  // Acton church on its knoll
  A.box("g", 4, 17, 12, 10, "w");
  A.fill("g", 5, 18, 10, 8, ",");
  B.house(A, { x: 7, y: 18, w: 8, h: 6, rh: 2, roof: "p", wall: "c", win: "C", door: "d", doorX: 4 });
  A.set("g", 10, 17, "p");
  B.speckle(A, "g", "acton-graves", "g", 10, 5, 19, 10, 6, [","]);
  A.set("g", 11, 26, "d");
  A.fill("g", 11, 24, 1, 3, "_");
  A.set("g", 17, 21, "N");
  // hedges, gates and a monument on the field
  A.fill("g", 20, 5, 1, 6, "h"); A.fill("g", 30, 16, 1, 8, "h");
  A.set("g", 20, 8, "J"); A.set("g", 30, 20, "J");
  A.set("g", 33, 8, "i");
  A.set("g", 32, 10, "N");
  B.trees(A, "acton", 24, 2, 2, 40, 26, "T", "y", ["\""]);
  A.fill("g", 40, 11, 3, 4, "=");
  A.set("g", 38, 26, "z"); A.set("g", 8, 8, "z");
  A.fill("g", 34, 2, 6, 5, "\"");

  W.defineMap("nantwich_acton_field", {
    name: "Acton Field", region: "south", outdoor: true, music: "route_south", weatherZone: "south",
    ambience: "moor", dialogue: "town_nantwich",
    legend: TOWN, layers: A.layers(),
    spawnPoint: { x: 41, y: 13 },
    landmark: { name: "Acton — the field of 1644", x: 33, y: 8 },
    encounters: { grass: "nantwich_acton_field_grass" },
    warps: [
      { x: 43, y: 12, to: "nantwich", tx: 2, ty: 25, dir: "right", kind: "edge" },
      { x: 43, y: 13, to: "nantwich", tx: 2, ty: 26, dir: "right", kind: "edge" },
      { x: 43, y: 14, to: "nantwich", tx: 2, ty: 27, dir: "right", kind: "edge" },
      { x: 11, y: 26, to: "nantwich_acton_church", tx: 6, ty: 12, dir: "up", kind: "door" }
    ],
    signs: [
      { x: 32, y: 10, text: ["THE BATTLE OF NANTWICH, 25th JANUARY 1644.", "The siege was lifted. The town wore holly and has worn it every January since.",
        "Somebody has scratched underneath, recently: 'they are still out here on the wet nights and they have questions about the ground'."] },
      { x: 17, y: 21, text: ["ST MARY'S, ACTON — the oldest tower in the hundred, and it has the lean to prove it."] }
    ],
    items: [
      { x: 7, y: 6, item: "revive_salts", n: 1, flag: "item_nantwich_acton_field_1" },
      { x: 38, y: 27, item: "capsule_night", n: 3, hidden: true, flag: "item_nantwich_acton_field_2" },
      { x: 4, y: 3, item: "sloe", n: 4, flag: "item_nantwich_acton_field_3" }
    ],
    npcs: [
      { id: "npc_nantwich_acton_pike", x: 24, y: 6, dir: "down", sprite: "npc_ghost_trainer", behaviour: "look", radius: 4, trainer: "tr_nantwich_acton_field_1", sight: 4, cond: "time.night" },
      { id: "npc_nantwich_acton_dragoon", x: 34, y: 20, dir: "left", sprite: "npc_ghost_trainer", behaviour: "look", radius: 4, trainer: "tr_nantwich_acton_field_2", sight: 4, cond: "time.night" },
      { id: "npc_nantwich_acton_mared", x: 26, y: 21, dir: "up", sprite: "npc_historian", behaviour: "still", trainer: "tr_nantwich_acton_field_3", sight: 0, script: "sw_acton_mared" },
      { id: "npc_nantwich_acton_farmer", x: 21, y: 12, dir: "down", sprite: "npc_farmer", behaviour: "wander", radius: 3,
        say: ["Plough turns up buttons every spring. Buttons and worse.", "I put the worse back."] }
    ],
    triggers: [
      { x: 32, y: 7, w: 3, h: 3, script: "sw_acton_monument", once: "acton_monument", cond: "!acton_monument", kind: "step" }
    ]
  });

  W.defineMap("nantwich_acton_church", W.builtin("church", {
    name: "St Mary's, Acton", region: "interior", music: "town_nantwich", dialogue: "town_nantwich",
    warps: [{ x: 6, y: 13, to: "nantwich_acton_field", tx: 11, ty: 27, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "nantwich_acton_field", tx: 11, ty: 27, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_nantwich_acton_rector", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["There's a musket ball in the door. Put your thumb in it. Everyone does and everyone goes quiet afterwards.",
          "Fifteen hundred men slept in this nave in January 1644 and the floor has never been warm since."] }
    ],
    items: [{ x: 1, y: 11, item: "panacea", n: 1, flag: "item_nantwich_acton_church_1" }],
    signs: [{ x: 6, y: 1, text: ["A memorial list, cut in slate. Both sides. Same slate."] }]
  }));

  // ----------------------------------------------------- the cheese ground --
  const CG = B.canvas(38, 28, ".");
  B.frame(CG, "h", 1);
  CG.fill("g", 1, 1, 36, 26, ".");
  CG.fill("g", 2, 24, 34, 2, "_");
  CG.fill("g", 16, 26, 6, 1, "J");
  for (let i = 0; i < 5; i++) { CG.fill("g", 5 + i * 6, 6, 4, 2, "A"); CG.fill("o", 5 + i * 6, 5, 4, 1, "a"); }
  for (let i = 0; i < 5; i++) { CG.fill("g", 5 + i * 6, 14, 4, 2, "A"); CG.fill("o", 5 + i * 6, 13, 4, 1, "a"); }
  CG.fill("g", 3, 10, 32, 2, "_");
  CG.fill("g", 3, 18, 32, 2, "_");
  CG.txt("o", 4, 3, "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
  CG.fill("g", 2, 2, 34, 1, "f");
  CG.set("g", 4, 22, "q"); CG.set("g", 30, 22, "q");
  CG.set("g", 18, 21, "N");
  CG.set("g", 8, 21, "]"); CG.set("g", 9, 21, "]"); CG.set("g", 28, 21, "[");
  CG.fill("g", 33, 3, 3, 4, "\"");

  W.defineMap("nantwich_cheese_ground", {
    name: "The Cheese Show Ground", region: "south", outdoor: true, music: "town_nantwich", weatherZone: "south",
    ambience: "town", dialogue: "town_nantwich", shop: "shop_nantwich_market",
    legend: TOWN, layers: CG.layers(),
    spawnPoint: { x: 18, y: 25 },
    landmark: { name: "Nantwich Cheese Show", x: 18, y: 12 },
    encounters: { grass: null },
    warps: [
      { x: 18, y: 27, to: "nantwich", tx: 12, ty: 5, dir: "down", kind: "gate" },
      { x: 19, y: 27, to: "nantwich", tx: 13, ty: 5, dir: "down", kind: "gate" }
    ],
    signs: [{ x: 18, y: 21, text: ["THE INTERNATIONAL CHEESE AWARDS", "Five thousand cheeses. Forty judges. One marquee.",
      "CLASS 41: 'Cheese with an unusual addition'. Every year somebody enters something with glitter in it and every year they are spoken to."] }],
    items: [
      { x: 3, y: 5, item: "cream", n: 3, flag: "item_nantwich_cheese_ground_1" },
      { x: 34, y: 5, item: "barley", n: 4, hidden: true, flag: "item_nantwich_cheese_ground_2" }
    ],
    npcs: [
      { id: "npc_nantwich_judge", x: 18, y: 11, dir: "down", sprite: "npc_shopkeep", behaviour: "still", script: "sw_cheese_judge" },
      { id: "npc_nantwich_cheese_1", x: 7, y: 9, dir: "down", sprite: "npc_farmer", behaviour: "still",
        say: ["Forty-one classes and one of them is just 'cheese with something in it'.", "Somebody put glitter in one year. We do not speak about the glitter."] },
      { id: "npc_nantwich_cheese_2", x: 25, y: 17, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_nantwich_market",
        say: ["Barley, oats, cream, honey if I've any left. If you're brewing, buy twice what you think."] },
      { id: "npc_nantwich_cheese_3", x: 31, y: 9, dir: "left", sprite: "npc_granny", behaviour: "wander", radius: 2,
        say: ["I have judged this show for thirty-one years and I have never once been wrong.", "I have been overruled. That is a different thing."] }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("nantwich_care", W.builtin("care_centre", {
    name: "Nantwich Care Centre", dialogue: "town_nantwich", music: "town_nantwich",
    warps: [{ x: 7, y: 11, to: "nantwich", tx: 8, ty: 36, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "nantwich", tx: 8, ty: 36, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_nantwich_care_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", script: "sw_nantwich_nurse" },
      { id: "npc_nantwich_care_sitter", x: 2, y: 5, dir: "right", sprite: "npc_walker", behaviour: "still",
        say: ["They put you in the brine bath here rather than a machine. It takes longer and it works better and nobody can explain it."] }
    ],
    items: [{ x: 14, y: 8, item: "salve", n: 3, flag: "item_nantwich_care_1" }]
  }));

  W.defineMap("nantwich_mart", W.builtin("shop", {
    name: "Nantwich Mart", dialogue: "town_nantwich", music: "town_nantwich", shop: "shop_nantwich",
    warps: [{ x: 6, y: 9, to: "nantwich", tx: 4, ty: 24, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "nantwich", tx: 4, ty: 24, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_nantwich_mart_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_nantwich",
        say: ["Brine Capsules. Triple rate on anything wet or anything caught in rain, and it is always raining in that gym."] },
      { id: "npc_nantwich_mart_browser", x: 10, y: 4, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["Buy the Brine Capsules. I say this to everyone who comes in and one day somebody will listen before the gym instead of after."] }
    ]
  }));

  W.defineMap("nantwich_inn", W.builtin("pub", {
    name: "The Crown", dialogue: "town_nantwich", music: "town_nantwich",
    warps: [{ x: 6, y: 11, to: "nantwich", tx: 29, ty: 36, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "nantwich", tx: 29, ty: 36, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_nantwich_inn_landlord", x: 2, y: 2, dir: "down", sprite: "npc_boater", behaviour: "still", script: "sw_nantwich_landlord" },
      { id: "npc_nantwich_inn_drinker", x: 9, y: 5, dir: "left", sprite: "npc_boater", behaviour: "still",
        say: ["Rebuilt 1585 and the floor still isn't level. That's not subsidence, that's craftsmanship."] },
      { id: "npc_nantwich_inn_traveller", x: 4, y: 7, dir: "right", sprite: "npc_walker", behaviour: "still",
        say: ["Sleep here and you'll wake in the next band of the day. It's the only honest way to skip an evening."] }
    ],
    items: [{ x: 12, y: 9, item: "toffee", n: 3, flag: "item_nantwich_inn_1" }]
  }));

  W.defineMap("nantwich_station", W.builtin("station", {
    name: "Nantwich Station", dialogue: "town_nantwich", music: "town_crewe", station: { name: "Nantwich" },
    warps: [{ x: 8, y: 11, to: "nantwich", tx: 51, ty: 23, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "nantwich", tx: 51, ty: 23, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_nantwich_station_guard", x: 6, y: 3, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "sw_nantwich_station" }
    ],
    signs: [{ x: 8, y: 1, text: ["NANTWICH — Crewe (change for everywhere), Shrewsbury, Wales.",
      "A hand-written card taped under the board: 'Cambrian services depart Crewe. Yes, really. No, we don't know why either.'"] }]
  }));

  W.defineMap("nantwich_church", W.builtin("church", {
    name: "St Mary's, Nantwich", dialogue: "town_nantwich", music: "town_nantwich",
    warps: [{ x: 6, y: 13, to: "nantwich", tx: 39, ty: 22, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "nantwich", tx: 39, ty: 22, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_nantwich_church_verger", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["The misericords. Under the seats. A man with toothache, a fox in a bishop's hat, and a woman hitting her husband with a saucepan.",
          "Carved in 1390 by somebody nobody supervised. It is the best thing in Cheshire and it is under a chair."] },
      { id: "npc_nantwich_church_kid", x: 3, y: 7, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 2,
        say: ["I'm looking for the fox in the hat. Dad says it's under the fourth seat. Dad says a lot of things."] }
    ],
    items: [{ x: 12, y: 11, item: "elixir", n: 1, hidden: true, flag: "item_nantwich_church_1" }]
  }));

  W.defineMap("nantwich_churches_mansion", W.builtin("house_large", {
    name: "Churche's Mansion", dialogue: "town_nantwich", music: "town_nantwich",
    warps: [{ x: 7, y: 13, to: "nantwich", tx: 48, ty: 36, dir: "down", kind: "door" },
      { x: 8, y: 13, to: "nantwich", tx: 48, ty: 36, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_nantwich_mansion_curator", x: 10, y: 4, dir: "down", sprite: "npc_historian", behaviour: "still", script: "sw_mansion_curator" },
      { id: "npc_nantwich_mansion_guest", x: 3, y: 9, dir: "right", sprite: "npc_granny", behaviour: "still",
        say: ["Fifteen seventy-seven. Outside the walls, which is why it's still here and the rest of the town is a rebuild.",
          "There's a lesson in that about being slightly out of the way when the fire comes."] }
    ],
    items: [{ x: 14, y: 2, item: "cipher_lens", n: 1, hidden: true, flag: "item_nantwich_churches_mansion_1" }]
  }));

  for (let i = 1; i <= 4; i++) {
    const doors = [[5, 9], [9, 9], [18, 9], [39, 35]];
    W.defineMap("nantwich_house_" + i, W.builtin(i === 4 ? "house_large" : "house_small", {
      name: "Nantwich Cottage", dialogue: "town_nantwich", music: "town_nantwich",
      warps: i === 4
        ? [{ x: 7, y: 13, to: "nantwich", tx: doors[3][0], ty: doors[3][1] + 1, dir: "down", kind: "door" },
          { x: 8, y: 13, to: "nantwich", tx: doors[3][0], ty: doors[3][1] + 1, dir: "down", kind: "door" }]
        : [{ x: 5, y: 9, to: "nantwich", tx: doors[i - 1][0], ty: doors[i - 1][1] + 1, dir: "down", kind: "door" },
          { x: 6, y: 9, to: "nantwich", tx: doors[i - 1][0], ty: doors[i - 1][1] + 1, dir: "down", kind: "door" }],
      npcs: [{ id: "npc_nantwich_house" + i, x: 3, y: 4, dir: "down", sprite: i % 2 ? "npc_granny" : "npc_walker", behaviour: "still",
        say: [[
          "The date over my door is 1584. The house is younger than the fire and older than the parish register."
        ], [
          "Salt in the walls. You can taste it if you lick the plaster, which I have done, which I do not recommend."
        ], [
          "Welsh Row's called that because the drovers came this way from Wales with the cattle.",
          "They still do, in a manner of speaking. My grandson drives a lorry."
        ], [
          "River's four foot down on last year. Everyone says it's the weather. It's never the weather."
        ]][i - 1] }]
    }));
  }

  // =====================================================================
  // GYM 5 — Nantwich Baths. Lanes, lock gates, and permanent rain.
  // =====================================================================
  const GY = {
    "#": "wall_interior", "^": "wall_interior_top", "_": "floor_tile", "b": "platform",
    "~": "water_canal", "e": "water_edge", "K": "canal_lock", "k": "canal_lock_beam",
    "d": "door_gym", "D": "door_wood", "W": "window", "m": "mat_welcome", "L": "lamp",
    "H": "bench", "N": "sign", "S": "gym_statue", "A": "gym_badge_stand", "Q": "fish_spot",
    "r": "floor_carpet", "|": "bridge_rail", "5": "brine_pump", "[": "crate", " ": null
  };
  const g5 = B.canvas(26, 28, "_");
  g5.box("g", 0, 0, 26, 28, "#");
  g5.fill("g", 1, 0, 24, 1, "^");
  // six lanes of warm brine in three ranks
  const blocks = [[2, 6], [14, 6], [2, 12], [14, 12], [2, 18], [14, 18]];
  for (let i = 0; i < blocks.length; i++) {
    const bx = blocks[i][0], by = blocks[i][1];
    g5.fill("g", bx, by, 10, 5, "~");
    for (let x = 0; x < 10; x += 2) { g5.set("d", bx + x, by + 2, "|"); }
  }
  // lock gates: the spine is barred at the top rank, the west walk lower down
  g5.fill("g", 12, 8, 2, 1, "K");
  g5.fill("g", 1, 14, 1, 2, "K");
  g5.set("g", 12, 7, "k"); g5.set("g", 13, 9, "k");
  // furniture, the deep end and the way in
  g5.fill("g", 1, 2, 24, 3, "_");
  g5.fill("g", 10, 2, 6, 3, "r");
  g5.set("g", 12, 1, "d"); g5.set("g", 13, 1, "d");
  g5.set("g", 8, 3, "S"); g5.set("g", 17, 3, "S");
  g5.set("g", 3, 3, "5"); g5.set("g", 22, 3, "5");
  g5.fill("g", 1, 24, 24, 3, "_");
  g5.set("g", 12, 27, "d"); g5.set("g", 13, 27, "d");
  g5.set("g", 12, 26, "m"); g5.set("g", 13, 26, "m");
  g5.set("g", 4, 25, "H"); g5.set("g", 8, 25, "H"); g5.set("g", 18, 25, "H"); g5.set("g", 21, 25, "H");
  g5.set("g", 10, 25, "N"); g5.set("g", 15, 25, "N");
  g5.set("g", 2, 25, "["); g5.set("g", 23, 25, "[");
  g5.set("g", 6, 5, "Q"); g5.set("g", 19, 23, "Q");
  g5.set("g", 1, 11, "L"); g5.set("g", 24, 11, "L"); g5.set("g", 1, 22, "L"); g5.set("g", 24, 5, "L");

  W.defineMap("nantwich_gym", {
    name: "Nantwich Baths", region: "interior", outdoor: false, music: "battle_gym",
    ambience: "water", dialogue: "town_nantwich", weatherZone: null,
    legend: GY, layers: g5.layers(),
    spawnPoint: { x: 12, y: 25 },
    landmark: { name: "Nantwich Gym", x: 13, y: 14 },
    encounters: { water: null, grass: null },
    warps: [
      { x: 12, y: 27, to: "nantwich", tx: 25, ty: 22, dir: "down", kind: "door" },
      { x: 13, y: 27, to: "nantwich", tx: 25, ty: 22, dir: "down", kind: "door" },
      { x: 12, y: 1, to: "nantwich_gym_deep_end", tx: 11, ty: 18, dir: "up", kind: "door", cond: "gym5_gates" },
      { x: 13, y: 1, to: "nantwich_gym_deep_end", tx: 12, ty: 18, dir: "up", kind: "door", cond: "gym5_gates" }
    ],
    signs: [
      { x: 10, y: 25, text: ["NANTWICH BATHS — GYM 5. LEADER: NELL.",
        "HOUSE RULE: IT RAINS. Permanently. In here. On purpose.",
        "Beat the three lane keepers and the lock gates at the deep end will draw back. Nell does not open gates for people. Gates open for finished work."] },
      { x: 15, y: 25, text: ["A laminated card, curling at the corners:",
        "'BRINE BODY — some things in this water heal while it rains. That is not cheating. That is the water. Bring your own weather or bring a better idea.'"] }
    ],
    items: [{ x: 23, y: 26, item: "tonic_spd", n: 2, hidden: true, flag: "item_nantwich_gym_1" }],
    npcs: [
      { id: "npc_nantwich_gym_nia", x: 6, y: 23, dir: "up", sprite: "npc_saltworker", behaviour: "look", radius: 4, trainer: "tr_nantwich_gym_1", sight: 4, script: "sw_gym5_lane_1" },
      { id: "npc_nantwich_gym_tomos", x: 19, y: 17, dir: "left", sprite: "npc_fisher", behaviour: "look", radius: 4, trainer: "tr_nantwich_gym_2", sight: 4, script: "sw_gym5_lane_2" },
      { id: "npc_nantwich_gym_rhys", x: 20, y: 5, dir: "down", sprite: "npc_saltworker", behaviour: "look", radius: 4, trainer: "tr_nantwich_gym_3", sight: 4, script: "sw_gym5_lane_3" }
    ],
    triggers: [
      { x: 11, y: 2, w: 4, h: 1, script: "sw_gym5_gates", cond: "!gym5_gates", kind: "step" }
    ]
  });

  // Nell's floor: one lane, one lock gate, and a woman who does not get out.
  const gd = B.canvas(24, 20, "_");
  gd.box("g", 0, 0, 24, 20, "#");
  gd.fill("g", 1, 0, 22, 1, "^");
  gd.fill("g", 4, 4, 16, 8, "~");
  for (let x = 0; x < 16; x += 2) { gd.set("d", 4 + x, 6, "|"); gd.set("d", 4 + x, 9, "|"); }
  gd.fill("g", 11, 3, 2, 1, "k");
  gd.set("g", 11, 2, "A");
  gd.set("g", 6, 2, "S"); gd.set("g", 17, 2, "S");
  gd.fill("g", 1, 13, 22, 6, "_");
  gd.set("g", 11, 19, "d"); gd.set("g", 12, 19, "d");
  gd.set("g", 11, 18, "m"); gd.set("g", 12, 18, "m");
  gd.set("g", 3, 16, "H"); gd.set("g", 20, 16, "H");
  gd.set("g", 2, 14, "N");
  gd.set("g", 1, 8, "L"); gd.set("g", 22, 8, "L");
  gd.set("g", 3, 12, "5"); gd.set("g", 20, 12, "5");

  W.defineMap("nantwich_gym_deep_end", {
    name: "The Deep End", region: "interior", outdoor: false, music: "battle_gym",
    ambience: "water", dialogue: "town_nantwich", weatherZone: null,
    legend: GY, layers: gd.layers(),
    spawnPoint: { x: 11, y: 18 },
    landmark: { name: "The Deep End", x: 11, y: 8 },
    encounters: { water: null, grass: null },
    warps: [
      { x: 11, y: 19, to: "nantwich_gym", tx: 12, ty: 2, dir: "down", kind: "door" },
      { x: 12, y: 19, to: "nantwich_gym", tx: 13, ty: 2, dir: "down", kind: "door" }
    ],
    signs: [{ x: 2, y: 14, text: ["A whiteboard, wiped and rewritten so often the ghost of every match is still on it.",
      "Today: 'SHOW ME WHAT YOU SAW. NOT WHAT YOU BROUGHT.'"] }],
    npcs: [
      { id: "npc_nantwich_nell", x: 11, y: 13, dir: "down", sprite: "nell", behaviour: "still", script: "sw_nell" }
    ],
    triggers: []
  });

})();
